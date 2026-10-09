import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Shield,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  Info,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { scansAPI } from '@/lib/api/scans'
import { useToast } from '@/components/ui/use-toast'

interface SecurityTrendsChartProps {
  repositoryFullName: string
  className?: string
}

export function SecurityTrendsChart({ repositoryFullName, className }: SecurityTrendsChartProps) {
  const { toast } = useToast()
  const [trends, setTrends] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)
  const [branch, setBranch] = useState('all')  // Changed from 'main' to 'all' to include PR scans

  useEffect(() => {
    fetchTrends()
  }, [repositoryFullName, timeRange, branch])

  const fetchTrends = async () => {
    setIsLoading(true)
    
    try {
      const data = await scansAPI.getRepositorySecurityTrends(
        repositoryFullName,
        timeRange,
        branch
      )
      setTrends(data)
    } catch (error) {
      console.error('Failed to fetch security trends:', error)
      toast({
        variant: 'destructive',
        title: 'Failed to load trends',
        description: 'Unable to fetch security trend data'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSecurityStatus = (trends: any) => {
    const { trend_summary, top_issues } = trends || {}
    
    // Determine overall security health
    const criticalIssues = top_issues?.filter((issue: any) => issue.severity === 'critical').length || 0
    const highIssues = top_issues?.filter((issue: any) => issue.severity === 'high').length || 0
    const totalScans = trend_summary?.total_scans || 0
    
    if (totalScans === 0) {
      return {
        status: 'no-data',
        icon: Info,
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-50 dark:bg-slate-800/50',
        message: 'No security scans performed yet',
        description: 'Run your first security scan to see insights'
      }
    }
    
    if (criticalIssues > 0) {
      return {
        status: 'critical',
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        message: 'Critical security issues found',
        description: `${criticalIssues + highIssues} high-priority issues need attention`
      }
    }
    
    if (highIssues > 0) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        message: 'Some security issues detected',
        description: `${highIssues} issues should be reviewed`
      }
    }
    
    return {
      status: 'good',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      message: 'Security looks good',
      description: 'No critical issues found in recent scans'
    }
  }

  const formatIssueCount = (count: number) => {
    if (count < 10) return count.toString()
    if (count < 100) return count.toString()
    if (count < 1000) return count.toString()
    return `${Math.floor(count / 100) / 10}k`
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
              ))}
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!trends) {
    return null
  }

  const { trend_summary, top_issues } = trends
  const securityStatus = getSecurityStatus(trends)
  const StatusIcon = securityStatus.icon

  // Calculate PR scans with fallback logic
  const prScanCount = trend_summary?.total_pr_scans ?? trend_summary?.unique_prs_scanned ?? 0

  return (
    <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md ${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          Repository Security
        </CardTitle>
        <CardDescription>
          Security overview and recent findings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Security Status */}
        <Alert className={`${securityStatus.bgColor} border-current`}>
          <StatusIcon className={`h-4 w-4 ${securityStatus.color}`} />
          <AlertDescription className="flex flex-col gap-1">
            <div className={`font-medium ${securityStatus.color}`}>
              {securityStatus.message}
            </div>
            <div className="text-sm text-muted-foreground">
              {securityStatus.description}
            </div>
          </AlertDescription>
        </Alert>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{trend_summary?.total_scans || 0}</div>
            <div className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">Total Scans</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {prScanCount}
            </div>
            <div className="text-xs text-green-600/70 dark:text-green-400/70 font-medium">PR Scans</div>
          </div>
        </div>

        {/* Top Issues - Simplified */}
        {top_issues && top_issues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Issues Found</h4>
            <div className="space-y-2">
              {top_issues.slice(0, 3).map((issue: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/30 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        issue.severity === 'critical' ? 'destructive' :
                        issue.severity === 'high' ? 'destructive' :
                        issue.severity === 'medium' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {issue.severity}
                    </Badge>
                    <span className="text-sm capitalize font-medium">{issue.category}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatIssueCount(issue.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {trend_summary?.total_scans > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last updated: {timeRange} days ago
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}