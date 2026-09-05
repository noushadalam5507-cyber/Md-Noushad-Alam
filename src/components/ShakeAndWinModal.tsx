import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Smartphone,
  Gift,
  Sparkles,
  Coins,
  Crown,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Vibrate,
  Award,
  Radio,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { soundSynth } from '../utils/audioSynth';
import { shouldBlockAds } from '../lib/adminAdPolicy';

interface ShakeAndWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onCoinsWon: (coins: number) => void;
}

const SHAKE_STORAGE_KEY = 'neoncall_last_shake_timestamp';

export const ShakeAndWinModal: React.FC<ShakeAndWinModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCoinsWon,
}) => {
  const [shakeProgress, setShakeProgress] = useState<number>(0);
  const [shakeCount, setShakeCount] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [hasUnlockedChest, setHasUnlockedChest] = useState<boolean>(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(5);
  const [shakeStreak, setShakeStreak] = useState<number>(3);
  const [motionSensorSupported, setMotionSensorSupported] = useState<boolean>(true);

  const lastAcceleration = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const lastTime = useRef<number>(0);

  // Check if free shake is available today
  const isFreeShakeAvailable = () => {
    const lastTimestamp = localStorage.getItem(SHAKE_STORAGE_KEY);
    if (!lastTimestamp) return true;
    const diffHours = (Date.now() - parseInt(lastTimestamp, 10)) / (1000 * 60 * 60);
    return diffHours >= 24;
  };

  const [hasFreeShake, setHasFreeShake] = useState<boolean>(isFreeShakeAvailable());

  // Listen for Device Motion on mobile devices
  useEffect(() => {
    if (!isOpen || hasUnlockedChest) return;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const current = event.accelerationIncludingGravity;
      if (!current || current.x === null || current.y === null || current.z === null) return;

      const curTime = Date.now();
      if (curTime - lastTime.current > 100) {
        const diffTime = curTime - lastTime.current;
        lastTime.current = curTime;

        const x = current.x;
        const y = current.y;
        const z = current.z;

        const speed =
          (Math.abs(x + y + z - lastAcceleration.current.x - lastAcceleration.current.y - lastAcceleration.current.z) /
            diffTime) *
          10000;

        if (speed > 800) {
          triggerShakeAction();
        }

        lastAcceleration.current = { x, y, z };
      }
    };

    if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion);
    } else {
      setMotionSensorSupported(false);
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [isOpen, hasUnlockedChest, shakeProgress]);

  // Handle shake event (from sensor or manual button)
  const triggerShakeAction = () => {
    if (hasUnlockedChest) return;

    setIsShaking(true);
    soundSynth.playShakeRattle(1.2);
    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }

    setShakeCount((prev) => prev + 1);
    setShakeProgress((prev) => {
      const next = Math.min(100, prev + 18);
      if (next >= 100) {
        handleChestReady();
      }
      return next;
    });

    setTimeout(() => {
      setIsShaking(false);
    }, 400);
  };

  const handleChestReady = () => {
    soundSynth.playRewardUnlock();
    if (hasFreeShake || shouldBlockAds(currentUser)) {
      revealSurpriseReward();
    }
  };

  // Rewarded Video Ad countdown
  useEffect(() => {
    let timer: any;
    if (isWatchingAd && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isWatchingAd && adCountdown === 0) {
      setIsWatchingAd(false);
      revealSurpriseReward();
    }
    return () => clearTimeout(timer);
  }, [isWatchingAd, adCountdown]);

  const revealSurpriseReward = () => {
    // Generate reward between 30, 50, 100, 250, 500
    const rewards = [35, 50, 75, 100, 150, 250, 500];
    const prize = rewards[Math.floor(Math.random() * rewards.length)];

    setWonAmount(prize);
    setHasUnlockedChest(true);
    localStorage.setItem(SHAKE_STORAGE_KEY, Date.now().toString());
    setHasFreeShake(false);

    onCoinsWon(prize);
    soundSynth.playJackpotFanfare();

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#a855f7', '#ec4899', '#f59e0b', '#06b6d4', '#10b981'],
    });
  };

  const startAdUnlock = () => {
    if (shouldBlockAds(currentUser)) {
      revealSurpriseReward();
      return;
    }
    setIsWatchingAd(true);
    setAdCountdown(5);
  };

  const handleResetForAnotherShake = () => {
    setShakeProgress(0);
    setShakeCount(0);
    setHasUnlockedChest(false);
    setWonAmount(null);
  };

  if (!isOpen) return null;

  return (
    <div
      id="shake-and-win-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="shake-and-win-card"
        className={`relative w-full max-w-md bg-zinc-950 border-2 border-purple-500/70 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.35)] p-6 text-center space-y-5 my-auto ${
          isShaking ? 'animate-wiggle' : ''
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center justify-center gap-2">
          <div className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-fuchsia-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
            <Smartphone className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Shake & Win Rewards</span>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
            🔥 {shakeStreak}x Streak
          </div>
        </div>

        {/* Main Interactive Chest Stage */}
        <div className="relative py-4 flex flex-col items-center justify-center">
          {/* Ambient Glow Rays */}
          <div
            className={`absolute w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
              shakeProgress >= 100
                ? 'bg-amber-500/40 scale-125'
                : 'bg-purple-600/30'
            }`}
          />

          {/* Treasure Box Visual */}
          <div
            onClick={triggerShakeAction}
            className={`relative w-36 h-36 rounded-3xl bg-gradient-to-tr from-purple-900 via-zinc-900 to-fuchsia-900 border-2 border-purple-500/80 p-1 flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-300 select-none ${
              isShaking
                ? 'scale-110 rotate-6 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.6)]'
                : 'hover:scale-105 active:scale-95'
            }`}
          >
            {hasUnlockedChest ? (
              <div className="flex flex-col items-center justify-center text-amber-300 animate-bounce">
                <Gift className="w-16 h-16 fill-amber-400/30 stroke-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]" />
                <Sparkles className="w-6 h-6 text-amber-200 absolute -top-2 -right-2 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-purple-200">
                <Gift
                  className={`w-16 h-16 transition-transform ${
                    shakeProgress >= 100 ? 'text-amber-400 animate-bounce' : 'text-fuchsia-300'
                  }`}
                />
                <span className="text-[10px] font-mono font-bold text-fuchsia-300 mt-1">
                  {shakeProgress}% READY
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Shake Progress Bar & Status Text */}
        {!hasUnlockedChest ? (
          <div className="space-y-3">
            <div>
              <div className="text-lg font-black text-white flex items-center justify-center gap-1.5">
                <span>{shakeProgress >= 100 ? 'Chest Fully Charged! 🎁' : 'Shake Phone to Charge! 📱'}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Physically shake your smartphone or tap button below to unlock surprise coin gifts.
              </p>
            </div>

            {/* Shake Energy Gauge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Shake Energy</span>
                <span className="font-bold text-fuchsia-300">{shakeProgress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-900 border border-purple-900/60 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-400 transition-all duration-300 shadow-md"
                  style={{ width: `${shakeProgress}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              {shakeProgress < 100 ? (
                <button
                  type="button"
                  onClick={triggerShakeAction}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-600/40 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 animate-bounce" />
                  <span>TAP TO SHAKE PHONE</span>
                </button>
              ) : (
                <>
                  {hasFreeShake || shouldBlockAds(currentUser) ? (
                    <button
                      type="button"
                      onClick={revealSurpriseReward}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-fuchsia-500 to-purple-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/40 hover:scale-102 active:scale-98 transition-all cursor-pointer animate-pulse"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>OPEN FREE CHEST NOW 🎁</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startAdUnlock}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-purple-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/40 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Watch Short Ad to Open Chest (+Coins)</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Reward Celebration View */
          <div className="space-y-4 animate-scale">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-purple-950/40 to-fuchsia-950/30 border border-amber-500/50 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Surprise Reward Unlocked!
              </div>
              <div className="text-3xl font-black text-white flex items-center justify-center gap-2">
                <Coins className="w-8 h-8 text-amber-400" />
                <span>+{wonAmount} Coins</span>
              </div>
              <p className="text-xs text-amber-200">
                Credited directly to @{currentUser?.username || 'naushad'}&apos;s wallet balance!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetForAnotherShake}
                className="flex-1 py-3 rounded-2xl bg-zinc-900 border border-purple-800/60 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Shake Again</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Rewarded Video Ad Modal for Subsequent Shakes */}
        {isWatchingAd && (
          <div
            id="shake-reward-ad-overlay"
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="w-full p-6 rounded-3xl bg-zinc-950 border-2 border-amber-400 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 animate-pulse">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black text-white">Google AdMob Rewarded Video</div>
                <p className="text-xs text-zinc-400 mt-1">
                  Playing short sponsored clip to unlock your Mystery Shake Chest
                </p>
              </div>
              <div className="space-y-2 p-3 rounded-xl bg-zinc-900 border border-amber-500/30">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300">
                  <span>High-eCPM Video Ad</span>
                  <span>{adCountdown}s</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-fuchsia-500 transition-all duration-1000"
                    style={{ width: `${((5 - adCountdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
              {currentUser?.isAdmin && (
                <button
                  type="button"
                  onClick={() => setAdCountdown(0)}
                  className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold"
                >
                  ⚡ Admin Skip
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
