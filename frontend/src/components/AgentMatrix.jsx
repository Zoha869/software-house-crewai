import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, CheckCircle2, AlertCircle, Download, ExternalLink } from 'lucide-react';
import { AGENTS_METADATA } from '../data/agentInfo';

export default function AgentMatrix({ 
  agentStates, 
  selectedAgentIndex, 
  onSelectAgent, 
  finalOutput 
}) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'raw'

  const currentAgent = AGENTS_METADATA[selectedAgentIndex];
  const currentState = agentStates[selectedAgentIndex] || { status: 'pending', output: '' };

  const handleCopy = () => {
    if (currentState.output) {
      navigator.clipboard.writeText(currentState.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFullReport = () => {
    let report = `# Autonomous Software House — Complete 8-Agent Engineering Report\n\n`;
    AGENTS_METADATA.forEach((agent, idx) => {
      const state = agentStates[idx] || {};
      report += `## Agent ${idx + 1}: ${agent.name} (${agent.role})\n`;
      report += `**Tool Assigned:** ${agent.tool}\n\n`;
      report += `### Output:\n${state.output || '*(No output)*'}\n\n---\n\n`;
    });
    if (finalOutput) {
      report += `## Final Crew Result\n${finalOutput}\n`;
    }

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `software_engineering_report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple clean markdown formatter helper
  const renderFormattedContent = (raw) => {
    if (!raw) return null;
    
    // Split into sections or code blocks
    const lines = raw.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBuffer = [];
    let codeLanguage = '';

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`}>
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
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
      elements.push(
        <pre key="code-end">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        
        {/* Agent Info Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            fontWeight: 800,
            fontSize: '1rem',
            border: '1px solid var(--border-color)'
          }}>
            0{selectedAgentIndex + 1}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                {currentAgent.name}
              </h3>
              <span className={`badge badge-${currentState.status}`}>
                {currentState.status}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {currentAgent.role} • <strong>Tool:</strong> {currentAgent.tool}
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-tertiary)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setViewMode('formatted')}
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: viewMode === 'formatted' ? 'var(--bg-secondary)' : 'transparent',
                color: viewMode === 'formatted' ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}
            >
              Formatted
            </button>
            <button
              onClick={() => setViewMode('raw')}
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: viewMode === 'raw' ? 'var(--bg-secondary)' : 'transparent',
                color: viewMode === 'raw' ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}
            >
              Raw Text
            </button>
          </div>

          <button
            onClick={handleCopy}
            disabled={!currentState.output}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadFullReport}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            title="Download Full Markdown Report"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>

      </div>

      {/* Output Content Area */}
      <div style={{
        minHeight: '280px',
        maxHeight: '520px',
        overflowY: 'auto',
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        {currentState.output ? (
          viewMode === 'formatted' ? (
            <div className="markdown-content">
              {renderFormattedContent(currentState.output)}
            </div>
          ) : (
            <pre style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'var(--text-primary)'
            }}>
              {currentState.output}
            </pre>
          )
        ) : (
          <div style={{
            height: '240px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            textAlign: 'center',
            gap: '12px'
          }}>
            {currentState.status === 'running' ? (
              <>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  Agent is currently executing...
                </p>
                <p style={{ fontSize: '0.82rem', maxWidth: '400px' }}>
                  {currentAgent.name} is performing its task. Output will appear here automatically when done.
                </p>
              </>
            ) : (
              <>
                <Terminal size={36} style={{ opacity: 0.5 }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                  Waiting for pipeline execution
                </p>
                <p style={{ fontSize: '0.82rem', maxWidth: '400px' }}>
                  {currentAgent.description}
                </p>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
