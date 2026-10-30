---
name: merge-reviews
description: "Compare claude, codex, and grok reviews. Write an ADR for each agreement and an open file for each conflict."
disable-model-invocation: true
---

# Merge reviews

One agent runs this skill. That agent is the only writer of `docs/decisions/`.

Read every file in `docs/reviews/claude/`, `docs/reviews/codex/`, and `docs/reviews/grok/`. A file under `rounds/` updates the stance for the topic in its name.

A decision has a stable kebab-case topic slug, one stance for each harness that wrote one, and cites in the form `path:line` or `path:start-end`. Only a written stance counts.

The critique file holds the first stance. `docs/reviews/<harness>/rounds/<NNNN>-<topic>.md` replaces that harness's stance when its round number is higher. The file's first heading is `## Round N`. A harness with no later round keeps its earlier stance.

`## Decision` in the open file is the human's decision. Keep that section byte for byte when you rewrite the open file. It closes the topic.

## Outcomes

Follow `../documentation-and-adrs/SKILL.md` for the ADR body. The file name is `docs/decisions/NNNN-<topic>.md`. Numbers use four digits and start at `0001`. Take the next free number from `docs/decisions/*.md` and `docs/decisions/open/*.md` together. Reuse the open file's number when that topic already has an open file. Set a new agreement to Accepted. Include the cites in Context.

- The same stance comes from at least two harnesses, and no harness states another. Write an ADR when none exists for that slug. Delete `docs/decisions/open/NNNN-<topic>.md`.
- An ADR for that slug already matches the stance. Leave the ADR. Delete the open file.
- The agreed stance differs from the ADR. Leave the old ADR. Write a new one that follows documentation-and-adrs and supersedes the old one. Delete the open file.
- Two stances cannot both hold. Write the open file. Leave any ADR.
- `## Decision` is present. Treat the human text as the stance and apply the agreement outcomes.

Name a single-harness claim in the reply and leave the decision files unchanged for that claim.

Deleting the open file is the close. A later run finds no open file and leaves the ADR.

## Open file

Write `docs/decisions/open/NNNN-<topic>.md` in this shape.

```markdown
# <question, one sentence>

## claude

<position and cites>

## codex

<position and cites>

## grok

<position and cites>

## Existing ADR

<docs/decisions/NNNN-<topic>.md>

## Round N claude

<copy of that round file>

## Decision

<human text>
```

Omit a harness heading when that harness has no stance. Omit Existing ADR when no ADR exists. Write Decision back only when that section was already in the file. Order round headings by N, then claude, codex, grok. One heading per harness per round.

## Add a round

A harness writes `docs/reviews/<harness>/rounds/<NNNN>-<topic>.md` and no other file. `<NNNN>` is the open file's number. The first heading is `## Round N`. N is one greater than that harness's highest round for this topic. The body is the new position and its cites.

## Reply

Ask the human one question for each file left in `docs/decisions/open/`. State the question, then one sentence for each harness's latest stance.

Done when every agreement has one current ADR, every conflict has one open file, every closed open file is gone, and the reply lists the remaining questions plus any single-harness claims.
