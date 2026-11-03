---
name: ux-critique
description: "Screenshot a browser UI's key flows per locale, have a Claude and a GPT reviewer critique them per persona, write docs/ux-critique/<feature>.md. Use after a UI build or ship (poteto-mode routes here), or on request. Fixes nothing."
---

# UX critique

This pass sits on top of the e2e and integration tests. It does not replace them. Tests prove the UI works. This pass asks whether a person can use it.

The project supplies personas and locales. This skill names none.

## Flows

List 3 to 7 key flows. Give each a start state and a done state. Include at least one flow off the happy path: an error, an empty state, a denied permission, or a recovery. This list is the QA inventory. Every later step uses it.

## Personas

Take personas from the project: `docs/personas/`, or a personas section in `AGENTS.md` or `CLAUDE.md`. When the project has none, use two, one line each: an end user and an operator or staff member.

## Capture

Drive each flow with the repo's own harness, or follow `../control-ui/SKILL.md`. Screenshot every step.

- Capture once per project locale and direction, for example RTL and LTR.
- Capture once more at one narrow mobile viewport.
- Set language and direction through the app's own switch. Do not inject `lang` or `dir` attributes.
- Save desktop captures under `desktop/` and mobile captures under `mobile/`. Name each file `<flow>-<step>-<locale>.png` in both.

## Critique

Spawn two fresh reviewers that did not write the UI: one Claude model and one GPT or Codex model, each passed as a Task `model` slug. Read the `judgment and prose` line in `.cursor/rules/pstack-models.mdc`, then the Task tool's list of valid `model` slugs. Do not hardcode a slug.

- When the seat names a Claude or GPT model, that model is the first reviewer. Take the second from the other family in the Task tool's list.
- When the seat names neither family, take one Claude slug and one GPT slug from the Task tool's list. The report names both models and states that they replaced the `judgment and prose` seat.

Give them the screenshots, the personas, the flows, and `references/checklist.md`. Do not give them the code.

Each reviewer works in two passes:

1. As a senior UI/UX expert, check every screenshot against the checklist: heuristics, accessibility, RTL and LTR, hierarchy, and perceived performance.
2. As each persona in turn, walk each flow and report where that person would hesitate, misread, or give up.

Tag each finding with its checklist item, for example `[N9]`, `[WCAG 1.4.3]`, or `[HIG RTL]`. Label a finding with no tag `opinion`.

When either reviewer cannot run, the review stays open. That covers no valid Claude or GPT slug in the Task tool's list, Task dispatch turned off, an agent limit reached, or a reviewer that fails to run. Record `BLOCKED: independent review` in the todolist, keep every completed report, name each missing reviewer, and keep shipping closed. Your own review does not count.

## Report

Write one markdown file for the human, `docs/ux-critique/<feature>.md`, with the screenshots in `docs/ux-critique/<feature>/desktop/` and `docs/ux-critique/<feature>/mobile/`. For each flow, link its desktop and mobile screenshots, then list each finding with its severity, checklist tag or `opinion`, persona, locale, reviewer, and whether the other reviewer agrees or disagrees. End with the top 5 fixes.

Do not fix anything in this pass.
