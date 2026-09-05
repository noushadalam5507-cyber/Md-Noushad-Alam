import React, { useState, useEffect } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Gift,
  Sparkles,
  CheckCircle2,
  Trash2,
  Shield,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCheck
} from 'lucide-react';
import { AppNotificationItem, UserProfile, ViewTab } from '../types';
import {
  subscribeToFirestoreNotifications,
  markNotificationAsReadInFirestore,
  markAllNotificationsAsReadInFirestore,
  deleteNotificationInFirestore
} from '../lib/firestoreService';
import {
  requestFCMNotificationPermission,
  getNotificationPermissionStatus,
  isPushNotificationSupported
} from '../lib/fcmService';
import confetti from 'canvas-confetti';

interface NotificationsViewProps {
  currentUser: UserProfile | null;
  onNavigateTab: (tab: ViewTab) => void;
  onSelectPost?: (postId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  currentUser,
  onNavigateTab,
  onSelectPost,
}) => {
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [pushStatus, setPushStatus] = useState<NotificationPermission>(() =>
    getNotificationPermissionStatus()
  );
  const [isActivatingPush, setIsActivatingPush] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Subscribe to real-time notifications from Firestore
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubscribe = subscribeToFirestoreNotifications(currentUser.id, (list) => {
      // If no notifications exist yet, generate lively initial notifications
      if (list.length === 0) {
        const initialMockNotifs: AppNotificationItem[] = [
          {
            id: 'notif_welcome',
            recipientId: currentUser.id,
            recipientUsername: currentUser.username,
            senderId: 'usr_naushad_primary',
            senderName: 'Naushad Alam (NovaGrand Owner)',
            senderUsername: 'naushad',
            senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            senderIsVerified: true,
            type: 'system',
            title: 'Welcome to NovaGrand Pro!',
            message: 'Your high-eCPM verified 4K Social Studio account is active. Earn coins on reels, stories, and live audio calls.',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'notif_gift_sample',
            recipientId: currentUser.id,
            recipientUsername: currentUser.username,
            senderId: 'usr_sarah',
            senderName: 'Sarah Chen',
            senderUsername: 'sarah_chen',
            senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            senderIsVerified: true,
            type: 'gift',
            title: 'Sent you 💎 Diamond Gift!',
            message: 'Sarah sent you a Diamond Gift on your 4K Reel (+40 Coins added to your balance).',
            giftDetails: {
              giftId: 'diamond',
              giftName: 'Diamond',
              giftIcon: '💎',
              coins: 40,
            },
            isRead: false,
            createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_like_sample',
            recipientId: currentUser.id,
            recipientUsername: currentUser.username,
            senderId: 'usr_marcus',
            senderName: 'Marcus Vance',
            senderUsername: 'marcus_v',
            senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            senderIsVerified: true,
            type: 'like',
            title: 'Liked your 4K Studio Reel',
            message: 'Marcus liked your latest Opus audio feed post.',
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_follow_sample',
            recipientId: currentUser.id,
            recipientUsername: currentUser.username,
            senderId: 'usr_elena',
            senderName: 'Elena Rostova',
            senderUsername: 'elena_sound',
            senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            senderIsVerified: true,
            type: 'follow',
            title: 'Started following you',
            message: 'Elena started following your NovaGrand creator profile.',
            isRead: true,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          },
        ];
        setNotifications(initialMockNotifs);
      } else {
        setNotifications(list);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.id, currentUser?.username]);

  // Handle FCM Push Permission Request
  const handleEnablePush = async () => {
    setIsActivatingPush(true);
    try {
      const res = await requestFCMNotificationPermission(currentUser);
      setPushStatus(res.permission);
      if (res.success) {
        confetti({ particleCount: 40, spread: 60 });
        showToast('🔔 FCM Push Notifications Activated!');
      } else {
        showToast(res.message);
      }
    } catch (e: any) {
      showToast(e.message || 'Error enabling push notifications');
    } finally {
      setIsActivatingPush(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser?.id) return;
    await markAllNotificationsAsReadInFirestore(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('✨ All notifications marked as read');
  };

  const handleItemClick = async (notif: AppNotificationItem) => {
    if (!notif.isRead) {
      await markNotificationAsReadInFirestore(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }

    if (notif.type === 'gift' || notif.type === 'like' || notif.type === 'comment') {
      onNavigateTab('reels');
    } else if (notif.type === 'message') {
      onNavigateTab('messages');
    } else if (notif.type === 'follow') {
      onNavigateTab('search');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotificationInFirestore(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.isRead;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />;
      case 'gift':
        return <Gift className="w-4 h-4 text-amber-400 fill-amber-400/20" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-fuchsia-400" />;
    }
  };

  return (
    <div id="notifications-view-container" className="space-y-4 max-w-2xl mx-auto animate-fade-in">
      {/* Toast message alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-950 via-zinc-900 to-fuchsia-950 border border-purple-500/60 shadow-2xl text-white text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-fuchsia-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-600/30">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-white">
              <Bell className="w-5 h-5 text-fuchsia-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Activity</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[10px] font-black">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono">Real-time Firestore Alerts & Gifting</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mark all read</span>
          </button>
        )}
      </div>

      {/* Push Notification Setup Banner */}
      {pushStatus !== 'granted' && isPushNotificationSupported() && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/90 via-zinc-950 to-indigo-950/90 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Enable Background Push Alerts</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  FCM Push
                </span>
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Receive instant notifications when someone sends gifts, likes your reels, or calls you.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEnablePush}
            disabled={isActivatingPush}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-extrabold shadow-md shadow-cyan-500/20 shrink-0 transition-all cursor-pointer"
          >
            {isActivatingPush ? 'Enabling...' : 'Enable Notifications'}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'gift', label: '🎁 Gifts' },
          { id: 'like', label: '❤️ Likes' },
          { id: 'comment', label: '💬 Comments' },
          { id: 'follow', label: '👥 Follows' },
          { id: 'system', label: '⚡ System' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-950/60 border border-zinc-900 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-purple-950/50 border border-purple-800/40 flex items-center justify-center text-purple-400">
              <Bell className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-white">No notifications in this filter</h3>
            <p className="text-xs text-zinc-500 max-w-xs">
              When other creators like your reels, send virtual coin gifts, or leave comments, they will appear here in real-time.
            </p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`p-3.5 sm:p-4 rounded-3xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                notif.isRead
                  ? 'bg-zinc-950/70 border-zinc-900/80 hover:bg-zinc-900/50'
                  : 'bg-gradient-to-r from-purple-950/40 via-zinc-950/80 to-zinc-950 border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Sender Avatar with Type Badge */}
                <div className="relative shrink-0">
                  <img
                    src={notif.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={notif.senderName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-2xl object-cover border border-purple-500/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-md">
                    {getIconForType(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">
                      {notif.senderName}
                    </span>
                    {notif.senderIsVerified && (
                      <span className="text-[10px] text-cyan-400 font-bold">✓</span>
                    )}
                    <span className="text-[10px] text-zinc-500 font-mono">
                      @{notif.senderUsername}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_6px_#d946ef]" />
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 font-medium leading-tight">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5 text-[10px] text-zinc-500 font-mono">
                    <span>
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {notif.giftDetails && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                        +{notif.giftDetails.coins} Coins
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, notif.id)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
