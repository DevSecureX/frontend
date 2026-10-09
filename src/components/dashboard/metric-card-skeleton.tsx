import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface MetricCardSkeletonProps {
  title: string
  icon: React.ReactNode
  showSubMetrics?: boolean
  showBadges?: boolean
}

export function MetricCardSkeleton({ 
  title, 
  icon, 
  showSubMetrics = false, 
  showBadges = false 
}: MetricCardSkeletonProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        {showSubMetrics && (
          <div className="text-xs text-muted-foreground space-y-1">
            <Skeleton className="h-3 w-32" />
            {showBadges && (
              <div className="flex items-center gap-2 flex-wrap">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-14" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}