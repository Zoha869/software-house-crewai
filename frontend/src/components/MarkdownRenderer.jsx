import React from 'react';

// A lightweight markdown renderer that handles:
// - Headings (#, ##, ###)
// - Bold (**text**)
// - Italic (*text*)
// - Inline code (`code`)
// - Code blocks (```)
// - Lists (-, *, 1.)
// - Tables
// - Links
// - Blockquotes
// - Horizontal rules

function escapeHtml(text) {
  const AMP = '\x26amp;';
  const LT = '\x26lt;';
  const GT = '\x26gt;';
  return text
    .replace(/\x26/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT);
}

function parseInline(text) {
  if (!text) return '';

  // Escape HTML first
  let safe = escapeHtml(text);

  // Bold
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  safe = safe.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');

  // Inline code
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return safe;
}

function renderInline(text) {
  return <span dangerouslySetInnerHTML={{ __html: parseInline(text) }} />;
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let listItems = [];
  let listType = null;
  let tableRows = [];
  let inTable = false;
  let blockquoteLines = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <Tag key={`list-${key++}`}>
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      elements.push(
        <blockquote key={`quote-${key++}`}>
          {blockquoteLines.map((line, i) => (
            <p key={i}>{renderInline(line)}</p>
          ))}
        </blockquote>
      );
      blockquoteLines = [];
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerCells = tableRows[0].split('|').map(c => c.trim()).filter(Boolean);
      const bodyRows = tableRows.slice(2).filter(row => row.trim() && !/^\s*\|?\s*[-:]+/.test(row));

      elements.push(
        <div className="table-wrapper" key={`table-${key++}`}>
          <table>
            <thead>
              <tr>
                {headerCells.map((cell, i) => (
                  <th key={i}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => {
                const cells = row.split('|').map(c => c.trim()).filter(Boolean);
                return (
                  <tr key={ri}>
                    {cells.map((cell, ci) => (
                      <td key={ci}>{renderInline(cell)}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Code block handling
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${key++}`}>
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        flushBlockquote();
        flushTable();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Table detection
    if (trimmed.includes('|')) {
      if (!inTable && tableRows.length === 0) {
        inTable = true;
      }
      tableRows.push(trimmed);
      return;
    }

    if (inTable) {
      flushTable();
    }

    // Empty line
    if (trimmed === '') {
      flushList();
      flushBlockquote();
      return;
    }

    // Headings
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match) {
      flushList();
      flushBlockquote();
      flushTable();
      elements.push(<h1 key={`h1-${key++}`}>{renderInline(h1Match[1])}</h1>);
      return;
    }

    const h2Match = trimmed.match(/^##\s+(.+)$/);
    if (h2Match) {
      flushList();
      flushBlockquote();
      flushTable();
      elements.push(<h2 key={`h2-${key++}`}>{renderInline(h2Match[1])}</h2>);
      return;
    }

    const h3Match = trimmed.match(/^###\s+(.+)$/);
    if (h3Match) {
      flushList();
      flushBlockquote();
      flushTable();
      elements.push(<h3 key={`h3-${key++}`}>{renderInline(h3Match[1])}</h3>);
      return;
    }

    const h4Match = trimmed.match(/^####\s+(.+)$/);
    if (h4Match) {
      flushList();
      flushBlockquote();
      flushTable();
      elements.push(<h4 key={`h4-${key++}`}>{renderInline(h4Match[1])}</h4>);
      return;
    }

    // Horizontal rule
    if (/^([-*_])\1{2,}$/.test(trimmed)) {
      flushList();
      flushBlockquote();
      flushTable();
      elements.push(<hr key={`hr-${key++}`} />);
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      flushTable();
      blockquoteLines.push(trimmed.slice(2));
      return;
    }

    // Unordered list
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      flushBlockquote();
      flushTable();
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(ulMatch[1]);
      return;
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (olMatch) {
      flushBlockquote();
      flushTable();
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(olMatch[1]);
      return;
    }

    // Regular paragraph
    flushList();
    flushBlockquote();
    flushTable();
    elements.push(<p key={`p-${key++}`}>{renderInline(trimmed)}</p>);
  });

  // Flush remaining
  flushList();
  flushBlockquote();
  flushTable();

  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <pre key={`code-end-${key++}`}>
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
  }

  return <div className="markdown-body">{elements}</div>;
}