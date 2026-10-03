# Capy — beginner fitness coach

A mobile app that gives complete beginners a safe, personal weekly workout plan. Capy, a friendly capybara coach, asks a few questions, checks your health first, and builds a plan that fits your goal, your time and the equipment you have.

## Features

- **Two-minute onboarding** — goal, days per week, session length, where you train and what equipment you have. No sign-up; an anonymous account is created in the background.
- **Health screening first** — seven questions based on the PAR-Q+ questionnaire. Fixed rules decide, never AI. Any answer that signals risk sends the user to a doctor before a plan is made, a skipped question counts as "yes", and the server checks again so a modified app can't skip it.
- **Protects sore joints** — every exercise is tagged with the joints it stresses, and moves that load an area the user wants to protect are left out.
- **AI-built plans with guardrails** — Claude arranges the week using only moves from a safety-filtered list of 367 exercises. The result is checked against rules (moves per day, sets, reps, days). If it fails twice, a rule-built plan is used instead.
- **Workout logging** — one move at a time: did you do it, how did it feel, did anything hurt. Progress history shows every workout.
- **How-to screens** — start and end photos and step-by-step instructions for every move.

## Tech stack

| Area | Technology |
|---|---|
| App | React Native, Expo, Expo Router, TypeScript |
| Backend | Supabase (Postgres, Row Level Security, Edge Functions, anonymous auth) |
| AI | Claude API (plan generation, server side only) |
| Promo video | Remotion |

## Project structure

```
beginner-fit/                  Expo app
beginner-fit/supabase/         migrations, seed, Edge Functions (generate-plan, buddy-status, delete-account)
docs/                          product requirements and feature list
promo-video/                   Remotion promo video
```

## Run locally

See [SETUP.md](SETUP.md). In short:

```bash
cd beginner-fit
npm install
cp .env.example .env    # add your Supabase URL and publishable key
npx expo start
```

Exercise data: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain).
