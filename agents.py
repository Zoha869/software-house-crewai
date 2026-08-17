import os
from dotenv import load_dotenv
from crewai import Agent, LLM
from llm_rotator import enable_key_rotation

load_dotenv()

# ---------------------------------------------------------------------
# LLM Setup
# Using Groq because it's fast and has a free tier available.
# Multiple API keys use kar rahe hain (.env mein GROQ_API_KEYS,
# comma-separated) taake ek key rate-limit hone par doosri automatically
# use ho jaye — is se free tier ke saath zyada requests chala sakte hain.
# ---------------------------------------------------------------------
_groq_keys = [
    k.strip() for k in os.getenv("GROQ_API_KEYS", "").split(",") if k.strip()
]

# Ye litellm.completion ko patch kar deta hai taake har API call
# automatically rotation use kare (2+ keys hone par).
enable_key_rotation(_groq_keys)

llm = LLM(
    model="groq/openai/gpt-oss-120b",
    api_key=_groq_keys[0] if _groq_keys else os.getenv("GROQ_API_KEY"),
    temperature=0.3,
)

# 1. Feature Extractor — extracts features from the requirements document
feature_extractor = Agent(
    role="Requirements Analyst / Feature Extractor",
    goal="Read the requirements document and extract a clear, structured feature list",
    backstory=(
        "You are an experienced Business Analyst who reads raw requirement "
        "documents (which are often unclear or incomplete) and extracts "
        "concrete, testable features from them, flagging missing details "
        "as explicit assumptions."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# 2. Architect — designs the system architecture for the features
architect = Agent(
    role="Software Architect",
    goal="Design a clean, appropriately-scoped system architecture for the extracted features",
    backstory=(
        "You are a senior Software Architect. You avoid unnecessary "
        "complexity — you design only as much as the given features "
        "actually need. You define the tech stack, components, and "
        "data flow."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# 3. Developer — implements according to the architecture
developer = Agent(
    role="Software Developer",
    goal="Write clean, working, well-commented code according to the architecture",
    backstory=(
        "You are a skilled developer who follows the architecture "
        "document to write production-quality code — not more, not "
        "less, just what's within scope."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# 4. QA Tester — functionally tests the code
qa_tester = Agent(
    role="QA Tester",
    goal="Test the code against the requirements and find functional bugs",
    backstory=(
        "You are a QA Engineer who writes functional and edge-case test "
        "cases, mentally/logically runs them, and gives a pass/fail "
        "report on whether the code fulfills the requirements."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# 5. Security Reviewer — injection, auth, secrets, unsafe deserialization
security_reviewer = Agent(
    role="Security Reviewer",
    goal=(
        "Find security vulnerabilities in the code, specifically: "
        "injection attacks, authentication/authorization gaps, hardcoded "
        "or exposed secrets, and unsafe deserialization."
    ),
    backstory=(
        "You are an Application Security Engineer who follows OWASP "
        "guidelines and focuses only on these 4 categories: injection, "
        "auth, secrets, unsafe deserialization — reporting every issue "
        "along with its severity."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# 6. Performance Reviewer — complexity, N+1s, hot-path allocations
performance_reviewer = Agent(
    role="Performance Reviewer",
    goal=(
        "Identify performance issues in the code: time/space complexity "
        "problems, N+1 query patterns, and unnecessary allocations in "
        "hot paths."
    ),
    backstory=(
        "You are a Performance Engineer who looks at code through the "
        "lens of efficiency — algorithmic complexity, repeated/redundant "
        "DB or API calls (N+1), and avoidable object creation in loops/"
        "hot paths."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# 7. Maintainability Reviewer — naming, coupling, dead abstractions
maintainability_reviewer = Agent(
    role="Maintainability Reviewer",
    goal=(
        "Assess the long-term maintainability of the code: naming "
        "clarity, tight/unnecessary coupling, and dead or over-"
        "engineered abstractions."
    ),
    backstory=(
        "You are a senior engineer who focuses on code readability and "
        "future maintainability — identifying confusing names, modules "
        "that depend on each other more than necessary, and unused/"
        "unnecessary abstraction layers."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# 8. Test Coverage Reviewer — untested and untestable parts
test_coverage_reviewer = Agent(
    role="Test Coverage Reviewer",
    goal=(
        "Identify which parts of the code are untested, and — given how "
        "the code is currently written — what is untestable (and why)."
    ),
    backstory=(
        "You are a QA Coverage Lead. You look at both the QA Tester's "
        "test cases and the actual code, and highlight the gaps — what "
        "was missed, and what simply can't be tested because of the "
        "code's current structure (e.g. tightly coupled I/O, no "
        "dependency injection, hidden global state)."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False,
)