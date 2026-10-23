### Observability

**You own the signal. Plan, review, verify.** Logs, metrics, traces, and alerts that let a person see what the system is doing and know when it breaks.

1. Name the question first: what a person needs to answer during an incident, or what decision a number drives. Instrument for that question, not for coverage.
2. `how` over the path you are instrumenting, and find the signals that already exist. Extend those before you add new ones.
3. Log structured events with stable field names, a request or trace id, and an outcome. Log at boundaries and decisions, not every line. Keep secrets and personal data out, per the **Security and privacy** playbook.
4. Add metrics for rate, errors, and duration on each key operation. Keep label values bounded, never a user id or raw input.
5. Write each alert on user impact with a threshold and a window. Name who gets it and the first action they take. An alert nobody acts on is noise. Delete it.
6. Make the signal cheap. Sample high-volume events, and check the cost and retention of what you add.
7. Verify by triggering the condition: force an error or a slow path, and confirm the log, the metric, and the alert all fire with the right fields.
8. Run **Opening a PR**.

**Reply:** the question each signal answers, what you added or removed, the alert thresholds and owners, and proof each one fired.
