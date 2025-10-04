'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSession } from '@/providers/SessionProvider'
import { generateQuestions } from '@/lib/openai'
import { useToast } from '@/hooks/use-toast'
import QuizSkeleton from './QuizSkeleton'

export default function QuizForm() {
  const router = useRouter()
  const { state, setQuestions, setAnswer } = useSession()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleGenerateQuestions = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || state.apiKey

    if (!state.text || !apiKey) {
      toast({
        title: 'Missing information',
        description:
          'Please go back and provide text. API key should be set in environment variables.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      const questions = await generateQuestions(state.text, apiKey)
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
  }, [state.text, state.apiKey, setQuestions, toast])

  // Load existing answers from session
  useEffect(() => {
    const existingAnswers: Record<string, string> = {}
    state.answers.forEach((answer) => {
      existingAnswers[answer.questionId] = answer.answer
    })
    setAnswers(existingAnswers)
  }, [state.answers])

  // Generate questions if not already generated or if force regenerate is set
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || state.apiKey
    if (
      (state.questions.length === 0 || state.forceRegenerate) &&
      state.text &&
      apiKey
    ) {
      handleGenerateQuestions()
    }
  }, [
    state.questions.length,
    state.forceRegenerate,
    state.text,
    state.apiKey,
    handleGenerateQuestions,
  ])

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
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No questions available</CardTitle>
          <CardDescription>
            Failed to generate questions. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateQuestions}>Generate Questions</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Quiz Time
          </CardTitle>
          <CardDescription>
            Answer all {state.questions.length} questions to complete the quiz
          </CardDescription>
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

            {question.type === 'true-false' && question.options && (
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
    </div>
  )
}
