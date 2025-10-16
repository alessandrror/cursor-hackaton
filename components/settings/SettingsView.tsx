'use client'

import { useRouter } from 'next/navigation'
import { Settings, Trash2, Download, ArrowLeft, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useHistory } from '@/hooks/useHistory'
import { useToast } from '@/hooks/use-toast'
import { useSession } from '@/providers/SessionProvider'
import { useState } from 'react'

interface QuestionRangeSettingsProps {
  currentRange?: { min: number; max: number }
  onRangeChange: (range: { min: number; max: number }) => void
}

function QuestionRangeSettings({ currentRange, onRangeChange }: QuestionRangeSettingsProps) {
  const [minQuestions, setMinQuestions] = useState(currentRange?.min || 5)
  const [maxQuestions, setMaxQuestions] = useState(currentRange?.max || 15)
  const [error, setError] = useState<string | null>(null)

  const handleMinChange = (value: number) => {
    setMinQuestions(value)
    if (value >= maxQuestions) {
      setMaxQuestions(Math.min(value + 5, 50))
    }
    setError(null)
  }

  const handleMaxChange = (value: number) => {
    setMaxQuestions(value)
    if (value <= minQuestions) {
      setMinQuestions(Math.max(value - 5, 5))
    }
    setError(null)
  }

  const handleSave = () => {
    if (minQuestions > maxQuestions) {
      setError('Minimum cannot be greater than maximum')
      return
    }
    if (minQuestions < 5 || maxQuestions > 50) {
      setError('Range must be between 5 and 50 questions')
      return
    }
    
    onRangeChange({ min: minQuestions, max: maxQuestions })
    setError(null)
  }

  const getEstimatedTime = (count: number) => {
    if (count <= 10) return '5-10 minutes'
    if (count <= 20) return '10-15 minutes'
    if (count <= 30) return '15-20 minutes'
    if (count <= 50) return '20-30 minutes'
    return '30+ minutes'
  }

  return (
    <div className="space-y-6">
      {/* Current Range Display */}
      {currentRange && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm">
            <span className="font-medium">Current range:</span> {currentRange.min}-{currentRange.max} questions
            <span className="text-muted-foreground ml-2">
              (avg: {Math.round((currentRange.min + currentRange.max) / 2)}, {getEstimatedTime(Math.round((currentRange.min + currentRange.max) / 2))})
            </span>
          </div>
        </div>
      )}

      {/* Range Configuration */}
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="settings-min-questions" className="text-sm">
              Minimum Questions: {minQuestions}
            </Label>
            <span className="text-xs text-muted-foreground">
              {getEstimatedTime(minQuestions)}
            </span>
          </div>
          <Slider
            value={[minQuestions]}
            onValueChange={(value) => handleMinChange(value[0])}
            max={45}
            min={5}
            step={1}
            className="w-full"
          />
          <Input
            id="settings-min-questions"
            type="number"
            min={5}
            max={45}
            value={minQuestions}
            onChange={(e) => handleMinChange(parseInt(e.target.value) || 5)}
            className="w-20"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="settings-max-questions" className="text-sm">
              Maximum Questions: {maxQuestions}
            </Label>
            <span className="text-xs text-muted-foreground">
              {getEstimatedTime(maxQuestions)}
            </span>
          </div>
          <Slider
            value={[maxQuestions]}
            onValueChange={(value) => handleMaxChange(value[0])}
            max={50}
            min={10}
            step={1}
            className="w-full"
          />
          <Input
            id="settings-max-questions"
            type="number"
            min={10}
            max={50}
            value={maxQuestions}
            onChange={(e) => handleMaxChange(parseInt(e.target.value) || 10)}
            className="w-20"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Preview */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="text-sm space-y-2">
          <div className="font-medium text-blue-400">Range Preview</div>
          <div className="flex justify-between">
            <span>Question range:</span>
            <span className="font-medium">{minQuestions}-{maxQuestions} questions</span>
          </div>
          <div className="flex justify-between">
            <span>Average questions:</span>
            <span className="font-medium">{Math.round((minQuestions + maxQuestions) / 2)} questions</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated time:</span>
            <span className="font-medium">{getEstimatedTime(Math.round((minQuestions + maxQuestions) / 2))}</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full">
        Update Question Range
      </Button>
    </div>
  )
}

export default function SettingsView() {
  const router = useRouter()
  const { history, settings, updateSettings, clearHistory, exportHistory } = useHistory()
  const { toast } = useToast()
  const { state, setQuestionRange } = useSession()

  const handleToggleHistory = (enabled: boolean) => {
    updateSettings({ enabled })
    toast({
      title: enabled ? 'History enabled' : 'History disabled',
      description: enabled 
        ? 'Your study sessions will now be saved' 
        : 'Your study sessions will no longer be saved',
    })
  }

  const handleMaxEntriesChange = (value: string) => {
    const num = parseInt(value)
    if (!isNaN(num) && num > 0 && num <= 1000) {
      updateSettings({ maxEntries: num })
    }
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to delete all history? This action cannot be undone.')) {
      clearHistory()
      toast({
        title: 'History cleared',
        description: 'All study session history has been deleted',
      })
    }
  }

  const handleExportHistory = () => {
    exportHistory()
    toast({
      title: 'History exported',
      description: 'Your history has been downloaded as JSON',
    })
  }

  const handleRangeChange = (range: { min: number; max: number }) => {
    setQuestionRange(range)
    toast({
      title: 'Question range updated',
      description: `Questions will be generated between ${range.min}-${range.max} questions`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your study session preferences</p>
        </div>
      </div>

      {/* Question Range Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Question Range Settings
          </CardTitle>
          <CardDescription>
            Configure the range of questions generated for your quizzes (5-50 questions)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <QuestionRangeSettings 
            currentRange={state.questionRange}
            onRangeChange={handleRangeChange}
          />
        </CardContent>
      </Card>

      {/* History Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            History Settings
          </CardTitle>
          <CardDescription>
            Configure how your study sessions are saved
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable History */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-history">Enable History</Label>
              <p className="text-sm text-muted-foreground">
                Save your study sessions locally on this device
              </p>
            </div>
            <Button
              variant={settings.enabled ? 'default' : 'outline'}
              onClick={() => handleToggleHistory(!settings.enabled)}
            >
              {settings.enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {/* Max Entries */}
          <div className="space-y-2">
            <Label htmlFor="max-entries">Maximum History Entries</Label>
            <div className="flex items-center gap-2">
              <Input
                id="max-entries"
                type="number"
                min="1"
                max="1000"
                value={settings.maxEntries}
                onChange={(e) => handleMaxEntriesChange(e.target.value)}
                className="max-w-[200px]"
              />
              <span className="text-sm text-muted-foreground">
                sessions
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Older sessions will be automatically removed when this limit is reached
            </p>
          </div>

          {/* Current Stats */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{history.length}</div>
                <div className="text-sm text-muted-foreground">Saved Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {((JSON.stringify(history).length / 1024) / 1024).toFixed(2)} MB
                </div>
                <div className="text-sm text-muted-foreground">Storage Used</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export or delete your saved history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={handleExportHistory}
              disabled={history.length === 0}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Export History
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              disabled={history.length === 0}
              className="flex-1 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All History
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            💡 Your data is stored locally on your device and never sent to any server
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

