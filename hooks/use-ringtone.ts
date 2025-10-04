'use client'

import { useState, useRef, useEffect } from 'react'

const RINGTONE_MUTED_KEY = 'ringtoneMuted'

export function useRingtone() {
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize mute state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMuteState = localStorage.getItem(RINGTONE_MUTED_KEY)
      if (savedMuteState !== null) {
        setIsMuted(savedMuteState === 'true')
      }
    }
  }, [])

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/audio/timeup-ringtone.mp3')
      audioRef.current.preload = 'auto'
    }
  }, [])

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(RINGTONE_MUTED_KEY, newMutedState.toString())
    }
  }

  const playRingtone = async () => {
    if (isMuted || !audioRef.current) return

    try {
      audioRef.current.loop = true
      await audioRef.current.play()
    } catch (error) {
      console.warn('Failed to play ringtone:', error)
    }
  }

  const stopRingtone = () => {
    if (!audioRef.current) return

    try {
      audioRef.current.loop = false
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    } catch (error) {
      console.warn('Failed to stop ringtone:', error)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return {
    isMuted,
    toggleMute,
    playRingtone,
    stopRingtone,
  }
}
