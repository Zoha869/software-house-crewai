import React from 'react';
import { Sun, Moon, RefreshCw, Layers, Compass } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, serverStatus, onReset, isRunning, onOpenArchitecture }) {
  return (
    <header className="glass-header" style={{ padding: '14px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
          }}>
            <Compass size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
              Nex<span className="gradient-text">build</span>
            </h1>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              autonomous design-build studio
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.76rem',
            fontFamily: 'var(--font-mono)',
            background: serverStatus === 'connected' ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
            color: serverStatus === 'connected' ? 'var(--status-success-text)' : 'var(--status-error-text)',
            border: `1px solid ${serverStatus === 'connected' ? 'var(--status-success-border)' : 'var(--status-error-border)'}`
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: 'currentColor',
              boxShadow: serverStatus === 'connected' ? '0 0 6px currentColor' : 'none'
            }} />
            <span>{serverStatus === 'connected' ? 'Studio online' : 'Connecting...'}</span>
          </div>

          <button
            onClick={onOpenArchitecture}
            className="btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
            title="View System Architecture & Flow"
          >
            <Layers size={15} />
            <span>Architecture</span>
          </button>

          <button
            onClick={onReset}
            disabled={isRunning}
            className="btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
            title="Start a new project"
          >
            <RefreshCw size={15} className={isRunning ? 'spin' : ''} />
            <span>New Project</span>
          </button>

          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '8px 10px', borderRadius: '10px' }}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun size={17} style={{ color: 'var(--accent-primary)' }} />
            ) : (
              <Moon size={17} style={{ color: 'var(--accent-cyan)' }} />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
