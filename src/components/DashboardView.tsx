import React, { useState } from 'react';
import {
  Video,
  Mic,
  AtSign,
  Crown,
  Sparkles,
  PhoneCall,
  Activity,
  Shield,
  Zap,
  ArrowRight,
  Radio,
  Share2,
  Users,
  CheckCircle2,
  BellRing,
  Download,
  RotateCw,
  Coins
} from 'lucide-react';
import { UserProfile, ViewTab } from '../types';
import { LuckySpinBanner } from './LuckySpinBanner';

interface DashboardViewProps {
  currentUser: UserProfile | null;
  onNavigateTab: (tab: ViewTab) => void;
  onStartCall: (roomId: string, targetUser?: string) => void;
  onTriggerSimulatedIncomingCall: () => void;
  onOpenAuth: () => void;
  onOpenLuckySpin?: () => void;
  onOpenAppUpdate?: () => void;
  onOpenTrafficWidget?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigateTab,
  onStartCall,
  onTriggerSimulatedIncomingCall,
  onOpenAuth,
  onOpenLuckySpin,
  onOpenAppUpdate,
  onOpenTrafficWidget,
}) => {
  const [customRoomInput, setCustomRoomInput] = useState<string>('neon-studio-lounge');
  const [directDialHandle, setDirectDialHandle] = useState<string>('naushad');

  return (
    <div id="dashboard-view-container" className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* 1. Daily Lucky Spin & Win Shortcut Banner */}
      {onOpenLuckySpin && (
        <LuckySpinBanner
          onOpenLuckySpin={onOpenLuckySpin}
          currentUser={currentUser}
        />
      )}

      {/* Hero Welcome Banner */}
      <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-950 via-purple-950/40 to-zinc-950 border border-purple-500/40 neon-border-purple text-white overflow-hidden shadow-2xl">
        {/* Glow ambient spots */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-fuchsia-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>Next-Gen Purple Neon Calling Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ultra-HD Video & Audio <br />
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                With @naushad Direct Dial
              </span>
            </h1>

            <p className="text-sm sm:text-base text-purple-200/70 max-w-xl leading-relaxed">
              Experience seamless WebRTC 4K video, real-time audio waveform spectrums, cybernetic filters, and Google Identity verification with your custom @username handle.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                id="hero-launch-studio-btn"
                type="button"
                onClick={() => onStartCall(customRoomInput)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-500 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-purple-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Video className="w-5 h-5 text-cyan-200" />
                <span>Launch Live Video Studio</span>
                <ArrowRight className="w-4 h-4 text-purple-200" />
              </button>

              <button
                id="hero-check-handle-btn"
                type="button"
                onClick={() => onNavigateTab('username-checker')}
                className="px-6 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-purple-950/80 border border-purple-500/40 text-purple-200 font-semibold text-sm flex items-center gap-2 transition-all hover:border-purple-400 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Verify @naushad Handle</span>
              </button>
            </div>
          </div>

          {/* Quick Stats & Live Preview Box */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-zinc-950/90 border border-purple-500/30 neon-border-purple space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/60">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Engine Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Audio/Video Protocol</span>
                <span className="font-mono text-cyan-300 font-semibold">WebRTC 4K Opus</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Google OAuth State</span>
                <span className="font-mono text-purple-300 font-semibold">
                  {currentUser ? 'Authenticated' : 'Guest Mode'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Current Handle</span>
                <span className="font-mono text-fuchsia-400 font-bold">
                  @{currentUser?.username || 'naushad'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Latency Target</span>
                <span className="font-mono text-emerald-400 font-semibold">&lt; 20 ms</span>
              </div>
            </div>

            <button
              id="test-incoming-call-btn"
              type="button"
              onClick={onTriggerSimulatedIncomingCall}
              className="w-full mt-2 py-2.5 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-600/50 text-fuchsia-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Simulate Incoming Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Direct Room Dial */}
        <div className="p-6 rounded-3xl bg-zinc-950/80 border border-purple-900/50 hover:border-purple-500/60 transition-all flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-600/50 flex items-center justify-center mb-4 text-fuchsia-400 shadow-md">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Join / Create Room</h3>
            <p className="text-xs text-purple-300/70 mt-1 leading-relaxed">
              Enter any studio room code for multi-user purple neon conference.
            </p>

            <div className="mt-4">
              <input
                id="custom-room-code-input"
                type="text"
                value={customRoomInput}
                onChange={(e) => setCustomRoomInput(e.target.value)}
                placeholder="e.g. room-cyber-101"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-purple-800/60 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <button
            id="start-custom-room-btn"
            type="button"
            onClick={() => onStartCall(customRoomInput)}
            className="mt-5 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Enter Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: 1-Click Dial @naushad */}
        <div className="p-6 rounded-3xl bg-zinc-950/80 border border-purple-900/50 hover:border-purple-500/60 transition-all flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-600/50 flex items-center justify-center mb-4 text-fuchsia-300 shadow-md">
              <AtSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Direct Handle Dial</h3>
            <p className="text-xs text-purple-300/70 mt-1 leading-relaxed">
              Dial directly to @naushad or any creator's registered handle.
            </p>

            <div className="mt-4 relative">
              <span className="absolute left-3 top-2.5 text-fuchsia-400 font-mono text-xs">@</span>
              <input
                id="direct-dial-handle-input"
                type="text"
                value={directDialHandle}
                onChange={(e) => setDirectDialHandle(e.target.value.replace(/^@/, ''))}
                placeholder="naushad"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-purple-800/60 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <button
            id="call-handle-btn"
            type="button"
            onClick={() => onStartCall(`call-with-${directDialHandle}`, directDialHandle)}
            className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-cyan-300" />
            <span>Call @{directDialHandle || 'naushad'}</span>
          </button>
        </div>

        {/* Card 3: Google Auth & Verified Access */}
        <div className="p-6 rounded-3xl bg-zinc-950/80 border border-purple-900/50 hover:border-purple-500/60 transition-all flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-600/50 flex items-center justify-center mb-4 text-cyan-400 shadow-md">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Google Identity & Studio Access</h3>
            <p className="text-xs text-purple-300/70 mt-1 leading-relaxed">
              Verify your Google identity, claim your handle, and manage HD audio/video credentials.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-zinc-900/90 border border-purple-900/60 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-300">
                {currentUser ? currentUser.name : 'Google Sign-In Ready'}
              </span>
            </div>
          </div>

          <button
            id="dashboard-google-auth-btn"
            type="button"
            onClick={onOpenAuth}
            className="mt-5 w-full py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>{currentUser ? 'Manage Google Identity' : 'Sign in with Google'}</span>
          </button>
        </div>
      </div>

      {/* Monetization & Software Update Quick-Actions Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {onOpenAppUpdate && (
          <div
            onClick={onOpenAppUpdate}
            className="p-5 rounded-3xl bg-zinc-950/90 border border-purple-800/40 hover:border-purple-400/80 transition-all cursor-pointer shadow-lg flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-950/80 border border-purple-500/50 text-fuchsia-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> New Release Available
                </span>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-200">
                  Update to v2.6.4 Ultra-Neon Pro
                </h4>
                <p className="text-[11px] text-zinc-400">Trigger high-value update ad burst +50 coins</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
        )}

        {onOpenTrafficWidget && (
          <div
            onClick={onOpenTrafficWidget}
            className="p-5 rounded-3xl bg-zinc-950/90 border border-purple-800/40 hover:border-cyan-400/80 transition-all cursor-pointer shadow-lg flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-300 font-bold">
                  ₹12.50 / GB Yield Rate
                </span>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-200">
                  Live Traffic & Bandwidth Meter
                </h4>
                <p className="text-[11px] text-zinc-400">Real-time media streaming ad mediation</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );
};
