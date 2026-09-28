import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import type { ProfileDraft } from '@/state/profile';
import { toDbEquipment } from '@/utils/equipment';
import { fromLogRow } from '@/utils/progress';
import type { LogEntry, PlanItem } from '@/utils/types';

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

export type SavedPlan = {
  id: string; week: number; days: PlanItem[][]; source: 'ai' | 'fallback' | 'adapted'; note: string | null;
  changes: string[]; see_professional: boolean };
export type ExerciseDetail = { id: string; name: string; equipment: string | null; primaryMuscles: string[]; instructions: string[]; images: string[] };

// free-exercise-db image paths are relative to its repo. ponytail: hotlinked; self-host before launch (PRD open question).
const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

/** The user's current plan. The server builds week 1 on first call, and next week once every day is logged. */
export async function generatePlan(): Promise<SavedPlan> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.functions.invoke<SavedPlan>('generate-plan', { method: 'POST' });
  if (error || !data) throw error ?? new Error('No plan returned');
  return data;
}

/** Saves one finished workout day. */
export async function saveLogs(entries: Omit<LogEntry, 'loggedOn'>[]): Promise<LogEntry[]> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase
    .from('workout_logs')
    .insert(
      entries.map((e) => ({
        plan_id: e.planId,
        day: e.day,
        exercise_id: e.exerciseId,
        completed: e.completed,
        difficulty: e.difficulty,
        pain: e.pain,
        pain_area: e.painArea,
      })),
    )
    .select();
  if (error) throw error;
  return data.map(fromLogRow);
}

/** Deletes the account and everything saved for it, then clears the local session. */
export async function deleteAccount(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) throw error;
  await supabase.auth.signOut({ scope: 'local' });
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
export async function loadSaved(): Promise<{ draft: Partial<ProfileDraft>; plan: SavedPlan | null; logs: LogEntry[] } | null> {
  if (!supabase) return null;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const [{ data: p }, { data: plan }, { data: logs }] = await Promise.all([
    supabase.from('profiles').select('*').maybeSingle(),
    supabase.from('plans').select('*').order('week', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('workout_logs').select('*').order('created_at'),
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
    logs: (logs ?? []).map(fromLogRow),
  };
}
