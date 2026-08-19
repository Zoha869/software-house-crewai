import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, ArrowDown, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TerminalLogs({ logs, onClearLogs }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'agent' | 'system'
  const logEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (filter === 'agent') return log.type === 'agent_start' || log.type === 'agent_done';
    if (filter === 'system') return log.type === 'system' || log.type === 'error' || log.type === 'done';
    return true;
  });

  return (
    <div className="terminal-window" style={{ marginBottom: '32px' }}>
      
      {/* Terminal Title Bar */}
      <div className="terminal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="terminal-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--terminal-text)', fontFamily: 'var(--font-mono)' }}>
            site log — live floor activity
          </span>
        </div>

        {/* Filter & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                background: filter === 'all' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: filter === 'all' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('agent')}
              style={{
                background: filter === 'agent' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: filter === 'agent' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              Agents
            </button>
            <button
              onClick={() => setFilter('system')}
              style={{
                background: filter === 'system' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: filter === 'system' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              System
            </button>
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            style={{
              background: 'transparent',
              border: 'none',
              color: autoScroll ? '#34d399' : '#94a3b8',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={autoScroll ? 'Auto-scroll is ON' : 'Auto-scroll is OFF'}
          >
            <ArrowDown size={12} />
            <span>{autoScroll ? 'Scroll: ON' : 'Scroll: OFF'}</span>
          </button>

          <button
            onClick={onClearLogs}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Clear Console"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Stream Body */}
      <div className="terminal-body">
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', padding: '12px 0' }}>
            // Floor is quiet. Send a work order to engineering to see live activity...
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            let badgeColor = '#94a3b8';
            let icon = '⚡';
            if (log.type === 'agent_start') {
              badgeColor = '#60a5fa';
              icon = '🚀';
            } else if (log.type === 'agent_done') {
              badgeColor = '#34d399';
              icon = '✅';
            } else if (log.type === 'done') {
              badgeColor = '#a78bfa';
              icon = '🎉';
            } else if (log.type === 'error') {
              badgeColor = '#f87171';
              icon = '❌';
            }

            return (
              <div key={index} style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                  [{log.timestamp}]
                </span>
                <span style={{ color: badgeColor, fontWeight: 600, fontSize: '0.78rem' }}>
                  {icon} [{log.type.toUpperCase()}]:
                </span>
                <span style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>

    </div>
  );
}
