import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Crown,
  Users,
  Lock,
  ArrowRight,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { unlockVerifiedBadgeInFirestore } from '../lib/firestoreService';

interface VerifiedBadgeShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onBadgeUnlocked: () => void;
}

export const VerifiedBadgeShopModal: React.FC<VerifiedBadgeShopModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onBadgeUnlocked,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'1-month' | '1-year' | 'milestone-50'>('1-month');
  const [badgeType, setBadgeType] = useState<'neon' | 'blue' | 'gold'>('neon');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const followers = currentUser?.followersCount ?? 48;
  const is50FollowerEligible = followers >= 50;

  const plans = [
    {
      id: '1-month' as const,
      name: '1-Month Verified Pass',
      price: '₹20',
      period: '30 Days VIP Blue/Neon Badge',
      badge: 'Budget VIP',
      isMilestone: false,
    },
    {
      id: '1-year' as const,
      name: '1-Year Verified Elite',
      price: '₹500',
      period: '365 Days Verified Checkmark + Top Priority',
      badge: 'Most Popular',
      isMilestone: false,
    },
    {
      id: 'milestone-50' as const,
      name: '50 Followers Creator Milestone',
      price: 'FREE',
      period: `Creator Achievement (${followers}/50 Followers)`,
      badge: is50FollowerEligible ? 'Unlocked! 🎉' : 'Locked',
      isMilestone: true,
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[0];

  const handleUnlockBadge = async () => {
    if (!currentUser) return;
    if (selectedPlan === 'milestone-50' && !is50FollowerEligible) {
      setErrorMessage(`You need at least 50 followers to claim this free badge. You currently have ${followers} followers.`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await unlockVerifiedBadgeInFirestore({
        userId: currentUser.id,
        badgePlan: selectedPlan,
        priceDisplay: currentPlan.price,
        badgeType: badgeType,
      });

      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981'],
        });
        onBadgeUnlocked();
        onClose();
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to activate verified badge');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="verified-badge-shop-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-cyan-500/50 shadow-[0_0_70px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-950/80 via-purple-950/70 to-zinc-950 border-b border-cyan-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-400/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Get Verified on Instagrand
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  ₹20 / ₹500 / 50 Followers
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/80">
                Luminous badge next to your handle in calls, feeds & direct chat
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Badge Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Choose Badge Glow Style
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBadgeType('neon')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  badgeType === 'neon'
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-zinc-900/70 border-zinc-800'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-cyan-400 mx-auto" />
                <div className="text-xs font-bold text-white mt-1">Neon Cyan</div>
                <div className="text-[9px] text-cyan-300">Cyber Glow</div>
              </button>

              <button
                type="button"
                onClick={() => setBadgeType('gold')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  badgeType === 'gold'
                    ? 'bg-amber-950/80 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900/70 border-zinc-800'
                }`}
              >
                <Crown className="w-5 h-5 text-amber-400 mx-auto" />
                <div className="text-xs font-bold text-white mt-1">VIP Gold</div>
                <div className="text-[9px] text-amber-300">Master Creator</div>
              </button>

              <button
                type="button"
                onClick={() => setBadgeType('blue')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  badgeType === 'blue'
                    ? 'bg-blue-950/80 border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-zinc-900/70 border-zinc-800'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-blue-400 mx-auto" />
                <div className="text-xs font-bold text-white mt-1">Classic Blue</div>
                <div className="text-[9px] text-blue-300">Verified Official</div>
              </button>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Select Verification Plan
            </label>

            <div className="space-y-2.5">
              {plans.map((plan) => {
                const isSelected = plan.id === selectedPlan;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all relative flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/80 via-purple-950/60 to-zinc-900 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg'
                        : 'bg-zinc-900/70 border-zinc-800 hover:border-cyan-800 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{plan.name}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                          {plan.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{plan.period}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-white">{plan.price}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-zinc-600'
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

          {/* Action Button */}
          <button
            type="button"
            onClick={handleUnlockBadge}
            disabled={isProcessing}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-black text-sm tracking-wide shadow-xl shadow-cyan-400/25 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Activating Verification...'
                : `Activate Verified Badge (${currentPlan.price})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
