# Shop Corner Rwanda — Mobile (Expo, SDK 54)

This is the React Native / Expo app for Shop Corner, built to match the web app's
visual design and talk to Supabase directly (no Next.js API layer in between).

Built on **Expo SDK 54** (React Native 0.81, React 19.1, Reanimated 4.1.1 +
react-native-worklets 0.5.1, New Architecture enabled) to match Expo Go on devices
that haven't updated to SDK 55/56 yet. These exact versions were pulled from Expo's
own `bundledNativeModules.json` manifest for the `sdk-54` branch, not guessed.

## Verified before delivery

I don't have a physical device or simulator in my environment, so I can't show you
a screenshot of it running. What I *could* verify, and did:

- `npx tsc --noEmit` — zero type errors across the whole project
- `npx expo export --platform android` — full production bundle compiles successfully
  (1353 modules, all fonts/assets resolved)
- `npx expo export --platform ios` — same, compiles successfully (1354 modules)
- `npx expo-doctor` — 16/18 checks pass; the 2 failures are network-blocked checks in
  my sandbox (Expo's remote schema validation and React Native Directory lookup),
  not real project issues

This confirms the JS bundle is structurally sound for both platforms on SDK 54. It does
**not** confirm the visual layout matches your screenshots pixel-for-pixel — that part
still needs your eyes on a real device.

## What's included so far

- Project scaffold (Expo SDK 56, TypeScript, React Navigation native-stack + bottom-tabs, NativeWind v4)
- Supabase client wired up for React Native (AsyncStorage session persistence)
- Shared business logic ported from the web app:
  - `src/lib/inventory.ts` — image-variant stock helpers (same as `lib/inventory.ts` on web)
  - `src/lib/images.ts` — image path resolution helpers (same as `services/api.ts` on web)
  - `src/lib/format.ts` — collection title formatting, stable-index helpers
  - `src/types/index.ts` — same Product/CartItem/User types as web
- **Home screen** built to match the provided screenshots:
  - Header (hamburger, logo, search, cart badge)
  - Horizontally scrollable shortcut tabs (Shop All / Top Category / New Arrivals / ...)
  - Hero collection carousel (paged, dot indicators, arrow buttons) — driven by real
    product categories from Supabase, same derivation logic as the web app's carousel
  - "Shop By Categories" circular thumbnails — also derived from real product data
  - Bottom tab bar (Home / Categories / Cart / Wishlist / Account)

Categories, Cart, Wishlist, and Account tabs are currently placeholder screens —
we're building those next.

## Setup

1. Install dependencies (already included in this zip's `node_modules`, but if you
   move machines or it gets corrupted, just run):
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your real Supabase project values:
   ```bash
   cp .env.example .env
   ```
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   Find these in your Supabase project under Settings → API.

3. Start the dev server:
   ```bash
   npx expo start
   ```
   Scan the QR code with the **Expo Go** app on your phone (easiest way to test
   immediately), or press `a` / `i` for an Android/iOS simulator if you have one set up.

## Important note on the `cart` table

The web app's `cart` table is keyed by a `session_id` (cookie-based, anonymous-friendly).
This mobile app currently has no equivalent session strategy wired up yet — `useCart`
assumes a `user_id` column, which doesn't exist on your current schema. We need to
decide together how mobile carts should be identified (logged-in user only? a generated
device/session id stored in AsyncStorage, like the web app?) before the Cart tab is built.
Flagging this now so it doesn't surprise you later.

## What to check on your device

Compare against the screenshots you sent and tell me specifically what's off:
- Spacing/padding that feels too tight or too loose
- Font sizes that read too big/small
- Carousel card proportions (currently a fixed height of 460px — may need adjusting per device)
- Any color that doesn't match

I built this from screenshots without being able to visually test it myself in this
environment, so your on-device feedback is the real verification step.
