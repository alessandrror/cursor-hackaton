## Product Requirements Document (PRD) — Study Timer and Quiz App

### Overview
- **Purpose**: A dark-mode-only study companion that estimates reading time for provided content, guides a timed reading session, and generates a quiz to assess comprehension.
- **Sources**: Requirements consolidated from `README.md` and the workspace architecture guidelines.

### Objectives
- **Primary**: Help users focus on reading for a time proportional to content length and evaluate understanding with an AI-generated quiz.
- **Secondary**: Provide a clear, accessible, and responsive UI with consistent dark theme and high-quality UX.

### Success Metrics
- **Task completion**: % of users who complete reading + quiz.
- **Quiz engagement**: Average number of questions answered.
- **Reliability**: <1% client-side unhandled errors during normal use.
- **Performance**: First interaction under 100ms for UI actions on modern devices.

### Target Users and Use Cases
- **Students/self-learners**: Quick comprehension checks after reading papers/notes.
- **Professionals**: Rapid review of PDFs and notes with immediate feedback.
- **Use cases**: Upload PDF or paste text, read with timer, generate quiz, view score.

### Scope (MVP)
- Input OpenAI API key (session-only).
- Provide content via PDF upload or pasted text.
- Estimate reading time (words/200 wpm) and run a countdown timer.
- On timeout, allow proceed to quiz; manual proceed supported.
- Generate mixed-type quiz via OpenAI and render interactions.
- Compute score with difficulty-based weights and display results.

### Out of Scope (MVP)
- Backend services and persistence.
- Authentication (see Compliance and Roadmap).
- LocalStorage history (planned, opt-in later).
- Multi-language UI.

## Architecture and Constraints

### Tech Stack and Framework
- **Framework**: Next.js 15+ with App Router; server components by default.
- **Language**: TypeScript (strict mode).
- **Styling**: Tailwind CSS, dark-only.
- **UI**: shadcn/ui primitives; consistent theming and a11y.
- **Icons**: `lucide-react`.
- **PDF Parsing**: `pdfjs-dist` with worker configured in `lib/pdf.ts`.
- **AI**: OpenAI API (`gpt-4o-mini`) for question generation.
- **State**: React Context (`providers/SessionProvider.tsx`).
- **Data fetching**: Use Next.js 15 standards (`fetch`, `cache`, `revalidate`) if/when needed.

### Compliance With Workspace Guidelines
- **Next.js 15+ / App Router**: Required and used.
- **TypeScript (strict)**: Required and used.
- **Tailwind + shadcn/ui**: Required and used; dark-only.
- **Dark Mode**: Dark is the only theme; no toggle.
- **Authentication (Supabase)**: Guideline requires Supabase (Google/GitHub). Current MVP per `README.md` has no auth and no backend. This is a known deviation. See Roadmap for Phase 1 alignment plan.
- **No service keys on client**: Enforced; API key is user-provided OpenAI key stored in session only.

### Security and Privacy
- Do not persist the OpenAI API key beyond the current session; do not send to any server.
- No localStorage in MVP; no backend.
- Validate and sanitize PDF/text inputs client-side.
- Handle OpenAI responses robustly; reject malformed JSON.

### Accessibility
- All interactive elements must be keyboard navigable.
- Proper roles/labels using shadcn/ui conventions.
- Sufficient contrast in dark mode; focus states visible.

### Performance
- Efficient text extraction from PDFs; avoid blocking the main thread where possible.
- Avoid unnecessary re-renders; use memoization where helpful.
- Keep bundle lean; prefer server components by default.

## Functional Requirements

### Step 1: Input (Landing Page)
- **API key**: Password-type input, stored in session only; validate presence before quiz generation.
- **Content input**:
  - Upload PDF file (parse to text via `pdfjs-dist`).
  - Paste text in large textarea.
- **Reading time**: Estimate as `wordCount / 200` minutes; present estimate before proceeding.
- **Submit**: Enabled only when text is available; proceed to reading.
- **Error states**: Missing text, PDF parse failure, missing API key.

### Step 2: Reading Session
- **Display**: Full text in a scrollable container.
- **Timer**: Countdown in `MM:SS`; controls to Start/Pause.
- **Background ticking**: Timer continues while reading, pausable by user.
- **Timeout behavior**: On reaching 0, show modal "Time's Up! ⏰"; user may continue reading or proceed to quiz.
- **Start Quiz**: Available to generate questions.

### Step 3: Quiz Generation and Interaction
- **Question count**: 1 per ~100 words, minimum 5, maximum 20.
- **Model**: `gpt-4o-mini`.
- **Types**: Multiple-choice (4 options), True/False, Short answer.
- **Difficulty**: Each question labeled easy/medium/hard.
- **Contract**: Response must be a JSON array with fields: `type`, `question`, `options?`, `correctAnswer`, `difficulty`.
- **Rendering**: Numbering, difficulty badge, and proper input control per type.
- **Submission**: Validate completion for required types; allow free-form short answers.
- **Errors**: Robust parsing, including markdown code fence stripping if present.

### Step 4: Results
- **Scoring**: Easy=1, Medium=2, Hard=3 points. Sum user score and total possible.
- **Display**: Large percentage, points earned/total, success icon.
- **Actions**: "Start New Session" resets all state.

## State Management
- **Context**: A single Session context stores: API key (ephemeral), source (PDF/text), extracted text, estimated time, timer status, generated questions, and user answers.
- **Timer**: `useEffect` + `setInterval`; ensure cleanup and consistent pause/resume.

## OpenAI Prompt Contract
- **System goal**: Generate a mixed set of quiz questions grounded in the provided text.
- **Request parameters**: Use `gpt-4o-mini`; temperature tuned for reliability; ensure strict JSON-only response.
- **Prompt template**:
```json
{
  "model": "gpt-4o-mini",
  "input": {
    "instruction": "Read the provided text and generate a quiz as strict JSON.",
    "rules": [
      "Return ONLY a JSON array (no prose, no code fences)",
      "Length: 1 question per ~100 words, min 5, max 20",
      "Types: multiple-choice(4 options), true/false, short-answer",
      "Each item must include: type, question, options(if MC), correctAnswer, difficulty (easy|medium|hard)"
    ],
    "text": "<USER_TEXT>",
    "schemaExample": [
      {"type":"multiple-choice","question":"...","options":["A","B","C","D"],"correctAnswer":"B","difficulty":"medium"},
      {"type":"true/false","question":"...","correctAnswer":"true","difficulty":"easy"},
      {"type":"short-answer","question":"...","correctAnswer":"...","difficulty":"hard"}
    ]
  }
}
```
- **Post-processing**: If response includes markdown fences, strip and re-parse.

## UI/UX and Styling
- **Theme**: Dark-only, gradient background (zinc-950 → neutral-950).
- **Components**: shadcn/ui `Button`, `Input`, `Textarea`, `Label`, `Card`, `Badge`.
- **Icons**: Upload, Clock, Play, BookOpen, CheckCircle from `lucide-react`.
- **Layout**: Responsive, max-width container, shadowed dark cards.

## Error Handling
- **PDF parsing failure**: Show alert and allow retry.
- **No text provided**: Prevent proceed; show inline or toast alert.
- **API key missing**: Prevent quiz generation; show alert.
- **OpenAI failure**: Show alert with retry; log to client only (no PII).

## Testing
- **Unit**: Timer logic, word count/estimate, JSON parsing, quiz scoring.
- **Integration**: PDF extraction to quiz flow; UI interactions for timer and submission.
- **A11y**: Keyboard navigation and focus management.

## Acceptance Criteria (MVP)
- User can provide content (PDF or text) and see an estimated reading time.
- Timer starts/pauses, continues accurately, and triggers a modal at 0.
- OpenAI call produces valid JSON; malformed responses are handled.
- Quiz renders mixed types with difficulty badges and can be submitted.
- Score is computed and displayed with percentage and points summary.
- App runs fully client-side without backend or localStorage.

## Roadmap (Future Phases)
- **Phase 1 — Authentication Alignment (Guidelines)**
  - Add Supabase OAuth (Google/GitHub) gating access to the app while keeping all core logic client-side. Do not expose service keys; use public client and RLS-safe usage.
- **Reader: Early stop + celebration**
  - Add "End reading & start quiz" action. If early stop, show confetti and success toast.
- **Quiz and Scoring (max score = 10)**
  - Normalize per-question points so the total equals 10; display per-question point badges.
- **Results and Feedback**
  - For incorrect answers, show user answer, correct answer, and a brief explanation.
  - Retake dialog: reuse questions or generate new set.
- **Optional History (localStorage)**
  - Opt-in history of sessions (no backend), with timestamp, source, timing, outcomes, final score out of 10.
  - History and Settings pages to manage storage.
- **Browser Extension (Chrome MV3)**
  - Context menu: "Practice selected text" populates input in the app.
  - Popup quick-quiz (3–10 questions) scaled to selection length.
  - "Open App to Upload PDF" action.

## Risks and Mitigations
- **OpenAI JSON variability**: Use strict instruction and robust parsing; retry with higher determinism if needed.
- **PDF parsing edge cases**: Provide user feedback; support basic text-only extraction with fallbacks.
- **Timer accuracy**: Ensure interval cleanup and drift handling; display source of truth state.
- **Guidelines auth requirement**: Plan Supabase OAuth in Phase 1 to meet architecture rules while preserving MVP simplicity.

## Compliance Checklist
- [x] Next.js 15+ App Router
- [x] TypeScript strict mode
- [x] Tailwind + shadcn/ui; dark-only
- [x] React Context for state
- [x] PDF.js integration
- [x] OpenAI question generation
- [ ] Supabase auth (Phase 1)
- [x] No service keys on client

## Repository Pointers
- `app/` for routes and layouts
- `components/` for shared UI (shadcn/ui wrappers)
- `hooks/` for custom hooks (future)
- `lib/` utilities including `pdf.ts` and `utils.ts`
- `providers/SessionProvider.tsx` for context state
- `public/` for static assets

## Promptable Summary (for reuse)
- Next.js 15, TypeScript (strict), Tailwind, shadcn/ui, dark-only
- Inputs: PDF upload via `pdfjs-dist` or pasted text
- Reading time: words/200 wpm; countdown timer with Start/Pause; modal at 0
- Quiz: 5–20 questions (~1/100 words), mixed types (MC(4), TF, short-answer)
- Difficulty per question: easy/medium/hard; score Easy=1, Med=2, Hard=3
- OpenAI: `gpt-4o-mini`; return strict JSON array; handle fenced responses
- State: React Context; no backend; no localStorage; session-only API key
- UI: dark gradient background; shadcn/ui components; lucide-react icons
- Errors: upload fail, no text, missing API key, OpenAI failure
- Roadmap: Supabase OAuth, normalized scoring to 10, explanations, history, extension
