import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  RefreshCw,
  Coins,
  Radio,
  Music,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  Flame,
  ShieldCheck,
  X,
  Landmark
} from 'lucide-react';
import { UserProfile, ViewTab } from '../types';

interface DynamicIslandHeaderProps {
  currentUser: UserProfile | null;
  isInCall: boolean;
  onOpenHelpAI: () => void;
  onOpenAppUpdate: () => void;
  onOpenLuckySpin: () => void;
  onNavigateTab: (tab: ViewTab) => void;
  onOpenAdminBankWithdrawal?: () => void;
}

export const DynamicIslandHeader: React.FC<DynamicIslandHeaderProps> = ({
  currentUser,
  isInCall,
  onOpenHelpAI,
  onOpenAppUpdate,
  onOpenLuckySpin,
  onNavigateTab,
  onOpenAdminBankWithdrawal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hasNewUIUpdate, setHasNewUIUpdate] = useState<boolean>(true);
  const [activeNotification, setActiveNotification] = useState<string>('✨ NovaGrand In-App Live UI Update Ready!');

  const isOwnerAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com';

  // Cycle Dynamic Island notifications to keep it lively
  useEffect(() => {
    const messages = [
      '✨ NovaGrand In-App Live UI Update Ready!',
      '🔥 1,200+ Viral 4K Reels Streaming Live',
      '💎 Daily Lucky Spin: 1,000 Coins Jackpot',
      '🤖 Help AI Assistant is Active 24/7',
      '🎵 4K Opus Studio Audio Sync Online',
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setActiveNotification(messages[index]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center pt-1.5 pb-1 px-3 select-none relative z-40">
      {/* Sleek iOS / Modern Mobile Dynamic Island Pill */}
      <div
        id="dynamic-island-pill"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`transition-all duration-300 ease-out bg-black/95 text-white border border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.35)] rounded-full cursor-pointer flex items-center justify-between gap-2.5 px-3.5 py-1.5 ${
          isExpanded
            ? 'w-full max-w-md rounded-3xl p-4 bg-zinc-950 border-purple-500'
            : 'w-auto max-w-[92vw] sm:max-w-md hover:border-fuchsia-400 hover:scale-[1.02]'
        }`}
      >
        {!isExpanded ? (
          // Compact Pill View
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {isInCall ? (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              ) : hasNewUIUpdate ? (
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0 ring-2 ring-cyan-400/40" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              )}
              <span className="text-[11px] font-bold text-zinc-200 truncate font-sans">
                {isInCall ? '🔴 4K Studio Call Live' : activeNotification}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {hasNewUIUpdate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAppUpdate();
                  }}
                  className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-black text-white hover:brightness-110 flex items-center gap-1 shadow-sm"
                >
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>Update</span>
                </button>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </div>
          </div>
        ) : (
          // Expanded Island Card
          <div className="w-full flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>NovaGrand Dynamic Island</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-mono">
                      LIVE
                    </span>
                  </h4>
                  <p className="text-[10px] text-purple-300">System Hub & Instant In-App Updates</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {/* In-App Live UI Update Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-700/60 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <h5 className="text-xs font-black text-white">In-App Live UI Update v2.6.5</h5>
                </div>
                <p className="text-[10px] text-zinc-300 mt-0.5">
                  Instant UI changes & Infinite Reels backend sync without reinstalling!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenAppUpdate();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-black text-xs hover:scale-105 transition-all shadow-md shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Update Now</span>
              </button>
            </div>

            {/* Quick Quick Actions Bar */}
            <div className={`grid ${isOwnerAdmin ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
              {isOwnerAdmin && onOpenAdminBankWithdrawal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenAdminBankWithdrawal();
                  }}
                  className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/60 text-left transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group animate-pulse"
                  title="Instant 5-Minute Bank Payout"
                >
                  <Landmark className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-emerald-300">Bank Payout</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenHelpAI();
                }}
                className="p-2 rounded-xl bg-zinc-900/90 hover:bg-purple-900/50 border border-purple-900/50 text-left transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group"
              >
                <Bot className="w-4 h-4 text-fuchsia-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-zinc-200">Help AI 24/7</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenLuckySpin();
                }}
                className="p-2 rounded-xl bg-zinc-900/90 hover:bg-purple-900/50 border border-purple-900/50 text-left transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group"
              >
                <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-zinc-200">Lucky Spin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onNavigateTab('reels');
                }}
                className="p-2 rounded-xl bg-zinc-900/90 hover:bg-purple-900/50 border border-purple-900/50 text-left transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer group"
              >
                <Radio className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-zinc-200">Viral Reels</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
