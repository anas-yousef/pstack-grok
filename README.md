# Grok-only pstack

Fork `pstack-grok-v0.15.29-1`. A Cursor project installs this tree and gets one poteto-mode setup where every model this fork selects is Grok.

pstack 0.15.29 is vendored in full, including `log.sh`, the decision-log template, and the poteto-mode scripts. cursor-team-kit 1.2.0 is vendored in full. Three mattpocock skills and three superpowers skills are vendored with their licenses. `NOTICE` names each upstream commit. `pstack-source.json` lists every file, its sha256, and each local patch with its reason.

## Assumptions

- **The parent chat runs on Grok.** Run Cursor on a Grok model. A role line set to `inherit-parent`, `auto`, or `unpinned`, the inline `self-review` fallback, and any Task call that omits `model` all run on the parent chat's model. On a non-Grok parent they run off Grok. No check in this repo can see the parent model, so `check-grok` rejects those aliases in the project rule. They stay supported for a personal `~/.cursor/rules/pstack-models.mdc`.
- **computerUse in cloud agents is a paid exception.** Cursor's computer-use and browser helper is pinned server-side to a non-Grok model, and the `subagentStart` hook does not fire in cloud agents. `scripts/grok-exceptions.json` records the probes. Browser checks use control-ui on Grok. When control-ui cannot reach a page in a cloud agent, the helper is allowed, billed to the Cursor account that runs the agent, and logged per run. On a local agent the hook denies it.

## Install into a project

From a clone of this repo:

```bash
python3 scripts/install /path/to/your/project
```

The script reads `pstack-source.json` and writes:

- every `.cursor/` file the manifest lists, at the same path
- `scripts/pstack-grok/`, which holds `check-grok`, `check-paths`, `test-subagent-hook`, `grok-exceptions.json`, a generated `grok-allowlist.txt`, `LICENSE`, `NOTICE`, the manifest, and `installed.json`
- the `subagentStart` entry, merged into the project's `.cursor/hooks.json`. The project's other hooks stay.

A project file the install would overwrite, and that the last install did not write, is a conflict. So is a file the last install wrote and the project edited since. On a conflict the script lists the files and writes nothing. Move the project's file aside, or re-run with `--force`. A re-install removes files the fork no longer ships, unless the project edited them. The script never writes the project's own `LICENSE`, `NOTICE`, `scripts/install`, or `scripts/verify-setup`, and it refuses to run when the target is this repo.

Then, in the project:

```bash
python3 scripts/pstack-grok/check-grok
python3 scripts/pstack-grok/test-subagent-hook
python3 scripts/pstack-grok/check-paths
```

The installed checks read only the files in `installed.json`. A product's own code, `.venv`, and docs are never scanned.

To update a project, pull this repo and run the install again. The **Upstream sync** playbook has the steps.

## Reference it as a submodule

```bash
git submodule add <this-repo-url> vendor/pstack-grok
python3 vendor/pstack-grok/scripts/install .
```

Run the install from the submodule after each `git submodule update`. Symlinking the project's `.cursor` to `vendor/pstack-grok/.cursor` also works, but then the project cannot add its own rules, skills, or hooks without writing into the submodule, and the checks are not installed. Use the symlink only for a project that has nothing of its own in `.cursor`.

## The subagent hook

`.cursor/hooks.json` runs `python3 .cursor/hooks/block-non-grok.py` on `subagentStart` with `failClosed: true`. It denies a subagent whose type names a computer-use or browser agent, and any subagent whose own model, or the parent model it inherits, is not a `grok-*` slug. The field names are this fork's reading of Cursor's hook input. The hook is tested only against synthetic payloads in `scripts/test-subagent-hook`, not against a live `subagentStart` payload. The command path is relative and expects Cursor to run project hooks from the project root, which this repo has not verified against Cursor's docs. If `python3` is missing or the path does not resolve, the hook fails, and `failClosed` denies every subagent. When every spawn is denied with no deny sentence, check those two things first.

## Checks on this repo

```bash
python3 scripts/verify-setup
```

`verify-setup` runs the Grok check and its self-test, the hook tests, the path checks, the upstream self-test, every poteto-mode bun test and the typecheck, the manifest check, and installs into temp projects to prove each install promise. Without bun it fails. `python3 scripts/verify-setup --skip-bun` skips the bun step on purpose and says so. It also fails when the CI bun version and `bun-types` differ. `.github/workflows/grok.yml` runs it on every push and pull request.

- `scripts/check-grok` fails when a file names a non-Grok model or a cross-family review rule, when a value in `.cursor/rules/pstack-models.mdc` or an agent's `model:` line is not a `grok-*` slug or `blocked`, or when the computerUse record contradicts itself. It also reads `~/.cursor/rules/pstack-models.mdc` when present. A non-Grok slug there fails, and a line that differs from the project rule is printed as a note. `scripts/grok-allowlist.txt` lists the paths and sha256 that may quote banned text. An edited file with a different hash is scanned again.
- `scripts/check-paths` fails on a copied interrogate trigger list, a dangling plugin path, a TypeScript rule that is always applied, a dead relative link under `.cursor`, or a playbook poteto-mode does not route.
- `scripts/update-manifest` rehashes `pstack-source.json` after an edit, lists new files as local, and refuses a changed vendored file until it has a `localPatches` reason (`--patch <file> <reason>`). `--rehash-allowlist` also rehashes the allowlist. Read the diff of each allowlisted file before using it.

## Upstream drift

```bash
python3 scripts/check-upstream
python3 scripts/check-upstream --json
```

Run it on a schedule, such as a daily job, or by hand before a sync. Push and pull request CI do not run it, because an upstream commit is not a failure of this repo.

The report names the pin, the upstream head, and each commit since the pin that touched the source's path. A file this fork did not edit is `unpatched`, recommendation `take`. A patched file is `review`, with the result of a 3-way merge run in a temp directory. A new upstream skill this fork does not vendor is `skip`, at any depth under `skills/`. An upstream change to, or delete of, a file this fork does not vendor is also `skip`. A rename shows as a delete plus an add. For mattpocock and superpowers, whose source path is the whole repo, only the kept skill directories and the other vendored files count. The script does not write results back and does not push.

Exit 0 is clean, including when only skipped files changed. `--json` runs the same Grok checks as the text report. Exit 1 is drift that needs a take or a review. Exit 2 is a fetch or pin failure. Exit 3 is a local Grok failure.

## Plugin manifests

Skills, agents, and rules load from `.cursor/skills`, `.cursor/agents`, and `.cursor/rules`. `.cursor/pstack/plugin.json` has no path fields. The two `.cursor-plugin/plugin.json` files point their skill and agent paths at those hoisted directories, and `check-paths` fails if one stops resolving.

## What a product build does

`/poteto-mode` is the only entry. An empty repo or a new product uses the Greenfield playbook.

- Interrogate runs before implementation when the slice matches `.cursor/skills/poteto-mode/references/interrogate-triggers.md`. That file is the only copy of the trigger list.
- A slice in a risky area also runs its risk playbook: DB migration, auth and payments, deletion and privacy, external side effects, retries and concurrency, testing strategy, docs, secrets and env, deploy and rollback, incident and hotfix, dependency upgrade, observability, or upstream sync.
- Browser verification uses control-ui on Grok. computerUse follows the exception above.
- `create-verification-skill` runs once the scaffold boots.
- The trail review runs before the push. The reviewer is a fresh subagent on `grok-4.7-xhigh`, prompted to find faults.
- If that spawn fails, it is retried once on the same Grok slug. If the retry fails, the parent reviews inline, labels it `self-review`, and includes the verbatim error under Attention.
- If TodoWrite returns `success: false`, the run stops.
- `deslop` and `no-comments` run before each commit.

## License

This fork's own work is under the MIT License in `LICENSE`. The vendored trees keep their upstream MIT licenses, which `NOTICE` lists with each upstream commit.
