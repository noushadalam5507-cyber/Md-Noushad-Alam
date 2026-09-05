import React, { useState, useRef } from 'react';
import {
  Settings,
  Crown,
  Sparkles,
  Grid,
  Film,
  Bookmark,
  UserCheck,
  Shield,
  Coins,
  DollarSign,
  TrendingUp,
  Share2,
  Video,
  Lock,
  Unlock,
  Eye,
  CheckCircle2,
  Edit3,
  LogOut,
  Bell,
  Sliders,
  Play,
  Heart,
  HelpCircle,
  MapPin,
  Compass,
  Mail,
  ArrowRight,
  Flame,
  Zap,
  Gift,
  Bot,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, ViewTab } from '../types';
import { HelpAndFounderModal } from './HelpAndFounderModal';
import { FounderJourneyCard } from './FounderJourneyCard';
import { OSSimulatorWidget } from './OSSimulatorWidget';
import { togglePrivateAccountInFirestore, syncUserProfileToFirestore } from '../lib/firestoreService';
import { checkUserMonetizationStatus, MONETIZATION_MIN_FOLLOWERS } from '../lib/monetizationRules';
import { auth } from '../lib/firebase';
import { FollowerBoosterModal } from './FollowerBoosterModal';

interface ProfileViewProps {
  currentUser: UserProfile | null;
  onNavigateTab: (tab: ViewTab) => void;
  onStartCall: (roomId: string, targetUser?: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onUpdateCurrentUser?: (user: UserProfile) => void;
  onOpenAdminVault?: () => void;
  onOpenDailyReward?: () => void;
  onOpenStudioPass?: () => void;
  onOpenSpotlight?: () => void;
  onOpenVerifiedBadge?: () => void;
  onOpenCreatorTip?: () => void;
  onOpenAIAssistant?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onNavigateTab,
  onStartCall,
  onOpenAuth,
  onLogout,
  onUpdateCurrentUser,
  onOpenAdminVault,
  onOpenDailyReward,
  onOpenStudioPass,
  onOpenSpotlight,
  onOpenVerifiedBadge,
  onOpenCreatorTip,
  onOpenAIAssistant,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'grid' | 'reels' | 'saved'>('grid');
  const [helpModalTab, setHelpModalTab] = useState<'founder' | 'support' | 'settings' | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(currentUser?.isPrivateAccount ?? false);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(currentUser?.name || '');
  const [editBio, setEditBio] = useState<string>(currentUser?.customBio || '');
  const [editAvatar, setEditAvatar] = useState<string>(currentUser?.avatar || '');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenEditProfile = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setEditName(currentUser.name || '');
    setEditBio(currentUser.customBio || '');
    setEditAvatar(currentUser.avatar || '');
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size is too large. Please choose an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseGooglePhoto = () => {
    const googlePhoto = auth.currentUser?.photoURL;
    if (googlePhoto) {
      setEditAvatar(googlePhoto);
    } else {
      alert('Google profile photo not detected on current session.');
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSavingProfile(true);

    try {
      const updatedUser: UserProfile = {
        ...currentUser,
        name: editName.trim() || currentUser.name,
        customBio: editBio.trim() || currentUser.customBio,
        avatar: editAvatar.trim() || currentUser.avatar,
      };

      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedUser);
      }
      await syncUserProfileToFirestore(updatedUser);

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to save profile changes:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [isBoosterModalOpen, setIsBoosterModalOpen] = useState<boolean>(false);

  const isOwnerAdmin =
    currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com' ||
    currentUser?.role === 'admin' ||
    currentUser?.username?.toLowerCase() === 'naushad' ||
    currentUser?.username?.toLowerCase() === 'noushad';

  const followersCount = typeof currentUser?.followersCount === 'number' && currentUser.followersCount > 0 
    ? currentUser.followersCount 
    : (isOwnerAdmin ? 20480 : 0);
  const followingCount = typeof currentUser?.followingCount === 'number' && currentUser.followingCount > 0 
    ? currentUser.followingCount 
    : (isOwnerAdmin ? 240 : 0);
  const postsCount = isOwnerAdmin ? 18 : 0;

  const monetizationStatus = checkUserMonetizationStatus(currentUser);
  const monetizationTarget = MONETIZATION_MIN_FOLLOWERS; // 20k threshold
  const displayFollowers = followersCount;
  const progressPercent = monetizationStatus.progressPercent;

  const highlights = [
    { id: 'h1', title: '4K Studios', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80' },
    { id: 'h2', title: 'Drops', cover: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80' },
    { id: 'h3', title: 'Opus Calls', cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80' },
    { id: 'h4', title: 'Reels', cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80' },
  ];

  const profileGridPosts = [
    { id: 'p1', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', likes: 1420, isVideo: false },
    { id: 'p2', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80', likes: 2890, isVideo: true },
    { id: 'p3', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', likes: 890, isVideo: false },
    { id: 'p4', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80', likes: 3100, isVideo: true },
    { id: 'p5', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', likes: 1750, isVideo: false },
    { id: 'p6', img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80', likes: 4200, isVideo: true },
  ];

  const handleShareProfile = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleTogglePrivate = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const nextVal = !isPrivate;
    setIsPrivate(nextVal);
    try {
      await togglePrivateAccountInFirestore({
        userId: currentUser.id,
        isPrivate: nextVal,
      });
      confetti({ particleCount: 20, spread: 40 });
    } catch (e) {
      console.error('Failed to toggle private account:', e);
    }
  };

  return (
    <div id="novagrand-profile-view" className="max-w-xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-zinc-950/90 border border-purple-900/50 shadow-2xl space-y-5">
        {/* Top bar with username and settings gear */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white">
              @{currentUser?.username || 'user'}
            </span>
            <div className="px-2 py-0.5 rounded-full bg-fuchsia-950/80 border border-fuchsia-500/50 text-fuchsia-300 text-[11px] font-bold flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-300" />
              <span>{isOwnerAdmin ? '👑 NovaGrand Founder' : 'NovaGrand Creator'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="profile-support-btn"
              type="button"
              onClick={() => setHelpModalTab('support')}
              className="p-2.5 rounded-2xl bg-zinc-900 border border-emerald-500/40 text-emerald-300 hover:text-white hover:border-emerald-400 transition-all cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold"
              title="Help & Support"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </button>

            <button
              id="profile-settings-gear-btn"
              type="button"
              onClick={() => onNavigateTab('settings')}
              className="p-2.5 rounded-2xl bg-zinc-900 border border-purple-900/60 text-purple-300 hover:text-white hover:border-purple-500 transition-all cursor-pointer shadow-md hover:rotate-45"
              title="Settings & Activity"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Avatar & Stats Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Glowing Clickable Avatar */}
          <div
            onClick={handleOpenEditProfile}
            className="relative cursor-pointer group"
            title="Click to edit profile & change avatar photo"
          >
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 shadow-[0_0_20px_rgba(217,70,239,0.4)] group-hover:scale-105 transition-transform">
              <img
                src={
                  currentUser?.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'user'}&backgroundColor=180a30`
                }
                alt={currentUser?.name}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover border-2 border-zinc-950"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Camera className="w-6 h-6 drop-shadow" />
            </div>
            {currentUser?.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0095f6] border-2 border-zinc-950 flex items-center justify-center shadow-lg" title="Instagram Verified Official Badge">
                <CheckCircle2 className="w-3.5 h-3.5 text-white fill-white" />
              </div>
            )}
          </div>

          {/* Stats Counters */}
          <div className="flex-1 grid grid-cols-3 text-center gap-2">
            <div>
              <div className="text-lg font-black text-white">{postsCount}</div>
              <div className="text-[11px] text-zinc-400 font-medium">Posts</div>
            </div>
            <div>
              <div className="text-lg font-black text-fuchsia-400">
                {followersCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium">Followers</div>
            </div>
            <div>
              <div className="text-lg font-black text-white">{followingCount.toLocaleString()}</div>
              <div className="text-[11px] text-zinc-400 font-medium">Following</div>
            </div>
          </div>
        </div>

        {/* User Bio & Info */}
        <div className="space-y-1 text-xs">
          <div className="font-bold text-white text-sm flex items-center gap-1.5">
            <span>{currentUser?.name || 'NovaGrand User'}</span>
            {currentUser?.isVerified && (
              <div className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0095f6] text-white shadow-sm shrink-0" title="Instagram Verified Official Badge">
                <CheckCircle2 className="w-3 h-3 text-white fill-white" />
              </div>
            )}
          </div>
          <p className="text-zinc-300 leading-relaxed">
            {currentUser?.customBio || 'NovaGrand Creator & Direct 4K Video Studio Host 💜'}
          </p>
          {currentUser?.email && (
            <div className="text-purple-300/80 font-mono text-[11px]">
              📧 {currentUser.email}
            </div>
          )}
        </div>

        {/* 2-Minute Watch for +10 Followers & Blue Tick Banner */}
        <div
          id="profile-watch-follower-booster-card"
          onClick={() => setIsBoosterModalOpen(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-blue-950/90 to-cyan-950/80 border border-cyan-500/50 hover:border-cyan-400 cursor-pointer shadow-lg transition-all hover:scale-[1.01] flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0095f6]/20 border border-[#0095f6]/50 flex items-center justify-center text-[#0095f6] shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Watch 2 Min = +10 Real Followers</span>
                <div className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#0095f6] text-white shadow-sm shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5 fill-white text-[#0095f6]" />
                </div>
              </div>
              <p className="text-[10px] text-zinc-400">
                Earn instant real followers & Instagram blue tick by watching 2 minutes of creator reels!
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0095f6] to-cyan-500 text-white font-bold text-[11px] shadow-md shrink-0 flex items-center gap-1 group-hover:shadow-cyan-500/30"
          >
            <span>Boost</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* INSTAGRAM PROFESSIONAL DASHBOARD CARD ON PROFILE */}
        {/* ========================================================================= */}
        <div
          id="profile-professional-dashboard-card"
          onClick={() => onNavigateTab('professional-dashboard')}
          className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900/90 to-fuchsia-950/70 border border-purple-500/40 hover:border-purple-400 transition-all cursor-pointer shadow-lg space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white group-hover:text-purple-200 transition-colors flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Professional dashboard</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Active
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 leading-relaxed">
            <span className="text-fuchsia-300 font-bold">
              {isOwnerAdmin ? '48.9K accounts reached' : `${followersCount} accounts connected`}
            </span>{' '}
            in the last 30 days · {isOwnerAdmin ? '₹1,42,800 earned' : 'Creator Tier'}
          </p>
        </div>

        {/* Action Buttons: Manage, Share Profile, Contact */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleOpenEditProfile}
            className="py-2.5 px-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-fuchsia-200 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={handleShareProfile}
            className="py-2.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/60 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="truncate">{copiedLink ? 'Copied!' : 'Share Profile'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('messages')}
            className="py-2.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/60 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="truncate">Contact</span>
          </button>
        </div>

        {/* Dedicated Quick Action: Founder's Journey & Help Desk */}
        <div className="grid grid-cols-2 gap-3 pt-0.5">
          <button
            type="button"
            onClick={() => setHelpModalTab('founder')}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-950/90 to-fuchsia-950/90 hover:from-purple-900 hover:to-fuchsia-900 border border-fuchsia-500/40 hover:border-fuchsia-400 text-fuchsia-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Founder's Journey</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-950/90 to-cyan-950/90 hover:from-emerald-900 hover:to-cyan-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-300" />
            <span>Settings & Privacy</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* NEW VIP MONETIZATION & PRIVACY CONTROLS */}
        {/* ========================================================================= */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Spotlight Boost Button */}
          {onOpenSpotlight && (
            <button
              id="profile-spotlight-boost-btn"
              type="button"
              onClick={onOpenSpotlight}
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-orange-950/70 to-zinc-900 border border-amber-500/50 hover:border-amber-400 text-left transition-all cursor-pointer shadow-lg group flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-amber-200 transition-colors">
                    Profile Spotlight
                  </div>
                  <div className="text-[10px] text-amber-300/80">#1 Top Ranking · 500 Coins</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Verified Badge Shop */}
          {onOpenVerifiedBadge && (
            <button
              id="profile-verified-badge-btn"
              type="button"
              onClick={onOpenVerifiedBadge}
              className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-indigo-950/70 to-zinc-900 border border-cyan-500/50 hover:border-cyan-400 text-left transition-all cursor-pointer shadow-lg group flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-cyan-200 transition-colors">
                    Verified VIP Badge
                  </div>
                  <div className="text-[10px] text-cyan-300/80">₹20/mo · ₹500/yr · 50 Flws</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Studio Pass VIP Card */}
          {onOpenStudioPass && (
            <button
              id="profile-studio-pass-btn"
              type="button"
              onClick={onOpenStudioPass}
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 via-fuchsia-950/70 to-zinc-900 border border-purple-500/50 hover:border-purple-400 text-left transition-all cursor-pointer shadow-lg group flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Crown className="w-4 h-4 text-fuchsia-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-fuchsia-200 transition-colors">
                    VIP Studio Pass
                  </div>
                  <div className="text-[10px] text-purple-300/80">Ad-Free + 3D Neon Perks</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* AI Assistant Guru */}
          {onOpenAIAssistant && (
            <button
              id="profile-ai-assistant-btn"
              type="button"
              onClick={onOpenAIAssistant}
              className="p-3 rounded-2xl bg-gradient-to-r from-fuchsia-950/80 via-purple-950/70 to-zinc-900 border border-fuchsia-500/50 hover:border-fuchsia-400 text-left transition-all cursor-pointer shadow-lg group flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-400/20 text-fuchsia-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bot className="w-4 h-4 text-fuchsia-300" />
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-fuchsia-200 transition-colors">
                    AI Photo Guru & Support
                  </div>
                  <div className="text-[10px] text-fuchsia-300/80">Ask Questions · AI Edits</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-fuchsia-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Private Account Safeguard Toggle */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPrivate ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>
              {isPrivate ? <Lock className="w-4 h-4 text-emerald-400" /> : <Unlock className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Private Account Protection</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${isPrivate ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isPrivate ? 'PRIVATE' : 'PUBLIC'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                {isPrivate ? 'Only approved followers can view your media' : 'Anyone on Instagrand can discover your profile'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTogglePrivate}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              isPrivate ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                isPrivate ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Master Admin Vault Quick Action (If Owner) */}
        {isOwnerAdmin && onOpenAdminVault && (
          <button
            id="profile-admin-vault-trigger"
            type="button"
            onClick={onOpenAdminVault}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-950/80 to-fuchsia-950/80 border border-amber-500/50 hover:border-amber-400 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Open Master Owner & Admin Vault (100% Data Control)</span>
          </button>
        )}
      </div>

      {/* OS Simulator Integration Widget */}
      <OSSimulatorWidget
        currentUser={currentUser}
        onOpenDailyReward={onOpenDailyReward || (() => {})}
        onOpenStudioPass={onOpenStudioPass || (() => {})}
        onStartQuickCall={() => onStartCall('studio-naushad-call', 'naushad')}
      />

      {/* ========================================================================= */}
      {/* DEDICATED CYBERPUNK NEON CARD: FOUNDER'S JOURNEY */}
      {/* ========================================================================= */}
      <FounderJourneyCard
        onOpenFullModal={() => setHelpModalTab('founder')}
        onOpenSupport={() => setHelpModalTab('support')}
      />

      {/* Instagrand Coins Wallet Card */}
      <div className="p-5 rounded-3xl bg-zinc-950/90 border border-amber-500/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Instagrand Wallet
              </span>
              <div className="text-xl font-black text-white flex items-center gap-2">
                <span>{currentUser?.coins ?? 100} Coins</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  +100 Bonus Active
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('username-checker')}
            className="text-xs px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-semibold border border-purple-600/40 cursor-pointer"
          >
            Use Coins
          </button>
        </div>
        <p className="text-[11px] text-zinc-400">
          Account Type:{' '}
          <span className="text-fuchsia-300 font-semibold uppercase">
            {currentUser?.accountType === 'manual' ? 'Manual Registration' : 'Google Verified Identity'}
          </span>
          {' · '}Synchronized securely with Firebase Firestore.
        </p>
      </div>

      {/* Monetization Unlocks at 20,000 Followers Progress Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/80 via-zinc-950 to-zinc-950 border border-purple-500/40 neon-border-purple text-white shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Creator Earnings Status
              </div>
              <h3 className="text-sm font-black text-white">
                {monetizationStatus.isEligible ? 'Monetization Active & Unlocked' : 'Monetization Unlocks at 20,000 Followers'}
              </h3>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-fuchsia-400">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-zinc-900 border border-purple-900/60 overflow-hidden p-0.5">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-400 shadow-[0_0_10px_#d946ef] transition-all duration-500"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>{displayFollowers.toLocaleString()} current followers</span>
            <span>
              {monetizationStatus.isEligible
                ? 'Monetization Unlocked'
                : `${monetizationStatus.remainingFollowers.toLocaleString()} left to unlock`}
            </span>
          </div>
        </div>

        {/* Monetization Perks */}
        <div className="pt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="p-2 rounded-xl bg-zinc-900/80 border border-purple-900/40">
            <div className="font-bold text-emerald-300">₹2 - ₹10</div>
            <div className="text-zinc-500">Per AI Upload</div>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/80 border border-purple-900/40">
            <div className="font-bold text-cyan-300">70% Ad Share</div>
            <div className="text-zinc-500">Post & Reel Views</div>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/80 border border-purple-900/40">
            <div className="font-bold text-amber-300">₹2.50 / Call</div>
            <div className="text-zinc-500">Direct Audio/Video Dial</div>
          </div>
        </div>
      </div>

      {/* Story Highlights Capsules */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider px-1">
          Story Highlights
        </span>
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {highlights.map((h) => (
            <div key={h.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-purple-600 to-fuchsia-500 group-hover:scale-105 transition-all">
                <img
                  src={h.cover}
                  alt={h.title}
                  className="w-full h-full rounded-full object-cover border border-zinc-950"
                />
              </div>
              <span className="text-[11px] text-zinc-300 font-medium">{h.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Media Tabs Bar */}
      <div className="border-t border-purple-900/40 pt-4 space-y-4">
        <div className="flex items-center justify-around">
          <button
            type="button"
            onClick={() => setActiveMediaTab('grid')}
            className={`flex items-center gap-2 pb-2 text-xs font-bold transition-all cursor-pointer ${
              activeMediaTab === 'grid'
                ? 'text-fuchsia-400 border-b-2 border-fuchsia-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>POSTS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMediaTab('reels')}
            className={`flex items-center gap-2 pb-2 text-xs font-bold transition-all cursor-pointer ${
              activeMediaTab === 'reels'
                ? 'text-fuchsia-400 border-b-2 border-fuchsia-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>REELS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMediaTab('saved')}
            className={`flex items-center gap-2 pb-2 text-xs font-bold transition-all cursor-pointer ${
              activeMediaTab === 'saved'
                ? 'text-fuchsia-400 border-b-2 border-fuchsia-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>SAVED</span>
          </button>
        </div>

        {/* 3x3 Media Grid */}
        <div className="grid grid-cols-3 gap-2">
          {profileGridPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onStartCall('studio-naushad-media', 'naushad')}
              className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-purple-900/40 hover:border-purple-400 transition-all cursor-pointer"
            >
              <img
                src={post.img}
                alt="Profile post"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                <span>{post.likes}</span>
              </div>
              {post.isVideo && (
                <div className="absolute top-1.5 right-1.5 p-1 rounded bg-zinc-950/70 text-white">
                  <Play className="w-3 h-3 fill-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Integrated Help & Support, Founder's Journey, and Settings Modal */}
      <HelpAndFounderModal
        isOpen={helpModalTab !== null}
        onClose={() => setHelpModalTab(null)}
        defaultTab={helpModalTab || 'founder'}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
        onNavigateTab={onNavigateTab}
      />

      {/* ========================================================================= */}
      {/* EDIT PROFILE & CUSTOM GALLERY PHOTO UPLOAD MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950 border border-purple-900/80 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-purple-950/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Edit NovaGrand Profile</h3>
                  <p className="text-[11px] text-zinc-400">Update photo, display name, and bio</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar Upload / Preview Section */}
            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-purple-900/40">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 shadow-[0_0_20px_rgba(217,70,239,0.5)]">
                  <img
                    src={editAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'user'}&backgroundColor=180a30`}
                    alt="Avatar preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover border-2 border-zinc-950"
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                  <span className="text-[9px] font-bold mt-1">Upload</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap gap-2 justify-center w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose from Gallery</span>
                </button>

                {auth.currentUser?.photoURL && (
                  <button
                    type="button"
                    onClick={handleUseGooglePhoto}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Sync Google Photo</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 text-center">
                Supported formats: JPG, PNG, WEBP. Saved directly to Firestore cloud.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-mono text-[11px]">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-purple-500 text-white outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-mono text-[11px]">Custom Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-purple-500 text-white outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-mono text-[11px]">Verified Username</label>
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-400">
                  <span>@{currentUser?.username || 'user'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      onNavigateTab('username-checker');
                    }}
                    className="text-[11px] text-fuchsia-400 hover:text-fuchsia-300 font-bold underline cursor-pointer"
                  >
                    Change Handle
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2 border-t border-purple-950">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
              >
                {isSavingProfile ? (
                  <span>Saving to Cloud...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follower Booster Modal (Watch 2 min = +10 Followers & Blue Tick) */}
      <FollowerBoosterModal
        isOpen={isBoosterModalOpen}
        onClose={() => setIsBoosterModalOpen(false)}
        currentUser={currentUser}
        onFollowersUpdated={(newTotal, isVer) => {
          if (currentUser) {
            const updated = {
              ...currentUser,
              followers: newTotal,
              followersCount: newTotal,
              ...(isVer ? { isVerified: true, verifiedBadgeType: 'blue' as const } : {})
            };
            if (onUpdateCurrentUser) {
              onUpdateCurrentUser(updated);
            }
          }
        }}
      />
    </div>
  );
};
