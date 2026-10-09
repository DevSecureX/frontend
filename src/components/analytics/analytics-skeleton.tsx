import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BarChart3,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  LineChart,
  TrendingUp,
  Shield,
  Eye,
  Users,
  GitBranch,
  Settings
} from 'lucide-react'

export function AnalyticsMetricCardSkeleton({ icon: Icon, title }: { icon: any, title: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}

export function AnalyticsOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsMetricCardSkeleton icon={Activity} title="Total Scans" />
        <AnalyticsMetricCardSkeleton icon={Target} title="Average Score" />
        <AnalyticsMetricCardSkeleton icon={AlertTriangle} title="Vulnerabilities" />
        <AnalyticsMetricCardSkeleton icon={CheckCircle2} title="Fixed Issues" />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issues by Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Issues by Severity
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Security Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Security Score Trend
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Top Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Most Common Issues</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-56" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalyticsSecuritySkeleton() {
  return (
    <div className="space-y-6">
      {/* Security Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-16 mb-2" />
            <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">False Positive Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-16 mb-2" />
            <Skeleton className="h-4 w-36" />
          </CardContent>
        </Card>
      </div>

      {/* Vulnerability Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Vulnerability Trends</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>

      {/* Issue Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Issues by Category</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>

      {/* Advanced Issue Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Advanced Issue Analytics
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-80" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Issue Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>

            {/* Issue Severity Distribution */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <Skeleton className="h-5 w-32 mb-3" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalyticsComplianceSkeleton() {
  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="text-center">
              <Skeleton className="h-16 w-16 mx-auto mb-2" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-16 w-12 mx-auto mb-2" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-16 w-12 mx-auto mb-2" />
              <Skeleton className="h-3 w-28 mx-auto" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>

      {/* Compliance Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Categories</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-56" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <div className="text-right">
                    <Skeleton className="h-5 w-10 mb-1" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalyticsTrendsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Security Trends Analysis
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-56" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-96 w-full" />
      </CardContent>
    </Card>
  )
}

export function AnalyticsRepositoriesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Repository Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnalyticsMetricCardSkeleton icon={GitBranch} title="Total Repositories" />
        <AnalyticsMetricCardSkeleton icon={Activity} title="Active Repos" />
        <AnalyticsMetricCardSkeleton icon={Target} title="Languages" />
        <AnalyticsMetricCardSkeleton icon={Shield} title="Niches" />
      </div>

      {/* Repository Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Languages Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Languages Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-8 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AnalyticsTeamSkeleton() {
  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnalyticsMetricCardSkeleton icon={Users} title="Team Members" />
        <AnalyticsMetricCardSkeleton icon={Activity} title="Active Contributors" />
        <AnalyticsMetricCardSkeleton icon={GitBranch} title="Repositories" />
        <AnalyticsMetricCardSkeleton icon={Target} title="Collaboration Score" />
      </div>

      {/* Team Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Contributors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Most Active Contributors
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-56" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-8 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Repository Ownership */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Repository Ownership
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Frequency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Scan Activity by Team Member
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-52" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalyticsCustomSkeleton() {
  return (
    <div className="space-y-6">
      {/* Custom Analytics Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Analytics Query
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-80" />
          </div>

          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="grid gap-2 md:grid-cols-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Custom Analytics Help */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Analytics Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="space-y-1">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-4 w-full max-w-md" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-5 w-16 mb-2" />
              <div className="space-y-1">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} className="h-4 w-full max-w-lg" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Security Analytics</h1>
          </div>
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-44" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <AnalyticsOverviewSkeleton />
      </div>
    </div>
  )
}