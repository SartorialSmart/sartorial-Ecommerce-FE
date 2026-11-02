# Satorial Ecommerce

Sartorial eCommerce is a storefront platform for African fashion designers. It includes a shop-owner dashboard, a website designer, default storefront templates, and subscription plans on the landing page.

## Stack

- TanStack Start and TanStack Router
- React 19
- Vite
- Tailwind CSS
- shadcn/ui

## Development

Requires Node.js 22+ and npm (or Bun 1.4+).

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

The development server runs at http://localhost:3000. Copy `.env.example` to `.env.local`
and point `VITE_API_BASE_URL` at the Django API (default `http://localhost:8000/api/v1`).

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run format` — format with Prettier
- `npm run test` — run the Vitest suite
