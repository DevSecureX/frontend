import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTimezone } from '@/contexts/TimezoneContext'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Activity, 
  Clock, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Zap,
  Eye,
  CheckCircle2
} from 'lucide-react'
import type { RealTimeMetrics as RealTimeMetricsType } from '@/lib/api/analytics'

interface RealTimeMetricsProps {
  data?: RealTimeMetricsType
  isLoading?: boolean
}

export function RealTimeMetrics({ data, isLoading }: RealTimeMetricsProps) {
  const { formatDate } = useTimezone()
  if (isLoading || !data) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            Real-Time Activity
          </CardTitle>
          <CardDescription>
            Live security monitoring and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="space-y-1">
                      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const healthStatusColor = {
    healthy: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    critical: 'text-red-600 dark:text-red-400'
  }

  const healthStatusBg = {
    healthy: 'bg-green-50 dark:bg-green-900/30',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30',
    critical: 'bg-red-50 dark:bg-red-900/30'
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          Real-Time Activity
          <Badge variant="outline" className="ml-auto text-xs">
            Live
          </Badge>
        </CardTitle>
        <CardDescription>
          Live security monitoring and alerts • Updated {formatDate(data.last_updated, { includeTime: true, includeTimezone: false, dateFormat: '' }).replace(/^,\s*/, '')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* System Health */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${healthStatusBg[data.system_health]}`}>
                <Shield className={`h-5 w-5 ${healthStatusColor[data.system_health]}`} />
              </div>
              <div>
                <span className="font-medium">System Health</span>
                <p className="text-xs text-muted-foreground">Overall platform status</p>
              </div>
            </div>
            <Badge 
              variant={data.system_health === 'healthy' ? 'default' : 
                      data.system_health === 'warning' ? 'secondary' : 'destructive'}
              className="capitalize"
            >
              {data.system_health}
            </Badge>
          </div>

          {/* Active Scans */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-help">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="font-medium">Active Scans</span>
                      <p className="text-xs text-muted-foreground">Currently running</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{data.active_scans}</div>
                    <div className="text-xs text-muted-foreground">+{data.queued_scans} queued</div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{data.active_scans} scans currently processing</p>
                <p>{data.queued_scans} scans waiting in queue</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Recent Issues */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <span className="font-medium">Recent Issues</span>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{data.recent_issues}</div>
              <div className="text-xs text-muted-foreground">new findings</div>
            </div>
          </div>

          {/* Security Score */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <span className="font-medium">Avg Security Score</span>
                <p className="text-xs text-muted-foreground">Across all repositories</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{Math.round(data.security_score_avg)}</div>
              <div className="text-xs text-muted-foreground">out of 100</div>
            </div>
          </div>

          {/* Alerts */}
          {data.alert_count > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <Eye className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <span className="font-medium text-red-900 dark:text-red-200">Active Alerts</span>
                  <p className="text-xs text-red-700 dark:text-red-300">Require attention</p>
                </div>
              </div>
              <Badge variant="destructive" className="text-sm font-bold">
                {data.alert_count}
              </Badge>
            </div>
          )}

          {data.alert_count === 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span className="font-medium text-green-900 dark:text-green-200">All Clear</span>
                  <p className="text-xs text-green-700 dark:text-green-300">No active alerts</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-600">
                ✓
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}