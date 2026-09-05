import React, { useState, useEffect } from 'react';
import {
  AtSign,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldAlert,
  Crown,
  Share2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  PhoneCall,
  QrCode,
  UserCheck,
  RefreshCw,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import {
  checkUsernameDoc,
  claimUsernameInFirestore,
  subscribeToUsernamesRegistry,
  UsernameDoc
} from '../lib/firestoreService';

interface UsernameCheckerProps {
  currentUser: UserProfile | null;
  onUpdateUsername: (newUsername: string) => void;
  onInitiateCallToUser: (targetUsername: string) => void;
  onOpenAuth: () => void;
}

export const UsernameChecker: React.FC<UsernameCheckerProps> = ({
  currentUser,
  onUpdateUsername,
  onInitiateCallToUser,
  onOpenAuth,
}) => {
  const [inputVal, setInputVal] = useState<string>(currentUser?.username || '');
  const [debouncedVal, setDebouncedVal] = useState<string>(currentUser?.username || '');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [claimedSuccess, setClaimedSuccess] = useState<boolean>(false);
  const [isClaimingInDb, setIsClaimingInDb] = useState<boolean>(false);
  const [handlesRegistry, setHandlesRegistry] = useState<Record<string, UsernameDoc>>({});

  // Real-time Firestore handle listener
  useEffect(() => {
    const unsubscribe = subscribeToUsernamesRegistry((handles) => {
      setHandlesRegistry(handles);
    });
    return () => unsubscribe();
  }, []);

  // Debounce user input
  useEffect(() => {
    setIsChecking(true);
    const handler = setTimeout(() => {
      const sanitized = inputVal.trim().toLowerCase().replace(/^@/, '');
      setDebouncedVal(sanitized);
      setIsChecking(false);
    }, 250);

    return () => clearTimeout(handler);
  }, [inputVal]);

  const sanitized = debouncedVal;

  // Validation criteria
  const isLengthValid = sanitized.length >= 3 && sanitized.length <= 20;
  const isFormatValid = /^[a-zA-Z0-9_]+$/.test(sanitized);
  
  // Real Firestore handle lookup
  const registeredDoc = handlesRegistry[sanitized];
  const isTakenByOther = registeredDoc
    ? registeredDoc.ownerEmail !== currentUser?.email && registeredDoc.ownerUid !== currentUser?.id
    : ['admin', 'system', 'root', 'support', 'google'].includes(sanitized);

  const isCurrentUsersOwn = (registeredDoc && (registeredDoc.ownerEmail === currentUser?.email || registeredDoc.ownerUid === currentUser?.id)) ||
    currentUser?.username?.toLowerCase() === sanitized;

  let availabilityStatus: 'available' | 'claimed_by_you' | 'taken' | 'invalid' = 'available';
  let statusMessage = '';

  if (!isLengthValid || !isFormatValid) {
    availabilityStatus = 'invalid';
    statusMessage = 'Username must be 3-20 characters using letters, numbers, and underscores.';
  } else if (isCurrentUsersOwn) {
    availabilityStatus = 'claimed_by_you';
    statusMessage = `You already own @${sanitized} as your primary verified handle in Firebase Firestore.`;
  } else if (isTakenByOther) {
    availabilityStatus = 'taken';
    statusMessage = `@${sanitized} is currently claimed in Firestore by another verified creator.`;
  } else {
    availabilityStatus = 'available';
    statusMessage = `@${sanitized} is 100% available to claim immediately in Firestore database!`;
  }

  // Suggestions generator
  const getSuggestions = () => {
    const base = sanitized || currentUser?.username || 'creator';
    return [
      `${base}_live`,
      `${base}_neon`,
      `hey_${base}`,
      `${base}_pro`,
      `real_${base}`,
      `${base}_cyber`
    ].filter(s => s !== sanitized);
  };

  const handleClaim = async () => {
    if (availabilityStatus !== 'available') return;

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsClaimingInDb(true);
    try {
      // Save directly into Firestore database!
      const res = await claimUsernameInFirestore(sanitized, currentUser);

      // Fire purple/fuchsia neon confetti celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#d946ef', '#06b6d4', '#ec4899', '#ffffff'],
      });

      onUpdateUsername(sanitized);
      setClaimedSuccess(true);
      setTimeout(() => setClaimedSuccess(false), 4000);
    } catch (e) {
      console.error('Error claiming handle:', e);
    } finally {
      setIsClaimingInDb(false);
    }
  };

  const handleCopyLink = () => {
    const handle = currentUser?.username || sanitized || 'creator';
    const link = `https://neoncall.studio/@${handle}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div id="username-checker-container" className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-purple-500/30 neon-border-purple overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Crown className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
              <span>Verified Creator Identity System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Username Registry & Availability Checker
            </h2>
            <p className="mt-1 text-sm text-purple-200/70 max-w-xl">
              Claim your exclusive purple neon handle for 1-click video and audio calling. Connect directly with other creators across the globe.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              id="preset-vip-btn"
              type="button"
              onClick={() => setInputVal('vip_creator')}
              className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/50 text-xs font-mono text-fuchsia-300 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Zap className="w-3 h-3 text-fuchsia-400" />
              <span>@vip_creator</span>
            </button>
            <button
              id="preset-cyber-btn"
              type="button"
              onClick={() => setInputVal('cyber_studio')}
              className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900/50 border border-purple-800 text-xs font-mono text-purple-300 transition-all cursor-pointer"
            >
              @cyber_studio
            </button>
            <button
              id="preset-neon-btn"
              type="button"
              onClick={() => setInputVal('neon_live')}
              className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900/50 border border-purple-800 text-xs font-mono text-purple-300 transition-all cursor-pointer"
            >
              @neon_live
            </button>
          </div>
        </div>
      </div>

      {/* Main Checker Interactive Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Search & Validation */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-950/90 border border-purple-900/50 shadow-xl space-y-5">
            <div>
              <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
                Type or Search Any Handle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
                  <AtSign className="w-5 h-5" />
                </div>
                <input
                  id="username-checker-input"
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="Enter handle (e.g. your_handle)"
                  className="w-full pl-11 pr-12 py-3.5 bg-zinc-900/90 border-2 border-purple-600/40 rounded-xl text-lg font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  {isChecking ? (
                    <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                  ) : availabilityStatus === 'available' || availabilityStatus === 'claimed_by_you' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Status Banner */}
            <div
              id="username-status-badge"
              className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                availabilityStatus === 'claimed_by_you'
                  ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                  : availabilityStatus === 'available'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              {availabilityStatus === 'available' || availabilityStatus === 'claimed_by_you' ? (
                <Sparkles className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    {availabilityStatus === 'claimed_by_you'
                      ? 'CURRENT USER HANDLE'
                      : availabilityStatus === 'available'
                      ? 'HANDLE AVAILABLE'
                      : 'UNAVAILABLE'}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    @{sanitized || currentUser?.username || 'handle'}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed opacity-90">{statusMessage}</p>
              </div>
            </div>

            {/* Live Criteria Matrix */}
            <div className="space-y-2 pt-2 border-t border-purple-950">
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                Handle Criteria Verification:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`p-2 rounded-lg border flex items-center gap-2 ${
                    isLengthValid
                      ? 'bg-purple-950/40 border-purple-800/60 text-purple-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {isLengthValid ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                  <span>3 - 20 Characters</span>
                </div>

                <div
                  className={`p-2 rounded-lg border flex items-center gap-2 ${
                    isFormatValid
                      ? 'bg-purple-950/40 border-purple-800/60 text-purple-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {isFormatValid ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                  <span>No Special Characters</span>
                </div>

                <div
                  className={`p-2 rounded-lg border flex items-center gap-2 ${
                    !isTakenByOther
                      ? 'bg-purple-950/40 border-purple-800/60 text-purple-200'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}
                >
                  {!isTakenByOther ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>Unique & Unoccupied</span>
                </div>

                <div
                  className={`p-2 rounded-lg border flex items-center gap-2 ${
                    currentUser?.role === 'admin'
                      ? 'bg-fuchsia-950/50 border-fuchsia-600/60 text-fuchsia-200'
                      : 'bg-purple-950/40 border-purple-800/60 text-purple-300'
                  }`}
                >
                  {currentUser?.role === 'admin' ? (
                    <Crown className="w-3.5 h-3.5 text-fuchsia-400" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>{currentUser?.role === 'admin' ? 'Master Admin Tier' : 'Standard Tier'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <button
                id="claim-username-btn"
                type="button"
                onClick={handleClaim}
                disabled={
                  isClaimingInDb || availabilityStatus !== 'available'
                }
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-500 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isClaimingInDb ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    <span>Registering to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>
                      {claimedSuccess
                        ? '🎉 Successfully Saved to Firestore!'
                        : `Claim @${sanitized || currentUser?.username || 'handle'}`}
                    </span>
                  </>
                )}
              </button>

              <button
                id="direct-call-username-btn"
                type="button"
                onClick={() => onInitiateCallToUser(sanitized || currentUser?.username || 'creator')}
                className="py-3 px-5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-fuchsia-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call @{sanitized || currentUser?.username || 'creator'}</span>
              </button>
            </div>
          </div>

          {/* Alternate Suggestions */}
          <div className="p-5 rounded-2xl bg-zinc-950/60 border border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                Smart Alternative Handles
              </span>
              <span className="text-[11px] text-zinc-500">Instant pick</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getSuggestions().map((sug) => (
                <button
                  key={sug}
                  id={`suggestion-${sug}-btn`}
                  type="button"
                  onClick={() => setInputVal(sug)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-purple-900/60 border border-purple-900/60 hover:border-purple-500 text-xs font-mono text-purple-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>@{sug}</span>
                  <ArrowRight className="w-3 h-3 text-purple-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Neon VIP Identity Card & Direct Link Hub */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identity Pass Card */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-b from-purple-950/80 via-zinc-950 to-zinc-950 border border-purple-500/40 neon-border-purple text-white shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-2xl" />

            <div className="flex items-center justify-between pb-4 border-b border-purple-900/60">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold tracking-wider text-purple-300 uppercase">
                  NeonCall Studio Pass
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/80 text-fuchsia-300 border border-purple-600 font-mono">
                PASS #{sanitized.length * 4821}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-fuchsia-400/80 shadow-lg shadow-purple-900/50"
                />
                <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1 border border-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {currentUser?.name || 'Instagrand User'}
                </h3>
                <div className="inline-flex items-center gap-1.5 text-sm font-mono text-fuchsia-400 font-bold">
                  <AtSign className="w-3.5 h-3.5" />
                  <span>{currentUser?.username || sanitized || 'user'}</span>
                </div>
                {currentUser?.email && (
                  <p className="text-[11px] text-purple-300/70">
                    {currentUser.email}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-900/50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Audio/Video Protocol</span>
                <span className="font-mono text-emerald-400 font-semibold">WebRTC 4K Opus</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Handle Security</span>
                <span className="font-mono text-fuchsia-300 font-semibold">Google OAuth Bound</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Direct Dial Link</span>
                <span className="font-mono text-purple-300 truncate max-w-[170px]">
                  neoncall.studio/@{currentUser?.username || sanitized || 'creator'}
                </span>
              </div>
            </div>

            {/* Shareable Link Box */}
            <div className="mt-5 p-3 rounded-xl bg-zinc-900/90 border border-purple-800/60 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-purple-200 truncate">
                https://neoncall.studio/@{currentUser?.username || sanitized || 'creator'}
              </span>
              <button
                id="copy-user-call-link-btn"
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
