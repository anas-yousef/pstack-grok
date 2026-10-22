### Release

**You own production. Know the way back before you go forward, and know before users do when something breaks.**

1. Before the first launch, make failures visible: error reporting tied to the release, structured logs without secrets or personal data, a health check, and a few alerts that reach a human.
2. Write the rollback before the deploy. A code rollback does not undo a data change, so data changes follow `data-changes.md`.
3. Ship risky behavior dark behind a flag.
4. Deploy to a non-production environment first and smoke-test it the way a user would.
5. A production deploy is an Always-pause item unless the operator granted it.
6. Smoke production right after, then watch errors and the critical flows for a while. Decide the rollback triggers in advance, and roll back first if one fires.
7. Record what shipped and when.

**Reply:** what shipped, the smoke evidence, the rollback, and what the watch showed.
