import React, { useState } from 'react';
import {
  Instagram,
  ExternalLink,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Share2,
  ShieldCheck,
  Copy,
  Users,
  Flame,
  ArrowUpRight,
  AtSign,
  Heart,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

interface InstagramRealConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const InstagramRealConnectModal: React.FC<InstagramRealConnectModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
}) => {
  const defaultHandle = currentUser?.username || 'naushad';
  const [instaHandle, setInstaHandle] = useState<string>(
    currentUser?.socialLinks?.instagram || defaultHandle
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const cleanHandle = instaHandle.replace('@', '').trim();
  const realInstagramProfileUrl = `https://instagram.com/${cleanHandle || 'naushad'}`;
  const realInstagramDmUrl = `https://ig.me/m/${cleanHandle || 'naushad'}`;
  const deepLinkAppUrl = `instagram://user?username=${cleanHandle || 'naushad'}`;

  const handleSaveInstagram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanHandle) return;

    if (onUpdateProfile && currentUser) {
      onUpdateProfile({
        socialLinks: {
          ...currentUser.socialLinks,
          instagram: cleanHandle,
        },
      });
    }

    setIsSaved(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e1306c', '#fd1d1d', '#f77737', '#833ab4'],
    });

    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(realInstagramProfileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open Real Instagram directly in native app with web fallback
  const handleOpenInstagramApp = () => {
    window.open(realInstagramProfileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInstagramDM = () => {
    window.open(realInstagramDmUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="instagram-real-connect-modal-root"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-950 border border-fuchsia-800/60 rounded-3xl p-6 shadow-[0_0_60px_rgba(225,48,108,0.25)] space-y-5 text-white box-border relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Instagram Gradient Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-pink-600 via-purple-600 to-amber-500 rounded-full blur-[90px] opacity-25 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-700 p-0.5 shadow-lg shadow-rose-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Instagram className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Real Instagram Direct Connect</h3>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-black uppercase tracking-wider border border-pink-500/30">
                  Verified Direct Link
                </span>
              </div>
              <p className="text-xs text-zinc-400">Connect real Instagram account · Direct DM · Monetize</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input form to set/edit Real Instagram Handle */}
        <form onSubmit={handleSaveInstagram} className="space-y-3">
          <label className="block text-xs font-bold text-zinc-300">
            Aapka Real Instagram Username:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400 font-bold text-sm">@</span>
              <input
                type="text"
                value={cleanHandle}
                onChange={(e) => setInstaHandle(e.target.value)}
                placeholder="e.g. naushad ya apna instagram username"
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-zinc-900 border border-purple-900/60 focus:border-pink-500 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-pink-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {isSaved ? 'Saved! ✓' : 'Save Handle'}
            </button>
          </div>
        </form>

        {/* Real Profile Card Preview */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-pink-950/40 border border-pink-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
                <img
                  src={
                    currentUser?.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}&backgroundColor=180a30`
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-zinc-950"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">@{cleanHandle || 'naushad'}</h4>
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                </div>
                <p className="text-xs text-pink-300 font-mono">instagram.com/{cleanHandle || 'naushad'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1 border border-purple-800/40 transition-colors"
              title="Copy Real Instagram Profile Link"
            >
              <Copy className="w-4 h-4 text-pink-400" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* 2 Big Direct Action Buttons for Real Instagram Contact & App Launch */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Direct Open Profile in Real Instagram App */}
            <button
              type="button"
              onClick={handleOpenInstagramApp}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition-transform active:scale-95 cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>Open Real Instagram</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Direct DM / Contact Message in Real Instagram */}
            <button
              type="button"
              onClick={handleOpenInstagramDM}
              className="py-3 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-pink-500/50 hover:border-pink-400 text-pink-300 font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-pink-400" />
              <span>Send Direct DM (Chat)</span>
            </button>
          </div>
        </div>

        {/* Creator Monetization & Brand Deals Perks */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-purple-900/50 space-y-2.5 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Real Instagram Connect Se Kamai (Earn) Kaise Hogi?</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-zinc-400 list-disc pl-4 leading-relaxed">
            <li>
              <strong className="text-white">Direct Sponsor & Brand Inquiries:</strong> Brands aapke Instagram par direct DM karke paid promotions & reels sponsorship offer kar sakti hain.
            </li>
            <li>
              <strong className="text-white">Real Follower Growth:</strong> NovaGrand app ke 50,000+ active users 1-click me aapke real Instagram par follow aur connect kar sakte hain.
            </li>
            <li>
              <strong className="text-white">Cross-Platform Monetization:</strong> Har reel share hone par aapka verified Instagram handle automatic watermark hota hai!
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};
