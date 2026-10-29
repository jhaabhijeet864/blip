import { describe, it, expect, vi, beforeEach } from "vitest";
import { BackgroundPlateManager } from "../src/effects/plate-manager";
import { MeetingMuteManager } from "../src/effects/mute-manager";

describe("BackgroundPlateManager", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      createElement: (tag: string) => {
        if (tag === "canvas") {
          return {
            width: 1280,
            height: 720,
            getContext: () => ({
              drawImage: vi.fn(),
              getImageData: vi.fn(),
              fillRect: vi.fn(),
              save: vi.fn(),
              restore: vi.fn(),
            }),
          };
        }
        return {};
      },
    });
  });

  it("captures empty room plate and marks validity", () => {
    const manager = new BackgroundPlateManager(1280, 720);
    const mockVideo = {} as CanvasImageSource;

    const captured = manager.capturePlate(mockVideo, 1280, 720);
    expect(captured).toBe(true);
    expect(manager.hasValidPlate()).toBe(true);
    expect(manager.getPlateCanvas()).toBeDefined();

    manager.reset();
    expect(manager.hasValidPlate()).toBe(false);
  });

  it("calculates accurate luminance ratio between frames", () => {
    const manager = new BackgroundPlateManager(100, 100);
    const w = 100;
    const h = 100;
    const live = {
      width: w,
      height: h,
      data: new Uint8ClampedArray(w * h * 4).fill(200),
    } as unknown as ImageData;

    const plate = {
      width: w,
      height: h,
      data: new Uint8ClampedArray(w * h * 4).fill(100),
    } as unknown as ImageData;

    const ratio = manager.calculateLuminanceDelta(live, plate);
    expect(ratio).toBeCloseTo(2.0, 1);
  });
});

describe("MeetingMuteManager", () => {
  it("disables stream audio tracks on mute and restores on unmute", () => {
    const muteManager = new MeetingMuteManager();
    const mockAudioTrack = { kind: "audio", enabled: true };
    const mockStream = {
      getAudioTracks: () => [mockAudioTrack],
    } as unknown as MediaStream;

    muteManager.mute(mockStream, false);
    expect(mockAudioTrack.enabled).toBe(false);
    expect(muteManager.getIsMuted()).toBe(true);

    muteManager.unmute(mockStream, false);
    expect(mockAudioTrack.enabled).toBe(true);
    expect(muteManager.getIsMuted()).toBe(false);
  });

  it("locates and clicks Google Meet microphone button in DOM", () => {
    const muteManager = new MeetingMuteManager();
    const mockButton = { click: vi.fn() };

    vi.stubGlobal("document", {
      querySelector: vi.fn((selector: string) => {
        if (selector.includes("Turn off microphone")) {
          return mockButton;
        }
        return null;
      }),
    });

    muteManager.mute(null, true);
    expect(mockButton.click).toHaveBeenCalled();
  });
});
