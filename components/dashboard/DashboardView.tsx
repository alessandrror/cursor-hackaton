'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Target, Calendar, Clock, CheckCircle } from 'lucide-react'
import { useHistory } from '@/hooks/useHistory'
import { cn, formatStudyTime } from '@/lib/utils'
import DashboardSkeleton from './DashboardSkeleton'

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

export default function DashboardView() {
  const { history, settings, isLoading } = useHistory()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Calculate statistics
  const totalSessions = history.length
  const averageScore =
    history.length > 0
      ? Math.round(
          (history.reduce((sum, entry) => sum + entry.quiz.percentage, 0) /
            history.length) *
            10
        ) / 10
      : 0
  const totalStudyTime = history.reduce(
    (sum, entry) => sum + entry.reading.actualSec,
    0
  )
  const totalQuestionsAnswered = history.reduce(
    (sum, entry) => sum + entry.quiz.questionCount,
    0
  )

  // Get recent sessions (last 5)
  const recentSessions = history.slice(0, 5)

  // Check if history is disabled
  const isHistoryDisabled = !settings.enabled

  return (
    <div className="px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Track your study progress.
            </p>
          </div>
          <Link href="/study">
            <Button>
              <BookOpen className="h-5 w-5" />
              <span className="inline md:hidden">Start</span>
              <span className="hidden md:inline">Start Study Session</span>
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSessions}</div>
              {isHistoryDisabled ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Enable history in settings
                </p>
              ) : totalSessions === 0 ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Start your first session
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Sessions completed
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isHistoryDisabled || totalSessions === 0
                  ? '-'
                  : `${averageScore}%`}
              </div>
              {isHistoryDisabled ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Enable history in settings
                </p>
              ) : totalSessions === 0 ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Complete a quiz to see
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Average across all sessions
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Study Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isHistoryDisabled || totalStudyTime === 0
                  ? '0s'
                  : formatStudyTime(totalStudyTime)}
              </div>
              {isHistoryDisabled ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Enable history in settings
                </p>
              ) : totalStudyTime === 0 ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Keep studying!
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Time spent studying
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Questions Answered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalQuestionsAnswered}</div>
              {isHistoryDisabled ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Enable history in settings
                </p>
              ) : totalQuestionsAnswered === 0 ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Ready to learn?
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Questions completed
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Begin a new study session</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/study">
                <Button className="w-full" size="lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Start New Study Session
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>View Settings</CardTitle>
              <CardDescription>
                Configure your study preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button className="w-full" size="lg" variant="outline">
                  <Target className="mr-2 h-5 w-5" />
                  Open Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Sessions</h2>
              <Button variant="outline" size="sm" disabled>
                <Link href="/history">View All</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {recentSessions.map((entry) => {
                const sourceIcon = entry.source.type === 'pdf' ? '📄' : '📝'
                return (
                  <Card key={entry.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{sourceIcon}</span>
                            <Badge
                              variant="outline"
                              className="capitalize !transition-none !duration-0"
                            >
                              {entry.source.type}
                            </Badge>
                            <Badge
                              className={cn(
                                getScoreColor(entry.quiz.percentage),
                                '!transition-none !duration-0'
                              )}
                            >
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
                              {formatStudyTime(entry.reading.actualSec)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {entry.quiz.questionCount} questions
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
