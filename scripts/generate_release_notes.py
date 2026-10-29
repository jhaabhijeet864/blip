"""
Dynamic Release Notes Generator for Blip.

Extracts commit history, categorizes changes by Conventional Commits,
inspects release assets, calculates cryptographic SHA-256 checksums,
and formats comprehensive release notes for GitHub Releases and CI summaries.
"""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any, Optional

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
DEFAULT_REPO_URL = "https://github.com/jhaabhijeet864/blip"

CATEGORY_MAPPINGS: list[tuple[str, str, re.Pattern]] = [
    (
        "features",
        "🚀 Features & Enhancements",
        re.compile(r"^(feat)(\([a-zA-Z0-9_\/-]+\))?:\s*(.+)", re.IGNORECASE),
    ),
    (
        "fixes",
        "🐛 Bug Fixes & Stability",
        re.compile(r"^(fix|bugfix)(\([a-zA-Z0-9_\/-]+\))?:\s*(.+)", re.IGNORECASE),
    ),
    (
        "perf",
        "⚡ Performance Improvements",
        re.compile(r"^(perf|performance)(\([a-zA-Z0-9_\/-]+\))?:\s*(.+)", re.IGNORECASE),
    ),
    (
        "ui_effects",
        "🎨 UI, Visual Effects & Web Showcase",
        re.compile(r"^(feat|style|fix)\((ui|effects|web|frontend|design)\):\s*(.+)", re.IGNORECASE),
    ),
    (
        "docs",
        "📚 Documentation & Guides",
        re.compile(r"^(docs|documentation)(\([a-zA-Z0-9_\/-]+\))?:\s*(.+)", re.IGNORECASE),
    ),
    (
        "refactor_maint",
        "🛠️ Refactoring, Build & CI/CD",
        re.compile(
            r"^(refactor|chore|ci|build|test|style)(\([a-zA-Z0-9_\/-]+\))?:\s*(.+)", re.IGNORECASE
        ),
    ),
]


def format_file_size(size_bytes: int) -> str:
    """Format bytes into human-readable string (KB, MB, GB)."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.2f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"


def compute_sha256(file_path: Path) -> str:
    """Compute the SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest().lower()


def get_previous_tag(current_tag: Optional[str] = None) -> Optional[str]:
    """Find the tag immediately preceding the current tag or HEAD."""
    try:
        ref = f"{current_tag}^" if current_tag else "HEAD"
        res = subprocess.run(
            ["git", "describe", "--tags", "--abbrev=0", ref],
            cwd=ROOT_DIR,
            capture_output=True,
            text=True,
            check=False,
        )
        if res.returncode == 0 and res.stdout.strip():
            return res.stdout.strip()
    except Exception:
        pass

    # Fallback: list all tags sorted by creation date
    try:
        res = subprocess.run(
            ["git", "tag", "--sort=-creatordate"],
            cwd=ROOT_DIR,
            capture_output=True,
            text=True,
            check=False,
        )
        if res.returncode == 0:
            tags = [t.strip() for t in res.stdout.strip().splitlines() if t.strip()]
            if current_tag and current_tag in tags:
                idx = tags.index(current_tag)
                if idx + 1 < len(tags):
                    return tags[idx + 1]
            elif tags:
                return tags[0]
    except Exception:
        pass

    return None


def get_git_commits(
    from_ref: Optional[str],
    to_ref: str = "HEAD",
) -> list[dict[str, str]]:
    """Retrieve commits between two git references."""
    revision_range = f"{from_ref}..{to_ref}" if from_ref else to_ref
    try:
        # Format: FullHash | ShortHash | Subject | AuthorName
        res = subprocess.run(
            ["git", "log", revision_range, "--no-merges", "--pretty=format:%H|%h|%s|%an"],
            cwd=ROOT_DIR,
            capture_output=True,
            text=True,
            check=False,
        )
        if res.returncode != 0:
            return []

        commits: list[dict[str, str]] = []
        for line in res.stdout.strip().splitlines():
            if not line.strip():
                continue
            parts = line.split("|", 3)
            if len(parts) == 4:
                commits.append(
                    {
                        "full_hash": parts[0],
                        "short_hash": parts[1],
                        "subject": parts[2],
                        "author": parts[3],
                    }
                )
        return commits
    except Exception:
        return []


def categorize_commits(
    commits: list[dict[str, str]],
) -> dict[str, list[dict[str, str]]]:
    """Group commits into structured categories according to Conventional Commits."""
    categories: dict[str, list[dict[str, str]]] = {
        "features": [],
        "fixes": [],
        "perf": [],
        "ui_effects": [],
        "docs": [],
        "refactor_maint": [],
        "other": [],
    }

    for commit in commits:
        subject = commit["subject"].strip()
        matched = False

        # First check UI / effects specific pattern
        ui_pattern = CATEGORY_MAPPINGS[3][2]
        if ui_pattern.search(subject):
            categories["ui_effects"].append(commit)
            continue

        # Check remaining category patterns
        for cat_key, _, pattern in CATEGORY_MAPPINGS:
            if cat_key == "ui_effects":
                continue
            if pattern.search(subject):
                categories[cat_key].append(commit)
                matched = True
                break

        if not matched:
            categories["other"].append(commit)

    return categories


def describe_asset(file_name: str) -> str:
    """Return a descriptive label for a release asset based on file extension and name."""
    name_lower = file_name.lower()
    if name_lower.endswith(".zip"):
        return "Standalone Windows Application (Portable x64 Executable bundle)"
    elif name_lower.endswith(".whl"):
        return "Python Wheel Package (pip installable distribution)"
    elif name_lower.endswith(".tar.gz"):
        return "Source Distribution Archive (sdist)"
    elif name_lower.endswith(".sha256") or name_lower.endswith(".txt"):
        return "Cryptographic Checksums Manifest (SHA-256)"
    elif name_lower.endswith(".exe"):
        return "Standalone Windows Installer / Executable"
    elif name_lower.endswith(".dmg"):
        return "Apple macOS Disk Image"
    elif name_lower.endswith(".appimage"):
        return "Linux Portable AppImage"
    return "Release Asset"


def inspect_release_assets(assets_dir: Path) -> list[dict[str, Any]]:
    """Scan directory for release files and calculate file sizes and SHA-256 hashes."""
    if not assets_dir.exists() or not assets_dir.is_dir():
        return []

    assets: list[dict[str, Any]] = []
    # Sort files deterministically: .zip first, then .whl, .tar.gz, then others
    for file_path in sorted(assets_dir.iterdir(), key=lambda p: (p.suffix != ".zip", p.name)):
        if file_path.is_file():
            size_bytes = file_path.stat().st_size
            sha256_hash = compute_sha256(file_path)
            assets.append(
                {
                    "name": file_path.name,
                    "size_bytes": size_bytes,
                    "size_formatted": format_file_size(size_bytes),
                    "sha256": sha256_hash,
                    "description": describe_asset(file_path.name),
                }
            )
    return assets


def build_release_notes(
    tag: str,
    previous_tag: Optional[str] = None,
    commits: Optional[list[dict[str, str]]] = None,
    assets: Optional[list[dict[str, Any]]] = None,
    custom_notes: Optional[str] = None,
    repo_url: str = DEFAULT_REPO_URL,
) -> str:
    """Synthesize complete release notes markdown document."""
    commits = commits or []
    assets = assets or []
    categorized = categorize_commits(commits)

    clean_tag = tag.strip()
    sections: list[str] = []

    # 1. Header & Hero banner
    sections.append(f"# Blip {clean_tag}")
    sections.append(
        "> **Blip** is a viral gesture-triggered virtual camera for Google Meet, Zoom, and Teams. "
        "Snap to dissolve like Thanos or tap your forehead to vanish like Goku."
    )

    # 2. Custom Notes / Highlights (if supplied)
    if custom_notes and custom_notes.strip():
        sections.append("## 🌟 Release Highlights")
        sections.append(custom_notes.strip())

    # 3. Quick Start & Installation Guide
    sections.append("## 🚀 Quick Start & Installation")
    sections.append(
        "### 🪟 Windows Standalone Portable Application\n"
        "No Python runtime or compiler required:\n"
        "1. Download **`Blip-Windows-x64.zip`** from the Assets table below.\n"
        "2. Extract the archive to any folder on your PC.\n"
        "3. Launch **`Blip.exe`**.\n"
        "4. Choose your hardware webcam, click **Start Camera**, open Google Meet or Zoom, and select **Blip Virtual Camera** as your video source."
    )
    sections.append(
        "### 🐍 Python Package (PyPI / Wheel)\n"
        "For Python 3.10+ developers and cross-platform users:\n"
        "```bash\n"
        "# Install or upgrade via pip\n"
        "pip install --upgrade blip-gestures\n"
        "\n"
        "# Launch Blip\n"
        "python -m blip\n"
        "```"
    )

    # 4. Verified Release Assets Table with SHA-256 Checksums
    if assets:
        sections.append("## 📦 Verified Release Assets & Checksums")
        sections.append(
            "Verify downloaded files against these official SHA-256 cryptographic hashes:\n"
        )
        sections.append("| Asset Name | Platform / Type | Size | SHA-256 Checksum |")
        sections.append("| :--- | :--- | :--- | :--- |")
        for asset in assets:
            name = asset["name"]
            desc = asset["description"]
            size = asset["size_formatted"]
            sha = asset["sha256"]
            sections.append(f"| **`{name}`** | {desc} | `{size}` | `{sha}` |")

        sections.append(
            "\n#### 🔍 How to verify checksums:\n"
            "- **Windows (PowerShell):**\n"
            "  ```powershell\n"
            "  Get-FileHash -Algorithm SHA256 .\\Blip-Windows-x64.zip\n"
            "  ```\n"
            "- **Linux / macOS (Bash):**\n"
            "  ```bash\n"
            "  sha256sum -c checksums.sha256\n"
            "  ```"
        )

    # 5. Detailed Changelog by Category
    category_titles = {
        "features": "🚀 Features & Enhancements",
        "fixes": "🐛 Bug Fixes & Stability",
        "perf": "⚡ Performance Improvements",
        "ui_effects": "🎨 UI, Visual Effects & Showcase",
        "docs": "📚 Documentation & Guides",
        "refactor_maint": "🛠️ Refactoring, Tooling & CI/CD",
        "other": "🔄 Other Changes",
    }

    has_commits = any(len(items) > 0 for items in categorized.values())
    sections.append("## 📝 Detailed Changelog")

    if previous_tag:
        compare_url = f"{repo_url}/compare/{previous_tag}...{clean_tag}"
        sections.append(
            f"Changes between [`{previous_tag}`]({repo_url}/releases/tag/{previous_tag}) and [`{clean_tag}`]({compare_url}):\n"
        )
    else:
        sections.append(f"Commits included in **{clean_tag}**:\n")

    if has_commits:
        for cat_key, cat_title in category_titles.items():
            entries = categorized.get(cat_key, [])
            if entries:
                sections.append(f"### {cat_title}")
                for item in entries:
                    h = item["short_hash"]
                    subj = item["subject"]
                    author = item["author"]
                    commit_link = f"[`{h}`]({repo_url}/commit/{item['full_hash']})"
                    sections.append(f"- {subj} ({commit_link} by @{author})")
                sections.append("")
    else:
        sections.append(
            "*Refer to GitHub automated release notes below for detailed pull requests and contributor details.*"
        )

    # 6. Helpful Links & Community
    sections.append("## 🔗 Helpful Links & Documentation")
    sections.append(
        f"- 🌐 **Showcase & Interactive Demo:** [Live Product Website](https://jhaabhijeet864.github.io/blip/)\n"
        f"- 📖 **Google Meet & Virtual Camera Setup:** [Setup Guide]({repo_url}/blob/main/docs/GOOGLE_MEET_SETUP.md)\n"
        f"- ✋ **Gesture Authoring Reference:** [Gesture Guide]({repo_url}/blob/main/docs/GESTURE_GUIDE.md)\n"
        f"- 🐞 **Report Issues / Feedback:** [GitHub Issues Tracker]({repo_url}/issues)"
    )

    return "\n\n".join(sections) + "\n"


def main(args: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Generate rich, detailed release notes for GitHub Releases and CI summaries."
    )
    parser.add_argument(
        "--tag",
        required=False,
        default="",
        help="Release tag (e.g. v0.2.0). If omitted, attempts to read from pyproject.toml.",
    )
    parser.add_argument(
        "--previous-tag",
        required=False,
        default=None,
        help="Previous release tag to compare from. If omitted, discovered automatically.",
    )
    parser.add_argument(
        "--assets-dir",
        type=Path,
        required=False,
        default=Path("release_assets"),
        help="Directory containing built release assets to checksum and list.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        required=False,
        default=None,
        help="File path to write release notes markdown. Defaults to stdout.",
    )
    parser.add_argument(
        "--custom-notes",
        required=False,
        default=None,
        help="Optional custom markdown highlights to embed.",
    )
    parser.add_argument(
        "--repo-url",
        required=False,
        default=DEFAULT_REPO_URL,
        help=f"Base GitHub repository URL (default: {DEFAULT_REPO_URL}).",
    )

    parsed = parser.parse_args(args)

    tag = parsed.tag.strip()
    if not tag:
        try:
            from scripts.release import get_current_version

            tag = f"v{get_current_version()}"
        except Exception:
            tag = "v0.1.0"

    prev_tag = parsed.previous_tag
    if not prev_tag:
        prev_tag = get_previous_tag(tag)

    custom_notes = parsed.custom_notes or os.environ.get("CUSTOM_NOTES", "").strip() or None

    commits = get_git_commits(prev_tag, "HEAD")
    assets = inspect_release_assets(parsed.assets_dir)

    notes = build_release_notes(
        tag=tag,
        previous_tag=prev_tag,
        commits=commits,
        assets=assets,
        custom_notes=custom_notes,
        repo_url=parsed.repo_url,
    )

    if parsed.output:
        parsed.output.parent.mkdir(parents=True, exist_ok=True)
        parsed.output.write_text(notes, encoding="utf-8")
        print(f"Generated detailed release notes written to: {parsed.output}")
    else:
        try:
            if hasattr(sys.stdout, "reconfigure"):
                sys.stdout.reconfigure(encoding="utf-8")
            sys.stdout.write(notes)
        except Exception:
            sys.stdout.buffer.write(notes.encode("utf-8", errors="replace"))

    return 0


if __name__ == "__main__":
    sys.exit(main())
