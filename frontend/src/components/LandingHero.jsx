import React from 'react';
import { FileText, Layers, Code2, ShieldCheck } from 'lucide-react';

const STAGES = [
  { icon: FileText, label: 'Analysis', desc: 'Features extracted, assumptions flagged.' },
  { icon: Layers, label: 'Architecture', desc: 'Scoped design — nothing over-built.' },
  { icon: Code2, label: 'Construction', desc: 'Clean, runnable code to spec.' },
  { icon: ShieldCheck, label: 'Audit', desc: 'QA, security, performance, maintainability.' },
];

export default function LandingHero() {
  return (
    <section style={{ marginBottom: '36px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto 26px', textAlign: 'center' }}>
        <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: '16px' }}>
          Nexbuild — Design-Build Studio
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.7rem)', fontWeight: 700, lineHeight: 1.18, marginBottom: '14px' }}>
          Tell us what to build. <span className="gradient-text">Watch it get drafted, built, and audited</span> — sheet by sheet.
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Describe your project to our account manager. Once the brief is confirmed, eight
          specialists — analysis, architecture, construction, and a four-discipline audit —
          take it through the floor in sequence, live.
        </p>
      </div>

      <div className="title-block" style={{ maxWidth: '760px', margin: '0 auto 30px' }}>
        <div>
          <div className="tb-label">Project</div>
          <div className="tb-value">Client Intake</div>
        </div>
        <div>
          <div className="tb-label">Studio</div>
          <div className="tb-value">Nexbuild</div>
        </div>
        <div>
          <div className="tb-label">Sheet Count</div>
          <div className="tb-value">08</div>
        </div>
        <div>
          <div className="tb-label">Process</div>
          <div className="tb-value">Sequential</div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '14px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {STAGES.map((s, i) => (
          <div key={s.label} className="glass-panel fade-up" style={{ padding: '16px', animationDelay: `${i * 90}ms` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '7px' }}>
              <div style={{ padding: '7px', borderRadius: '8px', background: 'var(--accent-cyan-glow)', color: 'var(--accent-cyan)' }}>
                <s.icon size={16} />
              </div>
              <h3 style={{ fontSize: '0.86rem', fontWeight: 700 }}>{s.label}</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
