# Architecture

How the AutoConnect app is put together, and why. Read this before changing structure.

## Layers

```text
src/app/        Routes (Expo Router). Thin files: read params, render a feature screen.
                Layouts here also wire navigation: (auth) and (app), and the tab bar in (app)/(tabs).
src/providers/  App-wide providers (gestures, safe area, keyboard, React Query, navigation theme,
                bottom sheets), composed in AppProviders.
src/features/   One folder per business feature. The only place with business rules.
src/shared/     Generic UI and helpers. Knows nothing about features.
src/lib/        Platform services: API client, auth tokens, i18n, deep links, notifications.
src/theme/      Design tokens (tokens.js) — the only place colors, sizes and fonts are defined.
src/mocks/      Fake backend for development. Never shipped (see "Mock mode").
src/config/     Validated environment variables, and fixed app values (support hotline).
tests/          Shared test helpers (render with providers), fixtures and native-module mocks.
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

Not every feature has every folder. Features that talk to the API (`auth`, `requests`, `vehicles`,
`notifications`) have `api/`, `types/` and `hooks/`. The screens built from the design that have no
endpoint yet (`my-garage`, `services`, `payments`, `locations`, `profile`) keep their sample content
in a `data/` folder (or in the screen's components) and do not call the API. Some features add a
`store/` (zustand), `schemas/` (form validation) or `data/` folder when they need one.

To add an API-backed feature, copy `features/vehicles` (list, detail, add, edit and delete) and
register its routes in `src/app`.

## Navigation

- `src/app/_layout.tsx` loads the fonts and restores the session, then shows either `(app)` or
  `(auth)` with `Stack.Protected` (see Auth).
- `(app)/_layout.tsx` is a stack. Its first screen is the tab group; add, edit and update-photo
  vehicle screens, the map (`location`) and the detail screens (`requests/[requestId]`,
  `vehicles/[vehicleId]`, `notifications/[notificationId]`) are pushed on top of it.
- `(app)/(tabs)` uses `expo-router/js-tabs` with the custom `FloatingTabBar` from `shared/ui`. Only
  My Garage, Explore, Notifications, Menu and Brand show in the bar. The booking, services and
  payment screens are also routes of this group, hidden from the bar with `tabBarItemStyle`.
- The Brand tab does not open a page: its `tabPress` is intercepted to open the vehicle selector
  sheet from the vehicles feature. The Brand and Explore pages are "Coming soon" placeholders.
- Bottom sheets (`@gorhom/bottom-sheet`) are used for the vehicle selector, assistance,
  rescheduling, the country picker and document upload.

## Data flow

1. A screen calls a hook (`useRequests`).
2. The hook calls the feature's API function through TanStack Query (caching, retries, refetch).
3. The API function calls `apiClient` (axios) and checks the response with `parseResponse`.
4. Errors of any kind become an `ApiError` with a `kind` (`network`, `not_found`, `server`, …)
   and a translated message. `ErrorState` and `FormError` know how to show them.

Details use `QueryView`, which handles loading and error states so screens only describe the
content. `PaginatedList` (FlashList with the same states and infinite scroll) is available in
`shared/ui`, but no screen uses it yet: the Notifications tab renders its own `SectionList` ("New"
and "Older") with the same `LoadingState`, `ErrorState` and `EmptyState` components. A
notification can name a sample photo with `avatarKey` (the images are in
`features/notifications/data/avatars`); without one the card shows its category icon.

Client state is kept in small zustand stores, never server data: the session store (auth) and the
vehicle photo store (the vehicle selected on My Garage, and the photo picked for each vehicle,
kept in memory only and cleared when the signed-in area unmounts, so signing out never leaks it
to the next account).

## Auth

- Tokens live in SecureStore (`lib/auth/session-storage.ts`), never in AsyncStorage.
- `features/auth/store/session-store.ts` holds only the session status and user.
- `src/app/_layout.tsx` shows the signed-in or signed-out routes from that status — screens never
  navigate after login or logout themselves.
- A 401 while signed in ends the session everywhere (`lib/auth/auth-events.ts`).
- Android app backups are turned off (`android.allowBackup` in `app.json`); the keychain/keystore
  entries are not backed up either way.
- Mock mode signs anyone in with any password (see Mock mode).
- **Open item:** token refresh is not implemented yet; see `TODO(auth)` in `lib/api/client.ts`.

## Mock mode

`EXPO_PUBLIC_USE_MOCK_API=true` (set in `.env.local`) makes `src/mocks/install.ts` replace the
axios adapter with a small fake backend: one route file per API-backed feature in `src/mocks/`
(`auth`, `requests`, `vehicles`, `notifications`; the vehicles routes cover list, detail, create,
update and delete, and changes last until the app restarts). The real API code still runs, including
response validation, so mock mode tests the same code users get. Features without endpoints use
their own `data/` files instead (see "A feature").

When the variable is not `"true"`, `metro.config.js` swaps `@/mocks/install` for an empty file, so no
mock code, demo users or sample data end up in the build. Preview and production builds always turn
it off (`eas.json`), and `src/config/env.ts` refuses to start a production build in mock mode.

Tests use the same fake backend (`jest.setup.ts`), which also stubs `expo-secure-store`, AsyncStorage
and `@gorhom/bottom-sheet`. A test can still mock a module itself for a more specific behavior.

## Build configuration

- `app.json` holds the static Expo config; `app.config.js` adds what depends on the build. The
  `android/` folder is generated (and git-ignored), so permissions and manifest settings are
  changed in these two files, never in `android/`.
- Preview and production builds (`EXPO_PUBLIC_APP_ENV` is set by the `eas.json` profile) remove
  Android's `SYSTEM_ALERT_WINDOW` permission, which only the dev client's debug overlay uses.
- `src/config/env.ts` refuses an `http://` API URL outside development, and mock mode in
  production.
- The location plugin only asks for `NSLocationWhenInUseUsageDescription` on iOS: the app reads the
  position in the foreground only, so the "Always" and motion strings are switched off.
- Native version pins follow Expo SDK 58 (`npx expo install --check` must report nothing).

## Design system

- All colors, radii, font sizes and fonts are in `src/theme/tokens.js`. Tailwind classes
  (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `text-2xl`) are generated from it.
- Font sizes are replaced, not extended: only the sizes in `tokens.js` exist (including `2xs`,
  `caption`, `compact`, `subhead` and `title`). `cn` in `shared/utils` knows these names.
- Spacing uses the standard Tailwind 4dp grid (`p-4` = 16dp), plus a few named values in
  `tailwind.config.js` (`13` for button height, `line` for divider thickness, `4.5`).
- Borders: `border` is 1.5dp everywhere (the `borderWidth` token); `border-1` is the 1dp border
  buttons use. Dividers use `h-line`.
- The font is Poppins, picked by family, not weight: `font-sans`, `font-sans-medium`,
  `font-sans-semibold`. The files are in `assets/fonts`, embedded by the expo-font plugin and also
  loaded with `useFonts` in the root layout. Only these three weights are bundled.
- `Screen` (`shared/ui`) takes `adjustForHeader` on iOS so scrolling content starts below a
  translucent native header; only the notification details screen uses it.
- ESLint rejects hex colors and `[NNpx]` values in components. Add a token instead.
- The app is light-only for now.

## Language

- Every user-facing string is in `src/lib/i18n/locales/en.ts` and `ar.ts` (TypeScript checks that
  both have the same keys).
- Dates, numbers and money use the current language (`shared/utils/format.ts`).
- The API client sends `Accept-Language` so the backend can translate its validation messages.
- The chosen language is saved with `lib/storage/preferences-storage.ts` and restored at startup
  (`restoreLanguage`).
- Arabic is laid out right-to-left by hand, not with `I18nManager`: screens read
  `i18n.language === 'ar'` and switch to `flex-row-reverse` and `text-right`. `useTextAlign` does
  the text alignment for a few shared pieces (auth headers, inputs, sheets). New UI must handle
  both directions itself.

## Deep links and notifications

Only the paths in `lib/linking/linking-config.ts` are accepted, and IDs are validated. The same check
applies to push notification payloads and to links that come from the API. A link opened while
signed out is resumed after sign-in.
