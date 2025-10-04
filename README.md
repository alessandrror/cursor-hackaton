Create a Next.js 15 app for a study timer and quiz application with the following requirements:

## Tech Stack
- Next.js 15 with App Router
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui components
- PDF.js (pdfjs-dist) for PDF parsing
- OpenAI API for question generation

## Setup Instructions
1. Create a new Next.js 15 project with TypeScript and Tailwind CSS
2. Install shadcn/ui and add the following components: button, input, textarea, label, card, badge
3. Install dependencies: npm install lucide-react pdfjs-dist
4. Configure PDF.js worker in lib/pdf.ts (no CDN needed)

## Application Features

### Step 1: Input (Landing Page)
- Input field for OpenAI API key (password type, stored in session only)
- Two input methods:
  * File upload button for PDF files
  * Large textarea for pasting text
- Submit button to proceed (disabled if no text/file)
- Calculate reading time: word count / 200 words per minute
- Show estimated reading time before proceeding

### Step 2: Reading Session
- Display the full text in a scrollable container
- Show countdown timer (MM:SS format)
- Timer controls: Start/Pause button
- Timer runs in background, counting down from calculated reading time
- When timer reaches 0:
  * Show modal notification "Time's Up! ⏰"
  * Allow user to continue reading or proceed
- "Start Quiz" button to generate questions (calls OpenAI API)

### Step 3: Quiz
- Generate 5-20 questions based on text length (1 question per ~100 words, min 5, max 20)
- OpenAI prompt structure:
  * Model: gpt-4o-mini
  * Mix of question types: multiple-choice (4 options), true/false, short-answer
  * Each question has difficulty: easy, medium, or hard
  * Return JSON array with: type, question, options (if applicable), correct answer, difficulty
- Display questions with:
  * Question number and difficulty badge
  * Appropriate input (radio buttons for MC/TF, text input for short answer)
- Submit button at bottom

### Step 4: Results
- Calculate score based on:
  * Easy questions = 1 point
  * Medium questions = 2 points
  * Hard questions = 3 points
- Show:
  * Large percentage score
  * Points earned / total points
  * Success icon
- "Start New Session" button to reset

## Technical Requirements
- All state management with React Context (SessionProvider)
- Timer uses useEffect with setInterval
- PDF parsing: Use pdfjs-dist to extract text from uploaded PDFs
- OpenAI API call with proper error handling
- No backend - everything runs in browser
- No localStorage - single session only
- Dark mode only (no theme toggle)

## Styling
- Use Tailwind with dark gradient background (zinc-950 to neutral-950)
- Dark cards with shadows for main content
- Use lucide-react icons: Upload, Clock, Play, BookOpen, CheckCircle
- Responsive design, max-width container
- Color scheme: Blue/Indigo primary, Green for success, Red for urgency
- Dark mode only (no light mode toggle)

## Error Handling
- Alert if PDF upload fails
- Alert if no text provided
- Alert if API key missing
- Alert if OpenAI API call fails
- Parse JSON response carefully (handle markdown code blocks if present)

The project is now fully implemented with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui components, and PDF.js integration.