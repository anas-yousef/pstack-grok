import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const initScript = fs.readFileSync(path.join(workspace, "scripts", "init"));
const catalog = makeCatalog();

after(() => {
	fs.rmSync(catalog.dir, { recursive: true, force: true });
});

test("a fresh git repo adopts the catalog", { timeout: 180000 }, () => {
	const consumer = gitInit("fresh");
	try {
		const first = adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha]);
		assert.equal(first.status, 0, first.stderr);
		assert.match(first.stdout, new RegExp(`synced ${catalog.sha} grok\n`));
		assert.equal(git(["rev-parse", "HEAD"], consumer).status, 128);
		assert.deepEqual(readPin(consumer), {
			repo: catalog.dir,
			commit: catalog.sha,
			profile: "grok",
		});
		assert.equal(
			text(path.join(consumer, ".cursor", "rules", "pstack-models.mdc")),
			text(path.join(catalog.dir, ".cursor", "rules", "pstack-models.mdc")),
		);
		assert.ok(fs.existsSync(path.join(consumer, ".cursor", "skills", "poteto-mode", "SKILL.md")));
		assert.equal(fs.existsSync(path.join(consumer, "CLAUDE.md")), false);
		assert.equal(fs.existsSync(path.join(consumer, ".cursor", "pstack-claims.json")), false);
		assert.deepEqual(fs.readdirSync(path.join(consumer, "scripts")).sort(), [
			"check-pstack",
			"sync-pstack",
		]);
		assert.equal(hookNames(consumer).length, 0);
		const agents = fs.readFileSync(path.join(consumer, "AGENTS.md"), "utf8");
		assert.equal(agents.split("\n").filter((line) => line === "## pstack").length, 1);
		assert.equal(agents.includes("SendWise"), false);
		assert.equal(agents.includes("anas-yousef"), false);
		for (const name of ["sync-pstack", "check-pstack"]) {
			const text = fs.readFileSync(path.join(consumer, "scripts", name), "utf8");
			assert.equal(text.includes("SendWise"), false);
			assert.equal(text.includes("anas-yousef"), false);
		}
		const check = spawnSync("node", ["scripts/check-pstack"], { cwd: consumer, encoding: "utf8" });
		assert.equal(check.status, 0, check.stderr);
		assert.equal(check.stdout, "ok\n");

		const skill = path.join(consumer, ".cursor", "skills", "poteto-mode", "SKILL.md");
		fs.appendFileSync(skill, "\nlocal edit\n");
		const drifted = spawnSync("node", ["scripts/check-pstack"], { cwd: consumer, encoding: "utf8" });
		assert.equal(drifted.status, 1);
		assert.match(drifted.stdout, /^\.cursor\/skills\/poteto-mode\/SKILL\.md\n$/);
		const again = spawnSync("node", ["scripts/sync-pstack"], { cwd: consumer, encoding: "utf8" });
		assert.equal(again.status, 0, again.stderr);
		const restored = spawnSync("node", ["scripts/check-pstack"], { cwd: consumer, encoding: "utf8" });
		assert.equal(restored.status, 0);
		assert.equal(restored.stdout, "ok\n");
	} finally {
		fs.rmSync(consumer, { recursive: true, force: true });
	}
});

test("an existing repo keeps AGENTS.md and verify-foo", { timeout: 180000 }, () => {
	const consumer = gitInit("existing");
	const original = "# Product\n\nKeep this line.\n";
	const verifyFoo = "product verify skill\n";
	const localNotes = "local notes\n";
	const claude = "leave this file\n";
	const keepScript = "#!/bin/sh\necho keep\n";
	try {
		fs.writeFileSync(path.join(consumer, "AGENTS.md"), original);
		fs.writeFileSync(path.join(consumer, "CLAUDE.md"), claude);
		fs.mkdirSync(path.join(consumer, ".cursor", "skills", "verify-foo"), { recursive: true });
		fs.mkdirSync(path.join(consumer, ".cursor", "skills", "local-notes"), { recursive: true });
		fs.writeFileSync(path.join(consumer, ".cursor", "skills", "verify-foo", "SKILL.md"), verifyFoo);
		fs.writeFileSync(path.join(consumer, ".cursor", "skills", "local-notes", "SKILL.md"), localNotes);
		fs.mkdirSync(path.join(consumer, "scripts"), { recursive: true });
		fs.writeFileSync(path.join(consumer, "scripts", "keep.sh"), keepScript);

		const first = adopt(consumer, ["--repo", catalog.dir, "--profile", "grok-opus"]);
		assert.equal(first.status, 0, first.stderr);
		assert.match(first.stdout, /synced [0-9a-f]{40} grok-opus\n/);
		const agents = fs.readFileSync(path.join(consumer, "AGENTS.md"), "utf8");
		assert.equal(agents.startsWith(original), true);
		assert.equal(agents.split("\n").filter((line) => line === "## pstack").length, 1);
		assert.equal(fs.readFileSync(path.join(consumer, "CLAUDE.md"), "utf8"), claude);
		assert.equal(
			fs.readFileSync(path.join(consumer, ".cursor", "skills", "verify-foo", "SKILL.md"), "utf8"),
			verifyFoo,
		);
		assert.equal(
			fs.readFileSync(path.join(consumer, ".cursor", "skills", "local-notes", "SKILL.md"), "utf8"),
			localNotes,
		);
		assert.equal(fs.readFileSync(path.join(consumer, "scripts", "keep.sh"), "utf8"), keepScript);
		assert.equal(
			text(path.join(consumer, ".cursor", "rules", "pstack-models.mdc")),
			text(path.join(catalog.dir, "profiles", "grok-opus.mdc")),
		);
		assert.equal(readPin(consumer).profile, "grok-opus");
		assert.equal(readPin(consumer).commit, catalog.sha);
		const check = spawnSync("node", ["scripts/check-pstack"], { cwd: consumer, encoding: "utf8" });
		assert.equal(check.status, 0, check.stderr);
		assert.equal(check.stdout, "ok\n");

		const second = adopt(consumer, ["--repo", catalog.dir, "--profile", "grok-opus"]);
		assert.equal(second.status, 0, second.stderr);
		const again = fs.readFileSync(path.join(consumer, "AGENTS.md"), "utf8");
		assert.equal(again, agents);
		assert.equal(
			fs.readFileSync(path.join(consumer, ".cursor", "skills", "verify-foo", "SKILL.md"), "utf8"),
			verifyFoo,
		);
	} finally {
		fs.rmSync(consumer, { recursive: true, force: true });
	}
});

test("an unknown profile writes nothing", { timeout: 180000 }, () => {
	const consumer = gitInit("bad-profile");
	try {
		const result = adopt(consumer, ["--repo", catalog.dir, "--profile", "nope"]);
		assert.equal(result.status, 2);
		assert.match(result.stderr, /^init: unknown profile nope\n$/);
		assert.equal(fs.existsSync(path.join(consumer, ".cursor")), false);
		assert.equal(fs.existsSync(path.join(consumer, "scripts")), false);
		assert.equal(fs.existsSync(path.join(consumer, "AGENTS.md")), false);
		assert.equal(fs.existsSync(path.join(consumer, "CLAUDE.md")), false);
	} finally {
		fs.rmSync(consumer, { recursive: true, force: true });
	}
});

function adopt(cwd, args) {
	return spawnSync("sh", ["-s", "--", ...args], {
		cwd,
		input: initScript,
		encoding: "utf8",
		timeout: 170000,
	});
}

function makeCatalog() {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pstack-catalog-"));
	fs.cpSync(path.join(workspace, ".cursor"), path.join(dir, ".cursor"), { recursive: true });
	fs.cpSync(path.join(workspace, "profiles"), path.join(dir, "profiles"), { recursive: true });
	fs.cpSync(path.join(workspace, "scripts"), path.join(dir, "scripts"), { recursive: true });
	assert.equal(git(["init", "-q", "-b", "main"], dir).status, 0);
	assert.equal(git(["add", "-A"], dir).status, 0);
	assert.equal(git(["commit", "-qm", "catalog"], dir).status, 0);
	const sha = git(["rev-parse", "HEAD"], dir);
	assert.equal(sha.status, 0);
	return { dir, sha: sha.stdout.trim() };
}

function gitInit(label) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), `pstack-${label}-`));
	assert.equal(git(["init", "-q", "-b", "main"], dir).status, 0);
	return dir;
}

function git(args, cwd) {
	return spawnSync("git", args, {
		cwd,
		encoding: "utf8",
		env: {
			...process.env,
			GIT_AUTHOR_NAME: "Dev",
			GIT_AUTHOR_EMAIL: "dev@example.com",
			GIT_COMMITTER_NAME: "Dev",
			GIT_COMMITTER_EMAIL: "dev@example.com",
		},
	});
}

function text(file) {
	return fs.readFileSync(file, "utf8");
}

function readPin(root) {
	return JSON.parse(fs.readFileSync(path.join(root, ".cursor", "pstack-source.json"), "utf8"));
}

function hookNames(root) {
	return fs
		.readdirSync(path.join(root, ".git", "hooks"))
		.filter((name) => !name.endsWith(".sample"));
}
