import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const initScript = fs.readFileSync(path.join(workspace, "scripts", "init"));
const home = fs.mkdtempSync(path.join(os.tmpdir(), "pstack-home-"));
const env = { ...process.env, HOME: home };
delete env.CODEX_HOME;
const catalog = makeCatalog();

after(() => {
	fs.rmSync(catalog.dir, { recursive: true, force: true });
	fs.rmSync(home, { recursive: true, force: true });
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
		for (const name of ["sync-pstack", "check-pstack"]) {
			const script = path.join(consumer, "scripts", name);
			assert.equal(text(script), text(path.join(workspace, "scripts", name)));
			assert.equal(fs.statSync(script).mode & 0o777, 0o755);
		}
		assert.equal(fs.existsSync(path.join(consumer, ".cursor", "cli.json")), false);
		assert.equal(hookNames(consumer).length, 0);
		const agents = fs.readFileSync(path.join(consumer, "AGENTS.md"), "utf8");
		assert.equal(agents.split("\n").filter((line) => line === "## pstack").length, 1);
		assert.equal(agents.includes("SendWise"), false);
		assert.equal(agents.includes("anas-yousef"), false);
		const skill = path.join(consumer, ".cursor", "skills", "poteto-mode", "SKILL.md");
		fs.appendFileSync(skill, "\nlocal edit\n");
		const again = adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha]);
		assert.equal(again.status, 0, again.stderr);
		assert.equal(text(skill), text(path.join(catalog.dir, ".cursor", "skills", "poteto-mode", "SKILL.md")));
		const beforeCheck = text(skill);
		const check = script(consumer, "check-pstack");
		assert.equal(check.status, 0, check.stderr);
		assert.equal(check.stdout, "ok\n");
		assert.equal(text(skill), beforeCheck);
		fs.appendFileSync(skill, "drift\n");
		const drift = script(consumer, "check-pstack");
		assert.equal(drift.status, 1, drift.stderr);
		assert.match(drift.stdout, /\.cursor\/skills\/poteto-mode\/SKILL\.md/);
		const wrong = script(consumer, "sync-pstack", ["--from", catalog.dir, "--commit", "a".repeat(40)]);
		assert.equal(wrong.status, 2);
		assert.ok(text(skill).endsWith("drift\n"));
		const sync = script(consumer, "sync-pstack", ["--from", catalog.dir, "--commit", catalog.sha]);
		assert.equal(sync.status, 0, sync.stderr);
		assert.equal(text(skill), beforeCheck);
		assert.equal(script(consumer, "check-pstack").status, 0);
		// A new checkout commit can advance the consumer pin without running init.
		const extra = path.join(catalog.dir, ".cursor", "rules", "sync-update.mdc");
		fs.writeFileSync(extra, "updated rule\n");
		assert.equal(git(["add", "-A"], catalog.dir).status, 0);
		assert.equal(git(["commit", "-qm", "update"], catalog.dir).status, 0);
		const next = git(["rev-parse", "HEAD"], catalog.dir).stdout.trim();
		const update = script(consumer, "sync-pstack", ["--from", catalog.dir, "--commit", next]);
		assert.equal(update.status, 0, update.stderr);
		assert.equal(readPin(consumer).commit, next);
		assert.equal(text(path.join(consumer, ".cursor", "rules", "sync-update.mdc")), "updated rule\n");
		assert.equal(script(consumer, "check-pstack").status, 0);
	} finally {
		git(["reset", "--hard", catalog.sha], catalog.dir);
		fs.rmSync(consumer, { recursive: true, force: true });
	}
});

test("--from refuses tracked, staged, and untracked changes before copying or repinning", () => {
	const consumer = gitInit("dirty-source");
	const tracked = path.join(catalog.dir, ".cursor/rules/pstack-models.mdc");
	const untracked = path.join(catalog.dir, ".cursor/dirty-source.txt");
	const original = fs.readFileSync(tracked);
	try {
		assert.equal(adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha]).status, 0);
		const before = text(path.join(consumer, ".cursor/rules/pstack-models.mdc"));
		const pinBefore = text(path.join(consumer, ".cursor/pstack-source.json"));
		for (const kind of ["tracked", "staged", "untracked"]) {
			if (kind === "untracked") fs.writeFileSync(untracked, "uncommitted\n");
			else fs.appendFileSync(tracked, "uncommitted\n");
			if (kind === "staged") assert.equal(git(["add", "."], catalog.dir).status, 0);
			const result = script(consumer, "sync-pstack", ["--from", catalog.dir, "--commit", catalog.sha]);
			assert.equal(result.status, 2, kind);
			assert.match(result.stderr, /dirty checkout/, kind);
			assert.equal(text(path.join(consumer, ".cursor/rules/pstack-models.mdc")), before);
			assert.equal(text(path.join(consumer, ".cursor/pstack-source.json")), pinBefore);
			assert.equal(fs.existsSync(path.join(consumer, ".cursor/dirty-source.txt")), false);
			git(["reset", "--hard", catalog.sha], catalog.dir);
			fs.rmSync(untracked, { force: true });
		}
		assert.equal(script(consumer, "sync-pstack", ["--from", catalog.dir, "--commit", catalog.sha]).status, 0);
		assert.equal(script(consumer, "check-pstack").status, 0);
	} finally {
		fs.writeFileSync(tracked, original);
		git(["reset", "--hard", catalog.sha], catalog.dir);
		fs.rmSync(untracked, { force: true });
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

test("consumer checkers coexist through init, drift checks, and sync", () => {
	const consumer = gitInit("coexist");
	const checkers = {
		"check-pstack.mjs": "// consumer Grok tree check\nconsole.log('tree check');\n",
		"pstack-claude-check.mjs": "// pstack-claude-catalog: managed consumer script\n",
	};
	try {
		fs.mkdirSync(path.join(consumer, "scripts"));
		for (const [name, bytes] of Object.entries(checkers)) fs.writeFileSync(path.join(consumer, "scripts", name), bytes);
		for (let i = 0; i < 2; i++) {
			const result = adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha]);
			assert.equal(result.status, 0, result.stderr);
			assert.equal(script(consumer, "check-pstack").status, 0);
			const skill = path.join(consumer, ".cursor", "skills", "poteto-mode", "SKILL.md");
			fs.appendFileSync(skill, "drift\n");
			assert.equal(script(consumer, "check-pstack").status, 1);
			const sync = script(consumer, "sync-pstack", ["--from", catalog.dir, "--commit", catalog.sha]);
			assert.equal(sync.status, 0, sync.stderr);
			assert.equal(script(consumer, "check-pstack").status, 0);
			for (const [name, bytes] of Object.entries(checkers)) assert.equal(text(path.join(consumer, "scripts", name)), bytes);
		}
	} finally {
		fs.rmSync(consumer, { recursive: true, force: true });
	}
});

test("AGENTS.md linked to CLAUDE.md preserves the link", () => {
	const consumer = gitInit("linked");
	const original = "# Project\n\nKeep this.\n";
	try {
		fs.writeFileSync(path.join(consumer, "CLAUDE.md"), original);
		fs.symlinkSync("CLAUDE.md", path.join(consumer, "AGENTS.md"));
		const result = adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha]);
		assert.equal(result.status, 0, result.stderr);
		assert.equal(fs.lstatSync(path.join(consumer, "AGENTS.md")).isSymbolicLink(), true);
		assert.equal(fs.readlinkSync(path.join(consumer, "AGENTS.md")), "CLAUDE.md");
		const agents = text(path.join(consumer, "AGENTS.md"));
		assert.ok(agents.startsWith(original));
		assert.equal(agents.split("\n").filter((line) => line === "## pstack").length, 1);
		assert.equal(text(path.join(consumer, "CLAUDE.md")), agents);
		const again = adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha]);
		assert.equal(again.status, 0, again.stderr);
		assert.equal(fs.readlinkSync(path.join(consumer, "AGENTS.md")), "CLAUDE.md");
		assert.equal(text(path.join(consumer, "CLAUDE.md")), agents);
	} finally {
		fs.rmSync(consumer, { recursive: true, force: true });
	}
});

test("init refuses AGENTS.md symlinks with unsafe targets", () => {
	const consumer = gitInit("linked-unsafe");
	const external = `${consumer}-outside`;
	const original = "# External\n";
	const existingAdvisory = "# External\n\n## pstack\n\nKeep this advisory.\n";
	const agents = path.join(consumer, "AGENTS.md");
	try {
		fs.mkdirSync(external);
		fs.writeFileSync(path.join(external, "instructions.md"), original);
		fs.writeFileSync(path.join(external, "advisory.md"), existingAdvisory);
		fs.symlinkSync(external, path.join(consumer, "linked-dir"));
		fs.mkdirSync(path.join(consumer, "instructions"));
		for (const target of [
			path.join(external, "instructions.md"),
			path.relative(consumer, path.join(external, "advisory.md")),
			"linked-dir/instructions.md",
			"missing.md",
			path.join(external, "missing.md"),
			"AGENTS.md",
			"instructions",
		]) {
			fs.symlinkSync(target, agents);
			const result = adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha]);
			assert.equal(result.status, 2, target);
			assert.match(result.stderr, /init: refusing to write through a symlink: AGENTS\.md/, target);
			assert.equal(fs.readlinkSync(agents), target);
			assert.equal(text(path.join(external, "instructions.md")), original);
			assert.equal(text(path.join(external, "advisory.md")), existingAdvisory);
			assert.equal(fs.existsSync(path.join(consumer, "missing.md")), false);
			assert.equal(fs.existsSync(path.join(external, "missing.md")), false);
			assert.deepEqual(fs.readdirSync(path.join(consumer, "instructions")), []);
			fs.unlinkSync(agents);
		}
	} finally {
		fs.rmSync(consumer, { recursive: true, force: true });
		fs.rmSync(external, { recursive: true, force: true });
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

test("re-running init on an old-layout consumer preserves copy/protect and protected files", () => {
	const consumer = gitInit("old-layout");
	const pin = {
		repo: catalog.dir, commit: catalog.sha, profile: "grok-opus",
		copy: [".cursor/skills/", ".cursor/agents/", ".cursor/rules/"],
		protect: [
			{ kind: "exact", path: ".cursor/skills/poteto-mode/SKILL.md" },
			{ kind: "prefix", path: ".cursor/agents/" },
			{ kind: "skill", root: ".cursor/skills", prefix: "verify-", except: "verify-this" },
		],
	};
	try {
		fs.mkdirSync(path.join(consumer, ".cursor", "skills", "poteto-mode"), { recursive: true });
		fs.mkdirSync(path.join(consumer, ".cursor", "skills", "verify-foo"), { recursive: true });
		fs.mkdirSync(path.join(consumer, ".cursor", "agents"), { recursive: true });
		fs.writeFileSync(path.join(consumer, ".cursor", "pstack-source.json"), JSON.stringify(pin));
		fs.writeFileSync(path.join(consumer, ".cursor", "skills", "poteto-mode", "SKILL.md"), "custom protected skill\n");
		fs.writeFileSync(path.join(consumer, ".cursor", "skills", "verify-foo", "SKILL.md"), "product proof\n");
		fs.writeFileSync(path.join(consumer, "AGENTS.md"), "# Product\n\n## pstack\n\nOld advisory.\n");
		for (let i = 0; i < 2; i++) {
			const init = adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha, "--profile", "grok-opus"]);
			assert.equal(init.status, 0, init.stderr);
			assert.deepEqual(readPin(consumer), pin);
			assert.equal(text(path.join(consumer, ".cursor", "skills", "poteto-mode", "SKILL.md")), "custom protected skill\n");
			assert.equal(text(path.join(consumer, ".cursor", "skills", "verify-foo", "SKILL.md")), "product proof\n");
			assert.deepEqual(fs.readdirSync(path.join(consumer, ".cursor", "agents")), []);
			assert.equal(script(consumer, "check-pstack").status, 0);
			const sync = script(consumer, "sync-pstack", ["--from", catalog.dir, "--commit", catalog.sha]);
			assert.equal(sync.status, 0, sync.stderr);
			assert.deepEqual(readPin(consumer), pin);
			assert.equal(text(path.join(consumer, "AGENTS.md")), "# Product\n\n## pstack\n\nOld advisory.\n");
			assert.equal(fs.existsSync(path.join(consumer, "CLAUDE.md")), false);
		}
	} finally {
		fs.rmSync(consumer, { recursive: true, force: true });
	}
});

function script(cwd, name, args = []) {
	return spawnSync(process.execPath, [path.join(cwd, "scripts", name), ...args], { cwd, env, encoding: "utf8" });
}

test("init and sync refuse to overwrite files through consumer symlinks", () => {
	const consumer = gitInit("symlink-destination");
	const external = fs.mkdtempSync(path.join(os.tmpdir(), "pstack-external-"));
	try {
		fs.symlinkSync(external, path.join(consumer, ".cursor"));
		const rejected = adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha]);
		assert.equal(rejected.status, 2);
		assert.match(rejected.stderr, /symlink/);
		assert.deepEqual(fs.readdirSync(external), []);
		fs.unlinkSync(path.join(consumer, ".cursor"));
		assert.equal(adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha]).status, 0);
		const skill = path.join(consumer, ".cursor", "skills", "poteto-mode");
		fs.rmSync(skill, { recursive: true });
		fs.writeFileSync(path.join(external, "SKILL.md"), "keep me\n");
		fs.symlinkSync(external, skill);
		const sync = script(consumer, "sync-pstack", ["--from", catalog.dir, "--commit", catalog.sha]);
		assert.equal(sync.status, 2);
		assert.match(sync.stderr, /symlink/);
		assert.equal(text(path.join(external, "SKILL.md")), "keep me\n");
	} finally {
		fs.rmSync(consumer, { recursive: true, force: true });
		fs.rmSync(external, { recursive: true, force: true });
	}
});

function adopt(cwd, args) {
	return spawnSync("sh", ["-s", "--", ...args], {
		cwd,
		env,
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
	fs.mkdirSync(path.join(dir, ".cursor", "skills", "verify-foo"), { recursive: true });
	fs.writeFileSync(path.join(dir, ".cursor", "skills", "verify-foo", "SKILL.md"), "catalog collision\n");
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
			...env,
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

test("installed skills are model-discoverable and compiled references stay on demand", () => {
	const consumer = gitInit("skills-discovery");
	try {
		const first = adopt(consumer, ["--repo", catalog.dir, "--commit", catalog.sha]);
		assert.equal(first.status, 0, first.stderr);
		const skillsRoot = path.join(consumer, ".cursor/skills");
		const names = fs.readdirSync(skillsRoot);
		assert.deepEqual(names.sort(), fs.readdirSync(path.join(workspace, ".cursor/skills")).sort());
		for (const required of ["poteto-mode", "prd", "tdd", "build-auto", "swarm"]) assert.ok(names.includes(required));
		assert.ok(names.some((name) => name.startsWith("principle-")));
		for (const name of names) {
			const skill = text(path.join(skillsRoot, name, "SKILL.md"));
			const frontmatter = skill.split("---")[1];
			assert.match(frontmatter, new RegExp(`^name: ${name}$`, "m"), name);
			assert.match(frontmatter, /^description: .+/m, name);
			assert.doesNotMatch(frontmatter, /^disable-model-invocation: true$/m, name);
			assert.equal(fs.existsSync(path.join(skillsRoot, name, "AGENTS.md")), false, name);
		}
		const vercel = path.join(skillsRoot, "vercel-react-best-practices");
		assert.match(text(path.join(vercel, "SKILL.md")), /`REFERENCE\.md`/);
		assert.ok(fs.statSync(path.join(vercel, "REFERENCE.md")).size > 100000);
		const nestedInstructions = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
			const file = path.join(dir, entry.name);
			return entry.isDirectory() ? nestedInstructions(file) : entry.name === "AGENTS.md" ? [file] : [];
		});
		assert.deepEqual(nestedInstructions(skillsRoot), []);
		assert.equal(script(consumer, "check-pstack").stdout, "ok\n");
	} finally {
		fs.rmSync(consumer, { recursive: true, force: true });
	}
});
