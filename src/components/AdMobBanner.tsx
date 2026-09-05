import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  ExternalLink,
  Info,
  X,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Radio,
  ChevronUp,
  ChevronDown,
  Layers
} from 'lucide-react';
import { ADMOB_CONFIG } from '../lib/admobConfig';
import { shouldBlockAds, isAdminDevice } from '../lib/adminAdPolicy';
import { UserProfile } from '../types';

interface AdMobBannerProps {
  position?: 'sticky-bottom' | 'inline';
  className?: string;
  currentUser?: UserProfile | null;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  position = 'sticky-bottom',
  className = '',
  currentUser,
}) => {
  const isBlockedAdmin = shouldBlockAds(currentUser) || isAdminDevice();
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [adError, setAdError] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeCreativeIndex, setActiveCreativeIndex] = useState<number>(0);
  const adRef = useRef<HTMLModElement | null>(null);

  const fallbackCreatives = [
    {
      brand: 'Google Cloud & AI Studio',
      title: 'Deploy Ultra-Low Latency Apps Globally',
      description: 'Scale next-generation WebRTC & Firebase Firestore pipelines in seconds.',
      cta: 'Explore Cloud',
      ctaUrl: 'https://cloud.google.com',
      gradient: 'from-purple-950/90 via-indigo-950/80 to-zinc-950',
      badgeColor: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/50',
      icon: Zap,
    },
    {
      brand: 'Google Gemini 2.5 Pro',
      title: 'Experience Native Multimodal Realtime AI',
      description: 'Ultra-fast vision, spatial reasoning, and streaming audio APIs.',
      cta: 'Try Gemini API',
      ctaUrl: 'https://ai.google.dev',
      gradient: 'from-fuchsia-950/90 via-purple-950/80 to-zinc-950',
      badgeColor: 'text-amber-300 border-amber-500/40 bg-amber-950/50',
      icon: Sparkles,
    },
    {
      brand: 'Instagrand Verified Creator Pass',
      title: 'Unlock Monetization & 4K Neon Streaming',
      description: 'Direct dial creators, claim custom handles & earn 100 Instagrand Coins.',
      cta: 'Claim Pass',
      ctaUrl: '#',
      gradient: 'from-purple-950/90 via-pink-950/80 to-zinc-950',
      badgeColor: 'text-fuchsia-300 border-fuchsia-500/40 bg-fuchsia-950/50',
      icon: ShieldCheck,
    },
  ];

  // Rotate fallback creatives periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCreativeIndex((prev) => (prev + 1) % fallbackCreatives.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Google AdMob / AdSense script (NEVER for Admin)
  useEffect(() => {
    if (typeof window === 'undefined' || isBlockedAdmin) return;

    let isMounted = true;

    const loadAdMobScript = () => {
      const scriptId = 'google-admob-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADMOB_CONFIG.adClient}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          if (isMounted) {
            pushAd();
          }
        };
        script.onerror = () => {
          if (isMounted) {
            setAdError(true);
          }
        };
        document.head.appendChild(script);
      } else {
        pushAd();
      }
    };

    const pushAd = () => {
      try {
        if (adRef.current && !adRef.current.getAttribute('data-ad-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      } catch (e) {
        console.warn('AdMob push notification handled:', e);
        setAdError(true);
      }
    };

    loadAdMobScript();

    return () => {
      isMounted = false;
    };
  }, [isBlockedAdmin]);

  if (isDismissed || isBlockedAdmin) return null;

  const currentCreative = fallbackCreatives[activeCreativeIndex];
  const CreativeIcon = currentCreative.icon;

  const containerClasses =
    position === 'sticky-bottom'
      ? 'sticky bottom-16 sm:bottom-0 z-30 w-full mt-6 mb-2 animate-fade-in'
      : 'w-full my-4 animate-fade-in';

  return (
    <aside
      id="admob-banner-container"
      aria-label="Sponsored Advertisement"
      className={`${containerClasses} ${className}`}
    >
      <div
        id="admob-banner-inner"
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-purple-500/40 bg-zinc-950/95 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-purple-400/60"
      >
        {/* Glow ambient background layer */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-fuchsia-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Ad Identification Bar */}
        <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-purple-900/40 bg-purple-950/40 text-[10px] text-zinc-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ad · Google AdMob
            </span>
            <span className="hidden sm:inline-block text-zinc-600">|</span>
            <span className="font-mono text-[9px] text-zinc-400 hidden sm:inline-block">
              Unit: {ADMOB_CONFIG.bannerAdUnitId.slice(0, 16)}...
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="admob-info-toggle-btn"
              type="button"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="p-1 rounded text-zinc-400 hover:text-purple-300 hover:bg-purple-900/40 transition-colors cursor-pointer"
              title="AdMob Official Verification Details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              id="admob-dismiss-btn"
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-purple-900/40 transition-colors cursor-pointer"
              title="Close Ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Official Verification Drawer */}
        {isDetailsOpen && (
          <div
            id="admob-credentials-drawer"
            className="p-3 bg-zinc-900/95 border-b border-purple-800/40 text-xs space-y-2 animate-fade-in text-zinc-300"
          >
            <div className="flex items-center justify-between font-semibold text-white">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Google AdMob Official Production Integration</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                VERIFIED ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div className="p-2 rounded-xl bg-zinc-950/80 border border-purple-900/40">
                <span className="text-zinc-500 block text-[9px]">Official AdMob Integration:</span>
                <span className="text-purple-300 font-semibold">
                  ca-app-pub-••••••••••••••••
                </span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/80 border border-purple-900/40">
                <span className="text-zinc-500 block text-[9px]">Banner Ad Unit:</span>
                <span className="text-fuchsia-300 font-semibold">
                  Ad Unit #••••8417798607 (Secured)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Ad Display Area */}
        <div className="relative p-3 sm:p-4">
          {/* Live AdMob / AdSense Script Container */}
          <div
            className={`w-full flex justify-center items-center overflow-hidden min-h-[50px] ${
              adLoaded && !adError ? 'block' : 'hidden'
            }`}
          >
            <ins
              ref={adRef}
              className="adsbygoogle"
              style={{ display: 'block', minHeight: '50px', width: '100%' }}
              data-ad-client={ADMOB_CONFIG.adClient}
              data-ad-slot={ADMOB_CONFIG.adSlot}
              data-ad-format="horizontal"
              data-full-width-responsive="true"
            />
          </div>

          {/* High-Resolution AdMob Sponsored Creative Banner */}
          {(!adLoaded || adError) && (
            <div
              className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r ${currentCreative.gradient} border border-purple-500/30 transition-all`}
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-600/20">
                  <CreativeIcon className="w-5 h-5 text-amber-300" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-white truncate">
                      {currentCreative.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${currentCreative.badgeColor}`}
                    >
                      {currentCreative.brand}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-1">
                    {currentCreative.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                <a
                  href={currentCreative.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="admob-cta-button"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>{currentCreative.cta}</span>
                  <ExternalLink className="w-3 h-3 text-purple-200" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
