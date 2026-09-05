import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  Plus,
  Sparkles,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  Send,
  Radio,
  Download,
  Disc3,
  Zap,
  Coins,
  ShieldCheck,
  Award,
  Layers,
  ListMusic,
  Instagram,
  Clock,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReelItem, ReelComment, REELS_DATA } from '../data/reelsData';
import { generateDynamicReelBatch } from '../lib/reelsStreamEngine';
import { MusicTrackItem, MUSIC_CATALOG } from '../data/musicTracks';
import { UserProfile } from '../types';
import { AdMobBanner } from './AdMobBanner';
import { SmartReelAdBreakModal } from './SmartReelAdBreakModal';
import { DuetRemixModal } from './DuetRemixModal';
import { MusicSelectorModal } from './MusicSelectorModal';
import { ReelCameraUploadModal } from './ReelCameraUploadModal';
import {
  subscribeToFirestoreReels,
  likeReelInFirestore,
  addReelCommentInFirestore,
  recordGlobalReelViewToFirestore
} from '../lib/firestoreService';
import { shouldBlockAds } from '../lib/adminAdPolicy';
import { recordTrafficConsumption } from '../utils/trafficTracker';

interface ReelsViewProps {
  currentUser: UserProfile | null;
  onSelectMusicTrack?: (trackTitle: string) => void;
  onNavigateToMusic?: () => void;
  onUpdateCoins?: (newCoins: number) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  currentUser,
  onSelectMusicTrack,
  onNavigateToMusic,
  onUpdateCoins,
}) => {
  const isOwnerAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com';
  
  // Initial dynamic stream of reels without static 15-video restrictions
  const [reels, setReels] = useState<ReelItem[]>(() => {
    return generateDynamicReelBatch(1, 12, new Set(), 'all');
  });
  const pageTrackerRef = useRef<number>(2);
  const seenVideoIdsRef = useRef<Set<string>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [earningsToast, setEarningsToast] = useState<{ amount: string; message: string } | null>(null);
  const [watchedReelIds, setWatchedReelIds] = useState<Set<string>>(new Set());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isDuetModalOpen, setIsDuetModalOpen] = useState<boolean>(false);
  const [duetTargetReel, setDuetTargetReel] = useState<ReelItem | null>(null);
  const [watchSecondsCount, setWatchSecondsCount] = useState<number>(0);

  // Auto-Next Reels Setting (User on/off toggle: when ON, next reel plays automatically on end; when OFF, user scrolls manually)
  const [isAutoNext, setIsAutoNext] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('novagrand_auto_next_reels');
      return saved !== null ? saved === 'true' : true; // Default ON as requested
    } catch {
      return true;
    }
  });
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Music Selector state for Reels
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [musicModalTarget, setMusicModalTarget] = useState<'activeReel' | 'uploadModal'>('activeReel');
  const [selectedMusicTrack, setSelectedMusicTrack] = useState<MusicTrackItem | null>(null);

  // Smart Ad Interval state (1 short sponsored video ad only after every 5 reels)
  const SMART_AD_INTERVAL = 5;
  const [reelsWatchedCount, setReelsWatchedCount] = useState<number>(0);
  const [isSmartAdModalOpen, setIsSmartAdModalOpen] = useState<boolean>(false);
  const [pendingNextIndex, setPendingNextIndex] = useState<number | null>(null);

  // New reel upload state
  const [newCaption, setNewCaption] = useState<string>('');
  const [newSongTitle, setNewSongTitle] = useState<string>('Apna Bana Le · Arijit Singh');
  const [newSongArtist, setNewSongArtist] = useState<string>('Arijit Singh');
  const [newSongAudioUrl, setNewSongAudioUrl] = useState<string>('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [newSongCoverUrl, setNewSongCoverUrl] = useState<string>('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80');
  const [newCategory, setNewCategory] = useState<'hindi' | 'english' | 'urdu' | 'slowed'>('hindi');
  const [newVideoUrl, setNewVideoUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reelAudioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ x: number; y: number; id: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  const filteredReels = reels.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  const activeReel: ReelItem | undefined = filteredReels[currentIndex] || filteredReels[0] || REELS_DATA[0];

  // 1. Dynamic Infinite Feed: As user scrolls within 3 items of the end, seamlessly synthesize and append brand-new, unique viral videos
  useEffect(() => {
    if (currentIndex >= filteredReels.length - 3 && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = pageTrackerRef.current;
      pageTrackerRef.current += 1;

      const newBatch = generateDynamicReelBatch(
        nextPage,
        8,
        seenVideoIdsRef.current,
        selectedCategory === 'all' ? undefined : selectedCategory
      );

      // Register new batch IDs in seenVideoIdsRef to guarantee zero duplicates
      newBatch.forEach((r) => seenVideoIdsRef.current.add(r.id));

      setReels((prev) => [...prev, ...newBatch]);
      setIsLoadingMore(false);
    }
  }, [currentIndex, filteredReels.length, selectedCategory, isLoadingMore]);

  // 2. Global Real-Time Feed Sync: Firestore listener for user-uploaded reels across all users' phones
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreReels((firestoreReels) => {
      if (firestoreReels && firestoreReels.length > 0) {
        setReels((prev) => {
          const firestoreIds = new Set(firestoreReels.map((r) => r.id));
          // Register in seen tracker
          firestoreReels.forEach((r) => seenVideoIdsRef.current.add(r.id));
          const nonFirestore = prev.filter((r) => !firestoreIds.has(r.id));
          // User-generated content from the community is given top priority at the top of the feed
          return [...firestoreReels, ...nonFirestore];
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Smooth uninterrupted playback when switching reels & song sync
  useEffect(() => {
    if (!activeReel) return;
    setIsPlaying(true);
    setVideoProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Fallback for browser autoplay policies: mute and play
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }

    // Play accompanying sound track if available
    if (activeReel.audioTrackUrl) {
      if (reelAudioRef.current) {
        reelAudioRef.current.pause();
      }
      const audio = new Audio(activeReel.audioTrackUrl);
      reelAudioRef.current = audio;
      audio.loop = true;
      audio.muted = isMuted;
      audio.play().catch(() => {});
    } else {
      if (reelAudioRef.current) {
        reelAudioRef.current.pause();
      }
    }

    // Track unique views cleanly without intrusive popups on every reel
    if (!watchedReelIds.has(activeReel.id)) {
      setWatchedReelIds((prev) => new Set([...prev, activeReel.id]));
      setReelsWatchedCount((prev) => prev + 1);

      // Increment Firestore global reels counter & admin earnings backend
      recordGlobalReelViewToFirestore();

      // Meter real-time traffic consumption (6.5 MB per reel) & award stream drop coins
      recordTrafficConsumption(6.5, `4K Reel Stream: ${activeReel.caption.slice(0, 20)}`, (coinsAdded) => {
        if (onUpdateCoins && currentUser) {
          onUpdateCoins((currentUser.coins ?? 100) + coinsAdded);
        }
      });
    }

    return () => {
      if (reelAudioRef.current) {
        reelAudioRef.current.pause();
      }
    };
  }, [currentIndex, activeReel?.id, selectedCategory]);

  // Reset watch seconds when active reel changes
  useEffect(() => {
    setWatchSecondsCount(0);
  }, [currentIndex, activeReel?.id]);

  // Real-Time Video Watch Counter per active video play
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setWatchSecondsCount((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handle 15s watch time milestone in dedicated effect without side-effects in setState updater
  useEffect(() => {
    if (watchSecondsCount === 15) {
      if (onUpdateCoins && currentUser) {
        onUpdateCoins((currentUser.coins ?? 100) + 5);
      }
      setEarningsToast({
        amount: '+$0.05 Ad Revenue · +5 🪙',
        message: '15s Watch Time Milestone Achieved! 🎉',
      });
      const toastTimer = setTimeout(() => setEarningsToast(null), 3000);
      return () => clearTimeout(toastTimer);
    }
  }, [watchSecondsCount, currentUser, onUpdateCoins]);

  useEffect(() => {
    if (reelAudioRef.current) {
      reelAudioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleOpenMusicForActiveReel = () => {
    setMusicModalTarget('activeReel');
    setIsMusicModalOpen(true);
  };

  const handleOpenMusicForUpload = () => {
    setMusicModalTarget('uploadModal');
    setIsMusicModalOpen(true);
  };

  const handleMusicTrackSelected = (track: MusicTrackItem) => {
    setSelectedMusicTrack(track);

    if (musicModalTarget === 'uploadModal') {
      setNewSongTitle(`${track.title} · ${track.artist}`);
      setNewSongArtist(track.artist);
      setNewSongAudioUrl(track.audioUrl);
      setNewSongCoverUrl(track.coverUrl);
      if (track.category === 'urdu' || track.category === 'salawat' || track.category === 'nasheed') {
        setNewCategory('urdu');
      } else if (track.category === 'slowed') {
        setNewCategory('slowed');
      } else if (track.category === 'english') {
        setNewCategory('english');
      } else {
        setNewCategory('hindi');
      }
      setEarningsToast({
        amount: '+10 Coins!',
        message: `Song selected: "${track.title}" for your new Reel 🎵`,
      });
      setTimeout(() => setEarningsToast(null), 3500);
    } else {
      // Apply directly to current active reel
      if (activeReel) {
        setReels((prev) =>
          prev.map((r) =>
            r.id === activeReel.id
              ? {
                  ...r,
                  audioTrackTitle: track.title,
                  audioTrackArtist: track.artist,
                  audioTrackUrl: track.audioUrl,
                }
              : r
          )
        );

        if (reelAudioRef.current) {
          reelAudioRef.current.pause();
        }
        const audio = new Audio(track.audioUrl);
        reelAudioRef.current = audio;
        audio.loop = true;
        audio.muted = isMuted;
        audio.play().catch(() => {});

        if (onSelectMusicTrack) {
          onSelectMusicTrack(`${track.title} · ${track.artist}`);
        }

        setEarningsToast({
          amount: '+15 Coins · Sound Applied!',
          message: `Now playing "${track.title}" on this Reel 🎧`,
        });
        setTimeout(() => setEarningsToast(null), 3500);
      }
    }
  };

  const handleUseSoundInNewReel = (soundTitle: string, artistName: string, audioUrl?: string) => {
    setNewSongTitle(`${soundTitle} · ${artistName}`);
    setNewSongArtist(artistName);
    if (audioUrl) setNewSongAudioUrl(audioUrl);
    setIsUploadModalOpen(true);
  };

  const handleNextReel = () => {
    const nextIdx = currentIndex < filteredReels.length - 1 ? currentIndex + 1 : 0;
    // Pure clean Instagram reels transition: 100% ad-free video flow
    // Background CPM earnings are recorded directly to Admin Firestore Wallet
    setCurrentIndex(nextIdx);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(pct);
    }
  };

  const handleVideoEnded = () => {
    // If auto-next is enabled, seamlessly transition to the next reel
    if (isAutoNext) {
      handleNextReel();
    }
  };

  const toggleAutoNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !isAutoNext;
    setIsAutoNext(nextVal);
    try {
      localStorage.setItem('novagrand_auto_next_reels', String(nextVal));
    } catch {}
    setEarningsToast({
      amount: nextVal ? '⚡ Auto-Next ON' : '✋ Manual Scroll Mode',
      message: nextVal
        ? 'Reel खत्म होते ही अगला Reel खुद-ब-खुद आ जाएगा!'
        : 'Auto-play बंद: अब हाथ से ऊपर/नीचे स्वाइप करें।',
    });
    setTimeout(() => setEarningsToast(null), 3000);
  };

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredReels.length - 1);
    }
  };

  const handleProceedAfterAdBreak = () => {
    if (pendingNextIndex !== null) {
      setCurrentIndex(pendingNextIndex);
      setPendingNextIndex(null);
    } else {
      setCurrentIndex((prev) => (prev + 1) % filteredReels.length);
    }
  };

  const handleRewardEarnedFromAd = (earnedCoins: number, newTotalCoins: number) => {
    if (onUpdateCoins) {
      onUpdateCoins(newTotalCoins);
    }
    setEarningsToast({
      amount: `+${earnedCoins} Free Coins! 🍌`,
      message: 'Ad Break Reward Credited to your Wallet!',
    });
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setEarningsToast(null), 4000);
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleToggleLike = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const isLiked = !r.isLiked;
          if (isLiked) {
            confetti({ particleCount: 25, spread: 40, origin: { y: 0.7 } });
          }
          // Sync with Firestore
          likeReelInFirestore(reelId, isLiked);
          return {
            ...r,
            isLiked,
            likesCount: isLiked ? r.likesCount + 1 : r.likesCount - 1,
          };
        }
        return r;
      })
    );
  };

  const handleAddComment = async (reelId: string) => {
    if (!newCommentText.trim()) return;
    const newComment: ReelComment = {
      id: `rc-${Date.now()}`,
      authorName: currentUser?.name || 'You',
      authorUsername: currentUser?.username || 'user',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: newCommentText.trim(),
      timestamp: 'Just now',
      likes: 1,
      isVerified: currentUser?.isVerified,
    };

    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [newComment, ...(r.comments || [])],
          };
        }
        return r;
      })
    );
    setNewCommentText('');

    // Global real-time Firestore sync for comments across all users
    try {
      await addReelCommentInFirestore(reelId, newComment);
    } catch (e) {
      console.warn('Comment firestore sync notice:', e);
    }
  };

  const handlePublishNewReel = (e: React.FormEvent) => {
    e.preventDefault();
    const newReel: ReelItem = {
      id: `reel-${Date.now()}`,
      authorId: currentUser?.id || 'usr-self',
      authorName: currentUser?.name || 'Naushad Alam',
      authorUsername: currentUser?.username || 'naushad',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isVerified: currentUser?.isVerified ?? true,
      videoUrl: newVideoUrl,
      posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      caption: newCaption || 'New Instagrand 4K Reel! 💜',
      audioTrackTitle: newSongTitle,
      audioTrackArtist: 'Original Audio Studio',
      category: newCategory,
      likesCount: 1,
      isLiked: true,
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      viewsCount: 1,
      adMobEarnings: '+$0.65 AdMob',
      tags: ['#NewReel', '#Instagrand', '#ViralVideo'],
    };

    setReels((prev) => [newReel, ...prev]);
    setIsUploadModalOpen(false);
    setCurrentIndex(0);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const categories = [
    { id: 'all', label: '🔥 All Popular' },
    { id: 'hindi', label: '🇮🇳 Hindi Viral' },
    { id: 'urdu', label: '🌙 Urdu & Sufi' },
    { id: 'slowed', label: '🎧 Slowed + Reverb' },
    { id: 'english', label: '⚡ English Billboard' },
  ];

  if (!activeReel) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No reels found in this category.</p>
        <button
          onClick={() => setSelectedCategory('all')}
          className="mt-3 px-4 py-2 bg-purple-600 rounded-xl text-white font-bold text-xs"
        >
          View All Reels
        </button>
      </div>
    );
  }

  return (
    <div id="instagrand-reels-container" className="max-w-md mx-auto space-y-3 pb-20 animate-fade-in relative">
      {/* Admin Real-Time AdMob Earnings Monitor Bar */}
      {isOwnerAdmin && (
        <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-zinc-950/90 border border-emerald-500/40 text-xs shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-black text-white flex items-center gap-1.5">
                <span>AdMob Monetization Engine</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  Direct to Admin
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Views generated: <span className="text-emerald-300 font-bold">{reelsWatchedCount}</span> · ₹0.15/view (₹150 CPM) auto-credited
              </div>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
            <Coins className="w-3 h-3 text-emerald-400" />
            <span>+₹{(reelsWatchedCount * 0.15).toFixed(2)} Earned</span>
          </div>
        </div>
      )}

      {/* Category Filter Pills Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)] scale-105'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-purple-900/40 hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center gap-1 flex-shrink-0 hover:scale-105 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post Reel</span>
        </button>
      </div>

      {/* Main Instagram Vertical Reel Player Box with Native Vertical Swipe & Double Tap Like */}
      <div
        id="active-reel-card"
        onTouchStart={(e) => {
          touchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          if (touchStartY.current === null) return;
          const touchEndY = e.changedTouches[0].clientY;
          const diffY = touchStartY.current - touchEndY;
          // Swipe Up for Next Reel
          if (diffY > 45) {
            handleNextReel();
          }
          // Swipe Down for Prev Reel
          else if (diffY < -45) {
            handlePrevReel();
          }
          touchStartY.current = null;
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > 50) {
            if (e.deltaY > 0) {
              handleNextReel();
            } else {
              handlePrevReel();
            }
          }
        }}
        className="relative w-full h-[82vh] max-h-[850px] min-h-[580px] rounded-3xl overflow-hidden bg-black border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] select-none flex flex-col justify-between"
      >
        {/* Top Instagram-style progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 via-pink-400 to-cyan-400 transition-all duration-100 ease-linear"
            style={{ width: `${videoProgress}%` }}
          />
        </div>

        {/* Background Video element */}
        <video
          ref={videoRef}
          src={activeReel.videoUrl}
          poster={activeReel.posterUrl}
          autoPlay
          playsInline
          loop={!isAutoNext}
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onError={(e) => {
            const fallback = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
              e.currentTarget.play().catch(() => {});
            }
          }}
          onClick={(e) => {
            const now = Date.now();
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (now - lastTapRef.current < 300) {
              // Double Tap detected -> Instant Like + Burst animation
              if (!activeReel.isLiked) {
                handleToggleLike(activeReel.id);
              }
              setDoubleTapHeart({ x, y, id: now });
              confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
              setTimeout(() => setDoubleTapHeart(null), 1000);
            } else {
              handleTogglePlay();
            }
            lastTapRef.current = now;
          }}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        />

        {/* Optimized Next-Reel Metadata Preloader (Zero buffer latency without data waste) */}
        {filteredReels[currentIndex + 1] && (
          <video
            key={`preload-${filteredReels[currentIndex + 1].id}`}
            src={filteredReels[currentIndex + 1].videoUrl}
            preload="metadata"
            className="hidden pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Double Tap Heart Pop Effect */}
        {doubleTapHeart && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ping duration-700"
            style={{ left: doubleTapHeart.x, top: doubleTapHeart.y }}
          >
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.9)]" />
          </div>
        )}

        {/* Dark Vignette Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

        {/* Play/Pause Center Indicator */}
        {!isPlaying && (
          <div
            onClick={handleTogglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-950/80 border-2 border-fuchsia-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(217,70,239,0.7)] animate-scale">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Top Header Bar inside Reel */}
        <div className="relative z-20 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-wider uppercase bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent drop-shadow">
              Instagrand Reels
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/40 font-mono font-bold">
              4K HD
            </span>

            {/* UGC Community Badge for User Uploaded Reels */}
            {activeReel.isUGC && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 font-black flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span>Live Community</span>
              </span>
            )}

            {/* Live Watch Time & Earnings Ticker */}
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 text-white text-[10px] font-mono font-bold backdrop-blur-md">
              <Clock className="w-3 h-3 text-cyan-300 animate-spin" />
              <span>{watchSecondsCount}s</span>
              {isOwnerAdmin && (
                <span className="text-emerald-400 font-black">+${(watchSecondsCount * 0.003).toFixed(3)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-Next On/Off Setting Toggle */}
            <button
              type="button"
              onClick={toggleAutoNext}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer backdrop-blur-md shadow-md ${
                isAutoNext
                  ? 'bg-emerald-500/25 border-emerald-400/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'bg-zinc-900/80 border-zinc-600/70 text-zinc-300 hover:bg-zinc-800'
              }`}
              title={isAutoNext ? 'Click to disable Auto-Next' : 'Click to enable Auto-Next'}
            >
              <RefreshCw className={`w-3 h-3 ${isAutoNext ? 'animate-spin text-emerald-400' : 'text-zinc-400'}`} />
              <span>{isAutoNext ? 'Auto-Next ON' : 'Auto-Next OFF'}</span>
            </button>

            {/* Audio Mute / Unmute Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Floating Earnings Toast Notification */}
        {earningsToast && (
          <div className="absolute top-16 left-4 right-4 z-30 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/95 via-fuchsia-600/95 to-purple-600/95 text-white shadow-2xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-black/40 flex items-center justify-center font-bold text-amber-300">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black">{earningsToast.amount}</div>
                <div className="text-[10px] text-amber-100">{earningsToast.message}</div>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/50 font-bold border border-white/20">
              Founder & Creator Share
            </span>
          </div>
        )}

        {/* Right Floating Action Buttons Column (Like, Comment, Share, Audio, Up/Down Nav) */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4 text-white">
          {/* 1. Like Button */}
          <button
            type="button"
            onClick={() => handleToggleLike(activeReel.id)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 group-hover:scale-110 group-active:scale-90 ${
                activeReel.isLiked
                  ? 'bg-rose-600/90 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
              }`}
            >
              <Heart
                className={`w-6 h-6 ${
                  activeReel.isLiked ? 'fill-current stroke-rose-300' : 'stroke-2'
                }`}
              />
            </div>
            <span className="text-[11px] font-bold drop-shadow">
              {activeReel.likesCount.toLocaleString()}
            </span>
          </button>

          {/* 2. Comment Button */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(true)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all group-hover:scale-110 group-active:scale-90">
              <MessageCircle className="w-6 h-6 stroke-2" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">
              {activeReel.commentsCount.toLocaleString()}
            </span>
          </button>

          {/* 3. Share Button */}
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
              setEarningsToast({
                amount: 'Link Copied!',
                message: 'Share this popular Hindi/Urdu reel with friends 🚀',
              });
              setTimeout(() => setEarningsToast(null), 3000);
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all group-hover:scale-110 group-active:scale-90">
              <Share2 className="w-6 h-6 stroke-2" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">
              {activeReel.sharesCount.toLocaleString()}
            </span>
          </button>

          {/* 4. Duet & Remix Studio Button */}
          <button
            type="button"
            onClick={() => {
              setDuetTargetReel(activeReel);
              setIsDuetModalOpen(true);
              if (videoRef.current) {
                videoRef.current.pause();
              }
              setIsPlaying(false);
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            title="Create Duet & Remix Reel"
          >
            <div className="p-2.5 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 border border-fuchsia-400 text-white hover:scale-110 active:scale-90 transition-all shadow-[0_0_15px_rgba(217,70,239,0.6)] animate-pulse">
              <Layers className="w-6 h-6 stroke-2" />
            </div>
            <span className="text-[11px] font-bold drop-shadow text-fuchsia-300">Duet</span>
          </button>

          {/* 5. Rotating Vinyl Music Disc & Song Selector */}
          <div
            onClick={handleOpenMusicForActiveReel}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            title="Pick & Change Song for Reel (Hindi / Slowed / Salawat / English)"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-amber-400 p-0.5 shadow-lg animate-spin duration-3000 group-hover:scale-110 transition-transform">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                <Disc3 className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>
            <span className="text-[9px] font-mono text-purple-200 group-hover:text-amber-300 transition-colors">🎵 Song</span>
          </div>

          {/* 6. Next Reel Up/Down Quick Navigation */}
          <div className="flex flex-col gap-1 pt-1">
            <button
              type="button"
              onClick={handlePrevReel}
              title="Previous Reel"
              className="p-1.5 rounded-full bg-black/60 border border-white/20 hover:bg-black text-white cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextReel}
              title="Next Reel"
              className="p-1.5 rounded-full bg-black/60 border border-white/20 hover:bg-black text-white cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Reel Info: Creator, Verified Badge, Caption, and Music Pill */}
        <div className="relative z-20 p-4 pr-20 space-y-2.5 text-white">
          {/* Creator Profile */}
          <div className="flex items-center gap-2.5">
            <img
              src={activeReel.authorAvatar}
              alt={activeReel.authorName}
              className="w-10 h-10 rounded-full object-cover border-2 border-fuchsia-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-black drop-shadow">@{activeReel.authorUsername}</span>
                {activeReel.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 fill-fuchsia-600" />
                )}
                <button
                  type="button"
                  className="ml-1 px-2 py-0.5 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-[10px] font-bold text-white transition-all cursor-pointer"
                >
                  Follow
                </button>
                <a
                  href={`https://ig.me/m/${activeReel.authorUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-0.5 rounded-full bg-pink-600/80 hover:bg-pink-500 text-[10px] font-bold text-white transition-all flex items-center gap-1 border border-pink-400/40 shadow-sm"
                  title="Contact creator on Real Instagram"
                >
                  <Instagram className="w-3 h-3" />
                  <span>DM</span>
                </a>
              </div>
              <span className="text-[10px] text-purple-200/90">{activeReel.authorName}</span>
            </div>
          </div>

          {/* Reel Caption */}
          <p className="text-xs text-zinc-100 font-medium line-clamp-2 leading-relaxed drop-shadow">
            {activeReel.caption}
          </p>

          {/* Live Audio Pill Track with Change & Use Sound Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              onClick={handleOpenMusicForActiveReel}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-fuchsia-500/60 text-xs font-bold text-white hover:border-fuchsia-400 hover:bg-zinc-900 cursor-pointer shadow-lg max-w-full transition-all group"
              title="Click to change or select song from Music Catalog"
            >
              <Music className="w-3.5 h-3.5 text-amber-300 animate-pulse flex-shrink-0" />
              <span className="truncate text-[11px] max-w-[180px] sm:max-w-[220px]">
                {activeReel.audioTrackTitle} · {activeReel.audioTrackArtist}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/40 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors">
                Change 🎵
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleUseSoundInNewReel(activeReel.audioTrackTitle, activeReel.audioTrackArtist, activeReel.audioTrackUrl)}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500 hover:to-pink-500 border border-pink-400/40 text-[10px] font-bold text-white flex items-center gap-1 shadow-md cursor-pointer transition-all hover:scale-105"
            >
              <ListMusic className="w-3 h-3" />
              <span>Use this Sound</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reel Index Indicator & Navigation */}
      <div className="flex items-center justify-between px-2 text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <span>Reel {currentIndex + 1} of {filteredReels.length}</span>
          {isOwnerAdmin ? (
            <span className="text-emerald-400 font-bold">
              💰 CPM Active: +₹0.15 Auto-Credit / View
            </span>
          ) : (
            <span className="text-fuchsia-400 font-bold">✨ Trending 4K Reel</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevReel}
            className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-purple-900/60 text-white text-xs font-bold cursor-pointer"
          >
            ▲ Prev
          </button>
          <button
            type="button"
            onClick={handleNextReel}
            className="px-4 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold cursor-pointer shadow-md"
          >
            ▼ Next Reel
          </button>
        </div>
      </div>

      {/* Pure Instagram Reels Feed: Ads are not displayed to interrupt users, background CPM earnings stream directly to Admin Firestore Wallet */}

      {/* Comments Drawer Modal */}
      {isCommentsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsCommentsOpen(false)}
        >
          <div
            className="w-full max-w-md h-[65vh] rounded-t-3xl sm:rounded-3xl bg-zinc-950 border border-purple-700/60 p-4 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-950">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-fuchsia-400" />
                <span className="text-sm font-black text-white">
                  Comments ({activeReel.commentsCount})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3">
              {activeReel.comments.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No comments yet. Be the first to comment on this reel!
                </div>
              ) : (
                activeReel.comments.map((comm) => (
                  <div key={comm.id} className="flex items-start gap-2.5">
                    <img
                      src={comm.authorAvatar}
                      alt={comm.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-purple-500/50 flex-shrink-0"
                    />
                    <div className="flex-1 bg-zinc-900/80 p-2.5 rounded-2xl border border-purple-950 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">@{comm.authorUsername}</span>
                        <span className="text-[10px] text-zinc-500">{comm.timestamp}</span>
                      </div>
                      <p className="text-zinc-200">{comm.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <div className="pt-2 border-t border-purple-950 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a comment to this reel..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment(activeReel.id);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-purple-900/60 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
              />
              <button
                type="button"
                onClick={() => handleAddComment(activeReel.id)}
                className="p-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Reels Camera & Upload Studio Modal */}
      <ReelCameraUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentUser={currentUser}
        onReelPublished={(newReel) => {
          setReels((prev) => [newReel, ...prev]);
          setCurrentIndex(0);
          setEarningsToast({
            amount: '+25 Coins Earned! 🚀',
            message: 'Your 4K Reel is published live to Firebase Feed!',
          });
          setTimeout(() => setEarningsToast(null), 4000);
        }}
        onUpdateCoins={onUpdateCoins}
      />

      {/* Music Selector Modal for Reels */}
      <MusicSelectorModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelectTrack={handleMusicTrackSelected}
        selectedTrackId={selectedMusicTrack?.id}
        targetType="reel"
        title="Reels Song & Audio Studio"
      />

      {/* Smart Video Ad Break Modal (Triggered every 5-6 reels) */}
      <SmartReelAdBreakModal
        isOpen={isSmartAdModalOpen}
        onClose={() => setIsSmartAdModalOpen(false)}
        reelsWatchedCount={reelsWatchedCount}
        currentUser={currentUser}
        onRewardEarned={handleRewardEarnedFromAd}
        onProceedToNextReel={handleProceedAfterAdBreak}
      />

      {/* Duet & Remix Studio Modal */}
      <DuetRemixModal
        isOpen={isDuetModalOpen}
        onClose={() => setIsDuetModalOpen(false)}
        originalReel={duetTargetReel}
        currentUser={currentUser}
        onPostDuet={(newReel) => {
          setReels((prev) => [newReel, ...prev]);
          setCurrentIndex(0);
          setEarningsToast({
            amount: '+30 Coins Earned!',
            message: 'Your Duet Reel is live across NeonCall network! 🚀',
          });
          setTimeout(() => setEarningsToast(null), 4000);
        }}
        onUpdateCoins={onUpdateCoins}
      />
    </div>
  );
};
