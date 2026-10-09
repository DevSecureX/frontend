import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimezone } from '@/contexts/TimezoneContext'
import { 
  GitPullRequest, 
  Shield, 
  ExternalLink, 
  MessageSquare, 
  Plus, 
  Minus,
  Eye,
  FileText,
  User,
  Calendar,
  GitBranch,
  Check,
  X,
  Info,
  MoreVertical,
  Zap,
  CheckCircle2,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScanStatusBadge } from '@/components/scans/ScanStatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { useScanStore } from '@/store'
import { PRDetailsDialog } from './PRDetailsDialog'
import { scansAPI } from '@/lib/api/scans'
import { useToast } from '@/components/ui/use-toast'
import type { PullRequest, JobStatus } from '@/types/global'

interface PRListProps {
  pullRequests: PullRequest[]
  selectedPRs: number[]
  onPRSelect: (prNumber: number, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  repositoryFullName: string
  activeScanJobs: Record<string, JobStatus>
  isLoading: boolean
  scanningPRs: Record<string, boolean>
}

export function PRList({
  pullRequests,
  selectedPRs,
  onPRSelect,
  onSelectAll,
  repositoryFullName,
  activeScanJobs,
  isLoading,
  scanningPRs
}: PRListProps) {
  const { formatDateOnly } = useTimezone()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null)
  const [autoFixingPRs, setAutoFixingPRs] = useState<Record<number, boolean>>({})
  const [autoFixResults, setAutoFixResults] = useState<Record<number, any>>({})
  const { scanPullRequest } = useScanStore()
  const { toast } = useToast()

  const handleQuickScan = async (prNumber: number) => {
    try {
      await scanPullRequest(repositoryFullName, prNumber, {
        include_custom_rules: false,
        include_community_rules: false,
        selected_custom_rule_ids: [],
        selected_community_rule_ids: []
      })

      // Redirect to scans page after a brief delay to show success message
      setTimeout(() => {
        // Scroll to top before navigation to ensure user lands at page top
        window.scrollTo(0, 0)
        navigate('/scans')
      }, 1500)
    } catch (error) {
      console.error('Failed to start PR scan:', error)
    }
  }

  const handleAutoFix = async (prNumber: number) => {
    setAutoFixingPRs(prev => ({ ...prev, [prNumber]: true }))
    
    const startToast = toast({
      title: '🔧 Creating Security Fixes',
      description: `DevSecureX is analyzing security issues and creating fixes for PR #${prNumber}. This may take up to 2 minutes...`
    })
    
    try {
      const result = await scansAPI.createPRAutoFix(
        repositoryFullName,
        prNumber,
        [], // Fix all issues
        true,
        true  // Use async queue by default
      )
      
      // Check if this is an async queue response
      if (result.status === 'processing' && result.job_id) {
        // Auto-fix is processing in background
        toast({
          title: '⚡ Auto-Fix Processing in Background',
          description: (
            <div className="space-y-3">
              <p>DevSecureX is applying security fixes to PR #{prNumber}.</p>
              <p className="text-sm text-muted-foreground">{result.message}</p>
              <p className="text-sm">Estimated time: {result.estimated_time || '30-120 seconds'}</p>
            </div>
          ),
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://github.com/${repositoryFullName}/pulls`, '_blank')}
            >
              View GitHub PRs
            </Button>
          )
        })
        
        // Store a processing status
        setAutoFixResults(prev => ({ ...prev, [prNumber]: { ...result, isProcessing: true } }))
      } else {
        // Direct execution response (when use_queue=false or fallback)
        // Store results for display
        setAutoFixResults(prev => ({ ...prev, [prNumber]: result }))

        // Show success toast
        toast({
          title: '✅ Security Fixes Applied Successfully!',
          description: `${result.fixed_count} security issues fixed in PR #${prNumber}. ${result.fix_pr_url ? 'A new PR has been created with the fixes.' : 'Fixes have been applied to the existing PR.'}`,
          action: result.fix_pr_url ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(result.fix_pr_url, '_blank')}
            >
              View Security Fix PR
            </Button>
          ) : undefined
        })
      }

      // Also show a more prominent notification if there's a PR URL
      if (result.fix_pr_url) {
        // Show another toast with just the PR link for visibility
        setTimeout(() => {
          toast({
            title: '🔗 Security Fix PR Created',
            description: result.fix_pr_url,
            action: (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (result.fix_pr_url) {
                    window.open(result.fix_pr_url, '_blank')
                    // Also copy to clipboard
                    navigator.clipboard.writeText(result.fix_pr_url)
                  }
                }}
              >
                Open & Copy
              </Button>
            )
          })
        }, 1500)
      }

      // Also update the selected PR dialog if it's open for this PR
      const currentPR = pullRequests.find(pr => pr.number === prNumber)
      if (currentPR && selectedPR?.number === prNumber) {
        // This will trigger a refresh of the PR details
        setSelectedPR({ ...currentPR })
      }
      
    } catch (error: any) {
      console.error('Auto-fix error:', error)
      
      if (error.name === 'TimeoutError') {
        toast({
          variant: 'destructive',
          title: '⏰ Auto-Fix Taking Longer Than Expected',
          description: `The security fix process for PR #${prNumber} is still running in the background. Check your repository in a few minutes for a new PR with the fixes.`
        })
      } else if (error.name === 'RetryableError' && error.status === 503) {
        // 503 Service Unavailable - auto-fix is processing in background
        toast({
          title: '⚡ Auto-Fix Processing in Background',
          description: `DevSecureX is applying security fixes to PR #${prNumber}. A new PR with fixes will be created shortly. Check GitHub in 1-2 minutes.`,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://github.com/${repositoryFullName}/pulls`, '_blank')}
            >
              View GitHub PRs
            </Button>
          )
        })
      } else {
        toast({
          variant: 'destructive',
          title: '❌ Auto-Fix Failed',
          description: error.message || `Unable to apply automatic fixes to PR #${prNumber}. Please try again.`
        })
      }
    } finally {
      setAutoFixingPRs(prev => ({ ...prev, [prNumber]: false }))
    }
  }

  const getPRScanStatus = (prNumber: number) => {
    const scanJob = Object.values(activeScanJobs).find(job => 
      job.repo_full_name === repositoryFullName && 
      job.scan_type.includes(`pr-${prNumber}`)
    )
    return scanJob
  }

  const isPRScanning = (prNumber: number) => {
    const prKey = `${repositoryFullName}#${prNumber}`
    return scanningPRs[prKey] || false
  }

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'open':
        return 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
      case 'closed':
        return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
      case 'merged':
        return 'bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    }
  }

  // PR Actions Menu Component
  const PRActionsMenu = ({ pr }: { pr: PullRequest }) => {
    const scanJob = getPRScanStatus(pr.number)
    const isScanning = isPRScanning(pr.number)
    const isAutoFixing = autoFixingPRs[pr.number]

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="sm" 
            variant="ghost"
            className={`h-8 w-8 p-0 ${isAutoFixing ? 'text-blue-600 dark:text-blue-400' : ''}`}
            title="PR Actions"
          >
            {isAutoFixing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            PR #{pr.number} Actions
          </div>
          
          <DropdownMenuItem
            onClick={() => handleQuickScan(pr.number)}
            disabled={!!scanJob || isScanning}
            className="gap-2"
          >
            {isScanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {isScanning ? 'Starting Scan...' : scanJob ? 'Scanning...' : 'Run Security Scan'}
          </DropdownMenuItem>


          <DropdownMenuItem
            onClick={() => setSelectedPR(pr)}
            className="gap-2"
          >
            <Info className="h-4 w-4" />
            View Security Insights
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a 
              href={pr.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Skeleton loading component for cards
  const PRCardSkeleton = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-4 w-4" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Skeleton loading component for table rows
  const PRTableSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
    </TableRow>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Controls skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        {/* Show skeleton cards by default */}
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <PRCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (pullRequests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GitPullRequest className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pull Requests Found</h3>
          <p className="text-muted-foreground text-center mb-4">
            This repository doesn't have any pull requests yet, or none match your current filters.
          </p>
          <Button variant="outline" asChild>
            <a 
              href={`https://github.com/${repositoryFullName}/pulls`}
              target="_blank" 
              rel="noopener noreferrer"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedPRs.length === pullRequests.length && pullRequests.length > 0}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedPRs.length > 0 
              ? `${selectedPRs.length} selected` 
              : 'Select all'
            }
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
        </div>
      </div>

      {/* Cards View - Fully Mobile Responsive */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <PRCardSkeleton key={index} />
            ))
          ) : (
            pullRequests.map((pr) => {
            const scanJob = getPRScanStatus(pr.number)
            const isSelected = selectedPRs.includes(pr.number)
            const isScanning = isPRScanning(pr.number)
            const isAutoFixing = autoFixingPRs[pr.number]
            const autoFixResult = autoFixResults[pr.number]

            return (
              <Card key={pr.number} className={`transition-colors max-w-full overflow-hidden ${
                isSelected ? 'border-primary bg-primary/5' : 
                isAutoFixing ? 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20' : 
                autoFixResult?.fix_pr_url ? 'border-green-200 dark:border-green-700 bg-green-50/30 dark:bg-green-950/20' : ''
              }`}>
                <CardHeader className="pb-3 px-3 sm:px-6">
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onPRSelect(pr.number, checked as boolean)}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 overflow-hidden">
                      {/* Mobile-optimized header row */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <GitPullRequest className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium">#{pr.number}</span>
                          <Badge className={`${getStateColor(pr.state)} text-xs flex-shrink-0`}>
                            {pr.state}
                          </Badge>
                        </div>
                        
                        {/* Stack badges vertically on mobile */}
                        <div className="flex flex-wrap items-center gap-1">
                          {pr.draft && (
                            <Badge variant="outline" className="text-xs">
                              Draft
                            </Badge>
                          )}
                          {isAutoFixing && (
                            <Badge className="bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Auto-Fixing
                            </Badge>
                          )}
                          {scanJob && (
                            <ScanStatusBadge status={scanJob.status} />
                          )}
                        </div>
                      </div>
                      
                      {/* Title with proper text wrapping */}
                      <CardTitle className="text-sm sm:text-base break-words hyphens-auto leading-relaxed mb-3 overflow-hidden">
                        {pr.title}
                      </CardTitle>
                      
                      {/* Mobile-friendly metadata - stack on very small screens */}
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 min-w-0">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{pr.author || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{formatDateOnly(pr.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{pr.changed_files} files</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action menu moved to separate row on mobile */}
                    <div className="flex-shrink-0">
                      <PRActionsMenu pr={pr} />
                    </div>
                  </div>
                  
                  {/* Action buttons on separate row for mobile */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 sm:hidden">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAutoFix(pr.number)}
                      disabled={isAutoFixing}
                      className={`gap-1 w-full sm:w-auto ${isAutoFixing ? 'text-blue-600 dark:text-blue-400' : 'border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}
                      title="Auto-fix security issues"
                    >
                      {isAutoFixing ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Fixing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3" />
                          Auto-Fix
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Desktop action buttons */}
                  <div className="hidden sm:flex sm:items-center sm:gap-2 sm:ml-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAutoFix(pr.number)}
                      disabled={isAutoFixing}
                      className={`gap-1 ${isAutoFixing ? 'text-blue-600 dark:text-blue-400' : 'border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}
                      title="Auto-fix security issues"
                    >
                      {isAutoFixing ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Fixing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3" />
                          Auto-Fix
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 px-3 sm:px-6">
                  {/* Auto-Fix Results */}
                  {autoFixResult?.fix_pr_url && (
                    <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300 break-words">
                          Auto-Fix Completed! Fixed {autoFixResult.fixed_count} issues
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(autoFixResult.fix_pr_url, '_blank')}
                          className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/30 w-full sm:w-auto"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Security Fix PR
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(autoFixResult.fix_pr_url)
                            toast({
                              title: 'Copied!',
                              description: 'PR URL copied to clipboard'
                            })
                          }}
                          className="text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/30 w-full sm:w-auto"
                        >
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Plus className="h-3 w-3 flex-shrink-0" />
                        <span>{pr.additions}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <Minus className="h-3 w-3 flex-shrink-0" />
                        <span>{pr.deletions}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1">
                      {pr.labels.map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs break-words max-w-full">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })
          )}
        </div>
      )}

      {/* Table View - Mobile-Responsive with Stacked Layout */}
      {viewMode === 'table' && (
        <Card className="max-w-full overflow-hidden">
          <CardContent className="p-0">
            {/* Mobile: Show as stacked cards instead of table */}
            <div className="block sm:hidden">
              <div className="space-y-3 p-3">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex gap-2">
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  pullRequests.map((pr) => {
                    const scanJob = getPRScanStatus(pr.number)
                    const isSelected = selectedPRs.includes(pr.number)
                    const isAutoFixing = autoFixingPRs[pr.number]

                    return (
                      <div
                        key={pr.number}
                        className={`p-3 border rounded-lg transition-colors ${
                          isSelected ? 'bg-muted/50 border-primary' : ''
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Header row */}
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => onPRSelect(pr.number, checked as boolean)}
                            />
                            <GitPullRequest className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-sm">#{pr.number}</span>
                            <Badge className={`${getStateColor(pr.state)} text-xs ml-auto`}>
                              {pr.state}
                            </Badge>
                          </div>
                          
                          {/* Title */}
                          <div className="break-words">
                            <p className="font-medium text-sm leading-relaxed">{pr.title}</p>
                          </div>
                          
                          {/* Metadata */}
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <span>Author: {pr.author || 'Unknown'}</span>
                              <span>{formatDateOnly(pr.created_at)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600 dark:text-green-400">+{pr.additions}</span>
                                <span className="text-red-600 dark:text-red-400">-{pr.deletions}</span>
                                <span>{pr.changed_files} files</span>
                              </div>
                              
                              {scanJob ? (
                                <ScanStatusBadge status={scanJob.status} />
                              ) : (
                                <span className="text-xs text-muted-foreground">No scan</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Labels */}
                          {pr.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {pr.draft && (
                                <Badge variant="outline" className="text-xs">
                                  Draft
                                </Badge>
                              )}
                              {pr.labels.slice(0, 3).map((label) => (
                                <Badge key={label} variant="secondary" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                              {pr.labels.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{pr.labels.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAutoFix(pr.number)}
                              disabled={isAutoFixing}
                              className={`gap-1 flex-1 ${isAutoFixing ? 'text-blue-600 dark:text-blue-400' : 'border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}
                              title="Auto-fix security issues"
                            >
                              {isAutoFixing ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Fixing...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-3 w-3" />
                                  Auto-Fix
                                </>
                              )}
                            </Button>
                            <PRActionsMenu pr={pr} />
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Desktop: Regular table view */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPRs.length === pullRequests.length && pullRequests.length > 0}
                        onCheckedChange={onSelectAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-[80px]">PR</TableHead>
                    <TableHead className="min-w-[200px]">Title</TableHead>
                    <TableHead className="min-w-[100px]">Author</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Changes</TableHead>
                    <TableHead className="min-w-[100px]">Security</TableHead>
                    <TableHead className="min-w-[100px]">Created</TableHead>
                    <TableHead className="min-w-[150px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <PRTableSkeleton key={index} />
                    ))
                  ) : (
                    pullRequests.map((pr) => {
                      const scanJob = getPRScanStatus(pr.number)
                      const isSelected = selectedPRs.includes(pr.number)
                      const isAutoFixing = autoFixingPRs[pr.number]

                      return (
                        <TableRow key={pr.number} className={isSelected ? 'bg-muted/50' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => onPRSelect(pr.number, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">#{pr.number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="font-medium break-words leading-relaxed">{pr.title}</p>
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                {pr.draft && (
                                  <Badge variant="outline" className="text-xs">
                                    Draft
                                  </Badge>
                                )}
                                {pr.labels.slice(0, 2).map((label) => (
                                  <Badge key={label} variant="secondary" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                                {pr.labels.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{pr.labels.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="break-words">{pr.author || 'Unknown'}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStateColor(pr.state)}>
                              {pr.state}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600 dark:text-green-400">+{pr.additions}</span>
                                <span className="text-red-600 dark:text-red-400">-{pr.deletions}</span>
                              </div>
                              <span className="text-muted-foreground text-xs">
                                {pr.changed_files} files
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {scanJob ? (
                              <ScanStatusBadge status={scanJob.status} />
                            ) : (
                              <span className="text-xs text-muted-foreground">No scan</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="break-words">{formatDateOnly(pr.created_at)}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAutoFix(pr.number)}
                                disabled={isAutoFixing}
                                className={`gap-1 ${isAutoFixing ? 'text-blue-600 dark:text-blue-400' : 'border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}
                                title="Auto-fix security issues"
                              >
                                {isAutoFixing ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span className="hidden md:inline">Fixing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="h-3 w-3" />
                                    <span className="hidden md:inline">Auto-Fix</span>
                                  </>
                                )}
                              </Button>
                              <PRActionsMenu pr={pr} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PR Details Dialog */}
      {selectedPR && (
        <PRDetailsDialog
          isOpen={!!selectedPR}
          onClose={() => setSelectedPR(null)}
          pullRequest={selectedPR}
          repositoryFullName={repositoryFullName}
        />
      )}
    </div>
  )
}