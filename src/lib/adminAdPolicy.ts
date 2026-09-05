import { UserProfile } from '../types';

/**
 * Admin Ad Protection Policy Helper
 * In strict compliance with Google AdMob & AdSense policies:
 * Publishers/Admins are strictly prohibited from viewing, clicking, or rendering
 * their own live or test ad units to prevent invalid traffic (IVT) and account suspension.
 */

export const ADMIN_EMAILS = [
  'noushadalam5507@gmail.com',
  'naushad@instagrand.com',
  'admin@instagrand.com',
];

export const ADMIN_USERNAMES = ['naushad', 'admin', 'md_naushad'];

/**
 * Checks if the current user is an authorized platform administrator or owner
 */
export function isAdminUser(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const email = (user.email || '').toLowerCase().trim();
  const username = (user.username || '').toLowerCase().trim();
  if (email === 'noushadalam5507@gmail.com' || email.includes('noushadalam5507')) return true;
  if (ADMIN_EMAILS.some((e) => email.includes(e))) return true;
  if (ADMIN_USERNAMES.includes(username) || username === 'naushad') return true;
  return false;
}

/**
 * Checks if the current browser / device is registered as the Admin's primary hardware
 */
export function isAdminDevice(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const isSavedAdmin = localStorage.getItem('instagrand_admin_device_registered');
    if (isSavedAdmin === 'true') return true;

    // Check saved session user
    const savedUserStr = localStorage.getItem('instagrand_current_user');
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      if (isAdminUser(savedUser)) return true;
    }
  } catch (e) {
    // Ignore parse error
  }
  return false;
}

/**
 * Register this device as an admin hardware node
 */
export function registerAdminDevice(isAdmin: boolean): void {
  if (typeof window === 'undefined') return;
  if (isAdmin) {
    localStorage.setItem('instagrand_admin_device_registered', 'true');
  } else {
    localStorage.removeItem('instagrand_admin_device_registered');
  }
}

/**
 * Returns true if ads (video, interstitial, banner) MUST be completely blocked
 * from loading, fetching, or rendering on this account/device.
 * 1. Admin/Publishers (compliance with IVT policy)
 * 2. Premium Studio Pass holders (100% ad-free experience)
 */
export function shouldBlockAds(user: UserProfile | null | undefined): boolean {
  if (user?.hasStudioPass) return true;
  return isAdminUser(user) || isAdminDevice();
}
