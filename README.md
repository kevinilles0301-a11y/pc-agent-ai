# PC Agent AI

Moderner Windows-PC-Agent mit ChatGPT-ähnlicher Oberfläche, Gemini als KI-Brain und einer lokalen API für freigegebene PC-Aktionen.

## Enthalten in v0.3

- 💬 moderne React/Vite-Chat-Oberfläche
- 🧠 Gemini-Anbindung über das offizielle `google-genai`-SDK
- 🔌 lokale FastAPI-Brücke auf `127.0.0.1:8765`
- 🤖 sicherer Multi-Step-Agent: Gemini erstellt einen kleinen Plan und führt nur freigegebene Aktionen aus
- 🖥️ sichere PC-Tools: Editor, Rechner, Explorer, Downloads-Auflistung, Screenshot
- ⏻ Shutdown als geschützte Abschlussaktion mit ausdrücklicher Bestätigung
- 🔐 API-Key wird nur lokal über `.env` bzw. `GEMINI_API_KEY` geladen
- 🪟 `setup-windows.ps1` und `start-agent.bat` für einfachen Start

## Start unter Windows

### 1. Repository herunterladen

```powershell
git clone https://github.com/kevinilles0301-a11y/pc-agent-ai.git
cd pc-agent-ai
```

### 2. Gemini-Key einrichten

Erstelle eine `.env`-Datei anhand von `.env.example` und setze deinen Key:

```env
GEMINI_API_KEY=DEIN_KEY
GEMINI_MODEL=gemini-2.5-flash
```

Den echten Key niemals committen. `.env` ist deshalb in `.gitignore` eingetragen.

### 3. Einmalige Einrichtung

Rechtsklick auf `setup-windows.ps1` bzw. in PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup-windows.ps1
```

### 4. Start

Doppelklick auf `start-agent.bat`.

Die App startet das lokale Python-Backend und die Vite-Oberfläche. Die Oberfläche läuft standardmäßig unter `http://127.0.0.1:5173`.

## Bedienung

**↑** sendet eine normale Gemini-Chat-Nachricht.

**▶** nimmt deinen aktuellen Auftrag und startet den sicheren Multi-Step-Agenten. Dieser darf in v0.3 ausschließlich `notepad`, `calc`, `explorer` und die Downloads-Auflistung verwenden.

**⏻ PC herunterfahren** fordert immer eine zweite Bestätigung an und startet den Windows-Shutdown mit 30 Sekunden Vorlauf.

## Architektur

```text
React UI
   │
   ▼
Vite Proxy
   │
   ▼
FastAPI (localhost)
   ├── Gemini Brain
   ├── Agent Planner
   └── Safe PC Tools
```

## Sicherheit

Der Agent erhält nicht automatisch uneingeschränkte Kontrolle über Windows. Lokale Aktionen liegen hinter einer Tool-Allowlist. Der Multi-Step-Agent akzeptiert keine Shell-/PowerShell-Befehle, beliebige Programme, Shutdown-Schritte oder Spielautomatisierung aus Gemini-Ausgaben.

Online-Spiele werden nicht automatisch gespielt, gelevelt oder gebottet. Für Spiele ist stattdessen ein Coaching-/Analysemodus vorgesehen.
