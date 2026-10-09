import { useEffect, useState, useRef } from 'react'
import { 
  X, 
  Clock, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  GitPullRequest,
  User,
  Loader2,
  Pause,
  Play,
  ExternalLink,
  RefreshCw,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTimezone } from '@/contexts/TimezoneContext'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/lib/theme'
import { formatAutofixDuration, getAutofixStatusColor } from '@/lib/api/scans'
import type { AutofixJobStatus } from '@/lib/api/scans'

interface AutofixProgressCardProps {
  job: AutofixJobStatus
  onCancel?: () => void
  onRetry?: () => void
  onClose?: () => void
  className?: string
}

export function AutofixProgressCard({
  job,
  onCancel,
  onRetry,
  onClose,
  className = ""
}: AutofixProgressCardProps) {
  const { effectiveTheme: theme } = useTheme()
  const { formatDate } = useTimezone()
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout>()
  
  // Calculate elapsed time
  useEffect(() => {
    if (!job.started_at) return
    
    const startTime = new Date(job.started_at).getTime()
    
    const updateElapsed = () => {
      const now = Date.now()
      setTimeElapsed(Math.floor((now - startTime) / 1000))
    }
    
    updateElapsed()
    
    if (job.status === 'processing') {
      intervalRef.current = setInterval(updateElapsed, 1000)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [job.started_at, job.status])

  const getStatusIcon = () => {
    switch (job.status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
      case 'cancelled':
        return <Pause className="h-4 w-4 text-slate-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-500" />
    }
  }

  // Helper functions to handle progress data
  const getProgressPercentage = (): number => {
    if (typeof job.progress === 'number') {
      return job.progress
    }
    return job.progress?.percentage || 0
  }

  const getCurrentStep = (): string | undefined => {
    if (typeof job.progress === 'object' && job.progress?.current_step) {
      return job.progress.current_step
    }
    return undefined
  }

  const getStepInfo = () => {
    if (typeof job.progress === 'object' && job.progress) {
      return {
        current: job.progress.current_step_number || 1,
        total: job.progress.total_steps || 1
      }
    }
    return { current: 1, total: 1 }
  }

  const getStatusText = () => {
    // Use the message from API if available
    if (job.message) {
      return job.message
    }
    
    // Fallback to status-based messages
    switch (job.status) {
      case 'queued':
        return 'Waiting in queue...'
      case 'processing':
        return 'Analyzing and fixing security issues...'
      case 'completed':
        return 'Security fixes completed successfully!'
      case 'failed':
        return 'Auto-fix failed'
      case 'cancelled':
        return 'Auto-fix cancelled'
      default:
        return 'Unknown status'
    }
  }

  const getProgressColor = () => {
    if (job.status === 'completed') return 'bg-green-500'
    if (job.status === 'failed') return 'bg-red-500'
    if (job.status === 'cancelled') return 'bg-slate-400'
    return 'bg-blue-500'
  }

  const canCancel = ['queued', 'processing'].includes(job.status)
  const canRetry = job.status === 'failed'
  const isCompleted = job.status === 'completed'
  const isFailed = job.status === 'failed'

  return (
    <div className="animate-in slide-in-from-top-5 fade-in-0 duration-300">
      <Card className={`${className} border-l-4 ${
        job.status === 'completed' ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' :
        job.status === 'failed' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' :
        job.status === 'processing' ? 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' :
        'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
      } shadow-lg transition-all duration-300`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg">
                {getStatusIcon()}
                <span className={`${getAutofixStatusColor(job.status, theme)}`}>
                  Auto-Fix Progress
                </span>
                {job.priority && (
                  <Badge variant="outline" className="text-xs font-medium">
                    Priority: {job.priority}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {canCancel && onCancel && (
                  <Button variant="outline" size="sm" onClick={onCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
                {canRetry && onRetry && (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                )}
                {onClose && (
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Zap className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
                <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Security Auto-Fix
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
                <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {timeElapsed > 0 ? formatAutofixDuration(timeElapsed) : 'Just started'}
                </span>
              </div>
              {job.status === 'processing' ? (
                <div className="flex items-center gap-2">
                  <Activity className={`h-4 w-4 animate-pulse ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    Processing...
                  </span>
                </div>
              ) : job.status === 'queued' ? (
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={`${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
                    In Queue
                  </span>
                </div>
              ) : job.status === 'completed' ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                    Completed
                  </span>
                </div>
              ) : null}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {getStatusText()}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {getProgressPercentage()}%
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={getProgressPercentage()} 
                  className={`h-3 ${
                    job.status === 'processing' ? 'animate-pulse' : ''
                  }`} 
                />
                {job.status === 'processing' && (
                  <div className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-full">
                    <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer-animation">
                    </div>
                  </div>
                )}
              </div>
              
              {getCurrentStep() && (
                <div className="flex items-center justify-between text-xs">
                  <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {getCurrentStep()}
                  </span>
                  <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Step {getStepInfo().current} of {getStepInfo().total}
                  </span>
                </div>
              )}
            </div>

            {/* Results Section - Enhanced */}
            {isCompleted && job.result && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-lg font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                      <CheckCircle className="h-5 w-5" />
                      🎉 Security Fixes Completed!
                    </h4>
                    <Badge variant="default" className="bg-green-600 text-white">
                      {job.result.status}
                    </Badge>
                  </div>
                  
                  {/* Success Message */}
                  {job.result?.message && (
                    <div className={`text-base font-medium ${theme === 'dark' ? 'text-green-200' : 'text-green-800'} bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border-l-4 border-green-500`}>
                      {job.result.message}
                    </div>
                  )}
                  
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-green-950/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                        Issues Addressed
                      </div>
                      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
                        {job.result?.issues_found || 0}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-green-500' : 'text-green-600'}`}>
                        security issues fixed
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-950/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                        Files Modified
                      </div>
                      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                        {job.result?.fixed_count || 0}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-blue-500' : 'text-blue-600'}`}>
                        files updated
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-purple-950/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>
                        Processing Time
                      </div>
                      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}`}>
                        {job.result?.metrics ? formatAutofixDuration(Math.round(job.result.metrics.total_time)) : 'N/A'}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-purple-500' : 'text-purple-600'}`}>
                        total time
                      </div>
                    </div>
                    
                    {job.result?.pr_url && (
                      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-amber-950/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                          Pull Request
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`w-full text-xs ${theme === 'dark' ? 'border-amber-600 text-amber-300 hover:bg-amber-900' : 'border-amber-400 text-amber-700 hover:bg-amber-100'}`}
                            onClick={() => window.open(job.result?.pr_url, '_blank')}
                          >
                            <GitPullRequest className="h-3 w-3 mr-1" />
                            View PR
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Modified Files List */}
                  {job.result?.fixed_files && job.result.fixed_files.length > 0 && (
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        📁 Modified Files ({job.result.fixed_files.length})
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                        {job.result.fixed_files.map((file, index) => (
                          <div 
                            key={index}
                            className={`text-xs px-2 py-1 rounded font-mono ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700'} border`}
                          >
                            {file}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Detailed Performance Metrics */}
                  {job.result?.metrics && (
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        ⚡ Performance Breakdown
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div className="flex justify-between">
                          <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Scan fetch:</span>
                          <span className={`font-mono ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                            {formatAutofixDuration(Math.round(job.result.metrics.fetch_time))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Fix generation:</span>
                          <span className={`font-mono ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                            {formatAutofixDuration(Math.round(job.result.metrics.fix_time))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>PR creation:</span>
                          <span className={`font-mono ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                            {formatAutofixDuration(Math.round(job.result.metrics.pr_time))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Worker Info */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <div className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Processed by: <span className="font-mono">{job.result.worker_id || 'Unknown'}</span>
                    </div>
                    <div className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Completed: {job.completed_at ? formatDate(job.completed_at, { includeTime: true, includeTimezone: false }) : 'Unknown'}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Error Section */}
            {isFailed && job.error_message && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                    <AlertTriangle className="h-4 w-4" />
                    Error Details
                  </h4>
                  <div className={`text-sm ${theme === 'dark' ? 'text-red-200' : 'text-red-800'} bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border-l-4 border-red-500`}>
                    {job.error_message}
                  </div>
                </div>
              </>
            )}

            {/* Settings Info */}
            {(job.severity_filter || job.create_pr !== undefined) && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {job.severity_filter && (
                    <div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Severity Filter:
                      </span>
                      <div className="flex gap-1 mt-1">
                        {job.severity_filter.length > 0 ? (
                          job.severity_filter.map(severity => (
                            <Badge
                              key={severity}
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {severity}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">All</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {job.create_pr !== undefined && (
                    <div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Create PR:
                      </span>
                      <Badge
                        variant={job.create_pr ? "default" : "secondary"}
                        className="ml-2 text-xs"
                      >
                        {job.create_pr ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
    </div>
  )
}

export default AutofixProgressCard