import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchExercises, loadSaved, type ExerciseDetail, type SavedPlan } from '@/lib/supabase';
import type { Gear, Place } from '@/utils/equipment';
import type { ScreeningAnswers } from '@/utils/screening';
import type { Area, LogEntry, Profile } from '@/utils/types';

export type ProfileDraft = {
  goal?: Profile['goal'];
  daysPerWeek: number;
  minutesPerSession: number;
  place: Place;
  gear: Gear[];
  noGear: boolean;
  answers: ScreeningAnswers;
  injuredAreas: Area[];
  blockedQuestionId?: string;
  /** Questions the user said a doctor cleared them for (kept for the record). */
  clearedQuestions: string[];
  disclaimerAcceptedAt?: string;
};

const START: ProfileDraft = {
  daysPerWeek: 3,
  minutesPerSession: 30,
  place: 'home',
  gear: [],
  noGear: false,
  answers: {},
  injuredAreas: [],
  clearedQuestions: [],
};

type Ctx = {
  /** false until saved answers (if any) are restored on launch. */
  ready: boolean;
  draft: ProfileDraft;
  update: (patch: Partial<ProfileDraft>) => void;
  reset: () => void;
  plan: SavedPlan | null;
  exercises: Record<string, ExerciseDetail>;
  setPlan: (plan: SavedPlan) => Promise<void>;
  /** Every logged move, oldest first. */
  logs: LogEntry[];
  addLogs: (logs: LogEntry[]) => void;
};
const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState(START);
  const [plan, setPlanState] = useState<SavedPlan | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [exercises, setExercises] = useState<Record<string, ExerciseDetail>>({});
  const update = (patch: Partial<ProfileDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const setPlan = async (p: SavedPlan) => {
    setExercises(await fetchExercises([...new Set(p.days.flat().map((i) => i.exerciseId))]));
    setPlanState(p);
  };

  useEffect(() => {
    loadSaved()
      .then(async (saved) => {
        if (!saved) return;
        update(saved.draft);
        setLogs(saved.logs);
        if (saved.plan) await setPlan(saved.plan);
      })
      .catch(() => {}) // offline on launch: start fresh; answers are re-saved at the disclaimer
      .finally(() => setReady(true));
  }, []);

  return (
    <ProfileContext.Provider value={{ ready, draft, update, reset: () => { setDraft(START); setPlanState(null); setLogs([]); }, plan, exercises, setPlan, logs, addLogs: (l) => setLogs((prev) => [...prev, ...l]) }}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
