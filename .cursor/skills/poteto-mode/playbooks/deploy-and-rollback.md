### Deploy and rollback

**You own the release. Plan, verify, be ready to undo.** A deploy is an irreversible write per Autonomy. Pause for the operator before it goes out, unless they already gave a go for this exact deploy.

1. Name what ships: the commit range, the config and secret changes, and any migration that rides along. A migration routes to the **DB migration** playbook first.
2. Write the rollback before the deploy. Name the exact steps that put the previous version back, how long they take, and what they cannot undo, such as sent messages or a schema change. A deploy with no working rollback does not ship.
3. Name the health signals that decide success: error rate, latency, a key user flow, and the logs to watch. Record their current values as the baseline. With no signal to watch, run the **Observability** playbook first.
4. Prove the rollback on a non-production environment, or name the last time it ran there.
5. Deploy in the smallest stage the system allows: one instance, a small share of traffic, or a flag off by default. Watch the signals for a set window before you widen.
6. Verify on the real surface via the control skill (Non-negotiables). Compare each signal to its baseline. "Looks fine" is not a pass.
7. On any regression past the threshold, roll back first and investigate after. Then route the cause to the **Bug fix** or **Incident hotfix** playbook.

**Reply:** what shipped, the rollback steps and whether they were tested, each signal before and after, and whether you widened or rolled back.
