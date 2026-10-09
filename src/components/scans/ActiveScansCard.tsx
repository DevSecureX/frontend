import { Clock, Loader2, X, Shield, Code, Lock, Cpu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimezone } from '@/contexts/TimezoneContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useScanStore } from '@/store'
import { ScanStatusBadge } from './ScanStatusBadge'
import { SecurityLoaders } from '@/components/ui/security-loaders'
import type { JobStatus } from '@/types/global'

interface ActiveScansCardProps {
  activeScanJobs: Record<string, JobStatus>
}

// Simple static icon component for scan items
function SimpleScanIcon({ job, size = 'md' }: { job: JobStatus; size?: 'sm' | 'md' | 'lg' }) {
  const { status, current_tool, stage, progress } = job

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // If queued, show clock
  if (status === 'queued') {
    return <Clock className={`${sizeClasses[size]} text-amber-600`} />
  }

  // If failed, show X
  if (status === 'failed') {
    return <X className={`${sizeClasses[size]} text-red-600`} />
  }

  // If completed, show shield
  if (status === 'completed') {
    return <Shield className={`${sizeClasses[size]} text-green-600`} />
  }

  // For processing, show simple spinner or tool-specific icon
  if (status === 'processing') {
    // Show tool-specific static icons if we know the current tool
    if (current_tool) {
      const tool = current_tool.toLowerCase()
      if (tool.includes('sast') || tool.includes('semgrep') || tool.includes('codeql')) {
        return <Code className={`${sizeClasses[size]} text-green-600`} />
      }
      if (tool.includes('secret') || tool.includes('trufflehog') || tool.includes('gitleaks')) {
        return <Lock className={`${sizeClasses[size]} text-red-600`} />
      }
      if (tool.includes('dependency') || tool.includes('safety') || tool.includes('bandit')) {
        return <Cpu className={`${sizeClasses[size]} text-orange-600`} />
      }
    }

    // Default processing icon - simple spinner
    return <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
  }

  // Fallback
  return <Search className={`${sizeClasses[size]} text-gray-600`} />
}

export function ActiveScansCard({ activeScanJobs }: ActiveScansCardProps) {
  const { cancelScanJob } = useScanStore()
  const { formatTimeOnly } = useTimezone()

  const getProgressValue = (job: JobStatus) => {
    const { status, progress, tools_completed, total_tools } = job
    
    switch (status) {
      case 'queued':
        return 0
      case 'processing':
        // Use tool progress if available
        if (tools_completed && total_tools && total_tools > 0) {
          return Math.round((tools_completed / total_tools) * 100)
        }
        
        // Try to parse progress percentage from progress string
        const match = progress.match(/(\d+)%/)
        if (match) {
          return parseInt(match[1])
        }
        
        // Default processing progress
        return 50
        
      case 'completed':
        return 100
      case 'failed':
        return 0
      default:
        return 0
    }
  }

  const getScanTypeDisplay = (scanType: string, progress?: string) => {
    // Backend now always runs comprehensive scans with ALL security tools
    // Display appropriate type without mode/scope since all are comprehensive
    if (scanType === 'manual') {
      return {
        mode: 'Complete Security Analysis',
        scope: 'All Security Tools'
      }
    }
    
    if (scanType === 'pr_scan') {
      return {
        mode: 'Complete PR Analysis',
        scope: 'All Security Tools'
      }
    }
    
    if (scanType === 'push_scan') {
      return {
        mode: 'Complete Push Analysis',
        scope: 'All Security Tools'
      }
    }
    
    if (scanType === 'scheduled') {
      return {
        mode: 'Complete Scheduled Analysis',
        scope: 'All Security Tools'
      }
    }
    
    // Handle any legacy scan type formats - all are now comprehensive
    if (scanType.includes('-')) {
      const parts = scanType.split('-')
      
      if (parts[0] === 'pr' || parts[0] === 'bulk') {
        const type = parts[0] === 'bulk' ? 'Complete Bulk PR Analysis' : 'Complete PR Analysis'
        return {
          mode: type,
          scope: 'All Security Tools'
        }
      }
      
      // All other formats are now comprehensive
      return {
        mode: 'Complete Security Analysis',
        scope: 'All Security Tools'
      }
    }
    
    // Fallback - all scans are comprehensive now
    return {
      mode: 'Complete Security Analysis',
      scope: 'All Security Tools'
    }
  }
  
  // Legacy function - no longer needed as all scans are comprehensive
  const formatScope = (scope: string) => {
    // All scans now use all security tools
    return 'All Security Tools'
  }


  const getProgressText = (job: JobStatus) => {
    const { status, progress, stage, current_tool, tools_completed, total_tools } = job

    switch (status) {
      case 'queued':
        return stage || 'Waiting in queue...'

      case 'processing':
        // Show current tool if available
        if (current_tool) {
          const toolProgress = tools_completed && total_tools
            ? ` (${tools_completed}/${total_tools})`
            : ''
          return `Running ${current_tool}${toolProgress}`
        }

        // Show stage if available
        if (stage) {
          return stage
        }

        // Parse progress for specific information
        if (progress.includes('%')) {
          return progress.replace(/%/g, '% complete')
        }

        if (progress.toLowerCase().includes('scanning')) {
          return progress
        }
        if (progress.toLowerCase().includes('analyzing')) {
          return progress
        }
        if (progress.toLowerCase().includes('running')) {
          return progress
        }
        if (progress.toLowerCase().includes('cloning')) {
          return 'Cloning repository...'
        }
        if (progress.toLowerCase().includes('preparing')) {
          return 'Preparing scan...'
        }

        return 'Processing scan...'

      case 'completed':
        return 'Scan completed successfully'

      case 'failed':
        return job.error_message || 'Scan failed'

      default:
        return progress || 'Initializing scan...'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-2">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <SecurityLoaders.advanced size="sm" className="text-blue-600" />
          Active Scans ({Object.keys(activeScanJobs).length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-2">
        {Object.entries(activeScanJobs).map(([jobId, job]) => {
          const progressValue = getProgressValue(job)
          const scanType = getScanTypeDisplay(job.scan_type)

          return (
            <div
              key={jobId}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-2 bg-muted/30 rounded border"
            >
              {/* Mobile & Desktop: Icon and Repository Info */}
              <div className="flex items-center gap-2 min-w-0 sm:w-[35%] flex-1 sm:flex-initial">
                <SimpleScanIcon job={job} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">
                      {job.repo_full_name.split('/')[1]}
                    </p>
                    <ScanStatusBadge status={job.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {job.repo_full_name.split('/')[0]} • {formatTimeOnly(job.created_at)}
                  </p>
                </div>

                {/* Cancel Button - Mobile (top right) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cancelScanJob(jobId)}
                  className="h-8 w-8 sm:hidden p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile & Desktop: Progress Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:w-[65%] min-w-0">
                {/* Scan Type Badge - Hidden on mobile, shown on small screens+ */}
                <div className="hidden sm:flex items-center gap-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    {scanType.mode.replace('Complete ', '').replace(' Analysis', '')}
                  </Badge>
                </div>

                {/* Progress Text and Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* Progress Text */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {getProgressText(job)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {progressValue}%
                    </span>
                  </div>

                  {/* Progress Bar - Full width on mobile, flex-1 on desktop */}
                  <div className="w-full sm:flex-1">
                    <Progress value={progressValue} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Cancel Button - Desktop only (hidden on mobile) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cancelScanJob(jobId)}
                className="hidden sm:flex h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )
        })}

        <div className="text-xs text-muted-foreground text-center pt-2 sm:pt-1 px-2">
          Scans will automatically refresh when completed
        </div>
      </CardContent>
    </Card>
  )
}