"""
code_parser.py
--------------
Developer agent (crew.tasks[2]) apna output ek markdown text ki tarah deta
hai jisme ```fenced code blocks``` hote hain, aur usually block se pehle
kahin na kahin filename likha hota hai (`main.py`, **app.py**, "File: x.py"
waghera).

Ye file (`frontend/src/utils/codeParser.js` jo already frontend mein use ho
raha hai uska hi Python version) us raw text ko parse karke ek clean
{filename: code} dict banati hai — taake `github_push_client.py` seedha
GitHub par push kar sake.
"""

import re

FENCE_RE = re.compile(r"^\s*```\s*([A-Za-z0-9_-]*)\s*$")
CLOSE_FENCE_RE = re.compile(r"^\s*```\s*$")

LANG_EXT = {
    "python": "py", "py": "py", "javascript": "js", "js": "js", "jsx": "jsx",
    "typescript": "ts", "ts": "ts", "tsx": "tsx", "json": "json", "html": "html",
    "css": "css", "bash": "sh", "sh": "sh", "shell": "sh", "yaml": "yml",
    "yml": "yml", "sql": "sql", "markdown": "md", "md": "md",
    "dockerfile": "Dockerfile", "java": "java", "go": "go", "rust": "rs",
    "c": "c", "cpp": "cpp", "txt": "txt",
}

_BACKTICK_FILENAME = re.compile(r"`([\w./-]+\.[A-Za-z0-9]+)`")
_BOLD_FILENAME = re.compile(r"^\*\*([\w./-]+\.[A-Za-z0-9]+)\*\*")
_HEADING_FILENAME = re.compile(r"^#{1,6}\s+([\w./-]+\.[A-Za-z0-9]+)\s*$")
_LABEL_FILENAME = re.compile(r"^(?:\*\*)?(?:File|Filename|Path)(?:\*\*)?:\s*`?([\w./-]+\.[A-Za-z0-9]+)`?", re.I)
_BARE_FILENAME = re.compile(r"^([\w][\w./-]*\.[A-Za-z0-9]+)$")
_TREE_CHARS = re.compile(r"[│├└─]")


def _extract_filename(line: str) -> str | None:
    if not line:
        return None
    trimmed = line.strip()
    for pattern in (_BACKTICK_FILENAME, _BOLD_FILENAME, _HEADING_FILENAME, _LABEL_FILENAME, _BARE_FILENAME):
        m = pattern.match(trimmed) if pattern is not _BACKTICK_FILENAME else pattern.search(trimmed)
        if m:
            return m.group(1)
    return None


def _extract_filename_from_first_code_line(line: str) -> str | None:
    if not line:
        return None
    trimmed = line.strip()
    for prefix in ("#", "//", "--", "<!--"):
        if trimmed.startswith(prefix):
            rest = trimmed[len(prefix):].strip()
            rest = re.sub(r"-->\s*$", "", rest).strip()
            m = _BARE_FILENAME.match(rest)
            if m:
                return m.group(1)
    return None


def parse_code_files(raw: str) -> dict[str, str]:
    """Raw markdown -> {file_path: code}. Anonymous/undetectable-name blocks
    get auto-named snippet_1.ext, snippet_2.ext, etc."""
    if not raw:
        return {}

    lines = raw.split("\n")
    files: dict[str, str] = {}
    recent_non_empty: list[str] = []
    anonymous_count = 0

    i = 0
    while i < len(lines):
        line = lines[i]
        fence_match = FENCE_RE.match(line)
        if fence_match:
            lang = fence_match.group(1).lower()
            buffer = []
            i += 1
            while i < len(lines) and not CLOSE_FENCE_RE.match(lines[i]):
                buffer.append(lines[i])
                i += 1
            i += 1  # skip closing fence

            filename = None
            for k in range(len(recent_non_empty) - 1, -1, -1):
                filename = _extract_filename(recent_non_empty[k])
                if filename:
                    break
            if not filename and buffer:
                filename = _extract_filename_from_first_code_line(buffer[0])

            code_text = "\n".join(buffer).strip()
            looks_like_tree = bool(_TREE_CHARS.search(code_text))
            is_prose_lang = lang in ("text", "txt", "markdown", "md", "") and not filename

            if code_text and not looks_like_tree and not (is_prose_lang and len(code_text.split("\n")) < 2):
                if not filename:
                    anonymous_count += 1
                    ext = LANG_EXT.get(lang, "txt")
                    filename = f"snippet_{anonymous_count}.{ext}"
                files[filename.lstrip("./")] = code_text

            recent_non_empty = []
            continue

        if line.strip():
            recent_non_empty.append(line)
            if len(recent_non_empty) > 4:
                recent_non_empty.pop(0)
        i += 1

    return files
