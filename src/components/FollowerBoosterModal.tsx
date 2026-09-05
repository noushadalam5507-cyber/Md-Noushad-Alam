import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  Users,
  Award,
  Crown,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  Flame,
  ArrowRight,
  RefreshCw,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { boostUserFollowersInFirestore } from '../lib/firestoreService';

interface FollowerBoosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onFollowersUpdated?: (newCount: number, isVerified?: boolean) => void;
}

// 2-minute watch duration in seconds
const REQUIRED_WATCH_SECONDS = 120;

// Engaging high-quality creator video reels to watch
const CREATOR_VIDEOS = [
  {
    id: 'vid-1',
    title: 'NovaGrand 4K Cyber Tokyo Live Stream',
    creator: 'NovaGrand Official',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-neon-lights-and-flying-cars-42998-large.mp4',
    thumb: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'vid-2',
    title: 'Ultra HD DJ Festival Studio Experience',
    creator: 'Elena Vance Live',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-dj-playing-music-in-a-nightclub-43098-large.mp4',
    thumb: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'vid-3',
    title: 'Neon Motion Graphic 4K Design Lab',
    creator: 'Alex Studio Pro',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-graphs-and-data-31911-large.mp4',
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
  }
];

export const FollowerBoosterModal: React.FC<FollowerBoosterModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onFollowersUpdated
}) => {
  const [secondsWatched, setSecondsWatched] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoIndex, setVideoIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimedBonusCount, setClaimedBonusCount] = useState<number>(0);
  const [activateBlueTick, setActivateBlueTick] = useState<boolean>(true);
  const [currentFollowers, setCurrentFollowers] = useState<number>(
    currentUser?.followers ?? currentUser?.followersCount ?? 0
  );
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<any>(null);

  // Sync current followers when user profile updates
  useEffect(() => {
    if (currentUser) {
      setCurrentFollowers(currentUser.followers ?? currentUser.followersCount ?? 0);
    }
  }, [currentUser]);

  // Handle timer countdown
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSecondsWatched((prev) => {
          if (prev + 1 >= REQUIRED_WATCH_SECONDS) {
            clearInterval(timerRef.current);
            setIsCompleted(true);
            setIsPlaying(false);
            triggerCelebration();
            return REQUIRED_WATCH_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, isCompleted]);

  // Video play/pause synchronization
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, videoIndex]);

  if (!isOpen) return null;

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const remainingSeconds = Math.max(0, REQUIRED_WATCH_SECONDS - secondsWatched);
  const minutesDisplay = Math.floor(remainingSeconds / 60);
  const secondsDisplay = remainingSeconds % 60;
  const progressPercent = Math.min(100, Math.round((secondsWatched / REQUIRED_WATCH_SECONDS) * 100));

  const handleClaimFollowers = async () => {
    if (!currentUser || isClaiming) return;
    setIsClaiming(true);

    try {
      const rewardFollowers = 10;
      const res = await boostUserFollowersInFirestore(currentUser.id, rewardFollowers, activateBlueTick);
      
      const newTotal = res.newFollowersCount;
      setCurrentFollowers(newTotal);
      setClaimedBonusCount((prev) => prev + rewardFollowers);

      triggerCelebration();

      if (onFollowersUpdated) {
        onFollowersUpdated(newTotal, activateBlueTick);
      }
    } catch (err) {
      console.error('Error claiming followers reward:', err);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleWatchAgain = () => {
    setSecondsWatched(0);
    setIsCompleted(false);
    setIsPlaying(true);
    setVideoIndex((prev) => (prev + 1) % CREATOR_VIDEOS.length);
  };

  const activeVideo = CREATOR_VIDEOS[videoIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-purple-800/70 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-purple-950/70 text-white overflow-hidden max-h-[92vh] flex flex-col">
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-gradient-to-r from-purple-600/30 via-cyan-400/20 to-emerald-400/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center shrink-0 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-950 to-cyan-950 border border-purple-600/50 text-cyan-300 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Followers Booster (Watch 2m = +10 Real Followers)</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-cyan-300">
            Grow Real Followers & Blue Tick
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Watch creator streams for 2 minutes to instantly boost your real profile followers by +10!
          </p>
        </div>

        {/* Current Followers & Instagram Blue Tick Banner */}
        <div className="my-3 p-3 rounded-2xl bg-zinc-900/80 border border-purple-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-md shrink-0">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>@{currentUser?.username || 'user'}</span>
                {/* Official Instagram Blue Tick Badge */}
                <div className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0095f6] text-white shadow-sm shrink-0" title="Instagram Verified Official Badge">
                  <CheckCircle2 className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-cyan-400" />
                <span>Followers: <strong className="text-cyan-300 font-bold">{currentFollowers.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {claimedBonusCount > 0 && (
            <div className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono animate-bounce">
              +{claimedBonusCount} Added Today!
            </div>
          )}
        </div>

        {/* Video Player & Timer Section */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-purple-900/60 shadow-inner my-1 flex-1 min-h-[190px] max-h-[250px] flex items-center justify-center">
          <video
            ref={videoRef}
            src={activeVideo.src}
            poster={activeVideo.thumb}
            playsInline
            loop
            muted={isMuted}
            className="w-full h-full object-cover opacity-85"
          />

          {/* Dark Overlay with Live Counters */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-3 pointer-events-none">
            {/* Top Bar inside Video */}
            <div className="flex items-center justify-between pointer-events-auto">
              <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-[11px] font-medium text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                LIVE 4K STREAM
              </span>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/60 backdrop-blur border border-white/15 text-white hover:bg-black/80 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>

            {/* Bottom Controls inside Video */}
            <div className="flex items-center justify-between pointer-events-auto">
              <div>
                <p className="text-xs font-bold text-white drop-shadow">{activeVideo.title}</p>
                <p className="text-[10px] text-zinc-300">By {activeVideo.creator}</p>
              </div>

              {!isCompleted && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Minute Progress Bar & Live Countdown */}
        <div className="my-3 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Watch Progress (2 Minutes):</span>
            </span>
            <span className="font-mono font-bold text-cyan-300 text-sm">
              {isCompleted ? '✓ Completed!' : `${minutesDisplay}:${secondsDisplay < 10 ? '0' : ''}${secondsDisplay} Left`}
            </span>
          </div>

          <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>0m 00s</span>
            <span>{progressPercent}% watched</span>
            <span>2m 00s (+10 Followers)</span>
          </div>
        </div>

        {/* Instagram Blue Tick Option */}
        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between shrink-0 mb-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0095f6] text-white shadow-sm">
              <CheckCircle2 className="w-4 h-4 fill-white text-[#0095f6]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Instagram-Style Blue Tick Verification</p>
              <p className="text-[10px] text-zinc-400">Award official verified badge with your followers boost</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={activateBlueTick}
              onChange={(e) => setActivateBlueTick(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0095f6]"></div>
          </label>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          {isCompleted ? (
            <div className="space-y-2">
              <button
                onClick={handleClaimFollowers}
                disabled={isClaiming}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isClaiming ? 'Crediting Real Followers...' : 'Claim +10 Real Followers & Blue Tick Now!'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWatchAgain}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Watch Another 2 Minutes to Get +10 More Followers</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Watching... ({remainingSeconds}s remaining for +10 Followers)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Resume 2-Minute Watch Stream</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
