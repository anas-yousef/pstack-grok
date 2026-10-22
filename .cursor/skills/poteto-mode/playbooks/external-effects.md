### External effects and payments

**You own what leaves the system. Nothing reaches a real person, account, or card until a dry run and a sandbox run show exactly what it will do.**

1. Read the provider's current docs for its sandbox or test mode, its webhook signing scheme, its retry and ordering behavior, and what its sandbox cannot simulate.
2. Put each provider behind one adapter with dry-run, sandbox, and live modes. The environment picks the mode, and only production is live.
3. Build and test only against the sandbox, with its test accounts and test payment methods. Agents never make a live charge, refund, or send.
4. Verify every inbound webhook with the provider's documented scheme over the raw body before acting on it. Test a valid, a tampered, and a stale or replayed delivery.
5. Make every handler and outbound call idempotent and order-safe. Dedupe on the provider's event id when it has one, otherwise on state. Set state from the latest resource, not from the order events arrive in.
6. Never trust the client for prices or entitlements. Map provider status to access in one tested function.
7. Prove each path in the sandbox end to end, including failure, refund or cancellation, and redelivery. A path the sandbox cannot produce gets a test from a documented payload and goes to the operator as a manual check.
8. The first live send, charge, or refund is an Always-pause item.

**Reply:** each path with its sandbox evidence, the gaps handed to the operator, and the go-live checklist.
