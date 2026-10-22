### Incident hotfix

**You own the recovery. Stop the harm first, then fix the cause.** Users are hurting right now, so speed matters more than polish. Use fast mode, per the Subagents section.

1. State the impact in one sentence: who is affected, what is broken, and since when. Post it where the team is tracking the incident.
2. Mitigate before you diagnose. Reach for the cheapest reversible lever: roll back the last deploy, turn off a flag, shed load, or pause a job. A rollback is a deploy, so it follows the **Deploy and rollback** playbook's verify step.
3. Confirm the mitigation on the real surface with the health signals. Users recovering is the pass, not the change landing.
4. Find the root cause with the **Bug fix** playbook's steps 1 and 2. Keep the evidence: timestamps, logs, the first bad event.
5. Write the smallest fix the evidence justifies, with a failing repro first. No refactors and no extra scope in a hotfix.
6. Ship it through **Deploy and rollback**. Pause for the operator before the deploy, per Autonomy.
7. Write follow-ups for the gap that let it through: a missing test, alert, or guard. Route each one to its playbook rather than folding it into the hotfix.

**Reply:** impact and duration, the mitigation and when it took effect, root cause with evidence, the fix, and the follow-ups.
