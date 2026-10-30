# Malabar Starts Food Stuff

Storefront and admin for Malabar Starts Food Stuff, a food supply house in Sharjah. Customers browse products, brands, and categories, then sign in to manage a cart, checkout, orders, payments, wishlist, and addresses. Staff use the admin area for catalog, orders, payments, customers, coupons, and reviews.

The UI is a Next.js app. Product, order, and account data come from a separate API.

## Requirements

- Node.js 20 or newer
- npm
- The Malabar API running locally, or a deployed API URL

## Setup

```bash
npm install
npm run dev
```

Create `.env.local` before the first run. See [Environment](#environment).

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create `.env.local` in the project root. It is listed in `.gitignore` and must not be committed.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes in production | Base URL of the API, with no trailing path. Example: `http://localhost:4000` |

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

If the variable is missing, requests fall back to `http://localhost:4000`.

`NEXT_PUBLIC_` values are copied into the browser bundle when the app is built. Set `NEXT_PUBLIC_API_URL` in the host’s environment **before** `npm run build`. Changing it after the build does not update an already built app. `.env.local` is for local development only and is not used on the production host.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Routes

- `/` — landing page
- `/products`, `/categories`, `/brands` — public catalog
- `/login`, `/signup`, `/verify-otp`, `/forgot-password` — account access
- `/cart`, `/checkout`, `/orders`, `/payments`, `/wishlist`, `/profile`, `/addresses` — signed-in customers
- `/admin` — staff
