// Parses the review-agent outputs (QA, Security, Performance,
// Maintainability, Test Coverage) into structured finding cards instead of
// one long markdown wall.

function stripMd(text) {
  return text.replace(/\*\*/g, '').replace(/`/g, '').trim();
}

function splitIntoBlocks(raw) {
  const lines = raw.split('\n');
  const blocks = [];
  let current = null;
  let inFence = false;

  const isHeading = (l) => /^#{2,4}\s+.+/.test(l.trim());
  const isTopBullet = (l) => /^[-*]\s+\S/.test(l) || /^\d+[.)]\s+\S/.test(l);
  const isBoldTitleLine = (l) => /^\*\*[^*]+\*\*:?\s*$/.test(l.trim()) || /^\*\*[^*]+\*\*:?\s+\S/.test(l.trim());

  lines.forEach((line) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; if (current) current.push(line); return; }
    if (inFence) { if (current) current.push(line); return; }

    if (isHeading(line) || isTopBullet(line) || isBoldTitleLine(line)) {
      if (current) blocks.push(current.join('\n'));
      current = [line];
    } else if (current) {
      current.push(line);
    }
  });
  if (current) blocks.push(current.join('\n'));
  return blocks.filter(b => b.trim().length > 0);
}

function extractTitle(block) {
  const firstLine = block.split('\n')[0];
  return stripMd(
    firstLine
      .replace(/^#{2,4}\s+/, '')
      .replace(/^[-*]\s+/, '')
      .replace(/^\d+[.)]\s+/, '')
  ).slice(0, 140);
}

function extractSeverity(block) {
  let m = block.match(/severity\s*[:\-]?\s*\*{0,2}(critical|high|medium|low)\b/i);
  if (m) return m[1].toLowerCase();
  m = block.match(/\((critical|high|medium|low)\)/i);
  if (m) return m[1].toLowerCase();
  m = block.match(/\*\*(critical|high|medium|low)\*\*/i);
  if (m) return m[1].toLowerCase();
  return null;
}

function extractStatus(block) {
  const m = block.match(/\b(passed|failed|pass|fail)\b/i);
  if (!m) return null;
  const v = m[1].toLowerCase();
  return v.startsWith('pass') ? 'pass' : 'fail';
}

function extractLocation(block) {
  const m = block.match(/(?:Location|File|Path)\s*[:\-]?\s*`?([\w./-]+\.[A-Za-z0-9]+)`?/i) || block.match(/`([\w./-]+\.[A-Za-z0-9]+)`/);
  return m ? m[1] : null;
}

function extractFix(block) {
  const m = block.match(/(?:Fix|Recommendation|Suggested\s*Fix)\s*[:\-]?\s*(.+)/i);
  return m ? stripMd(m[1]) : null;
}

// General-purpose: works for security/performance/maintainability (severity)
// and QA (pass/fail). Returns null if the text doesn't look block-structured
// enough to bother (caller falls back to plain markdown).
export function parseFindings(raw) {
  if (!raw) return null;
  const blocks = splitIntoBlocks(raw);
  if (blocks.length < 2) return null;

  const findings = blocks.map((block, i) => ({
    id: i,
    title: extractTitle(block),
    severity: extractSeverity(block),
    status: extractStatus(block),
    location: extractLocation(block),
    fix: extractFix(block),
    detail: block,
  }));

  // Require that at least half the blocks actually carry a severity or
  // status signal — otherwise this probably isn't a findings list at all
  // (e.g. it's prose) and we should fall back to markdown.
  const signalCount = findings.filter(f => f.severity || f.status).length;
  if (signalCount < Math.ceil(blocks.length / 2)) return null;

  return findings;
}

// Splits Test Coverage Reviewer output into "untested" vs "untestable"
// columns by locating those two headings and grouping bullets under each.
export function parseCoverage(raw) {
  if (!raw) return null;
  const lines = raw.split('\n');
  const sections = { untested: [], untestable: [] };
  let bucket = null;
  let inFence = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) { inFence = !inFence; return; }
    if (inFence) return;

    const headingMatch = trimmed.match(/^#{1,4}\s+(.+)$/) || trimmed.match(/^\*\*(.+)\*\*:?\s*$/);
    if (headingMatch) {
      const title = headingMatch[1].toLowerCase();
      if (title.includes('untestable')) bucket = 'untestable';
      else if (title.includes('untested')) bucket = 'untested';
      else bucket = null;
      return;
    }

    const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/) || trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (bulletMatch && bucket) {
      sections[bucket].push(stripMd(bulletMatch[1]));
    }
  });

  if (sections.untested.length === 0 && sections.untestable.length === 0) return null;
  return sections;
}
