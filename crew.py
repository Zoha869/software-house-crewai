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
# The above drop_params fix does NOT stop the 'cache_breakpoint' error.
# CrewAI (as of 1.15.x) unconditionally stamps a 'cache_breakpoint' key
# onto every message dict in crew_agent_executor.py's _setup_messages(),
# regardless of the CREWAI_PROMPT_CACHING env var. That key is only
# stripped/translated for the Anthropic provider path — for every other
# provider (including Groq) it is passed straight through litellm to the
# provider's chat API, which rejects the unknown property. drop_params
# can't fix this because it only drops unsupported top-level completion
# kwargs, not keys nested inside message dicts. So we disable the
# stamping at its source instead.
# ---------------------------------------------------------------------
import crewai.llms.cache as _crewai_cache


def _noop_mark_cache_breakpoint(message):
    return dict(message)


_crewai_cache.mark_cache_breakpoint = _noop_mark_cache_breakpoint

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