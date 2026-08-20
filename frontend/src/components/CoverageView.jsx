import React, { useMemo } from 'react';
import { EyeOff, HelpCircle } from 'lucide-react';
import { parseCoverage } from '../utils/findingsParser';
import MarkdownRenderer from './MarkdownRenderer';

export default function CoverageView({ rawOutput }) {
  const coverage = useMemo(() => parseCoverage(rawOutput), [rawOutput]);

  if (!coverage) {
    return <MarkdownRenderer content={rawOutput} />;
  }

  return (
    <div className="coverage-view">
      <div className="coverage-column">
        <div className="coverage-column-head untested">
          <EyeOff size={14} />
          <span>Untested ({coverage.untested.length})</span>
        </div>
        {coverage.untested.length > 0 ? (
          <ul className="coverage-list">
            {coverage.untested.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        ) : (
          <p className="coverage-empty">Nothing flagged here.</p>
        )}
      </div>
      <div className="coverage-column">
        <div className="coverage-column-head untestable">
          <HelpCircle size={14} />
          <span>Untestable ({coverage.untestable.length})</span>
        </div>
        {coverage.untestable.length > 0 ? (
          <ul className="coverage-list">
            {coverage.untestable.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        ) : (
          <p className="coverage-empty">Nothing flagged here.</p>
        )}
      </div>
    </div>
  );
}
