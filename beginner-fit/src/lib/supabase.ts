import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import type { ProfileDraft } from '@/state/profile';
import { toDbEquipment } from '@/utils/equipment';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY; // publishable (or legacy anon) key — public by design

/** null until .env has the project URL and publishable key (see .env.example). */
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;

// Only refresh the session while the app is in the foreground.
if (supabase) {
  AppState.addEventListener('change', (state) => (state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()));
}

/** Signs in anonymously the first time, so the free trial starts without an account. */
async function userId(): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error || !anon.user) throw error ?? new Error('Anonymous sign-in failed');
  return anon.user.id;
}

/** Saves onboarding answers. Returns false when the backend isn't configured (local dev). */
export async function saveProfile(d: ProfileDraft): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('profiles').upsert({
    user_id: await userId(),
    goal: d.goal,
    days_per_week: d.daysPerWeek,
    minutes_per_session: d.minutesPerSession,
    place: d.place,
    gear: d.gear,
    equipment: toDbEquipment(d.place, d.gear),
    injured_areas: d.injuredAreas,
    screening: d.answers,
    cleared_questions: d.clearedQuestions,
    disclaimer_accepted_at: d.disclaimerAcceptedAt,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return true;
}
