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


def build_crew(requirements_document: str) -> Crew:
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
    )
    return crew