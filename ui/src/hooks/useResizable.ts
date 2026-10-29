import { useState, useEffect, useCallback, useRef } from 'react';

interface UseResizableOptions {
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  storageKey?: string;
}

export function useResizable({
  minWidth = 280,
  maxWidth = 540,
  defaultWidth = 360,
  storageKey = 'blip_sidebar_width',
}: UseResizableOptions = {}) {
  const [width, setWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) {
          return Math.max(minWidth, Math.min(maxWidth, val));
        }
      }
    } catch {
      // Fallback
    }
    return defaultWidth;
  });

  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  const startResizing = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
    },
    [width]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Dragging left increases width because sidebar is on the right
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + delta));
      setWidth(newWidth);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, minWidth, maxWidth]);

  // Persist to localStorage whenever width changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, width.toString());
    } catch {
      // Ignore storage errors
    }
  }, [width, storageKey]);

  return {
    width,
    isDragging,
    startResizing,
    setWidth,
  };
}
