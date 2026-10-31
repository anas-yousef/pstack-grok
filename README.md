# pstack-grok

A Cursor project setup that teaches agents how to work. It is [pstack](https://github.com/cursor/plugins/tree/main/pstack) as upstream ships it, with every model role on Grok by default, plus a few vendored skills and playbooks. It sets which model fills each role. It does not choose your app's vendors.

## What it combines

- **pstack** from `cursor/plugins`. Skills, agents, and the poteto-mode playbooks.
- **cursor-team-kit** from `cursor/plugins`. CI, PR, review, and control skills.
- **superpowers** from `obra/superpowers`. `verification-before-completion`, `systematic-debugging`, `receiving-code-review`.
- **mattpocock/skills**. `domain-modeling`, `writing-for-agents`, `wizard`, `grill-me`, `grilling`.
- **addyosmani/agent-skills**. `spec-driven-development`, `planning-and-task-breakdown`, `incremental-implementation`, `documentation-and-adrs`, `shipping-and-launch`, `doubt-driven-development`, `performance-optimization`, `frontend-ui-engineering`, `browser-testing-with-devtools`.
- **vercel-labs/agent-skills**. `vercel-react-best-practices`.
- **supabase/agent-skills**. `supabase`, `supabase-postgres-best-practices`.
- **Original work.** A Grok `pstack-models.mdc` with per-role efforts, the `profiles/` model mixes, the `principle-follow-official-docs` skill, the `committed-browser-proof` skill, the `local-supabase` skill, the `build-auto` skill, the `spec` skill, the `legacy-critique` skill, the `prd` skill, the `merge-reviews` skill, the interrogate trigger list, and eight poteto-mode playbooks: greenfield, DB migration, dependency upgrade, external side effects, security and privacy, observability, deploy and rollback, and incident hotfix.

Everything lives under `.cursor/`, where Cursor loads project skills, agents, and rules. `NOTICE` lists each source and its license. `sources.json` pins the upstream commits.

## New repo

Create a git repo and adopt the catalog from that repo's root. The command needs no login. It does not create a commit.

```sh
git init my-app
cd my-app
curl -fsSL https://raw.githubusercontent.com/anas-yousef/pstack-grok/main/scripts/init | sh -s --
```

The command writes `.cursor/pstack-source.json`, copies `scripts/sync-pstack` and `scripts/check-pstack`, and runs `scripts/sync-pstack` once. That copies `.cursor/` from the pinned commit and installs the `grok` profile as `.cursor/rules/pstack-models.mdc`. It also writes `AGENTS.md` with a short pstack section. It does not create `CLAUDE.md`.

Pass `--profile grok-opus` or `--profile design-heavy` to install another mix. Pass `--commit` and a 40-digit sha to pin a commit other than the current `main` tip. Pass `--repo` and an https URL to adopt a fork.

Then run `/poteto-mode` in a Cursor chat.

## Existing repo

Run the same command from the root of a repo that already has files. A skill directory this catalog does not ship stays, including names that start with `verify-`. An existing `AGENTS.md` stays. The command appends the pstack section when the `## pstack` line is absent. A second run does not append it again. An existing `CLAUDE.md` stays. The command does not create one.

`scripts/sync-pstack` copies `.cursor/` from the pin again. `scripts/check-pstack` prints `ok` when those copied files match the pin. It writes nothing. Run the init command again to refresh the two scripts.

Copy by hand still works. Copy this repo's `.cursor/` into the project, or merge `skills/`, `agents/`, and `rules/` into an existing `.cursor/`. A submodule works too.

```sh
git submodule add <repo-url> vendor/pstack-grok
ln -s vendor/pstack-grok/.cursor .cursor
```

Update later with `git submodule update --remote vendor/pstack-grok`. Check that your Cursor version follows the symlink. If it does not, use the copy method.

## Change a role's model

Edit one line in `.cursor/rules/pstack-models.mdc`. For example, to run feature work on another model:

```
feature, refactoring: claude-opus-5-5-xhigh
```

The change applies to new chats. Delete a line to fall back to the skill default. `/setup-pstack` also edits this project file when it exists. Its budget question sets one effort for every role, so it replaces the per-role efforts below.

The slug carries the reasoning effort, as in `grok-4.7-high` or `claude-opus-5-5-xhigh`. Each line sets its own effort, so two roles on the same model can run at different levels. The default file runs every role on Grok at `high`, and at `xhigh` for the roles that hunt an unknown cause, judge, or take the hardest work: `bug-fix`, `perf-issue`, `hardest tasks`, `why synthesizer`, `arena cross-judge pool`, and the first seat of `architect runners` and `interrogate reviewers`. No role uses a `-fast` slug, because fast slugs spend more tokens.

## Model profiles

A profile is a complete `pstack-models.mdc` with a different mix of models and efforts. Its `# profile:` line names it.

| Profile | File | Mix |
| --- | --- | --- |
| `grok` | `.cursor/rules/pstack-models.mdc` | Grok in every role. The default. |
| `grok-opus` | `profiles/grok-opus.mdc` | Grok writes code and runs workers. Opus takes judgment, prose, the hardest tasks, and one seat on each panel. |
| `design-heavy` | `profiles/design-heavy.mdc` | Grok in every role. Judgment and prose, architect runners, the arena judge, and interrogate reviewers run at xhigh. Feature work, refactoring, and swarm workers stay at high. Bug-fix and perf stay at xhigh. |

To use a profile, copy its file over `.cursor/rules/pstack-models.mdc` in your project. Cursor loads only that path, so the other profiles stay inactive. To add a mix, add one file to `profiles/` with every role line and a `# profile:` line.

## Check whether upstream moved

From the repo root, run `scripts/check-upstream`.

The command reads `sources.json`. It prints one line per source. The line is the source name, the pinned commit, the default-branch tip, and a status word. The status word is last.

`skip` means the tip equals the pin, or the tip moved and no mapped path changed. `take` means a mapped path changed and each changed path still matches the pin in the work tree. `review` means a mapped path changed and at least one changed path does not match the pin.

The command exits 0 when every line says `skip`. It exits 1 when any line says `take` or `review`. It exits 2 when it cannot read `sources.json` or a remote, and it prints no status line.

To refresh a source, edit its commit in `sources.json`. Copy the mapped paths from that commit into the tree. Reapply the edits listed under Changes to upstream text. Update `NOTICE`. This command does not write the tree.

## Changes to upstream text

Upstream files are vendored byte for byte except these:

- `setup-pstack/SKILL.md`. One added sentence. It reads and writes the project `.cursor/rules/pstack-models.mdc` when that file exists.
- `arena/SKILL.md`, `swarm/SKILL.md`, `interrogate/SKILL.md`, `poteto-help/SKILL.md`. One added sentence each. They read the project `.cursor/rules/pstack-models.mdc` when that file exists.
- `show-me-your-work/SKILL.md`, `poteto-mode/playbooks/orchestrate.md`, `poteto-mode/playbooks/eval.md`. Three places that asked for a reviewer or judge on a different model family now name a line in `pstack-models.mdc`.
- `poteto-mode/playbooks/multi-phase-plan.md`. The `check-plan.mjs` path points at `.cursor/skills/poteto-mode/scripts/`.
- `poteto-mode/SKILL.md`. Additions only: routes for the eight new playbooks, one line sending interrogate-trigger matches to `interrogate`, three more items on the Always-pause list (live charges, first live external sends, destructive production migrations), one Non-negotiables bullet that requires `committed-browser-proof` before claiming a browser or UI product done, and one Non-negotiables bullet that sends a product build needing a real backend database, auth, or row-level security to `local-supabase`. Data deletion was already on it. A Non-negotiables bullet sends a product or a large feature to build-auto. Small fixes go direct to their playbooks. build-auto never runs standalone in autonomous flows. The Playbooks list gains a Build auto entry before Feature. The Greenfield bullet keeps the empty-repo route and names a from-scratch rebuild of an old repo. A product or a large feature invokes build-auto.
- `spec-driven-development/SKILL.md`, `incremental-implementation/SKILL.md`, and `doubt-driven-development/SKILL.md`. `spec-driven-development` points its implement step at `../incremental-implementation/SKILL.md` and `../tdd/SKILL.md`, and it no longer names `context-engineering`. The incremental verify sentence names pstack tdd at `../tdd/SKILL.md` when the task asked for a failing test. `doubt-driven-development` links `tdd` and `systematic-debugging`.
- Eight trees are omitted. They are `ketchup-video`, `make-bot-ui`, `bro`, `what-did-i-get-done`, `weekly-review`, `workflow-from-chats`, `pr-review-canvas`, and `setup-benny`. A later directory copy must delete them again.
- `ketchup/SKILL.md` and `poteto-help/SKILL.md`. The ketchup voice sentence uses plain words, short sentences, and no jargon. The poteto-help table drops the ketchup-video, bro, and make-bot-ui rows. `poteto-help/references/recipes.md` drops the `/bro` line. The planning sentence says a product or a large feature runs build-auto, which plans with planning-and-task-breakdown.

Step 3 of `poteto-mode/playbooks/greenfield.md`, an original playbook, gained two sentences. A browser or UI surface also satisfies `committed-browser-proof`. A product that needs a real backend database, auth, or row-level security follows `local-supabase`. On frontend or UI work the playbook loads `frontend-ui-engineering` and `vercel-react-best-practices`. On performance work it loads `performance-optimization`. For browser checks it loads `browser-testing-with-devtools`. On Supabase or Postgres work it loads `supabase` and `supabase-postgres-best-practices`. A from-scratch rebuild runs legacy-critique, then merge-reviews until `docs/decisions/open/` is empty or the human decides, then prd once per feature, then build-auto.

## License

Original work is MIT, see `LICENSE`. Vendored work keeps its own MIT license, see `NOTICE`.
