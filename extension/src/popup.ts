import { BlipConfig, BlipMessage, BlipState, DEFAULT_BLIP_CONFIG } from "./types";

document.addEventListener("DOMContentLoaded", async () => {
  const toggleEnabled = document.getElementById("toggle-enabled") as HTMLInputElement;
  const toggleOverlay = document.getElementById("toggle-overlay") as HTMLInputElement;
  const btnSnap = document.getElementById("btn-snap") as HTMLButtonElement;
  const btnGoku = document.getElementById("btn-goku") as HTMLButtonElement;
  const btnReappear = document.getElementById("btn-reappear") as HTMLButtonElement;
  const btnCalibrate = document.getElementById("btn-calibrate") as HTMLButtonElement;
  const plateStatusText = document.getElementById("plate-status-text") as HTMLElement;

  const rangeSnap = document.getElementById("range-snap") as HTMLInputElement;
  const rangeAudio = document.getElementById("range-audio") as HTMLInputElement;
  const rangeDuration = document.getElementById("range-duration") as HTMLInputElement;
  const checkAutoMute = document.getElementById("check-automute") as HTMLInputElement;

  const valSnap = document.getElementById("val-snap") as HTMLElement;
  const valAudio = document.getElementById("val-audio") as HTMLElement;
  const valDuration = document.getElementById("val-duration") as HTMLElement;
  const statusPill = document.getElementById("status-pill") as HTMLElement;

  // Load saved config & plate
  const stored = await chrome.storage.local.get(["blip_config", "blip_saved_plate"]);
  const config: BlipConfig = stored.blip_config || { ...DEFAULT_BLIP_CONFIG };

  // Set initial UI values
  toggleEnabled.checked = config.enabled;
  if (toggleOverlay) {
    toggleOverlay.checked = Boolean(config.showInMeetingOverlay);
  }

  if (plateStatusText) {
    if (stored.blip_saved_plate) {
      plateStatusText.textContent = "✓ Empty room plate active";
      plateStatusText.style.color = "var(--success)";
    } else {
      plateStatusText.textContent = "No room plate saved (defaults to dark ambience)";
      plateStatusText.style.color = "var(--text-muted)";
    }
  }
  rangeSnap.value = String(Math.round(config.snapSensitivity * 100));
  valSnap.textContent = `${rangeSnap.value}%`;

  rangeAudio.value = String(Math.round(config.audioClickThreshold * 100));
  valAudio.textContent = `${rangeAudio.value}%`;

  rangeDuration.value = String(Math.round(config.dustDurationMs / 100));
  valDuration.textContent = `${(config.dustDurationMs / 1000).toFixed(1)}s`;

  checkAutoMute.checked = config.autoMute;

  // Save helper
  async function saveConfig(updates: Partial<BlipConfig>): Promise<void> {
    const cur = await chrome.storage.local.get("blip_config");
    const merged = { ...(cur.blip_config || DEFAULT_BLIP_CONFIG), ...updates };
    await chrome.storage.local.set({ blip_config: merged });
  }

  // Send message to active tab
  function sendTabMessage(action: BlipMessage["action"], payload?: unknown): void {
    const message: BlipMessage = {
      source: "blip-extension-popup",
      action,
      payload,
      timestamp: Date.now(),
    };

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, message, () => {
          if (chrome.runtime.lastError) {
            chrome.runtime.sendMessage(message);
          }
        });
      } else {
        chrome.runtime.sendMessage(message);
      }
    });
  }

  // Event handlers
  toggleEnabled.addEventListener("change", () => {
    saveConfig({ enabled: toggleEnabled.checked });
    if (!toggleEnabled.checked) {
      statusPill.textContent = "Disabled";
      statusPill.classList.add("off");
    } else {
      statusPill.textContent = "Ready";
      statusPill.classList.remove("off");
    }
  });

  if (toggleOverlay) {
    toggleOverlay.addEventListener("change", () => {
      saveConfig({ showInMeetingOverlay: toggleOverlay.checked });
      sendTabMessage("BLIP_UPDATE_CONFIG", { showInMeetingOverlay: toggleOverlay.checked });
    });
  }

  btnSnap.addEventListener("click", () => {
    sendTabMessage("BLIP_TRIGGER_SNAP");
  });

  if (btnGoku) {
    btnGoku.addEventListener("click", () => {
      sendTabMessage("BLIP_TRIGGER_GOKU");
    });
  }

  btnReappear.addEventListener("click", () => {
    sendTabMessage("BLIP_TRIGGER_REAPPEAR");
  });

  let calibTimer: number | null = null;
  btnCalibrate.addEventListener("click", () => {
    if (calibTimer !== null) return;

    let countdown = 3;
    btnCalibrate.disabled = true;
    btnCalibrate.textContent = `Step aside! ${countdown}...`;

    sendTabMessage("BLIP_CALIBRATE_START", { seconds: countdown });

    calibTimer = window.setInterval(() => {
      countdown--;
      if (countdown > 0) {
        btnCalibrate.textContent = `Step aside! ${countdown}...`;
      } else {
        clearInterval(calibTimer!);
        calibTimer = null;

        // Perform plate snapshot now that user has stepped aside
        sendTabMessage("BLIP_CALIBRATE");
        btnCalibrate.textContent = "Captured! Sit down";

        if (plateStatusText) {
          plateStatusText.textContent = "✓ Empty room plate active";
          plateStatusText.style.color = "var(--success)";
        }

        setTimeout(() => {
          btnCalibrate.disabled = false;
          btnCalibrate.textContent = "Calibrate Room Plate (3s)";
        }, 2500);
      }
    }, 1000);
  });

  rangeSnap.addEventListener("input", () => {
    valSnap.textContent = `${rangeSnap.value}%`;
    saveConfig({ snapSensitivity: Number(rangeSnap.value) / 100 });
  });

  rangeAudio.addEventListener("input", () => {
    valAudio.textContent = `${rangeAudio.value}%`;
    saveConfig({ audioClickThreshold: Number(rangeAudio.value) / 100 });
  });

  rangeDuration.addEventListener("input", () => {
    const ms = Number(rangeDuration.value) * 100;
    valDuration.textContent = `${(ms / 1000).toFixed(1)}s`;
    saveConfig({ dustDurationMs: ms });
  });

  checkAutoMute.addEventListener("change", () => {
    saveConfig({ autoMute: checkAutoMute.checked });
  });

  // Listen for runtime status responses to update popup UI
  chrome.runtime.onMessage.addListener((message: BlipMessage) => {
    if (message.action === "BLIP_STATUS_RESPONSE" && message.payload) {
      const state = message.payload as BlipState;
      if (state.currentEffect !== "none") {
        statusPill.textContent = state.currentEffect === "snap" ? "Dissolving..." : "Teleporting...";
        statusPill.style.color = "#f59e0b";
      } else if (state.isVanished) {
        statusPill.textContent = "Vanished";
        statusPill.style.color = "#8b5cf6";
      } else {
        statusPill.textContent = "Live";
        statusPill.style.color = "#22c55e";
      }
    }
  });

  // Query status
  sendTabMessage("BLIP_STATUS_REQUEST");
});
