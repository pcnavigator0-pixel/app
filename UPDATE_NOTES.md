# Update — gap fix, infinite-scroll product grid, floating tab bar

No new dependencies were added. You do **not** need to run `npm install` for this
update — just copy the files below into your existing project, overwriting where a
file already exists at that path.

## Where each file goes

Copy each file to the **same path** inside your project root
(`shopcorner-mobile-sdk54/`), overwriting the existing file:

| File in this zip | Destination | Status |
|---|---|---|
| `src/components/CollectionShortcuts.tsx` | `src/components/CollectionShortcuts.tsx` | Modified |
| `src/components/CollectionCarousel.tsx` | `src/components/CollectionCarousel.tsx` | Modified |
| `src/components/ProductCard.tsx` | `src/components/ProductCard.tsx` | **New** |
| `src/components/ProductToolbar.tsx` | `src/components/ProductToolbar.tsx` | **New** |
| `src/hooks/useProductFeed.ts` | `src/hooks/useProductFeed.ts` | **New** |
| `src/navigation/FloatingTabBar.tsx` | `src/navigation/FloatingTabBar.tsx` | **New** |
| `src/navigation/TabNavigator.tsx` | `src/navigation/TabNavigator.tsx` | Modified (rewritten) |
| `src/screens/HomeScreen.tsx` | `src/screens/HomeScreen.tsx` | Modified (rewritten) |
| `README.md` | `README.md` | Modified |

Nothing else in your project needs to change — `package.json`, config files
(`babel.config.js`, `metro.config.js`, `tailwind.config.js`), and every other
screen/component not listed above are untouched.

## What changed and why

### 1. Header → carousel gap, fixed
`CollectionShortcuts.tsx` had 14px of padding above *and* below its row, and
`CollectionCarousel.tsx` added another 12px margin on top of that. Stacked together
that read as a visible blank band between the shortcuts row and the hero image.
Tightened to 12px top / 10px bottom on the shortcuts row, 8px on the carousel —
matching the tighter spacing in your reference screenshot.

### 2. Infinite-scrolling product grid added to Home
`HomeScreen.tsx` was rebuilt around a single `FlatList` (2-column grid) instead of a
plain `ScrollView`, with the carousel/categories/toolbar as the list's header. New
files:
- `useProductFeed.ts` — queries Supabase with real `.range()` pagination, 10
  products per page, deduped and appended as you scroll near the bottom
  (`onEndReached`). It does not fetch everything up front and slice it client-side.
- `ProductToolbar.tsx` — the search bar, grid/list toggle, "X shown on home"
  counter, and Filter button row from your screenshot.
- `ProductCard.tsx` — the product grid card: image with wishlist heart + orange
  quick-add button, name, "By {seller}", price, sold/views row, Compare and
  WhatsApp pills.

Quick-add, wishlist, compare, WhatsApp, and tapping into a product are currently
wired to `console.log` placeholders, not real actions yet — tell me when you want
those connected.

### 3. Bottom tab bar rebuilt to match your screenshot
The previous version was a flat, full-width bar with a top border — not what your
screenshot shows. Looking closely at your screenshot: it's a floating white pill
with rounded corners, side margins from the screen edges, and a soft shadow, sitting
on a light-gray background so it visually "floats." Icons are outline-style except
Home, which is solid + orange when active; all others just change color (no
background pill) when active.

New `FloatingTabBar.tsx` replaces the default `tabBarStyle`/`tabBarIcon` approach
with a fully custom tab bar component, rendered via React Navigation's `tabBar` prop
in `TabNavigator.tsx`. It respects the device's safe-area bottom inset so it sits
correctly above the home indicator on notched phones.

## Verified before delivery

- `npx tsc --noEmit` — zero errors
- `npx expo export --platform android` — full bundle compiles (1357 modules)

As before, I don't have a device/simulator to visually confirm the result — please
check it on your phone and tell me what's still off.
