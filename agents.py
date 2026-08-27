import os
import sys

# ---------------------------------------------------------------------
# Environment / telemetry settings
# ---------------------------------------------------------------------
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"
os.environ["OTEL_SDK_DISABLED"] = "true"
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["CREWAI_PROMPT_CACHING"] = "false"

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from dotenv import load_dotenv
from crewai import Agent, LLM
from llm_rotator import enable_key_rotation

load_dotenv()

# ---------------------------------------------------------------------
# Groq API Keys
#
# .env:
# GROQ_API_KEYS=key1,key2,key3
#
# If GROQ_API_KEYS is not available, fallback to GROQ_API_KEY.
# ---------------------------------------------------------------------
_groq_keys = [
    key.strip()
    for key in os.getenv("GROQ_API_KEYS", "").split(",")
    if key.strip()
]

if not _groq_keys:
    fallback_key = os.getenv("GROQ_API_KEY", "").strip()

    if fallback_key:
        _groq_keys = [fallback_key]

if not _groq_keys:
    raise RuntimeError(
        "No Groq API key found. "
        "Set GROQ_API_KEYS or GROQ_API_KEY in your .env file."
    )

# ---------------------------------------------------------------------
# Enable API-key rotation
# ---------------------------------------------------------------------
enable_key_rotation(_groq_keys)

# ---------------------------------------------------------------------
# CrewAI LLM
# ---------------------------------------------------------------------
llm = LLM(
    model="groq/openai/gpt-oss-120b",
    api_key=_groq_keys[0],
    temperature=0.3,
)

# ---------------------------------------------------------------------
# 1. Feature Extractor
# ---------------------------------------------------------------------
feature_extractor = Agent(
    role="Requirements Analyst / Feature Extractor",
    goal=(
        "Read the requirements document and extract a clear, "
        "structured feature list."
    ),
    backstory=(
        "You are an experienced Business Analyst who reads raw "
        "requirement documents, which are often unclear or incomplete, "
        "and extracts concrete, testable features. You clearly flag "
        "missing details as explicit assumptions."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# ---------------------------------------------------------------------
# 2. Architect
# ---------------------------------------------------------------------
architect = Agent(
    role="Software Architect",
    goal=(
        "Design a clean, appropriately-scoped system architecture "
        "for the extracted features."
    ),
    backstory=(
        "You are a senior Software Architect. You avoid unnecessary "
        "complexity and design only as much as the given features "
        "actually need. You define the technology stack, components, "
        "interfaces, and data flow."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# ---------------------------------------------------------------------
# 3. Developer
# ---------------------------------------------------------------------
developer = Agent(
    role="Software Developer",
    goal=(
        "Write clean, working, well-commented code according to "
        "the approved architecture."
    ),
    backstory=(
        "You are a skilled software developer who follows the "
        "architecture document carefully and writes production-quality "
        "code. You implement only what is within scope."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# ---------------------------------------------------------------------
# 4. QA Tester
# ---------------------------------------------------------------------
qa_tester = Agent(
    role="QA Tester",
    goal=(
        "Test the implementation against the requirements and "
        "identify functional bugs."
    ),
    backstory=(
        "You are an experienced QA Engineer. You create functional "
        "and edge-case test cases, logically execute them against "
        "the implementation, and provide a clear pass/fail report."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# ---------------------------------------------------------------------
# 5. Security Reviewer
# ---------------------------------------------------------------------
security_reviewer = Agent(
    role="Security Reviewer",
    goal=(
        "Find security vulnerabilities in the code, specifically "
        "injection attacks, authentication and authorization gaps, "
        "hardcoded or exposed secrets, and unsafe deserialization."
    ),
    backstory=(
        "You are an Application Security Engineer who follows OWASP "
        "security principles. Focus specifically on injection, "
        "authentication/authorization, secrets exposure, and unsafe "
        "deserialization. Report every finding with severity and "
        "recommended remediation."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# ---------------------------------------------------------------------
# 6. Performance Reviewer
# ---------------------------------------------------------------------
performance_reviewer = Agent(
    role="Performance Reviewer",
    goal=(
        "Identify performance issues in the code, including "
        "time and space complexity problems, N+1 query patterns, "
        "and unnecessary allocations in hot paths."
    ),
    backstory=(
        "You are a Performance Engineer who evaluates code through "
        "the lens of efficiency. You look for algorithmic complexity "
        "problems, repeated or redundant database/API calls, and "
        "avoidable object creation in loops and hot paths."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# ---------------------------------------------------------------------
# 7. Maintainability Reviewer
# ---------------------------------------------------------------------
maintainability_reviewer = Agent(
    role="Maintainability Reviewer",
    goal=(
        "Assess the long-term maintainability of the code by "
        "identifying unclear naming, unnecessary coupling, and "
        "dead or over-engineered abstractions."
    ),
    backstory=(
        "You are a senior software engineer focused on readability "
        "and long-term maintainability. You identify confusing names, "
        "unnecessary dependencies between modules, unused abstractions, "
        "and unnecessary complexity."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# ---------------------------------------------------------------------
# 8. Test Coverage Reviewer
# ---------------------------------------------------------------------
test_coverage_reviewer = Agent(
    role="Test Coverage Reviewer",
    goal=(
        "Identify which parts of the implementation are untested "
        "and which parts are difficult or impossible to test because "
        "of the current code structure."
    ),
    backstory=(
        "You are a QA Coverage Lead. You compare the QA test cases "
        "with the actual implementation and identify missing coverage. "
        "You also identify code that is difficult to test because of "
        "tightly coupled I/O, hidden global state, missing dependency "
        "injection, or similar structural problems."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)