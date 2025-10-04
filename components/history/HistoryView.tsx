'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { History, ArrowLeft, Calendar, Clock, BookOpen, CheckCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useHistory } from '@/hooks/useHistory'
import { useToast } from '@/hooks/use-toast'
import { HistoryEntry } from '@/types/history'
import { formatTime } from '@/lib/utils'

export default function HistoryView() {
  const router = useRouter()
  const { history, settings, deleteEntry, isLoading } = useHistory()
  const { toast } = useToast()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    if (confirm('Delete this session from history?')) {
      deleteEntry(id)
      toast({
        title: 'Session deleted',
        description: 'The study session has been removed from history',
      })
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400 bg-green-500/20'
    if (percentage >= 60) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading history...</p>
      </div>
    )
  }

  if (!settings.enabled) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Study History</h1>
            <p className="text-muted-foreground">Track your learning progress</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>History is Disabled</CardTitle>
            <CardDescription>
              Enable history in settings to start tracking your study sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/settings')}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Study History</h1>
            <p className="text-muted-foreground">Track your learning progress</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No History Yet</CardTitle>
            <CardDescription>
              Complete a study session to see it here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>
              Start Studying
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Study History</h1>
            <p className="text-muted-foreground">{history.length} sessions tracked</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push('/settings')}>
          Settings
        </Button>
      </div>

      <div className="space-y-4">
        {history.map((entry) => {
          const isExpanded = expandedId === entry.id
          const sourceIcon = entry.source.type === 'pdf' ? '📄' : '📝'
          
          return (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{sourceIcon}</span>
                      <Badge variant="outline" className="capitalize">
                        {entry.source.type}
                      </Badge>
                      <Badge className={getScoreColor(entry.quiz.percentage)}>
                        {entry.quiz.percentage}%
                      </Badge>
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(entry.timestamp)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {entry.source.size} words
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(entry.reading.actualSec)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {entry.quiz.questionCount} questions
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpand(entry.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t pt-6 space-y-4">
                  {/* Quiz Results */}
                  <div>
                    <h3 className="font-semibold mb-2">Quiz Results</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{entry.quiz.score}</div>
                        <div className="text-sm text-muted-foreground">Points</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{entry.quiz.percentage}%</div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {entry.quiz.answers.filter(a => a.correct).length}/{entry.quiz.questionCount}
                        </div>
                        <div className="text-sm text-muted-foreground">Correct</div>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Breakdown */}
                  <div>
                    <h3 className="font-semibold mb-2">Question Difficulty</h3>
                    <div className="flex gap-2">
                      <Badge className="bg-green-500/20 text-green-400">
                        Easy: {entry.quiz.difficulty.easy}
                      </Badge>
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        Medium: {entry.quiz.difficulty.medium}
                      </Badge>
                      <Badge className="bg-red-500/20 text-red-400">
                        Hard: {entry.quiz.difficulty.hard}
                      </Badge>
                    </div>
                  </div>

                  {/* Reading Stats */}
                  <div>
                    <h3 className="font-semibold mb-2">Reading Stats</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated time:</span>
                        <span>{formatTime(entry.reading.estimatedSec)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actual time:</span>
                        <span>{formatTime(entry.reading.actualSec)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Early finish:</span>
                        <span>{entry.reading.earlyStop ? 'Yes 🎉' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

