'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, BookOpen, CheckCircle, Home } from 'lucide-react'
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
import { useSession } from '@/providers/SessionProvider'
import { useToast } from '@/hooks/use-toast'
import { useRingtone } from '@/hooks/use-ringtone'
import Timer from './Timer'

export default function Reader() {
  const router = useRouter()
  const { state, setTimerState, setTimeRemaining, clearSessionData } = useSession()
  const { toast } = useToast()
  const { isMuted, toggleMute, playRingtone, stopRingtone } = useRingtone()
  const [showTimeUpModal, setShowTimeUpModal] = useState(false)
  const [showStartOverDialog, setShowStartOverDialog] = useState(false)

  const handleTimeUp = useCallback(() => {
    setShowTimeUpModal(true)
    playRingtone()
  }, [playRingtone])

  const handleTimeChange = useCallback(
    (timeMs: number) => {
      setTimeRemaining(timeMs)
    },
    [setTimeRemaining]
  )

  const handleStateChange = useCallback(
    (newState: 'idle' | 'running' | 'paused' | 'finished') => {
      setTimerState(newState)
    },
    [setTimerState]
  )

  const handleContinueReading = () => {
    setShowTimeUpModal(false)
    stopRingtone()
  }

  const handleStartQuiz = () => {
    setShowTimeUpModal(false)
    stopRingtone()
    router.push('/quiz')
  }

  const handleEarlyQuiz = () => {
    toast({
      title: 'Great job! 🎉',
      description: 'You finished reading early! Starting quiz...',
    })
    router.push('/quiz')
  }

  const handleStartOver = () => {
    clearSessionData()
    setShowStartOverDialog(false)
    stopRingtone()
    toast({
      title: 'Starting over',
      description: 'Cleared all study material and quiz data. Returning to home page.',
    })
    router.push('/')
  }

  if (!state.text) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No content to read</CardTitle>
          <CardDescription>
            Please go back and add some text or upload a PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/')}>Go Back</Button>
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
            isMuted={isMuted}
            onToggleMute={toggleMute}
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
          onClick={() => setShowStartOverDialog(true)}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Start Over
        </Button>
        <Button onClick={handleEarlyQuiz} size="lg" className="gap-2">
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
              Your reading time is complete. You can continue reading or start
              the quiz now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleContinueReading}>
              Continue Reading
            </Button>
            <Button onClick={handleStartQuiz}>Start Quiz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Over Confirmation Dialog */}
      <Dialog open={showStartOverDialog} onOpenChange={setShowStartOverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Start Over?
            </DialogTitle>
            <DialogDescription>
              This will clear your current study material and quiz. You&apos;ll return to the home page to start fresh.
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                Current reading progress will be lost.
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStartOverDialog(false)}
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
    </div>
  )
}
