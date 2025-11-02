import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Target, TrendingUp, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard • Cerebryx',
  description: 'Your study dashboard and progress overview',
}

export default function DashboardPage() {
  return (
    <div className="px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Track your study progress.</p>
          </div>
          <Link href="/study">
            <Button size="lg">
              <BookOpen className="mr-2 h-5 w-5" />
              Start Study Session
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground mt-1">Start your first session</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">-</div>
              <p className="text-sm text-muted-foreground mt-1">Complete a quiz to see</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Study Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0 min</div>
              <p className="text-sm text-muted-foreground mt-1">Keep studying!</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Questions Answered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground mt-1">Ready to learn?</p>
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
              <CardDescription>Configure your study preferences</CardDescription>
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
      </div>
    </div>
  )
}

