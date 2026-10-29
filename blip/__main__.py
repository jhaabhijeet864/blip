"""
Entrypoint for launching the Blip application.
Usage:
    python -m blip
"""

import sys

def main():
    print("⚡ Blip - Gesture-Triggered Virtual Camera v0.1.0")
    print("Launching Desktop UI...")
    # UI launch will be wired in Phase 4
    try:
        from blip.ui.app_window import launch_app
        launch_app()
    except ImportError:
        print("Note: Core UI modules being initialized in Phase 2-4.")

if __name__ == "__main__":
    main()
