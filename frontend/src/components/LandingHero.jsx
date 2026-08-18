import React from 'react';
import { Play, Sparkles, FileText, CheckCircle2, ShieldCheck, Gauge, Layers, Terminal, AlertCircle } from 'lucide-react';
import { SAMPLE_REQUIREMENTS } from '../data/agentInfo';

export default function LandingHero({ 
  requirements, 
  setRequirements, 
  onStartRun, 
  isRunning, 
  runError 
}) {
  const loadPreset = (key) => {
    if (SAMPLE_REQUIREMENTS[key]) {
      setRequirements(SAMPLE_REQUIREMENTS[key]);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isRunning && requirements.trim()) {
      onStartRun();
    }
  };

  return (
    <section style={{ marginBottom: '32px' }}>
      {/* Hero Banner Title */}
      <div style={{ textAlign: 'center', marginBottom: '28px', maxWidth: '820px', margin: '0 auto 28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'var(--accent-glow)',
          border: '1px solid var(--border-highlight)',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--accent-primary)',
          marginBottom: '16px'
        }}>
          <Sparkles size={14} />
          <span>Next-Gen Autonomous Multi-Agent Engineering</span>
        </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '14px' }}>
          From Natural Language Spec to <br />
          <span className="gradient-text">Production Code & Multi-Pass Audits</span>
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          8 specialized CrewAI agents collaborate sequentially: extracting testable features, drafting architecture, generating clean code, and conducting rigorous security, performance, maintainability, and test coverage reviews.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>1. Feature Extraction</h3>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
            Unambiguous feature extraction with explicit assumption modeling.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>2. Scoped Architecture</h3>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
            Zero over-engineering; minimal, robust component hierarchy.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>3. Code Synthesis</h3>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
            Modular, runnable implementations with complete file structure.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>4. Quad Quality Audits</h3>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
            OWASP security, N+1 performance, dead abstractions & coverage gaps.
          </p>
        </div>
      </div>

      {/* Interactive Input Console */}
      <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-highlight)', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Preset Selector Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Input Requirement Specification</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Load Sample:</span>
            <button 
              type="button" 
              onClick={() => loadPreset('sample_default')}
              disabled={isRunning}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Task Manager CLI
            </button>
            <button 
              type="button" 
              onClick={() => loadPreset('auth_service')}
              disabled={isRunning}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Auth & Session API
            </button>
            <button 
              type="button" 
              onClick={() => loadPreset('url_shortener')}
              disabled={isRunning}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              URL Shortener
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            placeholder="Type or paste your software requirements document here..."
            rows={7}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              outline: 'none',
              resize: 'vertical',
              transition: 'border-color 0.2s ease',
            }}
          />
        </div>

        {/* Error Alert if any */}
        {runError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'var(--status-error-bg)',
            color: 'var(--status-error-text)',
            border: '1px solid var(--status-error-border)',
            marginBottom: '16px',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={18} />
            <div>
              <strong>Pipeline Error:</strong> {runError}
            </div>
          </div>
        )}

        {/* Bottom CTA Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            💡 Tip: Press <kbd style={{ padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>Ctrl + Enter</kbd> to launch
          </div>

          <button
            onClick={onStartRun}
            disabled={isRunning || !requirements.trim()}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            {isRunning ? (
              <>
                <Sparkles size={18} className="spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>Execute 8-Agent Pipeline</span>
              </>
            )}
          </button>
        </div>

      </div>
    </section>
  );
}
