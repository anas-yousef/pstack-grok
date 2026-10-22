### DB migration

**You own the data. Every schema change ships in phases that the running code survives, and every phase has a way back.**

1. Classify the change. Additive is a new table, a nullable column, a column with a constant default, or a new index. Destructive is a drop, a rename, a type change that narrows, or a new `NOT NULL` on existing rows. A data rewrite changes stored values. Destructive changes and rewrites match `../references/interrogate-triggers.md`, so run **interrogate** before writing them.
2. Expand. Add the new shape beside the old one. Nothing reads it yet. The code that is live now must keep working against the expanded schema. Ship and deploy this phase on its own.
3. Backfill. Write the backfill as a script, not a one-off query. It runs in batches keyed by primary key, records where it stopped, and converges when re-run, per **principle-make-operations-idempotent**. Run it in dry-run mode first and print the row counts it would change.
4. Switch. Deploy code that writes both shapes and reads the new one. Verify with a count that old and new agree.
5. Contract. Drop the old shape only in a later release, after nothing reads or writes it. That is its own migration and its own PR. Never rename in place. A rename is add, copy, switch, drop.
6. Make each migration reversible. Write the down migration, or write one line that says why it is irreversible and how to restore instead. Before a destructive phase runs in production, confirm a backup or point-in-time restore point exists and write its timestamp in the decision trail.
7. Keep locks short. On Postgres, build indexes with `CREATE INDEX CONCURRENTLY`, add `NOT NULL` through a `CHECK ... NOT VALID` constraint and a later `VALIDATE`, and set `lock_timeout` for the migration session. Check your database's docs for the same operations on other engines.
8. Prove it on a copy. Run up, down, and up again against a local or branch database with realistic data, then run the test suite against the migrated schema. Use the provider's database branching when it has one.
9. Deploy through `deploy-and-rollback.md`. A production migration that drops or rewrites data is an Always-pause item.

**Reply:** the phases and which ones shipped, the backfill counts before and after, the down path or restore point, and what still has to be contracted.
