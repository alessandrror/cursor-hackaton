<!-- 1a6b4f2d-2e3b-4a58-8c3d-7c2b9f5d6a10 d4f5a6b7-c8d9-4e0f-9a1b-2c3d4e5f6a7b -->

# Module 06: OpenAI Question Generation

## Scope

- Generate 5–20 questions using `gpt-4o-mini`
- Parse JSON safely and validate schema

## Files

- `lib/openai.ts`
- `types/quiz.ts`

## Acceptance Criteria

- Questions validated before storing
- Retries on transient errors (max 2)

## Tasks

- [ ] Implement fetch client with API key
- [ ] Build prompt and parser with validation
