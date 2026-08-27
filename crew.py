"""
crew.py
-------
Assembles the full software engineering team.
Agents execute sequentially:
feature extraction -> architecture -> development -> QA ->
security -> performance -> maintainability -> test coverage.
"""

import os
import sys

# ---------------------------------------------------------------------
# Disable telemetry / prompt caching
# ---------------------------------------------------------------------
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"
os.environ["OTEL_SDK_DISABLED"] = "true"
os.environ["CREWAI_PROMPT_CACHING"] = "false"
os.environ["PYTHONIOENCODING"] = "utf-8"

# ---------------------------------------------------------------------
# IMPORTANT:
# CrewAI utilizes LiteLLM under the hood. To prevent CrewAI's prompt
# caching from passing 'cache_breakpoint' to providers that reject it 
# (like Groq), we instruct LiteLLM to automatically drop unsupported parameters.
# ---------------------------------------------------------------------
import litellm

litellm.drop_params = True

# ---------------------------------------------------------------------
# Windows UTF-8
# ---------------------------------------------------------------------
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ---------------------------------------------------------------------
# CrewAI imports
# ---------------------------------------------------------------------
from crewai import Crew, Process

from agents import (
    feature_extractor,
    architect,
    developer,
    qa_tester,
    security_reviewer,
    performance_reviewer,
    maintainability_reviewer,
    test_coverage_reviewer,
)

from tasks import build_tasks


# ---------------------------------------------------------------------
# Build Crew
# ---------------------------------------------------------------------
def build_crew(requirements_document: str, task_callback=None) -> Crew:
    """
    Build the complete software engineering crew.

    Execution order:

    1. Feature Extraction
    2. Architecture
    3. Development
    4. QA
    5. Security Review
    6. Performance Review
    7. Maintainability Review
    8. Test Coverage Review
    """

    tasks = build_tasks(requirements_document)

    crew = Crew(
        agents=[
            feature_extractor,
            architect,
            developer,
            qa_tester,
            security_reviewer,
            performance_reviewer,
            maintainability_reviewer,
            test_coverage_reviewer,
        ],
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
        task_callback=task_callback,
    )

    return crew


# ---------------------------------------------------------------------
# Agent execution order
# ---------------------------------------------------------------------
AGENT_SEQUENCE = [
    "Feature Extractor",
    "Architect",
    "Developer",
    "QA Tester",
    "Security Reviewer",
    "Performance Reviewer",
    "Maintainability Reviewer",
    "Test Coverage Reviewer",
]
