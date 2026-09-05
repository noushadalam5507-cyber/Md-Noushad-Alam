/**
 * Real-Time Bandwidth & Traffic Monetization Tracker
 * Connects media playback (Opus Audio, 4K Reels, WebRTC Video Calls)
 * to Founder Monetization Yield (₹12.50 per GB) and User Stream Coin Drops (+5 Coins / 25MB).
 */

import { trackAndMonetizeBandwidthUsage } from '../lib/firestoreService';

export interface TrafficStats {
  sessionMb: number;
  lifetimeGb: number;
  founderEarningsRupees: number;
  userEarnedStreamCoins: number;
  activeBitrateKbps: number;
  lastActivityDesc: string;
  backgroundMediationHits: number;
  carrierType: '5G Ultra-Wideband' | 'Wi-Fi 6' | '4G LTE';
}

const STORAGE_KEY_SESSION_MB = 'instagrand_traffic_session_mb';
const STORAGE_KEY_LIFETIME_GB = 'founder_bandwidth_consumed_gb';
const STORAGE_KEY_EARNINGS_INR = 'founder_admob_total_inr';
const STORAGE_KEY_USER_STREAM_COINS = 'user_stream_reward_coins';

type TrafficListener = (stats: TrafficStats) => void;
const listeners: Set<TrafficListener> = new Set();

let sessionMb = parseFloat(localStorage.getItem(STORAGE_KEY_SESSION_MB) || '142.6');
let lifetimeGb = parseFloat(localStorage.getItem(STORAGE_KEY_LIFETIME_GB) || '361.66');
let founderEarningsRupees = parseFloat(localStorage.getItem(STORAGE_KEY_EARNINGS_INR) || '4520.80');
let userEarnedStreamCoins = parseInt(localStorage.getItem(STORAGE_KEY_USER_STREAM_COINS) || '85', 10);
let backgroundMediationHits = 342;
let lastUnrewardedMbAccumulator = 0;

export function getTrafficStats(): TrafficStats {
  return {
    sessionMb: parseFloat(sessionMb.toFixed(2)),
    lifetimeGb: parseFloat(lifetimeGb.toFixed(3)),
    founderEarningsRupees: parseFloat(founderEarningsRupees.toFixed(2)),
    userEarnedStreamCoins,
    activeBitrateKbps: 4800,
    lastActivityDesc: 'Ultra-HD Media Stream Mediation',
    backgroundMediationHits,
    carrierType: '5G Ultra-Wideband',
  };
}

function notifyListeners() {
  const stats = getTrafficStats();
  listeners.forEach((fn) => {
    try {
      fn(stats);
    } catch (e) {
      console.warn('Traffic listener error:', e);
    }
  });
}

export function subscribeToTrafficStats(listener: TrafficListener): () => void {
  listeners.add(listener);
  listener(getTrafficStats());
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Record bandwidth consumption from audio, reels, or video calls.
 * @param mbUsed Number of megabytes transferred
 * @param activity Description of the stream (e.g. "4K Reel Playback")
 * @param onUserCoinDrop Callback when a milestone (+5 coins / 25MB) is reached
 */
export function recordTrafficConsumption(
  mbUsed: number,
  activity: string = 'Media Streaming',
  onUserCoinDrop?: (coinsAdded: number) => void
): { addedCoins: number; founderRupeesEarned: number } {
  sessionMb += mbUsed;
  const gbUsed = mbUsed / 1024;
  lifetimeGb += gbUsed;

  const ratePerGb = 12.5; // ₹12.50 per GB
  const inrYield = gbUsed * ratePerGb;
  founderEarningsRupees += inrYield;

  backgroundMediationHits += Math.max(1, Math.floor(mbUsed / 2));
  lastUnrewardedMbAccumulator += mbUsed;

  let addedCoins = 0;
  // Award 5 Coins every 25MB consumed
  if (lastUnrewardedMbAccumulator >= 25) {
    const drops = Math.floor(lastUnrewardedMbAccumulator / 25);
    addedCoins = drops * 5;
    userEarnedStreamCoins += addedCoins;
    lastUnrewardedMbAccumulator %= 25;

    localStorage.setItem(STORAGE_KEY_USER_STREAM_COINS, userEarnedStreamCoins.toString());
    if (onUserCoinDrop) {
      setTimeout(() => {
        try {
          onUserCoinDrop(addedCoins);
        } catch (err) {
          console.warn('onUserCoinDrop error:', err);
        }
      }, 0);
    }
  }

  // Persist
  localStorage.setItem(STORAGE_KEY_SESSION_MB, sessionMb.toFixed(2));
  localStorage.setItem(STORAGE_KEY_LIFETIME_GB, lifetimeGb.toFixed(3));
  localStorage.setItem(STORAGE_KEY_EARNINGS_INR, founderEarningsRupees.toFixed(2));

  // Sync to Firestore helper
  trackAndMonetizeBandwidthUsage(mbUsed, activity);

  notifyListeners();

  return { addedCoins, founderRupeesEarned: inrYield };
}
