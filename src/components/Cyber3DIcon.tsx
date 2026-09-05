import React, { useState, useEffect } from 'react';
import { Sparkles, Video, Zap, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';

export type ChromaticColorTheme = 'black-blue' | 'chromatic-shift' | 'mirror-chrome' | 'green' | 'white' | 'blue' | 'black' | 'purple' | 'cyber';

export interface Cyber3DIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | number;
  isProcessing?: boolean;
  processType?: 'downloading' | 'installing' | 'syncing' | 'idle';
  processProgress?: number;
  processLabel?: string;
  theme?: ChromaticColorTheme;
  interactive?: boolean;
  showRings?: boolean;
  showParticles?: boolean;
  className?: string;
}

export const Cyber3DIcon: React.FC<Cyber3DIconProps> = ({
  size = 'lg',
  isProcessing = false,
  processType = 'idle',
  processProgress = 0,
  processLabel = '',
  theme = 'black-blue',
  interactive = false,
  showRings = true,
  showParticles = true,
  className = '',
}) => {
  const [activeThemeIndex, setActiveThemeIndex] = useState<number>(0);
  const [dragRotation, setDragRotation] = useState<{ x: number; y: number }>({ x: 12, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Chromatic color stages with 3D Black & Electric Blue, Mirror Chrome Glass Specular Shine
  const chromaticThemes = [
    {
      name: 'Black & Electric Blue 3D',
      gradient: 'from-black via-zinc-900 to-blue-950',
      glow: 'shadow-[0_0_45px_rgba(0,180,255,0.9),0_0_20px_rgba(0,0,0,0.9)]',
      border: 'border-[#00b4ff]',
      text: 'text-[#00d0ff]',
      ringColor: '#00d0ff',
      accentHex: '#00b4ff',
      isMirror: true,
    },
    {
      name: '3D Mirror Chrome Glass',
      gradient: 'from-slate-100 via-white to-zinc-300',
      glow: 'shadow-[0_0_45px_rgba(255,255,255,0.9),0_0_20px_rgba(168,85,247,0.5)]',
      border: 'border-white/90',
      text: 'text-white',
      ringColor: '#ffffff',
      accentHex: '#ffffff',
      isMirror: true,
    },
    {
      name: 'Neon Green Mirror',
      gradient: 'from-emerald-300 via-green-400 to-teal-300',
      glow: 'shadow-[0_0_35px_rgba(0,255,102,0.85)]',
      border: 'border-[#00ff66]',
      text: 'text-[#00ff66]',
      ringColor: '#00ff66',
      accentHex: '#00ff66',
      isMirror: false,
    },
    {
      name: 'Cyber Mirror Silver',
      gradient: 'from-white via-slate-200 to-indigo-100',
      glow: 'shadow-[0_0_40px_rgba(255,255,255,0.95)]',
      border: 'border-white',
      text: 'text-white',
      ringColor: '#ffffff',
      accentHex: '#ffffff',
      isMirror: true,
    },
    {
      name: 'Electric Blue Mirror',
      gradient: 'from-cyan-300 via-blue-400 to-sky-300',
      glow: 'shadow-[0_0_35px_rgba(0,240,255,0.85)]',
      border: 'border-[#00f0ff]',
      text: 'text-[#00f0ff]',
      ringColor: '#00f0ff',
      accentHex: '#00f0ff',
      isMirror: false,
    },
    {
      name: 'Obsidian Mirror Black',
      gradient: 'from-zinc-800 via-zinc-950 to-black',
      glow: 'shadow-[0_0_30px_rgba(161,161,170,0.5)]',
      border: 'border-zinc-400',
      text: 'text-zinc-200',
      ringColor: '#a1a1aa',
      accentHex: '#71717a',
      isMirror: true,
    },
    {
      name: 'Ultra Purple Mirror',
      gradient: 'from-purple-400 via-fuchsia-500 to-indigo-500',
      glow: 'shadow-[0_0_40px_rgba(168,85,247,0.85)]',
      border: 'border-[#a855f7]',
      text: 'text-[#a855f7]',
      ringColor: '#a855f7',
      accentHex: '#a855f7',
      isMirror: false,
    },
  ];

  // Automatic subtle color blend cycling if theme is chromatic-shift
  useEffect(() => {
    if (theme !== 'chromatic-shift') return;
    const interval = setInterval(() => {
      setActiveThemeIndex((prev) => (prev + 1) % chromaticThemes.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [theme]);

  // Size mappings
  const getSizePx = (): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 44;
      case 'md':
        return 72;
      case 'lg':
        return 110;
      case 'xl':
        return 150;
      case 'hero':
        return 185;
      default:
        return 110;
    }
  };

  const dim = getSizePx();
  const currentTheme =
    theme === 'black-blue'
      ? chromaticThemes[0]
      : theme === 'green'
      ? chromaticThemes[2]
      : theme === 'white'
      ? chromaticThemes[3]
      : theme === 'blue'
      ? chromaticThemes[4]
      : theme === 'black'
      ? chromaticThemes[5]
      : theme === 'purple'
      ? chromaticThemes[6]
      : theme === 'mirror-chrome'
      ? chromaticThemes[1]
      : chromaticThemes[activeThemeIndex];

  // Mouse and Touch drag handlers for interactive 3D inspection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    setDragRotation((prev) => ({
      x: Math.max(-60, Math.min(60, prev.x - dy * 0.4)),
      y: (prev.y + dx * 0.5) % 360,
    }));
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!interactive || !e.touches[0]) return;
    setIsDragging(true);
    setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !interactive || !e.touches[0]) return;
    const dx = e.touches[0].clientX - startPos.x;
    const dy = e.touches[0].clientY - startPos.y;
    setDragRotation((prev) => ({
      x: Math.max(-60, Math.min(60, prev.x - dy * 0.4)),
      y: (prev.y + dx * 0.5) % 360,
    }));
    setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      id="cyber-3d-icon-container"
      className={`relative select-none flex flex-col items-center justify-center perspective-1000 max-w-full mx-auto box-border ${className}`}
      style={{
        width: dim,
        height: dim,
        maxWidth: '100%',
        boxSizing: 'border-box',
        touchAction: interactive ? 'none' : 'auto',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Radial Ambient Flare */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-1000 pointer-events-none ${
          isProcessing ? 'animate-intense-neon-flare scale-150' : 'opacity-70 scale-125'
        }`}
        style={{
          background: `radial-gradient(circle, ${currentTheme.accentHex}40 0%, transparent 70%)`,
          filter: isProcessing ? 'blur(28px)' : 'blur(18px)',
        }}
      />

      {/* Intense Glowing Shockwave Rings during active downloading/installing */}
      {isProcessing && (
        <>
          <div
            className="absolute inset-0 rounded-full border-2 animate-shockwave pointer-events-none"
            style={{ borderColor: currentTheme.accentHex }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 animate-shockwave pointer-events-none"
            style={{
              borderColor: '#00f0ff',
              animationDelay: '0.6s',
            }}
          />
        </>
      )}

      {/* Orbital 3D Rings */}
      {showRings && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transform-style-3d ${
            isProcessing ? 'animate-spin3d-turbo' : 'animate-spin3d-fast'
          }`}
        >
          {/* Ring 1 - Vertical Orbit */}
          <div
            className="absolute rounded-full border border-dashed transition-all duration-700 opacity-60"
            style={{
              width: dim * 1.25,
              height: dim * 1.25,
              borderColor: currentTheme.ringColor,
              transform: 'rotateX(75deg) rotateY(20deg)',
              boxShadow: `0 0 15px ${currentTheme.ringColor}60`,
            }}
          >
            {/* Satellite Node on Ring */}
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full shadow-[0_0_12px_#ffffff] animate-ping"
              style={{ backgroundColor: currentTheme.ringColor }}
            />
          </div>

          {/* Ring 2 - Horizontal Counter Orbit */}
          <div
            className="absolute rounded-full border transition-all duration-700 opacity-40"
            style={{
              width: dim * 1.35,
              height: dim * 1.35,
              borderColor: '#ffffff',
              transform: 'rotateX(-65deg) rotateY(-40deg)',
              boxShadow: '0 0 10px rgba(255,255,255,0.4)',
            }}
          />
        </div>
      )}

      {/* Main 3D Continuous 360-degree Rotating Multi-Chromatic Icon Body */}
      <div
        id="cyber-3d-rotating-core"
        className={`relative z-10 rounded-3xl transform-style-3d transition-shadow duration-700 flex items-center justify-center ${
          isProcessing ? 'animate-spin3d-fast' : 'animate-spin3d'
        }`}
        style={{
          width: dim * 0.85,
          height: dim * 0.85,
          transform: interactive && isDragging ? `rotateX(${dragRotation.x}deg) rotateY(${dragRotation.y}deg)` : undefined,
        }}
      >
        {/* Layer 1: Holographic 3D Facet Front -> "WELCOME" */}
        <div
          className={`absolute inset-0 rounded-[28px] bg-gradient-to-tr ${currentTheme.gradient} p-1 ${currentTheme.glow} transition-all duration-700 flex items-center justify-center`}
          style={{
            transform: 'translateZ(18px)',
            boxShadow: isProcessing
              ? `0 0 50px ${currentTheme.accentHex}, inset 0 0 25px rgba(255,255,255,0.8)`
              : `0 0 25px ${currentTheme.accentHex}80, inset 0 0 15px rgba(255,255,255,0.3)`,
          }}
        >
          <div className="w-full h-full bg-zinc-950/95 rounded-[24px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md px-2 py-1">
            {/* Hologram Grid Scanlines */}
            <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />
            
            {/* Mirror Glass Specular Chrome Sheen Layer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-80"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.3) 25%, transparent 50%, rgba(255,255,255,0.15) 75%, rgba(255,255,255,0.45) 100%)',
              }}
            />

            {/* Diagonal Specular Mirror Reflection Sweep */}
            <div
              className="absolute -inset-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform -rotate-45 pointer-events-none animate-shimmer"
              style={{ animationDuration: '3s' }}
            />

            {/* Chrome Mirror Bevel Edge Glow */}
            <div className="absolute inset-0 rounded-[24px] border border-cyan-400/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.5)] pointer-events-none" />

            {/* SIDE 1: WELCOME SIDE */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-1 w-full text-center">
              <div className="relative flex items-center justify-center">
                <Sparkles
                  style={{
                    width: dim * 0.26,
                    height: dim * 0.26,
                    color: currentTheme.accentHex,
                    filter: `drop-shadow(0 0 10px ${currentTheme.accentHex})`,
                  }}
                  className="animate-pulse"
                />
              </div>

              {/* Bold "WELCOME" 3D Typography */}
              <div className="flex flex-col items-center justify-center leading-none">
                <span
                  className="font-black tracking-widest font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-400 drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]"
                  style={{
                    fontSize: dim >= 180 ? '20px' : dim >= 100 ? '14px' : dim >= 65 ? '10px' : '8px',
                    letterSpacing: '0.2em',
                  }}
                >
                  WELCOME
                </span>
                <span
                  className="font-bold text-[7px] text-cyan-300 font-mono tracking-wider mt-0.5"
                  style={{ textShadow: `0 0 8px ${currentTheme.accentHex}` }}
                >
                  ✦ STUDIO ✦
                </span>
              </div>
            </div>

            {/* Active Process Progress Overlay */}
            {isProcessing && (
              <div className="absolute inset-x-2 bottom-1.5 z-20 flex flex-col items-center space-y-0.5">
                <div className="w-full bg-zinc-900/90 h-1.5 rounded-full overflow-hidden border border-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-500 transition-all duration-200"
                    style={{ width: `${Math.max(5, processProgress)}%` }}
                  />
                </div>
                <span className="text-[7px] font-mono font-bold text-white tracking-wider">
                  {processProgress}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Layer 2: 3D Isometric Depth Facet Back -> "NOVAGRAND PRO" */}
        <div
          className={`absolute inset-0 rounded-[28px] bg-gradient-to-tr from-black via-zinc-950 to-purple-950 p-1 border border-purple-500/70 flex items-center justify-center`}
          style={{
            transform: 'translateZ(-18px) rotateY(180deg)',
            boxShadow: `0 0 35px rgba(168,85,247,0.7), inset 0 0 15px rgba(0,180,255,0.3)`,
          }}
        >
          <div className="w-full h-full bg-zinc-950/95 rounded-[24px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md px-2 py-1">
            {/* Hologram Grid Scanlines */}
            <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

            {/* Mirror Sheen */}
            <div
              className="absolute inset-0 pointer-events-none opacity-60"
              style={{
                background:
                  'linear-gradient(135deg, rgba(168,85,247,0.4) 0%, transparent 50%, rgba(0,240,255,0.3) 100%)',
              }}
            />

            {/* SIDE 2: NOVAGRAND PRO SIDE */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-1 w-full text-center">
              <div className="relative flex items-center justify-center">
                <Video
                  style={{
                    width: dim * 0.26,
                    height: dim * 0.26,
                    color: '#a855f7',
                    filter: 'drop-shadow(0 0 10px #a855f7)',
                  }}
                  className="transition-colors duration-500"
                />
              </div>

              {/* Bold "NOVAGRAND PRO" 3D Typography */}
              <div className="flex flex-col items-center justify-center leading-none">
                <span
                  className="font-black tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]"
                  style={{
                    fontSize: dim >= 180 ? '16px' : dim >= 100 ? '11px' : dim >= 65 ? '8px' : '6px',
                    letterSpacing: '0.12em',
                  }}
                >
                  NOVAGRAND
                </span>
                <span
                  className="font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-mono tracking-widest mt-0.5"
                  style={{
                    fontSize: dim >= 180 ? '10px' : dim >= 100 ? '8px' : '6px',
                  }}
                >
                  PRO 4K
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Connecting Extrusion Ribs (Side Edges) */}
        <div
          className="absolute inset-y-2 -left-2 w-4 bg-purple-900/80 border border-purple-400/40 rounded-l-xl pointer-events-none"
          style={{
            transform: 'rotateY(-90deg) translateZ(10px)',
            background: `linear-gradient(to right, ${currentTheme.accentHex}, transparent)`,
          }}
        />
        <div
          className="absolute inset-y-2 -right-2 w-4 bg-purple-900/80 border border-purple-400/40 rounded-r-xl pointer-events-none"
          style={{
            transform: 'rotateY(90deg) translateZ(10px)',
            background: `linear-gradient(to left, ${currentTheme.accentHex}, transparent)`,
          }}
        />
      </div>

      {/* Floating Particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          <span
            className="absolute top-2 left-3 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff66] animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <span
            className="absolute bottom-3 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse"
            style={{ animationDelay: '0.7s' }}
          />
          <span
            className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-ping"
            style={{ animationDelay: '1.2s' }}
          />
        </div>
      )}
    </div>
  );
};
