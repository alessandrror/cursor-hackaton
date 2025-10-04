export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer'

export interface Question {
  id: string
  type: QuestionType
  question: string
  options?: string[] // for multiple-choice and true-false
  correctAnswer: string
  difficulty: Difficulty
}

export interface Answer {
  questionId: string
  answer: string
}

export interface SessionState {
  // API key (not persisted)
  apiKey: string

  // Source and content (persisted)
  source: 'pdf' | 'text' | null
  text: string
  readingTimeMs: number

  // Quiz data (persisted)
  questions: Question[]
  answers: Answer[]
  forceRegenerate: boolean

  // Timer state (not persisted)
  timerState: 'idle' | 'running' | 'paused' | 'finished'
  timeRemainingMs: number
}

export type SessionAction =
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_SOURCE'; payload: 'pdf' | 'text' }
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'SET_READING_TIME'; payload: number }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'SET_ANSWER'; payload: Answer }
  | { type: 'CLEAR_ANSWERS' }
  | { type: 'FORCE_REGENERATE' }
  | {
      type: 'SET_TIMER_STATE'
      payload: 'idle' | 'running' | 'paused' | 'finished'
    }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'RESET_SESSION' }
  | { type: 'HYDRATE_FROM_STORAGE'; payload: Partial<SessionState> }
