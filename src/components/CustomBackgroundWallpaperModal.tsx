import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Check,
  X,
  Sliders,
  RotateCcw,
  Zap,
  Eye,
  Flame,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdMobInterstitialModal } from './AdMobInterstitialModal';
import { UserProfile } from '../types';

interface CustomBackgroundWallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetScreen: 'home' | 'chat';
  currentWallpaperUrl?: string | null;
  currentOpacity?: number;
  onApplyWallpaper: (wallpaperUrl: string | null, opacity: number) => void;
  currentUser?: UserProfile | null;
}

const PRESET_WALLPAPERS = [
  {
    id: 'wp-neon-cyber',
    title: 'Neon Cyberpunk',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp-purple-galaxy',
    title: 'Purple Nebula Galaxy',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp-tokyo-night',
    title: 'Tokyo Midnight Rain',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp-mumbai-sunset',
    title: 'Golden Sunset Horizon',
    url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp-dark-aurora',
    title: 'Emerald Northern Lights',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp-abstract-dark',
    title: 'Dark Liquid Hologram',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  },
];

export const CustomBackgroundWallpaperModal: React.FC<CustomBackgroundWallpaperModalProps> = ({
  isOpen,
  onClose,
  targetScreen,
  currentWallpaperUrl = null,
  currentOpacity = 0.35,
  onApplyWallpaper,
  currentUser,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentWallpaperUrl);
  const [opacity, setOpacity] = useState<number>(currentOpacity);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [isAdOpen, setIsAdOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const screenTitle = targetScreen === 'home' ? 'Home Feed Screen' : 'Direct Chat Screen';

  // Handle local device image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedFilePreview(result);
        setSelectedUrl(result);
        setToastMessage('✅ Photo loaded from your device! Adjust opacity & click Apply.');
        setTimeout(() => setToastMessage(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Ad Break on Apply
  const handleInitiateApply = () => {
    if (!selectedUrl) {
      // If clearing wallpaper, apply directly without ad
      onApplyWallpaper(null, opacity);
      onClose();
      return;
    }

    // Trigger sponsored Ad break modal before applying new wallpaper
    setIsAdOpen(true);
  };

  // Proceed after ad finishes
  const handleAdFinished = () => {
    setIsAdOpen(false);
    onApplyWallpaper(selectedUrl, opacity);
    
    // Celebratory effects
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#06b6d4', '#f59e0b'],
    });

    onClose();
  };

  const handleResetDefault = () => {
    setSelectedUrl(null);
    setUploadedFilePreview(null);
    onApplyWallpaper(null, 0.35);
    onClose();
  };

  return (
    <>
      <div
        id="custom-wallpaper-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          id="custom-wallpaper-modal-card"
          className="w-full max-w-lg max-h-[90vh] rounded-3xl bg-zinc-950 border border-purple-500/50 p-4 sm:p-6 flex flex-col justify-between shadow-2xl overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <span>Custom {screenTitle} Background</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Apni file se koi bhi photo choose karein ya presets use karein
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Toast Notice */}
          {toastMessage && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-xs font-bold text-emerald-300 text-center animate-fade-in">
              {toastMessage}
            </div>
          )}

          {/* Live Preview Box */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-300 font-bold">
              <span>Live Preview ({targetScreen.toUpperCase()})</span>
              <span className="text-[10px] text-purple-300 font-mono">
                Opacity: {Math.round(opacity * 100)}%
              </span>
            </div>

            <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border-2 border-purple-500/60 bg-zinc-900 flex items-center justify-center shadow-inner">
              {selectedUrl ? (
                <>
                  <img
                    src={selectedUrl}
                    alt="Background preview"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity }}
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none" />
                </>
              ) : (
                <div className="text-center p-4 text-zinc-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                  <p className="text-xs font-medium">Default Dark Neon Theme Active</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Upload a photo below to customize</p>
                </div>
              )}

              {/* Sample simulated UI elements on preview */}
              <div className="relative z-10 w-full max-w-xs p-3 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-purple-500/40 text-center shadow-lg pointer-events-none">
                <div className="text-xs font-bold text-white">Sample {targetScreen === 'home' ? 'Post Feed' : 'Chat Bubble'}</div>
                <div className="text-[10px] text-purple-200 mt-1">
                  {targetScreen === 'home'
                    ? 'Your posts will look crystal-clear with your custom wallpaper!'
                    : 'Your DMs & direct messages will have this beautiful backdrop!'}
                </div>
              </div>
            </div>
          </div>

          {/* Upload Button from Device Files */}
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-fuchsia-950/50 to-zinc-900 border border-purple-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload from Device Gallery / Files</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                Any Photo
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Choose Photo from My Files</span>
            </button>
          </div>

          {/* Opacity Slider */}
          <div className="mt-4 p-3 rounded-2xl bg-zinc-900/80 border border-purple-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Background Opacity / Dimmer</span>
              </span>
              <span className="font-mono text-amber-300 text-[11px] font-bold">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.85"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-fuchsia-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-zinc-500">
              <span>Light Dim (10%)</span>
              <span>Balanced (35%)</span>
              <span>Deep Vibrant (85%)</span>
            </div>
          </div>

          {/* Preset HD Wallpapers */}
          <div className="mt-4 space-y-2">
            <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Or Choose 4K Pro Presets</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PRESET_WALLPAPERS.map((wp) => {
                const isSelected = selectedUrl === wp.url;
                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => {
                      setSelectedUrl(wp.url);
                      setUploadedFilePreview(null);
                    }}
                    className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer aspect-video ${
                      isSelected
                        ? 'border-fuchsia-400 ring-2 ring-fuchsia-400/50 scale-105 shadow-lg'
                        : 'border-purple-900/40 hover:border-purple-500/70 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={wp.thumb}
                      alt={wp.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                      <span className="text-[9px] font-bold text-white truncate drop-shadow">
                        {wp.title}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-fuchsia-500 text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-3 border-t border-purple-900/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefault}
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              onClick={handleInitiateApply}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-600/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply Wallpaper (Watch Ad & Set)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ad Interstitial Modal triggered on Wallpaper Apply */}
      {isAdOpen && (
        <AdMobInterstitialModal
          isOpen={isAdOpen}
          onClose={handleAdFinished}
          currentUser={currentUser || null}
          customTitle="Sponsored Ad Break · Applying Wallpaper"
          customSubtitle="Your new custom background photo will be activated once the ad completes"
        />
      )}
    </>
  );
};
