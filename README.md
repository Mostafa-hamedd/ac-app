# AutoConnect — mobile app

React Native + Expo (SDK 58) + TypeScript, Expo Router, TanStack Query, NativeWind.
Feature-based, layered frontend (see "Project structure" below).

## Getting started

Requires Node.js 20.19.4+ (22 LTS recommended).

```bash
npm install
cp .env.example .env.local # local settings (mock API on)
npx expo install --check   # confirms every native package matches SDK 58
npm run check              # typecheck + lint + tests
npx expo start
```

Push notifications, SecureStore and the keyboard controller need a **development build**
(not Expo Go): `npx eas build --profile development` or `npx expo run:android`.

Configuration lives in `.env.local` (copied from `.env.example`, not committed).
Anything prefixed `EXPO_PUBLIC_` ships inside the app — never put secrets there.

## Scripts

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm start`         | Start the Metro dev server                |
| `npm run typecheck` | `tsc --noEmit`                            |
| `npm run lint`      | ESLint (Expo config + architecture rules) |
| `npm test`          | Jest (`jest-expo` preset)                 |
| `npm run format`    | Prettier                                  |
| `npm run check`     | All of the above, for CI                  |

## Mock mode

With `EXPO_PUBLIC_USE_MOCK_API=true` (the default in `.env.example`) the app talks to a fake
backend in `src/mocks` instead of the network. Useful test inputs:

| Input                               | Result                           |
| ----------------------------------- | -------------------------------- |
| any phone + any password            | signs in as the demo user        |
| password `fail` / `error`           | wrong credentials / server error |
| OTP `1234` / `0000`                 | correct code / server error      |
| register with phone `1000000000`    | verification fails               |
| open `/requests/ERROR` (any detail) | server error screen              |

Mock code is never included in preview or production builds.

## Project structure

```text
src/
├── app/         Routes only — thin files that render feature screens
├── features/    One folder per business feature (api, types, hooks, components, screens)
├── shared/      Generic UI components, hooks and helpers
├── lib/         API client, auth tokens, i18n, deep links, notifications, storage
├── theme/       Design tokens — the only place colors, sizes and fonts are defined
├── mocks/       Fake backend for development and tests
├── providers/   App-wide providers
└── config/      Validated environment variables
```

How it fits together, and the rules behind it: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
How to make changes: [CONTRIBUTING.md](CONTRIBUTING.md).

## Deep links

Allowed destinations are listed in `src/lib/linking/linking-config.ts`
(`/requests/:id`, `/payments/:id`, `/vehicles/:id`, `/notifications/:id`). Links that arrive
while signed out are resumed after sign-in. Try one with:

```bash
npx uri-scheme open "autoconnect://requests/REQ_123" --android
```

For production, configure an owned HTTPS domain (`EXPO_PUBLIC_LINK_DOMAIN`) for Universal
Links / App Links.

## Open decisions

- Auth contract: token refresh flow (see `TODO(auth)` in `src/lib/api/client.ts`).
- API response shapes and pagination format (see each feature's `types/` and `shared/types/api.ts`).
- Payment provider and hosted-checkout return URLs.
- Deep-link domain for Universal Links / App Links.
