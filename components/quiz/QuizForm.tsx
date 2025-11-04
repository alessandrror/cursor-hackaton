'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  Home,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Brain,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useSession } from '@/providers/SessionProvider'
import { Question } from '@/types/session'
import { useToast } from '@/hooks/use-toast'
import { QuizSkeletonPage, QuizSkeletonQuestion } from './QuizSkeleton'
import { cn } from '@/lib/utils'

export default function QuizForm() {
  const router = useRouter()
  const {
    state,
    setQuestions,
    setAnswer,
    clearSessionData,
    clearAnswers,
    setQuestionRange,
  } = useSession()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showClearAnswersDialog, setShowClearAnswersDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null)
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set())
  const [validationAttempted, setValidationAttempted] = useState(false)
  const [unansweredQuestionIds, setUnansweredQuestionIds] = useState<
    Set<string>
  >(new Set())
  const loadingPagesRef = useRef<Set<number>>(new Set())
  const generatedPagesRef = useRef<Set<number>>(new Set())
  const questionsRef = useRef<Question[]>([])
  const isInitializingRef = useRef(false)
  const itemsPerPage = 10

  // Generate questions for a specific page (non-callback function to avoid dependency issues)
  const generateQuestionsForPage = async (
    page: number,
    totalCount: number,
    questionRange?: { min: number; max: number },
    text?: string
  ) => {
    // Prevent duplicate requests
    if (
      generatedPagesRef.current.has(page) ||
      loadingPagesRef.current.has(page)
    ) {
      return
    }

    const textToUse = text || state.text
    if (!textToUse) return
    // Mark as loading
    loadingPagesRef.current.add(page)
    setLoadingPages((prev) => {
      const next = new Set(prev)
      next.add(page)
      return next
    })
    setIsGenerating(true)

    try {
      const range = questionRange || state.questionRange || { min: 10, max: 20 }
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToUse,
          questionRange: range,
          page,
          itemsPerPage,
          totalQuestions: totalCount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate questions')
      }

      const { questions: newQuestions } = await response.json()

      if (newQuestions.length > 0) {
        const currentQuestions = questionsRef.current
        const existingIds = new Set(currentQuestions.map((q: Question) => q.id))
        const uniqueNewQuestions = newQuestions.filter(
          (q: Question) => !existingIds.has(q.id)
        )

        if (uniqueNewQuestions.length > 0) {
          setQuestions([...currentQuestions, ...uniqueNewQuestions])
          generatedPagesRef.current.add(page)
        }
      }
    } catch (error) {
      toast({
        title: 'Failed to generate questions',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
      loadingPagesRef.current.delete(page)
    } finally {
      loadingPagesRef.current.delete(page)
      setLoadingPages((prev) => {
        const next = new Set(prev)
        next.delete(page)
        return next
      })
      setIsGenerating(false)
    }
  }

  // Auto-generate ALL questions when text is available and no questions exist
  useEffect(() => {
    if (
      !state.text ||
      state.questions.length > 0 ||
      totalQuestions ||
      isInitializingRef.current
    ) {
      return
    }

    const defaultRange = state.questionRange || { min: 10, max: 20 }

    // Prevent multiple simultaneous initializations
    isInitializingRef.current = true

    // Calculate total questions from range
    const range = defaultRange
    const total =
      Math.floor(Math.random() * (range.max - range.min + 1)) + range.min

    // Reset state first
    setQuestions([])
    setCurrentPage(0)
    generatedPagesRef.current.clear()
    loadingPagesRef.current.clear()

    // Set totalQuestions
    setTotalQuestions(total)

    // Generate ALL questions upfront (all pages at once)
    if (total && state.text) {
      const generateAllQuestions = async () => {
        setIsGenerating(true)
        try {
          // Calculate how many pages we need
          const totalPages = Math.ceil(total / itemsPerPage)

          // Generate all pages in parallel (or sequentially if needed)
          const generationPromises = []
          for (let page = 0; page < totalPages; page++) {
            generationPromises.push(
              generateQuestionsForPage(page, total, defaultRange, state.text)
            )
          }

          await Promise.all(generationPromises)
        } finally {
          setIsGenerating(false)
          isInitializingRef.current = false
        }
      }

      generateAllQuestions()
    } else {
      isInitializingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.text, state.questions.length])

  // Note: Questions are now generated all upfront, so we don't need per-page generation
  // This useEffect is kept for backward compatibility but should not trigger

  // Load existing answers from session
  useEffect(() => {
    const existingAnswers: Record<string, string | string[]> = {}
    state.answers.forEach((answer) => {
      const question = state.questions.find((q) => q.id === answer.questionId)
      // If it's a multiple-choice question with more than 2 options, it's multiple select
      // Parse comma-separated string back to array
      if (
        question?.type === 'multiple-choice' &&
        question.options &&
        question.options.length > 2
      ) {
        existingAnswers[answer.questionId] = answer.answer
          ? answer.answer.split(',').map((s) => s.trim())
          : []
      } else {
        existingAnswers[answer.questionId] = answer.answer
      }
    })
    setAnswers(existingAnswers)
  }, [state.answers, state.questions])

  // Keep refs in sync with state
  useEffect(() => {
    loadingPagesRef.current = loadingPages
    questionsRef.current = state.questions
  }, [loadingPages, state.questions])

  const handleAnswerChange = (
    questionId: string,
    answer: string | string[]
  ) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    const answerStr = Array.isArray(answer) ? answer.join(', ') : answer
    setAnswer({ questionId, answer: answerStr })
    // Remove from unanswered set if now answered
    if (validationAttempted && unansweredQuestionIds.has(questionId)) {
      const hasValue = Array.isArray(answer)
        ? answer.length > 0
        : answer.trim() !== ''
      if (hasValue) {
        setUnansweredQuestionIds((prev) => {
          const next = new Set(prev)
          next.delete(questionId)
          return next
        })
      }
    }
  }

  const handleMultipleSelectChange = (
    questionId: string,
    option: string,
    checked: boolean
  ) => {
    const currentAnswer = answers[questionId] || []
    const currentArray = Array.isArray(currentAnswer)
      ? currentAnswer
      : currentAnswer
        ? [currentAnswer]
        : []

    if (checked) {
      handleAnswerChange(questionId, [...currentArray, option])
    } else {
      handleAnswerChange(
        questionId,
        currentArray.filter((a) => a !== option)
      )
    }
  }

  const handleSubmit = async () => {
    // Generate all remaining questions before submitting
    if (totalQuestions && state.questions.length < totalQuestions) {
      const remainingPages = Math.ceil(
        (totalQuestions - state.questions.length) / itemsPerPage
      )
      const currentLastPage = Math.floor(state.questions.length / itemsPerPage)

      for (
        let page = currentLastPage;
        page < currentLastPage + remainingPages;
        page++
      ) {
        if (
          !loadingPagesRef.current.has(page) &&
          !generatedPagesRef.current.has(page)
        ) {
          await generateQuestionsForPage(
            page,
            totalQuestions,
            undefined,
            state.text
          )
        }
      }

      // Wait for all questions to be generated
      let attempts = 0
      while (state.questions.length < totalQuestions && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        attempts++
      }
    }

    // Check all questions across all pages
    const expectedQuestions = totalQuestions || state.questions.length
    const allQuestionsToCheck = state.questions.slice(0, expectedQuestions)
    const unansweredQuestions = allQuestionsToCheck.filter((q) => {
      const answer = answers[q.id]
      if (!answer) return true
      if (Array.isArray(answer)) return answer.length === 0
      return answer.trim() === ''
    })

    if (unansweredQuestions.length > 0) {
      // Mark validation as attempted and track unanswered questions
      setValidationAttempted(true)
      setUnansweredQuestionIds(new Set(unansweredQuestions.map((q) => q.id)))

      toast({
        title: 'Incomplete quiz',
        description: `Please answer all ${unansweredQuestions.length} remaining questions before submitting.`,
        variant: 'destructive',
      })
      // Scroll to first unanswered question
      const firstUnansweredIndex = state.questions.findIndex(
        (q) => q.id === unansweredQuestions[0].id
      )
      if (firstUnansweredIndex >= 0) {
        const targetPage = Math.floor(firstUnansweredIndex / itemsPerPage)
        setCurrentPage(targetPage)
        setTimeout(() => {
          const element = document.getElementById(
            `question-${firstUnansweredIndex}`
          )
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
      return
    }

    // Clear validation state if all questions are answered
    setValidationAttempted(false)
    setUnansweredQuestionIds(new Set())

    router.push('/study/results')
  }

  const handleStartOver = () => {
    clearSessionData()
    setShowResetDialog(false)
    toast({
      title: 'Starting over',
      description:
        'Cleared all study material and quiz data. Returning to dashboard.',
    })
    router.push('/dashboard')
  }

  const handleClearAnswers = () => {
    clearAnswers()
    setAnswers({})
    setShowClearAnswersDialog(false)
    toast({
      title: 'Answers cleared',
      description:
        'All quiz responses have been cleared. Questions remain intact.',
    })
  }

  // Calculate pagination
  const totalPages = totalQuestions
    ? Math.ceil(totalQuestions / itemsPerPage)
    : Math.ceil(state.questions.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedQuestions = state.questions.slice(startIndex, endIndex)
  const isPageLoading = loadingPages.has(currentPage)

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleQuestionClick = (questionIndex: number) => {
    const targetPage = Math.floor(questionIndex / itemsPerPage)
    setCurrentPage(targetPage)
    // Scroll to question
    setTimeout(() => {
      const element = document.getElementById(`question-${questionIndex}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 border-green-400'
      case 'medium':
        return 'text-blue-400 border-blue-400'
      case 'hard':
        return 'text-orange-400 border-orange-400'
      default:
        return 'text-gray-400 border-gray-400'
    }
  }

  if (isGenerating && state.questions.length === 0) {
    const currentRange = state.questionRange || { min: 10, max: 20 }
    const avgQuestions = Math.round((currentRange.min + currentRange.max) / 2)
    return <QuizSkeletonPage questionCount={avgQuestions} />
  }

  if (state.questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Generating questions...</span>
        </div>
      </div>
    )
  }

  const hasAnswerValue = (answer: string | string[] | undefined): boolean => {
    if (!answer) return false
    if (Array.isArray(answer)) return answer.length > 0
    return answer.trim() !== ''
  }

  const allQuestions = totalQuestions
    ? Array.from(
        { length: totalQuestions },
        (_, i) => state.questions[i] || null
      )
    : state.questions
  const answeredCount = allQuestions.filter(
    (q) => q && hasAnswerValue(answers[q.id])
  ).length
  const unansweredCount =
    (totalQuestions || allQuestions.length) - answeredCount

  // Single column layout - all questions in one column

  const renderQuestion = (question: Question, globalIndex: number) => {
    const hasAnswer = hasAnswerValue(answers[question.id])
    const currentAnswer =
      answers[question.id] ||
      (question.type === 'multiple-choice' &&
      question.options &&
      question.options.length > 2
        ? []
        : '')
    const isUnanswered = !hasAnswer
    // Only show red/danger highlighting after validation attempt and if question is unanswered
    const showError =
      validationAttempted && unansweredQuestionIds.has(question.id)

    return (
      <Card
        key={question.id}
        id={`question-${globalIndex}`}
        className={cn(
          'border-2 mb-6 transition-all',
          showError && 'border-red-500/50 bg-red-500/10'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                  hasAnswer
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {hasAnswer ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  globalIndex + 1
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Question {globalIndex + 1} of{' '}
                    {totalQuestions || allQuestions.length}
                  </p>
                </div>
                <p className="text-base font-medium">{question.question}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {question.type === 'multiple-choice' && question.options && (
            <>
              {question.options.length > 2 ? (
                // Multiple select (checkboxes)
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const optionArray = Array.isArray(currentAnswer)
                      ? currentAnswer
                      : []
                    const isChecked = optionArray.includes(option)
                    return (
                      <label
                        key={optionIndex}
                        htmlFor={`${question.id}-${optionIndex}`}
                        className={cn(
                          'flex items-center space-x-3 p-3 rounded-lg border-2 transition-all hover:border-primary/50 cursor-pointer bg-card',
                          isChecked && 'border-primary bg-primary/10'
                        )}
                      >
                        <Checkbox
                          id={`${question.id}-${optionIndex}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleMultipleSelectChange(
                              question.id,
                              option,
                              checked === true
                            )
                          }
                        />
                        <span className="cursor-pointer flex-1 text-sm">
                          {option}
                        </span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                // Single select (radio)
                <RadioGroup
                  value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                  onValueChange={(value) =>
                    handleAnswerChange(question.id, value)
                  }
                  className="space-y-3"
                >
                  {question.options.map((option, optionIndex) => {
                    const isSelected =
                      typeof currentAnswer === 'string' &&
                      currentAnswer === option
                    return (
                      <label
                        key={optionIndex}
                        htmlFor={`${question.id}-${optionIndex}`}
                        className={cn(
                          'flex items-center space-x-3 p-3 rounded-lg border-2 transition-all hover:border-primary/50 cursor-pointer bg-card',
                          isSelected && 'border-primary bg-primary/10'
                        )}
                      >
                        <RadioGroupItem
                          value={option}
                          id={`${question.id}-${optionIndex}`}
                          className="h-5 w-5"
                        />
                        <span className="cursor-pointer flex-1 text-sm">
                          {option}
                        </span>
                      </label>
                    )
                  })}
                </RadioGroup>
              )}
            </>
          )}

          {question.type === 'true-false' && question.options && (
            <RadioGroup
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              className="space-y-3"
            >
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  htmlFor={`${question.id}-${optionIndex}`}
                  className="flex items-center space-x-3 p-3 rounded-lg border-2 transition-all hover:border-primary/50 cursor-pointer bg-card"
                >
                  <RadioGroupItem
                    value={option}
                    id={`${question.id}-${optionIndex}`}
                    className="h-5 w-5"
                  />
                  <span className="cursor-pointer flex-1 text-sm">
                    {option}
                  </span>
                </label>
              ))}
            </RadioGroup>
          )}

          {question.type === 'short-answer' && (
            <Textarea
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[100px] text-sm"
            />
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="flex h-full w-full">
      {/* Left Sidebar - Question Navigator */}
      <aside className="w-28 md:w-64 fixed h-full border-t border-r bg-card flex-shrink-0 overflow-y-auto">
        <div className="px-2 py-4 md:px-4 space-y-4">
          <div>
            <h3 className="text-sm md:text-base font-semibold mb-3">
              Review your answers
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground text-xs md:text-base">
                Answered: {answeredCount}
              </div>
              <div className="text-muted-foreground text-xs md:text-base">
                Unanswered: {unansweredCount}
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(1.5rem,1fr))] md:grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-2">
              {Array.from(
                { length: totalQuestions || allQuestions.length },
                (_, index) => {
                  const question = state.questions[index]
                  const hasAnswer = question
                    ? hasAnswerValue(answers[question.id])
                    : false
                  const isCurrentPage =
                    Math.floor(index / itemsPerPage) === currentPage
                  return (
                    <button
                      key={question?.id || `question-${index}`}
                      onClick={() => handleQuestionClick(index)}
                      className={cn(
                        'size-6 md:size-8 rounded text-xs font-medium transition-colors',
                        hasAnswer
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80',
                        isCurrentPage && 'ring-2 ring-secondary'
                      )}
                      type="button"
                    >
                      {index + 1}
                    </button>
                  )
                }
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <article className="flex-1 overflow-y-auto ml-28 md:ml-64">
        <div className="max-w-7xl mx-auto px-2 md:px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-center md:text-start">
                  AI Fundamentals Quiz
                </h1>
                <p className="text-muted-foreground mt-1 text-center md:text-start mb-4 md:mb-0">
                  Progress: {answeredCount} of{' '}
                  {totalQuestions || allQuestions.length}
                </p>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0 || isPageLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1 || isPageLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Questions - Single Column Layout */}
          {isPageLoading ? (
            <QuizSkeletonQuestion questionCount={itemsPerPage} />
          ) : (
            <div className="space-y-6">
              {paginatedQuestions.map((question, pageIndex) => {
                const globalIndex = startIndex + pageIndex
                return renderQuestion(question, globalIndex)
              })}
            </div>
          )}

          {/* Pagination at Bottom */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                size="icon"
                variant="outline"
                className="md:hidden mr-2 px-2"
                onClick={handlePreviousPage}
                disabled={currentPage === 0 || isPageLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden md:inline-flex"
                onClick={handlePreviousPage}
                disabled={currentPage === 0 || isPageLoading}
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
                      disabled={isPageLoading}
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
                disabled={currentPage >= totalPages - 1 || isPageLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden md:inline-flex"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1 || isPageLoading}
              >
                Next Page
                <ChevronRight />
              </Button>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center mt-8 pt-6 border-t">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="gap-2 h-12 text-base font-semibold px-8"
            >
              <CheckCircle className="h-5 w-5" />
              Submit Quiz
            </Button>
          </div>
        </div>
      </article>

      {/* Start Over Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Start Over?
            </DialogTitle>
            <DialogDescription>
              This will clear your current study material and quiz. You&apos;ll
              return to the home page to start fresh.
            </DialogDescription>
            <div className="mt-2 p-2 bg-muted rounded text-sm">
              You have answered {answeredCount} of{' '}
              {totalQuestions || allQuestions.length} questions.
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleStartOver}>
              Start Over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Answers Confirmation Dialog */}
      <Dialog
        open={showClearAnswersDialog}
        onOpenChange={setShowClearAnswersDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Clear Quiz Answers?
            </DialogTitle>
            <DialogDescription>
              This will clear all your quiz responses but keep the questions
              intact. You can answer them again.
            </DialogDescription>
            <div className="mt-2 p-2 bg-muted rounded text-sm">
              You have answered {answeredCount} of{' '}
              {totalQuestions || allQuestions.length} questions.
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowClearAnswersDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAnswers}>
              Clear Answers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
