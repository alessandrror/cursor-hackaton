'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle, RotateCcw, Trophy, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/providers/SessionProvider'
import { calculateScore } from '@/lib/openai'

export default function ResultsView() {
  const router = useRouter()
  const { state, resetSession } = useSession()

  const results = calculateScore(state.questions, state.answers)

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
    router.push('/quiz')
  }

  if (state.questions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No quiz data</CardTitle>
          <CardDescription>Please complete a quiz to see results.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/')}>
            Start New Session
          </Button>
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
          <div className={`text-6xl font-bold ${getScoreColor(results.percentage)}`}>
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
          <div className="space-y-4">
            {state.questions.map((question, index) => {
              const userAnswer = state.answers.find(a => a.questionId === question.id)
              const isCorrect = userAnswer?.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
              
              return (
                <div key={question.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-red-400 flex items-center justify-center">
                        <div className="h-2 w-2 bg-red-400 rounded-full" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Question {index + 1}</span>
                      <Badge variant="outline" className="text-xs">
                        {question.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {question.question}
                    </p>
                    
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">Your answer: </span>
                        <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                          {userAnswer?.answer || 'No answer'}
                        </span>
                      </div>
                      
                      {!isCorrect && (
                        <div>
                          <span className="font-medium">Correct answer: </span>
                          <span className="text-green-400">
                            {question.correctAnswer}
                          </span>
                        </div>
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
        <Button onClick={handleRetakeQuiz} variant="outline" size="lg" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </Button>
        <Button onClick={handleNewSession} size="lg" className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Start New Session
        </Button>
      </div>
    </div>
  )
}
