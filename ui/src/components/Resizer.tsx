import React from 'react';

interface ResizerProps {
  onPointerDown: (e: React.PointerEvent) => void;
  isDragging: boolean;
}

export const Resizer: React.FC<ResizerProps> = ({ onPointerDown, isDragging }) => {
  return (
    <div
      onPointerDown={onPointerDown}
      className={`group relative w-2.5 -mx-1 z-30 cursor-col-resize select-none flex items-center justify-center transition-colors ${
        isDragging ? 'bg-indigo-500/30' : 'hover:bg-zinc-700/40'
      }`}
      title="Drag to resize sidebar"
    >
      {/* Visual thin line divider */}
      <div
        className={`w-[2px] h-full transition-colors ${
          isDragging ? 'bg-indigo-400' : 'bg-zinc-800 group-hover:bg-zinc-600'
        }`}
      />

      {/* Grip dots pill indicator in center */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-8 rounded-full border flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
          isDragging
            ? 'bg-indigo-600 border-indigo-400 shadow-indigo-500/20'
            : 'bg-zinc-800 border-zinc-700 group-hover:border-zinc-500 group-hover:bg-zinc-700'
        }`}
      >
        <span className="w-1 h-1 rounded-full bg-zinc-400 group-hover:bg-zinc-200" />
        <span className="w-1 h-1 rounded-full bg-zinc-400 group-hover:bg-zinc-200" />
      </div>
    </div>
  );
};
