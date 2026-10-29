"""
Unit tests for CLI and build entry points.
"""

from unittest.mock import MagicMock, patch

import scripts.build_exe as build_exe_module
import scripts.generate_icons as generate_icons_module
from blip.__main__ import main


def test_main_entrypoint():
    """Verify blip.__main__.main invokes launch_app."""
    with patch("blip.__main__.launch_app") as mock_launch:
        main()
        mock_launch.assert_called_once()


def test_build_exe_script():
    """Verify scripts/build_exe.py executes PyInstaller."""
    mock_run = MagicMock()
    mock_run.return_value.returncode = 0

    with patch("subprocess.run", mock_run):
        build_exe_module.build()
        assert mock_run.call_count == 1

        # Test failure branch
        mock_run.return_value.returncode = 1
        build_exe_module.build()
        assert mock_run.call_count == 2


def test_generate_icons_script(tmp_path):
    """Verify scripts/generate_icons.py produces raster assets."""
    with patch("scripts.generate_icons.Path") as mock_path:
        mock_root = tmp_path
        mock_path.return_value.parent.parent = mock_root
        generate_icons_module.generate_icons()
        assert (tmp_path / "assets" / "icon.png").exists()
        assert (tmp_path / "assets" / "icon.ico").exists()
