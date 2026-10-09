import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTimezone } from '@/contexts/TimezoneContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  Info, 
  FileText, 
  GitBranch,
  Clock,
  Hash,
  Trash2,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Settings,
  Wrench,
  Bug,
  TrendingUp,
  Activity,
  Target,
  Users,
  Building,
  Database,
  Layers,
  Gauge,
  Sparkles,
  Copy,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useScanStore } from '@/store'
import { useTheme } from '@/lib/theme'
import { scansAPI } from '@/lib/api/scans'
import { AutofixProgressCard } from '@/components/scans'
import type { Issue, AIExplanationResponse, AutofixJobStatus } from '@/lib/api/scans'
import type { SecurityIssue } from '@/types/global'

export function ScanDetailsPage() {
  const { formatDate } = useTimezone()
  const { scanId } = useParams<{ scanId: string }>()
  const navigate = useNavigate()
  const { effectiveTheme: theme } = useTheme()
  const { 
    currentScan, 
    isLoading, 
    error, 
    fetchScanDetails, 
    deleteScan,
    getAIExplanation,
    submitIssueFeedback 
  } = useScanStore()

  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())
  const [aiExplanations, setAiExplanations] = useState<Record<string, AIExplanationResponse>>({})
  const [loadingExplanations, setLoadingExplanations] = useState<Set<string>>(new Set())
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [fixResult, setFixResult] = useState<{
    pr_url?: string
    fixed_count?: number
    message?: string
  } | null>(null)
  
  // Autofix Queue State
  const [currentAutofixJob, setCurrentAutofixJob] = useState<AutofixJobStatus | null>(null)
  const [isStartingAutofix, setIsStartingAutofix] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (scanId) {
      void fetchScanDetails(scanId)
    }
  }, [scanId, fetchScanDetails])

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  // Scroll to top when component mounts or scanId changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [scanId])


  // Start polling for autofix job status
  const startAutofixPolling = useCallback((jobId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    
    const pollJobStatus = async () => {
      try {
        const jobStatus = await scansAPI.getAutofixJobStatus(jobId)
        setCurrentAutofixJob(jobStatus)
        
        // Stop polling if job is completed/failed/cancelled
        if (['completed', 'failed', 'cancelled'].includes(jobStatus.status)) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          
          // Update fix result if completed successfully
          if (jobStatus.status === 'completed' && jobStatus.result) {
            setFixResult({
              pr_url: jobStatus.result.pr_url,
              fixed_count: jobStatus.result.fixed_count,
              message: jobStatus.result.message
            })
            toast.success(`Auto-fix completed! Fixed ${jobStatus.result.fixed_count} security issues.`)
            
            if (jobStatus.result.pr_url) {
              toast.success('Pull request created with fixes!', {
                action: {
                  label: 'View PR',
                  onClick: () => window.open(jobStatus.result!.pr_url, '_blank')
                }
              })
            }
          } else if (jobStatus.status === 'failed') {
            toast.error(`Auto-fix failed: ${jobStatus.error_message ?? 'Unknown error'}`)
          } else if (jobStatus.status === 'cancelled') {
            toast.info('Auto-fix job was cancelled')
          }
          
          setIsStartingAutofix(false)
          setIsFixing(false)
        }
        
        
      } catch (error: unknown) {
        console.error('Failed to poll autofix job status:', error)
        
        // If job not found, stop polling
        if ((error as any)?.response?.status === 404) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          setCurrentAutofixJob(null)
          setIsStartingAutofix(false)
          setIsFixing(false)
          toast.error('Auto-fix job not found or expired')
        }
      }
    }
    
    // Start immediate poll then set up interval
    void pollJobStatus()
    pollingIntervalRef.current = setInterval(() => {
      void pollJobStatus()
    }, 3000) // Poll every 3 seconds
  }, [])


  const handleDelete = async () => {
    if (!scanId) return
    
    try {
      setIsDeleting(true)
      await deleteScan(scanId)
      toast.success('Scan deleted successfully')
      void navigate(-1)
    } catch (error) {
      console.error('Failed to delete scan:', error)
      toast.error('Failed to delete scan')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = async () => {
    if (!scanId || !currentScan) return
    
    try {
      setIsExporting(true)
      toast.info('Generating PDF report...')
      
      const blob = await scansAPI.exportScanReport(scanId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `DevSecureX-${currentScan.repo_full_name?.replace('/', '-')}-${currentScan.branch}-${scanId.slice(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Report exported successfully!')
    } catch (error) {
      console.error('Failed to export scan report:', error)
      toast.error('Failed to export report. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleAutoFix = async () => {
    if (!scanId || !currentScan) return
    
    try {
      setIsStartingAutofix(true)
      setIsFixing(true)
      
      // Smart severity filtering based on issue count
      const totalIssues = currentScan.issues.length
      const criticalIssues = currentScan.issues.filter(i => i.severity === 'critical').length
      const highIssues = currentScan.issues.filter(i => i.severity === 'high').length
      
      let severityFilter: string[]
      let priority: 'low' | 'normal' | 'high' = 'normal'
      let toastMessage: string
      
      if (totalIssues > 50) {
        // For large scans, only fix critical issues with high priority
        severityFilter = ['critical']
        priority = 'high'
        toastMessage = `Queueing auto-fix for ${criticalIssues} critical security issues (large scan detected)...`
      } else if (totalIssues > 20) {
        // For medium scans, fix critical and high with normal priority
        severityFilter = ['critical', 'high']
        priority = 'normal'
        toastMessage = `Queueing auto-fix for ${criticalIssues + highIssues} critical and high severity issues...`
      } else {
        // For small scans, fix all with normal priority
        severityFilter = ['critical', 'high', 'medium']
        priority = 'normal'
        toastMessage = 'Queueing comprehensive security auto-fix...'
      }
      
      toast.info(toastMessage)
      
      // Start async autofix job through queue system
      const response = await scansAPI.startAutofixJob(
        scanId,
        true, // create PR
        severityFilter,
        priority
      )
      
      // Show success message with improved UX
      toast.success('Auto-fix job queued successfully!', {
        description: response.estimated_duration && response.estimated_duration > 0 && !isNaN(response.estimated_duration)
          ? `Estimated completion time: ${Math.ceil(response.estimated_duration / 60)} minutes`
          : 'Your security fixes are being processed and will be ready soon'
      })
      
      // Start polling for job status
      startAutofixPolling(response.job_id)
      
      
    } catch (error: any) {
      console.error('Failed to start auto-fix job:', error)
      setIsStartingAutofix(false)
      setIsFixing(false)
      
      if ((error)?.response?.data?.detail?.includes('PR scans')) {
        toast.error('Auto-fix is currently only available for PR scans')
      } else if ((error)?.response?.data?.detail?.includes('already in progress')) {
        toast.error('An auto-fix job is already in progress for this scan')
      } else {
        toast.error(`Failed to start auto-fix job: ${(error)?.response?.data?.detail ?? (error)?.message}`)
      }
    }
  }
  
  // Cancel autofix job
  const handleCancelAutofix = async () => {
    if (!currentAutofixJob) return
    
    try {
      await scansAPI.cancelAutofixJob(currentAutofixJob.job_id)
      toast.info('Auto-fix job cancelled successfully')
      
      // Stop polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      
      setCurrentAutofixJob(null)
      setIsFixing(false)
      setIsStartingAutofix(false)
      
    } catch (error: unknown) {
      console.error('Failed to cancel auto-fix job:', error)
      toast.error(`Failed to cancel auto-fix job: ${(error as any)?.response?.data?.detail ?? (error as any)?.message}`)
    }
  }
  
  // Retry failed autofix
  const handleRetryAutofix = async () => {
    // Reset states and retry
    setCurrentAutofixJob(null)
    setFixResult(null)
    await handleAutoFix()
  }
  
  // Close autofix progress card
  const handleCloseAutofixProgress = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    setCurrentAutofixJob(null)
    setIsFixing(false)
    setIsStartingAutofix(false)
  }

  const toggleIssueExpanded = (issueId: string) => {
    setExpandedIssues(prev => {
      const newSet = new Set(prev)
      if (newSet.has(issueId)) {
        newSet.delete(issueId)
      } else {
        newSet.add(issueId)
      }
      return newSet
    })
  }

  const fetchAIExplanation = async (issue: Issue) => {
    if (!issue.id || !issue.tool || !issue.rule_id || !issue.category) return
    
    const key = `${issue.tool}_${issue.rule_id}_${issue.category}`
    if (aiExplanations[key] || loadingExplanations.has(key)) return

    setLoadingExplanations(prev => new Set(prev).add(key))
    
    try {
      const explanation = await getAIExplanation(
        issue.tool,
        issue.rule_id,
        issue.category,
        issue.severity
      )
      setAiExplanations(prev => ({ ...prev, [key]: explanation }))
    } catch (error) {
      console.error('Failed to fetch AI explanation:', error)
      toast.error('Failed to get AI explanation')
    } finally {
      setLoadingExplanations(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }

  const _markAsFalsePositive = async (issueId: string) => {
    try {
      await submitIssueFeedback(issueId, {
        is_false_positive: true,
        feedback_reason: 'Marked as false positive by user'
      })
      toast.success('Issue marked as false positive')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      toast.error('Failed to submit feedback')
    }
  }

  const getSeverityColor = (severity: string) => {
    const isDark = theme === 'dark'
    switch (severity.toLowerCase()) {
      case 'critical':
        return isDark 
          ? 'bg-red-950/50 text-red-300 border-red-800 hover:bg-red-950/70'
          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      case 'high':
        return isDark 
          ? 'bg-orange-950/50 text-orange-300 border-orange-800 hover:bg-orange-950/70'
          : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
      case 'medium':
        return isDark 
          ? 'bg-yellow-950/50 text-yellow-300 border-yellow-800 hover:bg-yellow-950/70'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
      case 'low':
        return isDark 
          ? 'bg-blue-950/50 text-blue-300 border-blue-800 hover:bg-blue-950/70'
          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'info':
        return isDark 
          ? 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800/70'
          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
      default:
        return isDark 
          ? 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800/70'
          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />
      case 'high':
        return <AlertCircle className="h-4 w-4" />
      case 'medium':
        return <AlertCircle className="h-4 w-4" />
      case 'low':
        return <Info className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getScoreColor = (score: number) => {
    const isDark = theme === 'dark'
    if (score >= 80) return isDark ? 'text-emerald-400' : 'text-emerald-600'
    if (score >= 60) return isDark ? 'text-amber-400' : 'text-amber-600'
    if (score >= 40) return isDark ? 'text-orange-400' : 'text-orange-600'
    return isDark ? 'text-red-400' : 'text-red-600'
  }

  const getScoreGradient = (score: number) => {
    const isDark = theme === 'dark'
    if (score >= 80) return isDark 
      ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
      : 'bg-gradient-to-r from-emerald-500 to-green-500'
    if (score >= 60) return isDark 
      ? 'bg-gradient-to-r from-amber-600 to-yellow-600' 
      : 'bg-gradient-to-r from-amber-500 to-yellow-500'
    if (score >= 40) return isDark 
      ? 'bg-gradient-to-r from-orange-600 to-red-600' 
      : 'bg-gradient-to-r from-orange-500 to-red-500'
    return isDark 
      ? 'bg-gradient-to-r from-red-600 to-rose-600' 
      : 'bg-gradient-to-r from-red-500 to-rose-500'
  }


  const getIssueDisplayProps = (issue: SecurityIssue) => {
    const isDark = theme === 'dark'
    return {
      badgeVariant: 'secondary' as const,
      containerClass: isDark 
        ? 'hover:shadow-md transition-all duration-200 border-l-4 border-l-slate-600 hover:border-l-slate-500'
        : 'hover:shadow-md transition-all duration-200 border-l-4 border-l-slate-200 hover:border-l-slate-300',
      iconClass: '',
      icon: getSeverityIcon(issue.severity)
    }
  }

  const getLanguageFromFile = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js': case 'jsx': return 'javascript'
      case 'ts': case 'tsx': return 'typescript'
      case 'py': return 'python'
      case 'java': return 'java'
      case 'go': return 'go'
      case 'rs': return 'rust'
      case 'cpp': case 'cc': case 'cxx': return 'cpp'
      case 'c': return 'c'
      case 'php': return 'php'
      case 'rb': return 'ruby'
      case 'tf': return 'hcl'
      case 'yaml': case 'yml': return 'yaml'
      case 'json': return 'json'
      case 'xml': return 'xml'
      case 'html': return 'html'
      case 'css': return 'css'
      case 'sh': case 'bash': return 'bash'
      case 'sql': return 'sql'
      case 'md': return 'markdown'
      default: return 'text'
    }
  }

  const ToolsUsedTooltip = ({ tools }: { tools: string[] }) => (
    <TooltipProvider>
      <TooltipPrimitive.Root delayDuration={300}>
        <TooltipPrimitive.Trigger asChild>
          <span className={`text-sm font-medium cursor-help border-b border-dotted ${
            theme === 'dark' 
              ? 'text-slate-300 hover:text-slate-100 border-slate-500'
              : 'text-slate-600 hover:text-slate-800 border-slate-400'
          }`}>
            {tools.length} tools used
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content 
            side="bottom" 
            align="center"
            sideOffset={8}
            avoidCollisions={false}
            collisionPadding={0}
            className={`w-80 p-4 shadow-2xl z-[99999] border-2 rounded-lg animate-in fade-in-0 zoom-in-95 ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-600 text-slate-200' 
                : 'bg-white border-slate-300 text-slate-800'
            }`}
            style={{ 
              maxWidth: '320px',
              minWidth: '320px'
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <p className={`font-semibold text-sm ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                }`}>Security Tools Used</p>
              </div>
              <div className="max-h-48 overflow-y-auto overflow-x-hidden">
                <div className="grid grid-cols-2 gap-2 text-sm pr-3">
                  {tools.map((tool, index) => (
                    <div key={index} className={`flex items-center gap-2 p-2 rounded-md border ${
                      theme === 'dark' 
                        ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    } transition-all duration-200`}>
                      <div className={`w-2 h-2 rounded-full ${
                        theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                      }`} />
                      <span className={`capitalize font-medium truncate ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                      }`} title={tool}>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`text-xs pt-2 border-t text-center ${
                theme === 'dark' 
                  ? 'text-slate-400 border-slate-700' 
                  : 'text-slate-500 border-slate-200'
              }`}>
                {tools.length} security {tools.length === 1 ? 'tool' : 'tools'} used in this scan
              </div>
            </div>
            <TooltipPrimitive.Arrow className={`${
              theme === 'dark' ? 'fill-slate-900' : 'fill-white'
            }`} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  )

  if (isLoading) {
    return (
      <div className={`min-h-screen -mx-4 -my-4 sm:-mx-6 sm:-my-6 lg:-mx-8 lg:-my-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/50'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50/50'
      }`}>
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className={`animate-pulse shadow-lg border-0 backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-slate-800/80'
                : 'bg-white/80'
            }`}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className={`shadow-lg border-0 backdrop-blur-sm ${
          theme === 'dark'
            ? 'bg-slate-800/80'
            : 'bg-white/80'
        }`}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  if (error || !currentScan) {
    return (
      <div className={`min-h-screen -mx-4 -my-4 sm:-mx-6 sm:-my-6 lg:-mx-8 lg:-my-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-red-900/20 via-slate-900 to-red-900/10'
          : 'bg-gradient-to-br from-red-50/30 via-white to-red-50/20'
      }`}>
        <Card className={`max-w-7xl mx-auto ${
          theme === 'dark'
            ? 'border-red-800/50 bg-red-900/20'
            : 'border-red-200 bg-red-50/50'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-700'
            }`}>
              <AlertTriangle className="h-5 w-5" />
              Error Loading Scan
            </CardTitle>
            <CardDescription className={`${
              theme === 'dark' ? 'text-red-300' : 'text-red-600'
            }`}>{error || 'Scan not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredIssues = currentScan.issues.filter(issue => {
    if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false
    return true
  })

  const categories = [...new Set(currentScan.issues.map(i => i.category).filter((cat): cat is string => Boolean(cat)))]
  const issueCounts = {
    critical: currentScan.issues.filter(i => i.severity === 'critical').length,
    high: currentScan.issues.filter(i => i.severity === 'high').length,
    medium: currentScan.issues.filter(i => i.severity === 'medium').length,
    low: currentScan.issues.filter(i => i.severity === 'low').length,
    info: currentScan.issues.filter(i => i.severity === 'info').length,
  }

  const totalIssues = currentScan.issues.length
  const scanDuration = currentScan.metadata.scan_duration || 0
  const scanDurationMinutes = Math.floor(scanDuration / 60)
  const scanDurationSeconds = Math.round(scanDuration % 60)

  return (
    <div className={`min-h-screen -mx-4 -my-4 sm:-mx-6 sm:-my-6 lg:-mx-8 lg:-my-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90' 
        : 'bg-gradient-to-br from-slate-50/80 via-white to-blue-50/20'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className={`rounded-full ${
                theme === 'dark' 
                  ? 'hover:bg-slate-800/80' 
                  : 'hover:bg-white/80'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                theme === 'dark' 
                  ? 'from-slate-100 to-slate-300' 
                  : 'from-slate-900 to-slate-700'
              }`}>
                Security Scan Analysis
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                <Badge variant="outline" className="font-medium">
                  <Activity className="mr-1 h-3 w-3" />
                  {currentScan.scan_type}
                </Badge>
                <Badge variant="outline" className="font-medium">
                  <GitBranch className="mr-1 h-3 w-3" />
                  {currentScan.branch}
                </Badge>
                <Badge variant="outline" className="font-medium">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDate(currentScan.created_at, { includeTime: true })}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Show Auto-Fix button if there are fixable issues */}
            {currentScan.issues.filter(i => ['critical', 'high', 'medium'].includes(i.severity)).length > 0 && (
              <Button 
                variant={fixResult !== null && !currentAutofixJob ? "outline" : "default"}
                size="default"
                onClick={handleAutoFix}
                disabled={isStartingAutofix || isFixing || (fixResult !== null && !currentAutofixJob) || (currentAutofixJob ? ['queued', 'processing'].includes(currentAutofixJob.status) : false)}
                className={`h-12 sm:h-10 px-4 text-base sm:text-sm min-h-[44px] shadow-sm transition-all duration-200 ${
                  fixResult && !currentAutofixJob 
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30' 
                    : currentAutofixJob && ['queued', 'processing'].includes(currentAutofixJob.status)
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600 dark:hover:border-slate-500 hover:shadow-md'
                }`}
                title={(() => {
                  if (currentAutofixJob) {
                    return `Auto-fix job ${currentAutofixJob.status} (${typeof currentAutofixJob.progress === 'number' ? currentAutofixJob.progress : currentAutofixJob.progress?.percentage || 0}%)`
                  }
                  
                  const totalIssues = currentScan.issues.length
                  const criticalIssues = currentScan.issues.filter(i => i.severity === 'critical').length
                  const highIssues = currentScan.issues.filter(i => i.severity === 'high').length
                  const mediumIssues = currentScan.issues.filter(i => i.severity === 'medium').length
                  const lowIssues = currentScan.issues.filter(i => i.severity === 'low').length
                  
                  return `Auto-fix will analyze and attempt to fix ALL ${totalIssues} security issues found in this scan (${criticalIssues} Critical, ${highIssues} High, ${mediumIssues} Medium, ${lowIssues} Low). A Pull Request will be created with the fixes.`
                })()}
              >
                {isStartingAutofix || (currentAutofixJob && currentAutofixJob.status === 'queued') ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    {isStartingAutofix ? 'Queueing...' : 'Queued'}
                  </>
                ) : (currentAutofixJob && currentAutofixJob.status === 'processing') ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin text-amber-500" />
                    Processing ({typeof currentAutofixJob.progress === 'number' ? currentAutofixJob.progress : currentAutofixJob.progress?.percentage || 0}%)
                  </>
                ) : fixResult && !currentAutofixJob ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Fixed {fixResult.fixed_count} Issues
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {(() => {
                      const totalIssues = currentScan.issues.length
                      
                      if (totalIssues === 0) {
                        return '✨ All Secure!'
                      } else {
                        const magicalTexts = [
                          '✨ Auto-Fix Security Issues',
                          '🛡️ Secure My Code',
                          '⚡ Apply Security Fixes',
                          '🔧 Fix Security Issues',
                          '🚀 Enhance Security'
                        ]
                        // Use a simple hash of scan length to consistently pick the same text
                        const index = totalIssues % magicalTexts.length
                        return magicalTexts[index]
                      }
                    })()}
                  </>
                )}
              </Button>
            )}
            
            
            {/* Reset button to try auto-fix again */}
            {(fixResult && !currentAutofixJob) && (
              <Button 
                variant="ghost" 
                size="default"
                onClick={() => {
                  setFixResult(null)
                }}
                className="h-12 sm:h-10 px-4 text-base sm:text-sm min-h-[44px] shadow-sm"
                title="Reset to try auto-fix again"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            
            
            <Button 
              variant="outline" 
              size="default"
              onClick={handleExport}
              disabled={isExporting}
              className="h-12 sm:h-10 px-4 text-base sm:text-sm min-h-[44px] shadow-sm"
            >
              {isExporting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isExporting ? 'Generating...' : 'Export Report'}
            </Button>
            <Button 
              variant="outline" 
              size="default"
              onClick={() => fetchScanDetails(scanId!)}
              className="h-12 sm:h-10 px-4 text-base sm:text-sm min-h-[44px] shadow-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="default" className="h-12 sm:h-10 px-4 text-base sm:text-sm min-h-[44px] shadow-sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Security Scan</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete this security scan and all associated data. 
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Scan'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Autofix Progress Card */}
        {currentAutofixJob && (
          <AutofixProgressCard
            job={currentAutofixJob}
            onCancel={handleCancelAutofix}
            onRetry={handleRetryAutofix}
            onClose={handleCloseAutofixProgress}
            className="mb-6"
          />
        )}
        

        {/* Show Fix Result Card if fixes were applied */}
        {fixResult && !currentAutofixJob && (
          <Card className={`overflow-hidden shadow-lg border-0 backdrop-blur-sm mb-6 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-800' 
              : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${
                theme === 'dark' ? 'text-green-300' : 'text-green-700'
              }`}>
                <CheckCircle className="h-5 w-5" />
                Security Issues Auto-Fixed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>Issues Fixed</p>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-700'
                  }`}>{fixResult.fixed_count || 0}</p>
                </div>
                <div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>Status</p>
                  <Badge variant="outline" className={`mt-1 ${
                    theme === 'dark' 
                      ? 'bg-green-900/50 text-green-300 border-green-700' 
                      : 'bg-green-100 text-green-700 border-green-300'
                  }`}>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Fixes Applied
                  </Badge>
                </div>
              </div>
              {fixResult.message && (
                <p className={`mt-4 text-sm ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>{fixResult.message}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enhanced Score Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className={`overflow-hidden shadow-lg border-0 backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-slate-800/80' 
              : 'bg-white/80'
          }`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                  }`}>
                    <Gauge className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>Security Score</span>
                </div>
                <Badge variant="outline" className={`text-xs ${
                  currentScan.total_score >= 80 ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800' :
                  currentScan.total_score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800' :
                  currentScan.total_score >= 40 ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800' :
                  'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                }`}>
                  {currentScan.total_score >= 80 ? 'Excellent' : 
                   currentScan.total_score >= 60 ? 'Good' : 
                   currentScan.total_score >= 40 ? 'Fair' : 'Poor'}
                </Badge>
              </div>
              <div className="flex items-end gap-1 mb-4">
                <div className={`text-3xl font-bold ${getScoreColor(currentScan.total_score)}`}>
                  {currentScan.total_score}
                </div>
                <div className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  /100
                </div>
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Overall security health
              </div>
            </CardContent>
          </Card>

          <Card className={`overflow-hidden shadow-lg border-0 backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-slate-800/80' 
              : 'bg-white/80'
          }`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'
                  }`}>
                    <Bug className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>Security Issues</span>
                </div>
                <Badge variant="outline" className="text-xs">Total</Badge>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
              }`}>{totalIssues}</div>
              <div className="flex flex-wrap items-center gap-1 overflow-hidden">
                {issueCounts.critical > 0 && (
                  <Badge className={`text-[10px] font-medium whitespace-nowrap px-1.5 py-0.5 ${
                    theme === 'dark' 
                      ? 'bg-red-950/50 text-red-300 border-red-800' 
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {issueCounts.critical} Critical
                  </Badge>
                )}
                {issueCounts.high > 0 && (
                  <Badge className={`text-[10px] font-medium whitespace-nowrap px-1.5 py-0.5 ${
                    theme === 'dark' 
                      ? 'bg-orange-950/50 text-orange-300 border-orange-800' 
                      : 'bg-orange-100 text-orange-700 border-orange-200'
                  }`}>
                    {issueCounts.high} High
                  </Badge>
                )}
                {/* TODO: Add anomalies support when data is available
                {issueCounts.anomalies > 0 && (
                  <Badge className={`text-[10px] font-medium border whitespace-nowrap px-1.5 py-0.5 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-amber-950/50 to-orange-950/50 text-amber-300 border-amber-800' 
                      : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200'
                  }`}>
                    <Zap className="mr-0.5 h-2.5 w-2.5" />
                    {issueCounts.anomalies} Anomalies
                  </Badge>
                )}
                */}
              </div>
            </CardContent>
          </Card>

          <Card className={`overflow-hidden shadow-lg border-0 backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-slate-800/80' 
              : 'bg-white/80'
          }`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                  }`}>
                    <Clock className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>Scan Duration</span>
                </div>
                <Badge variant="outline" className="text-xs">Runtime</Badge>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold mb-4 ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
              }`}>
                {scanDuration > 0 ? (
                  scanDurationMinutes > 0 
                    ? `${scanDurationMinutes}m ${scanDurationSeconds}s`
                    : `${scanDurationSeconds}s`
                ) : 'N/A'}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {currentScan.metadata.tools_used?.length ? (
                  <ToolsUsedTooltip tools={currentScan.metadata.tools_used} />
                ) : (
                  'No tools data'
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={`overflow-hidden shadow-lg border-0 backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-slate-800/80' 
              : 'bg-white/80'
          }`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'
                  }`}>
                    <Shield className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>Scan Details</span>
                </div>
                <Badge variant="outline" className="text-xs">Info</Badge>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold mb-4 ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
              }`}>
                {currentScan.branch}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className={`h-4 w-4 ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`} />
                  <span className={`capitalize ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>{currentScan.mode} • {currentScan.scope}</span>
                </div>
                {currentScan.metadata.commit_sha && (
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className={`h-4 w-4 ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                    <code className={`text-xs px-2 py-1 rounded ${
                      theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {currentScan.metadata.commit_sha.slice(0, 7)}
                    </code>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Issues List */}
        <Card className={`shadow-lg border-0 backdrop-blur-sm ${
          theme === 'dark' 
            ? 'bg-slate-800/80' 
            : 'bg-white/80'
        }`}>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div>
                <CardTitle className={`text-lg sm:text-xl font-bold ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                }`}>Security Issues Analysis</CardTitle>
                <CardDescription className={`text-sm sm:text-base ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Detailed findings from {currentScan.metadata.tools_used?.length || 0} security scanning tools
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Select
                  value={selectedSeverity}
                  onValueChange={setSelectedSeverity}
                >
                  <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm min-h-[44px] sm:min-h-[40px] shadow-sm">
                    <SelectValue>
                      {selectedSeverity === 'all' ? 'All Severities' : (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedSeverity === 'critical' ? 'bg-red-500' :
                            selectedSeverity === 'high' ? 'bg-orange-500' :
                            selectedSeverity === 'medium' ? 'bg-yellow-500' :
                            selectedSeverity === 'low' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`}></div>
                          <span className="capitalize">{selectedSeverity}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Critical</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span>High</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Medium</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Low</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="info">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Info</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm min-h-[44px] sm:min-h-[40px] shadow-sm">
                    <SelectValue>
                      {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                  }`}>
                    <CheckCircle className={`h-12 w-12 ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                  </div>
                  <h3 className={`text-lg font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`}>No Issues Found</h3>
                  <p className={`${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>No security issues match your current filter selection.</p>
                </div>
              ) : (
                filteredIssues.map((issue, index) => {
                  const isExpanded = expandedIssues.has(issue.id || String(index))
                  const aiKey = issue.tool && issue.rule_id && issue.category ? 
                    `${issue.tool}_${issue.rule_id}_${issue.category}` : null
                  const explanation = aiKey ? aiExplanations[aiKey] : null
                  const isLoadingExplanation = aiKey ? loadingExplanations.has(aiKey) : false
                  const displayProps = getIssueDisplayProps(issue)

                  return (
                    <Collapsible
                      key={issue.id || index}
                      open={isExpanded}
                      onOpenChange={() => toggleIssueExpanded(issue.id || String(index))}
                    >
                      <Card className={`overflow-hidden transition-all duration-300 ${displayProps.containerClass} shadow-sm hover:shadow-md`}>
                        <CollapsibleTrigger className="w-full">
                          <CardHeader className="pb-3 sm:pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 text-left">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                  <Badge className={`${getSeverityColor(issue.severity)} font-medium`}>
                                    {displayProps.icon}
                                    <span className="ml-1.5 capitalize">{issue.severity}</span>
                                  </Badge>
                                  {issue.category && (
                                    <Badge variant="outline" className="font-medium">
                                      <span className="capitalize">{issue.category}</span>
                                    </Badge>
                                  )}
                                  {issue.tool && (
                                    <Badge variant="secondary" className="font-medium">
                                      <Wrench className="mr-1 h-3 w-3" />
                                      {issue.tool}
                                    </Badge>
                                  )}
                                </div>
                                <h3 className={`text-sm sm:text-base font-semibold mb-2 leading-relaxed break-words ${
                                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                                }`}>
                                  {issue.message.replace('ANOMALY DETECTED: ', '')}
                                </h3>
                                {issue.file_path && (
                                  <div className={`flex flex-wrap items-center gap-2 text-xs sm:text-sm ${
                                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                                  }`}>
                                    <FileText className="h-4 w-4" />
                                    <code className={`px-2 py-1 rounded text-xs font-mono ${
                                      theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {issue.file_path}
                                    </code>
                                    {issue.line_start && (
                                      <span className={`${
                                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                                      }`}>Line {issue.line_start}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 p-2">
                                {isExpanded ? (
                                  <ChevronDown className={`h-5 w-5 ${
                                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                                  }`} />
                                ) : (
                                  <ChevronRight className={`h-5 w-5 ${
                                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                                  }`} />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <Separator className="mb-6" />
                          <CardContent className="pt-0">
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
                                <TabsTrigger value="details" className="font-medium text-xs sm:text-sm">
                                  <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">Details</span>
                                  <span className="sm:hidden">Info</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="font-medium text-xs sm:text-sm">
                                  <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">Code Context</span>
                                  <span className="sm:hidden">Code</span>
                                </TabsTrigger>
                                <TabsTrigger value="ai" className="font-medium text-xs sm:text-sm">
                                  <Lightbulb className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">AI Analysis</span>
                                  <span className="sm:hidden">AI</span>
                                </TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="details" className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                  {issue.rule_id && (
                                    <div className="space-y-2">
                                      <label className={`text-sm font-medium ${
                                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                      }`}>Rule ID</label>
                                      <code className={`block w-full p-3 border rounded-lg text-sm font-mono ${
                                        theme === 'dark' 
                                          ? 'bg-slate-800 border-slate-600 text-slate-300' 
                                          : 'bg-slate-50 border-slate-200 text-slate-700'
                                      }`}>
                                        {issue.rule_id}
                                      </code>
                                    </div>
                                  )}
                                  {issue.confidence && (
                                    <div className="space-y-2">
                                      <label className={`text-sm font-medium ${
                                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                      }`}>Confidence</label>
                                      <Badge variant="outline" className="block w-fit">
                                        {issue.confidence}
                                      </Badge>
                                    </div>
                                  )}
                                  {issue.cwe_id && (
                                    <div className="space-y-2">
                                      <label className={`text-sm font-medium ${
                                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                      }`}>CWE Reference</label>
                                      <a 
                                        href={`https://cwe.mitre.org/data/definitions/${issue.cwe_id.replace('CWE-', '')}.html`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-2 font-medium ${
                                          theme === 'dark' 
                                            ? 'text-blue-400 hover:text-blue-300' 
                                            : 'text-blue-600 hover:text-blue-800'
                                        }`}
                                      >
                                        {issue.cwe_id}
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </div>
                                  )}
                                  {issue.owasp_category && (
                                    <div className="space-y-2">
                                      <label className={`text-sm font-medium ${
                                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                      }`}>OWASP Category</label>
                                      <p className={`text-sm ${
                                        theme === 'dark' ? 'text-slate-200' : 'text-slate-900'
                                      }`}>{issue.owasp_category}</p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Compliance Mappings */}
                                {(issue.nist_id || issue.pci_dss_id || issue.hipaa_id || issue.gdpr_article || issue.iso_27001_id) && (
                                  <div className="space-y-3 pt-4 border-t">
                                    <h4 className={`text-sm font-semibold flex items-center gap-2 ${
                                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                    }`}>
                                      <Building className="h-4 w-4" />
                                      Compliance Framework Mappings
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {issue.nist_id && (
                                        <Badge variant="outline" className={`${
                                          theme === 'dark' ? 'bg-blue-950/50 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                          NIST: {issue.nist_id}
                                        </Badge>
                                      )}
                                      {issue.pci_dss_id && (
                                        <Badge variant="outline" className={`${
                                          theme === 'dark' ? 'bg-green-950/50 text-green-300 border-green-800' : 'bg-green-50 text-green-700 border-green-200'
                                        }`}>
                                          PCI-DSS: {issue.pci_dss_id}
                                        </Badge>
                                      )}
                                      {issue.hipaa_id && (
                                        <Badge variant="outline" className={`${
                                          theme === 'dark' ? 'bg-purple-950/50 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-200'
                                        }`}>
                                          HIPAA: {issue.hipaa_id}
                                        </Badge>
                                      )}
                                      {issue.gdpr_article && (
                                        <Badge variant="outline" className={`${
                                          theme === 'dark' ? 'bg-orange-950/50 text-orange-300 border-orange-800' : 'bg-orange-50 text-orange-700 border-orange-200'
                                        }`}>
                                          GDPR: {issue.gdpr_article}
                                        </Badge>
                                      )}
                                      {issue.iso_27001_id && (
                                        <Badge variant="outline" className={`${
                                          theme === 'dark' ? 'bg-indigo-950/50 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        }`}>
                                          ISO 27001: {issue.iso_27001_id}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* <div className="flex items-center gap-3 pt-4 border-t">
                                  {issue.id && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => markAsFalsePositive(issue.id!)}
                                      className="shadow-sm"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Mark as False Positive
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm" className="shadow-sm">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View in Context
                                  </Button>
                                </div> */}
                              </TabsContent>
                              
                              <TabsContent value="code">
                                {issue.code_context && Object.keys(issue.code_context).length > 0 ? (
                                  <div className={`rounded-lg overflow-hidden border max-w-full ${
                                    theme === 'dark' 
                                      ? 'bg-slate-900 border-slate-700' 
                                      : 'bg-white border-slate-200'
                                  }`}>
                                    <div className={`px-3 sm:px-4 py-3 border-b ${
                                      theme === 'dark' 
                                        ? 'bg-slate-800 border-slate-700' 
                                        : 'bg-slate-50 border-slate-200'
                                    }`}>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <FileText className={`h-4 w-4 ${
                                            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                                          }`} />
                                          <span className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                          }`}>
                                            {issue.file_path || 'Source Code'}
                                          </span>
                                          {issue.line_start && (
                                            <div className="flex items-center gap-1">
                                              <MapPin className={`h-3 w-3 ${
                                                theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                              }`} />
                                              <span className={`text-xs font-mono ${
                                                theme === 'dark' ? 'text-red-300' : 'text-red-700'
                                              }`}>
                                                L{issue.line_start}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const codeText = Object.entries(issue.code_context || {})
                                                .sort(([a], [b]) => Number(a) - Number(b))
                                                .map(([lineNum, code]) => `${lineNum}: ${code}`)
                                                .join('\n')
                                              navigator.clipboard.writeText(codeText)
                                              toast.success('Code copied to clipboard!')
                                            }}
                                            className="h-7 px-2"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                          <Badge variant="outline" className="text-xs">
                                            {getLanguageFromFile(issue.file_path || '')}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className={`relative rounded-lg overflow-hidden border ${
                                      theme === 'dark' 
                                        ? 'bg-[#0d1117] border-slate-700' 
                                        : 'bg-[#f6f8fa] border-slate-200'
                                    }`}>
                                      {/* Issue line indicator */}
                                      {issue.line_start && (
                                        <div className={`absolute left-0 top-0 w-1 h-full z-10 ${
                                          theme === 'dark' 
                                            ? 'bg-gradient-to-b from-red-500 to-red-600' 
                                            : 'bg-gradient-to-b from-red-400 to-red-500'
                                        }`} />
                                      )}
                                      
                                      <div className="relative">
                                        {/* Line-by-line rendering with highlighting - Full height view */}
                                        <div className="font-mono text-sm leading-relaxed">
                                          {Object.entries(issue.code_context)
                                            .sort(([a], [b]) => Number(a) - Number(b))
                                            .map(([lineNum, code], index) => {
                                              const isIssueLine = Number(lineNum) === issue.line_start
                                              const lineNumber = Number(lineNum)
                                              
                                              return (
                                                <div key={lineNum} className={`relative group flex min-h-[2.5rem] ${
                                                  isIssueLine 
                                                    ? theme === 'dark'
                                                      ? 'bg-gradient-to-r from-red-950/40 via-red-900/30 to-transparent border-l-4 border-red-500'
                                                      : 'bg-gradient-to-r from-red-50 via-red-100/50 to-transparent border-l-4 border-red-400'
                                                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                                                }`}>
                                                  {/* Line number with enhanced styling */}
                                                  <div className={`flex-shrink-0 w-12 sm:w-16 px-2 sm:px-3 py-3 text-right select-none border-r flex items-center justify-end text-xs sm:text-sm ${
                                                    isIssueLine 
                                                      ? theme === 'dark'
                                                        ? 'bg-red-950/60 text-red-300 border-red-800 font-bold'
                                                        : 'bg-red-100/80 text-red-700 border-red-300 font-bold'
                                                      : theme === 'dark'
                                                        ? 'bg-slate-800/50 text-slate-500 border-slate-700'
                                                        : 'bg-slate-100/50 text-slate-400 border-slate-200'
                                                  }`}>
                                                    {lineNumber}
                                                  </div>
                                                  
                                                  {/* Issue indicator for problematic line */}
                                                  {isIssueLine && (
                                                    <div className={`flex-shrink-0 w-8 flex items-center justify-center ${
                                                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                                    }`}>
                                                      <AlertTriangle className="h-4 w-4 animate-pulse" />
                                                    </div>
                                                  )}
                                                  
                                                  {/* Code content with syntax highlighting */}
                                                  <div className={`flex-1 px-4 py-3 overflow-x-auto flex items-center ${
                                                    isIssueLine 
                                                      ? theme === 'dark'
                                                        ? 'text-red-100 font-medium'
                                                        : 'text-red-900 font-medium'
                                                      : theme === 'dark'
                                                        ? 'text-slate-300'
                                                        : 'text-slate-700'
                                                  }`}>
                                                    <SyntaxHighlighter
                                                      language={getLanguageFromFile(issue.file_path || '')}
                                                      style={theme === 'dark' ? vscDarkPlus : vs}
                                                      customStyle={{
                                                        margin: 0,
                                                        padding: 0,
                                                        background: 'transparent',
                                                        fontSize: '0.8125rem',
                                                        lineHeight: '1.4',
                                                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                                        width: '100%',
                                                      }}
                                                      PreTag={({ children }) => <div style={{ margin: 0, padding: 0 }}>{children}</div>}
                                                      CodeTag={({ children }) => <span>{children}</span>}
                                                    >
                                                      {code}
                                                    </SyntaxHighlighter>
                                                  </div>
                                                  
                                                  {/* Tooltip for issue line */}
                                                  {isIssueLine && (
                                                    <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10`}>
                                                      <div className={`px-3 py-1 rounded-md text-xs font-medium shadow-lg ${
                                                        theme === 'dark' 
                                                          ? 'bg-red-900 text-red-100 border border-red-700'
                                                          : 'bg-red-100 text-red-800 border border-red-300'
                                                      }`}>
                                                        🚨 Security Issue Found
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              )
                                            })}
                                        </div>
                                      </div>
                                      
                                      {/* Enhanced footer with issue context */}
                                      {issue.line_start && (
                                        <div className={`px-4 py-3 border-t flex items-center justify-between text-sm ${
                                          theme === 'dark' 
                                            ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                                            : 'bg-slate-50/80 border-slate-200 text-slate-600'
                                        }`}>
                                          <div className="flex items-center gap-2">
                                            <AlertTriangle className={`h-4 w-4 ${
                                              theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                            }`} />
                                            <span className="font-medium">
                                              Issue detected on line {issue.line_start}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={`text-xs ${
                                              theme === 'dark' 
                                                ? 'bg-red-950/50 text-red-300 border-red-800'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                              {issue.severity.toUpperCase()}
                                            </Badge>
                                            {issue.confidence && (
                                              <span className={`text-xs ${
                                                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                                              }`}>
                                                Confidence: {issue.confidence}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-12">
                                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                      theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                                    }`}>
                                      <FileText className={`h-8 w-8 ${
                                        theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                                      }`} />
                                    </div>
                                    <h3 className={`text-lg font-medium mb-2 ${
                                      theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                                    }`}>No Code Context</h3>
                                    <p className={`${
                                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                                    }`}>Code context is not available for this security issue.</p>
                                  </div>
                                )}
                              </TabsContent>
                              
                              <TabsContent value="ai">
                                {!issue.tool || !issue.rule_id || !issue.category ? (
                                  <div className="text-center py-12">
                                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                      theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                                    }`}>
                                      <Lightbulb className={`h-8 w-8 ${
                                        theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                                      }`} />
                                    </div>
                                    <h3 className={`text-lg font-medium mb-2 ${
                                      theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                                    }`}>AI Analysis Unavailable</h3>
                                    <p className={`${
                                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                                    }`}>Insufficient metadata for AI-powered security analysis.</p>
                                  </div>
                                ) : explanation ? (
                                  <div className="space-y-6">
                                    <div className={`rounded-lg p-6 border ${
                                      theme === 'dark' 
                                        ? 'bg-blue-950/30 border-blue-800' 
                                        : 'bg-blue-50 border-blue-200'
                                    }`}>
                                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                                        theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                                      }`}>
                                        <Lightbulb className="h-5 w-5" />
                                        Security Analysis
                                      </h4>
                                      <div className={`prose prose-sm max-w-none ${
                                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                      }`}>
                                        <ReactMarkdown 
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                            code({node, className, children, ...props}) {
                                              const match = /language-(\w+)/.exec(className || '')
                                              const isInline = !match
                                              return !isInline && match ? (
                                                <SyntaxHighlighter
                                                  style={vscDarkPlus as any}
                                                  language={match[1]}
                                                  PreTag="div"
                                                  customStyle={{
                                                    margin: '1rem 0',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.875rem'
                                                  } as any}
                                                >
                                                  {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                              ) : (
                                                <code className={`px-2 py-1 rounded text-sm font-mono ${
                                                  theme === 'dark' 
                                                    ? 'bg-slate-700 text-slate-300' 
                                                    : 'bg-slate-100 text-slate-700'
                                                }`} {...props}>
                                                  {children}
                                                </code>
                                              )
                                            }
                                          }}
                                        >
                                          {explanation.explanation}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                    
                                    {explanation.fix_suggestion && (
                                      <div className={`rounded-lg p-6 border ${
                                        theme === 'dark' 
                                          ? 'bg-green-950/30 border-green-800' 
                                          : 'bg-green-50 border-green-200'
                                      }`}>
                                        <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                                          theme === 'dark' ? 'text-green-300' : 'text-green-900'
                                        }`}>
                                          <CheckCircle className="h-5 w-5" />
                                          Remediation Guide
                                        </h4>
                                        <div className={`prose prose-sm max-w-none ${
                                          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                        }`}>
                                          <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                              code({node, className, children, ...props}) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                const isInline = !match
                                                return !isInline && match ? (
                                                  <SyntaxHighlighter
                                                    style={theme === 'dark' ? vscDarkPlus as any : vs as any}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{
                                                      margin: '1rem 0',
                                                      borderRadius: '0.5rem',
                                                      fontSize: '0.875rem'
                                                    } as any}
                                                  >
                                                    {String(children).replace(/\n$/, '')}
                                                  </SyntaxHighlighter>
                                                ) : (
                                                  <code className={`px-2 py-1 rounded text-sm font-mono ${
                                                  theme === 'dark' 
                                                    ? 'bg-slate-700 text-slate-300' 
                                                    : 'bg-slate-100 text-slate-700'
                                                }`} {...props}>
                                                    {children}
                                                  </code>
                                                )
                                              }
                                            }}
                                          >
                                            {explanation.fix_suggestion}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {explanation.testing_approach && (
                                      <div className={`rounded-lg p-6 border ${
                                        theme === 'dark' 
                                          ? 'bg-amber-950/30 border-amber-800' 
                                          : 'bg-amber-50 border-amber-200'
                                      }`}>
                                        <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                                          theme === 'dark' ? 'text-amber-300' : 'text-amber-900'
                                        }`}>
                                          <Target className="h-5 w-5" />
                                          Testing Strategy
                                        </h4>
                                        <div className={`prose prose-sm max-w-none ${
                                          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                        }`}>
                                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {explanation.testing_approach}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {explanation.business_impact && (
                                      <div className={`rounded-lg p-6 border ${
                                        theme === 'dark' 
                                          ? 'bg-purple-950/30 border-purple-800' 
                                          : 'bg-purple-50 border-purple-200'
                                      }`}>
                                        <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                                          theme === 'dark' ? 'text-purple-300' : 'text-purple-900'
                                        }`}>
                                          <TrendingUp className="h-5 w-5" />
                                          Business Impact Assessment
                                        </h4>
                                        <div className={`prose prose-sm max-w-none ${
                                          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                        }`}>
                                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {explanation.business_impact}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {explanation.cached && (
                                      <div className={`flex items-center gap-2 text-sm pt-4 border-t ${
                                        theme === 'dark' 
                                          ? 'text-slate-400 border-slate-700' 
                                          : 'text-slate-500 border-slate-200'
                                      }`}>
                                        <Info className="h-4 w-4" />
                                        This analysis was generated from cached results for faster loading.
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-12">
                                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                                      theme === 'dark' 
                                        ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50' 
                                        : 'bg-gradient-to-br from-blue-100 to-purple-100'
                                    }`}>
                                      <Lightbulb className={`h-8 w-8 ${
                                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                      }`} />
                                    </div>
                                    <h3 className={`text-lg font-semibold mb-3 ${
                                      theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                                    }`}>AI-Powered Security Analysis</h3>
                                    <p className={`mb-6 ${
                                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                                    }`}>Get detailed explanations, fix recommendations, and business impact analysis.</p>
                                    <Button
                                      onClick={() => fetchAIExplanation(issue as Issue)}
                                      disabled={isLoadingExplanation}
                                      className="shadow-lg"
                                    >
                                      {isLoadingExplanation ? (
                                        <>
                                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                          Analyzing Security Issue...
                                        </>
                                      ) : (
                                        <>
                                          <Lightbulb className="mr-2 h-4 w-4" />
                                          Generate AI Analysis
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Score Breakdown */}
        <Card className={`shadow-lg border-0 backdrop-blur-sm ${
          theme === 'dark' 
            ? 'bg-slate-800/80' 
            : 'bg-white/80'
        }`}>
          <CardHeader>
            <CardTitle className={`text-xl font-bold flex items-center gap-2 ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}>
              <Database className="h-5 w-5" />
              Security Metrics Breakdown
            </CardTitle>
            <CardDescription className="text-slate-600">
              Comprehensive analysis across different security dimensions with niche-specific weighting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <h4 className={`font-semibold flex items-center gap-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <Layers className="h-4 w-4" />
                  Security Scores
                </h4>
                {Object.entries(currentScan.scores).map(([key, score]) => {
                  if (score === null || score === undefined) return null
                  const label = key.replace('_score', '').replace('_', ' ')
                    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                  
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                        }`}>{label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getScoreColor(score)}`}>
                            {Math.round(score)}/100
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'}
                          </Badge>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress value={score} className="h-3" />
                        <div className={`absolute inset-0 h-3 rounded-full ${getScoreGradient(score)} opacity-20`}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Business Impact */}
                {currentScan.business_impact && (
                  <div>
                    <h4 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <Users className="h-4 w-4" />
                      Business Impact Assessment
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(currentScan.business_impact).map(([risk, level]) => (
                        <div key={risk} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
                        }`}>
                          <span className={`text-sm font-medium capitalize ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                          }`}>
                            {risk.replace('_', ' ')}
                          </span>
                          <Badge 
                            variant={level === 'high' ? 'destructive' : level === 'medium' ? 'secondary' : 'outline'}
                            className="font-medium"
                          >
                            {String(level)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Security Recommendations */}
                {currentScan.recommendations && currentScan.recommendations.length > 0 && (
                  <div>
                    <h4 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <Lightbulb className="h-4 w-4" />
                      Security Recommendations
                    </h4>
                    <div className="space-y-3">
                      {currentScan.recommendations.map((recommendation: string, index: number) => (
                        <div key={index} className={`flex items-start gap-2 sm:gap-3 p-3 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-amber-950/30 border-amber-800' 
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                          <Lightbulb className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                          }`} />
                          <span className={`text-sm leading-relaxed ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                          }`}>{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}