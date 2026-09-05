import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Layers
} from 'lucide-react';

interface InstallAppPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppPinModal: React.FC<InstallAppPinModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed or opened as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // If already installed or browser hasn't fired beforeinstallprompt
      if (!isIOS) {
        alert('To add NovaGrand to your home screen:\n\n1. Tap the 3 dots (⋮) in your Chrome browser menu.\n2. Tap "Install app" or "Add to Home screen".');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-purple-800/60 rounded-3xl p-6 shadow-2xl shadow-purple-950/60 text-white overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-purple-600/30 via-cyan-500/20 to-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Mobile App Pin & Home Icon</span>
          </div>

          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-cyan-300">
            Pin NovaGrand to Home Screen
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Get instant 1-tap launcher access, full-screen 4K calling, and offline reels streaming.
          </p>
        </div>

        {/* 3D App Pin Icon Showcase */}
        <div className="my-6 flex flex-col items-center">
          <div className="relative group">
            {/* Ambient Multi-color Neon Halo */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600 via-cyan-400 to-emerald-400 rounded-3xl opacity-50 blur-xl group-hover:opacity-75 transition-opacity" />
            
            {/* The Official 3D Icon */}
            <div className="relative w-28 h-28 rounded-3xl bg-black border-2 border-purple-400/80 p-1.5 shadow-2xl overflow-hidden flex items-center justify-center">
              <img
                src="/app-icon.png"
                alt="NovaGrand 3D Icon"
                className="w-full h-full object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
              {/* Glossy Overlay Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none rounded-2xl" />
            </div>

            {/* Verified Badge Icon Pin */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black p-1.5 rounded-full shadow-lg border-2 border-black">
              <CheckCircle2 className="w-4 h-4 text-black font-black" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Neon Purple
            </span>
            <span className="flex items-center gap-1 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Electric Blue
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Neon Green
            </span>
          </div>
        </div>

        {/* Status / Actions */}
        {installSuccess || isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-emerald-300">NovaGrand is Installed & Pinned!</p>
            <p className="text-xs text-zinc-400">
              Check your mobile home screen or app drawer to launch in full 4K standalone mode.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Step-by-Step Guide */
          <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/60 space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Easy 2-Step Installation for iPhone & iPad:</span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded-full bg-purple-900 border border-purple-700 text-purple-200 font-bold text-[11px]">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button (box with upward arrow <Share2 className="w-3.5 h-3.5 inline text-cyan-300" />) in your Safari bottom bar.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded-full bg-purple-900 border border-purple-700 text-purple-200 font-bold text-[11px]">
                  2
                </span>
                <span>
                  Scroll down and select <strong className="text-white">"Add to Home Screen"</strong> with the official 3D NovaGrand pin icon.
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Android / Desktop 1-Tap Trigger */
          <div className="space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{deferredPrompt ? 'Add to Mobile Home Screen Now' : 'Pin to Home Screen (1-Tap)'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Works automatically on Android Chrome, Samsung Internet, Edge, and iOS Safari.
              </span>
            </div>
          </div>
        )}

        {/* Universal APK & Expo Section */}
        <div className="mt-4 pt-4 border-t border-purple-900/40 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Target APK Package:</span>
            <span className="font-mono text-purple-300 font-bold">com.instagrand.app</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-800 text-cyan-300 text-[10px] font-mono">
            Universal ~50MB
          </span>
        </div>
      </div>
    </div>
  );
};
