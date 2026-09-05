import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Video,
  Image as ImageIcon,
  DollarSign,
  Coins,
  Crown,
  Share2,
  Download,
  Flame,
  Zap,
  CheckCircle2,
  X,
  Play,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Eye,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, PostItem } from '../types';

interface AICreatorAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onPublishPost?: (post: PostItem) => void;
}

export const AICreatorAssistantModal: React.FC<AICreatorAssistantModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPublishPost,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [generatedMedia, setGeneratedMedia] = useState<{
    url: string;
    caption: string;
    hashtags: string[];
    monetizationEst: string;
    coinReward: number;
    platformRoyalty: string;
  } | null>(null);
  const [isPublished, setIsPublished] = useState<boolean>(false);

  // Pre-made Viral Prompts
  const viralPresets = [
    {
      title: 'Neon Cyberpunk 4K Portrait',
      prompt: 'Ultra-realistic 4K cyberpunk portrait with reflective mirror glass goggles, glowing purple and teal volumetric lighting, futuristic city skyline.',
      type: 'image' as const,
      preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    },
    {
      title: 'Cinematic 3D Holographic Reel',
      prompt: 'Futuristic 3D chrome mirror hologram dancer in a high-tech studio with laser beams, bass drop visualizer, 60fps cinematic video.',
      type: 'video' as const,
      preview: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
    },
    {
      title: 'Luxury Diamond Avatar',
      prompt: 'Hyper-detailed luxury influencer wearing floating diamond jewelry, golden holographic crown, neon purple velvet studio background.',
      type: 'image' as const,
      preview: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
    },
    {
      title: 'Quantum Anime Cyber Wings',
      prompt: 'Next-gen anime warrior with glowing cybernetic wings, crystal blade, dynamic particles floating in matrix cyberspace.',
      type: 'image' as const,
      preview: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
    },
  ];

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProgress(15);
    setIsPublished(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsGenerating(false);

      // Select high quality sample image or dynamic preview
      const sampleImages = [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
      ];
      const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];

      setGeneratedMedia({
        url: randomImg,
        caption: prompt,
        hashtags: ['#InstagrandAI', '#CreatorEconomy', '#VIPCreator', '#CyberCreator', '#MonetizedReels'],
        monetizationEst: '$18.50',
        coinReward: 80,
        platformRoyalty: '$3.70',
      });

      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    }, 2000);
  };

  const handlePublishToFeed = () => {
    if (!generatedMedia || !onPublishPost) return;

    const newPost: PostItem = {
      id: `ai_post_${Date.now()}`,
      authorId: currentUser?.id || 'usr_creator',
      authorName: currentUser?.name || 'Creator',
      authorUsername: currentUser?.username || 'creator',
      authorAvatar: currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'creator'}&backgroundColor=180a30`,
      isVerified: true,
      mediaType: mediaType,
      mediaUrl: generatedMedia.url,
      caption: `🤖 AI Assistant Generated: "${generatedMedia.caption}" | Earning live ad revenue per view!`,
      hashtags: generatedMedia.hashtags,
      location: 'Instagrand AI Cyber Studio',
      audioTrack: 'AI Neural Beats · 48kHz HQ',
      likesCount: 1,
      isLiked: true,
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      createdAt: 'Just now',
      isMonetized: true,
      earningsEst: generatedMedia.monetizationEst,
    };

    onPublishPost(newPost);
    setIsPublished(true);
    confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="ai-creator-assistant-modal"
        className="w-full max-w-2xl bg-zinc-950 border-2 border-purple-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(168,85,247,0.35)] relative overflow-hidden max-h-[92vh] flex flex-col space-y-4"
      >
        {/* Background Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-purple-900/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-fuchsia-500/30">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-fuchsia-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  AI Creator Studio Assistant
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  Earn Real Money
                </span>
              </div>
              <p className="text-xs text-purple-300">
                Generate 4K Photos & Concept Reels · Monetized via Google AdMob & Views
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-purple-900/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Revenue & Earning Info Banner */}
        <div className="relative z-10 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-purple-950/80 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="font-black text-white flex items-center gap-1">
                <span>Creator Monetization Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-emerald-300">
                You earn <strong className="text-white">+$18.50</strong> per viral creation + <strong className="text-amber-300">80 Coins</strong> directly into your creator wallet.
              </p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-400/40">
            AdMob eCPM: Active ($0.12/view)
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="relative z-10 overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Format Selector: Photo vs Video */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setMediaType('image')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                mediaType === 'image'
                  ? 'bg-purple-950/90 border-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.3)]'
                  : 'bg-zinc-900/80 border-purple-900/50 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <div className="p-2 rounded-xl bg-purple-500/20 text-fuchsia-300">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">4K AI Photo / Art</div>
                <div className="text-[10px] text-zinc-400">High-res wallpaper & avatar</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMediaType('video')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                mediaType === 'video'
                  ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                  : 'bg-zinc-900/80 border-purple-900/50 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">AI Video / Concept Reel</div>
                <div className="text-[10px] text-zinc-400">Vertical short video with audio</div>
              </div>
            </button>
          </div>

          {/* Quick Viral Presets */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center justify-between">
              <span>Viral 1-Click Concept Presets:</span>
              <span className="text-fuchsia-400">Tap to load</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {viralPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(preset.prompt);
                    setMediaType(preset.type);
                  }}
                  className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-purple-950/60 border border-purple-900/50 hover:border-fuchsia-500/50 text-left transition-all cursor-pointer flex items-center gap-2 group"
                >
                  <img
                    src={preset.preview}
                    alt={preset.title}
                    className="w-10 h-10 rounded-lg object-cover border border-purple-500/40"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-fuchsia-300 truncate">
                      {preset.title}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {preset.type === 'video' ? '🎬 60fps Video Reel' : '📸 4K HDR Photo'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div className="space-y-1.5">
            <label htmlFor="ai-prompt-input" className="text-xs font-bold text-white flex items-center justify-between">
              <span>Describe what you want the AI Assistant to create:</span>
              <span className="text-[10px] text-emerald-400 font-mono">Powered by Google AI Studio</span>
            </label>
            <div className="relative">
              <textarea
                id="ai-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., 4K realistic photo of a cyberpunk sports car with glowing mirror chrome finish under purple neon rain..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-zinc-900 border border-purple-900/60 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setPrompt('Futuristic 4K portrait of a cyber creator in a high-tech purple neon glass studio with holographic screens and 3D mirror awards.')}
                className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-[10px] text-fuchsia-300 font-bold border border-fuchsia-500/40 cursor-pointer"
              >
                Insert Cyber Prompt
              </button>
            </div>
          </div>

          {/* Generate Button / Progress */}
          {isGenerating ? (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-purple-500/50 space-y-2 text-center animate-pulse">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-fuchsia-300">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>AI Neural Engine Generating {mediaType === 'video' ? 'Video Reel' : '4K Artwork'}...</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-purple-900">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-zinc-400">
                Synthesizing mirror specular reflections & 3D textures ({progress}%)
              </div>
            </div>
          ) : (
            <button
              type="button"
              id="generate-ai-media-btn"
              disabled={!prompt.trim()}
              onClick={handleGenerate}
              className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                prompt.trim()
                  ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-fuchsia-500/30'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate AI {mediaType === 'video' ? 'Video' : 'Photo'} & Unlock Revenue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Generated Result Card */}
          {generatedMedia && (
            <div className="p-4 rounded-3xl bg-zinc-900/90 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(0,255,102,0.2)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    AI Creation Ready & Monetized!
                  </span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/40">
                  Est. Payout: {generatedMedia.monetizationEst}
                </span>
              </div>

              {/* Media Preview Container */}
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/40 max-h-64 bg-black flex items-center justify-center">
                <img
                  src={generatedMedia.url}
                  alt="AI Creation"
                  className="w-full h-full object-cover max-h-64"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                
                {mediaType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-fuchsia-600/90 text-white flex items-center justify-center shadow-lg shadow-fuchsia-600/50">
                      <Play className="w-6 h-6 ml-1" />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-2 left-3 right-3 text-left">
                  <p className="text-white text-xs font-bold line-clamp-2">
                    {generatedMedia.caption}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {generatedMedia.hashtags.map((h, i) => (
                      <span key={i} className="text-[10px] text-cyan-300 font-mono">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-zinc-950 border border-emerald-500/30">
                  <div className="text-[10px] text-zinc-400">Creator Earnings</div>
                  <div className="font-black text-emerald-400">{generatedMedia.monetizationEst}</div>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950 border border-amber-500/30">
                  <div className="text-[10px] text-zinc-400">Wallet Coins</div>
                  <div className="font-black text-amber-300">+{generatedMedia.coinReward} Coins</div>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950 border border-purple-500/30">
                  <div className="text-[10px] text-zinc-400">Founder Royalty</div>
                  <div className="font-black text-purple-300">{generatedMedia.platformRoyalty}</div>
                </div>
              </div>

              {/* Action Buttons: Publish to Instagrand Feed */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  id="publish-ai-to-feed-btn"
                  disabled={isPublished}
                  onClick={handlePublishToFeed}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                    isPublished
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  {isPublished ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Published to Global Feed!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Publish to Feed & Start Earning</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
