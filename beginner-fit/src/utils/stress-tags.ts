import type { Area } from './types.ts';

// First-pass joint-stress tags for the exercise library, from exercise names and primary muscles.
// Deliberately over-cautious (a false tag only hides a move from someone with that injury).
// ponytail: keyword heuristic — every tag stays `stress_reviewed = false` until a trainer checks it.
const RULES: [Area, RegExp, string[]][] = [
  ['knee', /squat|lunge|step[- ]?up|leg press|leg extension|jump|split|pistol|box/i, ['quadriceps']],
  ['lower_back', /deadlift|good morning|hyperextension|superman|bent[- ]over|row|back extension|swing/i, ['lower back']],
  ['shoulder', /press|push[- ]?up|dip|(front|lateral|side|shoulder|arm)[a-z ]*raise|fly|flye|pull[- ]?up|chin[- ]?up|pullover|handstand|arm circle/i, ['shoulders']],
  ['wrist', /push[- ]?up|plank|dip|wrist|handstand|mountain climber|bear crawl|curl/i, ['forearms']],
  ['elbow', /dip|skull|tricep|kickback|close[- ]grip/i, ['triceps']],
  ['hip', /hip|bridge|thrust|lunge|abduct|adduct|clam|fire hydrant|donkey kick|squat/i, ['glutes', 'abductors', 'adductors']],
  ['neck', /neck|shrug/i, ['neck']],
  ['ankle', /calf|jump|hop|skip|step[- ]?up|jog|run|lunge/i, ['calves']],
];

export function stressAreas(e: { name: string; primaryMuscles: string[] }): Area[] {
  return RULES.filter(([, re, muscles]) => re.test(e.name) || e.primaryMuscles.some((m) => muscles.includes(m))).map(([a]) => a);
}
