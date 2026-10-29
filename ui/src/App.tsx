import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Stage } from './components/Stage';
import { Resizer } from './components/Resizer';
import { Sidebar, CameraDevice } from './components/Sidebar';
import { useResizable } from './hooks/useResizable';
import { useCameraPreview } from './hooks/useCameraPreview';

interface PipelineStatus {
  active_camera_index: number;
  effect_state: string;
  calibration_state: string;
  calibration_countdown: number | null;
}

export const App: React.FC = () => {
  const { width: sidebarWidth, isDragging, startResizing } = useResizable({
    minWidth: 280,
    maxWidth: 520,
    defaultWidth: 360,
  });

  const { canvasRef, fps, isReceivingFrames } = useCameraPreview();

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState<number>(0);
  const [effectState, setEffectState] = useState<string>('Idle');
  const [calibrationState, setCalibrationState] = useState<string>('Uncalibrated');
  const [calibrationCountdown, setCalibrationCountdown] = useState<number | null>(null);

  const [snapEffect, setSnapEffect] = useState<string>('thanos');
  const [templeEffect, setTempleEffect] = useState<string>('goku');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Load cameras on mount
  useEffect(() => {
    const loadCameras = async () => {
      try {
        const list = await invoke<CameraDevice[]>('get_cameras');
        setCameras(list);
        const def = list.find((c) => c.is_default);
        if (def) {
          setActiveCameraIndex(def.index);
        }
      } catch {
        // Fallback for standalone browser testing
        setCameras([
          {
            index: 0,
            name: 'HP Wide Vision HD Camera',
            display_label: 'HP Wide Vision HD Camera (Active)',
            is_phone_bridge: false,
            is_virtual: false,
            is_default: true,
          },
          {
            index: 1,
            name: 'DroidCam Video',
            display_label: 'DroidCam Video (Phone App)',
            is_phone_bridge: true,
            is_virtual: false,
            is_default: false,
          },
        ]);
      }
    };

    loadCameras();
  }, []);

  // Poll status telemetry periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await invoke<PipelineStatus>('get_pipeline_status');
        setEffectState(status.effect_state);
        setCalibrationState(status.calibration_state);
        setCalibrationCountdown(status.calibration_countdown);
        setActiveCameraIndex(status.active_camera_index);
      } catch {
        // In browser mock mode
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Camera switch handler
  const handleSelectCamera = useCallback(async (index: number) => {
    setActiveCameraIndex(index);
    try {
      await invoke('switch_camera', { index });
    } catch (e) {
      console.error('Failed to switch camera:', e);
    }
  }, []);

  // Action triggers
  const handleTriggerSnap = useCallback(async () => {
    try {
      await invoke('trigger_thanos_snap');
    } catch (e) {
      console.error('Failed to trigger Thanos snap:', e);
    }
  }, []);

  const handleTriggerGoku = useCallback(async () => {
    try {
      await invoke('trigger_instant_transmission');
    } catch (e) {
      console.error('Failed to trigger Goku vanish:', e);
    }
  }, []);

  const handleTriggerReappear = useCallback(async () => {
    try {
      await invoke('trigger_reappear');
    } catch (e) {
      console.error('Failed to trigger reappear:', e);
    }
  }, []);

  const handleStartCalibration = useCallback(async () => {
    try {
      await invoke('start_calibration');
    } catch (e) {
      console.error('Failed to start calibration:', e);
    }
  }, []);

  // Global hotkey listener (Ctrl+Alt+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleTriggerReappear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTriggerReappear]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0e12]">
      {/* Hero Video Stage */}
      <Stage
        canvasRef={canvasRef}
        fps={fps}
        isReceivingFrames={isReceivingFrames}
        effectState={effectState}
        calibrationCountdown={calibrationCountdown}
        onTriggerSnap={handleTriggerSnap}
        onTriggerGoku={handleTriggerGoku}
        onTriggerReappear={handleTriggerReappear}
        onStartCalibration={handleStartCalibration}
      />

      {/* Draggable Mouse Splitter / Resizer */}
      <Resizer onPointerDown={startResizing} isDragging={isDragging} />

      {/* Studio Settings Sidebar */}
      <Sidebar
        width={sidebarWidth}
        cameras={cameras}
        activeCameraIndex={activeCameraIndex}
        onSelectCamera={handleSelectCamera}
        snapEffect={snapEffect}
        onSetSnapEffect={setSnapEffect}
        templeEffect={templeEffect}
        onSetTempleEffect={setTempleEffect}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        calibrationState={calibrationState}
        onStartCalibration={handleStartCalibration}
      />
    </div>
  );
};

