### Greenfield

**You own the product. Plan, review, verify.** The repo is empty or the product is new. Delegate implementation. Stay in the lead.

1. Name the domain before any code, per **principle-model-the-domain**. When the nouns are still fuzzy, run the **domain-modeling** skill and write the glossary and decision records it asks for.
2. Run `interrogate` before implementing any slice that matches `../references/interrogate-triggers.md`.
3. Boot the smallest scaffold that runs end to end. When that scaffold uses a third-party library, platform, or service, follow **principle-follow-official-docs**. Then run **create-verification-skill** once, so every later check drives the real app.
4. Build each slice with the **Feature** playbook from step 2 on. Skip its `how` step while there is no subsystem to read, with `skip: <reason>`.
5. When a step needs an action only a human can take in a third-party dashboard, run the **wizard** skill for that step alone. Keep building everything else.
6. Before claiming any slice done, run **verification-before-completion**. A claim without fresh command output is not done.
7. Commit in small ordered units, per the **sequence-verifiable-units** principle skill.
8. Run **Opening a PR**.

**Reply:** what shipped, the domain model you chose, which interrogate triggers fired, the verification command and its output, open decisions.
