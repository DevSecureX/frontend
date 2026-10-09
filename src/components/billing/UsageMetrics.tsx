import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  GitBranch, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuthStore, useScanStore, useRepositoryStore } from '@/store'

interface UsageData {
  repositories: {
    used: number
    limit: number
  }
  scans: {
    used: number
    limit: number
    thisMonth: number
  }
  storage: {
    used: number
    limit: number
    unit: string
  }
  apiCalls: {
    used: number
    limit: number
    thisMonth: number
  }
}

export function UsageMetrics() {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const { user: _user, isPremium } = useAuthStore()
  const { scans } = useScanStore()
  const { repositories } = useRepositoryStore()

  useEffect(() => {
    // Simulate fetching usage data - in real app this would come from API
    const mockUsageData: UsageData = {
      repositories: {
        used: repositories.length,
        limit: isPremium() ? -1 : 3 // -1 means unlimited
      },
      scans: {
        used: scans.length,
        limit: isPremium() ? -1 : 50,
        thisMonth: scans.filter(scan => {
          const scanDate = new Date(scan.created_at)
          const now = new Date()
          return scanDate.getMonth() === now.getMonth() && 
                 scanDate.getFullYear() === now.getFullYear()
        }).length
      },
      storage: {
        used: 2.3,
        limit: isPremium() ? 100 : 5,
        unit: 'GB'
      },
      apiCalls: {
        used: 1250,
        limit: isPremium() ? 10000 : 1000,
        thisMonth: 890
      }
    }

    setUsageData(mockUsageData)
  }, [repositories, scans, isPremium])

  if (!usageData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-2 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageStatus = (used: number, limit: number) => {
    if (limit === -1) return 'unlimited'
    const percentage = (used / limit) * 100
    if (percentage >= 90) return 'critical'
    if (percentage >= 75) return 'warning'
    return 'normal'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'unlimited':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return AlertTriangle
      case 'warning':
        return Clock
      case 'unlimited':
        return CheckCircle
      default:
        return Activity
    }
  }

  const metrics = [
    {
      title: 'Repositories',
      icon: GitBranch,
      used: usageData.repositories.used,
      limit: usageData.repositories.limit,
      description: 'Connected repositories',
      status: getUsageStatus(usageData.repositories.used, usageData.repositories.limit)
    },
    {
      title: 'Security Scans',
      icon: Shield,
      used: usageData.scans.thisMonth,
      limit: usageData.scans.limit,
      description: 'Scans this month',
      status: getUsageStatus(usageData.scans.thisMonth, usageData.scans.limit)
    },
    {
      title: 'Storage',
      icon: BarChart3,
      used: usageData.storage.used,
      limit: usageData.storage.limit,
      description: `Data storage (${usageData.storage.unit})`,
      status: getUsageStatus(usageData.storage.used, usageData.storage.limit)
    },
    {
      title: 'API Calls',
      icon: TrendingUp,
      used: usageData.apiCalls.thisMonth,
      limit: usageData.apiCalls.limit,
      description: 'API requests this month',
      status: getUsageStatus(usageData.apiCalls.thisMonth, usageData.apiCalls.limit)
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Usage Overview</h3>
        <p className="text-muted-foreground text-sm">
          Monitor your current usage and plan limits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const StatusIcon = getStatusIcon(metric.status)
          const percentage = getUsagePercentage(metric.used, metric.limit)
          const statusColor = getStatusColor(metric.status)

          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">
                    {metric.used.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                    {metric.limit === -1 ? (
                      <Badge variant="outline" className="text-xs">
                        Unlimited
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        / {metric.limit.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {metric.limit !== -1 && (
                  <div className="space-y-1">
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${
                        metric.status === 'critical' ? '[&>div]:bg-red-500' :
                        metric.status === 'warning' ? '[&>div]:bg-yellow-500' :
                        '[&>div]:bg-blue-500'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{metric.description}</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                  </div>
                )}
                
                {metric.limit === -1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Usage Warnings */}
      {metrics.some(m => m.status === 'critical' || m.status === 'warning') && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Usage Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics
              .filter(m => m.status === 'critical' || m.status === 'warning')
              .map(metric => (
                <div key={metric.title} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                      {metric.title} {metric.status === 'critical' ? 'limit exceeded' : 'nearing limit'}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {metric.used.toLocaleString()} / {metric.limit.toLocaleString()} used
                      ({Math.round(getUsagePercentage(metric.used, metric.limit))}%)
                    </p>
                  </div>
                  {metric.status === 'critical' && !isPremium() && (
                    <Badge variant="destructive" className="text-xs">
                      Upgrade needed
                    </Badge>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Historical Usage Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Trends</CardTitle>
          <CardDescription>
            Usage over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Usage charts will be displayed here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Detailed analytics available in Premium plan
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {!isPremium() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-950/30">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Upgrade to Premium</h4>
                <p className="text-xs text-muted-foreground">
                  Get unlimited repositories, scans, and advanced features to scale your security operations.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-green-100 dark:bg-green-950/30">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Optimize Usage</h4>
                <p className="text-xs text-muted-foreground">
                  Schedule scans during off-peak hours and use incremental scanning to maximize your plan limits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}