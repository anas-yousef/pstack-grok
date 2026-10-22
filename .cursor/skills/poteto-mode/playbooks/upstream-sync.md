### Upstream sync

**You own the fork. Take upstream improvements without losing a Grok patch or picking up a non-Grok default.**

In the pstack-grok fork repo:

1. Run `python3 scripts/check-upstream`. It needs network. The owner's daily check runs outside the repo, so this is the manual path. Exit 1 means drift that needs action. Exit 2 is a fetch or pin failure.
2. For each `take`, replace the local file with the upstream blob.
3. For each `review`, finish the 3-way merge by hand and keep the Grok patch. Read the reason on the file's `localPatches` row first.
4. For each `skip`, upstream added a skill this fork does not vendor. Vendoring it is a separate decision with a reason in `docs/design.md`.
5. Treat every upstream Grok hit as a patch to make before the take.
6. Move the pin in `pstack-source.json` and `NOTICE`, run `python3 scripts/update-manifest` (with `--patch <file> <reason>` for each newly patched file), then `python3 scripts/verify-setup`. Commit one source at a time.

In a product that installed the fork:

1. Update your clone or submodule of the fork.
2. Run `python3 <fork>/scripts/install .` from the product root. A conflict means you edited a file the fork ships. Move that edit into your own skill or rule, or re-apply it after `--force`.
3. Run `python3 scripts/pstack-grok/check-grok`, `python3 scripts/pstack-grok/test-subagent-hook`, and `python3 scripts/pstack-grok/check-paths`. Commit with the fork id from `scripts/pstack-grok/installed.json` in the message.

**Reply:** each source with its old and new pin, the takes, reviews, and skips, and the check results.
