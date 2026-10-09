import { useState, useRef, useEffect } from 'react'
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
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { MobileScanCard } from './MobileScanCard'
import { useScanStore } from '@/store'
import { scansAPI } from '@/lib/api/scans'
import { toast } from 'sonner'
import { useTheme } from '@/lib/theme'
import type { ScanSummary } from '@/types/global'

interface ScanTableProps {
  scans: ScanSummary[]
  onDeleted?: () => void
  isLoading?: boolean
}

type SortField = 'repository' | 'created_at'
type SortDirection = 'asc' | 'desc'

export function ScanTable({ scans, onDeleted, isLoading }: ScanTableProps) {
  const { formatDate } = useTimezone()
  const { effectiveTheme: theme } = useTheme()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [exportingId, setExportingId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState<boolean>(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const navigate = useNavigate()
  const { deleteScan } = useScanStore()

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [])

  // Track window width for responsive behavior
  useEffect(() => {
    const checkBreakpoint = () => {
      setWindowWidth(window.innerWidth)
    }
    
    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [])

  const handleMouseMove = (e: React.MouseEvent, scanId: string) => {
    const newX = e.clientX
    const newY = e.clientY
    
    // Check if cursor actually moved (not just a re-trigger)
    const cursorMoved = Math.abs(newX - mousePosition.x) > 2 || Math.abs(newY - mousePosition.y) > 2
    
    setMousePosition({ x: newX, y: newY })
    
    // If cursor moved or switching rows, hide tooltip and restart timer
    if (cursorMoved || hoveredRow !== scanId) {
      setShowTooltip(false)
      setHoveredRow(scanId)
      
      // Clear existing timeout
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      
      // Set new timeout for 2 seconds
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true)
      }, 2000)
    }
  }

  const handleMouseLeave = () => {
    setHoveredRow(null)
    setShowTooltip(false)
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      : <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
  }

  const sortedScans = [...scans].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortField) {
      case 'repository':
        aValue = a.repo_full_name.toLowerCase()
        bValue = b.repo_full_name.toLowerCase()
        break
      case 'created_at':
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

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
      link.download = `DevSecureX-${scan.repo_full_name.replace('/', '-')}-${scan.branch}-${scan.scan_id.slice(0, 8)}.pdf`
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

  if (isLoading && scans.length === 0) {
    return (
      <div className="w-full overflow-hidden">
        {/* Mobile Loading Skeleton */}
        <div className="block md:hidden space-y-4 w-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <MobileScanCard
              key={i}
              scan={{} as ScanSummary}
              isLoading={true}
            />
          ))}
        </div>

        {/* Desktop Loading Skeleton */}
        <div className="hidden md:block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                <TableHead className="w-[25%] font-semibold">Repository</TableHead>
                <TableHead className="w-[15%] font-semibold">Status</TableHead>
                <TableHead className="w-[25%] font-semibold">Security Issues</TableHead>
                <TableHead className="w-[10%] font-semibold">Score</TableHead>
                <TableHead className="w-[15%] font-semibold">Created</TableHead>
                <TableHead className="w-[10%] text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      </div>
    )
  }

  if (scans.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
            No Security Scans Found
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md px-2">
            No scans match your current filters. Try adjusting your search terms or filters to find the scans you're looking for.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      
      {/* Mobile Cards View - Show on small screens */}
      <div className="block md:hidden space-y-4 w-full">
        {sortedScans.map((scan) => (
          <MobileScanCard
            key={scan.scan_id}
            scan={scan}
            onDeleted={onDeleted}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Desktop Table View - Show on medium screens and up */}
      <div className="hidden md:block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <TableHead className="w-[25%] font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => handleSort('repository')}
                  >
                    Repository
                    {getSortIcon('repository')}
                  </Button>
                </TableHead>
                <TableHead className="w-[15%] font-semibold text-gray-900 dark:text-gray-100">
                  Status
                </TableHead>
                <TableHead className="w-[25%] font-semibold text-gray-900 dark:text-gray-100">
                  Security Issues
                </TableHead>
                <TableHead className="w-[10%] font-semibold text-gray-900 dark:text-gray-100">
                  Score
                </TableHead>
                <TableHead className="w-[15%] font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    Created
                    {getSortIcon('created_at')}
                  </Button>
                </TableHead>
                <TableHead className="w-[10%] text-right font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedScans.map((scan) => {
                const totalIssues = Object.values(scan.issue_summary).reduce((sum, count) => sum + count, 0)

                return (
                  <TableRow
                    key={scan.scan_id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 hover:shadow-sm border-gray-200 dark:border-gray-700 transition-all duration-200 h-14 cursor-pointer group"
                    onClick={() => navigate(`/scans/${scan.scan_id}`)}
                    onMouseMove={(e) => handleMouseMove(e, scan.scan_id)}
                    onMouseLeave={handleMouseLeave}
                  >
                          <TableCell className="font-medium">
                            <div className="py-1">
                              <div className="font-semibold text-gray-900 dark:text-white truncate text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {scan.repo_full_name.split('/')[1]}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {scan.repo_full_name.split('/')[0]}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded font-mono">
                                  {scan.branch}
                                </code>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ScanStatusBadge status={scan.status} />
                              <span className="text-xs text-muted-foreground capitalize bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                {scan.scan_type}
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {totalIssues === 0 ? (
                              <div className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>No issues</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                {Object.entries(scan.issue_summary)
                                  .filter(([, count]) => count > 0)
                                  .map(([severity, count], index, filteredArray) => (
                                    <span key={severity} className={`${getSeverityColor(severity, count)}`}>
                                      {count} {severity.charAt(0).toUpperCase() + severity.slice(1)}{index < filteredArray.length - 1 ? ',' : ''}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2" title={`Security Score: ${scan.total_score}/100`}>
                              {getScoreIcon(scan.total_score)}
                              <span className={`text-lg font-bold ${getScoreColor(scan.total_score)}`}>
                                {scan.total_score}
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">/100</span>
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {formatDate(scan.created_at, { includeTime: false, includeTimezone: false })}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(scan.created_at, { 
                                  includeTime: true, 
                                  includeTimezone: false,
                                  dateFormat: ''
                                }).replace(/^,\s*/, '')}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    aria-label={`More actions for scan of ${scan.repo_full_name}`}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Scan Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
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
                                          Are you sure you want to delete this security scan for "{scan.repo_full_name}"? 
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
                          </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Custom cursor-following tooltip */}
        {hoveredRow && showTooltip && (
          <div
            className={`fixed z-[9999] pointer-events-none px-2.5 py-1.5 text-xs font-medium rounded-md shadow-lg border animate-in fade-in-0 zoom-in-95 duration-200 ${
              theme === 'dark' 
                ? 'bg-slate-800 text-slate-100 border-slate-600' 
                : 'bg-white text-slate-900 border-slate-200'
            }`}
            style={{
              left: mousePosition.x + 12,
              top: mousePosition.y - 35,
            }}
          >
            Click to view details
            {/* Small arrow pointing to cursor */}
            <div 
              className={`absolute w-2 h-2 rotate-45 ${
                theme === 'dark' ? 'bg-slate-800 border-b border-r border-slate-600' : 'bg-white border-b border-r border-slate-200'
              }`}
              style={{
                left: '-4px',
                top: '50%',
                transform: 'translateY(-50%) rotate(45deg)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}