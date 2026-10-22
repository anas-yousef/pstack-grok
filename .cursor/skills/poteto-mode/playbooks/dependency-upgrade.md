### Dependency upgrade

**You own what you import. One upgrade at a time, read what changed, prove the app still works.**

1. One dependency, or one group that must move together, per PR. Security fixes first.
2. Read the changelog and migration guide between the versions, and find every use of what changed.
3. One major version at a time. Use the official codemod when there is one.
4. Commit the regenerated lockfile, and pin exact versions for tooling.
5. Run the typecheck, tests, build, and the project's verification skill against the real app.

**Reply:** from and to versions, the breaking changes and how each was handled, and the check results.
