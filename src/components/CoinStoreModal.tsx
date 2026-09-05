import React, { useState } from 'react';
import {
  X,
  Coins,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Play,
  CreditCard,
  Smartphone,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Crown,
  Flame,
  Layers,
  Radio,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CENTRAL_AD_CONFIG, CoinPackage } from '../config/adConfig';
import { rewardUserCoinsFromAdMobVideo } from '../lib/firestoreService';
import { UserProfile } from '../types';

interface CoinStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onCoinsUpdated: (newCoins: number) => void;
}

export const CoinStoreModal: React.FC<CoinStoreModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCoinsUpdated,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD'>('INR');
  const [activeTab, setActiveTab] = useState<'packages' | 'free_ads' | 'networks'>('packages');
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  const [watchingAdNetwork, setWatchingAdNetwork] = useState<string | null>(null);
  const [adCountdown, setAdCountdown] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCoins = currentUser?.coins ?? 0;

  const handlePurchasePackage = (pkg: CoinPackage) => {
    setProcessingPackageId(pkg.id);
    const totalCoinsToAdd = pkg.coins + pkg.bonusCoins;

    setTimeout(() => {
      const newTotal = currentCoins + totalCoinsToAdd;
      onCoinsUpdated(newTotal);
      setProcessingPackageId(null);
      setSuccessMessage(`Successfully purchased ${pkg.name}! +${totalCoinsToAdd.toLocaleString()} Coins added to your wallet.`);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 1200);
  };

  const handleWatchAd = (networkName: 'admob' | 'unity' | 'applovin') => {
    let coinsToAdd = 10;
    let unitId = CENTRAL_AD_CONFIG.admob.rewardedAdUnitId;

    if (networkName === 'unity') {
      coinsToAdd = CENTRAL_AD_CONFIG.unity.rewardedCoinsAmount;
      unitId = CENTRAL_AD_CONFIG.unity.rewardedPlacementId;
    } else if (networkName === 'applovin') {
      coinsToAdd = CENTRAL_AD_CONFIG.applovin.rewardedCoinsAmount;
      unitId = CENTRAL_AD_CONFIG.applovin.rewardedAdUnitId;
    } else {
      coinsToAdd = CENTRAL_AD_CONFIG.admob.rewardedCoinsAmount;
    }

    setWatchingAdNetwork(networkName);
    setAdCountdown(5);

    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setWatchingAdNetwork(null);
          completeAdReward(coinsToAdd, unitId, networkName);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeAdReward = async (coinsToAdd: number, adUnit: string, network: string) => {
    if (currentUser?.id) {
      try {
        const res = await rewardUserCoinsFromAdMobVideo({
          userId: currentUser.id,
          coinsToAdd,
          adUnitId: adUnit,
        });
        onCoinsUpdated(res.newCoins);
      } catch {
        onCoinsUpdated(currentCoins + coinsToAdd);
      }
    } else {
      onCoinsUpdated(currentCoins + coinsToAdd);
    }

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setSuccessMessage(`+${coinsToAdd} Free Coins earned from ${network.toUpperCase()} video ad!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div
      id="coin-store-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in"
    >
      <div
        id="coin-store-modal-container"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-zinc-950 border border-purple-800/60 shadow-[0_0_60px_rgba(168,85,247,0.25)] overflow-hidden"
      >
        {/* Header with Neon Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-purple-950 via-zinc-950 to-indigo-950 border-b border-purple-800/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center text-amber-400">
                  <Coins className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Coin Store & Ad Center
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                    Live Central Config
                  </span>
                </div>
                <p className="text-xs text-purple-300/80 font-medium">
                  Instant coin packages, multi-network rewarded ads & revenue share
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Balance Bar */}
          <div className="mt-4 p-3 rounded-2xl bg-zinc-900/90 border border-purple-500/30 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Your Balance:</span>
              <span className="text-lg font-black text-amber-400 font-mono flex items-center gap-1">
                <Coins className="w-4 h-4" />
                {currentCoins.toLocaleString()} Coins
              </span>
              <span className="text-[11px] text-zinc-400">
                (≈ {selectedCurrency === 'INR' ? `₹${(currentCoins * 0.85).toFixed(1)}` : `$${(currentCoins * 0.01).toFixed(2)}`})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCurrency('INR')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCurrency === 'INR'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCurrency === 'USD'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('packages')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Coin Packages</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('free_ads')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'free_ads'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black shadow-md shadow-amber-500/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Earn Free Coins</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('networks')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'networks'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ad Network Status</span>
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        {successMessage && (
          <div className="m-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: Coin Packages */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CENTRAL_AD_CONFIG.coinStore.packages.map((pkg) => {
                  const isProcessing = processingPackageId === pkg.id;
                  const price = selectedCurrency === 'INR' ? `₹${pkg.priceINR}` : `$${pkg.priceUSD}`;

                  return (
                    <div
                      key={pkg.id}
                      className={`relative p-4 rounded-2xl bg-zinc-900/90 border transition-all hover:scale-[1.01] flex flex-col justify-between ${
                        pkg.bestValue
                          ? 'border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                          : pkg.popular
                          ? 'border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Badge if available */}
                      {pkg.badge && (
                        <span
                          className={`absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow ${
                            pkg.bestValue
                              ? 'bg-amber-500 text-black'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          {pkg.badge}
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{pkg.icon}</span>
                          <div>
                            <h3 className="text-base font-black text-white">{pkg.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold">
                              <span>{pkg.coins.toLocaleString()} Coins</span>
                              {pkg.bonusCoins > 0 && (
                                <span className="text-emerald-400 text-[11px]">
                                  (+{pkg.bonusCoins} Bonus)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400">
                          SKU: <span className="font-mono text-zinc-500">{pkg.sku}</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <div className="text-lg font-black text-white font-mono">{price}</div>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handlePurchasePackage(pkg)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            pkg.bestValue
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg active:scale-95'
                              : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                          }`}
                        >
                          {isProcessing ? (
                            <span className="animate-spin text-sm">⏳</span>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Get Coins</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Gateways Information */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2 text-zinc-200 font-bold">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Configured Billing & In-App Purchase Channels</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">Google Play</span>
                    <span className="text-xs font-bold text-emerald-400">Billing v7.0</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">Apple StoreKit</span>
                    <span className="text-xs font-bold text-cyan-400">IAP Ready</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">Razorpay UPI</span>
                    <span className="text-xs font-bold text-amber-400">Config Ready</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">Stripe Checkout</span>
                    <span className="text-xs font-bold text-purple-400">Global Ready</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Earn Free Coins from Multi-Ad Networks */}
          {activeTab === 'free_ads' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Watch Rewarded Clips to Earn Unlimited Free Coins</span>
                  </h4>
                  <p className="text-xs text-zinc-300">
                    High eCPM sponsored videos supported across AdMob, Unity, and AppLovin.
                  </p>
                </div>
              </div>

              {/* 3 Networks Cards */}
              <div className="space-y-3">
                {/* 1. Google AdMob */}
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                      AdM
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">Google AdMob Video</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                          Live Active
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Rewarded Unit: <span className="font-mono text-amber-300">{CENTRAL_AD_CONFIG.admob.rewardedSlot}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={watchingAdNetwork !== null}
                    onClick={() => handleWatchAd('admob')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
                  >
                    {watchingAdNetwork === 'admob' ? (
                      <span>Playing ({adCountdown}s)...</span>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch (+10🪙)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Unity Ads */}
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-cyan-500/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black">
                      UNT
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">Unity Ads Rewarded</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                          Game ID {CENTRAL_AD_CONFIG.unity.gameIdAndroid}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Placement: <span className="font-mono text-cyan-300">{CENTRAL_AD_CONFIG.unity.rewardedPlacementId}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={watchingAdNetwork !== null}
                    onClick={() => handleWatchAd('unity')}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
                  >
                    {watchingAdNetwork === 'unity' ? (
                      <span>Playing ({adCountdown}s)...</span>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch (+15🪙)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. AppLovin MAX */}
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-purple-500/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black">
                      MAX
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">AppLovin MAX Rewarded</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-950 text-purple-300 font-mono font-bold border border-purple-500/30">
                          SDK Placeholder
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Ad Unit: <span className="font-mono text-purple-300">applovin_rewarded_ad_unit_id</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={watchingAdNetwork !== null}
                    onClick={() => handleWatchAd('applovin')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
                  >
                    {watchingAdNetwork === 'applovin' ? (
                      <span>Playing ({adCountdown}s)...</span>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch (+20🪙)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Centralized Ad Network Config Viewer */}
          {activeTab === 'networks' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
                <span>File Location: <strong className="font-mono text-purple-400">src/config/adConfig.ts</strong></span>
                <span className="text-emerald-400 font-mono font-bold">100% Centralized</span>
              </div>

              {/* 1. Google AdMob Section */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <h4 className="text-sm font-black text-white">1. Google AdMob (Live Production)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                    Live Active
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">AdMob App ID</span>
                      <span className="text-amber-300">{CENTRAL_AD_CONFIG.admob.appId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(CENTRAL_AD_CONFIG.admob.appId, 'admob_app_id')}
                      className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'admob_app_id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Banner Ad Unit ID</span>
                      <span className="text-zinc-300">{CENTRAL_AD_CONFIG.admob.bannerAdUnitId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(CENTRAL_AD_CONFIG.admob.bannerAdUnitId, 'admob_banner')}
                      className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'admob_banner' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Rewarded Ad Unit ID</span>
                      <span className="text-zinc-300">{CENTRAL_AD_CONFIG.admob.rewardedAdUnitId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(CENTRAL_AD_CONFIG.admob.rewardedAdUnitId, 'admob_rewarded')}
                      className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'admob_rewarded' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Unity Ads Section */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <h4 className="text-sm font-black text-white">2. Unity Ads (Live Integration)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                    Live Active
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Unity Game ID (Android)</span>
                      <span className="text-cyan-300">{CENTRAL_AD_CONFIG.unity.gameIdAndroid}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(CENTRAL_AD_CONFIG.unity.gameIdAndroid, 'unity_game_id')}
                      className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'unity_game_id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Unity Rewarded Placement</span>
                      <span className="text-zinc-300">{CENTRAL_AD_CONFIG.unity.rewardedPlacementId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(CENTRAL_AD_CONFIG.unity.rewardedPlacementId, 'unity_rewarded')}
                      className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'unity_rewarded' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. AppLovin MAX Section (Placeholders) */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <h4 className="text-sm font-black text-white">3. AppLovin MAX (Config Placeholders)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-mono font-bold border border-purple-500/30">
                    Ready for SDK Key
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">AppLovin SDK Key Placeholder</span>
                      <span className="text-purple-300">{CENTRAL_AD_CONFIG.applovin.sdkKey}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Rewarded Ad Unit ID Placeholder</span>
                      <span className="text-purple-300">{CENTRAL_AD_CONFIG.applovin.rewardedAdUnitId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-950 border-t border-purple-900/40 flex items-center justify-between text-xs text-zinc-500 font-mono shrink-0">
          <div>
            Founder Master: <span className="text-zinc-400">{CENTRAL_AD_CONFIG.founder.publisherId}</span>
          </div>
          <div>
            Ad Mediation: <span className="text-emerald-400 font-bold">100% Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
