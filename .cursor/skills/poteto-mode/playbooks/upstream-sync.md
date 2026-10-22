### Upstream sync

**You own the fork. Take upstream improvements without losing a Grok patch.**

In this fork:

1. Run `python3 scripts/check-upstream`. `take` replaces the local file with upstream. `review` needs a hand-finished 3-way merge that keeps the Grok patch. `skip` is a file the fork does not vendor.
2. Patch any upstream Grok hit before taking it.
3. Move the pins in `pstack-source.json` and `NOTICE`, run `python3 scripts/update-manifest`, then `python3 scripts/verify-setup`. One source per commit.

In a project that installed the fork:

1. Re-run the fork's `scripts/install` from the project root, and resolve any conflict it lists.
2. Run the checks in `scripts/pstack-grok/`.

**Reply:** each source's old and new pin, the takes, reviews, and skips, and the check results.
