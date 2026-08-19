import React, { useState, useEffect, useRef } from 'react';
import { Send, ClipboardCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function IntakeChat({ apiBase, onFinalized, locked }) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [finalizedDoc, setFinalizedDoc] = useState(null);
  const [startError, setStartError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const res = await fetch(`${apiBase}/api/intake/start`, { method: 'POST' });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setSessionId(data.session_id);
        setMessages([{ role: 'assistant', content: data.reply }]);
      } catch (err) {
        if (!cancelled) setStartError('Could not reach the intake desk. Is the backend running?');
      }
    };
    start();
    return () => { cancelled = true; };
  }, [apiBase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const send = async () => {
    const text = input.trim();
    if (!text || !sessionId || isThinking) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsThinking(true);
    try {
      const res = await fetch(`${apiBase}/api/intake/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.ready && data.requirements_doc) {
        setFinalizedDoc(data.requirements_doc);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry — I lost connection for a second. Could you say that again?" }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (startError) {
    return (
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--status-error-text)' }}>
        <AlertCircle size={18} />
        <span style={{ fontSize: '0.88rem' }}>{startError}</span>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '20px 20px 16px', border: '1px solid var(--border-highlight)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div className="chat-avatar" style={{ width: '34px', height: '34px' }}>S</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Sana — Account Manager</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Front desk, Forge & Co.</div>
        </div>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-row ${m.role === 'user' ? 'from-user' : ''}`}>
            <div className="chat-avatar">{m.role === 'user' ? 'You' : 'S'}</div>
            <div className="chat-bubble">{m.content}</div>
          </div>
        ))}
        {isThinking && (
          <div className="chat-row">
            <div className="chat-avatar">S</div>
            <div className="chat-bubble">
              <span className="chat-typing"><span /><span /><span /></span>
            </div>
          </div>
        )}
      </div>

      {finalizedDoc && (
        <div className="work-order" style={{ margin: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <ClipboardCheck size={15} />
            <span>Work Order Ready</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Requirements confirmed. Send this to the engineering floor — 8 specialists pick it up from here.
          </p>
          <button
            className="btn-primary"
            disabled={locked}
            onClick={() => onFinalized(finalizedDoc)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {locked ? 'Sent to engineering' : 'Send to Engineering'}
            {!locked && <ArrowRight size={16} />}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!sessionId || isThinking || locked}
          placeholder={sessionId ? "Describe what you're building..." : 'Connecting to front desk...'}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            padding: '11px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-main)',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        <button
          className="btn-primary"
          onClick={send}
          disabled={!input.trim() || !sessionId || isThinking || locked}
          style={{ padding: '0 16px' }}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
