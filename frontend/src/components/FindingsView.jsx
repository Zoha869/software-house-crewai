import React, { useMemo } from 'react';
import { AlertTriangle, ShieldAlert, ShieldCheck, CheckCircle2, XCircle, MapPin, Wrench } from 'lucide-react';
import { parseFindings } from '../utils/findingsParser';
import MarkdownRenderer from './MarkdownRenderer';

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const SEVERITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

export default function FindingsView({ rawOutput, mode }) {
  // mode: 'severity' (security/performance/maintainability) or 'status' (QA)
  const findings = useMemo(() => parseFindings(rawOutput), [rawOutput]);

  if (!findings) {
    return <MarkdownRenderer content={rawOutput} />;
  }

  if (mode === 'status') {
    const passed = findings.filter(f => f.status === 'pass').length;
    const failed = findings.filter(f => f.status === 'fail').length;
    return (
      <div className="findings-view">
        <div className="findings-summary">
          <div className="findings-summary-pill pass">
            <CheckCircle2 size={13} />
            <span>{passed} passed</span>
          </div>
          {failed > 0 && (
            <div className="findings-summary-pill fail">
              <XCircle size={13} />
              <span>{failed} failed</span>
            </div>
          )}
        </div>
        <div className="findings-list">
          {findings.map((f) => (
            <div key={f.id} className={`finding-card status-${f.status || 'neutral'}`}>
              <div className="finding-card-head">
                {f.status === 'pass' ? <CheckCircle2 size={15} className="finding-status-icon pass" /> :
                 f.status === 'fail' ? <XCircle size={15} className="finding-status-icon fail" /> : null}
                <span className="finding-title">{f.title}</span>
              </div>
              {f.detail && <div className="finding-detail"><MarkdownRenderer content={f.detail} /></div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // severity mode
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  findings.forEach(f => { if (f.severity && counts[f.severity] !== undefined) counts[f.severity]++; });
  const sorted = [...findings].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));

  return (
    <div className="findings-view">
      <div className="findings-summary">
        {Object.entries(counts).filter(([, c]) => c > 0).map(([sev, c]) => (
          <div className={`findings-summary-pill sev-${sev}`} key={sev}>
            <AlertTriangle size={13} />
            <span>{c} {SEVERITY_LABEL[sev]}</span>
          </div>
        ))}
        {findings.every(f => !f.severity) && (
          <div className="findings-summary-pill neutral">
            <ShieldCheck size={13} />
            <span>{findings.length} findings</span>
          </div>
        )}
      </div>
      <div className="findings-list">
        {sorted.map((f) => (
          <div key={f.id} className={`finding-card sev-${f.severity || 'neutral'}`}>
            <div className="finding-card-head">
              {f.severity ? (
                <span className={`severity-badge sev-${f.severity}`}>
                  <ShieldAlert size={11} />
                  {SEVERITY_LABEL[f.severity]}
                </span>
              ) : null}
              <span className="finding-title">{f.title}</span>
            </div>
            {(f.location || f.fix) && (
              <div className="finding-meta">
                {f.location && (
                  <span className="finding-meta-item">
                    <MapPin size={11} />
                    {f.location}
                  </span>
                )}
                {f.fix && (
                  <span className="finding-meta-item fix">
                    <Wrench size={11} />
                    {f.fix}
                  </span>
                )}
              </div>
            )}
            <div className="finding-detail"><MarkdownRenderer content={f.detail} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
