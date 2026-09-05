import React, { useState } from 'react';
import {
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Lock,
  Unlock,
  ShieldCheck,
  Coins,
  Sparkles,
  Eye,
  Key,
  ExternalLink,
  ChevronRight,
  Flame,
  CheckCircle2,
  FileCheck,
  Music,
  Disc3,
  Headphones,
  Check,
  Radio,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, PostItem } from '../types';

interface VideoReelsExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onStartCall: (roomId: string, username: string) => void;
}

export interface VideoReelItem {
  id: string;
  title: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  isVerified: boolean;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  resolution: string;
  views: number;
  likes: number;
  isLiked?: boolean;
  isPrivateVault?: boolean;
  unlockCostCoins?: number;
  isUnlocked?: boolean;
  audioTrackTitle?: string;
  audioArtist?: string;
  audioDuration?: string;
  downloadFiles: {
    name: string;
    size: string;
    type: '4K MP4 Master' | 'Opus HQ Audio' | 'Private RAW Project File';
    url: string;
  }[];
  monetizedPerView: string;
}

export interface ReelAudioTrack {
  id: string;
  title: string;
  artist: string;
  category: 'Trending' | 'Hindi' | 'Urdu' | 'Slowed & Reverb' | 'Synth & Cyber';
  duration: string;
  usesCount: string;
}

const VIRAL_AUDIO_TRACKS: ReelAudioTrack[] = [
  {
    id: 'aud-1',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh & Sachin-Jigar',
    category: 'Hindi',
    duration: '3:45',
    usesCount: '1.4M Reels',
  },
  {
    id: 'aud-2',
    title: 'Kahani Suno 2.0',
    artist: 'Kaifi Khalil',
    category: 'Urdu',
    duration: '2:55',
    usesCount: '980K Reels',
  },
  {
    id: 'aud-3',
    title: 'Neon Matrix 4K Synth Theme',
    artist: 'Instagrand Audio Studio',
    category: 'Synth & Cyber',
    duration: '1:30',
    usesCount: '450K Reels',
  },
  {
    id: 'aud-4',
    title: 'Kesariya (Lo-Fi Slowed & Reverb)',
    artist: 'Pritam & Arijit Singh',
    category: 'Slowed & Reverb',
    duration: '4:10',
    usesCount: '2.1M Reels',
  },
  {
    id: 'aud-5',
    title: 'Starboy (Cyberpunk VIP Remix)',
    artist: 'The Weeknd & Daft Punk',
    category: 'Trending',
    duration: '3:20',
    usesCount: '3.8M Reels',
  },
];

export const VideoReelsExperienceModal: React.FC<VideoReelsExperienceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartCall,
}) => {
  // 5 Specially Curated 4K Video Clips with Private Download & Lock/Unlock capabilities
  const [videoList, setVideoList] = useState<VideoReelItem[]>([
    {
      id: 'vid-1',
      title: 'Neon Cyber Matrix 4K Visualizer',
      creatorName: 'Cyber Studio VIP',
      creatorUsername: 'cyber_vip',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      duration: '0:34',
      resolution: '4K Ultra HD (60fps)',
      views: 18450,
      likes: 3420,
      isLiked: true,
      isPrivateVault: false,
      isUnlocked: true,
      monetizedPerView: '$0.24/view',
      downloadFiles: [
        {
          name: 'CyberMatrix_Master_4K.mp4',
          size: '142 MB',
          type: '4K MP4 Master',
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        },
        {
          name: 'OpusHQ_48kHz_Audio.opus',
          size: '18.4 MB',
          type: 'Opus HQ Audio',
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        },
      ],
    },
    {
      id: 'vid-2',
      title: 'Tokyo Cyberpunk Hologram Dancer',
      creatorName: 'Elena Vance',
      creatorUsername: 'elena_neon',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
      duration: '0:48',
      resolution: '4K HDR (120fps)',
      views: 29800,
      likes: 6710,
      isLiked: false,
      isPrivateVault: false,
      isUnlocked: true,
      monetizedPerView: '$0.32/view',
      downloadFiles: [
        {
          name: 'Elena_TokyoHologram_Cinema_4K.mp4',
          size: '210 MB',
          type: '4K MP4 Master',
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        },
        {
          name: 'Elena_Spatial_Stereo_Audio.mp3',
          size: '24.1 MB',
          type: 'Opus HQ Audio',
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        },
      ],
    },
    {
      id: 'vid-3',
      title: 'Quantum Neural Stream & AI Shimmer',
      creatorName: 'Dr. Marcus Lee',
      creatorUsername: 'marcus_ai',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
      duration: '1:12',
      resolution: '4K Ultra Wide (60fps)',
      views: 14200,
      likes: 2190,
      isLiked: false,
      isPrivateVault: false,
      isUnlocked: true,
      monetizedPerView: '$0.18/view',
      downloadFiles: [
        {
          name: 'Marcus_Quantum_Laser_Stream_4K.mp4',
          size: '340 MB',
          type: '4K MP4 Master',
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        },
        {
          name: 'Quantum_Soundtrack_OpusHQ.opus',
          size: '31.2 MB',
          type: 'Opus HQ Audio',
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        },
      ],
    },
    {
      id: 'vid-4',
      title: 'EXCLUSIVE PRIVATE VAULT: Studio Master Key',
      creatorName: 'VIP Master Creator',
      creatorUsername: 'vip_master',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      duration: '1:45',
      resolution: '8K Master Cinema RAW',
      views: 45200,
      likes: 12890,
      isLiked: true,
      isPrivateVault: true,
      unlockCostCoins: 50,
      isUnlocked: true, // Default unlocked for creator
      monetizedPerView: '$1.50/view (Premium Tier)',
      downloadFiles: [
        {
          name: 'PRIVATE_VAULT_Master_8K_RAW.mov',
          size: '1.2 GB',
          type: 'Private RAW Project File',
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        },
        {
          name: 'PRIVATE_VAULT_Opus_Lossless_Stems.zip',
          size: '280 MB',
          type: 'Private RAW Project File',
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        },
      ],
    },
    {
      id: 'vid-5',
      title: 'EXCLUSIVE PRIVATE VAULT: Cyberpunk Shimmer & Stage Lighting',
      creatorName: 'Sophia Chen',
      creatorUsername: 'sophia_vr',
      creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
      duration: '0:55',
      resolution: '4K Ultra HD (60fps)',
      views: 31000,
      likes: 7450,
      isLiked: false,
      isPrivateVault: true,
      unlockCostCoins: 30,
      isUnlocked: false, // Locked for demo unlock experience
      monetizedPerView: '$0.85/view',
      downloadFiles: [
        {
          name: 'PRIVATE_VAULT_Sophia_StageLighting_4K.mp4',
          size: '310 MB',
          type: 'Private RAW Project File',
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        },
        {
          name: 'Sophia_Lossless_Audio_Stems.flac',
          size: '64 MB',
          type: 'Private RAW Project File',
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        },
      ],
    },
  ]);

  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [isMusicDrawerOpen, setIsMusicDrawerOpen] = useState<boolean>(false);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<ReelAudioTrack>(VIRAL_AUDIO_TRACKS[0]);
  const [previewingAudioId, setPreviewingAudioId] = useState<string | null>(null);
  const [audioCategoryFilter, setAudioCategoryFilter] = useState<string>('All');

  if (!isOpen) return null;

  const currentVideo = videoList[selectedVideoIndex];

  const handleToggleLike = (id: string) => {
    setVideoList((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const nextLiked = !v.isLiked;
          if (nextLiked) {
            confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
          }
          return {
            ...v,
            isLiked: nextLiked,
            likes: nextLiked ? v.likes + 1 : v.likes - 1,
          };
        }
        return v;
      })
    );
  };

  const handleUnlockPrivateVault = (id: string, cost: number) => {
    setVideoList((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return { ...v, isUnlocked: true };
        }
        return v;
      })
    );
    confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } });
    setDownloadToast(`Unlocked Private Vault Video & 2 Secret Files (-${cost} Coins)!`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const handleTriggerDownload = (fileName: string, fileUrl: string) => {
    // Initiate clean simulated file download in browser
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadToast(`Downloaded: ${fileName}`);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setDownloadToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div
        id="video-reels-5-theater-modal"
        className="w-full max-w-4xl bg-zinc-950 border-2 border-purple-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(168,85,247,0.4)] relative overflow-hidden max-h-[94vh] flex flex-col space-y-4"
      >
        {/* Background Cyber Glow */}
        <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-purple-900/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-400 p-0.5 shadow-md shadow-fuchsia-500/30">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Film className="w-5 h-5 text-fuchsia-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  5 High-Definition Video Reels & Private File Vaults
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 font-mono">
                  5 Clips Available
                </span>
              </div>
              <p className="text-xs text-purple-300">
                Watch 4K Ultra HD Clips · Download 2 Private Master Files · Watch-to-Earn Monetized
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-purple-900/60 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Toast Notification */}
        {downloadToast && (
          <div className="relative z-20 p-2.5 rounded-2xl bg-emerald-950 border-2 border-emerald-400 shadow-[0_0_25px_rgba(0,255,102,0.4)] text-xs text-white font-bold flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-300" />
              <span>{downloadToast}</span>
            </div>
            <span className="text-[10px] text-emerald-300 font-mono">100% Complete</span>
          </div>
        )}

        {/* 5 Video Selector Badges / Strip */}
        <div className="relative z-10 grid grid-cols-5 gap-2 pb-1">
          {videoList.map((vid, idx) => {
            const isSelected = selectedVideoIndex === idx;
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => {
                  setSelectedVideoIndex(idx);
                  setIsPlaying(true);
                }}
                className={`p-2 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-purple-950/90 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.35)] ring-1 ring-fuchsia-400'
                    : 'bg-zinc-900/80 border-purple-900/50 hover:border-purple-500/60 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                  <span className={isSelected ? 'text-fuchsia-300' : 'text-zinc-400'}>
                    Clip #{idx + 1}
                  </span>
                  {vid.isPrivateVault && (
                    <span className="text-amber-400 flex items-center">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {vid.creatorUsername === 'vip_master' ? '★ VIP Master' : `@${vid.creatorUsername}`}
                </div>
                <div className="text-[9px] text-zinc-400 font-mono truncate">{vid.duration}</div>
              </button>
            );
          })}
        </div>

        {/* Main Video Theater Layout (Video Player + Sidebar Info & 2 Downloads) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-y-auto pr-1">
          {/* Left / Center 4K Video Player (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-purple-500/40 shadow-2xl aspect-video sm:aspect-[4/3] flex items-center justify-center group">
              {currentVideo.isPrivateVault && !currentVideo.isUnlocked ? (
                /* Private Locked Vault Screen */
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-purple-950/90 to-black flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="p-4 rounded-3xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                    <Lock className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Private Vault Video Locked
                    </h3>
                    <p className="text-xs text-purple-300 max-w-sm mt-1">
                      This clip contains 2 confidential master download files and founder footage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleUnlockPrivateVault(
                        currentVideo.id,
                        currentVideo.unlockCostCoins || 30
                      )
                    }
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Key className="w-4 h-4" />
                    <span>Unlock Vault ({currentVideo.unlockCostCoins || 30} Coins)</span>
                  </button>
                </div>
              ) : (
                /* Active Video Player */
                <>
                  <video
                    key={currentVideo.id}
                    src={currentVideo.videoUrl}
                    poster={currentVideo.thumbnail}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Player Overlay Controls */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-fuchsia-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                      </button>
                      <span className="text-[11px] font-mono text-zinc-300">
                        {currentVideo.duration} · {currentVideo.resolution}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{currentVideo.monetizedPerView}</span>
                    </div>
                  </div>

                  {/* Resolution & Audio Floating Badges on Top of Video */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                    <div className="px-2.5 py-1 rounded-full bg-purple-950/85 backdrop-blur-md border border-purple-500/50 text-[10px] font-mono font-bold text-fuchsia-300 flex items-center gap-1 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Clip #{selectedVideoIndex + 1} · {currentVideo.resolution}</span>
                    </div>

                    {/* Dedicated Instagram-style Reels Music Icon / Button Overlay */}
                    <button
                      id="reels-overlay-music-btn"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMusicDrawerOpen(true);
                      }}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 hover:bg-purple-950/90 backdrop-blur-md border border-fuchsia-500/50 text-white shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title="Select or View Audio Track"
                    >
                      <div className="relative flex items-center justify-center">
                        <Disc3 className="w-4 h-4 text-fuchsia-400 animate-spin" style={{ animationDuration: '3s' }} />
                        <Music className="w-2 h-2 text-cyan-300 absolute" />
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-black text-fuchsia-300 flex items-center gap-1 max-w-[130px] truncate leading-tight">
                          <span>{selectedAudioTrack.title}</span>
                          <span className="text-[8px] px-1 rounded bg-fuchsia-500/20 text-fuchsia-300 font-normal">Sound</span>
                        </div>
                        <div className="text-[9px] text-zinc-400 truncate max-w-[130px] leading-tight">
                          {selectedAudioTrack.artist}
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-bold ml-0.5">♫</span>
                    </button>
                  </div>

                  {/* Inline Audio Selector Drawer Overlay */}
                  {isMusicDrawerOpen && (
                    <div
                      id="inline-reels-music-drawer"
                      className="absolute inset-0 z-30 bg-zinc-950/95 backdrop-blur-xl p-4 flex flex-col justify-between animate-fadeIn border-2 border-fuchsia-500/60 rounded-3xl"
                    >
                      {/* Drawer Header */}
                      <div className="flex items-center justify-between border-b border-purple-900/60 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center shadow-md">
                            <Music className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                              <span>Reels Audio Library</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40">
                                48kHz HD
                              </span>
                            </h4>
                            <p className="text-[10px] text-zinc-400">
                              Trending Hindi, Urdu, Slowed & Cyber Audio
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsMusicDrawerOpen(false);
                            setPreviewingAudioId(null);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-purple-900/40 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Category Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                        {['All', 'Trending', 'Hindi', 'Urdu', 'Slowed & Reverb', 'Synth & Cyber'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setAudioCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                              audioCategoryFilter === cat
                                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-sm shadow-fuchsia-500/40'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-purple-900/40'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Audio Tracks List */}
                      <div className="flex-1 overflow-y-auto space-y-1.5 my-2 pr-1">
                        {VIRAL_AUDIO_TRACKS.filter(
                          (t) => audioCategoryFilter === 'All' || t.category === audioCategoryFilter
                        ).map((track) => {
                          const isSelected = selectedAudioTrack.id === track.id;
                          const isPreviewing = previewingAudioId === track.id;

                          return (
                            <div
                              key={track.id}
                              className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-purple-950/80 border-fuchsia-400/80 shadow-[0_0_15px_rgba(217,70,239,0.25)]'
                                  : 'bg-zinc-900/80 border-purple-900/40 hover:border-purple-600/50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewingAudioId(isPreviewing ? null : track.id)}
                                  className={`w-7 h-7 rounded-xl flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                                    isPreviewing
                                      ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/40'
                                      : 'bg-zinc-800 hover:bg-zinc-700 text-purple-300'
                                  }`}
                                >
                                  {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                                </button>

                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                    <span>{track.title}</span>
                                    {isSelected && (
                                      <span className="text-[9px] px-1 rounded bg-fuchsia-500/20 text-fuchsia-300 font-mono">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1.5">
                                    <span>{track.artist}</span>
                                    <span>•</span>
                                    <span className="text-cyan-300 font-mono">{track.usesCount}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAudioTrack(track);
                                  setIsMusicDrawerOpen(false);
                                  setDownloadToast(`Selected Audio: ${track.title}`);
                                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                                  setTimeout(() => setDownloadToast(null), 3000);
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/30'
                                    : 'bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50'
                                }`}
                              >
                                {isSelected ? <Check className="w-3 h-3" /> : <Music className="w-3 h-3" />}
                                <span>{isSelected ? 'Applied' : 'Use Audio'}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Active Audio Waveform & Action Footer */}
                      <div className="p-2 rounded-2xl bg-zinc-900 border border-purple-900/60 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Disc3 className="w-4 h-4 text-fuchsia-400 animate-spin" />
                          <span className="truncate max-w-[180px] font-bold text-white">
                            {selectedAudioTrack.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300 font-bold">
                          {selectedAudioTrack.duration} · High Quality Stereo
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick Action Bar under Video (Like, Connect Call, Share) */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/80 border border-purple-900/50">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleToggleLike(currentVideo.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-pink-400 transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      currentVideo.isLiked ? 'fill-pink-500 text-pink-500' : ''
                    }`}
                  />
                  <span>{currentVideo.likes.toLocaleString()}</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>{currentVideo.views.toLocaleString()} Views</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onStartCall(
                    `video-clip-${currentVideo.creatorUsername}`,
                    currentVideo.creatorUsername
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Call @{currentVideo.creatorUsername}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: 2 Private Download Files & Clip Metadata (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            {/* Video Details Card */}
            <div className="p-4 rounded-3xl bg-zinc-900/90 border border-purple-900/60 space-y-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentVideo.creatorAvatar}
                  alt={currentVideo.creatorName}
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/50 shadow-sm"
                />
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1">
                    <span>{currentVideo.creatorName}</span>
                    {currentVideo.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400 inline" />
                    )}
                  </div>
                  <div className="text-[11px] text-purple-300 font-mono">
                    @{currentVideo.creatorUsername}
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white leading-snug">
                {currentVideo.title}
              </h4>
            </div>

            {/* TWO PRIVATE FILE DOWNLOADS SECTION */}
            <div
              id="two-private-download-files-box"
              className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/80 via-zinc-950 to-zinc-950 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(0,255,102,0.18)] space-y-3 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">
                      2 Private Download Files
                    </h5>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                    Dual Master Assets
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
                  Download high-bitrate master files directly to your device (4K MP4 Master & HQ Audio Stems).
                </p>

                {/* The Two Download File Cards */}
                <div className="space-y-2">
                  {currentVideo.downloadFiles.map((file, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-3 rounded-2xl bg-zinc-900 border border-purple-900/60 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                          <span className="text-cyan-300 font-bold">{file.type}</span>
                          <span>•</span>
                          <span>{file.size}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTriggerDownload(file.name, file.url)}
                        disabled={currentVideo.isPrivateVault && !currentVideo.isUnlocked}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                          currentVideo.isPrivateVault && !currentVideo.isUnlocked
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 hover:scale-105'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Monetization Summary */}
              <div className="p-2.5 rounded-2xl bg-zinc-950 border border-amber-500/30 flex items-center justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">Real View Earnings:</span>
                <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" />
                  <span>+$0.15 Per Full View</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
