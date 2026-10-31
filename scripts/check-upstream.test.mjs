import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { classifyClaims, run } from "./check-upstream";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogJson = fs.readFileSync(path.join(root, "sources.json"), "utf8");
const catalog = JSON.parse(catalogJson);
const PLUGINS = "https://github.com/cursor/plugins";
const TIP = "9580c23696ac8d7abed0c166f2f9918800afb819";
const SKILL = "pstack/skills/poteto-help/SKILL.md";

function pluginCalls(calls) {
	return calls.filter((call) => call.repoUrl === PLUGINS);
}

function distinctRepoPins(sources) {
	return new Set(sources.map((source) => `${source.repo} ${source.commit}`)).size;
}

function record(load) {
	const calls = [];
	const loadRepo = (repoUrl, pin) => {
		calls.push({ repoUrl, pin });
		return load(repoUrl, pin);
	};
	return { calls, loadRepo };
}

test("classifyClaims([]) is skip", () => {
	assert.equal(classifyClaims([]), "skip");
});

test("three safe pairs are take", () => {
	assert.equal(
		classifyClaims([
			{ change: "add", local: "absent" },
			{ change: "modify", local: "matches-pin" },
			{ change: "delete", local: "matches-pin" },
		]),
		"take",
	);
});

test("a safe modify plus a differing modify is review", () => {
	assert.equal(
		classifyClaims([
			{ change: "modify", local: "matches-pin" },
			{ change: "modify", local: "differs" },
		]),
		"review",
	);
});

test("an illegal add and matches-pin pair throws", () => {
	assert.throws(() => classifyClaims([{ change: "add", local: "matches-pin" }]));
});

test("a moved poteto-help file is review and plugins is loaded once", () => {
	const { calls, loadRepo } = record(() => ({
		tip: TIP,
		changes: [
			{
				change: "modify",
				path: SKILL,
				pinBlob: Buffer.from("pin"),
			},
		],
	}));
	const readWorktree = (_root, vendoredPath) => {
		if (vendoredPath === ".cursor/skills/poteto-help/SKILL.md") {
			return { kind: "file", bytes: Buffer.from("edited") };
		}
		return { kind: "absent" };
	};
	const result = run({ catalogJson, root, loadRepo, readWorktree });
	const stdout = catalog.sources
		.map((source) => {
			const status = source.name === "pstack" ? "review" : "skip";
			return `${source.name} ${source.commit} ${TIP} ${status}`;
		})
		.join("\n") + "\n";
	assert.equal(result.exitCode, 1);
	assert.equal(result.stderr, "");
	assert.equal(result.stdout, stdout);
	assert.equal(
		result.stdout.split("\n").filter((line) => line.length > 0).length,
		catalog.sources.length,
	);
	assert.equal(calls.length, distinctRepoPins(catalog.sources));
	assert.equal(pluginCalls(calls).length, 1);
	assert.equal(pluginCalls(calls)[0].pin, catalog.sources[0].commit);
});

test("tips that equal pins exit 0 and every source skips", () => {
	const { calls, loadRepo } = record((_repoUrl, pin) => ({ tip: pin, changes: [] }));
	const result = run({ catalogJson, root, loadRepo, readWorktree: () => ({ kind: "absent" }) });
	const stdout = catalog.sources
		.map((source) => `${source.name} ${source.commit} ${source.commit} skip`)
		.join("\n") + "\n";
	assert.equal(result.exitCode, 0);
	assert.equal(result.stderr, "");
	assert.equal(result.stdout, stdout);
	assert.equal(calls.length, distinctRepoPins(catalog.sources));
	assert.equal(pluginCalls(calls).length, 1);
});

test("a loadRepo throw exits 2 with empty stdout", () => {
	const result = run({
		catalogJson,
		root,
		loadRepo() {
			throw new Error("remote unavailable");
		},
	});
	assert.equal(result.exitCode, 2);
	assert.equal(result.stdout, "");
	assert.equal(result.stderr, "check-upstream: remote unavailable\n");
	assert.doesNotMatch(result.stderr, /\b(skip|take|review)\b/);
});

test("the longer claim wins when the catalog lists the shorter prefix first", () => {
	const pin = "7698375f92a729f8bb89d113c633dce9ff9dc6db";
	const catalogText = `{
		"sources": [
			{
				"name": "pstack",
				"repo": "https://github.com/cursor/plugins",
				"commit": "${pin}",
				"paths": {
					"pstack/": ".cursor/pstack/",
					"pstack/skills/": ".cursor/skills/"
				}
			}
		]
	}`;
	const bytes = Buffer.from("pin");
	const result = run({
		catalogJson: catalogText,
		root,
		loadRepo: () => ({
			tip: TIP,
			changes: [{ change: "modify", path: SKILL, pinBlob: bytes }],
		}),
		readWorktree(_root, vendoredPath) {
			if (vendoredPath === ".cursor/skills/poteto-help/SKILL.md") {
				return { kind: "file", bytes };
			}
			if (vendoredPath === ".cursor/pstack/skills/poteto-help/SKILL.md") {
				return { kind: "absent" };
			}
			throw new Error(`unexpected path ${vendoredPath}`);
		},
	});
	assert.equal(result.exitCode, 1);
	assert.equal(result.stderr, "");
	assert.equal(result.stdout, `pstack ${pin} ${TIP} take\n`);
});

test("bad catalogs exit 2 with empty stdout", () => {
	const commit = "a".repeat(40);
	const base = {
		name: "pstack",
		repo: PLUGINS,
		commit,
		paths: { "pstack/": ".cursor/pstack/" },
	};
	const cases = [
		{ ...base, commit: "7698375F92a729f8bb89d113c633dce9ff9dc6db" },
		[base, { ...base }],
		{ ...base, paths: { "foo/../bar": "vendor/bar" } },
		{ ...base, paths: { "pstack/": ".cursor/pstack" } },
	];
	for (const sources of cases) {
		const calls = [];
		const result = run({
			catalogJson: JSON.stringify({ sources: Array.isArray(sources) ? sources : [sources] }),
			root,
			loadRepo(repoUrl, pin) {
				calls.push({ repoUrl, pin });
				return { tip: pin, changes: [] };
			},
		});
		assert.equal(result.exitCode, 2);
		assert.equal(result.stdout, "");
		assert.equal(calls.length, 0);
		assert.match(result.stderr, /^check-upstream: sources\.json: .+\n$/);
	}

	const duplicateUpstream = `{
		"sources": [{
			"name": "pstack",
			"repo": "${PLUGINS}",
			"commit": "${commit}",
			"paths": { "pstack/": ".cursor/pstack/", "pstack/": ".cursor/skills/" }
		}]
	}`;
	const duplicate = run({
		catalogJson: duplicateUpstream,
		root,
		loadRepo() {
			throw new Error("should not load");
		},
	});
	assert.equal(duplicate.exitCode, 2);
	assert.equal(duplicate.stdout, "");
	assert.match(duplicate.stderr, /^check-upstream: sources\.json: .+\n$/);
});

test("an extra argument exits 2 before any fetch", { timeout: 2000 }, () => {
	const result = spawnSync("scripts/check-upstream", ["extra"], {
		cwd: root,
		encoding: "utf8",
		timeout: 1000,
	});
	assert.equal(result.error, undefined);
	assert.equal(result.status, 2);
	assert.equal(result.stdout, "");
	assert.equal(result.stderr, "check-upstream: usage: scripts/check-upstream\n");
});

test("a regular file that matches the pin is take and a symlink is review", () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-upstream-"));
	try {
		const pin = Buffer.from("pin-bytes");
		const rel = "vendor/FILE";
		const full = path.join(dir, rel);
		fs.mkdirSync(path.dirname(full), { recursive: true });
		fs.writeFileSync(full, pin);
		const catalogText = JSON.stringify({
			sources: [
				{
					name: "demo",
					repo: "https://github.com/example/demo",
					commit: "a".repeat(40),
					paths: { UP: rel },
				},
			],
		});
		const loadRepo = () => ({
			tip: "b".repeat(40),
			changes: [{ change: "modify", path: "UP", pinBlob: Buffer.from(pin) }],
		});
		const fileResult = run({ catalogJson: catalogText, root: dir, loadRepo });
		assert.equal(fileResult.exitCode, 1);
		assert.equal(fileResult.stderr, "");
		assert.match(fileResult.stdout, / take\n$/);

		fs.rmSync(full);
		const target = path.join(dir, "target-bytes");
		fs.writeFileSync(target, pin);
		fs.symlinkSync(target, full);
		const linkResult = run({ catalogJson: catalogText, root: dir, loadRepo });
		assert.equal(linkResult.exitCode, 1);
		assert.equal(linkResult.stderr, "");
		assert.match(linkResult.stdout, / review\n$/);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});
