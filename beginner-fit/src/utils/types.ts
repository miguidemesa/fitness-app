// Shared by the app and the generate-plan Edge Function — keep dependency-free.

export const AREAS = ['neck', 'shoulder', 'elbow', 'wrist', 'lower_back', 'hip', 'knee', 'ankle'] as const;
export type Area = (typeof AREAS)[number];

export type Exercise = {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  equipment: string | null; // free-exercise-db value; null = none
  primaryMuscles: string[];
  stressAreas: Area[];
};

export type Profile = {
  goal: 'lose_weight' | 'get_stronger' | 'feel_healthier';
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: string[]; // free-exercise-db equipment values the user has
  injuredAreas: Area[];
};

export type PlanItem = { exerciseId: string; sets: number; reps: number };
export type Plan = { week: number; days: PlanItem[][] };

export type Difficulty = 1 | 2 | 3; // too easy / about right / too hard
export type WorkoutLog = {
  exerciseId: string;
  date: string; // ISO yyyy-mm-dd
  completed: boolean;
  difficulty: Difficulty;
  pain: boolean;
  painArea: Area | null;
};
