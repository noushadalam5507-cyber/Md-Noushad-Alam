import React, { useState } from 'react';
import {
  X,
  Flame,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { boostProfileSpotlightInFirestore } from '../lib/firestoreService';

interface ProfileSpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSpotlightActivated: (newCoins: number) => void;
  onOpenCoins?: () => void;
}

export const ProfileSpotlightModal: React.FC<ProfileSpotlightModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSpotlightActivated,
  onOpenCoins,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<24 | 48>(24);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCoins = currentUser?.coins ?? 0;
  const plans = [
    {
      hours: 24 as const,
      name: '24-Hour Express Spotlight',
      coins: 500,
      boostMultiplier: '10x Views',
      badge: 'Popular',
    },
    {
      hours: 48 as const,
      name: '48-Hour Ultra Creator Dominance',
      coins: 900,
      boostMultiplier: '25x Reach & Followers',
      badge: 'Maximum ROI',
    },
  ];

  const selectedPlan = plans.find((p) => p.hours === selectedDuration) || plans[0];
  const hasEnoughCoins = currentCoins >= selectedPlan.coins;

  const handleActivateSpotlight = async () => {
    if (!currentUser) return;
    if (!hasEnoughCoins) {
      setErrorMessage(`You need ${selectedPlan.coins} coins. You currently have ${currentCoins} coins.`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await boostProfileSpotlightInFirestore({
        userId: currentUser.id,
        durationHours: selectedDuration,
        coinsCost: selectedPlan.coins,
      });

      if (result.success) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#ec4899', '#a855f7', '#06b6d4'],
        });
        onSpotlightActivated(result.newCoins);
        onClose();
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to activate profile spotlight');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="profile-spotlight-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-amber-500/50 shadow-[0_0_70px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/80 via-purple-950/70 to-zinc-950 border-b border-amber-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-400/20">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Paid Profile Spotlight
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  TOP Ranking
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                Pin your profile at the top of Explore, Home feed & Discover
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Active Status Banner */}
          {currentUser?.isSpotlightActive && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-black text-white">
                  Profile Spotlight is Active!
                </span>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  Your profile is currently featured at the top rank across the entire app.
                </p>
              </div>
            </div>
          )}

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-purple-900/40 text-center space-y-1">
              <Rocket className="w-4 h-4 text-cyan-400 mx-auto" />
              <div className="text-[11px] font-black text-white">#1 Ranking</div>
              <div className="text-[9px] text-zinc-400">Featured in Explore</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/90 border border-purple-900/40 text-center space-y-1">
              <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto" />
              <div className="text-[11px] font-black text-white">+500 Followers</div>
              <div className="text-[9px] text-zinc-400">Average Boost</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/90 border border-purple-900/40 text-center space-y-1">
              <Sparkles className="w-4 h-4 text-amber-400 mx-auto" />
              <div className="text-[11px] font-black text-white">Golden Aura</div>
              <div className="text-[9px] text-zinc-400">Glowing Avatar Ring</div>
            </div>
          </div>

          {/* Select Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Select Spotlight Duration
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map((plan) => {
                const isSelected = plan.hours === selectedDuration;
                return (
                  <button
                    key={plan.hours}
                    type="button"
                    onClick={() => setSelectedDuration(plan.hours)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-950/80 via-purple-950/60 to-zinc-900 border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/20'
                        : 'bg-zinc-900/70 border-zinc-800 hover:border-amber-800/60 hover:bg-zinc-900'
                    }`}
                  >
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 w-fit mb-1.5">
                      {plan.badge}
                    </span>

                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-white">{plan.name}</div>
                      <div className="text-[10px] text-purple-300 font-medium">
                        {plan.boostMultiplier}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-300 font-mono font-bold text-sm">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span>{plan.coins} Coins</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-600'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Balance */}
          <div className="px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-purple-900/40 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Your Wallet Balance:</span>
            <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              {currentCoins} Coins
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <X className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleActivateSpotlight}
              disabled={isProcessing || !hasEnoughCoins}
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm tracking-wide shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hasEnoughCoins
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-black shadow-amber-500/25 hover:scale-[1.01] active:scale-98'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>
                {isProcessing
                  ? 'Activating Spotlight...'
                  : hasEnoughCoins
                  ? `Boost Profile (${selectedPlan.coins} Coins)`
                  : `Insufficient Coins (${currentCoins}/${selectedPlan.coins})`}
              </span>
            </button>

            {!hasEnoughCoins && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCoins?.();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-950/80 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-purple-900 transition-all cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Earn 50 Free Coins (Daily Check-in / Video Ad)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
