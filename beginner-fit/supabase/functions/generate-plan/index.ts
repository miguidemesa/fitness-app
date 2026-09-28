// Returns the user's current plan, building the next one when needed:
// - no plan yet → week 1: Claude picks from the user's vetted exercise list, the rules in _shared
//   validate it, and the rule-built plan takes over if the AI output fails twice.
// - every day of the latest week logged → next week from the adapt rules (no AI: safe and free).
// - otherwise → the latest plan as saved.
import Anthropic from 'npm:@anthropic-ai/sdk@0.128.0';
import { createClient } from 'npm:@supabase/supabase-js@2.117.1';
import { adaptPlan } from '../_shared/adapt.ts';
import { filterExercises } from '../_shared/allowlist.ts';
import { mergeProfiles } from '../_shared/buddy.ts';
import { CAPS, fallbackPlan, validatePlan } from '../_shared/plan.ts';
import { fromLogRow, nextDay, toWorkoutLog } from '../_shared/progress.ts';
import { isHighRisk } from '../_shared/screening.ts';
import type { Exercise, Plan, Profile } from '../_shared/types.ts';

const FALLBACK_NOTE = "Here's your first week. Every move is beginner-friendly and picked around what you told me.";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL')!;
  const auth = req.headers.get('Authorization') ?? '';
  // User-scoped client: row level security decides what this request can read.
  const db = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: userData } = await db.auth.getUser(auth.replace('Bearer ', ''));
  const user = userData.user;
  if (!user) return json({ error: 'not signed in' }, 401);

  const { data: latest } = await db.from('plans').select('*').order('week', { ascending: false }).limit(1).maybeSingle();
  let logs: ReturnType<typeof fromLogRow>[] = [];
  if (latest) {
    const { data: rows, error } = await db.from('workout_logs').select('*').eq('plan_id', latest.id);
    if (error) return json({ error: error.message }, 500);
    logs = rows.map(fromLogRow);
    if (nextDay(latest.days.length, latest.id, logs) !== null) return json(latest); // week not finished yet
  }

  const { data: p } = await db.from('profiles').select('*').maybeSingle();
  if (!p?.disclaimer_accepted_at) return json({ error: 'onboarding not finished' }, 409);
  // The app checks this too, but the server is the trust boundary.
  if (isHighRisk(p.screening ?? {})) return json({ error: 'medical clearance needed' }, 403);

  let profile: Profile = {
    goal: p.goal ?? 'feel_healthier',
    daysPerWeek: p.days_per_week,
    minutesPerSession: p.minutes_per_session,
    equipment: p.equipment,
    injuredAreas: p.injured_areas,
  };

  // Train together: while both buddies have it on, build from a profile safe for both.
  // Only what the plan is built from is read of the buddy's profile; none of it is returned.
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: link } = await db.from('buddy_links').select('*').maybeSingle(); // row level security: own link only
  let together = false;
  if (link?.buddy && link.inviter_together && link.buddy_together) {
    const { data: o } = await admin.from('profiles').select('*').eq('user_id', link.inviter === user.id ? link.buddy : link.inviter).maybeSingle();
    // A buddy who hasn't finished onboarding, or needs medical clearance, can't shape anyone's plan.
    if (o?.disclaimer_accepted_at && !isHighRisk(o.screening ?? {})) {
      profile = mergeProfiles(profile, {
        goal: profile.goal,
        daysPerWeek: o.days_per_week,
        minutesPerSession: o.minutes_per_session,
        equipment: o.equipment,
        injuredAreas: o.injured_areas,
      });
      together = true;
    }
  }

  const { data: rows, error } = await db.from('exercises').select('id, name, level, equipment, primary_muscles, stress_areas');
  if (error) return json({ error: error.message }, 500);
  const allowlist = filterExercises(
    profile,
    rows.map((r): Exercise => ({ id: r.id, name: r.name, level: r.level, equipment: r.equipment, primaryMuscles: r.primary_muscles, stressAreas: r.stress_areas })),
  );
  // Same order for both buddies, so the rule-built week 1 comes out identical.
  if (together) allowlist.sort((x, y) => x.id.localeCompare(y.id));
  if (allowlist.length < CAPS.exercisesPerDay.min) return json({ error: 'not enough safe exercises for this profile' }, 422);

  let row: Record<string, unknown>;
  if (latest) {
    const a = adaptPlan({ week: latest.week, days: latest.days }, logs.map(toWorkoutLog), allowlist);
    row = {
      week: a.plan.week,
      days: a.plan.days,
      source: 'adapted',
      note: a.changes.length
        ? `Week ${latest.week} done! I changed a few things based on how it felt.`
        : `Week ${latest.week} done! It all felt about right, so we'll keep going with the same moves.`,
      changes: a.changes,
      see_professional: a.seeProfessional,
    };
  } else {
    let plan: Plan | null = null;
    let note = FALLBACK_NOTE;
    let source: 'ai' | 'fallback' = 'fallback';
    // ponytail: together mode skips the AI so both buddies get the identical rule-built week 1.
    if (!together && Deno.env.get('ANTHROPIC_API_KEY')) {
      for (let attempt = 0; attempt < 2 && !plan; attempt++) {
        try {
          const out = await askClaude(profile, allowlist);
          const candidate = { week: 1, days: out.days };
          const problems = validatePlan(candidate, allowlist, profile);
          if (problems.length === 0) {
            plan = candidate;
            note = out.note;
            source = 'ai';
          } else console.warn('AI plan rejected:', problems);
        } catch (e) {
          console.warn('AI call failed:', e);
        }
      }
    }
    plan ??= fallbackPlan(allowlist, profile);
    row = { week: 1, days: plan.days, source, note };
  }

  // Service role writes the plan: users can read plans but never write them directly.
  const saved = await admin
    .from('plans')
    .upsert({ ...row, user_id: user.id }, { onConflict: 'user_id,week' })
    .select()
    .single();
  if (saved.error) return json({ error: saved.error.message }, 500);
  return json(saved.data);
});

async function askClaude(profile: Profile, allowlist: Exercise[]): Promise<{ note: string; days: Plan['days'] }> {
  const perDay = Math.min(CAPS.exercisesPerDay.max, Math.max(CAPS.exercisesPerDay.min, Math.round(profile.minutesPerSession / 8)));
  const item = {
    type: 'object',
    properties: {
      exerciseId: { type: 'string', enum: allowlist.map((e) => e.id) },
      sets: { type: 'integer' },
      reps: { type: 'integer' },
    },
    required: ['exerciseId', 'sets', 'reps'],
    additionalProperties: false,
  };
  const schema = {
    type: 'object',
    properties: {
      note: { type: 'string' },
      days: { type: 'array', items: { type: 'array', items: item } },
    },
    required: ['note', 'days'],
    additionalProperties: false,
  };

  const client = new Anthropic();
  const res = await client.beta.messages.create({
    model: 'claude-opus-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema } },
    system:
      'You are Capy, a patient coach for complete beginners. Build a safe first week of workouts using ONLY the listed exercises. ' +
      `Rules: exactly ${profile.daysPerWeek} days; ${perDay} exercises per day (never fewer than ${CAPS.exercisesPerDay.min} or more than ${CAPS.exercisesPerDay.max}); ` +
      `sets ${CAPS.sets.min}-${CAPS.sets.max} (prefer 2); reps ${CAPS.reps.min}-${CAPS.reps.max} (prefer 8-12); ` +
      'balance muscle groups within each day and across the week; avoid repeating an exercise on back-to-back days. ' +
      '`note` is one or two plain, warm sentences to the user explaining the week. No jargon, no "no pain no gain".',
    messages: [
      {
        role: 'user',
        content:
          `Goal: ${profile.goal.replace('_', ' ')}. ${profile.daysPerWeek} days a week, ${profile.minutesPerSession} minutes each.\n` +
          `Exercises (id | name | equipment | main muscle):\n` +
          allowlist.map((e) => `${e.id} | ${e.name} | ${e.equipment ?? 'none'} | ${e.primaryMuscles[0] ?? '-'}`).join('\n'),
      },
    ],
  });

  if (res.stop_reason === 'refusal' || res.stop_reason === 'max_tokens') throw new Error(`stopped: ${res.stop_reason}`);
  const text = res.content.find((b: { type: string }) => b.type === 'text') as { text: string } | undefined;
  if (!text) throw new Error('no text block');
  return JSON.parse(text.text); // shape is re-checked by validatePlan
}
