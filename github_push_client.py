import asyncio
import json

from mcp import Client

from mcp_server.github_server import server as github_mcp_server


def _extract_json(call_tool_result) -> dict:
    """CallToolResult ke andar se tool ka JSON dict result nikalta hai."""
    if call_tool_result.is_error:
        text = call_tool_result.content[0].text if call_tool_result.content else "unknown MCP error"
        return {"ok": False, "error": text}
    text = call_tool_result.content[0].text
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return {"ok": False, "error": f"Could not parse tool result: {text}"}


async def _push_project_to_github_async(
    github_token: str,
    repo_name: str,
    files: dict[str, str],
    private: bool = False,
    commit_message: str = "Add CrewAI generated code",
) -> dict:
    async with Client(github_mcp_server) as client:
        # 1) Token verify + username nikalna (push ke liye owner chahiye hota hai)
        user_result = _extract_json(await client.call_tool("get_authenticated_user", {"github_token": github_token}))
        if not user_result.get("ok"):
            return {"ok": False, "step": "auth", **user_result}
        owner = user_result["login"]

        # 2) Repo banane ki koshish (agar already maujood hai to bhi aage badh jayega)
        repo_result = _extract_json(
            await client.call_tool(
                "create_repository",
                {"github_token": github_token, "repo_name": repo_name, "private": private},
            )
        )
        if not repo_result.get("ok"):
            return {"ok": False, "step": "create_repository", **repo_result}

        # 3) Actual files push karna
        push_result = _extract_json(
            await client.call_tool(
                "push_files",
                {
                    "github_token": github_token,
                    "owner": owner,
                    "repo_name": repo_name,
                    "files": files,
                    "commit_message": commit_message,
                },
            )
        )
        push_result["owner"] = owner
        push_result["step"] = "push_files"
        return push_result


def push_project_to_github(
    github_token: str,
    repo_name: str,
    files: dict[str, str],
    private: bool = False,
    commit_message: str = "Add CrewAI generated code",
) -> dict:
    """
    Sync wrapper — main.py se seedha normal function ki tarah call karo,
    andar async MCP client khud handle ho jata hai.

    Returns dict, e.g.:
        {"ok": True, "pushed": [...], "failed": [...], "repo_url": "...", "owner": "..."}
    """
    return asyncio.run(
        _push_project_to_github_async(
            github_token=github_token,
            repo_name=repo_name,
            files=files,
            private=private,
            commit_message=commit_message,
        )
    )
