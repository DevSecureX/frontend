import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimezone } from '@/contexts/TimezoneContext'
import { 
  Shield, 
  Trash2, 
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Download,
  RefreshCw,
  Clock,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { ScanStatusBadge } from './ScanStatusBadge'
import { useScanStore } from '@/store'
import { scansAPI } from '@/lib/api/scans'
import { toast } from 'sonner'
import type { ScanSummary } from '@/types/global'

interface MobileScanCardProps {
  scan: ScanSummary
  onDeleted?: () => void
  isLoading?: boolean
}

export function MobileScanCard({ scan, onDeleted, isLoading }: MobileScanCardProps) {
  const { formatDate } = useTimezone()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [exportingId, setExportingId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { deleteScan } = useScanStore()

  const handleDelete = async (scanId: string) => {
    try {
      setDeletingId(scanId)
      await deleteScan(scanId)
      onDeleted?.()
      toast.success('Scan deleted successfully')
    } catch (error) {
      console.error('Failed to delete scan:', error)
      toast.error('Failed to delete scan')
    } finally {
      setDeletingId(null)
    }
  }

  const handleExport = async (scan: ScanSummary) => {
    try {
      setExportingId(scan.scan_id)
      toast.loading('Generating scan report...', { id: `export-${scan.scan_id}` })
      
      const blob = await scansAPI.exportScanReport(scan.scan_id)
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `DevSecureX-${(scan.repo_full_name || 'unknown-repo').replace('/', '-')}-${scan.branch || 'main'}-${scan.scan_id?.slice(0, 8) || 'unknown'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Report exported successfully!', { id: `export-${scan.scan_id}` })
    } catch (error) {
      console.error('Failed to export scan report:', error)
      toast.error('Failed to export report. Please try again.', { id: `export-${scan.scan_id}` })
    } finally {
      setExportingId(null)
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
        return 'text-blue-600 dark:text-blue-400 font-medium'
      case 'info':
        return 'text-gray-600 dark:text-gray-400 font-medium'
      default:
        return 'text-muted-foreground'
    }
  }

  const totalIssues = scan.issue_summary ? Object.values(scan.issue_summary).reduce((sum, count) => sum + count, 0) : 0

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="w-full max-w-full group transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer overflow-hidden mobile-card"
      onClick={() => navigate(`/scans/${scan.scan_id}`)}
    >
      <CardContent className="p-3 sm:p-4 space-y-3 w-full overflow-hidden">
        {/* Header: Repository Info */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded flex-shrink-0">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                {scan.repo_full_name ? scan.repo_full_name.split('/')[1] || scan.repo_full_name : 'Unknown Repository'}
              </h3>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {scan.repo_full_name ? scan.repo_full_name.split('/')[0] || '' : 'Unknown'}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono">
                  {scan.branch || 'main'}
                </code>
              </div>
            </div>
          </div>
          
          {/* Status, Type, Score, and Actions - Mobile Layout */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <ScanStatusBadge status={scan.status} />
              <Badge variant="outline" className="text-xs capitalize">
                {scan.scan_type || 'unknown'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0 ml-2 mr-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded">
                {getScoreIcon(scan.total_score ?? 0)}
                <span className={`text-sm font-bold ${getScoreColor(scan.total_score ?? 0)}`}>
                  {scan.total_score ?? 0}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 flex-shrink-0 mr-1"
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
                  onClick={async (e) => {
                    e.stopPropagation()
                    await handleExport(scan)
                  }} 
                  className="gap-2"
                  disabled={exportingId === scan.scan_id}
                >
                  {exportingId === scan.scan_id ? (
                    <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                  <div>
                    <div className="font-medium">
                      {exportingId === scan.scan_id ? 'Exporting...' : 'Export Report'}
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
                        onClick={async (e) => {
                          e.stopPropagation()
                          await handleDelete(scan.scan_id)
                        }}
                        disabled={deletingId === scan.scan_id}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingId === scan.scan_id ? 'Deleting...' : 'Delete Scan'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Security Issues */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 w-full">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Security Issues
          </h4>
          
          {totalIssues === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>No issues detected</span>
            </div>
          ) : (
            <div className="space-y-1">
              {scan.issue_summary ? Object.entries(scan.issue_summary)
                .filter(([, count]) => count > 0)
                .map(([severity, count]) => (
                  <div key={severity} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-600 dark:text-gray-400 truncate">{severity}</span>
                    <span className={`${getSeverityColor(severity, count)} flex-shrink-0 ml-2`}>{count}</span>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground">Issue summary not available</div>
                )}
            </div>
          )}
        </div>

        {/* Date and Action - Mobile Layout */}
        <div className="w-full">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-xs">
                {scan.created_at ? formatDate(scan.created_at, { includeTime: false, includeTimezone: false }) : 'Unknown date'}
              </div>
              <div className="text-xs">
                {scan.created_at ? formatDate(scan.created_at, { 
                  includeTime: true, 
                  includeTimezone: false,
                  dateFormat: ''
                }).replace(/^,\s*/, '') : 'Unknown time'}
              </div>
            </div>
          </div>
          
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/scans/${scan.scan_id}`)
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}