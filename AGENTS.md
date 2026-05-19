# AGENTS.md

## Overview

World Clocks is a Chrome browser extension (Manifest V3) that displays
canvas-based analog clocks for multiple cities and timezones. It is built
with Vue 3 and TypeScript, bundled via Vite with the `@crxjs/vite-plugin`.

## Tech stack

- Vue 3 (SFCs, `<script setup>`)
- TypeScript
- Vite 8 + `@crxjs/vite-plugin` for the extension build
- SCSS for styling
- Yarn 4 (`packageManager: yarn@4.12.0`) as the package manager
- Node `^20.19.0 || >=22.12.0` is required by the toolchain;
  `.node-version` pins the current Active LTS line, `24.15.0`

## Commands

- Use Corepack for Yarn 4 if the global `yarn` is not already Yarn 4:
  `corepack yarn <command>`
- `yarn dev` — start the Vite dev server with HMR
- `yarn build` — production build into `dist/`, also emits `release/crx-<version>.zip`
- `yarn clean` — remove the `dist/` directory
- `yarn lint` — run ESLint over the project; `yarn lint:fix` to auto-fix
- `yarn format` — format the project with Prettier; `yarn format:check`
  to verify without writing

## Project structure

- `src/background/` — service worker (`service-worker.ts`) and offscreen
  document (`background.html` / `background.ts`)
- `src/popup/` — toolbar popup UI (`PopupApp.vue`, `ClockItem.vue`)
- `src/options/` — option page UI (`OptionsApp.vue`)
- `src/common/` — shared code:
  - `components/` — shared Vue components
  - `fonts/` — bundled font assets used by the clocks
  - `images/` — shared UI image assets
  - `scripts/` — clock logic, timezone data, time utilities, CoolClock
  - `styles/` — SCSS variables, mixins, common styles
  - `types/` — global TypeScript declarations
- `public/` — static assets and `_locales/` i18n messages (en, ja)
- `manifest.config.js` — MV3 manifest definition
- `vite.config.js` — Vite, Vue, CRX, zip-pack, and `@/` alias configuration
- `eslint.config.js` — ESLint flat config
- `prettier.config.js` — Prettier configuration

## Conventions

- Indentation: 2 spaces, LF line endings, UTF-8, final newline
  (enforced by `.editorconfig`)
- Use the `@/` path alias for imports from `src/`
- `tsconfig.json` has `strict: false` — type checking is lenient
- `.yarnrc.yml` uses `nodeLinker: node-modules`
- `package.json` has `"type": "module"` — all `.js` files are ESM
- Linting: ESLint 10 flat config with `@eslint/js`, `typescript-eslint`,
  and `eslint-plugin-vue` recommended rule sets; `eslint-config-prettier`
  disables formatting rules so ESLint and Prettier do not conflict
- Formatting: Prettier owns code style; run `yarn format` before committing
- Avoid `any`; prefer precise types. An unused binding kept intentionally
  should be prefixed with `_` or annotated with an `eslint-disable` comment
  explaining why

## Internationalization

- Use Chrome Extension i18n (`chrome.i18n.getMessage`) through the existing
  `WorldClocks.msg(key)` helper; Vue templates may use local `t(key)` wrappers
  that delegate to `WorldClocks.msg(key)`.
- Localized strings live in `public/_locales/<lang>/messages.json`;
  keep `en` and `ja` in sync.
- Message keys should continue to use the existing `SCREAMING_SNAKE_CASE`
  convention, for example `OPTION_TITLE` and `SHOW_FOOTER_LABEL`.
- Manifest-localized strings use Chrome's `__MSG_KEY__` syntax and must match
  the same keys in `messages.json`.
- When adding user-facing text, add a message key instead of hard-coding the
  string in Vue components, scripts, or the manifest.

## Notes

- Manifest V3 permissions: `alarms`, `offscreen`
- Analog clocks are rendered with CoolClock (canvas-based)
- Bump `version` in `package.json` before producing a release build;
  the manifest and release zip name derive from it
