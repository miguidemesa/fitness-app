import type { Exercise, Profile } from './types.ts';

const NO_EQUIPMENT = new Set([null, 'body only']);

/** The only exercises the AI (or the rules) may ever put in a plan for this user. */
export function filterExercises(profile: Pick<Profile, 'equipment' | 'injuredAreas'>, exercises: Exercise[]): Exercise[] {
  const injured = new Set(profile.injuredAreas);
  const owned = new Set(profile.equipment);
  return exercises.filter(
    (e) =>
      e.level === 'beginner' &&
      (NO_EQUIPMENT.has(e.equipment) || owned.has(e.equipment!)) &&
      !e.stressAreas.some((a) => injured.has(a)),
  );
}
