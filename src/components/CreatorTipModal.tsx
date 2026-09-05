import React, { useState } from 'react';
import {
  X,
  Coins,
  Sparkles,
  Heart,
  Gift,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Star,
  Crown,
  Diamond,
  Rocket,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { sendCreatorTipInFirestore } from '../lib/firestoreService';

export interface VirtualGift {
  id: string;
  name: string;
  icon: string;
  cost: number;
  description: string;
  glowColor: string;
  badge: string;
}

export const VIRTUAL_GIFTS: VirtualGift[] = [
  {
    id: 'bronze-star',
    name: 'Bronze Star',
    icon: '🌟',
    cost: 20,
    description: 'Sparkling appreciation star for quality content',
    glowColor: 'from-amber-700/40 to-yellow-600/30 border-amber-600/50',
    badge: 'Popular',
  },
  {
    id: 'silver-crown',
    name: 'Silver Crown',
    icon: '👑',
    cost: 50,
    description: 'Regal silver creator recognition trophy',
    glowColor: 'from-slate-400/30 to-purple-600/30 border-purple-400/50',
    badge: 'Trending',
  },
  {
    id: 'gold-diamond',
    name: 'Gold Diamond',
    icon: '💎',
    cost: 100,
    description: 'Ultra-luminous 24K gem for top-tier creators',
    glowColor: 'from-amber-400/40 to-fuchsia-600/40 border-amber-400/60',
    badge: 'High Impact',
  },
  {
    id: 'neon-rocket',
    name: 'Neon Rocket',
    icon: '🚀',
    cost: 250,
    description: 'Propels creator straight to the trending algorithm',
    glowColor: 'from-cyan-500/40 to-purple-600/40 border-cyan-400/60',
    badge: 'Boost FX',
  },
  {
    id: 'holo-crown-vip',
    name: 'Holo Crown VIP',
    icon: '🌌',
    cost: 500,
    description: 'The highest honor in Instagrand VIP',
    glowColor: 'from-fuchsia-600/50 to-pink-500/40 border-fuchsia-400/70',
    badge: 'Master Gift',
  },
];

interface CreatorTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  recipientUser: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  onTipSentSuccess: (tipData: {
    giftId: string;
    giftName: string;
    giftIcon: string;
    totalCoins: number;
    creatorCoins: number;
    adminCommission: number;
    message?: string;
  }) => void;
  onNeedMoreCoins?: () => void;
}

export const CreatorTipModal: React.FC<CreatorTipModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  recipientUser,
  onTipSentSuccess,
  onNeedMoreCoins,
}) => {
  const [selectedGiftId, setSelectedGiftId] = useState<string>('silver-crown');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCoins = currentUser?.coins ?? 0;
  const selectedGift = VIRTUAL_GIFTS.find((g) => g.id === selectedGiftId) || VIRTUAL_GIFTS[1];
  const creatorEarnCoins = Math.floor(selectedGift.cost * 0.8); // 80% to creator
  const adminCommissionCoins = selectedGift.cost - creatorEarnCoins; // 20% to admin
  const hasEnoughCoins = currentCoins >= selectedGift.cost;

  const handleSendTip = async () => {
    if (!currentUser) return;
    if (!hasEnoughCoins) {
      setErrorMessage(`You need ${selectedGift.cost} coins. You have ${currentCoins} coins.`);
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const result = await sendCreatorTipInFirestore({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderUsername: currentUser.username,
        senderAvatar: currentUser.avatar,
        recipientId: recipientUser.id,
        recipientUsername: recipientUser.username,
        giftId: selectedGift.id,
        giftName: selectedGift.name,
        giftIcon: selectedGift.icon,
        totalCoins: selectedGift.cost,
        message: customMessage.trim(),
      });

      if (result.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#ec4899', '#f59e0b', '#06b6d4'],
        });

        onTipSentSuccess({
          giftId: selectedGift.id,
          giftName: selectedGift.name,
          giftIcon: selectedGift.icon,
          totalCoins: selectedGift.cost,
          creatorCoins: creatorEarnCoins,
          adminCommission: adminCommissionCoins,
          message: customMessage.trim(),
        });

        onClose();
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send tip');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      id="creator-tip-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/50 shadow-[0_0_60px_rgba(168,85,247,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950/90 via-zinc-900 to-zinc-950 border-b border-purple-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Tip Creator
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300">
                  Virtual Gifts & Stickers
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Support @{recipientUser.username} with wallet coins
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

        {/* Recipient Spotlight */}
        <div className="px-5 py-3 bg-purple-950/30 border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={recipientUser.avatar}
              alt={recipientUser.name}
              className="w-8 h-8 rounded-full border border-purple-500/50 object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{recipientUser.name}</span>
                {recipientUser.isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </div>
              <span className="text-[10px] text-purple-300 font-mono">@{recipientUser.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-purple-800/40 text-xs font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white">{currentCoins}</span>
            <span className="text-zinc-400 text-[10px]">Coins</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Gifts Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Choose Virtual Gift Sticker
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {VIRTUAL_GIFTS.map((gift) => {
                const isSelected = gift.id === selectedGiftId;
                return (
                  <button
                    key={gift.id}
                    type="button"
                    onClick={() => setSelectedGiftId(gift.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? `bg-gradient-to-b ${gift.glowColor} ring-2 ring-purple-400 shadow-lg`
                        : 'bg-zinc-900/70 border-purple-950/80 hover:border-purple-800 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{gift.icon}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/50 border border-purple-500/30 text-purple-300">
                        {gift.badge}
                      </span>
                    </div>

                    <div className="mt-2 space-y-0.5">
                      <div className="text-xs font-black text-white truncate">
                        {gift.name}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300">
                        <Coins className="w-3 h-3" />
                        <span>{gift.cost} Coins</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Gift Breakdown (80% Creator / 20% Admin Fee) */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-purple-900/50 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="text-lg">{selectedGift.icon}</span>
                {selectedGift.name}
              </span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {selectedGift.cost} Coins
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {selectedGift.description}
            </p>

            {/* Split Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-900/40 text-[11px]">
              <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/30 space-y-0.5">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">
                  Creator Share (80%)
                </div>
                <div className="font-mono font-black text-white text-xs">
                  +{creatorEarnCoins} Coins
                </div>
                <div className="text-[9px] text-zinc-400">Credited to @{recipientUser.username}</div>
              </div>

              <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-500/30 space-y-0.5">
                <div className="text-[10px] text-purple-300 font-bold uppercase">
                  Platform Commission (20%)
                </div>
                <div className="font-mono font-black text-white text-xs">
                  +{adminCommissionCoins} Coins
                </div>
                <div className="text-[9px] text-zinc-400">Platform operational fee</div>
              </div>
            </div>
          </div>

          {/* Optional Message Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">
              Personal Note (Optional)
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={`Amazing broadcast! Keep creating 🔥`}
              maxLength={80}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-purple-900/60 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
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
              onClick={handleSendTip}
              disabled={isSending || !hasEnoughCoins}
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm tracking-wide shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hasEnoughCoins
                  ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:scale-[1.02] active:scale-98'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>
                {isSending
                  ? 'Sending Virtual Gift...'
                  : hasEnoughCoins
                  ? `Send ${selectedGift.name} (${selectedGift.cost} Coins)`
                  : `Insufficient Balance (${currentCoins}/${selectedGift.cost} Coins)`}
              </span>
            </button>

            {!hasEnoughCoins && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNeedMoreCoins?.();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-950/80 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-purple-900 transition-all cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Earn 50 Free Coins (Daily Check-in / Video Ad)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
