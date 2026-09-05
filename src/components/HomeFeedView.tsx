import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Video,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Music2,
  Music,
  Volume2,
  VolumeX,
  Send,
  Coins,
  Crown,
  Radio,
  Plus,
  Download,
  Film,
  DollarSign,
  Flame,
  X,
  Smile,
  Dices,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Clock,
  Instagram,
  ArrowUpRight,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostItem, StoryItem, UserProfile } from '../types';
import { AdMobBanner } from './AdMobBanner';
import { StoryCreatorModal } from './StoryCreatorModal';
import { MusicSelectorModal } from './MusicSelectorModal';
import { CustomBackgroundWallpaperModal } from './CustomBackgroundWallpaperModal';
import { MUSIC_CATALOG } from '../data/musicTracks';
import {
  subscribeToFirestoreStories,
  createNotificationInFirestore,
  sendDirectMessageInFirestore
} from '../lib/firestoreService';

interface HomeFeedViewProps {
  currentUser: UserProfile | null;
  onStartCall: (roomId: string, targetUser?: string) => void;
  onOpenAuth: () => void;
  onNavigateToSearch: () => void;
  onCreateNewPost: () => void;
  onOpenAICreator?: () => void;
  onOpenVideoReels?: () => void;
  onOpenLuckySpin?: () => void;
  onOpenShakeAndWin?: () => void;
  posts: PostItem[];
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenInstagramConnect?: () => void;
}

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  currentUser,
  onStartCall,
  onOpenAuth,
  onNavigateToSearch,
  onCreateNewPost,
  onOpenAICreator,
  onOpenVideoReels,
  onOpenLuckySpin,
  onOpenShakeAndWin,
  posts,
  onToggleLike,
  onAddComment,
  onOpenInstagramConnect,
}) => {
  const isOwnerAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com';

  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState<boolean>(false);
  const [homeWallpaperUrl, setHomeWallpaperUrl] = useState<string | null>(() => {
    return localStorage.getItem('novagrand_home_wallpaper') || null;
  });
  const [homeWallpaperOpacity, setHomeWallpaperOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('novagrand_home_wallpaper_opacity');
    return saved ? parseFloat(saved) : 0.35;
  });

  const handleApplyHomeWallpaper = (url: string | null, opacity: number) => {
    if (url) {
      localStorage.setItem('novagrand_home_wallpaper', url);
      localStorage.setItem('novagrand_home_wallpaper_opacity', opacity.toString());
      setHomeWallpaperUrl(url);
      setHomeWallpaperOpacity(opacity);
    } else {
      localStorage.removeItem('novagrand_home_wallpaper');
      localStorage.removeItem('novagrand_home_wallpaper_opacity');
      setHomeWallpaperUrl(null);
      setHomeWallpaperOpacity(0.35);
    }
  };

  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState<boolean>(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openCommentsModalPostId, setOpenCommentsModalPostId] = useState<string | null>(null);
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [watchedEarningsToast, setWatchedEarningsToast] = useState<{ amount: string; coins: number } | null>(null);
  const [videoMutedState, setVideoMutedState] = useState<Record<string, boolean>>({
    'post-1': true,
  });

  // Story Timer & Pause state
  const [storyProgress, setStoryProgress] = useState<number>(0);
  const [isStoryPaused, setIsStoryPaused] = useState<boolean>(false);
  const [storyReplyText, setStoryReplyText] = useState<string>('');
  const [storyLikedState, setStoryLikedState] = useState<Record<string, boolean>>({});

  // Story Audio Playback controller
  const [isStoryAudioPlaying, setIsStoryAudioPlaying] = useState<boolean>(true);
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic user stories list with preloaded Hindi, Slowed, English, Naat tracks
  const [storyList, setStoryList] = useState<StoryItem[]>([
    {
      id: 'story-1',
      userId: 'usr-elena',
      userName: 'Elena Vance',
      userUsername: 'elena_neon',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      hasUnseenStory: true,
      mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      caption: 'Direct Dialing in 4K Opus Studio! 🚀',
      musicTrackTitle: 'Kahani Suno 2.0 (Slowed + Reverb)',
      musicTrackArtist: 'Kaifi Khalil',
      musicTrackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      musicCategory: 'slowed',
      adMobEarnings: '+$0.50 AdMob',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'story-2',
      userId: 'usr-marcus',
      userName: 'Dr. Marcus Lee',
      userUsername: 'marcus_ai',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      hasUnseenStory: true,
      mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      caption: 'WebRTC ultra low-latency nodes synced worldwide 📡',
      musicTrackTitle: 'Starboy (Cyber Neon Mix)',
      musicTrackArtist: 'The Weeknd',
      musicTrackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      musicCategory: 'english',
      adMobEarnings: '+$0.48 AdMob',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'story-3',
      userId: 'usr-sophia',
      userName: 'Sophia Chen',
      userUsername: 'sophia_vr',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      hasUnseenStory: true,
      mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      caption: 'Cyberpunk aesthetic drops tonight at 8 PM 🔮',
      musicTrackTitle: 'Chaleya (Jawan Hit)',
      musicTrackArtist: 'Arijit Singh & Shilpa Rao',
      musicTrackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      musicCategory: 'hindi',
      adMobEarnings: '+$0.40 AdMob',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'story-4',
      userId: 'usr-devon',
      userName: 'Devon Miles',
      userUsername: 'devon_sound',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isVerified: false,
      hasUnseenStory: true,
      mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      caption: 'Tajdar-e-Haram Soulful acoustic vibes 🕌',
      musicTrackTitle: 'Tajdar-e-Haram (Acoustic Soul)',
      musicTrackArtist: 'Atif Aslam',
      musicTrackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      musicCategory: 'naat',
      adMobEarnings: '+$0.65 AdMob',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  // Subscribe to real-time stories from Firestore
  useEffect(() => {
    const unsub = subscribeToFirestoreStories((firestoreStories) => {
      if (firestoreStories.length > 0) {
        setStoryList((prev) => {
          // Merge custom/firestore stories with initial defaults
          const mergedMap = new Map<string, StoryItem>();
          prev.forEach((s) => mergedMap.set(s.id, s));
          firestoreStories.forEach((s) => mergedMap.set(s.id, s));
          return Array.from(mergedMap.values());
        });
      }
    });

    return () => unsub();
  }, []);

  const activeStory = activeStoryIndex !== null ? storyList[activeStoryIndex] : null;

  // Active Story Timer Progression (5 seconds duration per story, pause on hold)
  useEffect(() => {
    if (activeStoryIndex === null) {
      setStoryProgress(0);
      return;
    }

    setStoryProgress(0);
    const intervalMs = 50;
    const totalDurationMs = 5000;
    const increment = (intervalMs / totalDurationMs) * 100;

    const timer = setInterval(() => {
      if (isStoryPaused) return;

      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Auto advance to next story or close if at end
          if (activeStoryIndex < storyList.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
          } else {
            setActiveStoryIndex(null);
          }
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [activeStoryIndex, isStoryPaused, storyList.length]);

  // Handle active story music playback & AdMob revenue credit
  useEffect(() => {
    if (activeStory && activeStory.musicTrackAudioUrl) {
      if (storyAudioRef.current) {
        storyAudioRef.current.pause();
      }
      const audio = new Audio(activeStory.musicTrackAudioUrl);
      storyAudioRef.current = audio;
      audio.loop = true;
      audio.play().catch(() => {});
      setIsStoryAudioPlaying(true);

      setWatchedEarningsToast({
        amount: activeStory.adMobEarnings || '+$0.35 AdMob',
        coins: 5,
      });
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
      const timer = setTimeout(() => setWatchedEarningsToast(null), 3500);

      return () => {
        audio.pause();
        clearTimeout(timer);
      };
    } else {
      if (storyAudioRef.current) {
        storyAudioRef.current.pause();
      }
    }
  }, [activeStory]);

  const handleToggleStoryAudio = () => {
    if (!storyAudioRef.current) return;
    if (isStoryAudioPlaying) {
      storyAudioRef.current.pause();
      setIsStoryAudioPlaying(false);
    } else {
      storyAudioRef.current.play().catch(() => {});
      setIsStoryAudioPlaying(true);
    }
  };

  const handleAddStory = (newStory: StoryItem) => {
    setStoryList((prev) => [newStory, ...prev]);
    setActiveStoryIndex(0);
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < storyList.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  const handleSendStoryReaction = (emoji: string) => {
    confetti({
      particleCount: 20,
      spread: 60,
      origin: { y: 0.8 },
    });
    if (activeStory && currentUser) {
      createNotificationInFirestore({
        recipientId: activeStory.userId,
        recipientUsername: activeStory.userUsername,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderUsername: currentUser.username,
        senderAvatar: currentUser.avatar,
        senderIsVerified: currentUser.isVerified,
        type: 'like',
        title: `Reacted with ${emoji} to your story`,
        message: `${currentUser.name} reacted to your 24h story: ${emoji}`,
        isRead: false,
      });
    }
  };

  const handleSendStoryReply = async () => {
    if (!storyReplyText.trim() || !activeStory || !currentUser) return;
    try {
      await sendDirectMessageInFirestore({
        senderId: currentUser.id,
        senderUsername: currentUser.username,
        recipientId: activeStory.userId,
        recipientUsername: activeStory.userUsername,
        text: `Replied to your story: "${storyReplyText.trim()}"`,
        mediaUrl: activeStory.mediaUrl,
      });
      setStoryReplyText('');
      confetti({ particleCount: 25, spread: 40 });
    } catch (e) {
      console.error('Error sending story reply:', e);
    }
  };

  const handleLike = (postId: string) => {
    onToggleLike(postId);
    const post = posts.find((p) => p.id === postId);
    if (post && !post.isLiked) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#ec4899', '#d946ef', '#a855f7'],
      });
    }
  };

  const handleSavePost = (postId: string) => {
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const activeCommentsPost = posts.find((p) => p.id === openCommentsModalPostId);

  return (
    <div id="instagrand-home-feed" className="max-w-lg mx-auto space-y-4 px-2 sm:px-0 pb-28 animate-fade-in box-border relative">
      
      {/* Dynamic Custom Wallpaper Backdrop */}
      {homeWallpaperUrl && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={homeWallpaperUrl}
            alt="Home wallpaper"
            className="w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: homeWallpaperOpacity }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
        </div>
      )}
      
      {/* Direct Username Search Bar (Just like Instagram Explore/Search next to Feed) */}
      <div
        id="home-feed-quick-search"
        onClick={onNavigateToSearch}
        className="p-3 bg-zinc-950/85 border border-purple-900/40 hover:border-fuchsia-500/50 rounded-2xl flex items-center justify-between gap-3 shadow-lg cursor-pointer transition-all group backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5 text-zinc-400 group-hover:text-purple-300">
          <div className="p-1.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-cyan-400 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-200 group-hover:text-white flex items-center gap-1.5">
              <span>Search Usernames & Creators</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-fuchsia-300 font-mono">@naushad</span>
            </div>
            <p className="text-[10px] text-zinc-500">Search users, direct call & follow profiles</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-bold shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform shrink-0">
          Search
        </div>
      </div>

      {/* Real Instagram Direct Connect & Sponsor Monetization Card */}
      {onOpenInstagramConnect && (
        <div
          id="home-feed-instagram-connect-card"
          onClick={onOpenInstagramConnect}
          className="p-3 bg-gradient-to-r from-pink-950/40 via-zinc-950 to-purple-950/40 border border-pink-500/40 hover:border-pink-400 rounded-2xl flex items-center justify-between gap-3 shadow-lg cursor-pointer transition-all group backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-700 text-white group-hover:scale-110 transition-transform shadow-md shadow-rose-600/30">
              <Instagram className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-pink-300 flex items-center gap-1.5">
                <span>Real Instagram Contact & DM</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 font-mono">
                  Earn & Collab
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Apne real Instagram se link karke direct sponsors aur DM contact pao</p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md shadow-pink-600/30 group-hover:scale-105 transition-transform shrink-0 flex items-center gap-1">
            <span>Connect</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* 1. Instagram Stories Bar with Colored Gradient Rings */}
      <section
        id="stories-bar-section"
        aria-label="Stories"
        className="p-3.5 rounded-3xl bg-zinc-950/85 border border-purple-900/40 shadow-xl backdrop-blur-md"
      >
        <div className="flex items-center justify-between px-1 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Stories</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono">
              24h
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsMusicModalOpen(true)}
            className="text-[11px] font-semibold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 bg-purple-950/50 px-2.5 py-1 rounded-xl border border-purple-800/40 transition-colors cursor-pointer"
          >
            <Music className="w-3 h-3 text-amber-300" />
            <span>Music Catalog ({MUSIC_CATALOG.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
          {/* Add story for current user */}
          <div
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group select-none"
            onClick={() => setIsStoryCreatorOpen(true)}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-purple-700 via-zinc-800 to-zinc-900 border border-purple-500/30 group-hover:scale-105 transition-all">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt="Your story"
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-400 border-2 border-zinc-950 flex items-center justify-center text-white shadow-md">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
            <span className="text-[11px] text-zinc-300 font-semibold truncate w-16 text-center">
              Your Story
            </span>
          </div>

          {/* Other creator stories with signature Colored Gradient Rings */}
          {storyList.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => setActiveStoryIndex(idx)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group select-none"
            >
              <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 group-hover:scale-105 transition-all shadow-[0_0_12px_rgba(236,72,153,0.35)]">
                <div className="w-full h-full rounded-full p-[2px] bg-zinc-950 relative">
                  <img
                    src={story.userAvatar}
                    alt={story.userName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                  {story.musicTrackTitle && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white flex items-center justify-center text-[8px] border-2 border-zinc-950 shadow-sm">
                      ♫
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-zinc-300 font-medium truncate w-16 text-center">
                @{story.userUsername}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Compact Quick Features Ribbon (Clean single-row scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 relative z-10">
        <button
          id="home-custom-wallpaper-btn"
          type="button"
          onClick={() => setIsWallpaperModalOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-950/80 to-fuchsia-950/80 border border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <ImageIcon className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>🎨 Wallpaper</span>
        </button>

        {onOpenLuckySpin && (
          <button
            type="button"
            onClick={onOpenLuckySpin}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Lucky Spin</span>
          </button>
        )}

        {onOpenShakeAndWin && (
          <button
            type="button"
            onClick={onOpenShakeAndWin}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Shake & Win</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsMusicModalOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fuchsia-950/60 border border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Music className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Music Stories</span>
        </button>

        {onOpenAICreator && (
          <button
            type="button"
            onClick={onOpenAICreator}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Studio</span>
          </button>
        )}

        {onOpenVideoReels && (
          <button
            type="button"
            onClick={onOpenVideoReels}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Film className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reels</span>
          </button>
        )}
      </div>

      {/* Floating Watch-to-Earn Video Monetization Toast */}
      {watchedEarningsToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-zinc-950 border border-emerald-400 shadow-xl flex items-center gap-2 text-xs text-white font-bold animate-bounce">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400">
            <Coins className="w-3 h-3" />
          </div>
          <div>
            <span>Reward: <strong className="text-emerald-300">{watchedEarningsToast.amount}</strong> + <strong className="text-amber-300">{watchedEarningsToast.coins} Coins</strong>!</span>
          </div>
        </div>
      )}

      {/* 3. Instagram-Style Clean Posts Feed */}
      <div className="space-y-5">
        {posts.map((post) => {
          const isSaved = savedPostIds.has(post.id);
          const isMuted = videoMutedState[post.id] ?? true;

          return (
            <article
              key={post.id}
              id={`post-card-${post.id}`}
              className="rounded-3xl bg-zinc-950 border border-purple-900/40 shadow-xl overflow-hidden transition-all box-border"
            >
              {/* Post Header */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between border-b border-purple-950/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-purple-500/40 shadow-sm"
                    />
                    {post.isVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-fuchsia-600 border border-zinc-950 flex items-center justify-center shadow-sm">
                        <Crown className="w-2 h-2 text-amber-300" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white hover:text-fuchsia-300 cursor-pointer truncate">
                        {post.authorName}
                      </span>
                      <span className="text-[11px] text-purple-300/80 font-mono truncate">
                        @{post.authorUsername}
                      </span>
                    </div>

                    <div className="text-[10px] text-zinc-400 flex items-center gap-1 truncate">
                      {post.location && <span>📍 {post.location}</span>}
                      {post.createdAt && (
                        <>
                          <span>•</span>
                          <span>{post.createdAt}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Live Call CTA Button */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => onStartCall(`studio-${post.authorUsername}`, post.authorUsername)}
                    className="px-2.5 py-1 rounded-full bg-purple-600/25 hover:bg-purple-600/45 border border-purple-500/50 text-fuchsia-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title={`Call @${post.authorUsername} live in 4K Opus Studio`}
                  >
                    <Video className="w-3 h-3 text-cyan-300 animate-pulse" />
                    <span>Call Live</span>
                  </button>
                </div>
              </div>

              {/* Post Media Content */}
              <div className="relative aspect-square w-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                {post.mediaType === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={post.mediaUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setVideoMutedState((prev) => ({ ...prev, [post.id]: !isMuted }))
                      }
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <img
                    src={post.mediaUrl}
                    alt={post.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Action Bar (Like, Comment, Share, Bookmark) */}
              <div className="p-3 sm:p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className="group flex items-center gap-1.5 text-zinc-300 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-6 h-6 transition-transform group-active:scale-125 ${
                          post.isLiked ? 'text-rose-500 fill-rose-500' : 'text-zinc-300'
                        }`}
                      />
                      <span className="text-xs font-bold font-mono">{post.likesCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenCommentsModalPostId(post.id)}
                      className="flex items-center gap-1.5 text-zinc-300 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-xs font-bold font-mono">{post.commentsCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        confetti({ particleCount: 20, spread: 45 });
                        if (navigator.share) {
                          navigator.share({ title: 'NovaGrand Post', text: post.caption, url: window.location.href }).catch(() => {});
                        }
                      }}
                      className="text-zinc-300 hover:text-purple-400 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSavePost(post.id)}
                    className="text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Bookmark className={`w-6 h-6 ${isSaved ? 'text-amber-400 fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Caption */}
                <div className="text-xs text-zinc-200 leading-relaxed">
                  <strong className="font-bold text-white mr-1.5">@{post.authorUsername}</strong>
                  <span>{post.caption}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* 4. Full-Screen Instagram Story Viewer with Tap-to-Skip & Progress Timer */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onMouseDown={() => setIsStoryPaused(true)}
          onMouseUp={() => setIsStoryPaused(false)}
          onTouchStart={() => setIsStoryPaused(true)}
          onTouchEnd={() => setIsStoryPaused(false)}
        >
          <div
            className="relative w-full max-w-sm h-full sm:h-[82vh] rounded-none sm:rounded-3xl overflow-hidden border-0 sm:border-2 sm:border-purple-500/60 bg-zinc-950 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Multi-Segment Progress Bars */}
            <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
              {storyList.map((st, idx) => (
                <div
                  key={st.id}
                  className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden shadow-sm"
                >
                  <div
                    className={`h-full transition-all duration-75 ${
                      idx < (activeStoryIndex ?? 0)
                        ? 'w-full bg-white'
                        : idx === activeStoryIndex
                        ? 'bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-300'
                        : 'w-0'
                    }`}
                    style={{
                      width: idx === activeStoryIndex ? `${storyProgress}%` : undefined,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header info & controls */}
            <div className="absolute top-6 left-3.5 right-3.5 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 to-fuchsia-600">
                  <img
                    src={activeStory.userAvatar}
                    alt={activeStory.userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>{activeStory.userName}</span>
                    {activeStory.isVerified && (
                      <span className="text-[10px] text-cyan-400 font-bold">✓</span>
                    )}
                    <span className="text-[10px] text-zinc-400 font-normal flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-amber-400" />
                      24h
                    </span>
                  </div>
                  <div className="text-[10px] text-purple-300 font-mono">
                    @{activeStory.userUsername}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeStory.musicTrackAudioUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStoryAudio();
                    }}
                    className="p-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-fuchsia-500/40 text-fuchsia-300 hover:scale-105 transition-all cursor-pointer"
                  >
                    {isStoryAudioPlaying ? (
                      <Volume2 className="w-3.5 h-3.5" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (storyAudioRef.current) storyAudioRef.current.pause();
                    setActiveStoryIndex(null);
                  }}
                  className="p-1.5 rounded-full bg-zinc-950/80 text-xs font-bold hover:bg-zinc-800 text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Attached Music Pill with Use Sound trigger */}
            {activeStory.musicTrackTitle && (
              <div className="absolute top-16 left-3.5 right-3.5 z-30 p-2 rounded-2xl bg-zinc-950/90 backdrop-blur-md border border-fuchsia-500/60 flex items-center justify-between gap-2 shadow-xl">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Music className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-white truncate">
                      {activeStory.musicTrackTitle}
                    </div>
                    <div className="text-[9px] text-purple-300 truncate">
                      {activeStory.musicTrackArtist}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (storyAudioRef.current) storyAudioRef.current.pause();
                      setActiveStoryIndex(null);
                      if (onOpenVideoReels) {
                        onOpenVideoReels();
                      } else {
                        setIsStoryCreatorOpen(true);
                      }
                    }}
                    className="px-2 py-1 rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer transition-all hover:scale-105"
                  >
                    <span>Use Sound 🎵</span>
                  </button>
                </div>
              </div>
            )}

            {/* Story Visual Media Content */}
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
              {activeStory.mediaType === 'video' ? (
                <video
                  src={activeStory.mediaUrl}
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeStory.mediaUrl}
                  alt="Story content"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Tap Zones: Left 35% to Previous, Right 65% to Next */}
              <div
                className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevStory();
                }}
              />
              <div
                className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextStory();
                }}
              />
            </div>

            {/* Bottom Caption & Interactive Reply Bar */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-3.5 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2.5">
              {activeStory.caption && (
                <div className="text-xs text-white font-medium text-center bg-zinc-950/70 backdrop-blur-md p-2 rounded-2xl border border-purple-900/50">
                  {activeStory.caption}
                </div>
              )}

              {/* Quick Floating Reaction Emojis */}
              <div className="flex items-center justify-center gap-3">
                {['❤️', '🔥', '😂', '👏', '🚀', '😍'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendStoryReaction(emoji);
                    }}
                    className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-purple-900/80 hover:scale-125 transition-all text-base cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Reply Input Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={storyReplyText}
                  onChange={(e) => setStoryReplyText(e.target.value)}
                  onFocus={() => setIsStoryPaused(true)}
                  onBlur={() => setIsStoryPaused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendStoryReply();
                  }}
                  placeholder={`Send message to @${activeStory.userUsername}...`}
                  className="flex-1 px-4 py-2 rounded-full bg-zinc-950/90 border border-purple-500/50 focus:border-fuchsia-400 focus:outline-none text-xs text-white placeholder-zinc-400"
                />
                <button
                  type="button"
                  onClick={handleSendStoryReply}
                  className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:scale-105 transition-transform cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Creator Modal */}
      <StoryCreatorModal
        isOpen={isStoryCreatorOpen}
        onClose={() => setIsStoryCreatorOpen(false)}
        currentUser={currentUser}
        onStoryPublished={handleAddStory}
      />

      {/* Music Selector Modal */}
      <MusicSelectorModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelectTrack={() => {
          setIsStoryCreatorOpen(true);
        }}
      />

      {/* Custom Wallpaper Modal for Home Feed */}
      <CustomBackgroundWallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        targetScreen="home"
        currentWallpaperUrl={homeWallpaperUrl}
        currentOpacity={homeWallpaperOpacity}
        onApplyWallpaper={handleApplyHomeWallpaper}
        currentUser={currentUser}
      />
    </div>
  );
};

