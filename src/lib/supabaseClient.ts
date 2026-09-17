import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Environment variables support for Vite, Next.js, and standard CRA
const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any)?.env) ? (import.meta as any).env : {};
const procEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};

const envUrl = metaEnv.VITE_SUPABASE_URL || procEnv.NEXT_PUBLIC_SUPABASE_URL || procEnv.REACT_APP_SUPABASE_URL || '';
const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || procEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || procEnv.REACT_APP_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(envUrl && envKey);

// Real client when credentials exist; otherwise dummy client with graceful fallback
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? envUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? envKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Guest / Local User Profile Management (Rule: No fake personas, honest user state)
const GUEST_STORAGE_KEY = 'trailfinder_user_profile';

export function getLocalUserProfile(): UserProfile {
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Local storage unavailable (private browsing)
  }

  // Authentic guest user with generated UUID for local session
  const guestUser: UserProfile = {
    id: `guest-${Math.random().toString(36).substring(2, 10)}`,
    fullName: 'Guest Driver',
    defaultRig: 'Jeep Wrangler 4x4',
    createdAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
  } catch (e) {}

  return guestUser;
}

export function saveLocalUserProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getLocalUserProfile();
  const updated: UserProfile = { ...current, ...profile };
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}
