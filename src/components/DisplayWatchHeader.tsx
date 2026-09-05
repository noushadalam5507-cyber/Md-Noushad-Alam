import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flame,
  DollarSign,
  TrendingUp,
  Sparkles,
  Eye,
  Play,
  Coins,
  ShieldCheck,
  ChevronRight,
  Zap,
  Activity,
  Award,
  Share2,
  CheckCircle2,
  X
} from 'lucide-react';
import { UserProfile } from '../types';

interface DisplayWatchHeaderProps {
  currentUser: UserProfile | null;
  onOpenCoinStore?: () => void;
  onOpenReels?: () => void;
}

export const DisplayWatchHeader: React.FC<DisplayWatchHeaderProps> = ({
  currentUser,
  onOpenCoinStore,
  onOpenReels,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);

  // Real-time dynamic watch metrics
  const [globalViewsCount, setGlobalViewsCount] = useState<number>(() => {
    const saved = localStorage.getItem('novagrand_global_views');
    return saved ? parseInt(saved, 10) : 48250;
  });

  const [globalWatchMinutes, setGlobalWatchMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('novagrand_global_watch_mins');
    return saved ? parseFloat(saved) : 1940.5;
  });

  const [totalEarnedRevenueUSD, setTotalEarnedRevenueUSD] = useState<number>(() => {
    const saved = localStorage.getItem('novagrand_total_earned_usd');
    return saved ? parseFloat(saved) : 238.40;
  });

  // Ticking clock effect + Continuous live watch time & revenue accumulation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);

      // Increment live video watch counters simulating real active users watching videos globally
      setGlobalViewsCount((prev) => {
        const next = prev + Math.floor(Math.random() * 3) + 1;
        try { localStorage.setItem('novagrand_global_views', next.toString()); } catch {}
        return next;
      });

      setGlobalWatchMinutes((prev) => {
        const next = parseFloat((prev + 0.05).toFixed(2));
        try { localStorage.setItem('novagrand_global_watch_mins', next.toString()); } catch {}
        return next;
      });

      setTotalEarnedRevenueUSD((prev) => {
        const next = parseFloat((prev + 0.008).toFixed(3));
        try { localStorage.setItem('novagrand_total_earned_usd', next.toString()); } catch {}
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate rotating hand angles for luxury analog watch
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;
  const milliseconds = time.getMilliseconds();

  const secDeg = (seconds + milliseconds / 1000) * 6; // 360 / 60
  const minDeg = (minutes + seconds / 60) * 6;
  const hourDeg = (hours + minutes / 60) * 30; // 360 / 12

  const timeString = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      {/* Top Floating Cybernetic Rotating Display Watch Bar */}
      <div
        id="cyber-display-watch-header"
        className="w-full bg-gradient-to-r from-zinc-950 via-purple-950/70 to-zinc-950 border-b border-purple-800/40 px-3 py-1.5 flex items-center justify-between gap-2 text-xs shadow-inner select-none backdrop-blur-md"
      >
        {/* Left: Rotating 3D Display Watch Dial + Real-Time Clock */}
        <div
          onClick={() => setIsStatsModalOpen(true)}
          className="flex items-center gap-2 cursor-pointer group"
          title="Click to view Live Video Watch Time & Real Earning Stats"
        >
          {/* Animated Rotating Analog Watch Miniature */}
          <div className="relative w-8 h-8 rounded-full bg-zinc-900 border-2 border-fuchsia-500/80 shadow-[0_0_12px_rgba(217,70,239,0.5)] flex items-center justify-center group-hover:scale-110 transition-transform">
            
            {/* Outer Spinning Ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/60 animate-spin [animation-duration:12s]" />

            {/* Watch Center Dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 z-20 shadow-[0_0_4px_#facc15]" />

            {/* Hour Hand */}
            <div
              className="absolute w-0.5 h-2 bg-white rounded-full origin-bottom z-10"
              style={{
                transform: `rotate(${hourDeg}deg) translateY(-50%)`,
                transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
              }}
            />

            {/* Minute Hand */}
            <div
              className="absolute w-0.5 h-2.5 bg-cyan-300 rounded-full origin-bottom z-10"
              style={{
                transform: `rotate(${minDeg}deg) translateY(-50%)`,
                transition: 'transform 0.1s linear',
              }}
            />

            {/* Second Hand (Continuous smooth ticking) */}
            <div
              className="absolute w-[1px] h-3 bg-fuchsia-400 rounded-full origin-bottom z-15"
              style={{
                transform: `rotate(${secDeg}deg) translateY(-40%)`,
              }}
            />
          </div>

          {/* Live Digital Display Watch Info */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-white text-[11px] sm:text-xs tracking-wider neon-text-glow">
                {timeString}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-fuchsia-950/90 text-fuchsia-300 border border-fuchsia-700/50 font-mono hidden xs:inline">
                {dateString}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Rotating Live Clock</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Video Watch Count & Total Real-Time Earned Revenue */}
        <div
          onClick={() => setIsStatsModalOpen(true)}
          className="flex items-center gap-2 sm:gap-4 bg-zinc-900/80 hover:bg-purple-950/60 border border-purple-800/40 px-2.5 sm:px-3 py-1 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          {/* Active Viewers Counter */}
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-purple-950/80 text-cyan-400 group-hover:scale-105 transition-transform">
              <Eye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[9px] text-zinc-400 uppercase font-mono leading-none">Views Watching</div>
              <div className="text-[11px] sm:text-xs font-black text-cyan-300 font-mono leading-tight">
                {globalViewsCount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Watch Time Minutes */}
          <div className="hidden md:flex items-center gap-1.5 border-l border-purple-900/50 pl-3">
            <div className="p-1 rounded-lg bg-purple-950/80 text-fuchsia-400">
              <Play className="w-3.5 h-3.5 text-fuchsia-400 fill-current" />
            </div>
            <div>
              <div className="text-[9px] text-zinc-400 uppercase font-mono leading-none">Watch Time</div>
              <div className="text-[11px] sm:text-xs font-black text-fuchsia-300 font-mono leading-tight">
                {Math.floor(globalWatchMinutes).toLocaleString()} mins
              </div>
            </div>
          </div>

          {/* Total Earned Real-Time Revenue ($ USD) */}
          <div className="flex items-center gap-1.5 border-l border-purple-900/50 pl-2 sm:pl-3">
            <div className="p-1 rounded-lg bg-emerald-950/80 text-emerald-400 shadow-sm shadow-emerald-500/20">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[9px] text-zinc-400 uppercase font-mono leading-none">Total Ad Earned</div>
              <div className="text-[11px] sm:text-xs font-black text-emerald-400 font-mono leading-tight">
                ${totalEarnedRevenueUSD.toFixed(2)}
              </div>
            </div>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform hidden sm:block" />
        </div>
      </div>

      {/* Detailed Live Watch Time & Earnings Breakdown Modal */}
      {isStatsModalOpen && (
        <div
          id="watch-time-earnings-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsStatsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-zinc-950 border border-purple-800/80 rounded-3xl p-5 shadow-[0_0_50px_rgba(168,85,247,0.3)] space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-emerald-400 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
                  <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Live Watch & Monetization Engine</h3>
                  <p className="text-xs text-zinc-400 font-mono">Real-time Video Views & AdMob Revenue</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStatsModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Big Rotating Clock Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 via-zinc-900/80 to-zinc-950 border border-purple-800/50 text-center relative overflow-hidden">
              <div className="text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-200 to-cyan-300 neon-text-glow">
                {timeString}
              </div>
              <p className="text-xs text-fuchsia-300 font-mono mt-1">{dateString} · Live Precision Sync</p>
            </div>

            {/* 3 Metric Cards: Views, Watch Time, Revenue */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-purple-900/50">
                <Eye className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Video Views</div>
                <div className="text-sm font-black text-cyan-300 font-mono mt-0.5">
                  {globalViewsCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-purple-900/50">
                <Play className="w-4 h-4 text-fuchsia-400 fill-current mx-auto mb-1" />
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Watch Mins</div>
                <div className="text-sm font-black text-fuchsia-300 font-mono mt-0.5">
                  {Math.floor(globalWatchMinutes).toLocaleString()}m
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-emerald-900/60 shadow-inner">
                <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-[10px] text-emerald-400 uppercase font-mono">Total USD</div>
                <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                  ${totalEarnedRevenueUSD.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Explanation / Monetization Flow */}
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs space-y-2 text-zinc-300">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-[13px]">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Video Watch-Time Se Earning Kaise Hoti Hai?</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-400 list-disc pl-4 leading-relaxed">
                <li>
                  <strong className="text-white">High eCPM Ad Revenue:</strong> Jitne log Reels aur Videos dekhte hain, utna zyada Google AdMob revenue accumulate hota hai.
                </li>
                <li>
                  <strong className="text-white">80% Creator Revenue Share:</strong> Har creator ko uske video watch time ke hisab se automatic revenue credit milta hai.
                </li>
                <li>
                  <strong className="text-white">Instant Coin Rewards:</strong> Har 1 minute video dekhne par viewers ko +10 Coins milte hain!
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsStatsModalOpen(false);
                  if (onOpenReels) onOpenReels();
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Reels & Earn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
