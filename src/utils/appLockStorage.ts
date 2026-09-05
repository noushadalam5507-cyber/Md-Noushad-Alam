import { AppLockConfig } from '../types';

const STORAGE_KEY = 'instagrand_in_app_lock_config_v1';
const SESSION_UNLOCKED_KEY = 'instagrand_app_unlocked_session_v1';

export const DEFAULT_APP_LOCK_CONFIG: AppLockConfig = {
  isEnabled: false,
  lockType: 'pin',
  pinCode: '1234',
  patternPath: [0, 1, 2, 4, 6, 7, 8], // Classic Z-shape
  biometricType: 'fingerprint',
  biometricEnabled: true,
  autoLockDelay: 'immediately',
  recoveryQuestion: 'What is your registered creator handle or city?',
  recoveryAnswer: 'naushad',
  hideNotificationPreview: true,
  hapticFeedback: true,
  scramblePinPad: false,
};

export const getStoredAppLockConfig = (): AppLockConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_LOCK_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_APP_LOCK_CONFIG, ...parsed };
  } catch (e) {
    console.error('Failed to read app lock config from localStorage', e);
    return DEFAULT_APP_LOCK_CONFIG;
  }
};

export const saveStoredAppLockConfig = (config: AppLockConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('instagrand:applock-updated', { detail: config }));
  } catch (e) {
    console.error('Failed to save app lock config to localStorage', e);
  }
};

export const isSessionUnlocked = (): boolean => {
  try {
    return sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'unlocked_true';
  } catch {
    return false;
  }
};

export const setSessionUnlocked = (unlocked: boolean): void => {
  try {
    if (unlocked) {
      sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'unlocked_true');
      const cfg = getStoredAppLockConfig();
      saveStoredAppLockConfig({ ...cfg, lastUnlockedAt: Date.now() });
    } else {
      sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
    }
  } catch (e) {
    console.error('Failed to set session unlock state', e);
  }
};
