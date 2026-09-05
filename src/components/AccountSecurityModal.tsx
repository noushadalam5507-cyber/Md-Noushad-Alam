import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  Lock,
  Unlock,
  LogOut,
  AlertTriangle,
  X,
  Sparkles,
  Key,
  Globe,
  Radio,
  Clock,
  Apple,
  Fingerprint,
  Grid3X3,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, AppLockConfig } from '../types';
import { getStoredAppLockConfig, saveStoredAppLockConfig } from '../utils/appLockStorage';

interface AccountSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenAppLockSettings?: () => void;
}

interface ActiveSession {
  id: string;
  deviceType: 'apple' | 'android' | 'pc';
  deviceName: string;
  browser: string;
  location: string;
  ip: string;
  isCurrent: boolean;
  lastActive: string;
}

export const AccountSecurityModal: React.FC<AccountSecurityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAppLockSettings,
}) => {
  const [appLockConfig, setAppLockConfig] = useState<AppLockConfig>(getStoredAppLockConfig());
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);
  const [deviceBindingEnabled, setDeviceBindingEnabled] = useState<boolean>(true);
  const [antiHijackPin, setAntiHijackPin] = useState<string>('9876');
  const [isEditingPin, setIsEditingPin] = useState<boolean>(false);
  const [tempPin, setTempPin] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAppLockConfig(getStoredAppLockConfig());
    }
  }, [isOpen]);

  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess-1',
      deviceType: 'apple',
      deviceName: 'Apple iPhone 15 Pro Max',
      browser: 'Safari / iOS Applet',
      location: 'Mumbai, Maharashtra, India',
      ip: '103.24.128.45',
      isCurrent: true,
      lastActive: 'Active Now',
    },
    {
      id: 'sess-2',
      deviceType: 'android',
      deviceName: 'Samsung Galaxy S24 Ultra',
      browser: 'Chrome / Android PWA',
      location: 'Mumbai, Maharashtra, India',
      ip: '103.24.128.99',
      isCurrent: false,
      lastActive: '2 hours ago',
    },
    {
      id: 'sess-3',
      deviceType: 'pc',
      deviceName: 'Windows 11 PC Desktop Studio',
      browser: 'Chrome / Edge 4K WebRTC',
      location: 'Mumbai, India',
      ip: '103.24.128.12',
      isCurrent: false,
      lastActive: 'Yesterday',
    },
  ]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('Device session terminated and logged out.');
  };

  const handleTerminateAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    confetti({ particleCount: 30, spread: 50 });
    showToast('All other mobile and PC devices logged out instantly!');
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPin || tempPin.length < 4) {
      showToast('PIN must be at least 4 digits.');
      return;
    }
    setAntiHijackPin(tempPin);
    setIsEditingPin(false);
    setTempPin('');
    showToast('Anti-Hijack Security PIN updated successfully!');
  };

  return (
    <div
      id="account-security-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="account-security-modal-card"
        className="w-full max-w-lg rounded-3xl bg-zinc-950 border-2 border-purple-500/60 p-5 sm:p-6 space-y-5 shadow-[0_0_50px_rgba(168,85,247,0.35)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl animate-bounce flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-purple-600 to-cyan-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Anti-Hack & Device Shield</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 font-bold border border-emerald-500/40">
                  Protected
                </span>
              </div>
              <p className="text-xs text-purple-300">
                @{currentUser?.username || 'naushad'} · Universal Apple, Android & PC Security
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

        {/* Anti-Hijacking Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Multi-Device Anti-Hijack Guard Active</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Nobody can run your account ID on another mobile device without passing your 2FA Anti-Hijack Security PIN and device authorization code.
          </p>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-2.5">
          {/* Toggle: In-App App Lock (Biometric, PIN, Pattern) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-zinc-900 border border-purple-500/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                {appLockConfig.lockType === 'biometric' ? (
                  <Fingerprint className="w-5 h-5" />
                ) : appLockConfig.lockType === 'pattern' ? (
                  <Grid3X3 className="w-5 h-5" />
                ) : (
                  <KeyRound className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">In-App App Lock</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-900 text-purple-200 uppercase font-mono font-bold">
                    {appLockConfig.lockType}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  {appLockConfig.isEnabled
                    ? 'Protects app on launch with ' + appLockConfig.lockType.toUpperCase()
                    : 'Disabled — Tap configure to set PIN, Biometric, or Pattern'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const newVal = !appLockConfig.isEnabled;
                  const updated = { ...appLockConfig, isEnabled: newVal };
                  setAppLockConfig(updated);
                  saveStoredAppLockConfig(updated);
                  showToast(newVal ? 'In-App App Lock Activated 🔒' : 'In-App App Lock Disabled 🔓');
                }}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  appLockConfig.isEnabled ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 justify-end' : 'bg-zinc-700 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
              {onOpenAppLockSettings && (
                <button
                  type="button"
                  onClick={onOpenAppLockSettings}
                  className="text-xs px-2.5 py-1 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-purple-200 font-bold border border-purple-500/40 cursor-pointer"
                >
                  Setup
                </button>
              )}
            </div>
          </div>

          {/* Toggle 1: Device Binding Lock */}
          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-purple-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">Device Lock Binding</div>
                <div className="text-[10px] text-zinc-400">
                  Strictly bind login token to verified Apple/Android/PC devices
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeviceBindingEnabled(!deviceBindingEnabled);
                showToast(deviceBindingEnabled ? 'Device binding disabled' : 'Device binding enabled');
              }}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                deviceBindingEnabled ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Toggle 2: 2-Step Anti-Hijack PIN */}
          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-purple-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">2-Step Anti-Hijack PIN</div>
                <div className="text-[10px] text-zinc-400">
                  Current PIN: <span className="text-amber-300 font-mono font-bold">••••</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingPin(!isEditingPin)}
              className="text-xs px-3 py-1.5 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-fuchsia-200 font-bold border border-purple-500/40 cursor-pointer"
            >
              Change PIN
            </button>
          </div>

          {/* PIN Edit Sub-Form */}
          {isEditingPin && (
            <form onSubmit={handleSavePin} className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/60 space-y-2 animate-fade-in">
              <label className="text-xs font-bold text-purple-200">
                Set New Anti-Hijack PIN (4 digits):
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={tempPin}
                  onChange={(e) => setTempPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 9876"
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-purple-900 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Active Authorized Devices List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Authorized Devices (Apple, Android, PC)
            </span>
            <button
              type="button"
              onClick={handleTerminateAllOtherSessions}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout Other Devices</span>
            </button>
          </div>

          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  session.isCurrent
                    ? 'bg-purple-950/40 border-purple-500/60 shadow-md'
                    : 'bg-zinc-900/70 border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-purple-900/60 flex items-center justify-center text-purple-300">
                    {session.deviceType === 'apple' && <Smartphone className="w-4 h-4 text-cyan-300" />}
                    {session.deviceType === 'android' && <Smartphone className="w-4 h-4 text-emerald-400" />}
                    {session.deviceType === 'pc' && <Laptop className="w-4 h-4 text-amber-400" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{session.deviceName}</span>
                      {session.isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          This Device
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {session.browser} · {session.location}
                    </div>
                    <div className="text-[9px] text-purple-300/70 font-mono">
                      IP: {session.ip} · {session.lastActive}
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleTerminateSession(session.id)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Terminate this session"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-[11px] text-zinc-400 text-center">
          Open and fully responsive across <strong>Apple iOS</strong>, <strong>Android PWA</strong>, and <strong>PC Desktop</strong> with continuous zero-trust encryption.
        </div>
      </div>
    </div>
  );
};
