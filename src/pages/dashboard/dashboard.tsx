import { Shield, GitBranch, AlertTriangle, CheckCircle, Clock, TrendingUp, BarChart3, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { GitHubConnectionCard } from '@/components/auth/GitHubConnectionCard'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { MetricCardSkeleton } from '@/components/dashboard/metric-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { TimeRange } from '@/lib/api/analytics'
import { useTimezone } from '@/contexts/TimezoneContext'

export function Dashboard() {
  const navigate = useNavigate()
  const { formatDate } = useTimezone()
  
  // Fetch comprehensive analytics data for dashboard
  const { data: overviewAnalytics, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.analytics.getOverview(TimeRange.MONTH),
    refetchInterval: 300000, // Refresh every 5 minutes (less aggressive)
    retry: 1, // Only retry once on failure
  })

  const { data: securityAnalytics } = useQuery({
    queryKey: ['analytics-security'],
    queryFn: () => api.analytics.getSecurity(TimeRange.MONTH),
    refetchInterval: 300000, // Refresh every 5 minutes
    retry: 1,
  })

  const { data: realTimeMetrics } = useQuery({
    queryKey: ['analytics-realtime'],
    queryFn: () => api.analytics.getRealTimeMetrics(),
    refetchInterval: 120000, // Refresh every 2 minutes (less aggressive)
    retry: 1,
  })

  const { data: repositoryAnalytics } = useQuery({
    queryKey: ['analytics-repositories'],
    queryFn: () => api.analytics.getRepositories(),
    refetchInterval: 900000, // Refresh every 15 minutes (better for long-running scans)
    retry: 1,
  })

  const { data: repositories } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => api.repositories.list(),
    retry: 1,
  })

  const { data: queueStats } = useQuery({
    queryKey: ['queue-stats'],
    queryFn: () => api.scans.getQueueStats(),
    refetchInterval: 120000, // Refresh every 2 minutes (less aggressive)
    retry: 1,
  })

  const { data: issuesCounts } = useQuery({
    queryKey: ['issues-counts'],
    queryFn: () => api.issues.getIssuesCounts({ time_range: 'month' }),
    refetchInterval: 300000, // Refresh every 5 minutes (less aggressive)
    retry: 1,
  })

  const { data: resolutionStats } = useQuery({
    queryKey: ['resolution-stats'],
    queryFn: () => api.issues.getResolutionStats({ time_range: 'month' }),
    refetchInterval: 900000, // Refresh every 15 minutes (better for long-running scans)
    retry: 1,
  })

  // Calculate comprehensive dashboard metrics from analytics
  const securityScore = Math.round(overviewAnalytics?.metrics?.average_security_score || realTimeMetrics?.security_score_avg || 0)
  
  const totalRepositories = repositoryAnalytics?.total_repositories || repositories?.length || 0
  const activeRepositories = repositoryAnalytics?.active_repositories || totalRepositories
  
  const totalIssues = issuesCounts?.total_issues || overviewAnalytics?.metrics?.total_vulnerabilities || securityAnalytics?.metrics?.total_vulnerabilities || 0
  const criticalIssues = overviewAnalytics?.metrics?.critical_issues || securityAnalytics?.metrics?.critical_issues || 0
  const fixedIssues = issuesCounts?.total_fixed || 0 // Now using REAL fixed issues count!

  
  // Real resolution breakdown
  const fixedByAI = issuesCounts?.fixed_by_ai || 0
  const fixedManually = issuesCounts?.fixed_manually || 0
  const fixedByDependency = issuesCounts?.fixed_by_dependency || 0
  const openIssues = issuesCounts?.open_issues || 0
  
  const activeScans = realTimeMetrics?.active_scans || queueStats?.processing || 0
  const queuedScans = realTimeMetrics?.queued_scans || queueStats?.queued || 0
  const totalScansToday = queueStats?.total_scans_today || 0

  // Security trend calculation
  const securityTrendData = securityAnalytics?.trend_data || []
  const currentPeriodIssues = {
    critical: securityAnalytics?.metrics?.critical_issues || 0,
    high: securityAnalytics?.metrics?.high_issues || 0,
    medium: securityAnalytics?.metrics?.medium_issues || 0,
    low: securityAnalytics?.metrics?.low_issues || 0,
  }

  // Calculate trend changes (comparing with previous period if available)
  const calculateTrendChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? `+${current}` : '0'
    const change = current - previous
    return change >= 0 ? `+${change}` : `${change}`
  }

  // Show skeleton loader while main analytics APIs are loading
  if (overviewLoading || (!overviewAnalytics && !issuesCounts && !repositoryAnalytics)) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Security Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Monitor your code security across all repositories
              </p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/scans')}
          className="w-full sm:w-auto min-h-[44px] gap-2 flex-shrink-0"
          aria-label="Navigate to scans page to run new security scan"
        >
          <Shield className="h-4 w-4" aria-hidden="true" />
          <span className="sm:hidden lg:inline">Run Security Scan</span>
          <span className="hidden sm:inline lg:hidden">Run Scan</span>
        </Button>
      </header>

      {/* Security Score Overview */}
      {!overviewAnalytics && !realTimeMetrics ? (
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
                <div className="mt-2 h-3 rounded-full bg-progress-bg">
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
      ) : (
        <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" id="security-score-overview">
              <Shield className="h-5 w-5 text-brand-primary" aria-hidden="true" />
              Overall Security Score
            </CardTitle>
            <CardDescription>
              Based on {overviewAnalytics?.metrics?.total_scans || 0} scans across {totalRepositories} repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="text-3xl sm:text-4xl font-bold text-brand-primary" aria-describedby="security-score-description">{securityScore}</div>
              <div className="flex-1 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-muted-foreground mb-2 gap-1 sm:gap-2">
                  <span id="security-score-description">Security Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm">{securityScore >= 80 ? 'Excellent' : securityScore >= 60 ? 'Good' : securityScore >= 40 ? 'Fair' : 'Needs Improvement'}</span>
                    {realTimeMetrics?.system_health && (
                      <Badge 
                        variant={realTimeMetrics.system_health === 'healthy' ? 'safe' : 
                                realTimeMetrics.system_health === 'warning' ? 'medium' : 'critical'}
                        className="text-xs"
                        aria-label={`System health status: ${realTimeMetrics.system_health}`}
                      >
                        {realTimeMetrics.system_health}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-3 rounded-full bg-progress-bg border border-border" role="progressbar" aria-valuenow={securityScore} aria-valuemin={0} aria-valuemax={100} aria-label="Security score progress">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      securityScore >= 80 ? 'bg-security-safe-500' :
                      securityScore >= 60 ? 'bg-security-low-500' :
                      securityScore >= 40 ? 'bg-security-medium-500' :
                      'bg-security-high-500'
                    }`}
                    style={{ width: `${securityScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground gap-2">
                  <span className="truncate">{totalIssues} total issues</span>
                  <span className="truncate">{criticalIssues} critical</span>
                  <span className="truncate">{fixedIssues} resolved</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GitHub Connection and Stats Grid */}
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {/* Stats Grid */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2" role="region" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">Repository and Security Statistics</h2>
            <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" aria-label={`${totalRepositories} total repositories`}>{totalRepositories}</div>
                <p className="text-xs text-muted-foreground">
                  {activeRepositories} active repositories
                </p>
              </CardContent>
            </Card>

            {(!overviewAnalytics && !issuesCounts) ? (
              <MetricCardSkeleton 
                title="Active Issues" 
                icon={<AlertTriangle className="h-4 w-4 text-security-high-500" />}
                showSubMetrics={true}
                showBadges={true}
              />
            ) : (
              <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-security-high-500" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" aria-label={`${openIssues || totalIssues} active security issues`}>{openIssues || totalIssues}</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{criticalIssues} critical requiring immediate attention</p>
                    {totalIssues > 0 && fixedIssues > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span>Resolution rate:</span>
                        <Badge variant="outline" className={`text-xs w-fit ${
                          (fixedIssues / totalIssues) > 0.7 ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200' :
                          (fixedIssues / totalIssues) > 0.4 ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200' :
                          'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                        }`}
                        aria-label={`Resolution rate: ${Math.round((fixedIssues / totalIssues) * 100)} percent`}>
                          {Math.round((fixedIssues / totalIssues) * 100)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {!issuesCounts ? (
              <MetricCardSkeleton 
                title="Fixed Issues" 
                icon={<CheckCircle className="h-4 w-4 text-security-safe-500" />}
                showSubMetrics={true}
                showBadges={true}
              />
            ) : (
              <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
                  <CheckCircle className="h-4 w-4 text-security-safe-500" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" aria-label={`${fixedIssues} resolved security issues`}>{fixedIssues}</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Total resolved this month</p>
                    {(fixedByAI > 0 || fixedManually > 0 || fixedByDependency > 0) && (
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        {fixedByAI > 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200" aria-label={`${fixedByAI} issues resolved by AI automation`}>
                            AI: {fixedByAI}
                          </Badge>
                        )}
                        {fixedManually > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200" aria-label={`${fixedManually} issues resolved manually`}>
                            Manual: {fixedManually}
                          </Badge>
                        )}
                        {fixedByDependency > 0 && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200" aria-label={`${fixedByDependency} issues resolved by dependency updates`}>
                            <span className="hidden sm:inline">Dependencies: </span>
                            <span className="sm:hidden">Deps: </span>
                            {fixedByDependency}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {!queueStats ? (
              <MetricCardSkeleton 
                title="Queue Status" 
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                showSubMetrics={true}
              />
            ) : (
              <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scan Queue</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" aria-label={`${totalScansToday} total scans today`}>{totalScansToday}</div>
                  <p className="text-xs text-muted-foreground">
                    {queuedScans} queued, {activeScans} processing
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <div className="xl:col-span-1">
          <GitHubConnectionCard />
        </div>
      </div>

      {/* Recent Activity */}
      <section className="grid gap-4 sm:gap-6 lg:grid-cols-2" aria-labelledby="recent-activity-heading">
        <h2 id="recent-activity-heading" className="sr-only">Recent Security Activity</h2>
        {/* Recent Scans */}
        <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
          <CardHeader>
            <CardTitle id="recent-scans-title" className="text-lg">Recent Scans</CardTitle>
            <CardDescription>Latest security scans across your repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {!overviewAnalytics ? (
                // Show skeleton while loading
                [...Array(5)].map((_, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
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
                ))
              ) : overviewAnalytics?.recent_activity?.length ? overviewAnalytics.recent_activity.slice(0, 5).map((activity, index) => {
                const severity = activity.issues_found === 0 ? 'safe' : 
                               activity.issues_found <= 2 ? 'low' :
                               activity.issues_found <= 5 ? 'medium' : 
                               activity.issues_found <= 10 ? 'high' : 'critical'
                
                return (
                <div key={activity.scan_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 py-2 border-b border-border last:border-b-0">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate text-sm sm:text-base">{activity.repo_name}</span>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {activity.scan_type}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge 
                      variant={severity as any}
                      className="text-xs"
                      aria-label={`${activity.issues_found} ${activity.issues_found === 1 ? 'issue' : 'issues'} found with ${severity} severity`}
                    >
                      {activity.issues_found} issues
                    </Badge>
                    {activity.security_score && (
                      <span className="text-xs text-muted-foreground">
                        Score: {Math.round(activity.security_score)}
                      </span>
                    )}
                  </div>
                </div>
                )
              }) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <p className="text-sm">No recent security scans found</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => navigate('/scans')} 
                    className="mt-2 text-xs"
                    aria-label="Start your first security scan"
                  >
                    Start your first scan
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Trends */}
        <Card className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg" id="security-trends-title">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Security Trends
            </CardTitle>
            <CardDescription>Issue severity breakdown and resolution patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!securityAnalytics ? (
                // Show skeleton for security trends while loading
                <>
                  {['Critical', 'High', 'Medium', 'Low'].map((severity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Average Security Score Trend</span>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-brand-primary" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Resolution Methods (This Month)</span>
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="space-y-2">
                      {['AI Auto-fix', 'Manual Fix', 'Dependency Update'].map((method, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-2 h-2 rounded-full" />
                            <span className="text-xs">{method}</span>
                          </div>
                          <Skeleton className="h-3 w-8" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                [
                  { 
                    severity: 'Critical', 
                    count: currentPeriodIssues.critical, 
                    change: calculateTrendChange(
                      currentPeriodIssues.critical, 
                      securityTrendData.length > 1 ? securityTrendData[securityTrendData.length - 2]?.critical_count || 0 : 0
                    ), 
                    color: 'critical' 
                  },
                  { 
                    severity: 'High', 
                    count: currentPeriodIssues.high, 
                    change: calculateTrendChange(
                      currentPeriodIssues.high,
                      securityTrendData.length > 1 ? securityTrendData[securityTrendData.length - 2]?.high_count || 0 : 0
                    ), 
                    color: 'high' 
                  },
                  { 
                    severity: 'Medium', 
                    count: currentPeriodIssues.medium, 
                    change: calculateTrendChange(
                      currentPeriodIssues.medium,
                      Math.floor((securityTrendData[securityTrendData.length - 2]?.vulnerabilities || 0) * 0.3)
                    ), 
                    color: 'medium' 
                  },
                  { 
                    severity: 'Low', 
                    count: currentPeriodIssues.low, 
                    change: calculateTrendChange(
                      currentPeriodIssues.low,
                      Math.floor((securityTrendData[securityTrendData.length - 2]?.vulnerabilities || 0) * 0.4)
                    ), 
                    color: 'low' 
                  }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Badge variant={item.color as any} className="w-14 sm:w-16 justify-center text-xs">
                        {item.severity}
                      </Badge>
                      <span className="font-medium text-sm sm:text-base">{item.count} issues</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`text-sm ${
                        item.change.startsWith('+') ? 'text-security-high-500' : 
                        item.change.startsWith('-') ? 'text-security-safe-500' : 
                        'text-muted-foreground'
                      }`}>
                        {item.change}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {item.change.startsWith('+') ? 'Increasing' : 
                         item.change.startsWith('-') ? 'Decreasing' : 'Stable'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
              
              {securityTrendData.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">Average Security Score Trend</span>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-brand-primary" />
                      <span className="font-medium">{securityScore}/100</span>
                      {securityTrendData.length > 1 && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            securityTrendData[securityTrendData.length - 1].security_score >= 
                            securityTrendData[securityTrendData.length - 2].security_score ? 
                            'text-security-safe-500' : 'text-security-medium-500'
                          }`}
                        >
                          {securityTrendData[securityTrendData.length - 1].security_score >= 
                           securityTrendData[securityTrendData.length - 2].security_score ? '↗ Improving' : '↘ Declining'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Real Resolution Statistics */}
              {resolutionStats && fixedIssues > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm mb-3 gap-1">
                    <span className="text-muted-foreground">Resolution Methods (This Month)</span>
                    <span className="text-xs font-medium">{fixedIssues} total resolved</span>
                  </div>
                  <div className="space-y-2">
                    {fixedByAI > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-xs">AI Auto-fix</span>
                        </div>
                        <span className="text-xs font-medium">{fixedByAI}</span>
                      </div>
                    )}
                    {fixedManually > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-xs">Manual Fix</span>
                        </div>
                        <span className="text-xs font-medium">{fixedManually}</span>
                      </div>
                    )}
                    {fixedByDependency > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <span className="text-xs">Dependency Update</span>
                        </div>
                        <span className="text-xs font-medium">{fixedByDependency}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}