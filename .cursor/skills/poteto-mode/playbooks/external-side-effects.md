### External side effects

**You own what leaves the system. Nothing reaches a real person or a real account until a dry run and a sandbox run have shown exactly what it will do.**

1. List each side effect: email, SMS, outbound webhooks, writes to a third-party API, charges, refunds, and posts. For each, name who receives it and whether it can be undone.
2. Put each provider behind one adapter with three modes. `dry-run` logs the request it would send and sends nothing. `sandbox` uses the provider's test mode. `live` is real. An env var picks the mode, and anything other than production defaults to `dry-run`.
3. Use the provider's sandbox. Lemon Squeezy test mode for payments, the email provider's test addresses or a test domain, and an allowlist of recipients outside production. Never use real customer addresses in development.
4. Record what was sent in an outbox table before or as it is sent, and pass an idempotency key when the API accepts one, so a retry does not send twice. See `retries-concurrency-idempotency.md`.
5. Set a timeout on every call. Do not make a user's request wait on a slow third party. Queue the work and show the user the pending state.
6. The first live send to real customers is an Always-pause item. Show the operator a rendered sample and the recipient count, and wait for a yes.
7. Prove it in `dry-run`, then in `sandbox`, and keep the request and response as evidence.

**Reply:** the side effects and their modes, the sandbox evidence, and what still needs the operator before going live.
