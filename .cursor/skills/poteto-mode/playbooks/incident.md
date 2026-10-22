### Incident

**You own the outage. Stop the harm, then find the cause, then make it impossible to miss next time.**

1. Mitigate first. If a recent release or flag lines up, roll it back or turn it off now.
2. Scope it: who is affected, since when, and whether money or data is at risk. Keep a timestamped trail with **show-me-your-work**.
3. Stop ongoing damage, such as a job writing bad data.
4. Root-cause with the **Bug fix** playbook and **systematic-debugging**.
5. Hotfix from the deployed commit with a regression test.
6. Repair data with an idempotent script and its dry-run counts, after the operator's yes.
7. Add the check or alert that would have caught it, per **principle-encode-lessons-in-structure**.

**Reply:** timeline, impact, mitigation, fix, and the new check.
