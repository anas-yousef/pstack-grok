### DB migration

**You own the data. Plan, review, verify.** Delegate the migration code. Stay in the lead. Run `interrogate` before implementing, per `references/interrogate-triggers.md`.

1. `how` over every reader and writer of the affected tables or collections, including jobs, reports, and other services.
2. Write the change as expand, migrate, contract. Expand adds the new shape alongside the old. Migrate moves the data and switches readers and writers. Contract removes the old shape in a later deploy, after nothing reads it. Each phase ships and deploys on its own.
3. Make every step safe to rerun after a crash, per **principle-make-operations-idempotent**. Batch large backfills, make them resumable, and keep them from locking hot paths.
4. Write the down path for each phase. If a phase cannot be undone, such as a dropped column or a lossy transform, mark it destructive and take a verified backup first.
5. Rehearse on a copy of production-shaped data at production scale. Record the duration, lock time, and row counts before and after.
6. A destructive production migration is on the Always-pause list. Show the operator the rehearsal numbers and the backup and wait for a go.
7. Run it, then verify the counts, the constraints, and a sample of rows against the rehearsal. Ship the contract phase as its own PR.
8. Run **Opening a PR**.

**Reply:** the phases, which are destructive, the rehearsal numbers, the down path, and what still reads the old shape.
