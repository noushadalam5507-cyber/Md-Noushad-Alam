import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Search,
  Sparkles,
  Flame,
  Plus,
  Repeat,
  Shuffle,
  DollarSign,
  Heart,
  Share2,
  Disc3,
  ListMusic,
  Radio,
  Coins,
  Video,
  Globe,
  CheckCircle2,
  Clock,
  Wifi,
  Smartphone,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MusicTrackItem, MUSIC_CATALOG, WATCH_TO_EARN_VIDEOS } from '../data/musicTracks';
import { UserProfile, WatchEarnVideo } from '../types';
import { AdMobBanner } from './AdMobBanner';
import { recordListenEarnReward, recordWatchEarnReward } from '../lib/firestoreService';
import { GlobalPayoutModal } from './GlobalPayoutModal';
import { recordTrafficConsumption } from '../utils/trafficTracker';

interface MusicPlayerViewProps {
  currentUser: UserProfile | null;
  onSelectTrackForStory?: (track: MusicTrackItem) => void;
  onNavigateToReels?: () => void;
  onUpdateCoins?: (newCoins: number) => void;
}

export const MusicPlayerView: React.FC<MusicPlayerViewProps> = ({
  currentUser,
  onSelectTrackForStory,
  onNavigateToReels,
  onUpdateCoins,
}) => {
  const [tracks] = useState<MusicTrackItem[]>(MUSIC_CATALOG);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set(['track-h1', 'track-sal1', 'track-e1']));
  const [earningsToast, setEarningsToast] = useState<{ amount: string; message: string; coins?: number } | null>(null);

  // Quality Mode: Low Data (64kbps for low-end Android) vs HD (320kbps for iPhone/Wi-Fi)
  const [audioQuality, setAudioQuality] = useState<'saver' | 'lossless'>('lossless');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  // Listen to Earn Real-Time Accumulator
  const [sessionListenSeconds, setSessionListenSeconds] = useState<number>(0);
  const [totalListenEarnedCoins, setTotalListenEarnedCoins] = useState<number>(0);

  // Watch to Earn State
  const [isWatchEarnOpen, setIsWatchEarnOpen] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<WatchEarnVideo | null>(null);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [hasClaimedVideoReward, setHasClaimedVideoReward] = useState<boolean>(false);

  // Global Payout Modal (Restricted strictly to Owner Admin)
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState<boolean>(false);
  const isOwnerAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com';

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const filteredTracks = tracks.filter((t) => {
    if (activeCategory === 'watch_to_earn') return true;
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const currentTrack: MusicTrackItem | undefined = filteredTracks[currentTrackIndex] || filteredTracks[0] || tracks[0];

  // Initialize or change audio src when currentTrack changes
  useEffect(() => {
    if (!currentTrack) return;
    if (audioRef.current) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentTrack?.id]);

  // Listen to Earn Timer: every 30s of active playing awards +2 coins
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(async () => {
        setSessionListenSeconds((prev) => {
          const nextSec = prev + 1;
          // Record 0.6 MB per 15s of Opus audio
          if (nextSec > 0 && nextSec % 15 === 0) {
            recordTrafficConsumption(0.6, `Opus Audio: ${currentTrack?.title}`, (coinsAdded) => {
              if (onUpdateCoins && currentUser) {
                onUpdateCoins((currentUser.coins ?? 100) + coinsAdded);
              }
            });
          }

          if (nextSec > 0 && nextSec % 30 === 0 && currentUser) {
            // Award +2 coins for 30s streaming
            recordListenEarnReward({
              userId: currentUser.id,
              username: currentUser.username || 'naushad',
              trackId: currentTrack?.id || 'stream',
              trackTitle: currentTrack?.title || 'Streaming Track',
              trackArtist: currentTrack?.artist || 'Artist',
              coinsEarned: 2,
              secondsListened: 30,
            }).then((res) => {
              if (res.success) {
                setTotalListenEarnedCoins((c) => c + 2);
                if (onUpdateCoins) onUpdateCoins(res.newCoins);
                setEarningsToast({
                  amount: '+2 Coins 🪙',
                  message: `Earned while listening to "${currentTrack?.title}"!`,
                  coins: 2,
                });
                setTimeout(() => setEarningsToast(null), 3000);
              }
            }).catch(() => {});
          }
          return nextSec;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentUser?.id, currentTrack?.id]);

  // Sleep Timer countdown
  useEffect(() => {
    if (!sleepTimerMinutes) return;
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setSleepTimerMinutes(null);
      setEarningsToast({
        amount: '🌙 Sleep Timer',
        message: 'Playback paused automatically. Good night!',
      });
      setTimeout(() => setEarningsToast(null), 3000);
    }, sleepTimerMinutes * 60 * 1000);

    return () => clearTimeout(timer);
  }, [sleepTimerMinutes]);

  const handlePlayTrack = (track: MusicTrackItem, index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.play().catch(() => {});
    }

    setEarningsToast({
      amount: track.monetizationPerStory || '+$0.50 AdMob',
      message: `Playing "${track.title}" · Listen-to-Earn Activated 🪙`,
    });
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.85 } });
    setTimeout(() => setEarningsToast(null), 3500);
  };

  const handleTogglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * filteredTracks.length);
      setCurrentTrackIndex(randomIndex);
    } else if (currentTrackIndex < filteredTracks.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
    } else {
      setCurrentTrackIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prev) => prev - 1);
    } else {
      setCurrentTrackIndex(filteredTracks.length - 1);
    }
    setIsPlaying(true);
  };

  const handleSongEnded = async () => {
    // Reward completion bonus coins (+5 to +6 coins)
    if (currentUser && currentTrack) {
      const bonus = currentTrack.listenRewardCoins || 5;
      try {
        const res = await recordListenEarnReward({
          userId: currentUser.id,
          username: currentUser.username || 'naushad',
          trackId: currentTrack.id,
          trackTitle: currentTrack.title,
          trackArtist: currentTrack.artist,
          coinsEarned: bonus,
          secondsListened: currentTrack.durationSec,
        });
        if (res.success) {
          if (onUpdateCoins) onUpdateCoins(res.newCoins);
          confetti({ particleCount: 40, spread: 60 });
          setEarningsToast({
            amount: `+${bonus} Full Track Bonus 🪙`,
            message: `Completed "${currentTrack.title}"! Wallet updated.`,
          });
          setTimeout(() => setEarningsToast(null), 3500);
        }
      } catch (e) {
        // ignore
      }
    }

    if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      handleNextTrack();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || currentTrack?.durationSec || 45);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleToggleLike = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  // Watch to Earn Handlers
  const handleStartWatchEarn = (video: WatchEarnVideo) => {
    setActiveVideo(video);
    setVideoProgress(0);
    setIsVideoPlaying(true);
    setHasClaimedVideoReward(false);
    // Pause audio while watching video
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || activeVideo?.durationSec || 15;
      const progressPercent = Math.min(100, Math.floor((current / total) * 100));
      setVideoProgress(progressPercent);
    }
  };

  const handleVideoEnded = async () => {
    if (!activeVideo || !currentUser || hasClaimedVideoReward) return;
    setHasClaimedVideoReward(true);

    try {
      const res = await recordWatchEarnReward({
        userId: currentUser.id,
        username: currentUser.username || 'naushad',
        videoId: activeVideo.id,
        videoTitle: activeVideo.title,
        rewardCoins: activeVideo.rewardCoins,
      });

      if (res.success) {
        if (onUpdateCoins) onUpdateCoins(res.newCoins);
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        setEarningsToast({
          amount: `+${activeVideo.rewardCoins} Coins Earned! 🎬`,
          message: `Reward credited for watching "${activeVideo.title}"!`,
        });
        setTimeout(() => setEarningsToast(null), 4500);
      }
    } catch (err: any) {
      console.error('Error claiming watch reward:', err);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const categories = [
    { id: 'all', label: '🔥 All Music', count: tracks.length },
    { id: 'hindi', label: '🇮🇳 Hindi (Top Bollywood & Indie 2026)', count: tracks.filter((t) => t.category === 'hindi').length },
    { id: 'salawat', label: '🕌 New Salawat & Nasheed', count: tracks.filter((t) => t.category === 'salawat' || t.category === 'nasheed').length },
    { id: 'english', label: '⚡ English Billboard Hits', count: tracks.filter((t) => t.category === 'english').length },
    { id: 'urdu', label: '🌙 Urdu & Sufi Coke Studio', count: tracks.filter((t) => t.category === 'urdu').length },
    { id: 'slowed', label: '🎧 Slowed + Reverb / Lofi', count: tracks.filter((t) => t.category === 'slowed').length },
    { id: 'watch_to_earn', label: '🎬 Watch to Earn Videos', count: WATCH_TO_EARN_VIDEOS.length },
  ];

  return (
    <div id="instagrand-music-player-view" className="max-w-2xl mx-auto space-y-5 pb-36 animate-fade-in">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnded}
      />

      {/* ========================================================================= */}
      {/* 1. TOP GLOBAL 'WATCH & LISTEN TO EARN' ECOSYSTEM HEADER */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-zinc-950 via-purple-950/60 to-zinc-950 border-2 border-amber-500/40 shadow-2xl space-y-4">
        {/* Top bar: Wallet, Live Listen Accumulator & Global Payout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-fuchsia-500 p-0.5 shadow-lg shadow-amber-500/30 animate-pulse">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Music className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">Global Music & Earning Hub</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Listen-to-Earn Active
                </span>
              </div>
              <p className="text-xs text-purple-300">
                Hindi Hits · Salawat & Nasheed 2026 · Global Billboard · Watch & Earn
              </p>
            </div>
          </div>

          {/* Admin Exclusive Withdraw Button / Normal Users Coin Wallet */}
          {isOwnerAdmin ? (
            <button
              type="button"
              onClick={() => setIsPayoutModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Globe className="w-4 h-4 text-black" />
              <span>Admin Cashout ({currentUser?.coins || 0}🪙)</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-2xl bg-zinc-900/90 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-md">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{currentUser?.coins || 0} Coins</span>
            </div>
          )}
        </div>

        {/* Live Earning Metric & Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-purple-900/50">
            <span className="text-[10px] text-zinc-400 block font-medium">Listening Time</span>
            <div className="text-sm font-black text-white font-mono flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>{Math.floor(sessionListenSeconds / 60)}m {sessionListenSeconds % 60}s</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-amber-500/30">
            <span className="text-[10px] text-amber-300/80 block font-medium">Listen Earned</span>
            <div className="text-sm font-black text-amber-300 font-mono flex items-center justify-center gap-1 mt-0.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>+{totalListenEarnedCoins} Coins</span>
            </div>
          </div>

          {/* Audio Quality Switcher (Low Data Android vs High Fidelity iPhone) */}
          <button
            type="button"
            onClick={() => {
              const next = audioQuality === 'lossless' ? 'saver' : 'lossless';
              setAudioQuality(next);
              setEarningsToast({
                amount: next === 'saver' ? '⚡ Data Saver 64kbps' : '🎧 Lossless 320kbps HD',
                message: next === 'saver' ? 'Optimized for low-bandwidth Android' : 'Studio Master for iOS / Wi-Fi',
              });
              setTimeout(() => setEarningsToast(null), 2500);
            }}
            className="p-2.5 rounded-2xl bg-zinc-900/80 border border-purple-900/50 hover:border-fuchsia-500 text-left transition-colors cursor-pointer"
          >
            <span className="text-[10px] text-zinc-400 block font-medium">Audio Mode</span>
            <div className="text-xs font-black text-fuchsia-300 flex items-center gap-1 mt-0.5">
              {audioQuality === 'saver' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Data Saver (64k)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Lossless (320k)</span>
                </>
              )}
            </div>
          </button>

          {/* Sleep Timer */}
          <button
            type="button"
            onClick={() => {
              const options = [null, 15, 30, 60];
              const curIdx = options.indexOf(sleepTimerMinutes);
              const nextVal = options[(curIdx + 1) % options.length];
              setSleepTimerMinutes(nextVal);
            }}
            className="p-2.5 rounded-2xl bg-zinc-900/80 border border-purple-900/50 hover:border-purple-600 text-left transition-colors cursor-pointer"
          >
            <span className="text-[10px] text-zinc-400 block font-medium">Sleep Timer</span>
            <div className="text-xs font-black text-purple-200 flex items-center gap-1 mt-0.5">
              <span>{sleepTimerMinutes ? `${sleepTimerMinutes} mins` : 'Disabled'}</span>
            </div>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Search Hindi, Salawat 2026, Nasheed, English Billboard songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-amber-400 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setCurrentTrackIndex(0);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-fuchsia-600 text-black font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-purple-900/40 hover:bg-zinc-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-80">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Earnings Toast */}
      {earningsToast && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/95 via-fuchsia-600/95 to-purple-600/95 text-white shadow-2xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-black/40 flex items-center justify-center font-bold text-amber-300">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black">{earningsToast.amount}</div>
              <div className="text-[10px] text-amber-100">{earningsToast.message}</div>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/50 font-bold border border-white/20">
            Automated Reward
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WATCH-TO-EARN VIDEO SECTION (If activeCategory === 'watch_to_earn') */}
      {/* ========================================================================= */}
      {activeCategory === 'watch_to_earn' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-zinc-950 border border-amber-500/40 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-400" />
                <span>Watch Videos to Earn Rewards</span>
              </h3>
              <p className="text-xs text-amber-200/80">
                Watch full 4K music clips and sponsored videos to earn +20 to +30 Coins directly into your wallet!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {WATCH_TO_EARN_VIDEOS.map((vid) => (
              <div
                key={vid.id}
                onClick={() => handleStartWatchEarn(vid)}
                className="p-3 rounded-2xl bg-zinc-900/90 border border-purple-900/50 hover:border-amber-400 transition-all cursor-pointer group space-y-2.5 shadow-lg"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-400/40 flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    <span>+{vid.rewardCoins} Coins</span>
                  </div>

                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-zinc-300">
                    {vid.durationSec}s Video
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {vid.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                    <span>{vid.creator}</span>
                    <span className="text-amber-400 font-bold">{vid.adSponsor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. FEATURED MUSIC HERO CARD & TRACK LIST */
        /* ========================================================================= */
        <>
          {currentTrack && (
            <div
              id="featured-song-hero-banner"
              className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 via-zinc-950 to-fuchsia-950/90 border-2 border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.25)] overflow-hidden"
            >
              <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
                {/* Album Art with disc */}
                <div className="relative group flex-shrink-0">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-fuchsia-400 shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-fuchsia-600 text-black flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer font-black"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current text-white" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5 text-black" />
                    )}
                  </button>
                </div>

                {/* Track Info & Controls */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/40 uppercase">
                      {currentTrack.category} STREAM
                    </span>
                    {currentTrack.is2026Release && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                        ✨ 2026 New Release
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {currentTrack.title}
                  </h2>
                  <p className="text-xs text-purple-200 font-medium">{currentTrack.artist}</p>

                  {currentTrack.lyricsSnippet && (
                    <p className="text-xs italic text-zinc-300/90 bg-zinc-900/60 p-2 rounded-xl border border-purple-900/40">
                      "{currentTrack.lyricsSnippet}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    {onSelectTrackForStory && (
                      <button
                        type="button"
                        onClick={() => onSelectTrackForStory(currentTrack)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Story</span>
                      </button>
                    )}
                    <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/40">
                      +{currentTrack.listenRewardCoins || 5}🪙 Full Stream Reward
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Songs Catalog List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <ListMusic className="w-4 h-4 text-fuchsia-400" />
                <span>Multi-Lingual Jukebox ({filteredTracks.length} tracks)</span>
              </div>
              <span className="text-[11px] text-amber-400 font-mono font-bold">
                +2🪙 / 30s Streamed
              </span>
            </div>

            <div className="space-y-2">
              {filteredTracks.map((track, idx) => {
                const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                const isLiked = likedTrackIds.has(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track, idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                      currentTrack?.id === track.id
                        ? 'bg-purple-950/70 border-fuchsia-500/70 shadow-[0_0_20px_rgba(217,70,239,0.25)]'
                        : 'bg-zinc-950/80 border-purple-900/40 hover:bg-zinc-900 hover:border-purple-700/60'
                    }`}
                  >
                    {/* Left: Cover & Play Icon */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-purple-500/40">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                            isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isThisPlaying ? (
                            <Pause className="w-5 h-5 text-fuchsia-400 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-black text-white truncate">
                            {track.title}
                          </h4>
                          {track.is2026Release && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex-shrink-0">
                              2026
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-purple-300 truncate">{track.artist}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400 font-mono">
                          <span>{track.duration}</span>
                          <span>•</span>
                          <span>{(track.plays / 1000).toFixed(0)}k plays</span>
                          <span className="text-amber-400 font-bold">+{track.listenRewardCoins || 5}🪙</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleLike(track.id, e)}
                        className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isLiked ? 'text-rose-500 fill-rose-500' : ''
                          }`}
                        />
                      </button>

                      {onSelectTrackForStory && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTrackForStory(track);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-purple-900 border border-purple-800/60 text-[10px] font-bold text-purple-300 hover:text-white"
                        >
                          + Story
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Official Google AdMob Banner */}
      <AdMobBanner position="bottom" currentUser={currentUser} />

      {/* ========================================================================= */}
      {/* 4. PERSISTENT STICKY BOTTOM AUDIO PLAYER CONTROLLER */}
      {/* ========================================================================= */}
      {currentTrack && activeCategory !== 'watch_to_earn' && (
        <div
          id="persistent-bottom-music-player"
          className="fixed bottom-16 left-0 right-0 z-40 max-w-xl mx-auto px-3 pointer-events-auto"
        >
          <div className="p-3.5 rounded-3xl bg-zinc-950/95 backdrop-blur-xl border-2 border-fuchsia-500/60 shadow-[0_0_35px_rgba(217,70,239,0.35)] space-y-2">
            {/* Top row: Track Details & Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Left: Thumbnail & Name */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-10 h-10 rounded-xl object-cover border border-purple-400 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-white truncate">
                    {currentTrack.title}
                  </div>
                  <div className="text-[10px] text-purple-300 truncate">
                    {currentTrack.artist}
                  </div>
                </div>
              </div>

              {/* Center: Playback Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handlePrevTrack}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="p-2.5 rounded-full bg-gradient-to-tr from-amber-500 via-fuchsia-600 to-pink-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNextTrack}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Right: Volume & Repeat */}
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-1.5 rounded-lg text-xs ${
                    isLooping ? 'text-fuchsia-400 bg-fuchsia-950/60' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Loop Track"
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="text-zinc-400 hover:text-white"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-purple-300" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 accent-fuchsia-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Bottom row: Scrub Bar & Timers */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || currentTrack.durationSec || 45}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 accent-fuchsia-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span>{formatTime(duration || currentTrack.durationSec || 45)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. WATCH-TO-EARN DEDICATED FULLSCREEN VIDEO PLAYER MODAL */}
      {/* ========================================================================= */}
      {activeVideo && (
        <div
          id="watch-earn-video-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div className="w-full max-w-lg bg-zinc-950 border-2 border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 relative">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">{activeVideo.title}</h3>
                  <p className="text-[10px] text-amber-300">
                    Watch full video to claim +{activeVideo.rewardCoins} Coins
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-amber-500/30">
              <video
                ref={videoRef}
                src={activeVideo.videoUrl}
                autoPlay
                controls
                playsInline
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Completion Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-300">Reward Progress</span>
                <span className="text-amber-400 font-mono">{videoProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            </div>

            {/* Status / Claim Button */}
            {hasClaimedVideoReward ? (
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>🎉 +{activeVideo.rewardCoins} Coins successfully added to your wallet!</span>
              </div>
            ) : (
              <div className="text-center text-[11px] text-zinc-400">
                ⏳ Video streaming active · Reward unlocks automatically upon completion
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Multi-Currency Payout Modal */}
      <GlobalPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        currentUser={currentUser}
        onCoinsUpdated={(newCoins) => {
          if (onUpdateCoins) onUpdateCoins(newCoins);
        }}
      />
    </div>
  );
};
