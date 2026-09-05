import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  CheckCircle2,
  RefreshCw,
  Zap,
  ShieldCheck,
  Award,
  Layers,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { UserProfile } from '../types';
import { HighValueUpdateAdBurstModal } from './HighValueUpdateAdBurstModal';

interface AppUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onCoinsRewardCredited: (newCoins: number) => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCoinsRewardCredited,
}) => {
  const [currentVersion, setCurrentVersion] = useState<string>('v2.6.0 (Build 2026.7)');
  const targetVersion = 'v2.6.4 Ultra-Neon Pro (Build 2026.8)';
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [updateStepText, setUpdateStepText] = useState<string>('');
  const [isUpdateComplete, setIsUpdateComplete] = useState<boolean>(false);
  const [isAdBurstOpen, setIsAdBurstOpen] = useState<boolean>(false);

  const releaseHighlights = [
    {
      icon: '🎡',
      title: 'Daily Lucky Spin & Win Wheel',
      desc: '1 Free daily spin with Jackpot 1,000 coins & Rewarded Video ad multipliers.',
    },
    {
      icon: '⚡',
      title: 'High-Yield Traffic & Bandwidth Monetization',
      desc: 'Monetize streaming data at ₹12.50/GB with automatic user coin drops.',
    },
    {
      icon: '🔒',
      title: 'In-App App Lock Security Suite',
      desc: 'Biometric fingerprint, Face ID, 4-digit PIN, and 3x3 pattern lock protection.',
    },
    {
      icon: '🚀',
      title: '4K Opus Audio & High-eCPM Update Ad Burst',
      desc: 'Sub-20ms audio latency direct dialing with high-value monetization waves.',
    },
  ];

  const handleStartUpdate = () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    setUpdateStepText('Connecting to Global Fast CDN Mirror...');

    const interval = setInterval(() => {
      setUpdateProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUpdating(false);
          setIsUpdateComplete(true);
          setCurrentVersion(targetVersion);
          // Trigger High-Value Update Ad Burst immediately!
          setIsAdBurstOpen(true);
          return 100;
        }

        const next = prev + 5;
        if (next < 35) {
          setUpdateStepText('Downloading OTA Neon Package (42.8 MB)...');
        } else if (next < 75) {
          setUpdateStepText('Verifying SHA-256 Cryptographic Checksum...');
        } else if (next < 95) {
          setUpdateStepText('Applying Ultra-Neon Calling & Monetization Engine Patches...');
        } else {
          setUpdateStepText('Finalizing Installation & Boosting eCPM...');
        }
        return next;
      });
    }, 180);
  };

  if (!isOpen) return null;

  return (
    <div
      id="app-update-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/60 shadow-[0_0_60px_rgba(168,85,247,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-900/90 border-b border-purple-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-600/50 text-fuchsia-400 flex items-center justify-center shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instagrand Software Update</h3>
              <p className="text-xs text-purple-300/80 font-mono">OTA Software & Monetization Suite</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="p-2 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Version Status Box */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-purple-900/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400">Current Installed Version</span>
              <p className="text-xs font-mono font-bold text-zinc-300">{currentVersion}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-purple-400 font-semibold">Latest Release Available</span>
              <p className="text-xs font-mono font-bold text-fuchsia-300">{targetVersion}</p>
            </div>
          </div>

          {/* Release Highlights */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              What's New in {targetVersion}
            </h4>
            <div className="space-y-2">
              {releaseHighlights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-purple-950/30 border border-purple-900/40 flex items-start gap-3"
                >
                  <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.title}</h5>
                    <p className="text-[11px] text-purple-200/70 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Value Monetization Wave Notice */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-zinc-950 border border-amber-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-amber-300">High-eCPM Update Wave Bonus:</span>
              <p className="text-[11px] text-zinc-300">
                Updating unlocks an immediate <strong className="text-white">+50 Coins</strong> milestone reward via the high-value update ad burst!
              </p>
            </div>
          </div>

          {/* Progress Bar (during updating) */}
          {isUpdating && (
            <div className="space-y-2 p-4 rounded-2xl bg-zinc-900/90 border border-purple-600/50 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-fuchsia-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                  {updateStepText}
                </span>
                <span className="text-white font-bold">{updateProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-400 transition-all duration-200 shadow-[0_0_10px_#d946ef]"
                  style={{ width: `${updateProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {!isUpdating && !isUpdateComplete && (
              <button
                type="button"
                onClick={handleStartUpdate}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-500 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-sm tracking-wide shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD & INSTALL UPDATE (42.8 MB)</span>
              </button>
            )}

            {isUpdateComplete && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update successfully installed! High-Value Ad Burst Triggered.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdBurstOpen(true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-fuchsia-600 text-black font-black text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>VIEW HIGH-VALUE UPDATE AD BURST (+50 COINS)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High-Value Update Ad Burst Modal */}
      <HighValueUpdateAdBurstModal
        isOpen={isAdBurstOpen}
        onClose={() => {
          setIsAdBurstOpen(false);
          onClose();
        }}
        currentUser={currentUser}
        versionUpdatedTo={targetVersion}
        onCoinsRewardCredited={onCoinsRewardCredited}
      />
    </div>
  );
};
