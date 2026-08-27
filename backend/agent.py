from __future__ import annotations

import os
import platform
import subprocess
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai

load_dotenv()

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
SYSTEM_PROMPT = """
You are PC Agent AI, a Windows desktop assistant. Help the user plan and complete ordinary PC tasks.
Return concise, practical German answers. Do not automate online games, cheating, account leveling,
or actions intended to evade platform rules. Never claim an action was executed unless the backend did it.
When a task would need a local PC action, describe the next safe action and wait for the app to execute it.
Dangerous/destructive actions such as shutdown require an explicit user confirmation handled by the app.
""".strip()


def _client() -> genai.Client:
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY fehlt. Lege sie in backend/.env oder als Windows-Umgebungsvariable fest.")
    return genai.Client(api_key=key)


def ask_gemini(message: str, history: list[dict[str, str]] | None = None) -> str:
    client = _client()
    context = ""
    if history:
        recent = history[-12:]
        context = "\n\nConversation context:\n" + "\n".join(
            f"{item['role'].upper()}: {item['content']}" for item in recent
        )
    prompt = f"{SYSTEM_PROMPT}{context}\n\nUSER: {message}"
    response = client.models.generate_content(model=MODEL, contents=prompt)
    text = getattr(response, "text", None)
    return text.strip() if text else "Ich konnte gerade keine Antwort erzeugen."


def list_downloads() -> list[str]:
    path = Path.home() / "Downloads"
    if not path.exists():
        return []
    return [p.name for p in sorted(path.iterdir(), key=lambda p: p.name.lower())]


def open_program(program: str) -> dict[str, Any]:
    allowed = {
        "notepad": ["notepad.exe"],
        "rechner": ["calc.exe"],
        "explorer": ["explorer.exe"],
        "dateien": ["explorer.exe", str(Path.home())],
    }
    key = program.strip().lower()
    command = allowed.get(key)
    if not command:
        raise ValueError("Dieses Programm ist nicht in der sicheren Starter-Liste.")
    subprocess.Popen(command, shell=False)
    return {"action": "open_program", "program": key, "ok": True}


def request_shutdown(confirm: bool) -> dict[str, Any]:
    if not confirm:
        return {"action": "shutdown", "ok": False, "requires_confirmation": True}
    if platform.system() != "Windows":
        raise RuntimeError("Shutdown ist in dieser Version nur für Windows freigeschaltet.")
    subprocess.Popen(["shutdown", "/s", "/t", "30"], shell=False)
    return {"action": "shutdown", "ok": True, "message": "Windows fährt in 30 Sekunden herunter."}
