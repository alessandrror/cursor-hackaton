'use client'

import { useEffect, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/utils'
import { useRingtone } from '@/hooks/use-ringtone'

interface TimerProps {
  initialTimeMs: number
  onTimeUp: () => void
  onTimeChange: (timeMs: number) => void
  onStateChange: (state: 'idle' | 'running' | 'paused' | 'finished') => void
  timerState: 'idle' | 'running' | 'paused' | 'finished'
  timeRemainingMs: number
}

export default function Timer({
  initialTimeMs,
  onTimeUp,
  onTimeChange,
  onStateChange,
  timerState,
  timeRemainingMs,
}: TimerProps) {
  const [displayTime, setDisplayTime] = useState(timeRemainingMs || initialTimeMs)
  const lastReportedTime = useRef(displayTime)
  const { isMuted, toggleMute } = useRingtone()

  useEffect(() => {
    setDisplayTime(timeRemainingMs || initialTimeMs)
  }, [timeRemainingMs, initialTimeMs])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerState === 'running' && displayTime > 0) {
      interval = setInterval(() => {
        setDisplayTime((prev) => {
          const newTime = prev - 1000
          
          if (newTime <= 0) {
            onTimeUp()
            onStateChange('finished')
            return 0
          }
          
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
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <div className="text-6xl font-mono font-bold mb-2">
          {formatTime(Math.ceil(displayTime / 1000))}
        </div>
        <Badge variant={isFinished ? 'destructive' : isRunning ? 'default' : 'secondary'}>
          {isFinished ? 'Time\'s Up!' : isRunning ? 'Running' : isIdle ? 'Ready' : 'Paused'}
        </Badge>
      </div>
      
      <div className="flex gap-2">
        {isIdle && (
          <Button onClick={handleStart} size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            Start
          </Button>
        )}
        
        {isRunning && (
          <Button onClick={handlePause} variant="outline" size="lg" className="gap-2">
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
        
        <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        
        <Button 
          onClick={toggleMute} 
          variant="ghost" 
          size="lg" 
          className="gap-2"
          title={isMuted ? 'Unmute ringtone' : 'Mute ringtone'}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
