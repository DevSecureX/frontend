import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface SkeletonLoaderProps {
  count?: number
  isMobile?: boolean
}

export function RepositoryCardSkeleton() {
  return (
    <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Status stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-400 animate-pulse" />
      
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Title section skeleton */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse">
                <div className="h-3.5 w-3.5 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
            
            {/* Status badges skeleton */}
            <div className="flex items-center gap-1.5">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-14 animate-pulse" />
            </div>
          </div>
          
          {/* 3-dots menu skeleton */}
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Description skeleton */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse" />
          </div>
        </div>

        {/* Compact Metrics skeleton */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700/50 p-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700/50 p-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8 mb-1 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
          </div>
        </div>

        {/* Last synced skeleton */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700/50 p-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export function MobileRepositoryCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      {/* Status stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-400 animate-pulse" />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Title skeleton */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded animate-pulse">
                <div className="h-3 w-3 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
            
            {/* Status badges skeleton */}
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-14 animate-pulse" />
            </div>
          </div>
          
          {/* Expand button skeleton */}
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Primary action button skeleton */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </CardContent>
    </Card>
  )
}

export function StatsCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse mb-1" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
      </CardContent>
    </Card>
  )
}

export function RepositorySkeletonLoader({ count = 6, isMobile = false }: SkeletonLoaderProps) {
  return (
    <div className={`grid gap-4 ${isMobile 
      ? 'grid-cols-1' 
      : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
    }`}>
      {Array.from({ length: count }).map((_, i) => (
        isMobile ? (
          <MobileRepositoryCardSkeleton key={i} />
        ) : (
          <RepositoryCardSkeleton key={i} />
        )
      ))}
    </div>
  )
}