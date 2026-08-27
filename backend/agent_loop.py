from __future__ import annotations

import json
import re
from typing import Any

from .agent import ask_gemini, list_downloads, open_program

SAFE_ACTIONS = {"open_program", "list_downloads"}
MAX_STEPS = 5


def _extract_json(text: str) -> dict[str, Any]:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("Gemini hat keinen gültigen Agent-Plan zurückgegeben.")
    data = json.loads(match.group(0))
    if not isinstance(data, dict) or not isinstance(data.get("steps"), list):
        raise ValueError("Ungültiges Agent-Plan-Format.")
    return data


def make_plan(goal: str) -> dict[str, Any]:
    prompt = f"""
Create a safe PC task plan for this goal: {goal}
Return ONLY JSON with this shape:
{{"summary":"...","steps":[{{"action":"open_program|list_downloads","argument":"..."}}]}}
Rules:
- Maximum {MAX_STEPS} steps.
- Only use open_program for notepad, rechner, explorer, or dateien.
- Only use list_downloads for inspecting the Downloads folder.
- Never use shutdown, shell commands, PowerShell, arbitrary executables, account actions, or game automation.
- If the goal cannot be completed with these tools, return an empty steps array and explain why in summary.
""".strip()
    return _extract_json(ask_gemini(prompt))


def execute_plan(plan: dict[str, Any]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for raw_step in plan.get("steps", [])[:MAX_STEPS]:
        action = raw_step.get("action")
        argument = str(raw_step.get("argument", ""))
        if action == "open_program":
            results.append(open_program(argument))
        elif action == "list_downloads":
            items = list_downloads()
            results.append({"action": action, "ok": True, "items": items, "count": len(items)})
        else:
            results.append({"action": action, "ok": False, "error": "Aktion ist nicht freigegeben."})
    return results


def run_agent(goal: str) -> dict[str, Any]:
    plan = make_plan(goal)
    results = execute_plan(plan)
    return {"goal": goal, "summary": plan.get("summary", ""), "steps": plan.get("steps", []), "results": results}
