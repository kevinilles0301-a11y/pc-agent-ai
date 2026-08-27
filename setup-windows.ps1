$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host 'Creating Python environment...'
py -m venv .venv
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt

if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
  Write-Host 'Created .env. Add your GEMINI_API_KEY before starting the app.' -ForegroundColor Yellow
}

Write-Host 'Installing web dependencies...'
npm install
Write-Host 'Setup complete. Run start-agent.bat' -ForegroundColor Green
