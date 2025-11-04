'use client'

import { useRouter } from 'next/navigation'
import {
  Settings,
  Trash2,
  Download,
  ArrowLeft,
  Target,
  AlertCircle,
  Database,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useHistory } from '@/hooks/useHistory'
import { useToast } from '@/hooks/use-toast'
import { useSession } from '@/providers/SessionProvider'
import { useState } from 'react'

interface QuestionRangeSettingsProps {
  currentRange?: { min: number; max: number }
  onRangeChange: (range: { min: number; max: number }) => void
}

function QuestionRangeSettings({
  currentRange,
  onRangeChange,
}: QuestionRangeSettingsProps) {
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
      {currentRange ? (
        <Alert className="bg-primary/10 border-primary/20">
          <Target className="h-4 w-4 text-primary" />
          <AlertDescription className="text-base">
            <span className="font-semibold">Current range:</span>{' '}
            {currentRange.min}-{currentRange.max} questions
            <span className="text-muted-foreground ml-2">
              (avg: {Math.round((currentRange.min + currentRange.max) / 2)},{' '}
              {getEstimatedTime(
                Math.round((currentRange.min + currentRange.max) / 2)
              )}
              )
            </span>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-secondary/10 border-secondary/20">
          <AlertCircle className="h-4 w-4 text-secondary" />
          <AlertDescription className="text-base">
            <span className="font-semibold">No range set yet.</span> Questions
            will be generated using the default range (10-20 questions).
          </AlertDescription>
        </Alert>
      )}

      {/* Range Configuration */}
      <div className="space-y-6">
        <div className="space-y-4 p-4 rounded-lg border-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="settings-min-questions"
              className="text-base font-semibold"
            >
              Minimum Questions: {minQuestions}
            </Label>
            <span className="text-sm text-muted-foreground">
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
            className="w-24 h-10"
          />
        </div>

        <div className="space-y-4 p-4 rounded-lg border-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="settings-max-questions"
              className="text-base font-semibold"
            >
              Maximum Questions: {maxQuestions}
            </Label>
            <span className="text-sm text-muted-foreground">
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
            className="w-24 h-10"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview */}
      <Card className="border-2 bg-gradient-to-br from-secondary/10 to-accent/10">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="font-semibold text-base mb-3">Range Preview</div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Question range:
              </span>
              <span className="font-bold text-base">
                {minQuestions}-{maxQuestions} questions
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Average questions:
              </span>
              <span className="font-bold text-base">
                {Math.round((minQuestions + maxQuestions) / 2)} questions
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Estimated time:
              </span>
              <span className="font-bold text-base">
                {getEstimatedTime(
                  Math.round((minQuestions + maxQuestions) / 2)
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        <Save className="h-5 w-5 mr-2" />
        Update Question Range
      </Button>
    </div>
  )
}

export default function SettingsView() {
  const router = useRouter()
  const { history, settings, updateSettings, clearHistory, exportHistory } =
    useHistory()
  const { toast } = useToast()
  const { state, setQuestionRange } = useSession()

  const handleBack = () => {
    // Try to go back, but if no history or would go to external site, use smart fallback
    if (window.history.length > 1) {
      const referrer = document.referrer
      // Check if referrer is from same origin
      if (referrer && referrer.startsWith(window.location.origin)) {
        router.back()
        return
      }
    }
    // Fallback: go to dashboard if available, otherwise study
    if (state.text || state.questions.length > 0) {
      router.push('/study')
    } else {
      router.push('/dashboard')
    }
  }

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
    if (
      confirm(
        'Are you sure you want to delete all history? This action cannot be undone.'
      )
    ) {
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-base mt-1">
            Manage your study session preferences
          </p>
        </div>
      </div>

      {/* Question Range Settings */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                Question Range Settings
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Configure the range of questions generated for your quizzes
                (5-50 questions)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <QuestionRangeSettings
            currentRange={state.questionRange}
            onRangeChange={handleRangeChange}
          />
        </CardContent>
      </Card>

      {/* History Settings */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Database className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                History Settings
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Configure how your study sessions are saved locally
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable History */}
          <div className="flex items-center justify-between p-4 rounded-lg border-2">
            <div className="space-y-0.5 flex-1">
              <Label
                htmlFor="enable-history"
                className="text-base font-semibold"
              >
                Enable History
              </Label>
              <p className="text-sm text-muted-foreground">
                Save your study sessions locally on this device
              </p>
            </div>
            <Switch
              id="enable-history"
              checked={settings.enabled}
              onCheckedChange={handleToggleHistory}
            />
          </div>

          {/* Max Entries */}
          <div className="space-y-3 p-4 rounded-lg border-2">
            <Label htmlFor="max-entries" className="text-base font-semibold">
              Maximum History Entries
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="max-entries"
                type="number"
                min="1"
                max="1000"
                value={settings.maxEntries}
                onChange={(e) => handleMaxEntriesChange(e.target.value)}
                className="max-w-[200px] h-10"
              />
              <span className="text-sm text-muted-foreground">sessions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Older sessions will be automatically removed when this limit is
              reached
            </p>
          </div>

          {/* Current Stats */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold">{history.length}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Saved Sessions
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold">
                  {(JSON.stringify(history).length / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Storage Used
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                Data Management
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Export or delete your saved history
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={handleExportHistory}
              disabled={history.length === 0}
              className="flex-1 gap-2 h-12 text-base"
            >
              <Download className="h-5 w-5" />
              Export History
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              disabled={history.length === 0}
              className="flex-1 gap-2 h-12 text-base"
            >
              <Trash2 className="h-5 w-5" />
              Clear All History
            </Button>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your data is stored locally on your device and never sent to any
              server
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
