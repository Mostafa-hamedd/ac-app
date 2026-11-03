# Architecture

How the AutoConnect app is put together, and why. Read this before changing structure.

## Layers

```text
src/app/        Routes (Expo Router). Thin files: read params, render a feature screen.
src/features/   One folder per business feature. The only place with business rules.
src/shared/     Generic UI and helpers. Knows nothing about features.
src/lib/        Platform services: API client, auth tokens, i18n, deep links, notifications.
src/theme/      Design tokens (tokens.js) — the only place colors, sizes and fonts are defined.
src/mocks/      Fake backend for development. Never shipped (see "Mock mode").
src/config/     Validated environment variables.
```

Dependencies only point downward: `app → features → shared/lib/theme`. ESLint enforces that
`shared/`, `lib/`, `theme/` and `config/` never import a feature or a route, and that code outside a
feature imports it only through its `index.ts`.

## A feature

```text
features/requests/
├── index.ts        What other code may use (screens, a few hooks and types)
├── api/            One function per endpoint. Validates every response with zod.
├── types/          zod schemas for API data; TypeScript types are inferred from them
├── hooks/          TanStack Query hooks. Query keys start with the feature name.
├── components/     UI used only by this feature
├── screens/        What the route files render
└── utils/          Pure helpers (status → label and color)
```

To add a feature, copy `features/vehicles` (list + detail) and register its routes in `src/app`.

## Data flow

1. A screen calls a hook (`useRequests`).
2. The hook calls the feature's API function through TanStack Query (caching, retries, refetch).
3. The API function calls `apiClient` (axios) and checks the response with `parseResponse`.
4. Errors of any kind become an `ApiError` with a `kind` (`network`, `not_found`, `server`, …)
   and a translated message. `ErrorState` and `FormError` know how to show them.

Lists use `PaginatedList` and details use `QueryView`; both handle loading and error states, so
screens only describe the content.

## Auth

- Tokens live in SecureStore (`lib/auth/session-storage.ts`), never in AsyncStorage.
- `features/auth/store/session-store.ts` holds only the session status and user.
- `src/app/_layout.tsx` shows the signed-in or signed-out routes from that status — screens never
  navigate after login or logout themselves.
- A 401 while signed in ends the session everywhere (`lib/auth/auth-events.ts`).
- **Open item:** token refresh is not implemented yet; see `TODO(auth)` in `lib/api/client.ts`.

## Mock mode

`EXPO_PUBLIC_USE_MOCK_API=true` (set in `.env.local`) makes `src/mocks/install.ts` replace the
axios adapter with a small fake backend: one route file per feature in `src/mocks/`. The real API
code still runs, including response validation, so mock mode tests the same code users get.

When the variable is not `"true"`, `metro.config.js` swaps `@/mocks/install` for an empty file, so no
mock code, demo users or sample data end up in the build. Preview and production builds always turn
it off (`eas.json`), and `src/config/env.ts` refuses to start a production build in mock mode.

Tests use the same fake backend (`jest.setup.ts`).

## Design system

- All colors, radii, font sizes and fonts are in `src/theme/tokens.js`. Tailwind classes
  (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `text-2xl`) are generated from it.
- Spacing uses the standard Tailwind 4dp grid (`p-4` = 16dp).
- Fonts are picked by family, not weight: `font-sans`, `font-sans-medium`, `font-sans-semibold`.
- ESLint rejects hex colors and `[NNpx]` values in components. Add a token instead.
- The app is light-only for now.

## Language

- Every user-facing string is in `src/lib/i18n/locales/en.ts` and `ar.ts` (TypeScript checks that
  both have the same keys).
- Dates, numbers and money use the current language (`shared/utils/format.ts`).
- The API client sends `Accept-Language` so the backend can translate its validation messages.
- Arabic text is right-aligned with `useTextAlign`. The layout itself is not mirrored yet.

## Deep links and notifications

Only the paths in `lib/linking/linking-config.ts` are accepted, and IDs are validated. The same check
applies to push notification payloads and to links that come from the API. A link opened while
signed out is resumed after sign-in.
