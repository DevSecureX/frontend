import { useEffect, useState } from 'react'
import { useTimezone } from '@/contexts/TimezoneContext'
import { Clock, CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { JobStatus } from '@/lib/api/scans'

interface EnhancedScanProgressCardProps {
  job: JobStatus
  onViewResults?: (scanId: string) => void
  onRetry?: (jobId: string) => void
  compact?: boolean
}

// Timeout information for user education
const OPERATION_INFO = {
  'manual': {
    expectedDuration: '2-5 minutes',
    description: 'Comprehensive security scan',
    stages: ['Queued', 'Code Analysis', 'Dependency Check', 'Secrets Detection', 'Report Generation']
  },
  'pr': {
    expectedDuration: '1-3 minutes', 
    description: 'Pull request security scan',
    stages: ['Queued', 'Diff Analysis', 'Changed Files Scan', 'Security Review', 'Complete']
  },
  'bulk-pr': {
    expectedDuration: '5-15 minutes',
    description: 'Bulk pull request scanning',
    stages: ['Queued', 'PR Discovery', 'Batch Processing', 'Individual Scans', 'Consolidation']
  }
} as const

function getOperationType(scanType: string): keyof typeof OPERATION_INFO {
  if (scanType.includes('pr')) return 'pr'
  if (scanType.includes('bulk')) return 'bulk-pr'
  return 'manual'
}

function getProgressPercentage(status: string, progress: string): number {
  const progressLower = progress.toLowerCase()
  
  switch (status) {
    case 'queued':
      return 10
    case 'processing':
      // Try to extract percentage from progress string
      const percentMatch = progress.match(/(\d+)%/)
      if (percentMatch) {
        return parseInt(percentMatch[1])
      }
      
      // Estimate based on stage
      if (progressLower.includes('starting') || progressLower.includes('initializing')) return 20
      if (progressLower.includes('scanning') || progressLower.includes('analyzing')) return 50
      if (progressLower.includes('generating') || progressLower.includes('finalizing')) return 80
      if (progressLower.includes('complete') || progressLower.includes('finishing')) return 95
      
      return 60 // Default for processing
    case 'completed':
      return 100
    case 'failed':
      return 0
    default:
      return 0
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'queued':
      return 'bg-blue-500'
    case 'processing':
      return 'bg-orange-500'
    case 'completed':
      return 'bg-green-500'
    case 'failed':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'queued':
      return Clock
    case 'processing':
      return Loader2
    case 'completed':
      return CheckCircle
    case 'failed':
      return XCircle
    default:
      return AlertTriangle
  }
}

export function EnhancedScanProgressCard({ 
  job, 
  onViewResults, 
  onRetry, 
  compact = false 
}: EnhancedScanProgressCardProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const { formatDate } = useTimezone()
  
  const operationType = getOperationType(job.scan_type)
  const operationInfo = OPERATION_INFO[operationType]
  const progress = getProgressPercentage(job.status, job.progress || '')
  const StatusIcon = getStatusIcon(job.status)
  const statusColor = getStatusColor(job.status)
  
  // Calculate elapsed time
  useEffect(() => {
    const startTime = new Date(job.created_at).getTime()
    const updateElapsed = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      setElapsedTime(elapsed)
    }
    
    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [job.created_at])
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  const getTimeColor = (): string => {
    if (job.status === 'completed') return 'text-green-600'
    if (elapsedTime > 300) return 'text-orange-600' // 5+ minutes
    if (elapsedTime > 600) return 'text-red-600' // 10+ minutes
    return 'text-muted-foreground'
  }
  
  if (compact) {
    return (
      <div>
        <Card className="border-l-4" style={{ borderLeftColor: statusColor.replace('bg-', '#') }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-full ${statusColor}`}>
                  <StatusIcon 
                    className={`h-4 w-4 text-white ${job.status === 'processing' ? 'animate-spin' : ''}`} 
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {job.repo_full_name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className={getTimeColor()}>{formatTime(elapsedTime)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground truncate">
                  {job.progress || `${job.status} - ${operationInfo.description}`}
                </p>
                
                {job.status === 'processing' && (
                  <div className="mt-2">
                    <Progress value={progress} className="h-1" />
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0 flex items-center gap-1">
                {job.status === 'completed' && job.scan_id && onViewResults && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewResults(job.scan_id!)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
                
                {job.status === 'failed' && onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRetry(job.job_id)}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div>
      <Card className="border-l-4" style={{ borderLeftColor: statusColor.replace('bg-', '#') }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${statusColor}`}>
                <StatusIcon 
                  className={`h-5 w-5 text-white ${job.status === 'processing' ? 'animate-spin' : ''}`} 
                />
              </div>
              
              <div>
                <CardTitle className="text-base">{job.repo_full_name}</CardTitle>
                <CardDescription>
                  {operationInfo.description} • Expected: {operationInfo.expectedDuration}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getTimeColor()}>
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(elapsedTime)}
              </Badge>
              
              <Badge 
                variant={job.status === 'completed' ? 'default' : 'secondary'}
                className={job.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
              >
                {job.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          {(job.status === 'processing' || job.status === 'queued') && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {job.progress || 'Processing...'}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {/* Current Stage */}
          {job.stage && (
            <div className="text-sm">
              <span className="text-muted-foreground">Stage: </span>
              <span className="font-medium">{job.stage}</span>
            </div>
          )}
          
          {/* Tools Progress */}
          {job.current_tool && (
            <div className="text-sm">
              <span className="text-muted-foreground">Current tool: </span>
              <span className="font-medium">{job.current_tool}</span>
              {job.tools_completed && job.total_tools && (
                <span className="text-muted-foreground ml-2">
                  ({job.tools_completed}/{job.total_tools} tools completed)
                </span>
              )}
            </div>
          )}
          
          {/* Error Message */}
          {job.status === 'failed' && job.error_message && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Scan Failed</p>
                  <p className="text-xs text-red-600 mt-1">{job.error_message}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Timeout Warning */}
          {job.status === 'processing' && elapsedTime > 300 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Long-running Operation</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    This operation is taking longer than expected but is still processing. 
                    {operationType === 'bulk-pr' && ' Bulk operations can take up to 15 minutes.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            
            <div className="flex gap-2">
              {job.status === 'completed' && job.scan_id && onViewResults && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewResults(job.scan_id!)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Results
                </Button>
              )}
              
              {job.status === 'failed' && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(job.job_id)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </div>
          
          {/* Extended Details */}
          {showDetails && (
            <div>
              <Separator />
              <div className="pt-3 space-y-2 text-xs text-muted-foreground">
                <div><span className="font-medium">Job ID:</span> {job.job_id}</div>
                <div><span className="font-medium">Scan Type:</span> {job.scan_type}</div>
                <div><span className="font-medium">Started:</span> {formatDate(job.created_at, { includeTime: true })}</div>
                {job.scan_id && (
                  <div><span className="font-medium">Scan ID:</span> {job.scan_id}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}