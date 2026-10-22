#!/usr/bin/env python3
"""Deny computer-use, browser, and non-Grok subagents at subagentStart.

The field names below are this fork's reading of Cursor's subagentStart input.
They have been checked only against synthetic payloads in
scripts/test-subagent-hook, not against a live subagentStart payload.

A spawn is the top-level payload plus each object reached through
`tool_input`, which may be an object, a JSON object string, or a list of them.
No other nested field is read, so a prompt or context string that mentions a
model is never mistaken for the spawn's own model.
"""

from __future__ import annotations

import json
import re
import sys

TYPE_KEYS = ("subagent_type", "subagentType", "agent_type", "agentType")
# Fields that name the subagent's own model.
SUBAGENT_MODEL_KEYS = ("subagent_model", "subagentModel", "subagent_model_id", "subagentModelId")
# Fields that name the model of the object they sit on. On the top-level payload
# that is the parent session, which the subagent inherits only when no subagent
# model field is present. Inside tool_input it is the model the spawn requested.
OWN_MODEL_KEYS = ("model", "model_id", "modelId")
ARGUMENT_KEYS = ("tool_input", "toolInput")
VENDOR_PREFIXES = ("cursor",)
GROK_SLUG = re.compile(r"^grok-[a-z0-9][a-z0-9.-]*$")
BROWSER_MESSAGE = (
    "Blocked. This subagent type is computer use or browser. "
    "Use control-ui on Grok instead."
)
MODEL_MESSAGE = (
    "Blocked. This subagent model is not a Grok model. "
    "Use a Grok model. Use control-ui on Grok instead for browser checks."
)
UNREADABLE_MESSAGE = (
    "Blocked. The subagentStart payload could not be read. "
    "Use control-ui on Grok instead for browser checks."
)


def type_words(value: object) -> list[str]:
    if not isinstance(value, str):
        return []
    spaced = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", value)
    return [word for word in re.split(r"[^a-z0-9]+", spaced.lower()) if word]


def is_blocked_type(value: object) -> bool:
    """True when the type names a computer-use or browser agent, not when a word merely contains one."""
    words = type_words(value)
    while words and words[0] in VENDOR_PREFIXES:
        words = words[1:]
    if not words:
        return False
    if words[0] in ("browser", "browseruse", "computeruse"):
        return True
    return words[:2] == ["computer", "use"]


def looks_blocked(text: str) -> bool:
    compact = "".join(ch for ch in text.lower() if ch.isalnum())
    return "computeruse" in compact or "browser" in compact


def is_grok(model: object) -> bool:
    return isinstance(model, str) and bool(GROK_SLUG.match(model.strip().lower()))


def spawn_views(value: object, top: bool = True):
    """Yield (object, is_top_level) for the payload and every object in its tool_input chain."""
    current = value
    if isinstance(current, str) and not top:
        try:
            current = json.loads(current)
        except json.JSONDecodeError:
            return
    if isinstance(current, list) and not top:
        for item in current:
            yield from spawn_views(item, top=False)
        return
    if not isinstance(current, dict):
        return
    yield current, top
    for key in ARGUMENT_KEYS:
        if key in current:
            yield from spawn_views(current[key], top=False)


def model_fields(payload: dict) -> tuple[list[object], list[object]]:
    """Return (the subagent's own model values, the parent envelope model values)."""
    own = []
    envelope = []
    for view, top in spawn_views(payload):
        for key in SUBAGENT_MODEL_KEYS:
            if key in view:
                own.append(view[key])
        for key in OWN_MODEL_KEYS:
            if key in view:
                (envelope if top else own).append(view[key])
    return own, envelope


def decide(payload: object, raw: str) -> dict:
    if not isinstance(payload, dict):
        if looks_blocked(raw):
            return {"permission": "deny", "user_message": BROWSER_MESSAGE}
        return {"permission": "deny", "user_message": UNREADABLE_MESSAGE}
    for view, _top in spawn_views(payload):
        if any(is_blocked_type(view.get(key)) for key in TYPE_KEYS):
            return {"permission": "deny", "user_message": BROWSER_MESSAGE}
    own, envelope = model_fields(payload)
    deciding = own if own else envelope
    if not deciding or not all(is_grok(value) for value in deciding):
        return {"permission": "deny", "user_message": MODEL_MESSAGE}
    return {"permission": "allow"}


def main() -> int:
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw) if raw.strip() else None
    except json.JSONDecodeError:
        payload = None
    sys.stdout.write(json.dumps(decide(payload, raw)) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
