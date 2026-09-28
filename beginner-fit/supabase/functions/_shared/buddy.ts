export type Person = { schedule: number[]; done: string[] };

const DAY = 86_400_000;
/** 0 = Monday … 6 = Sunday, for a YYYY-MM-DD date. */
export const weekday = (date: string) => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;

/**
 * Buddy streak: consecutive workout days, counting back from today to the day they paired (`since`).
 * A day is "on" when either person has it scheduled; it counts when everyone scheduled that day logged a workout.
 * It breaks only when someone misses a day on their own schedule. Days nobody scheduled are skipped.
 * Today doesn't break the streak while it's still open. ponytail: no make-up day or pain pause yet (Update 1 spec), add if users ask.
 */
export function buddyStreak(a: Person, b: Person, since: string, today: string): number {
  const done = [new Set(a.done), new Set(b.done)];
  const people = [a, b];
  let n = 0;
  for (let t = Date.parse(today); t >= Date.parse(since); t -= DAY) {
    const d = new Date(t).toISOString().slice(0, 10);
    const due = people.map((p, i) => (p.schedule.includes(weekday(d)) ? i : -1)).filter((i) => i >= 0);
    if (!due.length) continue;
    if (due.every((i) => done[i].has(d))) n++;
    else if (d !== today) break;
  }
  return n;
}
