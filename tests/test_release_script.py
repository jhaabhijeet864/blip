"""
Unit tests for the assistive release automation script and release notes generator.
"""

from pathlib import Path
from unittest.mock import patch

import pytest

from scripts.generate_release_notes import (
    build_release_notes,
    categorize_commits,
    compute_sha256,
    describe_asset,
    format_file_size,
    inspect_release_assets,
)
from scripts.generate_release_notes import (
    main as generate_notes_main,
)
from scripts.release import (
    calculate_bump,
    get_current_version,
    main,
)


def test_calculate_bump():
    """Verify semver bump calculations."""
    assert calculate_bump("0.1.0", "patch") == "0.1.1"
    assert calculate_bump("0.1.0", "minor") == "0.2.0"
    assert calculate_bump("0.1.0", "major") == "1.0.0"

    with pytest.raises(ValueError, match="does not conform"):
        calculate_bump("invalid_version", "patch")

    with pytest.raises(ValueError, match="Unknown bump type"):
        calculate_bump("0.1.0", "super")


def test_get_current_version():
    """Verify extracting version from pyproject.toml."""
    version = get_current_version()
    assert re_semver(version)


def re_semver(v: str) -> bool:
    parts = v.split(".")
    return len(parts) == 3 and all(p.isdigit() for p in parts)


def test_release_main_dry_run_bump():
    """Verify release main executes cleanly in dry-run mode."""
    with patch("scripts.release.run_tests", return_value=True):
        code = main(["--dry-run", "--bump", "patch", "--skip-tests"])
        assert code == 0


def test_release_main_dry_run_explicit_version():
    """Verify release main with explicit version string."""
    code = main(["--dry-run", "--version", "1.2.3", "--skip-tests"])
    assert code == 0


def test_release_main_dirty_git_aborts():
    """Verify dirty git state aborts non-dry-run release."""
    with patch("scripts.release.check_git_clean", return_value=False):
        code = main(["--bump", "patch", "--skip-tests"])
        assert code == 1


def test_release_main_failed_tests_aborts():
    """Verify failing tests abort release."""
    with (
        patch("scripts.release.check_git_clean", return_value=True),
        patch("scripts.release.run_tests", return_value=False),
    ):
        code = main(["--bump", "patch"])
        assert code == 1


def test_release_main_preview_notes():
    """Verify release main with --preview-notes flag."""
    code = main(["--dry-run", "--bump", "patch", "--skip-tests", "--preview-notes"])
    assert code == 0


# ============================================================================
# Tests for generate_release_notes.py
# ============================================================================


def test_format_file_size():
    """Verify human-readable file size conversion."""
    assert format_file_size(500) == "500 B"
    assert format_file_size(1024) == "1.0 KB"
    assert format_file_size(1024 * 1024 * 5) == "5.00 MB"
    assert format_file_size(1024 * 1024 * 1024 * 2) == "2.00 GB"


def test_describe_asset():
    """Verify asset description mapping."""
    assert "Standalone Windows Application" in describe_asset("Blip-Windows-x64.zip")
    assert "Python Wheel Package" in describe_asset("blip-0.1.0-py3-none-any.whl")
    assert "Source Distribution" in describe_asset("blip-0.1.0.tar.gz")
    assert "Checksums Manifest" in describe_asset("checksums.sha256")
    assert describe_asset("unknown.xyz") == "Release Asset"


def test_compute_sha256(tmp_path: Path):
    """Verify file SHA-256 calculation."""
    test_file = tmp_path / "sample.txt"
    test_file.write_text("Blip gesture virtual camera test", encoding="utf-8")
    sha = compute_sha256(test_file)
    assert len(sha) == 64
    assert sha == compute_sha256(test_file)  # Deterministic


def test_categorize_commits():
    """Verify Conventional Commits sorting into categories."""
    commits = [
        {
            "full_hash": "111",
            "short_hash": "111",
            "subject": "feat(pipeline): add snap effect",
            "author": "Alice",
        },
        {
            "full_hash": "222",
            "short_hash": "222",
            "subject": "fix(camera): resolve frame drop",
            "author": "Bob",
        },
        {
            "full_hash": "333",
            "short_hash": "333",
            "subject": "perf(core): optimize frame pipeline",
            "author": "Charlie",
        },
        {
            "full_hash": "444",
            "short_hash": "444",
            "subject": "feat(ui): add dark theme toggle",
            "author": "David",
        },
        {
            "full_hash": "555",
            "short_hash": "555",
            "subject": "docs(readme): update install guide",
            "author": "Eve",
        },
        {
            "full_hash": "666",
            "short_hash": "666",
            "subject": "chore(ci): update release workflow",
            "author": "Frank",
        },
        {
            "full_hash": "777",
            "short_hash": "777",
            "subject": "Random non-conventional commit",
            "author": "Grace",
        },
    ]

    categorized = categorize_commits(commits)

    assert len(categorized["features"]) == 1
    assert categorized["features"][0]["short_hash"] == "111"

    assert len(categorized["fixes"]) == 1
    assert categorized["fixes"][0]["short_hash"] == "222"

    assert len(categorized["perf"]) == 1
    assert categorized["perf"][0]["short_hash"] == "333"

    assert len(categorized["ui_effects"]) == 1
    assert categorized["ui_effects"][0]["short_hash"] == "444"

    assert len(categorized["docs"]) == 1
    assert categorized["docs"][0]["short_hash"] == "555"

    assert len(categorized["refactor_maint"]) == 1
    assert categorized["refactor_maint"][0]["short_hash"] == "666"

    assert len(categorized["other"]) == 1
    assert categorized["other"][0]["short_hash"] == "777"


def test_inspect_release_assets(tmp_path: Path):
    """Verify scanning directory for release files and metadata."""
    zip_file = tmp_path / "Blip-Windows-x64.zip"
    zip_file.write_bytes(b"dummy zip content")

    whl_file = tmp_path / "blip-0.1.0-py3-none-any.whl"
    whl_file.write_bytes(b"dummy wheel content")

    assets = inspect_release_assets(tmp_path)
    assert len(assets) == 2
    names = [a["name"] for a in assets]
    assert "Blip-Windows-x64.zip" in names
    assert "blip-0.1.0-py3-none-any.whl" in names
    assert all("sha256" in a for a in assets)
    assert all("size_formatted" in a for a in assets)


def test_build_release_notes():
    """Verify end-to-end markdown generation."""
    commits = [
        {
            "full_hash": "abcdef1234567890",
            "short_hash": "abcdef1",
            "subject": "feat: add teleport vanish",
            "author": "Alice",
        },
        {
            "full_hash": "fedcba0987654321",
            "short_hash": "fedcba0",
            "subject": "fix: fix camera index",
            "author": "Bob",
        },
    ]
    assets = [
        {
            "name": "Blip-Windows-x64.zip",
            "description": "Standalone Windows Application",
            "size_formatted": "42.5 MB",
            "sha256": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        }
    ]

    notes = build_release_notes(
        tag="v0.2.0",
        previous_tag="v0.1.0",
        commits=commits,
        assets=assets,
        custom_notes="Exciting new gesture effects and major speed improvements!",
    )

    assert "# Blip v0.2.0" in notes
    assert "Exciting new gesture effects" in notes
    assert "Quick Start & Installation" in notes
    assert "Blip-Windows-x64.zip" in notes
    assert "1234567890abcdef" in notes
    assert "Detailed Changelog" in notes
    assert "feat: add teleport vanish" in notes
    assert "Helpful Links & Documentation" in notes


def test_generate_release_notes_cli(tmp_path: Path):
    """Verify CLI execution and output file generation."""
    out_file = tmp_path / "RELEASE_NOTES.md"
    assets_dir = tmp_path / "assets"
    assets_dir.mkdir()
    (assets_dir / "test.zip").write_bytes(b"data")

    code = generate_notes_main(
        [
            "--tag",
            "v0.3.0",
            "--assets-dir",
            str(assets_dir),
            "--output",
            str(out_file),
            "--custom-notes",
            "Initial preview release",
        ]
    )
    assert code == 0
    assert out_file.exists()
    content = out_file.read_text(encoding="utf-8")
    assert "Blip v0.3.0" in content
    assert "Initial preview release" in content
    assert "test.zip" in content
