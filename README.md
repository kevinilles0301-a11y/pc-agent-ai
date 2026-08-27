# PC Agent AI

A modern Windows desktop AI agent with a ChatGPT-style interface.

## Vision

Give the agent a goal in natural language. It can plan work, inspect the screen, use approved PC tools, verify progress, and perform a clearly configured finish action.

> Online games: this project does **not** automate gameplay or level up online accounts. A future game-training mode can analyze gameplay and provide coaching without controlling the game.

## Status

🚧 Version 0.1 — UI foundation and safe agent architecture are being built.

## Planned stack

- Tauri + React + TypeScript
- Python agent service for AI/vision tooling
- Explicit permissions for system actions
- Local task history and run logs

## Safety

Destructive/system actions such as shutdown will require explicit user configuration and confirmation in the first release.
