'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  RotateCcw,
  Trophy,
  Target,
  RefreshCw,
  Brain,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSession } from '@/providers/SessionProvider'
import { calculateScore, analyzeOpenEndedAnswer } from '@/lib/openai'

interface QuestionAnalysis {
  questionId: string
  score: number
  maxScore: number
  feedback: string
  isCorrect: boolean
  isAnalyzed: boolean
}

export default function ResultsView() {
  const router = useRouter()
  const { state, resetSession, setQuestions, clearAnswers, forceRegenerate } =
    useSession()
  const [showRetakeDialog, setShowRetakeDialog] = useState(false)
  const [questionAnalyses, setQuestionAnalyses] = useState<QuestionAnalysis[]>(
    []
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const results = calculateScore(state.questions, state.answers)

  // Analyze open-ended questions
  useEffect(() => {
    const analyzeQuestions = async () => {
      const openEndedQuestions = state.questions.filter(
        (q) => q.type === 'short-answer'
      )
      if (openEndedQuestions.length === 0) return

      setIsAnalyzing(true)
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || state.apiKey

      const analyses = await Promise.all(
        openEndedQuestions.map(async (question) => {
          const userAnswer = state.answers.find(
            (a) => a.questionId === question.id
          )
          if (!userAnswer) {
            return {
              questionId: question.id,
              score: 0,
              maxScore: 1,
              feedback: 'No answer provided',
              isCorrect: false,
              isAnalyzed: false,
            }
          }

          try {
            const analysis = await analyzeOpenEndedAnswer(
              question.question,
              userAnswer.answer,
              question.correctAnswer,
              apiKey
            )
            return {
              questionId: question.id,
              ...analysis,
              isAnalyzed: true,
            }
          } catch (error) {
            console.error('Error analyzing question:', error)
            return {
              questionId: question.id,
              score: 0,
              maxScore: 1,
              feedback: 'Analysis failed - using basic scoring',
              isCorrect: false,
              isAnalyzed: false,
            }
          }
        })
      )

      setQuestionAnalyses(analyses)
      setIsAnalyzing(false)
    }

    analyzeQuestions()
  }, [state.questions, state.answers, state.apiKey])

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400'
    if (percentage >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent work! 🎉'
    if (percentage >= 80) return 'Great job! 👏'
    if (percentage >= 70) return 'Good effort! 👍'
    if (percentage >= 60) return 'Not bad! Keep practicing! 💪'
    return 'Keep studying! You can do better! 📚'
  }

  const handleNewSession = () => {
    resetSession()
    router.push('/')
  }

  const handleRetakeQuiz = () => {
    setShowRetakeDialog(true)
  }

  const handleReuseQuiz = () => {
    // Clear answers but keep the same questions
    clearAnswers()
    setShowRetakeDialog(false)
    router.push('/quiz')
  }

  const handleGenerateNewQuiz = () => {
    // Clear both questions and answers to generate new ones
    setQuestions([])
    clearAnswers()
    forceRegenerate() // Force regeneration of questions
    setShowRetakeDialog(false)
    router.push('/quiz')
  }

  if (state.questions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No quiz data</CardTitle>
          <CardDescription>
            Please complete a quiz to see results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/')}>Start New Session</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Score Display */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`text-6xl font-bold ${getScoreColor(results.percentage)}`}
          >
            {results.percentage}%
          </div>

          <div className="text-xl text-muted-foreground">
            {getScoreMessage(results.percentage)}
          </div>

          <div className="flex justify-center gap-4 text-sm">
            <Badge variant="secondary" className="gap-1">
              <Target className="h-3 w-3" />
              {results.score} / {results.totalPoints} points
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {results.correctAnswers} / {results.totalQuestions} correct
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>
            Here&apos;s how you performed on each question
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Brain className="h-4 w-4 animate-pulse" />
                <span>Analyzing open-ended questions...</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {state.questions.map((question, index) => {
              const userAnswer = state.answers.find(
                (a) => a.questionId === question.id
              )
              const analysis = questionAnalyses.find(
                (a) => a.questionId === question.id
              )

              // Use AI analysis for short-answer questions, basic comparison for others
              const isCorrect =
                question.type === 'short-answer' && analysis?.isAnalyzed
                  ? analysis.isCorrect
                  : userAnswer?.answer.toLowerCase().trim() ===
                    question.correctAnswer.toLowerCase().trim()

              const score =
                question.type === 'short-answer' && analysis?.isAnalyzed
                  ? analysis.score
                  : isCorrect
                    ? 1
                    : 0

              return (
                <div
                  key={question.id}
                  className="flex items-start gap-3 p-4 rounded-lg border"
                >
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-red-400 flex items-center justify-center">
                        <div className="h-2 w-2 bg-red-400 rounded-full" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Question {index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                        {question.type === 'short-answer' && (
                          <Badge variant="secondary" className="text-xs">
                            Open-ended
                          </Badge>
                        )}
                      </div>
                      {question.type === 'short-answer' &&
                        analysis?.isAnalyzed && (
                          <div className="text-sm text-muted-foreground">
                            Score: {Math.round(score * 100)}%
                          </div>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {question.question}
                    </p>

                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-medium">Your answer: </span>
                        <span
                          className={
                            isCorrect ? 'text-green-400' : 'text-red-400'
                          }
                        >
                          {userAnswer?.answer || 'No answer'}
                        </span>
                      </div>

                      {question.type === 'short-answer' &&
                      analysis?.isAnalyzed ? (
                        <div className="bg-muted/50 p-3 rounded-md">
                          <div className="font-medium text-sm mb-1">
                            AI Analysis:
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {analysis.feedback}
                          </p>
                        </div>
                      ) : (
                        !isCorrect && (
                          <div>
                            <span className="font-medium">
                              Correct answer:{' '}
                            </span>
                            <span className="text-green-400">
                              {question.correctAnswer}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleRetakeQuiz}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </Button>
        <Button onClick={handleNewSession} size="lg" className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Start New Session
        </Button>
      </div>

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
              <RefreshCw className="h-4 w-4" />
              Generate New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
