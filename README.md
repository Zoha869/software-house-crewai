# Software Engineering Multi-Agent System (CrewAI)

This project simulates a software engineering team using CrewAI — 8 specialized agents, each handling one role, passing its output to the next agent(s) in the pipeline. The goal is to learn multi-agent orchestration with a small, learning-scale project (not a full production system).

## Team / Pipeline


requirements document (sample_requirements.txt)
        |
        v
1. Feature Extractor        -> feature list + assumptions
        |
        v
2. Architect                -> system architecture
        |
        v
3. Developer                -> actual code
        |
        v
   (developer's output now goes to 4 reviewers)
        |
   +----+----+----+----+
   |    |    |    |
   v    v    v    v
4.QA  5.Sec 6.Perf 7.Maint
   |    |    |    |
   +----+----+----+
        |
        v
8. Test Coverage Reviewer   -> untested / untestable report
   (looks at both QA's test cases and the code)


## Agents

| # | Agent | Focus |
|---|---|---|
| 1 | Feature Extractor | Extracting a feature list from the requirements doc |
| 2 | Architect | Scoped architecture design for the features |
| 3 | Developer | Writing code according to the architecture |
| 4 | QA Tester | Functional test cases + pass/fail |
| 5 | Security Reviewer | Injection, auth, secrets, unsafe deserialization |
| 6 | Performance Reviewer | Complexity, N+1s, hot-path allocations |
| 7 | Maintainability Reviewer | Naming, coupling, dead abstractions |
| 8 | Test Coverage Reviewer | What's untested, what's untestable (and why) |

## Files

| File | Purpose |
|---|---|
| agents.py | All 8 agents (role, goal, backstory, LLM) |
| tasks.py | Each agent's task + dependency chain via context=[...] |
| crew.py | Assembles Agents + Tasks into a Crew |
| main.py | Entry point — loads the requirements doc, runs the crew |
| sample_requirements.txt | Small test example (URL Shortener) |
| requirements.txt | Python dependencies |
| .env.example | API key template |

## How to run

bash
pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY in .env: https://console.groq.com/keys
python main.py


When you run it, you'll be given the option to use sample_requirements.txt, or you can paste your own requirements document.

## Design rationale (the orchestration concept)

- *Sequential chain (1->2->3):* Feature Extraction, Architecture, and Development depend on each other, so they strictly run in order (context=[previous_task]).

- *4 reviewers, all depending on development_task (4-7):* QA, Security, Performance, and Maintainability are four independent concerns that all depend only on the developer's code, not on each other. CrewAI's Process.sequential runs them one after another, but conceptually these are "parallel reviews" — in a real team, they could happen simultaneously.

- *Test Coverage Reviewer (8) runs last:* because it needs both the QA Tester's test cases and the actual code, so it can report what wasn't covered and what can't be tested given the code's current design.

- *The role of context=[...]:* this is the CrewAI mechanism that automatically injects one task's output into the next task's prompt — this is what makes "orchestration" happen, so agents don't have to manually copy-paste each other's output.

## Next steps to explore (for learning agent orchestration further)

- Process.sequential vs Process.hierarchical — in hierarchical mode, a "manager" agent dynamically delegates to the other agents (no fixed order). Worth trying if you want to understand orchestration more deeply.
- Running the reviewers (4-7) *truly in parallel* — CrewAI supports async task execution; kept sequential here for simplicity.
- Adding a 9th "Aggregator" agent that combines all the reviewers' (5, 6, 7, 8) findings into a single consolidated report.
-