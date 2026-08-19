import React, { useState, useEffect, useRef } from 'react';
import { PanelLeftClose, PanelLeftOpen, Plus, Trash2, Clock, CheckCircle2, AlertCircle, ChevronRight, FolderOpen } from 'lucide-react';
import { AGENTS_METADATA } from '../data/agentInfo';
import { getProjects, saveProject, deleteProject, extractProjectName } from '../utils/projectStore';
import PipelineFeed from './PipelineFeed';
import IntakeChat from './IntakeChat';
import FinalDiagram from './FinalDiagram';

const API_BASE_URL = 'http://localhost:8000';

export default function Dashboard({
  apiBase,
  onNewProject,
  onBackToLanding,
  initialProjectId,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projects, setProjects] = useState(() => getProjects());
  const [activeProjectId, setActiveProjectId] = useState(initialProjectId || null);
  const [view, setView] = useState(initialProjectId ? 'project' : 'intake');

  // Project state
  const [requirements, setRequirements] = useState(null);
  const [runId, setRunId] = useState(null);
  const [phase, setPhase] = useState('intake'); // intake | running | completed | error
  const [runError, setRunError] = useState(null);
  const [finalOutput, setFinalOutput] = useState(null);
  const [agentStates, setAgentStates] = useState(() =>
    AGENTS_METADATA.map(() => ({ status: 'pending', output: '' }))
  );
  const [currentAgentIndex, setCurrentAgentIndex] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [feedback, setFeedback] = useState({});
  const [projectName, setProjectName] = useState('');

  const eventSourceRef = useRef(null);
  const timerRef = useRef(null);

  // Load project from history if initialProjectId provided
  useEffect(() => {
    if (initialProjectId) {
      const project = getProjects().find(p => p.id === initialProjectId);
      if (project) {
        loadProject(project);
      }
    }
  }, [initialProjectId]);

  // Timer for running phase
  useEffect(() => {
    if (phase === 'running') {
      timerRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const loadProject = (project) => {
    setActiveProjectId(project.id);
    setView('project');
    setRequirements(project.requirements || null);
    setPhase(project.status || 'completed');
    setFinalOutput(project.finalOutput || null);
    setAgentStates(project.agentStates || AGENTS_METADATA.map(() => ({ status: 'pending', output: '' })));
    setFeedback(project.feedback || {});
    setProjectName(project.name || extractProjectName(project.requirements));
    setElapsedSeconds(0);
    setRunError(null);
  };

  const persistProject = (updates = {}) => {
    if (!activeProjectId) return;
    const existing = getProjects().find(p => p.id === activeProjectId);
    const project = {
      id: activeProjectId,
      name: projectName || extractProjectName(requirements),
      requirements,
      createdAt: existing?.createdAt || Date.now(),
      status: phase,
      agentStates,
      finalOutput,
      feedback,
      ...updates,
    };
    saveProject(project);
    setProjects(getProjects());
  };

  // Persist whenever key state changes
  useEffect(() => {
    if (activeProjectId && phase !== 'intake') {
      persistProject();
    }
  }, [phase, agentStates, finalOutput, feedback, projectName]);

  const handleStartIntake = () => {
    setView('intake');
    setActiveProjectId(null);
    setRequirements(null);
    setPhase('intake');
    setRunError(null);
    setFinalOutput(null);
    setAgentStates(AGENTS_METADATA.map(() => ({ status: 'pending', output: '' })));
    setFeedback({});
    setProjectName('');
    setElapsedSeconds(0);
    setCurrentAgentIndex(null);
  };

  const handleFinalized = async (finalizedRequirements) => {
    // Create a new project entry
    const newId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const name = extractProjectName(finalizedRequirements);
    
    setActiveProjectId(newId);
    setProjectName(name);
    setRequirements(finalizedRequirements);
    setPhase('running');
    setRunError(null);
    setFinalOutput(null);
    setElapsedSeconds(0);
    setAgentStates(AGENTS_METADATA.map(() => ({ status: 'pending', output: '' })));
    setFeedback({});
    setView('project');

    // Save initial project
    saveProject({
      id: newId,
      name,
      requirements: finalizedRequirements,
      createdAt: Date.now(),
      status: 'running',
      agentStates: AGENTS_METADATA.map(() => ({ status: 'pending', output: '' })),
      finalOutput: null,
      feedback: {},
    });
    setProjects(getProjects());

    try {
      const response = await fetch(`${apiBase}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements: finalizedRequirements }),
      });
      if (!response.ok) throw new Error(`Server returned status ${response.status}: ${response.statusText}`);

      const data = await response.json();
      setRunId(data.run_id);

      const es = new EventSource(`${apiBase}/api/stream/${data.run_id}`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'agent_start') {
            const idx = payload.index;
            setCurrentAgentIndex(idx);
            setAgentStates(prev => {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], status: 'running' };
              return updated;
            });
          } else if (payload.type === 'agent_done') {
            const idx = payload.index;
            setAgentStates(prev => {
              const updated = [...prev];
              updated[idx] = { status: 'completed', output: payload.output };
              return updated;
            });
          } else if (payload.type === 'done') {
            setPhase('completed');
            setFinalOutput(payload.final_output);
            es.close();
          } else if (payload.type === 'error') {
            setPhase('error');
            setRunError(payload.message);
            es.close();
          }
        } catch (err) {
          console.error('Failed to parse stream event:', err);
        }
      };

      es.onerror = () => {
        es.close();
      };
    } catch (err) {
      setPhase('error');
      setRunError(err.message);
    }
  };

  const handleDeleteProject = (id, e) => {
    e.stopPropagation();
    deleteProject(id);
    setProjects(getProjects());
    if (activeProjectId === id) {
      handleStartIntake();
    }
  };

  const handleSelectProject = (id) => {
    const project = getProjects().find(p => p.id === id);
    if (project) {
      loadProject(project);
    }
  };

  const handleFeedback = (agentIndex, type, comment) => {
    setFeedback(prev => ({
      ...prev,
      [agentIndex]: { type, comment, timestamp: Date.now() },
    }));
  };

  const formatElapsed = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const completedCount = agentStates.filter(s => s.status === 'completed').length;
  const totalAgents = AGENTS_METADATA.length;
  const progressPct = Math.round((completedCount / totalAgents) * 100);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">F</div>
            <div className="sidebar-brand-text">
              <strong>Forge & Co.</strong>
              <span>Client Portal</span>
            </div>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        {sidebarOpen && (
          <>
            <button className="new-project-btn" onClick={handleStartIntake}>
              <Plus size={16} />
              <span>New Project</span>
            </button>

            <div className="sidebar-section-label">Projects</div>
            <div className="sidebar-projects">
              {projects.length === 0 ? (
                <div className="sidebar-empty">
                  <FolderOpen size={20} />
                  <p>No projects yet.<br />Start your first one!</p>
                </div>
              ) : (
                projects.map(project => (
                  <div
                    key={project.id}
                    className={`sidebar-project ${activeProjectId === project.id ? 'active' : ''}`}
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <div className="project-status-dot" data-status={project.status} />
                    <div className="project-info">
                      <div className="project-name">{project.name}</div>
                      <div className="project-meta">
                        <span className="project-status-text">{project.status}</span>
                        <span className="project-date">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className="project-delete"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      aria-label="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <div className="topbar-left">
            {!sidebarOpen && (
              <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
            )}
            {view === 'project' && activeProjectId ? (
              <div className="topbar-project-info">
                <h2>{projectName}</h2>
                <div className="topbar-progress">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span>{completedCount}/{totalAgents} steps</span>
                </div>
              </div>
            ) : (
              <h2>New Project</h2>
            )}
          </div>
          <div className="topbar-right">
            {view === 'project' && phase === 'running' && (
              <div className="topbar-timer">
                <Clock size={14} />
                <span>{formatElapsed(elapsedSeconds)}</span>
              </div>
            )}
            {view === 'project' && phase === 'completed' && (
              <div className="topbar-complete">
                <CheckCircle2 size={14} />
                <span>Complete</span>
              </div>
            )}
            {view === 'project' && phase === 'error' && (
              <div className="topbar-error">
                <AlertCircle size={14} />
                <span>Error</span>
              </div>
            )}
            <button className="btn-secondary topbar-back" onClick={onBackToLanding}>
              <ChevronRight size={14} />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          {view === 'intake' && (
            <div className="intake-container">
              <div className="intake-header">
                <div className="eyebrow">New Project</div>
                <h2>Tell us what you're building</h2>
                <p>
                  Chat with our account manager. Once your requirements are confirmed,
                  our team of specialists takes over — and you watch it happen live.
                </p>
              </div>
              <IntakeChat apiBase={apiBase} onFinalized={handleFinalized} locked={false} />
            </div>
          )}

          {view === 'project' && (
            <>
              {runError && (
                <div className="error-banner">
                  <AlertCircle size={16} />
                  <span>{runError}</span>
                </div>
              )}

              <PipelineFeed
                agentStates={agentStates}
                currentAgentIndex={currentAgentIndex}
                pipelineStatus={phase}
                elapsedSeconds={elapsedSeconds}
                finalOutput={finalOutput}
                feedback={feedback}
                onFeedback={handleFeedback}
              />

              {phase === 'completed' && (
                <FinalDiagram
                  agentStates={agentStates}
                  projectName={projectName}
                  requirements={requirements}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}