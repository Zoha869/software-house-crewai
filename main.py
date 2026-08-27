import getpass
import os

from crew import build_crew
from code_parser import parse_code_files
from github_push_client import push_project_to_github

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


def get_developer_code(crew) -> dict:
    """Developer agent ke task ka raw output dhoondh kar usme se
    {filename: code} nikalta hai (code_parser.py ke zariye)."""
    for task_output in crew.tasks:
        if task_output.agent.role == "Software Developer":
            raw = str(getattr(task_output.output, "raw", task_output.output))
            return parse_code_files(raw)
    return {}


def maybe_push_to_github(crew) -> None:
    """Pipeline khatam hone ke baad user se pochta hai k GitHub par push
    karna hai ya nahi — agar haan, to account details lekar push kar deta hai."""
    answer = input("\nKya generated code GitHub par push karna hai? (y/N): ").strip().lower()
    if answer not in ("y", "yes"):
        print("Theek hai, GitHub push skip kar diya.")
        return

    files = get_developer_code(crew)
    if not files:
        print("Developer agent ke output mein koi code block detect nahi hua — push cancel.")
        return

    print(f"\n{len(files)} file(s) detect hui: {', '.join(files.keys())}")

    # getpass isliye taake token terminal par dikhe nahi
    github_token = getpass.getpass("GitHub Personal Access Token (repo scope wala): ").strip()
    repo_name = input("Repository ka naam (e.g. my-crewai-project): ").strip()
    private_answer = input("Private repo banayein? (y/N): ").strip().lower()
    is_private = private_answer in ("y", "yes")

    if not github_token or not repo_name:
        print("Token ya repo name khaali nahi ho sakta — push cancel.")
        return

    print("\nGitHub par push ho raha hai...")
    try:
        result = push_project_to_github(
            github_token=github_token,
            repo_name=repo_name,
            files=files,
            private=is_private,
        )
    except Exception as exc:  # noqa: BLE001 — user-facing error dikhana hai
        print(f"Push fail ho gaya: {exc}")
        return

    if not result.get("ok"):
        print(f"Push fail ho gaya (step: {result.get('step', '?')}): {result.get('error', result)}")
        return

    print(f"\nPush ho gaya! Repo: {result['repo_url']}")
    print(f"Pushed files: {', '.join(result['pushed'])}")
    if result.get("failed"):
        print(f"Ye files fail hui: {result['failed']}")


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

    # Sab kuch chalne ke baad — GitHub push ka interactive step
    maybe_push_to_github(crew)
