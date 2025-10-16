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
import { HelpCircle, Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface QuestionCountPreviewProps {
  text: string
  onGenerate: (questionCount: number) => void
  isGenerating: boolean
}

export default function QuestionCountPreview({
  text,
  onGenerate,
  isGenerating,
}: QuestionCountPreviewProps) {
  const wordCount = text.trim().split(/\s+/).length
  const autoCount = Math.min(Math.max(Math.floor(wordCount / 100), 5), 20)
  const [customCount, setCustomCount] = useState(autoCount)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Reset to auto count when text changes
  useEffect(() => {
    setCustomCount(autoCount)
  }, [autoCount])

  const handleSliderChange = (value: number[]) => {
    setCustomCount(value[0])
  }

  const handleInputChange = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 3 && num <= 25) {
      setCustomCount(num)
    }
  }

  const getDifficultyEstimate = (count: number) => {
    if (count <= 7) return 'Quick quiz (5-10 minutes)'
    if (count <= 12) return 'Standard quiz (10-15 minutes)'
    if (count <= 18) return 'Comprehensive quiz (15-20 minutes)'
    return 'In-depth quiz (20+ minutes)'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quiz Configuration
        </CardTitle>
        <CardDescription>
          This text will generate <span className="font-semibold text-blue-400">{customCount}</span> questions.
          {customCount !== autoCount && (
            <span className="text-muted-foreground ml-1">
              (Auto-suggested: {autoCount})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="question-count" className="text-sm font-medium">
              Number of Questions
            </Label>
            <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Customize Question Count</DialogTitle>
                  <DialogDescription>
                    Adjust the number of questions based on your study preferences.
                    More questions provide deeper coverage but take longer to complete.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Questions: {customCount}</Label>
                      <div className="text-sm text-muted-foreground">
                        {getDifficultyEstimate(customCount)}
                      </div>
                    </div>
                    
                    <Slider
                      value={[customCount]}
                      onValueChange={handleSliderChange}
                      max={25}
                      min={3}
                      step={1}
                      className="w-full"
                    />
                    
                    <div className="flex items-center gap-4">
                      <Label htmlFor="count-input" className="text-sm">
                        Exact number:
                      </Label>
                      <Input
                        id="count-input"
                        type="number"
                        min={3}
                        max={25}
                        value={customCount}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCustomCount(autoCount)}
                  >
                    Reset to Auto ({autoCount})
                  </Button>
                  <Button onClick={() => setShowAdvanced(false)}>
                    Apply Settings
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Text length:</span>
                <span className="font-medium">{wordCount} words</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated time:</span>
                <span className="font-medium">{getDifficultyEstimate(customCount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Question density:</span>
                <span className="font-medium">
                  {Math.round((customCount / wordCount) * 1000)} questions per 1000 words
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => onGenerate(customCount)}
            disabled={isGenerating}
            size="lg"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating {customCount} Questions...
              </>
            ) : (
              <>
                Generate {customCount} Questions
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
