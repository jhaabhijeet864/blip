import React from 'react';
import { Camera, Hand, Volume2, Video, CheckCircle2, RefreshCw } from 'lucide-react';

export interface CameraDevice {
  index: u32;
  name: string;
  display_label: string;
  is_phone_bridge: boolean;
  is_virtual: boolean;
  is_default: boolean;
}

// In TS types
type u32 = number;

interface SidebarProps {
  width: number;
  cameras: CameraDevice[];
  activeCameraIndex: number;
  onSelectCamera: (index: number) => void;
  snapEffect: string;
  onSetSnapEffect: (effect: string) => void;
  templeEffect: string;
  onSetTempleEffect: (effect: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  calibrationState: string;
  onStartCalibration: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  cameras,
  activeCameraIndex,
  onSelectCamera,
  snapEffect,
  onSetSnapEffect,
  templeEffect,
  onSetTempleEffect,
  soundEnabled,
  onToggleSound,
  calibrationState,
  onStartCalibration,
}) => {
  return (
    <aside
      style={{ width: `${width}px` }}
      className="h-full bg-[#111319] border-l border-zinc-800 flex flex-col overflow-y-auto select-none p-4 text-zinc-200 transition-all duration-75"
    >
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
        <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Studio Settings</h2>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700">
          v2.0 Native
        </span>
      </div>

      <div className="flex flex-col gap-5 text-xs">
        {/* 1. Camera & Output */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span>Camera & Output</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-zinc-400">Webcam Source:</label>
            <select
              value={activeCameraIndex}
              onChange={(e) => onSelectCamera(parseInt(e.target.value, 10))}
              className="w-full bg-[#1a1d26] border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 font-sans"
            >
              {cameras.length === 0 ? (
                <option value={0}>Camera 0 (Default)</option>
              ) : (
                cameras.map((cam) => {
                  let tag = '[Hardware]';
                  if (cam.is_phone_bridge) tag = '[Phone App]';
                  if (cam.is_virtual) tag = '[Virtual]';

                  return (
                    <option key={cam.index} value={cam.index}>
                      {tag} {cam.name}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>OBS Virtual Camera driver ready</span>
          </div>
        </section>

        {/* 2. Empty Room Background Calibration */}
        <section className="flex flex-col gap-2 p-3 bg-[#161922] rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-200">Room Calibration</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                calibrationState === 'Ready'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {calibrationState}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Snapshot your room without you so Blip can reveal it when you vanish.
          </p>
          <button
            onClick={onStartCalibration}
            className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Calibrate Background (3s)</span>
          </button>
        </section>

        {/* 3. Gesture Triggers & Mapping */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
            <Hand className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gesture Triggers</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-300">Finger Snap:</span>
              <select
                value={snapEffect}
                onChange={(e) => onSetSnapEffect(e.target.value)}
                className="bg-[#1a1d26] border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-200"
              >
                <option value="thanos">Thanos Dust</option>
                <option value="goku">Goku Vanish</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-300">Temple Tap:</span>
              <select
                value={templeEffect}
                onChange={(e) => onSetTempleEffect(e.target.value)}
                className="bg-[#1a1d26] border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-200"
              >
                <option value="goku">Instant Transmission</option>
                <option value="thanos">Thanos Dust</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </section>

        {/* 4. Audio Feedback */}
        <section className="flex items-center justify-between py-2 border-t border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-zinc-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-zinc-200">Audio Feedback</span>
              <span className="text-[10px] text-zinc-400">Play snap/zap sound cues</span>
            </div>
          </div>
          <button
            onClick={onToggleSound}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
              soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-zinc-700 justify-start'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-white shadow-md transform" />
          </button>
        </section>

        {/* 5. Google Meet & Zoom Setup Guide */}
        <section className="flex flex-col gap-1.5 p-3 bg-[#14161f] rounded-xl border border-zinc-800/80">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span>Google Meet & Zoom Setup</span>
          </div>
          <ol className="list-decimal list-inside text-[11px] text-zinc-400 space-y-1">
            <li>Open Settings &gt; Video in Google Meet or Zoom.</li>
            <li>Select <strong className="text-zinc-200">OBS Virtual Camera</strong> as your camera.</li>
            <li>Snap your fingers or tap temple to disappear live!</li>
          </ol>
        </section>
      </div>
    </aside>
  );
};
