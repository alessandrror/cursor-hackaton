<!-- b961b676-1342-43a8-aca9-5c6990ebf439 b3dbf41d-1368-4366-9c49-aac38ab1790c -->

# Phase 1: Project Configuration (Next.js 15, TS, Tailwind, shadcn/ui, pdfjs-dist)

## Scope

- Set up a fresh Next.js 15 app using the App Router with TypeScript (strict).
- Configure Tailwind CSS and shadcn/ui with a dark-only baseline (no theme toggle).
- Establish ESLint + Prettier with Next.js, TypeScript, and Tailwind plugins.
- Install and configure `pdfjs-dist` via npm with a worker in a client-only module.
- Create initial route skeletons and a `SessionProvider` for in-memory state.
- Add fonts via `next/font` and base icons with `lucide-react`.
- Update README to reflect Next.js and npm-based pdf.js setup (remove CDN step).
- Explicitly omit unit tests in this phase (hackathon constraint).

## Files and configuration to create/update

- `package.json`: Next.js 15, TypeScript, Tailwind, shadcn/ui, lucide-react.
- `next.config.ts`: App Router defaults; future flags as needed.
- `tsconfig.json`: `strict: true`, path aliases, TS/JS config aligned with Next.js 15.
- `tailwind.config.ts`: content globs for `app`, `components`, shadcn presets.
- `postcss.config.js`: Tailwind + autoprefixer.
- `app/globals.css`: Tailwind base, components, utilities; dark palette defaults.
- `app/layout.tsx`: global layout with dark baseline, container, fonts, metadata; wraps provider.
- `providers/SessionProvider.tsx` (client): in-memory store for apiKey, text, questions, answers.
- `app/page.tsx`: server shell that renders the input step client component (placeholder for now).
- `app/(flow)/read/page.tsx`, `app/(flow)/quiz/page.tsx`, `app/(flow)/results/page.tsx`: empty shells.
- `components/ui/*`: install shadcn/ui primitives used later (Button, Input, Textarea, Label, Card, Dialog, Badge, RadioGroup, Toast).
- `lib/pdf.ts` (client): `pdfjs-dist` worker configuration and a stub `extractTextFromPdf`.
- `lib/utils.ts`: word count and reading time helpers.
- `components/icons/*` (optional): wrappers for lucide icons.
- `README.md`: Replace Vite/React instructions with Next.js 15 setup and npm `pdfjs-dist` worker instructions.

## Notes on dark-only UI

- Default to dark palette in `app/layout.tsx` without a theme toggle.
- Avoid `dark:` variant toggles; use dark-friendly colors directly.

## PDF.js (npm worker) setup outline

- Install `pdfjs-dist`.
- Configure worker once in `lib/pdf.ts` (client-only) via imported URL; export `extractTextFromPdf(file)`.

## Out of scope (deferred to next phases)

- Input, Reader, Quiz, Results full implementations.
- OpenAI integration details beyond placeholders.
- Unit/integration tests (intentionally omitted for hackathon).

## README adjustment

- Remove CDN-based instruction for PDF.js and Vite references.
- Document Next.js 15 stack and npm-based pdfjs-dist worker setup.

### To-dos

- [x] Scaffold Next.js 15 app with TS, Tailwind, ESLint/Prettier
- [x] Install shadcn/ui and add base components
- [x] Set dark-only base theme in app/layout.tsx
- [x] Create SessionProvider placeholder and wrap layout
- [x] Install pdfjs-dist and implement lib/pdf.ts worker placeholder
- [x] Create basic app/page.tsx with placeholder content
- [x] Update README to Next.js + pdfjs-dist npm worker

## Status: ✅ COMPLETED

Module 1 (Project Configuration) is complete. The project is now ready for the next phase of implementation.
