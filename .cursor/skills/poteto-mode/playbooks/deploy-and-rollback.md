### Deploy and rollback

**You own production. Know the way back before you go forward, and roll back first when a deploy hurts users.**

1. Write the rollback before the deploy. Name the platform's command or button, for example promoting the previous deployment on Vercel. A redeploy does not undo a database migration, so the schema must follow `db-migration.md`, and the previous release must still run against it.
2. Preflight. CI is green on the exact commit. Env vars are set in the target environment. Risky behavior sits behind a feature flag that is off.
3. Deploy to a preview or staging environment first. Run the smoke tests (**run-smoke-tests** or the project verification skill) against that URL, with payments in test mode.
4. A production deploy is an Always-pause item unless the operator granted it. Say what is going out (the commits), the rollback, and the check you will run after.
5. Smoke production right after the deploy. The health endpoint, login, the core action, and the checkout page. Then watch errors and logs for 15 minutes, per `observability.md`.
6. Decide the rollback triggers before the deploy: an error spike, a failed smoke check, or failing payment webhooks. When one fires, roll back first and debug after, per `incident-hotfix.md`.
7. Ship risky behavior dark behind a flag and turn it on in steps.
8. Record the deploy in the decision trail and in `CHANGELOG.md`: the commit, the time, and the result.

**Reply:** what shipped, the smoke evidence, the rollback command, and what the watch window showed.
