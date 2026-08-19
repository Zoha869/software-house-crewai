import React, { useState } from 'react';
import { Copy, Check, Terminal, Download, Clock } from 'lucide-react';
import { AGENTS_METADATA } from '../data/agentInfo';

function renderFormattedContent(raw) {
  if (!raw) return null;
  const lines = raw.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(<pre key={`code-${index}`}><code>{codeBuffer.join('\n')}</code></pre>);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      codeBuffer.push(line);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={index}>{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={index}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={index}>{line.slice(4)}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<li key={index}>{line.slice(2)}</li>);
    } else if (line.trim() === '') {
      elements.push(<div key={index} style={{ height: '8px' }} />);
    } else {
      elements.push(<p key={index}>{line}</p>);
    }
  });

  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(<pre key="code-end"><code>{codeBuffer.join('\n')}</code></pre>);
  }
  return elements;
}

function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function DrawingSet({
  agentStates,
  currentAgentIndex,
  selectedAgentIndex,
  onSelectAgent,
  pipelineStatus,
  elapsedSeconds,
  finalOutput,
}) {
  const [copied, setCopied] = useState(false);

  const completedCount = agentStates.filter(s => s.status === 'completed').length;
  const fillPct = Math.max(4, Math.round((completedCount / AGENTS_METADATA.length) * 100));

  const currentAgent = AGENTS_METADATA[selectedAgentIndex];
  const currentState = agentStates[selectedAgentIndex] || { status: 'pending', output: '' };

  const handleCopy = () => {
    if (currentState.output) {
      navigator.clipboard.writeText(currentState.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownloadFullReport = () => {
    let report = `# Forge & Co. — Engineering Report\n\n`;
    AGENTS_METADATA.forEach((agent, idx) => {
      const state = agentStates[idx] || {};
      report += `## Sheet ${agent.sheet} — ${agent.name} (${agent.role})\n`;
      report += `**Dept:** ${agent.dept}\n\n`;
      report += `### Output:\n${state.output || '*(No output)*'}\n\n---\n\n`;
    });
    if (finalOutput) report += `## Final Result\n${finalOutput}\n`;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forge_and_co_report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="fade-up" style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div className="eyebrow">Drawing Set — {completedCount} of {AGENTS_METADATA.length} sheets</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <Clock size={13} />
          <span>{formatElapsed(elapsedSeconds)}</span>
          <span className={`badge badge-${pipelineStatus === 'running' ? 'running' : pipelineStatus === 'completed' ? 'completed' : pipelineStatus === 'error' ? 'error' : 'pending'}`} style={{ marginLeft: '6px' }}>
            {pipelineStatus}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: '20px' }} className="drawing-set-grid">
        {/* Sheet index */}
        <div className="sheet-set" style={{ position: 'relative', paddingLeft: '0' }}>
          <div className="sheet-track" style={{ height: '100%' }} />
          <div className="sheet-track-fill" style={{ height: `${fillPct}%` }} />
          {AGENTS_METADATA.map((agent, idx) => {
            const state = agentStates[idx] || { status: 'pending' };
            return (
              <div
                key={agent.id}
                className={`sheet-card ${selectedAgentIndex === idx ? 'is-selected' : ''} ${state.status === 'running' ? 'is-running' : ''} ${state.status === 'error' ? 'is-error' : ''}`}
                onClick={() => onSelectAgent(idx)}
                role="button"
                tabIndex={0}
              >
                {state.status === 'completed' && (
                  <span className="stamp">{agent.dept === 'AUDIT' ? 'Reviewed' : 'Approved'}</span>
                )}
                <div className={`sheet-node ${state.status}`}>{agent.sheet}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{agent.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>{agent.dept}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected sheet detail */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-primary)' }}>SHEET {currentAgent.sheet}</span>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{currentAgent.name}</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                {currentAgent.role} · <strong>{currentAgent.tool}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCopy} disabled={!currentState.output} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button onClick={handleDownloadFullReport} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div style={{ minHeight: '260px', maxHeight: '480px', overflowY: 'auto', padding: '4px 2px' }}>
            {currentState.output ? (
              <div className="markdown-content">{renderFormattedContent(currentState.output)}</div>
            ) : (
              <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '12px' }}>
                {currentState.status === 'running' ? (
                  <>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--accent-cyan)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Drafting this sheet...</p>
                  </>
                ) : (
                  <>
                    <Terminal size={32} style={{ opacity: 0.5 }} />
                    <p style={{ fontSize: '0.88rem', maxWidth: '360px' }}>{currentAgent.description}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .drawing-set-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
