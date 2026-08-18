"""
crew.py
-------
Pura "software engineering team" ek Crew ke andar assemble hota hai.
Process.sequential = agents apni turn par kaam karenge, order:
feature extraction -> architecture -> development -> QA ->
security -> performance -> maintainability -> test coverage.
"""

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


def build_crew(requirements_document: str, task_callback=None) -> Crew:
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
        # task_callback fires after each task finishes — the FastAPI
        # backend uses this to push live progress events to the frontend.
        task_callback=task_callback,
    )
    return crew


# Fixed pipeline order — used by the API layer to know which agent
# is "up next" before its task actually completes.
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