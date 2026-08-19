# Game Plan: Welcome to Futbol

**Date:** 2026-08-19  
**Status:** In progress  
**One-liner:** A solo club-owner soccer game for phone and computer — build a fake club, play matches in short bursts, climb leagues with play money — built as its own app now, ready to drop into FLY later.

---

## Goal

You own a soccer club. You buy players, pick kits, grow the stadium, and play matches whenever you open the app. Win matches → earn money → better players and stadium → climb from a lower league to a higher one. Top 3 go **up** (promotion). Bottom 3 go **down** (relegation).

Success for v1: you can play a full season on your phone *or* computer, progress saves in the cloud (same club on both), and it feels fun in a 3–5 minute sitting — with a longer “one more match” pull.

Look: **clean sports app (A) with a splash of cartoon (B)** — sharp menus like ESPN; crest, kits, and stadium use simple shapes and bold colors. No toilet jokes in this game.

## Out of scope

- Real player names, real leagues, or any license
- Friends / vs other people
- Real-money fantasy, payouts, or paid league entry
- Full kit designer (sponsors, number fonts, 3D kits)
- Hotels / travel (later)
- Other Toilet Games
- FLY login, FLY Games tab, or embedding in Fans Like You (that is **v2.0**)
- Sound required to play (optional later)

## Options considered

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| A. Clicker-only (numbers go up, no matches) | Fast to build | Doesn’t feel like soccer | Free |
| B. Owner career, fake world, solo (this plan) | Matches your idea; kits/stadium matter; safe legally | Fantasy money-leagues wait until later | Free tiers |
| C. Fantasy pick-real-stars first | Easier path to paid contests later | Throws away kits, stadium, “you own the club” | License risk + more legal later |

**Recommendation:** **B.** This is a club-owner game. Fantasy drafts are a second mode after v1 is fun. Paid contests are a later product, not this build.

## How it plays (v1)

**Session:** Open app → see last result and cash → make 1–3 choices (lineup, buy a player, upgrade stadium, change kit colors) → tap **Play match** → 10–20 second sim + short recap → done or one more.

**Match timing:** You can play when you open the app. A short wait (about **2–3 minutes**) between matches so a toilet visit is one match, not a 40-game binge. You can store up to **3 match charges** so a longer sit still works. (While we build, a test switch can fill charges so we don’t wait.)

**World:** All fake. Generated player names and two divisions of **10 clubs** each. You start in Division 2.

**Your club:** Starting squad of generated players (GK / DEF / MID / FWD) with simple ratings (Attack, Defense, Energy, overall). You pick 11 to start.

**Matches:** Computer sims the score from team strength + a bit of luck (underdogs can win). Home team gets a small boost. You get a 2–3 line recap, not a 90-minute match.

**Money (play money only):**
- Tickets: bigger stadium + better results = more cash
- Wages: better players cost more each match
- Prize money: higher league pays more
- Transfers: buy from a generated list; sell your extras

**Stadium:** One upgrade track (capacity). More seats = more ticket money.

**Kits:** Home and away. Two colors each + a few simple patterns + a simple crest picker (shapes + colors). Splash of B lives here.

**Leagues:** Season = each team plays the others home and away (18 matches in a 10-team league). Then promotion/relegation: top 3 up, bottom 3 down. Then a new season starts. Your squad carries over; cash and stadium carry over.

**Save:** Log in once. Same club on phone and computer.

## Stack and hosting

Build as a **website that also works on your phone** (add to Home Screen). FLY v2 can open this same site in a Games tab — no rewrite.

| Need | Choice | Why |
|------|--------|-----|
| App | React + Vite | Many screens (squad, table, kits); not one giant file |
| Phone | PWA (Add to Home Screen) | Feels like an app, still a website for FLY later |
| Login + save | Supabase free | Phone + computer share one club |
| Hosting | Vercel free | Fits a web app; Render if you prefer later |
| Look | CSS + simple SVG kits/crest/pitch | No paid art, no photo-real FIFA look |

**Code style:** Blacksite CS-1–CS-15 (split files, headers, no single-file app).

**Do not:** put API keys in the browser; start paid services; share Comedy4All’s database. New free Supabase project for this game (needs your OK when we build).

**v2.0 (not this plan):** Games area in FLY; optional shared FLY login; this game listed next to other Toilet Games. Keep v1 URLs and data model boring and separate so that glue is easy.

## Milestones

1. **Shell + look** — screens, nav, sports-app layout, colorful crest placeholder  
2. **Club + squad** — generate a team, view players, pick 11  
3. **Match sim + recap** — tap play, get a score, cash in/out, match charges  
4. **League table + season** — 10 teams, 18 games, promotion/relegation into Division 1  
5. **Transfers + wages** — buy/sell generated players; money actually matters  
6. **Stadium + kits** — capacity upgrades; home/away colors, pattern, crest  
7. **Login + cloud save** — Supabase; same club on phone and computer  
8. **Polish + live** — PWA, deploy free hosting, you play a real season

Playable “is this fun?” moment is after **milestone 4**. Kits/stadium/login can follow once matches feel right.

## Risks

- **Too much like Football Manager.** If we add training, tactics boards, and youth academies, v1 never ships. Stick to the list above.
- **Matches feel random.** Recap should hint *why* you won/lost (better attack, tired legs, home crowd).
- **Waiting too long / not long enough.** 2–3 min cooldown is a guess; we tune after you play.
- **Licensing later.** Fake names from day one. Never use real club crests or player photos.
- **Real money later.** US paid fantasy is a legal product, not a toggle. v1 is play money only.
- **FLY v2.** Unknown how FLY’s consumer app embeds games. A public URL is the safe contract.

## Open questions

- Public URL / name: `welcometofutbol.com` vs a subdomain (e.g. under an existing site)? Default: own Vercel URL until you buy a domain.
- Division names: “Division 1 / 2” vs made-up league names (e.g. “Iron League”)? Default: Division 1 and 2.
- Club name: you type your own in v1?

These are not blockers. Defaults above if you don’t care.

---

## Tickets (draft — not filed until Michael says "create tickets")

| # | Title | Priority | Depends on | Notes |
|---|-------|----------|------------|-------|
| 1 | App shell, nav, sports look | high | — | Phone + computer layout |
| 2 | Fake player generator + squad screen | high | 1 | Positions + simple ratings |
| 3 | Match engine + recap + match charges | high | 2 | 2–3 min recharge, store 3 |
| 4 | League of 10 + table + season end | high | 3 | Then add second division |
| 5 | Promotion / relegation (2 divisions) | high | 4 | Top 3 / bottom 3 |
| 6 | Cash, wages, ticket income | high | 3 | Play money |
| 7 | Transfer list buy/sell | medium | 6 | Generated free agents |
| 8 | Stadium capacity upgrades | medium | 6 | One upgrade track |
| 9 | Home/away kit + crest picker | medium | 1 | Splash of B |
| 10 | Supabase login + cloud save | high | 2 | Ask before creating project |
| 11 | PWA + deploy (Vercel free) | medium | 5, 10 | Live URL for you to play |
| 12 | Test-fill match charges (dev only) | low | 3 | So we can play a season while building |

---

## Michael's approval

- [ ] Game plan approved
- [ ] Tickets approved for creation

Say **ship it** to start building (I’ll still ask before creating a Supabase project or spending money). Say **create tickets** if you want the list filed first.
