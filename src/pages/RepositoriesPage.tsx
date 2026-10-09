import { useEffect, useState } from 'react'
import { 
  Plus, 
  Search, 
  GitBranch, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  TrendingUp, 
  Zap,
  RefreshCw,
  Eye,
  Settings,
  Target,
  ChevronDown,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRepositoryStore, useScanStore } from '@/store'
import { SimplifiedConnectDialog } from '@/components/repositories/SimplifiedConnectDialog'
import { RepositoryCard } from '@/components/repositories/RepositoryCard'
import { MobileRepositoryCard } from '@/components/repositories/MobileRepositoryCard'
import { RepositoryFilters } from '@/components/repositories/RepositoryFilters'
import { EmptyState } from '@/components/repositories/EmptyState'
import { RepositorySkeletonLoader, StatsCardSkeleton } from '@/components/repositories/SkeletonLoader'
import { SmartSearch } from '@/components/repositories/SmartSearch'
import { toast } from 'sonner'

export function RepositoriesPage() {
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'lastScan' | 'issues'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const {
    repositories,
    isLoading,
    isStatsLoading,
    error,
    searchQuery,
    selectedNiche,
    selectedLanguage,
    selectedStatus,
    fetchRepositories,
    fetchRepositoryStats,
    getFilteredRepositories,
    getRepositoryStats,
    getDynamicStats,
    setSearchQuery,
    clearError,
    disconnectRepository
  } = useRepositoryStore()
  
  const { triggerScan, scans, fetchScans } = useScanStore()

  const stats = getRepositoryStats()
  const dynamicStats = getDynamicStats()

  // Apply base filters from store
  let filteredRepos = getFilteredRepositories()
  
  // Apply quick filters
  if (activeQuickFilter) {
    switch (activeQuickFilter) {
      case 'needs-attention':
        const needsAttentionNames = dynamicStats?.repositories_needing_attention_details?.map(item => item.repo_name) || []
        filteredRepos = filteredRepos.filter(repo => needsAttentionNames.includes(repo.full_name))
        break
        
      case 'never-scanned':
        // Create a set of repository names that have scans
        const scannedRepoNames = new Set(scans.map(scan => scan.repo_full_name))
        filteredRepos = filteredRepos.filter(repo => !scannedRepoNames.has(repo.full_name))
        break
    }
  }
  
  // Apply sorting
  filteredRepos = filteredRepos.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = a.full_name.localeCompare(b.full_name)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'lastScan':
        const aDate = a.last_synced ? new Date(a.last_synced).getTime() : 0
        const bDate = b.last_synced ? new Date(b.last_synced).getTime() : 0
        comparison = bDate - aDate
        break
      case 'issues':
        // This would require scan data, for now sort by status
        comparison = a.status.localeCompare(b.status)
        break
    }
    
    return sortOrder === 'desc' ? -comparison : comparison
  })

  useEffect(() => {
    fetchRepositories()
    fetchRepositoryStats()
    // Fetch scans to enable never-scanned filter
    fetchScans()
  }, [fetchRepositories, fetchRepositoryStats, fetchScans])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleConnectSuccess = () => {
    setShowConnectDialog(false)
    fetchRepositories()
    fetchRepositoryStats()
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        fetchRepositories(),
        fetchRepositoryStats()
      ])
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleBulkAction = (action: string) => {
    // TODO: Implement bulk actions
    console.log('Bulk action:', action)
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    useRepositoryStore.getState().clearFilters()
    setActiveQuickFilter(null)
  }

  // Quick filter functions
  const applyQuickFilter = (filterType: string) => {
    // Clear existing filters first
    setSearchQuery('')
    useRepositoryStore.getState().clearFilters()
    
    if (activeQuickFilter === filterType) {
      // Toggle off if clicking the same filter
      setActiveQuickFilter(null)
    } else {
      setActiveQuickFilter(filterType)
    }
  }

  // Get filtered repositories for quick filter counts
  const getQuickFilterCounts = () => {
    // Create a set of repository names that have scans
    const scannedRepoNames = new Set(scans.map(scan => scan.repo_full_name))
    const neverScanned = repositories.filter(repo => !scannedRepoNames.has(repo.full_name)).length
    
    return {
      needsAttention: stats.needsAttention,
      neverScanned
    }
  }

  const quickFilterCounts = getQuickFilterCounts()


  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 sm:p-6">
          {/* Improved Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <GitBranch className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                      Repository Management
                    </h1>
                    <p className="text-base text-muted-foreground mt-1">
                      Secure your codebase with automated vulnerability scanning
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-5 w-5" />
                      Connect Repository
                    </Button>
                  </DialogTrigger>
                  <SimplifiedConnectDialog onSuccess={handleConnectSuccess} />
                </Dialog>
              </div>
            </div>
          </div>
          
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-300">
                <AlertTriangle className="h-5 w-5" />
                Failed to Load Repositories
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => fetchRepositories()} 
                  variant="outline"
                  className="gap-2 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={clearError} variant="ghost" className="text-red-600 hover:text-red-700 dark:text-red-400">
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
                <GitBranch className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Repositories</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Secure your codebase with automated vulnerability scanning
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="gap-2 h-9"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 h-9">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Connect Repository</span>
                  <span className="sm:hidden">Connect</span>
                </Button>
              </DialogTrigger>
              <SimplifiedConnectDialog onSuccess={handleConnectSuccess} />
            </Dialog>
          </div>
        </div>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isStatsLoading ? (
          // Enhanced Skeleton loading state
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </>
        ) : (
          // Actual stats content
          <>
            <Card className="transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Total Repositories</CardTitle>
                <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors duration-200 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30">
                  <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-200 tracking-tight">{stats.total}</div>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1 font-medium">Connected repositories</p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md hover:border-green-300 dark:hover:border-green-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Active & Healthy</CardTitle>
                <div className="p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg transition-colors duration-200 group-hover:bg-green-100 dark:group-hover:bg-green-800/30">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-200 tracking-tight">{stats.byStatus.active || 0}</div>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 font-medium">Ready for scanning</p>
              </CardContent>
            </Card>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-help">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300">Needs Attention</CardTitle>
                      <div className="p-1.5 sm:p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-200">{stats.needsAttention}</div>
                      <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                        {stats.needsAttention === 0 ? 'All good!' : 'Critical issues found'}
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent className="max-w-md p-4 border border-amber-200 dark:border-amber-800/50 shadow-xl rounded-xl">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-amber-100 dark:border-amber-800/30">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                        Repositories Requiring Attention
                      </p>
                    </div>
                    {dynamicStats?.repositories_needing_attention_details?.length ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300 dark:scrollbar-thumb-amber-600 scrollbar-track-transparent hover:scrollbar-thumb-amber-400 dark:hover:scrollbar-thumb-amber-500">
                        {dynamicStats.repositories_needing_attention_details.map((repo, index) => (
                          <div key={index} className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                            <div className="font-medium text-sm text-amber-900 dark:text-amber-200 mb-1">{repo.repo_name}</div>
                            <div className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{repo.reason}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                          All repositories are in good condition!
                        </p>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Card className="transition-all duration-200 hover:shadow-md hover:border-red-300 dark:hover:border-red-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Security Issues</CardTitle>
                <div className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors duration-200 group-hover:bg-red-100 dark:group-hover:bg-red-800/30">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-red-900 dark:text-red-200 tracking-tight">{stats.issues}</div>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1 font-medium">
                  {stats.issues === 0 ? 'No issues detected' : 'Across all repositories'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <SmartSearch
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search repositories by name, language, description, or owner..."
            />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <RepositoryFilters />
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden lg:block">Sort:</span>
              <Select value={sortBy} onValueChange={(value: 'name' | 'status' | 'lastScan' | 'issues') => setSortBy(value)}>
                <SelectTrigger className="w-28 sm:w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="lastScan">Last Scan</SelectItem>
                  <SelectItem value="issues">Issues</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 h-9 w-9"
                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(searchQuery || selectedNiche || selectedLanguage || selectedStatus || activeQuickFilter) && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 h-6">
                  Search: {searchQuery}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full" 
                    onClick={() => setSearchQuery('')}
                    aria-label="Remove search filter"
                  />
                </Badge>
              )}
              {selectedNiche && (
                <Badge variant="secondary" className="gap-1 h-6">
                  {selectedNiche}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full" 
                    onClick={() => useRepositoryStore.getState().setNicheFilter(null)}
                    aria-label="Remove niche filter"
                  />
                </Badge>
              )}
              {selectedLanguage && (
                <Badge variant="secondary" className="gap-1 h-6">
                  {selectedLanguage}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full" 
                    onClick={() => useRepositoryStore.getState().setLanguageFilter(null)}
                    aria-label="Remove language filter"
                  />
                </Badge>
              )}
              {selectedStatus && (
                <Badge variant="secondary" className="gap-1 h-6">
                  {selectedStatus}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full" 
                    onClick={() => useRepositoryStore.getState().setStatusFilter(null)}
                    aria-label="Remove status filter"
                  />
                </Badge>
              )}
              {activeQuickFilter && (
                <Badge variant="secondary" className="gap-1 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                  Quick: {activeQuickFilter.replace('-', ' ')}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:bg-blue-300 dark:hover:bg-blue-600 rounded-full" 
                    onClick={() => setActiveQuickFilter(null)}
                    aria-label="Remove quick filter"
                  />
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Quick Filter Presets */}
        {repositories.length > 0 && !searchQuery && !selectedNiche && !selectedLanguage && !selectedStatus && !activeQuickFilter && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Quick filters:</span>
            <Button 
              variant={activeQuickFilter === 'needs-attention' ? 'default' : 'outline'} 
              size="sm" 
              className={`h-8 text-xs transition-all duration-200 ${
                activeQuickFilter === 'needs-attention' 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                  : 'hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 hover:shadow-md hover:-translate-y-0.5'
              } active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none`}
              onClick={() => applyQuickFilter('needs-attention')}
              disabled={quickFilterCounts.needsAttention === 0}
            >
              <span className="hidden sm:inline">Needs Attention</span>
              <span className="sm:hidden">Attention</span>
              <span className="ml-1">({quickFilterCounts.needsAttention})</span>
            </Button>
            <Button 
              variant={activeQuickFilter === 'never-scanned' ? 'default' : 'outline'} 
              size="sm" 
              className={`h-8 text-xs transition-all duration-200 ${
                activeQuickFilter === 'never-scanned' 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                  : 'hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 hover:shadow-md hover:-translate-y-0.5'
              } active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none`}
              onClick={() => applyQuickFilter('never-scanned')}
              disabled={quickFilterCounts.neverScanned === 0}
            >
              <span className="hidden sm:inline">Never Scanned</span>
              <span className="sm:hidden">Never</span>
              <span className="ml-1">({quickFilterCounts.neverScanned})</span>
            </Button>
          </div>
        )}
      </div>

      {/* Repository Grid with Results Summary */}
      <div className="space-y-4">
        {filteredRepos.length > 0 && !isLoading && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredRepos.length} of {repositories.length} repositories
              </span>
              {filteredRepos.length !== repositories.length && (
                <Badge variant="secondary" className="text-xs">
                  Filtered
                </Badge>
              )}
            </div>
            {filteredRepos.length > 12 && (
              <div className="text-xs text-muted-foreground">
                Showing first {Math.min(12, filteredRepos.length)} results
              </div>
            )}
          </div>
        )}
        
        {isLoading ? (
          <RepositorySkeletonLoader count={6} isMobile={isMobile} />
        ) : filteredRepos.length === 0 ? (
          <EmptyState
            hasRepositories={repositories.length > 0}
            hasFilters={!!(searchQuery || selectedNiche || selectedLanguage || selectedStatus)}
            onConnectRepo={() => setShowConnectDialog(true)}
            onClearFilters={() => {
              setSearchQuery('')
              // Clear other filters through store actions
            }}
          />
        ) : (
          <>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
              {filteredRepos.slice(0, 12).map((repo) => 
                isMobile ? (
                  <MobileRepositoryCard
                    key={repo.id}
                    repository={repo}
                    onDisconnect={() => {
                      void fetchRepositories()
                      void fetchRepositoryStats()
                    }}
                  />
                ) : (
                  <RepositoryCard
                    key={repo.id}
                    repository={repo}
                    onDisconnect={() => {
                      void fetchRepositories()
                      void fetchRepositoryStats()
                    }}
                  />
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}