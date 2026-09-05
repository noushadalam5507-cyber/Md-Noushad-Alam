import React, { useState, useRef, useEffect, useCallback } from 'react';

interface PatternLockPadProps {
  onComplete: (pattern: number[]) => void;
  isError?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  onClear?: () => void;
}

export const PatternLockPad: React.FC<PatternLockPadProps> = ({
  onComplete,
  isError = false,
  isSuccess = false,
  disabled = false,
  onClear,
}) => {
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [currentCoord, setCurrentCoord] = useState<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3x3 Grid Dots Coordinates in percentages (0..8)
  const dots = [
    { id: 0, x: 20, y: 20 },
    { id: 1, x: 50, y: 20 },
    { id: 2, x: 80, y: 20 },
    { id: 3, x: 20, y: 50 },
    { id: 4, x: 50, y: 50 },
    { id: 5, x: 80, y: 50 },
    { id: 6, x: 20, y: 80 },
    { id: 7, x: 50, y: 80 },
    { id: 8, x: 80, y: 80 },
  ];

  const getPointerPos = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const findNearestDot = useCallback((pos: { x: number; y: number }) => {
    const threshold = 14; // percentage radius
    for (const dot of dots) {
      const dist = Math.hypot(dot.x - pos.x, dot.y - pos.y);
      if (dist <= threshold) {
        return dot.id;
      }
    }
    return null;
  }, [dots]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const pos = getPointerPos(e);
    if (!pos) return;
    setIsDrawing(true);
    setCurrentCoord(pos);
    const dotId = findNearestDot(pos);
    if (dotId !== null) {
      setSelectedNodes([dotId]);
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      setSelectedNodes([]);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    const pos = getPointerPos(e);
    if (!pos) return;
    setCurrentCoord(pos);
    const dotId = findNearestDot(pos);
    if (dotId !== null && !selectedNodes.includes(dotId)) {
      setSelectedNodes((prev) => {
        const next = [...prev, dotId];
        if (navigator.vibrate) navigator.vibrate(12);
        return next;
      });
    }
  };

  const handleEnd = useCallback(() => {
    if (!isDrawing || disabled) return;
    setIsDrawing(false);
    setCurrentCoord(null);

    if (selectedNodes.length >= 2) {
      onComplete(selectedNodes);
    } else {
      setSelectedNodes([]);
      onClear?.();
    }
  }, [isDrawing, disabled, selectedNodes, onComplete, onClear]);

  // Handle pointer releases outside container
  useEffect(() => {
    const onGlobalUp = () => {
      if (isDrawing) {
        handleEnd();
      }
    };
    window.addEventListener('mouseup', onGlobalUp);
    window.addEventListener('touchend', onGlobalUp);
    return () => {
      window.removeEventListener('mouseup', onGlobalUp);
      window.removeEventListener('touchend', onGlobalUp);
    };
  }, [isDrawing, handleEnd]);

  // Auto clear on error
  useEffect(() => {
    if (isError) {
      const timer = setTimeout(() => {
        setSelectedNodes([]);
        onClear?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isError, onClear]);

  // Line & Node Stroke styling based on state
  let strokeColor = '#a855f7'; // Purple neon
  let glowColor = 'rgba(168, 85, 247, 0.6)';
  if (isError) {
    strokeColor = '#ef4444'; // Red error
    glowColor = 'rgba(239, 68, 68, 0.7)';
  } else if (isSuccess) {
    strokeColor = '#10b981'; // Emerald success
    glowColor = 'rgba(16, 185, 129, 0.7)';
  }

  return (
    <div className="flex flex-col items-center select-none touch-none">
      <div
        ref={containerRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl bg-zinc-950/80 border-2 ${
          isError
            ? 'border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-shake'
            : isSuccess
            ? 'border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
            : 'border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
        } backdrop-blur-xl transition-all overflow-hidden cursor-crosshair`}
      >
        {/* Interactive SVG Connector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render lines between selected nodes */}
          {selectedNodes.map((nodeId, idx) => {
            if (idx === 0) return null;
            const prevDot = dots[selectedNodes[idx - 1]];
            const currDot = dots[nodeId];
            return (
              <line
                key={`line-${idx}`}
                x1={`${prevDot.x}%`}
                y1={`${prevDot.y}%`}
                x2={`${currDot.x}%`}
                y2={`${currDot.y}%`}
                stroke={strokeColor}
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#neon-glow)"
              />
            );
          })}

          {/* Render dynamic line tracking pointer */}
          {isDrawing && currentCoord && selectedNodes.length > 0 && (
            <line
              x1={`${dots[selectedNodes[selectedNodes.length - 1]].x}%`}
              y1={`${dots[selectedNodes[selectedNodes.length - 1]].y}%`}
              x2={`${currentCoord.x}%`}
              y2={`${currentCoord.y}%`}
              stroke={strokeColor}
              strokeWidth="4"
              strokeDasharray="4 4"
              strokeLinecap="round"
              opacity="0.8"
            />
          )}
        </svg>

        {/* 9 Grid Touch Dots */}
        {dots.map((dot) => {
          const isSelected = selectedNodes.includes(dot.id);
          const isFirst = selectedNodes[0] === dot.id;

          return (
            <div
              key={dot.id}
              style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center cursor-pointer transition-transform"
            >
              {/* Outer Glow Halo when selected */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'scale-110'
                    : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: isSelected ? glowColor : 'transparent',
                }}
              >
                {/* Node Ring */}
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? isError
                        ? 'border-red-400 bg-red-950/80 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                        : isSuccess
                        ? 'border-emerald-400 bg-emerald-950/80 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                        : 'border-purple-300 bg-purple-950/80 shadow-[0_0_15px_rgba(168,85,247,0.8)]'
                      : 'border-zinc-700 bg-zinc-900/90'
                  }`}
                >
                  {/* Center Core Dot */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isSelected
                        ? isError
                          ? 'bg-red-300 scale-125'
                          : isSuccess
                          ? 'bg-emerald-300 scale-125'
                          : 'bg-purple-200 scale-125'
                        : 'bg-zinc-500'
                    }`}
                  />
                </div>
              </div>

              {/* Order number hint if drawing */}
              {isSelected && (
                <span className="absolute -bottom-2 text-[10px] font-mono font-bold text-white/70">
                  {selectedNodes.indexOf(dot.id) + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedNodes([]);
            onClear?.();
          }}
          className="text-xs text-zinc-400 hover:text-purple-300 transition-colors px-3 py-1 rounded-xl bg-zinc-900/80 border border-purple-900/40 cursor-pointer"
        >
          Clear Pattern
        </button>
      </div>
    </div>
  );
};
