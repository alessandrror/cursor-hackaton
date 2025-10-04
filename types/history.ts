import { Question } from './session'

export interface HistoryEntry {
  id: string
  timestamp: string // ISO string
  source: {
    type: 'pdf' | 'text' | 'selection'
    size: number // word count
  }
  reading: {
    estimatedSec: number
    actualSec: number
    earlyStop: boolean
  }
  quiz: {
    questionCount: number
    difficulty: {
      easy: number
      medium: number
      hard: number
    }
    answers: Array<{
      questionId: string
      type: 'multiple-choice' | 'true-false' | 'short-answer'
      question: string
      userAnswer: string
      correctAnswer: string
      correct: boolean
      difficulty: 'easy' | 'medium' | 'hard'
      points: number
    }>
    score: number
    totalPoints: number
    percentage: number
  }
}

export interface HistorySettings {
  enabled: boolean
  maxEntries: number
}

