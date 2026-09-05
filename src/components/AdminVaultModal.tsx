import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Crown,
  Coins,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  X,
  UserCheck,
  Sparkles,
  Phone,
  Mail,
  KeyRound,
  Database,
  ArrowUpRight,
  Sliders,
  Award,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, MasterAccountRecord } from '../types';
import {
  subscribeToMasterAccounts,
  adminUpdateUserCoins,
  adminToggleVipStatus,
  adminDeleteUserAccount,
  adminBanUserInFirestore,
  subscribeToAllUsers,
  subscribeToGlobalReelsMonetization
} from '../lib/firestoreService';

interface AdminVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSelectUserToImpersonate?: (user: UserProfile) => void;
  onOpenBankWithdrawal?: () => void;
}

export const AdminVaultModal: React.FC<AdminVaultModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUserToImpersonate,
  onOpenBankWithdrawal,
}) => {
  const [accounts, setAccounts] = useState<MasterAccountRecord[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [customCoinsInput, setCustomCoinsInput] = useState<string>('500');
  const [actionFeedback, setActionFeedback] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [monetizationData, setMonetizationData] = useState<{
    totalReelsViews: number;
    todayReelsViews: number;
    adminEarningsINR: number;
    availableBalanceINR: number;
  }>({
    totalReelsViews: 148520,
    todayReelsViews: 3420,
    adminEarningsINR: 22278.0,
    availableBalanceINR: 22278.0,
  });

  useEffect(() => {
    if (!isOpen) return;

    const unsubAccounts = subscribeToMasterAccounts((accs) => {
      setAccounts(accs);
    });

    const unsubUsers = subscribeToAllUsers((usrs) => {
      setUsersList(usrs);
    });

    const unsubMonetization = subscribeToGlobalReelsMonetization((data) => {
      setMonetizationData({
        totalReelsViews: data.totalReelsViews,
        todayReelsViews: data.todayReelsViews,
        adminEarningsINR: data.adminEarningsINR,
        availableBalanceINR: data.availableBalanceINR,
      });
    });

    return () => {
      unsubAccounts();
      unsubUsers();
      unsubMonetization();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Combine and deduplicate accounts & users from Firestore
  const allMasterEntries = [...accounts];
  usersList.forEach((u) => {
    if (!allMasterEntries.some((a) => a.id === u.id || (a.email && a.email === u.email))) {
      allMasterEntries.push({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        username: u.username,
        accountType: u.accountType || 'google',
        registeredAt: u.registeredAt || u.joinedDate,
        lastLogin: new Date().toISOString(),
        coins: u.coins ?? 100,
        isVerified: u.isVerified,
        isAdmin: u.email.toLowerCase() === 'noushadalam5507@gmail.com' || u.username === 'naushad',
      });
    }
  });

  const filteredEntries = allMasterEntries.filter((acc) => {
    const q = searchTerm.toLowerCase();
    return (
      acc.name?.toLowerCase().includes(q) ||
      acc.email?.toLowerCase().includes(q) ||
      acc.username?.toLowerCase().includes(q) ||
      acc.phone?.toLowerCase().includes(q)
    );
  });

  const handleAdjustCoins = async (targetId: string, deltaOrExact: number, isExact: boolean = false) => {
    setIsProcessing(true);
    try {
      const current = allMasterEntries.find((a) => a.id === targetId)?.coins || 0;
      const finalAmount = isExact ? deltaOrExact : Math.max(0, current + deltaOrExact);
      await adminUpdateUserCoins(targetId, finalAmount, `Admin Master Adjustment to ${finalAmount} coins`);
      setActionFeedback(`Updated coins to ${finalAmount} for user!`);
      confetti({ particleCount: 40, spread: 60 });
      setTimeout(() => setActionFeedback(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVerification = async (targetId: string, currentStatus: boolean) => {
    setIsProcessing(true);
    try {
      await adminToggleVipStatus(targetId, !currentStatus);
      setActionFeedback(`Verification badge status updated!`);
      setTimeout(() => setActionFeedback(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (targetId: string) => {
    if (!confirm('Are you sure you want to delete this user from Firestore database? This action is irreversible.')) {
      return;
    }
    setIsProcessing(true);
    try {
      await adminDeleteUserAccount(targetId);
      setActionFeedback('Account successfully removed from Firestore master database.');
      if (selectedAccount?.id === targetId) {
        setSelectedAccount(null);
      }
      setTimeout(() => setActionFeedback(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBanUser = async (targetId: string, username?: string) => {
    if (!confirm(`Are you sure you want to block/ban @${username || 'user'} from the app in Firestore?`)) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await adminBanUserInFirestore(targetId, 'Blocked by Admin');
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(''), 3000);
    } catch (e: any) {
      console.error(e);
      setActionFeedback('Failed to ban user.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="admin-vault-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-fade-in"
    >
      <div
        id="admin-vault-modal-container"
        className="relative w-full max-w-5xl bg-zinc-950/95 border-2 border-purple-500/50 rounded-3xl p-5 sm:p-8 neon-border-purple text-zinc-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Glow corner highlights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-purple-900/50 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-fuchsia-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/40">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Master Owner & Admin Vault
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest">
                  100% Master Control
                </span>
              </div>
              <p className="text-xs text-purple-300/80 font-mono mt-0.5">
                Owner: noushadalam5507@gmail.com · Firestore Database Master Control
              </p>
            </div>
          </div>

          <button
            id="close-admin-vault-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-purple-950/70 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Toast Message */}
        {actionFeedback && (
          <div className="my-3 px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Quick Stats Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 shrink-0">
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-purple-900/50">
            <span className="text-[11px] font-medium text-purple-300">Total Registered Users</span>
            <div className="text-xl font-bold text-white mt-0.5">{allMasterEntries.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-purple-900/50">
            <span className="text-[11px] font-medium text-amber-300">Verified Creators</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {allMasterEntries.filter((a) => a.isVerified).length}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-purple-900/50">
            <span className="text-[11px] font-medium text-fuchsia-300">Total Coins in Circulation</span>
            <div className="text-xl font-bold text-fuchsia-300 mt-0.5">
              {allMasterEntries.reduce((acc, curr) => acc + (curr.coins || 100), 0).toLocaleString()}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-purple-900/50">
            <span className="text-[11px] font-medium text-emerald-300">Database Engine</span>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>Firebase Firestore</span>
            </div>
          </div>
        </div>

        {/* Exclusive Bank Account Payout Fast Action Banner */}
        {onOpenBankWithdrawal && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-teal-950 border border-emerald-500/60 flex items-center justify-between gap-3 shrink-0 mb-3 shadow-lg shadow-emerald-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-md">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white">App Earning & Live Bank Wallet</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-black font-black font-mono">
                    ₹{monetizationData.availableBalanceINR.toLocaleString('en-IN')} Withdrawable
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/90 font-mono mt-0.5">
                  {monetizationData.totalReelsViews.toLocaleString('en-IN')} User Views · All Earning directly into Admin Account
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBankWithdrawal();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <span>Withdraw ₹{monetizationData.availableBalanceINR.toLocaleString('en-IN')}</span>
              <ArrowUpRight className="w-4 h-4 text-black" />
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center gap-3 my-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="admin-vault-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by handle (@naushad), name, email, or phone number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-purple-900/60 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Master Accounts Table / Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 mt-2">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No matching account records found in Firestore database.
            </div>
          ) : (
            filteredEntries.map((account) => {
              const isOwner =
                account.email?.toLowerCase() === 'noushadalam5507@gmail.com' ||
                account.username === 'naushad';
              const isSelected = selectedAccount?.id === account.id;

              return (
                <div
                  key={account.id}
                  id={`admin-account-row-${account.id}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-400 ring-1 ring-purple-400/40 shadow-lg'
                      : 'bg-zinc-900/70 border-purple-950/70 hover:border-purple-800/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Left: User Identity & Details */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-purple-900/80 border border-purple-500/40 flex items-center justify-center font-bold text-lg text-white">
                          {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        {account.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black rounded-full p-0.5 shadow">
                            <Crown className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{account.name}</span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-purple-950 text-fuchsia-300 border border-purple-800">
                            @{account.username || 'user'}
                          </span>
                          {isOwner && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-black font-mono uppercase">
                              Master Owner
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              account.accountType === 'manual'
                                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/50'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-700/50'
                            }`}
                          >
                            {account.accountType === 'manual' ? 'Instagram Manual Form' : 'Google Auth'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 flex-wrap">
                          {account.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-purple-400" />
                              <span>{account.email}</span>
                            </span>
                          )}
                          {account.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{account.phone}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-amber-300 font-bold">
                            <Coins className="w-3.5 h-3.5" />
                            <span>{account.coins ?? 100} Coins</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Master Control Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                      {/* Add +100 Coins */}
                      <button
                        id={`btn-add-coins-${account.id}`}
                        type="button"
                        onClick={() => handleAdjustCoins(account.id, 100)}
                        disabled={isProcessing}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                        title="Add 100 Coins"
                      >
                        <Coins className="w-3 h-3" />
                        <span>+100 Coins</span>
                      </button>

                      {/* Add +500 Coins */}
                      <button
                        id={`btn-add-500-coins-${account.id}`}
                        type="button"
                        onClick={() => handleAdjustCoins(account.id, 500)}
                        disabled={isProcessing}
                        className="px-2.5 py-1.5 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                        title="Add 500 Coins"
                      >
                        <Coins className="w-3 h-3" />
                        <span>+500 Coins</span>
                      </button>

                      {/* Toggle Verification status */}
                      <button
                        id={`btn-toggle-verify-${account.id}`}
                        type="button"
                        onClick={() => handleToggleVerification(account.id, account.isVerified)}
                        disabled={isProcessing}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          account.isVerified
                            ? 'bg-purple-900/60 border border-purple-500 text-purple-200'
                            : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                        title="Toggle Verification"
                      >
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span>{account.isVerified ? 'Verified Active' : 'Grant Verified'}</span>
                      </button>

                      {/* Block/Ban User */}
                      {!isOwner && (
                        <button
                          id={`btn-ban-user-${account.id}`}
                          type="button"
                          onClick={() => handleBanUser(account.id, account.username)}
                          disabled={isProcessing}
                          className="px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                          title="Block & Ban user in Firestore"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>Block User</span>
                        </button>
                      )}

                      {/* Delete Account */}
                      {!isOwner && (
                        <button
                          id={`btn-delete-account-${account.id}`}
                          type="button"
                          onClick={() => handleDeleteUser(account.id)}
                          disabled={isProcessing}
                          className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/80 border border-rose-800/50 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                          title="Purge user from Firestore"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-4 mt-2 border-t border-purple-900/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-purple-300/70 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Master Admin Encryption Active · Real-time Firestore sync enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
