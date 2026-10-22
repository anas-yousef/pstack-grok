### Incident and hotfix

**You own the outage. Stop the harm first, find the cause second, and leave behind a check that catches it sooner.**

1. Mitigate first. If a recent deploy or flag lines up with the start, roll it back or turn the flag off now, per `deploy-and-rollback.md`. Revert before you fix forward.
2. Scope it. What is broken, for whom, since when, and whether money or data is at risk. Keep a timestamped log with **show-me-your-work** from the first minute.
3. Stop data damage. Pause the job or webhook consumer that is writing bad data, and block the write path if data is being corrupted.
4. Tell affected users when it matters. A customer message is an Always-pause item, so draft it for the operator.
5. Find the root cause with the **Bug fix** playbook and **systematic-debugging**, from logs, the error tracker, and a reproduction.
6. Hotfix on a branch from the deployed commit. Make the smallest change, add a regression test, get CI green, deploy, and verify on production. Fast mode is allowed here, because a person is blocked.
7. Repair data with an idempotent script that has a dry-run mode. Show the operator the counts and wait for a yes before it runs on production.
8. Write a short postmortem: timeline, impact, root cause, and the alert or check that will catch it earlier. Add that check, per **principle-encode-lessons-in-structure**.

**Reply:** the timeline, the impact, the mitigation, the fix, and the follow-up checks.
