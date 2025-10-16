'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Settings, Target } from 'lucide-react'
import { useSession } from '@/providers/SessionProvider'

interface FirstTimeSetupProps {
  onComplete: () => void
}

export default function FirstTimeSetup({ onComplete }: FirstTimeSetupProps) {
  const { setQuestionRange } = useSession()
  const [minQuestions, setMinQuestions] = useState(10)
  const [maxQuestions, setMaxQuestions] = useState(20)
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
    
    setQuestionRange({ min: minQuestions, max: maxQuestions })
    localStorage.setItem('cerebryx-setup-complete', 'true')
    onComplete()
  }

  const getEstimatedTime = (count: number) => {
    if (count <= 10) return '5-10 minutes'
    if (count <= 20) return '10-15 minutes'
    if (count <= 30) return '15-20 minutes'
    if (count <= 50) return '20-30 minutes'
    return '30+ minutes'
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Welcome to Cerebryx!</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Let&apos;s set up your preferred question range for a personalized study experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Range Configuration */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="setup-min-questions" className="text-sm">
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
                id="setup-min-questions"
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
                <Label htmlFor="setup-max-questions" className="text-sm">
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
                id="setup-max-questions"
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
              <div className="font-medium text-blue-400">Your Quiz Preference</div>
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

          {/* Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <p>You can always change this preference later in the Settings page.</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full" size="lg">
            Start Studying!
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
