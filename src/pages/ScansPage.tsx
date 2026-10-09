import { useEffect, useState } from 'react'
import { 
  Play, 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  TrendingUp,
  Zap,
  Target,
  Activity,
  Filter,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { useScanStore, useRepositoryStore } from '@/store'
import { SimplifiedNewScanDialog } from '@/components/scans/SimplifiedNewScanDialog'
import { ScanFilters } from '@/components/scans/ScanFilters'
import { ScanTable } from '@/components/scans/ScanTable'
import { ScanPagination } from '@/components/scans/ScanPagination'
import { ActiveScansCard } from '@/components/scans/ActiveScansCard'
import { SystemStatus } from '@/components/scans/SystemStatus'
import { ScanPageSkeleton, ScanStatsCardsSkeleton } from '@/components/scans/scans-skeleton'
import { ScanSmartSearch } from '@/components/scans/ScanSmartSearch'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTimezone } from '@/contexts/TimezoneContext'
import { formatScanDuration } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function ScansPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showNewScanDialog, setShowNewScanDialog] = useState(false)
  const { formatDate } = useTimezone()
  const {
    scans,
    isLoading,
    error,
    searchQuery,
    selectedSeverity,
    selectedStatus,
    selectedRepository,
    activeScanJobs,
    queueStats,
    scanStats,
    currentPage,
    totalPages,
    totalScans,
    itemsPerPage,
    fetchScans,
    fetchScansWithFilters,
    fetchQueueStats,
    fetchScanStats,
    getFilteredScans,
    getScanStats,
    setSearchQuery,
    setCurrentPage,
    setRepositoryFilter,
    deleteScan,
    clearError
  } = useScanStore()

  const { repositories, fetchRepositories, isLoading: reposLoading } = useRepositoryStore()

  const filteredScans = getFilteredScans()

  useEffect(() => {
    const navigationState = location.state as { selectedRepo?: string } | null
    
    // Check if we have a repository from navigation state
    if (navigationState?.selectedRepo) {
      // Load with the specific repository filter and set the state
      setRepositoryFilter(navigationState.selectedRepo)
    } else {
      // Clear any existing repository filter and load all scans
      setRepositoryFilter(null)
    }
    
    fetchQueueStats()
    fetchScanStats()
    fetchRepositories()
    
    // Poll queue stats every 30 seconds
    const interval = setInterval(() => {
      fetchQueueStats()
      fetchScanStats()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchScansWithFilters, fetchQueueStats, fetchScanStats, fetchRepositories, setRepositoryFilter])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }


  // Show skeleton for initial page load
  if (isLoading && scans.length === 0 && !scanStats && !queueStats) {
    return <ScanPageSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Security Scans</h1>
            <p className="text-muted-foreground">Monitor and manage your security scans</p>
          </div>
        </div>
        
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Scans
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={() => fetchScans()} variant="outline">
                Try Again
              </Button>
              <Button onClick={clearError} variant="ghost">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-6 w-full min-w-0 overflow-hidden">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg flex-shrink-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Security Scans</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Monitor vulnerabilities and security issues across your repositories
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fetchScansWithFilters(selectedRepository)
            }}
            disabled={isLoading}
            className="gap-2 h-10 px-3 sm:h-9 sm:px-4 min-w-[44px]"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Dialog open={showNewScanDialog} onOpenChange={setShowNewScanDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 h-10 px-3 sm:h-9 sm:px-4 min-w-[44px]">
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">New Scan</span>
                <span className="sm:hidden">Scan</span>
              </Button>
            </DialogTrigger>
            <SimplifiedNewScanDialog 
              repositories={repositories}
              isLoadingRepos={reposLoading}
              open={showNewScanDialog}
              onOpenChange={setShowNewScanDialog}
              onSuccess={() => {
                setShowNewScanDialog(false)
                fetchScans()
              }}
            />
          </Dialog>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      {!scanStats ? (
        <ScanStatsCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Total Scans</CardTitle>
              <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-200 tracking-tight">{scanStats?.total_scans || 0}</div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1 font-medium">Security scans completed</p>
            </CardContent>
          </Card>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="transition-all duration-200 hover:shadow-md hover:border-yellow-300 dark:hover:border-yellow-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300">Active Scans</CardTitle>
                  <div className="p-1.5 sm:p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-900 dark:text-yellow-200 tracking-tight">
                    {scanStats?.active_scans || Object.keys(activeScanJobs).length}
                  </div>
                  <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1 font-medium">Currently processing</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Scans currently running or queued</p>
            </TooltipContent>
          </Tooltip>

          <Card className="transition-all duration-200 hover:shadow-md hover:border-red-300 dark:hover:border-red-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Critical Issues</CardTitle>
              <div className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-red-900 dark:text-red-200 tracking-tight">{scanStats?.critical_issues || 0}</div>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1 font-medium">
                {(scanStats?.critical_issues || 0) === 0 ? 'No critical issues' : 'Require immediate attention'}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md hover:border-green-300 dark:hover:border-green-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Completed</CardTitle>
              <div className="p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100 tracking-tight">{scanStats?.completed_scans || 0}</div>
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 font-medium">Successfully finished</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Status - Minimal and User-Friendly */}
      <SystemStatus
        queueStats={queueStats}
        activeScanJobs={activeScanJobs}
        className="py-0.5"
      />

      {/* Active Scans Details - Only show when there are active scans */}
      {Object.keys(activeScanJobs).length > 0 && (
        <ActiveScansCard activeScanJobs={activeScanJobs} />
      )}

      {/* Enhanced Search and Filters */}
      <div id="scan-results-section" className="space-y-3 sm:space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          <div className="flex-1 min-w-0 w-full">
            <ScanSmartSearch
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search scans by repository, branch, scan type, or commit..."
              className="w-full"
            />
          </div>
          
          <div className="flex items-center lg:flex-shrink-0 overflow-x-auto lg:overflow-x-visible">
            <ScanFilters />
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(searchQuery || selectedSeverity || selectedStatus || selectedRepository) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200 flex-shrink-0">Active filters:</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 h-6">
                  Search: {searchQuery}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {selectedSeverity && (
                <Badge variant="secondary" className="gap-1 h-6">
                  Severity: {selectedSeverity}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full" 
                    onClick={() => useScanStore.getState().setSeverityFilter(null)}
                  />
                </Badge>
              )}
              {selectedStatus && (
                <Badge variant="secondary" className="gap-1 h-6">
                  Status: {selectedStatus}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full" 
                    onClick={() => useScanStore.getState().setStatusFilter(null)}
                  />
                </Badge>
              )}
              {selectedRepository && (
                <Badge variant="secondary" className="gap-1 h-6">
                  Repository: {selectedRepository.split('/')[1]}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full" 
                    onClick={() => useScanStore.getState().setRepositoryFilter(null)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scans Table */}
      <div className="space-y-4 w-full min-w-0 overflow-hidden">
        {/* Results Summary */}
        {filteredScans.length > 0 && !isLoading && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredScans.length} of {totalScans} security scans
              </span>
              {filteredScans.length !== totalScans && (
                <Badge variant="secondary" className="text-xs">
                  Filtered
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
        
        {filteredScans.length === 0 && !isLoading ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                {scans.length === 0 ? "No Security Scans Yet" : "No Matching Scans"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md px-2">
                {scans.length === 0 
                  ? "Get started by running your first security scan to identify vulnerabilities in your repositories."
                  : "Try adjusting your search terms or filters to find the scans you're looking for."
                }
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button 
                  onClick={() => setShowNewScanDialog(true)} 
                  className="gap-2 w-full sm:w-auto h-11 sm:h-10 min-w-[44px]"
                >
                  <Zap className="h-4 w-4" />
                  {scans.length === 0 ? "Run First Security Scan" : "Start New Scan"}
                </Button>
                {scans.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('')
                      useScanStore.getState().clearFilters()
                    }}
                    className="gap-2 w-full sm:w-auto h-11 sm:h-10 min-w-[44px]"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <ScanTable 
              scans={filteredScans}
              onDeleted={() => {
                fetchScans()
                fetchScanStats()
              }}
              isLoading={isLoading}
            />
            
            {/* Pagination */}
            <ScanPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalScans}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
      </div>
    </TooltipProvider>
  )
}