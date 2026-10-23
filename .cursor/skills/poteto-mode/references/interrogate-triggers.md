# Interrogate triggers

Run the **interrogate** skill before implementation when the slice touches any item below. Reviewers come from the `interrogate reviewers` line in `pstack-models.mdc`.

- **Money.** Charges, refunds, payouts, credits, balances, or the events that move them.
- **Login and access.** Sign-in, sessions, tokens, permissions, or secrets.
- **Database and schema.** Schema changes, migrations, or backfills.
- **Data deletion.** Any delete or destructive rewrite of user data.
- **External side effects.** Email, messages, webhooks, or any write to a third party.
- **Retries and concurrency.** Idempotency, races, queues, or retry loops.
- **Public APIs.** A public interface, or a contract another caller already uses.
- **Privacy.** Personal data, untrusted input, or what gets logged and retained.
- **Hard-to-reverse design.** An architecture or data-shape choice that is costly to undo.
- **Uncertainty or disagreement.** Anything you flag as uncertain, design sketches that disagree, or a judge with low confidence.
