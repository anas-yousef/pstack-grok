# Set up pstack

In this page you install the plugin, pick which models pstack uses, and run your first task. Setup is one command plus a short conversation.

## Install the plugin

Do not run `/add-plugin pstack`. That installs upstream pstack, whose defaults are not Grok. From a clone of this fork, run:

```bash
python3 scripts/install /path/to/your/project
```

The script prints the files it wrote and the checks to run. The fork's top-level README covers conflicts and updates.

This fork runs in Cursor. It does not install for any other agent product. See [the harness note](../harness/claude-code.md).

## Pick your models

Run:

```text
/setup-pstack
```

[`/setup-pstack`](../../../skills/setup-pstack/SKILL.md) detects the Grok models you have access to, asks for a reasoning budget, shows you each role (code delegates, judgment, the review panels), and asks what you want. Answer the questions. It writes the project rule `.cursor/rules/pstack-models.mdc`, a small rule every pstack skill reads. Every value is a `grok-*` slug or `blocked`, and `scripts/check-grok` fails on anything else.

The defaults run at `xhigh` reasoning, the same as the `large` budget. `unlimited` lifts each model to its highest tier. Grok tops out at `xhigh`, so it stays there. `medium` and `small` lower the reasoning and spend fewer tokens.

You only override what you care about. A role with no line in the rule keeps the skill's default. To restore a default, delete that role's line. A rerun of `/setup-pstack` keeps any role whose model differs from the default. When a default changes, a rule written before the change still pins the old default, so delete those role lines, or delete the file, then run `/setup-pstack` again.

You might be wondering what happens if you use Auto. This fork assumes your chat runs on Grok. A role set to `inherit-parent` or `auto` omits the subagent `model` field, so the subagent inherits your parent chat model, which on Auto may not be Grok. The project rule does not accept those values. Put one in a personal `~/.cursor/rules/pstack-models.mdc` only while your chat runs on Grok. For interrogate reviewers one subagent runs per entry, so the list length sets the panel size. Arena and architect treat their list as a model pool and always run at least two candidates. Setup also configures `swarm workers`, the default model for every `/swarm` worker unless a race names a model for each arm.

## Accept the verification offers, or don't

At the end of setup, `/setup-pstack` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`/create-verification-skill`](../../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `.cursor/skills/verify-<app>/`, a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run `/create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in depth.

If you're new to pstack, say yes. An agent that can check its own work keeps going until the check passes. An agent that can't hands every result back to you to check by hand. Of everything in this guide, the verification skill pays off the most.

Then setup offers once to generate a formal verification skill with [`/create-formal-verification-skill`](../../../skills/create-formal-verification-skill/SKILL.md), unless the project already has one. Tests check the cases someone thought to write. A formal verification skill checks one key property of your code, such as "a job never runs twice at once", in every case within a stated scope. Say yes when your code has concurrency, retries, a state machine, or a parser, where a bug is costly and tests rarely reach the case that breaks. Otherwise say no, and run it later if that changes. [Verify and ship](./06-verify-and-ship.md#prove-a-property-with-a-formal-verification-skill) covers it.

After setup, start a new chat. The model rule applies to new sessions.

## Keep the cost in check

pstack spends extra tokens on subagents and review panels. That's the price of the rigor. To spend fewer:

- Rerun `/setup-pstack` and pick a smaller reasoning budget. It lowers the code roles. Reviewers stay on `grok-4.7-xhigh`.
- Shorten a panel list. Each entry runs one subagent.
- Save `/poteto-mode` for work that needs rigor. A small, obvious edit doesn't.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/poteto-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/poteto-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. To keep `/poteto-mode` on for the whole chat, pick it from the `/` menu with Option+Enter (Mac) or Alt+Enter (Windows) instead of Enter. That makes it a [Custom Mode](https://cursor.com/docs/skills#using-a-skill-as-a-custom-mode), which stays in context on every turn until you exit it. Custom Modes are available in the Agents Window and the CLI. Plain Enter attaches the skill to one message, and it fades as the chat moves on.

Next: [Route work through `/poteto-mode`](./02-poteto-mode.md).
