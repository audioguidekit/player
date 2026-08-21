# AGENTS.md

AudioGuideKit player — self-hosted PWA audio guide app (React + Vite + TypeScript, Bun).

## Setup

```bash
bun install
bun run dev
```

## Before adding a tour or customizing theme/branding

Always read these first — they're the source of truth, not this file:

- **[docs/adding-tours.md](./docs/adding-tours.md)** — tour file structure, `metadata.json` fields, validation
- **[docs/themes.md](./docs/themes.md)** — full `ThemeConfig` reference for custom themes

Full doc index: [docs/README.md](./docs/README.md) (multi-tour bundling, stop types, languages, map, PWA icons, testing).

Product-level overview (what AudioGuideKit is, who it's for, feature list — links onward to the full reference): [audioguidekit.org/llms.txt](https://audioguidekit.org/llms.txt).

## Other commands

```bash
bun run validate   # validate tour JSON against schema
bun run build       # validate + vite build
bun run test         # Playwright e2e tests
```
