'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Brain,
  Clock,
  ChevronDown,
  ChevronUp,
  Trophy,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSession } from '@/providers/SessionProvider'
import { calculateScore } from '@/lib/openai'
import { useHistory } from '@/hooks/useHistory'
import { HistoryEntry } from '@/types/history'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Normalize true/false answers across languages
function normalizeTrueFalseAnswer(answer: string): 'true' | 'false' | null {
  const normalized = answer.toLowerCase().trim()

  // English
  if (normalized === 'true') return 'true'
  if (normalized === 'false') return 'false'

  // Spanish
  if (normalized === 'verdadero') return 'true'
  if (normalized === 'falso') return 'false'

  // French
  if (normalized === 'vrai') return 'true'
  if (normalized === 'faux') return 'false'

  // German
  if (normalized === 'wahr') return 'true'
  if (normalized === 'falsch') return 'false'

  // Italian
  if (normalized === 'vero') return 'true'
  if (normalized === 'falso') return 'false'

  // Portuguese
  if (normalized === 'verdadeiro') return 'true'
  if (normalized === 'falso') return 'false'

  return null
}

interface QuestionAnalysis {
  questionId: string
  score: number
  maxScore: number
  feedback: string
  isCorrect: boolean
  isAnalyzed: boolean
}

type FilterType = 'all' | 'incorrect' | 'flagged'

export default function ResultsView() {
  const router = useRouter()
  const {
    state,
    resetSession,
    setQuestions,
    clearAnswers,
    forceRegenerate,
    setTimerState,
    setTimeRemaining,
  } = useSession()
  const { addEntry, settings } = useHistory()
  const { toast } = useToast()
  const [showRetakeDialog, setShowRetakeDialog] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [hasShownHistoryNotice, setHasShownHistoryNotice] = useState(false)
  const [questionAnalyses, setQuestionAnalyses] = useState<
    Map<string, QuestionAnalysis>
  >(new Map())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  )
  const itemsPerPage = 10
  const analysesRef = useRef<Map<string, QuestionAnalysis>>(new Map())

  const results = calculateScore(state.questions, state.answers)

  // Calculate question correctness for all questions
  const getQuestionCorrectness = useCallback(
    (questionId: string) => {
      const question = state.questions.find((q) => q.id === questionId)
      if (!question) return false

      const userAnswer = state.answers.find((a) => a.questionId === questionId)
      const analysis = questionAnalyses.get(questionId)

      if (question.type === 'short-answer' && analysis?.isAnalyzed) {
        return analysis.isCorrect
      } else if (question.type === 'true-false') {
        const userNormalized = normalizeTrueFalseAnswer(
          userAnswer?.answer || ''
        )
        const correctNormalized = normalizeTrueFalseAnswer(
          question.correctAnswer
        )
        if (userNormalized && correctNormalized) {
          return userNormalized === correctNormalized
        }
        return (
          userAnswer?.answer.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim()
        )
      } else {
        // For multiple choice/select, handle comma-separated answers
        let userAns = userAnswer?.answer || ''

        // If answer contains commas, it's a joined array - normalize it
        if (userAns.includes(',')) {
          const parts = userAns.split(',').map((s) => s.trim().toLowerCase())
          const uniqueParts = Array.from(new Set(parts))
          userAns = uniqueParts.join(', ')
        }

        return (
          userAns.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim()
        )
      }
    },
    [state.questions, state.answers, questionAnalyses]
  )

  // Filter questions based on selected filter
  const filteredQuestions = state.questions.filter((q) => {
    if (filter === 'all') return true
    if (filter === 'incorrect') return !getQuestionCorrectness(q.id)
    if (filter === 'flagged') return false // No flagged questions for now
    return true
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  // Reset to page 1 when questions change
  const prevQuestionsLengthRef = useRef(state.questions.length)
  useEffect(() => {
    if (prevQuestionsLengthRef.current !== state.questions.length) {
      setCurrentPage(1)
      prevQuestionsLengthRef.current = state.questions.length
    }
  }, [state.questions.length])

  // Save to history on first render
  useEffect(() => {
    if (state.questions.length > 0 && state.answers.length > 0 && !hasSaved) {
      const entry: HistoryEntry = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        source: {
          type: state.source || 'text',
          size: state.text.trim().split(/\s+/).length,
        },
        reading: {
          estimatedSec: Math.floor(state.readingTimeMs / 1000),
          actualSec: Math.floor(
            (state.readingTimeMs - state.timeRemainingMs) / 1000
          ),
          earlyStop: state.timerState !== 'finished',
        },
        quiz: {
          questionCount: state.questions.length,
          difficulty: {
            easy: state.questions.filter((q) => q.difficulty === 'easy').length,
            medium: state.questions.filter((q) => q.difficulty === 'medium')
              .length,
            hard: state.questions.filter((q) => q.difficulty === 'hard').length,
          },
          answers: state.questions.map((q) => {
            const userAnswer = state.answers.find((a) => a.questionId === q.id)
            const isCorrect = getQuestionCorrectness(q.id)
            const pointsValue = difficultyPoints[q.difficulty] || 10

            // Clean up repeated answers in user answer
            let cleanAnswer = userAnswer?.answer || ''
            if (cleanAnswer.includes(',')) {
              const parts = cleanAnswer.split(',').map((s) => s.trim())
              const uniqueParts = Array.from(new Set(parts))
              cleanAnswer = uniqueParts.join(', ')
            }

            return {
              questionId: q.id,
              type: q.type,
              question: q.question,
              userAnswer: cleanAnswer,
              correctAnswer: q.correctAnswer,
              correct: isCorrect,
              difficulty: q.difficulty,
              points: isCorrect ? pointsValue : -pointsValue,
            }
          }),
          score: results.score,
          totalPoints: results.totalPoints,
          percentage: results.percentage,
        },
      }

      addEntry(entry)
      setHasSaved(true)

      if (settings.enabled && !hasShownHistoryNotice) {
        toast({
          title: 'Session saved to history',
          description: 'View your progress in the History page',
        })
        setHasShownHistoryNotice(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state,
    results,
    hasSaved,
    hasShownHistoryNotice,
    settings.enabled,
    addEntry,
    toast,
    getQuestionCorrectness,
  ])

  // Keep ref in sync with state
  useEffect(() => {
    analysesRef.current = questionAnalyses
  }, [questionAnalyses])

  // Analyze open-ended questions on current page only
  useEffect(() => {
    const analyzeQuestions = async () => {
      const pageStart = (currentPage - 1) * itemsPerPage
      const pageEnd = pageStart + itemsPerPage
      const currentPageQuestions = filteredQuestions.slice(pageStart, pageEnd)

      const openEndedQuestions = currentPageQuestions.filter(
        (q) => q.type === 'short-answer' && !analysesRef.current.has(q.id)
      )

      if (openEndedQuestions.length === 0) {
        setIsAnalyzing(false)
        return
      }

      setIsAnalyzing(true)
      const newAnalyses = new Map(analysesRef.current)

      await Promise.all(
        openEndedQuestions.map(async (question) => {
          const userAnswer = state.answers.find(
            (a) => a.questionId === question.id
          )

          if (!userAnswer) {
            newAnalyses.set(question.id, {
              questionId: question.id,
              score: 0,
              maxScore: 1,
              feedback: 'No answer provided',
              isCorrect: false,
              isAnalyzed: false,
            })
            return
          }

          try {
            const response = await fetch('/api/analyze-answer', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                question: question.question,
                userAnswer: userAnswer.answer,
                correctAnswer: question.correctAnswer,
                sourceQuote: question.sourceQuote,
              }),
            })

            if (!response.ok) {
              throw new Error('Failed to analyze answer')
            }

            const analysis = await response.json()
            newAnalyses.set(question.id, {
              questionId: question.id,
              ...analysis,
              isAnalyzed: true,
            })
          } catch (error) {
            newAnalyses.set(question.id, {
              questionId: question.id,
              score: 0,
              maxScore: 1,
              feedback: 'Analysis failed - using basic scoring',
              isCorrect: false,
              isAnalyzed: false,
            })
          }
        })
      )

      setQuestionAnalyses(newAnalyses)
      setIsAnalyzing(false)
    }

    analyzeQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    filter,
    state.answers,
    state.questions.length,
    itemsPerPage,
    getQuestionCorrectness,
  ])

  // Calculate metrics
  const correctCount = state.questions.filter((q) =>
    getQuestionCorrectness(q.id)
  ).length
  const incorrectCount = state.questions.length - correctCount
  const difficultyPoints: Record<string, number> = {
    easy: 10,
    medium: 20,
    hard: 30,
  }
  const totalPossiblePoints = state.questions.reduce((sum, q) => {
    const points = difficultyPoints[q.difficulty] || 10
    return sum + points
  }, 0)
  const earnedPoints = state.questions.reduce((sum, q) => {
    const isCorrect = getQuestionCorrectness(q.id)
    const points = difficultyPoints[q.difficulty] || 10
    return sum + (isCorrect ? points : 0)
  }, 0)

  // Calculate average time per question (simplified - using reading time / question count)
  const avgTimePerQuestion =
    state.questions.length > 0
      ? Math.floor(
          (state.readingTimeMs - state.timeRemainingMs) /
            state.questions.length /
            1000
        )
      : 0
  const avgTimeMinutes = Math.floor(avgTimePerQuestion / 60)
  const avgTimeSeconds = avgTimePerQuestion % 60

  const handleNewSession = () => {
    resetSession()
    router.push('/study')
  }

  const handleRetakeQuiz = () => {
    setShowRetakeDialog(true)
  }

  const handleReuseQuiz = () => {
    clearAnswers()
    // Reset timer state when retaking quiz
    setTimerState('idle')
    setTimeRemaining(state.readingTimeMs)
    setShowRetakeDialog(false)
    router.push('/study/quiz')
  }

  const handleGenerateNewQuiz = () => {
    setQuestions([])
    clearAnswers()
    forceRegenerate()
    // Reset timer state when retaking quiz
    setTimerState('idle')
    setTimeRemaining(state.readingTimeMs)
    setShowRetakeDialog(false)
    router.push('/study/quiz')
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  const handleQuestionClick = (index: number) => {
    const question = state.questions[index]
    if (!question) return

    const filteredIndex = filteredQuestions.findIndex(
      (q) => q.id === question.id
    )
    if (filteredIndex === -1) return

    const targetPage = Math.floor(filteredIndex / itemsPerPage) + 1
    setCurrentPage(targetPage)

    // Scroll to question after page loads
    setTimeout(() => {
      const element = document.getElementById(`question-${question.id}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      toggleQuestionExpanded(question.id)
    }, 100)
  }

  // Calculate which page numbers to show (exactly 3 numbers with ellipsis)
  const getPageNumbers = (): Array<{
    page: number
    type: 'number' | 'ellipsis'
  }> => {
    if (totalPages <= 3) {
      // Show all pages if 3 or less
      return Array.from({ length: totalPages }, (_, i) => ({
        page: i,
        type: 'number' as const,
      }))
    }

    const pages: Array<{ page: number; type: 'number' | 'ellipsis' }> = []

    if (currentPage <= 1) {
      // At the beginning: show 1, 2, 3, ...
      pages.push({ page: 0, type: 'number' })
      pages.push({ page: 1, type: 'number' })
      pages.push({ page: 2, type: 'number' })
      if (totalPages > 3) {
        pages.push({ page: -1, type: 'ellipsis' })
      }
    } else if (currentPage >= totalPages - 2) {
      // At the end: show ..., last-2, last-1, last
      if (totalPages > 3) {
        pages.push({ page: -1, type: 'ellipsis' })
      }
      pages.push({ page: totalPages - 3, type: 'number' })
      pages.push({ page: totalPages - 2, type: 'number' })
      pages.push({ page: totalPages - 1, type: 'number' })
    } else {
      // In the middle: show ..., current-1, current, current+1, ...
      pages.push({ page: -1, type: 'ellipsis' })
      pages.push({ page: currentPage - 1, type: 'number' })
      pages.push({ page: currentPage, type: 'number' })
      pages.push({ page: currentPage + 1, type: 'number' })
      pages.push({ page: -1, type: 'ellipsis' })
    }

    return pages
  }

  if (state.questions.length === 0) {
    return (
      <div className="flex h-full w-full">
        <Card className="w-full m-6">
          <CardHeader>
            <CardTitle>No quiz data</CardTitle>
            <CardDescription>
              Please complete a quiz to see results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/study')}>
              Start New Session
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500'
      case 'medium':
        return 'bg-blue-500'
      case 'hard':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - Filters and Question List */}
      <aside className="w-28 md:w-64 fixed h-full border-t border-r bg-card flex-shrink-0 overflow-y-auto">
        <div className="px-2 py-4 md:px-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3 md:text-base">
              Review your answers
            </h3>

            {/* Filters */}
            <RadioGroup
              value={filter}
              onValueChange={(value) => setFilter(value as FilterType)}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="filter-all" />
                  <Label
                    htmlFor="filter-all"
                    className="cursor-pointer text-xs md:text-sm"
                  >
                    All Questions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="incorrect" id="filter-incorrect" />
                  <Label
                    htmlFor="filter-incorrect"
                    className="cursor-pointer text-xs md:text-sm"
                  >
                    Incorrect Answers
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flagged" id="filter-flagged" />
                  <Label
                    htmlFor="filter-flagged"
                    className="cursor-pointer text-xs md:text-sm"
                  >
                    Flagged Questions
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Question List */}
          <div className="mt-4">
            <div className="space-y-1.5">
              {state.questions.map((question, index) => {
                const isCorrect = getQuestionCorrectness(question.id)
                return (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionClick(index)}
                    className={cn(
                      'w-full flex items-start gap-1 md:gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left',
                      paginatedQuestions.some((q) => q.id === question.id) &&
                        'bg-muted'
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate hidden md:block">
                        Question {index + 1}
                      </div>
                      <div className="text-xs font-medium truncate block md:hidden">
                        Q{index + 1}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] !transition-none !duration-0',
                            getDifficultyColor(question.difficulty),
                            'text-white border-0'
                          )}
                        >
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <article className="flex-1 overflow-y-auto ml-28 md:ml-64">
        <div className="max-w-7xl mx-auto px-2 md:px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center md:text-start">
              Quiz Results Overview
            </h1>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-3 md:gap-6 md:grid-cols-2 xl:grid-cols-4 mb-4 md:mb-8">
            {/* Overall Score */}
            <Card className="border-2">
              <CardHeader className="pb-1 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-3xl font-bold mb-1 md:mb-2">
                  {earnedPoints} / {totalPossiblePoints}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mb-3">
                  You achieved {results.percentage}% accuracy
                </div>
                <Progress value={results.percentage} className="h-2" />
              </CardContent>
            </Card>

            {/* Correct Answers */}
            <Card className="border-2">
              <CardHeader className="pb-1 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex gap-x-1 items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Correct Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-3xl font-bold mb-1 md:mb-2">
                  {correctCount} / {state.questions.length}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mb-3">
                  Keep up the great work!
                </div>
                <Progress
                  value={(correctCount / state.questions.length) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Incorrect Answers */}
            <Card className="border-2">
              <CardHeader className="pb-1 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex gap-x-1 items-center">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Incorrect Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-3xl font-bold mb-1 md:mb-2">
                  {incorrectCount} / {state.questions.length}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mb-3">
                  Areas for improvement identified
                </div>
                <Progress
                  value={(incorrectCount / state.questions.length) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Avg. Time per Question */}
            <Card className="border-2">
              <CardHeader className="pb-1 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex gap-x-1 items-center">
                  <Clock className="h-4 w-4" />
                  Avg. Time per Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-3xl font-bold mb-1 md:mb-2">
                  {avgTimeMinutes} min {avgTimeSeconds} sec
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mb-3">
                  Efficiency matters in timed sessions
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Question Analysis */}
          <Card className="border-2 mb-6">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-bold">
                Review your answers, the correct solutions, and AI-powered
                feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Brain className="h-5 w-5 animate-pulse text-primary" />
                    <span className="text-base">
                      Analyzing open-ended questions...
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {paginatedQuestions.map((question) => {
                  const globalIndex = state.questions.findIndex(
                    (q) => q.id === question.id
                  )
                  const userAnswer = state.answers.find(
                    (a) => a.questionId === question.id
                  )
                  const analysis = questionAnalyses.get(question.id)
                  const isCorrect = getQuestionCorrectness(question.id)
                  const isExpanded = expandedQuestions.has(question.id)

                  const pointsValue =
                    difficultyPoints[question.difficulty] || 10
                  const points = isCorrect ? pointsValue : -pointsValue

                  return (
                    <Card
                      key={question.id}
                      id={`question-${question.id}`}
                      className={cn(
                        'border-2 transition-all',
                        isCorrect
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-red-500/50 bg-red-500/5'
                      )}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {isCorrect ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-500" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-lg">
                                  Question {globalIndex + 1}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs',
                                    getDifficultyColor(question.difficulty),
                                    'text-white border-0 !transition-none !duration-0'
                                  )}
                                >
                                  {question.difficulty.charAt(0).toUpperCase() +
                                    question.difficulty.slice(1)}
                                </Badge>
                                <Badge
                                  variant={
                                    points > 0 ? 'default' : 'destructive'
                                  }
                                  className="text-xs !transition-none !duration-0"
                                >
                                  {points > 0 ? '+' : ''}
                                  {points} points
                                </Badge>
                              </div>
                              <p className="text-base font-medium">
                                {question.question}
                              </p>

                              {isExpanded && (
                                <div className="space-y-3 pt-2">
                                  <div className="p-3 rounded-lg bg-muted/50">
                                    <span className="font-semibold text-sm text-muted-foreground">
                                      Your answer:{' '}
                                    </span>
                                    <span
                                      className={cn(
                                        'text-base font-medium',
                                        isCorrect
                                          ? 'text-green-500'
                                          : 'text-red-500'
                                      )}
                                    >
                                      {(() => {
                                        const answer =
                                          userAnswer?.answer || 'No answer'
                                        // If answer contains commas, it might be a joined array - deduplicate
                                        if (answer.includes(',')) {
                                          const parts = answer
                                            .split(',')
                                            .map((s) => s.trim())
                                          // Remove duplicates while preserving order
                                          const uniqueParts = Array.from(
                                            new Set(parts)
                                          )
                                          return uniqueParts.join(', ')
                                        }
                                        return answer
                                      })()}
                                    </span>
                                  </div>

                                  {!isCorrect && (
                                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                      <span className="font-semibold text-sm text-green-500">
                                        Correct answer:{' '}
                                      </span>
                                      <span className="text-base font-medium text-green-500">
                                        {question.correctAnswer}
                                      </span>
                                    </div>
                                  )}

                                  {question.type === 'short-answer' &&
                                    analysis?.isAnalyzed && (
                                      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                        <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                          <Brain className="h-4 w-4 text-primary" />
                                          AI Analysis:
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {analysis.feedback}
                                        </p>
                                      </div>
                                    )}

                                  {question.sourceQuote && (
                                    <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                                      <div className="font-semibold text-sm text-secondary mb-2">
                                        From the text:
                                      </div>
                                      <p className="text-sm text-muted-foreground italic">
                                        &ldquo;{question.sourceQuote}&rdquo;
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleQuestionExpanded(question.id)}
                            className="flex-shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination at Bottom */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    size="icon"
                    variant="outline"
                    className="md:hidden mr-2 px-2"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden md:inline-flex"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft />
                    Previous Page
                  </Button>

                  <div className="flex gap-2 items-center">
                    {getPageNumbers().map((item, idx) => {
                      if (item.type === 'ellipsis') {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-2 text-muted-foreground"
                          >
                            ...
                          </span>
                        )
                      }
                      return (
                        <Button
                          key={item.page}
                          size="sm"
                          variant={
                            currentPage === item.page ? 'default' : 'outline'
                          }
                          onClick={() => setCurrentPage(item.page)}
                        >
                          {item.page + 1}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    size="icon"
                    variant="outline"
                    className="md:hidden ml-2 px-2"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden md:inline-flex"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next Page
                    <ChevronRight />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex flex-col lg:flex-row justify-center gap-4 pb-6">
            <Button
              onClick={handleRetakeQuiz}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Retake Quiz
            </Button>
            <Button onClick={handleNewSession} size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Start a New Study Session
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </article>

      {/* Retake Quiz Dialog */}
      <Dialog open={showRetakeDialog} onOpenChange={setShowRetakeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Retake Quiz
            </DialogTitle>
            <DialogDescription>
              Choose how you&apos;d like to retake the quiz
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Reuse Same Questions</h4>
              <p className="text-sm text-muted-foreground">
                Keep the current questions and just clear your answers. Good for
                practicing the same material.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Generate New Questions</h4>
              <p className="text-sm text-muted-foreground">
                Create completely new questions based on your study material.
                Fresh challenge!
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleReuseQuiz}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reuse Questions
            </Button>
            <Button onClick={handleGenerateNewQuiz} className="gap-2">
              Generate New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
