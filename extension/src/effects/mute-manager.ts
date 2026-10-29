export class MeetingMuteManager {
  private isMuted = false;

  public mute(stream: MediaStream | null, syncDom = true): boolean {
    if (stream) {
      for (const track of stream.getAudioTracks()) {
        track.enabled = false;
      }
    }

    if (syncDom && typeof document !== "undefined") {
      this.clickMeetingMuteButton(true);
    }

    this.isMuted = true;
    return true;
  }

  public unmute(stream: MediaStream | null, syncDom = true): boolean {
    if (stream) {
      for (const track of stream.getAudioTracks()) {
        track.enabled = true;
      }
    }

    if (syncDom && typeof document !== "undefined") {
      this.clickMeetingMuteButton(false);
    }

    this.isMuted = false;
    return true;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private clickMeetingMuteButton(mute: boolean): boolean {
    if (typeof document === "undefined") {
      return false;
    }

    // Selectors for Google Meet, Microsoft Teams, and Zoom Web
    const muteSelectors = [
      'button[aria-label*="Turn off microphone"]',
      'button[aria-label*="turn off microphone"]',
      'button[data-is-muted="false"]',
      'button[aria-label*="Mute mic"]',
      'button[aria-label*="mute mic"]',
      'button#mic-button[aria-checked="true"]',
      'button[aria-label*="Mute my microphone"]',
    ];

    const unmuteSelectors = [
      'button[aria-label*="Turn on microphone"]',
      'button[aria-label*="turn on microphone"]',
      'button[data-is-muted="true"]',
      'button[aria-label*="Unmute mic"]',
      'button[aria-label*="unmute mic"]',
      'button#mic-button[aria-checked="false"]',
      'button[aria-label*="Unmute my microphone"]',
    ];

    const selectors = mute ? muteSelectors : unmuteSelectors;

    for (const selector of selectors) {
      const button = document.querySelector<HTMLButtonElement>(selector);
      if (button) {
        button.click();
        return true;
      }
    }

    return false;
  }
}
