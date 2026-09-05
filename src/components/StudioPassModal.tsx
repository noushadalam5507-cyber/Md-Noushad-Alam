import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Crown,
  EyeOff,
  Wand2,
  Coins,
  ArrowRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { unlockStudioPassInFirestore } from '../lib/firestoreService';

interface StudioPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onStudioPassUnlocked: () => void;
  onOpenCoins?: () => void;
}

export const StudioPassModal: React.FC<StudioPassModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStudioPassUnlocked,
  onOpenCoins,
}) => {
  const [selectedTier, setSelectedTier] = useState<'30-day' | 'lifetime'>('lifetime');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCoins = currentUser?.coins ?? 0;
  const isAlreadyActive = currentUser?.hasStudioPass;

  const tiers = [
    {
      id: '30-day' as const,
      name: 'Studio Pass (30-Day Access)',
      price: '₹149',
      coinsAlt: 300,
      period: '30 Days Access',
      badge: 'Flexible',
      popular: false,
    },
    {
      id: 'lifetime' as const,
      name: 'Studio Pass (Lifetime Tier)',
      price: '₹499',
      coinsAlt: 750,
      period: 'One-time Unlock · Forever',
      badge: 'Best Value',
      popular: true,
    },
  ];

  const currentTierObj = tiers.find((t) => t.id === selectedTier) || tiers[1];

  const handleUnlockWithDirect = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await unlockStudioPassInFirestore({
        userId: currentUser.id,
        tier: selectedTier,
        paymentMethod: 'direct',
      });

      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b'],
        });
        onStudioPassUnlocked();
        onClose();
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to unlock Studio Pass');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlockWithCoins = async () => {
    if (!currentUser) return;
    if (currentCoins < currentTierObj.coinsAlt) {
      setErrorMessage(`You need ${currentTierObj.coinsAlt} coins. You currently have ${currentCoins} coins.`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await unlockStudioPassInFirestore({
        userId: currentUser.id,
        tier: selectedTier,
        coinsCost: currentTierObj.coinsAlt,
        paymentMethod: 'coins',
      });

      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b'],
        });
        onStudioPassUnlocked();
        onClose();
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to unlock Studio Pass');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="studio-pass-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-cyan-500/50 shadow-[0_0_80px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-950/80 via-purple-950/70 to-zinc-950 border-b border-cyan-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-400/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Instagrand Studio Pass
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  Premium Tier
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/80">
                Unlock Verified Neon Badge, Zero Ads, & 3D Hologram Filters
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
          {/* Active Status Badge if already unlocked */}
          {isAlreadyActive && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-cyan-950/60 to-zinc-900 border border-emerald-500/50 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  Studio Pass is Currently Active!
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-500/30 text-cyan-300 border border-cyan-400/40">
                    {currentUser?.studioPassTier?.toUpperCase() || 'LIFETIME'}
                  </span>
                </span>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  You enjoy 100% ad-free experience, verified neon glow, and full 3D filter suite.
                </p>
              </div>
            </div>
          )}

          {/* 3 Core Studio Pass Privileges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-cyan-900/50 space-y-1.5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-black text-white">1. Verified Neon Badge</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Distinctive luminous neon badge next to your handle in calls, chats & reels.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-purple-900/50 space-y-1.5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <EyeOff className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-black text-white">2. Complete Ad-Free</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Zero AdMob banner, interstitial, or video interruptions across the entire app.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-fuchsia-900/50 space-y-1.5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center">
                <Wand2 className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-black text-white">3. 3D Hologram Filters</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Instant access to Holo Crown, Cyber Matrix, Synthwave Glow & Studio presets.
              </p>
            </div>
          </div>

          {/* Pricing Tier Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-cyan-400" />
              Select Studio Pass Option
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tiers.map((tier) => {
                const isSelected = tier.id === selectedTier;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950/80 via-purple-950/60 to-zinc-900 border-cyan-400 ring-2 ring-cyan-400/50 shadow-xl shadow-cyan-500/20'
                        : 'bg-zinc-900/70 border-zinc-800 hover:border-purple-800 hover:bg-zinc-900'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 right-4 text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-md uppercase">
                        {tier.badge}
                      </span>
                    )}

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-zinc-300">{tier.name}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">{tier.price}</span>
                        <span className="text-[11px] text-zinc-400">or {tier.coinsAlt} Coins</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-cyan-300 font-medium">{tier.period}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-400 text-black'
                            : 'border-zinc-600'
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

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <X className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleUnlockWithDirect}
              disabled={isProcessing}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-black text-sm tracking-wide shadow-xl shadow-cyan-400/25 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>
                {isProcessing
                  ? 'Activating Studio Pass...'
                  : `Unlock Studio Pass (${currentTierObj.price})`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleUnlockWithCoins}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>
                Or Redeem with {currentTierObj.coinsAlt} Wallet Coins (Balance: {currentCoins} Coins)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
