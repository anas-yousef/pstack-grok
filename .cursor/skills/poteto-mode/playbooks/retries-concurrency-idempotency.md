### Retries, concurrency, and idempotency

**You own the invariant. Two copies of the same request, a crash halfway through, or a retry storm all end in the same state.**

1. Name the actors that can write the same thing: concurrent requests, a double-clicked button, background jobs, cron, webhooks, and a second instance of the app. Name the shared state and the invariant it must keep.
2. Remove the sharing first, per **principle-separate-before-serializing-shared-state**. When sharing is real, enforce the invariant in the database. Use a unique constraint, a conditional update (`UPDATE ... WHERE version = $n`), a short transaction, or one queue with a single consumer. A read-then-write check in application code is a race.
3. Make every retried handler idempotent, per **principle-make-operations-idempotent**. Webhooks, jobs, and POSTs from flaky clients take an idempotency key, store the result under a unique index, and return the stored result on a repeat.
4. Retry only what is safe to retry. Retry timeouts, 429s, and 5xx responses with exponential backoff and jitter, a capped attempt count, and an overall deadline. Never retry a non-idempotent call without a key. After the cap, move the work to a dead-letter record and alert, per `observability.md`.
5. Put a timeout on every network call and every lock.
6. Give scheduled jobs a lease or lock so two instances do not run the same job, and make the job resumable.
7. Prove it. A test fires the same request or event N times in parallel and asserts one effect. Another kills the work halfway and re-runs it, then asserts the end state. When tests cannot reach the interleaving that breaks it, run **create-formal-verification-skill**.

**Reply:** the actors, the invariant, how the database enforces it, and the concurrency test output.
