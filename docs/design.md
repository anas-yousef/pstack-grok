# Grok-only pstack

This repo is the copy of pstack a Cursor project can install and trust. Fork id `pstack-grok-v0.15.29-1`. Every reviewer role is Grok. poteto-mode stays the only entry.

The study below was written before any skill text changed. The tree at that point is the attached export, pstack 0.15.28, commit `ddf824aff1e55ba14bd666b30bce3fc69962abe6`, laid out under `.cursor/` the way the tarball lays it out.

## Done

A later run can fail these checks.

1. This file exists, and the commit that adds it does not change skill behavior.
2. `scripts/install` copies the setup into an empty directory, and that copy contains `show-me-your-work/scripts/log.sh`, `show-me-your-work/references/decision-log-template.tsv`, `deslop`, `control-ui`, `control-cli`, and a `pstack-models.mdc` with the four new role lines.
3. `scripts/check-grok` exits 0.
4. `scripts/check-upstream` prints a report, exits 0, and does not push.
5. The hand-back names what was kept or dropped from each source, the open risks, and which reviews actually ran, on which model.

## How pstack is built

pstack 0.15.29 lives at `https://github.com/cursor/plugins` commit `190d28736eff128ec94f502a22c7fe0c4b56cd37`, path `pstack`. That commit is also the plugin cache id on this machine, and the cache tree matches the GitHub tree. `plugin.json` says version 0.15.29. License MIT, copyright Lauren Tan, 2026.

### poteto-mode is the router

`skills/poteto-mode/SKILL.md` is the entry a person invokes with `/poteto-mode`. It does not do the task itself. It forces a principle read, picks one playbook, and sets the subagent rules every playbook inherits.

The non-negotiables send work to other skills.

- A subsystem question goes to `how`. A motivation question goes to `why`.
- Code that crosses a function boundary goes to `architect`.
- Parallel coverage goes to `swarm`. A bakeoff with a base and grafts goes to `arena`.
- A contested design goes to `interrogate`.
- Prose goes through `unslop`. Docs go through `technical-writing`.
- Before a commit, `deslop` from cursor-team-kit. Before review, `no-comments`.
- UI and CLI checks go to `control-ui` and `control-cli`.
- A long or unattended run keeps a decision trail with `show-me-your-work`.

Playbooks live in `skills/poteto-mode/playbooks/`. The router copies that playbook's steps into a todo list before any task-specific item. A skipped step stays in the list as `skip: <reason>`. Feature is the narrow path for new behavior. figure-it-out designs a one-off playbook when no bundled one fits, or when the change is large enough that a person will review it later. Orchestrate is the standing multi-day program, and this repo is not that.

There is no greenfield playbook. The only greenfield sentence in 0.15.29 is `architect` allowing Phase A to be skipped when the repo is empty. The Rind run therefore took Feature, skipped `how` as greenfield, and never opened figure-it-out. That is the gap this fork closes, inside poteto-mode.

### architect and arena

`architect` sketches types and module shape before code. Phase A grounds in the existing system. Phase B runs `arena` with at least two candidates, a red-flag pass, a cross-judge, and a pick plus grafts. Phase C agrees, and the default is to proceed without a human checkpoint. Phase D implements. Phase E scraps the sketch only when implementation keeps hitting a wall the sketch cannot absorb.

`arena` spawns N candidates, picks a base, and grafts from the losers. Upstream defaults the runners and the cross-judge to `claude-opus-5-5-xhigh` and `grok-4.7-xhigh-fast`, and tells the judge to prefer a different model family from the parent.

### interrogate, reflect, show-me-your-work

`interrogate` sends the diff to several reviewers on independent angles. Upstream reviewer A is `claude-opus-5-5-xhigh`, and a rejected slug falls back along a `claude-*` or `grok-*` family prefix.

`reflect` reviews the workflow after a run. Upstream judgment, divergent, and synthesizer default to `claude-opus-5-5-xhigh`.

`show-me-your-work` keeps one TSV decision log. Upstream ships `scripts/log.sh` and `references/decision-log-template.tsv`. The attached 0.15.28 export dropped both, because its manifest listed markdown only. The skill's hand-back rule is the sentence that forced the Rind trail review onto Claude. It says to spawn a subagent on a different model family, and it has no fallback when that spawn fails. The Attention line still wants `reviewed by <model>`, which the Rind run printed for a review that never returned.

### Model roles

Role lines live in `.cursor/rules/pstack-models.mdc`. A line overrides the skill default. The attached export already sets every listed role to a Grok slug. It has no line for the trail reviewer, verification, the eval judge, or the orchestrate verifier. Upstream `setup-pstack` still writes Claude slugs for judgment, the hardest tasks, the how explainer, the why synthesizer, reflect, and the mixed arena, architect, and interrogate panels.

`playbooks/eval.md` asks for candidates on different models and a judge on a different model family. `playbooks/orchestrate.md` asks for a verifier on a different model family from its worker. `poteto-mode` says a second opinion is the same prompt against a different model, and its prose default is `claude-opus-5-5-xhigh`.

The `.claude/pstack-models.md` file in the attached export is not part of upstream 0.15.29. It assigns Sonnet, Opus, and Haiku. This fork does not ship it.

### Principles

The Principles section of poteto-mode is an index. Each entry is a leaf skill, `principle-<title>`, and a citation counts only after that leaf is read. The groups are Core, Architecture, Verification, Delegation, and Meta. The ones this fork's own scripts exist to satisfy are `principle-build-the-lever` (the checks are the tool), `principle-encode-lessons-in-structure` (the Grok rule is a script, not only a sentence), `principle-model-the-domain` (a vendored file is one record), and `principle-prove-it-works` (the done predicate is executed).

## What 0.15.29 adds to the attached export

101 skill and agent files are byte-identical. 12 differ. 23 files are new, and they are the scripts and the decision-log template.

Changed against the export:

- `skills/architect/SKILL.md`
- `skills/arena/SKILL.md`
- `skills/how/SKILL.md`
- `skills/interrogate/SKILL.md`
- `skills/poteto-help/SKILL.md`
- `skills/poteto-help/references/recipes.md`
- `skills/poteto-mode/SKILL.md`
- `skills/reflect/SKILL.md`
- `skills/sharpen/SKILL.md` (rewritten as "Make a task deeper, not bigger")
- `skills/swarm/SKILL.md`
- `skills/why/SKILL.md`
- `agents/poteto-agent.md`

`setup-pstack/SKILL.md` matches the export and still contains the Claude default table. `show-me-your-work/SKILL.md` matches too, including the cross-family sentence.

The export also lacks the plugin files around the skills. Upstream has `plugin.json`, `LICENSE`, `README.md`, `docs/guide/`, `docs/harness/claude-code.md`, `assets/logo.png`, `automations/benny/`, and `.cursor-plugin/plugin.json`. Those come along. The guide and the Claude Code adapter name Opus and a different model family, so they are patched until `check-grok` is clean. The adapter patch says this fork does not select Claude, GPT, or Gemini models.

## cursor-team-kit

Same plugins commit, path `cursor-team-kit`, version 1.2.0, MIT, copyright Cursor, 2026. No non-Grok model slug in the tree. The whole kit is vendored. poteto-mode already names three of its skills and currently cannot find them.

| Skill | What it does | How poteto-mode reaches it |
|---|---|---|
| deslop | Strips AI slop from the diff before commit | Already required before commit |
| control-ui | Drives a local browser to verify UI | Already required for UI |
| control-cli | Drives a local CLI or TUI | Already required for CLI |
| verify-this | Restates a claim, compares baseline and treatment, returns VERIFIED, NOT VERIFIED, or INCONCLUSIVE | Greenfield verify step, and the prove-it-works non-negotiable |
| run-smoke-tests | Runs the project's smoke tests | By name, after a scaffold has some |
| check-compiler-errors, fix-ci, loop-on-ci, fix-merge-conflicts, get-pr-comments | Compiler and CI repair | The Babysit playbook points at them |
| review-and-ship, make-pr-easy-to-review, new-branch-and-pr, pr-review-canvas | PR packaging | Opening a PR stays the route. These stay invocable by name |
| thermo-nuclear-code-quality-review | A heavy code-quality pass, plus a matching agent | By name. interrogate stays the adversarial review |
| weekly-review, what-did-i-get-done, workflow-from-chats | Status summaries | By name, when the person asks |

Also vendored, unchanged. Agents `ci-watcher` and `thermo-nuclear-code-quality-review`. Rules `no-inline-imports.mdc` and `typescript-exhaustive-switch.mdc`, both `alwaysApply`. A project that copies `.cursor/` gets those two TypeScript rules.

## mattpocock/skills and obra/superpowers

mattpocock/skills at `5beb35b040e3de97e54fa9e386d7e42d15c295c2`. MIT, copyright Matt Pocock, 2026. The README's position is small composable skills, not a process that owns the session.

obra/superpowers at `b739a8af570e10a95898f2bdf6cec97467fa6c12`. MIT, copyright Jesse Vincent, 2025. It is a full methodology. `using-superpowers` says to invoke a skill before any response. That fights poteto-mode as the single entry, so the methodology is not installed. Three procedures that poteto-mode does not already spell out are.

### Kept

| Skill | Source | Why it earns a route |
|---|---|---|
| verification-before-completion | superpowers | The prove-it-works principle says to check the real artifact. This skill is the gate. Name the command, run it, read the output, then claim the result. |
| systematic-debugging | superpowers | Bug-fix already demands runtime evidence. This skill is the four-phase root-cause procedure that bug-fix step 2 was missing on a thin run. The whole skill directory is vendored, including its scripts and the pressure notes. |
| receiving-code-review | superpowers | interrogate produces a review. This skill tells the parent how to take review feedback. Verify the claim, then implement one item at a time. It covers Bugbot comments and human review, which bugbot-triage only starts. |
| domain-modeling | mattpocock | principle-model-the-domain says to encode the domain in code. This skill writes the glossary and ADRs while the words are still moving. Greenfield runs it when terms are fuzzy. It ships unchanged. The call into `codebase-design` is in mattpocock's `tdd` skill, which this fork does not vendor. |
| writing-for-agents | mattpocock | technical-writing is for human docs. unslop deletes tells. This skill is about documents an agent consumes. Context pointers, steps versus reference, completion criteria. The authoring-a-skill playbook reads it beside create-skill. Its mention of `CLAUDE.md` is a filename, not a model slug. |
| wizard | mattpocock | For a click only a human can do in a third-party dashboard. Greenfield names it there and nowhere else, so an auth provider's setup screen does not become a reason to stall the rest of the build. |

### Dropped from superpowers

| Skill | Why it stays out |
|---|---|
| using-superpowers | A second entry point that fires before any reply. |
| brainstorming | Requires a design interview before any creative work. architect and arena already explore the design, and never-block-on-the-human forbids stalling reversible work on that interview. |
| writing-plans, executing-plans | A second planner and a second executor, aimed at `docs/superpowers/plans/`. figure-it-out and the playbooks own that job. |
| subagent-driven-development, dispatching-parallel-agents | A second delegation system. poteto-agent, swarm, and arena already cover it. |
| test-driven-development | Iron law that deletes production code written before a test, for every feature and refactor. pstack `tdd` is opt-in and skips an expensive harness. Both installed, the stricter description wins by accident. pstack `tdd` stays the routed skill. |
| using-git-worktrees | poteto-mode already ships `worktree-audit.sh` and the worktree-cleanup playbook. |
| writing-skills | The authoring-a-skill playbook plus writing-for-agents cover skill writing. |
| requesting-code-review | A third review dispatcher. The hostile Grok reviewer rule covers a fresh-context review. |
| finishing-a-development-branch | Overlaps Shipping and Opening a PR, and assumes the superpowers branch ritual. |
| diagnosing-superpowers | Useful only after adopting the superpowers session model. |

### Dropped from mattpocock

| Skill | Why it stays out |
|---|---|
| tdd | Same skill name as pstack `tdd`, and a third TDD doctrine. |
| teach | Same skill name as pstack `teach`. |
| prototype, diagnosing-bugs, code-review, retro, pr, research, handoff | Playbooks or skills already on those jobs. prototype, bug-fix, interrogate, reflect, opening-a-pr, how, why, session-pickup. |
| grilling, grill-me, grill-with-docs | A live interview. An unattended run has no one to grill. sharpen is the non-blocking version of "make this deeper". |
| codebase-design, improve-codebase-architecture | codebase-design tells the agent to avoid the word "boundary". principle-boundary-discipline is named for that word. Two vocabularies in one setup. improve-codebase-architecture also ends in a grill. |
| to-spec, to-tickets, implement, implement-spec, triage, wayfinder, setup-matt-pocock-skills | They require that repo's issue-tracker setup. This fork must work in a repo that has no tracker. |
| ask-matt | A persona, not a procedure. |
| git-guardrails-claude-code | Claude Code hooks. Wrong harness, and the name is a non-Grok slug. |
| setup-pre-commit, migrate-to-shoehorn, scaffold-exercises | Repo-specific chores, not product construction. |
| writing-beats, writing-fragments, writing-shape, wait-what, to-questionnaire | Prose and conversation tools. technical-writing and unslop stay. |
| in-progress/* | The upstream README marks them unfinished. chief-of-staff would be a second orchestrator. |

## Routing

poteto-mode stays the only command. A `/greenfield` command would either skip the principle list, the subagent rules, and the reply rules, or copy them and drift. The Rind miss was a missing playbook inside the mode.

Changes inside poteto-mode.

- The playbook list gains Greenfield, file `playbooks/greenfield.md`. An empty repo or a new product routes there, including when Feature would otherwise fit.
- The todo rule gains a hard stop. If TodoWrite returns `success: false`, the run stops and reports the tool error. It does not continue on a list that never saved.
- Money or auth routes to interrogate before implementation, in Greenfield and as a non-negotiable so a Feature on an existing payments app hits the same gate. Money means charges, refunds, payouts, credits, and webhooks that move them. Auth means login, sessions, tokens, and permissions.
- The prove-it-works non-negotiable points at `verification-before-completion` and `verify-this`.
- Bug-fix step 2 points at `systematic-debugging`.
- The Bugbot non-negotiable points at `receiving-code-review`.
- Authoring a skill points at `writing-for-agents`.
- Babysit points at the cursor-team-kit CI skills.
- The Subagents section gains the reviewer contract and the fallback, and show-me-your-work, interrogate, reflect, arena, and swarm reference it instead of restating it.

### Greenfield steps

The playbook file will contain these steps.

1. Open the todo list with these steps copied verbatim. If TodoWrite returns `success: false`, stop and report the tool error. Do not continue.
2. Name the domain before code, per principle-model-the-domain. When the nouns are still fuzzy, run domain-modeling and write the glossary and ADRs it asks for.
3. Run interrogate before implementation on any slice that touches money or auth.
4. Boot the smallest scaffold that runs. Then run create-verification-skill once. Later checks use that project skill.
5. Follow the Feature playbook from architect through verify. Skip `how` when there is no subsystem to read, and record `skip: <reason>` on the todo.
6. Before each commit, run deslop and no-comments.
7. Verify with the project verification skill, control-ui or control-cli, and verification-before-completion. A claim without a fresh command output is not done.
8. If a step needs a click only a human can do in a third-party dashboard, run wizard for that step alone.
9. Run the show-me-your-work trail review before any push. Do not push until that review has returned, or until the fallback self-review is in the log and under Attention.
10. Commit in small ordered units. Skip Opening a PR when the user said to commit on the current branch, and record the skip.

## Grok-only contract

Reviewers stay on Grok. Each one is a separate subagent with a fresh context, prompted to find faults, at `grok-4.7-xhigh`. That is the highest Grok effort. Grok has no `max` token. Fast mode stays off for reviewers, because fast is for urgent code, and a review is not that.

Code roles stay on `grok-4.7-xhigh-fast`, matching the attached export. Reviewer and judge lines move to `grok-4.7-xhigh` without `-fast`.

New lines:

```
show-me-your-work trail reviewer: grok-4.7-xhigh
verification: grok-4.7-xhigh-fast
eval judge: grok-4.7-xhigh
orchestrate verifier: grok-4.7-xhigh
computerUse: grok-4.7-xhigh
```

`verification` keeps `-fast` because poteto-mode already pins verification speed to the swarm worker, and the audit names that slug. `computerUse` is new. The Rind browser subagent ran on `claude-4.5-sonnet` with no role line. The line tells the parent which slug to pass. Whether the platform honors a model on that subagent type is an open risk, recorded below.

Skill defaults that today name `claude-opus-5-5-xhigh` are rewritten to the Grok slug of that role, so a missing rule file cannot fall back to Claude. The cross-family sentences in show-me-your-work, arena, poteto-mode, eval, and orchestrate are deleted. show-me-your-work instead spawns the trail reviewer line, before the push when the run will push.

Fallback, one paragraph in poteto-mode, referenced by the reviewer skills.

If a reviewer or judge spawn errors, retry once on that role's Grok slug. If the retry also fails, run the review inline, label it `self-review`, include the verbatim error, and flag it under Attention. Never report a reviewer model that did not run. Never skip the gate in silence.

`scripts/check-grok` fails the process when a tracked or working file matches any of these, case insensitive.

- `claude-` followed by a model token
- the words opus, sonnet, haiku, fable
- `gpt-`
- the word gemini
- `composer-`
- `different family`, including the plural
- `different model family`, including the plural
- `a different model`
- `different models`
- `model diversity`

`docs/design.md` is the only allowlist entry, in `scripts/grok-allowlist.txt`, because this file quotes the upstream sentences the check exists to ban. A GitHub Actions workflow runs the same script.

The `gpt-4` example in `reflect/references/synthesizer.md` is rewritten to a non-model rename. The `verifier: "opus"` fixture in `poteto-mode/scripts/orch/orch.test.ts` becomes `grok-4.7-xhigh`. Both are local patches.

## Manifest and check-upstream

`pstack-source.json` at the repo root is the record. One source entry per upstream repo, with `upstream`, `commit`, `path`, `version` when the upstream publishes one, `license`, and `licenseFile`. `localPatches` is one entry per file we edited, with the reason. `files` is every vendored and local file under the install set, with sha256, source name, and upstream path. A file we created has source `local` and no upstream path.

The file record is the domain object. Unpatched means our bytes equal the blob at the pin. Patched means they do not, which is exactly the `localPatches` list. A new upstream file is neither.

`scripts/check-upstream` does all of the following and then stops.

1. Fetch each source. It does not merge and it does not push.
2. Diff `commit..HEAD` for that source's path.
3. Classify each changed upstream file. Our copy still matches the pin, and the file is not in `localPatches`. That file is unpatched and safe to take. Otherwise it needs a 3-way merge. The script runs `git merge-file` in a temp directory and reports a clean merge or a conflict. It does not write the result back.
4. Flag upstream files that the pin does not have.
5. Run `scripts/check-grok`.
6. Print the report. Version delta, files, classification, conflicts, Grok hits.

## Adoption

Copy. `scripts/install <project-dir>` copies `.cursor/`, `pstack-source.json`, `scripts/check-grok`, `scripts/check-upstream`, `scripts/grok-allowlist.txt`, and `NOTICE` into the project. It overwrites skills and rules this repo ships, and it leaves project files it does not own. It refuses to run if the target is this repo.

Reference. Add this repo as a git submodule and point the project's `.cursor` at the submodule's `.cursor` with a symlink. Updates then come from the submodule commit. A project that already has its own `.cursor` copies only the skill, agent, and rule directories it wants, using the same script with `--skills-only` left out of scope. The README documents the symlink, and the copy script is the supported path when a symlink is awkward.

Update. Run `scripts/check-upstream`. Take unpatched files by replacing our copy with the upstream blob, then rehash the manifest. Patch files wait for a person to finish the 3-way merge. The script never does that write, and it never pushes.

## Work sequence

Each unit ends in a check before the next one starts.

1. Commit the attached 0.15.28 export, unchanged, plus a gitignore for `uploads/` and `.cache/`.
2. Commit this design and the decision log. No skill edits in that commit.
3. Vendor pstack 0.15.29 in full, cursor-team-kit in full, and the kept skills, with the Grok text patches applied. `check-grok` is run by hand against that tree before the following commit adds the script.
4. Add the greenfield playbook and the poteto-mode routes.
5. Add `pstack-source.json`, `scripts/check-grok`, `scripts/check-upstream`, and the workflow. Run both scripts.
6. Add the README, `NOTICE`, and `scripts/install`. Install into a temp directory and confirm the files from the done predicate.

## Open risks

- The platform may ignore the `computerUse` model argument and keep a Claude default for that subagent type. The role line is the part we control.
- `check-upstream` needs network and git history back to the pin. A shallow clone of only HEAD cannot diff an older pin once upstream moves. The script fetches the pin commit explicitly.
- Team-kit's two always-apply TypeScript rules land in every project that copies `.cursor/rules`.
- This file is allowlisted, so a non-Grok slug pasted here does not fail the check. The allowlist is one path, and the check prints it.
