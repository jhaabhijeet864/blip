import { BlipMessage, DEFAULT_BLIP_CONFIG } from "./types";

// Injected fallback check
function ensureMainWorldInjected(): void {
  if (document.getElementById("blip-injected-script")) {
    return;
  }
  const script = document.createElement("script");
  script.id = "blip-injected-script";
  script.src = chrome.runtime.getURL("dist/injected.js");
  script.type = "module";
  (document.head || document.documentElement).appendChild(script);
}

ensureMainWorldInjected();

// Read initial config from storage and sync to main-world interceptor
chrome.storage.local.get("blip_config", (result) => {
  const config = result.blip_config || DEFAULT_BLIP_CONFIG;
  window.postMessage(
    {
      source: "blip-extension-content",
      action: "BLIP_UPDATE_CONFIG",
      payload: config,
      timestamp: Date.now(),
    } as BlipMessage,
    "*"
  );
});

// Watch storage updates and sync
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.blip_config) {
    window.postMessage(
      {
        source: "blip-extension-content",
        action: "BLIP_UPDATE_CONFIG",
        payload: changes.blip_config.newValue,
        timestamp: Date.now(),
      } as BlipMessage,
      "*"
    );
  }
});

// Relay runtime messages from popup/background to main-world interceptor
chrome.runtime.onMessage.addListener((message: BlipMessage, _sender, sendResponse) => {
  if (message.source === "blip-extension-popup" || message.source === "blip-extension-content") {
    window.postMessage(message, "*");
    sendResponse({ success: true, forwardedTo: "main-world" });
  }
});

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

