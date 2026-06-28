# Update — carousel card height fix + cart RLS policy SQL

No new dependencies. No `npm install` needed.

## Where each file goes

| File in this zip | Status |
|---|---|
| `src/components/CollectionCarousel.tsx` | Modified — fixed oversized card |
| `sql/fix-cart-rls.sql` | **New** — run in Supabase SQL editor (not a code file) |

## 1. The oversized "Shop All / Top Category / New Arrivals" card

You were right — the carousel card had a **fixed 460px height** regardless of
screen width. On a typical ~358px-wide card (390px-wide phone), that's a height
ratio of 1.28 — noticeably taller and more elongated than your reference
screenshot, which is closer to a 0.95 ratio (roughly square). The fixed height
also meant it looked *worse* on narrower phones, since 460px stayed constant
while the width shrank.

Fixed by making the height **proportional to the card's actual width**
(`width × 0.95`, matching the ratio measured from your screenshot) instead of a
hardcoded pixel value. This scales correctly across different device widths —
narrower phones get a shorter card, wider phones get a taller one, but the
proportions stay consistent. Also tightened the text overlay's bottom offset
slightly to match the now-shorter card.

## 2. The cart RLS error — why it happens and why the fix is safe

> "why don't change database, use exactly allow api from website"

Here's the precise reason that's not actually possible: the website's cart API
uses Supabase's **service role key**, which bypasses Row Level Security
entirely — that's not a configuration choice, it's how Postgres/Supabase work by
design (RLS only applies to the `anon` and `authenticated` roles; `service_role`
is exempt). I checked every file in your web app that touches the `cart`
table — all five use the service-role client, none use the anon key.

That key **cannot** be put in the mobile app — anyone who decompiles the app
could extract it and get unrestricted read/write/delete access to your entire
database, not just `cart`. So "use exactly what the website does" would mean
shipping a master key inside a public app, which isn't a safe trade.

The actual fix: `cart` has no `user_id` column (it's purely `session_id`-keyed,
disconnected from Supabase Auth), so there's nothing for a stricter policy to
check against. `sql/fix-cart-rls.sql` adds a policy allowing the `anon` role to
read/insert/update/delete cart rows. This is **the same level of access the
website already effectively has** via its service-role bypass — not a new
exposure, just making the already-true thing explicit for the anon key too.

**Confirmed this won't break the website:** since the website never queries
`cart` through the anon key, these policies are simply never evaluated for any
website request — they only apply to the `anon`/`authenticated` roles the
mobile app actually uses.

**Worth knowing plainly:** this policy is intentionally open — anyone holding
your anon key (which is meant to be public; it ships in any client by design)
could read or modify any row in `cart`, not just their own session's, including
guessing other session IDs. For a cart table with no payment or personal data
this is usually an acceptable tradeoff, but it's your call — let me know if you
want the stricter "logged-in users only" version instead.

**To apply:** open your Supabase project → SQL Editor → paste the contents of
`sql/fix-cart-rls.sql` → Run.

## Verified before delivery

- `npx tsc --noEmit` — zero errors
- `npx expo export --platform android` — full bundle compiles (1379 modules)

The SQL itself can't be "verified" by me the way code can — I don't have access
to your live Supabase project. Please run it and confirm the cart insert error
is gone.
