import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useCameraPreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [isReceivingFrames, setIsReceivingFrames] = useState<boolean>(false);
  const isRunningRef = useRef(true);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    isRunningRef.current = true;
    const img = new Image();
    imgRef.current = img;

    let animId: number;

    const pollFrame = async () => {
      if (!isRunningRef.current) return;

      try {
        // Call native Tauri IPC command
        const frameDataUrl = await invoke<string | null>('get_preview_frame');

        if (frameDataUrl && canvasRef.current) {
          setIsReceivingFrames(true);
          img.src = frameDataUrl;

          img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            if (canvas.width !== img.width || canvas.height !== img.height) {
              canvas.width = img.width;
              canvas.height = img.height;
            }

            ctx.drawImage(img, 0, 0);

            // FPS calculation
            frameCountRef.current++;
            const now = performance.now();
            const elapsed = now - lastFpsTimeRef.current;
            if (elapsed >= 1000) {
              setFps(Math.round((frameCountRef.current * 1000) / elapsed));
              frameCountRef.current = 0;
              lastFpsTimeRef.current = now;
            }
          };
        }
      } catch {
        // In browser dev mode without Tauri host
      }

      // 30 FPS target frame interval (~33ms)
      setTimeout(() => {
        if (isRunningRef.current) {
          animId = requestAnimationFrame(pollFrame);
        }
      }, 33);
    };

    animId = requestAnimationFrame(pollFrame);

    return () => {
      isRunningRef.current = false;
      cancelAnimationFrame(animId);
    };
  }, []);

  return {
    canvasRef,
    fps,
    isReceivingFrames,
  };
}
