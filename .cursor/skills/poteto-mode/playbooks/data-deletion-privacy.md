### Data deletion and privacy

**You own the user's data. Know where every copy lives, delete all of it when asked, and keep less of it to start with.**

1. Map the data. List every place a user's data lands: database tables, object storage, logs, analytics, the email provider, the payment provider, caches, search indexes, and backups. Keep the map as a table in the repo's docs and update it when a store is added.
2. Collect less. Drop fields nothing uses. Never log personal data, tokens, or payment details. Redact them in the logger, not at each call site.
3. Decide per data class whether delete means hard delete or irreversible anonymization, and the window it happens in. Keep only what a law or the payment provider requires. Lemon Squeezy keeps its own billing records as merchant of record.
4. Write deletion as one job, per **principle-make-operations-idempotent**. It resumes after a crash, deletes in dependency order, calls each third party's delete API, and logs counts, never content. Give it a dry-run mode that prints what it would delete.
5. Gate it. A user deleting their own account re-authenticates and confirms. An admin or bulk deletion is an Always-pause item. Show the operator the dry-run counts and wait for a yes.
6. State the backup window. Deleted data stays in backups until they rotate. Write the retention in days where the user can read it.
7. Set retention for everything that is not the product's core record: logs, analytics events, temporary uploads, and abandoned signups.
8. Provide an export when the law that applies requires one. GDPR applies to EU users. Israel's Privacy Protection Law applies to the owner's own operations. Name the open legal questions instead of guessing. This playbook is not legal advice.
9. Prove it. A script creates a user with data in every store from step 1, deletes the account, and asserts that each store no longer has it.

**Reply:** the data map, the deletion test output, the retention windows, and the open legal questions.
