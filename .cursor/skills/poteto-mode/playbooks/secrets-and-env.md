### Secrets and env

**You own every key. None is committed, each environment has its own, and each one can be rotated in minutes.**

1. Keep an inventory. Every secret and config value, which environments set it (local `.env`, CI secrets, the hosting provider), and how to rotate it. `.env.example` lists the names with placeholders and no values.
2. Never commit a secret. `.env*` is in `.gitignore`, except `.env.example`. Run a secret scanner such as gitleaks before commit and in CI. If a secret was ever committed, rotate it first, then remove it from history.
3. Separate environments. Development, CI, and preview deployments use test-mode or sandbox keys. Only production holds live payment and email keys. The owner sets live payment keys and webhook secrets in production. Agents never read, hold, or set them, and a live key never goes in a file an agent can open.
4. Validate env at startup with a schema, and fail fast with the missing variable's name. Server-only secrets never reach a client bundle. In Next.js, only `NEXT_PUBLIC_` values are public.
5. Give each key the least privilege it needs: scoped API keys and a database role limited to what the app does.
6. Redact secrets in logs and error reports.
7. A key that only a human can create in a dashboard goes through **wizard**. The human puts the value where it belongs. It is never pasted into chat.

**Reply:** the inventory table, the secret scan result, and what the operator still has to set.
