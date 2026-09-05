import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  Activity,
  Zap,
  TrendingUp,
  Coins,
  ShieldCheck,
  Award,
  DollarSign,
  Layers,
  Sparkles,
  ArrowRight,
  Tv,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  getTrafficStats,
  subscribeToTrafficStats,
  TrafficStats,
  recordTrafficConsumption,
} from '../utils/trafficTracker';
import { CENTRAL_AD_CONFIG } from '../config/adConfig';

interface TrafficMonetizationWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onCoinsRewardCredited: (newCoins: number) => void;
}

export const TrafficMonetizationWidget: React.FC<TrafficMonetizationWidgetProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCoinsRewardCredited,
}) => {
  const [stats, setStats] = useState<TrafficStats>(getTrafficStats());
  const [testSimulating, setTestSimulating] = useState<boolean>(false);
  const [bonusCoinToast, setBonusCoinToast] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTrafficStats((newStats) => {
      setStats(newStats);
    });
    return () => unsubscribe();
  }, []);

  const handleSimulateStreamBurst = () => {
    setTestSimulating(true);
    // Simulate streaming a 25MB 4K reel video
    const result = recordTrafficConsumption(25.0, '4K Ultra-HD Reel Playback', (coinsAdded) => {
      const currentCoins = currentUser?.coins ?? 100;
      onCoinsRewardCredited(currentCoins + coinsAdded);
      setBonusCoinToast(`+${coinsAdded} Free Stream Coins Earned! 🍌`);
      setTimeout(() => setBonusCoinToast(null), 3500);
    });

    setTimeout(() => {
      setTestSimulating(false);
    }, 600);
  };

  if (!isOpen) return null;

  const founderRate = CENTRAL_AD_CONFIG.founder.dataBandwidthEarningsRatePerGbRupees || 12.5;

  return (
    <div
      id="traffic-monetization-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/60 shadow-[0_0_60px_rgba(168,85,247,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-900/90 border-b border-purple-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 flex items-center justify-center shadow-md">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Traffic & Bandwidth Monetization</h3>
              <p className="text-xs text-purple-300/80 font-mono">Live Media Streaming Ad Mediation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Real-time Yield Metric Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/80 via-zinc-950 to-cyan-950/40 border border-purple-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Mediation Active
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-bold border border-cyan-400/30">
                ₹{founderRate.toFixed(2)} / GB Rate
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[11px] text-zinc-400 font-medium">Session Bandwidth</span>
                <p className="text-2xl font-black text-white font-mono">{stats.sessionMb} MB</p>
                <span className="text-[10px] text-cyan-400 font-mono">4K Opus Audio & Reels</span>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 font-medium">Founder Yield (INR)</span>
                <p className="text-2xl font-black text-amber-400 font-mono">₹{stats.founderEarningsRupees.toFixed(2)}</p>
                <span className="text-[10px] text-purple-300 font-mono">pub-9658260608635009</span>
              </div>
            </div>
          </div>

          {/* User Stream Drop Reward Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-purple-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Stream-to-Earn Rewards</h4>
                <p className="text-[11px] text-purple-300">+5 Coins awarded every 25MB streamed</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-amber-400 font-mono">
                {stats.userEarnedStreamCoins} Coins Won
              </span>
            </div>
          </div>

          {/* Toast Notification */}
          {bonusCoinToast && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{bonusCoinToast}</span>
            </div>
          )}

          {/* Network Mediation Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Connected Monetization Networks
            </h4>

            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-900/40 text-center space-y-1">
                <span className="text-[10px] text-purple-300 font-mono">Google AdMob</span>
                <p className="font-bold text-white text-xs">Connected</p>
                <span className="text-[9px] text-emerald-400 font-mono">100% Fill</span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-900/40 text-center space-y-1">
                <span className="text-[10px] text-purple-300 font-mono">Unity Ads</span>
                <p className="font-bold text-white text-xs">Connected</p>
                <span className="text-[9px] text-emerald-400 font-mono">Ultra-HD</span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-900/40 text-center space-y-1">
                <span className="text-[10px] text-purple-300 font-mono">AppLovin MAX</span>
                <p className="font-bold text-white text-xs">Active</p>
                <span className="text-[9px] text-emerald-400 font-mono">eCPM Max</span>
              </div>
            </div>
          </div>

          {/* Test Simulation Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={testSimulating}
              onClick={handleSimulateStreamBurst}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white font-black text-sm tracking-wide shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{testSimulating ? 'Simulating 25MB Media Stream...' : 'TRIGGER 25MB STREAM BURST (+5 COINS)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
