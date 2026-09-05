import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Video,
  Upload,
  Download,
  Share2,
  CheckCircle2,
  RefreshCw,
  Eye,
  Layers,
  Wand2,
  Zap,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Flame,
  ArrowRight,
  Maximize2,
  Coins,
  Send,
  Camera,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, PostItem } from '../types';

export interface AIFilterPreset {
  id: string;
  name: string;
  category: 'cyber' | 'cinematic' | 'artistic' | 'retro' | 'enhancement';
  icon: string;
  description: string;
  filterStyle: {
    brightness: number;
    contrast: number;
    saturate: number;
    hueRotate: number;
    sepia: number;
    blur: number;
    grayscale: number;
    invert: number;
    glow: number; // custom glow overlay
    vignette: number;
    grain: boolean;
  };
  badge?: string;
}

export const AI_FILTER_PRESETS: AIFilterPreset[] = [
  {
    id: 'original',
    name: 'Natural / Raw',
    category: 'enhancement',
    icon: '✨',
    description: 'Clean untouched original media resolution',
    filterStyle: {
      brightness: 100,
      contrast: 100,
      saturate: 100,
      hueRotate: 0,
      sepia: 0,
      blur: 0,
      grayscale: 0,
      invert: 0,
      glow: 0,
      vignette: 0,
      grain: false,
    },
  },
  {
    id: 'cyber-neon-ultra',
    name: 'Cyber Neon Ultra',
    category: 'cyber',
    icon: '🔮',
    description: 'Deep violet neon illumination, magenta chromatic highlights & crisp cyber shadows',
    badge: 'Popular',
    filterStyle: {
      brightness: 108,
      contrast: 135,
      saturate: 165,
      hueRotate: 18,
      sepia: 5,
      blur: 0,
      grayscale: 0,
      invert: 0,
      glow: 40,
      vignette: 30,
      grain: false,
    },
  },
  {
    id: 'cinematic-4k-hdr',
    name: 'Cinematic 4K HDR',
    category: 'cinematic',
    icon: '🎬',
    description: 'Ultra-wide dynamic range, rich warm highlights, deep cinematic shadows',
    badge: '4K Ultra',
    filterStyle: {
      brightness: 105,
      contrast: 125,
      saturate: 135,
      hueRotate: -6,
      sepia: 8,
      blur: 0,
      grayscale: 0,
      invert: 0,
      glow: 15,
      vignette: 25,
      grain: false,
    },
  },
  {
    id: 'neural-matrix',
    name: 'Neural Matrix',
    category: 'cyber',
    icon: '🌌',
    description: 'Futuristic cyan/emerald digital glow with AI synthetic edge enhancement',
    filterStyle: {
      brightness: 112,
      contrast: 140,
      saturate: 180,
      hueRotate: 130,
      sepia: 10,
      blur: 0,
      grayscale: 0,
      invert: 0,
      glow: 50,
      vignette: 40,
      grain: true,
    },
  },
  {
    id: 'anime-studio-glow',
    name: 'Anime Studio Glow',
    category: 'artistic',
    icon: '🌸',
    description: 'Dreamy soft diffused pastel bloom, skin tone smoothing, vivid animation colors',
    filterStyle: {
      brightness: 115,
      contrast: 110,
      saturate: 150,
      hueRotate: -12,
      sepia: 12,
      blur: 0,
      grayscale: 0,
      invert: 0,
      glow: 45,
      vignette: 15,
      grain: false,
    },
  },
  {
    id: 'midnight-noir-35mm',
    name: 'Midnight Noir 35mm',
    category: 'retro',
    icon: '🕶️',
    description: 'High-contrast silver halide monochrome, dramatic lighting, vintage cinema grain',
    filterStyle: {
      brightness: 98,
      contrast: 155,
      saturate: 0,
      hueRotate: 0,
      sepia: 15,
      blur: 0,
      grayscale: 100,
      invert: 0,
      glow: 10,
      vignette: 55,
      grain: true,
    },
  },
  {
    id: 'vaporwave-hologram',
    name: 'Vaporwave Hologram',
    category: 'artistic',
    icon: '🌈',
    description: 'Iridescent dual-tone sunset glow with nostalgic synthwave warmth',
    filterStyle: {
      brightness: 110,
      contrast: 130,
      saturate: 190,
      hueRotate: 55,
      sepia: 20,
      blur: 0,
      grayscale: 0,
      invert: 0,
      glow: 35,
      vignette: 30,
      grain: false,
    },
  },
  {
    id: 'golden-hour-flare',
    name: 'Solar Flare Golden Hour',
    category: 'cinematic',
    icon: '🔥',
    description: 'Warm golden sunset rays, rich amber tones, velvet skin radiance',
    filterStyle: {
      brightness: 108,
      contrast: 120,
      saturate: 140,
      hueRotate: -25,
      sepia: 30,
      blur: 0,
      grayscale: 0,
      invert: 0,
      glow: 30,
      vignette: 20,
      grain: false,
    },
  },
  {
    id: 'glitch-wave-ai',
    name: 'Glitch Wave AI',
    category: 'cyber',
    icon: '👾',
    description: 'Futuristic digital artifacting, RGB chromatic split, cyber edge distortion',
    badge: 'AI FX',
    filterStyle: {
      brightness: 118,
      contrast: 145,
      saturate: 210,
      hueRotate: 90,
      sepia: 0,
      blur: 0,
      grayscale: 0,
      invert: 0,
      glow: 60,
      vignette: 45,
      grain: true,
    },
  },
  {
    id: 'crystal-prism-clarity',
    name: 'Crystal Prism Clarity',
    category: 'enhancement',
    icon: '💎',
    description: 'Neural edge sharpness, denoise enhancement, vivid crystalline micro-contrast',
    filterStyle: {
      brightness: 104,
      contrast: 130,
      saturate: 125,
      hueRotate: 0,
      sepia: 0,
      blur: 0,
      grayscale: 0,
      invert: 0,
      glow: 20,
      vignette: 10,
      grain: false,
    },
  },
];

interface AIMediaFilterStudioProps {
  currentUser: UserProfile | null;
  onApplyMediaToPost?: (mediaUrl: string, mediaType: 'image' | 'video', appliedFilterName: string) => void;
  onClose?: () => void;
}

export const AIMediaFilterStudio: React.FC<AIMediaFilterStudioProps> = ({
  currentUser,
  onApplyMediaToPost,
  onClose,
}) => {
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80'
  );
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [activePresetId, setActivePresetId] = useState<string>('cyber-neon-ultra');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Custom Fine-Tuning Sliders
  const [brightness, setBrightness] = useState<number>(108);
  const [contrast, setContrast] = useState<number>(135);
  const [saturate, setSaturate] = useState<number>(165);
  const [hueRotate, setHueRotate] = useState<number>(18);
  const [glowIntensity, setGlowIntensity] = useState<number>(40);
  const [vignette, setVignette] = useState<number>(30);
  const [isGrainEnabled, setIsGrainEnabled] = useState<boolean>(false);
  const [isComparingOriginal, setIsComparingOriginal] = useState<boolean>(false);

  // AI Auto-Enhance state
  const [isAiOptimizing, setIsAiOptimizing] = useState<boolean>(false);
  const [aiScore, setAiScore] = useState<number>(98);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video playback state
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample media presets
  const sampleMediaPresets = [
    {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
      label: 'Cyber Fluid 4K',
    },
    {
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
      label: 'Neon Server Nodes',
    },
    {
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
      label: 'Prismatic Glow',
    },
    {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
      label: 'Quantum Circuits',
    },
    {
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      type: 'video' as const,
      label: 'Cyber City Video',
    },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // When preset is selected, sync parameters
  const handleSelectPreset = (preset: AIFilterPreset) => {
    setActivePresetId(preset.id);
    setBrightness(preset.filterStyle.brightness);
    setContrast(preset.filterStyle.contrast);
    setSaturate(preset.filterStyle.saturate);
    setHueRotate(preset.filterStyle.hueRotate);
    setGlowIntensity(preset.filterStyle.glow);
    setVignette(preset.filterStyle.vignette);
    setIsGrainEnabled(preset.filterStyle.grain);
    showToast(`Applied "${preset.name}" filter!`);
  };

  // AI 1-Click Neural Auto-Enhancer
  const handleAiAutoEnhance = () => {
    setIsAiOptimizing(true);
    setTimeout(() => {
      setBrightness(110);
      setContrast(130);
      setSaturate(145);
      setHueRotate(10);
      setGlowIntensity(35);
      setVignette(20);
      setAiScore(99);
      setIsAiOptimizing(false);
      confetti({ particleCount: 50, spread: 60 });
      showToast('✨ AI Neural Auto-Enhance calibrated lighting, dynamic contrast, and chroma bloom!');
    }, 800);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      const objectUrl = URL.createObjectURL(file);
      setSelectedMediaUrl(objectUrl);
      setMediaType(isVid ? 'video' : 'image');
      setIsVideoPlaying(true);
      showToast(`Uploaded ${isVid ? 'Video' : 'Photo'}: ${file.name}`);
    }
  };

  // Compute CSS filter string
  const cssFilterString = isComparingOriginal
    ? 'none'
    : `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg)`;

  const filteredPresetList = AI_FILTER_PRESETS.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <div
      id="ai-media-filter-studio"
      className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in px-3 sm:px-0"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-cyan-500 text-white font-bold text-xs shadow-2xl animate-bounce border border-purple-300/40 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Studio Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-zinc-950 to-zinc-950 border border-purple-500/50 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-cyan-300 text-xs font-bold">
            <Wand2 className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
            <span>AI Neural Media Processing Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            AI Photo & 4K Video Filters
          </h1>
          <p className="text-xs text-purple-200/80 max-w-xl">
            Enhance, transform, and apply real-time cyber luminescence, 4K HDR dynamic ranges, and neural filters to your photos and videos.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleAiAutoEnhance}
            disabled={isAiOptimizing}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>{isAiOptimizing ? 'Optimizing AI...' : '1-Click AI Auto-Enhance'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace Grid: Preview Stage & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT / TOP: MEDIA CANVAS PREVIEW STAGE */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-3xl bg-zinc-950 border-2 border-purple-900/60 overflow-hidden shadow-2xl flex items-center justify-center group">
            {/* Background Ambient Glow */}
            <div
              className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
              style={{
                opacity: glowIntensity / 100,
                background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.35) 0%, transparent 70%)',
              }}
            />

            {/* Render Image or Video with live CSS filter pipeline */}
            {mediaType === 'video' ? (
              <video
                ref={videoRef}
                src={selectedMediaUrl}
                autoPlay
                loop
                muted={isVideoMuted}
                playsInline
                className="w-full h-full object-contain transition-all duration-150"
                style={{ filter: cssFilterString }}
              />
            ) : (
              <img
                src={selectedMediaUrl}
                alt="AI Filter Stage"
                className="w-full h-full object-contain transition-all duration-150"
                style={{ filter: cssFilterString }}
              />
            )}

            {/* Vignette Overlay */}
            {vignette > 0 && !isComparingOriginal && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-200"
                style={{
                  boxShadow: `inset 0 0 ${vignette * 2.5}px rgba(0,0,0,${vignette / 100})`,
                }}
              />
            )}

            {/* AI Film Grain Overlay */}
            {isGrainEnabled && !isComparingOriginal && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20 bg-repeat mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
            )}

            {/* Top Badge: Active Preset Name */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-purple-500/50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>
                  {isComparingOriginal
                    ? 'Original (Raw)'
                    : AI_FILTER_PRESETS.find((p) => p.id === activePresetId)?.name || 'Custom Filter'}
                </span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
                AI Score: {aiScore}/100
              </span>
            </div>

            {/* Video Controls (if video is active) */}
            {mediaType === 'video' && (
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md p-1.5 rounded-2xl border border-purple-900/60">
                <button
                  type="button"
                  onClick={() => {
                    if (videoRef.current) {
                      if (isVideoPlaying) {
                        videoRef.current.pause();
                      } else {
                        videoRef.current.play();
                      }
                      setIsVideoPlaying(!isVideoPlaying);
                    }
                  }}
                  className="p-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-white transition-colors cursor-pointer"
                >
                  {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Hold to Compare Original Button */}
            <div className="absolute bottom-3 right-3 z-20">
              <button
                type="button"
                onMouseDown={() => setIsComparingOriginal(true)}
                onMouseUp={() => setIsComparingOriginal(false)}
                onTouchStart={() => setIsComparingOriginal(true)}
                onTouchEnd={() => setIsComparingOriginal(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-lg select-none cursor-pointer transition-all active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-300" />
                <span>Hold to Compare</span>
              </button>
            </div>
          </div>

          {/* Quick Media Upload & Sample Selector Strip */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-purple-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Upload or Choose Media Sample</span>
              </span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/30 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo / Video</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Horizontal thumbnail selector */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {sampleMediaPresets.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedMediaUrl(sample.url);
                    setMediaType(sample.type);
                    setIsVideoPlaying(true);
                    showToast(`Loaded sample: ${sample.label}`);
                  }}
                  className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 relative cursor-pointer group transition-all ${
                    selectedMediaUrl === sample.url
                      ? 'border-fuchsia-500 scale-105 shadow-md shadow-fuchsia-500/30'
                      : 'border-purple-900/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={sample.type === 'video' ? 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200' : sample.url}
                    alt={sample.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                    <span className="text-[9px] font-bold text-white leading-tight truncate">
                      {sample.label}
                    </span>
                  </div>
                  {sample.type === 'video' && (
                    <div className="absolute top-1 right-1 p-0.5 rounded bg-purple-600 text-white">
                      <Film className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: AI FILTER PRESET GALLERY & FINE-TUNING CONTROLS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-zinc-950/80 border border-purple-900/50 rounded-2xl">
            {['all', 'cyber', 'cinematic', 'artistic', 'retro', 'enhancement'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredPresetList.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative group ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-950/90 via-zinc-900 to-zinc-900 border-fuchsia-500 shadow-lg shadow-fuchsia-500/20'
                      : 'bg-zinc-950/80 border-purple-900/40 hover:border-purple-600/60 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{preset.icon}</span>
                      <span className="text-xs font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                        {preset.name}
                      </span>
                    </div>
                    {preset.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-fuchsia-300 font-bold border border-purple-500/40">
                        {preset.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Interactive Sliders & Parameter Customizer */}
          <div className="p-4 rounded-3xl bg-zinc-950/90 border border-purple-900/60 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fine-Tuning Controls</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const originalPreset = AI_FILTER_PRESETS.find((p) => p.id === 'original')!;
                  handleSelectPreset(originalPreset);
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer font-medium"
              >
                Reset
              </button>
            </div>

            {/* Brightness / Exposure Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-300">
                <span>Brightness / Exposure</span>
                <span className="text-cyan-400 font-mono">{brightness}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="160"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Contrast Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-300">
                <span>Dynamic Contrast</span>
                <span className="text-purple-400 font-mono">{contrast}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="180"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Saturation Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-300">
                <span>Chroma Saturation</span>
                <span className="text-fuchsia-400 font-mono">{saturate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                value={saturate}
                onChange={(e) => setSaturate(Number(e.target.value))}
                className="w-full accent-fuchsia-500 cursor-pointer"
              />
            </div>

            {/* Hue Shift Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-300">
                <span>Color Spectrum / Hue Shift</span>
                <span className="text-amber-400 font-mono">{hueRotate}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={hueRotate}
                onChange={(e) => setHueRotate(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Luminescence Glow & Vignette Row */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-zinc-300">
                  <span>Neon Glow</span>
                  <span className="text-purple-300 font-mono">{glowIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-zinc-300">
                  <span>Vignette Edge</span>
                  <span className="text-zinc-400 font-mono">{vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={vignette}
                  onChange={(e) => setVignette(Number(e.target.value))}
                  className="w-full accent-zinc-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Film Grain Toggle */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-zinc-300 font-semibold">35mm Film Grain Simulation</span>
              <button
                type="button"
                onClick={() => setIsGrainEnabled(!isGrainEnabled)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  isGrainEnabled
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-zinc-900 border border-purple-950 text-zinc-400'
                }`}
              >
                {isGrainEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="space-y-2 pt-2">
            {onApplyMediaToPost && (
              <button
                type="button"
                onClick={() => {
                  const activePreset = AI_FILTER_PRESETS.find((p) => p.id === activePresetId);
                  onApplyMediaToPost(
                    selectedMediaUrl,
                    mediaType,
                    activePreset?.name || 'Custom AI Filter'
                  );
                  confetti({ particleCount: 60, spread: 70 });
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm tracking-wide shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Use Filtered Media in Post / Reel (+₹5.00 Payout)</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/60 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close AI Filter Studio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
