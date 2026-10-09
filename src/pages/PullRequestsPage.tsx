import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  GitPullRequest, 
  Shield, 
  Play, 
  MessageSquare, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRepositoryStore, useScanStore } from '@/store'
import { PRList } from '@/components/pull-requests/PRList'
import { PRScanDialog } from '@/components/pull-requests/PRScanDialog'
import { BulkScanDialog } from '@/components/pull-requests/BulkScanDialog'
import { PRSecurityReview } from '@/components/pull-requests/PRSecurityReview'
import { SecurityTrendsChart } from '@/components/pull-requests/SecurityTrendsChart'
import { PRStatsCardsSkeleton, PRSecurityTrendsSkeleton, PRListSkeleton } from '@/components/pull-requests/pull-requests-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

export function PullRequestsPage() {
  const location = useLocation()
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [showScanDialog, setShowScanDialog] = useState(false)
  const [showBulkScanDialog, setShowBulkScanDialog] = useState(false)
  const [selectedPRs, setSelectedPRs] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  // Removed statusFilter since API only returns open PRs
  
  const { repositories, fetchRepositories } = useRepositoryStore()
  const { 
    pullRequests, 
    fetchPullRequests, 
    activeScanJobs,
    isLoading,
    isPRsLoading,
    scanningPRs
  } = useScanStore()

  const currentRepoPRs = selectedRepo ? pullRequests[selectedRepo] || [] : []
  
  useEffect(() => {
    fetchRepositories()
  }, [fetchRepositories])

  // Handle repository pre-selection from navigation state
  useEffect(() => {
    const navigationState = location.state as { selectedRepo?: string } | null
    if (navigationState?.selectedRepo && !selectedRepo) {
      setSelectedRepo(navigationState.selectedRepo)
    }
  }, [location.state, selectedRepo])

  useEffect(() => {
    if (selectedRepo) {
      fetchPullRequests(selectedRepo)
    }
  }, [selectedRepo, fetchPullRequests])

  const handleRepoChange = (repoFullName: string) => {
    setSelectedRepo(repoFullName)
    setSelectedPRs([])
    setSearchQuery('')
    // No need to reset statusFilter - removed
  }

  const handlePRSelect = (prNumber: number, selected: boolean) => {
    if (selected) {
      setSelectedPRs(prev => [...prev, prNumber])
    } else {
      setSelectedPRs(prev => prev.filter(n => n !== prNumber))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedPRs(filteredPRs.map(pr => pr.number))
    } else {
      setSelectedPRs([])
    }
  }

  const filteredPRs = currentRepoPRs.filter(pr => {
    // Search filter (only filtering by search now - all PRs are open)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !pr.title.toLowerCase().includes(query) &&
        !pr.author?.toLowerCase().includes(query) &&
        !pr.number.toString().includes(query)
      ) {
        return false
      }
    }

    return true
  })

  const getActiveScanCount = () => {
    return Object.values(activeScanJobs).filter(job => 
      job.repo_full_name === selectedRepo && job.scan_type.includes('pr')
    ).length
  }

  const getPRStats = () => {
    const total = currentRepoPRs.length
    const open = currentRepoPRs.filter(pr => pr.state === 'open').length
    const draft = currentRepoPRs.filter(pr => pr.draft).length
    const hasScans = currentRepoPRs.filter(pr => 
      Object.values(activeScanJobs).some(job => 
        job.scan_type.includes(`pr-${pr.number}`)
      )
    ).length

    return { total, open, draft, hasScans }
  }

  const stats = getPRStats()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <GitPullRequest className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Pull Request Security</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Secure your code changes with automated PR security scanning
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedRepo && fetchPullRequests(selectedRepo)}
            disabled={!selectedRepo || isPRsLoading}
            className="gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 ${isPRsLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          {selectedPRs.length > 0 && (
            <Button 
              onClick={() => setShowBulkScanDialog(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              size="default"
            >
              <Shield className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="hidden sm:inline">Bulk Scan ({selectedPRs.length})</span>
              <span className="sm:hidden">Scan ({selectedPRs.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Repository Selection */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <GitPullRequest className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Repository Selection
          </CardTitle>
          <CardDescription>
            Choose a repository to view and scan its pull requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Select value={selectedRepo} onValueChange={handleRepoChange}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.full_name}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{repo.full_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {repo.niche}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedRepo && (
              <Button 
                onClick={() => setShowScanDialog(true)}
                className="gap-2 bg-green-600 hover:bg-green-700 h-10"
                size="default"
              >
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">New PR Scan</span>
                <span className="sm:hidden">Scan</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRepo && (
        <>
          {/* Enhanced Stats Cards */}
          {isPRsLoading && currentRepoPRs.length === 0 ? (
            <PRStatsCardsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total PRs</CardTitle>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-colors duration-200 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/40">
                    <GitPullRequest className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 tracking-tight">{stats.total}</div>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1 font-medium">Pull requests found</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-green-300 dark:hover:border-green-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Open PRs</CardTitle>
                  <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg transition-colors duration-200 group-hover:bg-green-100 dark:group-hover:bg-green-800/40">
                    <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100 tracking-tight">{stats.open}</div>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 font-medium">Ready for review</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-yellow-300 dark:hover:border-yellow-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Draft PRs</CardTitle>
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg transition-colors duration-200 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-800/40">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 tracking-tight">{stats.draft}</div>
                  <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1 font-medium">Work in progress</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Scans</CardTitle>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg transition-colors duration-200 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/40">
                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 tracking-tight">{getActiveScanCount()}</div>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1 font-medium">
                    {getActiveScanCount() === 0 ? 'No active scans' : 'Currently scanning'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Trends */}
          {isPRsLoading && currentRepoPRs.length === 0 ? (
            <PRSecurityTrendsSkeleton />
          ) : (
            <SecurityTrendsChart 
              repositoryFullName={selectedRepo}
            />
          )}

          {/* Enhanced Search */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search pull requests by title, author, or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Pull Requests Tabs */}
          <Tabs defaultValue="list" className="space-y-4 sm:space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <TabsList className="bg-gray-50 dark:bg-gray-900/50">
                <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
                  <GitPullRequest className="h-4 w-4" />
                  <span className="hidden sm:inline">Pull Requests ({filteredPRs.length})</span>
                  <span className="sm:hidden">PRs ({filteredPRs.length})</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Security Reviews</span>
                  <span className="sm:hidden">Security</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="space-y-4">
              <PRList
                pullRequests={filteredPRs}
                selectedPRs={selectedPRs}
                onPRSelect={handlePRSelect}
                onSelectAll={handleSelectAll}
                repositoryFullName={selectedRepo}
                activeScanJobs={activeScanJobs}
                isLoading={isPRsLoading}
                scanningPRs={scanningPRs}
              />
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <PRSecurityReview
                repositoryFullName={selectedRepo}
                pullRequests={filteredPRs}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Dialogs */}
      {showScanDialog && (
        <PRScanDialog
          isOpen={showScanDialog}
          onClose={() => setShowScanDialog(false)}
          repositoryFullName={selectedRepo}
          pullRequests={currentRepoPRs}
          onSuccess={() => {
            setShowScanDialog(false)
            if (selectedRepo) fetchPullRequests(selectedRepo)
          }}
        />
      )}

      {showBulkScanDialog && (
        <BulkScanDialog
          isOpen={showBulkScanDialog}
          onClose={() => setShowBulkScanDialog(false)}
          repositoryFullName={selectedRepo}
          selectedPRNumbers={selectedPRs}
          onSuccess={() => {
            setShowBulkScanDialog(false)
            setSelectedPRs([])
            if (selectedRepo) fetchPullRequests(selectedRepo)
          }}
        />
      )}
    </div>
  )
}