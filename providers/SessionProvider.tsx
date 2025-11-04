'use client'

import {
  createContext,
  useContext,
  ReactNode,
  useReducer,
  useEffect,
  useRef,
} from 'react'
import { SessionState, SessionAction, Question, Answer } from '@/types/session'

const initialState: SessionState = {
  apiKey: process.env.OPENAI_API_KEY || '',
  source: null,
  text: '',
  readingTimeMs: 0,
  questions: [],
  answers: [],
  forceRegenerate: false,
  timerState: 'idle',
  timeRemainingMs: 0,
}

function sessionReducer(
  state: SessionState,
  action: SessionAction
): SessionState {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload }
    case 'SET_SOURCE':
      return { ...state, source: action.payload }
    case 'SET_TEXT':
      // Clear questions and answers when text changes to ensure fresh quiz generation
      // Reset timer state when text changes
      return { 
        ...state, 
        text: action.payload,
        questions: [],
        answers: [],
        forceRegenerate: false,
        timerState: 'idle',
        timeRemainingMs: state.readingTimeMs || 0
      }
    case 'SET_READING_TIME':
      // Reset timer state when reading time changes
      return { 
        ...state, 
        readingTimeMs: action.payload,
        timerState: 'idle',
        timeRemainingMs: action.payload
      }
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload, forceRegenerate: false }
    case 'SET_ANSWER':
      return {
        ...state,
        answers: state.answers
          .filter((a) => a.questionId !== action.payload.questionId)
          .concat(action.payload),
      }
    case 'CLEAR_ANSWERS':
      return {
        ...state,
        answers: [],
      }
    case 'FORCE_REGENERATE':
      return {
        ...state,
        forceRegenerate: true,
      }
    case 'SET_QUESTION_RANGE':
      return {
        ...state,
        questionRange: action.payload,
      }
    case 'SET_TIMER_STATE':
      return { ...state, timerState: action.payload }
    case 'SET_TIME_REMAINING':
      return { ...state, timeRemainingMs: action.payload }
    case 'RESET_SESSION':
      return {
        ...initialState,
        apiKey: state.apiKey, // Keep API key on reset
      }
    case 'CLEAR_SESSION_DATA':
      return {
        ...state,
        source: null,
        text: '',
        readingTimeMs: 0,
        questions: [],
        answers: [],
        forceRegenerate: false,
        timerState: 'idle',
        timeRemainingMs: 0,
        // Preserve: apiKey
      }
    case 'CLEAR_INPUT_DATA':
      return {
        ...state,
        source: null,
        text: '',
        readingTimeMs: 0,
        // Preserve: apiKey, questions, answers, timerState, timeRemainingMs
      }
    case 'HYDRATE_FROM_STORAGE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

interface SessionContextType {
  state: SessionState
  setApiKey: (key: string) => void
  setSource: (source: 'pdf' | 'text') => void
  setText: (text: string) => void
  setReadingTime: (ms: number) => void
  setQuestions: (questions: Question[]) => void
  setAnswer: (answer: Answer) => void
  clearAnswers: () => void
  forceRegenerate: () => void
  setQuestionRange: (range: { min: number; max: number }) => void
  setTimerState: (state: 'idle' | 'running' | 'paused' | 'finished') => void
  setTimeRemaining: (ms: number) => void
  resetSession: () => void
  clearSessionData: () => void
  clearInputData: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState)
  const isHydrated = useRef(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('study-timer-session')
      if (stored) {
        const parsed = JSON.parse(stored)
        dispatch({ type: 'HYDRATE_FROM_STORAGE', payload: parsed })
      }
    } catch (error) {
      console.error('Failed to hydrate from localStorage:', error)
    } finally {
      isHydrated.current = true
    }
  }, [])

  // Save to localStorage when relevant state changes (only after hydration)
  useEffect(() => {
    if (!isHydrated.current) return

    try {
      const toPersist = {
        source: state.source,
        text: state.text,
        readingTimeMs: state.readingTimeMs,
        questions: state.questions,
        answers: state.answers,
        questionRange: state.questionRange,
      }
      localStorage.setItem('study-timer-session', JSON.stringify(toPersist))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [
    state.source,
    state.text,
    state.readingTimeMs,
    state.questions,
    state.answers,
    state.questionRange,
  ])

  const actions = {
    setApiKey: (key: string) => dispatch({ type: 'SET_API_KEY', payload: key }),
    setSource: (source: 'pdf' | 'text') =>
      dispatch({ type: 'SET_SOURCE', payload: source }),
    setText: (text: string) => dispatch({ type: 'SET_TEXT', payload: text }),
    setReadingTime: (ms: number) =>
      dispatch({ type: 'SET_READING_TIME', payload: ms }),
    setQuestions: (questions: Question[]) =>
      dispatch({ type: 'SET_QUESTIONS', payload: questions }),
    setAnswer: (answer: Answer) =>
      dispatch({ type: 'SET_ANSWER', payload: answer }),
    clearAnswers: () => dispatch({ type: 'CLEAR_ANSWERS' }),
    forceRegenerate: () => dispatch({ type: 'FORCE_REGENERATE' }),
    setQuestionRange: (range: { min: number; max: number }) =>
      dispatch({ type: 'SET_QUESTION_RANGE', payload: range }),
    setTimerState: (timerState: 'idle' | 'running' | 'paused' | 'finished') =>
      dispatch({ type: 'SET_TIMER_STATE', payload: timerState }),
    setTimeRemaining: (ms: number) =>
      dispatch({ type: 'SET_TIME_REMAINING', payload: ms }),
    resetSession: () => dispatch({ type: 'RESET_SESSION' }),
    clearSessionData: () => dispatch({ type: 'CLEAR_SESSION_DATA' }),
    clearInputData: () => dispatch({ type: 'CLEAR_INPUT_DATA' }),
  }

  return (
    <SessionContext.Provider value={{ state, ...actions }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
