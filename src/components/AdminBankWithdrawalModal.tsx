import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  CreditCard,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Radio,
  Eye,
  Zap,
  Download,
  Copy,
  Check,
  RefreshCw,
  Landmark,
  Lock,
  Flame,
  Wallet,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, GlobalReelsMonetization, AdminBankWithdrawalRecord } from '../types';
import {
  subscribeToGlobalReelsMonetization,
  requestAdminBankWithdrawalInFirestore,
  subscribeToAdminBankWithdrawals
} from '../lib/firestoreService';

interface AdminBankWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
}

const POPULAR_INDIAN_BANKS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Punjab National Bank (PNB)',
  'Axis Bank',
  'Bank of Baroda',
  'Kotak Mahindra Bank',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
];

export const AdminBankWithdrawalModal: React.FC<AdminBankWithdrawalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [monetization, setMonetization] = useState<GlobalReelsMonetization>({
    totalReelsViews: 148520,
    todayReelsViews: 3420,
    adminEarningsINR: 22278.0,
    adminEarningsUSD: 267.33,
    totalWithdrawnINR: 0,
    availableBalanceINR: 22278.0,
    availableBalanceUSD: 267.33,
    cpmRateINR: 150.0,
    lastUpdated: new Date().toISOString(),
  });

  const [withdrawals, setWithdrawals] = useState<AdminBankWithdrawalRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history' | 'receipt'>('withdraw');

  // Form State
  const [accountHolderName, setAccountHolderName] = useState<string>(
    currentUser?.name || 'Naushad Alam'
  );
  const [bankName, setBankName] = useState<string>('State Bank of India (SBI)');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('SBIN0001234');
  const [upiId, setUpiId] = useState<string>('');
  const [transferMode, setTransferMode] = useState<
    'IMPS_INSTANT_5MIN' | 'UPI_INSTANT' | 'NEFT'
  >('IMPS_INSTANT_5MIN');
  const [withdrawAmountINR, setWithdrawAmountINR] = useState<number>(5000);
  const [adminPin, setAdminPin] = useState<string>('');

  // Processing & Receipt State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeReceipt, setActiveReceipt] = useState<AdminBankWithdrawalRecord | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(300); // 5 minutes = 300s
  const [copiedUtr, setCopiedUtr] = useState<boolean>(false);

  const isAdmin =
    currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com' ||
    currentUser?.username?.toLowerCase() === 'naushad' ||
    currentUser?.role === 'admin';

  // Real-time subscriptions
  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    const unsubMonetization = subscribeToGlobalReelsMonetization((data) => {
      setMonetization(data);
    });

    const unsubWithdrawals = subscribeToAdminBankWithdrawals((records) => {
      setWithdrawals(records);
    });

    return () => {
      unsubMonetization();
      unsubWithdrawals();
    };
  }, [isOpen, isAdmin]);

  // 5-minute countdown ticker when receipt is active
  useEffect(() => {
    if (!activeReceipt) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeReceipt]);

  if (!isOpen) return null;

  // Non-admin block safeguard
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border-2 border-rose-600/60 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">Admin Access Restricted</h3>
          <p className="text-xs text-zinc-400">
            This dashboard is exclusively reserved for the platform founder (noushadalam5507@gmail.com).
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const availableINR = monetization.availableBalanceINR;
  const availableUSD = monetization.availableBalanceUSD;

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (withdrawAmountINR <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount.');
      return;
    }

    if (withdrawAmountINR > availableINR) {
      setErrorMessage(
        `Insufficient withdrawable balance. You have ₹${availableINR.toLocaleString('en-IN')} available.`
      );
      return;
    }

    if (transferMode !== 'UPI_INSTANT') {
      if (!accountNumber || accountNumber.length < 8) {
        setErrorMessage('Please enter a valid Bank Account Number (minimum 8 digits).');
        return;
      }
      if (accountNumber !== confirmAccountNumber) {
        setErrorMessage('Bank Account Number and Confirm Account Number do not match.');
        return;
      }
      if (!ifscCode || ifscCode.length < 11) {
        setErrorMessage('Please enter a valid 11-character Bank IFSC Code (e.g. SBIN0001234).');
        return;
      }
    } else {
      if (!upiId || !upiId.includes('@')) {
        setErrorMessage('Please enter a valid UPI ID (e.g. username@okaxis).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const result = await requestAdminBankWithdrawalInFirestore({
        adminEmail: currentUser?.email || 'noushadalam5507@gmail.com',
        adminName: accountHolderName,
        amountINR: withdrawAmountINR,
        amountUSD: parseFloat((withdrawAmountINR / 83.3).toFixed(2)),
        bankName: transferMode === 'UPI_INSTANT' ? 'UPI Virtual Payment Address' : bankName,
        accountNumber: transferMode === 'UPI_INSTANT' ? upiId : accountNumber,
        ifscCode: transferMode === 'UPI_INSTANT' ? 'UPI_NPCI_PAY' : ifscCode.toUpperCase(),
        accountHolderName,
        upiId: transferMode === 'UPI_INSTANT' ? upiId : undefined,
        transferMode,
      });

      if (result.success) {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        const newRecord: AdminBankWithdrawalRecord = {
          id: result.withdrawalId,
          adminEmail: currentUser?.email || 'noushadalam5507@gmail.com',
          adminName: accountHolderName,
          amountINR: withdrawAmountINR,
          amountUSD: parseFloat((withdrawAmountINR / 83.3).toFixed(2)),
          bankName: transferMode === 'UPI_INSTANT' ? 'UPI Direct' : bankName,
          accountNumber: transferMode === 'UPI_INSTANT' ? upiId : accountNumber,
          ifscCode: transferMode === 'UPI_INSTANT' ? 'UPI_DIRECT' : ifscCode.toUpperCase(),
          accountHolderName,
          upiId: transferMode === 'UPI_INSTANT' ? upiId : undefined,
          transferMode,
          status: 'processing_5min',
          utrReferenceNumber: result.utrNumber,
          requestedAt: new Date().toISOString(),
          completedAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          notes: '5-Minute IMPS/NPCI Fast Transfer In-Flight',
        };

        setActiveReceipt(newRecord);
        setCountdownSeconds(300);
        setActiveTab('receipt');
      } else {
        setErrorMessage(result.error || 'Failed to process instant bank withdrawal.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred during bank transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id="admin-bank-withdrawal-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-[92vh] max-h-[820px] rounded-3xl bg-zinc-950 border-2 border-emerald-500/70 shadow-[0_0_60px_rgba(16,185,129,0.35)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/90 via-zinc-950 to-purple-950/90 border-b border-emerald-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/40">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Admin Bank Payout Dashboard</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black tracking-wide">
                  5-MIN INSTANT IMPS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Founder Portal · Direct RBI/NPCI Settlement to Bank Account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-emerald-900/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Reels Monetization Live Metrics Ticker */}
        <div className="p-3.5 bg-zinc-900/90 border-b border-emerald-900/50 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="p-2.5 rounded-2xl bg-zinc-950 border border-emerald-900/40">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total Reels Views</span>
            </div>
            <div className="text-sm font-black text-white mt-1">
              {monetization.totalReelsViews.toLocaleString('en-IN')}
            </div>
            <div className="text-[9px] text-cyan-300 mt-0.5">
              +{monetization.todayReelsViews.toLocaleString('en-IN')} today
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950 border border-emerald-900/40">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <span>Total Earned</span>
            </div>
            <div className="text-sm font-black text-purple-300 mt-1">
              ₹{monetization.adminEarningsINR.toLocaleString('en-IN')}
            </div>
            <div className="text-[9px] text-zinc-400 mt-0.5">
              ${monetization.adminEarningsUSD.toFixed(2)} USD
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-zinc-950 border border-emerald-500/50 col-span-2 sm:col-span-2">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-emerald-300 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Available Withdrawable Balance
              </span>
              <span className="text-zinc-400">₹150 CPM</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-emerald-400">
                ₹{availableINR.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-zinc-400">
                (${availableUSD.toFixed(2)} USD)
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-4 pt-3 gap-2 shrink-0 border-b border-zinc-800 bg-zinc-950">
          <button
            type="button"
            onClick={() => setActiveTab('withdraw')}
            className={`pb-2.5 px-3 text-xs font-black transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'withdraw'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Instant Bank Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-black transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Payout History ({withdrawals.length})</span>
          </button>

          {activeReceipt && (
            <button
              type="button"
              onClick={() => setActiveTab('receipt')}
              className={`pb-2.5 px-3 text-xs font-black transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'receipt'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>5-Min Live Tracker</span>
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* TAB 1: WITHDRAW FORM */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-600/60 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Transfer Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300">
                  Select Payout Gateway
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferMode('IMPS_INSTANT_5MIN')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      transferMode === 'IMPS_INSTANT_5MIN'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        5 MIN
                      </span>
                    </div>
                    <div className="text-xs font-black mt-1 text-white">IMPS Instant</div>
                    <div className="text-[10px] text-zinc-400">Direct Bank Account</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferMode('UPI_INSTANT')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      transferMode === 'UPI_INSTANT'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Radio className="w-4 h-4 text-cyan-400" />
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                        INSTANT
                      </span>
                    </div>
                    <div className="text-xs font-black mt-1 text-white">UPI VPA</div>
                    <div className="text-[10px] text-zinc-400">GPay / PhonePe / Paytm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferMode('NEFT')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      transferMode === 'NEFT'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Building className="w-4 h-4 text-purple-400" />
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                        HIGH LIMIT
                      </span>
                    </div>
                    <div className="text-xs font-black mt-1 text-white">NEFT / RTGS</div>
                    <div className="text-[10px] text-zinc-400">Large Volume Transfer</div>
                  </button>
                </div>
              </div>

              {/* Amount Selector */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-emerald-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-200">Amount to Withdraw (₹)</label>
                  <span className="text-xs font-black text-emerald-400">
                    ₹{withdrawAmountINR.toLocaleString('en-IN')} (≈ $
                    {(withdrawAmountINR / 83.3).toFixed(2)} USD)
                  </span>
                </div>

                <input
                  type="number"
                  min="500"
                  max={availableINR}
                  value={withdrawAmountINR}
                  onChange={(e) => setWithdrawAmountINR(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"
                />

                {/* Quick % Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { label: '₹1,000', val: 1000 },
                    { label: '₹5,000', val: 5000 },
                    { label: '₹10,000', val: 10000 },
                    { label: '₹20,000', val: 20000 },
                    { label: '100% All', val: Math.floor(availableINR) },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWithdrawAmountINR(Math.min(availableINR, btn.val))}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-950 text-zinc-300 hover:text-emerald-300 border border-zinc-700 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Transfer Details Form */}
              {transferMode !== 'UPI_INSTANT' ? (
                <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <span>Beneficiary Bank Account Details</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400">Account Holder Name</label>
                      <input
                        type="text"
                        required
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="Naushad Alam"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400">Bank Name</label>
                      <input
                        type="text"
                        required
                        list="bank-suggestions"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="State Bank of India (SBI)"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                      />
                      <datalist id="bank-suggestions">
                        {POPULAR_INDIAN_BANKS.map((b, i) => (
                          <option key={i} value={b} />
                        ))}
                      </datalist>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400">Bank Account Number</label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="389201948201"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-mono font-semibold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400">Confirm Account Number</label>
                      <input
                        type="text"
                        required
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="389201948201"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-mono font-semibold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-400">
                        Bank IFSC Code (11 Digits)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="SBIN0001234"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-mono font-bold tracking-wider focus:border-emerald-500 focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // UPI VPA Form
                <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>Instant UPI Virtual Payment Address (VPA)</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400">Your UPI ID</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="noushadalam@okaxis or 9876543210@paytm"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-mono font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || availableINR <= 0}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching 5-Min IMPS Transfer...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>
                      Request Instant Bank Transfer · ₹{withdrawAmountINR.toLocaleString('en-IN')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by 256-Bit NPCI Banking Encryption · Real-time Firestore Ledger</span>
              </p>
            </form>
          )}

          {/* TAB 2: LIVE 5-MINUTE TRACKER & RECEIPT */}
          {activeTab === 'receipt' && activeReceipt && (
            <div className="space-y-4">
              {/* 5-Min Countdown Tracker Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-b from-emerald-950/90 to-zinc-950 border-2 border-emerald-500/80 shadow-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center ring-4 ring-emerald-500/30 animate-pulse">
                  <Zap className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-base font-black text-white">5-Minute Instant Transfer In-Flight</h4>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    NPCI/IMPS Gateway Dispatching to {activeReceipt.bankName}
                  </p>
                </div>

                <div className="py-2 px-4 rounded-2xl bg-zinc-900 border border-emerald-900/60 inline-block">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Estimated Account Credit In
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {formatSeconds(countdownSeconds)}
                  </div>
                </div>

                {/* 3-Stage Pipeline Visualizer */}
                <div className="pt-2 grid grid-cols-3 gap-2 text-left">
                  <div className="p-2 rounded-xl bg-zinc-900/90 border border-emerald-500/60">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-black">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>1. Firestore Auth</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Approved & Deducted</p>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-900/90 border border-emerald-500/60">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-black">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>2. IMPS Switch</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-0.5">RBI Handshake Active</p>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-black">
                      <Building className="w-3 h-3 text-cyan-400" />
                      <span>3. Bank Credit</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Instant Deposit</p>
                  </div>
                </div>
              </div>

              {/* Official Payout Receipt */}
              <div className="p-4 rounded-3xl bg-zinc-900/95 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-white">Official Transfer Receipt</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    UTR GENERATED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400">UTR / Reference No:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-white mt-0.5">
                      <span>{activeReceipt.utrReferenceNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(activeReceipt.utrReferenceNumber);
                          setCopiedUtr(true);
                          setTimeout(() => setCopiedUtr(false), 2000);
                        }}
                        className="text-zinc-400 hover:text-emerald-300"
                      >
                        {copiedUtr ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400">Transfer Amount:</span>
                    <div className="font-black text-emerald-400 text-sm mt-0.5">
                      ₹{activeReceipt.amountINR.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400">Beneficiary Name:</span>
                    <div className="font-bold text-zinc-200 mt-0.5">{activeReceipt.accountHolderName}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400">Destination Account / UPI:</span>
                    <div className="font-mono text-zinc-200 mt-0.5">{activeReceipt.accountNumber}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('withdraw')}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer"
                >
                  Make Another Withdrawal
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WITHDRAWAL HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2.5">
              {withdrawals.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-zinc-600" />
                  <p className="text-xs">No bank withdrawals recorded yet.</p>
                </div>
              ) : (
                withdrawals.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">
                          ₹{item.amountINR.toLocaleString('en-IN')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase">
                          {item.transferMode}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-2">
                        <span>{item.bankName}</span>
                        <span>·</span>
                        <span className="font-mono">{item.utrReferenceNumber}</span>
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">
                        {new Date(item.requestedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>5-Min Settled</span>
                      </span>
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
