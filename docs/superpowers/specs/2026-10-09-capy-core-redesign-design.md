# Capy Core Redesign: Design Spec

**Date:** 2026-10-09
**Scope:** Project 1 of 4 (Core). Projects 2–4 (Explore, Profile & progress, Activity/community) get their own specs later.
**Status:** Draft for review

## 0. Phasing (decided 2026-10-09)
**Phase A (now): frontend only.** No database changes.
- All the visual, motion, haptic, platform and notification work.
- The new screens and flows.
- Persistent active-workout state on the device.
- Swap (it reads the existing `exercises` table).

**How Phase A handles per-set data:**
- The set-based workout UI is built in full.
- The server still receives today's columns: `completed` (worked out from the sets), `difficulty` and `pain`.
- Per-set reps/weight and session durations are kept **on the device** (AsyncStorage). That device-only copy powers "Last: 3×10 · 8 kg", new bests, and the minutes stats on this device.

**Phase B (later): backend.** The §6.1 migration, uploading sets and sessions, and backfilling from the device copy.

## 1. Goal

Make Capy feel like a designed consumer product instead of a starter template: editorial, calm, quietly playful, and fast to use mid-workout. Keep everything that makes Capy *Capy*: the capybara coach, its voice, and the safety model (PAR-Q+ screening, joint protection, pain-aware adaptation, privacy-first buddy).

**In scope**
- New design system (tokens, type, shape, motion, haptics)
- Navigation
- Home
- Plan (this week + history)
- Session detail
- Active workout (sets, rest, swap, persistence)
- Completion
- Exercise how-to (looping demo)
- Restyle of onboarding, You (profile + progress), Settings and Buddy so nothing looks old-style

**Out of scope (later projects):**
- Explore library and filters (Project 2)
- Deeper profile, records and milestones (Project 3)
- Social feed (Project 4)
- Free-form workout builder (rejected: it would bypass joint protection)
- Per-move notes
- Live Activities and widgets (need a dev build; the app must keep running in Expo Go)

## 2. What the references taught us

| Reference | Principle we take | What we do *not* copy |
|---|---|---|
| **ritual7** (rec. 1, right phone) | One idea per screen. Centered composition, lots of air. A single black pill CTA. An illustration that **reacts to your answer** (plant grows with experience, flower petals = days chosen). Options as pills that expand when chosen. Toggle list for "what should we be gentle with". Copy that sounds human ("A rhythm. Not a rule."). | Line-art woman and plant illustrations, the name, exact layouts |
| **Prime** (rec. 2, right phone) | One bold colour used **immersively** at key moments (welcome, plan ready, session complete) while working screens stay neutral. Dark, focused active-workout screen: circular media up top, a white bottom sheet with huge numbers (`8 kg`, `10 reps`), −/+ steppers and one full-width "Log set". The rest timer lives in the same screen (ring, +15s, Skip). A ⋯ menu (How to do it / Swap / Show pose). The completion screen is one giant number plus progress toward the next level. | XP, "Prime Plus" upsell, nutrition tiles, body-map cards |
| **Social screenshot** | Tall pill-shaped "moment" thumbnails with a small circular avatar overlay. Large rounded photos with continuous corners. Circular header buttons (menu / mark / bell). Floating nav, with the main action as a separate circle. | The feed itself (Project 4), the logo, the content |

The common thread: **neutral canvas, one confident colour, big type for the one number that matters, and graphics that respond to the user.** Capy is already a character, so Capy becomes the reacting illustration.

## 3. Design direction

### 3.1 Personality
Calm coach, not drill sergeant. Minimal but warm. Playfulness comes from **Capy reacting**, not from confetti or loud copy.

### 3.2 Colour
**Decision: one warm accent, "yuzu".** Capybaras famously soak in yuzu hot springs. It's original, warm, and avoids the stock "electric blue + black" fitness palette. Capy's headband becomes yuzu.

| Token | Value | Use |
|---|---|---|
| `porcelain` | `#F6F5F2` | App background |
| `paper` | `#FFFFFF` | Sheets, grouped lists, pills |
| `mist` | `#ECEAE5` | Inactive chips, steppers, subtle fills |
| `line` | `#E2DFD8` | Rare hairlines (grouped-list separators only) |
| `ink` | `#15151A` | Text, primary pill CTA, selected pills, tab tint |
| `body` | `#45444A` | Body text |
| `muted` | `#6B6970` | Secondary text (≥4.5:1 on porcelain) |
| `yuzu` | `#F5B323` | **Accent fill**: Start, Log set, done states, rest ring, immersive moments |
| `yuzuSoft` | `#FCEFCB` | Tints behind yuzu elements (moment rings, "up next" tag) |
| `yuzuInk` | `#7A5200` | The only "yuzu-coloured" text, on light surfaces (≥4.5:1) |
| `night` | `#101014` | Active-workout canvas |
| `pain`, `painSoft` | `#B3261E`, `#FDECEA` | Pain only |
| Capy fur | `#A8754F`, `#8E5F3C`, `#7A5033`, `#C99B72` | Capy only |

**Rules**
- Text on yuzu is always **ink** (≈11:1). Never put white on yuzu, and never use yuzu itself as text.
- **Yuzu appears in three kinds of place:**
  - **Immersive moments:** Welcome, "Almost ready", Session complete. These are flat yuzu full-bleed with no gradient.
  - **Actions that move training forward:** Start workout, Log set.
  - **Done/progress states:** done days, done sets, the rest ring, progress fills.
- Everything else stays neutral: onboarding CTAs are ink pills, and selected options are ink pills (ritual7).
- On a yuzu background, Capy's headband switches to ink so it doesn't disappear.

### 3.3 Typography
- **Display and numbers:** Bricolage Grotesque, weights 500 / 700 / 800 (`@expo-google-fonts/bricolage-grotesque`).
  - Editorial, with a slight quirk that suits Capy.
  - Tight tracking (−1 to −2%) at large sizes.
  - Numbers always use `fontVariant: ['tabular-nums']`.
- **UI and body:** Figtree, weights 400 / 500 / 600 (`@expo-google-fonts/figtree`). Friendly and highly legible at 15–17pt.
- **Removed:** Barlow Condensed Italic (all caps) and Archivo.
- **Headings mix two weights:** **"Good evening, Mia."** in bold, then "Ready to move?" lighter and muted, in the same size.
- **Stats follow the brief's pattern:** a huge number with a small caption under it, e.g. `24` over "minutes of movement".

| Style | Font | Size / line-height |
|---|---|---|
| `hero` | Bricolage 800 | 88 / 84 (one number per screen, max) |
| `display` | Bricolage 700 | 40 / 42 |
| `title` | Bricolage 700 | 30 / 34 |
| `heading` | Bricolage 600 | 22 / 26 |
| `body` | Figtree 400 | 16 / 24 |
| `label` | Figtree 600 | 15 / 20 |
| `caption` | Figtree 500 | 13 / 18 |
| `tag` | Figtree 600 | 11 / 14, uppercase, tracking +1.2 |

### 3.4 Shape system
Each shape means something; no one radius is used everywhere.

| Shape | Spec | Used for |
|---|---|---|
| **Pill** | radius 999 | Buttons, chips, segmented controls, the elapsed-time pill |
| **Moment** | 88×144, radius 44 (tall stadium) | Home moments strip, plan-row photo thumbs |
| **Photo card** | radius 32, `borderCurve: 'continuous'` | Today's session card, session-detail hero, how-to demo |
| **Sheet** | top radius 32 | Active-workout bottom sheet, how-to sheet |
| **Circle** | 44 (header), 56 (steppers) | Icon buttons, set dots, week-strip days, media circle in the workout |
| **Group** | radius 20 | Grouped lists (settings, toggle lists, exercise list) |
| **Field** | radius 16 | Text inputs |

### 3.5 Imagery
- **Exercise photography is the photography.** Every card shows the real demo photos of the moves in that session (from free-exercise-db). Photography carries information, not decoration, and no stock photos are needed in Project 1.
- **Demos loop like a GIF:** start ↔ end photo cross-fade on the UI thread (~1.2 s cycle). Tap to pause. With Reduce Motion on, they're still and you tap to switch frames.
- **Capy is the illustration:** the full-body Capy from the promo video's `CapyFlat`, ported to `react-native-svg`. Moods: hello / cheer / caring / rest / proud. It can wave, blink, hop and wiggle.
- Editorial lifestyle photography (Unsplash) is deferred to Project 2 (Explore), which needs it. That is when the licence check and a list for your approval happen.

### 3.6 Motion
All values are centralised in `theme.ts → motion`.

- **Durations:** tap 120 ms, quick 200, base 280, slow 420. Easing out = `bezier(0.2, 0.8, 0.2, 1)`.
- **Springs:**
  - `press` (damping 18, stiffness 320, mass 0.6)
  - `settle` (16 / 180)
  - `playful` (10 / 200), only for Capy and the set-done pop
- **Press feedback:**
  - Scale: cards 0.98, buttons 0.96, circles 0.92.
  - The release springs back.
  - Android adds a native ripple.
- **Entrances:** fade in and rise 12 px over 280 ms, staggered 45 ms, at most 6 items. They play on first mount only, never on re-render.
- **Screen transitions are native stack transitions:**
  - iOS push and edge-swipe; Android slide, plus predictive back in store builds.
  - The active workout opens as a full-screen modal (slides up).
  - The how-to opens as a native form sheet from inside the workout.
  - Moving between moves inside a workout uses a horizontal slide.
- **Data:** stats count up once (600 ms) when first shown. Progress bars, rings and week dots fill with `settle`.
- **Capy reactions (the playful layer):**
  - Onboarding picks: Capy's mood swaps and it does a small hop.
  - Tapping Capy anywhere makes it wiggle (easter egg).
  - Rest: Capy breathes in time with "breathe in… out".
  - Stage-up: a big hop, plus a success haptic.
- **No confetti.** No idle loops except Capy's blink (every ~4 s) and the exercise demo loop.
- **Reduce Motion:** fades only. No translate, scale or count-up (final values shown immediately). Demo loops and Capy's breathing don't autoplay.

### 3.7 Haptics
`src/lib/haptics.ts` maps intents to each platform's native vocabulary:

| Intent | iOS (Taptic Engine) | Android (`performAndroidHapticsAsync`) |
|---|---|---|
| `select` (option, chip, stepper) | `selectionAsync` | `Segment_Tick` |
| `tap` (primary button) | `impactAsync(Light)` | `Context_Click` |
| `setDone` | `impactAsync(Medium)` | `Confirm` |
| `success` (workout finished, stage-up) | `notificationAsync(Success)` | `Confirm` |
| `tick` (last 3 s of rest) | `selectionAsync` | `Clock_Tick` |
| `toggle` | `selectionAsync` | `Toggle_On` / `Toggle_Off` |

There are no haptics on errors or on "it hurt", so nothing feels like a scold.

### 3.8 Platform-specific touches (all run in Expo Go)

**iOS**
- **Native Liquid Glass tab bar** (iOS 26) via the existing `NativeTabs`, with `minimizeBehavior="onScrollDown"` so it shrinks while you scroll.
- **Workout-in-progress mini-player** in the tab bar's `NativeTabs.BottomAccessory` (iOS 26+). It shows the move name, the elapsed time or rest countdown, and Resume.
- **Glass circle buttons** (`expo-glass-effect` `GlassView`) over photos and the dark workout canvas (×, ⋯, back), only where `isLiquidGlassAvailable()`. Otherwise a translucent fill.
- **SF Symbols** (`expo-symbols`) with symbol effects: the check bounces when a set is logged, and play/pause replaces itself.
- **Continuous (squircle) corners** on photo cards and sheets.
- **Native action sheets** (`ActionSheetIOS`) for the ⋯ move menu and the leave-workout choice.

**Android**
- **Material 3 bottom navigation** from the same `NativeTabs` (native pill indicator).
- **Floating "workout in progress" pill** above the nav (Android's equivalent of the bottom accessory).
- **Native ripples** (`android_ripple`) on every pressable, borderless on circles.
- **Android haptic primitives** (`Confirm`, `Clock_Tick`, `Segment_Tick`…) instead of generic vibration.
- **Material Symbols** through the same `expo-symbols` `SymbolView` (it takes `{ ios, android }` names), instead of SF Symbols.
- **Native Material dialogs** (`Alert`) for the move menu and the leave-workout choice.
- **`predictiveBackGestureEnabled: true`** in `app.json`. It takes effect in store and dev builds; Expo Go ignores it.

### 3.9 In-app notifications (expo-dynamic-notifications)
These are Dynamic Island-style toasts that grow out of the top of the screen (a Skia "goo" morph) and can be swiped away. The source is [rit3zh/expo-dynamic-notifications](https://github.com/rit3zh/expo-dynamic-notifications) (MIT). It's a template, not an npm package, so its core is vendored into `src/vendor/dynamic-notifications/` with the licence kept and imports made relative. Its demo screens and `react-native-teleport` are not copied. Every dependency it needs ships in Expo Go SDK 57: Skia 2.6.2, Reanimated, Worklets, Gesture Handler, expo-blur, expo-image, expo-symbols.

**Only for events that happen while your attention is elsewhere**, one at a time:

| Event | Copy | Tap |
|---|---|---|
| Rest finished while the workout is minimized or the how-to sheet is open | "Rest's up · Set 2 of 3, Goblet squat" | Resume workout |
| App relaunched with a workout in progress | "Picking up where you left off" | Resume workout |
| A save that used to fail silently (workout days) | "Couldn't save your days" | Retry |
| A quiet success with no other feedback (name saved, reminders on) | "Reminders on · Mon, Wed, Fri at 6 pm" | Nothing |

The accent dot is yuzu, using Capy's head for the avatar.

It is **not** used for set logged, workout finished, or errors on the screen you're looking at; those keep their in-place feedback.

**Our patch to the vendored code:** with Reduce Motion on, the goo morph is skipped and the card fades in.

## 4. Navigation

- **Tabs:** `Home` · `Plan` · `You`.
  - Explore and Activity slot in during Projects 2 and 4. The final order will be Home · Explore · Plan · Activity · You.
  - The old **Progress** tab is removed. Its history moves to Plan, and its stats move to Home and You.
- **Route renames:**
  - `(tabs)/today.tsx` becomes `(tabs)/home.tsx`, and every `/today` reference is updated.
  - `(tabs)/week.tsx` becomes `(tabs)/plan.tsx`.
  - `progress.tsx` is deleted.
- **New routes:**
  - `session/[day].tsx`: session detail, pushed.
  - `workout.tsx`: changes to `presentation: 'fullScreenModal'` with `gestureEnabled: false`. The × button is how you leave, so a stray swipe can't drop you out.
  - `exercise/[id].tsx`: `presentation: 'formSheet'` with detents `[0.75, 1]` when opened from the workout; pushed elsewhere.

## 5. Screens

### 5.1 Home
```
( capy )       capy•        ( bell )      ← circle buttons, wordmark
Good evening, Mia.                         ← title, ink
Ready to move?                             ← title, muted
[pill][pill][pill][pill] →                 ← moments (hidden when empty)
╭────────────────────────────────────╮
│ photo: day's first demo (cover)    │     photo card, radius 32
│ DAY 2 OF 3 · WEEK 1                │
│ Lower body                         │
│ Your next session is ready.        │
│ 5 moves · ~30 min · No equipment   │
│ [ ▶ Start ]                  ( → ) │     yuzu pill (ink text) + circle → detail
╰────────────────────────────────────╯
(capy) "Go at your own pace today."        coach line, not a card
2/3            48                3
workouts       minutes of        week
this week      movement          streak
M  T  W  T  F  S  S                        week strip: scheduled ○ done ● today ◉
Lately                          See all
[pill] Lower body · Tue 7 · 24 min · 9 sets
```
- **Header:** the Capy avatar circle goes to You. The bell goes to Settings → Reminders.
- **Greeting** changes with the time of day.
- **Moments:** up to 8 tall pills. Recent sessions use their exercise photo, with the date underneath. A Capy stage milestone shows Capy on yuzu. If paired, the buddy appears with an initial avatar and their streak. Hidden entirely when empty, so first-time users see a clean screen.
- **The session card has four states:**
  - **Ready:** as above.
  - **In progress:** the button reads Resume.
  - **No plan yet:** Capy on yuzu, "Your first week is one tap away.", and Build my plan, which opens Almost-ready.
  - **Week done:** a yuzu immersive card, "Week 1, done.", and Get next week's plan.
- The `see_professional` and `plan.note` messages appear as the coach line, with the caring mood when that applies.
- **Session title** comes from the day's primary muscles: ≥60% lower-body muscles gives "Lower body"; ≥60% upper gives "Upper body"; otherwise "Full body". The time shown is the user's chosen minutes.

### 5.2 Plan
- **Header:** "This week", "Week 2 · 3 sessions".
- **Session rows** (one per day):
  - a number circle
  - title and "5 moves · ~30 min"
  - an "Up next" tag on the next session, or a "Done" stamp
  - a moment-pill photo on the right
  - tapping opens session detail
- **Past sessions** (from the old Progress tab), grouped by week:
  - date, title, minutes, sets
  - a feel dot (easy / about right / hard)
  - a pain tag if pain was logged

### 5.3 Session detail
- A 280-tall hero photo card with a glass back circle.
- Title, "Day 2 · 5 moves · ~30 min", muscle chips.
- **Exercise list** as a group:
  - a circular demo thumb, the name, `3 × 10`
  - "Last: 3 × 10 · 8 kg" when there is history
  - tapping opens the how-to
- **Sticky footer:** a yuzu "Start workout" pill, or Resume.

### 5.4 Active workout (core)
```
(×)  ▬▬▬▭▭▭               ( 12:04 )      night canvas; glass circles
Goblet squat                       (⋯)
Move 2 of 5 · Quads, glutes
            ◯ demo loop ◯                 260 px circle, tap = pause
╭──────────────── sheet ─────────────╮
│ Set 1 of 3                  ● ○ ○  │
│ 10 reps                 (−)  (+)   │    tap the number → numeric keypad
│ 8 kg                    (−)  (+)   │    weight row only for loaded equipment
│ [        ✓ Log set               ] │    yuzu, ink text, 64 tall
╰────────────────────────────────────╯
```
- **Log set:**
  - the `setDone` haptic fires
  - the set dot fills with a `playful` pop
  - values carry over to the next set
  - rest starts in place: the demo circle becomes a **rest ring** (react-native-svg, Reanimated `strokeDashoffset`), showing `REST` / `0:45` / "Breathe in… out." beside a breathing Capy
  - the sheet buttons change to `+15s` and `Skip rest`
  - the last 3 seconds tick
- **Rest lengths:** 45 s between sets, 60 s between moves. Rest is stored as an `endsAt` timestamp, so it survives navigation and backgrounding.
- **After the last set of a move**, the sheet asks:
  - **"How did that feel?"** Easy / About right / Too hard (three big pills, mapped to difficulty 1/2/3)
  - **"Anything hurt?"** No / Yes. Yes shows the area chips.
  - Then a horizontal slide to the next move.
- **⋯ menu** (native): How to do it (form sheet), Swap move, Skip move. Skipping still asks "Anything hurt?", because pain may be *why* they skipped.
- **Swap move:**
  - lists up to 3 alternatives that share a primary muscle and pass `filterExercises(profile)`, the same function the server uses, so joint protection holds
  - the swap applies to this session only, and the log records the swapped `exerciseId`
  - the plan itself is unchanged
- **× (native choice):**
  - **Minimize:** state is kept, and the mini-player or pill appears.
  - **End and save:** moves not yet answered are logged as `skip` with no pain.
  - **Discard:** behind a second confirmation.
- **Weight units:** kg by default, with a kg/lb choice in Settings. Always stored as kg.
- **Sweaty-hands rules:**
  - every target is ≥56 px, and Log set is 64 px
  - no swipe is required for any core action
  - the screen stays awake while the workout screen is open (`useKeepAwake`, which ships with Expo)

### 5.5 Session complete (immersive yuzu)
- Tag "SESSION COMPLETE", the title, and "That's day 2, done."
- **Hero:** `24` counting up, over "minutes of movement".
- **Editorial row:** `9` sets · `90` reps · `420` kg moved. The kg figure only appears when weights were logged.
- **New bests,** only when an exercise beats its own previous best weight or reps. A first-ever log is not a "best".
- **Capy:** cheer mood and a progress bar, e.g. "2 more workouts to Athlete". On stage-up: a big hop, "Capy is now an Athlete.", and the `success` haptic. That is the only celebration.
- If pain was logged, a caring Capy note (existing copy).
- An optional "Add a note" field, saved on Done.
- Buttons: Share (existing text share) and Done.

### 5.6 Exercise how-to
- The demo loop in a tall photo card (radius 32), with a pause circle.
- Name and muscle chips.
- Numbered steps: yuzu number circles with ink numerals, staggered in.
- The existing safety line.

### 5.7 Onboarding (restyle, logic unchanged)
- **Shared step layout** (ritual7):
  - a back circle and a thin progress line
  - a centered title
  - a centered Capy that reacts
  - the controls
  - an ink pill CTA
- **Welcome:** immersive yuzu, Capy waving, "start where / you are." in mixed weights, an ink pill "Get started", and a text link "I already have an account".
- **Goal:** pill options. The chosen one turns ink and expands to show its description. Capy cheers.
- **Time:** "Which days can be yours?"
  - day circles
  - Capy sits inside a ring of 7 dots that fill as days are picked (the data-bound illustration)
  - "3 days for yourself. A rhythm, not a rule."
  - a minutes segmented pill
- **Equipment:** a place segmented pill, and gear as a toggle list in a group.
- **Health:** one centered question with big Yes/No pills, dealt like cards, with a "3 of 7" counter. No playful reaction to any answer.
- **Areas:** "What should we be gentle with?" as a toggle list (the same pattern as ritual7).
- **Disclaimer:** Capy caring, the checkbox row, and "Build my plan", which opens Almost-ready.
- **Almost ready (new, immersive yuzu):**
  - a ring of dots slowly rotating around Capy
  - checklist steps ticking in turn: "Choosing your moves", "Checking them against your answers", "Pacing your week"
  - the steps are timed for feel; the screen waits for `generatePlan()` and shows errors in place with Try again
- **You (name):** "What should Capy call you?" with a big centered field. Email is optional, as today.
- **Blocked:** neutral and calm. Capy caring, no yuzu, no motion beyond fades.
- **Sign in:** restyled.

### 5.8 You, Settings, Buddy (restyle)
- **You:**
  - a big Capy you can tap to wiggle, the name, "Capy the Explorer", and a stage progress bar
  - oversized numbers: workouts / minutes / week streak
  - a buddy row
  - a settings circle
- **Settings:**
  - grouped lists
  - reminders use the native `Switch`
  - the units row (kg/lb)
  - unchanged flows otherwise
- **Buddy:** grouped layout, the QR code in a paper card, the same flows.

## 6. Data and state

### 6.1 Migration `20261009000000_sets_and_sessions.sql`
- `workout_logs.sets jsonb`, nullable.
  - Shape: `[{ reps: int, weightKg: number|null, done: bool }]`.
  - Check: it's an array of ≤12 items.
  - Old rows stay null.
- New table `workout_sessions`:
  - columns: `id`, `user_id` (default `auth.uid()`, cascade), `plan_id` (cascade), `day`, `logged_on date`, `seconds int 0..86400`, `note text ≤500`, `created_at`
  - `unique (plan_id, day)`
  - RLS: select / insert / update your own rows. Insert requires owning the plan, mirroring `workout_logs`.
- `delete-account` needs no change (cascade).
- **You deploy it** with `supabase db push`. I won't touch the remote database.

### 6.2 Shared logic (`supabase/functions/_shared`, tested with `node --test`)
- `types.ts`: `SetLog`, `LogEntry.sets?`, `Session`.
- `progress.ts`, new pure functions:
  - `completedFromSets(sets)` gives `all` / `some` / `skip`
  - `sessionFocus(muscles[])` gives Lower / Upper / Full body
  - `sessionStats(logs)` gives sets, reps and volume
  - `weekSummary(sessions, logs, schedule, today)` gives done-this-week, minutes and the week strip
  - `lastPerformance(logs, exerciseId)`
  - `newBests(newLogs, priorLogs)`
- The existing adaptation reads `completed`, `difficulty` and `pain` only, so it is **unchanged**.

### 6.3 Active workout state
- `src/state/workout.tsx`: a context backed by AsyncStorage, saved on every change. Holds:
  - `planId`, `day`, `startedAt`
  - `moves[]`: `exerciseId` (possibly swapped), `sets[]`, `difficulty`, `pain`, `painArea`
  - `index`, `restEndsAt`
- **Restored on launch.** It is discarded if the plan changed or that day is already logged.
- **Saving:** `saveLogs` (with `sets`) and `saveSession(seconds)` run on finish. The note is saved on Done.

### 6.4 Swap query
`fetchAlternatives(exerciseId)` selects beginner strength exercises whose `primary_muscles` overlap, reading `equipment` and `stress_areas`. It then filters client-side with the shared `filterExercises` against the user's equipment and protected areas, drops moves already in today's plan, and keeps 3.

## 7. Code structure

| File | Responsibility |
|---|---|
| `src/theme.ts` | Tokens: colors, fonts, type styles, space, radius roles, motion, shadow |
| `src/components/ui.tsx` | Screen, text styles, Button (ink / accent / ghost / light), CircleButton, Field, OptionPill, Chip, SegmentedPills, ToggleRow, Group, StepHeader |
| `src/components/motion.tsx` | `PressableScale`, `Enter` (staggered), `CountUp`, `useCalmMotion` (Reduce Motion) |
| `src/components/capy.tsx` | `CapyAvatar` (head) + `CapyFigure` (full body, moods, wave / blink / hop / wiggle / breathe) |
| `src/components/exercise-loop.tsx` | Two stacked `expo-image` frames, Reanimated cross-fade loop, pause, reduced-motion fallback |
| `src/components/session.tsx` | `SessionCard` (home hero), `SessionRow`, `MomentPill`, `WeekStrip` |
| (no wrapper) | Icons use `expo-symbols` `SymbolView` with `{ ios, android }` names directly |
| `src/components/glass.tsx` | `GlassCircle`: GlassView when available, translucent fallback |
| `src/components/workout/*.tsx` | `SetSheet`, `RestRing`, `FeelCheck`, `MiniPlayer` |
| `src/lib/haptics.ts` | Intent → platform haptic |
| `src/state/workout.tsx` | Active workout persistence |
| removed | `components/plan.tsx` (DayCard), `(tabs)/progress.tsx` |

**New dependencies, all bundled in Expo Go SDK 57:**
- `react-native-reanimated` + `react-native-worklets`
- `react-native-gesture-handler`
- `expo-haptics`
- `expo-image`
- `expo-glass-effect`
- `expo-symbols`
- `@expo-google-fonts/bricolage-grotesque`
- `@expo-google-fonts/figtree`

**Removed:** `@expo-google-fonts/archivo`, `@expo-google-fonts/barlow-condensed`.

## 8. States, errors, accessibility
- **Empty states:**
  - Home with no history hides moments and Lately, and shows "Your week starts with one session" in the week block.
  - Plan with no history hides Past sessions.
- **Errors:** existing messages, kept in place next to the action that failed, with Try again. Nothing gets lost: a failed save keeps the workout state, so you can retry or minimize.
- **Accessibility:**
  - Every pressable has a role and label.
  - Steppers announce their values.
  - The rest timer is a polite live region.
  - Contrast is AA (muted text ≥4.5:1; ink on yuzu ≈11:1, never white on yuzu).
  - Dynamic Type is respected (no fixed heights on text containers).
  - Reduce Motion is honoured everywhere (§3.6).

## 9. Verification
- `npm run typecheck`, `npm run lint`, `npm test`. The new pure functions get tests in the existing `node --test` style.
- Run on the iOS Simulator (Expo Go) and an Android emulator if one is installed. Click through the full journey: onboarding → plan → Home → detail → workout (log sets, rest, swap, skip, minimize, resume, kill + relaunch) → complete → Plan history. Screenshot every screen in normal and Reduce Motion modes.
- **Needs from you:**
  - a filled-in `beginner-fit/.env` (Supabase URL + publishable key) to run against the backend
  - running `supabase db push` for the migration

## 10. Risks
- **iOS 26-only features** (glass, bottom accessory, tab minimize) have a graceful fallback on older iOS. The Android pill also serves as the fallback on iOS < 26.
- **`NativeTabs` is `unstable-*` in Expo Router.** It's already used here, but its API may change on SDK upgrades.
- **Hotlinked demo photos** (raw.githubusercontent.com) are slow on first load. `expo-image` disk caching plus prefetching the next move helps. Self-hosting stays a PRD open question.
- **Two typefaces** add roughly 200 KB of font files. That's acceptable.
