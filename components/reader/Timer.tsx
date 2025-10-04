'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatTime, cn } from '@/lib/utils'

interface TimerProps {
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
  const [isFloating, setIsFloating] = useState(false)

  useEffect(() => {
    setDisplayTime(timeRemainingMs || initialTimeMs)
  }, [timeRemainingMs, initialTimeMs])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerState === 'running') {
      interval = setInterval(() => {
        setDisplayTime((prev) => {
          if (prev <= 0) {
            // Use setTimeout to defer the state updates to the next tick
            setTimeout(() => {
              onTimeUp()
              onStateChange('finished')
            }, 0)
            return 0
          }

          const newTime = prev - 1000
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerState, onTimeUp, onStateChange])

  // Update parent when displayTime changes (but only if it actually changed)
  useEffect(() => {
    if (displayTime !== lastReportedTime.current) {
      lastReportedTime.current = displayTime
      onTimeChange(displayTime)
    }
  }, [displayTime, onTimeChange])

  // Collapse and float when scrolling beyond 30% of viewport height
  useEffect(() => {
    const threshold = window.innerHeight * 0.3
    let last = false
    let raf = 0

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const next = window.scrollY > threshold
        if (next !== last) {
          last = next
          setIsFloating(next)
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
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

  return (
    <div
      className={cn(
        'flex flex-col items-center space-y-4 transition-all duration-300 ease-in',
        isFloating
          ? 'fixed top-4 right-4 z-50 w-auto rounded-lg border bg-background/80 backdrop-blur px-3 py-2 shadow-lg'
          : 'static'
      )}
    >
      <div className="text-center">
        <div
          className={cn(
            'font-mono font-bold mb-2 transition-all duration-300 ease-in',
            isFloating ? 'text-3xl' : 'text-6xl'
          )}
        >
          {formatTime(Math.ceil(displayTime / 1000))}
        </div>
        {!isFloating && (
          <Badge
            variant={
              isFinished ? 'destructive' : isRunning ? 'default' : 'secondary'
            }
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

      {isFloating ? (
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
      )}

      {!isFloating && (
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
      )}
    </div>
  )
}
