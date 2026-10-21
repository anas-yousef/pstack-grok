# Interrogate triggers

This file is the only copy of the trigger list. poteto-mode and the playbooks link here. They do not restate the list.

Run interrogate before implementation when the slice matches any item. The reviewers stay on the `interrogate reviewers` line. They are hostile Grok reviewers under the reviewer contract in poteto-mode.

- Money. Charges, refunds, payouts, credits, balances, or webhooks that move them.
- Auth. Login, sessions, tokens, permissions, row-level security, or secrets.
- Data model. Schema, migrations, or any delete or rewrite of user data.
- External side effects. Email, webhooks, or a write to a third party.
- Concurrency. Idempotency, races, or retries.
- Contract. A public API or any change to a contract another caller already uses.
- Security and privacy. Untrusted input, access control, or PII.
- Reversal cost. An architecture choice that is costly to undo.
- Disagreement. Design sketches that disagree, or a judge whose confidence is low.
- Uncertainty. Anything the agent itself flags as uncertain.
