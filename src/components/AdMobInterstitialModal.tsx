import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Video,
  Radio,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ADMOB_CONFIG } from '../lib/admobConfig';
import { shouldBlockAds } from '../lib/adminAdPolicy';
import { UserProfile } from '../types';

interface AdMobInterstitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetActionName?: string;
  currentUser?: UserProfile | null;
  onProceed: () => void;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  isOpen,
  onClose,
  targetActionName = 'Call Live Session',
  currentUser,
  onProceed,
}) => {
  const isBlockedAdmin = shouldBlockAds(currentUser);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (isBlockedAdmin) {
        // Admin restriction: Auto proceed immediately with 0 ad render
        onClose();
        onProceed();
        return;
      }
      setSecondsRemaining(5);
      setCanSkip(false);
    }
  }, [isOpen, isBlockedAdmin]);

  useEffect(() => {
    if (!isOpen || isBlockedAdmin) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isBlockedAdmin]);

  const handleSkipOrProceed = () => {
    onClose();
    onProceed();
  };

  if (!isOpen || isBlockedAdmin) return null;

  return (
    <div
      id="admob-interstitial-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-zinc-950 border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden flex flex-col">
        {/* Top Ad Identification & Skip Counter Header */}
        <div className="px-4 py-3 bg-zinc-900/90 border-b border-purple-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-black text-[10px] tracking-wider uppercase">
              Ad
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              Google AdMob Interstitial
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canSkip ? (
              <button
                type="button"
                onClick={handleSkipOrProceed}
                className="px-3 py-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-purple-600/30"
              >
                <span>Continue to {targetActionName}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-[11px] font-mono font-semibold text-zinc-300 border border-purple-900/60">
                Skip in {secondsRemaining}s
              </div>
            )}

            {canSkip && (
              <button
                type="button"
                onClick={handleSkipOrProceed}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* High-eCPM Interstitial Showcase */}
        <div className="p-6 space-y-5 text-center relative overflow-hidden bg-gradient-to-b from-zinc-950 via-purple-950/40 to-black">
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-600 p-0.5 shadow-xl shadow-purple-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
              <Cpu className="w-10 h-10 text-cyan-300 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800/60">
              Sponsored Technology
            </span>
            <h3 className="text-xl font-black text-white">
              Next-Gen Agora & WebRTC Neural Audio
            </h3>
            <p className="text-xs text-zinc-300 max-w-xs mx-auto leading-relaxed">
              Experience lossless 48kHz Opus streams, dynamic echo cancellation, and real-time AI noise filtering on Instagrand VIP.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-2 text-left pt-2">
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-purple-900/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-300">
                <Radio className="w-3.5 h-3.5 text-cyan-300" />
                <span>4K Live Calls</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Ultra-low latency sub-150ms</p>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-purple-900/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Coin Rewards</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Earn 10 coins per video</p>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="https://ai.google.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/60 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group"
            >
              <span>Explore Sponsor Website</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <button
              type="button"
              onClick={handleSkipOrProceed}
              disabled={!canSkip}
              className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                canSkip
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-800'
              }`}
            >
              {canSkip ? `Continue to ${targetActionName}` : `Please wait ${secondsRemaining}s...`}
            </button>
          </div>
        </div>

        {/* AdMob Footer */}
        <div className="p-2 bg-black text-center border-t border-purple-900/40">
          <span className="text-[10px] text-zinc-500 font-mono">
            Google AdMob Interstitial · Unit ID: {ADMOB_CONFIG.interstitialAdUnitId.slice(0, 22)}...
          </span>
        </div>
      </div>
    </div>
  );
};
