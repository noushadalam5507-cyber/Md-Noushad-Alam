import React, { useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Eye,
  Heart,
  DollarSign,
  Coins,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Play,
  Share2,
  MessageSquare,
  HelpCircle,
  Clock,
  Award,
  Zap,
  Target,
  FileText,
  Bookmark,
  Bell,
  ArrowUpRight,
  Filter,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, ViewTab } from '../types';

interface ProfessionalDashboardViewProps {
  currentUser: UserProfile | null;
  onNavigateTab: (tab: ViewTab) => void;
  onOpenSettings?: () => void;
}

export const ProfessionalDashboardView: React.FC<ProfessionalDashboardViewProps> = ({
  currentUser,
  onNavigateTab,
  onOpenSettings,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeSubModal, setActiveSubModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics by time range
  const metricsData = {
    '7d': {
      reached: '14,280',
      reachedPct: '+42.5%',
      engaged: '2,890',
      engagedPct: '+31.8%',
      followers: '8,420',
      followersGrowth: '+115',
      earnings: '₹32,450',
      earningsUsd: '$390.00',
      cpm: '₹145.20',
      impressions: '184.2K',
    },
    '30d': {
      reached: '48,920',
      reachedPct: '+112.4%',
      engaged: '9,450',
      engagedPct: '+84.2%',
      followers: '8,420',
      followersGrowth: '+640',
      earnings: '₹1,42,800',
      earningsUsd: '$1,720.50',
      cpm: '₹162.80',
      impressions: '840.6K',
    },
    '90d': {
      reached: '124,500',
      reachedPct: '+215.0%',
      engaged: '28,100',
      engagedPct: '+164.7%',
      followers: '8,420',
      followersGrowth: '+1,820',
      earnings: '₹3,88,200',
      earningsUsd: '$4,680.00',
      cpm: '₹158.40',
      impressions: '2.45M',
    },
    'all': {
      reached: '380,000',
      reachedPct: '+420.0%',
      engaged: '82,400',
      engagedPct: '+310.5%',
      followers: '8,420',
      followersGrowth: '+8,420',
      earnings: '₹8,92,400',
      earningsUsd: '$10,750.00',
      cpm: '₹160.00',
      impressions: '6.8M',
    },
  }[timeRange];

  // Top Performing Content list
  const topReels = [
    {
      id: 'tr1',
      title: 'Direct 4K Opus Call with @naushad Live',
      type: 'Reel',
      reach: '24.2K',
      views: '38.6K',
      likes: '4.8K',
      shares: '1.2K',
      earnings: '₹6,400',
      thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'tr2',
      title: 'Jharkhand to Mumbai Tech Hustle 🚀',
      type: 'Reel',
      reach: '18.9K',
      views: '29.1K',
      likes: '3.9K',
      shares: '940',
      earnings: '₹4,850',
      thumb: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'tr3',
      title: 'Instagrand N A 3D Hologram Setup',
      type: 'Reel',
      reach: '15.4K',
      views: '22.8K',
      likes: '3.1K',
      shares: '710',
      earnings: '₹3,900',
      thumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div id="professional-dashboard-screen" className="max-w-xl mx-auto space-y-5 pb-24 animate-fade-in px-3 sm:px-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-amber-500 text-white font-bold text-xs shadow-2xl animate-bounce border border-amber-300/40">
          {toastMessage}
        </div>
      )}

      {/* Top Header Bar (Instagram Style) */}
      <div className="flex items-center justify-between pt-2 pb-1 sticky top-16 z-30 bg-zinc-950/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            id="pd-back-btn"
            type="button"
            onClick={() => onNavigateTab('profile')}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white transition-all cursor-pointer"
            aria-label="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">
              Professional dashboard
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">
              @{currentUser?.username || 'naushad'} · Creator Account
            </p>
          </div>
        </div>

        {/* Date Filter Pill */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-purple-900/40 text-[11px]">
          {(['7d', '30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === r
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All' : r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Insights Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/90 via-zinc-950 to-zinc-950 border border-purple-500/50 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
              Account Insights
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {timeRange === '30d' ? 'Last 30 Days' : timeRange === '7d' ? 'Last 7 Days' : timeRange === '90d' ? 'Last 90 Days' : 'Lifetime'}
          </span>
        </div>

        {/* Big Reached Stats */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-purple-900/40 space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium block">Accounts reached</span>
            <div className="text-2xl font-black text-white">{metricsData.reached}</div>
            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <span>{metricsData.reachedPct}</span>
              <span className="text-zinc-500 font-normal">vs previous</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-purple-900/40 space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium block">Accounts engaged</span>
            <div className="text-2xl font-black text-white">{metricsData.engaged}</div>
            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <span>{metricsData.engagedPct}</span>
              <span className="text-zinc-500 font-normal">vs previous</span>
            </div>
          </div>
        </div>

        {/* Second Row: Followers Growth & Total Impressions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-purple-900/40 space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium block">Total followers</span>
            <div className="text-xl font-black text-fuchsia-400">{metricsData.followers}</div>
            <div className="text-[11px] text-zinc-400 font-medium">
              <span className="text-cyan-300 font-bold">{metricsData.followersGrowth}</span> in selected period
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-purple-900/40 space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium block">Total Impressions</span>
            <div className="text-xl font-black text-amber-300">{metricsData.impressions}</div>
            <div className="text-[11px] text-zinc-400 font-medium">
              Avg CPM: <span className="text-emerald-400 font-bold">{metricsData.cpm}</span>
            </div>
          </div>
        </div>

        {/* Visual Simulated SVG Chart (Instagram Reach Waveform) */}
        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-purple-900/30 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Daily Reach & Engagement Trend</span>
            <span className="text-emerald-400 font-bold">● Reached  ● Engaged</span>
          </div>
          <div className="h-20 w-full flex items-end justify-between gap-1 pt-2">
            {[45, 60, 52, 78, 65, 90, 85, 110, 95, 125, 140, 130, 160, 185, 210, 195, 230, 260].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  style={{ height: `${(val / 260) * 100}%` }}
                  className="w-full rounded-t-md bg-gradient-to-t from-purple-700 via-fuchsia-500 to-cyan-400 group-hover:brightness-125 transition-all"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
            <span>Day 1</span>
            <span>Day 15</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Monetization & Earnings Breakdown Card (Credited to @naushad) */}
      <div className="p-5 rounded-3xl bg-zinc-950/90 border border-amber-500/50 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/40">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Creator Payouts & AdMob Revenue
              </span>
              <div className="text-xl font-black text-white flex items-center gap-2">
                <span>{metricsData.earnings}</span>
                <span className="text-xs font-normal text-zinc-400">({metricsData.earningsUsd})</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Active · 70% Share
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-purple-900/40">
            <span className="text-[10px] text-zinc-400 block">Reels Ads</span>
            <span className="font-bold text-fuchsia-300">₹88,200</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-purple-900/40">
            <span className="text-[10px] text-zinc-400 block">Direct Calls</span>
            <span className="font-bold text-cyan-300">₹36,400</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-purple-900/40">
            <span className="text-[10px] text-zinc-400 block">AI Approvals</span>
            <span className="font-bold text-emerald-300">₹14,500</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-purple-900/40">
            <span className="text-[10px] text-zinc-400 block">Data Net (AdMob)</span>
            <span className="font-bold text-amber-300">₹22,800</span>
          </div>
        </div>

        {/* Data Network Monetization Info Banner */}
        <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-cyan-300">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Bandwidth Net Usage: <strong>1.82 TB</strong> consumed (Direct AdMob Pool Payout)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">₹12.50/GB</span>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-purple-900/40 text-xs">
          <span className="text-zinc-400">Payout Beneficiary:</span>
          <span className="font-bold text-purple-200">MD Naushad Alam (HDFC Bank / UPI)</span>
        </div>
      </div>

      {/* Your Tools Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
          Your tools
        </h2>

        <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden divide-y divide-purple-950">
          {/* Tool 1: Monetization Status */}
          <button
            type="button"
            onClick={() => {
              confetti({ particleCount: 40, spread: 60 });
              showToast('Monetization is fully active! 70% Ad revenue share credited.');
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Monetization
                </div>
                <div className="text-xs text-zinc-400">
                  Eligible · All monetization tools active
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400">Eligible</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
          </button>

          {/* Tool 2: Ad Tools / Promotions */}
          <button
            type="button"
            onClick={() => showToast('Boost Reel & Story Ad Promotion setup opened.')}
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Ad tools
                </div>
                <div className="text-xs text-zinc-400">
                  Boost reels, posts, and reach new audience
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Tool 3: Branded Content & Sponsorships */}
          <button
            type="button"
            onClick={() => showToast('Branded Content Tag approvals: Active')}
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Branded content
                </div>
                <div className="text-xs text-zinc-400">
                  Tag brand partners & manage sponsorship deals
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Tool 4: Saved Quick Replies */}
          <button
            type="button"
            onClick={() => showToast('Quick DM templates synchronized.')}
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Saved replies
                </div>
                <div className="text-xs text-zinc-400">
                  Instant keyboard shortcuts for direct messaging
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Tool 5: Gift & Coin Tip Jar */}
          <button
            type="button"
            onClick={() => showToast('Gifts on Reels is enabled! Earn 40 coins per tip.')}
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Gifts & Badges on Reels
                </div>
                <div className="text-xs text-zinc-400">
                  Allow followers to send coin gifts during videos
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400">Enabled</span>
          </button>
        </div>
      </div>

      {/* Top Performing Content Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Top Performing Reels
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('reels')}
            className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300"
          >
            See all
          </button>
        </div>

        <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 p-4 space-y-3">
          {topReels.map((reel) => (
            <div
              key={reel.id}
              className="flex items-center gap-3 p-2 rounded-2xl bg-zinc-900/70 border border-purple-950 hover:border-purple-800/60 transition-all"
            >
              <div className="w-14 h-16 rounded-xl overflow-hidden relative shrink-0">
                <img src={reel.thumb} alt={reel.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/60 text-[9px] text-white flex items-center gap-0.5">
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>{reel.reach}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{reel.title}</div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>{reel.views}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-400" />
                    <span>{reel.likes}</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <Coins className="w-3 h-3" />
                    <span>{reel.earnings}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips & Growth Resources */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
          Tips and resources
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-zinc-950 border border-purple-800/40 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-fuchsia-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Trending Audio Library</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Use viral Hindi, Slowed, and Sufi beats in Reels to boost recommendation algorithms by up to 300%.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('music')}
              className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1"
            >
              <span>Explore Audio</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-zinc-950 border border-cyan-800/40 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">AI Creator Assistant</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Generate viral captions, trending hashtags, and video hooks powered by Google Gemini AI.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('create')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Open AI Creator</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
