import React from 'react';
import { CheckCircle2, FileText, Cpu, Code, ShieldCheck, Gauge, Layers, Target, Sparkles, Download, ArrowRight, Award } from 'lucide-react';
import { AGENTS_METADATA } from '../data/agentInfo';

const STAGE_GROUPS = [
  {
    label: 'Planning',
    color: '#5AD1E0',
    icon: FileText,
    agents: [0, 1], // Feature Extractor, Architect
  },
  {
    label: 'Building',
    color: '#E8935B',
    icon: Code,
    agents: [2], // Developer
  },
  {
    label: 'Quality',
    color: '#5AD1A8',
    icon: ShieldCheck,
    agents: [3], // QA Tester
  },
  {
    label: 'Audit',
    color: '#F58080',
    icon: Award,
    agents: [4, 5, 6, 7], // Security, Performance, Maintainability, Coverage
  },
];

export default function FinalDiagram({ agentStates, projectName, requirements }) {
  const completedCount = agentStates.filter(s => s.status === 'completed').length;
  const totalAgents = AGENTS_METADATA.length;
  const allComplete = completedCount === totalAgents;

  return (
    <section className="final-diagram">
      <div className="final-diagram-header">
        <div className="eyebrow">Project Complete</div>
        <h2>Your Project Journey</h2>
        <p>
          Here's a visual summary of everything that happened — from your idea to the final product.
        </p>
      </div>

      {/* Journey Flow */}
      <div className="journey-flow">
        {/* Start: Requirements */}
        <div className="journey-node start-node">
          <div className="journey-node-icon">
            <FileText size={20} />
          </div>
          <div className="journey-node-content">
            <div className="journey-node-label">Your Idea</div>
            <div className="journey-node-title">{projectName || 'Project'}</div>
          </div>
        </div>

        <div className="journey-arrow">
          <ArrowRight size={18} />
        </div>

        {/* Stage Groups */}
        {STAGE_GROUPS.map((stage, si) => (
          <React.Fragment key={stage.label}>
            <div className="journey-stage">
              <div className="journey-stage-header" style={{ color: stage.color }}>
                <stage.icon size={14} />
                <span>{stage.label}</span>
              </div>
              <div className="journey-stage-agents">
                {stage.agents.map(agentIdx => {
                  const agent = AGENTS_METADATA[agentIdx];
                  const state = agentStates[agentIdx] || { status: 'pending' };
                  const isDone = state.status === 'completed';
                  return (
                    <div key={agent.id} className={`journey-agent ${isDone ? 'done' : 'pending'}`}>
                      <div className="journey-agent-dot" style={{ background: isDone ? stage.color : 'var(--bg-tertiary)' }}>
                        {isDone ? <CheckCircle2 size={12} /> : <span>{agentIdx + 1}</span>}
                      </div>
                      <span className="journey-agent-name">{agent.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {si < STAGE_GROUPS.length - 1 && (
              <div className="journey-arrow">
                <ArrowRight size={18} />
              </div>
            )}
          </React.Fragment>
        ))}

        <div className="journey-arrow">
          <ArrowRight size={18} />
        </div>

        {/* End: Delivered */}
        <div className="journey-node end-node">
          <div className="journey-node-icon">
            <Sparkles size={20} />
          </div>
          <div className="journey-node-content">
            <div className="journey-node-label">Delivered</div>
            <div className="journey-node-title">Ready to Use</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="diagram-stats">
        <div className="diagram-stat">
          <div className="diagram-stat-value">{completedCount}/{totalAgents}</div>
          <div className="diagram-stat-label">Steps Completed</div>
        </div>
        <div className="diagram-stat">
          <div className="diagram-stat-value">{allComplete ? '100%' : `${Math.round((completedCount / totalAgents) * 100)}%`}</div>
          <div className="diagram-stat-label">Quality Checks Passed</div>
        </div>
        <div className="diagram-stat">
          <div className="diagram-stat-value">4</div>
          <div className="diagram-stat-label">Audit Disciplines</div>
        </div>
      </div>

      {/* What was checked */}
      <div className="checks-grid">
        <div className="check-card">
          <div className="check-icon" style={{ color: '#5AD1E0' }}>
            <FileText size={18} />
          </div>
          <h4>Requirements</h4>
          <p>All your features were captured and organized.</p>
        </div>
        <div className="check-card">
          <div className="check-icon" style={{ color: '#5AD1E0' }}>
            <Cpu size={18} />
          </div>
          <h4>Architecture</h4>
          <p>The software structure was designed to fit your needs.</p>
        </div>
        <div className="check-card">
          <div className="check-icon" style={{ color: '#E8935B' }}>
            <Code size={18} />
          </div>
          <h4>Development</h4>
          <p>Clean, working code was built for your project.</p>
        </div>
        <div className="check-card">
          <div className="check-icon" style={{ color: '#5AD1A8' }}>
            <ShieldCheck size={18} />
          </div>
          <h4>Testing</h4>
          <p>Everything was tested against your requirements.</p>
        </div>
        <div className="check-card">
          <div className="check-icon" style={{ color: '#F58080' }}>
            <Gauge size={18} />
          </div>
          <h4>Security</h4>
          <p>Common vulnerabilities were checked and addressed.</p>
        </div>
        <div className="check-card">
          <div className="check-icon" style={{ color: '#F58080' }}>
            <Layers size={18} />
          </div>
          <h4>Performance</h4>
          <p>Your software runs efficiently and smoothly.</p>
        </div>
        <div className="check-card">
          <div className="check-icon" style={{ color: '#F58080' }}>
            <Target size={18} />
          </div>
          <h4>Maintainability</h4>
          <p>The code is clean and easy to maintain in the future.</p>
        </div>
        <div className="check-card">
          <div className="check-icon" style={{ color: '#F58080' }}>
            <Award size={18} />
          </div>
          <h4>Coverage</h4>
          <p>All important parts are properly tested.</p>
        </div>
      </div>

      {/* Final CTA */}
      <div className="diagram-cta">
        <div className="diagram-cta-content">
          <h3>Your project is ready!</h3>
          <p>
            All {totalAgents} specialist steps completed successfully. 
            Your software has been planned, built, and quality-checked.
          </p>
        </div>
        <button className="btn-primary" onClick={() => window.print()}>
          <Download size={16} />
          <span>Download Summary</span>
        </button>
      </div>
    </section>
  );
}