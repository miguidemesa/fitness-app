# Setup

## Install first
- [Node.js](https://nodejs.org) 20+ (includes npm)
- [Git](https://git-scm.com)
- **Expo Go** on your phone (App Store / Play Store) to run the app, or Android Studio / Xcode for an emulator
- Optional: [Supabase CLI](https://supabase.com/docs/guides/cli) to deploy `beginner-fit/supabase` (edge functions, migrations)

## Run the app
```bash
cd beginner-fit
npm install
cp .env.example .env    # then fill in your Supabase URL + publishable key
npx expo start
```
Scan the QR code with Expo Go. Publishable key only; never put a `service_role` key in `.env`.

## Database
After pulling new migrations in `beginner-fit/supabase/migrations`, deploy them before using the new build:
```bash
cd beginner-fit
supabase db push
```
`20261009000000_sets_and_sessions.sql` adds per-set logging and workout durations. Until it's deployed the app still saves workouts, just without sets or durations.

## Checks
```bash
npm run typecheck
npm run lint
npm test
```

## Promo video (optional)
```bash
cd promo-video
npm install
npm run dev    # Remotion studio
```

## Not in the repo (kept local)
`.env`, `.claude/`, `.agents/`, `skills-lock.json`, `CLAUDE.md`, `AGENTS.md`, `PRODUCT.md`, `.impeccable/`.
