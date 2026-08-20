// Parses raw LLM markdown output from the Developer and Architect agents
// into structured data the UI can render (file tree + code, and
// architecture sections) instead of one long wall of text.

const LANG_EXT = {
  python: 'py', py: 'py', javascript: 'js', js: 'js', jsx: 'jsx',
  typescript: 'ts', ts: 'ts', tsx: 'tsx', json: 'json', html: 'html',
  css: 'css', bash: 'sh', sh: 'sh', shell: 'sh', yaml: 'yml', yml: 'yml',
  sql: 'sql', markdown: 'md', md: 'md', dockerfile: 'Dockerfile',
  java: 'java', go: 'go', rust: 'rs', c: 'c', cpp: 'cpp', txt: 'txt',
};

// Grab a filename out of a line if one is plausibly present.
function extractFilename(line) {
  if (!line) return null;
  const trimmed = line.trim();

  // `path/to/file.ext` inside backticks (optionally bolded, optionally
  // preceded by a heading marker or "File:" label)
  let m = trimmed.match(/`([\w./-]+\.[A-Za-z0-9]+)`/);
  if (m) return m[1];

  // **path/to/file.ext** (bold, no backticks)
  m = trimmed.match(/^\*\*([\w./-]+\.[A-Za-z0-9]+)\*\*/);
  if (m) return m[1];

  // Heading: "### file.ext" or "#### path/file.ext"
  m = trimmed.match(/^#{1,6}\s+([\w./-]+\.[A-Za-z0-9]+)\s*$/);
  if (m) return m[1];

  // "File: path/to/file.ext" or "Filename: ..."
  m = trimmed.match(/^(?:\*\*)?(?:File|Filename|Path)(?:\*\*)?:\s*`?([\w./-]+\.[A-Za-z0-9]+)`?/i);
  if (m) return m[1];

  // Bare line that's just a path with an extension
  m = trimmed.match(/^([\w][\w./-]*\.[A-Za-z0-9]+)$/);
  if (m) return m[1];

  return null;
}

// A comment as the very first line inside the fence, e.g. `# main.py`
function extractFilenameFromFirstCodeLine(line, lang) {
  if (!line) return null;
  const commentPrefixes = ['#', '//', '--', '<!--'];
  const trimmed = line.trim();
  for (const p of commentPrefixes) {
    if (trimmed.startsWith(p)) {
      const rest = trimmed.slice(p.length).replace(/-->\s*$/, '').trim();
      const m = rest.match(/^([\w./-]+\.[A-Za-z0-9]+)$/);
      if (m) return m[1];
    }
  }
  return null;
}

export function parseCodeFiles(raw) {
  if (!raw) return [];
  const lines = raw.split('\n');
  const files = [];
  let i = 0;
  let anonymousCount = 0;
  let recentNonEmpty = []; // last few non-empty lines before a fence

  while (i < lines.length) {
    const line = lines[i];
    const fenceMatch = line.match(/^\s*```\s*([A-Za-z0-9_-]*)\s*$/);
    if (fenceMatch) {
      const lang = (fenceMatch[1] || '').toLowerCase();
      const buffer = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        buffer.push(lines[i]);
        i++;
      }
      i++; // skip closing fence

      // Try to find a filename from the lines immediately preceding the fence
      let filename = null;
      for (let k = recentNonEmpty.length - 1; k >= 0 && !filename; k--) {
        filename = extractFilename(recentNonEmpty[k]);
      }
      // Otherwise check first line of the code block itself
      if (!filename) {
        filename = extractFilenameFromFirstCodeLine(buffer[0], lang);
        if (filename && buffer[0].trim().startsWith('#') === false) {
          // keep first line if it wasn't purely a filename comment marker
        }
      }

      const isProseLang = ['text', 'txt', 'markdown', 'md', ''].includes(lang) && !filename;
      const codeText = buffer.join('\n').trim();

      // Skip empty blocks or ones that are clearly just a directory tree
      const looksLikeTree = /[│├└─]/.test(codeText) || (!filename && /^[\w.-]+\/\s*$/m.test(codeText.split('\n')[0] || ''));

      if (codeText && !looksLikeTree && !(isProseLang && codeText.split('\n').length < 2)) {
        if (!filename) {
          anonymousCount++;
          const ext = LANG_EXT[lang] || 'txt';
          filename = `snippet_${anonymousCount}.${ext}`;
        }
        files.push({
          path: filename.replace(/^\.?\//, ''),
          language: lang || (LANG_EXT[filename.split('.').pop()] ? filename.split('.').pop() : 'text'),
          code: codeText,
        });
      }
      recentNonEmpty = [];
      continue;
    }

    if (line.trim() !== '') {
      recentNonEmpty.push(line);
      if (recentNonEmpty.length > 4) recentNonEmpty.shift();
    }
    i++;
  }

  // De-duplicate by path (keep last occurrence — later revisions win)
  const byPath = new Map();
  files.forEach(f => byPath.set(f.path, f));
  return Array.from(byPath.values());
}

// Build a nested tree structure from a flat file list for the sidebar.
export function buildFileTree(files) {
  const root = { name: '', type: 'dir', children: [] };
  files.forEach((file, idx) => {
    const parts = file.path.split('/').filter(Boolean);
    let node = root;
    parts.forEach((part, depth) => {
      const isLeaf = depth === parts.length - 1;
      if (isLeaf) {
        node.children.push({ name: part, type: 'file', fileIndex: idx, path: file.path });
      } else {
        let dir = node.children.find(c => c.type === 'dir' && c.name === part);
        if (!dir) {
          dir = { name: part, type: 'dir', children: [] };
          node.children.push(dir);
        }
        node = dir;
      }
    });
  });
  const sortNode = (n) => {
    n.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    n.children.forEach(c => c.type === 'dir' && sortNode(c));
  };
  sortNode(root);
  return root;
}

const SECTION_PATTERNS = [
  { key: 'techStack', re: /tech(nology)?\s*stack/i },
  { key: 'components', re: /components?(\s*\/\s*modules?)?|modules?/i },
  { key: 'dataModel', re: /data\s*model|database|schema/i },
  { key: 'dataFlow', re: /data\s*flow|request\s*flow/i },
];

export function parseArchitecture(raw) {
  if (!raw) return { sections: [], raw: '' };
  const lines = raw.split('\n');
  const sections = [];
  let current = null;
  let inFence = false;

  const flush = () => {
    if (current && (current.items.length || current.text.trim())) sections.push(current);
    current = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) { inFence = !inFence; if (current) current.text += line + '\n'; return; }
    if (inFence) { if (current) current.text += line + '\n'; return; }

    const headingMatch = trimmed.match(/^#{1,4}\s+(.+)$/) || trimmed.match(/^\*\*(.+)\*\*:?\s*$/);
    if (headingMatch) {
      const title = headingMatch[1].replace(/\*\*/g, '').trim();
      const matched = SECTION_PATTERNS.find(p => p.re.test(title));
      flush();
      current = { key: matched ? matched.key : 'other', title, items: [], text: '' };
      return;
    }

    const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (bulletMatch && current) {
      current.items.push(bulletMatch[1]);
      return;
    }

    if (current) current.text += line + '\n';
  });
  flush();

  return { sections, raw };
}
