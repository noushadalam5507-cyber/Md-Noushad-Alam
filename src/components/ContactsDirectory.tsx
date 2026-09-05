import React, { useState, useEffect } from 'react';
import {
  Users,
  Video,
  Phone,
  Search,
  Crown,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Activity,
  Plus,
  ArrowRight,
  Database,
  UserPlus,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { subscribeToAllUsers, toggleFollowUserInFirestore, subscribeToUserFollowingIds } from '../lib/firestoreService';

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  status: 'online' | 'in-call' | 'away';
  isVerified: boolean;
  lastCallTime?: string;
  followersCount?: number;
}

interface ContactsDirectoryProps {
  currentUser: UserProfile | null;
  onInitiateCall: (targetUsername: string) => void;
  onOpenAuth: () => void;
}

export const ContactsDirectory: React.FC<ContactsDirectoryProps> = ({
  currentUser,
  onInitiateCall,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [firestoreUsers, setFirestoreUsers] = useState<UserProfile[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub = subscribeToAllUsers((users) => {
      setFirestoreUsers(users);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = subscribeToUserFollowingIds(currentUser.id, (ids) => {
      setFollowingIds(ids);
    });
    return () => unsub();
  }, [currentUser?.id]);

  const defaultContacts: Contact[] = [
    {
      id: 'cnt_1',
      name: 'Naushad Alam',
      username: 'naushad',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'NovaGrand Founder · 4K Direct Studio Lead',
      status: 'online',
      isVerified: true,
      lastCallTime: 'Just now',
      followersCount: 20480,
    },
    {
      id: 'cnt_2',
      name: 'Aria Cyber',
      username: 'aria_cyber',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      role: 'Spatial Audio Engineer',
      status: 'online',
      isVerified: true,
      lastCallTime: 'Yesterday',
      followersCount: 14200,
    },
    {
      id: 'cnt_3',
      name: 'Devon Vance',
      username: 'devon_v',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Ultra-HD Video Researcher',
      status: 'online',
      isVerified: false,
      lastCallTime: '3 days ago',
      followersCount: 5120,
    },
    {
      id: 'cnt_4',
      name: 'Elena Rostova',
      username: 'elena_r',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'WebRTC Protocol Contributor',
      status: 'in-call',
      isVerified: true,
      lastCallTime: '1 week ago',
      followersCount: 9800,
    },
    {
      id: 'cnt_5',
      name: 'Zack Thorne',
      username: 'zack_t',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Neon UI Designer',
      status: 'away',
      isVerified: false,
      lastCallTime: '2 weeks ago',
      followersCount: 3400,
    },
  ];

  // Merge Firestore users with default directory
  const mergedContacts: Contact[] = [...defaultContacts];

  firestoreUsers.forEach((fbUser) => {
    const existingIdx = mergedContacts.findIndex(
      (c) => c.username.toLowerCase() === fbUser.username.toLowerCase()
    );
    const mapped: Contact = {
      id: fbUser.id,
      name: fbUser.name,
      username: fbUser.username,
      avatar: fbUser.avatar,
      role: fbUser.customBio || 'Verified VIP Creator',
      status: fbUser.status === 'in-call' ? 'in-call' : 'online',
      isVerified: fbUser.isVerified || fbUser.role === 'admin',
      lastCallTime: 'Live in Firestore',
      followersCount: typeof fbUser.followersCount === 'number' ? fbUser.followersCount : (fbUser.role === 'admin' ? 48920 : 0),
    };
    if (existingIdx >= 0) {
      mergedContacts[existingIdx] = mapped;
    } else {
      mergedContacts.push(mapped);
    }
  });

  const handleToggleFollow = async (contact: Contact) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const isCurrentlyFollowing = followingIds.has(contact.id) || followingIds.has(contact.username);
    const nextFollowing = !isCurrentlyFollowing;

    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (nextFollowing) {
        next.add(contact.id);
        next.add(contact.username);
        confetti({ particleCount: 35, spread: 50 });
      } else {
        next.delete(contact.id);
        next.delete(contact.username);
      }
      return next;
    });

    try {
      await toggleFollowUserInFirestore({
        followerId: currentUser.id,
        followerUsername: currentUser.username,
        targetUserId: contact.id,
        targetUsername: contact.username,
        currentlyFollowing: isCurrentlyFollowing,
      });
    } catch (err) {
      console.warn('Contacts follow error:', err);
    }
  };

  const filtered = mergedContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="contacts-directory-container" className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-950/80 border border-purple-500/30 neon-border-purple">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-xs font-semibold text-fuchsia-300 uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Creators & Verified Directory</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Direct Call Directory</h2>
          <p className="text-xs text-purple-200/70">
            Connect with creators, follow verified accounts, and initiate 1-click live calls.
          </p>
        </div>

        {/* Quick dial target input */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
          <input
            id="search-contacts-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or @handle..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-purple-800/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((contact) => {
          const isFollowing = followingIds.has(contact.id) || followingIds.has(contact.username);
          return (
            <div
              key={contact.id}
              id={`contact-card-${contact.username}`}
              className="p-5 rounded-2xl bg-zinc-950/80 border border-purple-900/40 hover:border-purple-500/60 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-purple-400/50 group-hover:scale-105 transition-transform"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 ${
                        contact.status === 'online'
                          ? 'bg-emerald-400'
                          : contact.status === 'in-call'
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-zinc-500'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white">{contact.name}</h3>
                      {contact.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                      )}
                    </div>
                    <span className="text-xs font-mono text-fuchsia-400">@{contact.username}</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{contact.role}</p>
                  </div>
                </div>

                {contact.username === 'naushad' && (
                  <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-600 text-[10px] font-bold text-fuchsia-300 uppercase">
                    FOUNDER
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-purple-950 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-mono">
                  {typeof contact.followersCount === 'number'
                    ? `${contact.followersCount.toLocaleString()} followers`
                    : 'Creator'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFollow(contact)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isFollowing
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                        : 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-md shadow-fuchsia-600/30'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    id={`call-video-btn-${contact.username}`}
                    type="button"
                    onClick={() => onInitiateCall(contact.username)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Call 4K</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
