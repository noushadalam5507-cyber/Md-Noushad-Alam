import { UserProfile } from '../types';

/**
 * Instagrand VIP Creator Monetization Policy
 * Business Rule:
 * Creators unlock earnings & monetization once they reach 20,000 followers (or role === 'admin').
 */

export const MONETIZATION_MIN_FOLLOWERS = 20000;

export interface MonetizationStatus {
  isEligible: boolean;
  currentFollowers: number;
  threshold: number;
  progressPercent: number;
  remainingFollowers: number;
  reason: string;
}

export function getUserFollowersCount(user: UserProfile | null | undefined): number {
  if (!user) return 0;
  if (typeof user.followersCount === 'number') {
    return user.followersCount;
  }
  
  // Stored follower count in local state or calculated from account
  const stored = localStorage.getItem(`instagrand_followers_${user.id || user.username}`);
  if (stored !== null) {
    return parseInt(stored, 10) || 0;
  }
  return 0; // New user cleanly starts with 0 followers
}

export function checkUserMonetizationStatus(user: UserProfile | null | undefined): MonetizationStatus {
  const currentFollowers = getUserFollowersCount(user);
  const isAdmin = user?.role === 'admin';

  const isEligible = isAdmin || currentFollowers >= MONETIZATION_MIN_FOLLOWERS;
  const progressPercent = Math.min(100, Math.round((currentFollowers / MONETIZATION_MIN_FOLLOWERS) * 100));
  const remainingFollowers = Math.max(0, MONETIZATION_MIN_FOLLOWERS - currentFollowers);

  let reason = '';
  if (isAdmin) {
    reason = 'Administrator Tier: Full 100% Monetization Unlocked';
  } else if (isEligible) {
    reason = `Unlocked! You have exceeded the ${MONETIZATION_MIN_FOLLOWERS.toLocaleString()} followers milestone.`;
  } else {
    reason = `Locked: Reach 20,000 followers to unlock cash earnings on uploads and reels (${remainingFollowers.toLocaleString()} more needed).`;
  }

  return {
    isEligible,
    currentFollowers,
    threshold: MONETIZATION_MIN_FOLLOWERS,
    progressPercent,
    remainingFollowers,
    reason,
  };
}

/**
 * Standard media rates
 */
export const MEDIA_PRICING = {
  photoUploadStandardRateRupees: 2.0, // ₹2 per photo
  videoUploadPremiumRateRupees: 10.0, // ₹10 per video
  aiFilterUnlockCostCoins: 20, // 20 coins or 1 Rewarded Ad
  aiFilterMicroFeeRupees: 1.0, // ₹1 micro fee
};
