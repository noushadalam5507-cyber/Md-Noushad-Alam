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
  ChevronRight,
  TrendingUp,
  Clock,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ADMOB_CONFIG } from '../lib/admobConfig';
import { rewardUserCoinsFromAdMobVideo } from '../lib/firestoreService';
import { shouldBlockAds } from '../lib/adminAdPolicy';
import { UserProfile } from '../types';

interface SmartReelAdBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  reelsWatchedCount: number;
  currentUser: UserProfile | null;
  onRewardEarned: (earnedCoins: number, newTotalCoins: number) => void;
  onProceedToNextReel: () => void;
}

export const SPONSORED_REEL_CREATIVES = [
  {
    id: 'ad-gemini',
    title: 'Google Cloud Gemini 2.5 & Vertex AI',
    subtitle: 'Build Ultra-Fast Multimodal AI Applications at Global Scale',
    tagline: 'Google AdMob Premium Sponsor · High eCPM Ad Break',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    badge: 'Sponsored Ad · 1 per 5 Reels',
    ctaText: 'Try Gemini API on Google AI Studio',
    ctaUrl: 'https://ai.google.dev',
    rewardCoins: 10,
    accentColor: 'from-purple-600 via-indigo-600 to-cyan-500',
  },
  {
    id: 'ad-instagrand',
    title: 'Instagrand Pro Creator Studio 2026',
    subtitle: 'Earn 100% Ad Revenue Share on 4K Reels & Music Streams',
    tagline: 'Direct UPI, PayPal & Crypto Payouts with Zero Fees',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    badge: 'Official Platform Sponsor',
    ctaText: 'Claim Creator Studio Pass',
    ctaUrl: '#',
    rewardCoins: 10,
    accentColor: 'from-amber-500 via-fuchsia-600 to-pink-600',
  },
  {
    id: 'ad-opus',
    title: '48kHz Neural Opus Spatial Sound System',
    subtitle: 'Crystal Clear Lossless Audio on Low Data Bandwidth',
    tagline: 'Optimized for Android 5G & iOS Dolby Atmos',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    badge: 'Hardware Partner Sponsor',
    ctaText: 'Experience Lossless 320k Sound',
    ctaUrl: '#',
    rewardCoins: 10,
    accentColor: 'from-cyan-500 via-blue-600 to-purple-600',
  },
];

export const SmartReelAdBreakModal: React.FC<SmartReelAdBreakModalProps> = ({
  isOpen,
  onClose,
  reelsWatchedCount,
  currentUser,
  onRewardEarned,
  onProceedToNextReel,
}) => {
  const isBlockedAdmin = shouldBlockAds(currentUser);
  const [activeAdIndex, setActiveAdIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(6);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentAd = SPONSORED_REEL_CREATIVES[activeAdIndex % SPONSORED_REEL_CREATIVES.length];

  // Initialize on open
  useEffect(() => {
    if (isOpen) {
      if (isBlockedAdmin) {
        // Admin protection: bypass immediately
        onClose();
        onProceedToNextReel();
        return;
      }

      setSecondsRemaining(6);
      setCanSkip(false);
      setIsPlaying(true);
      setIsClaimed(false);
      setIsProcessing(false);
      setActiveAdIndex((prev) => (prev + 1) % SPONSORED_REEL_CREATIVES.length);

      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isOpen, isBlockedAdmin]);

  // Countdown timer for 6 seconds skippable ad
  useEffect(() => {
    if (!isOpen || isBlockedAdmin || isClaimed || !isPlaying) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          handleAutoClaimReward();
          return 0;
        }
        if (prev <= 3) {
          setCanSkip(true); // Can skip after 3 seconds!
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isBlockedAdmin, isClaimed, isPlaying]);

  const handleAutoClaimReward = async () => {
    if (isClaimed || !currentUser?.id) return;
    setIsClaimed(true);
    setIsProcessing(true);

    try {
      const res = await rewardUserCoinsFromAdMobVideo({
        userId: currentUser.id,
        coinsToAdd: currentAd.rewardCoins || 10,
        adUnitId: ADMOB_CONFIG.rewardedAdUnitId,
      });

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onRewardEarned(currentAd.rewardCoins || 10, res.newCoins);
    } catch (e) {
      // Fallback local credit
      onRewardEarned(10, (currentUser?.coins || 0) + 10);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipOrContinue = () => {
    if (!isClaimed && currentUser?.id && canSkip) {
      handleAutoClaimReward();
    }
    onClose();
    onProceedToNextReel();
  };

  if (!isOpen || isBlockedAdmin) return null;

  const progressPercent = Math.min(100, Math.max(0, ((6 - secondsRemaining) / 6) * 100));

  return (
    <div
      id="smart-reels-ad-break-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-md h-[80vh] max-h-[640px] rounded-3xl bg-zinc-950 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col justify-between">
        {/* Background Video Element */}
        <video
          ref={videoRef}
          src={currentAd.videoUrl}
          poster={currentAd.posterUrl}
          autoPlay
          playsInline
          loop
          muted={isMuted}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/95 pointer-events-none" />

        {/* Top Header: Smart Ad Interval Badge & Skip Control */}
        <div className="relative z-20 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              Smart Ad Break
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-amber-300 font-mono font-bold border border-amber-500/40">
              Reel #{reelsWatchedCount} Milestone
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {canSkip ? (
              <button
                type="button"
                onClick={handleSkipOrContinue}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black flex items-center gap-1 shadow-lg cursor-pointer transition-all active:scale-95 animate-pulse"
              >
                <span>Skip Ad</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-mono font-bold text-zinc-300 border border-white/20 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Skip in {secondsRemaining}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar (6s Countdown) */}
        <div className="relative z-20 w-full h-1.5 bg-zinc-900/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-fuchsia-500 transition-all duration-300 ease-linear shadow-[0_0_12px_#f59e0b]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Center Smart Interval Explanation Pill */}
        <div className="relative z-20 px-6 text-center space-y-2 my-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smooth 1-Ad-per-5-Reels Frequency</span>
          </div>

          <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">
            {currentAd.title}
          </h3>
          <p className="text-xs text-zinc-200 font-medium max-w-xs mx-auto drop-shadow">
            {currentAd.subtitle}
          </p>
        </div>

        {/* Bottom Reward Card & Action */}
        <div className="relative z-20 p-4 space-y-3">
          {/* Reward Status Banner */}
          <div className="p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1">
                  <span>+{currentAd.rewardCoins} Free Coins</span>
                  {isClaimed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-amber-200/90 font-mono">
                  {isClaimed ? '✅ Added to your Wallet Balance!' : 'Watching Sponsored Video Clip...'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-bold">Frequency</span>
              <span className="text-xs font-black text-emerald-400 font-mono">5 Clean Reels Next</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentAd.ctaUrl !== '#' && (
              <a
                href={currentAd.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-purple-900/60 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Visit Sponsor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              type="button"
              onClick={handleSkipOrContinue}
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                canSkip
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/30 active:scale-98'
                  : 'bg-zinc-900/90 text-zinc-400 border border-zinc-800'
              }`}
            >
              <span>{canSkip ? 'Continue to Next Reel' : `Watch ${secondsRemaining}s to Skip`}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center text-[10px] text-zinc-500 font-mono">
            Google AdMob Smart Optimization · High eCPM · 0 Ad Spam
          </div>
        </div>
      </div>
    </div>
  );
};
