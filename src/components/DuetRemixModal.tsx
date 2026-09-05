import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Layers,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Share2,
  Coins,
  Radio,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  SplitSquareVertical,
  Sliders,
  Send,
  Zap,
  Disc3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReelItem } from '../data/reelsData';
import { UserProfile } from '../types';
import { recordTrafficConsumption } from '../utils/trafficTracker';
import { soundSynth } from '../utils/audioSynth';

interface DuetRemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalReel: ReelItem | null;
  currentUser: UserProfile | null;
  onPostDuet: (newReel: ReelItem) => void;
  onUpdateCoins?: (newCoins: number) => void;
}

export const DuetRemixModal: React.FC<DuetRemixModalProps> = ({
  isOpen,
  onClose,
  originalReel,
  currentUser,
  onPostDuet,
  onUpdateCoins,
}) => {
  const [layoutMode, setLayoutMode] = useState<'split-vertical' | 'split-horizontal' | 'pip'>('split-vertical');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [recordDuration, setRecordDuration] = useState<15 | 30 | 60>(15);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isMicActive, setIsMicActive] = useState<boolean>(true);
  const [duetFilter, setDuetFilter] = useState<'none' | 'cyber-purple' | 'hyper-glow' | 'retro-synth'>('cyber-purple');
  const [captionText, setCaptionText] = useState<string>('');
  const [isRecorded, setIsRecorded] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [audioLevel, setAudioLevel] = useState<number>(65);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const originalVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      setIsRecording(false);
      setIsRecorded(false);
      setRecordProgress(0);
      return;
    }

    if (originalReel) {
      setCaptionText(`Remix & Duet with @${originalReel.authorUsername} 🔥 #NeonCall #Instagrand`);
    }

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access fallback simulation:', err);
      }
    }

    initCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isOpen, originalReel]);

  // Handle Recording Timer & Audio Sync
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      soundSynth.playWheelTick(1.2);
      if (originalVideoRef.current) {
        originalVideoRef.current.currentTime = 0;
        originalVideoRef.current.play().catch(() => {});
      }

      const totalIntervals = recordDuration * 10;
      interval = setInterval(() => {
        setRecordProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRecording(false);
            setIsRecorded(true);
            soundSynth.playRewardUnlock();
            if (originalVideoRef.current) {
              originalVideoRef.current.pause();
            }
            return 100;
          }
          // Simulate dynamic audio pulse during recording
          setAudioLevel(40 + Math.random() * 50);
          return prev + 100 / totalIntervals;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isRecording, recordDuration]);

  if (!isOpen || !originalReel) return null;

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsRecorded(true);
      if (originalVideoRef.current) originalVideoRef.current.pause();
    } else {
      setIsRecorded(false);
      setRecordProgress(0);
      setIsRecording(true);
    }
  };

  const handleReset = () => {
    setIsRecording(false);
    setIsRecorded(false);
    setRecordProgress(0);
    if (originalVideoRef.current) {
      originalVideoRef.current.currentTime = 0;
    }
  };

  const getDuetFilterClass = () => {
    switch (duetFilter) {
      case 'cyber-purple':
        return 'hue-rotate-[260deg] saturate-150 contrast-110';
      case 'hyper-glow':
        return 'brightness-110 contrast-125 saturate-200';
      case 'retro-synth':
        return 'sepia-50 hue-rotate-[290deg] saturate-200';
      default:
        return '';
    }
  };

  const handlePublishDuet = () => {
    setIsPublishing(true);

    // Consume heavy traffic (12.5 MB for dual 4K stream video creation)
    recordTrafficConsumption(12.5, `Duet Video Publish: @${originalReel.authorUsername}`, (coinsEarned) => {
      if (onUpdateCoins && currentUser) {
        onUpdateCoins((currentUser.coins ?? 100) + coinsEarned + 30);
      }
    });

    setTimeout(() => {
      const newDuetReel: ReelItem = {
        id: `duet-${Date.now()}`,
        authorId: currentUser?.id || 'usr_naushad',
        authorName: currentUser?.name || 'Naushad Alam',
        authorUsername: currentUser?.username || 'naushad',
        authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        videoUrl: originalReel.videoUrl,
        posterUrl: originalReel.posterUrl,
        caption: captionText || `Duet with @${originalReel.authorUsername} ⚡`,
        audioTrackTitle: `${originalReel.audioTrackTitle || 'Original Audio'} (Duet Remix)`,
        audioTrackArtist: 'NeonCall Studio Duet',
        likesCount: 142,
        commentsCount: 18,
        comments: [],
        sharesCount: 35,
        viewsCount: 280,
        adMobEarnings: '₹0.45',
        tags: ['duet', 'remix', 'viral'],
        isLiked: true,
        category: originalReel.category,
        isVerified: true,
      };

      onPostDuet(newDuetReel);
      setIsPublishing(false);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#06b6d4', '#eab308'],
      });
      soundSynth.playJackpotFanfare();
      onClose();
    }, 1200);
  };

  return (
    <div
      id="duet-remix-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="duet-remix-modal-card"
        className="relative w-full max-w-2xl bg-zinc-950 border-2 border-purple-500/60 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col my-auto max-h-[96vh]"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-zinc-900/80 border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Duet & Remix Studio</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40 font-mono font-bold">
                  HD Sync
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Remixing with @{originalReel.authorUsername} · Earn +30🪙 on publish
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dual Screen Preview Area */}
        <div className="p-3 bg-black flex-1 flex flex-col justify-center items-center overflow-hidden">
          <div
            className={`relative w-full max-w-lg aspect-[9/14] sm:aspect-[4/3] rounded-2xl overflow-hidden border-2 border-purple-600/60 shadow-2xl bg-zinc-950 ${
              layoutMode === 'split-vertical'
                ? 'grid grid-cols-2'
                : layoutMode === 'split-horizontal'
                ? 'grid grid-rows-2'
                : 'relative'
            }`}
          >
            {/* Original Reel Side */}
            <div className="relative w-full h-full bg-black overflow-hidden border-r border-purple-900/50">
              <video
                ref={originalVideoRef}
                src={originalReel.videoUrl}
                poster={originalReel.posterUrl}
                playsInline
                loop
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur text-[10px] text-white font-bold flex items-center gap-1">
                <img
                  src={originalReel.authorAvatar}
                  alt={originalReel.authorName}
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
                <span>@{originalReel.authorUsername}</span>
              </div>
            </div>

            {/* User Camera Reaction Side */}
            <div
              className={`relative w-full h-full bg-zinc-900 overflow-hidden flex items-center justify-center ${
                layoutMode === 'pip'
                  ? 'absolute bottom-4 right-4 w-32 aspect-[9/16] rounded-xl border-2 border-fuchsia-400 shadow-2xl z-20'
                  : ''
              }`}
            >
              {isCameraActive ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${getDuetFilterClass()}`}
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-zinc-500">
                  <VideoOff className="w-8 h-8" />
                  <span className="text-xs">Camera Muted</span>
                </div>
              )}

              {/* Real-time Audio Sync Waveform Bar */}
              {isRecording && (
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded-lg bg-black/80 backdrop-blur text-[10px] text-fuchsia-300 font-mono">
                  <span>SYNC MIC</span>
                  <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-purple-950/80 backdrop-blur border border-purple-500/40 text-[10px] text-fuchsia-300 font-bold">
                You (@{currentUser?.username || 'naushad'})
              </div>
            </div>

            {/* Recording Progress Bar */}
            {isRecording && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-900 z-30">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-400 transition-all"
                  style={{ width: `${recordProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="px-4 py-3 bg-zinc-900/90 border-t border-purple-900/40 space-y-3">
          {/* Quick Filter & Layout Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Layout Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-purple-900/40">
              <button
                type="button"
                onClick={() => setLayoutMode('split-vertical')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  layoutMode === 'split-vertical'
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Split Left/Right
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('pip')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  layoutMode === 'pip'
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Picture-in-Picture
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              {[
                { id: 'none', label: '🌿 Clean' },
                { id: 'cyber-purple', label: '🟣 Cyber' },
                { id: 'hyper-glow', label: '✨ Glow' },
                { id: 'retro-synth', label: '🌆 Synth' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDuetFilter(f.id as any)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                    duetFilter === f.id
                      ? 'bg-fuchsia-600 border-fuchsia-400 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Timer Selector */}
            <div className="flex items-center gap-1">
              {[15, 30, 60].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    if (!isRecording) setRecordDuration(sec as any);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                    recordDuration === sec
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Record Button & Caption Input */}
          <div className="flex items-center gap-3">
            {!isRecorded ? (
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40'
                    : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white hover:scale-102 active:scale-98 shadow-purple-600/40'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    isRecording ? 'bg-white rounded-xs' : 'bg-rose-400 animate-ping'
                  }`}
                />
                <span>{isRecording ? 'Stop Recording Duet' : 'Start Duet Recording'}</span>
              </button>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  placeholder="Add duet caption..."
                  className="flex-1 px-3.5 py-2.5 rounded-2xl bg-zinc-950 border border-purple-800/60 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                  title="Retake Duet"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handlePublishDuet}
                  disabled={isPublishing}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all cursor-pointer"
                >
                  {isPublishing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Duet (+30🪙)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
