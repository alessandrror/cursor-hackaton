<!-- 2f7b6d0a-98f4-4a20-8c19-f0b4b52a9e88 1db0dfe1-4b7a-4e1b-8e9b-3f2eb2b8c2d1 -->

# Module 04: Input (Landing) Experience

## Scope

- API key input (password)
- PDF upload button
- Large textarea for text
- Reading time preview (200 WPM)
- Submit to proceed to Reader

## Files

- `app/page.tsx` (server shell)
- `components/input/InputStep.tsx` (client)

## Acceptance Criteria

- Submit disabled until valid input present
- Reading time updates as user types/uploads

## Tasks

- [ ] Build form UI using shadcn/ui
- [ ] Wire PDF upload to `extractTextFromPdf`
- [ ] Compute word count + reading time
- [ ] Save to session and navigate


