# Capy: what the app does today

As of **Sep 27, 2026**. This lists only what is built in the code. Planned work lives in the [roadmap](https://claude.ai/artifact/KqmjsAfsgtXZu9Vh8dDM5d); the why lives in the [PRD](PRD.md).

**Status key:** ✅ committed to GitHub · 🟡 built, not committed yet.
Nothing has been checked on a real phone yet, so nothing is "done" by the roadmap's rule.

---

## 1. Onboarding ✅

About 2 minutes. There's no sign-up: an anonymous account is created in the background when the answers are saved.

| Screen | What it asks | Choices |
|---|---|---|
| Welcome | Capy says hi | "Get started" |
| Goal | What's your goal? | Feel healthier, more energy · Get stronger · Lose some weight |
| Time | Days per week, minutes per session | 2 / 3 / 4 days · 20 / 30 / 45 min |
| Space & equipment | Where you work out; what you have | At home · At a gym · Outdoors. Equipment: none, mat, dumbbells, kettlebell, resistance bands, pull-up bar, bench or chair. Choosing "gym" assumes the usual gear. |

Every screen has a short Capy message in plain words.

## 2. Health check and safety ✅

Safety is decided by fixed rules, never by AI.

- **7 health questions**, one at a time, based on the PAR-Q+ questionnaire:
  - heart condition or high blood pressure
  - chest pain
  - dizziness or fainting
  - other long-term condition
  - prescribed medicine
  - told to exercise only under supervision
  - bone, joint or muscle problems
- **"See a doctor first" screen.** A "yes" to any of the first six stops the plan. The screen shows:
  - "What should I ask my doctor?"
  - "I picked the wrong answer" (go back)
  - "My doctor has cleared me"
- **A skipped question counts as "yes"**, so no one slips through.
- **Areas to protect.** A "yes" to the joint question asks where: neck, shoulder, elbow, wrist, lower back, hip, knee or ankle. Moves that load those areas are left out of the plan.
- **Disclaimer.** "Not medical advice; stop if something hurts", with a checkbox before the plan is built.
- **The server checks again.** The plan builder repeats the health check itself, so a changed app can't skip it.

## 3. Exercise library ✅

- **367 beginner moves** from free-exercise-db (public domain), stored in Supabase. Each move has:
  - photos (a start and an end position)
  - step-by-step instructions
  - equipment and the muscles worked
- **Joint tags.** Each move is tagged with the joints it stresses (e.g. squats → knee, hip). Tags come from rules; a trainer still needs to review them.
- **Moves are filtered for each user** by level, their equipment and their areas to protect. The plan can only use moves from this filtered list.

## 4. Your first plan ✅

- **"Build my plan"** creates week 1 on the server.
- **With an Anthropic API key set:**
  - Claude arranges moves from the filtered list only.
  - Safety rules check the result: every move allowed, 3–6 moves a day, 1–3 sets, 5–15 reps, the right number of days.
  - If the plan fails the check twice, the rule-built plan is used instead.
- **Without a key:** the rule-built plan is used. It mixes muscle groups, with 4 moves a day at 2 sets × 10 reps.
- **Coach note:** week 1 starts with a short, friendly note from Capy.
- **Reopening the app** restores your answers and plan.

## 5. Today, This week, how-to ✅

- **Today:**
  - the next workout day and its moves (sets × reps)
  - Capy's note
  - "What changed this week"
  - "Start workout"
- **This week:** all days of the plan.
- **How-to screen** for every move:
  - photo (tap to switch between start and end position)
  - numbered steps
  - equipment
  - "If anything hurts, stop."

## 6. Doing and logging a workout 🟡

- **One move at a time**, with a "How to do it" link on each. Three quick questions per move:
  1. **Did you do it?** All of it · Some of it · Skipped it
  2. **How did it feel?** Too easy · About right · Too hard, each with a plain explanation
  3. **Did anything hurt?** No · Yes, then where
- **"Finish workout"** saves every move at once. If saving fails, you see a clear retry message.
- **"Nice work!" screen**: "You did 4 of 4 moves today." If you logged pain, Capy adds a caring note: rest it, the move will change next week, see a doctor if it continues.

## 7. Progress 🟡

- **Totals:** workouts, moves done, current week.
- **One card per workout:** date, day, moves done, how it felt overall, and any pain areas (in red).

## 8. The plan adapts each week 🟡

When every day of the week is logged, Today shows **"Week done!"** and **"Get next week's plan"**. The next week follows fixed rules, with no AI and no cost:

| What you logged | What happens next week |
|---|---|
| Pain on a move | Swapped for a move that works the same muscle and spares that joint. If there's no such move, it gets lighter. **A painful move never gets harder.** |
| Pain in the same area on 2+ days | Capy suggests seeing a doctor or physio |
| "Too easy" twice in a row | +2 reps, or +1 set at the cap (max 3 × 15) |
| "Too hard" | −2 reps, or −1 set |

Each change is shown on Today with its reason, e.g. "Swapped Lunges for Glute Bridge because it caused pain."

---

## Behind the scenes

- **App:** Expo (React Native) for iPhone and Android, with the Capy look (sporty fonts, blue accent, Capy avatar).
- **Backend:** Supabase.
  - **Private by default:** each person can read and change only their own data. We checked this with two test users against the live project.
  - **Plans:** only the server can write plans; people can read their own but can't create or change them.
- **Tests:** 17 automated tests cover the safety rules (health check, filtering, plan checks, weekly changes, joint tags, equipment, week tracking). All pass.

## Not built yet

These are in the roadmap:
- rest timer with Capy's poses
- weekly streak and Capy's stages
- share card
- free trial and one-time purchase
- deleting your data in the app
- crash reporting
- plain-language move instructions
- buddies and more coaches (after launch)

## Before the logging features work live

1. Run the migrations `20260926010000_plan_note.sql` and `20260926020000_logging.sql` in Supabase.
2. Deploy the `generate-plan` function. The Anthropic key is optional.
