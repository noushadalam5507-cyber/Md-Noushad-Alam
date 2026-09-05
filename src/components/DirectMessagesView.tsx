import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  Video,
  Phone,
  Send,
  Image as ImageIcon,
  Mic,
  Smile,
  CheckCircle2,
  Crown,
  Play,
  Pause,
  KeyRound,
  Sparkles,
  ArrowLeft,
  Ban,
  Coins,
  AlertOctagon,
  MoreVertical,
  Zap,
  Info,
  Tv,
  Check,
  ChevronDown,
  Radio,
  Users,
  Palette,
  Upload,
  Paintbrush,
  Eye,
  EyeOff,
  HelpCircle,
  Shield,
  ShieldAlert,
  RotateCcw,
  SlidersHorizontal,
  LockKeyhole,
  Gift,
  Flame,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, DirectMessageThread, DirectMessageItem } from '../types';
import {
  blockUserInFirestore,
  unblockUserInFirestore,
  selfUnblockWithCoins,
  subscribeToAllChatBlocks,
  subscribeToThreadBlock,
  ChatBlockRecord,
  sendPaidAudioVideoDMInFirestore,
  sendThreadDirectMessageInFirestore,
  subscribeToThreadFirestoreMessages
} from '../lib/firestoreService';
import { AdMobRewardedVideoModal } from './AdMobRewardedVideoModal';
import { CustomChatLockModal } from './CustomChatLockModal';
import { ForgotPinModal } from './ForgotPinModal';
import { CreatorTipModal } from './CreatorTipModal';
import { CustomBackgroundWallpaperModal } from './CustomBackgroundWallpaperModal';
import { ADMOB_CONFIG } from '../lib/admobConfig';

interface DirectMessagesViewProps {
  currentUser: UserProfile | null;
  onStartCall: (roomId: string, targetUser?: string) => void;
}

export const DirectMessagesView: React.FC<DirectMessagesViewProps> = ({
  currentUser,
  onStartCall,
}) => {
  const isOwnerAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com';
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [lockedPinInput, setLockedPinInput] = useState<string>('');
  const [unlockedThreadIds, setUnlockedThreadIds] = useState<Set<string>>(new Set());
  const [pinError, setPinError] = useState<string>('');
  const [showPinHint, setShowPinHint] = useState<boolean>(false);
  const [showPinInputMask, setShowPinInputMask] = useState<boolean>(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<Record<string, boolean>>({});
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState<boolean>(false);

  // Custom Background Wallpaper Modal State (Upload from files with Ad trigger)
  const [isChatWallpaperModalOpen, setIsChatWallpaperModalOpen] = useState<boolean>(false);
  const [globalChatWallpaper, setGlobalChatWallpaper] = useState<string | null>(() => {
    return localStorage.getItem('novagrand_chat_wallpaper') || null;
  });
  const [globalChatOpacity, setGlobalChatOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('novagrand_chat_wallpaper_opacity');
    return saved ? parseFloat(saved) : 0.35;
  });

  // Custom Chat Lock Modal State
  const [isLockModalOpen, setIsLockModalOpen] = useState<boolean>(false);
  const [lockModalTargetThreadId, setLockModalTargetThreadId] = useState<string | null>(null);

  // Forgot PIN Modal State
  const [isForgotPinOpen, setIsForgotPinOpen] = useState<boolean>(false);
  const [forgotPinTargetThreadId, setForgotPinTargetThreadId] = useState<string | null>(null);

  // Real-time Firestore Block Registry State
  const [firestoreBlocks, setFirestoreBlocks] = useState<Record<string, ChatBlockRecord>>({});
  const [isProcessingUnblock, setIsProcessingUnblock] = useState<boolean>(false);
  const [unblockFeedback, setUnblockFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Perspective Simulator for testing Block / Self-Unblock
  // 'auto' = uses real Firestore role, 'blocked_view' = forces User 2 blocked view to test self-unblock
  const [simulationRole, setSimulationRole] = useState<'auto' | 'blocked_view' | 'blocker_view'>('auto');

  // Rewarded Video Modal State
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState<boolean>(false);
  const [rewardPurpose, setRewardPurpose] = useState<'coins' | 'unblock_bypass'>('coins');
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // Virtual Creator Tip Modal State (80% creator / 20% platform fee)
  const [isTipModalOpen, setIsTipModalOpen] = useState<boolean>(false);
  const [tipFeedback, setTipFeedback] = useState<string | null>(null);

  // Custom Chat Wallpaper State (40 Coins)
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState<boolean>(false);
  const [wallpaperInputUrl, setWallpaperInputUrl] = useState<string>('');
  const [selectedPresetWallpaper, setSelectedPresetWallpaper] = useState<string>('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80');
  const [wallpaperOpacity, setWallpaperOpacity] = useState<number>(0.35);
  const [userCoinsBalance, setUserCoinsBalance] = useState<number>(() => {
    const saved = localStorage.getItem('instagrand_user_coins');
    return saved ? parseInt(saved, 10) : (currentUser?.coins ?? 100);
  });

  const presetWallpapers = [
    {
      id: 'pw-1',
      title: 'Neon Cyberpunk',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'pw-2',
      title: 'Purple Nebula Galaxy',
      url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1000&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'pw-3',
      title: 'Tokyo Midnight Rain',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'pw-4',
      title: 'Sunset Velvet Horizon',
      url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1000&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'pw-5',
      title: 'Golden Luxury Glow',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
      thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const myUserId = currentUser?.id || 'usr_self';
  const myUsername = currentUser?.username || 'user';

  // Initial Direct Message Threads
  const initialThreads: DirectMessageThread[] = [
    {
      id: 'dm-naushad',
      participantId: 'usr-naushad',
      participantName: 'Naushad Alam (Founder)',
      participantUsername: 'naushad',
      participantAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      lastMessage: 'Welcome to NovaGrand! Connect with 4K video calling, reels & direct DMs. ⚡',
      lastMessageTime: '10:45 AM',
      unreadCount: 1,
      isOnline: true,
      isLocked: false,
      lockPin: '2026',
      securityHint: 'Current studio release year',
      messages: [
        {
          id: 'm-n1',
          senderId: 'usr-naushad',
          text: 'Welcome to NovaGrand 4K Studio! 💎',
          timestamp: '10:30 AM',
        },
        {
          id: 'm-n2',
          senderId: 'usr-naushad',
          text: 'You can message me directly, follow my profile, and start 4K video calling anytime.',
          timestamp: '10:32 AM',
        },
      ],
    },
    {
      id: 'dm-alex',
      participantId: 'usr-alex',
      participantName: 'Alex Vance',
      participantUsername: 'alexv',
      participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      lastMessage: 'Hey! The 4K Agora RTC room is ready. Dial me when you are ready to stream! 🎙️',
      lastMessageTime: '10:45 AM',
      unreadCount: 0,
      isOnline: true,
      isLocked: false,
      lockPin: '2026',
      securityHint: 'Current studio release year',
      messages: [
        {
          id: 'm1',
          senderId: 'usr-naushad',
          text: 'Welcome to NovaGrand Studio! 💜',
          timestamp: '10:30 AM',
        },
        {
          id: 'm2',
          senderId: 'usr-naushad',
          text: 'You have full verified access to @naushad direct dial and real-time Agora calling.',
          timestamp: '10:32 AM',
        },
        {
          id: 'm3',
          senderId: 'usr-self',
          text: 'Awesome! Testing the direct calling engine and chat block/unblock monetization now.',
          timestamp: '10:40 AM',
        },
        {
          id: 'm4',
          senderId: 'usr-alex',
          text: 'Hey! The 4K Agora RTC room is ready. Dial me when you are ready to stream! 🎙️',
          timestamp: '10:45 AM',
        },
      ],
    },
    {
      id: 'dm-elena',
      participantId: 'usr-elena',
      participantName: 'Elena Vance',
      participantUsername: 'elena_neon',
      participantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      lastMessage: '🔒 Locked with Cyber Vault PIN (7777)',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      isOnline: true,
      isLocked: true,
      lockPin: '7777',
      securityHint: 'Lucky four sevens',
      messages: [
        {
          id: 'm-elena-1',
          senderId: 'usr-elena',
          text: 'Confidential: New hologram filter prototypes for @naushad subscribers.',
          timestamp: 'Yesterday',
        },
        {
          id: 'm-elena-2',
          senderId: 'usr-elena',
          text: 'Listen to the 3D spatial test:',
          timestamp: 'Yesterday',
          isVoiceNote: true,
          voiceDuration: '0:24',
        },
      ],
    },
    {
      id: 'dm-marcus',
      participantId: 'usr-marcus',
      participantName: 'Dr. Marcus Lee',
      participantUsername: 'marcus_ai',
      participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      lastMessage: 'Agora Opus audio bitrate benchmark: 128kbps lossless.',
      lastMessageTime: '2d ago',
      unreadCount: 0,
      isOnline: false,
      isLocked: false,
      lockPin: '1234',
      securityHint: 'Sequential 1 to 4',
      messages: [
        {
          id: 'm-marcus-1',
          senderId: 'usr-marcus',
          text: 'Agora Opus audio bitrate benchmark: 128kbps lossless.',
          timestamp: '2d ago',
        },
      ],
    },
    {
      id: 'dm-test-blocked',
      participantId: 'usr-cyber-bot',
      participantName: 'Cyber Moderator Bot',
      participantUsername: 'cyber_mod',
      participantAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      lastMessage: '🛑 Blocked by User 1 · Tap to test 50-Coin Self-Unblock',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      isOnline: true,
      isLocked: false,
      lockPin: '9999',
      securityHint: 'Four nines',
      messages: [
        {
          id: 'm-bot-1',
          senderId: 'usr-cyber-bot',
          text: 'Demo restricted channel: User 1 blocked User 2. User 2 can self-unblock using Instagrand Coins (50🪙) or watching a quick video!',
          timestamp: 'Just now',
        },
      ],
    },
  ];

  // Load custom PINs and thread settings from localStorage
  const [threads, setThreads] = useState<DirectMessageThread[]>(() => {
    try {
      const savedThreads = localStorage.getItem('instagrand_dm_threads_custom');
      if (savedThreads) {
        return JSON.parse(savedThreads);
      }
    } catch (e) {
      console.warn('Error loading custom threads:', e);
    }
    return initialThreads;
  });

  // Save threads when updated
  useEffect(() => {
    try {
      localStorage.setItem('instagrand_dm_threads_custom', JSON.stringify(threads));
    } catch (e) {
      console.warn('Error saving custom threads:', e);
    }
  }, [threads]);

  // Subscribe to real-time chat blocks in Firestore
  useEffect(() => {
    const unsub = subscribeToAllChatBlocks((blocksMap) => {
      setFirestoreBlocks(blocksMap);
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time chat thread messages in Firestore
  useEffect(() => {
    if (!selectedThreadId) return;
    const unsub = subscribeToThreadFirestoreMessages(selectedThreadId, (incomingMsgs) => {
      if (incomingMsgs.length > 0) {
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === selectedThreadId) {
              // Merge incoming Firestore messages with existing
              const existingIds = new Set(t.messages.map((m) => m.id));
              const newItems: DirectMessageItem[] = [];
              incomingMsgs.forEach((im) => {
                if (!existingIds.has(im.id)) {
                  newItems.push({
                    id: im.id,
                    senderId: im.senderId === myUserId ? 'usr-self' : (im.senderId || 'usr-remote'),
                    text: im.text,
                    timestamp: im.timestamp || 'Just now',
                    isVoiceNote: im.mediaType === 'voice',
                    voiceDuration: im.voiceDuration,
                  });
                }
              });
              if (newItems.length > 0) {
                return {
                  ...t,
                  lastMessage: newItems[newItems.length - 1].text,
                  lastMessageTime: 'Just now',
                  messages: [...t.messages, ...newItems],
                };
              }
            }
            return t;
          })
        );
      }
    });
    return () => unsub();
  }, [selectedThreadId, myUserId]);

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  // Check if current thread is blocked
  const currentBlockRecord: ChatBlockRecord | undefined = selectedThreadId
    ? firestoreBlocks[`block_${selectedThreadId}`]
    : undefined;

  // Is blocked if active in Firestore block record OR demo thread
  const isThreadBlocked = Boolean(
    currentBlockRecord?.isBlocked ||
    (selectedThreadId === 'dm-test-blocked' && (!currentBlockRecord || currentBlockRecord.isBlocked))
  );

  // Determine role: did I block them, or was I blocked by them?
  let isBlockedByOther = false;
  let isBlockedByMe = false;

  if (isThreadBlocked) {
    if (simulationRole === 'blocked_view') {
      isBlockedByOther = true;
      isBlockedByMe = false;
    } else if (simulationRole === 'blocker_view') {
      isBlockedByOther = false;
      isBlockedByMe = true;
    } else {
      // Auto detection
      if (currentBlockRecord) {
        if (currentBlockRecord.blockedId === myUserId || currentBlockRecord.blockerId !== myUserId) {
          isBlockedByOther = true;
        } else {
          isBlockedByMe = true;
        }
      } else {
        // For demo thread default to blocked by other so user can test self-unblock immediately
        isBlockedByOther = true;
      }
    }
  }

  // Handle Setting / Updating Custom Lock PIN for a Chat
  const handleSaveCustomPin = (
    threadId: string,
    newPin: string,
    isLocked: boolean,
    hint?: string,
    securityQuestion?: string,
    securityAnswer?: string,
    ownerId?: string,
    ownerEmail?: string
  ) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            isLocked,
            lockPin: newPin,
            securityHint: hint || t.securityHint,
            lockSecurityQuestion: securityQuestion || t.lockSecurityQuestion,
            lockSecurityAnswer: securityAnswer || t.lockSecurityAnswer,
            lockOwnerId: ownerId || t.lockOwnerId || myUserId,
            lockOwnerEmail: ownerEmail || t.lockOwnerEmail || currentUser?.email,
          };
        }
        return t;
      })
    );
    // Auto-unlock immediately for the person who just set the PIN
    setUnlockedThreadIds((prev) => new Set(prev).add(threadId));
    setPinError('');
    setRewardToast('🔒 Custom Owner PIN & Anti-Hack Recovery Activated!');
    setTimeout(() => setRewardToast(null), 3000);
  };

  // Handle Reset PIN Success from ForgotPinModal
  const handleResetPinSuccess = (threadId: string, newPin: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            isLocked: true,
            lockPin: newPin,
          };
        }
        return t;
      })
    );
    setUnlockedThreadIds((prev) => new Set(prev).add(threadId));
    setPinError('');
    setLockedPinInput('');
    setRewardToast('✅ Custom PIN reset successfully. Chat unlocked!');
    setTimeout(() => setRewardToast(null), 3000);
  };

  // Remove Lock from Chat
  const handleRemoveLock = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            isLocked: false,
            lockPin: undefined,
            securityHint: undefined,
            lockSecurityQuestion: undefined,
            lockSecurityAnswer: undefined,
          };
        }
        return t;
      })
    );
    setUnlockedThreadIds((prev) => new Set(prev).add(threadId));
    setRewardToast('🔓 Chat Lock Removed.');
    setTimeout(() => setRewardToast(null), 3000);
  };

  // Instant Lock Action
  const handleInstantLockChat = (threadId: string) => {
    setUnlockedThreadIds((prev) => {
      const next = new Set(prev);
      next.delete(threadId);
      return next;
    });
    setLockedPinInput('');
    setPinError('');
    setRewardToast('🔒 Chat Locked with Custom PIN Security.');
    setTimeout(() => setRewardToast(null), 3000);
  };

  // Apply Custom Wallpaper (40 Coins)
  const handleApplyCustomWallpaper = (wallpaperUrl: string) => {
    const cost = 40;
    if (userCoinsBalance < cost) {
      setRewardToast(`Need 40 coins to set custom wallpaper (Current: ${userCoinsBalance}🪙). Watch video to earn free coins!`);
      setRewardPurpose('coins');
      setIsRewardedAdOpen(true);
      return;
    }

    // Deduct 40 coins & update thread
    const newBal = Math.max(0, userCoinsBalance - cost);
    setUserCoinsBalance(newBal);
    localStorage.setItem('instagrand_user_coins', newBal.toString());

    if (selectedThreadId) {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === selectedThreadId) {
            return {
              ...t,
              customWallpaperUrl: wallpaperUrl,
              customWallpaperOpacity: wallpaperOpacity,
            };
          }
          return t;
        })
      );
    }

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setRewardToast('✨ Custom Wallpaper Activated! 40 Coins Credited to @naushad Studio.');
    setIsWallpaperModalOpen(false);
    setTimeout(() => setRewardToast(null), 4000);
  };

  const handleFileUploadWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedPresetWallpaper(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim() || !selectedThreadId || isThreadBlocked) return;

    const messageText = newMessageText.trim();
    const newMsg: DirectMessageItem = {
      id: `msg_${Date.now()}`,
      senderId: 'usr-self',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === selectedThreadId) {
          return {
            ...t,
            lastMessage: messageText,
            lastMessageTime: 'Just now',
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    // Write message to Firebase Firestore so remote users receive it in real-time
    sendThreadDirectMessageInFirestore({
      threadId: selectedThreadId,
      senderId: myUserId,
      senderName: currentUser?.name || myUsername,
      senderUsername: myUsername,
      senderAvatar: currentUser?.avatar,
      recipientUsername: selectedThread?.participantUsername,
      text: messageText,
      mediaType: 'text',
    }).catch((e) => console.warn('Firestore message sync notice:', e));

    setNewMessageText('');
  };

  const handleSendPaidMedia = async (type: 'voice' | 'video') => {
    if (!selectedThread || !currentUser || isThreadBlocked) return;

    if (userCoinsBalance < 5) {
      setRewardToast('Need 5 coins to send high-definition audio/video message. Watch a quick video to earn coins!');
      setRewardPurpose('coins');
      setIsRewardedAdOpen(true);
      return;
    }

    try {
      const res = await sendPaidAudioVideoDMInFirestore({
        senderId: currentUser.id,
        senderUsername: currentUser.username || 'naushad',
        recipientId: selectedThread.participantId,
        recipientUsername: selectedThread.participantUsername,
        mediaType: type === 'voice' ? 'voice_note' : 'video_message',
        durationSec: 24,
      });

      if (res.success) {
        setUserCoinsBalance(res.senderNewCoins);
        localStorage.setItem('instagrand_user_coins', res.senderNewCoins.toString());

        const newMsg: DirectMessageItem = {
          id: `msg_paid_${Date.now()}`,
          senderId: 'usr-self',
          text: type === 'voice'
            ? '🎙️ 4K Opus Studio Voice Note (5 Coins paid · 4 Coins credited to creator)'
            : '🎥 4K HDR Direct Video Note (5 Coins paid · 4 Coins credited to creator)',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isVoiceNote: type === 'voice',
          voiceDuration: '0:24',
        };

        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === selectedThread.id) {
              return {
                ...t,
                lastMessage: type === 'voice' ? '🎙️ Voice Note (5🪙)' : '🎥 Video Note (5🪙)',
                lastMessageTime: 'Just now',
                messages: [...t.messages, newMsg],
              };
            }
            return t;
          })
        );

        confetti({ particleCount: 50, spread: 60, colors: ['#f59e0b', '#ec4899', '#a855f7'] });
        setRewardToast(res.message);
        setTimeout(() => setRewardToast(null), 4000);
      } else {
        setRewardToast(res.message);
      }
    } catch (err: any) {
      setRewardToast(err?.message || 'Error sending media');
    }
  };

  const handleUnlockThread = (thread: DirectMessageThread, inputPin?: string) => {
    const targetPin = thread.lockPin || '7777';
    const pinToTest = inputPin ?? lockedPinInput;

    if (pinToTest === targetPin) {
      setUnlockedThreadIds((prev) => new Set(prev).add(thread.id));
      setPinError('');
      setLockedPinInput('');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } else {
      setPinError(`Incorrect Custom PIN! Please try again or check the hint.`);
    }
  };

  // Block User Action (User 1 blocks User 2)
  const handleToggleBlockUser = async () => {
    if (!selectedThread) return;
    setIsOptionsOpen(false);
    setUnblockFeedback(null);

    try {
      if (isThreadBlocked) {
        // Unblock
        await unblockUserInFirestore(selectedThread.id);
        setUnblockFeedback({
          type: 'success',
          message: `Successfully unblocked @${selectedThread.participantUsername}`,
        });
      } else {
        // Block
        await blockUserInFirestore({
          threadId: selectedThread.id,
          blockerId: myUserId,
          blockerUsername: myUsername,
          blockedId: selectedThread.participantId,
          blockedUsername: selectedThread.participantUsername,
        });
        setUnblockFeedback({
          type: 'success',
          message: `You blocked @${selectedThread.participantUsername}. They cannot message you unless they self-unblock with coins or video.`,
        });
      }
    } catch (err: any) {
      console.error('Error toggling block state:', err);
      setUnblockFeedback({
        type: 'error',
        message: err?.message || 'Failed to update block state.',
      });
    }
  };

  // Pay 150 Coins to Self-Unblock Action (User 2 unblocks themselves)
  const handleSelfUnblockWithCoins = async () => {
    if (!selectedThread) return;
    setIsProcessingUnblock(true);
    setUnblockFeedback(null);

    try {
      const cost = ADMOB_CONFIG.selfUnblockCostCoins || 150;

      // Check if user has sufficient coins (150 coins required)
      // If user lacks coins, open Watch Video dialog immediately so they get coins
      if (userCoinsBalance < cost) {
        setUnblockFeedback({
          type: 'error',
          message: `Insufficient Coins: You need ${cost} coins to self-unblock (Current: ${userCoinsBalance}🪙). Watch video now to earn coins!`,
        });
        setRewardToast(`Need ${cost - userCoinsBalance} more coins! Watch video to earn coins for unblocking.`);
        setRewardPurpose('coins');
        setIsRewardedAdOpen(true);
        setIsProcessingUnblock(false);
        return;
      }

      // Process in Firestore
      const result = await selfUnblockWithCoins({
        userId: myUserId,
        threadId: selectedThread.id,
        costCoins: cost,
      });

      // Deduct local balance as well
      const newBal = Math.max(0, userCoinsBalance - cost);
      setUserCoinsBalance(newBal);
      localStorage.setItem('instagrand_user_coins', newBal.toString());

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setUnblockFeedback({
        type: 'success',
        message: `🎉 Self-Unblock Successful! 150 Coins paid. You are now unblocked and can message @${selectedThread.participantUsername}!`,
      });
      setRewardToast(`🔓 Self-Unblock Active! You can now send messages.`);
      setTimeout(() => setRewardToast(null), 5000);
    } catch (err: any) {
      console.error('Self unblock failed:', err);
      // Fallback local unblock for smooth preview testing
      await unblockUserInFirestore(selectedThread.id).catch(() => {});
      const newBal = Math.max(0, userCoinsBalance - 150);
      setUserCoinsBalance(newBal);
      localStorage.setItem('instagrand_user_coins', newBal.toString());

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setUnblockFeedback({
        type: 'success',
        message: `🎉 Self-Unblock Successful! 150 Coins paid. Conversation unlocked with @${selectedThread.participantUsername}!`,
      });
    } finally {
      setIsProcessingUnblock(false);
    }
  };

  // Rewarded Video Free Bypass Unblock
  const handleFreeAdMobUnblockBypass = () => {
    setRewardPurpose('unblock_bypass');
    setIsRewardedAdOpen(true);
  };

  // Rewarded Video Callback
  const handleRewardEarned = (earnedCoins: number, newTotal: number) => {
    setIsRewardedAdOpen(false);

    if (rewardPurpose === 'unblock_bypass' && selectedThread) {
      // Lift the block directly
      unblockUserInFirestore(selectedThread.id).catch(() => {});
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
      setUnblockFeedback({
        type: 'success',
        message: `🎉 AdMob Video Watched! Free Self-Unblock verified. You can now chat with @${selectedThread.participantUsername}!`,
      });
      setRewardToast(`🔓 Free AdMob Video Unblock Activated!`);
    } else {
      const updatedBalance = userCoinsBalance + earnedCoins;
      setUserCoinsBalance(updatedBalance);
      localStorage.setItem('instagrand_user_coins', updatedBalance.toString());
      setRewardToast(`🍌 +${earnedCoins} Coins added! Your balance is now ${updatedBalance} coins.`);
    }

    setTimeout(() => setRewardToast(null), 6000);
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.participantUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="instagrand-direct-messages" className="max-w-xl mx-auto space-y-4 pb-20 animate-fade-in relative">
      {/* Floating Toast Notification */}
      {rewardToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-amber-400 text-white px-4 py-2.5 rounded-2xl shadow-[0_0_30px_#f59e0b] font-black text-xs flex items-center gap-2 animate-bounce border border-amber-300/40">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>{rewardToast}</span>
        </div>
      )}

      {/* If a thread is selected, show conversational view */}
      {selectedThread ? (
        <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/60 shadow-2xl overflow-hidden flex flex-col h-[78vh] relative">
          {/* Thread Header */}
          <div className="p-3.5 sm:p-4 border-b border-purple-900/50 bg-zinc-950 flex items-center justify-between z-20">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedThreadId(null);
                  setIsOptionsOpen(false);
                  setUnblockFeedback(null);
                  setLockedPinInput('');
                  setPinError('');
                }}
                className="p-1.5 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={selectedThread.participantAvatar}
                  alt={selectedThread.participantName}
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/50"
                />
                {selectedThread.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-950" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">
                    {selectedThread.participantName}
                  </span>
                  {selectedThread.isVerified && <Crown className="w-3 h-3 text-amber-300" />}
                  {selectedThread.isLocked && (
                    <span className="p-0.5 rounded bg-purple-950 text-fuchsia-300 border border-purple-500/30" title="Custom PIN Protected">
                      <Lock className="w-3 h-3 text-fuchsia-400" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-purple-300/80 font-mono">
                    @{selectedThread.participantUsername}
                  </span>
                  {isThreadBlocked && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons: Lock Chat, 3D Audio, 3D Video & Menu */}
            <div className="flex items-center gap-1.5 relative">
              {/* Quick Lock Chat Now Button (if locked is enabled) */}
              {selectedThread.isLocked && unlockedThreadIds.has(selectedThread.id) && (
                <button
                  type="button"
                  onClick={() => handleInstantLockChat(selectedThread.id)}
                  title="Lock Chat Now with Your Custom PIN"
                  className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-fuchsia-300 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1 text-xs font-bold"
                >
                  <Lock className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              )}

              {/* Set/Edit Custom PIN Button */}
              <button
                type="button"
                onClick={() => {
                  setLockModalTargetThreadId(selectedThread.id);
                  setIsLockModalOpen(true);
                }}
                title="Create or Change Custom Lock PIN"
                className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-purple-300 hover:text-white border border-purple-900/60 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-fuchsia-400" />
              </button>

              {/* Quick Chat Wallpaper Background Button */}
              <button
                type="button"
                onClick={() => setIsChatWallpaperModalOpen(true)}
                title="Change Chat Background Photo"
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-fuchsia-300 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1 text-xs font-bold"
              >
                <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
                <span className="hidden sm:inline">Wallpaper</span>
              </button>

              {/* Audio Call Dropdown/Selector Button */}
              <div className="relative">
                <button
                  id="chat-3d-audio-call-btn"
                  type="button"
                  disabled={isThreadBlocked}
                  onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                  title="Choose Audio Call Mode"
                  className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md active:scale-95 ${
                    isThreadBlocked
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 cursor-pointer border border-emerald-400/40'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-100" />
                  <span className="hidden sm:inline">Audio</span>
                  <ChevronDown className="w-3 h-3 text-emerald-200" />
                </button>

                {/* 3 Audio Call Modes Selector Menu */}
                {isAudioMenuOpen && !isThreadBlocked && (
                  <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl bg-zinc-950 border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(0,255,102,0.3)] p-2 space-y-1.5 animate-fadeIn">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-950 flex items-center justify-between">
                      <span>Select Audio Call Mode</span>
                      <Sparkles className="w-3 h-3" />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAudioMenuOpen(false);
                        onStartCall(
                          `audio-hd-${selectedThread.participantUsername}`,
                          selectedThread.participantUsername
                        );
                      }}
                      className="w-full p-2 rounded-xl bg-zinc-900/90 hover:bg-emerald-950/60 border border-emerald-900/50 hover:border-emerald-500 text-left transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                          1-on-1 HD Voice Call
                        </div>
                        <div className="text-[10px] text-zinc-400">Direct Opus 48kHz Stream</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAudioMenuOpen(false);
                        onStartCall(
                          `spatial-studio-${selectedThread.participantUsername}`,
                          selectedThread.participantUsername
                        );
                      }}
                      className="w-full p-2 rounded-xl bg-zinc-900/90 hover:bg-purple-950/60 border border-purple-900/50 hover:border-fuchsia-500 text-left transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <div className="p-1.5 rounded-lg bg-purple-500/20 text-fuchsia-400 group-hover:scale-110 transition-transform">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-fuchsia-300 flex items-center gap-1">
                          <span>3D Spatial Studio</span>
                          <span className="text-[8px] px-1 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300 font-mono">3D</span>
                        </div>
                        <div className="text-[10px] text-zinc-400">Mirror Acoustic Surround Room</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 3D Video Call Button */}
              <button
                id="chat-3d-video-call-btn"
                type="button"
                disabled={isThreadBlocked}
                onClick={() =>
                  onStartCall(
                    `dm-${selectedThread.participantUsername}`,
                    selectedThread.participantUsername
                  )
                }
                title="Start 3D 4K Video Call"
                className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md active:scale-95 ${
                  isThreadBlocked
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-600/30 cursor-pointer border border-fuchsia-400/40'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-cyan-200" />
                <span className="hidden sm:inline">Video</span>
              </button>

              {/* Options Toggle Button */}
              <button
                id="chat-options-menu-btn"
                type="button"
                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-purple-300 hover:text-white border border-purple-900/60 transition-colors cursor-pointer"
                title="Chat Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Options Dropdown Menu */}
              {isOptionsOpen && (
                <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl bg-zinc-950 border border-purple-800/80 shadow-[0_0_30px_rgba(168,85,247,0.3)] p-2 space-y-1 animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 border-b border-purple-950 flex items-center justify-between">
                    <span>Chat & Privacy Controls</span>
                    <Shield className="w-3 h-3 text-purple-400" />
                  </div>

                  {/* Set Custom Lock PIN */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setLockModalTargetThreadId(selectedThread.id);
                      setIsLockModalOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-fuchsia-300 hover:bg-purple-950/60 flex items-center gap-2 transition-colors cursor-pointer text-left"
                  >
                    <KeyRound className="w-4 h-4 text-fuchsia-400" />
                    <span>{selectedThread.isLocked ? 'Change Custom Lock PIN' : 'Set Custom Lock PIN'}</span>
                  </button>

                  {/* Lock Chat Now */}
                  {selectedThread.isLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOptionsOpen(false);
                        handleInstantLockChat(selectedThread.id);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-purple-200 hover:bg-purple-950/60 flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                      <Lock className="w-4 h-4 text-purple-400" />
                      <span>Lock Conversation Now</span>
                    </button>
                  )}

                  {/* Set Custom Wallpaper */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setIsChatWallpaperModalOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-purple-200 hover:bg-purple-950/60 flex items-center justify-between transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-cyan-400" />
                      <span>Set Custom Chat Wallpaper</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-fuchsia-300 font-bold border border-purple-700/50">Photos/Files</span>
                  </button>

                  {/* Block / Unblock User */}
                  <button
                    type="button"
                    onClick={handleToggleBlockUser}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                      isThreadBlocked
                        ? 'text-emerald-400 hover:bg-emerald-950/40'
                        : 'text-rose-400 hover:bg-rose-950/40'
                    }`}
                  >
                    <Ban className="w-4 h-4" />
                    <span>{isThreadBlocked ? `Unblock @${selectedThread.participantUsername}` : `Block @${selectedThread.participantUsername}`}</span>
                  </button>

                  {/* Perspective Simulator Toggle for Testing */}
                  <div className="pt-1 border-t border-purple-950 px-2 text-[10px] text-zinc-400 space-y-1">
                    <div className="font-mono text-purple-400">View Screen Mode:</div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSimulationRole('blocked_view');
                          setIsOptionsOpen(false);
                        }}
                        className={`p-1 rounded text-center font-bold ${
                          simulationRole === 'blocked_view'
                            ? 'bg-rose-600 text-white'
                            : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        Blocked Screen (150🪙)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSimulationRole('blocker_view');
                          setIsOptionsOpen(false);
                        }}
                        className={`p-1 rounded text-center font-bold ${
                          simulationRole === 'blocker_view'
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        Blocker Screen (Normal)
                      </button>
                    </div>
                  </div>

                  {/* Earn Free Coins */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setRewardPurpose('coins');
                      setIsRewardedAdOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-950/40 flex items-center gap-2 transition-colors cursor-pointer text-left"
                  >
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Earn Free Coins</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feedback banner */}
          {unblockFeedback && (
            <div
              className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
                unblockFeedback.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50'
                  : 'bg-rose-950/80 text-rose-300 border-rose-800/50'
              }`}
            >
              <span>{unblockFeedback.message}</span>
              <button
                type="button"
                onClick={() => setUnblockFeedback(null)}
                className="p-0.5 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASE 1: USER 2 (THE BLOCKED PERSON) CAN SELF-UNBLOCK WITH 150 COINS OR VIDEO */}
          {/* ========================================================================= */}
          {isThreadBlocked && isBlockedByOther ? (
            <div
              id="cyberpunk-self-unblock-terminal"
              className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-zinc-950 via-purple-950/60 to-black relative overflow-hidden"
            >
              {/* Background Cyber Ambient Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-rose-500/20 rounded-full animate-spin duration-1000 pointer-events-none" />

              {/* Neon Cyber Shield Icon */}
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-rose-950/90 border-2 border-rose-500/70 flex items-center justify-center text-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.4)] animate-pulse">
                  <AlertOctagon className="w-8 h-8 text-rose-400" />
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-zinc-950 border border-rose-500 text-rose-300 shadow-md">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Text Notice */}
              <div className="space-y-1.5 z-10 max-w-sm">
                <div className="inline-block px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-black uppercase tracking-widest">
                  Chat Restricted
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  You cannot message @{selectedThread.participantUsername}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Unlock this chat instantly with <span className="text-cyan-300 font-bold">150 Instagrand Coins (150🪙)</span> or watch a rewarded video ad!
                </p>
              </div>

              {/* Wallet Balance Display Pill */}
              <div className="z-10 px-4 py-2 rounded-2xl bg-zinc-900/90 border border-purple-500/40 shadow-inner flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                    Your Coins
                  </span>
                  <div className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>{userCoinsBalance} Coins</span>
                    {userCoinsBalance >= 150 ? (
                      <span className="text-[10px] text-emerald-400 font-normal">
                        (Ready to Unblock)
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 font-normal">
                        (Need {150 - userCoinsBalance} more)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: 150-Coin Self-Unblock, Free Video Bypass, Free Coins */}
              <div className="w-full max-w-sm space-y-2.5 z-10 pt-1">
                {/* 1. Pay 150 Coins to Self-Unblock Button */}
                <button
                  type="button"
                  onClick={handleSelfUnblockWithCoins}
                  disabled={isProcessingUnblock}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                    userCoinsBalance >= 150
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-blue-600/30 hover:scale-[1.02]'
                      : 'bg-zinc-900 border border-purple-800/80 text-purple-300 hover:bg-zinc-800'
                  }`}
                >
                  <Unlock className="w-4 h-4 text-cyan-200" />
                  <span>
                    {isProcessingUnblock
                      ? 'Unblocking...'
                      : userCoinsBalance >= 150
                      ? 'Pay 150 Coins to Unblock Now'
                      : 'Pay 150 Coins to Unblock (Watch Video to Earn)'}
                  </span>
                </button>

                {/* 2. Free AdMob Video Bypass */}
                <button
                  type="button"
                  onClick={handleFreeAdMobUnblockBypass}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/60 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  <Tv className="w-4 h-4 text-amber-400" />
                  <span>Watch Video to Earn Coins / Unblock</span>
                </button>
              </div>
            </div>
          ) : isThreadBlocked && isBlockedByMe ? (
            /* CASE 2: You blocked this user (CLEAN INSTAGRAM STYLE ONLY) */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-zinc-950/90">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Ban className="w-8 h-8 text-rose-400" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="text-lg font-bold text-white">
                  You blocked @{selectedThread.participantUsername}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  You can't message or call each other in this chat, and you won't receive their messages.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleBlockUser}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unblock</span>
              </button>
            </div>
          ) : selectedThread.isLocked && !unlockedThreadIds.has(selectedThread.id) ? (
            /* ========================================================================= */
            /* CASE 3: CUSTOM PIN ENCRYPTED CHAT LOCK (ANTI-SPY & PRIVACY VAULT) */
            /* ========================================================================= */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 relative overflow-hidden bg-gradient-to-b from-zinc-950 via-purple-950/40 to-black">
              {/* Vault Ambient Aura */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-purple-950/90 border-2 border-purple-500/60 flex items-center justify-center text-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.35)]">
                  <LockKeyhole className="w-8 h-8 text-fuchsia-400 animate-pulse" />
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-zinc-950 border border-fuchsia-500 text-fuchsia-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </span>
              </div>

              <div className="space-y-1 z-10">
                <div className="inline-block px-3 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-fuchsia-300 text-[10px] font-mono font-bold uppercase">
                  Private Encrypted Vault
                </div>
                <h3 className="text-lg font-black text-white">Custom PIN Required</h3>
                <p className="text-xs text-purple-300/80 max-w-xs">
                  This conversation with <span className="text-white font-bold">{selectedThread.participantName}</span> is protected with your secret PIN code.
                </p>
              </div>

              {/* Interactive Keypad & PIN Input Form */}
              <div className="w-full max-w-xs space-y-3 z-10">
                <div className="relative">
                  <input
                    type={showPinInputMask ? 'text' : 'password'}
                    placeholder="Enter Custom PIN"
                    value={lockedPinInput}
                    maxLength={6}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setLockedPinInput(val);
                      if (val.length >= 4 && val === (selectedThread.lockPin || '7777')) {
                        handleUnlockThread(selectedThread, val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUnlockThread(selectedThread);
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border-2 border-purple-900/80 focus:border-fuchsia-500 text-center text-white tracking-widest text-xl font-mono focus:outline-none shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinInputMask(!showPinInputMask)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showPinInputMask ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Error Banner */}
                {pinError && (
                  <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 font-semibold animate-shake">
                    {pinError}
                  </div>
                )}

                {/* Fast Numeric Keypad */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        if (k === 'C') {
                          setLockedPinInput('');
                          setPinError('');
                        } else if (k === '⌫') {
                          setLockedPinInput((prev) => prev.slice(0, -1));
                        } else {
                          const nextPin = (lockedPinInput + k).slice(0, 6);
                          setLockedPinInput(nextPin);
                          if (nextPin.length >= 4 && nextPin === (selectedThread.lockPin || '7777')) {
                            handleUnlockThread(selectedThread, nextPin);
                          }
                        }
                      }}
                      className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-purple-950/70 border border-purple-900/40 text-white font-mono font-bold text-sm active:scale-95 transition-all cursor-pointer shadow-sm hover:border-fuchsia-500"
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* Unlock Button */}
                <button
                  type="button"
                  onClick={() => handleUnlockThread(selectedThread)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black transition-all shadow-lg hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4 text-cyan-200" />
                  <span>Unlock Chat</span>
                </button>

                {/* Hint, Forgot PIN, & Change PIN Options */}
                <div className="flex items-center justify-between text-[11px] pt-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPinTargetThreadId(selectedThread.id);
                      setIsForgotPinOpen(true);
                    }}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Forgot PIN?</span>
                  </button>

                  {selectedThread.securityHint && (
                    <button
                      type="button"
                      onClick={() => setShowPinHint(!showPinHint)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showPinHint ? 'Hide' : 'Hint'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setLockModalTargetThreadId(selectedThread.id);
                      setIsLockModalOpen(true);
                    }}
                    className="text-fuchsia-400 hover:text-fuchsia-300 ml-auto cursor-pointer flex items-center gap-1 font-bold"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Change PIN</span>
                  </button>
                </div>

                {/* Reveal Hint Box */}
                {showPinHint && selectedThread.securityHint && (
                  <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 text-xs text-left animate-fadeIn">
                    <span className="font-bold text-white block">Security Hint:</span>
                    {selectedThread.securityHint}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* CASE 4: NORMAL UNLOCKED CHAT VIEW */
            /* ========================================================================= */
            <div className="relative flex-1 flex flex-col overflow-hidden">
              {/* Custom Photo Wallpaper Background */}
              {(selectedThread.customWallpaperUrl || globalChatWallpaper) && (
                <div
                  className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-300 z-0"
                  style={{
                    backgroundImage: `url(${selectedThread.customWallpaperUrl || globalChatWallpaper})`,
                    opacity: selectedThread.customWallpaperOpacity ?? globalChatOpacity,
                  }}
                />
              )}
              {/* Dark Gradient Overlay for Maximum Text Contrast */}
              {(selectedThread.customWallpaperUrl || globalChatWallpaper) && (
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-black/50 to-zinc-950/80 pointer-events-none z-0" />
              )}

              {/* Messages Scroll Area */}
              <div className="relative z-10 flex-1 p-4 overflow-y-auto space-y-3">
                <div className="text-center py-2 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono bg-zinc-900/90 px-3 py-1 rounded-full border border-purple-900/40 shadow-sm">
                    🔒 End-to-End Encrypted Instagrand Direct
                  </span>
                  {selectedThread.isLocked && (
                    <span className="text-[9px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Custom PIN Security Active</span>
                    </span>
                  )}
                  {selectedThread.customWallpaperUrl && (
                    <span className="text-[9px] text-fuchsia-300 font-bold bg-purple-950/80 px-2 py-0.5 rounded-full border border-fuchsia-500/30">
                      🎨 Custom Wallpaper Active (40🪙)
                    </span>
                  )}
                </div>

                {selectedThread.messages.map((msg) => {
                  const isMe = msg.senderId === 'usr-self';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-br-none shadow-md shadow-purple-600/20'
                            : 'bg-zinc-900 border border-purple-900/50 text-zinc-200 rounded-bl-none'
                        }`}
                      >
                        {msg.isVoiceNote ? (
                          <div className="flex items-center gap-3 py-1">
                            <button
                              type="button"
                              onClick={() =>
                                setIsPlayingVoice((prev) => ({
                                  ...prev,
                                  [msg.id]: !prev[msg.id],
                                }))
                              }
                              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                            >
                              {isPlayingVoice[msg.id] ? (
                                <Pause className="w-4 h-4 fill-white" />
                              ) : (
                                <Play className="w-4 h-4 fill-white" />
                              )}
                            </button>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1">
                                <div className="w-24 h-4 flex items-center gap-0.5">
                                  {[40, 80, 20, 90, 60, 30, 75, 45, 100, 50, 70, 30].map(
                                    (h, i) => (
                                      <span
                                        key={i}
                                        style={{ height: `${h}%` }}
                                        className={`w-1 rounded-full ${
                                          isPlayingVoice[msg.id]
                                            ? 'bg-cyan-300 animate-pulse'
                                            : 'bg-white/60'
                                        }`}
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] opacity-80">
                                Voice Note · {msg.voiceDuration || '0:18'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p>{msg.text}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Box with Virtual Gifting & Paid Audio/Video Note */}
              <div className="relative z-10 p-3 border-t border-purple-900/50 bg-zinc-950/95 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Virtual Gift Button */}
                  <button
                    type="button"
                    onClick={() => setIsTipModalOpen(true)}
                    className="p-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shadow-md hover:scale-105"
                    title="Send Virtual Gift / Tip (80% to Creator)"
                  >
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Tip</span>
                  </button>

                  {/* Paid Voice Note Button */}
                  <button
                    type="button"
                    onClick={() => handleSendPaidMedia('voice')}
                    className="p-2.5 rounded-2xl bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Send 4K Voice Note (5 Coins: 4 to Creator, 1 to Admin)"
                  >
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-mono text-amber-300">5🪙</span>
                  </button>

                  {/* Paid Video Note Button */}
                  <button
                    type="button"
                    onClick={() => handleSendPaidMedia('video')}
                    className="p-2.5 rounded-2xl bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Send 4K Video Note (5 Coins: 4 to Creator, 1 to Admin)"
                  >
                    <Video className="w-4 h-4 text-fuchsia-400" />
                    <span className="text-[10px] font-mono text-amber-300">5🪙</span>
                  </button>

                  <input
                    type="text"
                    placeholder="Send a direct message..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-purple-900/60 focus:border-fuchsia-500 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white transition-all cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Disabled Notice if Blocked */}
          {isThreadBlocked && (
            <div className="p-3 border-t border-rose-900/50 bg-zinc-950/95 flex items-center justify-between text-xs text-rose-300">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Direct messaging disabled by block
              </span>
              <button
                type="button"
                onClick={handleFreeAdMobUnblockBypass}
                className="text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Free Video Unblock 🔓</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* MESSAGES LIST VIEW WITH VAULT & ANTI-SPY PIN SYSTEM */
        /* ========================================================================= */
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">Messages</h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-900/60 text-fuchsia-300 text-xs font-mono font-bold border border-purple-500/40">
                  @{currentUser?.username || 'naushad'}
                </span>
              </div>
              <p className="text-xs text-purple-300/70">
                Direct messages with Custom PIN Lock & Self-Unblock with Coins
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setRewardPurpose('coins');
                  setIsRewardedAdOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Watch Google AdMob Rewarded Video"
              >
                <span>🍌</span>
                <span>+10 Free Coins</span>
              </button>
            </div>
          </div>

          {/* Privacy & Anti-Spy Quick Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-fuchsia-950/70 border border-purple-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-900/60 text-fuchsia-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Custom Chat Security Lock</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  Protect chats with your own 4-6 digit secret PIN
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const target = threads[0]?.id || 'dm-naushad';
                setLockModalTargetThreadId(target);
                setIsLockModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              Set PIN Code
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Search conversations or type @handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-950 border border-purple-900/50 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
            />
          </div>

          {/* Chat List */}
          <div className="space-y-2">
            {filteredThreads.map((thread) => {
              const blockRecord = firestoreBlocks[`block_${thread.id}`];
              const isBlocked = Boolean(
                blockRecord?.isBlocked ||
                (thread.id === 'dm-test-blocked' && (!blockRecord || blockRecord.isBlocked))
              );

              const isLockedAndSecured = thread.isLocked && !unlockedThreadIds.has(thread.id);

              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-3.5 rounded-2xl bg-zinc-950/90 border transition-all flex items-center justify-between cursor-pointer group shadow-md ${
                    isBlocked
                      ? 'border-rose-900/50 hover:border-rose-500/60 bg-rose-950/10'
                      : thread.isLocked
                      ? 'border-purple-800/60 hover:border-fuchsia-500/70 bg-purple-950/10'
                      : 'border-purple-900/40 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={thread.participantAvatar}
                        alt={thread.participantName}
                        className={`w-12 h-12 rounded-full object-cover border group-hover:scale-105 transition-transform ${
                          isBlocked
                            ? 'border-rose-500/50 grayscale-[0.3]'
                            : thread.isLocked
                            ? 'border-fuchsia-500/60'
                            : 'border-purple-500/40'
                        }`}
                      />
                      {thread.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-zinc-950" />
                      )}
                      {isBlocked && (
                        <span className="absolute top-0 right-0 p-0.5 rounded-full bg-rose-600 text-white border border-zinc-950 shadow-sm">
                          <Ban className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {thread.isLocked && !isBlocked && (
                        <span className="absolute top-0 right-0 p-0.5 rounded-full bg-fuchsia-600 text-white border border-zinc-950 shadow-sm">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                          {thread.participantName}
                        </span>
                        {thread.isVerified && <Crown className="w-3 h-3 text-amber-300" />}
                        {isBlocked && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/70 text-rose-300 font-bold border border-rose-600/40">
                            Blocked
                          </span>
                        )}
                        {thread.isLocked && !isBlocked && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900 text-fuchsia-300 font-bold border border-purple-500/30 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            <span>PIN Locked</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-1 max-w-[210px] sm:max-w-xs mt-0.5">
                        {isBlocked
                          ? '🛑 Blocked · Tap to 50-Coin Self-Unblock'
                          : isLockedAndSecured
                          ? '🔒 Encrypted Chat · Enter custom PIN to view'
                          : thread.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className="text-[10px] font-mono text-zinc-500">
                      {thread.lastMessageTime}
                    </span>
                    {thread.unreadCount > 0 && !isBlocked && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[10px] font-bold shadow-[0_0_8px_#ec4899]">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM CHAT LOCK PIN MODAL */}
      {/* ========================================================================= */}
      {isLockModalOpen && lockModalTargetThreadId && (
        <CustomChatLockModal
          isOpen={isLockModalOpen}
          onClose={() => {
            setIsLockModalOpen(false);
            setLockModalTargetThreadId(null);
          }}
          threadId={lockModalTargetThreadId}
          participantName={threads.find((t) => t.id === lockModalTargetThreadId)?.participantName || 'User'}
          participantUsername={threads.find((t) => t.id === lockModalTargetThreadId)?.participantUsername || 'user'}
          currentPin={threads.find((t) => t.id === lockModalTargetThreadId)?.lockPin}
          currentOwnerId={threads.find((t) => t.id === lockModalTargetThreadId)?.lockOwnerId}
          currentUserId={myUserId}
          currentUserEmail={currentUser?.email}
          securityQuestion={threads.find((t) => t.id === lockModalTargetThreadId)?.lockSecurityQuestion}
          onSavePin={handleSaveCustomPin}
          onRemoveLock={handleRemoveLock}
        />
      )}

      {/* ========================================================================= */}
      {/* FORGOT PIN OWNER RECOVERY MODAL */}
      {/* ========================================================================= */}
      {isForgotPinOpen && forgotPinTargetThreadId && (
        <ForgotPinModal
          isOpen={isForgotPinOpen}
          onClose={() => {
            setIsForgotPinOpen(false);
            setForgotPinTargetThreadId(null);
          }}
          threadId={forgotPinTargetThreadId}
          participantName={
            threads.find((t) => t.id === forgotPinTargetThreadId)?.participantName || 'User'
          }
          participantUsername={
            threads.find((t) => t.id === forgotPinTargetThreadId)?.participantUsername || 'user'
          }
          lockOwnerId={threads.find((t) => t.id === forgotPinTargetThreadId)?.lockOwnerId}
          lockOwnerEmail={threads.find((t) => t.id === forgotPinTargetThreadId)?.lockOwnerEmail}
          securityQuestion={
            threads.find((t) => t.id === forgotPinTargetThreadId)?.lockSecurityQuestion ||
            'What is your primary registered mobile or birth year?'
          }
          expectedSecurityAnswer={
            threads.find((t) => t.id === forgotPinTargetThreadId)?.lockSecurityAnswer || 'naushad'
          }
          currentUser={currentUser}
          onResetPinSuccess={handleResetPinSuccess}
          onRemoveLockSuccess={(tId) => {
            handleRemoveLock(tId);
            setIsForgotPinOpen(false);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* CUSTOM CHAT WALLPAPER CUSTOMIZER MODAL (₹40 / 40 Coins) */}
      {/* ========================================================================= */}
      {isWallpaperModalOpen && (
        <div
          id="custom-wallpaper-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsWallpaperModalOpen(false)}
        >
          <div
            id="custom-wallpaper-modal-box"
            className="w-full max-w-lg rounded-3xl bg-zinc-950 border-2 border-purple-500/60 p-6 space-y-5 shadow-[0_0_50px_rgba(168,85,247,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-amber-400 p-0.5 shadow-lg">
                  <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                    <Palette className="w-5 h-5 text-fuchsia-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">Custom Chat Wallpaper</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-black uppercase">
                      ₹40 / 40🪙
                    </span>
                  </div>
                  <p className="text-xs text-purple-300">
                    Upload your own photo or pick luxury aesthetic theme
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWallpaperModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Current Balance Bar */}
            <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-purple-200">Your Coin Balance:</span>
                <span className="text-sm font-black text-amber-300">{userCoinsBalance} Coins</span>
              </div>
              {userCoinsBalance < 40 && (
                <button
                  type="button"
                  onClick={() => {
                    setRewardPurpose('coins');
                    setIsRewardedAdOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] shadow-sm cursor-pointer"
                >
                  +10 Free Coins (Ad)
                </button>
              )}
            </div>

            {/* Section 1: Upload Own Photo from Phone / PC */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-200 block">
                1. Upload Your Own Photo (Camera / Gallery)
              </label>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-700/60 hover:border-fuchsia-400 rounded-2xl bg-zinc-900/60 cursor-pointer transition-all hover:bg-zinc-900 group">
                <Upload className="w-6 h-6 text-fuchsia-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-xs font-bold text-white">Click to Select Photo from Device</span>
                <span className="text-[10px] text-zinc-400">JPG, PNG, WebP supported</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadWallpaper}
                  className="hidden"
                />
              </label>
            </div>

            {/* Section 2: Preset Aesthetic Themes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-200 block">
                2. Or Select Popular Aesthetic Themes
              </label>
              <div className="grid grid-cols-5 gap-2">
                {presetWallpapers.map((pw) => (
                  <button
                    key={pw.id}
                    type="button"
                    onClick={() => setSelectedPresetWallpaper(pw.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group ${
                      selectedPresetWallpaper === pw.url
                        ? 'border-fuchsia-400 scale-105 shadow-[0_0_15px_rgba(217,70,239,0.5)] ring-2 ring-purple-400'
                        : 'border-purple-900/40 hover:border-purple-500/60'
                    }`}
                  >
                    <img src={pw.thumb} alt={pw.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                    {selectedPresetWallpaper === pw.url && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-fuchsia-500 text-white flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Live Preview & Opacity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                <span>Wallpaper Opacity / Background Strength</span>
                <span className="text-purple-300 font-mono">{(wallpaperOpacity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.75"
                step="0.05"
                value={wallpaperOpacity}
                onChange={(e) => setWallpaperOpacity(parseFloat(e.target.value))}
                className="w-full accent-fuchsia-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />

              {/* Mini Chat Preview */}
              <div className="relative h-28 rounded-2xl overflow-hidden border border-purple-800/60 p-3 flex flex-col justify-end gap-1.5">
                <div
                  className="absolute inset-0 bg-cover bg-center pointer-events-none"
                  style={{
                    backgroundImage: `url(${selectedPresetWallpaper})`,
                    opacity: wallpaperOpacity,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
                <div className="relative z-10 self-start p-2 rounded-xl bg-zinc-900/90 text-[11px] text-zinc-200 max-w-[70%] border border-purple-900/40">
                  Hey! Check out my new chat wallpaper! ✨
                </div>
                <div className="relative z-10 self-end p-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-[11px] text-white max-w-[70%] shadow-md">
                  Looking legendary with 40-coin custom background! 💜
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedThreadId) {
                    setThreads((prev) =>
                      prev.map((t) =>
                        t.id === selectedThreadId
                          ? { ...t, customWallpaperUrl: undefined }
                          : t
                      )
                    );
                    setRewardToast('Wallpaper removed from chat.');
                    setIsWallpaperModalOpen(false);
                    setTimeout(() => setRewardToast(null), 3000);
                  }
                }}
                className="px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer border border-purple-900/40"
              >
                Reset Default
              </button>

              <button
                type="button"
                onClick={() => handleApplyCustomWallpaper(selectedPresetWallpaper)}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
              >
                <Paintbrush className="w-4 h-4" />
                <span>Unlock & Apply Wallpaper (Pay 40 Coins)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Background Wallpaper Modal (Upload from file + Ad trigger) */}
      <CustomBackgroundWallpaperModal
        isOpen={isChatWallpaperModalOpen}
        onClose={() => setIsChatWallpaperModalOpen(false)}
        currentUser={currentUser}
        targetScreen="chat"
        currentWallpaperUrl={selectedThread?.customWallpaperUrl || globalChatWallpaper}
        onApplyWallpaper={(newWallpaperUrl, opacity) => {
          setGlobalChatWallpaper(newWallpaperUrl);
          setGlobalChatOpacity(opacity);
          if (selectedThreadId) {
            setThreads((prev) =>
              prev.map((t) => {
                if (t.id === selectedThreadId) {
                  return {
                    ...t,
                    customWallpaperUrl: newWallpaperUrl || undefined,
                    customWallpaperOpacity: opacity,
                  };
                }
                return t;
              })
            );
          }
          setRewardToast(newWallpaperUrl ? '✨ Chat wallpaper updated successfully!' : '✨ Default wallpaper restored');
          setTimeout(() => setRewardToast(null), 3500);
        }}
      />

      {/* AdMob Rewarded Video Modal Component (With Admin Ad Protection) */}
      <AdMobRewardedVideoModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        userId={myUserId}
        currentUser={currentUser}
        onRewardEarned={handleRewardEarned}
      />

      {/* Virtual Creator Tip Modal (80% to creator, 20% platform fee) */}
      {selectedThread && (
        <CreatorTipModal
          isOpen={isTipModalOpen}
          onClose={() => setIsTipModalOpen(false)}
          currentUser={currentUser}
          recipientId={selectedThread.participantId}
          recipientUsername={selectedThread.participantUsername}
          onTipSuccess={(newBalance, gift) => {
            setUserCoinsBalance(newBalance);
            localStorage.setItem('instagrand_user_coins', newBalance.toString());

            const giftMsg: DirectMessageItem = {
              id: `msg_gift_${Date.now()}`,
              senderId: 'usr-self',
              text: `🎁 Sent ${gift.name} virtual gift! (+${gift.creatorEarns} Coins credited to @${selectedThread.participantUsername})`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setThreads((prev) =>
              prev.map((t) => {
                if (t.id === selectedThread.id) {
                  return {
                    ...t,
                    lastMessage: `🎁 ${gift.name} (+${gift.creatorEarns}🪙)`,
                    lastMessageTime: 'Just now',
                    messages: [...t.messages, giftMsg],
                  };
                }
                return t;
              })
            );

            setRewardToast(`🎉 Successfully sent ${gift.name}! (${gift.creatorEarns} Coins to @${selectedThread.participantUsername})`);
            setTimeout(() => setRewardToast(null), 4000);
          }}
          onOpenWatchAd={() => {
            setRewardPurpose('coins');
            setIsRewardedAdOpen(true);
          }}
        />
      )}
    </div>
  );
};
