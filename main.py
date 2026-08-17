import os
from crew import build_crew

DEFAULT_REQUIREMENTS_FILE = "sample_requirements.txt"


def load_requirements() -> str:
    if os.path.exists(DEFAULT_REQUIREMENTS_FILE):
        use_default = input(
            f"Found '{DEFAULT_REQUIREMENTS_FILE}' — would you like to use it? (Y/n): "
        ).strip().lower()
        if use_default in ("", "y", "yes"):
            with open(DEFAULT_REQUIREMENTS_FILE, "r", encoding="utf-8") as f:
                return f.read()

    print("Please paste your requirements document. Type 'END' on a blank line to finish:\n")
    lines = []
    while True:
        line = input()
        if line.strip() == "END":
            break
        lines.append(line)
    return "\n".join(lines)


if __name__ == "__main__":
    print("=== Software Engineering Multi-Agent System (CrewAI) ===\n")

    requirements_document = load_requirements()

    crew = build_crew(requirements_document)
    result = crew.kickoff()

    print("\n\n=== FINAL OUTPUT (Test Coverage Reviewer Report) ===\n")
    print(result)

    # To see the individual outputs of each agent:
    for task_output in crew.tasks:
        print(task_output.agent.role, "->", task_output.output)
