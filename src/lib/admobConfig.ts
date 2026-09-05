/// <reference types="vite/client" />

/**
 * Google AdMob / AdSense Configuration
 * Re-exported from centralized /src/config/adConfig.ts
 */
export {
  CENTRAL_AD_CONFIG,
  ADMOB_CONFIG,
  getAdConfig,
} from '../config/adConfig';

export type {
  GoogleAdMobConfig as AdMobConfig,
  UnityAdsConfig,
  AppLovinConfig,
  CoinStoreConfig,
  CoinPackage,
  CentralAdConfig,
} from '../config/adConfig';

import { CENTRAL_AD_CONFIG } from '../config/adConfig';

export function getAdMobCredentials() {
  return {
    appId: CENTRAL_AD_CONFIG.admob.appId,
    bannerAdUnitId: CENTRAL_AD_CONFIG.admob.bannerAdUnitId,
    rewardedAdUnitId: CENTRAL_AD_CONFIG.admob.rewardedAdUnitId,
    interstitialAdUnitId: CENTRAL_AD_CONFIG.admob.interstitialAdUnitId,
    adClient: CENTRAL_AD_CONFIG.admob.adClient,
    adSlot: CENTRAL_AD_CONFIG.admob.adSlot,
    rewardedCoinsAmount: CENTRAL_AD_CONFIG.admob.rewardedCoinsAmount,
    selfUnblockCostCoins: 150,
  };
}

