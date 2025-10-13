'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, BookOpen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/providers/SessionProvider'
import { extractTextFromPdf } from '@/lib/pdf'
import { countWords, calculateReadingTime, formatTime } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function InputStep() {
  const router = useRouter()
  const { state, setApiKey, setSource, setText, setReadingTime, clearSessionData, clearInputData } = useSession()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [text, setTextState] = useState('')
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showClearInputDialog, setShowClearInputDialog] = useState(false)

  const wordCount = countWords(text)
  const readingTimeMinutes = calculateReadingTime(wordCount)
  const readingTimeMs = readingTimeMinutes * 60 * 1000

  // Sync text state with session state
  useEffect(() => {
    if (state.text && state.text !== text) {
      setTextState(state.text)
    }
  }, [state.text, text])

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        description:
          error instanceof Error ? error.message : 'Failed to process PDF',
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
    if (!text.trim()) {
      toast({
        title: 'Content required',
        description: 'Please upload a PDF or enter text to study.',
        variant: 'destructive',
      })
      return
    }

    setText(text)
    setReadingTime(readingTimeMs)
    router.push('/read')
  }

  const handleClearForm = () => {
    clearSessionData()
    setTextState('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setShowClearDialog(false)
    toast({
      title: 'Form cleared',
      description: 'All study material and quiz data have been cleared.',
    })
  }

  const handleClearInput = () => {
    clearInputData()
    setTextState('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setShowClearInputDialog(false)
    toast({
      title: 'Input cleared',
      description: 'Text/PDF input has been cleared. Quiz data remains intact.',
    })
  }

  const canSubmit = text.trim() && !isProcessing
  const hasContent = text.trim() || state.questions.length > 0

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8" />
          Cerebryx
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
              aria-label="Upload PDF"
              title="Choose PDF File"
              placeholder="Choose PDF File"
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
            className="min-h-[400px]"
          />
        </div>

        {/* Clear Input Button */}
        {text.trim() && (
          <div className="flex justify-end">
            <Button
              onClick={() => setShowClearInputDialog(true)}
              variant="outline"
              size="sm"
              disabled={isProcessing}
              className="gap-2"
            >
              <Trash2 className="h-3 w-3" />
              Clear Input
            </Button>
          </div>
        )}

        {/* Reading Time Preview */}
        {text.trim() && (
          <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
            <Badge variant="secondary">{wordCount} words</Badge>
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

        {/* Clear Form Button */}
        {hasContent && (
          <Button
            onClick={() => setShowClearDialog(true)}
            variant="outline"
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Form
          </Button>
        )}
      </CardContent>

      {/* Clear Form Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Clear Study Session?
            </DialogTitle>
            <DialogDescription>
              This will clear all your entered text/PDF and quiz data. This action cannot be undone.
              {state.questions.length > 0 && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive">
                  You have {state.questions.length} questions and {state.answers.length} answers that will be lost.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearForm}
            >
              Clear Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Input Confirmation Dialog */}
      <Dialog open={showClearInputDialog} onOpenChange={setShowClearInputDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Clear Input Only?
            </DialogTitle>
            <DialogDescription>
              This will clear your text/PDF input but keep any existing quiz data intact.
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                Current input: {wordCount} words
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowClearInputDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearInput}
            >
              Clear Input
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
