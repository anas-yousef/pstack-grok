# Grok-only pstack

Fork `pstack-grok-v0.15.29-1`. A Cursor project copies this tree, or points at it, and gets one poteto-mode setup where every role is Grok.

pstack 0.15.29 is vendored in full, including `log.sh`, the decision-log template, and the poteto-mode scripts. cursor-team-kit 1.2.0 is vendored in full. Three mattpocock skills and three superpowers skills are vendored with their licenses. `NOTICE` names each upstream commit. `pstack-source.json` lists every file, its sha256, and each local patch.

## Copy it into a project

From this repo:

```bash
python3 scripts/install /path/to/your/project
```

The script copies `.cursor/`, `pstack-source.json`, `NOTICE`, and the check scripts. A skill or rule this fork ships is overwritten. A file the project already has, and this fork does not, is left in place. The script refuses to run when the target is this repo.

## Reference it

Add this repository as a submodule and point the project's `.cursor` at the submodule.

```bash
git submodule add <this-repo-url> vendor/pstack-grok
ln -s vendor/pstack-grok/.cursor .cursor
```

A later `git submodule update` moves the project to a newer commit of this fork. Use the copy script instead when a symlink is awkward, or when the project already has its own `.cursor` and you only want these skills merged in.

## Update

```bash
python3 scripts/check-upstream
```

The report names the pinned commit and the upstream head for each source. A file this fork did not edit is `unpatched, safe to take`. Replace that file with the upstream blob, then put the new sha256 on its row in `pstack-source.json`. A file in `localPatches` needs a 3-way merge. The script runs that merge in a temp directory and reports `clean` or `conflict`. It does not write the result back, and it does not push.

`python3 scripts/check-grok` fails if a file names a non-Grok model or a cross-family review rule. `scripts/grok-allowlist.txt` lists a path and the sha256 that may be skipped. A copied or edited file with a different hash is scanned, and a stale row fails the check. `.github/workflows/grok.yml` runs the same checks.

Skills, agents, and rules are loaded from `.cursor/skills`, `.cursor/agents`, and `.cursor/rules`. `.cursor/pstack/plugin.json` still has the upstream relative paths. Those paths do not resolve inside `.cursor/pstack`, because the skills were hoisted to where Cursor reads them.

## What a product build does

`/poteto-mode` is the only entry. An empty repo or a new product uses the Greenfield playbook.

- Interrogate runs before implementation when the slice matches `.cursor/skills/poteto-mode/references/interrogate-triggers.md`. That file is the only copy of the trigger list.
- Browser verification uses control-ui. computerUse is unpinned. `scripts/check-grok` prints the known exception from `scripts/grok-exceptions.json`.
- `create-verification-skill` runs once the scaffold boots.
- The trail review runs before the push. The reviewer is a fresh subagent on `grok-4.7-xhigh`, prompted to find faults.
- If that spawn fails, it is retried once on the same Grok slug. If the retry fails, the parent reviews inline, labels it `self-review`, and includes the verbatim error under Attention.
- If TodoWrite returns `success: false`, the run stops.
- `deslop` and `no-comments` run before each commit.

## Checks on this repo

```bash
python3 scripts/check-grok
python3 scripts/check-upstream --self-test
python3 scripts/check-upstream
```
