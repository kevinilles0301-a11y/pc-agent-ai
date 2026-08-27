@echo off
setlocal
cd /d "%~dp0"

echo [1/2] Starting Python agent API...
if not exist .venv (
  py -m venv .venv
  call .venv\Scripts\python.exe -m pip install --upgrade pip
  call .venv\Scripts\python.exe -m pip install -r requirements.txt
)
start "PC Agent API" cmd /k ".venv\Scripts\python.exe -m backend.server"

echo [2/2] Starting web UI...
if not exist node_modules (
  npm install
)
start "PC Agent UI" cmd /k "npm run dev"

timeout /t 3 >nul
start "" http://127.0.0.1:5173
endlocal
