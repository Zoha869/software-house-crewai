import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { getProjects } from './utils/projectStore';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('sh_theme') || 'dark');
  const [serverStatus, setServerStatus] = useState('checking');
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [initialProjectId, setInitialProjectId] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sh_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        setServerStatus(res.ok ? 'connected' : 'error');
      } catch (err) {
        setServerStatus('error');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartProject = () => {
    setInitialProjectId(null);
    setView('dashboard');
  };

  const handleViewProjects = () => {
    const projects = getProjects();
    if (projects.length > 0) {
      setInitialProjectId(projects[0].id);
    }
    setView('dashboard');
  };

  const handleBackToLanding = () => {
    setView('landing');
    setInitialProjectId(null);
  };

  const hasProjects = getProjects().length > 0;

  return (
    <div className="app-container">
      <div className="bg-mesh" />

      {/* Top Navbar */}
      <header className="glass-header" style={{ padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={handleBackToLanding}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
            }}>
              F
            </div>
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
                Nex<span className="gradient-text">build</span>
              </h1>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                client portal
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.74rem',
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

            {view === 'landing' && (
              <button className="btn-primary" onClick={handleStartProject} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                New Project
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="btn-secondary"
              style={{ padding: '8px 10px', borderRadius: '10px' }}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <span style={{ fontSize: '0.9rem' }}>☀️</span>
              ) : (
                <span style={{ fontSize: '0.9rem' }}>🌙</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {view === 'landing' ? (
          <LandingPage
            onStartProject={handleStartProject}
            hasProjects={hasProjects}
            onViewProjects={handleViewProjects}
          />
        ) : (
          <Dashboard
            apiBase={API_BASE_URL}
            onNewProject={handleStartProject}
            onBackToLanding={handleBackToLanding}
            initialProjectId={initialProjectId}
          />
        )}
      </main>

      <footer style={{
        padding: '20px 0',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        marginTop: '20px'
      }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>
          Nexbuild — AI-powered software studio · CrewAI & FastAPI · React & Vite
        </p>
      </footer>
    </div>
  );
}