from __future__ import annotations

import base64
import io
import os
from typing import Literal

import pyautogui
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .agent import ask_gemini, list_downloads, open_program, request_shutdown

app = FastAPI(title="PC Agent AI", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=12000)
    history: list[dict[str, str]] = Field(default_factory=list)


class ActionRequest(BaseModel):
    action: Literal["open_program", "list_downloads", "screenshot", "shutdown"]
    argument: str = ""
    confirm: bool = False


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat")
def chat(request: ChatRequest) -> dict[str, str]:
    try:
        return {"text": ask_gemini(request.message, request.history)}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/api/action")
def action(request: ActionRequest) -> dict:
    try:
        if request.action == "open_program":
            return open_program(request.argument)
        if request.action == "list_downloads":
            return {"action": request.action, "ok": True, "items": list_downloads()}
        if request.action == "screenshot":
            image = pyautogui.screenshot()
            buffer = io.BytesIO()
            image.save(buffer, format="PNG", optimize=True)
            encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
            return {"action": request.action, "ok": True, "mime": "image/png", "data": encoded}
        if request.action == "shutdown":
            return request_shutdown(request.confirm)
        raise HTTPException(status_code=400, detail="Unbekannte Aktion")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("AGENT_HOST", "127.0.0.1")
    port = int(os.getenv("AGENT_PORT", "8765"))
    uvicorn.run("backend.server:app", host=host, port=port, reload=False)
