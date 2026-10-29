"""
Entrypoint for launching the Blip application.
Usage:
    python -m blip
"""

from blip.ui.app_window import launch_app


def main():
    print("⚡ Blip - Gesture-Triggered Virtual Camera v0.1.0")
    print("Launching Desktop UI...")
    launch_app()


if __name__ == "__main__":
    main()
