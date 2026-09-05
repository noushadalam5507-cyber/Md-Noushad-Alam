import React, { useState } from 'react';
import {
  X,
  Coins,
  Calendar,
  Sparkles,
  CheckCircle2,
  Play,
  ArrowRight,
  Flame,
  Wand2,
  Palette,
  ShieldCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onClaimDailyReward: () => void;
  onNavigateToFilters?: () => void;
  onNavigateToThemes?: () => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onClaimDailyReward,
  onNavigateToFilters,
  onNavigateToThemes,
}) => {
  const todayIso = new Date().toISOString().split('T')[0];
  const isClaimedToday = currentUser?.lastDailyClaimDate === todayIso;

  const weekDays = [
    { day: 'Day 1', reward: 50, icon: '🍌', completed: true },
    { day: 'Day 2', reward: 50, icon: '🍌', completed: true },
    { day: 'Day 3', reward: 50, icon: '🍌', isToday: true, completed: isClaimedToday },
    { day: 'Day 4', reward: 50, icon: '🍌', completed: false },
    { day: 'Day 5', reward: 50, icon: '🍌', completed: false },
    { day: 'Day 6', reward: 75, icon: '✨', completed: false },
    { day: 'Day 7', reward: 100, icon: '👑', completed: false },
  ];

  if (!isOpen) return null;

  return (
    <div
      id="daily-checkin-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/50 shadow-[0_0_60px_rgba(168,85,247,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950/80 via-zinc-900 to-zinc-950 border-b border-purple-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-400/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Daily Check-in Reward
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  3 Day Streak
                </span>
              </div>
              <p className="text-[11px] text-purple-300">
                Log in daily to claim free coins & unlock 3D features
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Main Claim Banner Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 via-purple-950/30 to-black border border-purple-500/40 relative overflow-hidden text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 mx-auto flex items-center justify-center text-black shadow-[0_0_30px_rgba(245,158,11,0.5)]">
              <Coins className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-white">
                50 Free Coins
              </h4>
              <p className="text-xs text-purple-200">
                {isClaimedToday
                  ? "You've already claimed today's 50 free coins! Come back tomorrow for more."
                  : 'Watch a quick Google AdMob video to instantly claim your 50 free coins!'}
              </p>
            </div>

            <div className="pt-2">
              {isClaimedToday ? (
                <div className="py-3 px-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Claimed for Today ({todayIso})</span>
                </div>
              ) : (
                <button
                  id="claim-50-coins-daily-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onClaimDailyReward();
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-fuchsia-500 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-black font-black text-sm tracking-wide shadow-xl shadow-amber-400/25 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Claim 50 Free Coins (Watch Video)</span>
                </button>
              )}
            </div>
          </div>

          {/* 7-Day Streak Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                7-Day Login Streak
              </span>
              <span className="text-purple-300 font-mono text-[11px]">
                Wallet: {currentUser?.coins ?? 0} Coins
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                    item.isToday
                      ? 'bg-purple-900/60 border-amber-400 shadow-md shadow-amber-400/20'
                      : item.completed
                      ? 'bg-emerald-950/40 border-emerald-600/40 opacity-80'
                      : 'bg-zinc-900/60 border-purple-950 text-zinc-500'
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold text-zinc-400">
                    {item.day}
                  </span>
                  <span className="text-base">{item.icon}</span>
                  <span
                    className={`text-[10px] font-mono font-black ${
                      item.isToday ? 'text-amber-300' : item.completed ? 'text-emerald-400' : 'text-zinc-400'
                    }`}
                  >
                    +{item.reward}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* How to spend your coins */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-purple-900/40 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              What you can unlock with your coins:
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                onClick={() => {
                  onClose();
                  onNavigateToFilters?.();
                }}
                className="p-3 rounded-xl bg-zinc-950/80 border border-purple-800/40 hover:border-purple-500 hover:bg-purple-950/30 transition-all cursor-pointer group flex items-start gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-300 flex items-center justify-center shrink-0">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-purple-300">
                      Premium 3D Filters
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Holo Crown, Cyber Matrix, 4K Prism Glow
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  onClose();
                  onNavigateToThemes?.();
                }}
                className="p-3 rounded-xl bg-zinc-950/80 border border-purple-800/40 hover:border-purple-500 hover:bg-purple-950/30 transition-all cursor-pointer group flex items-start gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-fuchsia-600/20 text-fuchsia-300 flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-fuchsia-300">
                      Exclusive Themes
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Cyber Obsidian, Neon Gold, Synthwave 4K
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
