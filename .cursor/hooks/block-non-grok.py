#!/usr/bin/env python3
"""Deny computer-use, browser, and non-Grok subagents at subagentStart."""

from __future__ import annotations

import json
import re
import sys

BLOCKED_MARKERS = ("computeruse", "browser")
TYPE_KEYS = ("subagent_type", "subagentType", "agent_type", "agentType")
MODEL_KEYS = ("subagent_model", "subagentModel", "model")
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


def normalize_type(value: object) -> str:
    if not isinstance(value, str):
        return ""
    return "".join(ch for ch in value.lower() if ch.isalnum())


def looks_blocked(text: object) -> bool:
    compact = normalize_type(text)
    return any(marker in compact for marker in BLOCKED_MARKERS)


def is_grok(model: str) -> bool:
    return bool(GROK_SLUG.match(model.lower()))


def iter_views(value: object, seen: set[int] | None = None):
    if seen is None:
        seen = set()
    current = value
    if isinstance(current, str):
        try:
            current = json.loads(current)
        except json.JSONDecodeError:
            return
    if not isinstance(current, dict):
        return
    marker = id(current)
    if marker in seen:
        return
    seen.add(marker)
    yield current
    if "tool_input" in current:
        yield from iter_views(current["tool_input"], seen)


def views(payload: dict) -> list[dict]:
    return list(iter_views(payload))


def models_allowed(payload: dict) -> bool:
    saw = False
    for view in views(payload):
        for key in MODEL_KEYS:
            if key not in view:
                continue
            saw = True
            value = view[key]
            if not isinstance(value, str) or not is_grok(value.strip()):
                return False
    return saw


def decide(payload: object, raw: str) -> dict:
    if not isinstance(payload, dict):
        if looks_blocked(raw):
            return {"permission": "deny", "user_message": BROWSER_MESSAGE}
        return {"permission": "deny", "user_message": UNREADABLE_MESSAGE}
    for view in views(payload):
        if any(looks_blocked(view.get(key)) for key in TYPE_KEYS):
            return {"permission": "deny", "user_message": BROWSER_MESSAGE}
    if not models_allowed(payload):
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
