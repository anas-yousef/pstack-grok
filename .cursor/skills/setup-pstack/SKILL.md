---
name: setup-pstack
description: Configure which Grok models pstack uses per role and at what reasoning budget. Detects your available Grok models and writes the project's always-applied rule that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Write the project rule `.cursor/rules/pstack-models.mdc`, an always-applied rule that sets pstack's model per role. Every real slug in it starts with `grok-`. `scripts/check-grok` fails on any other value except `blocked`.

This fork assumes the parent chat runs on Grok. Read **The parent chat is Grok** in the **poteto-mode** skill before offering an alias.

## Steps

### 1. Detect available models

Enumerate the model slugs you can pass to a `Task` subagent in this session. That is the dependable source. If Cursor also exposes a models API or CLI that lists the user's entitled models, prefer it for completeness. If you cannot detect any, ask the user to paste the slugs they have access to. Never write a real slug you have not confirmed is available. Keep only slugs that start with `grok-`. Drop every other detected slug from the choices, and say how many you dropped. `blocked` is always valid in the project rule and means do not spawn that subagent. computerUse stays `blocked`. Do not rewrite it to a slug.

The aliases `inherit-parent`, `auto`, and `unpinned` stay supported by every role reader. Each one omits `model`, so the role runs on the parent chat model. They are not valid in the project rule, because `scripts/check-grok` cannot see the parent model and rejects them there. A user who wants an alias puts that one line in a personal `~/.cursor/rules/pstack-models.mdc`, and only while their Cursor chat runs on Grok.

### 2. Load current state

The default role-to-model mapping is the rule shape shown in step 5 below. If `.cursor/rules/pstack-models.mdc` already exists, read it and treat its `# budget` line and its role values as the current choices. Otherwise start from those defaults. Also read `~/.cursor/rules/pstack-models.mdc` if it exists. Both rules load in every chat and nothing says which wins. List each home line that differs from the project rule or is not Grok, and tell the user to delete those home lines. Do not edit the home file yourself. A line whose role is not in step 5, such as `how critics`, is from a retired role. Drop it.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Prefer AskQuestion over free text. Offer these four options with these exact labels, and name the current budget when the rule records one. With no rule, say that `large` matches the skill defaults.

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) Apply it.** Build the working table from the skill defaults, and on a re-run keep any role you changed by slug, list, or `blocked`. `unlimited`, `large`, `medium`, and `small` set the effort token of every real slug, panel entries included, to `max`, `xhigh`, `high`, or `medium`. The effort token is the last token, or the one before a trailing `fast`, on the ladder `max` > `xhigh` > `high` > `medium` > `low`. If the result is not a detected slug, use the detected Grok slug with the highest effort at or below the target, else mark the role as needing a choice. `blocked` does not change. Reviewer and judge roles stay on `grok-4.7-xhigh` under every budget, per **Match the model to the job** in the **poteto-mode** skill. Grok slugs top out at `xhigh`, so `unlimited` keeps `grok-4.7-xhigh` and `grok-4.7-xhigh-fast`. `large` keeps the defaults. `small` turns code roles on `grok-4.7-xhigh-fast` into `grok-4.7-medium-fast`.

**(c) Show the roles and confirm.** Show every role with its model, marking any real slug not in the detected set as needing a choice. Also list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering the detected Grok models plus `blocked`. `blocked` means do not spawn that subagent. Do not offer to replace `blocked` with a slug. Prefer AskQuestion over free text. For panel roles (arena runners, architect runners, interrogate reviewers) the value is a list. For interrogate reviewers one subagent runs per entry, so the list length sets the count. For arena and architect runners the list is the model pool, and those skills always spawn at least two runners, cycling through the entries. `arena cross-judge pool` is also a list, but Arena selects one Grok slug from it. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real slug written must start with `grok-` and be in the detected set. `blocked` always passes. If a chosen slug is not available or is not Grok, stop and ask again. Leave `blocked` as `blocked`. After writing, run `python3 scripts/check-grok` (`scripts/pstack-grok/check-grok` in an installed project) and fix any model problem it prints.

### 5. Write the rule

Write `.cursor/rules/pstack-models.mdc` with `alwaysApply: true`, a `# budget` line with the chosen label and its target effort, and one line per role, using the same labels poteto-mode uses. Overwrite the whole file so re-runs stay idempotent. Shape:

```
---
description: pstack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# Every value is a grok-* slug or `blocked`. scripts/check-grok fails on anything else.
# This fork assumes the parent chat runs on Grok. `inherit-parent`, `auto`, and `unpinned` run a role on the parent chat model, so they are not allowed in this project rule. Put one in a personal ~/.cursor/rules/pstack-models.mdc only while Cursor runs on Grok.
# Code roles run on -fast by choice. Reviewer and judge roles run on grok-4.7-xhigh, and are never lowered or switched to -fast.
# interrogate runs one reviewer per entry. arena and architect treat their list as a model pool and always spawn at least two runners.
# computerUse is blocked. Do not rewrite `blocked` to a slug. Locally the subagentStart hook denies it. In a Cursor cloud agent the hook does not fire, and Cursor's helper runs the server-pinned model in scripts/grok-exceptions.json. That helper is the one allowed, logged, paid exception. Browser checks use control-ui on Grok.
# budget: large (xhigh)
feature, refactoring: grok-4.7-xhigh-fast
bug-fix: grok-4.7-xhigh-fast
perf-issue: grok-4.7-xhigh-fast
hillclimb: grok-4.7-xhigh-fast
judgment and prose: grok-4.7-xhigh
hardest tasks: grok-4.7-xhigh-fast
how explorer: grok-4.7-xhigh-fast
how explainer: grok-4.7-xhigh
why investigators: grok-4.7-xhigh-fast
why synthesizer: grok-4.7-xhigh
reflect tooling: grok-4.7-xhigh
reflect judgment, divergent, synthesizer: grok-4.7-xhigh
arena runners: grok-4.7-xhigh-fast
arena cross-judge pool: grok-4.7-xhigh
swarm workers: grok-4.7-xhigh-fast
architect runners: grok-4.7-xhigh-fast
interrogate reviewers: grok-4.7-xhigh
show-me-your-work trail reviewer: grok-4.7-xhigh
verification: grok-4.7-xhigh-fast
eval judge: grok-4.7-xhigh
orchestrate verifier: grok-4.7-xhigh
computerUse: blocked
```

### 6. Confirm

Tell the user the rule was written and that it applies to new sessions. Re-running this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill` (resolves wherever pstack is installed: workspace, user, or plugin). On no, move on without pushing.

### 8. Offer a formal verification skill (optional)

Check whether the project already has a formal verification skill (a project skill that runs a model checker, a proof, or another verifier against the code). If not, offer once: "want a formal verification skill, so agents can prove a key property of your code holds in every case in scope, not only the cases tests reach? I can generate one with /create-formal-verification-skill." On yes, invoke `/create-formal-verification-skill` (resolves wherever pstack is installed: workspace, user, or plugin). On no, move on without pushing.
