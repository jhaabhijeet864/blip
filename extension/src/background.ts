import { DEFAULT_BLIP_CONFIG, BlipConfig, BlipMessage } from "./types";

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get("blip_config");
  if (!stored.blip_config) {
    await chrome.storage.local.set({ blip_config: DEFAULT_BLIP_CONFIG });
  }
  updateBadge(DEFAULT_BLIP_CONFIG.enabled);
});

function updateBadge(enabled: boolean): void {
  if (enabled) {
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
  } else {
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#64748b" });
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.blip_config) {
    const nextConfig = changes.blip_config.newValue as BlipConfig;
    if (nextConfig && typeof nextConfig.enabled === "boolean") {
      updateBadge(nextConfig.enabled);
    }
  }
});

chrome.runtime.onMessage.addListener((message: BlipMessage, _sender, sendResponse) => {
  if (message.source === "blip-extension-popup") {
    // Relay to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, message, (response) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ success: false, error: "No active tab found" });
      }
    });
    return true; // Keep message channel open for async response
  }
  return false;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-vanish") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, {
          source: "blip-extension-popup",
          action: "BLIP_TRIGGER_SNAP",
          timestamp: Date.now(),
        });
      }
    });
  }
});

