'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/providers/SessionProvider'
import { extractTextFromPdf } from '@/lib/pdf'
import { countWords, calculateReadingTime, formatTime } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function InputStep() {
  const router = useRouter()
  const { state, setApiKey, setSource, setText, setReadingTime } = useSession()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [text, setTextState] = useState(state.text || '')
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''

  const wordCount = countWords(text)
  const readingTimeMinutes = calculateReadingTime(wordCount)
  const readingTimeMs = readingTimeMinutes * 60 * 1000

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      const extractedText = await extractTextFromPdf(file)
      setTextState(extractedText)
      setSource('pdf')
      toast({
        title: 'PDF processed successfully',
        description: `Extracted ${countWords(extractedText)} words from ${file.name}`,
      })
    } catch (error) {
      toast({
        title: 'PDF processing failed',
        description: error instanceof Error ? error.message : 'Failed to process PDF',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextChange = (value: string) => {
    setTextState(value)
    setSource('text')
  }

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'API key missing',
        description: 'Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.',
        variant: 'destructive',
      })
      return
    }

    if (!text.trim()) {
      toast({
        title: 'Content required',
        description: 'Please upload a PDF or enter text to study.',
        variant: 'destructive',
      })
      return
    }

    setApiKey(apiKey)
    setText(text)
    setReadingTime(readingTimeMs)
    router.push('/read')
  }

  const canSubmit = apiKey.trim() && text.trim() && !isProcessing

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8" />
          Study Timer & Quiz
        </CardTitle>
        <CardDescription className="text-center">
          Upload a PDF or paste text to start your study session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label>Upload PDF</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Choose PDF File'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="text-input">Paste Text</Label>
          <Textarea
            id="text-input"
            placeholder="Paste your study material here..."
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        {/* Reading Time Preview */}
        {text.trim() && (
          <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
            <Badge variant="secondary">
              {wordCount} words
            </Badge>
            <span className="text-sm text-muted-foreground">
              Estimated reading time: {formatTime(readingTimeMinutes * 60)}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full"
          size="lg"
        >
          Start Study Session
        </Button>
      </CardContent>
    </Card>
  )
}
