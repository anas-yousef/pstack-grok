import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { readPin, syncCatalog } from "./sync-pstack";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMMIT = "08c8c5a0000000000000000000000000000000aa";
const PIN = ".cursor/pstack-source.json";
const MODELS = ".cursor/rules/pstack-models.mdc";
const EXTRA = {
	LICENSE: ".cursor/pstack-LICENSE",
	NOTICE: ".cursor/pstack-NOTICE",
	".cursor/pstack/LICENSE": ".cursor/pstack/LICENSE",
	".cursor/cursor-team-kit/LICENSE": ".cursor/cursor-team-kit/LICENSE",
	".cursor/third-party/superpowers/LICENSE": ".cursor/third-party/superpowers/LICENSE",
	".cursor/third-party/mattpocock-skills/LICENSE": ".cursor/third-party/mattpocock-skills/LICENSE",
};
const VERIFY_RULE = {
	kind: "skill",
	root: ".cursor/skills",
	prefix: "verify-",
	except: "verify-this",
};

function tmp() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "sync-pstack-"));
}

function seed(dir, files) {
	for (const [rel, body] of Object.entries(files)) {
		const full = path.join(dir, rel);
		fs.mkdirSync(path.dirname(full), { recursive: true });
		fs.writeFileSync(full, body);
	}
	return dir;
}

function fixtureCatalog(extra = {}) {
	const dir = seed(tmp(), {
		LICENSE: "mit\n",
		NOTICE: "notice\n",
		".cursor/pstack/LICENSE": "pstack license\n",
		".cursor/cursor-team-kit/LICENSE": "kit license\n",
		".cursor/third-party/superpowers/LICENSE": "superpowers license\n",
		".cursor/third-party/mattpocock-skills/LICENSE": "matt license\n",
		".cursor/skills/poteto-mode/SKILL.md": "poteto\n",
		".cursor/skills/verify-this/SKILL.md": "catalog verify-this\n",
		".cursor/agents/poteto-agent.md": "agent\n",
		[MODELS]: "# profile: grok\n",
		".cursor/rules/no-inline-imports.mdc": "no inline\n",
		"profiles/grok-opus.mdc": "# profile: grok-opus\n",
		...extra,
	});
	fs.chmodSync(path.join(dir, ".cursor/skills/poteto-mode/SKILL.md"), 0o755);
	return dir;
}

function writePin(dest, pin) {
	seed(dest, { [PIN]: `${JSON.stringify({ repo: "anas-yousef/pstack-grok", commit: COMMIT, ...pin, files: [] }, null, 2)}\n` });
}

function snapshot(dir) {
	const out = {};
	const walk = (sub) => {
		for (const name of fs.readdirSync(path.join(dir, sub)).sort()) {
			const rel = sub ? `${sub}/${name}` : name;
			const stat = fs.statSync(path.join(dir, rel));
			if (stat.isDirectory()) {
				out[`${rel}/`] = "dir";
				walk(rel);
			} else {
				out[rel] = `${stat.mode & 0o777} ${fs.readFileSync(path.join(dir, rel), "utf8")}`;
			}
		}
	};
	walk("");
	return out;
}

function read(dir, rel) {
	return fs.readFileSync(path.join(dir, rel), "utf8");
}

function sha(bytes) {
	return createHash("sha256").update(bytes).digest("hex");
}

function pinFiles(dest) {
	return Object.fromEntries(JSON.parse(read(dest, PIN)).files.map((f) => [f.file, f.sha256]));
}

test("with no profile, the copy is this catalog byte for byte and the pin keeps its old shape", () => {
	const dest = tmp();
	syncCatalog({ source: root, dest, commit: COMMIT });
	const expected = new Map();
	for (const tree of [".cursor/skills", ".cursor/agents", ".cursor/rules"]) {
		for (const rel of fs.readdirSync(path.join(root, tree), { recursive: true })) {
			const full = path.join(root, tree, rel);
			if (fs.statSync(full).isFile()) expected.set(`${tree}/${rel.split(path.sep).join("/")}`, full);
		}
	}
	for (const [from, rel] of Object.entries(EXTRA)) expected.set(rel, path.join(root, from));
	const entries = [...expected.keys()].sort().map((rel) => {
		const bytes = fs.readFileSync(expected.get(rel));
		assert.deepEqual(fs.readFileSync(path.join(dest, rel)), bytes, rel);
		return { file: rel, sha256: sha(bytes) };
	});
	const legacy = { repo: "anas-yousef/pstack-grok", commit: COMMIT, files: entries };
	assert.equal(read(dest, PIN), `${JSON.stringify(legacy, null, 2)}\n`);
	const written = Object.keys(snapshot(dest)).filter((rel) => !rel.endsWith("/"));
	assert.deepEqual(written.sort(), [...expected.keys(), PIN].sort());
});

test("a second run with the same source and pin writes the same bytes", () => {
	const source = fixtureCatalog();
	const dest = tmp();
	writePin(dest, { profile: "grok-opus", protect: [VERIFY_RULE] });
	seed(dest, { ".cursor/skills/verify-app/SKILL.md": "app\n" });
	syncCatalog({ source, dest, commit: COMMIT });
	const first = snapshot(dest);
	syncCatalog({ source, dest, commit: COMMIT });
	assert.deepEqual(snapshot(dest), first);
	assert.equal(first[".cursor/skills/poteto-mode/SKILL.md"], "493 poteto\n");
	assert.equal(first[".cursor/agents/poteto-agent.md"], "420 agent\n");
});

test("protect keeps app paths, and verify-this still refreshes", () => {
	const source = fixtureCatalog({ ".cursor/skills/verify-app/SKILL.md": "catalog verify-app\n" });
	const dest = tmp();
	writePin(dest, {
		protect: [
			VERIFY_RULE,
			{ kind: "exact", path: ".cursor/rules/app.mdc" },
			{ kind: "prefix", path: ".cursor/agents/app/" },
		],
	});
	seed(dest, {
		".cursor/skills/verify-app/SKILL.md": "app verify\n",
		".cursor/skills/verify-this/SKILL.md": "stale verify-this\n",
		".cursor/skills/stale/SKILL.md": "stale\n",
		".cursor/rules/app.mdc": "app rule\n",
		".cursor/rules/retired.mdc": "retired\n",
		".cursor/agents/app/one.md": "app agent\n",
	});
	fs.mkdirSync(path.join(dest, ".cursor/skills/verify-empty"));
	syncCatalog({ source, dest, commit: COMMIT });
	assert.equal(read(dest, ".cursor/skills/verify-app/SKILL.md"), "app verify\n");
	assert.equal(read(dest, ".cursor/skills/verify-this/SKILL.md"), "catalog verify-this\n");
	assert.equal(read(dest, ".cursor/rules/app.mdc"), "app rule\n");
	assert.equal(read(dest, ".cursor/agents/app/one.md"), "app agent\n");
	assert.ok(fs.existsSync(path.join(dest, ".cursor/skills/verify-empty")));
	assert.ok(!fs.existsSync(path.join(dest, ".cursor/skills/stale")));
	assert.ok(!fs.existsSync(path.join(dest, ".cursor/rules/retired.mdc")));
	const files = pinFiles(dest);
	assert.ok(!(".cursor/skills/verify-app/SKILL.md" in files));
	assert.ok(".cursor/skills/verify-this/SKILL.md" in files);
	assert.deepEqual(JSON.parse(read(dest, PIN)).protect[0], VERIFY_RULE);
});

test("grok writes the same copy as no profile", () => {
	const source = fixtureCatalog();
	const plain = tmp();
	const grok = tmp();
	writePin(grok, { profile: "grok" });
	syncCatalog({ source, dest: plain, commit: COMMIT });
	syncCatalog({ source, dest: grok, commit: COMMIT });
	const a = snapshot(plain);
	const b = snapshot(grok);
	delete a[PIN];
	delete b[PIN];
	assert.deepEqual(b, a);
	assert.equal(JSON.parse(read(grok, PIN)).profile, "grok");
});

test("a pinned profile becomes pstack-models.mdc and the manifest hashes it", () => {
	const source = fixtureCatalog();
	const dest = tmp();
	writePin(dest, { profile: "grok-opus" });
	syncCatalog({ source, dest, commit: COMMIT });
	assert.equal(read(dest, MODELS), "# profile: grok-opus\n");
	assert.equal(pinFiles(dest)[MODELS], sha("# profile: grok-opus\n"));
	assert.ok(!fs.existsSync(path.join(dest, "profiles")));
});

test("an unknown profile fails, lists profiles/, and writes nothing", () => {
	const source = fixtureCatalog();
	const dest = tmp();
	writePin(dest, { profile: "opus-only" });
	const before = snapshot(dest);
	assert.throws(
		() => syncCatalog({ source, dest, commit: COMMIT }),
		/unknown profile opus-only; profiles\/ offers: grok, grok-opus/,
	);
	assert.throws(
		() => syncCatalog({ source, dest, commit: COMMIT, profile: "../LICENSE" }),
		/unknown profile \.\.\/LICENSE/,
	);
	assert.deepEqual(snapshot(dest), before);
});

test("--profile switches the copy and leaves the pinned profile alone", () => {
	const source = fixtureCatalog();
	fs.mkdirSync(path.join(source, "scripts"));
	fs.copyFileSync(path.join(root, "scripts/sync-pstack"), path.join(source, "scripts/sync-pstack"));
	const dest = tmp();
	writePin(dest, { profile: "grok" });
	const run = (...args) =>
		spawnSync(process.execPath, [path.join(source, "scripts/sync-pstack"), "--dest", dest, "--commit", COMMIT, ...args], {
			encoding: "utf8",
		});
	const ok = run("--profile", "grok-opus");
	assert.equal(ok.status, 0, ok.stderr);
	assert.match(ok.stdout, /profile grok-opus/);
	assert.equal(read(dest, MODELS), "# profile: grok-opus\n");
	assert.equal(JSON.parse(read(dest, PIN)).profile, "grok");
	const back = run();
	assert.equal(back.status, 0, back.stderr);
	assert.equal(read(dest, MODELS), "# profile: grok\n");
	const bad = run("--profile", "nope");
	assert.equal(bad.status, 1);
	assert.match(bad.stderr, /profiles\/ offers: grok, grok-opus/);
});

test("readPin refuses pins it would misread", () => {
	const pin = (body) => JSON.stringify({ repo: "anas-yousef/pstack-grok", commit: COMMIT, files: [], ...body });
	assert.throws(() => readPin(pin({ profiles: "grok" })), /unknown key profiles/);
	assert.throws(() => readPin(pin({ protect: [{ kind: "file", path: "a" }] })), /bad protect rule/);
	assert.throws(() => readPin(pin({ protect: [{ kind: "prefix", path: ".cursor/x" }] })), /bad protect rule/);
	assert.throws(
		() => readPin(pin({ protect: [{ kind: "prefix", path: ".cursor/rules/" }] })),
		/must not cover \.cursor\/rules\/pstack-models\.mdc/,
	);
	assert.throws(() => readPin("[]"), /not a JSON object/);
});
