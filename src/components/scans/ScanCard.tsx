import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimezone } from '@/contexts/TimezoneContext'
import { 
  Shield, 
  Clock, 
  Eye, 
  Trash2, 
  MoreVertical,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
  Target,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { ScanStatusBadge } from './ScanStatusBadge'
import { useScanStore } from '@/store'
import { scansAPI } from '@/lib/api/scans'
import { toast } from 'sonner'
import type { Scan } from '@/types/global'

interface ScanCardProps {
  scan: Scan
  onDeleted?: () => void
}

export function ScanCard({ scan, onDeleted }: ScanCardProps) {
  const { formatDate } = useTimezone()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const navigate = useNavigate()
  const { deleteScan } = useScanStore()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteScan(scan.scan_id)
      onDeleted?.()
      toast.success('Scan deleted successfully')
    } catch (error) {
      console.error('Failed to delete scan:', error)
      toast.error('Failed to delete scan')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      toast.loading('Generating scan report...', { id: 'export-scan' })
      
      const blob = await scansAPI.exportScanReport(scan.scan_id)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `DevSecureX-${(scan.repo_full_name || 'unknown-repo').replace('/', '-')}-${scan.branch}-${scan.scan_id.slice(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Report exported successfully!', { id: 'export-scan' })
    } catch (error) {
      console.error('Failed to export scan report:', error)
      toast.error('Failed to export report. Please try again.', { id: 'export-scan' })
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500'
      case 'processing':
        return 'bg-blue-500 animate-pulse'
      case 'queued':
        return 'bg-yellow-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
    if (score >= 60) return <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
    if (score >= 40) return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
    return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
  }

  const getSeverityColor = (severity: string, count: number) => {
    if (count === 0) return 'text-muted-foreground'
    
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 font-semibold'
      case 'high':
        return 'text-orange-600 dark:text-orange-400 font-semibold'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 font-medium'
      case 'low':
        return 'text-blue-600 dark:text-blue-400'
      case 'info':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-muted-foreground'
    }
  }

  // Calculate issue summary from the issues array
  const issueSummary = scan.issues.reduce((summary, issue) => {
    summary[issue.severity] = (summary[issue.severity] || 0) + 1
    return summary
  }, {} as Record<string, number>)

  const totalIssues = scan.issues.length
  const criticalIssues = issueSummary.critical || 0
  const highIssues = issueSummary.high || 0
  const hasHighPriorityIssues = criticalIssues > 0 || highIssues > 0

  return (
    <Card 
      className="group relative transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer focus-within:shadow-lg focus-within:shadow-blue-500/20 dark:focus-within:shadow-blue-400/20 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      role="article"
      aria-label={`Scan for ${scan.repo_full_name || 'unknown'} repository`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/scans/${scan.scan_id}`)
        }
      }}
      onClick={() => navigate(`/scans/${scan.scan_id}`)}
    >
      {/* Status Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${getStatusColor(scan.status)}`} />
      
      <CardHeader className="pb-3 pt-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Repository Name & Branch */}
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-gray-100 dark:bg-gray-700">
                <Shield className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold truncate text-gray-900 dark:text-white">
                  {scan.repo_full_name?.split('/')[1] || 'Unknown Repository'}
                </CardTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {scan.repo_full_name?.split('/')[0] || 'Unknown'}
                  </span>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    {scan.branch}
                  </code>
                </div>
              </div>
            </div>
            
            {/* Status & Metadata */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <ScanStatusBadge status={scan.status} />
              
              <Badge variant="outline" className="text-xs h-5 px-2 capitalize">
                {scan.scan_type}
              </Badge>

              {hasHighPriorityIssues && (
                <Badge variant="destructive" className="text-xs h-5 px-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Attention
                </Badge>
              )}
            </div>
          </div>
          
          <div className="ml-4 flex items-center gap-2">
            {/* Security Score */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    {getScoreIcon(scan.total_score)}
                    <span className={`text-sm font-bold ${getScoreColor(scan.total_score)}`}>
                      {scan.total_score}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Security Score: {scan.total_score}/100</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  aria-label={`More actions for scan of ${scan.repo_full_name || 'unknown repository'}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Scan Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/scans/${scan.scan_id}`)
                  }} 
                  className="gap-2"
                >
                  <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="font-medium">View Details</div>
                    <div className="text-xs text-muted-foreground">Analyze results</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExport()
                  }} 
                  className="gap-2"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                  <div>
                    <div className="font-medium">
                      {isExporting ? 'Exporting...' : 'Export Report'}
                    </div>
                    <div className="text-xs text-muted-foreground">PDF download</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                      <Trash2 className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Delete Scan</div>
                        <div className="text-xs text-muted-foreground">Remove permanently</div>
                      </div>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Security Scan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this security scan for "{scan.repo_full_name || 'unknown repository'}"? 
                        This action cannot be undone and will permanently remove all scan data and results.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete()
                        }}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Scan'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0 relative z-10">
        {/* Security Issues Summary */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Security Issues
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {totalIssues} total
            </Badge>
          </div>
          
          {totalIssues === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>No security issues detected</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(issueSummary).map(([severity, count]) => (
                count > 0 && (
                  <div key={severity} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{severity}:</span>
                    <span className={getSeverityColor(severity, count)}>
                      {count}
                    </span>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Scan Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700/50">
            <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded">
              <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {scan.metadata?.scan_duration 
                  ? `${Math.round(scan.metadata.scan_duration / 60)}m ${Math.round(scan.metadata.scan_duration % 60)}s`
                  : 'N/A'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700/50">
            <div className="p-1 bg-purple-50 dark:bg-purple-900/30 rounded">
              <Activity className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tools</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {scan.metadata?.tools_used?.length || 0} used
              </p>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700/50">
          <div className="p-1 bg-green-50 dark:bg-green-900/30 rounded">
            <Clock className="h-3 w-3 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(scan.created_at, { includeTime: true, includeTimezone: false })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/scans/${scan.scan_id}`)
            }}
            className="flex-1 h-9 text-sm font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            aria-label={`View detailed results for scan of ${scan.repo_full_name || 'unknown repository'}`}
          >
            <TrendingUp className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            View Results
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}