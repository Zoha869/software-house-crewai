export const AGENTS_METADATA = [
  {
    id: "feature_extractor",
    name: "Feature Extractor",
    role: "Requirements Analyst / Feature Extractor",
    tool: "FileReadTool",
    description: "Parses raw requirement documents and extracts concrete, testable features and explicit assumptions.",
    color: "#6366f1", // Indigo
    icon: "FileText"
  },
  {
    id: "architect",
    name: "Architect",
    role: "Software Architect",
    tool: "WebsiteSearchTool / SerperDevTool",
    description: "Designs the appropriately-scoped system architecture, component boundaries, and data flow.",
    color: "#8b5cf6", // Purple
    icon: "Cpu"
  },
  {
    id: "developer",
    name: "Developer",
    role: "Software Developer",
    tool: "FileWriterTool, CodeInterpreterTool",
    description: "Writes production-quality, runnable code and file structure following the architecture spec.",
    color: "#06b6d4", // Cyan
    icon: "Code"
  },
  {
    id: "qa_tester",
    name: "QA Tester",
    role: "QA Tester",
    tool: "CodeInterpreterTool",
    description: "Generates functional and edge-case test suites, validates execution, and issues pass/fail reports.",
    color: "#10b981", // Emerald
    icon: "CheckCircle"
  },
  {
    id: "security_reviewer",
    name: "Security Reviewer",
    role: "Application Security Engineer",
    tool: "SerperDevTool, FileReadTool",
    description: "Strictly audits injection risks, auth/authz gaps, hardcoded secrets, and unsafe deserialization.",
    color: "#f59e0b", // Amber
    icon: "Shield"
  },
  {
    id: "performance_reviewer",
    name: "Performance Reviewer",
    role: "Performance Engineer",
    tool: "CodeInterpreterTool",
    description: "Identifies algorithmic complexity bottlenecks, N+1 query patterns, and hot-path allocations.",
    color: "#ec4899", // Pink
    icon: "Gauge"
  },
  {
    id: "maintainability_reviewer",
    name: "Maintainability Reviewer",
    role: "Maintainability Reviewer",
    tool: "FileReadTool",
    description: "Assesses naming clarity, tight coupling, and dead or over-engineered abstractions.",
    color: "#3b82f6", // Blue
    icon: "Layers"
  },
  {
    id: "test_coverage_reviewer",
    name: "Test Coverage Reviewer",
    role: "QA Coverage Lead",
    tool: "CodeInterpreterTool",
    description: "Highlights gaps between QA test cases and source code, flagging untested and untestable areas.",
    color: "#14b8a6", // Teal
    icon: "Target"
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
