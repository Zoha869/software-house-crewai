// localStorage-based project history store
// Each project: { id, name, clientName, requirements, createdAt, status, agentStates, finalOutput, feedback }

const STORAGE_KEY = 'forge_projects';

export function getProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProject(project) {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.unshift(project);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return project;
}

export function getProject(id) {
  return getProjects().find(p => p.id === id) || null;
}

export function deleteProject(id) {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function generateProjectId() {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function extractProjectName(requirements) {
  if (!requirements) return 'Untitled Project';
  const firstLine = requirements.split('\n')[0].trim();
  // Strip common prefixes like "A simple", "Build a", etc.
  const cleaned = firstLine
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/^(simple|basic|high-performance|production-ready|full-stack|modern|scalable|secure|lightweight|powerful|easy-to-use|user-friendly)\s+/i, '')
    .replace(/\s+(in|using|with)\s+.*$/i, '')
    .replace(/\.$/, '');
  return cleaned.length > 40 ? cleaned.slice(0, 40) + '...' : cleaned || 'Untitled Project';
}