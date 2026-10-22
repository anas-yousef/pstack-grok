### External side effects

**You own every effect that leaves the system. Plan, review, verify.** Payments, email, messages, webhooks, and any write to a third party. Run `interrogate` before implementing, per `references/interrogate-triggers.md`.

1. List every effect the change can trigger, who receives it, and whether it can be undone. Most cannot.
2. Work in the provider's sandbox or test mode first. Never use live keys in development, tests, or an agent session. If no test mode exists, stub the boundary and record the payloads you would send.
3. Make each effect idempotent. Send an idempotency key or check a record before you act, so a retry never double-charges or double-sends, per **principle-make-operations-idempotent**.
4. Handle every response: success, a known failure, a timeout with an unknown outcome, and a duplicate. Make a timeout reconcile against the third party, not retry blindly.
5. Verify inbound webhooks. Check the signature, reject replays, and handle events that arrive late or out of order.
6. Keep secrets out of code, logs, and prompts. Read them from the environment, and redact them in errors.
7. Verify end to end in test mode on the matching surface via the control skill (Non-negotiables). Show the third party's record of the test effect, not only your own logs.
8. A live charge or a first live send is on the Always-pause list. Show the operator the test-mode evidence and wait for a go.
9. Run **Opening a PR**.

**Reply:** each effect, its idempotency guard, how each failure is handled, the test-mode evidence, and what still needs a live go.
