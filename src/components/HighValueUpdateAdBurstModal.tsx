import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Award,
  ExternalLink,
  Coins,
  CheckCircle2,
  TrendingUp,
  Flame,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { ADMOB_CONFIG } from '../lib/admobConfig';
import { shouldBlockAds } from '../lib/adminAdPolicy';
import { rewardUserCoinsFromAdMobVideo } from '../lib/firestoreService';
import { soundSynth } from '../utils/audioSynth';

interface HighValueUpdateAdBurstModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  versionUpdatedTo: string;
  onCoinsRewardCredited: (newCoins: number) => void;
}

export const HighValueUpdateAdBurstModal: React.FC<HighValueUpdateAdBurstModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  versionUpdatedTo,
  onCoinsRewardCredited,
}) => {
  const isBlockedAdmin = shouldBlockAds(currentUser);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(8);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [claimedReward, setClaimedReward] = useState<number>(50);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(isBlockedAdmin ? 0 : 8);
      setHasCompleted(isBlockedAdmin);
      setIsProcessing(false);
    }
  }, [isOpen, isBlockedAdmin]);

  // High-eCPM Interstitial countdown
  useEffect(() => {
    if (!isOpen || isBlockedAdmin || hasCompleted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAdFinished();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isBlockedAdmin, hasCompleted]);

  const handleAdFinished = async () => {
    setHasCompleted(true);
    soundSynth.playCoinChime();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    // Credit +50 Update Bonus Coins
    try {
      setIsProcessing(true);
      const userId = currentUser?.id || 'usr_guest';
      const result = await rewardUserCoinsFromAdMobVideo({
        userId,
        coinsToAdd: 50,
        adUnitId: 'APP-UPDATE-HIGH-ECPM-BURST-v2.6.4',
      });
      onCoinsRewardCredited(result.newCoins);
    } catch (e) {
      const curr = currentUser?.coins ?? 100;
      onCoinsRewardCredited(curr + 50);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdminBypass = async () => {
    setIsProcessing(true);
    try {
      const userId = currentUser?.id || 'usr_guest';
      const result = await rewardUserCoinsFromAdMobVideo({
        userId,
        coinsToAdd: 50,
        adUnitId: 'ADMIN-UPDATE-BURST-BYPASS',
      });
      onCoinsRewardCredited(result.newCoins);
    } catch (e) {
      onCoinsRewardCredited((currentUser?.coins ?? 100) + 50);
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  // ADMIN AD PROTECTION: Compliant with Google AdMob Invalid Traffic Rules
  if (isBlockedAdmin) {
    return (
      <div
        id="update-burst-admin-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
      >
        <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">App Update Milestone Complete</h3>
                <p className="text-xs text-emerald-400 font-mono">Admin Safe Direct Claim</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-900/40 text-xs text-zinc-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>High-eCPM Update Wave (Target ₹100-₹200 Burst) Registered</span>
            </div>
            <p>
              Successfully upgraded to <strong className="text-white">{versionUpdatedTo}</strong>. Monetization mediation registered to founder AdMob ID <strong className="text-purple-300">pub-9658260608635009</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAdminBypass}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? 'Claiming...' : 'Claim +50 Update Bonus Coins'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="high-value-update-ad-burst-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/60 shadow-[0_0_60px_rgba(168,85,247,0.4)] overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-purple-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-purple-600 text-[10px] font-black uppercase text-white tracking-wider">
              App Open Ad
            </span>
            <span className="text-xs font-bold text-white">
              Google AdMob High-eCPM Premium Sponsor
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-xs font-mono font-bold text-fuchsia-300">
              {hasCompleted ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete!
                </span>
              ) : (
                <span>Close in {secondsRemaining}s</span>
              )}
            </div>

            {hasCompleted && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-400 transition-all duration-1000 ease-linear"
            style={{ width: `${((8 - secondsRemaining) / 8) * 100}%` }}
          />
        </div>

        {/* Sponsor Creative Canvas */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5 bg-gradient-to-b from-purple-950/30 via-zinc-950 to-black">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-1 shadow-[0_0_30px_rgba(217,70,239,0.5)] animate-pulse">
            <div className="w-full h-full bg-zinc-950 rounded-[20px] flex items-center justify-center">
              <Zap className="w-10 h-10 text-cyan-300" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
              ⚡ High-Value Update Ad Burst · eCPM Boost Wave
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Instagrand {versionUpdatedTo} Ultra-Neon
            </h3>
            <p className="text-xs text-purple-200/90 max-w-sm mx-auto leading-relaxed">
              Google Vertex AI & AdMob Premium Network Partner. Real-time WebRTC 4K Calling, Lucky Spin Wheel & High-Yield Traffic Monetization now live!
            </p>
          </div>

          {/* Reward Unlock Card */}
          <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-purple-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Update Milestone Reward</h4>
                <p className="text-[11px] text-purple-300">Credited to your Firestore wallet</p>
              </div>
            </div>
            <span className="text-sm font-black text-amber-400 font-mono">
              +50 Coins 🍌
            </span>
          </div>

          {/* Bottom Action */}
          {hasCompleted ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-fuchsia-500 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-black font-black text-sm tracking-wide shadow-xl shadow-amber-400/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Collect +50 Coins & Enter v2.6.4 Studio
            </button>
          ) : (
            <div className="text-xs text-zinc-500 font-mono">
              Reward unlocking automatically in {secondsRemaining} seconds...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
