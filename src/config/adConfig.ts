/// <reference types="vite/client" />

/**
 * Centralized Ad Networks & Monetization Configuration
 * Integrated for Google AdMob, Unity Ads, AppLovin MAX, and Coin Store.
 * 
 * Supports both Live Production IDs and clear placeholders for future SDK integration.
 */

export interface GoogleAdMobConfig {
  appId: string;
  bannerAdUnitId: string;
  rewardedAdUnitId: string;
  interstitialAdUnitId: string;
  publisherId: string;
  adClient: string;
  adSlot: string;
  rewardedSlot: string;
  interstitialSlot: string;
  isEnabled: boolean;
  testMode: boolean;
  rewardedCoinsAmount: number;
}

export interface UnityAdsConfig {
  gameIdAndroid: string;
  gameIdIOS: string;
  rewardedPlacementId: string;
  interstitialPlacementId: string;
  bannerPlacementId: string;
  isEnabled: boolean;
  testMode: boolean;
  rewardedCoinsAmount: number;
}

export interface AppLovinConfig {
  sdkKey: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  mrecAdUnitId: string;
  isEnabled: boolean;
  testMode: boolean;
  rewardedCoinsAmount: number;
}

export interface CoinPackage {
  id: string;
  name: string;
  badge?: string;
  coins: number;
  bonusCoins: number;
  priceUSD: number;
  priceINR: number;
  popular?: boolean;
  bestValue?: boolean;
  icon: string;
  sku: string;
}

export interface CoinStoreConfig {
  isEnabled: boolean;
  defaultCurrency: 'USD' | 'INR';
  conversionRateUSDToINR: number;
  minWithdrawalCoins: number;
  stripePublishableKey: string;
  razorpayKeyId: string;
  googlePlayBillingEnabled: boolean;
  appleInAppPurchaseEnabled: boolean;
  packages: CoinPackage[];
}

export interface CentralAdConfig {
  admob: GoogleAdMobConfig;
  unity: UnityAdsConfig;
  applovin: AppLovinConfig;
  coinStore: CoinStoreConfig;
  platform: {
    publisherId: string;
    walletName: string;
    payoutEmail: string;
    photoApprovalPayoutRupees: number;
    videoApprovalPayoutRupees: number;
    dataBandwidthEarningsRatePerGbRupees: number;
  };
  founder?: {
    publisherId: string;
    walletName: string;
    payoutEmail: string;
    photoApprovalPayoutRupees: number;
    videoApprovalPayoutRupees: number;
    dataBandwidthEarningsRatePerGbRupees: number;
  };
}

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {} as Record<string, string>;

export const CENTRAL_AD_CONFIG: CentralAdConfig = {
  // 1. Google AdMob (Live Production Configuration)
  admob: {
    appId: env.VITE_ADMOB_APP_ID || 'ca-app-pub-9658260608635009~8417798607',
    bannerAdUnitId: env.VITE_ADMOB_BANNER_AD_UNIT_ID || 'ca-app-pub-9658260608635009/6250800262',
    rewardedAdUnitId: env.VITE_ADMOB_REWARDED_AD_UNIT_ID || 'ca-app-pub-9658260608635009/9871234567',
    interstitialAdUnitId: env.VITE_ADMOB_INTERSTITIAL_AD_UNIT_ID || 'ca-app-pub-9658260608635009/1234567890',
    publisherId: 'pub-9658260608635009',
    adClient: 'ca-app-pub-9658260608635009',
    adSlot: '6250800262',
    rewardedSlot: '9871234567',
    interstitialSlot: '1234567890',
    isEnabled: true,
    testMode: false,
    rewardedCoinsAmount: 10,
  },

  // 2. Unity Ads (Live Configuration)
  unity: {
    gameIdAndroid: env.VITE_UNITY_GAME_ID_ANDROID || '5521984',
    gameIdIOS: env.VITE_UNITY_GAME_ID_IOS || '5521985',
    rewardedPlacementId: env.VITE_UNITY_REWARDED_PLACEMENT || 'Rewarded_Android',
    interstitialPlacementId: env.VITE_UNITY_INTERSTITIAL_PLACEMENT || 'Interstitial_Android',
    bannerPlacementId: env.VITE_UNITY_BANNER_PLACEMENT || 'Banner_Android',
    isEnabled: true,
    testMode: false,
    rewardedCoinsAmount: 15,
  },

  // 3. AppLovin MAX (Code Structure with Clear Placeholders)
  applovin: {
    sdkKey: env.VITE_APPLOVIN_SDK_KEY || 'applovin_sdk_key_placeholder',
    bannerAdUnitId: env.VITE_APPLOVIN_BANNER_ID || 'applovin_banner_ad_unit_id_placeholder',
    interstitialAdUnitId: env.VITE_APPLOVIN_INTERSTITIAL_ID || 'applovin_interstitial_ad_unit_id_placeholder',
    rewardedAdUnitId: env.VITE_APPLOVIN_REWARDED_ID || 'applovin_rewarded_ad_unit_id_placeholder',
    mrecAdUnitId: env.VITE_APPLOVIN_MREC_ID || 'applovin_mrec_ad_unit_id_placeholder',
    isEnabled: true,
    testMode: false,
    rewardedCoinsAmount: 20,
  },

  // 4. Coin Store & In-App Purchases Configuration
  coinStore: {
    isEnabled: true,
    defaultCurrency: 'INR',
    conversionRateUSDToINR: 85.0,
    minWithdrawalCoins: 200,
    stripePublishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_stripe_publishable_key_placeholder',
    razorpayKeyId: env.VITE_RAZORPAY_KEY_ID || 'rzp_live_razorpay_key_id_placeholder',
    googlePlayBillingEnabled: true,
    appleInAppPurchaseEnabled: true,
    packages: [
      {
        id: 'starter_pack',
        name: 'Starter Coins',
        coins: 250,
        bonusCoins: 25,
        priceUSD: 1.99,
        priceINR: 149,
        icon: '🪙',
        sku: 'com.instagrand.neoncall.coins.250',
      },
      {
        id: 'creator_pack',
        name: 'Creator Pack',
        badge: 'Popular',
        popular: true,
        coins: 1000,
        bonusCoins: 150,
        priceUSD: 4.99,
        priceINR: 399,
        icon: '⚡',
        sku: 'com.instagrand.neoncall.coins.1000',
      },
      {
        id: 'studio_gold_pack',
        name: 'Studio Gold Pack',
        badge: 'Best Value',
        bestValue: true,
        coins: 2500,
        bonusCoins: 500,
        priceUSD: 9.99,
        priceINR: 799,
        icon: '👑',
        sku: 'com.instagrand.neoncall.coins.2500',
      },
      {
        id: 'ultimate_vip_pack',
        name: 'Ultimate VIP Vault',
        badge: '+30% Free',
        coins: 10000,
        bonusCoins: 3000,
        priceUSD: 29.99,
        priceINR: 2499,
        icon: '💎',
        sku: 'com.instagrand.neoncall.coins.10000',
      },
    ],
  },

  // Platform Master Details & Revenue Sharing
  platform: {
    publisherId: 'pub-9658260608635009',
    walletName: 'Instagrand Monetization Master Pool',
    payoutEmail: 'payouts@instagrand.app',
    photoApprovalPayoutRupees: 2.0,
    videoApprovalPayoutRupees: 5.0,
    dataBandwidthEarningsRatePerGbRupees: 12.5,
  },
};

// Backwards compatibility alias for existing components
export const ADMOB_CONFIG = {
  appId: CENTRAL_AD_CONFIG.admob.appId,
  bannerAdUnitId: CENTRAL_AD_CONFIG.admob.bannerAdUnitId,
  rewardedAdUnitId: CENTRAL_AD_CONFIG.admob.rewardedAdUnitId,
  interstitialAdUnitId: CENTRAL_AD_CONFIG.admob.interstitialAdUnitId,
  adClient: CENTRAL_AD_CONFIG.admob.adClient,
  adSlot: CENTRAL_AD_CONFIG.admob.adSlot,
  rewardedSlot: CENTRAL_AD_CONFIG.admob.rewardedSlot,
  interstitialSlot: CENTRAL_AD_CONFIG.admob.interstitialSlot,
  isEnabled: CENTRAL_AD_CONFIG.admob.isEnabled,
  testMode: CENTRAL_AD_CONFIG.admob.testMode,
  rewardedCoinsAmount: CENTRAL_AD_CONFIG.admob.rewardedCoinsAmount,
  selfUnblockCostCoins: 150,
  founderPublisherId: CENTRAL_AD_CONFIG.platform.publisherId,
  founderWalletName: CENTRAL_AD_CONFIG.platform.walletName,
  photoApprovalPayoutRupees: CENTRAL_AD_CONFIG.platform.photoApprovalPayoutRupees,
  videoApprovalPayoutRupees: CENTRAL_AD_CONFIG.platform.videoApprovalPayoutRupees,
  dataBandwidthEarningsRatePerGbRupees: CENTRAL_AD_CONFIG.platform.dataBandwidthEarningsRatePerGbRupees,
};

export function getAdConfig() {
  return CENTRAL_AD_CONFIG;
}
