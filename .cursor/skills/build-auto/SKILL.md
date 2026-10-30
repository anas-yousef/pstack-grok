---
name: build-auto
description: "Poteto-mode runs a product or large feature from spec through one commit per task, then hands back for review and ship."
disable-model-invocation: true
---

# Build auto

Poteto-mode is the only entry. An autonomous flow opens this skill only from the poteto-mode playbook list. If this chat did not arrive from that list, return to poteto-mode and stop.

The run state is derived. The spec is the first file that covers the goal among `SPEC.md`, `docs/SPEC.md`, and `spec/*.md`. This loop writes `SPEC.md` at the repo root when none of those covers the goal. `tasks/todo.md` is the task list. A task is a heading `## Task N: title` in that file. A done task is a commit whose subject is `Task N: title`. Do not write a second status file.

## Spec

Follow spec-driven-development. Cover objective, users, features, stack, and boundaries. When a spec file already covers the goal, keep it.

When the run is autonomous, accept the written spec. When a person is in the chat, keep the confirm that spec-driven-development already asks for.

Done when a spec file covers the goal.

## Plan

When `tasks/todo.md` is missing, follow planning-and-task-breakdown. Keep the task headings it writes.

When the run is autonomous, approve the plan and continue. When a person is in the chat, ask once. A yes continues. A no sends the plan back through planning-and-task-breakdown, then asks once on the new list.

A plan that already has a task commit stays approved.

Done when `tasks/todo.md` exists and the plan is approved.

## Tasks

Take the next `## Task N: title` heading that has no commit with that subject. Spawn a fresh poteto-agent on the `build-auto implementer` line in `.cursor/rules/pstack-models.mdc`. One task writes the tree. The parent starts the next task only after this one commits.

The implementer follows incremental-implementation and tdd. The task brief is the request for a failing test first, which is the request tdd already allows. An unknown failure follows systematic-debugging.

The task is done when the repo's unit tests and integration tests pass, and the build passes. Run those commands. A missing test command is a blocker, not a pass. A user-visible change is done only when a committed re-runnable browser end-to-end test also passes. `npm run test:e2e` is the usual command. Follow committed-browser-proof. A drive that writes only under `/tmp` does not count.

Commit only after those checks pass. The subject is the task heading without the markdown marks, such as `Task 3: User can send an invoice`. One commit per task. Stage only the files that task touched.

## Stop

Stop only for a real blocker, and return it to poteto-mode. A blocker is a test or build that cannot pass, a decision the spec does not cover, or work on the Always-pause list in poteto-mode. Leave the ship skills unrun.

## Hand back

Hand back to poteto-mode for review and ship. Spawn a fresh poteto-agent on the `build-auto reviewer` line. It follows doubt-driven-development, then verification-before-completion, then documentation-and-adrs, then shipping-and-launch. Leave their text in their own files.

The reply names the spec path, the task commits, and any blocker.
