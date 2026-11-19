# Agyapa Tiles

Premium e-commerce storefront and admin back office for **Agyapa Tiles**: browse, buy, and track tiles online.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Supabase (Postgres, Auth, Storage) · Node.js route handlers & server actions.

## What's inside

| Area | Highlights |
| --- | --- |
| **Storefront** | Scroll-driven hero, sticky storytelling, bento collections, product carousel, tile calculator, animated order-tracking preview. Apple-style type, glass surfaces, spring motion, `prefers-reduced-motion` respected. |
| **Shop** | Category / finish / search / sort filters, product pages with gallery views and live box maths, slide-in bag with free-delivery progress. |
| **Checkout & tracking** | Guest checkout (no account needed). Prices & stock are re-checked in the database. Order number + email tracking page with a live timeline. |
| **Accounts** | Supabase Auth sign-up / sign-in; customers see their orders and timelines. |
| **Admin** (`/admin`) | KPI dashboard & revenue chart, orders (filter, search, status + tracking message + payment status), products CRUD with photo upload, categories CRUD, customers, store settings (phone, address, delivery fee and free-delivery threshold), sign out. |
| **Visuals** | Every tile has a procedurally generated surface (marble, terrazzo, wood, chevron, zellige, …) in brand colours, so the catalogue looks rich before photography exists. Upload a photo on any product to replace it. |

Brand: primary **red `#B83430`**, secondary **gray** ramp, white background. Tokens live in `app/globals.css`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Supabase keys the storefront shows a built-in sample catalogue so the site never renders empty, but accounts, checkout persistence and `/admin` require Supabase. There is no demo or bypass admin account: `/admin` always requires signing in as a user whose `profiles.role` is `admin`.

## Go live with Supabase

1. Create a Supabase project dedicated to Agyapa Tiles.
2. In the SQL Editor run `supabase/setup.sql` (schema, security, functions, settings), then `supabase/seed.sql` (the 1,050-product inventory in 11 categories). Both are safe to re-run; the seed never overwrites products you have already edited.
3. Copy `.env.example` → `.env.local` and fill in the URL and anon/publishable key.
4. In **Authentication → Providers → Email**, decide whether to require email confirmation.
5. Sign up on `/login`, then promote yourself:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
6. Visit `/admin`.

### Security model

- All tables have Row Level Security. Customers only read their own orders; admins are identified by `profiles.role = 'admin'`, and users cannot change their own role.
- Orders are created only through the `create_order()` Postgres function (security definer). It ignores client prices, reads them from `products`, checks stock under a row lock, decrements stock, and logs the first tracking event.
- Guest tracking goes through `track_order(number, email)`; both must match.
- Admin status changes go through `admin_update_order()`, which re-checks `is_admin()`, restocks on cancellation (once), and appends a timeline event.
- `proxy.ts` refreshes the session and redirects unauthenticated users away from `/admin` and `/account`; every admin page and server action calls `requireAdmin()` again.

## Project layout

```
app/(shop)/…        storefront routes     app/admin/…     admin routes + server actions
app/api/orders      checkout endpoint     proxy.ts        session refresh + route guard
lib/store.ts        data layer (Supabase or demo)           lib/demo-data.ts  seed catalogue
components/ui       TileArt, motion primitives, buttons     supabase/         schema + seed
```

## Catalogue & photos

- The catalogue comes from the company inventory sheet: `python3 scripts/build-inventory.py AGYAPA.xlsx` regenerates `lib/inventory.json` (storefront fallback) and `supabase/seed.sql`. Tiles are priced **per carton**, everything else per piece. Carton coverage (m²) is an approximation inferred from tile size; check it in the admin.
- Until real photos exist, each product shows a generated preview (tile surface or a simple icon for non-tiles).
- **Photos:** Admin → Products → *Upload photos*. Name each file after the product code (e.g. `FGC66205G.jpg`) and drop in as many as you like; they attach automatically and replace the preview.

## Next steps worth doing

- **Online payments:** checkout currently supports pay-on-delivery, Mobile Money and bank transfer (admin marks orders paid). Add a gateway (e.g. Paystack / Flutterwave) by creating a payment session after `create_order` and flipping `payment_status` from its webhook.
- **Transactional email** (order confirmation, status changes) via a Supabase Edge Function or Resend.
- **Real product photography** and your actual contact details in `lib/config.ts`.
- Rate-limit `/api/orders` (e.g. Upstash) before launch.
