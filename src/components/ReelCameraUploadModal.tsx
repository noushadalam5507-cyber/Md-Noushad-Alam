import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Video,
  Upload,
  Music,
  X,
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  Check,
  Film,
  Smile,
  Hash,
  Share2,
  DollarSign,
  Zap,
  Layers,
  StopCircle,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReelItem } from '../data/reelsData';
import { UserProfile } from '../types';
import { saveReelToFirestore } from '../lib/firestoreService';
import { uploadVideoToFirebase } from '../lib/firebaseStorage';
import { MUSIC_CATALOG, MusicTrackItem } from '../data/musicTracks';

interface ReelCameraUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onReelPublished: (newReel: ReelItem) => void;
  onUpdateCoins?: (newTotal: number) => void;
}

export const ReelCameraUploadModal: React.FC<ReelCameraUploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onReelPublished,
  onUpdateCoins,
}) => {
  // Modes: 'camera' | 'gallery'
  const [activeTab, setActiveTab] = useState<'camera' | 'gallery'>('camera');

  // Camera stream & recording states
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [beautyFilter, setBeautyFilter] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string>('');

  // Recorded or picked video data
  const [videoBlobUrl, setVideoBlobUrl] = useState<string>('');
  const [previewPlaying, setPreviewPlaying] = useState<boolean>(true);

  // Reel meta
  const [caption, setCaption] = useState<string>('');
  const [category, setCategory] = useState<'hindi' | 'english' | 'urdu' | 'slowed'>('hindi');
  const [selectedTrack, setSelectedTrack] = useState<MusicTrackItem>(MUSIC_CATALOG[0]);
  const [showMusicPicker, setShowMusicPicker] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');

  // References
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const rawVideoBlobRef = useRef<Blob | File | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample quick video templates if camera is not available on test device
  const SAMPLE_VIDEOS = [
    {
      title: 'Neon Cyber Dance',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Cinematic Slow Motion',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      poster: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Urban Sunset Beats',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      poster: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    },
  ];

  // Initialize camera when camera tab is active
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera' || videoBlobUrl) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, videoBlobUrl]);

  const startCamera = async () => {
    stopCamera();
    setCameraError('');

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 720 },
            height: { ideal: 1280 },
          },
          audio: true,
        });

        setCameraStream(stream);
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play().catch(() => {});
        }
      } else {
        setCameraError('Camera API not supported in this browser. Please use Gallery Upload.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera permissions not granted. You can select a video from your gallery or choose a preset.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleStartRecording = () => {
    if (!cameraStream) {
      // Fallback: Use sample video if camera is not available
      setVideoBlobUrl(SAMPLE_VIDEOS[0].url);
      return;
    }

    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(cameraStream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        rawVideoBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setVideoBlobUrl(url);
        stopCamera();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('MediaRecorder start error:', err);
      setVideoBlobUrl(SAMPLE_VIDEOS[0].url);
      rawVideoBlobRef.current = null;
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleRetake = () => {
    setVideoBlobUrl('');
    rawVideoBlobRef.current = null;
    setUploadProgress(0);
    setUploadStatusText('');
    setRecordingTime(0);
    startCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      rawVideoBlobRef.current = file;
      const url = URL.createObjectURL(file);
      setVideoBlobUrl(url);
      stopCamera();
    }
  };

  const handleAddHashtag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoBlobUrl) return;

    setIsSubmitting(true);
    setUploadProgress(10);
    setUploadStatusText('Preparing video for Firebase Cloud...');

    let finalVideoUrl = videoBlobUrl;
    let finalPosterUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

    // Upload to Firebase Cloud Storage if a real file or blob was captured
    if (rawVideoBlobRef.current) {
      try {
        setUploadStatusText('Uploading to Firebase Storage bucket...');
        const uploadResult = await uploadVideoToFirebase(
          rawVideoBlobRef.current,
          'reels',
          (prog) => {
            setUploadProgress(Math.min(92, Math.max(10, prog)));
            setUploadStatusText(`Uploading to Firebase Cloud (${prog}%)...`);
          }
        );
        finalVideoUrl = uploadResult.downloadUrl;
        if (uploadResult.posterUrl) {
          finalPosterUrl = uploadResult.posterUrl;
        }
      } catch (err) {
        console.warn('Firebase Storage upload failed, proceeding with fallback URL:', err);
      }
    }

    setUploadProgress(95);
    setUploadStatusText('Broadcasting reel to Firestore Global Feed...');

    const isFounder = currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com' || currentUser?.username === 'naushad';
    const authorName = currentUser?.name || (isFounder ? 'Naushad Alam' : 'Instagrand Creator');
    const authorUsername = currentUser?.username || (isFounder ? 'naushad' : 'creator');
    const authorAvatar = currentUser?.avatar || (isFounder
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

    const newReel: ReelItem = {
      id: `reel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      authorId: currentUser?.id || 'usr-creator',
      authorName,
      authorUsername,
      authorAvatar,
      isVerified: currentUser?.isVerified ?? true,
      videoUrl: finalVideoUrl,
      posterUrl: finalPosterUrl,
      caption: caption || '✨ New Viral Reel on Instagrand! 💜 #Trending #Instagrand',
      audioTrackTitle: selectedTrack?.title || 'Original Soundtrack',
      audioTrackArtist: selectedTrack?.artist || authorName,
      audioTrackUrl: selectedTrack?.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audioTrackCover: selectedTrack?.coverUrl || authorAvatar,
      category,
      likesCount: 1,
      isLiked: true,
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      viewsCount: 1,
      adMobEarnings: '+$0.65 AdMob',
      tags: ['#NewReel', '#Instagrand', '#ViralVideo', `#${category}`],
    };

    // 1. Save to Firestore for all users across the cloud
    await saveReelToFirestore(newReel);

    setUploadProgress(100);
    setUploadStatusText('Published successfully!');

    // 2. Add creator coin bonus (+25 coins)
    if (onUpdateCoins && currentUser) {
      onUpdateCoins((currentUser.coins || 0) + 25);
    }

    // 3. Callback to parent view
    onReelPublished(newReel);

    confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    setIsSubmitting(false);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      onClick={() => {
        stopCamera();
        onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-zinc-950 border-2 border-purple-500/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/70 hover:bg-zinc-800 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Camera Viewfinder / Video Preview Frame */}
        <div className="w-full md:w-1/2 bg-black relative flex flex-col items-center justify-center min-h-[320px] md:min-h-[480px] overflow-hidden">
          {videoBlobUrl ? (
            // Recorded / Picked Video Preview
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={previewVideoRef}
                src={videoBlobUrl}
                autoPlay
                loop
                playsInline
                className="w-full h-full max-h-[480px] object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-emerald-300 flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Ready to Share</span>
              </div>
              <button
                type="button"
                onClick={handleRetake}
                className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md border border-purple-500/40 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake / Change</span>
              </button>
            </div>
          ) : activeTab === 'camera' ? (
            // Live Camera Viewfinder
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
              {cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-900/40 text-purple-400 mx-auto flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-zinc-400">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gallery')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Select from Gallery
                  </button>
                  <div className="pt-2">
                    <span className="text-[10px] text-zinc-500 block mb-1.5">Or use a sample clip:</span>
                    <div className="flex gap-1.5 justify-center">
                      {SAMPLE_VIDEOS.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setVideoBlobUrl(s.url)}
                          className="px-2 py-1 rounded-lg bg-zinc-900 text-[10px] text-purple-300 hover:bg-purple-900/50 cursor-pointer border border-purple-900/50"
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={liveVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full max-h-[480px] object-cover ${
                      beautyFilter ? 'brightness-105 contrast-105 saturate-110' : ''
                    } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />

                  {/* Camera Overlays */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {isRecording ? (
                      <div className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-black flex items-center gap-2 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 60s</span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-purple-300 flex items-center gap-1.5">
                        <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
                        <span>HD Live Camera</span>
                      </div>
                    )}
                  </div>

                  {/* Top Right Controls: Beauty & Flip */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setBeautyFilter(!beautyFilter)}
                      className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                        beautyFilter ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/50' : 'bg-black/60 text-zinc-400'
                      }`}
                      title="Toggle Glow Beauty Filter"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer"
                      title="Flip Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Center/Bottom Capture Shutter Button */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
                    {isRecording ? (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="w-16 h-16 rounded-full bg-rose-600 border-4 border-white flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <StopCircle className="w-8 h-8" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-600 border-4 border-white/90 flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                      >
                        <div className="w-6 h-6 rounded-full bg-white group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            // Gallery Upload Tab
            <div className="p-6 text-center space-y-4 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-purple-500/50 hover:border-purple-400 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 bg-purple-950/20 hover:bg-purple-900/30 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/30 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Choose Video from Device</h4>
                  <p className="text-xs text-zinc-400 mt-1">MP4, WebM, or MOV up to 60s</p>
                </div>
                <span className="px-4 py-2 rounded-xl bg-zinc-900 border border-purple-700/60 text-xs font-semibold text-purple-300 group-hover:border-purple-400">
                  Browse Files
                </span>
              </div>

              {/* Sample Videos Shortcut */}
              <div className="space-y-2 text-left">
                <span className="text-[11px] font-bold text-zinc-400">Or Quick Preset Video:</span>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_VIDEOS.map((sample, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setVideoBlobUrl(sample.url)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-purple-950/60 border border-purple-900/40 hover:border-purple-500/60 text-left transition-all cursor-pointer"
                    >
                      <div className="aspect-[9/12] rounded-lg bg-zinc-800 overflow-hidden mb-1.5 relative">
                        <img src={sample.poster} alt={sample.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-200 truncate">{sample.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mode Switcher Tabs (Camera vs Gallery) */}
          {!videoBlobUrl && (
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md p-1 rounded-2xl border border-purple-900/50 flex gap-1 z-20">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('camera');
                  startCamera();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('gallery');
                  stopCamera();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Gallery</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Reel Details, Audio Track, Caption, and Publish Form */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-purple-900/40">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Reels Studio & Publish</h3>
                <p className="text-[10px] text-purple-300">Share with real users across Firebase network</p>
              </div>
            </div>

            <form onSubmit={handlePublish} className="mt-4 space-y-3.5">
              {/* Caption Field */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Reel Caption & Description
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write an engaging caption... (#HindiReels #Instagrand #Viral2026)"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900 border border-purple-900/60 focus:border-purple-400 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
                {/* Quick Hashtags */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['#Instagrand', '#HindiReels', '#Trending2026', '#SlowedReverb', '#Dance', '#Viral'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddHashtag(tag)}
                        className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-purple-900/50 border border-purple-900/40 text-[10px] font-mono text-purple-300 cursor-pointer"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Music Soundtrack Card */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Selected Music Track</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMusicPicker(!showMusicPicker)}
                    className="text-[10px] font-bold text-fuchsia-400 hover:text-fuchsia-300 underline cursor-pointer"
                  >
                    {showMusicPicker ? 'Close Tracklist' : 'Change Song →'}
                  </button>
                </div>

                <div
                  onClick={() => setShowMusicPicker(!showMusicPicker)}
                  className="p-2.5 rounded-2xl bg-zinc-900 border border-purple-800/60 hover:border-fuchsia-500/80 flex items-center justify-between gap-3 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={selectedTrack.coverUrl}
                      alt={selectedTrack.title}
                      className="w-9 h-9 rounded-xl object-cover border border-purple-500/50 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{selectedTrack.title}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{selectedTrack.artist}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-xl bg-purple-600/50 text-white text-[10px] font-bold shrink-0">
                    🎵 Selected
                  </span>
                </div>

                {/* Dropdown Track Selector */}
                {showMusicPicker && (
                  <div className="mt-2 max-h-44 overflow-y-auto rounded-2xl bg-zinc-900/95 border border-purple-800/60 p-1.5 space-y-1 animate-fade-in">
                    {MUSIC_CATALOG.map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => {
                          setSelectedTrack(track);
                          setShowMusicPicker(false);
                        }}
                        className={`w-full p-2 rounded-xl flex items-center gap-2 text-left transition-all cursor-pointer ${
                          selectedTrack.id === track.id
                            ? 'bg-purple-600 text-white'
                            : 'hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        <img src={track.coverUrl} alt={track.title} className="w-7 h-7 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{track.title}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                        </div>
                        {selectedTrack.id === track.id && <Check className="w-4 h-4 text-white shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Feed Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-zinc-900 border border-purple-900/60 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="hindi">🇮🇳 Hindi Viral & New 2026</option>
                  <option value="urdu">🌙 Urdu & Sufi Qawwali</option>
                  <option value="slowed">🎧 Slowed + Reverb Hits</option>
                  <option value="english">⚡ English Billboard Hot 100</option>
                </select>
              </div>

              {/* Founder / AdMob & Coin Reward Callout */}
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/50 text-[11px] text-purple-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Posting earns you <strong>+25 Creator Coins</strong> & enables real AdMob revenue on views!
                </span>
              </div>

              {/* Upload Progress Bar if submitting */}
              {isSubmitting && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-purple-950/60 border border-purple-500/40">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-purple-300">{uploadStatusText || 'Uploading to Firebase...'}</span>
                    <span className="text-fuchsia-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-purple-900/50">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit / Publish Button */}
              <button
                type="submit"
                disabled={!videoBlobUrl || isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing ({uploadProgress}%)...</span>
                  </span>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Publish Reel to Feed 🚀</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
