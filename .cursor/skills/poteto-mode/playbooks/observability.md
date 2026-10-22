### Observability

**You own knowing first. A user should never be the one who tells you production is down or a payment failed.**

1. Before launch, each product has four things. Error tracking with the release tagged and source maps uploaded. Structured logs with a request id and no personal data or secrets. An uptime check on a health endpoint that also checks the database. Alerts that reach the owner.
2. Keep alerts few and real: error-rate spike, uptime down, webhook or job failures past the retry cap, and a payment flow that stops completing. Each alert names its step in `docs/runbook.md`.
3. Instrument the money and auth paths. Log each webhook as received, verified, processed, or failed, with its event key. Count checkouts started and completed. Count failed logins.
4. Every background job logs its start, its finish, and its counts. A dead-letter record raises an alert.
5. Keep log and analytics retention inside the windows set in `data-deletion-privacy.md`.
6. Prove each signal. Throw a test error and find it under the right release. Hit the health endpoint. Send a test-mode webhook and find its log line. Trigger one alert and confirm it arrives.

**Reply:** what is instrumented, the alert list, and the evidence that each test signal arrived.
