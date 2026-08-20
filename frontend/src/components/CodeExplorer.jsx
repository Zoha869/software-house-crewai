import React, { useState, useMemo } from 'react';
import { Folder, FolderOpen, FileCode, Copy, Check, Download, Files } from 'lucide-react';
import { parseCodeFiles, buildFileTree } from '../utils/codeParser';
import MarkdownRenderer from './MarkdownRenderer';

function TreeNode({ node, activePath, onSelect, depth = 0 }) {
  const [open, setOpen] = useState(true);
  if (node.type === 'file') {
    return (
      <div
        className={`code-tree-file ${activePath === node.path ? 'active' : ''}`}
        style={{ paddingLeft: `${10 + depth * 14}px` }}
        onClick={() => onSelect(node)}
      >
        <FileCode size={13} />
        <span>{node.name}</span>
      </div>
    );
  }
  return (
    <div>
      {node.name !== '' && (
        <div
          className="code-tree-dir"
          style={{ paddingLeft: `${10 + (depth - 1) * 14}px` }}
          onClick={() => setOpen(!open)}
        >
          {open ? <FolderOpen size={13} /> : <Folder size={13} />}
          <span>{node.name}</span>
        </div>
      )}
      {open && node.children.map((child, i) => (
        <TreeNode key={i} node={child} activePath={activePath} onSelect={onSelect} depth={node.name === '' ? depth : depth + 1} />
      ))}
    </div>
  );
}

export default function CodeExplorer({ rawOutput }) {
  const files = useMemo(() => parseCodeFiles(rawOutput), [rawOutput]);
  const tree = useMemo(() => buildFileTree(files), [files]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!files.length) {
    // Couldn't confidently extract files — fall back to formatted markdown
    return <MarkdownRenderer content={rawOutput} />;
  }

  const activeFile = files[activeIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadAll = () => {
    files.forEach((f, idx) => {
      setTimeout(() => {
        const blob = new Blob([f.code], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = f.path.split('/').pop();
        a.click();
        URL.revokeObjectURL(url);
      }, idx * 120);
    });
  };

  const codeLines = activeFile.code.split('\n');

  return (
    <div className="code-explorer">
      <div className="code-explorer-toolbar">
        <div className="code-explorer-count">
          <Files size={13} />
          <span>{files.length} file{files.length !== 1 ? 's' : ''} generated</span>
        </div>
        <div className="code-explorer-actions">
          <button className="btn-secondary btn-xs" onClick={handleCopy}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy file'}</span>
          </button>
          <button className="btn-secondary btn-xs" onClick={handleDownloadAll}>
            <Download size={12} />
            <span>Download all</span>
          </button>
        </div>
      </div>

      <div className="code-explorer-body">
        <div className="code-tree">
          <TreeNode node={tree} activePath={activeFile.path} onSelect={(node) => setActiveIdx(node.fileIndex)} />
        </div>
        <div className="code-panel">
          <div className="code-panel-tab">
            <FileCode size={13} />
            <span>{activeFile.path}</span>
            <span className="code-lang-badge">{activeFile.language || 'text'}</span>
          </div>
          <div className="code-panel-scroll">
            <pre className="code-panel-pre">
              <code>
                {codeLines.map((ln, idx) => (
                  <div className="code-line" key={idx}>
                    <span className="code-line-no">{idx + 1}</span>
                    <span className="code-line-text">{ln || '\u00A0'}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
