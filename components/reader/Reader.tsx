'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, BookOpen, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSession } from '@/providers/SessionProvider'
import { useToast } from '@/hooks/use-toast'
import Timer from './Timer'

export default function Reader() {
  const router = useRouter()
  const { state, setTimerState, setTimeRemaining } = useSession()
  const { toast } = useToast()
  const [showTimeUpModal, setShowTimeUpModal] = useState(false)

  const handleTimeUp = () => {
    setShowTimeUpModal(true)
  }

  const handleTimeChange = (timeMs: number) => {
    setTimeRemaining(timeMs)
  }

  const handleStateChange = (newState: 'idle' | 'running' | 'paused' | 'finished') => {
    setTimerState(newState)
  }

  const handleContinueReading = () => {
    setShowTimeUpModal(false)
  }

  const handleStartQuiz = () => {
    setShowTimeUpModal(false)
    router.push('/quiz')
  }

  const handleEarlyQuiz = () => {
    toast({
      title: 'Great job! 🎉',
      description: 'You finished reading early! Starting quiz...',
    })
    router.push('/quiz')
  }

  if (!state.text) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No content to read</CardTitle>
          <CardDescription>Please go back and add some text or upload a PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/')}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reading Timer
          </CardTitle>
          <CardDescription>
            Take your time to read through the material
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Timer
            initialTimeMs={state.readingTimeMs}
            onTimeUp={handleTimeUp}
            onTimeChange={handleTimeChange}
            onStateChange={handleStateChange}
            timerState={state.timerState}
            timeRemainingMs={state.timeRemainingMs}
          />
        </CardContent>
      </Card>

      {/* Reading Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Reading Material
          </CardTitle>
          <CardDescription>
            Source: {state.source === 'pdf' ? 'PDF Upload' : 'Text Input'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed">
              {state.text}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleEarlyQuiz}
          size="lg"
          className="gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          End Reading & Start Quiz
        </Button>
      </div>

      {/* Time's Up Modal */}
      <Dialog open={showTimeUpModal} onOpenChange={setShowTimeUpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time&apos;s Up! ⏰
            </DialogTitle>
            <DialogDescription>
              Your reading time is complete. You can continue reading or start the quiz now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleContinueReading}>
              Continue Reading
            </Button>
            <Button onClick={handleStartQuiz}>
              Start Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
