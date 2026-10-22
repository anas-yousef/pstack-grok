### Greenfield

**You own the product.** The repo is empty, or the product is new. poteto-mode stays the entry. This playbook is the route.

1. Open the todo list with these steps copied verbatim. If TodoWrite returns `success: false`, stop and report the tool error. Do not continue.
2. Name the domain before code, per **principle-model-the-domain**. When the nouns are still fuzzy, run **domain-modeling** and write the glossary and ADRs it asks for.
3. Run **interrogate** before implementation when the slice matches `../references/interrogate-triggers.md`. That file is the only copy of the trigger list. Do not restate it here.
4. Boot the smallest scaffold that runs. Then run **create-verification-skill** once. Later checks use that project skill.
5. Follow the Feature playbook from architect through verify. Skip `how` when there is no subsystem to read, and record `skip: <reason>` on the todo.
6. Before each commit, run **deslop** and **no-comments**.
7. Verify with the project verification skill, **control-ui** or **control-cli**, and **verification-before-completion**. A claim without a fresh command output is not done. Use **verify-this** for the claim, the baseline, and the treatment.
8. If a step needs a click only a human can do in a third-party dashboard, run **wizard** for that step alone. Do not stop the rest of the build for it.
9. Before the first deploy, run the **Secrets and env**, **Testing strategy**, **Observability**, and **Deploy and rollback** playbooks, and **Docs** for the quickstart. Run each other risk playbook a slice matched, per poteto-mode.
10. Run the **show-me-your-work** trail review before any push. Do not push until that review has returned, or until the fallback self-review is in the log and under Attention.
11. Commit in small ordered units. Skip Opening a PR when the user said to commit on the current branch, and record `skip: <reason>`.

**Reply:** what shipped, the gates that fired, the verification command and its result, open decisions.
