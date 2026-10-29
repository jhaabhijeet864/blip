"""
Assistive release automation script for Blip.

Facilitates error-free release preparation:
- Validates git working tree is clean
- Runs the complete automated test suite
- Calculates and bumps version in pyproject.toml and blip/__init__.py
- Creates an annotated git release tag
- Displays copy-paste push commands to trigger GitHub Actions release pipeline

Usage:
    python scripts/release.py --bump patch
    python scripts/release.py --bump minor
    python scripts/release.py --bump major
    python scripts/release.py --version 0.2.0
    python scripts/release.py --dry-run --bump patch
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
PYPROJECT_PATH = ROOT_DIR / "pyproject.toml"
INIT_PATH = ROOT_DIR / "blip" / "__init__.py"


def get_current_version() -> str:
    """Extract the current package version from pyproject.toml."""
    content = PYPROJECT_PATH.read_text(encoding="utf-8")
    match = re.search(r'^version\s*=\s*["\']([^"\']+)["\']', content, re.MULTILINE)
    if not match:
        raise ValueError(f"Could not locate version string in {PYPROJECT_PATH}")
    return match.group(1)


def calculate_bump(current_version: str, bump_type: str) -> str:
    """Calculate the next semantic version string."""
    parts = current_version.split(".")
    if len(parts) != 3:
        raise ValueError(f"Version '{current_version}' does not conform to semver (X.Y.Z)")
    major, minor, patch = map(int, parts)

    if bump_type == "major":
        return f"{major + 1}.0.0"
    elif bump_type == "minor":
        return f"{major}.{minor + 1}.0"
    elif bump_type == "patch":
        return f"{major}.{minor}.{patch + 1}"
    else:
        raise ValueError(f"Unknown bump type: {bump_type}")


def update_version_files(new_version: str, dry_run: bool = False) -> None:
    """Update version in pyproject.toml and blip/__init__.py."""
    # 1. Update pyproject.toml
    pyproject_content = PYPROJECT_PATH.read_text(encoding="utf-8")
    updated_pyproject = re.sub(
        r'^(version\s*=\s*["\'])[^"\']+(["\'])',
        rf"\g<1>{new_version}\g<2>",
        pyproject_content,
        count=1,
        flags=re.MULTILINE,
    )

    # 2. Update blip/__init__.py
    init_content = INIT_PATH.read_text(encoding="utf-8")
    updated_init = re.sub(
        r'^(__version__\s*=\s*["\'])[^"\']+(["\'])',
        rf"\g<1>{new_version}\g<2>",
        init_content,
        count=1,
        flags=re.MULTILINE,
    )

    if dry_run:
        print(f"[DRY-RUN] Would update {PYPROJECT_PATH.name} version -> {new_version}")
        print(f"[DRY-RUN] Would update {INIT_PATH.name} __version__ -> {new_version}")
    else:
        PYPROJECT_PATH.write_text(updated_pyproject, encoding="utf-8")
        INIT_PATH.write_text(updated_init, encoding="utf-8")
        print(f"Updated {PYPROJECT_PATH.name} and {INIT_PATH.name} to v{new_version}")


def check_git_clean() -> bool:
    """Check if the git working tree is clean."""
    res = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    return len(res.stdout.strip()) == 0


def run_tests() -> bool:
    """Run the pytest test suite."""
    print("Running test suite before cutting release...")
    res = subprocess.run([sys.executable, "-m", "pytest", "-q"], cwd=ROOT_DIR)
    return res.returncode == 0


def create_release_commit_and_tag(new_version: str, dry_run: bool = False) -> None:
    """Commit version files and create an annotated git tag."""
    tag_name = f"v{new_version}"
    commit_msg = f"chore(release): bump version to {tag_name}"

    if dry_run:
        print(
            f"[DRY-RUN] Would run: git add {PYPROJECT_PATH.name} {INIT_PATH.relative_to(ROOT_DIR)}"
        )
        print(f'[DRY-RUN] Would run: git commit -m "{commit_msg}"')
        print(f'[DRY-RUN] Would run: git tag -a "{tag_name}" -m "Release {tag_name}"')
        return

    # Add version files
    subprocess.run(
        ["git", "add", str(PYPROJECT_PATH), str(INIT_PATH)],
        cwd=ROOT_DIR,
        check=True,
    )

    # Commit
    subprocess.run(
        ["git", "commit", "-m", commit_msg],
        cwd=ROOT_DIR,
        check=True,
    )

    # Tag
    subprocess.run(
        ["git", "tag", "-a", tag_name, "-m", f"Release {tag_name}"],
        cwd=ROOT_DIR,
        check=True,
    )

    print(f"\nSuccessfully committed and tagged {tag_name}!")
    print("\nNext steps to publish release:")
    print("  git push origin main --tags")
    print("\nGitHub Actions will automatically build the standalone Windows executable,")
    print("package Python distribution wheels, and create the GitHub Release!")


def main(args: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Assistive release script for Blip: bumps version, runs tests, and creates release tags."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--bump",
        choices=["patch", "minor", "major"],
        help="Semantic version bump type (patch, minor, or major)",
    )
    group.add_argument(
        "--version",
        help="Explicit version string to set (e.g. 0.2.0)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate the release process without modifying files, committing, or tagging",
    )
    parser.add_argument(
        "--skip-tests",
        action="store_true",
        help="Skip running pytest verification before release (not recommended)",
    )

    parsed = parser.parse_args(args)

    current_ver = get_current_version()
    print(f"Current version: v{current_ver}")

    if parsed.version:
        target_version = parsed.version.lstrip("v")
    else:
        target_version = calculate_bump(current_ver, parsed.bump)

    print(f"Target release version: v{target_version}")

    # Check git status
    if not parsed.dry_run and not check_git_clean():
        print(
            "Error: Git working tree contains uncommitted changes. Please commit or stash first.",
            file=sys.stderr,
        )
        return 1

    # Run tests
    if not parsed.skip_tests:
        if not run_tests():
            print("Error: Tests failed! Aborting release.", file=sys.stderr)
            return 1
        print("All tests passed successfully.")

    # Update files
    update_version_files(target_version, dry_run=parsed.dry_run)

    # Git commit and tag
    create_release_commit_and_tag(target_version, dry_run=parsed.dry_run)

    return 0


if __name__ == "__main__":
    sys.exit(main())
