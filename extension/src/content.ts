import { BlipMessage, DEFAULT_BLIP_CONFIG } from "./types";
import { BlipMeetingOverlay } from "./overlay";

// Safe main-world injection fallback for non-CSP environments
function ensureMainWorldInjected(): void {
  try {
    if (document.getElementById("blip-injected-script")) {
      return;
    }
    // Manifest V3 MAIN world content script handles modern Chrome; this is fallback for dev environments
    if (!("chrome" in window && chrome.runtime && chrome.runtime.getURL)) {
      return;
    }
  } catch {
    // Ignore CSP errors
  }
}

ensureMainWorldInjected();

// Mount In-Meeting Overlay Dock only if enabled by user
let overlayInstance: BlipMeetingOverlay | null = null;

function syncOverlayWithConfig(config: { showInMeetingOverlay?: boolean }): void {
  const show = Boolean(config.showInMeetingOverlay);
  if (show) {
    if (!overlayInstance) {
      overlayInstance = new BlipMeetingOverlay();
    }
    overlayInstance.mount();
  } else {
    if (overlayInstance) {
      overlayInstance.unmount();
    }
  }
}

// Read initial config from storage and sync to main-world interceptor
chrome.storage.local.get(["blip_config", "blip_saved_plate"], (result) => {
  const config = result.blip_config || DEFAULT_BLIP_CONFIG;
  
  // Sync overlay according to user choice
  syncOverlayWithConfig(config);

  window.postMessage(
    {
      source: "blip-extension-content",
      action: "BLIP_UPDATE_CONFIG",
      payload: config,
      timestamp: Date.now(),
    } as BlipMessage,
    "*"
  );

  // If saved plate exists, preload it into the main-world interceptor
  if (result.blip_saved_plate) {
    window.postMessage(
      {
        source: "blip-extension-content",
        action: "BLIP_LOAD_PLATE",
        payload: { dataUrl: result.blip_saved_plate },
        timestamp: Date.now(),
      } as BlipMessage,
      "*"
    );
  }
});

// Watch storage updates and sync
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.blip_config) {
    const newConfig = changes.blip_config.newValue;
    syncOverlayWithConfig(newConfig);

    window.postMessage(
      {
        source: "blip-extension-content",
        action: "BLIP_UPDATE_CONFIG",
        payload: newConfig,
        timestamp: Date.now(),
      } as BlipMessage,
      "*"
    );
  }
});

// Relay runtime messages from popup/background to main-world interceptor
chrome.runtime.onMessage.addListener((message: BlipMessage, _sender, sendResponse) => {
  if (message.source === "blip-extension-popup" || message.source === "blip-extension-content") {
    if (message.action === "BLIP_CALIBRATE_START") {
      const payload = message.payload as { seconds?: number } | undefined;
      showCalibrationToast(payload?.seconds || 3);
    }
    window.postMessage(message, "*");
    sendResponse({ success: true, forwardedTo: "main-world" });
  }
});

function showCalibrationToast(seconds: number): void {
  const existing = document.getElementById("blip-toast-overlay");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "blip-toast-overlay";
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid #8b5cf6;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(139, 92, 246, 0.3);
    color: #f8fafc;
    padding: 12px 24px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 2147483647;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s ease;
  `;

  let count = seconds;
  toast.innerHTML = `<span style="background: #8b5cf6; color: white; width: 26px; height: 26px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px;">⚡</span> Step aside! Capturing empty room in <span id="blip-toast-count" style="color: #a78bfa; font-weight: 800; font-size: 16px;">${count}</span>...`;

  if (document.body) {
    document.body.appendChild(toast);
  }

  const timer = setInterval(() => {
    count--;
    const countEl = document.getElementById("blip-toast-count");
    if (count > 0 && countEl) {
      countEl.textContent = String(count);
    } else {
      clearInterval(timer);
      toast.innerHTML = `<span style="background: #22c55e; color: white; width: 26px; height: 26px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px;">✓</span> Empty room plate captured! Sit back down.`;
      toast.style.borderColor = "#22c55e";
      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }
  }, 1000);
}

// Listen to main-world messages from injected interceptor
window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data || typeof event.data !== "object") {
    return;
  }

  const message = event.data as BlipMessage;
  if (message.source !== "blip-extension-injected") {
    return;
  }

  if (message.action === "BLIP_AUTO_MUTE") {
    handleDomMuteToggle(Boolean(message.payload));
  } else if (message.action === "BLIP_STATUS_RESPONSE" && message.payload) {
    const payload = message.payload as { backgroundPlateDataUrl?: string; hasBackgroundPlate?: boolean };
    if (payload.backgroundPlateDataUrl) {
      chrome.storage.local.set({ blip_saved_plate: payload.backgroundPlateDataUrl });
    }
  }
});

function handleDomMuteToggle(mute: boolean): void {
  // Support for Google Meet microphone button
  const meetMicButton = document.querySelector<HTMLButtonElement>(
    mute
      ? 'button[aria-label*="Turn off microphone"], button[aria-label*="turn off microphone"], button[data-is-muted="false"]'
      : 'button[aria-label*="Turn on microphone"], button[aria-label*="turn on microphone"], button[data-is-muted="true"]'
  );

  if (meetMicButton) {
    meetMicButton.click();
  }
}
