---
name: interrogate
description: "Use for \"interrogate\", \"adversarial review\", \"hostile review\", \"challenge this\", \"stress test this code\", \"find blind spots\", or \"tear this apart\". Hostile Grok reviewers challenge changes from independent angles."
disable-model-invocation: true
---

# Interrogate

Spawn one reviewer per configured entry to adversarially review code changes. The adversarial signal comes from a fresh hostile reviewer prompted to find faults. The deliverable is a synthesized verdict. Do NOT auto-apply changes.

## Step 1, Scope

Identify what to review from context:

- If the user points at specific files or a diff, use that.
- If on a feature branch, run `git diff main...HEAD` (or the appropriate base branch) for the full changeset.
- If the user's message references recent work, gather the relevant files.

Package the diff or file contents with any surrounding context files the reviewers need to understand the code.

## Step 2, Intent

Before spawning reviewers, state the intent in one clear paragraph from the user's message, commit messages, the PR description if one exists, and the code. If you're unsure about the intent, ask the user before proceeding.

## Step 3, Spawn Reviewers

Launch all reviewers in a single message with the Task tool, one per entry on the `interrogate reviewers` line in the project rule `.cursor/rules/pstack-models.mdc`, labeled Reviewer A, B, and so on to match the entry count. If the rule or that line is missing, use the table defaults. Give each reviewer a different angle from `references/rubric.md` when there is more than one.

| Subagent | Default model |
|----------|---------------|
| Reviewer A | `grok-4.7-xhigh` |

Each reviewer gets `subagent_type: generalPurpose`, `readonly: true`, and `model` set to its configured entry, or its table default when there is no configured line. Omit `model` for an `inherit-parent`, `auto`, or `unpinned` entry, so that reviewer runs on the parent model. That stays Grok only while the parent chat runs on Grok, per the alias note in the **poteto-mode** skill.

If the Task tool rejects a configured entry, retry that reviewer once on `grok-4.7-xhigh` and say so. If the retry fails, follow the reviewer fallback in the **poteto-mode** skill. Never treat an alias entry as a rejected slug. Prompt every reviewer to find faults, per that same contract.

Read `references/reviewer-prompt.md` and fill in the same template for every reviewer with the stated intent, the diff or file contents, the rubric from `references/rubric.md`, and the code-quality lens from `references/code-quality-review.md`. Reviewers run on the line's slug as written, `grok-4.7-xhigh` by default. Do not lower the effort or switch a reviewer to `-fast`.

## Step 4, Synthesize

As results come back, build a unified picture. Parse every reviewer's findings. Merge findings that describe the same issue differently, and note which reviewers raised each one. Every reviewer is the same Grok family, so agreement between reviewers is weaker evidence than it looks. Weight a finding by whether you can confirm it in the code, not by how many reviewers raised it. With one reviewer, check each finding against the code before it counts. Note disagreements. If one reviewer flags something and another explicitly says the opposite, that is context for the verdict.

## Step 5, Lead Judgment

You are the lead reviewer, a pragmatic senior engineer, not a neutral aggregator. Read `references/lead-judgment.md` for the full framework. Put every finding in one of four buckets, with the reviewer(s) that raised it and a one-line rationale.

- **Act on**. Real issues affecting correctness, security, or maintainability given the actual goals. They would block a real PR.
- **Consider**. Legitimate, but you're not sure they outweigh the cost of addressing them now. Worth the user's attention.
- **Noted**. Technically valid but not actionable. Context-dependent, premature optimization, or low-impact at this stage.
- **Dismissed**. Wrong, nitpicky, or missing context, with a brief reason.

## Output Format

### Intent
> [The stated intent paragraph from Step 2]

### Reviewers
- Reviewer [label]: [model name], [N findings] (one bullet per reviewer)

### Act On
[Each: description, which reviewers raised it, how you confirmed it, why it matters.]

### Consider
[Each: description, which reviewers raised it, the tradeoff.]

### Noted
[Brief list.]

### Dismissed
[Each with a brief rationale.]

### Agreement Map
[Where reviewers agreed and diverged, and which findings you confirmed in the code.]
