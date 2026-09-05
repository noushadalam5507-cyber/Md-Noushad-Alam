import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Zap, Video, Volume2, ArrowRight, Play, CheckCircle2, User, Coins } from 'lucide-react';
import { Cyber3DIcon } from './Cyber3DIcon';
import { UserProfile } from '../types';

interface InAppSplashScreenProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
}

export const InAppSplashScreen: React.FC<InAppSplashScreenProps> = ({ isOpen, onClose, currentUser }) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  const bootSteps = [
    'Initializing NovaGrand 3D Multi-Color Hologram...',
    'Synchronizing Google Account & Firebase Cloud...',
    'Connecting Agora RTC 4K Video Calling Engine...',
    'Activating Reels Music & Creator Monetization...',
    'Welcome to NovaGrand Pro!',
  ];

  useEffect(() => {
    if (!isOpen) return;

    setProgress(0);
    setCurrentStepIndex(0);
    setIsDone(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(interval);
          setIsDone(true);
          return 100;
        }

        // Map step index
        const step = Math.min(
          bootSteps.length - 1,
          Math.floor((next / 100) * bootSteps.length)
        );
        setCurrentStepIndex(step);
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="in-app-splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in select-none overflow-y-auto"
    >
      {/* Background Cyber Glow Fields (Blue + Purple + Black) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-purple-600/25 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Interactive Splash Hub */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center text-center space-y-5 sm:space-y-6 box-border px-2 my-auto">
        {/* Top App Identity Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-cyan-400/50 text-cyan-300 text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] max-w-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="font-bold">WELCOME NOVAGRAND PRO</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
        </div>

        {/* The 3D Multi-Chromatic Rotating Icon (One side WELCOME, Other side NOVAGRAND PRO) */}
        <div className="py-2 w-full flex items-center justify-center overflow-visible">
          <Cyber3DIcon
            size="hero"
            isProcessing={!isDone}
            processType="installing"
            processProgress={progress}
            processLabel={bootSteps[currentStepIndex]}
            theme="chromatic-shift"
            interactive={true}
            showRings={true}
            showParticles={true}
          />
        </div>

        {/* Title & Tagline: Welcome NovaGrand Pro */}
        <div className="space-y-1.5 max-w-sm">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2 flex-wrap">
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">Welcome</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
              NovaGrand Pro
            </span>
          </h1>
          <p className="text-xs text-cyan-200/90 font-medium leading-relaxed">
            4K Video Live Calls · Reels Studio with Music · AdMob Monetization · Direct DMs
          </p>
        </div>

        {/* Personalized User Welcome Card if logged in */}
        {currentUser && (
          <div className="w-full p-3 rounded-2xl bg-zinc-900/90 border border-purple-500/50 shadow-lg flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}&backgroundColor=180a30`}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border border-cyan-400/60 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-mono font-bold">
                    @{currentUser.username}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate">
                  Account Active · Ready to Launch
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-black shrink-0">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentUser.coins || 100}</span>
            </div>
          </div>
        )}

        {/* System Boot Progress Bar */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5 truncate">
              <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{bootSteps[currentStepIndex]}</span>
            </span>
            <span className="text-cyan-300 font-bold ml-2 shrink-0">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-purple-900/60 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 via-purple-500 to-pink-500 transition-all duration-150 shadow-[0_0_15px_#00f0ff]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Enter Home Screen CTA Button -> "Welcome NovaGrand Pro" */}
        <div className="w-full pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-white hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Welcome NovaGrand Pro · Enter Home Screen</span>
            <ArrowRight className="w-4 h-4 text-white animate-bounce" />
          </button>
        </div>
      </div>
    </div>
  );
};

