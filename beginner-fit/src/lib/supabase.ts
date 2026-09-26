import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import type { ProfileDraft } from '@/state/profile';
import { toDbEquipment } from '@/utils/equipment';
import type { PlanItem } from '@/utils/types';

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

export type SavedPlan = { id: string; week: number; days: PlanItem[][]; source: 'ai' | 'fallback' | 'adapted'; note: string | null };
export type ExerciseDetail = { id: string; name: string; equipment: string | null; primaryMuscles: string[]; instructions: string[]; images: string[] };

// free-exercise-db image paths are relative to its repo. ponytail: hotlinked; self-host before launch (PRD open question).
const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

/** Asks the server for this user's week-1 plan (built once, then returned as saved). */
export async function generatePlan(): Promise<SavedPlan> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.functions.invoke<SavedPlan>('generate-plan', { method: 'POST' });
  if (error || !data) throw error ?? new Error('No plan returned');
  return data;
}

export async function fetchExercises(ids: string[]): Promise<Record<string, ExerciseDetail>> {
  if (!supabase || !ids.length) return {};
  const { data, error } = await supabase.from('exercises').select('id, name, equipment, primary_muscles, instructions, images').in('id', ids);
  if (error) throw error;
  return Object.fromEntries(
    data.map((r) => [
      r.id,
      { id: r.id, name: r.name, equipment: r.equipment, primaryMuscles: r.primary_muscles, instructions: r.instructions, images: r.images.map((i: string) => IMAGE_BASE + i) },
    ]),
  );
}

/** On launch: the signed-in user's saved answers and latest plan, or null for a first run. */
export async function loadSaved(): Promise<{ draft: Partial<ProfileDraft>; plan: SavedPlan | null } | null> {
  if (!supabase) return null;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const [{ data: p }, { data: plan }] = await Promise.all([
    supabase.from('profiles').select('*').maybeSingle(),
    supabase.from('plans').select('*').order('week', { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!p) return null;
  return {
    draft: {
      goal: p.goal ?? undefined,
      daysPerWeek: p.days_per_week,
      minutesPerSession: p.minutes_per_session,
      place: p.place,
      gear: p.gear,
      answers: p.screening,
      injuredAreas: p.injured_areas,
      clearedQuestions: p.cleared_questions,
      disclaimerAcceptedAt: p.disclaimer_accepted_at ?? undefined,
    },
    plan: plan as SavedPlan | null,
  };
}
