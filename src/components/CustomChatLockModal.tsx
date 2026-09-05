import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  X,
  Fingerprint,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomChatLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
  participantName: string;
  participantUsername: string;
  currentPin?: string;
  currentOwnerId?: string;
  currentUserId?: string;
  currentUserEmail?: string;
  securityQuestion?: string;
  onSavePin: (
    threadId: string,
    newPin: string,
    isLocked: boolean,
    hint?: string,
    securityQuestion?: string,
    securityAnswer?: string,
    ownerId?: string,
    ownerEmail?: string
  ) => void;
  onRemoveLock: (threadId: string) => void;
}

export const CustomChatLockModal: React.FC<CustomChatLockModalProps> = ({
  isOpen,
  onClose,
  threadId,
  participantName,
  participantUsername,
  currentPin,
  currentOwnerId,
  currentUserId = 'usr_naushad_primary',
  currentUserEmail = 'noushadalam5507@gmail.com',
  securityQuestion: initialQuestion,
  onSavePin,
  onRemoveLock,
}) => {
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [securityHint, setSecurityHint] = useState<string>('');
  const [securityQuestion, setSecurityQuestion] = useState<string>(
    initialQuestion || 'What is your registered recovery mobile or birth year?'
  );
  const [securityAnswer, setSecurityAnswer] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [enableLock, setEnableLock] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (enableLock) {
      if (!newPin || newPin.length < 4) {
        setError('Please enter a secret PIN of at least 4 digits (e.g. 1234, 9876)');
        return;
      }
      if (newPin !== confirmPin) {
        setError('PIN codes do not match. Please re-enter identical PINs.');
        return;
      }
      if (!securityAnswer.trim()) {
        setError('Please set a secret recovery answer so ONLY YOU can reset if forgotten.');
        return;
      }

      onSavePin(
        threadId,
        newPin,
        true,
        securityHint,
        securityQuestion,
        securityAnswer.trim().toLowerCase(),
        currentUserId,
        currentUserEmail
      );
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setSuccessMessage('🔒 Custom Owner PIN & Anti-Hack Recovery Activated!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } else {
      onRemoveLock(threadId);
      setSuccessMessage('🔓 Chat lock removed successfully.');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      id="custom-chat-lock-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="custom-chat-lock-modal-card"
        className="w-full max-w-md rounded-3xl bg-zinc-950 border-2 border-purple-500/60 p-6 space-y-5 shadow-[0_0_50px_rgba(168,85,247,0.35)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-400 p-0.5 shadow-lg">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-fuchsia-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Owner Custom Chat PIN</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900 text-cyan-300 font-bold border border-purple-700">
                  Owner Lock
                </span>
              </div>
              <p className="text-xs text-purple-300">
                Protect chat with <span className="text-white font-bold">{participantName}</span> (@{participantUsername})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Protection Banner */}
        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Strict Owner-Only Access</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Only you (the lock owner) can view this chat or reset the PIN with your security recovery answer. Unauthorized users cannot open or reset this lock.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Lock State Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/80 border border-purple-900/50">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-fuchsia-400" />
              <div>
                <div className="text-xs font-bold text-white">Enable Custom Chat PIN</div>
                <div className="text-[10px] text-zinc-400">Require PIN code on open</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEnableLock(!enableLock)}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                enableLock ? 'bg-fuchsia-600 justify-end' : 'bg-zinc-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {enableLock && (
            <div className="space-y-3.5">
              {/* Enter New PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                  <span>Enter Custom 4-6 Digit PIN:</span>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[11px] text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPin ? 'Hide' : 'Show'} PIN</span>
                  </button>
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  placeholder="e.g. 1234 or 9876"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-purple-900/60 focus:border-fuchsia-500 text-white font-mono text-center tracking-widest text-lg focus:outline-none"
                />
              </div>

              {/* Confirm PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-200">
                  Confirm Custom PIN:
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  placeholder="Re-enter your secret PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-purple-900/60 focus:border-fuchsia-500 text-white font-mono text-center tracking-widest text-lg focus:outline-none"
                />
              </div>

              {/* Secret Security Recovery Question & Answer */}
              <div className="space-y-2 pt-1 border-t border-purple-950">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Secret Security Question (For Owner PIN Reset):</span>
                  </label>
                  <input
                    type="text"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    placeholder="e.g. What is your secret recovery word or birth year?"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-purple-900/60 focus:border-amber-400 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Secret Security Answer (Only you know this):</span>
                  </label>
                  <input
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="e.g. naushad2026"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-purple-900/60 focus:border-cyan-400 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Secret Recovery Hint */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Password Reminder Hint (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. My birth year"
                  value={securityHint}
                  onChange={(e) => setSecurityHint(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-purple-900/60 focus:border-purple-500 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {currentPin && (
              <button
                type="button"
                onClick={() => {
                  onRemoveLock(threadId);
                  onClose();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-rose-400 text-xs font-bold border border-rose-900/40 transition-all cursor-pointer"
              >
                Disable Lock
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Save Secret PIN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
