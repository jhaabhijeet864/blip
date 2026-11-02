#!/usr/bin/env python3
"""
Automated Codebase Issue Generator for Blip.
Uses Gemini 3.8 Flash as the primary analysis engine with an automatic
Groq API fallback (llama-3.3-70b-versatile).

Features:
- Target area scanning (security, guardrails, ai_vision, performance, or all).
- Structured JSON output with strict validation.
- Anti-duplicate detection against existing GitHub issues via fingerprints.
- Graceful health checks and fallback switching.
- Dry-run preview and direct GitHub issue creation via GitHub REST API.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT_DIR = Path(__file__).resolve().parent.parent
TAG_PREFIX = "<!-- BLIP-AUDIT-ID:"

# Model configuration
DEFAULT_GEMINI_MODEL = "gemini-3.8-flash"
DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"

# Target areas and associated representative source files
TARGET_AREAS = {
    "security": [
        "extension/src/content.ts",
        "extension/src/stream-interceptor.ts",
        "extension/manifest.json",
        "extension/src/popup.ts",
    ],
    "guardrails": [
        "extension/src/audio/click-detector.ts",
        "extension/src/gestures/snap-kinematics.ts",
        "extension/src/stream-interceptor.ts",
    ],
    "ai_vision": [
        "extension/src/vision/vision-detector.ts",
        "extension/src/vision/types.ts",
        "extension/src/gestures/snap-kinematics.ts",
        "web/src/components/LivePlayground.tsx",
    ],
    "performance": [
        "extension/src/overlay.ts",
        "extension/src/effects/particles.ts",
        "extension/src/effects/plate-manager.ts",
        "extension/src/stream-interceptor.ts",
    ],
}


def log(msg: str) -> None:
    print(f"[Blip Issue Generator] {msg}", flush=True)


def resolve_api_keys() -> Tuple[Optional[str], Optional[str]]:
    """Resolve Gemini and Groq API keys with fallback variable names."""
    gemini_key = os.environ.get("ISSUE_MAKER_GEMINI_KEY") or os.environ.get("GEMINI_API_KEY")
    groq_key = os.environ.get("ISSUE_MAKER_GROQ_KEY") or os.environ.get("GROQ_API_KEY")
    return gemini_key, groq_key


def gather_code_context(target_area: str) -> Dict[str, str]:
    """Read contents of target files for the analysis prompt."""
    files_to_read: List[str] = []
    if target_area == "all":
        seen = set()
        for f_list in TARGET_AREAS.values():
            for f in f_list:
                if f not in seen:
                    seen.add(f)
                    files_to_read.append(f)
    else:
        files_to_read = TARGET_AREAS.get(target_area, TARGET_AREAS["security"])

    code_context: Dict[str, str] = {}
    for rel_path in files_to_read:
        full_path = ROOT_DIR / rel_path
        if full_path.exists():
            try:
                code_context[rel_path] = full_path.read_text(encoding="utf-8", errors="replace")
            except Exception as e:
                log(f"Warning: could not read {rel_path}: {e}")
    return code_context


def fetch_existing_github_issues(repo: str, token: Optional[str]) -> Tuple[set[str], set[str]]:
    """
    Fetch existing open and closed issues from GitHub to extract existing audit fingerprints
    and titles for duplicate suppression.
    """
    if not token or not repo or "/" not in repo:
        log("No valid GitHub token or repo provided. Skipping remote duplicate check.")
        return set(), set()

    fingerprints = set()
    titles = set()

    url = f"https://api.github.com/repos/{repo}/issues?state=all&per_page=100"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "Blip-Issue-Maker",
    }

    try:
        req = urllib.request.Request(url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                issues = json.loads(resp.read().decode("utf-8"))
                for issue in issues:
                    title = issue.get("title", "").strip().lower()
                    if title:
                        titles.add(title)

                    body = issue.get("body", "") or ""
                    # Match fingerprint comments like: <!-- BLIP-AUDIT-ID: some-id -->
                    matches = re.findall(r"<!--\s*BLIP-AUDIT-ID:\s*([a-zA-Z0-9_\-]+)\s*-->", body)
                    for match in matches:
                        fingerprints.add(match.strip().lower())
                log(f"Retrieved {len(issues)} existing issues ({len(fingerprints)} audit fingerprints, {len(titles)} titles).")
    except Exception as e:
        log(f"Warning: Failed to fetch existing issues for duplicate suppression: {e}")

    return fingerprints, titles


def build_analysis_prompt(target_area: str, code_context: Dict[str, str], max_issues: int) -> str:
    """Build the prompt instructing the LLM to find real, high-value improvements."""
    code_blocks = []
    for filepath, content in code_context.items():
        # Truncate very long files to save tokens while keeping key logic
        lines = content.splitlines()
        truncated = "\n".join(lines[:350]) if len(lines) > 350 else content
        code_blocks.append(f"### File: `{filepath}`\n```typescript\n{truncated}\n```\n")

    return f"""You are the Principal Systems, AI, and Security Reliability Auditor for Blip (a real-time gesture-triggered virtual camera utility for Google Meet, Teams, and Zoom).

Target Focus Area: {target_area.upper()}
Max Issues to propose: {max_issues}

Examine the following actual codebase files:
{"".join(code_blocks)}

Identify up to {max_issues} concrete, actionable, high-value engineering tasks or vulnerability fixes.
DO NOT report generic cosmetic suggestions or trivial formatting. Focus on:
1. Security: WebRTC stream interception boundaries, CSP restrictions, malicious frame spoofing, data leakage.
2. Guardrails: False positive speech acoustic transient rejection, state recovery on suspended AudioContext, boundary checks on background plates.
3. AI/Vision: Landmark coordinate normalization, debounce thresholds in rapid gesture sequences, frame drop resilience.
4. Performance: WebGL/Canvas buffer leaks, unneeded rendering frames when tab is backgrounded.

OUTPUT REQUIREMENTS:
You MUST respond with a JSON array of objects conforming exactly to this structure:
[
  {{
    "fingerprint": "short_unique_slug_identifying_the_finding",
    "title": "[Area] Descriptive title of the issue",
    "category": "{target_area if target_area != 'all' else 'security'}",
    "severity": "critical" | "high" | "medium" | "low",
    "labels": ["audit:{target_area}", "bot:issue-maker"],
    "affected_files": ["filepath1", "filepath2"],
    "problem_statement": "Clear explanation of the problem, edge case, or vulnerability.",
    "technical_analysis": "Technical root cause and rationale why this matters.",
    "remediation_plan": "Step-by-step guidance on how to fix or harden this in the codebase.",
    "suggested_code_diff": "Optional diff or pseudo-code illustrating the fix."
  }}
]

Respond ONLY with valid, parseable JSON. Do not wrap in markdown code blocks or add preamble.
"""


def call_gemini(prompt: str, api_key: str, model: str = DEFAULT_GEMINI_MODEL) -> Optional[List[Dict[str, Any]]]:
    """Call Google Gemini 3.8 Flash using the official google-genai SDK."""
    log(f"Attempting primary generation via Gemini model: {model}...")
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        if response and response.text:
            cleaned = response.text.strip()
            # Remove any accidentally included markdown fences
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                cleaned = re.sub(r"\s*```$", "", cleaned)
            data = json.loads(cleaned)
            if isinstance(data, list):
                log(f"Gemini successfully returned {len(data)} issue proposals.")
                return data
            elif isinstance(data, dict) and "issues" in data:
                return data["issues"]
    except ImportError:
        log("google-genai SDK not installed in environment. Falling back...")
    except Exception as e:
        log(f"Gemini generation encountered error: {e}")
    return None


def call_groq(prompt: str, api_key: str, model: str = DEFAULT_GROQ_MODEL) -> Optional[List[Dict[str, Any]]]:
    """Call Groq API as automatic fallback."""
    log(f"Attempting fallback generation via Groq API (model: {model})...")
    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are an automated code auditor that outputs only JSON arrays of issue reports.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "User-Agent": "Blip-Issue-Maker",
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status == 200:
                res_data = json.loads(resp.read().decode("utf-8"))
                content = res_data["choices"][0]["message"]["content"].strip()
                parsed = json.loads(content)
                if isinstance(parsed, list):
                    log(f"Groq successfully returned {len(parsed)} issue proposals.")
                    return parsed
                elif isinstance(parsed, dict):
                    # Find list in dictionary keys
                    for val in parsed.values():
                        if isinstance(val, list):
                            log(f"Groq successfully returned {len(val)} issue proposals.")
                            return val
    except Exception as e:
        log(f"Groq fallback encountered error: {e}")
    return None


def format_issue_markdown(issue: Dict[str, Any], engine_name: str) -> str:
    """Format structured issue into rich Markdown."""
    fingerprint = issue.get("fingerprint", f"audit-{int(time.time())}")
    severity = issue.get("severity", "medium").upper()
    category = issue.get("category", "general").upper()
    files = issue.get("affected_files", [])
    files_str = "\n".join([f"- [`{f}`](file:///{f})" for f in files]) if files else "- *Not specified*"

    diff_block = ""
    if issue.get("suggested_code_diff"):
        diff_block = f"""
### Proposed Remediation Diff / Blueprint
```typescript
{issue['suggested_code_diff']}
```
"""

    return f"""{TAG_PREFIX} {fingerprint} -->

## Audit Finding: {issue.get('title', 'Automated Finding')}

| Metric | Details |
| :--- | :--- |
| **Category** | `{category}` |
| **Severity** | `{severity}` |
| **Engine** | `{engine_name}` |
| **Audit Fingerprint** | `{fingerprint}` |

---

### Problem Statement
{issue.get('problem_statement', 'No problem description provided.')}

---

### Affected Files
{files_str}

---

### Technical Analysis & Root Cause
{issue.get('technical_analysis', 'Detailed analysis pending.')}

---

### Remediation Plan
{issue.get('remediation_plan', 'Plan pending.')}
{diff_block}
---
*Automated audit issue generated by Blip Issue Maker.*
"""


def create_github_issue(repo: str, token: str, issue: Dict[str, Any], engine_name: str) -> bool:
    """Create a new GitHub issue using GitHub REST API."""
    title = issue.get("title", "Automated Codebase Audit Finding")
    body = format_issue_markdown(issue, engine_name)
    labels = issue.get("labels", ["bot:issue-maker", "audit"])

    url = f"https://api.github.com/repos/{repo}/issues"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "Blip-Issue-Maker",
    }
    payload = {
        "title": title,
        "body": body,
        "labels": labels,
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status in (200, 201):
                res_data = json.loads(resp.read().decode("utf-8"))
                log(f"Successfully opened issue #{res_data.get('number')}: '{title}' ({res_data.get('html_url')})")
                return True
    except Exception as e:
        log(f"Failed to create GitHub issue: {e}")
    return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Blip Automated Codebase Issue Generator")
    parser.add_argument("--target", default="all", choices=["all", "security", "guardrails", "ai_vision", "performance"])
    parser.add_argument("--max-issues", type=int, default=2, help="Maximum new issues to create")
    parser.add_argument("--dry-run", action="store_true", help="Print findings without creating GitHub issues")
    parser.add_argument("--force-engine", default="auto", choices=["auto", "gemini", "groq"])
    parser.add_argument("--repo", default=os.environ.get("GITHUB_REPOSITORY", ""))
    parser.add_argument("--token", default=os.environ.get("GITHUB_TOKEN", ""))
    parser.add_argument("--output-summary", default="issue_maker_summary.md", help="Path to write GitHub job summary")
    args = parser.parse_args()

    gemini_key, groq_key = resolve_api_keys()

    log(f"Starting issue generation (Target: {args.target}, Max issues: {args.max_issues}, Dry-run: {args.dry_run})")
    log(f"API Keys available: Gemini={'YES' if gemini_key else 'NO'}, Groq={'YES' if groq_key else 'NO'}")

    code_context = gather_code_context(args.target)
    if not code_context:
        log("No code files found to analyze. Aborting.")
        return 1

    log(f"Gathered code context from {len(code_context)} target source files.")

    # 1. Fetch existing issues for duplicate suppression
    existing_fingerprints, existing_titles = fetch_existing_github_issues(args.repo, args.token)

    # 2. Build Prompt
    prompt = build_analysis_prompt(args.target, code_context, args.max_issues + 2)

    # 3. Multi-Engine Execution with Automatic Fallback
    raw_issues: Optional[List[Dict[str, Any]]] = None
    engine_used = "None"

    if args.force_engine in ("auto", "gemini"):
        if gemini_key:
            raw_issues = call_gemini(prompt, gemini_key)
            if raw_issues:
                engine_used = f"Gemini 3.8 Flash ({DEFAULT_GEMINI_MODEL})"

    if not raw_issues and args.force_engine in ("auto", "groq"):
        if groq_key:
            log("Primary engine failed or unavailable. Falling back to Groq...")
            raw_issues = call_groq(prompt, groq_key)
            if raw_issues:
                engine_used = f"Groq Fallback ({DEFAULT_GROQ_MODEL})"

    if not raw_issues:
        log("Both primary (Gemini) and fallback (Groq) engines failed or lacked valid API keys.")
        Path(args.output_summary).write_text(
            "### Blip Issue Generator Summary\n\nNo issues generated. Both Gemini and Groq engines were unavailable.",
            encoding="utf-8",
        )
        return 0

    # 4. Deduplication & Capping Filter
    filtered_issues: List[Dict[str, Any]] = []
    for candidate in raw_issues:
        if len(filtered_issues) >= args.max_issues:
            break

        fingerprint = str(candidate.get("fingerprint", "")).strip().lower()
        title = str(candidate.get("title", "")).strip().lower()

        # Check duplicate fingerprint
        if fingerprint and fingerprint in existing_fingerprints:
            log(f"Skipping duplicate issue by fingerprint: {fingerprint}")
            continue

        # Check duplicate title
        if title and title in existing_titles:
            log(f"Skipping duplicate issue by title: '{title}'")
            continue

        filtered_issues.append(candidate)

    log(f"Filtered candidate issues down to {len(filtered_issues)} unique, non-duplicate issues.")

    # 5. Output / Issue Creation
    summary_lines = [
        "## Blip Automated Codebase Issue Generator",
        f"- **Engine**: `{engine_used}`",
        f"- **Target Area**: `{args.target}`",
        f"- **Dry-Run Mode**: `{args.dry_run}`",
        f"- **New Findings Found**: `{len(filtered_issues)}`",
        "",
    ]

    for idx, issue in enumerate(filtered_issues, start=1):
        title = issue.get("title", f"Finding {idx}")
        summary_lines.append(f"### {idx}. {title}")
        summary_lines.append(f"- **Severity**: `{issue.get('severity', 'medium').upper()}`")
        summary_lines.append(f"- **Files**: {', '.join(issue.get('affected_files', []))}")
        summary_lines.append(f"- **Summary**: {issue.get('problem_statement', '')}\n")

        if args.dry_run or not args.token or not args.repo:
            log(f"[DRY-RUN] Would create issue: '{title}'")
        else:
            created = create_github_issue(args.repo, args.token, issue, engine_used)
            if created:
                summary_lines.append("*(Created in repository)*\n")

    Path(args.output_summary).write_text("\n".join(summary_lines), encoding="utf-8")
    log(f"Wrote job step summary to {args.output_summary}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
