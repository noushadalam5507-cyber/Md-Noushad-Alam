import React, { useState, useEffect } from 'react';
import {
  Search,
  Crown,
  Sparkles,
  Video,
  Flame,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  UserPlus,
  UserMinus,
  Grid,
  Play,
  Heart,
  Compass,
  ArrowRight,
  MessageCircle,
  Phone,
  ShieldCheck,
  Share2,
  Users,
  Mail,
  Zap,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, ViewTab } from '../types';
import { subscribeToAllUsers, toggleFollowUserInFirestore, subscribeToUserFollowingIds } from '../lib/firestoreService';

interface ExploreSearchViewProps {
  currentUser: UserProfile | null;
  onNavigateTab: (tab: ViewTab) => void;
  onStartCall: (roomId: string, targetUser?: string) => void;
  onClaimSpecificHandle?: (handle: string) => void;
}

interface SearchableCreator {
  id: string;
  name: string;
  username: string;
  userIdCode: string;
  email: string;
  avatar: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  bio: string;
  activeRoom: string;
  status: 'online' | 'in-call' | 'away' | 'busy';
  isFollowing: boolean;
  recentThumbnails: string[];
}

export const ExploreSearchView: React.FC<ExploreSearchViewProps> = ({
  currentUser,
  onNavigateTab,
  onStartCall,
  onClaimSpecificHandle,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = [
    'All',
    'Creators',
    'Verified Handles',
    '4K Live Rooms',
    'Audio Drops',
    'Reels',
  ];

  // Rich list of searchable accounts with full ID cards and follow states
  const [creatorsList, setCreatorsList] = useState<SearchableCreator[]>([
    {
      id: 'usr_naushad_01',
      name: 'Naushad Alam',
      username: 'naushad',
      userIdCode: 'NOVA-NA-5507',
      email: 'noushadalam5507@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      followersCount: 20480,
      followingCount: 240,
      postsCount: 18,
      isVerified: true,
      bio: 'Lead Architect & NovaGrand Founder · 4K Ultra HD Direct Live Call · Creator & Studio Lead',
      activeRoom: 'novagrand-studio-naushad',
      status: 'online',
      isFollowing: false,
      recentThumbnails: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
      ],
    },
    {
      id: 'usr_elena_02',
      name: 'Elena Vance',
      username: 'elena_neon',
      userIdCode: 'INSTA-NA-772341',
      email: 'elena@cyber.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      followersCount: 14280,
      followingCount: 520,
      postsCount: 42,
      isVerified: true,
      bio: 'Cyberpunk Visual Artist, 3D Motion Designer & Live Hologram Streamer',
      activeRoom: 'studio-elena_neon',
      status: 'online',
      isFollowing: false,
      recentThumbnails: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=80',
      ],
    },
    {
      id: 'usr_marcus_03',
      name: 'Dr. Marcus Lee',
      username: 'marcus_ai',
      userIdCode: 'INSTA-NA-881902',
      email: 'marcus@ai.org',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      followersCount: 6190,
      followingCount: 190,
      postsCount: 29,
      isVerified: true,
      bio: 'Opus Codec & WebRTC Neural Audio Researcher · AI Audio Synthesis',
      activeRoom: 'studio-marcus_ai',
      status: 'in-call',
      isFollowing: false,
      recentThumbnails: [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=300&auto=format&fit=crop&q=80',
      ],
    },
    {
      id: 'usr_sophia_04',
      name: 'Sophia Chen',
      username: 'sophia_vr',
      userIdCode: 'INSTA-NA-334188',
      email: 'sophia@metaverse.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      followersCount: 19840,
      followingCount: 810,
      postsCount: 65,
      isVerified: true,
      bio: 'Virtual Reality host & Sound wave designer · Spatial Audio Producer',
      activeRoom: 'studio-sophia_vr',
      status: 'online',
      isFollowing: true,
      recentThumbnails: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300&auto=format&fit=crop&q=80',
      ],
    },
    {
      id: 'usr_priya_05',
      name: 'Priya Sharma',
      username: 'priya_art',
      userIdCode: 'INSTA-NA-449102',
      email: 'priya@artstudio.in',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      followersCount: 11200,
      followingCount: 430,
      postsCount: 37,
      isVerified: true,
      bio: 'Digital Illustrator & Bollywood Slowed Lo-Fi Creator · Delhi / Mumbai',
      activeRoom: 'studio-priya_art',
      status: 'online',
      isFollowing: false,
      recentThumbnails: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
      ],
    },
    {
      id: 'usr_zayn_06',
      name: 'Zayn Malik Music',
      username: 'zayn_beats',
      userIdCode: 'INSTA-NA-110293',
      email: 'zayn@soundwaves.io',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      followersCount: 28400,
      followingCount: 650,
      postsCount: 88,
      isVerified: true,
      bio: 'Hindi, Urdu & Slowed Reverb Tracks Producer · Instagrand Jukebox Host',
      activeRoom: 'studio-zayn_beats',
      status: 'online',
      isFollowing: false,
      recentThumbnails: [
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
      ],
    },
  ]);

  // Subscribe to live Firestore registered users and merge them into search
  useEffect(() => {
    const unsubscribe = subscribeToAllUsers((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setCreatorsList((prev) => {
          const map = new Map<string, SearchableCreator>();
          prev.forEach((c) => map.set(c.username.toLowerCase(), c));

          firestoreUsers.forEach((u) => {
            const handle = (u.username || 'user').toLowerCase();
            const existing = map.get(handle);
            if (!existing) {
              map.set(handle, {
                id: u.id || `fs_${handle}`,
                name: u.name || handle,
                username: u.username || handle,
                userIdCode: `INSTA-NA-${Math.abs(handle.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) % 900000 + 100000)}`,
                email: u.email || `${handle}@instagrand.com`,
                avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                followersCount: typeof u.followersCount === 'number' ? u.followersCount : (u.role === 'admin' ? 48920 : 0),
                followingCount: typeof u.followingCount === 'number' ? u.followingCount : (u.role === 'admin' ? 342 : 0),
                postsCount: u.role === 'admin' ? 18 : 0,
                isVerified: u.isVerified ?? false,
                bio: u.customBio || `Instagrand VIP Creator · Direct Live Calling enabled`,
                activeRoom: `studio-${handle}`,
                status: u.status || 'online',
                isFollowing: false,
                recentThumbnails: [
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80',
                ],
              });
            } else {
              // Update with real Firestore followers count if available
              if (typeof u.followersCount === 'number') {
                existing.followersCount = u.followersCount;
              }
              if (typeof u.followingCount === 'number') {
                existing.followingCount = u.followingCount;
              }
              existing.isVerified = u.isVerified ?? existing.isVerified;
            }
          });

          return Array.from(map.values());
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Listen to who currentUser is currently following
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = subscribeToUserFollowingIds(currentUser.id, (followingIds) => {
      setCreatorsList((prev) =>
        prev.map((c) => ({
          ...c,
          isFollowing: followingIds.has(c.id) || followingIds.has(c.username),
        }))
      );
    });
    return () => unsub();
  }, [currentUser?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleFollow = async (creatorId: string) => {
    const creator = creatorsList.find((c) => c.id === creatorId);
    if (!creator) return;

    const willFollow = !creator.isFollowing;

    // Optimistic UI update
    setCreatorsList((prev) =>
      prev.map((c) => {
        if (c.id === creatorId) {
          return {
            ...c,
            isFollowing: willFollow,
            followersCount: willFollow ? c.followersCount + 1 : Math.max(0, c.followersCount - 1),
          };
        }
        return c;
      })
    );

    if (willFollow) {
      confetti({ particleCount: 40, spread: 60 });
      showToast(`🎉 Now following @${creator.username}! Follower count updated.`);
    } else {
      showToast(`Unfollowed @${creator.username}.`);
    }

    // Persist to Firestore if user is authenticated
    if (currentUser?.id) {
      try {
        await toggleFollowUserInFirestore({
          followerId: currentUser.id,
          followerUsername: currentUser.username,
          targetUserId: creator.id,
          targetUsername: creator.username,
          currentlyFollowing: !willFollow,
        });
      } catch (err) {
        console.warn('Firestore follow sync note:', err);
      }
    }
  };

  const filteredCreators = creatorsList.filter((c) => {
    const q = searchQuery.toLowerCase().trim().replace(/^@/, '');
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.userIdCode.toLowerCase().includes(q) ||
      c.bio.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const exploreGridMedia = [
    {
      id: 'exp-1',
      type: 'video',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      likes: '12.4k',
      author: 'naushad',
      title: 'Neon Server Nodes 4K',
      isReel: true,
    },
    {
      id: 'exp-2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      likes: '4.8k',
      author: 'elena_neon',
      title: 'Purple Fluidity',
      isReel: false,
    },
    {
      id: 'exp-3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      likes: '9.1k',
      author: 'sophia_vr',
      title: 'Quantum Hardware Waveform',
      isReel: false,
    },
    {
      id: 'exp-4',
      type: 'video',
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
      likes: '18.9k',
      author: 'naushad',
      title: 'Instagrand Studio Broadcast',
      isReel: true,
    },
    {
      id: 'exp-5',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      likes: '3.2k',
      author: 'zayn_beats',
      title: 'Spatial Audio Studio',
      isReel: false,
    },
    {
      id: 'exp-6',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
      likes: '7.6k',
      author: 'marcus_ai',
      title: 'Neural Audio Synthesizer',
      isReel: false,
    },
  ];

  return (
    <div id="instagrand-explore-view" className="max-w-xl mx-auto space-y-5 pb-24 animate-fade-in px-3 sm:px-0">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-cyan-500 text-white font-bold text-xs shadow-2xl animate-bounce border border-purple-300/40 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Bar Input */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="explore-search-input"
            type="text"
            placeholder="Search user by Name, @handle, or Full ID (@naushad, @elena)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-zinc-950/90 border border-purple-900/60 focus:border-fuchsia-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 text-sm shadow-xl transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Suggested Handle Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] text-zinc-500 font-mono shrink-0">Popular:</span>
          {['@naushad', '@elena_neon', '@marcus_ai', '@sophia_vr', '@priya_art', '@zayn_beats'].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setSearchQuery(h)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-purple-950 border border-purple-900/50 hover:border-fuchsia-500/50 text-[11px] text-purple-300 font-mono shrink-0 transition-colors cursor-pointer"
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-zinc-950/80 border border-purple-900/50 text-zinc-400 hover:text-purple-300 hover:bg-zinc-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Spotlight Card: Instagrand N A Official Creator Registry */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/70 via-zinc-950 to-zinc-950 border border-purple-500/40 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-cyan-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>Instagrand N A Verified Registry</span>
          </div>

          <h2 className="text-xl font-black bg-gradient-to-r from-white via-purple-200 to-fuchsia-300 bg-clip-text text-transparent">
            Search, Follow, & Connect with Verified Creators
          </h2>

          <p className="text-xs text-purple-300/80 leading-relaxed max-w-md">
            Directly search any user's ID card, toggle Follow/Unfollow in real time, and start instant 4K WebRTC calling and encrypted messaging.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE USER ID PROFILE CARDS WITH FOLLOW / UNFOLLOW */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Active Verified Creators'}
            </span>
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {filteredCreators.length} {filteredCreators.length === 1 ? 'user found' : 'users found'}
          </span>
        </div>

        {filteredCreators.length === 0 ? (
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-purple-900/40 text-center space-y-2">
            <p className="text-sm font-bold text-white">No user found matching "{searchQuery}"</p>
            <p className="text-xs text-zinc-400">
              Try searching with a different name or handle like @naushad, @elena_neon, @marcus_ai
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                id={`user-profile-card-${creator.username}`}
                className="p-4 sm:p-5 rounded-3xl bg-zinc-950/90 border border-purple-900/50 hover:border-purple-500/60 shadow-xl transition-all space-y-3.5 group"
              >
                {/* Top Section: Avatar, Full Name, Handle, ID Code & Follow Button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Glowing Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 shadow-md">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover border-2 border-zinc-950"
                        />
                      </div>
                      {creator.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-cyan-500 border-2 border-zinc-950 flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                    </div>

                    {/* Name, Username & User ID */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-200 transition-colors">
                          {creator.name}
                        </h3>
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                      </div>
                      <div className="text-xs text-fuchsia-300 font-mono font-semibold">
                        @{creator.username}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>ID: <strong className="text-zinc-300">{creator.userIdCode}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Follow / Unfollow Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleFollow(creator.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-md active:scale-95 ${
                      creator.isFollowing
                        ? 'bg-zinc-900 border border-purple-800/60 text-zinc-300 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-700/60'
                        : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white hover:from-purple-500 hover:to-cyan-400 shadow-purple-600/30'
                    }`}
                  >
                    {creator.isFollowing ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 text-white" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bio Description */}
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {creator.bio}
                </p>

                {/* Counter Stats Bar: Posts, Followers, Following */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-zinc-900/70 border border-purple-950/60 text-center">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white">{creator.postsCount}</div>
                    <div className="text-[10px] text-zinc-400 font-medium">Posts</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-fuchsia-400">
                      {creator.followersCount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-medium">Followers</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white">{creator.followingCount}</div>
                    <div className="text-[10px] text-zinc-400 font-medium">Following</div>
                  </div>
                </div>

                {/* Recent Media Thumbnails Preview */}
                {creator.recentThumbnails.length > 0 && (
                  <div className="flex items-center gap-2 pt-0.5">
                    {creator.recentThumbnails.map((thumb, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 border border-purple-900/40 relative group/thumb cursor-pointer shrink-0"
                        onClick={() => onStartCall(`stream-${creator.username}`, creator.username)}
                      >
                        <img
                          src={thumb}
                          alt="Recent post"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons: Direct Call & Send Message */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onStartCall(creator.activeRoom, creator.username)}
                    className="py-2.5 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-fuchsia-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-cyan-300" />
                    <span>4K Live Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('messages')}
                    className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-900/60 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Direct Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instagram-style 3-Column Explore Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Explore 4K Media & Reels</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {exploreGridMedia.map((media) => (
            <div
              key={media.id}
              onClick={() => onStartCall(`media-${media.author}`, media.author)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-purple-900/40 hover:border-purple-400 transition-all cursor-pointer"
            >
              <img
                src={media.url}
                alt={media.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                    {media.likes}
                  </span>
                  <span className="text-fuchsia-300 font-mono text-[10px]">@{media.author}</span>
                </div>
              </div>

              {media.isReel && (
                <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-zinc-950/70 text-white backdrop-blur-sm">
                  <Play className="w-3 h-3 fill-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
