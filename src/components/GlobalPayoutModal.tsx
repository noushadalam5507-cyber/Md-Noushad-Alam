import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Wallet,
  Globe,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
  Building,
  Coins,
  ShieldCheck,
  Send,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, PayoutRequest } from '../types';
import { requestGlobalPayoutInFirestore, subscribeToUserPayouts } from '../lib/firestoreService';

interface GlobalPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onCoinsUpdated: (newCoins: number) => void;
}

type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'USDT';
type PayoutMethodType = 'paypal' | 'stripe_bank' | 'upi' | 'crypto_usdt' | 'wise';

// 100 Coins = $1.00 USD baseline
const CONVERSION_RATES: Record<CurrencyCode, { rate: number; symbol: string; name: string }> = {
  USD: { rate: 0.01, symbol: '$', name: 'US Dollar (USD)' },
  INR: { rate: 0.85, symbol: '₹', name: 'Indian Rupee (INR)' },
  EUR: { rate: 0.0092, symbol: '€', name: 'Euro (EUR)' },
  GBP: { rate: 0.0078, symbol: '£', name: 'British Pound (GBP)' },
  AED: { rate: 0.0367, symbol: 'د.إ', name: 'UAE Dirham (AED)' },
  SAR: { rate: 0.0375, symbol: '﷼', name: 'Saudi Riyal (SAR)' },
  USDT: { rate: 0.01, symbol: '₮', name: 'Tether USDT (TRC-20)' },
};

const MIN_WITHDRAW_COINS = 200; // Minimum 200 coins ($2.00 / ₹170)

export const GlobalPayoutModal: React.FC<GlobalPayoutModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCoinsUpdated,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethodType>('paypal');
  const [coinsToWithdraw, setCoinsToWithdraw] = useState<number>(MIN_WITHDRAW_COINS);
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');

  const userCoins = currentUser?.coins ?? 0;

  const isOwnerAdmin =
    currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com' ||
    currentUser?.username?.toLowerCase() === 'naushad' ||
    currentUser?.role === 'admin';

  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = subscribeToUserPayouts(currentUser.id, (list) => {
      setPayoutHistory(list);
    });
    return () => unsub();
  }, [currentUser?.id]);

  if (!isOpen) return null;

  // Non-Admin Protection: Only Admin / Owner can withdraw funds
  if (!isOwnerAdmin) {
    return (
      <div
        id="global-payout-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-zinc-950 border-2 border-purple-800/60 rounded-3xl p-6 text-center shadow-2xl relative space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
            <Coins className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-white">Instagrand In-App Wallet</h3>
          <p className="text-xs text-zinc-400">
            Coins are for in-app unlocks, VIP profile badges, AI video filters, gifts and lucky spins. Direct cash withdrawals are reserved for the platform administrator.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-bold cursor-pointer hover:from-purple-500 hover:to-fuchsia-500"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  const currentCurrencyInfo = CONVERSION_RATES[selectedCurrency];
  const calculatedFiatAmount = coinsToWithdraw * currentCurrencyInfo.rate;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (coinsToWithdraw < MIN_WITHDRAW_COINS) {
      setStatusMessage({
        type: 'error',
        text: `Minimum withdrawal is ${MIN_WITHDRAW_COINS} coins (${currentCurrencyInfo.symbol}${(MIN_WITHDRAW_COINS * currentCurrencyInfo.rate).toFixed(2)}).`,
      });
      return;
    }

    if (coinsToWithdraw > userCoins) {
      setStatusMessage({
        type: 'error',
        text: `Insufficient balance. You currently have ${userCoins} coins in your wallet.`,
      });
      return;
    }

    if (!accountDetails.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide your payout account details (e.g. PayPal email, UPI ID, Bank IBAN, or USDT TRC-20 Address).',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await requestGlobalPayoutInFirestore({
        userId: currentUser.id,
        username: currentUser.username || 'naushad',
        email: currentUser.email || 'user@instagrand.app',
        coinsAmount: coinsToWithdraw,
        currency: selectedCurrency,
        fiatAmount: calculatedFiatAmount,
        payoutMethod,
        payoutAccountDetails: accountDetails.trim(),
      });

      if (res.success) {
        onCoinsUpdated(res.newCoins);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setStatusMessage({
          type: 'success',
          text: `🎉 Payout request submitted! ${currentCurrencyInfo.symbol}${calculatedFiatAmount.toFixed(2)} will be transferred to your account within 24-48 hours.`,
        });
        setAccountDetails('');
        setTimeout(() => {
          setActiveTab('history');
        }, 1800);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to submit payout request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="global-payout-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="global-payout-modal-container"
        className="w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Header */}
        <div className="relative p-5 bg-gradient-to-r from-amber-950/90 via-purple-950/80 to-zinc-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Global Multi-Currency Payout</span>
                <span className="text-[10px] bg-amber-500/30 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                  All Countries
                </span>
              </h2>
              <p className="text-xs text-amber-200/80">
                Watch & Listen to Earn · Instant Bank, PayPal & Crypto Transfers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('withdraw');
              setStatusMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'withdraw'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Withdraw Cash</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Payout History ({payoutHistory.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          {activeTab === 'withdraw' ? (
            <form onSubmit={handleWithdraw} className="space-y-4">
              {/* Balance Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-zinc-900 to-purple-950/30 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Available Earning Balance
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Coins className="w-6 h-6 text-amber-400" />
                    <span className="text-2xl font-black text-amber-300 font-mono">
                      {userCoins.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-400 font-bold">Coins</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block">Est. Value ({selectedCurrency})</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {currentCurrencyInfo.symbol}
                    {(userCoins * currentCurrencyInfo.rate).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Notice */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Currency Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Select Payout Currency
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {(Object.keys(CONVERSION_RATES) as CurrencyCode[]).map((cur) => {
                    const info = CONVERSION_RATES[cur];
                    const isSelected = selectedCurrency === cur;
                    return (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => setSelectedCurrency(cur)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <div className="text-xs font-black">{cur}</div>
                        <div className="text-[10px] text-zinc-500">{info.symbol}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payout Methods */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Select Global Payout Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'paypal', name: 'PayPal', icon: '🅿️', desc: 'Global Email' },
                    { id: 'stripe_bank', name: 'Bank Transfer', icon: '🏦', desc: 'SWIFT / IBAN / ACH' },
                    { id: 'upi', name: 'UPI / Paytm', icon: '⚡', desc: 'India Direct Bank' },
                    { id: 'crypto_usdt', name: 'USDT (TRC-20)', icon: '₮', desc: 'Instant Crypto' },
                    { id: 'wise', name: 'Wise / Revolut', icon: '🌍', desc: 'International Multi' },
                  ].map((m) => {
                    const isSelected = payoutMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPayoutMethod(m.id as PayoutMethodType)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-purple-950/60 border-fuchsia-500 text-white shadow-lg'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">{m.icon}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" />}
                        </div>
                        <div className="mt-1.5">
                          <div className="text-xs font-bold">{m.name}</div>
                          <div className="text-[9px] text-zinc-500">{m.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coins to Withdraw Slider / Quick Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-300">Amount to Withdraw</span>
                  <span className="text-amber-400 font-mono">
                    {coinsToWithdraw} Coins = {currentCurrencyInfo.symbol}
                    {calculatedFiatAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  {[200, 500, 1000, 2500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCoinsToWithdraw(amt)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        coinsToWithdraw === amt
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {amt}🪙
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCoinsToWithdraw(Math.max(MIN_WITHDRAW_COINS, userCoins))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 text-amber-300 border border-amber-500/40 hover:bg-zinc-700 cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Account Details Input */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  {payoutMethod === 'paypal' && 'PayPal Account Email'}
                  {payoutMethod === 'stripe_bank' && 'Bank Account Number & SWIFT/IFSC Code'}
                  {payoutMethod === 'upi' && 'UPI ID / VPA (e.g. yourname@oksbi or paytm)'}
                  {payoutMethod === 'crypto_usdt' && 'USDT TRC-20 Wallet Address (Tron Network)'}
                  {payoutMethod === 'wise' && 'Wise Email or Account Details'}
                </label>
                <input
                  type="text"
                  required
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={
                    payoutMethod === 'paypal'
                      ? 'your.email@example.com'
                      : payoutMethod === 'upi'
                      ? 'username@upi'
                      : payoutMethod === 'crypto_usdt'
                      ? 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'
                      : 'Account Number, Branch, IFSC / SWIFT'
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Bank-grade encryption · Fast 24h automated settlement
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || userCoins < MIN_WITHDRAW_COINS}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm tracking-wide shadow-lg transition-all transform active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Payout Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      Withdraw {currentCurrencyInfo.symbol}
                      {calculatedFiatAmount.toFixed(2)} ({coinsToWithdraw} Coins)
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Payout History Tab */
            <div className="space-y-3">
              {payoutHistory.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                  <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
                  <div className="text-xs font-bold text-zinc-300">No Payout Requests Yet</div>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    Start streaming Hindi songs, new Salawat, and watching videos to accumulate coins!
                  </p>
                </div>
              ) : (
                payoutHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-black">
                          {item.currency === 'INR' ? '₹' : item.currency === 'USD' ? '$' : '₮'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {item.currency} {item.fiatAmount.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {item.payoutMethod.toUpperCase()} · {item.coinsAmount} Coins
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          item.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : item.status === 'processing'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : item.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[10px] text-zinc-500 font-mono truncate">
                      Account: {item.payoutAccountDetails}
                    </div>

                    <div className="text-[9px] text-zinc-600 flex items-center justify-between border-t border-zinc-800/60 pt-1.5">
                      <span>Ref #{item.id.slice(0, 10)}</span>
                      <span>{new Date(item.requestedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
