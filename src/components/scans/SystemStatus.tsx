import React from 'react'
import { CheckCircle, Clock, Activity, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatScanDuration } from '@/lib/utils'
import type { QueueStats } from '@/lib/api/scans'

interface SystemStatusProps {
  queueStats: QueueStats | null
  activeScanJobs: Record<string, any>
  className?: string
}

export function SystemStatus({ queueStats, activeScanJobs, className = "" }: SystemStatusProps) {
  // Don't render anything if no data
  if (!queueStats) {
    return null
  }

  const activeScansCount = Object.keys(activeScanJobs).length
  const isProcessing = queueStats.processing > 0 || activeScansCount > 0
  const hasQueue = queueStats.queued > 0
  const avgTime = formatScanDuration(queueStats.average_scan_time)

  // Determine system status message
  const getStatusMessage = () => {
    if (isProcessing && hasQueue) {
      const totalActive = queueStats.processing + activeScansCount
      return {
        icon: <Activity className="h-4 w-4 text-blue-600 animate-pulse" />,
        text: `${totalActive} scan${totalActive > 1 ? 's' : ''} running • ${queueStats.queued} in queue`,
        variant: "secondary" as const,
        className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
      }
    }

    if (isProcessing) {
      const totalActive = queueStats.processing + activeScansCount
      return {
        icon: <Activity className="h-4 w-4 text-blue-600 animate-pulse" />,
        text: `${totalActive} scan${totalActive > 1 ? 's' : ''} running • Avg: ${avgTime}`,
        variant: "secondary" as const,
        className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
      }
    }

    if (hasQueue) {
      return {
        icon: <Clock className="h-4 w-4 text-amber-600" />,
        text: `${queueStats.queued} scan${queueStats.queued > 1 ? 's' : ''} queued • Starting soon`,
        variant: "secondary" as const,
        className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
      }
    }

    // Failed count is already shown in tooltip - don't make it the primary status
    // when there's no active processing or queue activity

    // All systems ready
    return {
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      text: `All systems ready • Avg scan time: ${avgTime}`,
      variant: "secondary" as const,
      className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
    }
  }

  const status = getStatusMessage()

  // Create tooltip content with technical details
  const getTooltipContent = () => {
    const details = []
    if (queueStats.processing > 0) details.push(`${queueStats.processing} processing`)
    if (activeScansCount > 0) details.push(`${activeScansCount} active scans`)
    if (queueStats.queued > 0) details.push(`${queueStats.queued} queued`)
    if (queueStats.total_scans_today > 0) details.push(`${queueStats.total_scans_today} completed today`)
    if (queueStats.failed > 0) details.push(`${queueStats.failed} failed`)

    // Always show average time
    details.push(`Average time: ${avgTime}`)

    return details.length > 0 ? details.join(' • ') : 'System ready • No active scans'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Badge
        variant={status.variant}
        className={`flex items-center gap-2 px-3 py-1 text-sm font-medium border transition-all hover:shadow-sm cursor-help ${status.className}`}
        title={`Running: ${queueStats.processing} | Active: ${activeScansCount} | Queue: ${queueStats.queued} | Failed: ${queueStats.failed} | Today: ${queueStats.total_scans_today} | Avg: ${avgTime}`}
      >
        {status.icon}
        <span className="hidden sm:inline">{status.text}</span>
        <span className="sm:hidden">
          {isProcessing ? `${queueStats.processing + activeScansCount} running` :
           hasQueue ? `${queueStats.queued} queued` : 'Ready'}
        </span>
      </Badge>
    </div>
  )
}

export default SystemStatus