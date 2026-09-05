import React, { useState, useRef } from 'react';
import {
  Crown,
  Sparkles,
  MapPin,
  Compass,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FounderJourneyCardProps {
  onOpenFullModal?: () => void;
  onOpenSupport?: () => void;
  compact?: boolean;
}

export const FounderJourneyCard: React.FC<FounderJourneyCardProps> = ({
  onOpenFullModal,
  onOpenSupport,
  compact = false,
}) => {
  const [copiedBio, setCopiedBio] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [activeGlitchBtn, setActiveGlitchBtn] = useState<string | null>(null);

  // 3D Depth Card Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [isHoveredOrTouched, setIsHoveredOrTouched] = useState<boolean>(false);

  const handleCopyBio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const bioText = `MD Naushad Alam | Founder & Lead Architect of Instagrand N A
Roots: Born in Jharkhand, India with big dreams to build disruptive global technology.
Upbringing: Raised since early childhood in Mumbai, Maharashtra. Growing up in Mumbai shaped his relentless hustle, ambition, and passion for software engineering.
Vision: Engineering next-generation social and 4K Opus communication apps that out-innovate global giants like Instagram.`;
    navigator.clipboard?.writeText?.(bioText);
    setCopiedBio(true);
    confetti({ particleCount: 35, spread: 65, origin: { y: 0.6 } });
    setTimeout(() => setCopiedBio(false), 3000);
  };

  const handleCopyEmail = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText?.('noushadalam5507@gmail.com');
    setCopiedEmail(true);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  // Social Click Handler with Glitch Ripple Effect
  const handleSocialClick = (platform: 'instagram' | 'github' | 'linkedin', url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGlitchBtn(platform);
    
    // Confetti and Glitch Audio/Visual Feedback
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.7 },
      colors: platform === 'instagram' ? ['#ff007f', '#d946ef', '#f59e0b'] : platform === 'github' ? ['#00f0ff', '#ffffff', '#00ff66'] : ['#0077b5', '#00f0ff', '#ffffff']
    });

    setTimeout(() => {
      setActiveGlitchBtn(null);
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 380);
  };

  // 3D Depth Calculation on Mouse Move (Desktop)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6; // max 6deg
    const rotateY = ((x - centerX) / centerX) * 6; // max 6deg

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.08s ease-out',
    });
    setIsHoveredOrTouched(true);
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
    setIsHoveredOrTouched(false);
  };

  // 3D Touch Interaction (Mobile Screen Tilt & 3D Depth)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: 'transform 0.05s ease-out',
    });
    setIsHoveredOrTouched(true);
  };

  const handleTouchEnd = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
    setIsHoveredOrTouched(false);
  };

  return (
    <div
      id="founder-journey-card-container"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={tiltStyle}
      className={`relative w-full max-w-full box-border rounded-3xl bg-gradient-to-br from-zinc-950 via-purple-950/60 to-zinc-950 border-2 animate-founder-neon-pulse shadow-2xl overflow-hidden cursor-default select-none transform-gpu ${
        compact ? 'p-4 sm:p-5 space-y-3.5' : 'p-4 sm:p-6 space-y-4'
      }`}
    >
      {/* Background Holographic Grid & Multi-Chromatic Neon Flares */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Interactive Light Beam Glare on 3D Tilt */}
      {isHoveredOrTouched && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-fuchsia-500/10 to-cyan-400/10 pointer-events-none transition-opacity duration-300" />
      )}

      {/* Header Row: Founder Identity & Crown */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Glowing Holographic Avatar Container */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-emerald-400 via-cyan-400 to-fuchsia-500 shadow-[0_0_20px_rgba(0,255,102,0.5)]">
              <div className="w-full h-full rounded-[14px] bg-zinc-950 overflow-hidden relative flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt="MD Naushad Alam"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Crown Tag */}
            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 border border-zinc-950 flex items-center justify-center shadow">
              <Crown className="w-3 h-3 text-black fill-black" />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>FOUNDER & LEAD ARCHITECT</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
              <span>MD Naushad Alam</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
            </h3>
          </div>
        </div>

        {onOpenFullModal && (
          <button
            type="button"
            onClick={onOpenFullModal}
            className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-fuchsia-500/50 text-fuchsia-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
          >
            <span>Full Story</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
          </button>
        )}
      </div>

      {/* Geolocation Badges */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 text-xs">
        <span className="px-3 py-1 rounded-xl bg-zinc-900/90 border border-purple-900/70 text-purple-200 text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mumbai, Maharashtra</span>
        </span>

        <span className="px-3 py-1 rounded-xl bg-zinc-900/90 border border-purple-900/70 text-purple-200 text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Roots: Jharkhand, India</span>
        </span>

        <span className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-300" />
          <span>4K WebRTC Pioneer</span>
        </span>
      </div>

      {/* Journey Narrative Milestones */}
      <div className="relative z-10 space-y-2.5 text-xs">
        {/* Milestone 1: Roots in Jharkhand */}
        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-purple-900/60 hover:border-emerald-500/40 transition-colors space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff66]" />
            <span>Roots in Jharkhand & Early Global Vision</span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed pl-4">
            Born in Jharkhand, India, with big dreams and an unshakeable vision to create something unique, disruptive, and transformative in global technology.
          </p>
        </div>

        {/* Milestone 2: Mumbai Upbringing */}
        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-purple-900/60 hover:border-cyan-500/40 transition-colors space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span>Mumbai Upbringing & The Relentless Hustle</span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed pl-4">
            Raised since early childhood in Mumbai, Maharashtra, where his family relocated and settled. Mumbai's unstoppable energy shaped his relentless hustle, ambition, and deep love for software craftsmanship.
          </p>
        </div>

        {/* Milestone 3: Disruptive Vision */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/70 to-zinc-900/80 border border-fuchsia-500/40 hover:border-fuchsia-400/60 transition-colors space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#ff007f]" />
            <span>Disruptive Vision: Out-Innovating Global Giants</span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed pl-4">
            Engineering next-generation applications with 4K Opus calling, 50-coin autonomous self-unblocking, and creator empowerment that stand out from global giants like Instagram.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ANIMATED SOCIAL MEDIA ACTION BUTTONS (INSTAGRAM, GITHUB, LINKEDIN) */}
      {/* ========================================================================= */}
      <div className="relative z-10 pt-1 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-purple-300">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Connect with MD Naushad Alam:</span>
          </span>
          <span className="text-[10px] text-cyan-300 font-bold">Official Profiles</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* 1. Instagram Glowing Glitch Button */}
          <button
            id="founder-social-instagram-btn"
            type="button"
            onClick={(e) => handleSocialClick('instagram', 'https://instagram.com/noushadalam5507', e)}
            className={`py-2.5 px-2 rounded-2xl bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-amber-900/80 hover:from-purple-800 hover:to-pink-700 border border-pink-500/60 text-white font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-pink-500/20 group hover:scale-[1.03] active:scale-[0.97] ${
              activeGlitchBtn === 'instagram' ? 'animate-glitch-ripple ring-2 ring-pink-400 bg-pink-600' : ''
            }`}
          >
            <svg
              className="w-4 h-4 text-pink-400 group-hover:text-white transition-colors shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="text-[11px] font-bold">Instagram</span>
            <ExternalLink className="w-3 h-3 text-pink-300 opacity-60 group-hover:opacity-100 hidden sm:inline" />
          </button>

          {/* 2. GitHub Glowing Glitch Button */}
          <button
            id="founder-social-github-btn"
            type="button"
            onClick={(e) => handleSocialClick('github', 'https://github.com/noushadalam5507', e)}
            className={`py-2.5 px-2 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-cyan-500/50 text-white font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 group hover:scale-[1.03] active:scale-[0.97] ${
              activeGlitchBtn === 'github' ? 'animate-glitch-ripple ring-2 ring-cyan-400 bg-cyan-600' : ''
            }`}
          >
            <svg
              className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="text-[11px] font-bold">GitHub</span>
            <ExternalLink className="w-3 h-3 text-cyan-300 opacity-60 group-hover:opacity-100 hidden sm:inline" />
          </button>

          {/* 3. LinkedIn Glowing Glitch Button */}
          <button
            id="founder-social-linkedin-btn"
            type="button"
            onClick={(e) => handleSocialClick('linkedin', 'https://linkedin.com/in/naushad-alam-5507', e)}
            className={`py-2.5 px-2 rounded-2xl bg-gradient-to-r from-blue-950/90 to-indigo-950/90 hover:from-blue-900 hover:to-indigo-800 border border-blue-500/50 text-white font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-blue-500/20 group hover:scale-[1.03] active:scale-[0.97] ${
              activeGlitchBtn === 'linkedin' ? 'animate-glitch-ripple ring-2 ring-blue-400 bg-blue-600' : ''
            }`}
          >
            <svg
              className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <span className="text-[11px] font-bold">LinkedIn</span>
            <ExternalLink className="w-3 h-3 text-blue-300 opacity-60 group-hover:opacity-100 hidden sm:inline" />
          </button>
        </div>
      </div>

      {/* Copy Actions & Support Shortcut */}
      <div className="relative z-10 pt-1 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopyBio}
          className="flex-1 py-2.5 px-3 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-fuchsia-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          {copiedBio ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Founder Bio Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-amber-300" />
              <span>Copy Full Bio</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopyEmail}
          className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-purple-900/60 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          {copiedEmail ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Mail className="w-3.5 h-3.5 text-cyan-300" />
              <span>Email Founder</span>
            </>
          )}
        </button>

        {onOpenSupport && (
          <button
            type="button"
            onClick={onOpenSupport}
            className="w-full py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span>Priority Support Desk (24h Turnaround)</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        )}
      </div>
    </div>
  );
};
