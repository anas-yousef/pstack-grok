### Docs

**You own what the next person reads. Docs change in the same PR as the behavior they describe.**

1. Update docs in the same PR when the change touches any of these: setup or install steps, an env var, a command, a public API or contract, user-visible behavior, a breaking change, a new external service, or the deploy or rollback steps.
2. Put each fact in one place. The README holds what the product is, a quickstart that works on a fresh clone, and the commands. `.env.example` holds every env var name with a placeholder and a one-line comment. `CHANGELOG.md` holds user-facing changes under `Unreleased`. An ADR from **domain-modeling** holds a decision that is costly to reverse. `docs/runbook.md` holds deploy, rollback, and incident steps.
3. Prove the quickstart. Follow it word for word in a fresh clone or a new worktree, and fix every step that fails.
4. Write human docs with **technical-writing** and **unslop**. Write docs an agent reads with **writing-for-agents**.
5. Delete a stale doc instead of leaving it. Do not document what the code already says.

**Reply:** the doc files changed, and the fresh-clone quickstart run and its result.
