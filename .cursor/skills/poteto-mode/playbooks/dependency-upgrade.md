### Dependency upgrade

**You own the upgrade. Plan, review, verify.** Delegate the mechanical edits. Stay in the lead.

1. Name the package, the current and target versions, and why. Read every changelog and migration note in between. List each breaking change and each new default.
2. Find every use. Search for imports, configuration, and transitive users, and run `how` where the use is more than a call site.
3. Upgrade one dependency per commit. Never bundle unrelated bumps. A major version that needs code changes gets its own PR.
4. Prefer the upstream codemod or a script you write over hand edits, per **principle-build-the-lever**.
5. Check the lockfile diff. Name every transitive package that moved. Flag new install scripts, new network or file access, a new maintainer, and license changes.
6. Run the full build and tests. Then verify the paths the changelog says changed on the matching surface via the control skill (Non-negotiables). A green build is not proof the behavior held.
7. If the upgrade cannot land cleanly, pin the old version with a one-line reason and open a follow-up. Do not leave a half-migrated state.
8. Run **Opening a PR**.

**Reply:** versions, the breaking changes and how each was handled, notable lockfile changes, and how you verified.
