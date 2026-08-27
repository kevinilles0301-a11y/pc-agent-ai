# PC Agent AI

Moderner Windows-PC-Agent mit ChatGPT-ähnlicher Oberfläche, Gemini als KI-Brain und einer lokalen API für freigegebene PC-Aktionen.

## Enthalten in v0.2

- 💬 moderne React/Vite-Chat-Oberfläche
- 🧠 Gemini-Anbindung über das offizielle `google-genai`-SDK
- 🔌 lokale FastAPI-Brücke auf `127.0.0.1:8765`
- 🖥️ sichere PC-Tools: Editor, Rechner, Explorer, Downloads-Auflistung, Screenshot
- ⏻ Shutdown als geschützte Abschlussaktion mit ausdrücklicher Bestätigung
- 🔐 API-Key wird nur lokal über `.env` bzw. `GEMINI_API_KEY` geladen

Google empfiehlt aktuell das neue GenAI-SDK für Gemini-Anwendungen; stabile Gemini-Modelle umfassen u. a. Gemini 2.5 Flash. citehttps://ai.google.dev/gemini-api/docs/get-startedhttps://ai.google.dev/gemini-api/docs/models

## Start unter Windows

### 1. Gemini-Key einrichten

Erstelle in diesem Projekt eine `.env`-Datei anhand von `.env.example` und setze:

```env
GEMINI_API_KEY=DEIN_KEY
GEMINI_MODEL=gemini-2.5-flash
```

Alternativ kann `GEMINI_API_KEY` als Windows-Umgebungsvariable gesetzt werden.

### 2. Agent-Backend starten

Doppelklick auf `run-agent.bat` oder:

```powershell
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m backend.server
```

### 3. Oberfläche starten

In einem zweiten Terminal:

```powershell
npm install
npm run dev
```

Danach die angezeigte lokale Vite-Adresse öffnen.

## Architektur

```text
React UI
   │
   ▼
FastAPI (localhost)
   │
   ├── Gemini Brain
   └── Safe PC Tools
```

## Sicherheit

Der Agent erhält nicht automatisch uneingeschränkte Kontrolle über Windows. Lokale Aktionen liegen hinter einer expliziten Tool-Allowlist. Shutdown benötigt eine zweite Bestätigung in der Oberfläche und wird mit 30 Sekunden Vorlauf ausgelöst.

Online-Spiele werden nicht automatisch gespielt, gelevelt oder gebottet. Für Spiele ist ein späterer Coaching-/Analysemodus vorgesehen.
