import React from 'react';
import { X, Layers, Cpu, Code, CheckCircle, Shield, Gauge, Target, FileText, ArrowRight } from 'lucide-react';
import { AGENTS_METADATA } from '../data/agentInfo';

export default function SystemDesignModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }} onClick={onClose}>
      
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: 'var(--bg-secondary)',
          position: 'relative',
          border: '1px solid var(--border-highlight)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
              System Architecture & Agent-to-Tool Design
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              CrewAI 8-Agent Software Engineering Pipeline Specification
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Pipeline Architecture Diagram */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>
            Sequential Pipeline Data Flow
          </h3>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            overflowX: 'auto'
          }}>
            <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
              [Requirements Document]
            </div>
            <div style={{ paddingLeft: '16px', color: 'var(--text-muted)' }}>↓ (FileReadTool)</div>
            <div style={{ color: '#818cf8' }}>[1. Feature Extractor] → Structured Features & Assumptions</div>
            <div style={{ paddingLeft: '16px', color: 'var(--text-muted)' }}>↓ (WebsiteSearch / Serper)</div>
            <div style={{ color: '#a855f7' }}>[2. Architect] → Architecture Doc, Tech Stack & Components</div>
            <div style={{ paddingLeft: '16px', color: 'var(--text-muted)' }}>↓ (FileWriterTool, CodeInterpreterTool)</div>
            <div style={{ color: '#06b6d4' }}>[3. Developer] → Production Code & File Structure</div>
            <div style={{ paddingLeft: '16px', color: 'var(--text-muted)' }}>↓ context=[development_task]</div>
            <div style={{ color: '#10b981', paddingLeft: '12px' }}>
              ├─ [4. QA Tester] (CodeInterpreterTool) → Functional Pass/Fail<br />
              ├─ [5. Security Reviewer] (SerperDevTool, FileReadTool) → OWASP Top 4 Audit<br />
              ├─ [6. Performance Reviewer] (CodeInterpreterTool) → Complexity & N+1<br />
              └─ [7. Maintainability Reviewer] (FileReadTool) → Naming & Coupling
            </div>
            <div style={{ paddingLeft: '16px', color: 'var(--text-muted)' }}>↓ context=[qa_task]</div>
            <div style={{ color: '#14b8a6' }}>[8. Test Coverage Reviewer] (CodeInterpreterTool) → Untested/Untestable Gaps</div>
          </div>
        </div>

        {/* 8 Agent Table */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>
            Agent Responsibility & Tool Mapping
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                  <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>#</th>
                  <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Agent Role</th>
                  <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Assigned Tool</th>
                  <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Core Responsibility</th>
                </tr>
              </thead>
              <tbody>
                {AGENTS_METADATA.map((agent, idx) => (
                  <tr key={agent.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--accent-primary)' }}>0{idx + 1}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{agent.name}</td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{agent.tool}</td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{agent.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Close CTA */}
        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            Got It
          </button>
        </div>

      </div>
    </div>
  );
}
