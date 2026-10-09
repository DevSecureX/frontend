import { Filter, X, Shield, AlertTriangle, CheckCircle, Clock, XCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useScanStore, useRepositoryStore } from '@/store'

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/30' },
  { value: 'high', label: 'High', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30' },
  { value: 'low', label: 'Low', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { value: 'info', label: 'Info', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-950/30' }
]

const STATUS_OPTIONS = [
  { value: 'queued', label: 'Queued', icon: Clock, color: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'processing', label: 'Processing', icon: Shield, color: 'text-blue-600 dark:text-blue-400' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
  { value: 'failed', label: 'Failed', icon: XCircle, color: 'text-red-600 dark:text-red-400' }
]

export function ScanFilters() {
  const {
    selectedSeverity,
    selectedStatus,
    selectedRepository,
    scans,
    setSeverityFilter,
    setStatusFilter,
    setRepositoryFilter,
    clearFilters
  } = useScanStore()

  const { repositories } = useRepositoryStore()

  // Get repository list from connected repositories instead of scan data
  const availableRepositories = repositories.map(repo => repo.full_name).sort()
  
  // Still get counts from scans for display (but don't use for filtering)
  const repositoryCounts = scans.reduce((acc, scan) => {
    acc[scan.repo_full_name] = (acc[scan.repo_full_name] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate filter counts from current scans
  const severityCounts = scans.reduce((acc, scan) => {
    Object.entries(scan.issue_summary).forEach(([severity, count]) => {
      if (count > 0) {
        acc[severity] = (acc[severity] || 0) + 1
      }
    })
    return acc
  }, {} as Record<string, number>)

  const statusCounts = scans.reduce((acc, scan) => {
    acc[scan.status] = (acc[scan.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const hasActiveFilters = selectedSeverity || selectedStatus || selectedRepository
  const totalActiveFilters = [selectedSeverity, selectedStatus, selectedRepository].filter(Boolean).length

  return (
    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-3 w-full lg:w-auto overflow-hidden lg:overflow-visible">
      {/* Severity Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 lg:px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors duration-200 text-xs sm:text-sm min-w-0 max-w-[120px] lg:max-w-none lg:min-w-[120px] flex-shrink-0"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {selectedSeverity ? SEVERITY_OPTIONS.find(s => s.value === selectedSeverity)?.label : 'Severity'}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-sm font-semibold">Filter by Issue Severity</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="space-y-1">
            {SEVERITY_OPTIONS.map((severity) => {
              const count = severityCounts[severity.value] || 0
              return (
                <DropdownMenuCheckboxItem
                  key={severity.value}
                  checked={selectedSeverity === severity.value}
                  onCheckedChange={(checked) => {
                    setSeverityFilter(checked ? severity.value as any : null)
                  }}
                  disabled={count === 0}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${severity.bgColor} border border-current ${severity.color}`} />
                    <span className={severity.color}>{severity.label}</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${count === 0 ? 'opacity-50' : ''}`}>
                    {count}
                  </Badge>
                </DropdownMenuCheckboxItem>
              )
            })}
          </div>
          {selectedSeverity && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={() => setSeverityFilter(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Clear severity filter
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 lg:px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors duration-200 text-xs sm:text-sm min-w-0 max-w-[100px] lg:max-w-none lg:min-w-[100px] flex-shrink-0"
          >
            <Shield className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {selectedStatus ? STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label : 'Status'}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-sm font-semibold">Filter by Scan Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="space-y-1">
            {STATUS_OPTIONS.map((status) => {
              const count = statusCounts[status.value] || 0
              const Icon = status.icon
              return (
                <DropdownMenuCheckboxItem
                  key={status.value}
                  checked={selectedStatus === status.value}
                  onCheckedChange={async (checked) => {
                    await setStatusFilter(checked ? status.value as any : null)
                  }}
                  disabled={count === 0}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${status.color}`} />
                    <span className={status.color}>{status.label}</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${count === 0 ? 'opacity-50' : ''}`}>
                    {count}
                  </Badge>
                </DropdownMenuCheckboxItem>
              )
            })}
          </div>
          {selectedStatus && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={async () => await setStatusFilter(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Clear status filter
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Repository Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 lg:px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors duration-200 text-xs sm:text-sm min-w-0 max-w-[100px] lg:max-w-none lg:min-w-[120px] flex-shrink-0"
          >
            <Filter className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">
              {selectedRepository ? selectedRepository.split('/')[1] : 'Repository'}
            </span>
            <span className="sm:hidden truncate">
              {selectedRepository ? selectedRepository.split('/')[1] : 'Repo'}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="text-sm font-semibold">Filter by Repository</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-64 overflow-y-auto">
            {availableRepositories.length > 0 ? (
              availableRepositories.map((repoFullName) => {
                const scanCount = repositoryCounts[repoFullName] || 0
                const handleRepositoryChange = async (checked: boolean) => {
                  const newRepo = checked ? repoFullName : null
                  // Repository filter changed
                  await setRepositoryFilter(newRepo)
                }
                
                return (
                  <DropdownMenuCheckboxItem
                    key={repoFullName}
                    checked={selectedRepository === repoFullName}
                    onCheckedChange={handleRepositoryChange}
                    disabled={scanCount === 0}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{repoFullName.split('/')[1]}</span>
                        <span className="text-xs text-muted-foreground">{repoFullName.split('/')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${scanCount === 0 ? 'opacity-50' : ''}`}>
                          {scanCount} scans
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuCheckboxItem>
                )
              })
            ) : (
              <div className="p-3 text-sm text-muted-foreground text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No repositories found
                <p className="text-xs mt-1">Connect repositories to see them here</p>
              </div>
            )}
          </div>
          {selectedRepository && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={async () => {
                  // Repository filter cleared
                  await setRepositoryFilter(null)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Clear repository filter
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 lg:px-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors duration-200 text-xs sm:text-sm min-w-0 max-w-[80px] lg:max-w-none lg:min-w-[100px] flex-shrink-0"
        >
          <X className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Clear All</span>
          <span className="sm:hidden truncate">Clear</span>
        </Button>
      )}
      
      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
          <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            {totalActiveFilters} active filter{totalActiveFilters > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}