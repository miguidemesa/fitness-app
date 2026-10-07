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
npx expo start
```
Create `beginner-fit/.env` before starting:

```bash
EXPO_PUBLIC_SUPABASE_URL=<your Supabase project URL>
EXPO_PUBLIC_SUPABASE_KEY=<your publishable key>
```

Scan the QR code with Expo Go. Use the publishable key only; never put a `service_role` key in `.env`.

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
