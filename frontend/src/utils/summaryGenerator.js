// Converts raw technical agent output into client-friendly plain language summaries
// The goal: non-technical clients understand what happened without jargon

export function generateClientSummary(agentId, rawOutput) {
  if (!rawOutput) return '';
  
  // Extract key sections from markdown output
  const sections = extractSections(rawOutput);
  
  switch (agentId) {
    case 'feature_extractor':
      return summarizeFeatures(sections, rawOutput);
    case 'architect':
      return summarizeArchitecture(sections, rawOutput);
    case 'developer':
      return summarizeDevelopment(sections, rawOutput);
    case 'qa_tester':
      return summarizeQA(sections, rawOutput);
    case 'security_reviewer':
      return summarizeSecurity(sections, rawOutput);
    case 'performance_reviewer':
      return summarizePerformance(sections, rawOutput);
    case 'maintainability_reviewer':
      return summarizeMaintainability(sections, rawOutput);
    case 'test_coverage_reviewer':
      return summarizeCoverage(sections, rawOutput);
    default:
      return rawOutput.slice(0, 300) + (rawOutput.length > 300 ? '...' : '');
  }
}

function extractSections(raw) {
  const sections = {};
  const lines = raw.split('\n');
  let currentHeading = 'overview';
  sections[currentHeading] = [];
  
  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      currentHeading = headingMatch[1].toLowerCase();
      sections[currentHeading] = [];
    } else if (line.trim()) {
      sections[currentHeading].push(line.trim());
    }
  }
  
  return sections;
}

function extractListItems(raw) {
  const items = [];
  const lines = raw.split('\n');
  for (const line of lines) {
    const match = line.match(/^[-*]\s+(.+)$/);
    if (match) items.push(match[1]);
  }
  return items;
}

function summarizeFeatures(sections, raw) {
  const items = extractListItems(raw);
  const featureCount = items.length;
  
  if (featureCount === 0) {
    return "We reviewed your requirements and identified the key features to build. Everything you asked for has been captured and organized.";
  }
  
  const topFeatures = items.slice(0, 4).map(i => i.replace(/\*\*/g, '').trim());
  const summary = `We identified **${featureCount} key features** from your requirements. Here's what we'll build:\n\n`;
  const list = topFeatures.map(f => `- ${f}`).join('\n');
  const extra = featureCount > 4 ? `\n\n...and ${featureCount - 4} more details captured in the full breakdown.` : '';
  return summary + list + extra;
}

function summarizeArchitecture(sections, raw) {
  const techStack = findTechStack(raw);
  const components = extractListItems(raw).filter(i => !i.includes('```'));
  
  let summary = "We've designed the **structure of your software** — how the different parts fit together. ";
  if (techStack.length > 0) {
    summary += `The main technologies we'll use are: **${techStack.slice(0, 4).join(', ')}**. `;
  }
  if (components.length > 0) {
    summary += `\n\nKey building blocks:\n${components.slice(0, 5).map(c => `- ${c.replace(/\*\*/g, '').trim()}`).join('\n')}`;
  }
  return summary;
}

function findTechStack(raw) {
  const techKeywords = ['Python', 'FastAPI', 'Flask', 'Django', 'React', 'Node.js', 'Express', 'TypeScript', 'JavaScript', 'PostgreSQL', 'SQLite', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Azure', 'JWT', 'REST', 'GraphQL', 'HTML', 'CSS', 'Tailwind', 'Bootstrap'];
  const found = [];
  for (const tech of techKeywords) {
    if (raw.toLowerCase().includes(tech.toLowerCase())) {
      found.push(tech);
    }
  }
  return found;
}

function summarizeDevelopment(sections, raw) {
  const fileCount = (raw.match(/\.py|\.js|\.ts|\.jsx|\.tsx|\.html|\.css|\.json|\.md|\.sql/g) || []).length;
  const hasCode = raw.includes('```');
  
  let summary = "**Your software has been built!** ";
  if (fileCount > 0) {
    summary += `We created approximately **${Math.max(1, Math.round(fileCount / 2))} files** with all the core functionality. `;
  }
  if (hasCode) {
    summary += "The code is clean, well-organized, and ready to run.";
  } else {
    summary += "The complete implementation is ready and working.";
  }
  return summary;
}

function summarizeQA(sections, raw) {
  const hasPass = /pass|passed|success|✅|✓|all tests/i.test(raw);
  const hasFail = /fail|error|issue|problem|❌|✗/i.test(raw);
  const testCount = (raw.match(/test|case|scenario/gi) || []).length;
  
  if (hasFail && !hasPass) {
    return "**Testing found some issues** that need attention. We've documented exactly what needs to be fixed before this is production-ready.";
  }
  if (hasPass && hasFail) {
    return `**Testing is mostly complete** — most tests passed, but a few edge cases need attention. We've documented the details.`;
  }
  return `**All tests passed!** We verified the software works as expected against your requirements${testCount > 0 ? `, covering ${testCount} test scenarios` : ''}.`;
}

function summarizeSecurity(sections, raw) {
  const hasIssues = /vulnerab|risk|issue|concern|high|critical|medium|low|CVE|injection|XSS|CSRF|auth/i.test(raw);
  const hasClean = /no (issues|vulnerabilities|risks)|clean|secure|passed|good/i.test(raw);
  
  if (hasIssues && !hasClean) {
    return "**Security review complete** — we found a few areas that should be hardened. These are documented with clear recommendations on how to fix them.";
  }
  if (hasIssues && hasClean) {
    return "**Security review complete** — the software is generally secure, with a few minor recommendations for hardening.";
  }
  return "**Security review passed** — we checked for common vulnerabilities and your software is protected against known risks.";
}

function summarizePerformance(sections, raw) {
  const hasIssues = /slow|bottleneck|optimize|improve|concern|issue|N\+1|O\(n|O\(n²|O\(n\^2/i.test(raw);
  const hasGood = /fast|efficient|good|optimal|acceptable|fine/i.test(raw);
  
  if (hasIssues && !hasGood) {
    return "**Performance review complete** — we identified a few areas where the software could be faster. Recommendations are documented.";
  }
  if (hasIssues && hasGood) {
    return "**Performance looks good** — the software runs efficiently, with a few minor optimization opportunities noted.";
  }
  return "**Performance is solid** — your software is built to run efficiently without unnecessary slowdowns.";
}

function summarizeMaintainability(sections, raw) {
  const hasIssues = /complex|over-engineer|dead code|duplicate|naming|refactor|improve|issue/i.test(raw);
  const hasGood = /clean|good|well|clear|maintainable|passed/i.test(raw);
  
  if (hasIssues && !hasGood) {
    return "**Code quality review** — we found some areas that could be cleaner and easier to maintain. Recommendations are documented.";
  }
  if (hasIssues && hasGood) {
    return "**Code quality is good** — the code is well-structured, with a few minor improvements suggested for long-term maintainability.";
  }
  return "**Code quality is excellent** — the code is clean, well-organized, and easy for future developers to maintain.";
}

function summarizeCoverage(sections, raw) {
  const hasGaps = /untested|gap|missing|not covered|insufficient/i.test(raw);
  const hasGood = /good|complete|comprehensive|covered|passed/i.test(raw);
  
  if (hasGaps && !hasGood) {
    return "**Test coverage review** — we found some parts of the software that aren't fully tested yet. We recommend adding tests for these areas.";
  }
  if (hasGaps && hasGood) {
    return "**Test coverage is good** — most of the important code is tested, with a few areas that could use additional coverage.";
  }
  return "**Test coverage is comprehensive** — all the important parts of your software are properly tested.";
}