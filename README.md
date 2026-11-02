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
- **Original work.** A Grok `pstack-models.mdc` with per-role efforts, the `pstack-prd-first.mdc` routing rule, the `profiles/` model mixes, the `principle-follow-official-docs` skill, the `committed-browser-proof` skill, the `local-supabase` skill, the `build-auto` skill, the `spec` skill, the `legacy-critique` skill, the `prd` skill, the `merge-reviews` skill, the interrogate trigger list, and eight poteto-mode playbooks: greenfield, DB migration, dependency upgrade, external side effects, security and privacy, observability, deploy and rollback, and incident hotfix.

Everything lives under `.cursor/`, where Cursor loads project skills, agents, and rules. `NOTICE` lists each source and its license. `sources.json` pins the upstream commits.

## Setup

Run from the root of a new or existing git repo. No login is needed, and init creates no commit.

```sh
curl -fsSL https://raw.githubusercontent.com/anas-yousef/pstack-grok/main/scripts/init | sh -s --
```

Init copies `.cursor/` from the selected catalog commit, installs the `grok` model profile, records the source in `.cursor/pstack-source.json`, and adds a short pstack section to `AGENTS.md`. It installs `scripts/sync-pstack` and `scripts/check-pstack`. Consumer `scripts/check-pstack.mjs` and the Claude catalog’s `scripts/pstack-claude-check.mjs` stay untouched. Existing project prose, unrelated skills, product `verify-*` skills, and `CLAUDE.md` stay. Run `/poteto-mode` in Cursor after setup. All 97 catalog skills support automatic discovery, including poteto-mode, principle-*, prd, tdd, build-auto, and swarm. The skill bodies keep their existing routing and approval requirements.

Pass `--profile grok-opus` or `--profile design-heavy` to select another mix, `--commit <40-digit-sha>` to select a commit, or `--repo <https-url-or-absolute-path>` to use a fork or local checkout. Without `--commit`, init uses the catalog's current default-branch tip.

Run init again to refresh, passing the same profile flags to keep your chosen mix. It replaces catalog files while preserving files the catalog does not ship and existing `copy`/`protect` pin fields. `scripts/sync-pstack` restores the installed pin; `scripts/check-pstack` prints `ok` when managed files match it and writes nothing. For a local refresh, run `scripts/sync-pstack --from <checkout> --commit <40-digit-sha>`. It requires a clean checkout at that commit, including no staged or untracked changes, then copies the files and updates the pin.

Auto-run is a per-user Cursor setting or CLI `--yolo`; project `.cursor/cli.json` supports only allow/deny rules, and cloud agents already auto-run.

## Change a role's model

Edit one line in `.cursor/rules/pstack-models.mdc`. For example, to run feature work on another model:

```
feature, refactoring: claude-opus-5-5-xhigh
```

The change applies to new chats. Delete a line to fall back to the skill default. `/setup-pstack` also edits this project file when it exists. Its budget question sets one effort for every role, so it replaces the per-role efforts below.

The slug carries the reasoning effort, as in `grok-4.7-high` or `claude-opus-5-5-xhigh`. Each role has its own effort. The default profile uses Grok at `high`, with `xhigh` for bugs, performance investigations, the hardest tasks, and judgment. The profile file records the exact assignments.

## Model profiles

A profile is a complete `pstack-models.mdc` with a different mix of models and efforts. Its `# profile:` line names it.

| Profile | File | Mix |
| --- | --- | --- |
| `grok` | `.cursor/rules/pstack-models.mdc` | Grok in every role. The default. |
| `grok-opus` | `profiles/grok-opus.mdc` | Grok writes code and runs workers. Opus takes judgment, prose, the hardest tasks, and one seat on each panel. |
| `design-heavy` | `profiles/design-heavy.mdc` | Grok in every role. Judgment and prose, architect runners, the arena judge, and interrogate reviewers run at xhigh. Feature work, refactoring, and swarm workers stay at high. Bug-fix and perf stay at xhigh. |

Use `--profile <name>` during init. Cursor loads only `.cursor/rules/pstack-models.mdc`, so the other profiles stay inactive. To add a mix, add one file to `profiles/` with every role line and a `# profile:` line.

## Check whether upstream moved

From the catalog root, run `node --test scripts/*.test.mjs` for tests and `scripts/check-upstream` to inspect upstream changes.

The command reads `sources.json`. It prints one line per source. The line is the source name, the pinned commit, the default-branch tip, and a status word. The status word is last.

`skip` means the tip equals the pin, or the tip moved and no mapped path changed. `take` means a mapped path changed and each changed path still matches the pin in the work tree. `review` means a mapped path changed and at least one changed path does not match the pin.

The command exits 0 when every line says `skip`. It exits 1 when any line says `take` or `review`. It exits 2 when it cannot read `sources.json` or a remote, and it prints no status line.

To refresh a source, edit its commit in `sources.json`. Copy the mapped paths from that commit into the tree. Reapply the edits listed under Changes to upstream text. Update `NOTICE`. This command does not write the tree.

## Skill discovery

[Cursor's skills documentation](https://cursor.com/docs/skills#frontmatter-fields) requires a matching folder/name and a description. `disable-model-invocation: true` hides a skill from automatic selection, including selection by another skill. The catalog omits that flag; manual `/skill-name` invocation still works. No skill-count cap is documented there. Leave `paths` unset for these repo-wide skills.

Cursor treats nested [`AGENTS.md` files as rules](https://cursor.com/docs/rules#nested-agentsmd-support). The complete Vercel React guide is preserved byte for byte as `vercel-react-best-practices/REFERENCE.md`, linked from its `SKILL.md`, so it is read when needed instead of injected as directory instructions.

Check the installed metadata with `node --test scripts/init.test.mjs`. For a real first-session check, authenticate with [`cursor-agent login`](https://cursor.com/docs/cli/reference/authentication) or supply `CURSOR_API_KEY`, then run `cursor-agent -p --trust --force --output-format stream-json` in a newly initialized consumer and ask it to report its initial skill catalog before reading files. File checks establish the shipped metadata; only a logged-in CLI or Cloud Agent run establishes runtime discovery.

## Changes to upstream text

Upstream files are vendored byte for byte except these:

- Skill frontmatter omits `disable-model-invocation: true` across the catalog so all skills can be discovered automatically.
- `vercel-react-best-practices/AGENTS.md` is renamed `REFERENCE.md` without content changes; its skill and contributor README link to the new name. The longer file mapping in `sources.json` preserves the rename; reapply the SKILL/README link edits after upstream copies.

- `setup-pstack/SKILL.md`. One added sentence. It reads and writes the project `.cursor/rules/pstack-models.mdc` when that file exists.
- `arena/SKILL.md`, `swarm/SKILL.md`, `interrogate/SKILL.md`, `poteto-help/SKILL.md`. One added sentence each. They read the project `.cursor/rules/pstack-models.mdc` when that file exists.
- `show-me-your-work/SKILL.md`, `poteto-mode/playbooks/orchestrate.md`, `poteto-mode/playbooks/eval.md`. Three places that asked for a reviewer or judge on a different model family now name a line in `pstack-models.mdc`.
- `poteto-mode/playbooks/multi-phase-plan.md`. The `check-plan.mjs` path points at `.cursor/skills/poteto-mode/scripts/`.
- `poteto-mode/SKILL.md`. Additions only: routes for the eight new playbooks, one line sending interrogate-trigger matches to `interrogate`, three more items on the Always-pause list (live charges, first live external sends, destructive production migrations), one Non-negotiables bullet that requires `committed-browser-proof` before claiming a browser or UI product done, and one Non-negotiables bullet that sends a product build needing a real backend database, auth, or row-level security to `local-supabase`. Data deletion was already on it. A Non-negotiables bullet sends a product or a large feature to build-auto. Small fixes go direct to their playbooks. build-auto never runs standalone in autonomous flows. The Playbooks list gains a Build auto entry before Feature. The Greenfield bullet covers empty repos and a from-scratch rebuild of an old repo. For empty repos, the playbook runs prd per feature and spec first, then the scaffold steps and build-auto. A product or a large feature invokes build-auto.
- `spec-driven-development/SKILL.md`, `incremental-implementation/SKILL.md`, and `doubt-driven-development/SKILL.md`. `spec-driven-development` points its implement step at `../incremental-implementation/SKILL.md` and `../tdd/SKILL.md`, and it no longer names `context-engineering`. The incremental verify sentence names pstack tdd at `../tdd/SKILL.md` when the task asked for a failing test. `doubt-driven-development` links `tdd` and `systematic-debugging`.
- Eight trees are omitted. They are `ketchup-video`, `make-bot-ui`, `bro`, `what-did-i-get-done`, `weekly-review`, `workflow-from-chats`, `pr-review-canvas`, and `setup-benny`. A later directory copy must delete them again.
- `ketchup/SKILL.md` and `poteto-help/SKILL.md`. The ketchup voice sentence uses plain words, short sentences, and no jargon. The poteto-help table drops the ketchup-video, bro, and make-bot-ui rows. `poteto-help/references/recipes.md` drops the `/bro` line. The planning sentence says a product or a large feature runs build-auto, which plans with planning-and-task-breakdown.

Step 3 of `poteto-mode/playbooks/greenfield.md`, an original playbook, gained two sentences. A browser or UI surface also satisfies `committed-browser-proof`. A product that needs a real backend database, auth, or row-level security follows `local-supabase`. On frontend or UI work the playbook loads `frontend-ui-engineering` and `vercel-react-best-practices`. On performance work it loads `performance-optimization`. For browser checks it loads `browser-testing-with-devtools`. On Supabase or Postgres work it loads `supabase` and `supabase-postgres-best-practices`. A from-scratch rebuild runs legacy-critique, then merge-reviews until `docs/decisions/open/` is empty or the human decides, then prd once per feature, then build-auto.

## Thanks

- [Lauren Tan](https://github.com/cursor/plugins/tree/main/pstack) wrote pstack in cursor/plugins.
- [Cursor](https://github.com/cursor/plugins/tree/main/cursor-team-kit) wrote cursor-team-kit in cursor/plugins.
- [Jesse Vincent](https://github.com/obra/superpowers) wrote superpowers.
- [Matt Pocock](https://github.com/mattpocock/skills) wrote mattpocock/skills.
- [Addy Osmani](https://github.com/addyosmani/agent-skills) wrote addyosmani/agent-skills.
- [Vercel Labs](https://github.com/vercel-labs/agent-skills) wrote vercel-labs/agent-skills.
- [Supabase](https://github.com/supabase/agent-skills) wrote supabase/agent-skills.

The license for each project above is in `NOTICE`.

## License

Original work is MIT, see `LICENSE`. Vendored work keeps its own MIT license, see `NOTICE`.
