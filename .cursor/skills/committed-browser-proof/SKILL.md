---
name: committed-browser-proof
description: "Apply before claiming that a browser or UI product is done, and when writing or reviewing create-verification-skill output. Done needs a committed package script that a fresh agent can re-run."
disable-model-invocation: true
---

# Committed browser proof

Apply this before you claim that a browser or UI product is done, and before you claim that a UI slice of that product is done. The same rule covers writing or reviewing the output of **create-verification-skill**.

Commit a package script that a fresh agent can re-run. `npm run test:e2e` with `@playwright/test` is one such script. Use the equivalent that the repo already commits when it has one.

A one-shot drive script may support a single run. If it only writes evidence under `/tmp`, or under another path local to that machine, you still need the committed script before you claim done.

Keep unit tests in their own script. Some products need a host and a guest, or more than one role, in one session. Prefer one flow where those roles share that session's events. Leave a sibling repo's split into separate projects in that sibling repo.
