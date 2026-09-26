// Health screen, paraphrased from the PAR-Q+ general health questions.
// ponytail: any "yes" except the joint question blocks outright. PAR-Q+ has follow-up
// pages that could clear some of these; add them only after trainer/physio sign-off.

export type ScreeningQuestion = { id: string; text: string; blocks: boolean };

export const SCREENING_QUESTIONS: ScreeningQuestion[] = [
  { id: 'heart', text: 'Has a doctor ever said you have a heart condition or high blood pressure?', blocks: true },
  { id: 'chest_pain', text: 'Do you feel pain in your chest when resting, doing daily things, or being active?', blocks: true },
  { id: 'dizzy', text: 'In the last 12 months, have you lost your balance from dizziness or passed out?', blocks: true },
  { id: 'chronic', text: 'Has a doctor diagnosed you with any other long-term medical condition?', blocks: true },
  { id: 'medication', text: 'Do you take prescribed medicine for a long-term condition?', blocks: true },
  { id: 'supervised', text: 'Has a doctor said you should only exercise under medical supervision?', blocks: true },
  { id: 'joints', text: 'Do you have (or had in the last 12 months) a bone, joint, or muscle problem that exercise could make worse?', blocks: false },
];

export type ScreeningAnswers = Record<string, boolean>;

/** Unanswered counts as "yes" — never let a skipped question through. */
export function isHighRisk(answers: ScreeningAnswers): boolean {
  return SCREENING_QUESTIONS.some((q) => q.blocks && answers[q.id] !== false);
}

/** "Yes" to the joint question means we must ask which body areas are affected. */
export function needsInjuryAreas(answers: ScreeningAnswers): boolean {
  return answers.joints !== false;
}
