"""
Build script to compile Blip into a standalone Windows executable (.exe) using PyInstaller.
Bundles CustomTkinter themes, MediaPipe models, and OpenCV binaries.
"""

import subprocess
import sys
from pathlib import Path


def build():
    root = Path(__file__).parent.parent
    main_script = root / "blip" / "__main__.py"

    print("⚡ Compiling Blip standalone executable with PyInstaller...")

    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--name=Blip",
        "--onedir",
        "--noconsole",
        "--clean",
        "--collect-all=mediapipe",
        "--collect-all=customtkinter",
        "--collect-all=pyvirtualcam",
        str(main_script),
    ]

    print("Running command:", " ".join(cmd))
    res = subprocess.run(cmd, cwd=root)

    if res.returncode == 0:
        print("\n✅ Build succeeded! Executable located in: dist/Blip/Blip.exe")
    else:
        print(f"\n❌ Build failed with return code: {res.returncode}")


if __name__ == "__main__":
    build()
