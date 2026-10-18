"""Build web/index.html, a single self-contained page, from the files in web/src/.

    python3 web/src/build.py

The page template (index.html) gets the stylesheets, Emi's drawing and the
scripts (joined in the order below, inside one function scope) inlined.
If Node is installed, the combined script is syntax-checked first.
"""
import pathlib
import shutil
import subprocess
import sys
import tempfile

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent / "index.html"

STYLES = ["css/app.css", "emi/emi.css"]
SCRIPTS = [  # order matters: later files use earlier ones at start-up
    "js/util.js", "js/state.js", "js/ai.js", "js/emi.js", "js/tasks.js", "js/brain.js",
    "js/smart.js", "js/sessions.js", "js/nudges.js", "js/now.js", "js/list.js",
    "js/talk.js", "js/settings.js", "js/main.js",
]


def read(rel):
    return (SRC / rel).read_text()


def build():
    css = "\n".join(read(p).strip() for p in STYLES)
    js = "\n\n".join(f"/* ===== {p} ===== */\n" + read(p).strip() for p in SCRIPTS)
    js = '(() => {\n"use strict";\n\n' + js + "\n})();"

    if shutil.which("node"):
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as f:
            f.write(js)
        check = subprocess.run(["node", "--check", f.name], capture_output=True, text=True)
        pathlib.Path(f.name).unlink()
        if check.returncode:
            sys.exit("Script has a syntax error:\n" + check.stderr)

    page = read("index.html")
    for marker, content in [("/*STYLES*/", css), ("<!--EMI_SVG-->", read("emi/emi.svg.html").strip()), ("/*SCRIPTS*/", js)]:
        if marker not in page:
            sys.exit(f"Missing {marker} in index.html")
        page = page.replace(marker, content)

    OUT.write_text(page)
    print(f"Built {OUT.relative_to(SRC.parent.parent)} ({len(page) // 1024} KB)")


if __name__ == "__main__":
    build()
