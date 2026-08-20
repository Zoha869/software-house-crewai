import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Loader2, ChevronDown, ChevronUp, ThumbsUp, MessageSquare, Eye, Sparkles, AlertCircle } from 'lucide-react';
import { AGENTS_METADATA } from '../data/agentInfo';
import { generateClientSummary } from '../utils/summaryGenerator';
import MarkdownRenderer from './MarkdownRenderer';
import FeedbackPanel from './FeedbackPanel';
import CodeExplorer from './CodeExplorer';
import ArchitectureView from './ArchitectureView';
import FindingsView from './FindingsView';
import CoverageView from './CoverageView';

const DETAIL_LABEL = {
  architect: 'System Design',
  developer: 'Source Code',
  qa_tester: 'Test Results',
  security_reviewer: 'Security Findings',
  performance_reviewer: 'Performance Findings',
  maintainability_reviewer: 'Maintainability Findings',
  test_coverage_reviewer: 'Coverage Report',
};

function AgentCard({ agent, state, index, isCurrent, feedback, onFeedback, isLast }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const cardRef = useRef(null);

  const isCompleted = state.status === 'completed';
  const isRunning = state.status === 'running';
  const isPending = state.status === 'pending';

  // Auto-scroll into view when this card becomes active
  useEffect(() => {
    if (isCurrent && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isCurrent]);

  const clientSummary = isCompleted ? generateClientSummary(agent.id, state.output) : '';

  return (
    <div
      ref={cardRef}
      className={`agent-card ${isCompleted ? 'completed' : ''} ${isRunning ? 'running' : ''} ${isPending ? 'pending' : ''} ${isCurrent ? 'current' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Card Header */}
      <div className="agent-card-header">
        <div className="agent-card-icon" style={{ background: `${agent.color}22`, color: agent.color }}>
          {isCompleted ? (
            <CheckCircle2 size={20} />
          ) : isRunning ? (
            <Loader2 size={20} className="spin" />
          ) : (
            <span className="agent-card-number">{String(index + 1).padStart(2, '0')}</span>
          )}
        </div>
        <div className="agent-card-title">
          <div className="agent-card-name-row">
            <h3>{agent.name}</h3>
            <span className="agent-stage-badge">{agent.stage}</span>
          </div>
          <div className="agent-card-role">{agent.role}</div>
        </div>
        <div className="agent-card-status">
          {isCompleted && <span className="status-badge approved"><CheckCircle2 size={12} /> Done</span>}
          {isRunning && <span className="status-badge working"><Loader2 size={12} className="spin" /> Working...</span>}
          {isPending && <span className="status-badge waiting">Waiting</span>}
        </div>
      </div>

      {/* Card Body - only show when completed or running */}
      {isCompleted && (
        <div className="agent-card-body">
          {/* Client-friendly summary */}
          <div className="client-summary">
            <div className="summary-label">
              <Sparkles size={12} />
              <span>What this means for you</span>
            </div>
            <MarkdownRenderer content={clientSummary} />
          </div>

          {/* Feedback status */}
          {feedback && (
            <div className={`feedback-status ${feedback.type}`}>
              {feedback.type === 'approved' ? (
                <>
                  <ThumbsUp size={14} />
                  <span>You approved this step</span>
                </>
              ) : (
                <>
                  <MessageSquare size={14} />
                  <span>You requested changes: "{feedback.comment}"</span>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="agent-card-actions">
            <button
              className="btn-secondary btn-sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye size={14} />
              <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              className="btn-secondary btn-sm"
              onClick={() => setShowFeedback(!showFeedback)}
            >
              <MessageSquare size={14} />
              <span>{feedback ? 'Update Feedback' : 'Give Feedback'}</span>
            </button>
          </div>

          {/* Technical details (collapsed by default) — rendered per-agent-type */}
          {showDetails && (
            <div className="technical-details">
              <div className="details-header">
                <span>{DETAIL_LABEL[agent.id] || 'Technical Details'}</span>
                <span className="details-hint">For developers & technical review</span>
              </div>
              {agent.id === 'architect' ? (
                <ArchitectureView rawOutput={state.output} />
              ) : agent.id === 'developer' ? (
                <CodeExplorer rawOutput={state.output} />
              ) : agent.id === 'qa_tester' ? (
                <FindingsView rawOutput={state.output} mode="status" />
              ) : ['security_reviewer', 'performance_reviewer', 'maintainability_reviewer'].includes(agent.id) ? (
                <FindingsView rawOutput={state.output} mode="severity" />
              ) : agent.id === 'test_coverage_reviewer' ? (
                <CoverageView rawOutput={state.output} />
              ) : (
                <MarkdownRenderer content={state.output} />
              )}
            </div>
          )}

          {/* Feedback panel */}
          {showFeedback && (
            <FeedbackPanel
              agentName={agent.name}
              existingFeedback={feedback}
              onSubmit={(type, comment) => {
                onFeedback(index, type, comment);
                setShowFeedback(false);
              }}
            />
          )}
        </div>
      )}

      {/* Running state */}
      {isRunning && (
        <div className="agent-card-body running-body">
          <div className="running-indicator">
            <div className="pulse-dot" />
            <span>{agent.name} is working on this step...</span>
          </div>
          <div className="running-progress">
            <div className="running-bar" />
          </div>
        </div>
      )}

      {/* Pending state */}
      {isPending && (
        <div className="agent-card-body pending-body">
          <span className="pending-text">Waiting for previous steps to complete</span>
        </div>
      )}

      {/* Connector line to next card */}
      {!isLast && (
        <div className="agent-connector">
          <div className={`connector-line ${isCompleted ? 'filled' : ''}`} />
        </div>
      )}
    </div>
  );
}

export default function PipelineFeed({
  agentStates,
  currentAgentIndex,
  pipelineStatus,
  elapsedSeconds,
  finalOutput,
  feedback,
  onFeedback,
}) {
  const feedRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const completedCount = agentStates.filter(s => s.status === 'completed').length;
  const totalAgents = AGENTS_METADATA.length;
  const progressPct = Math.round((completedCount / totalAgents) * 100);

  // Auto-scroll to bottom when new cards complete
  useEffect(() => {
    if (autoScroll && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [agentStates, autoScroll]);

  const formatElapsed = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="pipeline-feed">
      {/* Pipeline Header */}
      <div className="pipeline-header">
        <div className="pipeline-header-left">
          <div className="eyebrow">Project Progress</div>
          <h2>Your Project Pipeline</h2>
          <p>
            Watch each specialist complete their step in real-time. 
            Every card appears as soon as it's done — no need to search.
          </p>
        </div>
        <div className="pipeline-header-right">
          <div className="pipeline-progress-ring" style={{ '--progress': `${progressPct * 3.6}deg` }}>
            <div className="ring-inner">
              <span className="ring-pct">{progressPct}%</span>
            </div>
          </div>
          <div className="pipeline-stats">
            <div className="stat-row">
              <span className="stat-label">Steps Done</span>
              <span className="stat-value">{completedCount}/{totalAgents}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Time</span>
              <span className="stat-value">{formatElapsed(elapsedSeconds)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Status</span>
              <span className={`stat-value status-${pipelineStatus}`}>{pipelineStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="pipeline-progress-bar">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="progress-steps">
          {AGENTS_METADATA.map((agent, idx) => {
            const state = agentStates[idx] || { status: 'pending' };
            return (
              <div
                key={agent.id}
                className={`progress-step ${state.status}`}
                title={`${agent.name}: ${state.status}`}
              >
                <div className="step-dot" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-scroll toggle */}
      <div className="feed-controls">
        <button
          className={`auto-scroll-btn ${autoScroll ? 'active' : ''}`}
          onClick={() => setAutoScroll(!autoScroll)}
        >
          <span className={`scroll-dot ${autoScroll ? 'on' : ''}`} />
          Auto-scroll {autoScroll ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Agent Cards Feed */}
      <div className="agent-feed" ref={feedRef}>
        {AGENTS_METADATA.map((agent, idx) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            state={agentStates[idx] || { status: 'pending', output: '' }}
            index={idx}
            isCurrent={currentAgentIndex === idx}
            isLast={idx === AGENTS_METADATA.length - 1}
            feedback={feedback[idx]}
            onFeedback={onFeedback}
          />
        ))}

        {/* Final completion banner */}
        {pipelineStatus === 'completed' && (
          <div className="pipeline-complete-banner">
            <div className="complete-icon">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3>All steps complete!</h3>
              <p>Your project has passed all quality checks. Scroll down to see the full summary.</p>
            </div>
          </div>
        )}

        {pipelineStatus === 'error' && (
          <div className="pipeline-error-banner">
            <AlertCircle size={20} />
            <span>Something went wrong during the pipeline. Please try again.</span>
          </div>
        )}
      </div>
    </div>
  );
}