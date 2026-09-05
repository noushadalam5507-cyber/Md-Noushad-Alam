import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Coins,
  Crown,
  Play,
  RotateCw,
  Gift,
  Zap,
  Award,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Tv,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { soundSynth } from '../utils/audioSynth';
import { rewardUserCoinsFromAdMobVideo } from '../lib/firestoreService';
import { AdMobRewardedVideoModal } from './AdMobRewardedVideoModal';
import { shouldBlockAds } from '../lib/adminAdPolicy';

interface WheelSector {
  id: string;
  label: string;
  subLabel: string;
  coins: number;
  multiplier?: number;
  isJackpot?: boolean;
  color: string;
  textColor: string;
  borderGlow: string;
  icon: string;
}

const SECTORS: WheelSector[] = [
  {
    id: 's1',
    label: '+15 Coins',
    subLabel: 'Starter Drop',
    coins: 15,
    color: '#6366f1',
    textColor: '#ffffff',
    borderGlow: 'rgba(99,102,241,0.6)',
    icon: '🪙',
  },
  {
    id: 's2',
    label: '+50 Coins',
    subLabel: 'Silver Tier',
    coins: 50,
    color: '#a855f7',
    textColor: '#ffffff',
    borderGlow: 'rgba(168,85,247,0.6)',
    icon: '💎',
  },
  {
    id: 's3',
    label: '+25 Coins',
    subLabel: 'Banana Power',
    coins: 25,
    color: '#eab308',
    textColor: '#000000',
    borderGlow: 'rgba(234,179,8,0.6)',
    icon: '🍌',
  },
  {
    id: 's4',
    label: '+100 Coins',
    subLabel: 'Super Voltage',
    coins: 100,
    color: '#06b6d4',
    textColor: '#000000',
    borderGlow: 'rgba(6,182,212,0.6)',
    icon: '⚡',
  },
  {
    id: 's5',
    label: 'Mystery Box',
    subLabel: '+75 Coins & VIP',
    coins: 75,
    color: '#ec4899',
    textColor: '#ffffff',
    borderGlow: 'rgba(236,72,153,0.6)',
    icon: '🎁',
  },
  {
    id: 's6',
    label: '+250 Coins',
    subLabel: 'Epic Flame',
    coins: 250,
    color: '#f97316',
    textColor: '#ffffff',
    borderGlow: 'rgba(249,115,22,0.6)',
    icon: '🔥',
  },
  {
    id: 's7',
    label: '1,000 COINS',
    subLabel: '👑 MEGA JACKPOT',
    coins: 1000,
    isJackpot: true,
    color: '#ffd700',
    textColor: '#000000',
    borderGlow: 'rgba(255,215,0,0.9)',
    icon: '👑',
  },
  {
    id: 's8',
    label: '2X Booster',
    subLabel: '+50 Coins + Double',
    coins: 50,
    multiplier: 2,
    color: '#10b981',
    textColor: '#ffffff',
    borderGlow: 'rgba(16,185,129,0.6)',
    icon: '🚀',
  },
];

interface DailyLuckySpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onCoinsUpdated: (newCoins: number) => void;
}

export const DailyLuckySpinModal: React.FC<DailyLuckySpinModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCoinsUpdated,
}) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [wonSector, setWonSector] = useState<WheelSector | null>(null);
  const [hasFreeSpinToday, setHasFreeSpinToday] = useState<boolean>(true);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState<boolean>(false);
  const [spinCountSession, setSpinCountSession] = useState<number>(0);
  const [unlockedExtraSpins, setUnlockedExtraSpins] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentAngleRef = useRef<number>(0);

  const todayDateString = new Date().toISOString().split('T')[0];
  const storageKey = `lucky_spin_free_used_${currentUser?.id || 'guest'}_${todayDateString}`;

  // Check Daily Free Spin status
  useEffect(() => {
    if (isOpen) {
      const alreadyUsed = localStorage.getItem(storageKey) === 'true';
      setHasFreeSpinToday(!alreadyUsed);
      setWonSector(null);
    }
  }, [isOpen, storageKey]);

  // Draw the High-Definition Cyber Neon Wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 380;
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 16;
    const numSectors = SECTORS.length;
    const sectorAngle = (2 * Math.PI) / numSectors;

    ctx.clearRect(0, 0, size, size);

    // 1. Draw Outer Glowing Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#9333ea';
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.restore();

    // 2. Draw Sectors
    SECTORS.forEach((sector, i) => {
      const startAngle = i * sectorAngle;
      const endAngle = startAngle + sectorAngle;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Sector Gradient
      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.2,
        centerX,
        centerY,
        radius
      );
      grad.addColorStop(0, '#18181b');
      grad.addColorStop(0.5, sector.color);
      grad.addColorStop(1, '#09090b');
      ctx.fillStyle = grad;
      ctx.fill();

      // Neon Divider border
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff40';
      ctx.stroke();

      // Draw Sector Text & Icon
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sectorAngle / 2);

      // Icon
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sector.icon, radius * 0.72, 0);

      // Label Text
      ctx.fillStyle = sector.textColor;
      ctx.font = sector.isJackpot ? 'bold 13px system-ui' : 'bold 12px system-ui';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(sector.label, radius * 0.44, 0);

      ctx.restore();
      ctx.restore();
    });

    // 3. Draw Outer Perimeter Studs (LED lights)
    const totalStuds = 24;
    for (let i = 0; i < totalStuds; i++) {
      const angle = (i * (2 * Math.PI)) / totalStuds;
      const studX = centerX + (radius + 6) * Math.cos(angle);
      const studY = centerY + (radius + 6) * Math.sin(angle);

      ctx.save();
      ctx.beginPath();
      ctx.arc(studX, studY, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? '#facc15' : '#38bdf8';
      ctx.shadowColor = i % 2 === 0 ? '#facc15' : '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
  }, []);

  // Execute Wheel Spin Animation
  const handleStartSpin = (isFree: boolean) => {
    if (isSpinning) return;

    if (isFree) {
      localStorage.setItem(storageKey, 'true');
      setHasFreeSpinToday(false);
    } else {
      if (unlockedExtraSpins > 0) {
        setUnlockedExtraSpins((prev) => prev - 1);
      } else {
        // Need to watch ad first
        setIsRewardedAdOpen(true);
        return;
      }
    }

    setIsSpinning(true);
    setWonSector(null);

    // Random destination with weights: Jackpot has fair chance
    const randomIndex = Math.floor(Math.random() * SECTORS.length);
    const targetSector = SECTORS[randomIndex];

    const numSectors = SECTORS.length;
    const sectorAngleDeg = 360 / numSectors;

    // Angle of target segment aligned with top needle (needle is at 270 deg / top)
    const targetSegmentCenterDeg = randomIndex * sectorAngleDeg + sectorAngleDeg / 2;
    // We want (rotation + targetSegmentCenterDeg) % 360 to land on top (270°)
    const fullSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full 360 turns
    const extraOffsetDeg = 270 - targetSegmentCenterDeg;
    const finalDegree = fullSpins * 360 + extraOffsetDeg;

    const startDegree = rotationDegrees % 360;
    const totalDelta = finalDegree;
    const durationMs = 4500;
    const startTime = performance.now();

    let lastTickAngle = 0;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Smooth Quintic Easing Out: 1 - (1 - t)^4
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentDeg = startDegree + totalDelta * easeOut;

      setRotationDegrees(currentDeg);
      currentAngleRef.current = currentDeg;

      // Play tactical tick sounds as pegs pass needle
      if (Math.abs(currentDeg - lastTickAngle) >= sectorAngleDeg) {
        soundSynth.playWheelTick(1 + (1 - progress) * 0.5);
        lastTickAngle = currentDeg;
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateSpin);
      } else {
        // Spin Completed
        setIsSpinning(false);
        setWonSector(targetSector);
        setSpinCountSession((prev) => prev + 1);

        // Play Win Fanfare & Confetti
        if (targetSector.isJackpot) {
          soundSynth.playJackpotFanfare();
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#ffd700', '#f59e0b', '#ec4899', '#a855f7'],
          });
        } else {
          soundSynth.playCoinChime();
          confetti({
            particleCount: 70,
            spread: 65,
            origin: { y: 0.6 },
          });
        }

        // Credit coins to Firestore & local wallet
        creditPrize(targetSector);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateSpin);
  };

  const creditPrize = async (sector: WheelSector) => {
    try {
      const userId = currentUser?.id || 'usr_guest';
      const result = await rewardUserCoinsFromAdMobVideo({
        userId,
        coinsToAdd: sector.coins,
        adUnitId: `LUCKY-SPIN-${sector.id}`,
      });
      onCoinsUpdated(result.newCoins);
    } catch (e) {
      console.warn('Fallback coin credit:', e);
      const currentCoins = currentUser?.coins ?? 100;
      onCoinsUpdated(currentCoins + sector.coins);
    }
  };

  const handleRewardEarnedFromVideo = (earnedCoins: number) => {
    // Ad watched completely: award 1 extra free spin!
    setUnlockedExtraSpins((prev) => prev + 1);
    setIsRewardedAdOpen(false);
    soundSynth.playCoinChime();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  if (!isOpen) return null;

  return (
    <div
      id="daily-lucky-spin-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/60 shadow-[0_0_60px_rgba(168,85,247,0.35)] overflow-hidden flex flex-col max-h-[95vh]">
        {/* Ambient Neon Glows */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="px-5 py-4 bg-zinc-900/90 border-b border-purple-900/60 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-amber-400 p-0.5 shadow-lg shadow-purple-600/30">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-amber-300">
                <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Daily Lucky Spin & Win
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Jackpot 1K
                </span>
              </div>
              <p className="text-xs text-purple-300/80">
                1 Free Daily Spin · Unlimited Spins via Rewarded Video Ads
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSpinning}
            className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Wheel Arena */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center overflow-y-auto space-y-5 z-10">
          {/* Wheel Stage Container */}
          <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[340px] sm:h-[340px]">
            {/* Top Indicator Needle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30 drop-shadow-[0_4px_12px_rgba(234,179,8,0.9)]">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400" />
              <div className="w-3 h-3 bg-white rounded-full mx-auto -mt-6 shadow-md" />
            </div>

            {/* Rotating Canvas */}
            <div
              className="relative w-full h-full flex items-center justify-center transition-transform"
              style={{
                transform: `rotate(${rotationDegrees}deg)`,
                transformOrigin: 'center center',
              }}
            >
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%' }}
                className="rounded-full shadow-[0_0_40px_rgba(168,85,247,0.4)]"
              />
            </div>

            {/* Center Glowing Hub Button */}
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => {
                if (hasFreeSpinToday) {
                  handleStartSpin(true);
                } else if (unlockedExtraSpins > 0) {
                  handleStartSpin(false);
                } else {
                  setIsRewardedAdOpen(true);
                }
              }}
              className="absolute z-20 w-20 h-20 rounded-full bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-amber-400 p-1 shadow-[0_0_30px_rgba(217,70,239,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center disabled:opacity-80"
            >
              <div className="w-full h-full bg-zinc-950 rounded-full flex flex-col items-center justify-center text-center p-1">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="text-[11px] font-black text-white tracking-wider leading-none mt-0.5">
                  {isSpinning ? 'SPINNING' : 'SPIN'}
                </span>
                <span className="text-[9px] text-fuchsia-300 font-bold">
                  {hasFreeSpinToday ? 'FREE' : unlockedExtraSpins > 0 ? `${unlockedExtraSpins} LEFT` : 'AD'}
                </span>
              </div>
            </button>
          </div>

          {/* Win Celebration Banner */}
          {wonSector && !isSpinning && (
            <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-fuchsia-950 to-zinc-950 border border-amber-400/60 shadow-xl flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center text-2xl shadow-lg shadow-amber-400/40 animate-bounce">
                  {wonSector.icon}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                    {wonSector.isJackpot ? '🎉 MEGA JACKPOT WON!' : 'CONGRATULATIONS!'}
                  </span>
                  <h4 className="text-base font-black text-white">
                    Won {wonSector.label}!
                  </h4>
                  <p className="text-xs text-purple-200/80">
                    +{wonSector.coins} Coins credited to your wallet balance.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-black text-xs shadow-md">
                  +{wonSector.coins} 🪙
                </span>
              </div>
            </div>
          )}

          {/* Action Control Panel */}
          <div className="w-full space-y-3 pt-1">
            {/* Free Spin Option */}
            {hasFreeSpinToday ? (
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handleStartSpin(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>CLAIM 1 DAILY FREE SPIN NOW</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-mono">1/1</span>
              </button>
            ) : unlockedExtraSpins > 0 ? (
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handleStartSpin(false)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white font-black text-sm tracking-wide shadow-xl shadow-fuchsia-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              >
                <RotateCw className="w-5 h-5 text-white animate-spin" />
                <span>USE EXTRA SPIN ({unlockedExtraSpins} Available)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => setIsRewardedAdOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-sm tracking-wide shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              >
                <Tv className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>WATCH REWARDED VIDEO AD FOR EXTRA SPIN</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-xs font-bold font-mono">
                  +1 SPIN
                </span>
              </button>
            )}

            {/* Status Info Footer */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-purple-900/50 flex items-center justify-between">
                <span className="text-zinc-400">Daily Free Spin:</span>
                <span className={`font-bold ${hasFreeSpinToday ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {hasFreeSpinToday ? 'Ready (1)' : 'Used Today'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-purple-900/50 flex items-center justify-between">
                <span className="text-zinc-400">Wallet Balance:</span>
                <span className="font-bold text-amber-300 flex items-center gap-1 font-mono">
                  <Coins className="w-3.5 h-3.5" />
                  {currentUser?.coins ?? 100} Coins
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rewarded Video Ad Modal for Extra Spins */}
      <AdMobRewardedVideoModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        userId={currentUser?.id || 'usr_guest'}
        currentUser={currentUser}
        onRewardEarned={handleRewardEarnedFromVideo}
      />
    </div>
  );
};
