import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Gift,
  Coins,
  Crown,
  Sparkles,
  Phone,
  Flame,
  X,
  Radio,
  CheckCircle2,
  Apple
} from 'lucide-react';
import { UserProfile } from '../types';

interface OSSimulatorWidgetProps {
  currentUser: UserProfile | null;
  onOpenDailyReward: () => void;
  onOpenStudioPass: () => void;
  onStartQuickCall: () => void;
}

export const OSSimulatorWidget: React.FC<OSSimulatorWidgetProps> = ({
  currentUser,
  onOpenDailyReward,
  onOpenStudioPass,
  onStartQuickCall,
}) => {
  const [activeOS, setActiveOS] = useState<'iphone' | 'android'>('iphone');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [recentLiveNotification, setRecentLiveNotification] = useState<{
    icon: string;
    title: string;
    subtitle: string;
    time: string;
  }>({
    icon: '👑',
    title: 'Silver Crown Gift Received!',
    subtitle: '@elena_neon tipped you 50 Coins (+40 creator balance)',
    time: 'Just now',
  });

  const todayIso = new Date().toISOString().split('T')[0];
  const isClaimedToday = currentUser?.lastDailyClaimDate === todayIso;

  return (
    <div
      id="os-feature-simulator"
      className="w-full max-w-4xl mx-auto my-4 p-3 sm:p-4 rounded-3xl bg-zinc-950/90 border border-purple-900/40 shadow-2xl backdrop-blur-xl space-y-4 box-border overflow-hidden"
    >
      {/* Top Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              <span>Mobile OS Integration Preview</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                Live Simulation
              </span>
            </h4>
            <p className="text-[10px] text-zinc-400">
              iPhone Dynamic Island Live Activities & Android Home Screen Widgets
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-purple-900/50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveOS('iphone')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeOS === 'iphone'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone Dynamic Island</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveOS('android')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeOS === 'android'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android Home Widget</span>
          </button>
        </div>
      </div>

      {/* iPhone Dynamic Island Preview */}
      {activeOS === 'iphone' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <span>Dynamic Island expands during live tips, calls, and audio notes:</span>
            <span className="text-purple-300 font-mono">iOS 17+ Live Activities API</span>
          </div>

          {/* Interactive Dynamic Island Pill */}
          <div className="p-4 rounded-3xl bg-black border border-zinc-800 shadow-inner flex flex-col items-center justify-center">
            <div
              onClick={() => setIsExpanded(!isExpanded)}
              className={`transition-all duration-300 bg-zinc-950 border border-zinc-800 rounded-full px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-purple-500 shadow-2xl ${
                isExpanded ? 'w-full max-w-md rounded-3xl p-4' : 'w-72 sm:w-80'
              }`}
            >
              {!isExpanded ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-base animate-bounce">{recentLiveNotification.icon}</span>
                    <span className="text-xs font-bold text-white truncate max-w-[130px]">
                      Tip: +40 Coins
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-mono text-purple-300">Live</span>
                  </div>
                </>
              ) : (
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center">
                        <Gift className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-white">
                        {recentLiveNotification.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">Live Activity</span>
                  </div>

                  <p className="text-xs text-purple-200">
                    {recentLiveNotification.subtitle}
                  </p>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDailyReward();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Daily Claim</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartQuickCall();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 fill-black" />
                      <span>Studio Call</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-zinc-500 mt-2">
              Tap the Dynamic Island pill above to expand/collapse live telemetry
            </p>
          </div>
        </div>
      )}

      {/* Android Home Screen Widget Preview */}
      {activeOS === 'android' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <span>Smart Home Screen Widget stays updated without opening the app:</span>
            <span className="text-emerald-400 font-mono">Glance AppWidget 4x2</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Widget 1: Daily Streak & Coins */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-purple-950/60 border border-purple-800/40 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-white">NovaGrand Wallet</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                  {currentUser?.coins ?? 0} Coins
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-2xl border border-purple-950">
                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>3 Day Streak</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenDailyReward}
                  className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-colors cursor-pointer"
                >
                  {isClaimedToday ? 'Claimed' : 'Claim +50'}
                </button>
              </div>
            </div>

            {/* Widget 2: VIP Creator Studio & Call */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-cyan-950/60 border border-cyan-800/40 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-white">VIP Studio Pass</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  {currentUser?.hasStudioPass ? 'ACTIVE' : 'LOCKED'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-2xl border border-cyan-950">
                <div className="text-xs text-zinc-300 truncate max-w-[120px]">
                  @{currentUser?.username || 'naushad'}
                </div>
                <button
                  type="button"
                  onClick={onOpenStudioPass}
                  className="px-3 py-1 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black transition-colors cursor-pointer"
                >
                  {currentUser?.hasStudioPass ? 'VIP Perks' : 'Unlock Pass'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
