import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Shield,
  Bookmark,
  Archive,
  Activity,
  Bell,
  Clock,
  Tablet,
  BarChart3,
  Sliders,
  CreditCard,
  CheckCircle2,
  Lock,
  Star,
  Share2,
  Ban,
  Radio,
  Users,
  MessageCircle,
  AtSign,
  MessageSquare,
  Repeat,
  Smile,
  ShieldAlert,
  SlidersHorizontal,
  FileText,
  UserPlus,
  VolumeX,
  SlidersVertical,
  Heart,
  Smartphone,
  Download,
  Accessibility,
  Languages,
  Wifi,
  Globe,
  Home,
  ShoppingBag,
  HelpCircle,
  Bot,
  Info,
  Layers,
  LogOut,
  PlusCircle,
  Sparkles,
  Crown,
  Check,
  X,
  Upload,
  Coins,
  DollarSign,
  Fingerprint,
  Grid3X3,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, ViewTab, AppLockConfig } from '../types';
import { AppLockSettingsModal } from './AppLockSettingsModal';
import { getStoredAppLockConfig, saveStoredAppLockConfig } from '../utils/appLockStorage';
import { InstallAppPinModal } from './InstallAppPinModal';

interface SettingsActivityViewProps {
  currentUser: UserProfile | null;
  onNavigateTab: (tab: ViewTab) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onLockNow?: () => void;
  onOpenLuckySpin?: () => void;
  onOpenAppUpdate?: () => void;
  onOpenTrafficWidget?: () => void;
}

export const SettingsActivityView: React.FC<SettingsActivityViewProps> = ({
  currentUser,
  onNavigateTab,
  onOpenAuth,
  onLogout,
  onLockNow,
  onOpenLuckySpin,
  onOpenAppUpdate,
  onOpenTrafficWidget,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAppLockModalOpen, setIsAppLockModalOpen] = useState<boolean>(false);
  const [isInstallPinModalOpen, setIsInstallPinModalOpen] = useState<boolean>(false);
  const [appLockConfig, setAppLockConfig] = useState<AppLockConfig>(getStoredAppLockConfig());

  // Listen to external app lock updates
  useEffect(() => {
    const handleUpdate = () => {
      setAppLockConfig(getStoredAppLockConfig());
    };
    window.addEventListener('instagrand:applock-updated', handleUpdate);
    return () => window.removeEventListener('instagrand:applock-updated', handleUpdate);
  }, []);

  // Dynamic Toggle States
  const [isPrivateAccount, setIsPrivateAccount] = useState<boolean>(false);
  const [isVerifiedSubscribed, setIsVerifiedSubscribed] = useState<boolean>(currentUser?.isVerified ?? true);
  const [highQualityUploads, setHighQualityUploads] = useState<boolean>(true);
  const [dataSaverMode, setDataSaverMode] = useState<boolean>(false);
  const [pauseAllNotifications, setPauseAllNotifications] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English (US)');
  const [limitInteractions, setLimitInteractions] = useState<boolean>(false);
  const [hideLikeCounts, setHideLikeCounts] = useState<boolean>(false);

  // Close friends count & state
  const [closeFriendsCount, setCloseFriendsCount] = useState<number>(1);
  const [blockedAccountsCount, setBlockedAccountsCount] = useState<number>(0);
  const [restrictedCount, setRestrictedCount] = useState<number>(1);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [mutedCount, setMutedCount] = useState<number>(1);

  // AI Support Assistant State
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [supportChat, setSupportChat] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Hello! I am Instagrand AI Support Assistant. How can I assist you with your @naushad account, monetization, or settings today?',
      time: 'Just now',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    const userText = supportMessage;
    setSupportChat((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Just now' },
    ]);
    setSupportMessage('');

    setTimeout(() => {
      let botReply = "Thank you for reaching out to Instagrand Support. Your query regarding @" + (currentUser?.username || 'user') + " has been logged and our automated AI assistant has verified your active account status.";
      if (userText.toLowerCase().includes('monetization') || userText.toLowerCase().includes('payout') || userText.toLowerCase().includes('money')) {
        botReply = "Your Creator Monetization is Active with a 70% Ad Revenue Share. Payouts are scheduled to " + (currentUser?.name || 'your linked wallet') + " via direct bank/UPI transfer.";
      } else if (userText.toLowerCase().includes('verified') || userText.toLowerCase().includes('badge') || userText.toLowerCase().includes('blue')) {
        botReply = "Your Instagrand Verified badge is authenticated with Google Identity & Firebase. Your profile features the exclusive verified creator checkmark.";
      }
      setSupportChat((prev) => [
        ...prev,
        { sender: 'bot', text: botReply, time: 'Just now' },
      ]);
    }, 600);
  };

  // Helper filter function for search
  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div id="settings-and-activity-screen" className="max-w-xl mx-auto space-y-4 pb-28 animate-fade-in px-3 sm:px-0">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-amber-500 text-white font-bold text-xs shadow-2xl animate-bounce border border-amber-300/40">
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center gap-3 pt-2 pb-1 sticky top-16 z-30 bg-zinc-950/90 backdrop-blur-md">
        <button
          id="settings-back-btn"
          type="button"
          onClick={() => onNavigateTab('profile')}
          className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white transition-all cursor-pointer"
          aria-label="Back to Profile"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black text-white">Settings and activity</h1>
      </div>

      {/* Search Input Bar (Matching Instagram) */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="settings-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search settings..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/40 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: YOUR ACCOUNT (ACCOUNTS CENTER) */}
      {/* ========================================================================= */}
      {matchesSearch('Accounts Center Password security personal details ad preferences Meta Instagrand') && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Your account</span>
            <span className="text-[10px] font-black text-purple-400 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-fuchsia-400" />
              Meta / Instagrand
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveModalId('accounts-center')}
            className="w-full p-4 rounded-3xl bg-zinc-950/90 border border-purple-900/50 hover:bg-zinc-900/60 transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-300 mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Accounts Center
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                  Password, security, personal details, connected experiences, ad preferences
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
          </button>

          {/* IN-APP APP LOCK PROMINENT SETTINGS CARD */}
          <div className="w-full p-4 rounded-3xl bg-gradient-to-r from-purple-950/80 via-zinc-950/90 to-fuchsia-950/70 border-2 border-purple-500/50 hover:border-purple-400/80 transition-all text-left flex items-center justify-between shadow-[0_0_25px_rgba(168,85,247,0.2)] group">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-400 p-0.5 shadow-md mt-0.5">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-purple-300">
                  {appLockConfig.lockType === 'biometric' ? (
                    <Fingerprint className="w-5 h-5 text-fuchsia-400" />
                  ) : appLockConfig.lockType === 'pattern' ? (
                    <Grid3X3 className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <KeyRound className="w-5 h-5 text-purple-400" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    In-App App Lock
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono border ${
                      appLockConfig.isEnabled
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {appLockConfig.isEnabled ? `Active (${appLockConfig.lockType})` : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-purple-200/80 leading-relaxed max-w-sm">
                  Biometric, 4-Digit PIN, or Pattern lock to protect private account & wallet on reopen
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appLockConfig.isEnabled}
                  onChange={(e) => {
                    const newVal = e.target.checked;
                    const updated = { ...appLockConfig, isEnabled: newVal };
                    setAppLockConfig(updated);
                    saveStoredAppLockConfig(updated);
                    if (newVal) {
                      confetti({ particleCount: 30, spread: 50 });
                      showToast('🔒 In-App App Lock Enabled');
                    } else {
                      showToast('🔓 In-App App Lock Disabled');
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-fuchsia-600 shadow-inner"></div>
              </label>

              <button
                type="button"
                onClick={() => setIsAppLockModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold border border-purple-500/40 transition-colors cursor-pointer"
              >
                Configure
              </button>
            </div>
          </div>

          {/* DAILY LUCKY SPIN & WIN SETTINGS CARD */}
          {onOpenLuckySpin && (
            <button
              type="button"
              onClick={onOpenLuckySpin}
              className="w-full p-4 rounded-3xl bg-zinc-950/90 border border-purple-900/50 hover:bg-zinc-900/60 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <span>Daily Lucky Spin & Win Wheel</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold">
                      1 Free / Day
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                    Win jackpot reward coins, VIP multipliers, and extra spins with Rewarded Video Ads
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
            </button>
          )}

          {/* SOFTWARE UPDATE & HIGH-ECPM BURST */}
          {onOpenAppUpdate && (
            <button
              type="button"
              onClick={onOpenAppUpdate}
              className="w-full p-4 rounded-3xl bg-zinc-950/90 border border-purple-900/50 hover:bg-zinc-900/60 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-300 mt-0.5">
                  <Download className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white group-hover:text-fuchsia-300 transition-colors flex items-center gap-2">
                    <span>Software Updates & High-eCPM Release</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-fuchsia-300 font-mono font-bold">
                      v2.6.4 Ready
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                    Check for OTA updates and trigger high-value update ad burst milestone for +50 coins
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
            </button>
          )}

          {/* TRAFFIC & BANDWIDTH MONETIZATION METER */}
          {onOpenTrafficWidget && (
            <button
              type="button"
              onClick={onOpenTrafficWidget}
              className="w-full p-4 rounded-3xl bg-zinc-950/90 border border-purple-900/50 hover:bg-zinc-900/60 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mt-0.5">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <span>Data Usage & Bandwidth Monetization</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                      ₹12.50 / GB
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                    Real-time audio, reels, and video call traffic tracking linked with background ad mediation
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: HOW YOU USE INSTAGRAM */}
      {/* ========================================================================= */}
      {(matchesSearch('Saved') || matchesSearch('Archive') || matchesSearch('Your activity') || matchesSearch('Notifications') || matchesSearch('Time management') || matchesSearch('Instagram for tablets')) && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            How you use Instagram
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden divide-y divide-purple-950/70">
            {/* 1. Saved */}
            {matchesSearch('Saved') && (
              <button
                type="button"
                onClick={() => setActiveModalId('saved')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Saved</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* 2. Archive */}
            {matchesSearch('Archive') && (
              <button
                type="button"
                onClick={() => setActiveModalId('archive')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Archive className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Archive</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* 3. Your Activity */}
            {matchesSearch('Your activity') && (
              <button
                type="button"
                onClick={() => setActiveModalId('activity')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Your activity</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* 4. Notifications */}
            {matchesSearch('Notifications') && (
              <button
                type="button"
                onClick={() => setActiveModalId('notifications')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{pauseAllNotifications ? 'Paused' : 'On'}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* 5. Time Management */}
            {matchesSearch('Time management') && (
              <button
                type="button"
                onClick={() => setActiveModalId('time-management')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Time management</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* 6. Instagram for tablets */}
            {matchesSearch('Instagram for tablets') && (
              <button
                type="button"
                onClick={() => showToast('Tablet & Multi-window responsive mode is enabled.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Tablet className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Instagram for tablets</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: YOUR INSIGHTS AND TOOLS */}
      {/* ========================================================================= */}
      {(matchesSearch('Professional dashboard') || matchesSearch('Account type and tools') || matchesSearch('Ads payments')) && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Your insights and tools
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden divide-y divide-purple-950/70">
            {/* 1. Professional Dashboard */}
            {matchesSearch('Professional dashboard') && (
              <button
                type="button"
                onClick={() => onNavigateTab('professional-dashboard')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition-colors text-left cursor-pointer group bg-gradient-to-r from-purple-950/40 to-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-600/30 text-fuchsia-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-purple-200">Professional dashboard</span>
                    <p className="text-[11px] text-fuchsia-300">48.9K accounts reached · ₹1,42,800 earned</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* 2. Account type and tools */}
            {matchesSearch('Account type and tools') && (
              <button
                type="button"
                onClick={() => setActiveModalId('account-type-tools')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Sliders className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Account type and tools</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* 3. Ads payments */}
            {matchesSearch('Ads payments') && (
              <button
                type="button"
                onClick={() => setActiveModalId('ads-payments')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Ads payments</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: SUBSCRIPTIONS */}
      {/* ========================================================================= */}
      {matchesSearch('Meta Verified Subscriptions Blue Badge') && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Subscriptions
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveModalId('meta-verified')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                <span className="text-sm font-semibold text-white group-hover:text-purple-200">Meta Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-fuchsia-300 font-bold">
                  {isVerifiedSubscribed ? 'Subscribed (Blue Badge)' : 'Not subscribed'}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: WHO CAN SEE YOUR CONTENT */}
      {/* ========================================================================= */}
      {(matchesSearch('Account privacy') || matchesSearch('Close Friends') || matchesSearch('Crossposting') || matchesSearch('Blocked') || matchesSearch('Story, live and location') || matchesSearch('Activity in Friends feed')) && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Who can see your content
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden divide-y divide-purple-950/70">
            {/* Account Privacy */}
            {matchesSearch('Account privacy') && (
              <button
                type="button"
                onClick={() => {
                  const newVal = !isPrivateAccount;
                  setIsPrivateAccount(newVal);
                  showToast(newVal ? 'Account set to Private 🔒' : 'Account set to Public 🌐');
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Account privacy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{isPrivateAccount ? 'Private' : 'Public'}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* Close Friends */}
            {matchesSearch('Close Friends') && (
              <button
                type="button"
                onClick={() => setActiveModalId('close-friends')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Close Friends</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{closeFriendsCount}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* Crossposting */}
            {matchesSearch('Crossposting') && (
              <button
                type="button"
                onClick={() => showToast('Crossposting to Facebook & Threads is active.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Crossposting</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Blocked */}
            {matchesSearch('Blocked') && (
              <button
                type="button"
                onClick={() => setActiveModalId('blocked-accounts')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Ban className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{blockedAccountsCount}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* Story, live and location */}
            {matchesSearch('Story, live and location') && (
              <button
                type="button"
                onClick={() => setActiveModalId('story-live')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Story, live and location</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Activity in Friends feed */}
            {matchesSearch('Activity in Friends feed') && (
              <button
                type="button"
                onClick={() => showToast('Friends feed activity sharing: Enabled.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Activity in Friends feed</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: HOW OTHERS CAN INTERACT WITH YOU */}
      {/* ========================================================================= */}
      {(matchesSearch('Messages and story replies') || matchesSearch('Tags and mentions') || matchesSearch('Comments') || matchesSearch('Sharing and reuse') || matchesSearch('Avatar interactions') || matchesSearch('Restricted') || matchesSearch('Limit interactions') || matchesSearch('Hidden Words') || matchesSearch('Follow and invite friends')) && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            How others can interact with you
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden divide-y divide-purple-950/70">
            {/* Messages and story replies */}
            {matchesSearch('Messages and story replies') && (
              <button
                type="button"
                onClick={() => onNavigateTab('messages')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Messages and story replies</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Tags and mentions */}
            {matchesSearch('Tags and mentions') && (
              <button
                type="button"
                onClick={() => showToast('Tags & mentions allowed from everyone.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <AtSign className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Tags and mentions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Comments */}
            {matchesSearch('Comments') && (
              <button
                type="button"
                onClick={() => setActiveModalId('comments-filter')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Comments</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Sharing and reuse */}
            {matchesSearch('Sharing and reuse') && (
              <button
                type="button"
                onClick={() => showToast('Remixing Reels and sharing posts enabled.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Repeat className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Sharing and reuse</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Avatar interactions */}
            {matchesSearch('Avatar interactions') && (
              <button
                type="button"
                onClick={() => showToast('3D Avatar reactions & sticker replies active.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Smile className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Avatar interactions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Restricted */}
            {matchesSearch('Restricted') && (
              <button
                type="button"
                onClick={() => showToast('1 account restricted.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Restricted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{restrictedCount}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* Limit interactions */}
            {matchesSearch('Limit interactions') && (
              <button
                type="button"
                onClick={() => {
                  const nv = !limitInteractions;
                  setLimitInteractions(nv);
                  showToast(nv ? 'Interaction limits turned ON' : 'Interaction limits turned OFF');
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Limit interactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{limitInteractions ? 'On' : 'Off'}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* Hidden Words */}
            {matchesSearch('Hidden Words') && (
              <button
                type="button"
                onClick={() => setActiveModalId('hidden-words')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Hidden Words</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Follow and invite friends */}
            {matchesSearch('Follow and invite friends') && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText?.(window.location.href);
                  confetti({ particleCount: 30, spread: 50 });
                  showToast('Invite link copied to clipboard!');
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Follow and invite friends</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: WHAT YOU SEE */}
      {/* ========================================================================= */}
      {(matchesSearch('Favorites') || matchesSearch('Muted accounts') || matchesSearch('Content preferences') || matchesSearch('Like and share counts')) && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            What you see
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden divide-y divide-purple-950/70">
            {/* Favorites */}
            {matchesSearch('Favorites') && (
              <button
                type="button"
                onClick={() => showToast('Favorites list managed.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Favorites</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{favoritesCount}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* Muted accounts */}
            {matchesSearch('Muted accounts') && (
              <button
                type="button"
                onClick={() => showToast('Muted accounts list opened.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <VolumeX className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Muted accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{mutedCount}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* Content preferences */}
            {matchesSearch('Content preferences') && (
              <button
                type="button"
                onClick={() => showToast('Content filter: Sensitive content standard.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <SlidersVertical className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Content preferences</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Like and share counts */}
            {matchesSearch('Like and share counts') && (
              <button
                type="button"
                onClick={() => {
                  const nv = !hideLikeCounts;
                  setHideLikeCounts(nv);
                  showToast(nv ? 'Like counts hidden from posts' : 'Like counts visible on posts');
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Like and share counts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{hideLikeCounts ? 'Hidden' : 'Visible'}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: YOUR APP AND MEDIA */}
      {/* ========================================================================= */}
      {(matchesSearch('Device permissions') || matchesSearch('Archiving and downloading') || matchesSearch('Accessibility') || matchesSearch('Language and translations') || matchesSearch('Data usage and media quality') || matchesSearch('App website permissions')) && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Your app and media
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden divide-y divide-purple-950/70">
            {/* Device permissions */}
            {matchesSearch('Device permissions') && (
              <button
                type="button"
                onClick={() => showToast('Camera, Mic, Audio, & Storage: Granted')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Device permissions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Archiving and downloading */}
            {matchesSearch('Archiving and downloading') && (
              <button
                type="button"
                onClick={() => showToast('Save story to Archive: Active')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Archiving and downloading</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Accessibility */}
            {matchesSearch('Accessibility') && (
              <button
                type="button"
                onClick={() => showToast('Screen reader captions & high contrast UI: Active')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Accessibility className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Accessibility</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Language and translations */}
            {matchesSearch('Language and translations') && (
              <button
                type="button"
                onClick={() => setActiveModalId('language-picker')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Language and translations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{selectedLanguage}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* Data usage and media quality */}
            {matchesSearch('Data usage and media quality') && (
              <button
                type="button"
                onClick={() => setActiveModalId('data-media-quality')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Data usage and media quality</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* App website permissions */}
            {matchesSearch('App website permissions') && (
              <button
                type="button"
                onClick={() => showToast('Browser cookies & autofill permissions verified.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">App website permissions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 9: FAMILY CENTER */}
      {/* ========================================================================= */}
      {matchesSearch('Family Center Supervision for Teen Accounts') && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Family Center
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => showToast('Family Center: Parental supervision settings opened.')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-purple-300" />
                <span className="text-sm font-semibold text-white group-hover:text-purple-200">Supervision for Teen Accounts</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 10: YOUR ORDERS AND FUNDRAISERS */}
      {/* ========================================================================= */}
      {matchesSearch('Your orders and fundraisers Orders and payments') && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Your orders and fundraisers
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveModalId('ads-payments')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-purple-300" />
                <span className="text-sm font-semibold text-white group-hover:text-purple-200">Orders and payments</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 11: MORE INFO AND SUPPORT */}
      {/* ========================================================================= */}
      {(matchesSearch('Help') || matchesSearch('Meta AI support assistant') || matchesSearch('Privacy Center') || matchesSearch('Account Status') || matchesSearch('About')) && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            More info and support
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden divide-y divide-purple-950/70">
            {/* Help */}
            {matchesSearch('Help') && (
              <button
                type="button"
                onClick={() => setActiveModalId('help-center')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Help</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Meta AI support assistant */}
            {matchesSearch('Meta AI support assistant') && (
              <button
                type="button"
                onClick={() => setActiveModalId('ai-assistant')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-fuchsia-400" />
                  <span className="text-sm font-bold text-white group-hover:text-purple-200">Meta AI support assistant</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Privacy Center */}
            {matchesSearch('Privacy Center') && (
              <button
                type="button"
                onClick={() => showToast('Instagrand Privacy Center: All data end-to-end encrypted.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Privacy Center</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Account Status */}
            {matchesSearch('Account Status') && (
              <button
                type="button"
                onClick={() => showToast('Account Status: Excellent! No violations. Monetization active.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">Account Status</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* About */}
            {matchesSearch('About') && (
              <button
                type="button"
                onClick={() => setActiveModalId('about')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">About</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Pin App to Home Screen */}
            <button
              type="button"
              onClick={() => setIsInstallPinModalOpen(true)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-black border border-purple-400 p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                  <img src="/app-icon.png" alt="Icon" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-purple-200 flex items-center gap-1.5 flex-wrap">
                    <span>Pin App to Mobile Home Screen</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[9px] font-bold">
                      3D Neon Icon
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Install app icon on Android & iOS home screen</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 12: ALSO FROM META */}
      {/* ========================================================================= */}
      {(matchesSearch('Meta AI') || matchesSearch('Threads') || matchesSearch('Edits') || matchesSearch('More from Meta')) && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Also from Meta
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden divide-y divide-purple-950/70">
            {/* Meta AI */}
            {matchesSearch('Meta AI') && (
              <button
                type="button"
                onClick={() => setActiveModalId('ai-assistant')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    AI
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-purple-200">Meta AI</div>
                    <div className="text-xs text-zinc-400">Get answers, advice and generate images</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* Threads */}
            {matchesSearch('Threads') && (
              <button
                type="button"
                onClick={() => showToast('Opening Threads community hub...')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <AtSign className="w-5 h-5 text-purple-300 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-purple-200">Threads</div>
                    <div className="text-xs text-zinc-400">Share ideas and join conversations</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Edits */}
            {matchesSearch('Edits') && (
              <button
                type="button"
                onClick={() => onNavigateTab('create')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <Layers className="w-5 h-5 text-purple-300 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-purple-200">Edits</div>
                    <div className="text-xs text-zinc-400">Create videos with powerful editing tools</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </button>
            )}

            {/* More from Meta */}
            {matchesSearch('More from Meta') && (
              <button
                type="button"
                onClick={() => showToast('Meta Quest & Ray-Ban Meta AI connectivity ready.')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-purple-200">More from Meta</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 13: LOGIN */}
      {/* ========================================================================= */}
      {(matchesSearch('Login') || matchesSearch('Add account') || matchesSearch('Log out')) && (
        <div className="space-y-1 pt-2">
          <h2 className="px-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Login
          </h2>

          <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/50 overflow-hidden divide-y divide-purple-950/70">
            {/* Add account (Blue button) */}
            <button
              id="settings-add-account-btn"
              type="button"
              onClick={onOpenAuth}
              className="w-full p-3.5 flex items-center justify-between hover:bg-blue-950/20 transition-colors text-left cursor-pointer"
            >
              <span className="text-sm font-bold text-blue-400">Add account</span>
              <PlusCircle className="w-4 h-4 text-blue-400" />
            </button>

            {/* Log out (Red button) */}
            <button
              id="settings-logout-btn"
              type="button"
              onClick={onLogout}
              className="w-full p-3.5 flex items-center justify-between hover:bg-red-950/20 transition-colors text-left cursor-pointer"
            >
              <span className="text-sm font-bold text-rose-500">Log out</span>
              <LogOut className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODALS / DETAIL VIEWS */}
      {/* ========================================================================= */}

      {/* 1. Accounts Center Modal */}
      {activeModalId === 'accounts-center' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-purple-600/50 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Accounts Center</span>
              </h3>
              <button type="button" onClick={() => setActiveModalId(null)} className="p-1 text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-purple-900/40">
                <div className="font-bold text-white">Profiles & Handles</div>
                <div className="text-purple-300">@{currentUser?.username || 'user'} · {currentUser?.name || 'Instagrand User'}</div>
                <div className="text-[11px] text-zinc-500 mt-1">Synced with Firebase Firestore Auth</div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-purple-900/40">
                <div className="font-bold text-white">Password and security</div>
                <div className="text-zinc-400">Two-Factor Authentication: Enabled (Google OAuth / PIN)</div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-purple-900/40">
                <div className="font-bold text-white">Personal details</div>
                <div className="text-zinc-400">Email: {currentUser?.email || 'user@instagrand.app'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModalId(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 2. Meta Verified Modal */}
      {activeModalId === 'meta-verified' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border-2 border-cyan-500/60 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-900/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-cyan-400 fill-cyan-400/20" />
                <h3 className="text-base font-black text-white">Meta / Instagrand Verified</h3>
              </div>
              <button type="button" onClick={() => setActiveModalId(null)} className="p-1 text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs text-zinc-300">
              <p className="text-cyan-200 font-medium">
                Build trust with your followers with a verified blue badge, increased account protection, and direct priority support.
              </p>
              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>A Verified Badge (Blue Checkmark)</span>
                </div>
                <div className="flex items-center gap-2 text-white font-bold">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Enhanced Impersonation Protection</span>
                </div>
                <div className="flex items-center gap-2 text-white font-bold">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Exclusive Reels Stickers & Direct Video Dialing</span>
                </div>
              </div>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsVerifiedSubscribed(true);
                  confetti({ particleCount: 50, spread: 70 });
                  showToast('✨ Meta Verified Blue Badge is Active on @' + (currentUser?.username || 'naushad'));
                  setActiveModalId(null);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs cursor-pointer shadow-lg"
              >
                Activate Blue Verified Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Meta AI Support Assistant Modal */}
      {activeModalId === 'ai-assistant' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border-2 border-fuchsia-500/60 p-5 space-y-4 shadow-2xl flex flex-col h-[500px]">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-600/30 border border-fuchsia-500/50 flex items-center justify-center text-fuchsia-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Meta / Instagrand AI Support</h3>
                  <p className="text-[10px] text-emerald-400">● 24/7 Priority Assistant Online</p>
                </div>
              </div>
              <button type="button" onClick={() => setActiveModalId(null)} className="p-1 text-zinc-400 hover:text-white">✕</button>
            </div>

            {/* Chat message bubbles */}
            <div className="flex-1 overflow-y-auto space-y-2.5 p-2 rounded-2xl bg-zinc-900/60 border border-purple-900/40">
              {supportChat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-2.5 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-zinc-800 text-purple-100 rounded-bl-none border border-purple-900/50'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Support message input */}
            <form onSubmit={handleSendSupportMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Ask about monetization, verified badge, audio..."
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-purple-900 text-white text-xs focus:outline-none focus:border-fuchsia-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Data Usage & Media Quality Modal */}
      {activeModalId === 'data-media-quality' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-purple-600/50 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wifi className="w-5 h-5 text-purple-400" />
                <span>Data usage and media quality</span>
              </h3>
              <button type="button" onClick={() => setActiveModalId(null)} className="p-1 text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Upload at highest quality</div>
                  <p className="text-[11px] text-zinc-400">Always upload 4K Ultra-HD videos even on slower cellular networks</p>
                </div>
                <input
                  type="checkbox"
                  checked={highQualityUploads}
                  onChange={(e) => setHighQualityUploads(e.target.checked)}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Use less mobile data</div>
                  <p className="text-[11px] text-zinc-400">Compress media during video feeds when on cellular network</p>
                </div>
                <input
                  type="checkbox"
                  checked={dataSaverMode}
                  onChange={(e) => setDataSaverMode(e.target.checked)}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                showToast('Media quality preferences saved.');
                setActiveModalId(null);
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* 5. Language Picker Modal */}
      {activeModalId === 'language-picker' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-purple-600/50 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Languages className="w-5 h-5 text-purple-400" />
                <span>Select Language</span>
              </h3>
              <button type="button" onClick={() => setActiveModalId(null)} className="p-1 text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              {['English (US)', 'हिन्दी (Hindi)', 'اردو (Urdu)', 'मराठी (Marathi)', 'বাংলা (Bengali)', 'Español', 'العربية (Arabic)'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(lang);
                    showToast(`App language updated to ${lang}`);
                    setActiveModalId(null);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-zinc-900 text-zinc-300 border-purple-900/40 hover:bg-zinc-800'
                  }`}
                >
                  <span className="font-semibold">{lang}</span>
                  {selectedLanguage === lang && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. In-App App Lock Settings Modal */}
      <AppLockSettingsModal
        isOpen={isAppLockModalOpen}
        onClose={() => setIsAppLockModalOpen(false)}
        currentUser={currentUser}
        onLockNow={() => {
          setIsAppLockModalOpen(false);
          onLockNow?.();
        }}
        onConfigChanged={(newCfg) => setAppLockConfig(newCfg)}
      />

      {/* 7. Pin App to Mobile Home Screen Modal */}
      <InstallAppPinModal
        isOpen={isInstallPinModalOpen}
        onClose={() => setIsInstallPinModalOpen(false)}
      />
    </div>
  );
};
