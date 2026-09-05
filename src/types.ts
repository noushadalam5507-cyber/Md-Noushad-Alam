export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  username: string; // e.g. "naushad"
  isVerified: boolean;
  hasStudioPass?: boolean;
  studioPassTier?: '30-day' | 'lifetime';
  studioPassUnlockedAt?: string;
  status: 'online' | 'busy' | 'in-call' | 'away';
  customBio?: string;
  joinedDate: string;
  coins?: number; // Credited with 100-coin welcome bonus
  accountType?: 'google' | 'manual';
  registeredAt?: string;
  role?: 'admin' | 'creator' | 'user';
  lastDailyClaimDate?: string;
  unlockedFilterIds?: string[];
  unlockedThemeIds?: string[];
  isPrivateAccount?: boolean;
  isSpotlightActive?: boolean;
  spotlightExpiresAt?: string;
  followersCount?: number;
  followingCount?: number;
  followers?: number;
  following?: number;
  verifiedBadgeType?: 'blue' | 'neon' | 'gold';
  verifiedBadgeExpiresAt?: string;
}

export interface MasterAccountRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  username: string;
  passwordHashed?: string;
  accountType: 'manual' | 'google';
  registeredAt: string;
  lastLogin: string;
  coins: number;
  isVerified: boolean;
  isAdmin: boolean;
  hasStudioPass?: boolean;
}

export interface CreatorTipItem {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  recipientId: string;
  recipientUsername: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  totalCoins: number;
  creatorCoins: number; // 80% to creator
  adminCommission: number; // 20% platform commission
  message?: string;
  timestamp: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  username: string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  timestamp: string;
}


export interface CallParticipant {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isLocal: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0 to 100
  pingMs: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  type?: 'text' | 'reaction' | 'system';
}

export interface CallStats {
  duration: number; // in seconds
  bitrateKbps: number;
  fps: number;
  resolution: string;
  latencyMs: number;
  packetsLostPercent: number;
  audioFrequencyData: number[];
}

export type ViewTab = 
  | 'home' 
  | 'search'
  | 'reels'
  | 'music'
  | 'create' 
  | 'ai-chat-studio'
  | 'ai-filter-studio'
  | 'messages' 
  | 'notifications'
  | 'profile' 
  | 'settings'
  | 'professional-dashboard'
  | 'call-module'
  | 'username-checker'
  | 'contacts';

export interface AppNotificationItem {
  id: string;
  recipientId: string;
  recipientUsername: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  senderIsVerified?: boolean;
  type: 'like' | 'comment' | 'follow' | 'gift' | 'message' | 'system';
  title: string;
  message: string;
  mediaPreviewUrl?: string;
  targetId?: string; // postId, reelId, etc.
  giftDetails?: {
    giftId: string;
    giftName: string;
    giftIcon: string;
    coins: number;
  };
  isRead: boolean;
  createdAt: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  isVerified?: boolean;
  text: string;
  timestamp: string;
  likes: number;
}

export interface PostItem {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  isVerified: boolean;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  caption: string;
  hashtags: string[];
  location?: string;
  audioTrack?: string;
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  comments: PostComment[];
  sharesCount: number;
  createdAt: string;
  isMonetized?: boolean;
  earningsEst?: string;
  isAiApproved?: boolean;
  aiQualityScore?: number; // e.g. 98%
  aiPayoutRupees?: number; // e.g. 2 for photo, 5 for video
  aiScanVerdict?: string;
  networkDataConsumedMb?: number;
}

export interface StoryItem {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  isVerified: boolean;
  hasUnseenStory: boolean;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  caption?: string;
  musicTrackTitle?: string;
  musicTrackArtist?: string;
  musicTrackAudioUrl?: string;
  musicCategory?: 'hindi' | 'english' | 'slowed' | 'naat' | 'lofi';
  adMobEarnings?: string;
  adMobImpressions?: number;
  createdAt?: string;
  expiresAt?: string;
  likesCount?: number;
  isLiked?: boolean;
  viewsCount?: number;
}

export interface DirectMessageItem {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  mediaUrl?: string;
  isVoiceNote?: boolean;
  voiceDuration?: string;
  isRead?: boolean;
  giftTip?: {
    giftId: string;
    giftName: string;
    giftIcon: string;
    totalCoins: number;
    creatorCoins: number;
    adminCommission: number;
  };
}

export interface DirectMessageThread {
  id: string;
  participantId: string;
  participantName: string;
  participantUsername: string;
  participantAvatar: string;
  isVerified: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isLocked: boolean; // Chat lock status
  lockPin?: string;
  securityHint?: string;
  lockOwnerId?: string; // Only the owner who set the lock can view, change or reset
  lockOwnerEmail?: string;
  lockSecurityQuestion?: string;
  lockSecurityAnswer?: string;
  customWallpaperUrl?: string;
  customWallpaperOpacity?: number;
  messages: DirectMessageItem[];
}

export interface PayoutRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  coinsAmount: number;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'USDT';
  fiatAmount: number;
  payoutMethod: 'paypal' | 'stripe_bank' | 'upi' | 'crypto_usdt' | 'wise';
  payoutAccountDetails: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  transactionHash?: string;
  adminNote?: string;
}

export interface WatchEarnVideo {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: 'music_video' | 'nasheed' | 'bollywood' | 'sponsored' | 'indie';
  rewardCoins: number;
  durationSec: number;
  viewsCount: number;
  adSponsor?: string;
}

export type AppLockType = 'biometric' | 'pin' | 'pattern';

export interface GlobalReelsMonetization {
  totalReelsViews: number;
  todayReelsViews: number;
  adminEarningsINR: number;
  adminEarningsUSD: number;
  totalWithdrawnINR: number;
  availableBalanceINR: number;
  availableBalanceUSD: number;
  cpmRateINR: number; // e.g. ₹150 CPM (₹0.15 / view)
  lastUpdated: string;
}

export interface AdminBankWithdrawalRecord {
  id: string;
  adminEmail: string;
  adminName: string;
  amountINR: number;
  amountUSD: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  upiId?: string;
  transferMode: 'IMPS_INSTANT_5MIN' | 'NEFT' | 'RTGS' | 'UPI_INSTANT';
  status: 'processing_5min' | 'completed' | 'failed';
  utrReferenceNumber: string;
  requestedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface AppLockConfig {
  isEnabled: boolean;
  lockType: AppLockType;
  pinCode: string;
  patternPath: number[]; // 0 to 8 on a 3x3 grid
  biometricType: 'fingerprint' | 'faceid';
  biometricEnabled: boolean;
  autoLockDelay: 'immediately' | '1min' | '5min' | 'background';
  recoveryQuestion: string;
  recoveryAnswer: string;
  hideNotificationPreview: boolean;
  hapticFeedback: boolean;
  scramblePinPad: boolean;
  lastUnlockedAt?: number;
}
