import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimezone } from '@/contexts/TimezoneContext'
import { 
  GitBranch, 
  Clock, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Trash2, 
  ExternalLink,
  MoreVertical,
  Scan,
  GitPullRequest,
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Timer,
  Activity
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
import { useRepositoryStore, useScanStore } from '@/store'
import type { Repository } from '@/types/global'
import { RepositoryDetailsDialog } from './RepositoryDetailsDialog'
import { toast } from 'sonner'

interface RepositoryCardProps {
  repository: Repository
  onDisconnect?: () => void
}

export function RepositoryCard({ 
  repository, 
  onDisconnect 
}: RepositoryCardProps) {
  const { formatDate } = useTimezone()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const navigate = useNavigate()
  const { disconnectRepository } = useRepositoryStore()
  const { triggerScan } = useScanStore()

  const handleDisconnect = async () => {
    try {
      setIsDeleting(true)
      await disconnectRepository(repository.full_name)
      onDisconnect?.()
    } catch (error) {
      console.error('Failed to disconnect repository:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleQuickScan = async () => {
    try {
      setIsScanning(true)
      toast.loading(`Starting complete security scan for ${repository.full_name}...`, { id: 'scan-start' })
      
      // Backend now runs comprehensive scans with ALL security tools automatically
      await triggerScan({
        repo_full_name: repository.full_name,
        branch: repository.default_branch,
        niche: repository.niche || 'all'
        // No need for include_custom_rules flags - handled by backend
      })
      
      toast.success('Complete security scan initiated successfully! (8-15 minutes)', { id: 'scan-start' })
    } catch (error) {
      console.error('Failed to start scan:', error)
      toast.error('Failed to start complete security scan. Please try again.', { id: 'scan-start' })
    } finally {
      setIsScanning(false)
    }
  }

  const handlePRScan = () => {
    // Navigate to pull requests page with pre-selected repository
    void navigate('/pull-requests', { state: { selectedRepo: repository.full_name } })
  }

  // Removed the old color functions as they're no longer needed with the new design

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'scanning':
        return <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'inactive':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <>
    <Card 
      className="group relative transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer focus-within:shadow-lg focus-within:shadow-blue-500/20 dark:focus-within:shadow-blue-400/20 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      role="article"
      aria-label={`Repository ${repository.full_name}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setShowDetailsDialog(true)
        }
      }}
    >
      {/* Status Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${
        repository.status === 'active' ? 'bg-green-500' :
        repository.status === 'scanning' ? 'bg-blue-500 animate-pulse' :
        repository.status === 'error' ? 'bg-red-500' :
        'bg-gray-400'
      }`} />
      
      
      
      <CardHeader className="pb-3 pt-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Repository Name & Owner */}
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-gray-100 dark:bg-gray-700">
                <GitBranch className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold truncate text-gray-900 dark:text-white">
                  {repository.full_name.split('/')[1]}
                </CardTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {repository.full_name.split('/')[0]}
                  </span>
                  {repository.is_private === 'true' && (
                    <Badge variant="outline" className="text-xs h-4 px-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Status & Metadata */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant={repository.status === 'active' ? 'default' : repository.status === 'scanning' ? 'secondary' : repository.status === 'error' ? 'destructive' : 'outline'} className="gap-1 capitalize text-xs h-5 px-2">
                {getStatusIcon(repository.status)}
                {repository.status}
              </Badge>
              
              {repository.language && (
                <Badge variant="outline" className="text-xs h-5 px-2">
                  {repository.language}
                </Badge>
              )}
              
              <Badge variant="outline" className="text-xs capitalize h-5 px-2">
                {repository.niche}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                aria-label={`More actions for ${repository.full_name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Repository Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void handleQuickScan()} className="gap-2">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="font-medium">Complete Security Scan</div>
                  <div className="text-xs text-muted-foreground">Comprehensive analysis with all tools</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void handlePRScan()} className="gap-2">
                <GitPullRequest className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <div>
                  <div className="font-medium">PR Scan</div>
                  <div className="text-xs text-muted-foreground">Scan pull requests</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDetailsDialog(true)} className="gap-2">
                <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <div className="font-medium">View Details</div>
                  <div className="text-xs text-muted-foreground">See full information</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a 
                  href={`https://github.com/${repository.full_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full"
                  onClick={(e) => { 
                    e.stopPropagation()
                    return false
                  }}
                >
                  <ExternalLink className="h-4 w-4 text-gray-600" />
                  <div>
                    <div className="font-medium">Open GitHub</div>
                    <div className="text-xs text-muted-foreground">View source code</div>
                  </div>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                    <Trash2 className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Disconnect</div>
                      <div className="text-xs text-muted-foreground">Remove from platform</div>
                    </div>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect Repository</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to disconnect "{repository.full_name}"? 
                      This will remove it from security scanning and delete all associated scan history.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => void handleDisconnect()}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Disconnecting...' : 'Disconnect'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0 relative z-10">
        {/* Description */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
          {repository.description ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed truncate cursor-help">
                    {repository.description}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3">
                  <p className="text-sm leading-relaxed">{repository.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed">
              No description available
            </p>
          )}
        </div>

        {/* Compact Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700/50">
            <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded">
              <GitBranch className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Branch</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{repository.default_branch ?? 'main'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700/50">
            <div className="p-1 bg-purple-50 dark:bg-purple-900/30 rounded">
              <Activity className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate capitalize">{repository.niche}</p>
            </div>
          </div>
        </div>

        {/* Last Sync */}
        {repository.last_synced && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700/50">
            <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded">
              <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last Synced</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(repository.last_synced)}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={() => void handleQuickScan()}
            className="flex-1 h-9 text-sm font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            disabled={repository.status === 'scanning' || isScanning}
            aria-label={`${repository.status === 'scanning' || isScanning ? 'Complete security scan in progress' : 'Start complete security scan'} for ${repository.full_name}`}
          >
            {repository.status === 'scanning' || isScanning ? (
              <>
                <Timer className="mr-2 h-4 w-4 animate-pulse" aria-hidden="true" />
                Scanning...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
                Complete Scan
              </>
            )}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => void navigate('/scans', { state: { selectedRepo: repository.full_name } })}
            aria-label={`View scan history for ${repository.full_name}`}
            className="flex-1 h-9 text-sm font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-gray-400 active:translate-y-0"
          >
            <TrendingUp className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
            <span className="hidden sm:inline">View Scans</span>
            <span className="sm:hidden">Scans</span>
          </Button>
        </div>
      </CardContent>
    </Card>
    
    {/* Repository Details Dialog */}
    <RepositoryDetailsDialog
      repository={repository}
      open={showDetailsDialog}
      onOpenChange={setShowDetailsDialog}
    />
  </>
  )
}