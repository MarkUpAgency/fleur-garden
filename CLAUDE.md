# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server (Turbopack) on :3000
npm run build    # production build (Turbopack)
npm start        # serve the production build
npm run lint     # eslint (next/core-web-vitals + next/typescript)
```

No test runner is configured.

## Environment

`NEXT_PUBLIC_API_BASE_URL` is required — it is the base URL of the external Laravel-style backend (`admin.fleurgarden.com`) that every service call and server action hits. Without it the app builds but all data fetching fails. `.env*` is gitignored; there is no committed example file.

Remote images are only allowed from `admin.fleurgarden.com` (`next.config.ts`). Adding an image host requires a new `remotePatterns` entry.

## Architecture

Next.js 16 App Router + React 19, TypeScript strict, Tailwind v4 (CSS-first config in `src/app/globals.css`, no `tailwind.config`), shadcn/ui (new-york style, `src/components/ui/`). Path alias `@/*` → `src/*`.

This is a **frontend-only** client for a remote REST API. There is no database, no API routes, no backend code in this repo.

### Data layer: three-file service pattern

Every domain under `src/services/<domain>/` follows the same split, and new domains should too:

- `api.ts` — raw calls via the shared `get/post/put/patch/del` helpers from `@/lib/api`. Responses are almost always wrapped in `ApiResponse<T>` (`{ status, message, meta, links, data }` — see `src/types/index.ts`).
- `queries.ts` — `queryOptions(...)` / `infiniteQueryOptions(...)` factories. These are shared verbatim between server prefetch and client `useQuery`, which is what keeps query keys in sync. Never inline a query key at a call site.
- `mutations.ts` — `mutationOptions(...)` factories, or full `useMutation` hooks when they need router/toast/invalidation side effects (see `src/services/auth/mutations.ts`).

`src/lib/api/client.ts` is a single axios instance with interceptors that attach the `access_token` cookie as a Bearer header and derive `Accept-Language` from the locale (explicit `config.params.locale` / `X-Locale` header wins; otherwise it parses the locale off the URL path). Because token reading uses `js-cookie`, **the axios client is browser-oriented** — server-side calls that need auth pass the token explicitly as a header (`getUser(token)`, `getOrders(token)`).

### Server prefetch → client hydration

Server components prefetch through `getServerQueryClient()` (`src/providers/server.ts`, `retry: false`), then read the data back out with `queryClient.getQueryData(someQuery(...).queryKey)` and pass plain props to client components — see `src/app/[locale]/page.tsx` and `products/page.tsx`. The `HydrationBoundary` in `src/providers/HydrationBoundary.tsx` exists but the prevailing pattern is prop-passing, not dehydration. `QueryProvider` (client) wraps the whole tree in `src/app/[locale]/layout.tsx`.

### i18n

next-intl with locales `az`, `en`, `ru`, **default `ru`**, `localePrefix: 'as-needed'` and locale detection off (`src/i18n/routing.ts`). Middleware lives in `src/proxy.ts` (not the conventional `middleware.ts`).

- Always import navigation primitives from `@/i18n/navigation` (`Link`, `useRouter`, `redirect`, `usePathname`) — never from `next/link` / `next/navigation` — so locale prefixes are handled.
- Translations are in `messages/{az,en,ru}.json`, grouped by feature namespace (`home`, `navigation`, `product_grid`, `cart`, `profile`, …). Adding a key means adding it to all three files.
- Server components use `getTranslations()`; client components use `useTranslations()`.
- `getServerLocale()` in `src/lib/utils.ts` is the server-side locale accessor used before prefetching; `getCurrentLocale()`/`getAcceptLanguageHeader()` are its client counterparts. Note these fall back to `az`, unlike `routing.defaultLocale` which is `ru`.

### Auth

Login/register/password-reset go through **server actions** in `src/services/auth/server-actions.ts`, which call the backend with `fetch` and set the `access_token` cookie. Inconsistency to be aware of: `registerAction` sets the cookie `httpOnly`, `loginAction` does not (the client axios interceptor needs to read it via `js-cookie`). Client mutations in `auth/mutations.ts` wrap these actions.

### Cart, favorites, comparison — localStorage + custom events

These three features have **no server state and no React context**. They live in `localStorage` under the keys `cart`, `favorites`, `comparison`, and cross-component sync is done by dispatching window events after every write:

```ts
localStorage.setItem('cart', JSON.stringify(next))
window.dispatchEvent(new CustomEvent('cartChanged'))
```

Listeners (`cartChanged`, `favoritesChanged`, `comparisonChanged`, plus the native `storage` event for other tabs) live in `src/components/navigation/cart-indicator.tsx`, `favcomp.tsx`, and the corresponding pages. **Any new code that mutates these keys must dispatch the matching event**, or header badges and page state will silently drift out of sync.

### Product images — always go through `getProductImage()`

Two API quirks make raw `product.image` unsafe to render:

1. A missing image arrives as the **literal string `"null"`**, not a JSON null, so `product.image || fallback` does not catch it.
2. Products whose own image is missing carry their category's image inline as `category_image` / `category_thumb_image`, and that is the intended fallback.

`getProductImage(product, { preferThumb? })` in `src/lib/utils.ts` handles both — it walks `image → thumb_image → category_image → category_thumb_image` (thumb-first when `preferThumb`), normalizing each, and returns `null` only when nothing usable exists so the caller can render its own "No Image" placeholder. `normalizeImageUrl()` is the standalone normalizer for snapshots that have no category data.

Use it at **both** render sites and localStorage write sites — cart/favorites/comparison store a resolved `image` snapshot, so the fallback must be applied before writing or the snapshot bakes in an empty image.

### Component layout

- `src/components/ui/` — shadcn primitives; regenerate via shadcn CLI rather than hand-editing where possible.
- `src/components/pages/<route>/` — components specific to one route.
- `src/components/navigation/`, `src/components/shared/` — header/footer/menus and cross-route pieces. `client-*.tsx` variants exist where a client boundary is needed.
- Routes live under `src/app/[locale]/`, with `(auth)` as a route group. Auth pages exist both as full routes and as sheet/modal variants (`login-sheet.tsx`, `register-sheet.tsx`).

## Conventions

- Services export named functions at the bottom of the file (`export { a, b, c }`) rather than inline `export const`.
- Toasts use `sonner`; several user-facing strings in mutation handlers are **hardcoded Azerbaijani** rather than translated — follow the surrounding file, and prefer translation keys for new user-facing text.
- Forms use react-hook-form + zod via `@hookform/resolvers` and the shadcn `form` wrapper.
- Filter payloads are pruned before sending (`filterProducts` in `services/products/api.ts` drops zero/sentinel values, e.g. `max_price` is only sent below the hardcoded `5600` ceiling).
