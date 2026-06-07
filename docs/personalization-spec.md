# Checkin Personalization — Implementation Spec

> Twist-style, session-based personalization for the Checkin Georgia web app.
> Status: approved 2026-06-04. Source design: brain vault `wiki/hot-checkin.md`.
> Adapted from Twist's personalization architecture (product-commerce) → reshaped
> for local-services booking. We copy the *logic*, not the *fields*.

## Goal

Add favorites, recently-viewed, a "for you" feed, and preference capture to the
web app, with design upgrades baked into every surface touched. Server-side,
keyed by an anonymous session ID, so there's zero login friction at launch and it
upgrades cleanly to real accounts later.

## Non-goals (separate future specs)

Real BOG/TBC payments, availability engine, notifications, review *submission*,
the Flutter port, and a standalone full-site visual redesign. The API is kept
Flutter-friendly so the app can adopt it later.

## 1. Identity model

- First-party `session_id` (UUID) created on first visit, stored in **both** a
  cookie (server-readable for SSR) and `localStorage`.
- Every signal row carries `session_id` + nullable `user_id` (Twist's anon
  pattern). Sent to the API via `X-Checkin-Session` header (cookie fallback).
- Future: phone-OTP login fires a one-time `claim` that stamps the session's
  rows with `user_id` → cross-device, nothing lost.

## 2. Data model — `db/migrations/007_personalization.sql`

```
venue_views      id, session_id, user_id?, venue_id, source, created_at
                 idx (session_id, created_at), (venue_id, created_at)
favorites        id, session_id, user_id?, venue_id, created_at
                 unique (session_id, venue_id)
user_preferences session_id PK, user_id?, favorite_verticals[],
                 preferred_districts[], price_tiers[], tags[],
                 onboarded_at, updated_at
venues  += favorite_count INT DEFAULT 0
venues  += tags TEXT[]   (cuisine / service-type, admin-set)
```

No A/B-flag/events tables in v1 (YAGNI). Views + favorites + bookings are signal.

## 3. API (Express+TS, Checkin-Georgia-API)

`resolveSession` middleware: reads `X-Checkin-Session` header/cookie + optional
Firebase user → `req.session = { sessionId, userId? }`.

| Method | Route | Purpose |
|---|---|---|
| POST | `/views` | fire-and-forget log venue view → 202 |
| GET | `/favorites` | session's favorited venues (full cards) |
| POST/DELETE | `/favorites/:venueId` | add/remove, bump `favorite_count` |
| GET/PUT | `/preferences` | read / upsert (partial) prefs |
| GET | `/feed` | the "for you" ranked feed (sections) |
| GET | `/recently-viewed` | distinct recent venues for session |

## 4. Ranking — Twist's algorithm, reshaped

Libs mirror Twist 1:1: `affinity.ts`, `feedRanking.ts`, `feedService.ts`,
`feedConfig.ts`.

**Affinity** (exp. decay, half-life 14d) from: views, bookings (~2× a view),
favorites (2× boost), explicit prefs (2× boost). Dimensions: `vertical`,
`district`, `tags`, `price_tier`. Normalized to [0,1].

**Score weights** (`feedConfig.ts`, admin-tunable later):

| Signal | Weight |
|---|---|
| vertical affinity | 0.25 |
| district affinity | 0.20 |
| proximity (PostGIS) | 0.15 |
| tag/cuisine affinity | 0.15 |
| rating × review_count | 0.13 |
| price affinity | 0.07 |
| popularity (favorite_count) | 0.05 |

Dropped Twist's freshness/VIP (services don't go stale; quality + proximity win).

**Feed sections:** "🎯 შენთვის შერჩეული" (For you), "📍 ახლოს შენთან" (Near you),
"🔥 პოპულარული" (Popular). Cold-start (no signals) → popular + "tell us what you
like" prompt (Twist's empty-state pattern).

## 5. Frontend (Checkin-Georgia-Web, Next.js 15)

- `lib/session.ts` + extend `lib/api.ts` to send session header
- `FavoritesContext` (port of Twist's) + heart button on cards & venue page
- `/favorites` page
- `/preferences` page — chip multi-select (port Twist's `PreferencesSection` UX):
  favorite categories, districts, price tier, cuisines — bilingual Georgian
- `ForYouFeed` on home (sections + skeletons + cold-start prompt)
- `RecentlyViewed` rail on home + venue page; log view on `/venues/[slug]` load
- Design primitives extracted: `VenueCard`, `Chip`/`ChipMultiSelect`,
  `SectionHeader`, `Rail`, `Skeleton`, consistent `Button`/`Input`.
  Home = hero → For you → Recently viewed → category sections.

## 6. Phases (each: build → typecheck/build → deploy dev → update hot-checkin.md)

1. **Backend foundation** — migration 007, session middleware, all endpoints,
   ranking libs.
2. **Favorites + Recently-viewed** (FE) + extract `VenueCard`.
3. **Preferences** capture (FE) + chip primitives.
4. **"For you" feed** (FE) — wire affinity end-to-end.
5. **Home redesign + polish** — integrate all surfaces, dark-mode + mobile parity.

## 7. Defaults

- Feed / recently-viewed / favorites render client-side (landing stays cacheable,
  no SSR flash — Twist does the same).
- `tags` is a new admin-set field; seed a few so the feed has signal.
- Verticals = the existing 6; price tiers = `₾ / ₾₾ / ₾₾₾`.
