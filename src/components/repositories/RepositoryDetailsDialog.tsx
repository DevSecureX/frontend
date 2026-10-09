import { useState, useEffect } from 'react'
import { useTimezone } from '@/contexts/TimezoneContext'
import { 
  GitBranch, 
  Shield, 
  Clock, 
  ExternalLink, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  Users,
  Code,
  GitCommit,
  TrendingUp,
  Calendar
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import type { Repository } from '@/types/global'
import { useScanStore, useRepositoryStore } from '@/store'

interface RepositoryDetailsDialogProps {
  repository: Repository
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RepositoryDetailsDialog({ 
  repository, 
  open, 
  onOpenChange 
}: RepositoryDetailsDialogProps) {
  const { formatDateOnly, formatDate } = useTimezone()
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const { pullRequests, fetchPullRequests, scans, fetchScans } = useScanStore()
  const { getDynamicStats } = useRepositoryStore()

  const dynamicStats = getDynamicStats()
  // Filter scans for this repository
  const repoScans = scans.filter(scan => scan.repo_full_name === repository.full_name)
  const repoPRs = pullRequests[repository.full_name] || []

  useEffect(() => {
    if (open && repository.full_name) {
      setIsLoadingDetails(true)
      Promise.all([
        fetchPullRequests(repository.full_name),
        fetchScans(repository.full_name)
      ]).finally(() => {
        setIsLoadingDetails(false)
      })
    }
  }, [open, repository.full_name, fetchPullRequests, fetchScans])

  const getSecurityScore = () => {
    if (repoScans.length === 0) return null
    const latestScan = repoScans[0]
    return latestScan.total_score || 75 // Use total_score from ScanSummary
  }

  const getVulnerabilityStats = () => {
    if (repoScans.length === 0) return { critical: 0, high: 0, medium: 0, low: 0 }
    const latestScan = repoScans[0]
    // Use issue_summary which is a Record<string, number> for severity counts
    const issueSummary = latestScan.issue_summary || {}
    return {
      critical: issueSummary.critical || 0,
      high: issueSummary.high || 0,
      medium: issueSummary.medium || 0,
      low: issueSummary.low || 0
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
      case 'scanning': return 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
      case 'error': return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    }
  }

  const securityScore = getSecurityScore()
  const vulnStats = getVulnerabilityStats()
  
  // Safely parse settings
  const getSettings = () => {
    if (!repository.settings) return {}
    if (typeof repository.settings === 'object') return repository.settings
    try {
      return JSON.parse(repository.settings)
    } catch {
      return {}
    }
  }
  const settings = getSettings()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="space-y-3">
            <div className="pr-0 sm:pr-6">
              <DialogTitle className="text-lg sm:text-xl flex items-center gap-2 break-all">
                <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="break-all">{repository.full_name}</span>
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                <Badge className={getStatusColor(repository.status)}>
                  {repository.status}
                </Badge>
                {repository.is_private === 'true' && (
                  <Badge variant="outline">Private</Badge>
                )}
                {repository.language && (
                  <Badge variant="outline">{repository.language}</Badge>
                )}
              </DialogDescription>
            </div>
            <div className="flex justify-start sm:justify-end mt-3 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://github.com/${repository.full_name}`, '_blank')}
                className="gap-2 h-10 w-full sm:w-auto"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-12">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm">Security</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {repository.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                <p className="text-sm">{repository.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Repository Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Repository Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Default Branch</span>
                    <span className="text-sm font-medium">{repository.default_branch || 'main'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Language</span>
                    <span className="text-sm font-medium">{repository.language || 'Not detected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Niche</span>
                    <span className="text-sm font-medium capitalize">{repository.niche}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Connected</span>
                    <span className="text-sm font-medium">
                      {formatDateOnly(repository.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {securityScore ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Security Score</span>
                        <span className="text-sm font-medium">{securityScore}/100</span>
                      </div>
                      <Progress value={securityScore} className="h-2" />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-red-600 dark:text-red-400">Critical:</span>
                          <span>{vulnStats.critical}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-600 dark:text-orange-400">High:</span>
                          <span>{vulnStats.high}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600 dark:text-yellow-400">Medium:</span>
                          <span>{vulnStats.medium}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600 dark:text-blue-400">Low:</span>
                          <span>{vulnStats.low}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No security scans yet</p>
                      <p className="text-xs text-muted-foreground">Run a scan to see security metrics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            {isLoadingDetails ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <>
                {repoScans.length > 0 ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recent Scans</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {repoScans.slice(0, 3).map((scan) => (
                            <div key={scan.scan_id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {scan.scan_type} Scan
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(scan.created_at, { includeTime: true })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={scan.status === 'completed' ? 'default' : 'secondary'}>
                                  {scan.status}
                                </Badge>
                                {scan.total_score && (
                                  <span className="text-sm text-muted-foreground">
                                    Score: {scan.total_score}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Security Scans</h3>
                      <p className="text-muted-foreground mb-4">
                        Start scanning this repository to see security insights
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            {isLoadingDetails ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pull Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Pull Requests ({repoPRs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {repoPRs.length > 0 ? (
                      <div className="space-y-2">
                        {repoPRs.slice(0, 3).map((pr) => (
                          <div key={pr.number} className="flex items-center justify-between text-sm">
                            <span className="truncate">#{pr.number}: {pr.title}</span>
                            <Badge variant={pr.state === 'open' ? 'default' : 'secondary'}>
                              {pr.state}
                            </Badge>
                          </div>
                        ))}
                        {repoPRs.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{repoPRs.length - 3} more pull requests
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No pull requests found</p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Scans */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Scan History ({repoScans.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {repoScans.length > 0 ? (
                      <div className="space-y-2">
                        {repoScans.slice(0, 3).map((scan) => (
                          <div key={scan.scan_id} className="flex items-center justify-between text-sm">
                            <span>{formatDate(scan.created_at, { includeTime: true })}</span>
                            <Badge variant={scan.status === 'completed' ? 'default' : 'secondary'}>
                              {scan.status}
                            </Badge>
                          </div>
                        ))}
                        {repoScans.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{repoScans.length - 3} more scans
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No scans performed yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Repository Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Webhook Status</h4>
                    <div className="flex items-center gap-2">
                      {repository.webhook_id && repository.webhook_id !== 'dummy_webhook' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                          <span className="text-sm">Active (ID: {repository.webhook_id.substring(0, 8)}...)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                          <span className="text-sm">Mock/Development</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Last Synced</h4>
                    <p className="text-sm text-muted-foreground">
                      {repository.last_synced 
                        ? formatDate(repository.last_synced)
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Additional Settings</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Privacy: {repository.is_private === 'true' ? 'Private' : 'Public'}</div>
                    <div>Default Branch: {repository.default_branch || 'main'}</div>
                    <div>Connected: {formatDateOnly(repository.created_at)}</div>
                    <div>Updated: {formatDateOnly(repository.updated_at)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}