---
name: local-supabase
description: "Apply when a product needs a real backend database, auth, or row-level security. Run official local Supabase in Docker on this machine, and create a hosted project only when the product ships."
disable-model-invocation: true
---

# Local Supabase

Use official local Supabase when the product's real backend is Supabase.

When the repo has no `supabase/config.toml`, run `supabase init`. `supabase start` starts one Docker Supabase stack on this machine. That stack needs a Docker-compatible runtime. The stack includes Postgres, Auth, Storage, and row-level security.

Each machine runs its own stack. The stack lasts only as long as the machine.

Create a hosted Supabase project only when the product ships. A cloud agent does not create one.

A thin app or an offline client keeps SQLite, PGlite, or an in-repo fixture. Kolot keeps SQLite and an S3 fake. Field Inspect keeps IndexedDB and a sync fixture.

When the product prefers a document database, run MongoDB in Docker on this same machine.
