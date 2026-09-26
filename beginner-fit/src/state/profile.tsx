import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Gear, Place } from '@/utils/equipment';
import type { ScreeningAnswers } from '@/utils/screening';
import type { Area, Profile } from '@/utils/types';

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

type Ctx = { draft: ProfileDraft; update: (patch: Partial<ProfileDraft>) => void; reset: () => void };
const ProfileContext = createContext<Ctx | null>(null);

// ponytail: in-memory only; moves to Supabase (profiles table) when the backend lands.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(START);
  const update = (patch: Partial<ProfileDraft>) => setDraft((d) => ({ ...d, ...patch }));
  return <ProfileContext.Provider value={{ draft, update, reset: () => setDraft(START) }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
