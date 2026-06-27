# Update — Product Detail, real Cart, Checkout/Order placement, and a real bug fix

## ⚠️ New dependency — you DO need to run `npm install` this time

Unlike the last update, this one adds a new package: **`expo-location`** (for the
GPS-based delivery quote). After copying the files below, run:

```bash
npm install expo-location@19.0.8
```

(That's the exact SDK-54-correct version — installing a newer one will break the
build the same way the reanimated/worklets mismatch did before.)

## Where each file goes

Copy each file to the same path inside your project root, overwriting where it
already exists:

| File in this zip | Status |
|---|---|
| `app.json` | Modified — added expo-location permission plugin |
| `src/hooks/useCart.ts` | Rewritten — now does real Supabase reads/writes |
| `src/hooks/useHomeData.ts` | Modified — bug fix (see below) |
| `src/hooks/useOrders.ts` | **New** — places real orders |
| `src/hooks/useProductDetail.ts` | **New** — fetches one product + reviews |
| `src/hooks/useProductFeed.ts` | Modified — bug fix + seller name lookup fix |
| `src/hooks/useUserProfile.ts` | **New** — fetches logged-in user's profile |
| `src/lib/delivery.ts` | **New** — ported from web, flat fee + distance calc |
| `src/lib/format.ts` | Modified — fixed error-message bug (see below) |
| `src/lib/location.ts` | **New** — GPS permission + delivery quote |
| `src/lib/notifications.ts` | **New** — inserts notification rows |
| `src/lib/order-totals.ts` | **New** — ported from web, subtotal/total math |
| `src/lib/session.ts` | **New** — AsyncStorage session id (cart key) |
| `src/navigation/RootNavigator.tsx` | Modified — added ProductDetail/Login/Checkout |
| `src/navigation/TabNavigator.tsx` | Modified — Cart tab now uses the real screen |
| `src/navigation/types.ts` | Modified — added Login/Checkout params |
| `src/screens/CartScreen.tsx` | **New** |
| `src/screens/CheckoutScreen.tsx` | **New** |
| `src/screens/HomeScreen.tsx` | Modified — quick-add/cart-icon/card-tap now do real things |
| `src/screens/LoginScreen.tsx` | **New** — email/password sign-in only (no signup yet) |
| `src/screens/ProductDetailScreen.tsx` | **New** |

## The bug you reported — found and fixed

You said products were failing to load with a generic "Failed to load" message. I
found two real, separate problems:

**1. The actual root cause:** `useProductFeed.ts` (and `useProductDetail.ts`) were
selecting a column called `seller_business_name` directly off the `products` table.
That column doesn't exist there — it's `business_name` on the `users` table, linked
through `seller_id`. Supabase rejected the query outright. Fixed by fetching seller
names in a separate query and merging them in, since your `products` table doesn't
have a declared foreign key to `users` that would let me do it in one joined query.

**2. Why you only saw a vague message instead of the real error:** every hook had
`err instanceof Error ? err.message : 'Failed to load...'`. Supabase's error objects
are **not** instances of the native `Error` class — they're plain objects shaped
like `{ message, details, hint, code }`. So that check was always false, and the
real error (which would have said "column seller_business_name does not exist")
was silently thrown away in favor of my generic fallback text. Fixed with a proper
`getErrorMessage()` helper in `src/lib/format.ts` that handles both shapes, and
every hook now also `console.warn`s the raw error so it shows up in your terminal
running `npx expo start` if something fails again — that's the fastest way to get
me the real error text next time.

## What's now real, not a placeholder

- **Cart** (`useCart.ts`, `CartScreen.tsx`): add/update/remove/clear all write to
  Supabase for real, keyed by a generated session id stored in AsyncStorage
  (mirrors how the web app uses a cookie/localStorage id). Stock is validated
  before any write succeeds, same logic as the web app's cart API.
- **Product Detail** (`ProductDetailScreen.tsx`): matches your screenshots —
  variant image grid with in/out stock badges, chosen-variant quantity stepper,
  Features icon grid, About section, trust badges, Add to Cart + WhatsApp.
- **Checkout** (`CheckoutScreen.tsx`, `useOrders.ts`): requires login (redirects to
  the new Login screen if you're not signed in, matching the web app's rule).
  Requests device GPS for a delivery quote — flat RWF 1500 base fee, with the
  distance-based component already wired up for whenever you raise the per-km rate
  above 0 in `delivery.ts`. Falls back to manual address + the flat fee if GPS
  permission is denied. On success, creates the order + order_items, sends
  notifications to the buyer and each seller involved, and clears the cart.

## What's still a placeholder / explicitly deferred

- **Signup** — only login exists. Create test accounts via the web app for now.
- **Follow seller** button — visible context exists, not wired up.
- **Push notifications** — order notifications are inserted as DB rows only. Real
  push (OneSignal) requires a server-side secret that can't safely live in a
  shipped mobile app — that needs a Supabase Edge Function if you want it.
- **Compare** and **Wishlist persistence** — wishlist is currently local
  component state only, not saved anywhere.

## Verified before delivery

- `npx tsc --noEmit` — zero errors
- `npx expo export --platform android` — full bundle compiles (1377 modules)

I still don't have a device to see this rendered or to confirm the Supabase writes
actually succeed against your real RLS policies — please test cart add, checkout,
and order placement on your end and send me the exact error text (now that it'll
actually show the real one) if anything fails.
