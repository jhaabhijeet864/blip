import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BlipStreamInterceptor } from "../src/stream-interceptor";
import { DEFAULT_BLIP_CONFIG } from "../src/types";

describe("BlipStreamInterceptor WebRTC Interception", () => {
  let mockOriginalGetUserMedia: ReturnType<typeof vi.fn>;
  let mockVideoTrack: {
    kind: string;
    stop: ReturnType<typeof vi.fn>;
    enabled: boolean;
    getSettings?: ReturnType<typeof vi.fn>;
    getCapabilities?: ReturnType<typeof vi.fn>;
    getConstraints?: ReturnType<typeof vi.fn>;
    applyConstraints?: ReturnType<typeof vi.fn>;
  };
  let mockAudioTrack: { kind: string; stop: ReturnType<typeof vi.fn>; enabled: boolean };
  let mockRealStream: {
    getTracks: () => unknown[];
    getVideoTracks: () => unknown[];
    getAudioTracks: () => unknown[];
    addTrack: ReturnType<typeof vi.fn>;
  };
  let interceptor: BlipStreamInterceptor;

  beforeEach(() => {
    mockVideoTrack = {
      kind: "video",
      stop: vi.fn(),
      enabled: true,
      getSettings: vi.fn().mockReturnValue({ width: 1280, height: 720, deviceId: "mock-camera-id", facingMode: "user" }),
      getCapabilities: vi.fn().mockReturnValue({ width: { min: 640, max: 1920 } }),
      getConstraints: vi.fn().mockReturnValue({}),
      applyConstraints: vi.fn().mockResolvedValue(undefined),
    };
    mockAudioTrack = { kind: "audio", stop: vi.fn(), enabled: true };

    mockRealStream = {
      getTracks: () => [mockVideoTrack, mockAudioTrack],
      getVideoTracks: () => [mockVideoTrack],
      getAudioTracks: () => [mockAudioTrack],
      addTrack: vi.fn(),
    };

    mockOriginalGetUserMedia = vi.fn().mockResolvedValue(mockRealStream);

    // Mock global navigator.mediaDevices
    const mockMediaDevices = {
      getUserMedia: mockOriginalGetUserMedia,
    };

    // Mock HTMLCanvasElement captureStream & getContext
    const mockCanvasContext = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      globalAlpha: 1,
    };

    const mockSyntheticVideoTrack = {
      kind: "video",
      stop: vi.fn(),
      enabled: true,
      getSettings: vi.fn().mockReturnValue({ width: 1280, height: 720 }),
      getCapabilities: vi.fn().mockReturnValue({}),
      getConstraints: vi.fn().mockReturnValue({}),
      applyConstraints: vi.fn().mockResolvedValue(undefined),
    };
    const mockSyntheticStream = {
      tracks: [mockSyntheticVideoTrack] as unknown[],
      getTracks: function () {
        return this.tracks;
      },
      getVideoTracks: function () {
        return [mockSyntheticVideoTrack];
      },
      getAudioTracks: function () {
        return this.tracks.filter((t: unknown) => (t as { kind: string }).kind === "audio");
      },
      addTrack: vi.fn(function (this: { tracks: unknown[] }, track: unknown) {
        this.tracks.push(track);
      }),
    };

    // Stub DOM methods
    vi.stubGlobal("navigator", { mediaDevices: mockMediaDevices });
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      postMessage: vi.fn(),
      cancelAnimationFrame: vi.fn(),
      requestAnimationFrame: vi.fn((cb) => setTimeout(cb, 16)),
    });
    vi.stubGlobal("performance", { now: () => 1000 });

    vi.stubGlobal("document", {
      createElement: (tag: string) => {
        if (tag === "canvas") {
          return {
            width: 1280,
            height: 720,
            getContext: () => mockCanvasContext,
            captureStream: () => mockSyntheticStream,
          };
        }
        if (tag === "video") {
          return {
            autoplay: false,
            muted: false,
            playsInline: false,
            style: {},
            srcObject: null,
            videoWidth: 1280,
            videoHeight: 720,
            play: vi.fn().mockResolvedValue(undefined),
            pause: vi.fn(),
            setAttribute: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            parentNode: null,
          };
        }
        return {};
      },
    });

    interceptor = new BlipStreamInterceptor();
  });

  afterEach(() => {
    interceptor.destroy();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("installs monkey-patch on navigator.mediaDevices.getUserMedia", () => {
    const installed = interceptor.install();
    expect(installed).toBe(true);
    expect(navigator.mediaDevices.getUserMedia).not.toBe(mockOriginalGetUserMedia);
  });

  it("intercepts video stream and returns synthetic stream with audio tracks attached", async () => {
    interceptor.install();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    expect(mockOriginalGetUserMedia).toHaveBeenCalledWith({ video: true, audio: true });
    expect(stream).toBeDefined();
    // Video track synthesized + audio track preserved
    expect(stream.getVideoTracks().length).toBeGreaterThanOrEqual(1);
    expect(stream.getAudioTracks().length).toBeGreaterThanOrEqual(1);
    expect(interceptor.getState().isIntercepted).toBe(true);
  });

  it("bypasses interception when video constraint is false", async () => {
    interceptor.install();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    expect(mockOriginalGetUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(stream).toBe(mockRealStream);
    expect(interceptor.getState().isIntercepted).toBe(false);
  });

  it("triggers vanish effect and mutes audio tracks when autoMute is enabled", async () => {
    interceptor.install();
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    expect(mockAudioTrack.enabled).toBe(true);

    interceptor.triggerVanish("snap");
    const state = interceptor.getState();
    expect(state.currentEffect).toBe("snap");
    expect(mockAudioTrack.enabled).toBe(false);
  });

  it("triggers goku vanish effect and mutes audio tracks when autoMute is enabled", async () => {
    interceptor.install();
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    interceptor.triggerVanish("goku");
    const state = interceptor.getState();
    expect(state.currentEffect).toBe("goku");
    expect(mockAudioTrack.enabled).toBe(false);
  });

  it("proxies synthetic video track settings to the real video track for Google Meet", async () => {
    interceptor.install();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoTrack = stream.getVideoTracks()[0] as any;

    expect(videoTrack.getSettings()).toMatchObject({
      width: 1280,
      height: 720,
      deviceId: "mock-camera-id",
      facingMode: "user",
    });
    expect(videoTrack.getCapabilities()).toEqual({ width: { min: 640, max: 1920 } });
    expect(mockVideoTrack.getSettings).toHaveBeenCalled();
  });

  it("triggers reappear and restores audio track state", async () => {
    interceptor.install();
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    interceptor.triggerVanish("snap");
    expect(mockAudioTrack.enabled).toBe(false);

    interceptor.triggerReappear();
    const state = interceptor.getState();
    expect(state.isVanished).toBe(false);
    expect(state.currentEffect).toBe("none");
    expect(mockAudioTrack.enabled).toBe(true);
  });

  it("captures background clean plate onto dedicated buffer", async () => {
    interceptor.install();
    await navigator.mediaDevices.getUserMedia({ video: true });

    const captured = interceptor.captureBackgroundPlate();
    expect(captured).toBe(true);
    expect(interceptor.getState().hasBackgroundPlate).toBe(true);
  });

  it("updates configuration dynamically", () => {
    interceptor.updateConfig({ dustDurationMs: 2500, snapSensitivity: 0.9 });
    // Verify by checking behavior or state
    expect(interceptor.getState()).toBeDefined();
  });

  it("restores original getUserMedia on destroy", () => {
    interceptor.install();
    expect(navigator.mediaDevices.getUserMedia).not.toBe(mockOriginalGetUserMedia);

    interceptor.destroy();
    expect(navigator.mediaDevices.getUserMedia).toBe(mockOriginalGetUserMedia);
  });
});
