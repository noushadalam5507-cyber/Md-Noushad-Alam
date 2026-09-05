import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Zap,
  Download,
  CheckCircle2,
  X,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Palette,
  Play,
  Video,
  Shield,
  Activity,
  Coins,
  Cpu,
  Film
} from 'lucide-react';
import { Cyber3DIcon, ChromaticColorTheme } from './Cyber3DIcon';

interface Launcher3DWidgetProps {
  onOpenSplash: () => void;
  onOpenCallModule: () => void;
  onOpenMessages: () => void;
  onOpenAdMobReward: () => void;
  onOpenVideoReels?: () => void;
  onOpenLuckySpin?: () => void;
  onOpenAppUpdate?: () => void;
  onOpenTrafficWidget?: () => void;
  userCoins?: number;
}

export const Launcher3DWidget: React.FC<Launcher3DWidgetProps> = ({
  onOpenSplash,
  onOpenCallModule,
  onOpenMessages,
  onOpenAdMobReward,
  onOpenVideoReels,
  onOpenLuckySpin,
  onOpenAppUpdate,
  onOpenTrafficWidget,
  userCoins = 100,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<ChromaticColorTheme>('black-blue');

  // Background process simulation state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processType, setProcessType] = useState<'downloading' | 'installing' | 'syncing' | 'idle'>('idle');
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [processLabel, setProcessLabel] = useState<string>('');
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0 MB/s');
  const [processSuccessToast, setProcessSuccessToast] = useState<string | null>(null);

  // Background download / install simulation
  const startBackgroundProcess = (
    label: string,
    type: 'downloading' | 'installing' | 'syncing',
    totalMb: number
  ) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessType(type);
    setProcessProgress(0);
    setProcessLabel(label);
    setProcessSuccessToast(null);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      const speed = (Math.random() * 25 + 35).toFixed(1);
      setDownloadSpeed(`${speed} MB/s`);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setProcessProgress(100);
        setTimeout(() => {
          setIsProcessing(false);
          setProcessType('idle');
          setProcessSuccessToast(`🎉 ${label} completed successfully!`);
          setTimeout(() => setProcessSuccessToast(null), 5000);
        }, 600);
      } else {
        setProcessProgress(currentProgress);
      }
    }, 120);
  };

  const themeOptions: { id: ChromaticColorTheme; label: string; color: string }[] = [
    { id: 'black-blue', label: 'Black & Blue 3D', color: 'bg-gradient-to-r from-black via-blue-900 to-cyan-400' },
    { id: 'chromatic-shift', label: 'Chromatic Multi-Shift', color: 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-500' },
    { id: 'green', label: 'Neon Green', color: 'bg-emerald-400' },
    { id: 'white', label: 'Cyber White', color: 'bg-white' },
    { id: 'blue', label: 'Electric Blue', color: 'bg-cyan-400' },
    { id: 'black', label: 'Obsidian Black', color: 'bg-zinc-800' },
    { id: 'purple', label: 'Ultra Purple', color: 'bg-purple-500' },
    { id: 'cyber', label: 'Neon Cyber Pink', color: 'bg-pink-500' },
  ];

  return (
    <div id="launcher-3d-widget-root" className="fixed bottom-20 right-2 sm:right-4 z-40 select-none max-w-[calc(100vw-1rem)] box-border">
      {/* Floating 3D Launcher Orb (Minimized Mode) */}
      {!isExpanded ? (
        <div className="relative group">
          {/* Pulsing Aura if background process is active */}
          {isProcessing && (
            <span className="absolute -inset-2 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="relative p-2 rounded-3xl bg-zinc-950/90 border-2 border-purple-500/70 hover:border-cyan-400 shadow-[0_0_30px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-all cursor-pointer flex items-center justify-center backdrop-blur-xl"
            title="Open 3D Launcher & Process Widget"
          >
            <Cyber3DIcon
              size={56}
              isProcessing={isProcessing}
              processType={processType}
              processProgress={processProgress}
              theme={selectedTheme}
              showRings={true}
              showParticles={false}
            />

            {/* Quick Process Badge */}
            {isProcessing && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[9px] font-mono shadow-md animate-pulse">
                {processProgress}%
              </span>
            )}
          </button>
        </div>
      ) : (
        /* ========================================================================= */
        /* EXPANDED 3D LAUNCHER CONTROL HUD */
        /* ========================================================================= */
        <div className="relative w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm rounded-3xl bg-zinc-950/95 border border-purple-500/60 shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-2xl overflow-hidden flex flex-col animate-fade-in box-border mx-auto">
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-900/90 border-b border-purple-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-black text-white tracking-wide uppercase font-mono">
                Welcome NovaGrand Pro
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenSplash}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/30 to-purple-600/30 hover:from-cyan-500/50 hover:to-purple-600/50 text-cyan-300 text-[10px] font-bold border border-cyan-400/50 flex items-center gap-1 cursor-pointer"
                title="Launch Welcome NovaGrand Pro Screen"
              >
                <Play className="w-3 h-3 text-amber-300" />
                <span>Welcome Pro</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Success Toast */}
          {processSuccessToast && (
            <div className="px-4 py-2 bg-emerald-950 text-emerald-300 text-xs font-bold border-b border-emerald-800 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{processSuccessToast}</span>
            </div>
          )}

          {/* Main 3D Icon Stage */}
          <div className="p-5 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900/80 via-black to-zinc-950 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* 3D Icon with Continuous 360 Rotation & Multi-Chromatic Color Shift */}
            <Cyber3DIcon
              size="lg"
              isProcessing={isProcessing}
              processType={processType}
              processProgress={processProgress}
              processLabel={processLabel}
              theme={selectedTheme}
              interactive={true}
              showRings={true}
              showParticles={true}
            />

            <div className="text-center mt-3 space-y-0.5">
              <p className="text-xs font-bold text-white tracking-wide">
                NovaGrand 3D Continuous Orbit
              </p>
              <p className="text-[10px] text-purple-300/80 font-mono">
                {isProcessing
                  ? `⚡ Active Process: ${downloadSpeed}`
                  : 'Drag to tilt in 3D · 360° Continuous Spin'}
              </p>
            </div>
          </div>

          {/* Active Process Progress Indicator if Running */}
          {isProcessing && (
            <div className="p-3.5 bg-purple-950/80 border-y border-purple-500/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-cyan-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  {processLabel}
                </span>
                <span className="text-emerald-400 font-mono">{processProgress}%</span>
              </div>

              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-purple-700/50">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-500 transition-all duration-150"
                  style={{ width: `${processProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Speed: {downloadSpeed}</span>
                <span>Latency: 18ms</span>
              </div>
            </div>
          )}

          {/* Controls: Color Shifter & Background Process Triggers */}
          <div className="p-4 space-y-4 max-h-[38vh] overflow-y-auto">
            {/* 1. Chromatic Color Palette Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-purple-400" />
                Color Transition Engine
              </span>

              <div className="grid grid-cols-4 gap-1.5">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedTheme(opt.id)}
                    className={`p-1.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedTheme === opt.id
                        ? 'border-fuchsia-400 bg-purple-950 text-white shadow-md shadow-purple-600/30'
                        : 'border-purple-950 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${opt.color} shadow-sm`} />
                    <span className="truncate w-full text-center text-[9px]">
                      {opt.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Process Simulation Triggers (Downloading / Installing) */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Download className="w-3 h-3 text-cyan-400" />
                Background Process Simulators
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    startBackgroundProcess('Downloading Agora 4K Shaders', 'downloading', 48.5)
                  }
                  className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-purple-900/60 hover:border-cyan-400 text-left transition-all cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <Download className="w-3.5 h-3.5" />
                    <span>Agora 4K Shader</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">48.5 MB · Download</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    startBackgroundProcess('Installing 3D Hologram Core', 'installing', 64.2)
                  }
                  className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-purple-900/60 hover:border-emerald-400 text-left transition-all cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Hologram Core</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">64.2 MB · Install</span>
                </button>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  if (onOpenVideoReels) onOpenVideoReels();
                }}
                className="p-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-200 text-[10px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <Film className="w-3.5 h-3.5 text-cyan-300" />
                <span>5 Videos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenCallModule();
                }}
                className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800/60 text-purple-200 text-[10px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-cyan-300" />
                <span>Live Call</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenMessages();
                }}
                className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800/60 text-purple-200 text-[10px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-pink-300" />
                <span>Chat Lock</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenAdMobReward();
                }}
                className="p-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800/60 text-amber-300 text-[10px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>+10 Coins</span>
              </button>

              {onOpenLuckySpin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenLuckySpin();
                  }}
                  className="p-2 rounded-xl bg-gradient-to-tr from-purple-900 to-fuchsia-900 hover:from-purple-800 hover:to-fuchsia-800 border border-amber-400/60 text-amber-300 text-[10px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Lucky Spin</span>
                </button>
              )}

              {onOpenAppUpdate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenAppUpdate();
                  }}
                  className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-fuchsia-300 text-[10px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Update v2.6.4</span>
                </button>
              )}

              {onOpenTrafficWidget && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenTrafficWidget();
                  }}
                  className="p-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-[10px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Traffic Meter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
