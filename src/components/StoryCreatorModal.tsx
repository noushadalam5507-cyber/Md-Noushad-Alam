import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Image as ImageIcon,
  Film,
  Music,
  Plus,
  Send,
  Upload,
  Coins,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  X,
  Volume2,
  Trash2,
  Clock,
  Video
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, StoryItem } from '../types';
import { MusicTrackItem } from '../data/musicTracks';
import { MusicSelectorModal } from './MusicSelectorModal';
import { createStoryInFirestore } from '../lib/firestoreService';

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onStoryPublished: (newStory: StoryItem) => void;
}

export const StoryCreatorModal: React.FC<StoryCreatorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStoryPublished,
}) => {
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80'
  );
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState<string>('Live moments in NovaGrand 💜✨');
  const [selectedMusicTrack, setSelectedMusicTrack] = useState<MusicTrackItem | null>(null);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePresets = [
    {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
      label: 'Cyber Glow',
    },
    {
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
      label: 'Neon Abstract',
    },
    {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
      label: 'Stage Lighting',
    },
    {
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
      type: 'image' as const,
      label: 'Server Matrix',
    },
    {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      type: 'video' as const,
      label: '4K Reel Video',
    },
  ];

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const objectUrl = URL.createObjectURL(file);
      setSelectedMediaUrl(objectUrl);
      setMediaType(isVideo ? 'video' : 'image');
    }
  };

  const handlePublishStory = async () => {
    setIsPublishing(true);

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const created = await createStoryInFirestore({
        userId: currentUser?.id || 'usr_self',
        userName: currentUser?.name || 'You',
        userUsername: currentUser?.username || 'user',
        userAvatar:
          currentUser?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isVerified: currentUser?.isVerified ?? false,
        hasUnseenStory: true,
        mediaUrl: selectedMediaUrl,
        mediaType: mediaType,
        caption: caption,
        musicTrackTitle: selectedMusicTrack?.title,
        musicTrackArtist: selectedMusicTrack?.artist,
        musicTrackAudioUrl: selectedMusicTrack?.audioUrl,
        musicCategory: selectedMusicTrack?.category,
        adMobEarnings: selectedMusicTrack ? '+$0.35 AdMob' : '+$0.15 AdMob',
        adMobImpressions: 1,
        createdAt: now.toISOString(),
        expiresAt: expiresAt,
        likesCount: 0,
        viewsCount: 1,
      });

      // Confetti celebration
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#d946ef', '#10b981', '#f59e0b'],
      });

      onStoryPublished(created);
      onClose();
    } catch (e) {
      console.error('Failed to publish story:', e);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div
        id="story-creator-music-modal"
        className="w-full max-w-md bg-zinc-950 border-2 border-purple-500/60 rounded-3xl p-5 shadow-[0_0_50px_rgba(217,70,239,0.35)] relative overflow-hidden flex flex-col space-y-4 max-h-[92vh]"
      >
        {/* Background Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-purple-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-amber-400 p-0.5 shadow-md shadow-fuchsia-500/30">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Camera className="w-4 h-4 text-fuchsia-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Create 24h Story</h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono font-bold flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-amber-300" />
                  24h Expiry
                </span>
              </div>
              <p className="text-[11px] text-purple-300">Upload Photo or Video · Disappears in 24 hours</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-purple-900/60 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Story Canvas Preview */}
        <div className="relative z-10 aspect-[4/5] w-full rounded-2xl overflow-hidden bg-zinc-900 border-2 border-purple-500/40 shadow-xl flex items-center justify-center group">
          {mediaType === 'video' ? (
            <video
              src={selectedMediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={selectedMediaUrl}
              alt="Story Preview"
              className="w-full h-full object-cover"
            />
          )}

          {/* 24-Hour Expiration pill on top right */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-zinc-950/85 backdrop-blur-md border border-amber-400/50 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-lg">
            <Clock className="w-3 h-3 text-amber-400 animate-spin" />
            <span>24 Hours</span>
          </div>

          {/* Attached Music Pill on Preview */}
          {selectedMusicTrack ? (
            <div className="absolute top-3 left-3 right-24 p-2 rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-fuchsia-500/60 flex items-center justify-between shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={selectedMusicTrack.coverUrl}
                  alt={selectedMusicTrack.title}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-fuchsia-400 animate-bounce" />
                    <span>{selectedMusicTrack.title}</span>
                  </div>
                  <div className="text-[10px] text-purple-300 truncate font-mono">
                    {selectedMusicTrack.artist}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMusicTrack(null)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsMusicModalOpen(true)}
              className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-fuchsia-500/50 text-xs font-bold text-white flex items-center gap-1.5 hover:bg-fuchsia-950 transition-all cursor-pointer shadow-lg hover:scale-105"
            >
              <Music className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
              <span>+ Add Music</span>
            </button>
          )}

          {/* Change Media Floating Button */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-purple-500/50 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-950 transition-all cursor-pointer shadow-lg"
            >
              <Upload className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Upload Photo/Video</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Quick Presets Strip */}
        <div className="relative z-10 grid grid-cols-5 gap-1.5">
          {samplePresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedMediaUrl(p.url);
                setMediaType(p.type);
              }}
              className={`aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative ${
                selectedMediaUrl === p.url
                  ? 'border-fuchsia-400 shadow-[0_0_10px_#d946ef]'
                  : 'border-purple-900/50 opacity-60 hover:opacity-100'
              }`}
            >
              {p.type === 'video' ? (
                <div className="w-full h-full bg-purple-950 flex items-center justify-center text-cyan-300">
                  <Film className="w-4 h-4" />
                </div>
              ) : (
                <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
              )}
              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center py-0.5 truncate">
                {p.label}
              </span>
            </button>
          ))}
        </div>

        {/* Story Caption Input */}
        <div className="relative z-10">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption to your 24-hour story..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-fuchsia-500 focus:outline-none text-xs text-white placeholder-zinc-500"
          />
        </div>

        {/* Share Footer */}
        <div className="relative z-10 flex items-center justify-between pt-2 border-t border-purple-900/50">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>AdMob: <strong className="text-emerald-400">+$0.35/view</strong></span>
          </div>

          <button
            type="button"
            onClick={handlePublishStory}
            disabled={isPublishing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-fuchsia-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Sharing 24h Story...' : 'Share to Story'}</span>
          </button>
        </div>
      </div>

      {/* Sub Music Selection Modal */}
      <MusicSelectorModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelectTrack={(track) => setSelectedMusicTrack(track)}
        selectedTrackId={selectedMusicTrack?.id}
      />
    </div>
  );
};

