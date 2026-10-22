### Security and privacy

**You own the trust boundary. Plan, review, verify.** Login, permissions, secrets, untrusted input, and personal data. Run `interrogate` before implementing, per `references/interrogate-triggers.md`.

1. Draw the boundary. Name who can call the code, what they control, and what they must never reach. Treat every input that crosses the boundary as hostile.
2. Check access on the server for every request, per **principle-boundary-discipline**. Deny by default. A check that runs only in the client is not a check.
3. Parse and validate input at the boundary. Use parameterized queries and context-aware output encoding. Never build a command, query, or path from raw input.
4. Store no secret in code, config committed to the repo, logs, or prompts. Rotate any secret that leaked, even to a branch.
5. For personal data, collect only what the feature needs. Name where it is stored, who can read it, how long it stays, and how a user's data gets deleted.
6. Keep personal data and secrets out of logs, errors, analytics, and third-party calls. Redact at the source.
7. Write tests that try to break the boundary: another user's resource, a missing or expired session, malformed and oversized input. Each must fail closed.
8. Run `blast-radius` on the change. Then run **Opening a PR**, with the threat summary in the description.

**Reply:** the boundary and threats considered, each control and its test, the personal data touched and its retention, and any risk you accepted.
