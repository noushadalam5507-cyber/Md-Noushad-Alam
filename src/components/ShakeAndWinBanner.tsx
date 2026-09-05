import React from 'react';
import { Smartphone, Sparkles, Gift, Coins, ChevronRight, Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface ShakeAndWinBannerProps {
  onOpenShakeAndWin: () => void;
  currentUser: UserProfile | null;
}

export const ShakeAndWinBanner: React.FC<ShakeAndWinBannerProps> = ({
  onOpenShakeAndWin,
  currentUser,
}) => {
  return (
    <div
      id="shake-and-win-banner"
      onClick={onOpenShakeAndWin}
      className="p-3.5 rounded-3xl bg-gradient-to-r from-purple-950/90 via-zinc-950 to-fuchsia-950/90 border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.25)] flex items-center justify-between gap-3 cursor-pointer hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.4)] transition-all group select-none"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-amber-400 p-0.5 shadow-md flex-shrink-0">
          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-fuchsia-300 group-hover:rotate-12 transition-transform animate-bounce" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-black text-white group-hover:text-fuchsia-300 transition-colors">
              Shake & Win Surprise Gift
            </h3>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
              Free Daily
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Shake phone or tap to unlock surprise coins up to 500🪙
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-fuchsia-400 group-hover:translate-x-1 transition-transform">
        <span className="text-xs font-bold hidden sm:inline">Shake Now</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
};
