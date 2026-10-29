import { BlipConfig, BlipMessage, DEFAULT_BLIP_CONFIG } from "./types";

document.addEventListener("DOMContentLoaded", async () => {
  const toggleEnabled = document.getElementById("toggle-enabled") as HTMLInputElement;
  const btnSnap = document.getElementById("btn-snap") as HTMLButtonElement;
  const btnReappear = document.getElementById("btn-reappear") as HTMLButtonElement;
  const btnCalibrate = document.getElementById("btn-calibrate") as HTMLButtonElement;

  const rangeSnap = document.getElementById("range-snap") as HTMLInputElement;
  const rangeAudio = document.getElementById("range-audio") as HTMLInputElement;
  const rangeDuration = document.getElementById("range-duration") as HTMLInputElement;
  const checkAutoMute = document.getElementById("check-automute") as HTMLInputElement;

  const valSnap = document.getElementById("val-snap") as HTMLElement;
  const valAudio = document.getElementById("val-audio") as HTMLElement;
  const valDuration = document.getElementById("val-duration") as HTMLElement;
  const statusPill = document.getElementById("status-pill") as HTMLElement;

  // Load saved config
  const stored = await chrome.storage.local.get("blip_config");
  const config: BlipConfig = stored.blip_config || { ...DEFAULT_BLIP_CONFIG };

  // Set initial UI values
  toggleEnabled.checked = config.enabled;
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
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        // Tab not listening or not on meeting page
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

  btnSnap.addEventListener("click", () => {
    sendTabMessage("BLIP_TRIGGER_SNAP");
  });

  btnReappear.addEventListener("click", () => {
    sendTabMessage("BLIP_TRIGGER_REAPPEAR");
  });

  btnCalibrate.addEventListener("click", () => {
    sendTabMessage("BLIP_CALIBRATE");
    btnCalibrate.textContent = "Calibrating...";
    setTimeout(() => {
      btnCalibrate.textContent = "Plate Captured!";
      setTimeout(() => {
        btnCalibrate.textContent = "Calibrate Room Plate (3s)";
      }, 1500);
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

  // Query status
  sendTabMessage("BLIP_STATUS_REQUEST");
});

