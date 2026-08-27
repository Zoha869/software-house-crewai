import os

root = os.path.join("venv", "Lib", "site-packages", "litellm")
needles = ["PROMPT_CACHING", "cache_breakpoint", "cache_control", "prompt_caching"]
for dirpath, dirs, files in os.walk(root):
    for f in files:
        if f.endswith(".py"):
            p = os.path.join(dirpath, f)
            try:
                with open(p, encoding="utf-8") as fh:
                    content = fh.read()
            except Exception:
                continue
            for n in needles:
                if n in content:
                    print(p, "->", n)
