'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  BookOpen,
  CheckCircle,
  Home,
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
import { Progress } from '@/components/ui/progress'
import { useSession } from '@/providers/SessionProvider'
import { useToast } from '@/hooks/use-toast'
import { useRingtone } from '@/hooks/use-ringtone'
import Timer from './Timer'

export default function Reader() {
  const router = useRouter()
  const { state, setTimerState, setTimeRemaining, clearSessionData } =
    useSession()
  const { toast } = useToast()
  const { isMuted, staticTimerRef, toggleMute, playRingtone, stopRingtone } = useRingtone()
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
    router.push('/study/quiz')
  }

  const handleEarlyQuiz = () => {
    toast({
      title: 'Great job! 🎉',
      description: 'You finished reading early! Starting quiz...',
    })
    router.push('/study/quiz')
  }

  const handleStartOver = () => {
    clearSessionData()
    setShowStartOverDialog(false)
    stopRingtone()
    toast({
      title: 'Starting over',
      description:
        'Cleared all study material and quiz data. Returning to dashboard.',
    })
    router.push('/dashboard')
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
          <Button onClick={() => router.back()}>Go Back</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Timer Section */}
      <Card ref={staticTimerRef} className="border-2 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            Reading Timer
          </CardTitle>
          <CardDescription className="text-base">
            Take your time to read through the material at your own pace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Timer
            staticTimerRef={staticTimerRef}
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
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Reading Material
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs !transition-none !duration-0">
                    {state.source === 'pdf' ? 'PDF Upload' : 'Text Input'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap break-words leading-relaxed text-base p-6 bg-muted/30 rounded-lg border border-border/50">
              {state.text}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button
          onClick={() => setShowStartOverDialog(true)}
          variant="outline"
          size="lg"
          className="gap-2 h-12 text-base"
        >
          <Home className="h-5 w-5" />
          Start Over
        </Button>
        <Button
          onClick={handleEarlyQuiz}
          size="lg"
          className="gap-2 h-12 text-base font-semibold"
        >
          <CheckCircle className="h-5 w-5" />
          Finish Reading & Start Quiz
        </Button>
      </div>

      {/* Time's Up Modal */}
      <Dialog open={showTimeUpModal} onOpenChange={setShowTimeUpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center gap-2">
              Time&apos;s Up! ⏰
            </DialogTitle>
            <DialogDescription className="text-base text-center mt-2">
              Are you ready to test your knowledge?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleContinueReading}
              className="flex-1"
            >
              Continue Reading
            </Button>
            <Button onClick={handleStartQuiz} className="flex-1">
              Start Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Over Confirmation Dialog */}
      <Dialog open={showStartOverDialog} onOpenChange={setShowStartOverDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Start Over?
            </DialogTitle>
            <DialogDescription className="text-base">
              This will clear your current study material and quiz. You&apos;ll
              return to the home page to start fresh.
              <span className="block mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="block text-sm font-semibold text-destructive">
                  Current reading progress will be lost.
                </span>
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStartOverDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleStartOver}>
              Start Over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
