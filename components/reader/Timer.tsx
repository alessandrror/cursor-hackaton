'use client'

import { useRef, useState, useEffect, MutableRefObject } from 'react'
import { formatTime, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'

interface TimerProps {
  staticTimerRef: MutableRefObject<HTMLDivElement | null>
  initialTimeMs: number
  onTimeUp: () => void
  onTimeChange: (timeMs: number) => void
  onStateChange: (state: 'idle' | 'running' | 'paused' | 'finished') => void
  timerState: 'idle' | 'running' | 'paused' | 'finished'
  timeRemainingMs: number
  isMuted: boolean
  onToggleMute: () => void
}

export default function Timer({
  staticTimerRef,
  initialTimeMs,
  onTimeUp,
  onTimeChange,
  onStateChange,
  timerState,
  timeRemainingMs,
  isMuted,
  onToggleMute,
}: TimerProps) {
  const [displayTime, setDisplayTime] = useState(
    timeRemainingMs || initialTimeMs
  )
  const lastReportedTime = useRef(displayTime)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onTimeUpRef = useRef(onTimeUp)
  const onStateChangeRef = useRef(onStateChange)
  const [isFloating, setIsFloating] = useState(false)

  // Keep refs in sync with latest callbacks
  useEffect(() => {
    onTimeUpRef.current = onTimeUp
    onStateChangeRef.current = onStateChange
  }, [onTimeUp, onStateChange])

  useEffect(() => {
    // Only update displayTime if timer is not finished
    // If finished, keep it at 0
    if (timerState !== 'finished') {
      setDisplayTime(timeRemainingMs || initialTimeMs)
    }
  }, [timeRemainingMs, initialTimeMs, timerState])

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Don't start timer if already finished or not running
    if (timerState !== 'running') {
      return
    }

    // Prevent starting if already at or below 0
    if (displayTime <= 0) {
      onStateChangeRef.current('finished')
      onTimeUpRef.current()
      return
    }

    intervalRef.current = setInterval(() => {
      setDisplayTime((prev) => {
        // If already at or below 0, stop immediately
        if (prev <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          // Use setTimeout to ensure state updates happen after interval cleanup
          setTimeout(() => {
            onStateChangeRef.current('finished')
            onTimeUpRef.current()
          }, 0)
          return 0
        }

        const newTime = prev - 1000
        // If we're about to go below 0, stop at 0
        if (newTime <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          // Use setTimeout to ensure state updates happen after interval cleanup
          setTimeout(() => {
            onStateChangeRef.current('finished')
            onTimeUpRef.current()
          }, 0)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerState])

  // Update parent when displayTime changes (but only if it actually changed)
  useEffect(() => {
    if (displayTime !== lastReportedTime.current) {
      lastReportedTime.current = displayTime
      onTimeChange(displayTime)
    }
  }, [displayTime, onTimeChange])

  // Show floating timer when static timer is out of view using IntersectionObserver
  useEffect(() => {
    const staticTimer = staticTimerRef.current
    if (!staticTimer) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsFloating(!entry.isIntersecting)
      },
      {
        threshold: 0.0,
        rootMargin: '-64px 0px 0px 0px',
      }
    )

    observer.observe(staticTimer)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleStart = () => {
    onStateChange('running')
  }

  const handlePause = () => {
    onStateChange('paused')
  }

  const handleReset = () => {
    onStateChange('idle')
    setDisplayTime(initialTimeMs)
    onTimeChange(initialTimeMs)
  }

  const isRunning = timerState === 'running'
  const isFinished = timerState === 'finished'
  const isIdle = timerState === 'idle'

  // Render timer content (reusable for both static and floating)
  const renderTimerContent = (isCompact: boolean) => (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <div
          className={cn(
            'font-mono font-bold mb-3',
            isCompact ? 'text-xl sm:text-4xl' : 'text-7xl'
          )}
        >
          {formatTime(Math.ceil(displayTime / 1000))}
        </div>
        {!isCompact && (
          <Badge
            variant={
              isFinished ? 'destructive' : isRunning ? 'default' : 'secondary'
            }
            className="text-sm px-3 py-1 !transition-none !duration-0"
          >
            {isFinished
              ? "Time's Up!"
              : isRunning
                ? 'Running'
                : isIdle
                  ? 'Ready'
                  : 'Paused'}
          </Badge>
        )}
      </div>

      {isCompact ? (
        <div className="flex gap-2">
          {isIdle && (
            <Button onClick={handleStart} size="icon" aria-label="Start">
              <Play />
            </Button>
          )}

          {isRunning && (
            <Button
              onClick={handlePause}
              variant="outline"
              size="icon"
              aria-label="Pause"
            >
              <Pause />
            </Button>
          )}

          {timerState === 'paused' && (
            <Button onClick={handleStart} size="icon" aria-label="Resume">
              <Play />
            </Button>
          )}

          <Button
            onClick={handleReset}
            variant="outline"
            size="icon"
            aria-label="Reset"
          >
            <RotateCcw />
          </Button>

          <Button
            onClick={onToggleMute}
            variant="ghost"
            size="icon"
            aria-label={isMuted ? 'Unmute ringtone' : 'Mute ringtone'}
            title={isMuted ? 'Unmute ringtone' : 'Mute ringtone'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            {isIdle && (
              <Button onClick={handleStart} size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}

            {isRunning && (
              <Button
                onClick={handlePause}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}

            {timerState === 'paused' && (
              <Button onClick={handleStart} size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}

            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <Button
            onClick={onToggleMute}
            variant="ghost"
            size="lg"
            className="gap-2"
            title={isMuted ? 'Unmute ringtone' : 'Mute ringtone'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* Static Timer - Always visible */}
      <div className="static w-full flex flex-col items-center space-y-4">
        {renderTimerContent(false)}
      </div>

      {/* Floating Timer - Conditionally rendered when scrolling */}
      {isFloating && (
        <div className="fixed top-12 right-2 z-50 w-auto rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 py-2 shadow-lg">
          {renderTimerContent(true)}
        </div>
      )}
    </>
  )
}
