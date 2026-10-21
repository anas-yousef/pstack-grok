# pstack model configuration for SendWise. One line per role; labels match pstack's setup-pstack exactly.
# A value is `<model> <effort>`, passed as the Agent tool's `model` and `effort`. The routing hook
# (.claude/hooks/agent-routing.mjs) checks spawns that carry a `Role: <label>` line against this table.
# Owner decision G7 (2026-10-13): Claude models only; fable is never a default, only an escalation with
# a `Routing: fable - <reason>` line. Haiku stays at high (2026-10-12 bench: max bought nothing).
# budget: large
feature, refactoring: sonnet high
bug-fix: sonnet high
perf-issue: sonnet high
hillclimb: sonnet high
judgment and prose: opus xhigh
hardest tasks: opus xhigh
how explorer: haiku high
how explainer: opus xhigh
why investigators: haiku high
why synthesizer: opus xhigh
reflect tooling: sonnet high
reflect judgment, divergent, synthesizer: opus xhigh
arena runners: opus xhigh, sonnet high
arena cross-judge pool: opus xhigh, sonnet xhigh
swarm workers: haiku high
architect runners: opus xhigh, sonnet high
interrogate reviewers: opus xhigh, sonnet xhigh
