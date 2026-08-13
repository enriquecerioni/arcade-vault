# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — plataforma para jugar online y competir por puntos. Actualmente es el scaffold base de `create-next-app` (Next.js 16, App Router, React 19, TypeScript, Tailwind CSS v4), sin features de dominio implementadas todavía.

## Commands

- `npm run dev` — dev server (Next.js, Turbopack)
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`, extends `next/core-web-vitals` + `next/typescript`)

No test runner is configured yet.

## Architecture

- App Router under `app/` — `app/layout.tsx` (root layout, Geist fonts), `app/page.tsx` (home page).
- Styling via Tailwind CSS v4 (`@tailwindcss/postcss`), global styles in `app/globals.css`.
- Static assets in `public/`.
- Path alias `@/*` → repo root (see `tsconfig.json`).

## Spec Driven Design

This project follows spec-driven design using `/spec` and `/spec-impl`, based on practices from https://github.com/Klerith/fernando-skills (installed via `npx skills@latest add Klerith/fernando-skills`). Check for `/spec` skill/command usage before implementing features freehand.

## Important: this is not the Next.js you know

Per `AGENTS.md` (auto-generated/re-added by `next dev`, resolved from `node_modules/next/dist/server/lib/generate-agent-files.js`): this Next.js version has breaking API/convention/file-structure changes vs. training data. Read `node_modules/next/dist/docs/` before writing Next.js code, and heed deprecation notices. Do not remove the AGENTS.md block from diffs — commit it as-is.
