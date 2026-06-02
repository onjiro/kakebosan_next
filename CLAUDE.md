# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

家計簿さん — a personal finance app ("複式簿記で家計簿を！") that records household finances using **double-entry bookkeeping**. Next.js 15 (App Router) + React 19 + Supabase, styled with Tailwind CSS v4. UI strings are in Japanese.

## Commands

```bash
npm run dev     # dev server with Turbopack (http://localhost:3000)
npm run build   # production build
npm run start   # serve production build
npm run lint    # next lint (eslint, next/core-web-vitals + next/typescript)
```

There is no test suite. Type checking happens via `npm run build` (tsconfig is `noEmit`).

Required env vars (see `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Architecture

### Supabase clients — pick the right one for the context

There are three factory functions, all returning a `Database`-typed client. Using the wrong one breaks auth/cookies:

- `@/lib/supabase/client.ts` → `createClient()` — **browser** (Client Components, `"use client"`).
- `@/lib/supabase/server.ts` → `createClient()` — **Server Components / server code** (async; reads cookies via `next/headers`).
- `@/lib/supabase/middleware.ts` → `updateSession()` — used only by `src/middleware.ts`.

`src/types/supabase.ts` is the generated DB schema. Always type clients with `Database` and use the `Tables<"...">` / `Tables<"...">["...]` helpers rather than hand-rolling row types.

### Auth flow

- `src/middleware.ts` runs `updateSession()` on every non-static request. It calls `supabase.auth.getUser()` to refresh the session and **redirects unauthenticated users to `/`** (allowing only `/` and `/auth/*`). Do not insert code between `createServerClient` and `getUser()` — see the comments in `middleware.ts`.
- `/` (`src/app/page.tsx`) is the login page: OAuth sign-in with GitHub/Google, `redirectTo` → `/auth/callback`, which then routes to `/transactions`.
- Routes under `src/app/(protected)/` sit behind a layout that re-checks the user server-side and redirects to `/` (defense in depth on top of middleware).

### Domain model (double-entry bookkeeping)

Three core tables, all scoped by `user_id`:

- `accounting_items` — chart of accounts. Each has an `accounting_type` enum: `expense | revenue | asset | liability | equity`, plus a `selectable` flag.
- `accounting_transactions` — a dated transaction (`date`, `user_id`).
- `accounting_entries` — the debit/credit legs. Each entry has a `side` enum (`debit | credit`), an `amount`, and an `item_id`.

A transaction is created with **exactly two entries** (one `debit`, one `credit`) for the same amount — see `src/features/TransactionModal/action.ts`. Updates delete-and-reinsert both entries. When changing transaction write logic, keep both legs balanced.

Reports (`src/app/(protected)/reports/page.tsx`) aggregate entries by item: revenue accounts net credit-positive, expense accounts net debit-positive.

### Code organization

- `src/app/` — App Router pages. `(protected)/` is a route group for authenticated pages (transactions, reports, settings, inventory).
- `src/features/` — self-contained feature modules with their own `index.tsx`, `action.ts` (Supabase mutations), and `type.ts` (e.g. `TransactionModal`, `TransactionList`).
- `src/components/` — shared presentational/UI components.
- Import alias: `@/*` → `src/*`.

### Data-fetching patterns

- Initial data is fetched in Server Components (e.g. `transactions/page.tsx` selects the first 20 with nested `entries → item` joins), then passed to Client Components.
- `TransactionList` does infinite scroll: an `IntersectionObserver` triggers paginated browser-side fetches (`PAGE_SIZE = 20`, keyset pagination via `.lt("date", ...)`).
- After mutations, lists are re-rendered by setting a React `key` derived from transaction ids so `router.refresh()` forces a remount.
