import React from 'react';
import { CheckCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { AGENTS_METADATA } from '../data/agentInfo';

export default function PipelineStepper({ 
  agentStates, 
  currentAgentIndex, 
  onSelectAgent, 
  selectedAgentIndex, 
  pipelineStatus,
  elapsedSeconds 
}) {
  const completedCount = agentStates.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / AGENTS_METADATA.length) * 100);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '28px' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            Live Execution Pipeline
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Sequential agent orchestration with live state tracking
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Elapsed Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <Clock size={16} />
            <span>Time: {formatTime(elapsedSeconds)}</span>
          </div>

          {/* Progress Percent */}
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)'
          }}>
            {progressPercent}% Complete ({completedCount}/{AGENTS_METADATA.length})
          </div>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div style={{
        height: '6px',
        width: '100%',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '20px',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: 'var(--accent-gradient)',
          borderRadius: '3px',
          transition: 'width 0.4s ease'
        }} />
      </div>

      {/* 8 Agent Cards Horizontal Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '10px'
      }}>
        {AGENTS_METADATA.map((agent, idx) => {
          const state = agentStates[idx] || { status: 'pending' };
          const isSelected = selectedAgentIndex === idx;
          const isRunning = state.status === 'running';
          const isCompleted = state.status === 'completed';
          const isError = state.status === 'error';

          let borderColor = 'var(--border-color)';
          let bgColor = 'var(--bg-secondary)';
          if (isRunning) {
            borderColor = 'var(--accent-primary)';
            bgColor = 'var(--status-running-bg)';
          } else if (isCompleted) {
            borderColor = 'rgba(16, 185, 129, 0.4)';
          } else if (isError) {
            borderColor = 'rgba(239, 68, 68, 0.4)';
          }

          if (isSelected) {
            borderColor = 'var(--accent-primary)';
            bgColor = 'var(--bg-card-hover)';
          }

          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(idx)}
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '12px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: isRunning ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              {/* Step Number + Status Icon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  0{idx + 1}
                </span>

                {isRunning && (
                  <span className="badge badge-running" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                    Active
                  </span>
                )}
                {isCompleted && (
                  <CheckCircle size={14} style={{ color: '#10b981' }} />
                )}
                {isError && (
                  <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                )}
                {!isRunning && !isCompleted && !isError && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                )}
              </div>

              {/* Agent Name */}
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                lineHeight: 1.3,
                marginBottom: '4px'
              }}>
                {agent.name}
              </div>

              {/* Tool Badge */}
              <div style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {agent.tool}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
