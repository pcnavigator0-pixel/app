# Update — real Account screen (sign-in entry point + order history)

No new dependencies. No `npm install` needed for this update.

## Where each file goes

| File in this zip | Status |
|---|---|
| `src/hooks/useOrderHistory.ts` | **New** — fetches the logged-in user's orders + items |
| `src/screens/AccountScreen.tsx` | **New** |
| `src/navigation/TabNavigator.tsx` | Modified — Account tab now uses the real screen |

## What this fixes

Before this update, the only way to reach the Login screen was by trying to check
out from the Cart — there was no general "sign in" entry point, and the Account
tab was still a placeholder. Now:

- **Logged out:** Account tab shows a clean sign-in prompt with a button straight
  to the Login screen.
- **Logged in:** shows your profile (name, email, initial avatar), a sign-out
  button, and your real order history pulled from `orders` + `order_items` —
  status badge (colors match the web app's pending/paid/processing/delivered/
  canceled scheme), item thumbnails, and total.

This one was safe from the `seller_business_name`-style bug from last time —
`order_items` actually has a declared foreign key to `orders`
(`order_items_order_id_fkey`), so the nested relational select works correctly
as a single query, no separate lookup needed.

## Verified before delivery

- `npx tsc --noEmit` — zero errors
- `npx expo export --platform android` — full bundle compiles (1379 modules)

Let me know if the `expo-location` install issue from last round is sorted —
that's still needed for Checkout's GPS delivery quote to work.
