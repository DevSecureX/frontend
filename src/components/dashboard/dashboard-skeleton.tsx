import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield, GitBranch, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor your code security across all repositories
          </p>
        </div>
        <Skeleton className="h-11 w-full sm:w-40" aria-label="Loading scan button" />
      </header>

      {/* Security Score Overview */}
      <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" id="security-score-overview">
            <Shield className="h-5 w-5 text-brand-primary" aria-hidden="true" />
            Overall Security Score
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Security Score</span>
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="mt-2 h-3 rounded-full bg-progress-bg border border-border" role="progressbar" aria-label="Loading security score progress">
                <Skeleton className="h-3 w-3/4 rounded-full" />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Connection and Stats Grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2" role="region" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">Repository and Security Statistics</h2>
            {/* Total Repositories Card */}
            <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>

            {/* Active Issues Card */}
            <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-security-high-500" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <Skeleton className="h-3 w-40" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resolved Issues Card */}
            <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
                <CheckCircle className="h-4 w-4 text-security-safe-500" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <Skeleton className="h-3 w-32" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scan Queue Card */}
            <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scan Queue</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-36" />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="xl:col-span-1">
          {/* GitHub Connection Card Skeleton */}
          <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="grid gap-6 lg:grid-cols-2" aria-labelledby="recent-activity-heading">
        <h2 id="recent-activity-heading" className="sr-only">Recent Security Activity</h2>
        {/* Recent Scans */}
        <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
          <CardHeader>
            <CardTitle id="recent-scans-title">Recent Scans</CardTitle>
            <CardDescription>Latest security scans across your repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 py-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Trends */}
        <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" id="security-trends-title">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Security Trends
            </CardTitle>
            <CardDescription>Issue severity breakdown and resolution patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Critical', 'High', 'Medium', 'Low'].map((severity, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 py-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Skeleton className="h-5 w-16 flex-shrink-0" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <span className="text-sm text-muted-foreground">Average Security Score Trend</span>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 mb-3">
                  <h3 className="text-sm text-muted-foreground font-medium">Resolution Methods (This Month)</h3>
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2" role="list" aria-label="Resolution methods breakdown">
                  {['AI Automation', 'Manual Resolution', 'Dependency Updates'].map((method, index) => (
                    <div key={index} className="flex items-center justify-between" role="listitem">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-2 h-2 rounded-full" />
                        <span className="text-xs">{method}</span>
                      </div>
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}