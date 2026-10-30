---
name: legacy-critique
description: "Read-only critique of an old repo. Writes one file under docs/reviews for grok, claude, or codex."
disable-model-invocation: true
---

# Legacy critique

The current repo is the rebuild. The old repo is the path or URL the user gave. Read the old repo and leave every file in it unchanged. The only file you write is `docs/reviews/<harness>/legacy-critique.md` in the current repo.

`<harness>` is the name the user gives. The allowed names are `grok`, `claude`, and `codex`. When the user does not name one, use `grok` on a Grok model, `claude` on a Claude model, and `codex` on a Codex model. When you still cannot tell, ask once and wait.

When the user gives a URL, clone it with `git clone --depth 1` into a temp directory outside both repos and read that clone. Leave the clone uncommitted.

When the old path is the current repo, stop. Tell the user to point at a different old repo.

## Read the code

Follow `../how/SKILL.md` and `../why/SKILL.md`. Put the old repo's absolute path in every question so those skills read that tree.

## Write the critique

Replace the critique file. Use these headings, in this order.

- Domain model
- Data shape
- Boundaries and integrations
- What worked
- Pain points
- Keep, drop, or rework
- Risks

One bullet per claim, under the heading it belongs to. End each bullet with a cite `path:line` or `path:start-end`, relative to the old repo root.

Done when every heading is present and every bullet has a cite.
