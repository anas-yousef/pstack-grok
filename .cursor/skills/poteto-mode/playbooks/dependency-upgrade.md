### Dependency upgrade

**You own what you import. Upgrade one thing at a time, read what changed, and prove the app still works.**

1. Upgrade one dependency, or one group that must move together, per PR. Security fixes go first. Run the ecosystem's audit (`npm audit`, `pip-audit`, `cargo audit`, or similar) to find them.
2. Read the changelog and migration guide from your version to the target. Grep your code for every API they say changed, and list each hit.
3. Take one major version at a time. Run the official codemod when there is one.
4. Regenerate the lockfile with the project's own package manager and commit it. Pin tooling to exact versions. Never use `latest` in a manifest.
5. Run the typecheck, the tests, the build, and the project verification skill against the real app. For a frontend, compare bundle size and a page-load check before and after.
6. The rollback is reverting the PR, lockfile included. Keep it revertable by not mixing other changes in.

**Reply:** each dependency from and to its version, the breaking changes and how each was handled, and the check results.
