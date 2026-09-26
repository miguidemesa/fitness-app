# AI Beginner Workout Companion

## Problem
Complete gym novices, who know a little about fitness but not where or how to start, get lost in current workout apps. Those apps assume the user already knows fitness and bury them in options and information. The cost: beginners get stuck, ask others for help, or give up before their first real workout.

## Evidence
- Observed: a friend (a novice) asked for help using an existing workout app because they couldn't find their way around it.
- Assumption: this is common among novices, not a one-off. Needs validation via user interviews with 5–10 novices, plus an app-store review analysis of the top workout apps looking for complexity and confusion complaints.

## Users
- **Primary**: Complete gym novices with only surface-level fitness knowledge who want to start training but don't know what to do or how to use existing apps. The trigger is deciding to start working out, often after downloading an app and getting overwhelmed.
- **Secondary (later)**: People already doing fitness who want faster planning. Not a design target for the MVP.
- **Not for**: Experienced lifters who want advanced programming, athletes, or people who need medical or rehab guidance.

## Hypothesis
We believe **an AI companion that asks beginner-friendly personalized questions and generates a complete workout plan** will **remove the navigation and knowledge barrier to starting** for **gym novices**.
We'll know we're right when **novices can get from install to a usable plan without help, and rate the app highly for ease of use**.

## Success Metrics
"A lot of good reviews" is the stated goal. The metrics below make it measurable. All targets are TBD and need validation via launch baseline and benchmarks from similar apps.

| Metric | Target | How measured |
|---|---|---|
| App-store rating | TBD (e.g. ≥ 4.5★) | Store rating after N reviews |
| Onboarding completion (install → plan generated) | TBD | Product analytics funnel |
| Completion without outside help | TBD | Usability test with novices |
| First-week workout completion | TBD | Workouts marked done in week 1 |
| Reviews mentioning "easy" / "beginner-friendly" | TBD | Review text analysis |

## Scope
**MVP**
1. **AI onboarding**: personalized, plain-language questions, including injury and illness history.
2. **Plan generation**: a complete, beginner-appropriate workout plan that respects the injury and illness answers.
3. **Progress tracking**: the novice logs completed workouts, how hard each felt, and any pain.
4. **Adaptive plan**: the AI adjusts the plan based on reported difficulty and pain.

**Monetization**: One-time purchase after a free trial. No subscription. Price TBD.

**Platform**: Cross-platform (iOS + Android). The user has chosen React Native; stack details belong in `/plan`.

**Safety requirements** (recommended; need validation by a certified trainer or physio)
- Pre-plan screening is based on the **PAR-Q+** (Physical Activity Readiness Questionnaire), the standard pre-exercise screen. A "yes" on a high-risk item (e.g. heart condition, chest pain, dizziness or fainting, recent surgery, pregnancy) → no plan is generated and the user is told to get medical clearance first.
- Lower-risk history (e.g. an old knee injury) → the plan avoids exercises that stress that area, instead of blocking.
- The AI picks only from a **curated library of vetted beginner exercises**; it never invents exercises.
- Pain reported on an exercise → that exercise is swapped or reduced, never progressed. Pain repeated across sessions → suggest seeing a professional.
- Difficulty "too easy" → small, capped increases only.
- A clear "not medical advice" disclaimer, accepted during onboarding.

**Out of scope**
- Nutrition / meal planning. Postponed to a later phase, not dropped. Excluded from the MVP to keep the hypothesis test focused on workouts.
- Advanced programming for experienced users, which would compromise beginner simplicity.
- Anything not needed to test the hypothesis (social features, wearables, coach marketplace). Deferred until the core flow is validated.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Validate problem | 5–10 novice interviews confirm the navigation/knowledge barrier | pending | — |
| 2 | AI onboarding questions | A novice answers plain-language questions, including injury and illness history, without confusion | in-progress (built; needs novice testing) | — |
| 3 | Plan generation | A novice receives a complete, followable beginner plan that respects their injury and illness history | in-progress (built; deploy + test) | — |
| 4 | Progress tracking | A novice logs workouts and sees their progress | pending | — |
| 5 | Adaptive plan | The plan visibly adjusts based on logged progress and input | pending | — |
| 6 | Beta with novices | Real novices go from install to plan unaided, use it for 2+ weeks, and leave ratings | pending | — |

## Open Questions
- [x] ~~Subscription?~~ No subscription.
- [x] ~~Free or paid?~~ One-time purchase.
- [x] ~~Free trial?~~ Yes. Scope is TBD (recommended: onboarding + first plan free).
- [ ] One-time price vs. lifetime AI cost per user: what price covers it? Being decided soon.
- [x] ~~Exercise data source?~~ Open databases. Primary: **free-exercise-db** (Unlicense / public domain, 800+ exercises with `level` [beginner], equipment, primary/secondary muscles, step-by-step instructions, images). Checked 2026-09-25.
  - Secondary / gap-filler: **wger**. Its exercise data is Creative Commons with the licence set per entry, so each entry must be checked and credited.
  - Plan structure grounded in published guidelines (WHO / ACSM beginner recommendations), not other apps' programs.
- [ ] Confirm where free-exercise-db's images come from before shipping them (it is a community-compiled dataset).
- [ ] Add body-area / injury tags to the curated beginner subset (the dataset has muscle groups but no joint or injury tags).
- [x] ~~Meal planning?~~ Postponed to a later phase.
- [x] ~~Tracking?~~ Yes. Progress tracking plus adaptive plan adjustment are in the MVP.
- [x] ~~Adaptation input?~~ Difficulty and pain feedback.
- [x] ~~Exercise guidance?~~ Not in the MVP. Revisit if novices can't perform the exercises (see Risks).
- [x] ~~Platform?~~ Cross-platform, React Native.
- [ ] High-risk screening answers: the draft uses PAR-Q+ (see Safety requirements). Needs sign-off from a trainer or physio.
- [ ] Plan safety checks: the draft uses a curated library plus rules (see Safety requirements). Who curates and reviews the library? TBD.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Problem is less common than assumed (evidence is one anecdote) | Medium | High | Milestone 1 interviews before building |
| AI generates unsafe or inappropriate exercises for novices | Medium | High | Constrain plans to vetted beginner exercises; safety disclaimers; TBD review process |
| "Easy for beginners" isn't enough to stand out from established apps | Medium | High | Validate differentiation in interviews and usability tests |
| Scope creep toward experienced users erodes simplicity | High | Medium | Keep "Not for" list enforced in MVP |
| One-time revenue, but AI usage (plan generation and adjustments) costs money for as long as each user stays | High | High | Estimate lifetime AI cost per user before setting the price; limit how often AI runs (e.g. adjust weekly, not after every workout) |
| No exercise guidance: novices don't know how to perform moves, which is the core audience's gap | High | High | Test in the beta; if confusion shows up, add basic instructions before launch |
| A paid upfront app is harder for novices to try than free competitors | Medium | High | Consider a free trial (e.g. onboarding + first plan free) |
| Injury/illness history is sensitive health data | High | High | Collect the minimum needed; get explicit consent; check privacy law in launch markets (TBD) |
| AI adapts the plan wrongly for someone with an injury or illness | Medium | High | Hard stop plus a "see a doctor" referral for high-risk answers; conservative adjustments |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
