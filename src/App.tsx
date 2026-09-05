/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeFeedView } from './components/HomeFeedView';
import { ExploreSearchView } from './components/ExploreSearchView';
import { CreatePostView } from './components/CreatePostView';
import { DirectMessagesView } from './components/DirectMessagesView';
import { ProfileView } from './components/ProfileView';
import { UsernameChecker } from './components/UsernameChecker';
import { VideoAudioCallModule } from './components/VideoAudioCallModule';
import { ContactsDirectory } from './components/ContactsDirectory';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { AuthScreen } from './components/AuthScreen';
import { AdminVaultModal } from './components/AdminVaultModal';
import { IncomingCallBanner } from './components/IncomingCallBanner';
import { AdMobInterstitialModal } from './components/AdMobInterstitialModal';
import { InAppSplashScreen } from './components/InAppSplashScreen';
import { Launcher3DWidget } from './components/Launcher3DWidget';
import { AICreatorAssistantModal } from './components/AICreatorAssistantModal';
import { VideoReelsExperienceModal } from './components/VideoReelsExperienceModal';
import { ReelsView } from './components/ReelsView';
import { MusicPlayerView } from './components/MusicPlayerView';
import { SettingsActivityView } from './components/SettingsActivityView';
import { ProfessionalDashboardView } from './components/ProfessionalDashboardView';
import { AccountSecurityModal } from './components/AccountSecurityModal';
import { AIMediaFilterStudio } from './components/AIMediaFilterStudio';
import { AIChatStudio } from './components/AIChatStudio';
import { DisplayWatchHeader } from './components/DisplayWatchHeader';
import { InstagramRealConnectModal } from './components/InstagramRealConnectModal';
import { CoinStoreModal } from './components/CoinStoreModal';
import { AppLockScreen } from './components/AppLockScreen';
import { AppLockSettingsModal } from './components/AppLockSettingsModal';
import { DailyLuckySpinModal } from './components/DailyLuckySpinModal';
import { AppUpdateModal } from './components/AppUpdateModal';
import { TrafficMonetizationWidget } from './components/TrafficMonetizationWidget';
import { DynamicIslandHeader } from './components/DynamicIslandHeader';
import { AccountHelpAIChatModal } from './components/AccountHelpAIChatModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { AdminBankWithdrawalModal } from './components/AdminBankWithdrawalModal';
import { ThemeProvider } from './context/ThemeContext';
import { Sparkles, Coins, Crown, X, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { UserProfile, ViewTab, PostItem, AppLockConfig } from './types';
import {
  getStoredAppLockConfig,
  isSessionUnlocked,
  setSessionUnlocked,
} from './utils/appLockStorage';
import {
  syncUserProfileToFirestore,
  claimUsernameInFirestore,
  subscribeToUserProfile,
  createPostInFirestore,
  subscribeToFirestorePosts
} from './lib/firestoreService';
import { auth } from './lib/firebase';

export default function App() {
  // Current Authenticated User (Initial Screen: Welcome NovaGrand Pro AuthScreen)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem('novagrand_active_session');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return null;
  });

  // Active Tab: default to 'home' to display the Instagram-style feed immediately!
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminVaultOpen, setIsAdminVaultOpen] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isCoinStoreOpen, setIsCoinStoreOpen] = useState<boolean>(false);
  const [isAppLockSettingsOpen, setIsAppLockSettingsOpen] = useState<boolean>(false);
  const [isLuckySpinOpen, setIsLuckySpinOpen] = useState<boolean>(false);
  const [isAppUpdateOpen, setIsAppUpdateOpen] = useState<boolean>(false);
  const [isTrafficWidgetOpen, setIsTrafficWidgetOpen] = useState<boolean>(false);
  const [isInstagramConnectOpen, setIsInstagramConnectOpen] = useState<boolean>(false);
  const [isHelpAIOpen, setIsHelpAIOpen] = useState<boolean>(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);
  const [isAdminBankWithdrawalOpen, setIsAdminBankWithdrawalOpen] = useState<boolean>(false);

  // In-App App Lock State
  const [appLockConfig, setAppLockConfig] = useState<AppLockConfig>(getStoredAppLockConfig());
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    const cfg = getStoredAppLockConfig();
    return Boolean(cfg.isEnabled && !isSessionUnlocked());
  });

  // Handle In-App App Lock auto-lock lifecycle on visibility/background change & event updates
  useEffect(() => {
    const handleConfigUpdate = () => {
      const cfg = getStoredAppLockConfig();
      setAppLockConfig(cfg);
      if (!cfg.isEnabled) {
        setIsAppLocked(false);
      }
    };
    window.addEventListener('instagrand:applock-updated', handleConfigUpdate);

    let backgroundTimer: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      const cfg = getStoredAppLockConfig();
      if (!cfg.isEnabled) return;

      if (document.hidden) {
        // App is hidden / minimized
        if (cfg.autoLockDelay === 'immediately') {
          setSessionUnlocked(false);
          setIsAppLocked(true);
        } else if (cfg.autoLockDelay === '1min') {
          backgroundTimer = setTimeout(() => {
            setSessionUnlocked(false);
            setIsAppLocked(true);
          }, 60 * 1000);
        } else if (cfg.autoLockDelay === '5min') {
          backgroundTimer = setTimeout(() => {
            setSessionUnlocked(false);
            setIsAppLocked(true);
          }, 5 * 60 * 1000);
        }
      } else {
        // App returned to foreground / reopened
        if (backgroundTimer) {
          clearTimeout(backgroundTimer);
        }
        if (!isSessionUnlocked()) {
          setIsAppLocked(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('instagrand:applock-updated', handleConfigUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (backgroundTimer) clearTimeout(backgroundTimer);
    };
  }, []);

  const [registrationWelcomeBanner, setRegistrationWelcomeBanner] = useState<{
    show: boolean;
    name: string;
    handle: string;
  } | null>(null);
  const [isInCall, setIsInCall] = useState<boolean>(false);
  const [activeRoomId, setActiveRoomId] = useState<string>('neon-studio-main');
  const [targetCallUsername, setTargetCallUsername] = useState<string>('alexv');

  // Initial Posts Feed State
  const initialPosts: PostItem[] = [
    {
      id: 'post-1',
      authorId: 'usr-sarah',
      authorName: 'Sarah Chen',
      authorUsername: 'sarah_chen',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      caption: 'Live in the 4K Opus Studio! 💜 Real-time Firestore sync & WebRTC ultra-HD streams are officially online. Tap "Call Live" above to connect.',
      hashtags: ['#Instagrand', '#NeonCall', '#WebRTC4K', '#CyberVIP', '#StudioLive'],
      location: 'Purple Neon Cyber Studio',
      audioTrack: 'Opus Waveform 48kHz HQ',
      likesCount: 1420,
      isLiked: true,
      commentsCount: 38,
      comments: [
        {
          id: 'c1',
          authorName: 'Alex Vance',
          authorUsername: 'alexv',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          text: 'The 4K Opus audio clarity in the studio call is unbelievable! 🔥',
          timestamp: '15m ago',
          likes: 12,
        },
        {
          id: 'c2',
          authorName: 'Dr. Marcus Lee',
          authorUsername: 'marcus_ai',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          text: 'Verified creator space looking legendary with the purple neon underglow!',
          timestamp: '5m ago',
          likes: 8,
        },
      ],
      sharesCount: 184,
      createdAt: '12m ago',
      isMonetized: true,
      earningsEst: '$42.80',
    },
    {
      id: 'post-2',
      authorId: 'usr-elena',
      authorName: 'Elena Vance',
      authorUsername: 'elena_neon',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
      caption: 'Cyberpunk visual drops and hologram stage filters ready for tonight\'s broadcast. Direct Video DM is unlocked! 🔮',
      hashtags: ['#HologramLive', '#InstagrandCreators', '#CyberAesthetic'],
      location: 'Tokyo Cyber Node 7',
      audioTrack: 'Synthetic Twilight · Elena Vance',
      likesCount: 2890,
      isLiked: false,
      commentsCount: 64,
      comments: [
        {
          id: 'c3',
          authorName: 'Sophia Chen',
          authorUsername: 'sophia_vr',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          text: 'Count me in for the joint 4K studio stream! 🚀',
          timestamp: '22m ago',
          likes: 19,
        },
      ],
      sharesCount: 312,
      createdAt: '1h ago',
      isMonetized: true,
      earningsEst: '$88.50',
    },
    {
      id: 'post-3',
      authorId: 'usr-marcus',
      authorName: 'Dr. Marcus Lee',
      authorUsername: 'marcus_ai',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
      caption: 'Neural spectrum visualizer & WebRTC packet loss reduced to 0.00%. Seamless streaming for all Instagrand creators.',
      hashtags: ['#WebRTC', '#AI', '#OpusHQ', '#NeuralAudio'],
      location: 'Quantum Lab · Server Cluster 01',
      audioTrack: 'Neural Sine Synthesizer',
      likesCount: 940,
      isLiked: false,
      commentsCount: 19,
      comments: [],
      sharesCount: 92,
      createdAt: '3h ago',
      isMonetized: false,
    },
  ];

  const [posts, setPosts] = useState<PostItem[]>(initialPosts);

  // Initial Sync to Firestore on startup
  useEffect(() => {
    if (currentUser) {
      syncUserProfileToFirestore(currentUser);
      claimUsernameInFirestore(currentUser.username, currentUser);
    }
  }, []);

  // Listen to Google Auth state and synchronize real Google photoURL if available
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (fbUser) => {
      if (fbUser && fbUser.photoURL) {
        setCurrentUser((prev) => {
          if (!prev) return prev;
          if (prev.avatar !== fbUser.photoURL && (!prev.avatar || prev.avatar.includes('dicebear') || prev.accountType === 'google')) {
            const updated = { ...prev, avatar: fbUser.photoURL };
            localStorage.setItem('instagrand_auth_user', JSON.stringify(updated));
            syncUserProfileToFirestore(updated);
            return updated;
          }
          return prev;
        });
      }
    });
    return () => unsubAuth();
  }, []);

  // Handler for Profile updates (Avatar, Custom Photo from Gallery, Name, Bio)
  const handleUpdateCurrentUser = async (updated: UserProfile) => {
    setCurrentUser(updated);
    try {
      localStorage.setItem('instagrand_auth_user', JSON.stringify(updated));
      await syncUserProfileToFirestore(updated);
    } catch (err) {
      console.error('Failed to sync updated user profile to cloud:', err);
    }
  };

  // Listen to profile updates from Firestore
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = subscribeToUserProfile(currentUser.id, (updated) => {
      if (updated) {
        setCurrentUser(updated);
      }
    });
    return () => unsub();
  }, [currentUser?.id]);

  // Listen to Firestore Posts
  useEffect(() => {
    const unsub = subscribeToFirestorePosts((incoming) => {
      if (incoming.length > 0) {
        setPosts((prev) => {
          const merged = [...prev];
          incoming.forEach((p) => {
            if (!merged.some((m) => m.id === p.id)) {
              merged.unshift(p);
            }
          });
          return merged;
        });
      }
    });
    return () => unsub();
  }, []);

  // Simulated Incoming Call State
  const [incomingCall, setIncomingCall] = useState<{
    isOpen: boolean;
    callerName: string;
    callerUsername: string;
    callerAvatar: string;
    roomId: string;
  } | null>(null);

  // Interstitial Ad Management State
  const [isInterstitialAdOpen, setIsInterstitialAdOpen] = useState<boolean>(false);
  const [isSplashScreenOpen, setIsSplashScreenOpen] = useState<boolean>(true);
  const [isAICreatorOpen, setIsAICreatorOpen] = useState<boolean>(false);
  const [isVideoReelsOpen, setIsVideoReelsOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'start-call' | 'return-home';
    roomId?: string;
    targetUser?: string;
  } | null>(null);

  // Tab Switch Handler
  const handleSelectTab = (tab: ViewTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch / Start Video Studio Call (Triggers AdMob Interstitial first for maximum eCPM, but zero ads for Admin)
  const handleStartCall = (roomId: string, targetUser?: string) => {
    const targetRoom = roomId || 'studio-live-room';
    const target = targetUser || 'live_creator';

    // Admin Ad Protection: Never show ads to Admin
    const isBlockedAdmin =
      currentUser?.role === 'admin' ||
      currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com';

    if (isBlockedAdmin) {
      proceedWithStartCall(targetRoom, target);
      return;
    }

    // Show AdMob High-eCPM Interstitial Ad for regular users
    setPendingAction({
      type: 'start-call',
      roomId: targetRoom,
      targetUser: target,
    });
    setIsInterstitialAdOpen(true);
  };

  // Direct start call without ad delay (after ad finishes or on proceed)
  const proceedWithStartCall = (roomId: string, targetUser?: string) => {
    setActiveRoomId(roomId || 'studio-live-room');
    if (targetUser) {
      setTargetCallUsername(targetUser);
    }
    setIsInCall(true);
    setCurrentTab('call-module');
  };

  // End Call
  const handleEndCall = () => {
    setIsInCall(false);
    setCurrentTab('home');
  };

  const handleInterstitialProceed = () => {
    if (pendingAction?.type === 'start-call') {
      proceedWithStartCall(pendingAction.roomId || 'neon-studio-naushad', pendingAction.targetUser);
    } else if (pendingAction?.type === 'return-home') {
      setCurrentTab('home');
    }
    setPendingAction(null);
    setIsInterstitialAdOpen(false);
  };

  // Post Created Handler
  const handlePostCreated = (newPost: PostItem) => {
    setPosts((prev) => [newPost, ...prev]);
    createPostInFirestore(newPost);
  };

  // Toggle Like on Post
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  // Add Comment to Post
  const handleAddComment = (postId: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `cmt_${Date.now()}`,
            authorName: currentUser?.name || 'Instagrand Creator',
            authorUsername: currentUser?.username || 'creator',
            authorAvatar: currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'creator'}&backgroundColor=180a30`,
            text: text,
            timestamp: 'Just now',
            likes: 0,
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );
  };

  // Update Username from Checker
  const handleUpdateUsername = (newUsername: string) => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        username: newUsername,
        isVerified: currentUser.role === 'admin' || currentUser.isVerified,
      };
      setCurrentUser(updated);
      syncUserProfileToFirestore(updated);
      claimUsernameInFirestore(newUsername, updated);
    }
  };

  // Trigger Incoming Call Simulation
  const handleTriggerSimulatedCall = () => {
    setIncomingCall({
      isOpen: true,
      callerName: 'Elena Vance',
      callerUsername: 'elena_neon',
      callerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roomId: 'studio-elena_neon',
    });
  };

  // Accept Incoming Call
  const handleAcceptIncomingCall = () => {
    if (incomingCall) {
      handleStartCall(incomingCall.roomId, incomingCall.callerUsername);
      setIncomingCall(null);
    }
  };

  // Decline Incoming Call
  const handleDeclineIncomingCall = () => {
    setIncomingCall(null);
  };

  // Auth / Registration Success Handler
  const handleLoginSuccess = (user: UserProfile, isNewRegistration?: boolean) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setIsSplashScreenOpen(true);
    syncUserProfileToFirestore(user);

    try {
      localStorage.setItem('instagrand_auth_user', JSON.stringify(user));
      sessionStorage.setItem('novagrand_active_session', JSON.stringify(user));
    } catch {
      // ignore
    }

    if (isNewRegistration) {
      setCurrentTab('username-checker');
      setRegistrationWelcomeBanner({
        show: true,
        name: user.name,
        handle: user.username,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sign Out Handler (Returns to Initial Welcome NovaGrand Pro Screen)
  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('instagrand_auth_user');
      sessionStorage.removeItem('novagrand_active_session');
    } catch {
      // ignore
    }
  };

  // If user is not authenticated, display the Login & Signup Page first
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div
      id="instagrand-app-root"
      className="min-h-screen bg-[#070210] dark:bg-zinc-950 light:bg-slate-50 text-zinc-100 dark:text-zinc-100 light:text-slate-900 flex flex-col justify-between selection:bg-purple-600 selection:text-white font-sans transition-colors duration-300"
    >
      {/* Top Cybernetic Rotating Display Watch Bar (Live Precision Time & Video Watch-to-Earn Revenue) */}
      <DisplayWatchHeader
        currentUser={currentUser}
        onOpenCoinStore={() => setIsCoinStoreOpen(true)}
        onOpenReels={() => setCurrentTab('reels')}
      />

      {/* Modern Dynamic Island Header (Live Broadcast & In-App UI Live Update Trigger) */}
      <DynamicIslandHeader
        currentUser={currentUser}
        isInCall={isInCall}
        onOpenHelpAI={() => setIsHelpAIOpen(true)}
        onOpenAppUpdate={() => setIsAppUpdateOpen(true)}
        onOpenLuckySpin={() => setIsLuckySpinOpen(true)}
        onOpenAdminBankWithdrawal={() => setIsAdminBankWithdrawalOpen(true)}
        onNavigateTab={handleSelectTab}
      />

      {/* Top Navigation Bar with Instagrand Branding */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        isInCall={isInCall}
        onOpenAdminVault={() => setIsAdminVaultOpen(true)}
        onOpenAdminBankWithdrawal={() => setIsAdminBankWithdrawalOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onOpenHelpAI={() => setIsHelpAIOpen(true)}
        onOpenCoinStore={() => setIsCoinStoreOpen(true)}
        onOpenInstagramConnect={() => setIsInstagramConnectOpen(true)}
      />

      {/* Welcome Registration & 100-Coin Bonus Notification Banner */}
      {registrationWelcomeBanner && (
        <div
          id="registration-welcome-banner"
          className="bg-gradient-to-r from-purple-900 via-fuchsia-900 to-indigo-900 border-b border-purple-500/50 py-3 px-4 sm:px-6 shadow-xl relative z-30 animate-fade-in"
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black shadow-lg shadow-amber-400/30 shrink-0">
                <Coins className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h4 className="text-sm font-black text-white">
                    Account Created Successfully!
                  </h4>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-black uppercase tracking-wider">
                    +100 Coins Credited
                  </span>
                </div>
                <p className="text-xs text-purple-200/90 mt-0.5">
                  Welcome <strong className="text-white">{registrationWelcomeBanner.name}</strong>! Your account is registered in Firebase Firestore. Check availability and claim your unique handle below.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setRegistrationWelcomeBanner(null)}
                className="p-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white border border-purple-800 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area Rendering Current Tab */}
      <main id="instagrand-main-viewport" className="flex-1 w-full px-3 sm:px-6 py-4 pb-24 max-w-5xl mx-auto">
        {/* Tab 1: Home Icon (Main Feed) */}
        {currentTab === 'home' && (
          <HomeFeedView
            currentUser={currentUser}
            onStartCall={handleStartCall}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNavigateToSearch={() => handleSelectTab('search')}
            onCreateNewPost={() => handleSelectTab('create')}
            onOpenAICreator={() => setIsAICreatorOpen(true)}
            onOpenVideoReels={() => handleSelectTab('reels')}
            onOpenLuckySpin={() => setIsLuckySpinOpen(true)}
            posts={posts}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onOpenInstagramConnect={() => setIsInstagramConnectOpen(true)}
          />
        )}

        {/* Tab: Reels (Instagram Viral Video Section) */}
        {currentTab === 'reels' && (
          <ReelsView
            currentUser={currentUser}
            onNavigateToMusic={() => handleSelectTab('music')}
            onUpdateCoins={(newCoins) => {
              setCurrentUser((prev) => (prev ? { ...prev, coins: newCoins } : null));
            }}
          />
        )}

        {/* Tab: Music (Jukebox & Songs Streaming Hub) */}
        {currentTab === 'music' && (
          <MusicPlayerView
            currentUser={currentUser}
            onNavigateToReels={() => handleSelectTab('reels')}
            onUpdateCoins={(newCoins) => {
              setCurrentUser((prev) => (prev ? { ...prev, coins: newCoins } : null));
            }}
          />
        )}

        {/* Tab 2: Search Icon (Explore page to search for unique usernames like @naushad) */}
        {currentTab === 'search' && (
          <ExploreSearchView
            currentUser={currentUser}
            onNavigateTab={handleSelectTab}
            onStartCall={handleStartCall}
          />
        )}

        {/* Tab 3: Plus Icon (+) / Create Route (Media picker layout) */}
        {currentTab === 'create' && (
          <CreatePostView
            currentUser={currentUser}
            onPostCreated={handlePostCreated}
            onNavigateHome={() => handleSelectTab('home')}
            onNavigateTab={handleSelectTab}
          />
        )}

        {/* Tab: AI Photo & Video Filter Studio */}
        {currentTab === 'ai-filter-studio' && (
          <AIMediaFilterStudio
            currentUser={currentUser}
            onApplyMediaToPost={(mediaUrl, type, filterName) => {
              handleSelectTab('create');
            }}
          />
        )}

        {/* Tab: Super AI Chat Studio (Voice, Photo, Q&A and Monetization) */}
        {currentTab === 'ai-chat-studio' && (
          <AIChatStudio
            currentUser={currentUser}
            onPostCreated={handlePostCreated}
            onUpdateCoins={(newCoins) => {
              setCurrentUser((prev) => (prev ? { ...prev, coins: newCoins } : null));
            }}
          />
        )}

        {/* Tab 4: Messages Icon (Direct Messages list with chat locks) */}
        {currentTab === 'messages' && (
          <DirectMessagesView
            currentUser={currentUser}
            onStartCall={handleStartCall}
          />
        )}

        {/* Tab 5: Profile Icon (Right Corner: user profile grid, followers count, 10k monetization, settings gear) */}
        {currentTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onNavigateTab={handleSelectTab}
            onStartCall={handleStartCall}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLogout={handleSignOut}
            onUpdateCurrentUser={handleUpdateCurrentUser}
            onOpenAdminVault={() => setIsAdminVaultOpen(true)}
          />
        )}

        {/* Tab: Instagram Settings and Activity */}
        {currentTab === 'settings' && (
          <SettingsActivityView
            currentUser={currentUser}
            onNavigateTab={handleSelectTab}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLogout={handleSignOut}
            onLockNow={() => {
              setSessionUnlocked(false);
              setIsAppLocked(true);
            }}
            onOpenLuckySpin={() => setIsLuckySpinOpen(true)}
            onOpenAppUpdate={() => setIsAppUpdateOpen(true)}
            onOpenTrafficWidget={() => setIsTrafficWidgetOpen(true)}
          />
        )}

        {/* Tab: Instagram Professional Dashboard */}
        {currentTab === 'professional-dashboard' && (
          <ProfessionalDashboardView
            currentUser={currentUser}
            onNavigateTab={handleSelectTab}
          />
        )}

        {/* Live Call Studio Module */}
        {currentTab === 'call-module' && (
          <VideoAudioCallModule
            currentUser={
              currentUser || {
                id: 'usr_guest',
                name: 'Guest Creator',
                email: 'guest@instagrand.app',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                username: 'guest_creator',
                isVerified: false,
                status: 'online',
                joinedDate: 'August 2026',
              }
            }
            activeRoomId={activeRoomId}
            targetUsername={targetCallUsername}
            onEndCall={handleEndCall}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Username Registry & Availability Checker */}
        {currentTab === 'username-checker' && (
          <UsernameChecker
            currentUser={currentUser}
            onUpdateUsername={handleUpdateUsername}
            onInitiateCallToUser={(user) => handleStartCall(`call-with-${user}`, user)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Contacts Directory */}
        {currentTab === 'contacts' && (
          <ContactsDirectory
            currentUser={currentUser}
            onInitiateCall={(target) => handleStartCall(`call-with-${target}`, target)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Sticky Instagram 5-Tab Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        unreadMessagesCount={1}
      />

      {/* Google Auth & Manual Registration Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      {/* AI Creator Studio Assistant Modal */}
      <AICreatorAssistantModal
        isOpen={isAICreatorOpen}
        onClose={() => setIsAICreatorOpen(false)}
        currentUser={currentUser}
        onPublishContent={handlePostCreated}
      />

      {/* 5 Video Theater & 2 Private Download Files Modal */}
      <VideoReelsExperienceModal
        isOpen={isVideoReelsOpen}
        onClose={() => setIsVideoReelsOpen(false)}
        currentUser={currentUser}
        onStartCall={handleStartCall}
      />

      {/* 100% Owner & Admin Master Control Vault Modal */}
      <AdminVaultModal
        isOpen={isAdminVaultOpen}
        onClose={() => setIsAdminVaultOpen(false)}
        currentUser={currentUser}
        onOpenBankWithdrawal={() => setIsAdminBankWithdrawalOpen(true)}
      />

      {/* Admin Exclusive Instant 5-Minute Bank Withdrawal Dashboard */}
      <AdminBankWithdrawalModal
        isOpen={isAdminBankWithdrawalOpen}
        onClose={() => setIsAdminBankWithdrawalOpen(false)}
        currentUser={currentUser}
      />

      {/* Google AdMob High-eCPM Interstitial Ad Modal (Admin Ad-Free Protected) */}
      <AdMobInterstitialModal
        isOpen={isInterstitialAdOpen}
        onClose={() => setIsInterstitialAdOpen(false)}
        targetActionName={pendingAction?.type === 'start-call' ? `Call @${pendingAction.targetUser || 'naushad'}` : 'Home Feed'}
        currentUser={currentUser}
        onProceed={handleInterstitialProceed}
      />

      {/* 3D Floating Launcher Widget & Process Simulator */}
      <Launcher3DWidget
        onOpenSplash={() => setIsSplashScreenOpen(true)}
        onOpenCallModule={() => handleSelectTab('call-module')}
        onOpenMessages={() => handleSelectTab('messages')}
        onOpenAdMobReward={() => setIsCoinStoreOpen(true)}
        onOpenVideoReels={() => setIsVideoReelsOpen(true)}
        onOpenLuckySpin={() => setIsLuckySpinOpen(true)}
        onOpenAppUpdate={() => setIsAppUpdateOpen(true)}
        onOpenTrafficWidget={() => setIsTrafficWidgetOpen(true)}
        userCoins={currentUser?.coins ?? 100}
      />

      {/* Daily Lucky Spin & Win Wheel Modal */}
      <DailyLuckySpinModal
        isOpen={isLuckySpinOpen}
        onClose={() => setIsLuckySpinOpen(false)}
        currentUser={currentUser}
        onCoinsWon={(won) => {
          setCurrentUser((prev) => (prev ? { ...prev, coins: (prev.coins || 0) + won } : null));
        }}
      />

      {/* Software OTA Update & High-eCPM Release Modal */}
      <AppUpdateModal
        isOpen={isAppUpdateOpen}
        onClose={() => setIsAppUpdateOpen(false)}
        currentUser={currentUser}
        onCoinsEarned={(earned) => {
          setCurrentUser((prev) => (prev ? { ...prev, coins: (prev.coins || 0) + earned } : null));
        }}
      />

      {/* Data Usage & Bandwidth Traffic Monetization Widget Modal */}
      <TrafficMonetizationWidget
        isOpen={isTrafficWidgetOpen}
        onClose={() => setIsTrafficWidgetOpen(false)}
        currentUser={currentUser}
        onCoinsEarned={(earned) => {
          setCurrentUser((prev) => (prev ? { ...prev, coins: (prev.coins || 0) + earned } : null));
        }}
      />

      {/* Centralized Coin Store & Multi-Network Ad Center Modal */}
      <CoinStoreModal
        isOpen={isCoinStoreOpen}
        onClose={() => setIsCoinStoreOpen(false)}
        currentUser={currentUser}
        onCoinsUpdated={(newCoins) => {
          setCurrentUser((prev) => (prev ? { ...prev, coins: newCoins } : null));
        }}
      />

      {/* In-App 3D Splash Screen -> Welcome NovaGrand Pro */}
      <InAppSplashScreen
        isOpen={isSplashScreenOpen}
        onClose={() => {
          setIsSplashScreenOpen(false);
          setCurrentTab('home');
        }}
        currentUser={currentUser}
      />

      {/* Anti-Hack Device & Session Shield Modal */}
      <AccountSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        currentUser={currentUser}
        onOpenAppLockSettings={() => setIsAppLockSettingsOpen(true)}
      />

      {/* In-App App Lock Settings Modal */}
      <AppLockSettingsModal
        isOpen={isAppLockSettingsOpen}
        onClose={() => setIsAppLockSettingsOpen(false)}
        currentUser={currentUser}
        onLockNow={() => {
          setIsAppLockSettingsOpen(false);
          setSessionUnlocked(false);
          setIsAppLocked(true);
        }}
        onConfigChanged={(cfg) => setAppLockConfig(cfg)}
      />

      {/* Global In-App App Lock Screen Overlay (Biometric, PIN, Pattern) */}
      {isAppLocked && (
        <AppLockScreen
          config={appLockConfig}
          currentUser={currentUser}
          onUnlockSuccess={() => {
            setSessionUnlocked(true);
            setIsAppLocked(false);
          }}
        />
      )}

      {/* Real Instagram Profile Direct Connect & DM Modal */}
      <InstagramRealConnectModal
        isOpen={isInstagramConnectOpen}
        onClose={() => setIsInstagramConnectOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={(updated) => {
          if (currentUser) {
            const nextUser = { ...currentUser, ...updated };
            setCurrentUser(nextUser);
            syncUserProfileToFirestore(nextUser);
          }
        }}
      />

      {/* 24/7 Account Help AI Assistant Chat Modal */}
      <AccountHelpAIChatModal
        isOpen={isHelpAIOpen}
        onClose={() => setIsHelpAIOpen(false)}
        currentUser={currentUser}
        onNavigateTab={handleSelectTab}
        onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
        onOpenAppLock={() => setIsAppLockSettingsOpen(true)}
        onOpenCoinStore={() => setIsCoinStoreOpen(true)}
        onOpenLuckySpin={() => setIsLuckySpinOpen(true)}
        onOpenAppUpdate={() => setIsAppUpdateOpen(true)}
      />

      {/* Firebase Password Reset & Recovery Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        defaultEmail={currentUser?.email || ''}
      />

      {/* Incoming Call Notification Banner */}
      {incomingCall && (
        <IncomingCallBanner
          callerName={incomingCall.callerName}
          callerUsername={incomingCall.callerUsername}
          callerAvatar={incomingCall.callerAvatar}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />
      )}
    </div>
  );
}

