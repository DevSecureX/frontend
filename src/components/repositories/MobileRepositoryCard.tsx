import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimezone } from '@/contexts/TimezoneContext'
import { 
  GitBranch, 
  Clock, 
  Eye, 
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Timer,
  AlertTriangle,
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useRepositoryStore, useScanStore } from '@/store'
import type { Repository } from '@/types/global'
import { RepositoryDetailsDialog } from './RepositoryDetailsDialog'
import { toast } from 'sonner'

interface MobileRepositoryCardProps {
  repository: Repository
  onDisconnect?: () => void
}

export function MobileRepositoryCard({ 
  repository, 
  onDisconnect 
}: MobileRepositoryCardProps) {
  const { formatDate } = useTimezone()
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const navigate = useNavigate()
  const { triggerScan } = useScanStore()

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
      <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200 touch-manipulation">
        {/* Status Stripe */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          repository.status === 'active' ? 'bg-green-500' :
          repository.status === 'scanning' ? 'bg-blue-500 animate-pulse' :
          repository.status === 'error' ? 'bg-red-500' :
          'bg-gray-400'
        }`} />
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title Section */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 rounded bg-gray-100 dark:bg-gray-700">
                  <GitBranch className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight truncate text-gray-900 dark:text-white">
                    {repository.full_name.split('/')[1]}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {repository.full_name.split('/')[0]}
                  </p>
                </div>
              </div>
              
              {/* Status & Tags */}
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                  repository.status === 'active' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50' :
                  repository.status === 'scanning' ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50' :
                  repository.status === 'error' ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50' :
                  'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                }`}>
                  {getStatusIcon(repository.status)}
                  <span className="capitalize">{repository.status}</span>
                </div>
                {repository.language && (
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 text-xs rounded font-medium">
                    {repository.language}
                  </span>
                )}
                {repository.is_private === 'true' && (
                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 text-xs rounded font-medium">
                    Private
                  </span>
                )}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {/* Expand Toggle */}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 touch-manipulation"
                onClick={() => setShowDetails(!showDetails)}
                aria-label={showDetails ? "Hide details" : "Show details"}
              >
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${
                  showDetails ? 'rotate-180' : ''
                }`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Primary Action */}
          <Button 
            size="default" 
            onClick={() => void handleQuickScan()}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 font-medium text-sm rounded-lg transition-all duration-200 touch-manipulation hover:shadow-lg active:scale-95 disabled:active:scale-100"
            disabled={repository.status === 'scanning' || isScanning}
          >
            {repository.status === 'scanning' || isScanning ? (
              <>
                <Timer className="mr-2 h-4 w-4 animate-pulse" />
                Scanning...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Complete Scan
              </>
            )}
          </Button>
          
          {/* Expandable Details */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {repository.description ?? (
                    <span className="text-gray-500 dark:text-gray-400 italic">
                      No description available
                    </span>
                  )}
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Default Branch</span>
                  </div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {repository.default_branch ?? 'main'}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Project Type</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {repository.niche}
                  </p>
                </div>
              </div>
              
              {repository.last_synced && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Last Synced</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(repository.last_synced)}
                  </p>
                </div>
              )}
              
              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void navigate('/scans', { state: { selectedRepo: repository.full_name } })}
                  className="h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200 touch-manipulation"
                >
                  <TrendingUp className="mr-2 h-3 w-3" />
                  View Scans
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetailsDialog(true)}
                  className="h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200 touch-manipulation"
                >
                  <Eye className="mr-2 h-3 w-3" />
                  Details
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 touch-manipulation h-8 text-sm"
              >
                <a 
                  href={`https://github.com/${repository.full_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on GitHub
                </a>
              </Button>
            </div>
          )}
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