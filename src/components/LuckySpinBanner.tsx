import React from 'react';
import { Sparkles, Crown, RotateCw, ArrowRight, Zap, Coins } from 'lucide-react';
import { UserProfile } from '../types';

interface LuckySpinBannerProps {
  onOpenLuckySpin: () => void;
  currentUser: UserProfile | null;
}

export const LuckySpinBanner: React.FC<LuckySpinBannerProps> = ({
  onOpenLuckySpin,
  currentUser,
}) => {
  const todayDateString = new Date().toISOString().split('T')[0];
  const storageKey = `lucky_spin_free_used_${currentUser?.id || 'guest'}_${todayDateString}`;
  const isFreeAvailable = typeof window !== 'undefined' ? localStorage.getItem(storageKey) !== 'true' : true;

  return (
    <div
      id="lucky-spin-shortcut-banner"
      onClick={onOpenLuckySpin}
      className="group relative w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-zinc-950 to-fuchsia-950 border border-purple-500/50 hover:border-amber-400/80 shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_40px_rgba(234,179,8,0.35)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      {/* Ambient decorative glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/25 transition-all" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-600/15 rounded-full blur-2xl pointer-events-none" />

      {/* Left: Interactive Icon + Title */}
      <div className="relative z-10 flex items-center gap-4 text-left w-full sm:w-auto">
        <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-fuchsia-500 to-purple-600 p-0.5 shadow-lg shadow-amber-400/30 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-amber-300">
            <span className="text-2xl animate-pulse">🎡</span>
          </div>
          {isFreeAvailable && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-black text-black items-center justify-center">1</span>
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Daily Lucky Spin & Win
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono font-bold flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              1,000 Coins Jackpot
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-white group-hover:text-purple-200 transition-colors">
            {isFreeAvailable ? '🎁 Your 1 Daily Free Spin is Ready!' : '⚡ Spin to Win Bonus Coins & VIP Passes'}
          </h4>
          <p className="text-[11px] text-purple-300/80">
            Spin the cyber neon wheel · Extra spins with Rewarded Video Ads
          </p>
        </div>
      </div>

      {/* Right: CTA Button */}
      <div className="relative z-10 w-full sm:w-auto flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLuckySpin();
          }}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl font-black text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            isFreeAvailable
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30 group-hover:scale-105'
              : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-purple-600/30 group-hover:scale-105'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isFreeAvailable ? 'SPIN FREE NOW' : 'PLAY LUCKY WHEEL'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
