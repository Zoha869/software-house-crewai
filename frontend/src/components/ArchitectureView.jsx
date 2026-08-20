import React, { useMemo } from 'react';
import { Layers3, Boxes, Database, ArrowRightLeft, Puzzle } from 'lucide-react';
import { parseArchitecture } from '../utils/codeParser';
import MarkdownRenderer from './MarkdownRenderer';

const SECTION_ICON = {
  techStack: Layers3,
  components: Boxes,
  dataModel: Database,
  dataFlow: ArrowRightLeft,
  other: Puzzle,
};

export default function ArchitectureView({ rawOutput }) {
  const { sections } = useMemo(() => parseArchitecture(rawOutput), [rawOutput]);

  const hasStructured = sections.some(s => s.items.length > 0 && ['techStack', 'components', 'dataModel', 'dataFlow'].includes(s.key));

  if (!hasStructured) {
    return <MarkdownRenderer content={rawOutput} />;
  }

  const techStack = sections.find(s => s.key === 'techStack');
  const components = sections.filter(s => s.key === 'components');
  const dataModel = sections.find(s => s.key === 'dataModel');
  const others = sections.filter(s => !['techStack', 'components', 'dataModel'].includes(s.key));

  return (
    <div className="architecture-view">
      {techStack && (
        <div className="arch-block">
          <div className="arch-block-title">
            <Layers3 size={14} />
            <span>Tech Stack</span>
          </div>
          <div className="arch-stack-pills">
            {techStack.items.map((item, i) => (
              <span className="arch-pill" key={i}>{item.replace(/\*\*/g, '')}</span>
            ))}
          </div>
        </div>
      )}

      {components.length > 0 && (
        <div className="arch-block">
          <div className="arch-block-title">
            <Boxes size={14} />
            <span>Components</span>
          </div>
          <div className="arch-components-grid">
            {components.flatMap(s => s.items).map((item, i) => {
              const [name, ...rest] = item.split(/[:\u2013-]/);
              return (
                <div className="arch-component-card" key={i}>
                  <div className="arch-component-dot" />
                  <div>
                    <div className="arch-component-name">{name.replace(/\*\*/g, '').trim()}</div>
                    {rest.length > 0 && <div className="arch-component-desc">{rest.join(':').trim()}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {dataModel && dataModel.items.length > 0 && (
        <div className="arch-block">
          <div className="arch-block-title">
            <Database size={14} />
            <span>Data Model</span>
          </div>
          <ul className="arch-data-list">
            {dataModel.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}

      {others.map((s, i) => (
        <div className="arch-block" key={i}>
          <div className="arch-block-title">
            <Puzzle size={14} />
            <span>{s.title}</span>
          </div>
          {s.items.length > 0 ? (
            <ul className="arch-data-list">
              {s.items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          ) : (
            <MarkdownRenderer content={s.text} />
          )}
        </div>
      ))}
    </div>
  );
}
