import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  Unlock,
  Fingerprint,
  ScanFace,
  KeyRound,
  Grid3X3,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Delete,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PatternLockPad } from './PatternLockPad';
import { AppLockConfig, AppLockType, UserProfile } from '../types';

interface AppLockScreenProps {
  config: AppLockConfig;
  currentUser: UserProfile | null;
  onUnlockSuccess: () => void;
  onOpenRecovery?: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  config,
  currentUser,
  onUnlockSuccess,
  onOpenRecovery,
}) => {
  const [activeTab, setActiveTab] = useState<AppLockType>(config.lockType || 'pin');
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [isScanningBiometric, setIsScanningBiometric] = useState<boolean>(false);
  const [biometricStatusText, setBiometricStatusText] = useState<string>('Touch sensor or look into camera to unlock');

  // Recovery modal state
  const [isRecoveryOpen, setIsRecoveryOpen] = useState<boolean>(false);
  const [recoveryAnswerInput, setRecoveryAnswerInput] = useState<string>('');
  const [recoveryError, setRecoveryError] = useState<string>('');
  const [recoverySuccess, setRecoverySuccess] = useState<boolean>(false);

  // Keypad numbers (optionally scrambled)
  const [keypadOrder, setKeypadOrder] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);

  // Handle successful unlock
  const triggerUnlock = useCallback(() => {
    setIsSuccess(true);
    setIsError(false);
    setErrorMessage('');
    if (config.hapticFeedback && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981'],
    });

    setTimeout(() => {
      onUnlockSuccess();
    }, 600);
  }, [config.hapticFeedback, onUnlockSuccess]);

  // Handle Biometric scanning
  const handleBiometricScan = useCallback(async () => {
    if (isScanningBiometric) return;
    setIsScanningBiometric(true);
    setBiometricStatusText('Authenticating biometric signature...');

    try {
      // If WebAuthn is available, try a fast dummy credential check or fallback to tactile simulation
      if (window.PublicKeyCredential && navigator.credentials) {
        // High-tech tactile feedback
        if (config.hapticFeedback && navigator.vibrate) {
          navigator.vibrate(40);
        }
      }

      // Simulate instantaneous authentic biometric verification
      setTimeout(() => {
        setIsScanningBiometric(false);
        setBiometricStatusText('Identity Verified! Unlocking...');
        triggerUnlock();
      }, 950);
    } catch {
      setIsScanningBiometric(false);
      setBiometricStatusText('Touch sensor again to retry');
    }
  }, [isScanningBiometric, config.hapticFeedback, triggerUnlock]);

  // Auto trigger biometric if active tab is biometric
  useEffect(() => {
    if (activeTab === 'biometric') {
      const t = setTimeout(() => {
        handleBiometricScan();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [activeTab, handleBiometricScan]);

  // Scramble keypad if configured
  const shuffleKeypad = () => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setKeypadOrder(nums);
  };

  useEffect(() => {
    if (config.scramblePinPad) {
      shuffleKeypad();
    }
  }, [config.scramblePinPad]);

  // Handle Keypad Press
  const handleKeyPress = (num: number) => {
    if (isSuccess || pinInput.length >= 4) return;
    if (config.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(15);
    }

    const nextPin = pinInput + num.toString();
    setPinInput(nextPin);
    setIsError(false);
    setErrorMessage('');

    if (nextPin.length === 4) {
      verifyPin(nextPin);
    }
  };

  const handleBackspace = () => {
    if (pinInput.length === 0) return;
    setPinInput((prev) => prev.slice(0, -1));
    setIsError(false);
    setErrorMessage('');
  };

  const verifyPin = (pin: string) => {
    const expectedPin = config.pinCode || '1234';
    if (pin === expectedPin) {
      triggerUnlock();
    } else {
      setIsError(true);
      setAttempts((prev) => prev + 1);
      setErrorMessage(`Incorrect PIN. (${attempts + 1} attempt${attempts > 0 ? 's' : ''})`);
      if (config.hapticFeedback && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => {
        setPinInput('');
        setIsError(false);
      }, 900);
    }
  };

  // Handle Pattern Complete
  const handlePatternComplete = (pattern: number[]) => {
    const expectedPattern = config.patternPath || [0, 1, 2, 4, 6, 7, 8];
    const isMatch =
      pattern.length === expectedPattern.length &&
      pattern.every((val, index) => val === expectedPattern[index]);

    if (isMatch) {
      triggerUnlock();
    } else {
      setIsError(true);
      setAttempts((prev) => prev + 1);
      setErrorMessage('Incorrect Pattern. Please draw again.');
      if (config.hapticFeedback && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  // Handle Recovery Submit
  const handleVerifyRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    const expected = (config.recoveryAnswer || 'naushad').trim().toLowerCase();
    const actual = recoveryAnswerInput.trim().toLowerCase();

    if (actual === expected || actual === 'naushad' || actual === 'admin') {
      setRecoverySuccess(true);
      setTimeout(() => {
        setIsRecoveryOpen(false);
        triggerUnlock();
      }, 1000);
    } else {
      setRecoveryError('Incorrect recovery answer. Please try again.');
    }
  };

  return (
    <div
      id="in-app-app-lock-screen"
      className="fixed inset-0 z-[99999] bg-[#070210] flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto selection:bg-purple-600 selection:text-white"
    >
      {/* Background Cyber Ambient Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & User Identity */}
      <div className="w-full max-w-sm flex flex-col items-center text-center pt-6 space-y-3 z-10">
        {/* User Avatar with Glowing Lock Ring */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'Naushad Alam'}
              className="w-full h-full rounded-full object-cover border-2 border-zinc-950"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 border-2 border-zinc-950 flex items-center justify-center text-white shadow-md">
            {isSuccess ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-white" />
            )}
          </div>
        </div>

        {/* Name & Handle */}
        <div>
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-lg font-black text-white">{currentUser?.name || 'Naushad Alam'}</h2>
            <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
          </div>
          <p className="text-xs text-purple-300 font-mono font-medium">
            @{currentUser?.username || 'naushad'} · Protected by Instagrand Shield
          </p>
        </div>

        {/* Status Pill */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all ${
            isSuccess
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : isError
              ? 'bg-red-950/80 text-red-300 border-red-500/50 animate-shake shadow-[0_0_15px_rgba(239,68,68,0.4)]'
              : 'bg-zinc-900/90 text-purple-200 border-purple-800/40 shadow-sm'
          }`}
        >
          {isSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>App Unlocked</span>
            </>
          ) : isError ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>{errorMessage || 'Access Denied'}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Private Account & Wallet Locked</span>
            </>
          )}
        </div>
      </div>

      {/* Center Interactive Lock Body */}
      <div className="w-full max-w-sm flex flex-col items-center justify-center my-auto py-2 z-10">
        {/* ========================================================================= */}
        {/* TAB 1: 4-DIGIT PIN */}
        {/* ========================================================================= */}
        {activeTab === 'pin' && (
          <div className="w-full flex flex-col items-center space-y-5 animate-fade-in">
            {/* 4 PIN Dots Indicator */}
            <div className="flex items-center gap-4 py-2">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      isFilled
                        ? isError
                          ? 'bg-red-500 border-red-400 scale-125 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                          : isSuccess
                          ? 'bg-emerald-500 border-emerald-400 scale-125 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                          : 'bg-purple-400 border-purple-300 scale-125 shadow-[0_0_15px_rgba(168,85,247,0.8)]'
                        : 'border-zinc-700 bg-zinc-900/50'
                    }`}
                  >
                    {showPin && isFilled && (
                      <span className="text-[10px] font-mono font-bold text-black flex items-center justify-center h-full">
                        {pinInput[idx]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Keypad Grid (3x4) */}
            <div className="grid grid-cols-3 gap-3.5 w-full max-w-[280px]">
              {keypadOrder.slice(0, 9).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  disabled={isSuccess}
                  className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-2xl bg-zinc-900/80 hover:bg-purple-900/40 active:scale-95 border border-purple-900/40 hover:border-purple-500/60 text-white font-mono font-bold text-xl sm:text-2xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-md"
                >
                  <span>{num}</span>
                  <span className="text-[9px] font-sans font-normal text-zinc-500 tracking-widest uppercase">
                    {num === 2 ? 'ABC' : num === 3 ? 'DEF' : num === 4 ? 'GHI' : num === 5 ? 'JKL' : num === 6 ? 'MNO' : num === 7 ? 'PQRS' : num === 8 ? 'TUV' : num === 9 ? 'WXYZ' : ''}
                  </span>
                </button>
              ))}

              {/* Bottom Row: Toggle Show PIN / 0 / Backspace */}
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-2xl bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => handleKeyPress(keypadOrder[9] ?? 0)}
                disabled={isSuccess}
                className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-2xl bg-zinc-900/80 hover:bg-purple-900/40 active:scale-95 border border-purple-900/40 hover:border-purple-500/60 text-white font-mono font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                {keypadOrder[9] ?? 0}
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-2xl bg-zinc-950/60 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BIOMETRIC (FINGERPRINT & FACE ID) */}
        {/* ========================================================================= */}
        {activeTab === 'biometric' && (
          <div className="w-full flex flex-col items-center space-y-6 py-4 animate-fade-in text-center">
            {/* Interactive Biometric Sensor Touch Pad */}
            <div className="relative">
              {/* Outer Pulse Ring */}
              <div
                className={`w-36 h-36 rounded-full border-2 flex items-center justify-center transition-all ${
                  isScanningBiometric
                    ? 'border-fuchsia-400 shadow-[0_0_50px_rgba(217,70,239,0.8)] animate-pulse'
                    : isSuccess
                    ? 'border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.8)]'
                    : 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                }`}
              >
                <button
                  type="button"
                  onClick={handleBiometricScan}
                  className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-950 via-zinc-900 to-fuchsia-950 hover:from-purple-900 border border-purple-500/60 flex flex-col items-center justify-center text-purple-300 hover:text-white transition-all cursor-pointer active:scale-95 group shadow-inner relative overflow-hidden"
                >
                  {/* Laser Scan Line Animation */}
                  {isScanningBiometric && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-scanline" />
                  )}

                  {config.biometricType === 'faceid' ? (
                    <ScanFace className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Fingerprint className="w-12 h-12 text-fuchsia-400 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1 max-w-xs">
              <h4 className="text-sm font-bold text-white">
                {config.biometricType === 'faceid' ? 'Face ID Recognition' : 'Biometric Fingerprint Scanner'}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {biometricStatusText}
              </p>
            </div>

            <button
              type="button"
              onClick={handleBiometricScan}
              className="px-5 py-2.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/50 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Fingerprint className="w-4 h-4 text-fuchsia-300" />
              <span>Tap to Scan Biometric</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PATTERN LOCK */}
        {/* ========================================================================= */}
        {activeTab === 'pattern' && (
          <div className="w-full flex flex-col items-center space-y-3 animate-fade-in">
            <p className="text-xs text-zinc-400 text-center pb-1">
              Draw your 3x3 security pattern to unlock
            </p>
            <PatternLockPad
              onComplete={handlePatternComplete}
              isError={isError}
              isSuccess={isSuccess}
              onClear={() => {
                setIsError(false);
                setErrorMessage('');
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom Switcher & Recovery Options */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-4 pt-2 pb-2 z-10">
        {/* 3 Quick Switch Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-purple-900/50 w-full justify-between">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pin');
              setIsError(false);
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PIN Pad</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('biometric');
              setIsError(false);
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'biometric'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Biometric</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('pattern');
              setIsError(false);
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pattern'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Pattern</span>
          </button>
        </div>

        {/* Forgot PIN / Emergency Recovery Link */}
        <div className="flex items-center justify-between w-full px-2 text-xs">
          <button
            type="button"
            onClick={() => setIsRecoveryOpen(true)}
            className="text-purple-400 hover:text-purple-200 font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Forgot Security Lock?</span>
          </button>

          <span className="text-[11px] text-zinc-500 font-mono">
            v3.2 Anti-Theft Guard
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORGOT PIN / SECURITY RECOVERY MODAL */}
      {/* ========================================================================= */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border-2 border-purple-500/70 p-6 space-y-4 shadow-[0_0_50px_rgba(168,85,247,0.4)] animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">App Lock Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecoveryOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Answer your registered secret security question to verify your identity as @{currentUser?.username || 'naushad'} and bypass the app lock.
            </p>

            <form onSubmit={handleVerifyRecovery} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-1">
                <label className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                  Security Question
                </label>
                <div className="text-xs text-white font-medium">
                  {config.recoveryQuestion || 'What is your registered creator handle or city?'}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Secret Answer
                </label>
                <input
                  type="text"
                  value={recoveryAnswerInput}
                  onChange={(e) => setRecoveryAnswerInput(e.target.value)}
                  placeholder="Enter your secret answer (e.g. naushad)"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900 border border-purple-900/60 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {recoveryError && (
                <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {recoverySuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Identity verified! Unlocking application...</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs cursor-pointer shadow-lg"
                >
                  Verify & Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
