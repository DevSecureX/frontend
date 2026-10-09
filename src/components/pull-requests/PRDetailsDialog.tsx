import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  GitPullRequest, 
  Shield, 
  Zap, 
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  Play,
  Loader2,
  AlertTriangle,
  Info
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { PRSecurityInsights } from './PRSecurityInsights'
import { PRImpactAnalysis } from './PRImpactAnalysis'
import { useScanStore } from '@/store'
import { scansAPI } from '@/lib/api/scans'
import type { PullRequest } from '@/types/global'

interface PRDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  pullRequest: PullRequest
  repositoryFullName: string
}

export function PRDetailsDialog({
  isOpen,
  onClose,
  pullRequest,
  repositoryFullName
}: PRDetailsDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('insights')
  const [isAutoFixing, setIsAutoFixing] = useState(false)
  const [isCreatingCheck, setIsCreatingCheck] = useState(false)
  const [autoFixResults, setAutoFixResults] = useState<any>(null)
  const { scanPullRequest } = useScanStore()

  const handleAutoFix = async (issueIds: string[]) => {
    setIsAutoFixing(true)
    
    toast({
      title: '🔧 Creating Security Fixes',
      description: `DevSecureX is analyzing security issues and creating fixes for PR #${pullRequest.number}. This may take up to 2 minutes...`
    })
    
    try {
      const result = await scansAPI.createPRAutoFix(
        repositoryFullName,
        pullRequest.number,
        issueIds,
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
              <p>DevSecureX is applying security fixes to PR #{pullRequest.number}.</p>
              <p className="text-sm text-muted-foreground">{result.message}</p>
              <p className="text-sm">Estimated time: {result.estimated_time || '30-120 seconds'}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://github.com/${repositoryFullName}/pulls`, '_blank')}
                className="w-full"
              >
                View GitHub PRs →
              </Button>
            </div>
          )
        })
      } else {
        // Direct execution response (when use_queue=false or fallback)
        toast({
          title: '✅ Security Fixes Applied Successfully!',
          description: (
            <div className="space-y-2">
              <p>{result.fixed_count} security issues fixed in PR #{pullRequest.number}</p>
              {result.fix_pr_url && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔗 New security fix PR created:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(result.fix_pr_url, '_blank')}
                    className="h-6 px-2 text-xs"
                  >
                    View Security Fix PR →
                  </Button>
                </div>
              )}
            </div>
          )
        })
      }
    } catch (error: any) {
      console.error('Auto-fix error:', error)
      
      if (error.name === 'TimeoutError') {
        toast({
          variant: 'destructive',
          title: '⏰ Auto-Fix Taking Longer Than Expected',
          description: (
            <div className="space-y-2">
              <p>The security fix process for PR #{pullRequest.number} is still running in the background.</p>
              <p>Check your repository in a few minutes for a new PR with the fixes.</p>
            </div>
          )
        })
      } else if (error.name === 'RetryableError' && error.status === 503) {
        // 503 Service Unavailable - auto-fix is processing in background
        toast({
          title: '⚡ Auto-Fix Processing in Background',
          description: (
            <div className="space-y-3">
              <p>DevSecureX is applying security fixes to PR #{pullRequest.number}.</p>
              <p>A new PR with fixes will be created shortly. Check GitHub in 1-2 minutes.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://github.com/${repositoryFullName}/pulls`, '_blank')}
                className="w-full"
              >
                View GitHub PRs →
              </Button>
            </div>
          )
        })
      } else {
        toast({
          variant: 'destructive',
          title: '❌ Auto-Fix Failed',
          description: error.message || 'Unable to apply automatic fixes. Please try again.'
        })
      }
    } finally {
      setIsAutoFixing(false)
    }
  }

  const handleCreateGitHubCheck = async () => {
    setIsCreatingCheck(true)
    
    try {
      const result = await scansAPI.createPRGitHubCheck(
        repositoryFullName,
        pullRequest.number
      )
      
      toast({
        title: result.type === 'pr_comment' ? 'Security Comment Posted' : 'GitHub Check created',
        description: result.type === 'pr_comment' 
          ? 'Security analysis posted as PR comment' 
          : `Created check with ${result.annotations_count || 0} annotations`,
        action: result.comment_url || result.check_url ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(result.comment_url || result.check_url, '_blank')}
          >
            {result.type === 'pr_comment' ? 'View Comment' : 'View Check'}
          </Button>
        ) : undefined
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create security comment',
        description: 'Please ensure you have the necessary permissions.'
      })
    } finally {
      setIsCreatingCheck(false)
    }
  }

  const handleQuickScan = async () => {
    try {
      // Backend now runs comprehensive scans with ALL security tools automatically
      await scanPullRequest(repositoryFullName, pullRequest.number, {
        include_custom_rules: false,
        include_community_rules: false,
        selected_custom_rule_ids: [],
        selected_community_rule_ids: []
      })
      
      toast({
        title: 'Complete security scan started',
        description: 'Comprehensive A-to-Z security analysis initiated for this PR (5-8 minutes)'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Scan failed',
        description: 'Unable to start scan. Please try again.'
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col p-3 sm:p-6">
        <DialogHeader className="flex-shrink-0">
          <div className="space-y-2">
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
              <div className="flex items-center gap-2 min-w-0">
                <GitPullRequest className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium">PR #{pullRequest.number}</span>
              </div>
              <span className="break-words leading-relaxed sm:leading-normal">{pullRequest.title}</span>
            </DialogTitle>
            <DialogDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="break-words">by {pullRequest.author}</span>
              <div className="flex items-center gap-2">
                <Badge variant={pullRequest.state === 'open' ? 'default' : 'secondary'} className="text-xs">
                  {pullRequest.state}
                </Badge>
                {pullRequest.draft && (
                  <Badge variant="outline" className="text-xs">Draft</Badge>
                )}
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Mobile-Responsive Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-y flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 flex-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleQuickScan}
              className="w-full sm:w-auto"
            >
              <Play className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">Complete Scan</span>
              <span className="xs:hidden">Scan</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateGitHubCheck}
              disabled={isCreatingCheck}
              className="w-full sm:w-auto"
            >
              {isCreatingCheck ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  <span className="hidden xs:inline">Creating...</span>
                  <span className="xs:hidden">...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Security Comment</span>
                  <span className="xs:hidden">Comment</span>
                </>
              )}
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            asChild
            className="w-full sm:w-auto"
          >
            <a 
              href={pullRequest.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">View on GitHub</span>
              <span className="xs:hidden">GitHub</span>
            </a>
          </Button>
        </div>

        {/* Mobile-Optimized Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="insights" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Security Analysis</span>
              <span className="xs:hidden">Security</span>
            </TabsTrigger>
            <TabsTrigger value="impact" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">PR Impact</span>
              <span className="xs:hidden">Impact</span>
            </TabsTrigger>
          </TabsList>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto mt-2 sm:mt-4 min-h-0 px-1">
            <TabsContent value="insights" className="mt-0 h-full">
              <PRSecurityInsights
                repositoryFullName={repositoryFullName}
                prNumber={pullRequest.number}
                prTitle={pullRequest.title}
                onAutoFix={handleAutoFix}
              />
            </TabsContent>

            <TabsContent value="impact" className="mt-0 h-full">
              <PRImpactAnalysis
                repositoryFullName={repositoryFullName}
                pullRequest={pullRequest}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


// Auto-Fix Results Component
function AutoFixResults({ 
  results, 
  repositoryFullName, 
  prNumber 
}: { 
  results: any
  repositoryFullName: string
  prNumber: number 
}) {
  if (!results) {
    return (
      <div className="text-center py-12">
        <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Auto-Fix Results Yet</h3>
        <p className="text-muted-foreground">
          Click "Auto-Fix All" to apply automatic security fixes to this PR.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">
            Auto-Fix Complete
          </h3>
        </div>
        <p className="text-green-700 dark:text-green-300 text-lg">
          Successfully fixed {results.fixed_count} security issues
        </p>
        {results.message && (
          <p className="text-green-600 dark:text-green-400 text-sm mt-2">
            {results.message}
          </p>
        )}
      </div>

      {/* Fix Details */}
      <div className="grid gap-4">
        <div className="bg-card rounded-lg border p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Fix Details
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Issues Fixed</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {results.fixed_count}
              </Badge>
            </div>
            
            {results.fixed_files && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Files Modified</span>
                <Badge variant="outline">
                  {results.fixed_files.length} files
                </Badge>
              </div>
            )}
            
            {results.fix_branch && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fix Branch</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {results.fix_branch}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Files List */}
        {results.fixed_files && results.fixed_files.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Modified Files
            </h4>
            <div className="space-y-2">
              {results.fixed_files.map((file: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <code className="bg-muted px-2 py-1 rounded">{file}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pull Request Link */}
        {results.fix_pr_url && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2 text-green-800 dark:text-green-200">
              <GitPullRequest className="h-5 w-5" />
              ✅ Security Fix Pull Request Created
            </h4>
            <p className="text-green-700 dark:text-green-300 mb-4">
              A new pull request has been created with the security fixes. Review the changes and merge when ready to apply the fixes to your codebase.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <a 
                  href={results.fix_pr_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  🔗 View Security Fix Pull Request
                </a>
              </Button>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">PR Link:</span>
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1 block break-all">
                  {results.fix_pr_url}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Info className="h-5 w-5" />
            Next Steps
          </h4>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">1.</span>
              Review the automatically generated fixes in the pull request
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">2.</span>
              Test the changes to ensure functionality is preserved
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">3.</span>
              Merge the security fixes when satisfied with the changes
            </li>
            {results.fix_branch && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">4.</span>
                Clean up the fix branch after merging
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}