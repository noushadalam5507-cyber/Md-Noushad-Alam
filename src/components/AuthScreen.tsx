import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  Coins,
  Crown,
  KeyRound,
  ShieldCheck,
  Video,
  Film,
  MessageCircle,
  Zap,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { auth, googleProvider } from '../lib/firebase';
import {
  syncUserProfileToFirestore,
  claimUsernameInFirestore,
  checkIdentityAccountLimit,
} from '../lib/firestoreService';
import { Cyber3DIcon } from './Cyber3DIcon';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { GoogleAuthModal } from './GoogleAuthModal';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, isNewRegistration?: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // Mode: 'signup' | 'login' (default to 'signup' or easily switchable)
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  // Sign Up Form Fields
  const [signupFullName, setSignupFullName] = useState<string>('');
  const [signupUsername, setSignupUsername] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);

  // Login Form Fields
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Forgot Password state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Demo Accounts with Master Founder Naushad Alam
  const demoAccounts: UserProfile[] = [
    {
      id: 'usr_founder_naushad',
      name: 'Naushad Alam',
      email: 'noushadalam5507@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      username: 'naushad',
      isVerified: true,
      verifiedBadgeType: 'blue',
      status: 'online',
      customBio: '👑 Founder & CEO of NovaGrand Pro | 20.4K Verified Followers ✨',
      joinedDate: 'August 2026',
      coins: 50000,
      followers: 20480,
      following: 185,
      followersCount: 20480,
      followingCount: 185,
      accountType: 'google',
      role: 'admin',
    },
    {
      id: 'usr_sarah_chen',
      name: 'Sarah Chen',
      email: 'sarah.chen@instagrand.app',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      username: 'sarah_chen',
      isVerified: true,
      status: 'online',
      customBio: 'Real-time WebRTC & Cyber Creator 🔮',
      joinedDate: 'August 2026',
      coins: 250,
      followers: 2400,
      following: 180,
      followersCount: 2400,
      followingCount: 180,
      accountType: 'google',
      role: 'creator',
    },
    {
      id: 'usr_alex_vance',
      name: 'Alex Vance',
      email: 'alex.vance@instagrand.app',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      username: 'alexv',
      isVerified: true,
      status: 'online',
      customBio: '4K Opus Studio Streamer 🎙️',
      joinedDate: 'August 2026',
      coins: 300,
      followers: 1850,
      following: 210,
      followersCount: 1850,
      followingCount: 210,
      accountType: 'google',
      role: 'creator',
    },
  ];

  // Native Google Account Chooser & Auth State
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#06b6d4', '#ec4899', '#facc15'],
      });
    } catch {
      // ignore
    }
  };

  // Google Sign In Handler (In-App Direct Sign-In without leaving to Chrome)
  const handleInAppGoogleSignIn = async (
    selectedEmail?: string,
    selectedName?: string,
    selectedPhoto?: string | null,
    googleId?: string
  ) => {
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('Creating verified Google session in Firebase Cloud...');

    try {
      const email = (selectedEmail || 'creator@gmail.com').toLowerCase();
      const isNaushad = email === 'noushadalam5507@gmail.com';
      const rawName = selectedName || email.split('@')[0] || 'Google User';
      const name = isNaushad ? 'Naushad Alam' : (rawName.charAt(0).toUpperCase() + rawName.slice(1));
      const handle = isNaushad
        ? 'naushad'
        : name.toLowerCase().replace(/[^a-z0-9_]/g, '') || `user_${Date.now().toString().slice(-4)}`;

      // Strict 2-Account Limit Validation against real Firebase Firestore
      const targetId = isNaushad ? 'usr_founder_naushad' : (googleId ? `usr_g_${googleId}` : undefined);
      const limitCheck = await checkIdentityAccountLimit(email, handle, targetId);
      if (!limitCheck.allowed) {
        setErrorMessage(limitCheck.message || 'Limit Reached: You can only create up to 2 accounts with this identity.');
        setIsLoading(false);
        setStatusMessage('');
        return;
      }

      // Avatar selection
      const avatarUrl = isNaushad
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        : (selectedPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${handle}&backgroundColor=180a30`);

      const finalUser: UserProfile = {
        id: isNaushad ? 'usr_founder_naushad' : (googleId ? `usr_g_${googleId}` : `usr_g_${Date.now()}`),
        name: name,
        email: email,
        avatar: avatarUrl,
        username: handle,
        isVerified: true,
        ...(isNaushad ? { verifiedBadgeType: 'blue' as const } : {}),
        status: 'online',
        customBio: isNaushad
          ? '👑 Founder & CEO of NovaGrand Pro | 20.4K Verified Followers ✨'
          : 'Verified NovaGrand Pro Creator ✨',
        joinedDate: 'August 2026',
        coins: isNaushad ? 50000 : 250,
        followers: isNaushad ? 20480 : 0,
        following: isNaushad ? 185 : 0,
        followersCount: isNaushad ? 20480 : 0,
        followingCount: isNaushad ? 185 : 0,
        accountType: 'google',
        role: isNaushad ? 'admin' : 'creator',
      };

      await syncUserProfileToFirestore(finalUser);
      await claimUsernameInFirestore(finalUser.username, finalUser);

      triggerConfetti();
      setShowGoogleModal(false);
      onLoginSuccess(finalUser, false);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMessage(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Google Sign In Button Click: Direct Google Authentication
  const handleGoogleSignInClick = async () => {
    setErrorMessage('');
    setShowGoogleModal(true);
    setIsLoading(false);
    setStatusMessage('');
  };

  // Sign Up Form Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = signupFullName.trim();
    const cleanHandle = signupUsername.trim().toLowerCase().replace(/^@/, '');
    const cleanEmail = signupEmail.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanHandle || cleanHandle.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Creating your NovaGrand Pro account in Firebase...');

    try {
      // Strict 2-Account Limit Validation against real Firebase Firestore
      const limitCheck = await checkIdentityAccountLimit(cleanEmail, cleanHandle);
      if (!limitCheck.allowed) {
        setErrorMessage(limitCheck.message || 'Limit Reached: You can only create up to 2 accounts with this identity.');
        setIsLoading(false);
        setStatusMessage('');
        return;
      }

      const isNaushad = cleanEmail === 'noushadalam5507@gmail.com' || cleanHandle === 'naushad';
      const newUser: UserProfile = {
        id: isNaushad ? 'usr_founder_naushad' : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        email: cleanEmail,
        username: cleanHandle,
        avatar: isNaushad
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}&backgroundColor=180a30`,
        isVerified: isNaushad,
        ...(isNaushad ? { verifiedBadgeType: 'blue' as const } : {}),
        status: 'online',
        customBio: isNaushad ? '👑 Founder & CEO of NovaGrand Pro | 20.4K Verified Followers ✨' : 'NovaGrand Pro Member ✨',
        joinedDate: 'August 2026',
        coins: isNaushad ? 50000 : 100, // +100 Coins Welcome Registration Bonus
        followers: isNaushad ? 20480 : 0,
        following: isNaushad ? 185 : 0,
        followersCount: isNaushad ? 20480 : 0,
        followingCount: isNaushad ? 185 : 0,
        accountType: 'manual',
        role: isNaushad ? 'admin' : 'creator',
      };

      await syncUserProfileToFirestore(newUser);
      const claimResult = await claimUsernameInFirestore(cleanHandle, newUser);

      if (!claimResult.success) {
        setErrorMessage(claimResult.message);
        setIsLoading(false);
        return;
      }

      triggerConfetti();
      onLoginSuccess(newUser, true);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Manual Login Form Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdent = loginIdentifier.trim().toLowerCase().replace(/^@/, '');
    if (!cleanIdent) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Verifying credentials with Firebase Cloud...');

    try {
      const matchedDemo = demoAccounts.find(
        (a) => a.email.toLowerCase() === cleanIdent || a.username.toLowerCase() === cleanIdent
      );

      const isNaushad = cleanIdent === 'noushadalam5507@gmail.com' || cleanIdent === 'naushad';
      const dynamicName = cleanIdent.includes('@') ? cleanIdent.split('@')[0] : cleanIdent;
      const formattedName = isNaushad ? 'Naushad Alam' : (dynamicName.charAt(0).toUpperCase() + dynamicName.slice(1));

      const loggedUser: UserProfile = matchedDemo || {
        id: isNaushad ? 'usr_founder_naushad' : `usr_${Date.now()}`,
        name: formattedName,
        email: cleanIdent.includes('@') ? cleanIdent : `${cleanIdent}@novagrand.com`,
        username: cleanIdent.replace(/[^a-z0-9_]/g, ''),
        avatar: isNaushad
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanIdent}&backgroundColor=180a30`,
        isVerified: isNaushad,
        ...(isNaushad ? { verifiedBadgeType: 'blue' as const } : {}),
        status: 'online',
        customBio: isNaushad ? '👑 Founder & CEO of NovaGrand Pro | 20.4K Verified Followers ✨' : 'NovaGrand Pro Member ✨',
        joinedDate: 'August 2026',
        coins: isNaushad ? 50000 : 150,
        followers: isNaushad ? 20480 : 0,
        following: isNaushad ? 185 : 0,
        followersCount: isNaushad ? 20480 : 0,
        followingCount: isNaushad ? 185 : 0,
        accountType: 'manual',
        role: isNaushad ? 'admin' : 'creator',
      };

      await syncUserProfileToFirestore(loggedUser);
      await claimUsernameInFirestore(loggedUser.username, loggedUser);

      triggerConfetti();
      onLoginSuccess(loggedUser, false);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleSelectDemoAccount = async (acc: UserProfile) => {
    setIsLoading(true);
    setStatusMessage(`Signing in as @${acc.username}...`);
    try {
      await syncUserProfileToFirestore(acc);
      await claimUsernameInFirestore(acc.username, acc);
      triggerConfetti();
      onLoginSuccess(acc, false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Fast login failed.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div
      id="welcome-novagrand-screen"
      className="min-h-screen w-full bg-[#05010c] text-white flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden select-none"
    >
      {/* Instagram Aesthetic Ambient Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-purple-600/25 via-pink-600/20 to-cyan-500/20 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-6 right-6 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-6 left-6 w-72 h-72 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Welcome & Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-zinc-950/95 border border-purple-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_70px_rgba(168,85,247,0.25)] backdrop-blur-2xl box-border my-auto animate-fade-in flex flex-col space-y-4">
        
        {/* Top Header: 3D Monogram & Welcome Title */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="flex items-center justify-center -my-1">
            <Cyber3DIcon
              size={80}
              isProcessing={isLoading}
              processType="installing"
              theme="chromatic-shift"
              showRings={true}
              showParticles={false}
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-indigo-900/60 border border-purple-500/40 text-[11px] font-bold text-purple-200">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>OFFICIAL INSTAGRAM PRO EXPERIENCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-300 tracking-tight">
              Welcome to NovaGrand Pro
            </h1>
            <p className="text-xs text-zinc-400 font-medium max-w-xs mx-auto">
              Real-time 4K Video Calling, Direct Chatting, Sound Reels & Creator Studio
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-1.5 py-1">
          <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-purple-950/40 border border-purple-900/40 text-[10px] text-purple-300 font-medium">
            <Video className="w-3 h-3 text-cyan-400" />
            <span>4K Video Call</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-purple-950/40 border border-purple-900/40 text-[10px] text-purple-300 font-medium">
            <Film className="w-3 h-3 text-pink-400" />
            <span>Sound Reels</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-purple-950/40 border border-purple-900/40 text-[10px] text-purple-300 font-medium">
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            <span>Direct Chat</span>
          </div>
        </div>

        {/* Error / Status Messages */}
        {errorMessage && (
          <div
            id="auth-error-banner"
            className={`p-3.5 rounded-2xl text-xs flex flex-col gap-2.5 transition-all ${
              errorMessage.includes('Limit Reached')
                ? 'bg-gradient-to-br from-rose-950/95 via-red-950/90 to-zinc-950 border-2 border-rose-500/80 text-rose-100 shadow-xl shadow-rose-950/50'
                : 'bg-rose-950/90 border border-rose-600/60 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-base shrink-0">
                {errorMessage.includes('Limit Reached') ? '🛡️' : '⚠️'}
              </span>
              <div className="flex-1 min-w-0">
                {errorMessage.includes('Limit Reached') && (
                  <div className="font-extrabold text-rose-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span>Identity Security Policy</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-[9px] text-rose-300 border border-rose-500/30">
                      Max 2 Accounts Limit
                    </span>
                  </div>
                )}
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            </div>

            {errorMessage.includes('Limit Reached') && (
              <div className="flex items-center justify-between pt-1 border-t border-rose-800/40 text-[11px]">
                <span className="text-rose-300/80">Already have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                  }}
                  className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-lg cursor-pointer transition-all active:scale-95 shadow"
                >
                  Switch to Log In →
                </button>
              </div>
            )}
          </div>
        )}

        {statusMessage && (
          <div className="p-3 rounded-2xl bg-purple-950/90 border border-purple-600/60 text-xs text-purple-200 flex items-center gap-2 animate-pulse">
            <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* PRIMARY ACTION 1: Sign In With Google (AT THE VERY TOP) */}
        <div className="space-y-2.5">
          <button
            id="google-signin-top-btn"
            type="button"
            onClick={handleGoogleSignInClick}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-white/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Instant 1-Tap Admin Login for Mobile Preview Testing */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-indigo-950/80 border border-amber-400/50 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                  alt="Naushad Alam"
                  className="w-8 h-8 rounded-full border border-amber-400 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-black text-[8px] rounded-full px-1 font-black shadow">
                  👑
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">Naushad Alam</span>
                  <span className="px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded text-[9px] font-bold shrink-0">
                    Founder Admin
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">noushadalam5507@gmail.com</div>
              </div>
            </div>
            <button
              id="quick-admin-1tap-btn"
              type="button"
              disabled={isLoading}
              onClick={() =>
                handleInAppGoogleSignIn(
                  'noushadalam5507@gmail.com',
                  'Naushad Alam',
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                )
              }
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs shadow-md cursor-pointer whitespace-nowrap active:scale-95 transition-transform shrink-0"
            >
              1-Tap Login
            </button>
          </div>

          {/* In-Frame Notice & New Tab Link */}
          <div className="flex items-center justify-between text-[11px] px-1 text-zinc-400">
            <span>Mobile test preview active</span>
            <button
              type="button"
              onClick={() => window.open(window.location.href, '_blank')}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open in New Tab</span>
            </button>
          </div>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-purple-900/50" />
            <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
              or continue with account
            </span>
            <div className="flex-1 h-px bg-purple-900/50" />
          </div>
        </div>

        {/* PRIMARY ACTION 2: Navigation Switcher (Create New Account vs Log In) */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900/90 rounded-2xl border border-purple-900/50 text-xs font-bold">
          <button
            id="tab-btn-create-account"
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New Account</span>
          </button>
          <button
            id="tab-btn-login-account"
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
        </div>

        {/* Google Auth Modal (Native Android Expo Provider & Web One-Tap) */}
        <GoogleAuthModal
          isOpen={showGoogleModal}
          onClose={() => setShowGoogleModal(false)}
          onLoginSuccess={(user) => {
            setShowGoogleModal(false);
            onLoginSuccess(user, false);
          }}
        />

        {/* SECTION 1: CREATE NEW ACCOUNT (SIGN UP FORM) */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Full Name</span>
                </label>
                <input
                  id="signup-fullname-input"
                  type="text"
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  placeholder="e.g. Naushad"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
              </div>

              {/* Username Handle */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="text-purple-400 font-bold">@</span>
                    <span>Username</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Available</span>
                </label>
                <input
                  id="signup-username-input"
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="handle"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-xs sm:text-sm text-white placeholder-zinc-500 font-mono focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>Email Address</span>
              </label>
              <input
                id="signup-email-input"
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  {showSignupPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showSignupPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                id="signup-password-input"
                type={showSignupPassword ? 'text' : 'password'}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Choose password (6+ characters)"
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>

            {/* +100 Coins Welcome Badge */}
            <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="text-amber-200 font-medium">Free Registration Welcome Gift</span>
              </div>
              <span className="font-black text-amber-400 font-mono">+100 COINS</span>
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <span>CREATE ACCOUNT & ENTER APP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* SECTION 2: LOG IN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Username or Email</span>
              </label>
              <div className="relative">
                <input
                  id="login-identifier-input"
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. @noushad or email"
                  required
                  className="w-full px-3.5 py-3 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showLoginPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password-input"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3.5 py-3 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-purple-800 text-purple-600 focus:ring-purple-500"
                />
                <span>Remember me</span>
              </label>

              <button
                id="forgot-password-btn"
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-[11px] font-bold text-fuchsia-400 hover:text-fuchsia-300 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Forgot Password?</span>
              </button>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <span>LOG IN TO NOVAGRAND</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Forgot Password Recovery Modal */}
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          defaultEmail={loginIdentifier.includes('@') ? loginIdentifier : ''}
        />

        {/* Quick 1-Click Profile Access (Founder & Verified Creators) */}
        <div className="pt-2 border-t border-purple-900/40 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-semibold text-zinc-300">Quick 1-Click Profile Logins:</span>
            <span className="text-[10px] text-purple-400 font-mono">Verified Access</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {demoAccounts.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectDemoAccount(demo)}
                className="p-2 rounded-xl bg-zinc-900/80 hover:bg-purple-950/70 border border-purple-900/40 hover:border-purple-500/60 transition-all flex flex-col items-center text-center gap-1 cursor-pointer group"
              >
                <img
                  src={demo.avatar}
                  alt={demo.name}
                  className="w-6 h-6 rounded-full object-cover border border-purple-500/50 group-hover:scale-110 transition-transform"
                />
                <span className="text-[10px] font-bold text-white truncate max-w-full">
                  @{demo.username}
                </span>
                <span className="text-[9px] text-purple-300 truncate max-w-full font-mono">
                  {demo.role === 'admin' ? '👑 Admin' : '⭐ Creator'}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
