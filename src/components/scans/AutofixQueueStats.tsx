import { useState, useEffect } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Zap,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useTimezone } from '@/contexts/TimezoneContext'
import { useTheme } from '@/lib/theme'
import { formatAutofixDuration } from '@/lib/api/scans'
import type { AutofixQueueStats } from '@/lib/api/scans'

interface AutofixQueueStatsProps {
  stats: AutofixQueueStats
  onRefresh?: () => void
  isLoading?: boolean
  className?: string
  initialExpanded?: boolean
}

export function AutofixQueueStats({
  stats,
  onRefresh,
  isLoading = false,
  className = "",
  initialExpanded = false
}: AutofixQueueStatsProps) {
  const { effectiveTheme: theme } = useTheme()
  const { formatDate, formatTimeOnly } = useTimezone()
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return theme === 'dark' ? 'text-green-400' : 'text-green-600'
      case 'degraded':
        return theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
      case 'critical':
        return theme === 'dark' ? 'text-red-400' : 'text-red-600'
      default:
        return theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
      default:
        return <Activity className="h-4 w-4 text-slate-500" />
    }
  }

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'default'
      case 'degraded':
        return 'secondary' 
      case 'critical':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const queueUtilization = (stats.queue_stats.queued + stats.queue_stats.processing) > 0 
    ? Math.round(((stats.queue_stats.queued + stats.queue_stats.processing) / Math.max(stats.queue_stats.queued + stats.queue_stats.processing + stats.queue_stats.completed_today, 10)) * 100)
    : 0

  // Derive queue health from current stats
  const getQueueHealth = (): 'healthy' | 'degraded' | 'critical' => {
    const totalJobs = stats.queue_stats.queued + stats.queue_stats.processing + stats.queue_stats.completed_today
    const failedRate = totalJobs > 0 ? (stats.queue_stats.failed / totalJobs) * 100 : 0
    
    if (failedRate > 20) return 'critical'
    if (failedRate > 10 || stats.queue_stats.queued > 5) return 'degraded'
    return 'healthy'
  }

  const queueHealth = getQueueHealth()

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className={`${className} transition-all duration-300 ${
        isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'
      }`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <Zap className={`h-4 w-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <span>Auto-Fix Queue</span>
                <Badge 
                  variant={getHealthBadgeVariant(queueHealth)}
                  className="text-xs"
                >
                  {getHealthIcon(queueHealth)}
                  <span className="ml-1 capitalize">{queueHealth}</span>
                </Badge>
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {!isExpanded && (
                  <div className="flex items-center gap-3 text-sm">
                    {stats.queue_stats.queued > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          {stats.queue_stats.queued} queued
                        </span>
                      </div>
                    )}
                    {stats.queue_stats.processing > 0 && (
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-blue-500 dark:text-blue-400 animate-pulse" />
                        <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          {stats.queue_stats.processing} active
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  {onRefresh && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRefresh()
                      }}
                      disabled={isLoading}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="animate-in slide-in-from-top-2 fade-in-0 duration-300">
            <CardContent className="pt-0 space-y-4">
                {/* Queue Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`text-center p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {stats.queue_stats.queued}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Queued
                    </div>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                    <div className="flex items-center justify-center mb-2">
                      <Activity className="h-5 w-5 text-blue-500 dark:text-blue-400 animate-pulse" />
                    </div>
                    <div className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {stats.queue_stats.processing}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Processing
                    </div>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                    </div>
                    <div className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {stats.queue_stats.completed_today}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Completed Today
                    </div>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {stats.queue_stats.failed}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Failed
                    </div>
                  </div>
                </div>

                {/* Queue Utilization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      Queue Utilization
                    </span>
                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {queueUtilization}%
                    </span>
                  </div>
                  <Progress value={queueUtilization} className="h-2" />
                </div>

                {/* Timestamp Info */}
                <div className={`p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border-slate-700' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className={`h-4 w-4 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Last Updated
                    </span>
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    {formatDate(stats.timestamp, { includeTime: true, includeTimezone: false })}
                  </div>
                </div>

                {/* Status Summary */}
                {(stats.queue_stats.failed > 0 || queueHealth !== 'healthy') && (
                  <div className={`p-3 rounded-lg border-l-4 ${
                    queueHealth === 'critical'
                      ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                  }`}>
                    <div className="flex items-start gap-2">
                      {queueHealth === 'critical' ? (
                        <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${
                          queueHealth === 'critical'
                            ? theme === 'dark' ? 'text-red-300' : 'text-red-700'
                            : theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
                        }`}>
                          Queue Health: {queueHealth}
                        </div>
                        {stats.queue_stats.failed > 0 && (
                          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                            {stats.queue_stats.failed} jobs failed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Last updated: {formatTimeOnly(new Date().toISOString())}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Queue Stats
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default AutofixQueueStats