import React from 'react';
import { Zap, Sparkles, RefreshCw, Wand2, Video } from 'lucide-react';

interface StageProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fps: number;
  isReceivingFrames: boolean;
  effectState: string;
  calibrationCountdown: number | null;
  onTriggerSnap: () => void;
  onTriggerGoku: () => void;
  onTriggerReappear: () => void;
  onStartCalibration: () => void;
}

export const Stage: React.FC<StageProps> = ({
  canvasRef,
  fps,
  isReceivingFrames,
  effectState,
  calibrationCountdown,
  onTriggerSnap,
  onTriggerGoku,
  onTriggerReappear,
  onStartCalibration,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0b0e] p-3 overflow-hidden select-none">
      {/* Top Header HUD Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#12141a] rounded-xl border border-zinc-800/80 mb-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-wider text-sm text-zinc-100">
            <img src="/logo.svg" alt="Blip Logo" className="w-4 h-4 object-contain" />
            <span>BLIP STUDIO</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE STREAMING</span>
          </div>
          {effectState !== 'Idle' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/60 text-purple-300 text-xs font-semibold rounded-full border border-purple-800/50 animate-bounce">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>{effectState.toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span className="px-2 py-0.5 bg-zinc-800/80 rounded border border-zinc-700/60">
            {fps > 0 ? `${fps}.0 FPS` : '30.0 FPS'} • 720p HD
          </span>
          <span className="px-2 py-0.5 bg-zinc-800/80 rounded border border-zinc-700/60 text-zinc-300">
            Ctrl+Alt+S
          </span>
        </div>
      </div>

      {/* Hero Video Viewfinder Stage */}
      <div className="flex-1 relative flex items-center justify-center bg-black/60 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          width={1280}
          height={720}
        />

        {/* Diagnostic card when frame stream is initializing */}
        {!isReceivingFrames && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0f14] text-zinc-400 gap-3">
            <Video className="w-10 h-10 text-zinc-600 animate-pulse" />
            <div className="text-sm font-medium text-zinc-300">Initializing camera feed...</div>
            <div className="text-xs text-zinc-500 max-w-sm text-center">
              Connecting to high-performance native MSMF capture pipeline. Select your webcam in the right panel.
            </div>
          </div>
        )}

        {/* Calibration Countdown Overlay */}
        {calibrationCountdown !== null && calibrationCountdown > 0 && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="text-7xl font-extrabold text-indigo-400 tracking-tighter mb-4 animate-scale">
              {Math.ceil(calibrationCountdown)}
            </div>
            <div className="text-lg font-semibold text-zinc-100">Step Out of View</div>
            <div className="text-xs text-zinc-400 mt-1">
              Capturing empty room reference plate for seamless disappearance.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quick-Action Toolbar */}
      <div className="flex items-center justify-center gap-3 pt-3">
        <button
          onClick={onStartCalibration}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Calibrate Room</span>
        </button>

        <button
          onClick={onTriggerSnap}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-200" />
          <span>Snap Dust</span>
        </button>

        <button
          onClick={onTriggerGoku}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-900/30 transition-all active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-amber-200" />
          <span>Goku Vanish</span>
        </button>

        <button
          onClick={onTriggerReappear}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
        >
          <Wand2 className="w-3.5 h-3.5 text-emerald-200" />
          <span>Reappear Live</span>
        </button>
      </div>
    </div>
  );
};
