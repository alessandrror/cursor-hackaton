'use client'

import { useState, useEffect } from 'react'
import { HistoryEntry, HistorySettings } from '@/types/history'

const HISTORY_KEY = 'study_history_v1'
const SETTINGS_KEY = 'study_history_settings'

const DEFAULT_SETTINGS: HistorySettings = {
  enabled: true,
  maxEntries: 100,
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [settings, setSettings] = useState<HistorySettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Load history and settings from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY)
      const savedSettings = localStorage.getItem(SETTINGS_KEY)

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save history to localStorage
  const saveHistory = (entries: HistoryEntry[]) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
      setHistory(entries)
    } catch (error) {
      console.error('Error saving history:', error)
    }
  }

  // Save settings to localStorage
  const saveSettings = (newSettings: HistorySettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  // Add a new entry
  const addEntry = (entry: HistoryEntry) => {
    // Check settings from localStorage directly to ensure we have the latest value
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY)
      const currentSettings = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS
      
      if (!currentSettings.enabled) {
        console.log('History is disabled, not saving entry')
        return
      }

      const savedHistory = localStorage.getItem(HISTORY_KEY)
      const currentHistory: HistoryEntry[] = savedHistory ? JSON.parse(savedHistory) : []
      
      const newHistory = [entry, ...currentHistory]
      
      // Trim to max entries
      const trimmedHistory = newHistory.slice(0, currentSettings.maxEntries)
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory))
      setHistory(trimmedHistory)
      
      console.log('History entry saved:', entry.id)
    } catch (error) {
      console.error('Error adding history entry:', error)
    }
  }

  // Delete an entry
  const deleteEntry = (id: string) => {
    const newHistory = history.filter(entry => entry.id !== id)
    saveHistory(newHistory)
  }

  // Clear all history
  const clearHistory = () => {
    saveHistory([])
  }

  // Export history as JSON
  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `study-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Update settings
  const updateSettings = (updates: Partial<HistorySettings>) => {
    const newSettings = { ...settings, ...updates }
    saveSettings(newSettings)
  }

  return {
    history,
    settings,
    isLoading,
    addEntry,
    deleteEntry,
    clearHistory,
    exportHistory,
    updateSettings,
  }
}

