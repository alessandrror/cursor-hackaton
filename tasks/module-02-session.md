<!-- 7a0b9c0a-6f5c-4b7c-8b4c-3b7e5b2a2c30 3c1e1d8b-1aa2-4c5f-9e4d-0c2b8c9f3f12 -->

# Module 02: Session State and Local Storage

## Scope

- Implement typed session context with reducer-driven state.
- Persist selected fields in localStorage (no external storage).
- Do not persist API key by default (in-memory only).

## Files

- `providers/SessionProvider.tsx` (implement types, reducer, persistence)
- `lib/utils.ts` (reuse word count, reading time helpers)

## Acceptance Criteria

- Strict TypeScript types for state and actions.
- Reloading preserves text, reading time, questions, and answers.
- API key remains memory-only and clears on refresh.

## Tasks

- [ ] Define `SessionState`, `SessionAction` types
- [ ] Implement reducer and action creators
- [ ] Add localStorage hydrate/save cycle
- [ ] Expose `useSession()` returning state + actions
