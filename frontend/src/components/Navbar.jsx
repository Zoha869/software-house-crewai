import React from 'react';
import { Sun, Moon, Sparkles, Activity, ShieldCheck, RefreshCw, Terminal, Layers } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, serverStatus, onReset, isRunning, onOpenArchitecture }) {
  return (
    <header className="glass-header" style={{ padding: '14px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px var(--accent-glow)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                CrewAI <span className="gradient-text">Software House</span>
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--border-color)',
                textTransform: 'uppercase'
              }}>
                8-Agent Pipeline
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Autonomous End-to-End Software Engineering & Quality Assurance
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Server Connection Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 500,
            background: serverStatus === 'connected' ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
            color: serverStatus === 'connected' ? 'var(--status-success-text)' : 'var(--status-error-text)',
            border: `1px solid ${serverStatus === 'connected' ? 'var(--status-success-border)' : 'var(--status-error-border)'}`
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: serverStatus === 'connected' ? '#10b981' : '#ef4444',
              boxShadow: serverStatus === 'connected' ? '0 0 8px #10b981' : 'none'
            }} />
            <span>FastAPI: {serverStatus === 'connected' ? 'Connected (8000)' : 'Checking...'}</span>
          </div>

          {/* Architecture Modal Button */}
          <button 
            onClick={onOpenArchitecture}
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            title="View System Architecture & Flow"
          >
            <Layers size={16} />
            <span>Architecture</span>
          </button>

          {/* Reset button */}
          <button 
            onClick={onReset}
            disabled={isRunning}
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            title="Clear all outputs and start fresh"
          >
            <RefreshCw size={16} className={isRunning ? 'spin' : ''} />
            <span>Reset</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '8px 12px', borderRadius: '10px' }}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun size={18} style={{ color: '#fbbf24' }} />
            ) : (
              <Moon size={18} style={{ color: '#6366f1' }} />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
