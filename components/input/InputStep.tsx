'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/providers/SessionProvider'
import { useTrial } from '@/hooks/useTrial'
import { extractTextFromPdf } from '@/lib/pdf'
import { countWords, calculateReadingTime } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { RegistrationModal } from '@/components/trial/RegistrationModal'

export default function InputStep() {
  const router = useRouter()
  const {
    state,
    setSource,
    setText,
    setReadingTime,
    clearSessionData,
    setTimerState,
    setTimeRemaining,
  } = useSession()
  const { toast } = useToast()
  const { trialStatus, isLoading: isTrialLoading } = useTrial()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [text, setTextState] = useState('')
  const [characterCount, setCharacterCount] = useState(0)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)

  // Sync text state with session state, but allow clearing
  useEffect(() => {
    // If session text is cleared, clear local text too
    if (!state.text && text) {
      setTextState('')
    }
    // Only sync from session if local text is empty (to allow manual editing)
    else if (state.text && text === '') {
      setTextState(state.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.text])

  // Update character count
  useEffect(() => {
    setCharacterCount(text.length)
  }, [text])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const minHeight = 400
      const maxHeight = 600
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight))
      textarea.style.height = `${newHeight}px`
    }
  }, [text])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') {
      await processFile(file)
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      })
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const processFile = async (file: File) => {
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
    // Only set source if there's actual text
    if (value.trim()) {
      setSource('text')
    }
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast({
        title: 'Content required',
        description: 'Please upload a PDF or enter text to study.',
        variant: 'destructive',
      })
      return
    }

    // Check trial status before allowing submission
    if (!isTrialLoading && !trialStatus.hasAccess) {
      setShowRegistrationModal(true)
      return
    }

    // Check if text has changed and clear old quiz data if needed
    if (state.text !== text) {
      clearSessionData()
    }

    const readingTimeMinutes = calculateReadingTime(countWords(text))
    const readingTimeMs = readingTimeMinutes * 60 * 1000

    setText(text)
    setReadingTime(readingTimeMs)
    setTextState('')
    // Reset timer state when new text is submitted
    setTimerState('idle')
    setTimeRemaining(readingTimeMs)
    router.push('/study/read')
  }

  const canSubmit = text.trim() && !isProcessing && !isTrialLoading

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-start">
            <h1 className="text-4xl font-bold">Prepare Your Study Content</h1>
            <p className="text-lg text-muted-foreground">
              Upload a PDF document or paste text to begin an AI-powered reading and
              quizzing session.
            </p>
          </div>
          {!isTrialLoading && trialStatus.remaining !== Infinity && (
            <Badge variant="outline" className="text-sm self-center md:self-auto">
              {trialStatus.remaining} of 3 free sessions remaining
            </Badge>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upload Document */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Upload Document</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Drag & drop your PDF file here, or click to select a file.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-12 text-center
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}
                ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary/50'}
              `}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload PDF"
              />

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <ArrowUp className="h-12 w-12 text-primary" />
                  <div className="h-0.5 w-16 bg-border"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-base font-medium">
                    Drag &apos;n&apos; drop a PDF here, or click to select file
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Only PDF files are supported.
                  </p>
                </div>
              </div>
            </div>

            {/* Best Practices Note */}
            <p className="text-xs text-muted-foreground">
              For best results, upload clean, text-searchable PDFs. Avoid
              scanned documents with poor resolution.
            </p>
          </CardContent>
        </Card>

        {/* Right Column: Paste Text Content */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Paste Text Content</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Alternatively, paste any text content here to start your study
              session.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Text Area */}
            <Textarea
              ref={textareaRef}
              placeholder="Paste your article, notes, or any text here..."
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[400px] resize-y text-base overflow-y-auto"
              style={{ minHeight: '400px' }}
            />

            {/* Character Count */}
            <p className="text-sm text-muted-foreground">
              Character count: {characterCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="min-w-[300px] h-12 text-base font-semibold"
          size="lg"
        >
          Start Reading Session
        </Button>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        open={showRegistrationModal}
        onOpenChange={setShowRegistrationModal}
      />
    </div>
  )
}
