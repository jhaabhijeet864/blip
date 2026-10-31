import { BlipMessage, BlipState } from "./types";

export class BlipMeetingOverlay {
  private container: HTMLDivElement | null = null;
  private statusBadge: HTMLSpanElement | null = null;
  private snapBtn: HTMLButtonElement | null = null;
  private gokuBtn: HTMLButtonElement | null = null;
  private reappearBtn: HTMLButtonElement | null = null;
  private calibBtn: HTMLButtonElement | null = null;
  private isMinimized = false;
  private isVanished = false;
  private hasPlate = false;

  constructor() {
    this.initMessageListener();
  }

  public unmount(): void {
    const existing = document.getElementById("blip-in-meeting-dock");
    if (existing) {
      existing.remove();
    }
    this.container = null;
    this.statusBadge = null;
    this.snapBtn = null;
    this.gokuBtn = null;
    this.reappearBtn = null;
    this.calibBtn = null;
    this.isMinimized = false;
  }

  public mount(): void {
    if (document.getElementById("blip-in-meeting-dock")) {
      return;
    }

    const dock = document.createElement("div");
    dock.id = "blip-in-meeting-dock";
    this.container = dock;
    dock.style.cssText = `
      position: fixed;
      bottom: 84px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483640;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(139, 92, 246, 0.35);
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(139, 92, 246, 0.25);
      border-radius: 9999px;
      padding: 6px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      color: #f8fafc;
      user-select: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    // 1. Brand & Status badge
    const brandContainer = document.createElement("div");
    brandContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding-right: 6px;
      border-right: 1px solid rgba(255, 255, 255, 0.12);
      cursor: pointer;
    `;

    const icon = document.createElement("span");
    icon.textContent = "⚡";
    icon.style.cssText = `
      background: #8b5cf6;
      color: white;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
    `;

    this.statusBadge = document.createElement("span");
    this.statusBadge.textContent = "● LIVE";
    this.statusBadge.style.cssText = `
      font-size: 11px;
      font-weight: 700;
      color: #22c55e;
      letter-spacing: 0.02em;
    `;

    brandContainer.appendChild(icon);
    brandContainer.appendChild(this.statusBadge);

    // 2. Action Buttons
    this.snapBtn = this.createButton("🤌 Snap Dust", "#8b5cf6", () => {
      this.dispatchAction("BLIP_TRIGGER_SNAP");
    });

    this.gokuBtn = this.createButton("⚡ Goku Flash", "#f59e0b", () => {
      this.dispatchAction("BLIP_TRIGGER_GOKU");
    });

    this.reappearBtn = this.createButton("✨ Reappear", "#10b981", () => {
      this.dispatchAction("BLIP_TRIGGER_REAPPEAR");
    });
    this.reappearBtn.style.display = "none"; // hidden until vanished

    this.calibBtn = this.createButton("📸 Calibrate (3s)", "#2563eb", () => {
      this.handleCalibration();
    });

    // 3. Minimize / Expand button
    const minBtn = document.createElement("button");
    minBtn.textContent = "✕";
    minBtn.title = "Minimize Blip toolbar";
    minBtn.style.cssText = `
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 12px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin-left: 2px;
      transition: background 0.15s ease, color 0.15s ease;
    `;
    minBtn.onmouseenter = () => {
      minBtn.style.background = "rgba(255, 255, 255, 0.1)";
      minBtn.style.color = "#f8fafc";
    };
    minBtn.onmouseleave = () => {
      minBtn.style.background = "transparent";
      minBtn.style.color = "#94a3b8";
    };
    minBtn.onclick = () => {
      this.toggleMinimize();
    };

    dock.appendChild(brandContainer);
    dock.appendChild(this.snapBtn);
    dock.appendChild(this.gokuBtn);
    dock.appendChild(this.reappearBtn);
    dock.appendChild(this.calibBtn);
    dock.appendChild(minBtn);

    document.body.appendChild(dock);
    this.container = dock;

    // Request initial state from interceptor
    this.dispatchAction("BLIP_STATUS_REQUEST");
  }

  private createButton(text: string, bgColor: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.style.cssText = `
      background: ${bgColor};
      color: #ffffff;
      border: none;
      border-radius: 9999px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      transition: transform 0.12s ease, opacity 0.12s ease;
    `;
    btn.onmouseenter = () => {
      btn.style.opacity = "0.9";
      btn.style.transform = "scale(1.03)";
    };
    btn.onmouseleave = () => {
      btn.style.opacity = "1";
      btn.style.transform = "scale(1)";
    };
    btn.onclick = onClick;
    return btn;
  }

  private handleCalibration(): void {
    if (!this.calibBtn) return;
    let countdown = 3;
    this.calibBtn.disabled = true;
    this.calibBtn.textContent = `Step aside! ${countdown}...`;

    this.dispatchAction("BLIP_CALIBRATE_START", { seconds: countdown });

    const timer = window.setInterval(() => {
      countdown--;
      if (countdown > 0 && this.calibBtn) {
        this.calibBtn.textContent = `Step aside! ${countdown}...`;
      } else {
        clearInterval(timer);
        this.dispatchAction("BLIP_CALIBRATE");
        if (this.calibBtn) {
          this.calibBtn.textContent = "✓ Room Captured!";
          setTimeout(() => {
            if (this.calibBtn) {
              this.calibBtn.disabled = false;
              this.calibBtn.textContent = "📸 Calibrate (3s)";
            }
          }, 2500);
        }
      }
    }, 1000);
  }

  private toggleMinimize(): void {
    if (!this.container) return;
    this.isMinimized = !this.isMinimized;

    if (this.isMinimized) {
      this.container.style.padding = "6px";
      this.container.style.borderRadius = "50%";
      this.container.style.bottom = "84px";
      this.container.style.left = "24px";
      this.container.style.transform = "none";
      this.container.innerHTML = `
        <button id="blip-expand-btn" title="Expand Blip Toolbar" style="
          background: #8b5cf6;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.25);
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        ">⚡</button>
      `;
      const expandBtn = document.getElementById("blip-expand-btn");
      if (expandBtn) {
        expandBtn.onclick = () => {
          if (this.container) {
            this.container.remove();
            this.container = null;
            this.mount();
          }
        };
      }
    }
  }

  private dispatchAction(action: BlipMessage["action"], payload?: unknown): void {
    window.postMessage(
      {
        source: "blip-extension-overlay",
        action,
        payload,
        timestamp: Date.now(),
      } as BlipMessage,
      "*"
    );
  }

  private initMessageListener(): void {
    window.addEventListener("message", (event) => {
      if (event.source !== window || !event.data || typeof event.data !== "object") {
        return;
      }

      const msg = event.data as BlipMessage;
      if (msg.action === "BLIP_STATUS_RESPONSE" && msg.payload) {
        const state = msg.payload as BlipState;
        this.updateStateView(state);
      }
    });
  }

  private updateStateView(state: BlipState): void {
    this.isVanished = state.isVanished;
    this.hasPlate = state.hasBackgroundPlate;

    if (this.statusBadge) {
      if (state.currentEffect !== "none") {
        this.statusBadge.textContent = state.currentEffect === "snap" ? "● DISSOLVING..." : "● TELEPORTING...";
        this.statusBadge.style.color = "#f59e0b";
      } else if (state.isVanished) {
        this.statusBadge.textContent = "● VANISHED";
        this.statusBadge.style.color = "#8b5cf6";
      } else {
        this.statusBadge.textContent = "● LIVE";
        this.statusBadge.style.color = "#22c55e";
      }
    }

    if (this.reappearBtn && this.snapBtn && this.gokuBtn) {
      if (state.isVanished) {
        this.reappearBtn.style.display = "inline-flex";
        this.snapBtn.style.display = "none";
        this.gokuBtn.style.display = "none";
      } else {
        this.reappearBtn.style.display = "none";
        this.snapBtn.style.display = "inline-flex";
        this.gokuBtn.style.display = "inline-flex";
      }
    }
  }
}
