import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Message = { role: 'user' | 'assistant'; text: string };

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! Ich bin PC Agent AI. Beschreibe einfach, was du am PC erledigt haben möchtest.' },
  ]);
  const [running, setRunning] = useState(false);

  const send = () => {
    const text = input.trim();
    if (!text || running) return;
    setMessages((m) => [...m, { role: 'user', text }, { role: 'assistant', text: 'Verstanden. Ich plane die Aufgabe. Die PC-Steuerung wird in der nächsten Agent-Version angebunden.' }]);
    setInput('');
  };

  const example = (text: string) => setInput(text);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="logo">✦</div><div><strong>PC Agent</strong><span>AI</span></div></div>
        <button className="new-chat" onClick={() => setMessages([{ role: 'assistant', text: 'Neuer Chat gestartet. Was soll ich für dich erledigen?' }])}>＋ Neuer Auftrag</button>
        <div className="side-section"><small>HEUTE</small><div className="history active">◌ PC Agent starten</div><div className="history">◌ Meine Aufgaben</div></div>
        <div className="side-bottom"><div className="status"><i /> Agent bereit</div><div className="settings">⚙ Einstellungen</div></div>
      </aside>

      <main className="main">
        <header><div><h1>PC Agent AI</h1><p>{running ? 'Agent arbeitet…' : 'Bereit für deinen nächsten Auftrag'}</p></div><div className="avatar">K</div></header>
        <section className="chat">
          <div className="messages">
            {messages.map((m, i) => <div className={`message-row ${m.role}`} key={i}><div className="bubble">{m.text}</div></div>)}
          </div>
          <div className="composer-wrap">
            <div className="suggestions">
              <button onClick={() => example('Öffne Chrome und recherchiere etwas für mich')}>🌐 Browser-Aufgabe</button>
              <button onClick={() => example('Organisiere meinen Downloads-Ordner')}>📁 Dateien organisieren</button>
              <button onClick={() => example('Plane eine Aufgabe und prüfe am Ende das Ergebnis')}>✓ Aufgabe planen</button>
            </div>
            <div className="composer">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Was soll ich für dich erledigen?" rows={1} />
              <button className="send" onClick={send} disabled={!input.trim() || running}>↑</button>
            </div>
            <div className="hint">Enter zum Senden · Shift + Enter für neue Zeile</div>
          </div>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
