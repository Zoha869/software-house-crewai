from crewai import Task
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

def build_tasks(requirements_document: str):
    # 1. Requirements Document -> Feature List
    feature_extraction_task = Task(
        description=(
            f"Below is the requirements document:\n\n"
            f"{requirements_document}\n\n"
            "Read it and extract a clear, structured feature list. "
            "If anything is unclear or missing, document it as an assumption "
            "— do not invent features, only note down reasonable assumptions."
        ),
        expected_output=(
            "Structured feature list (bullet points) + assumptions list, "
            "in markdown format"
        ),
        agent=feature_extractor,
    )

    # 2. Features -> Architecture
    architecture_task = Task(
        description=(
            "Design the system architecture for the extracted features. "
            "Keep the scope minimal — design only what is actually required "
            "for these features, do not over-engineer."
        ),
        expected_output=(
            "Architecture doc: tech stack, components/modules, "
            "and (if needed) data model — short and practical"
        ),
        agent=architect,
        context=[feature_extraction_task],
    )

    # 3. Architecture -> Code
    development_task = Task(
        description=(
            "Write the actual code following the architecture document. "
            "The code must be clean, modular, commented, concise, and runnable. "
            "Clearly specify the file structure."
        ),
        expected_output="Complete runnable code (with file structure) + short explanation",
        agent=developer,
        context=[architecture_task],
    )

    # 4. Code -> QA Testing
    qa_task = Task(
        description=(
            "Test the developer's code against the requirements/features. "
            "Write functional test cases (happy path + edge cases) "
            "and provide a pass/fail assessment."
        ),
        expected_output="Test cases list + pass/fail report with reasoning",
        agent=qa_tester,
        context=[development_task, feature_extraction_task],
    )

    # 5. Code -> Security Review
    security_review_task = Task(
        description=(
            "Audit the code strictly across these 4 categories: "
            "(1) injection risks, (2) authentication/authorization gaps, "
            "(3) hardcoded or exposed secrets, (4) unsafe deserialization. "
            "Provide a severity level (High/Medium/Low) for each finding."
        ),
        expected_output="Security findings list: category + severity + fix recommendation",
        agent=security_reviewer,
        context=[development_task],
    )

    # 6. Code -> Performance Review
    performance_review_task = Task(
        description=(
            "Review the code for performance optimization: "
            "(1) time/space complexity issues, (2) N+1 query/call "
            "patterns, (3) unnecessary allocations in hot paths. "
            "Focus exclusively on these 3 aspects."
        ),
        expected_output="Performance findings list: issue + location + suggested fix",
        agent=performance_reviewer,
        context=[development_task],
    )

    # 7. Code -> Maintainability Review
    maintainability_review_task = Task(
        description=(
            "Review the code for maintainability: "
            "(1) naming clarity, (2) unnecessary/tight coupling, "
            "(3) dead or over-engineered abstractions. "
            "Focus exclusively on these items."
        ),
        expected_output="Maintainability findings list: issue + location + suggested fix",
        agent=maintainability_reviewer,
        context=[development_task],
    )

    # 8. QA + Code -> Test Coverage Review
    # NOTE: Only qa_task is passed as context (not development_task) to keep
    # the payload under Groq's request size limit. The QA report already
    # contains the code context since qa_task had development_task in its chain.
    test_coverage_review_task = Task(
        description=(
            "Analyze the QA Tester's test cases and the code they reference. "
            "Identify: (1) which parts of the code remain untested, "
            "(2) what is untestable based on current implementation and why "
            "(e.g., tightly coupled I/O, missing dependency injection, hidden state)."
        ),
        expected_output="Coverage gap report: untested areas + untestable areas with reasons",
        agent=test_coverage_reviewer,
        context=[qa_task],
    )

    return [
        feature_extraction_task,
        architecture_task,
        development_task,
        qa_task,
        security_review_task,
        performance_review_task,
        maintainability_review_task,
        test_coverage_review_task,
    ]
