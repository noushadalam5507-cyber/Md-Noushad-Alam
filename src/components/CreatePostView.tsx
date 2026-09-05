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
  CheckCircle2,
  Film,
  Smile,
  Hash,
  Share2,
  DollarSign,
  Zap,
  Layers,
  StopCircle,
  Radio,
  Sliders,
  Award,
  Wallet,
  Wand2,
  Lock,
  Volume2,
  VolumeX,
  Sun,
  ShieldCheck,
  ArrowLeft,
  Image as ImageIcon,
  RotateCcw,
  Sparkle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, PostItem } from '../types';
import { MusicSelectorModal } from './MusicSelectorModal';
import { AIMediaFilterStudio } from './AIMediaFilterStudio';
import { MUSIC_CATALOG, MusicTrackItem } from '../data/musicTracks';
import {
  awardUserAiContentPayout,
  trackAndMonetizeBandwidthUsage,
  saveReelToFirestore,
  createStoryInFirestore
} from '../lib/firestoreService';
import { uploadVideoToFirebase } from '../lib/firebaseStorage';
import { ADMOB_CONFIG } from '../lib/admobConfig';
import { checkUserMonetizationStatus } from '../lib/monetizationRules';
import { soundSynth } from '../utils/audioSynth';
import { ReelItem } from '../data/reelsData';
import {
  requestRuntimeCameraPermissions,
  getImmediateCameraStream,
} from '../utils/nativeCameraPermission';

interface CreatePostViewProps {
  currentUser: UserProfile | null;
  onPostCreated: (newPost: PostItem) => void;
  onNavigateHome: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const CreatePostView: React.FC<CreatePostViewProps> = ({
  currentUser,
  onPostCreated,
  onNavigateHome,
  onNavigateTab,
}) => {
  // Step in the Instagram Creation flow: 'camera' | 'review'
  const [step, setStep] = useState<'camera' | 'review'>('camera');

  // Instagram modes: 'post' | 'reel' | 'story'
  const [createMode, setCreateMode] = useState<'post' | 'reel' | 'story'>('post');

  // Camera stream & recording states
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [beautyFilter, setBeautyFilter] = useState<boolean>(true);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [showScreenFlash, setShowScreenFlash] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');

  // Selected or captured media
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  const [audioTrack, setAudioTrack] = useState<string>('Apna Bana Le · Arijit Singh');
  const [selectedTrack, setSelectedTrack] = useState<MusicTrackItem>(MUSIC_CATALOG[0]);
  const [isPreviewMuted, setIsPreviewMuted] = useState<boolean>(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(true);

  // Review & Meta state
  const [caption, setCaption] = useState<string>('Live from Instagrand Ultra HD Camera! ✨ #Trending #Instagrand #Bollywood');
  const [location, setLocation] = useState<string>('Mumbai · Cyber Studio');
  const [shareDestination, setShareDestination] = useState<'feed' | 'reels' | 'story'>('feed');
  const [captureSubMode, setCaptureSubMode] = useState<'photo' | 'video'>('photo');
  const [isMonetized, setIsMonetized] = useState<boolean>(true);
  const [allowDirectCalls, setAllowDirectCalls] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Modals
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [isAiStudioModalOpen, setIsAiStudioModalOpen] = useState<boolean>(false);

  // AI Quality & Wallet Payout State
  const [aiScanStatus, setAiScanStatus] = useState<'idle' | 'scanning' | 'approved'>('approved');
  const [aiQualityScore, setAiQualityScore] = useState<number>(98);
  const [aiApprovalPayout, setAiApprovalPayout] = useState<number>(2.0);
  const [walletRupees, setWalletRupees] = useState<number>(50.0);

  // DOM References
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const rawMediaBlobRef = useRef<Blob | File | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const myUserId = currentUser?.id || 'usr_self';
  const monetizationStatus = checkUserMonetizationStatus(currentUser);

  // Sample presets if device camera is blocked
  const SAMPLE_PRESETS = [
    {
      label: 'Cyber Fluid',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
    },
    {
      label: 'Retro Neon',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
    },
    {
      label: 'Ultra HD Video',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      type: 'video' as const,
    },
    {
      label: 'Abstract Wave',
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
    },
  ];

  // Instagram Filter Presets
  const filterPresets = [
    { id: 'normal', name: 'Normal', class: 'filter-none' },
    { id: 'clarendon', name: 'Clarendon 🌟', class: 'contrast-125 saturate-135 brightness-105' },
    { id: 'cyber-neon', name: 'Cyber Neon 🔮', class: 'contrast-130 saturate-150 hue-rotate-15' },
    { id: 'golden-hour', name: 'Golden Hour 🌅', class: 'sepia-30 contrast-115 brightness-110 saturate-125' },
    { id: 'juno', name: 'Juno 💎', class: 'contrast-120 saturate-140 brightness-105' },
    { id: 'moon-noir', name: 'Moon B&W 🌌', class: 'grayscale contrast-140 brightness-95' },
    { id: 'tokyo-glow', name: 'Tokyo Glow 🌈', class: 'contrast-120 saturate-170 hue-rotate-45' },
  ];

  // Load wallet
  useEffect(() => {
    const key = `instagrand_user_rupees_${myUserId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setWalletRupees(parseFloat(saved));
    } else {
      localStorage.setItem(key, '50.00');
      setWalletRupees(50.0);
    }
  }, [myUserId]);

  // Adjust payout rate
  useEffect(() => {
    if (mediaType === 'video') {
      setAiApprovalPayout(ADMOB_CONFIG.videoApprovalPayoutRupees || 10.0);
    } else {
      setAiApprovalPayout(ADMOB_CONFIG.photoApprovalPayoutRupees || 2.0);
    }
  }, [mediaType]);

  // Handle camera lifecycle
  useEffect(() => {
    if (step === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, facingMode]);

  // Start Camera with native Capacitor & Web permission verification
  const startCamera = async () => {
    stopCamera();
    setCameraError('');

    try {
      // 1. Request native Android / iOS runtime camera & mic permissions
      await requestRuntimeCameraPermissions();

      // 2. Obtain low-latency video stream immediately
      const isVertical = createMode === 'reel' || createMode === 'story';
      const stream = await getImmediateCameraStream(facingMode, isVertical);
      setCameraStream(stream);

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access denied/error:', err);
      setCameraError('Camera access required. Please allow camera permissions in your device settings or upload media directly from gallery.');
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
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  // Flip Camera
  const handleFlipCamera = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture Single Photo (Instagram Photo Mode)
  const handleCapturePhoto = () => {
    soundSynth.playCameraShutter();

    // Trigger visual screen flash
    setShowScreenFlash(true);
    setTimeout(() => setShowScreenFlash(false), 200);

    if (liveVideoRef.current && cameraStream) {
      try {
        const video = liveVideoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1080;
        canvas.height = video.videoHeight || 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // If front-facing camera, mirror the snapshot
          if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

          setSelectedMediaUrl(dataUrl);
          setMediaType('image');
          setShareDestination(createMode === 'reel' ? 'reels' : 'feed');
          stopCamera();
          setStep('review');
          triggerAiScan('image');
          return;
        }
      } catch (e) {
        console.error('Canvas capture failed, fallback to preset:', e);
      }
    }

    // Fallback if camera is unavailable
    setSelectedMediaUrl(SAMPLE_PRESETS[0].url);
    setMediaType('image');
    setShareDestination(createMode === 'reel' ? 'reels' : 'feed');
    setStep('review');
    triggerAiScan('image');
  };

  // Start Video Recording (Instagram Reel / Video Mode)
  const handleStartRecording = () => {
    if (!cameraStream) {
      // Fallback
      setSelectedMediaUrl(SAMPLE_PRESETS[2].url);
      setMediaType('video');
      setShareDestination('reels');
      setStep('review');
      triggerAiScan('video');
      return;
    }

    recordedChunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(cameraStream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        rawMediaBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setSelectedMediaUrl(url);
        setMediaType('video');
        setShareDestination(createMode === 'post' ? 'feed' : 'reels');
        stopCamera();
        setStep('review');
        triggerAiScan('video');
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('MediaRecorder start error:', err);
      setSelectedMediaUrl(SAMPLE_PRESETS[2].url);
      setMediaType('video');
      setShareDestination('reels');
      setStep('review');
      triggerAiScan('video');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  // Gallery file pick
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      rawMediaBlobRef.current = file;
      const isVideo = file.type.startsWith('video/');
      const objectUrl = URL.createObjectURL(file);
      setSelectedMediaUrl(objectUrl);
      setMediaType(isVideo ? 'video' : 'image');
      setShareDestination(isVideo || createMode === 'reel' ? 'reels' : 'feed');
      stopCamera();
      setStep('review');
      triggerAiScan(isVideo ? 'video' : 'image');
    }
  };

  const triggerAiScan = (type: 'image' | 'video') => {
    setAiScanStatus('scanning');
    setTimeout(() => {
      setAiQualityScore(Math.floor(95 + Math.random() * 5));
      setAiScanStatus('approved');
      setAiApprovalPayout(type === 'video' ? 10.0 : 2.0);
    }, 600);
  };

  // Discard & Retake
  const handleRetake = () => {
    setSelectedMediaUrl('');
    rawMediaBlobRef.current = null;
    setStep('camera');
    setRecordingSeconds(0);
    setIsRecording(false);
  };

  // Hashtag Quick Helper
  const handleAddHashtag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  // Publish Post or Reel
  const handlePublish = async () => {
    if (!selectedMediaUrl) return;

    setIsPublishing(true);
    setUploadProgress(20);

    setTimeout(() => setUploadProgress(60), 300);
    setTimeout(() => setUploadProgress(85), 600);

    try {
      let actualPayoutAwarded = 0;
      if (monetizationStatus.isEligible) {
        const payoutRes = await awardUserAiContentPayout({
          userId: myUserId,
          username: currentUser?.username || 'naushad',
          mediaType: mediaType,
          amountRupees: aiApprovalPayout,
          qualityScore: aiQualityScore,
        });
        actualPayoutAwarded = aiApprovalPayout;
        setWalletRupees(payoutRes.newWalletBalance);
      }

      // Track network bandwidth monetization
      const mbEstimated = mediaType === 'video' ? 38.5 : 8.2;
      trackAndMonetizeBandwidthUsage(mbEstimated, `Upload ${mediaType.toUpperCase()} via Live Instagram Camera`);

      setTimeout(async () => {
        setIsPublishing(false);
        setUploadProgress(100);

        const hashtags = caption.match(/#[a-zA-Z0-9_]+/g) || ['#Instagrand', '#Trending'];

        const isFounder = currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com' || currentUser?.username === 'naushad';
        const authorName = currentUser?.name || (isFounder ? 'Naushad Alam' : 'Instagrand Creator');
        const authorUsername = currentUser?.username || (isFounder ? 'naushad' : 'creator');
        const authorAvatar = currentUser?.avatar || (isFounder
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

        // If shared as a 24-hour Story
        if (shareDestination === 'story') {
          try {
            const newStory = await createStoryInFirestore({
              userId: currentUser?.id || 'usr_self',
              userName: authorName,
              userUsername: authorUsername,
              userAvatar: authorAvatar,
              isVerified: currentUser?.isVerified ?? true,
              hasUnseenStory: true,
              mediaUrl: selectedMediaUrl,
              mediaType: mediaType,
              caption: caption,
              musicTrackTitle: selectedTrack?.title || 'Apna Bana Le',
              musicTrackArtist: selectedTrack?.artist || 'Arijit Singh',
              musicTrackAudioUrl: selectedTrack?.audioUrl,
              musicCategory: (selectedTrack?.category as any) || 'hindi',
              adMobEarnings: '+$0.65 AdMob',
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              likesCount: 1,
              isLiked: true,
              viewsCount: 1,
            });

            window.dispatchEvent(new CustomEvent('instagrand:story-created', { detail: newStory }));
          } catch (storyErr) {
            console.warn('Story firestore sync error:', storyErr);
          }
        }

        // If shared as a Reel, save directly into Firestore reels
        if (shareDestination === 'reels' || (mediaType === 'video' && shareDestination !== 'story')) {
          let cloudVideoUrl = selectedMediaUrl;
          let cloudPosterUrl = mediaType === 'image' ? selectedMediaUrl : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

          if (rawMediaBlobRef.current && mediaType === 'video') {
            try {
              const uploadRes = await uploadVideoToFirebase(rawMediaBlobRef.current, 'reels');
              cloudVideoUrl = uploadRes.downloadUrl;
              if (uploadRes.posterUrl) cloudPosterUrl = uploadRes.posterUrl;
            } catch (err) {
              console.warn('Firebase Storage upload fallback in CreatePostView:', err);
            }
          }

          const newReel: ReelItem = {
            id: `reel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            authorId: currentUser?.id || 'usr-creator',
            authorName,
            authorUsername,
            authorAvatar,
            isVerified: currentUser?.isVerified ?? true,
            videoUrl: cloudVideoUrl,
            posterUrl: cloudPosterUrl,
            caption: caption,
            tags: hashtags,
            audioTrackTitle: selectedTrack?.title || 'Apna Bana Le',
            audioTrackArtist: selectedTrack?.artist || 'Arijit Singh',
            audioTrackUrl: selectedTrack?.audioUrl,
            audioTrackCover: selectedTrack?.coverUrl,
            category: 'hindi',
            likesCount: 1,
            isLiked: true,
            commentsCount: 0,
            comments: [],
            sharesCount: 0,
            viewsCount: 1,
            adMobEarnings: '₹0.15',
          };

          try {
            await saveReelToFirestore(newReel);
            window.dispatchEvent(new CustomEvent('instagrand:reel-created', { detail: newReel }));
          } catch (e) {
            console.warn('Reel firestore sync warning:', e);
          }
        }

        // Always create a corresponding Post in Home Feed
        const newPost: PostItem = {
          id: `post_${Date.now()}`,
          authorId: currentUser?.id || 'usr_self',
          authorName: currentUser?.name || 'Creator',
          authorUsername: currentUser?.username || 'creator',
          authorAvatar: currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'creator'}&backgroundColor=180a30`,
          isVerified: currentUser?.isVerified ?? false,
          mediaType: mediaType,
          mediaUrl: selectedMediaUrl,
          caption: caption,
          hashtags: hashtags,
          location: location,
          audioTrack: audioTrack,
          likesCount: 1,
          isLiked: true,
          commentsCount: 0,
          comments: [],
          sharesCount: 0,
          createdAt: 'Just now',
          isMonetized: isMonetized && monetizationStatus.isEligible,
          earningsEst: monetizationStatus.isEligible ? `₹${(aiApprovalPayout * 10).toFixed(2)}` : undefined,
          isAiApproved: true,
          aiQualityScore: aiQualityScore,
          aiPayoutRupees: actualPayoutAwarded,
          aiScanVerdict: monetizationStatus.isEligible
            ? `AI Verified: Full Ultra HD (${aiQualityScore}%) · Instant ₹${aiApprovalPayout.toFixed(2)} Credited`
            : `AI Verified: Full Ultra HD (${aiQualityScore}%) · Payouts locked (Reach 20k followers)`,
          networkDataConsumedMb: mbEstimated,
        };

        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#e1306c', '#fd1d1d', '#f56040', '#4c68d7', '#ffffff'],
        });

        onPostCreated(newPost);

        // Redirect appropriately
        if (shareDestination === 'reels' && onNavigateTab) {
          onNavigateTab('reels');
        } else {
          onNavigateHome();
        }
      }, 800);
    } catch (err) {
      console.error('Publish error:', err);
      setIsPublishing(false);
    }
  };

  const activeFilterClass = filterPresets.find((f) => f.id === selectedFilter)?.class || '';

  // ----------------------------------------------------
  // SCREEN 1: INSTAGRAM LIVE CAMERA VIEWFINDER
  // ----------------------------------------------------
  if (step === 'camera') {
    return (
      <div id="instagram-camera-studio" className="max-w-md mx-auto min-h-[82vh] flex flex-col justify-between select-none relative animate-fade-in">
        {/* Visual Screen Flash overlay on snapshot */}
        {showScreenFlash && (
          <div className="fixed inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200 opacity-90" />
        )}

        {/* Top Floating Controls Bar (Instagram Style) */}
        <div className="relative z-20 px-4 pt-3 pb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer shadow-lg"
            title="Close / Back to Home"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Music Audio Selector Pill */}
          <button
            type="button"
            onClick={() => setIsMusicModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-fuchsia-500/50 text-white shadow-lg cursor-pointer hover:bg-black/80 transition-all max-w-[200px]"
          >
            <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse shrink-0" />
            <span className="text-xs font-bold truncate text-pink-200">{audioTrack}</span>
          </button>

          {/* Top Right Quick Settings: Flash & Beauty */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFlashActive(!isFlashActive)}
              className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isFlashActive
                  ? 'bg-amber-400/90 border-amber-300 text-black shadow-amber-400/50'
                  : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
              }`}
              title="Toggle Flash"
            >
              <Zap className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setBeautyFilter(!beautyFilter)}
              className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                beautyFilter
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-pink-400 text-white shadow-pink-500/40'
                  : 'bg-black/60 border-white/20 text-zinc-400 hover:bg-black/80'
              }`}
              title="Beauty & Glow Filter"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Camera Viewfinder Card */}
        <div className="relative flex-1 w-full rounded-3xl overflow-hidden bg-black border-2 border-purple-600/40 shadow-[0_0_50px_rgba(168,85,247,0.3)] my-2 flex items-center justify-center">
          {/* Live Video Element */}
          <video
            ref={liveVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-all ${
              facingMode === 'user' ? '-scale-x-100' : ''
            } ${beautyFilter ? 'brightness-105 saturate-115 contrast-105' : ''}`}
          />

          {/* Recording Timer Badge (When Video Recording) */}
          {isRecording && (
            <div className="absolute top-4 inset-x-0 flex justify-center z-30 pointer-events-none">
              <div className="px-4 py-1.5 rounded-full bg-red-600/90 backdrop-blur-md text-white font-mono text-xs font-black flex items-center gap-2 shadow-lg animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 01:00</span>
              </div>
            </div>
          )}

          {/* Camera Error / Permission Fallback Overlay */}
          {cameraError && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
              <div className="w-16 h-16 rounded-3xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Camera Access</h3>
                <p className="text-xs text-zinc-400 max-w-xs">{cameraError}</p>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-pink-600/30 cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo/Video from Gallery</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer transition-all"
                >
                  Retry Camera
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-2">Or Use Studio Preset:</span>
                <div className="flex items-center gap-2">
                  {SAMPLE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedMediaUrl(preset.url);
                        setMediaType(preset.type);
                        setShareDestination(preset.type === 'video' ? 'reels' : 'feed');
                        stopCamera();
                        setStep('review');
                        triggerAiScan(preset.type);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-700/60 text-[10px] font-bold text-purple-200 hover:bg-purple-900 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grid lines overlay for aesthetic composition */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20 border border-white/20">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div />
          </div>
        </div>

        {/* Hidden File Input for Device Gallery */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleGalleryUpload}
          className="hidden"
        />

        {/* Instagram Bottom Shutter & Controls */}
        <div className="relative z-20 px-6 py-3 space-y-4">
          {/* Main Shutter Row: Gallery | Big Shutter | Flip Camera */}
          <div className="flex items-center justify-around">
            {/* Gallery Picker Thumbnail (Bottom Left) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl bg-zinc-900/90 border-2 border-white/30 hover:border-pink-400 overflow-hidden flex flex-col items-center justify-center text-white transition-all cursor-pointer shadow-lg hover:scale-105"
              title="Open Device Gallery"
            >
              <ImageIcon className="w-5 h-5 text-pink-400" />
              <span className="text-[8px] font-bold mt-0.5 text-zinc-300">Gallery</span>
            </button>

            {/* Instagram Shutter Capture Button (Center) */}
            <div className="relative flex items-center justify-center">
              {/* Outer Glowing Gradient Ring */}
              <div
                className={`w-20 h-20 rounded-full p-1 flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-600 animate-pulse scale-110 shadow-[0_0_30px_rgba(239,68,68,0.8)]'
                    : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-[0_0_25px_rgba(236,72,153,0.5)]'
                }`}
              >
                {/* Inner Shutter Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (createMode === 'post') {
                      handleCapturePhoto();
                    } else {
                      // Reel / Video mode
                      if (isRecording) {
                        handleStopRecording();
                      } else {
                        handleStartRecording();
                      }
                    }
                  }}
                  className={`w-full h-full rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-90 ${
                    isRecording
                      ? 'bg-red-600 rounded-2xl scale-75'
                      : 'bg-white hover:bg-zinc-100'
                  }`}
                  title={
                    createMode === 'post'
                      ? 'Tap to Take Photo'
                      : isRecording
                      ? 'Tap to Stop Video'
                      : 'Tap to Record Reel'
                  }
                >
                  {isRecording ? (
                    <div className="w-6 h-6 rounded-md bg-white" />
                  ) : createMode === 'post' ? (
                    <div className="w-14 h-14 rounded-full border-2 border-black/20" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* Flip Camera Button (Bottom Right) */}
            <button
              type="button"
              onClick={handleFlipCamera}
              className="w-12 h-12 rounded-2xl bg-zinc-900/90 border-2 border-white/30 hover:border-cyan-400 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:rotate-180 duration-300"
              title="Flip Camera (Front/Back)"
            >
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              <span className="text-[8px] font-bold mt-0.5 text-zinc-300">Flip</span>
            </button>
          </div>

          {/* Instagram Mode Selector Carousel: POST | REEL | STORY */}
          <div className="flex items-center justify-center gap-6 pt-1">
            {(['post', 'reel', 'story'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setCreateMode(mode);
                  if (mode === 'reel') {
                    setMediaType('video');
                  }
                }}
                className={`text-xs font-black uppercase tracking-widest transition-all cursor-pointer relative py-1 ${
                  createMode === mode
                    ? 'text-white font-extrabold scale-110'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>{mode}</span>
                {createMode === mode && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Music Selector Modal */}
        <MusicSelectorModal
          isOpen={isMusicModalOpen}
          onClose={() => setIsMusicModalOpen(false)}
          onSelectTrack={(track) => {
            setSelectedTrack(track);
            setAudioTrack(`${track.title} · ${track.artist}`);
          }}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN 2: INSTAGRAM REVIEW, FILTER & PUBLISH EDITOR
  // ----------------------------------------------------
  return (
    <div id="instagram-review-editor" className="max-w-xl mx-auto space-y-4 pb-24 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          onClick={handleRetake}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono uppercase text-pink-400 font-bold block">
            {shareDestination === 'reels' ? 'Reel Editor' : 'Post Editor'}
          </span>
          <h2 className="text-base font-black text-white">Review & Filters</h2>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 hover:from-pink-400 hover:to-fuchsia-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-pink-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isPublishing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sharing ({uploadProgress}%)...</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Now</span>
            </>
          )}
        </button>
      </div>

      {/* Main Media Preview Card with Real-time Filters */}
      <div className="rounded-3xl bg-zinc-950 border border-purple-900/60 overflow-hidden shadow-2xl p-3 space-y-3">
        <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-2xl overflow-hidden bg-black border border-purple-500/30 flex items-center justify-center group">
          {mediaType === 'video' ? (
            <video
              ref={previewVideoRef}
              src={selectedMediaUrl}
              autoPlay
              loop
              muted={isPreviewMuted}
              playsInline
              className={`w-full h-full object-cover transition-all ${activeFilterClass}`}
            />
          ) : (
            <img
              src={selectedMediaUrl}
              alt="Review"
              className={`w-full h-full object-cover transition-all ${activeFilterClass}`}
            />
          )}

          {/* AI Quality Approval Live Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-emerald-500/70 text-white shadow-xl">
            {aiScanStatus === 'scanning' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="text-[11px] font-bold text-cyan-300">AI Scanning Clarity...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-300">
                  AI Approved · {aiQualityScore}% Ultra HD (+₹{aiApprovalPayout.toFixed(2)})
                </span>
              </>
            )}
          </div>

          {/* Video Controls (Mute / Play) */}
          {mediaType === 'video' && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewMuted(!isPreviewMuted)}
                className="p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-black transition-all cursor-pointer"
              >
                {isPreviewMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Music Track Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-fuchsia-500/50 text-[11px] font-bold text-fuchsia-200">
            <Music className="w-3 h-3 text-pink-400 animate-spin" />
            <span className="truncate max-w-[180px]">{audioTrack}</span>
          </div>
        </div>

        {/* Instagram Filters Carousel */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-pink-400" />
              <span>Instagram Filters</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAiStudioModalOpen(true)}
              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="w-3 h-3" />
              <span>AI Neural Studio</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {filterPresets.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                    : 'bg-zinc-900 border border-purple-900/50 text-zinc-400 hover:text-purple-200'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Share Destination Selector: Share to Feed vs Reels vs Story */}
        <div className="pt-2 border-t border-purple-900/40 space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">
            Share To:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setShareDestination('feed')}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                shareDestination === 'feed'
                  ? 'bg-gradient-to-r from-purple-950 to-pink-950/60 border-pink-500 shadow-lg shadow-pink-500/20'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ImageIcon className={`w-3.5 h-3.5 ${shareDestination === 'feed' ? 'text-pink-400' : 'text-zinc-400'}`} />
                <span className="text-xs font-bold text-white">Feed Post</span>
              </div>
              <p className="text-[9px] text-zinc-400 mt-1 truncate">Timeline post</p>
            </button>

            <button
              type="button"
              onClick={() => setShareDestination('reels')}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                shareDestination === 'reels'
                  ? 'bg-gradient-to-r from-fuchsia-950 to-pink-950/60 border-fuchsia-400 shadow-lg shadow-fuchsia-500/20'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Film className={`w-3.5 h-3.5 ${shareDestination === 'reels' ? 'text-fuchsia-400' : 'text-zinc-400'}`} />
                <span className="text-xs font-bold text-white">Reel</span>
              </div>
              <p className="text-[9px] text-zinc-400 mt-1 truncate">Viral video stream</p>
            </button>

            <button
              type="button"
              onClick={() => setShareDestination('story')}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                shareDestination === 'story'
                  ? 'bg-gradient-to-r from-amber-950/80 to-fuchsia-950/60 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${shareDestination === 'story' ? 'text-amber-400' : 'text-zinc-400'}`} />
                <span className="text-xs font-bold text-white">24h Story</span>
              </div>
              <p className="text-[9px] text-zinc-400 mt-1 truncate">Top stories tray</p>
            </button>
          </div>
        </div>

        {/* Caption & Hashtag Editor */}
        <div className="space-y-2.5 pt-2 border-t border-purple-900/40">
          <div>
            <label className="text-xs font-bold text-purple-300 block mb-1">Caption</label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write an Instagram caption for your fans..."
              className="w-full p-3 rounded-xl bg-zinc-900/90 border border-purple-900/60 focus:border-pink-400 focus:outline-none text-xs text-white placeholder-zinc-500 leading-relaxed"
            />
          </div>

          {/* Quick Hashtags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['#Reels', '#Instagrand', '#Bollywood', '#Viral', '#Trending', '#Dance', '#Mumbai'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddHashtag(tag)}
                className="px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-800/60 hover:border-pink-500 text-[10px] font-bold text-purple-300 hover:text-white transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Location & Music Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-purple-900/60 text-xs text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-zinc-400 block">Audio Track</label>
                <button
                  type="button"
                  onClick={() => setIsMusicModalOpen(true)}
                  className="text-[10px] font-bold text-pink-400 hover:text-pink-300 cursor-pointer"
                >
                  Change Music +
                </button>
              </div>
              <input
                type="text"
                value={audioTrack}
                onChange={(e) => setAudioTrack(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-purple-900/60 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* AI Payout & Monetization Info Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-purple-950/40 to-zinc-950 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>AI Verified Quality</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-black font-black font-mono">
                  {aiQualityScore}% HDR
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/90">
                {monetizationStatus.isEligible
                  ? `₹${aiApprovalPayout.toFixed(2)} instant wallet credit on publish!`
                  : `Reach 20,000 followers to claim cash payouts`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block font-mono">Wallet</span>
            <span className="text-xs font-black text-emerald-400 font-mono">
              ₹{walletRupees.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Music Selector Modal */}
      <MusicSelectorModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelectTrack={(track) => {
          setSelectedTrack(track);
          setAudioTrack(`${track.title} · ${track.artist}`);
        }}
      />

      {/* AI Photo & Video Filter Studio Modal */}
      {isAiStudioModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-5xl bg-zinc-950 rounded-3xl border-2 border-purple-600/70 p-4 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/50 mb-4">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                <span className="text-sm sm:text-base font-black text-white">
                  Instagrand AI Neural Filter & Video Studio
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAiStudioModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AIMediaFilterStudio
              currentUser={currentUser}
              onClose={() => setIsAiStudioModalOpen(false)}
              onApplyMediaToPost={(mediaUrl, type, filterName) => {
                setSelectedMediaUrl(mediaUrl);
                setMediaType(type);
                setIsAiStudioModalOpen(false);
                setAiApprovalPayout(type === 'video' ? 10.0 : 2.0);
                setAiScanStatus('approved');
                setAiQualityScore(99);
                setCaption((prev) => `${prev} [Enhanced with AI ${filterName}]`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
