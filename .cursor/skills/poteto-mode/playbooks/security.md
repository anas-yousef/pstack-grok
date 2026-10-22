### Security

**You own the trust boundary. Name what an attacker wants, then prove they cannot get it.**

1. Write a short threat model in the decision trail: assets, actors, entry points, worst outcome. Run **interrogate** with it attached.
2. Authorize on the server for every request, scoped to the caller. Prove one user cannot read or change another's data.
3. Use the platform's vetted auth and crypto libraries. Never write your own.
4. Parse untrusted input at the boundary, per **principle-boundary-discipline**. Rate-limit what an attacker can hammer.
5. Secrets are never committed, never logged, and never reach client code. Each environment has its own keys with least privilege. Validate config at startup and fail fast.
6. Agents never read, hold, or set production secrets or live keys. A human puts them in place through **wizard**.
7. Write the negative tests, and confirm each fails closed.

**Reply:** the threat model and each negative test with its result.
