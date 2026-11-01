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
      background: linear-gradient(135deg, rgba(28, 28, 32, 0.72) 0%, rgba(14, 14, 18, 0.85) 100%);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-top: 1px solid rgba(255, 255, 255, 0.28);
      box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border-radius: 9999px;
      padding: 6px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Google Sans", sans-serif;
      font-size: 13px;
      color: #f1f3f5;
      user-select: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    // 1. Brand Logo Container
    const brandContainer = document.createElement("div");
    brandContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding-right: 10px;
      margin-right: 2px;
      border-right: 1px solid rgba(255, 255, 255, 0.12);
      cursor: pointer;
    `;

    const logoImg = document.createElement("img");
    try {
      logoImg.src = chrome.runtime.getURL("icons/icon-48.png");
    } catch {
      logoImg.src = "icons/icon-48.png";
    }
    logoImg.alt = "Blip";
    logoImg.style.cssText = `
      width: 22px;
      height: 22px;
      object-fit: contain;
      border-radius: 50%;
      display: inline-block;
      user-select: none;
      pointer-events: none;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
    `;

    this.statusBadge = document.createElement("span");
    this.statusBadge.style.cssText = `
      display: none;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
    `;

    brandContainer.appendChild(logoImg);
    brandContainer.appendChild(this.statusBadge);

    // 2. Action Buttons styled with metallic finish and hard glassmorphism
    this.snapBtn = this.createButton("Snap Dust", "snap", () => {
      this.dispatchAction("BLIP_TRIGGER_SNAP");
    });

    this.gokuBtn = this.createButton("Goku Flash", "goku", () => {
      this.dispatchAction("BLIP_TRIGGER_GOKU");
    });

    this.reappearBtn = this.createButton("Reappear", "reappear", () => {
      this.dispatchAction("BLIP_TRIGGER_REAPPEAR");
    });
    this.reappearBtn.style.display = "none"; // hidden until vanished

    this.calibBtn = this.createButton("Calibrate (3s)", "calibrate", () => {
      this.handleCalibration();
    });

    // 3. Minimize / Expand button
    const minBtn = document.createElement("button");
    minBtn.textContent = "\u2715";
    minBtn.title = "Minimize Blip toolbar";
    minBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      cursor: pointer;
      font-size: 11px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin-left: 2px;
      transition: all 0.18s ease;
    `;
    minBtn.onmouseenter = () => {
      minBtn.style.background = "rgba(255, 255, 255, 0.14)";
      minBtn.style.borderColor = "rgba(255, 255, 255, 0.25)";
      minBtn.style.color = "#ffffff";
    };
    minBtn.onmouseleave = () => {
      minBtn.style.background = "rgba(255, 255, 255, 0.04)";
      minBtn.style.borderColor = "rgba(255, 255, 255, 0.08)";
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

  private createButton(text: string, variant: "snap" | "goku" | "reappear" | "calibrate", onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = text;
    
    // Metallic glassmorphic button styling
    const baseGradient = "linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 100%)";
    const hoverGradient = "linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%)";
    
    let accentBorder = "rgba(255, 255, 255, 0.14)";
    let accentHoverBorder = "rgba(255, 255, 255, 0.32)";
    let accentColor = "#e2e8f0";
    let accentHoverGlow = "rgba(255, 255, 255, 0.12)";

    if (variant === "reappear") {
      accentColor = "#86efac";
      accentBorder = "rgba(134, 239, 172, 0.35)";
      accentHoverBorder = "rgba(134, 239, 172, 0.6)";
      accentHoverGlow = "rgba(134, 239, 172, 0.25)";
    }

    btn.style.cssText = `
      background: ${baseGradient};
      color: ${accentColor};
      border: 1px solid ${accentBorder};
      border-top: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 9999px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.01em;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    `;

    btn.onmouseenter = () => {
      btn.style.background = hoverGradient;
      btn.style.borderColor = accentHoverBorder;
      btn.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.45), 0 0 10px ${accentHoverGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.25)`;
      btn.style.transform = "translateY(-1px)";
    };

    btn.onmouseleave = () => {
      btn.style.background = baseGradient;
      btn.style.borderColor = accentBorder;
      btn.style.borderTopColor = "rgba(255, 255, 255, 0.22)";
      btn.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
      btn.style.transform = "translateY(0)";
    };

    btn.onmousedown = () => {
      btn.style.transform = "translateY(1px) scale(0.98)";
    };

    btn.onmouseup = () => {
      btn.style.transform = "translateY(-1px)";
    };

    btn.onclick = onClick;
    return btn;
  }

  private handleCalibration(): void {
    if (!this.calibBtn) return;
    let countdown = 3;
    this.calibBtn.disabled = true;
    this.calibBtn.textContent = `Step aside: ${countdown}s`;

    this.dispatchAction("BLIP_CALIBRATE_START", { seconds: countdown });

    const timer = window.setInterval(() => {
      countdown--;
      if (countdown > 0 && this.calibBtn) {
        this.calibBtn.textContent = `Step aside: ${countdown}s`;
      } else {
        clearInterval(timer);
        this.dispatchAction("BLIP_CALIBRATE");
        if (this.calibBtn) {
          this.calibBtn.textContent = "Room Saved";
          setTimeout(() => {
            if (this.calibBtn) {
              this.calibBtn.disabled = false;
              this.calibBtn.textContent = "Calibrate (3s)";
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
      this.container.style.padding = "4px";
      this.container.style.borderRadius = "50%";
      this.container.style.bottom = "84px";
      this.container.style.left = "24px";
      this.container.style.transform = "none";
      this.container.style.background = "linear-gradient(135deg, rgba(28, 28, 32, 0.75) 0%, rgba(14, 14, 18, 0.9) 100%)";
      this.container.style.backdropFilter = "blur(24px) saturate(180%)";
      this.container.style.border = "1px solid rgba(255, 255, 255, 0.18)";
      this.container.style.borderTop = "1px solid rgba(255, 255, 255, 0.3)";
      this.container.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
      
      let logoUrl = "icons/icon-48.png";
      try {
        logoUrl = chrome.runtime.getURL("icons/icon-48.png");
      } catch {}

      this.container.innerHTML = `
        <button id="blip-expand-btn" title="Expand Blip Toolbar" style="
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        ">
          <img src="${logoUrl}" alt="Blip" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;" />
        </button>
      `;
      const expandBtn = document.getElementById("blip-expand-btn");
      if (expandBtn) {
        expandBtn.onmouseenter = () => {
          expandBtn.style.background = "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.06) 100%)";
          expandBtn.style.borderColor = "rgba(255, 255, 255, 0.35)";
          expandBtn.style.transform = "scale(1.06)";
        };
        expandBtn.onmouseleave = () => {
          expandBtn.style.background = "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)";
          expandBtn.style.borderColor = "rgba(255, 255, 255, 0.15)";
          expandBtn.style.transform = "scale(1)";
        };
        expandBtn.onclick = () => {
          if (this.container) {
            this.container.remove();
            this.container = null;
            this.isMinimized = false;
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
        this.statusBadge.style.color = "#f2994a";
        this.statusBadge.style.display = "inline-block";
      } else if (state.isVanished) {
        this.statusBadge.textContent = "● VANISHED";
        this.statusBadge.style.color = "#ea4335";
        this.statusBadge.style.display = "inline-block";
      } else {
        // Remove "LIVE" text as requested - keep clean logo indicator in normal live mode
        this.statusBadge.textContent = "";
        this.statusBadge.style.display = "none";
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
