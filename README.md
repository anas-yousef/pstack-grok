# pstack-grok

A Cursor project setup that teaches agents how to work. It is [pstack](https://github.com/cursor/plugins/tree/main/pstack) as upstream ships it, with every model role on Grok by default, plus a few vendored skills and playbooks. It sets which model fills each role. It does not choose your app's vendors.

## What it combines

- **pstack** from `cursor/plugins`. Skills, agents, and the poteto-mode playbooks.
- **cursor-team-kit** from `cursor/plugins`. CI, PR, review, and control skills.
- **superpowers** from `obra/superpowers`. `verification-before-completion`, `systematic-debugging`, `receiving-code-review`.
- **mattpocock/skills**. `domain-modeling`, `writing-for-agents`, `wizard`.
- **Original work.** A Grok `pstack-models.mdc` with per-role efforts, the `profiles/` model mixes, the `principle-follow-official-docs` skill, the `committed-browser-proof` skill, the `local-supabase` skill, the interrogate trigger list, and eight poteto-mode playbooks: greenfield, DB migration, dependency upgrade, external side effects, security and privacy, observability, deploy and rollback, and incident hotfix.

Everything lives under `.cursor/`, where Cursor loads project skills, agents, and rules. `NOTICE` lists each source and its license. `sources.json` pins the upstream commits.

## Adopt it in a project

A project keeps a committed copy of the catalog and pins the catalog commit it came from. `scripts/sync-pstack` writes that copy. Run it from a checkout of the commit you want to pin:

```sh
git clone https://github.com/anas-yousef/pstack-grok.git /tmp/pstack-grok
git -C /tmp/pstack-grok checkout <sha>
node /tmp/pstack-grok/scripts/sync-pstack --dest <project>
```

The command mirrors `.cursor/skills/`, `.cursor/agents/`, and `.cursor/rules/` into the project. It also copies the license files as `.cursor/pstack-LICENSE`, `.cursor/pstack-NOTICE`, and each vendored source's `LICENSE`. It deletes a mirrored file that the catalog no longer ships. It then writes `.cursor/pstack-source.json` with the commit and the sha256 of every file it wrote. A second run from the same commit writes the same bytes.

The commit is the checkout's `HEAD`. Pass `--commit <sha>` when the checkout has no git history.

The project's `.cursor/pstack-source.json` can set two keys that the command keeps on each run:

```json
{
  "repo": "anas-yousef/pstack-grok",
  "commit": "<sha>",
  "profile": "grok-opus",
  "protect": [
    { "kind": "skill", "root": ".cursor/skills", "prefix": "verify-", "except": "verify-this" },
    { "kind": "prefix", "path": ".cursor/skills/app-skill/" },
    { "kind": "exact", "path": ".cursor/rules/app.mdc" }
  ],
  "files": []
}
```

- `profile` names a model profile. See [Model profiles](#model-profiles). With no `profile`, the project gets the default `grok` file.
- `protect` lists project paths that the command never writes or deletes. `exact` matches one path. `prefix` matches a directory and must end in `/`. `skill` matches each skill directory under `root` whose name starts with `prefix`, except the one named `except`. The rule above keeps a product skill such as `verify-myapp` and still updates the catalog's `verify-this`. A rule may not cover `.cursor/rules/pstack-models.mdc` or the pin file.

Then run `/poteto-mode` in a Cursor chat.

## Change a role's model

Edit one line in `.cursor/rules/pstack-models.mdc`. For example, to run feature work on another model:

```
feature, refactoring: claude-opus-5-5-xhigh
```

The change applies to new chats. Delete a line to fall back to the skill default. `/setup-pstack` also edits this project file when it exists. Its budget question sets one effort for every role, so it replaces the per-role efforts below. In a project that `scripts/sync-pstack` writes, the next sync replaces a hand edit. Pick or add a profile instead.

The slug carries the reasoning effort, as in `grok-4.7-high` or `claude-opus-5-5-xhigh`. Each line sets its own effort, so two roles on the same model can run at different levels. The default file runs every role on Grok at `high`, and at `xhigh` for the roles that hunt an unknown cause, judge, or take the hardest work: `bug-fix`, `perf-issue`, `hardest tasks`, `why synthesizer`, `arena cross-judge pool`, and the first seat of `architect runners` and `interrogate reviewers`. No role uses a `-fast` slug, because fast slugs spend more tokens.

## Model profiles

A profile is a complete `pstack-models.mdc` with a different mix of models and efforts. Its `# profile:` line names it.

| Profile | File | Mix |
| --- | --- | --- |
| `grok` | `.cursor/rules/pstack-models.mdc` | Grok in every role. The default. |
| `grok-opus` | `profiles/grok-opus.mdc` | Grok writes code and runs workers. Opus takes judgment, prose, the hardest tasks, and one seat on each panel. |

To use a profile, set `profile` in the project's `.cursor/pstack-source.json` and run `scripts/sync-pstack`. The command writes the profile's file as `.cursor/rules/pstack-models.mdc`. Cursor loads only that path, so the other profiles stay inactive. An unknown name fails and lists the profiles in `profiles/`.

To try a profile without changing the pin, pass `--profile <name>`. The command writes that profile and leaves the pin's `profile` key as it was. The manifest hashes the file it wrote, so `git diff` shows the switch. Run the command again without the flag to go back. To add a mix, add one file to `profiles/` with every role line and a `# profile:` line.

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
- `poteto-mode/SKILL.md`. Additions only: routes for the eight new playbooks, one line sending interrogate-trigger matches to `interrogate`, three more items on the Always-pause list (live charges, first live external sends, destructive production migrations), one Non-negotiables bullet that requires `committed-browser-proof` before claiming a browser or UI product done, and one Non-negotiables bullet that sends a product build needing a real backend database, auth, or row-level security to `local-supabase`. Data deletion was already on it.

Step 3 of `poteto-mode/playbooks/greenfield.md`, an original playbook, gained two sentences. A browser or UI surface also satisfies `committed-browser-proof`. A product that needs a real backend database, auth, or row-level security follows `local-supabase`.

## License

Original work is MIT, see `LICENSE`. Vendored work keeps its own MIT license, see `NOTICE`.
