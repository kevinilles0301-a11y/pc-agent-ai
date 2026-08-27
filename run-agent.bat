@echo off
setlocal
if not exist .venv (
  py -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if not exist .env (
  copy .env.example .env >nul
  echo.
  echo .env wurde erstellt. Trage dort deinen GEMINI_API_KEY ein und starte die Datei danach erneut.
  pause
  exit /b 0
)
python -m backend.server
