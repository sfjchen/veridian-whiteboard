#!/usr/bin/env python3
from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
vals: dict[str, str] = {}
for line in (ROOT / ".env.local").read_text().splitlines():
    if not line.strip() or line.strip().startswith("#") or "=" not in line:
        continue
    key, value = line.split("=", 1)
    vals[key.strip()] = value.strip()

vals["OPENROUTER_SITE_URL"] = "https://veridian.sfjc.dev"

keys = [
    "OPENROUTER_API_KEY",
    "MATH_OCR_MODEL",
    "MISTAKE_ANALYSIS_MODEL",
    "COORDINATE_MODEL",
    "CHAT_MODEL",
    "OPENROUTER_SITE_URL",
    "OPENROUTER_APP_TITLE",
]

for key in keys:
    value = vals.get(key, "")
    if not value:
        continue
    for env in ("production", "preview", "development"):
        subprocess.run(
            [
                "vercel", "env", "add", key, env,
                "--yes", "--scope", "sfjchen-projects",
                "--value", value, "--force",
            ],
            cwd=ROOT,
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        print(f"set {key} ({env})")
