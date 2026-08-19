export const AGENTS_METADATA = [
  {
    id: "feature_extractor",
    name: "Feature Extractor",
    role: "Requirements Analyst",
    dept: "ANALYSIS",
    sheet: "A-01",
    tool: "FileReadTool",
    description: "Parses the brief and extracts concrete, testable features and explicit assumptions.",
    clientSummary: "We reviewed your requirements and broke them down into clear, testable features. This makes sure nothing gets missed during development.",
    color: "#5AD1E0",
    icon: "FileText",
    stage: "Planning"
  },
  {
    id: "architect",
    name: "Architect",
    role: "Software Architect",
    dept: "ARCHITECTURE",
    sheet: "A-02",
    tool: "System Design",
    description: "Drafts the system architecture, component boundaries, and data flow — scoped, not over-built.",
    clientSummary: "We designed how your software will be structured — the main building blocks and how they connect. Kept simple and focused on what you asked for.",
    color: "#5AD1E0",
    icon: "Cpu",
    stage: "Planning"
  },
  {
    id: "developer",
    name: "Developer",
    role: "Software Developer",
    dept: "CONSTRUCTION",
    sheet: "C-01",
    tool: "Code Synthesis",
    description: "Builds production-quality, runnable code and file structure to the architecture spec.",
    clientSummary: "We wrote the actual code for your project — clean, working, and ready to run. This is the core build phase.",
    color: "#E8935B",
    icon: "Code",
    stage: "Building"
  },
  {
    id: "qa_tester",
    name: "QA Tester",
    role: "QA Engineer",
    dept: "QUALITY",
    sheet: "Q-01",
    tool: "Test Execution",
    description: "Runs functional and edge-case test suites, issues a pass/fail report against requirements.",
    clientSummary: "We tested the software against your requirements — checking that every feature works as expected, including edge cases.",
    color: "#5AD1A8",
    icon: "CheckCircle",
    stage: "Quality Check"
  },
  {
    id: "security_reviewer",
    name: "Security Reviewer",
    role: "AppSec Engineer",
    dept: "AUDIT",
    sheet: "R-01",
    tool: "OWASP Review",
    description: "Audits injection risk, auth gaps, hardcoded secrets, and unsafe deserialization — with severity.",
    clientSummary: "We checked your software for common security risks — making sure your data and users are protected.",
    color: "#F58080",
    icon: "Shield",
    stage: "Audit"
  },
  {
    id: "performance_reviewer",
    name: "Performance Reviewer",
    role: "Performance Engineer",
    dept: "AUDIT",
    sheet: "R-02",
    tool: "Complexity Analysis",
    description: "Flags algorithmic complexity, N+1 patterns, and hot-path allocation issues.",
    clientSummary: "We made sure your software runs fast and smooth — checking for any performance bottlenecks.",
    color: "#F58080",
    icon: "Gauge",
    stage: "Audit"
  },
  {
    id: "maintainability_reviewer",
    name: "Maintainability Reviewer",
    role: "Senior Engineer",
    dept: "AUDIT",
    sheet: "R-03",
    tool: "Code Review",
    description: "Checks naming clarity, coupling, and dead or over-engineered abstractions.",
    clientSummary: "We reviewed the code quality — making sure it's clean, well-organized, and easy to maintain in the future.",
    color: "#F58080",
    icon: "Layers",
    stage: "Audit"
  },
  {
    id: "test_coverage_reviewer",
    name: "Test Coverage Reviewer",
    role: "QA Coverage Lead",
    dept: "AUDIT",
    sheet: "R-04",
    tool: "Coverage Analysis",
    description: "Cross-checks QA's tests against the code — what's untested, and what's untestable, and why.",
    clientSummary: "We verified that all the important parts of your software are properly tested — so you can trust it works.",
    color: "#F58080",
    icon: "Target",
    stage: "Audit"
  }
];

export const SAMPLE_REQUIREMENTS = {
  sample_default: `A simple Task Management CLI tool in Python.
Requirements:
1. Users can add a new task with a title and optional description.
2. Users can list all tasks with their status (pending / completed).
3. Users can mark a task as completed by ID.
4. Users can delete a task by ID.
5. Persist tasks to a local JSON file (tasks.json).
6. Handle missing file gracefully on first run.`,

  auth_service: `Authentication & Session API Service in Python.
Requirements:
1. User registration with email, password (hashed with bcrypt), and role (user/admin).
2. User login generating JWT access token with 15-minute expiry.
3. Protected endpoint /api/profile requiring valid JWT bearer token.
4. Admin-only endpoint /api/users to list all registered accounts.
5. In-memory SQLite repository with transaction rollback on error.
6. Rate limiting on /api/login (max 5 failed attempts per minute).`,

  url_shortener: `High-Performance URL Shortener Microservice.
Requirements:
1. POST /shorten: Accept long URL, return 6-character alphanumeric slug.
2. GET /{slug}: Redirect (302) to the original long URL.
3. Track visit count and last accessed timestamp for each slug.
4. GET /stats/{slug}: Return access analytics (total clicks, created date).
5. In-memory or file-backed storage with collision-resistant hashing.
6. Validate input URLs against malicious schemes (e.g. javascript:, file:).`
};