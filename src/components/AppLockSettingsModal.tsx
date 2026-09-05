import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Fingerprint,
  Grid3X3,
  ScanFace,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  Sliders,
  Check,
  X,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PatternLockPad } from './PatternLockPad';
import { AppLockConfig, AppLockType, UserProfile } from '../types';
import { getStoredAppLockConfig, saveStoredAppLockConfig } from '../utils/appLockStorage';

interface AppLockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLockNow: () => void;
  onConfigChanged?: (config: AppLockConfig) => void;
}

export const AppLockSettingsModal: React.FC<AppLockSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLockNow,
  onConfigChanged,
}) => {
  const [config, setConfig] = useState<AppLockConfig>(getStoredAppLockConfig());

  // Editing PIN sub-state
  const [isSettingPin, setIsSettingPin] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Editing Pattern sub-state
  const [isSettingPattern, setIsSettingPattern] = useState<boolean>(false);
  const [recordedPattern, setRecordedPattern] = useState<number[] | null>(null);
  const [patternStep, setPatternStep] = useState<'draw' | 'confirm'>('draw');
  const [patternError, setPatternError] = useState<string>('');

  // Toast / feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize when opened
  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredAppLockConfig());
      setIsSettingPin(false);
      setIsSettingPattern(false);
      setPinError('');
      setPatternError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateConfig = (newCfg: AppLockConfig) => {
    setConfig(newCfg);
    saveStoredAppLockConfig(newCfg);
    onConfigChanged?.(newCfg);
  };

  const handleToggleLock = (enabled: boolean) => {
    const updated: AppLockConfig = {
      ...config,
      isEnabled: enabled,
    };
    updateConfig(updated);
    if (enabled) {
      confetti({ particleCount: 40, spread: 60 });
      showToast('🔒 In-App App Lock Enabled! Data and wallet are now protected.');
    } else {
      showToast('🔓 In-App App Lock Disabled.');
    }
  };

  const handleSelectLockType = (type: AppLockType) => {
    const updated: AppLockConfig = {
      ...config,
      lockType: type,
    };
    updateConfig(updated);
    showToast(`Lock method updated to ${type.toUpperCase()}`);
  };

  // PIN Save Handlers
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be exactly 4 numeric digits (e.g. 1234, 9876)');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PIN codes do not match. Please re-enter identical 4-digit PINs.');
      return;
    }

    const updated: AppLockConfig = {
      ...config,
      pinCode: newPin,
      lockType: 'pin',
    };
    updateConfig(updated);
    setIsSettingPin(false);
    setNewPin('');
    setConfirmPin('');
    confetti({ particleCount: 30, spread: 50 });
    showToast('✨ 4-Digit Security PIN successfully updated!');
  };

  // Pattern Save Handlers
  const handlePatternComplete = (pattern: number[]) => {
    setPatternError('');
    if (patternStep === 'draw') {
      if (pattern.length < 4) {
        setPatternError('Pattern must connect at least 4 dots.');
        return;
      }
      setRecordedPattern(pattern);
      setPatternStep('confirm');
      showToast('Draw pattern again to confirm');
    } else if (patternStep === 'confirm') {
      if (
        recordedPattern &&
        pattern.length === recordedPattern.length &&
        pattern.every((val, idx) => val === recordedPattern[idx])
      ) {
        const updated: AppLockConfig = {
          ...config,
          patternPath: pattern,
          lockType: 'pattern',
        };
        updateConfig(updated);
        setIsSettingPattern(false);
        setRecordedPattern(null);
        setPatternStep('draw');
        confetti({ particleCount: 40, spread: 60 });
        showToast('✨ Custom Pattern Lock saved successfully!');
      } else {
        setPatternError('Patterns do not match. Please redraw.');
        setRecordedPattern(null);
        setPatternStep('draw');
      }
    }
  };

  return (
    <div
      id="app-lock-settings-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="app-lock-settings-modal-card"
        className="w-full max-w-lg rounded-3xl bg-zinc-950 border-2 border-purple-500/70 p-5 sm:p-6 space-y-5 shadow-[0_0_50px_rgba(168,85,247,0.35)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold text-xs shadow-2xl animate-bounce flex items-center gap-2 border border-purple-400/40">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-400 p-0.5 shadow-lg">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">In-App App Lock</h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    config.isEnabled
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {config.isEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-purple-200/80">
                Protect private chats, reels, credentials, and wallet coins
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Switch Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-zinc-900 to-fuchsia-950/60 border border-purple-500/40 flex items-center justify-between shadow-md">
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Enable In-App Security Lock</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-xs">
              Requires authentication whenever the app is reopened or resumed.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.isEnabled}
              onChange={(e) => handleToggleLock(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6.5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-fuchsia-600 shadow-inner"></div>
          </label>
        </div>

        {/* ========================================================================= */}
        {/* LOCK METHOD SELECTOR (3 OPTIONS) */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Choose Lock Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Option 1: Biometric */}
            <button
              type="button"
              onClick={() => handleSelectLockType('biometric')}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                config.lockType === 'biometric'
                  ? 'bg-purple-900/40 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  config.lockType === 'biometric'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Biometric</div>
                <div className="text-[10px] text-zinc-400">Fingerprint / Face ID</div>
              </div>
              {config.lockType === 'biometric' && (
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold">
                  Selected
                </div>
              )}
            </button>

            {/* Option 2: 4-Digit PIN */}
            <button
              type="button"
              onClick={() => handleSelectLockType('pin')}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                config.lockType === 'pin'
                  ? 'bg-purple-900/40 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  config.lockType === 'pin'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">4-Digit PIN</div>
                <div className="text-[10px] text-zinc-400">Numeric Passcode</div>
              </div>
              {config.lockType === 'pin' && (
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold">
                  Selected
                </div>
              )}
            </button>

            {/* Option 3: Pattern Lock */}
            <button
              type="button"
              onClick={() => handleSelectLockType('pattern')}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                config.lockType === 'pattern'
                  ? 'bg-purple-900/40 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  config.lockType === 'pattern'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Grid3X3 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Pattern Lock</div>
                <div className="text-[10px] text-zinc-400">3x3 Gesture Grid</div>
              </div>
              {config.lockType === 'pattern' && (
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold">
                  Selected
                </div>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CONFIGURE SELECTED METHOD ACCORDION / EDITORS */}
        {/* ========================================================================= */}
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-purple-900/50 space-y-3">
          {/* If 4-Digit PIN selected */}
          {config.lockType === 'pin' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Current PIN: ••••</h4>
                  <p className="text-[11px] text-zinc-400">Default: 1234 or your custom 4 digits</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingPin(!isSettingPin)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold border border-purple-500/40 transition-colors cursor-pointer"
                >
                  {isSettingPin ? 'Cancel' : 'Change PIN'}
                </button>
              </div>

              {isSettingPin && (
                <form onSubmit={handleSavePin} className="space-y-2.5 pt-2 border-t border-purple-900/40">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">New 4-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-purple-800 text-white text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Confirm PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-purple-800 text-white text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>
                  </div>

                  {pinError && (
                    <div className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{pinError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    Save New PIN
                  </button>
                </form>
              )}
            </div>
          )}

          {/* If Biometric selected */}
          {config.lockType === 'biometric' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Biometric Sensor Type</h4>
                  <p className="text-[11px] text-zinc-400">Touch Sensor / Hardware Face Authentication</p>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-purple-900/50">
                  <button
                    type="button"
                    onClick={() => updateConfig({ ...config, biometricType: 'fingerprint' })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      config.biometricType === 'fingerprint'
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Fingerprint
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConfig({ ...config, biometricType: 'faceid' })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      config.biometricType === 'faceid'
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Face ID
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* If Pattern selected */}
          {config.lockType === 'pattern' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">3x3 Grid Pattern</h4>
                  <p className="text-[11px] text-zinc-400">Current pattern is saved</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingPattern(!isSettingPattern);
                    setPatternStep('draw');
                    setRecordedPattern(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold border border-purple-500/40 transition-colors cursor-pointer"
                >
                  {isSettingPattern ? 'Cancel' : 'Change Pattern'}
                </button>
              </div>

              {isSettingPattern && (
                <div className="pt-2 border-t border-purple-900/40 space-y-2 flex flex-col items-center">
                  <span className="text-xs text-purple-300 font-bold">
                    {patternStep === 'draw'
                      ? 'Step 1: Draw your new 3x3 security pattern'
                      : 'Step 2: Redraw pattern to confirm'}
                  </span>

                  <PatternLockPad
                    onComplete={handlePatternComplete}
                    isError={!!patternError}
                  />

                  {patternError && (
                    <div className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{patternError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Auto Lock Delay Settings */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Auto-Lock Sensitivity
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'immediately', label: 'Immediately' },
              { id: '1min', label: 'After 1 min' },
              { id: '5min', label: 'After 5 mins' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  updateConfig({
                    ...config,
                    autoLockDelay: opt.id as 'immediately' | '1min' | '5min',
                  })
                }
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  config.autoLockDelay === opt.id
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border-purple-900/40 hover:bg-zinc-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Security Recovery Question Section */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-purple-900/40 space-y-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white">Emergency Recovery Security</h4>
          </div>
          <div className="text-xs text-zinc-300">
            Registered security answer for @{currentUser?.username || 'naushad'}:
            <span className="text-purple-300 font-mono ml-1">
              {config.recoveryAnswer ? '•••••••• (Configured)' : 'naushad'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Test Lock Now & Done */}
        <div className="flex items-center gap-2 pt-2 border-t border-purple-900/60">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLockNow();
            }}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-purple-300 hover:text-white border border-purple-700/50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-fuchsia-400 fill-fuchsia-400" />
            <span>Test Lock Screen Now</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 text-white font-bold text-xs shadow-lg cursor-pointer"
          >
            Done & Save
          </button>
        </div>
      </div>
    </div>
  );
};
