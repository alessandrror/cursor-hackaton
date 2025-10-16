'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Settings, HelpCircle } from 'lucide-react'

interface QuestionRangeConfigProps {
  text: string
  onConfigure: (range: { min: number; max: number }) => void
}

export default function QuestionRangeConfig({
  text,
  onConfigure,
}: QuestionRangeConfigProps) {
  const wordCount = text.trim().split(/\s+/).length
  const autoMin = Math.min(Math.max(Math.floor(wordCount / 150), 5), 15)
  const autoMax = Math.min(Math.max(Math.floor(wordCount / 100), 10), 35)
  
  const [minQuestions, setMinQuestions] = useState(autoMin)
  const [maxQuestions, setMaxQuestions] = useState(autoMax)
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

  const handleConfigure = () => {
    if (minQuestions > maxQuestions) {
      setError('Minimum cannot be greater than maximum')
      return
    }
    if (minQuestions < 5 || maxQuestions > 50) {
      setError('Range must be between 5 and 50 questions')
      return
    }
    
    onConfigure({ min: minQuestions, max: maxQuestions })
  }

  const getEstimatedTime = (count: number) => {
    if (count <= 10) return '5-10 minutes'
    if (count <= 20) return '10-15 minutes'
    if (count <= 30) return '15-20 minutes'
    if (count <= 50) return '20-30 minutes'
    return '30+ minutes'
  }

  const getRangeDescription = () => {
    const avgQuestions = Math.round((minQuestions + maxQuestions) / 2)
    return `${minQuestions}-${maxQuestions} questions (avg: ${avgQuestions})`
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configure Question Range
        </CardTitle>
        <CardDescription>
          Set your preferred range for quiz questions (5-50 questions). The system will generate a random number of questions within this range.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Text Analysis */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Text length:</span>
              <span className="font-medium">{wordCount} words</span>
            </div>
            <div className="flex justify-between">
              <span>Recommended range:</span>
              <span className="font-medium">{autoMin}-{autoMax} questions</span>
            </div>
          </div>
        </div>

        {/* Range Configuration */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Question Range: {getRangeDescription()}
              </Label>
            </div>
            
            {/* Minimum Questions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="min-questions" className="text-sm">
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
              id="min-questions"
              type="number"
              min={5}
              max={45}
              value={minQuestions}
              onChange={(e) => handleMinChange(parseInt(e.target.value) || 5)}
              className="w-20"
            />
            </div>

            {/* Maximum Questions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="max-questions" className="text-sm">
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
                id="max-questions"
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

          {/* Range Preview */}
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
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => {
              setMinQuestions(autoMin)
              setMaxQuestions(autoMax)
              setError(null)
            }}
            variant="outline"
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Reset to Recommended
          </Button>
          <Button
            onClick={handleConfigure}
            size="lg"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Configure Range
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
