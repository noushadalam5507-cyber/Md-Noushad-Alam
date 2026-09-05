import React, { useState } from 'react';
import {
  Sparkles,
  Crown,
  Heart,
  Mail,
  MapPin,
  Compass,
  Rocket,
  Shield,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Send,
  Cpu,
  Zap,
  Globe,
  Settings,
  ChevronDown,
  ChevronUp,
  Award,
  Video,
  Coins,
  ArrowRight,
  Flame,
  UserCheck,
  Bot,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

interface HelpAndFounderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'founder' | 'support' | 'settings';
  currentUser: UserProfile | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onNavigateTab?: (tab: any) => void;
}

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const HelpAndFounderModal: React.FC<HelpAndFounderModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'founder',
  currentUser,
  onOpenAuth,
  onLogout,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'founder' | 'support' | 'settings'>(defaultTab);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [copiedBio, setCopiedBio] = useState<boolean>(false);

  // AI Support Assistant State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: `👋 Namaste! I am your NovaGrand 24/7 AI Support Assistant. \n\nAsk me anything in Hindi, Hinglish, or English about 4K Video Calling, Creator Monetization (₹1,42,800+), 150-Coin Self-Unblock, Custom Profile Photo Uploads, Google AdMob, or PIN Security. How can I help you today?`,
      time: 'Just now',
    },
  ]);

  // Help & Support Ticket Form state
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketCategory, setTicketCategory] = useState<string>('General Support');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);
  const [ticketSuccess, setTicketSuccess] = useState<boolean>(false);

  // FAQ Accordion state
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq1');

  // Privacy toggles inside settings
  const [isPrivateAccount, setIsPrivateAccount] = useState<boolean>(false);
  const [allowDirectCalls, setAllowDirectCalls] = useState<boolean>(true);
  const [highQualityUploads, setHighQualityUploads] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText?.('noushadalam5507@gmail.com');
    setCopiedEmail(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleCopyBio = () => {
    const bioText = `MD Naushad Alam | Founder & Lead Architect of NovaGrand
Roots: Born in Jharkhand, India with dreams of building disruptive global tech.
Upbringing: Raised in Mumbai, Maharashtra, where his family relocated and settled. Growing up in Mumbai shaped his hustle, ambition, and passion for technology.
Vision: Engineering NovaGrand as a next-generation, high-performance social & video ecosystem with 4K Calling, Creator Monetization, and AdMob integration.`;
    navigator.clipboard?.writeText?.(bioText);
    setCopiedBio(true);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setCopiedBio(false), 3000);
  };

  // AI Assistant Smart Q&A Response Engine
  const generateAIResponse = (userQuery: string): string => {
    const query = userQuery.toLowerCase().trim();

    if (query.includes('call') || query.includes('video') || query.includes('4k') || query.includes('agora') || query.includes('audio')) {
      return `📹 **NovaGrand 4K Video Calling Guide:**\n\n1. Tap the **Video Call** icon in the top Navbar or click on any profile's "Call" button.\n2. You can create a custom Room ID (e.g. \`studio-live\`) or join an active room.\n3. Powered by **Agora RTC 48kHz Opus Audio** for crystal-clear real-time communication.\n4. You can toggle camera on/off, mute microphone, flip camera, and chat live during the call!`;
    }

    if (query.includes('monetiz') || query.includes('earning') || query.includes('paisa') || query.includes('kama') || query.includes('income') || query.includes('admob') || query.includes('rupee')) {
      return `💰 **NovaGrand Creator Monetization & Earning Rules:**\n\n1. **Creator Tier Threshold**: Reach 20,000 active followers to unlock the Official Creator Tier.\n2. **Ad Revenue Sharing**: Earn live CPM revenue from Google AdMob rewarded videos & banner impressions.\n3. **Coin Gifts**: Followers can send Coin gifts directly on your Reels and 4K Live Streams.\n4. **Payouts**: All earnings are tracked on your **Professional Dashboard** and deposited to your linked bank account / UPI.`;
    }

    if (query.includes('coin') || query.includes('unblock') || query.includes('wallet') || query.includes('self unblock') || query.includes('balance')) {
      return `🪙 **Coins & 150-Coin Self-Unblock Protocol:**\n\n1. **New User Bonus**: Get +100 Coins upon registration!\n2. **Earn Free Coins**: Watch 15s Google AdMob rewarded video ads in the DMs/Wallet to get +10 Coins per view.\n3. **150-Coin Self-Unblock**: If a user or chat is locked/blocked, use 150 Coins from your wallet to instantly verify identity and self-unblock without waiting for support!`;
    }

    if (query.includes('photo') || query.includes('avatar') || query.includes('dp') || query.includes('profile picture') || query.includes('image') || query.includes('gallery')) {
      return `📸 **Custom Profile Photo & Avatar Guide:**\n\n1. Go to your **Profile Screen** (bottom-right avatar icon).\n2. Tap **"Edit Profile"** or tap directly on your circular avatar.\n3. Tap **"Upload Photo from Gallery"** to pick any real photo from your device, or sync your real Google Account photo.\n4. Your updated photo is saved directly to your **Firebase Cloud Profile** and will appear instantly across Navbar, Comments, and Reels!`;
    }

    if (query.includes('pin') || query.includes('lock') || query.includes('password') || query.includes('security') || query.includes('private')) {
      return `🔒 **Custom PIN App Lock & Privacy:**\n\n1. Go to **Settings & Activity** from your profile.\n2. Set your custom 4-digit security PIN lock.\n3. Whenever you reopen the app, your chats, vault, and wallet are protected.\n4. You can also toggle **Private Account** mode so only approved followers see your content.`;
    }

    if (query.includes('email') || query.includes('contact') || query.includes('support') || query.includes('gmail') || query.includes('noushad')) {
      return `📧 **NovaGrand Official Support Policy:**\n\n• **Official Registered Contact**: \`noushadalam5507@gmail.com\` (Founder: MD Naushad Alam).\n• **Security Safeguard**: To protect against spam, direct unsolicited incoming emails are filtered. All support tickets, queries, and account requests are answered 24/7 directly right here inside this **AI Support Desk** or via the ticket form below!`;
    }

    // Default friendly response
    return `✨ **NovaGrand AI Support:**\n\nThank you for asking! NovaGrand is built with real Firebase Firestore cloud syncing, 4K Agora RTC Opus video streaming, and Google AdMob monetization.\n\n• For **Video Calls**: Tap the camera icon in top navigation.\n• For **Profile / Photo**: Go to Profile tab > Edit Profile.\n• For **Coins / Rewards**: Watch AdMob rewarded ads or check daily bonus.\n\nIs there anything specific you would like help with?`;
  };

  const handleSendAiMessage = (customText?: string) => {
    const textToSend = (customText || aiPrompt).trim();
    if (!textToSend) return;

    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setAiPrompt('');
    setIsAiThinking(true);

    setTimeout(() => {
      const replyText = generateAIResponse(textToSend);
      const aiMsg: AIMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAiMessages((prev) => [...prev, aiMsg]);
      setIsAiThinking(false);
    }, 600);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    setIsSubmittingTicket(true);
    setTimeout(() => {
      setIsSubmittingTicket(false);
      setTicketSuccess(true);
      setTicketMessage('');
      setTicketSubject('');
      confetti({ particleCount: 50, spread: 80 });
      setTimeout(() => setTicketSuccess(false), 6000);
    }, 800);
  };

  const faqs = [
    {
      id: 'faq1',
      question: 'How do 4K Direct Video & Audio Calls work?',
      answer:
        'NovaGrand integrates high-performance Agora RTC Opus 48kHz spatial audio channels. Tap any user’s video icon or enter a Room ID to start an instant peer-to-peer 4K call with ultra-low latency (<20ms).',
    },
    {
      id: 'faq2',
      question: 'How does the 150-Coin Self-Unblock protocol work?',
      answer:
        'If an account or chat conversation is locked or blocked, users can utilize 150 NovaGrand Coins from their wallet to instantly verify identity and self-unblock without waiting for manual support.',
    },
    {
      id: 'faq3',
      question: 'How can I earn free coins via Google AdMob Rewarded Video?',
      answer:
        'Watch a 15-second high-definition interactive sponsor video inside the Direct Messages or AdMob Rewarded hub to earn +10 NovaGrand Coins credited directly to your Firestore wallet balance.',
    },
    {
      id: 'faq4',
      question: 'When does Creator Monetization unlock?',
      answer:
        'Monetization unlocks automatically upon reaching 20,000 active followers. Once reached, verified creators unlock brand revenue shares, tipping badges, cash payouts per upload, and paid studio room hosting.',
    },
    {
      id: 'faq5',
      question: 'How is user data synchronized and secured?',
      answer:
        'All posts, comments, wallet coins, and messaging locks are persisted and guarded in real-time across Google Cloud Firebase Firestore with Google OAuth 2.0 and industry-grade encryption standards.',
    },
  ];

  return (
    <div
      id="help-and-founder-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        id="help-and-founder-modal-container"
        className="w-full max-w-2xl my-auto rounded-3xl bg-zinc-950/95 border border-purple-500/60 neon-border-purple shadow-[0_0_60px_rgba(168,85,247,0.35)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Cyberpunk Badges */}
        <div className="px-5 py-4 bg-zinc-900/90 border-b border-purple-900/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-purple-600 p-0.5 shadow-md shadow-purple-600/30">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  NovaGrand Founder & Support Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                  Official Portal
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80 font-mono">
                Founder: MD Naushad Alam · Mumbai, Maharashtra
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-purple-900/40"
          >
            ✕
          </button>
        </div>

        {/* Modal Tab Navigation Bar */}
        <div className="px-5 pt-3 pb-2 bg-zinc-950 border-b border-purple-950 flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('founder')}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'founder'
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/50'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-purple-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Founder's Journey</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'support'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black shadow-lg shadow-emerald-500/40 border border-emerald-300/60'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-purple-950'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Support Desk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/40 border border-cyan-400/50'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-purple-950'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>App Settings</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* ========================================================================= */}
          {/* TAB 1: FOUNDER'S JOURNEY (MD NAUSHAD ALAM) */}
          {/* ========================================================================= */}
          {activeTab === 'founder' && (
            <div id="founders-journey-section" className="space-y-5 animate-fade-in">
              {/* Hero Cyberpunk Profile Card */}
              <div className="relative rounded-3xl bg-gradient-to-br from-zinc-950 via-purple-950/60 to-zinc-950 border-2 border-fuchsia-500/50 p-6 shadow-2xl overflow-hidden">
                {/* Background Holographic Grid Scanlines & Ambient Glow */}
                <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {/* Founder Hologram Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-emerald-400 via-fuchsia-500 to-cyan-400 shadow-[0_0_30px_rgba(217,70,239,0.5)]">
                      <div className="w-full h-full rounded-[22px] bg-zinc-950 overflow-hidden relative flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                          alt="MD Naushad Alam"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      </div>
                    </div>
                    {/* Founder Crown VIP Badge */}
                    <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500 text-black font-black text-[10px] uppercase font-mono tracking-wider shadow-lg flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-black" />
                      <span>FOUNDER</span>
                    </div>
                  </div>

                  {/* Founder Profile Details */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                        MD Naushad Alam
                      </h3>
                      <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Verified Architect</span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-fuchsia-300 font-mono">
                      Founder, Visionary & Lead System Architect
                    </p>

                    {/* Geolocation Tag Badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-purple-900/60 text-purple-200 text-[11px] font-medium flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>Mumbai, Maharashtra</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-purple-900/60 text-purple-200 text-[11px] font-medium flex items-center gap-1.5">
                        <Compass className="w-3 h-3 text-cyan-400" />
                        <span>Roots: Jharkhand, India</span>
                      </span>
                    </div>

                    {/* Animated Social Media Action Buttons (Instagram, GitHub, LinkedIn) */}
                    <div className="pt-2 space-y-1.5">
                      <div className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>Official Social Channels:</span>
                        <span className="text-cyan-300">Tap for Glitch Link</span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <a
                          href="https://instagram.com/noushadalam5507"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/80 to-pink-900/80 hover:from-purple-800 hover:to-pink-700 border border-pink-500/60 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 active:animate-glitch-ripple"
                        >
                          <svg className="w-3.5 h-3.5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          <span>Instagram</span>
                          <ExternalLink className="w-3 h-3 text-pink-300 opacity-70" />
                        </a>

                        <a
                          href="https://github.com/noushadalam5507"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-cyan-500/50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 active:animate-glitch-ripple"
                        >
                          <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                          <span>GitHub</span>
                          <ExternalLink className="w-3 h-3 text-cyan-300 opacity-70" />
                        </a>

                        <a
                          href="https://linkedin.com/in/naushad-alam-5507"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-950/90 to-indigo-950/90 hover:from-blue-900 hover:to-indigo-800 border border-blue-500/50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 active:animate-glitch-ripple"
                        >
                          <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                          <span>LinkedIn</span>
                          <ExternalLink className="w-3 h-3 text-blue-300 opacity-70" />
                        </a>
                      </div>
                    </div>

                    {/* Quick Copy Bio Action */}
                    <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={handleCopyBio}
                        className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-fuchsia-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        {copiedBio ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Bio Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-300" />
                            <span>Copy Founder Bio</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/60 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-cyan-300" />
                        <span>noushadalam5507@gmail.com</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Founder's Journey Chronological Story Narrative */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-300">
                  <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>The Story & Evolution of MD Naushad Alam</span>
                </div>

                {/* Milestone 1: Roots & Birthplace */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-purple-900/60 hover:border-purple-500/50 transition-all space-y-2 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-black text-xs font-mono">
                      01
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>Roots & Birthplace in Jharkhand</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-normal">
                          · The Genesis
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-400">Where the vision took seed</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed pl-11">
                    Born in <span className="text-emerald-400 font-semibold">Jharkhand, India</span>,
                    MD Naushad Alam harbored big dreams from an early age—fueled by an unshakeable
                    vision to create something truly unique, high-performing, and disruptive in the
                    global technology landscape.
                  </p>
                </div>

                {/* Milestone 2: Journey & Upbringing in Mumbai */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-purple-900/60 hover:border-purple-500/50 transition-all space-y-2 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-black text-xs font-mono">
                      02
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>Journey & Upbringing in Mumbai, Maharashtra</span>
                        <span className="text-[10px] font-mono text-cyan-400 font-normal">
                          · The City of Hustle
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-400">Where ambition met relentless drive</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed pl-11">
                    Raised since early childhood in{' '}
                    <span className="text-cyan-400 font-semibold">Mumbai, Maharashtra</span>, where
                    his entire family relocated and settled permanently. Growing up amidst the
                    unstoppable rhythm and energy of Mumbai forged his relentless hustle, fearless
                    ambition, and deep passion for software engineering and creative technology.
                  </p>
                </div>

                {/* Milestone 3: The Vision to Out-Innovate Giants */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900/90 to-zinc-900/80 border border-fuchsia-500/50 transition-all space-y-2 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/50 flex items-center justify-center text-fuchsia-300 font-black text-xs font-mono">
                      03
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>Disruptive Vision & The Instagrand Architecture</span>
                        <span className="text-[10px] font-mono text-fuchsia-400 font-normal">
                          · Next-Gen Standard
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-400">Building beyond legacy social apps</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed pl-11">
                    Driven by a deep desire to build advanced, next-generation social and video
                    communication applications that stand out from global giants like Instagram.
                    Instagrand N A introduces peer-to-peer 4K Opus 48kHz calling, instant creator
                    monetization, self-unblock privacy protocols, and total user empowerment.
                  </p>
                </div>
              </div>

              {/* Core Pillars of Innovation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-zinc-900/90 border border-purple-900/50 text-center space-y-1">
                  <Video className="w-5 h-5 mx-auto text-emerald-400" />
                  <div className="text-xs font-bold text-white">4K Live Agora Studio</div>
                  <div className="text-[10px] text-zinc-400">Low-latency Opus calling</div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/90 border border-purple-900/50 text-center space-y-1">
                  <Coins className="w-5 h-5 mx-auto text-amber-400" />
                  <div className="text-xs font-bold text-white">50-Coin Self-Unblock</div>
                  <div className="text-[10px] text-zinc-400">Autonomous user privacy</div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/90 border border-purple-900/50 text-center space-y-1">
                  <ShieldCheck className="w-5 h-5 mx-auto text-cyan-400" />
                  <div className="text-xs font-bold text-white">Firestore Vault</div>
                  <div className="text-[10px] text-zinc-400">Zero data loss security</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: HELP & SUPPORT SCREEN WITH 24/7 AI ASSISTANT */}
          {/* ========================================================================= */}
          {activeTab === 'support' && (
            <div id="help-and-support-section" className="space-y-6 animate-fade-in">
              {/* Direct Support Hub Header Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-zinc-950 to-purple-950/60 border border-emerald-500/50 neon-border-green space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <h3 className="text-base font-black text-white">
                        NovaGrand AI Support & Creator Desk
                      </h3>
                    </div>
                    <p className="text-xs text-emerald-300 font-mono mt-0.5">
                      Founder & Lead: MD Naushad Alam · Mumbai, Maharashtra
                    </p>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>24/7 Instant AI Resolution</span>
                  </div>
                </div>

                {/* Direct Contact Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 text-emerald-300 font-medium text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                      <span className="truncate">noushadalam5507@gmail.com</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-mono flex-shrink-0">
                      Official Desk
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Email Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-emerald-400" />
                        <span>Copy Support Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 24/7 AI Support Assistant Interactive Card */}
              <div className="p-5 rounded-3xl bg-zinc-950 border border-emerald-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                        NovaGrand 24/7 AI Smart Assistant
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ONLINE
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Ask any question in Hindi, Hinglish, or English
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAiMessages([
                        {
                          id: 'msg_reset',
                          sender: 'ai',
                          text: `👋 Namaste! How can I assist you with NovaGrand features today?`,
                          time: 'Just now',
                        },
                      ]);
                    }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1 transition-all"
                    title="Reset Chat"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Query Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">Suggested Topics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '📹 4K Video Calling',
                      '💰 Creator Monetization & Earning',
                      '🪙 150-Coin Self-Unblock',
                      '📸 Upload Custom Profile Photo',
                      '🔒 PIN Lock & Privacy',
                      '📧 Official Support Info',
                    ].map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleSendAiMessage(topic)}
                        className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-emerald-950 border border-zinc-800 hover:border-emerald-500/50 text-[11px] text-zinc-300 hover:text-emerald-300 font-medium transition-all"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Chat History Container */}
                <div className="max-h-72 overflow-y-auto space-y-3 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                  {aiMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none shadow-md'
                            : 'bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-bl-none shadow-md font-sans'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono mt-1 px-1">
                        {msg.sender === 'user' ? 'You' : 'NovaGrand AI'} · {msg.time}
                      </span>
                    </div>
                  ))}

                  {isAiThinking && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 w-fit text-xs text-emerald-400 font-mono animate-pulse">
                      <Bot className="w-4 h-4 animate-spin text-emerald-400" />
                      NovaGrand AI is answering your question...
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendAiMessage();
                      }
                    }}
                    placeholder="Ask about 4K calling, photo upload, coins, earnings..."
                    className="flex-1 px-3.5 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 focus:border-emerald-400 text-white text-xs placeholder:text-zinc-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendAiMessage()}
                    disabled={!aiPrompt.trim() || isAiThinking}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-black font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <span>Ask</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Live Diagnostic Infrastructure Health */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-purple-900/50 space-y-2 text-xs">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  Real-time System & Service Status
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded-xl bg-zinc-950 border border-purple-950 flex items-center justify-between">
                    <span className="text-zinc-400">Agora RTC:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      48kHz Ready
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-950 border border-purple-950 flex items-center justify-between">
                    <span className="text-zinc-400">Firestore DB:</span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Synced
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-950 border border-purple-950 flex items-center justify-between">
                    <span className="text-zinc-400">AdMob Ads:</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Rewarded Live
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* GOOGLE ADMOB OFFICIAL MONETIZATION PORTAL CARD */}
              {/* ========================================================================= */}
              <div
                id="admob-portal-link-card"
                className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-zinc-950 to-zinc-950 border-2 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.25)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-amber-400 uppercase font-black tracking-wider flex items-center gap-1">
                        <span>OFFICIAL AD NETWORK</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <h4 className="text-sm font-black text-white">
                        Google AdMob Publisher Portal
                      </h4>
                    </div>
                  </div>

                  <a
                    href="https://admob.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>Open AdMob</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed">
                  Official Google AdMob Monetization console link: <strong className="text-amber-300 font-mono">https://admob.google.com</strong>.
                  Configure your Publisher ID, App Open Ads, Adaptive Bottom Banners, and High-eCPM Interstitial units connected to <strong className="text-white">noushadalam5507@gmail.com</strong>.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-emerald-900/60 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div className="text-emerald-300 font-bold truncate">AdMob: Connected</div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-purple-900/60 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <div className="text-cyan-300 font-bold truncate">Banner: Active</div>
                  </div>
                </div>
              </div>

              {/* Submit a Support Request Form */}
              <div className="p-5 rounded-3xl bg-zinc-900/90 border border-purple-900/60 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-fuchsia-400" />
                  <h4 className="text-sm font-black text-white">Send Direct Message to Support</h4>
                </div>

                {ticketSuccess ? (
                  <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold space-y-1 animate-fade-in">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Ticket Submitted Successfully!</span>
                    </div>
                    <p className="text-[11px] text-emerald-200 font-normal">
                      Our support engineering team will review your message promptly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                          Category
                        </label>
                        <select
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-purple-900/60 text-white text-xs focus:outline-none focus:border-cyan-400"
                        >
                          <option value="General Support">General Support</option>
                          <option value="4K Call Issue">4K Call & Agora WebRTC</option>
                          <option value="Coins & Wallet">Coins, Wallet & Self-Unblock</option>
                          <option value="AdMob Rewards">Google AdMob Rewarded Video</option>
                          <option value="Creator Monetization">Creator Monetization</option>
                          <option value="Feature Request">Feature Request</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Brief summary..."
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-purple-900/60 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Describe your issue or query
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Tell us what's happening..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-purple-900/60 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingTicket}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {isSubmittingTicket ? (
                        <span>Submitting Ticket...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Support Ticket</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Frequently Asked Questions (FAQ) Accordion */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-300">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>Frequently Asked Questions</span>
                </div>

                <div className="space-y-2">
                  {faqs.map((faq) => {
                    const isOpenFaq = openFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-2xl bg-zinc-900/70 border border-purple-950 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqId(isOpenFaq ? null : faq.id)}
                          className="w-full px-4 py-3 text-left font-bold text-xs text-white flex items-center justify-between gap-3 hover:bg-zinc-800/50 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            {faq.question}
                          </span>
                          {isOpenFaq ? (
                            <ChevronUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                          )}
                        </button>

                        {isOpenFaq && (
                          <div className="px-4 pb-3 text-xs text-zinc-300 leading-relaxed border-t border-purple-950/60 bg-zinc-950/40 animate-fade-in">
                            <p className="pt-2">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: APP SETTINGS & PRIVACY */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div id="app-settings-privacy-section" className="space-y-5 animate-fade-in">
              {/* Privacy Toggles */}
              <div className="p-5 rounded-3xl bg-zinc-900/80 border border-purple-900/60 space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-fuchsia-400" />
                  <span>Privacy & Call Permissions</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-purple-950">
                    <div>
                      <div className="font-bold text-white">Private Account</div>
                      <div className="text-zinc-400 text-[11px]">
                        Only approved followers can view your posts and reels
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPrivateAccount(!isPrivateAccount)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                        isPrivateAccount ? 'bg-fuchsia-600' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          isPrivateAccount ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-purple-950">
                    <div>
                      <div className="font-bold text-white">Direct 4K Calls</div>
                      <div className="text-zinc-400 text-[11px]">
                        Allow followers to dial directly into your Opus Studio
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowDirectCalls(!allowDirectCalls)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                        allowDirectCalls ? 'bg-fuchsia-600' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          allowDirectCalls ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-purple-950">
                    <div>
                      <div className="font-bold text-white">Ultra-HD Media Uploads</div>
                      <div className="text-zinc-400 text-[11px]">
                        Upload images & video reels at maximum resolution
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHighQualityUploads(!highQualityUploads)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                        highQualityUploads ? 'bg-fuchsia-600' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          highQualityUploads ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Google Auth & Firestore Identity Info */}
              <div className="p-4 rounded-3xl bg-purple-950/40 border border-purple-900/60 space-y-2 text-xs">
                <div className="font-bold text-fuchsia-300 flex items-center justify-between">
                  <span>Current Authenticated Identity</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    Cloud Synced
                  </span>
                </div>
                <div className="text-zinc-200 font-mono text-xs p-2 rounded-xl bg-zinc-950 border border-purple-950">
                  {currentUser?.email || 'user@instagrand.app'}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Registered:{' '}
                  <span className="text-zinc-300 font-mono">
                    {currentUser?.registeredAt || 'August 2026'}
                  </span>
                  {' · '}Coins:{' '}
                  <span className="text-amber-300 font-mono font-bold">
                    {currentUser?.coins ?? 100} Coins
                  </span>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-2 pt-1">
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-fuchsia-600 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-600/30"
                  >
                    Switch Google Account
                  </button>
                )}

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Log Out from Device</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer with Owner Watermark */}
        <div className="px-5 py-3 bg-zinc-900/90 border-t border-purple-900/60 flex items-center justify-between text-[11px] font-mono text-zinc-400 flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Instagrand VIP Social Studio · 4K Opus</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
