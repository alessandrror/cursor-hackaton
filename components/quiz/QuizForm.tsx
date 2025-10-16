'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Home, Trash2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSession } from '@/providers/SessionProvider'
import { useToast } from '@/hooks/use-toast'
import QuizSkeleton from './QuizSkeleton'
import QuestionRangeConfig from './QuestionRangeConfig'

export default function QuizForm() {
  const router = useRouter()
  const { state, setQuestions, setAnswer, clearSessionData, clearAnswers, setQuestionRange } = useSession()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showClearAnswersDialog, setShowClearAnswersDialog] = useState(false)

  const handleGenerateQuestions = useCallback(async (questionRange?: { min: number; max: number }) => {
    if (!state.text) {
      toast({
        title: 'Missing information',
        description: 'Please go back and provide text to study.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: state.text,
          questionRange: questionRange || state.questionRange
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate questions')
      }

      const { questions } = await response.json()
      setQuestions(questions)
      toast({
        title: 'Questions generated!',
        description: `Created ${questions.length} questions for your quiz.`,
      })
    } catch (error) {
      toast({
        title: 'Failed to generate questions',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }, [state.text, state.questionRange, setQuestions, toast])

  // Load existing answers from session
  useEffect(() => {
    const existingAnswers: Record<string, string> = {}
    state.answers.forEach((answer) => {
      existingAnswers[answer.questionId] = answer.answer
    })
    setAnswers(existingAnswers)
  }, [state.answers])


  // Only auto-generate questions when forceRegenerate is explicitly set
  // Otherwise, show the range configuration interface if no range is set
  useEffect(() => {
    if (state.text && state.questions.length === 0 && state.forceRegenerate) {
      handleGenerateQuestions()
    }
  }, [
    state.text,
    state.questions.length,
    state.forceRegenerate,
    handleGenerateQuestions,
  ])

  const handleConfigureRange = (range: { min: number; max: number }) => {
    setQuestionRange(range)
    handleGenerateQuestions(range)
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    setAnswer({ questionId, answer })
  }

  const handleSubmit = () => {
    const unansweredQuestions = state.questions.filter((q) => !answers[q.id])

    if (unansweredQuestions.length > 0) {
      toast({
        title: 'Incomplete quiz',
        description: `Please answer all ${unansweredQuestions.length} remaining questions.`,
        variant: 'destructive',
      })
      return
    }

    router.push('/results')
  }

  const handleStartOver = () => {
    clearSessionData()
    setShowResetDialog(false)
    toast({
      title: 'Starting over',
      description: 'Cleared all study material and quiz data. Returning to home page.',
    })
    router.push('/')
  }

  const handleClearAnswers = () => {
    clearAnswers()
    setAnswers({})
    setShowClearAnswersDialog(false)
    toast({
      title: 'Answers cleared',
      description: 'All quiz responses have been cleared. Questions remain intact.',
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'hard':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (isGenerating) {
    const wordCount = state.text.trim().split(/\s+/).length
    const questionCount = Math.min(Math.max(Math.floor(wordCount / 100), 5), 20)
    
    return <QuizSkeleton questionCount={questionCount} />
  }

  if (state.questions.length === 0) {
    // Show range configuration if no range is set, otherwise show loading
    if (!state.questionRange) {
      return (
        <QuestionRangeConfig
          text={state.text}
          onConfigure={handleConfigureRange}
        />
      )
    }
    
    // If range is set but no questions exist, show loading
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Generating questions within range {state.questionRange.min}-{state.questionRange.max}...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Quiz Time
              </CardTitle>
              <CardDescription>
                Answer all {state.questions.length} questions to complete the quiz
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowClearAnswersDialog(true)}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={Object.keys(answers).length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Clear Answers
              </Button>
              <Button
                onClick={() => setShowResetDialog(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Start Over
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {state.questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Question {index + 1}</CardTitle>
              <Badge className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
            </div>
            <CardDescription>{question.question}</CardDescription>
          </CardHeader>
          <CardContent>
            {question.type === 'multiple-choice' && question.options && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) =>
                  handleAnswerChange(question.id, value)
                }
              >
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={option}
                      id={`${question.id}-${optionIndex}`}
                    />
                    <Label
                      htmlFor={`${question.id}-${optionIndex}`}
                      className="cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'true-false' && (
              <div>
                {question.options && question.options.length > 0 ? (
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onValueChange={(value) =>
                      handleAnswerChange(question.id, value)
                    }
                  >
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={option}
                          id={`${question.id}-${optionIndex}`}
                        />
                        <Label
                          htmlFor={`${question.id}-${optionIndex}`}
                          className="cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-red-500 text-sm">
                    Error: True/False question missing options
                  </div>
                )}
              </div>
            )}

            {question.type === 'short-answer' && (
              <Input
                value={answers[question.id] || ''}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
                placeholder="Enter your answer..."
              />
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center">
        <Button onClick={handleSubmit} size="lg" className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Submit Quiz
        </Button>
      </div>

      {/* Start Over Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Start Over?
            </DialogTitle>
            <DialogDescription>
              This will clear your current study material and quiz. You&apos;ll return to the home page to start fresh.
            </DialogDescription>
            <div className="mt-2 p-2 bg-muted rounded text-sm">
              You have answered {Object.keys(answers).length} of {state.questions.length} questions.
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleStartOver}
            >
              Start Over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Answers Confirmation Dialog */}
      <Dialog open={showClearAnswersDialog} onOpenChange={setShowClearAnswersDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Clear Quiz Answers?
            </DialogTitle>
            <DialogDescription>
              This will clear all your quiz responses but keep the questions intact. You can answer them again.
            </DialogDescription>
            <div className="mt-2 p-2 bg-muted rounded text-sm">
              You have answered {Object.keys(answers).length} of {state.questions.length} questions.
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowClearAnswersDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAnswers}
            >
              Clear Answers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
