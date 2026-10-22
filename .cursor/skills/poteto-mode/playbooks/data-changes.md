### Data changes

**You own the data. Every schema change ships in phases the running code survives, and nothing is dropped or deleted without a way back.**

1. Classify the change: additive, destructive (drop, rename, narrowing type, new required field), a rewrite of stored values, or deletion of user data. Anything but additive matches `../references/interrogate-triggers.md`.
2. Expand, then contract. Add the new shape beside the old, backfill, switch reads and writes, and drop the old shape in a later release once nothing uses it. A rename is add, copy, switch, drop.
3. Write every backfill, repair, or deletion as an idempotent, resumable script with a dry-run that prints the counts it would change, per **principle-make-operations-idempotent**.
4. Make each step reversible, or record why it is not and where the restore point is. Confirm a backup exists before anything destructive.
5. Know where user data lives (every store, log, and third party) before deleting it, and delete it from all of them. Keep only what the applicable law requires.
6. Rehearse on a copy with realistic data, then run the tests against the changed schema.
7. Destructive production changes and data deletion are Always-pause items. Show the operator the dry-run counts.

**Reply:** the phases and which shipped, dry-run and actual counts, and the way back for each step.
