# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack
React Native (Expo SDK 57, expo-router), Supabase backend, Claude via a Supabase Edge Function. One brand language across iOS and Android, native affordances per OS.

## Users
Complete gym novices with surface-level fitness knowledge who don't know where or how to start. Trigger: they decide to start working out, often after downloading another app and getting lost in it. Secondary (later): people already training who want faster planning.

## Product Purpose
Get a nervous beginner from install to a workout plan they can actually follow, without outside help, then keep the plan right for them as they log how each workout felt. Success: novices finish onboarding unaided, complete their first week, and rate the app highly for ease of use.

## Positioning
A named AI coach who talks like a patient friend: plain-language questions, a real health check before any plan, and a plan that changes when something hurts, with the reason said out loud. Competing apps assume fitness literacy; this one assumes none.

## Operating Context
- Used on a phone, often at home or in a gym the user feels out of place in.
- Core loop: onboarding (questions, health screen, disclaimer) → weekly plan → today's workout → log each exercise (done? how hard? any pain?) → weekly adjustment with explanations.
- High-risk health answers block plan generation and direct the user to get medical clearance.

## Capabilities and Constraints
- Exercises come only from a curated beginner library (free-exercise-db, public domain), each with step-by-step instructions and images.
- Plan adjustments are rule-based: pain → swap or lighten, never harder; too easy twice → small capped increase; too hard → easier; the same pain area twice → "see a professional".
- Monetization: free trial, then a one-time purchase. No subscription. Price and trial scope TBD.
- Out of scope for MVP: meal planning (postponed), social features, wearables.

## Brand Commitments
- Name: "Beginner Fit" (placeholder).
- The AI companion is a **named coach character** that speaks to the user. Name TBD; design placeholder "Juno".
- Must NOT feel gym-bro or intense: no aggressive, "no pain no gain" energy.
- Visual direction (user-pinned 2026-09-25): a sporty, aesthetic look like modern activity apps (the user named Strava as the reference), clean and polished rather than hardcore gym. It replaces the earlier "community notice board" direction.

## Evidence on Hand
One anecdote: a novice friend needed help navigating an existing workout app. No testimonials, user counts, or ratings exist; never fabricate them.

## Product Principles
1. Assume zero fitness knowledge. No gym jargon without an explanation.
2. One clear next step per screen.
3. Safety decisions are visible and explained, never silent.
4. The coach explains every change in one plain sentence.
5. Pain is information, not failure.

## Accessibility & Inclusion
Beginners of any body type, age and confidence level. Touch targets ≥44pt, WCAG AA contrast, no meaning carried by color alone (pain/difficulty states need labels).
