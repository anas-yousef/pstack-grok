# pstack-grok

A Cursor project setup that teaches agents how to work. It is [pstack](https://github.com/cursor/plugins/tree/main/pstack) as upstream ships it, with every model role pinned to Grok, plus a few vendored skills and playbooks. It sets which model fills each role. It does not choose your app's vendors.

## What it combines

- **pstack** from `cursor/plugins`. Skills, agents, and the poteto-mode playbooks.
- **cursor-team-kit** from `cursor/plugins`. CI, PR, review, and control skills.
- **superpowers** from `obra/superpowers`. `verification-before-completion`, `systematic-debugging`, `receiving-code-review`.
- **mattpocock/skills**. `domain-modeling`, `writing-for-agents`, `wizard`.
- **Original work.** A Grok-pinned `pstack-models.mdc`, the interrogate trigger list, and eight poteto-mode playbooks: greenfield, DB migration, dependency upgrade, external side effects, security and privacy, observability, deploy and rollback, and incident hotfix.

Everything lives under `.cursor/`, where Cursor loads project skills, agents, and rules. `NOTICE` lists each source and its license. `sources.json` pins the upstream commits.

## Adopt it in a project

**Copy.** Copy this repo's `.cursor/` directory into your project root. If the project already has a `.cursor/`, merge the `skills/`, `agents/`, and `rules/` directories into it.

**Git submodule.** Add the repo as a submodule, then link its `.cursor/` into place:

```sh
git submodule add <repo-url> vendor/pstack-grok
ln -s vendor/pstack-grok/.cursor .cursor
```

Update later with `git submodule update --remote vendor/pstack-grok`. Check that your Cursor version follows the symlink. If it does not, use the copy method.

Then run `/poteto-mode` in a Cursor chat.

## Change a role's model

Edit one line in `.cursor/rules/pstack-models.mdc`. For example, to run feature work on another model:

```
feature, refactoring: claude-opus-5-5-xhigh
```

The change applies to new chats. Delete a line to fall back to the skill default. `/setup-pstack` also edits this project file when it exists.

The defaults are `grok-4.7-xhigh-fast` for code, runner, and worker roles, and `grok-4.7-xhigh` for review, judgment, and prose roles.

## Changes to upstream text

Upstream files are vendored byte for byte except these:

- `setup-pstack/SKILL.md`. One added sentence. It reads and writes the project `.cursor/rules/pstack-models.mdc` when that file exists.
- `arena/SKILL.md`, `swarm/SKILL.md`, `interrogate/SKILL.md`, `poteto-help/SKILL.md`. One added sentence each. They read the project `.cursor/rules/pstack-models.mdc` when that file exists.
- `show-me-your-work/SKILL.md`, `poteto-mode/playbooks/orchestrate.md`, `poteto-mode/playbooks/eval.md`. Four places that asked for a reviewer or judge on a different model family now name a line in `pstack-models.mdc`.
- `poteto-mode/playbooks/multi-phase-plan.md`. The `check-plan.mjs` path points at `.cursor/skills/poteto-mode/scripts/`.
- `poteto-mode/SKILL.md`. Additions only: routes for the eight new playbooks, one line sending interrogate-trigger matches to `interrogate`, and three more items on the Always-pause list (live charges, first live external sends, destructive production migrations). Data deletion was already on it.

## License

Original work is MIT, see `LICENSE`. Vendored work keeps its own MIT license, see `NOTICE`.
