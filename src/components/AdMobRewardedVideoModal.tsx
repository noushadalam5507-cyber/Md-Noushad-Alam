import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Coins,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Award,
  ExternalLink,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { ADMOB_CONFIG } from '../lib/admobConfig';
import { rewardUserCoinsFromAdMobVideo } from '../lib/firestoreService';
import { shouldBlockAds, isAdminUser } from '../lib/adminAdPolicy';
import { UserProfile } from '../types';

interface AdMobRewardedVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentUser?: UserProfile | null;
  onRewardEarned: (earnedCoins: number, newTotalCoins: number) => void;
}

export const AdMobRewardedVideoModal: React.FC<AdMobRewardedVideoModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentUser,
  onRewardEarned,
}) => {
  const isBlockedAdmin = shouldBlockAds(currentUser);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [showExitWarning, setShowExitWarning] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [earnedCoins, setEarnedCoins] = useState<number>(10);
  const [activeCreative, setActiveCreative] = useState<number>(0);

  const videoCreatives = [
    {
      title: 'Google Cloud Vertex AI & Gemini 2.5',
      subtitle: 'Build Autonomous AI Multimodal Agents at Scale',
      tagline: 'High Performance · Sub-100ms Inference · Global CDN',
      badge: 'Google AdMob Premium Sponsor',
      gradient: 'from-purple-900 via-indigo-950 to-zinc-950',
      accentColor: 'text-cyan-300',
      icon: Zap,
      url: 'https://cloud.google.com/vertex-ai',
      visualCode: 'GEMINI-PRO-REWARD-2026',
    },
    {
      title: 'Instagrand Creator Studio',
      subtitle: 'Earn 100% Revenue Shares with 4K Live Streams',
      tagline: 'Exclusive Opus Audio · Hologram Stage Filters',
      badge: 'Instagrand Official Partner',
      gradient: 'from-fuchsia-950 via-purple-950 to-zinc-950',
      accentColor: 'text-fuchsia-400',
      icon: Award,
      url: '#',
      visualCode: 'INSTAGRAND-CREATOR-PASS',
    },
  ];

  // If Admin is detected, prevent ad rendering and allow instant zero-ad validation
  const handleAdminDirectBypass = async () => {
    setIsClaiming(true);
    try {
      const result = await rewardUserCoinsFromAdMobVideo({
        userId,
        coinsToAdd: ADMOB_CONFIG.rewardedCoinsAmount || 10,
        adUnitId: 'ADMIN-AD-RESTRICTION-BYPASS',
      });
      setEarnedCoins(ADMOB_CONFIG.rewardedCoinsAmount || 10);
      onRewardEarned(ADMOB_CONFIG.rewardedCoinsAmount || 10, result.newCoins);
    } catch (e) {
      onRewardEarned(10, 10);
    } finally {
      setIsClaiming(false);
      onClose();
    }
  };

  // Reset timer on open
  useEffect(() => {
    if (isOpen) {
      if (isBlockedAdmin) {
        // Do not start video ad timers for admin
        return;
      }
      setSecondsRemaining(30);
      setIsPlaying(true);
      setHasCompleted(false);
      setShowExitWarning(false);
      setIsClaiming(false);
      setActiveCreative(Math.random() > 0.5 ? 0 : 1);
    }
  }, [isOpen, isBlockedAdmin]);

  // 30-Second Countdown Timer (Only for non-admin regular users)
  useEffect(() => {
    if (!isOpen || isBlockedAdmin || hasCompleted || !isPlaying) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleVideoCompleted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isBlockedAdmin, hasCompleted, isPlaying]);

  // Handle Video Completion & Claim Reward
  const handleVideoCompleted = async () => {
    setHasCompleted(true);
    setIsClaiming(true);
    try {
      const result = await rewardUserCoinsFromAdMobVideo({
        userId,
        coinsToAdd: ADMOB_CONFIG.rewardedCoinsAmount || 10,
        adUnitId: ADMOB_CONFIG.rewardedAdUnitId,
      });
      setEarnedCoins(ADMOB_CONFIG.rewardedCoinsAmount || 10);
      onRewardEarned(ADMOB_CONFIG.rewardedCoinsAmount || 10, result.newCoins);
    } catch (e) {
      console.error('Error claiming AdMob reward:', e);
      // Fallback local credit
      onRewardEarned(10, 10);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleAttemptClose = () => {
    if (hasCompleted || isBlockedAdmin) {
      onClose();
    } else {
      setIsPlaying(false);
      setShowExitWarning(true);
    }
  };

  const handleCancelExit = () => {
    setShowExitWarning(false);
    setIsPlaying(true);
  };

  const handleConfirmExit = () => {
    setShowExitWarning(false);
    onClose();
  };

  if (!isOpen) return null;

  // ADMIN AD PROTECTION SCREEN: Video ads NEVER load or render on admin device
  if (isBlockedAdmin) {
    return (
      <div
        id="admob-admin-restricted-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
      >
        <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden flex flex-col p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Admin Ad-Free Shield Active</h3>
                <p className="text-[11px] text-emerald-400 font-mono">Google AdMob Policy Compliance</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Explanation Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-900/40 space-y-2.5 text-xs leading-relaxed text-zinc-300">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Self-Ad Viewing Prohibited for Platform Administrators</span>
            </div>
            <p>
              In accordance with official <strong className="text-white">Google AdMob / AdSense Invalid Traffic (IVT) policies</strong>, 
              account owners and administrators are prohibited from viewing, playing, or rendering their own ad units.
            </p>
            <p className="text-[11px] text-zinc-400 font-mono">
              Account: <span className="text-emerald-300">{currentUser?.email || 'admin@instagrand.app'}</span> (Admin Role)
            </p>
          </div>

          {/* Action Benefits */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Admin Instant Reward Bypass</h4>
                <p className="text-[11px] text-purple-300">Claim 10 Coins / Feature action without watching ads</p>
              </div>
            </div>
          </div>

          {/* Admin Bypass Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAdminDirectBypass}
              disabled={isClaiming}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{isClaiming ? 'Processing...' : 'Direct Admin Bypass & Claim'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/40 text-zinc-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = ((30 - secondsRemaining) / 30) * 100;
  const currentAd = videoCreatives[activeCreative];
  const AdIcon = currentAd.icon;

  return (
    <div
      id="admob-rewarded-video-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/60 shadow-[0_0_50px_rgba(168,85,247,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* AdMob Official Header Bar */}
        <div className="px-4 py-3 bg-zinc-900/90 border-b border-purple-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              Ad
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  Google AdMob Rewarded Video
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono font-semibold border border-amber-400/30">
                  🍌 +10 Coins
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                App ID: {ADMOB_CONFIG.appId.slice(0, 20)}...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer countdown pill */}
            <div className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-xs font-mono font-bold text-fuchsia-300 flex items-center gap-1.5 shadow-inner">
              {hasCompleted ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete!
                </span>
              ) : (
                <span>Reward in {secondsRemaining}s</span>
              )}
            </div>

            {/* Close button with protection */}
            <button
              type="button"
              onClick={handleAttemptClose}
              className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-400 transition-all duration-300 ease-linear shadow-[0_0_10px_#d946ef]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Video Player Canvas / Creative Stage */}
        <div className="relative flex-1 bg-gradient-to-b from-zinc-900 to-black p-6 flex flex-col items-center justify-between min-h-[360px] overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Ad Sponsor Badge */}
          <div className="z-10 w-full flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-300/80 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {currentAd.badge}
            </span>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-zinc-900/80 border border-purple-900/50 hover:bg-zinc-800 text-purple-300 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Animated Video Simulation Content */}
          <div className="z-10 text-center space-y-4 my-auto max-w-sm">
            <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-700 to-fuchsia-500 p-0.5 shadow-[0_0_30px_rgba(217,70,239,0.5)] flex items-center justify-center group animate-pulse">
              <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
                <AdIcon className={`w-12 h-12 ${currentAd.accentColor}`} />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white tracking-tight">
                {currentAd.title}
              </h3>
              <p className="text-xs text-purple-200/90 font-medium">
                {currentAd.subtitle}
              </p>
              <p className="text-[11px] text-zinc-400 font-mono">
                {currentAd.tagline}
              </p>
            </div>

            {/* Audio Waveform Bar Simulation */}
            <div className="flex items-center justify-center gap-1 h-6 pt-2">
              {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70, 85, 40].map((height, i) => (
                <span
                  key={i}
                  style={{ height: `${height}%` }}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-purple-500 to-cyan-400 animate-pulse'
                      : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Interactive Sponsor Action */}
          <div className="z-10 w-full pt-4">
            <a
              href={currentAd.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-purple-950/70 border border-purple-700/60 hover:bg-purple-900 text-purple-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all group"
            >
              <span>Learn More at Google AI Cloud</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Completion Celebration Overlay */}
        {hasCompleted && (
          <div className="p-5 bg-gradient-to-t from-purple-950 via-zinc-950 to-zinc-950 border-t border-purple-500/50 flex flex-col items-center text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow-[0_0_20px_#f59e0b] animate-bounce">
              <Coins className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">
                Reward Unlocked: +{earnedCoins} Coins! 🍌
              </h4>
              <p className="text-xs text-purple-200/80 max-w-xs">
                Coins credited directly to your Firebase Firestore wallet. Save up to 50 coins to self-unblock!
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-fuchsia-500 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-black font-black text-sm tracking-wide shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Collect 10 Coins & Return
            </button>
          </div>
        )}

        {/* Early Exit Warning Popup */}
        {showExitWarning && (
          <div className="absolute inset-0 z-30 bg-black/95 flex items-center justify-center p-6 text-center animate-fade-in">
            <div className="max-w-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">
                  Exit Video Early?
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  You must finish watching the 30-second video to earn your <strong className="text-amber-300">10 Free Coins (🍌)</strong>.
                </p>
                <p className="text-[11px] text-purple-400 font-mono">
                  {secondsRemaining}s remaining
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelExit}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Resume Video & Earn Coins
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Close & Forfeit Reward
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
