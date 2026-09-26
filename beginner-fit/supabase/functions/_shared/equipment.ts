// Onboarding answers → free-exercise-db equipment values. Dependency-free (shared with the plan server).

export type Place = 'home' | 'gym' | 'outdoors';
export type Gear = 'mat' | 'dumbbell' | 'kettlebell' | 'bands' | 'pullup' | 'bench';

export const PLACES: { id: Place; label: string }[] = [
  { id: 'home', label: 'At home' },
  { id: 'gym', label: 'At a gym' },
  { id: 'outdoors', label: 'Outdoors' },
];

export const GEAR: { id: Gear; label: string; hint: string }[] = [
  { id: 'mat', label: 'Exercise mat', hint: 'Or a soft rug' },
  { id: 'dumbbell', label: 'Dumbbells', hint: 'Any weight is fine' },
  { id: 'kettlebell', label: 'Kettlebell', hint: 'Any weight is fine' },
  { id: 'bands', label: 'Resistance bands', hint: 'Loop or tube bands' },
  { id: 'pullup', label: 'Pull-up bar', hint: 'A doorway bar counts' },
  { id: 'bench', label: 'Bench or sturdy chair', hint: 'For step-ups and dips' },
];

// ponytail: beginners at a gym get free weights and simple kit; machines stay out until
// the exercise library has reviewed beginner machine moves.
const GYM = ['dumbbell', 'kettlebells', 'bands', 'exercise ball', 'medicine ball'];
const DB_VALUE: Partial<Record<Gear, string>> = { dumbbell: 'dumbbell', kettlebell: 'kettlebells', bands: 'bands' };

/** Equipment values the exercise filter may use. Bodyweight ("body only") is always allowed by the filter. */
export function toDbEquipment(place: Place, gear: Gear[]): string[] {
  if (place === 'gym') return [...GYM];
  return [...new Set(gear.map((g) => DB_VALUE[g]).filter((v): v is string => !!v))].sort();
}
