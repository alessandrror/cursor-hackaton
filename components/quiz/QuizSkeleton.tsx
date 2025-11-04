'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface QuizSkeletonProps {
  questionCount: number
}

export default function QuizSkeleton({ questionCount }: QuizSkeletonProps) {
  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - Question Navigator Skeleton */}
      <aside className="w-64 border-r bg-card flex-shrink-0 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div>
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="space-y-2 text-sm">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          
          <div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: Math.min(questionCount, 10) }, (_, index) => (
                <Skeleton key={index} className="h-8 w-8 rounded" />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Questions - Single Column Layout */}
          <div className="space-y-6">
            {Array.from({ length: Math.min(questionCount, 10) }, (_, index) => (
              <Card key={index} className="border-2 mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4 mt-1" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Answer Options Skeleton */}
                    {Array.from({ length: 4 }, (_, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-3 p-3 rounded-lg border-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button Skeleton */}
          <div className="flex justify-center mt-8 pt-6 border-t">
            <Skeleton className="h-12 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
