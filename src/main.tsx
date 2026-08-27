import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Message = { role: 'user' | 'assistant'; text: string };

type ApiMessage = { role: 'user' | 'assistant'; content: string };

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || 'Agent API nicht erreichbar.');
  return body as T;
}

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! Ich bin PC Agent AI. Beschreibe einfach, was du am PC erledigt haben möchtest.' },
  ]);
  const [running, setRunning] = useState(false);
  const [shutdownArmed, setShutdownArmed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const history: ApiMessage[] = useMemo(() => messages.map((m) => ({ role: m.role, content: m.text })), [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || running) return;
    setInput('');
    setNotice(null);
    setMessages((m) => [...m, { role: 'user', text }]);
    setRunning(true);
    try {
      const data = await api<{ text: string }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, history }),
      });
      setMessages((m) => [...m, { role: 'assistant', text: data.text }]);
    } catch (error) {
      setMessages((m) => [...m, { role: 'assistant', text: `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` }]);
    } finally {
      setRunning(false);
    }
  };

  const runAction = async (action: 'open_program' | 'list_downloads' | 'screenshot' | 'shutdown', argument = '', confirm = false) => {
    setNotice(null);
    try {
      const data = await api<any>('/api/action', { method: 'POST', body: JSON.stringify({ action, argument, confirm }) });
      if (action === 'shutdown' && data.requires_confirmation) {
        setShutdownArmed(true);
        setNotice('Shutdown ist vorbereitet. Drücke „PC herunterfahren“, um die Aktion ausdrücklich zu bestätigen.');
        return;
      }
      if (action === 'list_downloads') {
        setMessages((m) => [...m, { role: 'assistant', text: data.items?.length ? `Downloads (${data.items.length}):\n${data.items.join('\n')}` : 'Der Downloads-Ordner ist leer oder existiert nicht.' }]);
      } else if (action === 'screenshot') {
        setMessages((m) => [...m, { role: 'assistant', text: 'Screenshot wurde lokal aufgenommen.' }]);
        setNotice('Screenshot erfolgreich aufgenommen. Die Bildanalyse kann als nächster Agent-Schritt angeschlossen werden.');
      } else {
        setNotice(data.message || 'Aktion erfolgreich ausgeführt.');
        setShutdownArmed(false);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Aktion fehlgeschlagen.');
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="logo">✦</div><div><strong>PC Agent</strong><span>AI</span></div></div>
        <button className="new-chat" onClick={() => { setMessages([{ role: 'assistant', text: 'Neuer Auftrag gestartet. Was soll ich für dich erledigen?' }]); setNotice(null); }}>＋ Neuer Auftrag</button>
        <div className="side-section"><small>TOOLS</small>
          <button className="history" onClick={() => runAction('list_downloads')}>▣ Downloads anzeigen</button>
          <button className="history" onClick={() => runAction('open_program', 'notepad')}>◒ Editor öffnen</button>
          <button className="history" onClick={() => runAction('open_program', 'rechner')}>◈ Rechner öffnen</button>
          <button className="history" onClick={() => runAction('screenshot')}>◉ Screenshot</button>
        </div>
        <div className="side-bottom"><div className="status"><i /> {running ? 'Agent arbeitet' : 'Agent bereit'}</div><div className="settings">⚙ Gemini über lokale API</div></div>
      </aside>

      <main className="main">
        <header><div><h1>PC Agent AI</h1><p>{running ? 'Gemini denkt über deinen Auftrag nach…' : 'Bereit für deinen nächsten Auftrag'}</p></div><div className="avatar">K</div></header>
        <section className="chat">
          <div className="messages">
            {messages.map((m, i) => <div className={`message-row ${m.role}`} key={`${i}-${m.text.slice(0, 8)}`}><div className="bubble">{m.text}</div></div>)}
          </div>
          <div className="composer-wrap">
            {notice && <div className="notice">{notice}</div>}
            {shutdownArmed && <div className="shutdown-confirm"><span>⏻</span><div><strong>PC herunterfahren?</strong><small>Windows wird in 30 Sekunden herunterfahren.</small></div><button onClick={() => runAction('shutdown', '', true)}>Bestätigen</button></div>}
            <div className="suggestions">
              <button onClick={() => setInput('Öffne den Editor und erkläre mir, was ich als Nächstes tun soll')}>🧠 Aufgabe starten</button>
              <button onClick={() => setInput('Zeige mir, was sich in meinem Downloads-Ordner befindet')}>📁 Dateien prüfen</button>
              <button onClick={() => setInput('Erkläre mir Schritt für Schritt, wie ich eine Aufgabe am PC erledige')}>✓ Plan erstellen</button>
            </div>
            <div className="composer">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder="Was soll ich für dich erledigen?" rows={1} />
              <button className="send" onClick={() => void send()} disabled={!input.trim() || running}>↑</button>
            </div>
            <div className="hint">Enter zum Senden · Shift + Enter für neue Zeile · Aktionen laufen lokal</div>
          </div>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
