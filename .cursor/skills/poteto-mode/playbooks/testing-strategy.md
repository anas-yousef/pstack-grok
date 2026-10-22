### Testing strategy

**You own the proof. Pick the cheapest test that would fail if the behavior broke, and keep the suite fast enough to run before every commit.**

This playbook plans tests for new behavior. The **tdd** skill covers the failing test for a bug.

1. For each slice, pick the level that proves it. Pure domain logic gets unit tests. Code that talks to the database or a provider gets an integration test against a real local or branch database and the provider's sandbox, or a fake at your own adapter. A critical user path (signup, login, checkout, the product's core action) gets one end-to-end check through the project verification skill or **control-ui**.
2. Keep the shape small. Many fast unit tests, a few integration tests per adapter, and three to five end-to-end smoke checks on money, auth, and the core action. Coverage percentage is not the goal.
3. Assert what users of the code can observe, per **principle-test-behavior-not-implementation**. Fake the boundaries you own. Do not mock your own internals.
4. Every slice that matches `../references/interrogate-triggers.md` gets negative tests: wrong user, bad input, replayed event, failed payment.
5. Every bug fix adds a regression test, per the **tdd** skill.
6. CI runs the suite on every push. A flaky test is a bug. Fix it or delete it with a reason. Never retry until green.
7. Keep unit and integration tests under about two minutes so they run before each commit. Put the slow checks in CI only.
8. Write the test commands in the README and in the project verification skill.

**Reply:** a table of slice, test level, and why, then the commands and their results.
