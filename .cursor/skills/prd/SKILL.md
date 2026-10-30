---
name: prd
description: "Interview with grill-me, write docs/prd/<feature>.md, then hand off to spec-driven-development."
disable-model-invocation: true
---

# PRD

Follow `../grill-me/SKILL.md`. The frontier covers the users, the problem, the outcomes, the non-goals, the acceptance criteria, and the open questions.

When the user confirms a shared understanding, write `docs/prd/<feature>.md`. `<feature>` is the kebab-case slug the user used for the feature. When they used none, ask once and wait. Use these headings, in this order.

- Users
- Problem
- Outcomes
- Non-goals
- Acceptance criteria
- Open questions

Done when each heading records the confirmed answer. When no open questions remain, say so under Open questions.

When the user still has another feature, stop after this PRD. When this was the last feature, follow `../spec-driven-development/SKILL.md`. Treat every file in `docs/prd/` as the requirements. The spec file is `SPEC.md` at the repo root.

The PRD file is the interview record. Leave issue trackers alone.
