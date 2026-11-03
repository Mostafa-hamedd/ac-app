# Contributing

## Before you open a pull request

```bash
npm run check          # typecheck + lint + tests
npm run format:check
```

CI runs the same commands (`.github/workflows/ci.yml`) and lint fails on any warning.

## Rules

- **One change per pull request.** Small PRs get reviewed; large ones get skimmed.
- **Commit messages** follow [Conventional Commits](https://www.conventionalcommits.org):
  `feat(payments): show refund date`, `fix(auth): keep phone after failed login`.
- **Structure:** follow [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Import a feature only through
  its `index.ts`.
- **Styles:** use design tokens. No hex colors or `[NNpx]` values in components — add a token to
  `src/theme/tokens.js` if the design needs a new value.
- **Text:** every user-facing string goes in both `locales/en.ts` and `locales/ar.ts`.
- **API data:** add a zod schema in the feature's `types/` and parse responses with `parseResponse`.
- **Mocks:** when you add an endpoint, add its route in `src/mocks/` too, so the app keeps working
  in mock mode.

## Comments

Write a comment only when the code can't say it: **why** something is done, a constraint, or a trap
for the next person. Don't describe what the next line does.

Comments must make sense to someone reading the file years from now, so never reference:

- a chat, ticket or person ("as discussed", "the user asked")
- design-tool IDs (Figma node or frame IDs change)
- project phases or plans ("Phase 3", "for now until v2")

Put temporary work in the issue tracker, or mark it `TODO(area): what and why`.
