"""
Unit tests for the assistive release automation script.
"""

from unittest.mock import patch

import pytest

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
