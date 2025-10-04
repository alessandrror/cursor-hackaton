'use client'

import { CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface QuizSkeletonProps {
  questionCount: number
}

export default function QuizSkeleton({ questionCount }: QuizSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Generating Quiz...
          </CardTitle>
          <CardDescription>
            Creating {questionCount} questions for your quiz
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Question Skeletons */}
      {Array.from({ length: questionCount }, (_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                <Skeleton className="h-6 w-24" />
              </CardTitle>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Answer Options Skeleton */}
              {Array.from({ length: 4 }, (_, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Submit Button Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-12 w-32 rounded-md" />
      </div>
    </div>
  )
}
