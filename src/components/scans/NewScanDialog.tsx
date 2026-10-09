import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Play, Loader2, Shield, Code, Package, Zap, GitBranch, Clock, AlertTriangle, Target, Settings, Users, CheckCircle, Sparkles, Search, Filter, Check, ChevronDown, ChevronUp, Info, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useScanStore } from '@/store'
import { repositoryAPI, type BranchesResponse } from '@/lib/api/repositories'
import type { Repository } from '@/types/global'
import type { ScanRequest } from '@/lib/api/scans'
import { apiClient } from '@/lib/api/client'

const newScanSchema = z.object({
  repo_full_name: z.string().min(1, 'Repository is required'),
  branch: z.string().optional(),
  selected_custom_rule_ids: z.array(z.string()).optional(),
  selected_community_rule_ids: z.array(z.string()).optional(),
})

type NewScanFormData = z.infer<typeof newScanSchema>

interface NewScanDialogProps {
  repositories: Repository[]
  isLoadingRepos?: boolean
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}



// Technical term definitions for tooltips
const TECH_TERMS: Record<string, string> = {
  'SAST analysis': 'Static Application Security Testing - analyzes source code for vulnerabilities using multiple tools (Semgrep, Bandit, etc.)',
  'SAST': 'Static Application Security Testing - analyzes source code for vulnerabilities using multiple tools',
  'SBOM': 'Software Bill of Materials - detailed inventory of all software components (only generated in Full scope)',
  'Secret detection': 'Identifies hardcoded passwords, API keys, and other sensitive data using TruffleHog and GitLeaks',
  'Dependency vulnerabilities': 'Known security issues in third-party packages and libraries using Trivy and Safety',
  'Container scanning': 'Security analysis of Docker containers and images using Trivy',
  'Infrastructure scanning': 'Configuration security analysis using Checkov and Trivy',
  'Infrastructure checks': 'Configuration security analysis for cloud and server infrastructure using Checkov',
  'Compliance reports': 'Reports showing adherence to security standards (OWASP, SOC2, etc.)',
  'Language-specific analysis': 'Specialized tools for each language (Gosec for Go, ESLint for JS/TS, SpotBugs for Java, etc.)',
  'All code analysis': 'Complete static analysis with comprehensive security scanning',
  'All dependency analysis': 'Comprehensive scan using Trivy, Safety, and other dependency analyzers',
  'All security tools': 'Complete security analysis with comprehensive vulnerability detection',
  'SBOM generation': 'Creates detailed software bill of materials listing all components and dependencies',
  'License analysis': 'Review of software licenses for compliance and legal requirements',
  'Outdated packages': 'Detection of dependencies that need security updates',
  'Code quality checks': 'Analysis of code maintainability, complexity, and best practices'
}

// Helper component for technical term badges with tooltips
const TechBadge = ({ term, variant = "secondary" }: { term: string; variant?: "secondary" | "outline" }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const definition = TECH_TERMS[term]
  
  if (!definition) {
    return <Badge variant={variant} className="text-[10px] sm:text-xs">{term}</Badge>
  }

  return (
    <div className="relative inline-block">
      <Badge 
        variant={variant} 
        className="text-[10px] sm:text-xs cursor-help hover:bg-opacity-80 transition-all"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {term}
      </Badge>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-600 whitespace-normal max-w-[280px] sm:max-w-80 min-w-[150px] sm:min-w-48 z-[9999] pointer-events-none">
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-white dark:border-t-gray-800"></div>
          {definition}
        </div>
      )}
    </div>
  )
}

interface CustomRule {
  id: string
  rule_name: string
  tool: string
  language: string | null
  description: string | null
  severity: string
  upvotes: number
  usage_count: number
  is_verified?: boolean
}

interface RuleStats {
  total_rules: number
  rule_files: string[]
  languages: string[]
}

export function NewScanDialog({ repositories, isLoadingRepos = false, onSuccess, open, onOpenChange }: NewScanDialogProps) {
  // Step management state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [branches, setBranches] = useState<string[]>([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [branchesError, setBranchesError] = useState<string | null>(null)
  
  // Custom rules state
  const [userCustomRules, setUserCustomRules] = useState<CustomRule[]>([])
  const [communityRules, setCommunityRules] = useState<CustomRule[]>([])
  const [isLoadingCustomRules, setIsLoadingCustomRules] = useState(false)
  const [defaultRulesStats, setDefaultRulesStats] = useState<RuleStats | null>(null)
  
  // Rule selection UI state
  const [showRuleSelector, setShowRuleSelector] = useState(false)
  const [selectedCustomRuleIds, setSelectedCustomRuleIds] = useState<Set<string>>(new Set())
  const [selectedCommunityRuleIds, setSelectedCommunityRuleIds] = useState<Set<string>>(new Set())
  const [ruleSearchTerm, setRuleSearchTerm] = useState('')
  const [ruleSeverityFilter, setRuleSeverityFilter] = useState<string>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['custom']))
  
  const { triggerScan } = useScanStore()

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    register
  } = useForm<NewScanFormData>({
    resolver: zodResolver(newScanSchema),
    defaultValues: {
      selected_custom_rule_ids: [],
      selected_community_rule_ids: []
    }
  })

  const watchedRepoName = watch('repo_full_name')
  const watchedSelectedCustomRules = watch('selected_custom_rule_ids')
  const watchedSelectedCommunityRules = watch('selected_community_rule_ids')
  
  // Filter rules based on search and severity
  const filteredUserRules = useMemo(() => {
    return userCustomRules.filter(rule => {
      const matchesSearch = !ruleSearchTerm || 
        rule.rule_name.toLowerCase().includes(ruleSearchTerm.toLowerCase()) ||
        (rule.description && rule.description.toLowerCase().includes(ruleSearchTerm.toLowerCase()))
      const matchesSeverity = ruleSeverityFilter === 'all' || rule.severity.toLowerCase() === ruleSeverityFilter.toLowerCase()
      return matchesSearch && matchesSeverity
    })
  }, [userCustomRules, ruleSearchTerm, ruleSeverityFilter])
  
  const filteredCommunityRules = useMemo(() => {
    return communityRules.filter(rule => {
      const matchesSearch = !ruleSearchTerm || 
        rule.rule_name.toLowerCase().includes(ruleSearchTerm.toLowerCase()) ||
        (rule.description && rule.description.toLowerCase().includes(ruleSearchTerm.toLowerCase()))
      const matchesSeverity = ruleSeverityFilter === 'all' || rule.severity.toLowerCase() === ruleSeverityFilter.toLowerCase()
      return matchesSearch && matchesSeverity
    })
  }, [communityRules, ruleSearchTerm, ruleSeverityFilter])
  
  // Helper functions for rule selection
  const toggleRuleSelection = (ruleId: string, isCustom: boolean) => {
    if (isCustom) {
      const newSet = new Set(selectedCustomRuleIds)
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId)
      } else {
        newSet.add(ruleId)
      }
      setSelectedCustomRuleIds(newSet)
      setValue('selected_custom_rule_ids', Array.from(newSet))
    } else {
      const newSet = new Set(selectedCommunityRuleIds)
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId)
      } else {
        newSet.add(ruleId)
      }
      setSelectedCommunityRuleIds(newSet)
      setValue('selected_community_rule_ids', Array.from(newSet))
    }
  }
  
  const selectAllInCategory = (rules: CustomRule[], isCustom: boolean) => {
    const ruleIds = rules.map(r => r.id)
    if (isCustom) {
      setSelectedCustomRuleIds(new Set(ruleIds))
      setValue('selected_custom_rule_ids', ruleIds)
    } else {
      setSelectedCommunityRuleIds(new Set(ruleIds))
      setValue('selected_community_rule_ids', ruleIds)
    }
  }
  
  const clearSelection = () => {
    setSelectedCustomRuleIds(new Set())
    setSelectedCommunityRuleIds(new Set())
    setValue('selected_custom_rule_ids', [])
    setValue('selected_community_rule_ids', [])
  }
  
  const applyRulePreset = (preset: 'recommended' | 'maximum' | 'custom-only' | 'community-only') => {
    switch (preset) {
      case 'recommended':
        // Select top-rated rules from both categories
        const topCustom = userCustomRules
          .sort((a, b) => b.upvotes - a.upvotes)
          .slice(0, 5)
          .map(r => r.id)
        const topCommunity = communityRules
          .sort((a, b) => b.upvotes - a.upvotes)
          .slice(0, 10)
          .map(r => r.id)
        setSelectedCustomRuleIds(new Set(topCustom))
        setSelectedCommunityRuleIds(new Set(topCommunity))
        setValue('selected_custom_rule_ids', topCustom)
        setValue('selected_community_rule_ids', topCommunity)
        break
      case 'maximum':
        selectAllInCategory(userCustomRules, true)
        selectAllInCategory(communityRules, false)
        break
      case 'custom-only':
        selectAllInCategory(userCustomRules, true)
        clearSelection()
        selectAllInCategory(userCustomRules, true)
        break
      case 'community-only':
        clearSelection()
        selectAllInCategory(communityRules, false)
        break
    }
  }

  const onSubmit = async (data: NewScanFormData) => {
    // onSubmit called
    
    // Safety check: Only allow submission when on step 3
    if (currentStep !== 3) {
      console.error('CRITICAL: Form submission attempted from wrong step:', currentStep)
      return
    }

    // Proceeding with scan submission

    try {
      // Backend now ignores mode/scope and always runs comprehensive scans
      const scanRequest: ScanRequest = {
        repo_full_name: data.repo_full_name,
        branch: data.branch || selectedRepo?.default_branch,
        niche: selectedRepo?.niche || 'all',
        // Optional custom rules can still be added
        include_custom_rules: (data.selected_custom_rule_ids?.length || 0) > 0,
        include_community_rules: (data.selected_community_rule_ids?.length || 0) > 0,
        selected_custom_rule_ids: data.selected_custom_rule_ids || [],
        selected_community_rule_ids: data.selected_community_rule_ids || []
      }
      
      await triggerScan(scanRequest)
      
      // Reset the dialog state after successful scan start
      resetDialogState()
      onSuccess?.()
    } catch (error: any) {
      console.error('Failed to start scan:', error)
    }
  }

  // Load custom rules when repository is selected
  const loadCustomRules = async (niche: string) => {
    setIsLoadingCustomRules(true)
    try {
      // Load user's custom rules
      const userData = await apiClient.get(`/rules/user?niche=${niche}`)
      setUserCustomRules(userData.rules || [])

      // Load popular community rules  
      const communityData = await apiClient.get(`/rules/community/popular?niche=${niche}&limit=20&min_upvotes=0&include_own=true`)
      setCommunityRules(communityData.rules || [])

      // Load default rules stats
      const statsData = await apiClient.get(`/rules/default/stats?niche=${niche}`)
      setDefaultRulesStats(statsData)
    } catch (error) {
      console.error('Failed to load custom rules:', error)
    } finally {
      setIsLoadingCustomRules(false)
    }
  }

  // Load custom rules lazily - only when user shows interest in rule selection
  const loadCustomRulesIfNeeded = async () => {
    if (!selectedRepo?.niche || userCustomRules.length > 0 || communityRules.length > 0) {
      return // Already loaded or no repository selected
    }
    
    if (isLoadingCustomRules) {
      return // Already loading
    }
    
    await loadCustomRules(selectedRepo.niche)
  }
  
  // Reset function to clear all state
  const resetDialogState = () => {
    setCurrentStep(1)
    setSelectedRepo(null)
    setBranches([])
    setBranchesError(null)
    // Don't clear loaded rules - they can be reused
    // setUserCustomRules([])
    // setCommunityRules([])
    setDefaultRulesStats(null)
    setShowRuleSelector(false)
    setSelectedCustomRuleIds(new Set())
    setSelectedCommunityRuleIds(new Set())
    setRuleSearchTerm('')
    setRuleSeverityFilter('all')
    setExpandedCategories(new Set(['custom']))
    
    // Reset form values
    setValue('repo_full_name', '')
    setValue('branch', '')
    setValue('selected_custom_rule_ids', [])
    setValue('selected_community_rule_ids', [])
  }

  // Complete cleanup function for when dialog closes
  const completeCleanup = () => {
    setCurrentStep(1)
    setSelectedRepo(null)
    setBranches([])
    setBranchesError(null)
    setUserCustomRules([])
    setCommunityRules([])
    setDefaultRulesStats(null)
    setShowRuleSelector(false)
    setSelectedCustomRuleIds(new Set())
    setSelectedCommunityRuleIds(new Set())
    setRuleSearchTerm('')
    setRuleSeverityFilter('all')
    setExpandedCategories(new Set(['custom']))
    
    // Reset form values
    setValue('repo_full_name', '')
    setValue('branch', '')
    setValue('selected_custom_rule_ids', [])
    setValue('selected_community_rule_ids', [])
  }

  // Reset state on component mount (when dialog opens)
  useEffect(() => {
    // This ensures we start fresh each time the dialog opens
    resetDialogState()
  }, [])

  // Complete cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      // Delay cleanup to prevent UI flicker
      const timer = setTimeout(completeCleanup, 100)
      return () => clearTimeout(timer)
    }
    return () => {} // Return empty cleanup function for the else case
  }, [open])
  
  // Sync selected rule IDs with form values
  useEffect(() => {
    if (watchedSelectedCustomRules) {
      setSelectedCustomRuleIds(new Set(watchedSelectedCustomRules))
    }
  }, [watchedSelectedCustomRules])
  
  useEffect(() => {
    if (watchedSelectedCommunityRules) {
      setSelectedCommunityRuleIds(new Set(watchedSelectedCommunityRules))
    }
  }, [watchedSelectedCommunityRules])

  const loadBranches = async (repoFullName: string) => {
    setIsLoadingBranches(true)
    setBranchesError(null)
    setBranches([])

    try {
      const branchesResponse = await repositoryAPI.getBranches(repoFullName)
      setBranches(branchesResponse.branches)
      
      // Set the default branch as selected
      setValue('branch', branchesResponse.default_branch)
    } catch (error: any) {
      console.error('Failed to load branches:', error)
      setBranchesError('Failed to load branches')
      
      // Fallback to default branch from repository
      const repo = repositories.find(r => r.full_name === repoFullName)
      const defaultBranch = repo?.default_branch || 'main'
      setBranches([defaultBranch])
      setValue('branch', defaultBranch)
    } finally {
      setIsLoadingBranches(false)
    }
  }

  const handleRepoChange = (repoFullName: string) => {
    const repo = repositories.find(r => r.full_name === repoFullName)
    setSelectedRepo(repo || null)
    setValue('repo_full_name', repoFullName)
    
    // Load branches for the selected repository
    if (repo) {
      loadBranches(repoFullName)
    }
  }

  // Step navigation functions
  const nextStep = () => {
    // nextStep called
    
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1
      // Moving to next step
      setCurrentStep(newStep)
    } else {
      // Already on final step
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Step validation functions
  const isStep1Valid = () => {
    return watchedRepoName && selectedRepo && !isLoadingBranches
  }

  const isStep2Valid = () => {
    return true // Rules are optional, so always valid
  }

  const isStep3Valid = () => {
    return true // No more mode/scope validation needed
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return isStep1Valid()
      case 2: return isStep2Valid()
      case 3: return isStep3Valid()
      case 4: return true
      default: return false
    }
  }

  // Get step titles
  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Repository & Branch'
      case 2: return 'Security Rules'
      case 3: return 'Launch Complete Scan'
      default: return 'Step'
    }
  }

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Select the repository and branch to scan'
      case 2: return 'Choose additional security rules (optional)'
      case 3: return 'Review settings and launch your comprehensive security scan'
      default: return ''
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
      <DialogHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold">Start Complete Security Scan</DialogTitle>
            <DialogDescription className="text-sm">
              Step {currentStep} of {totalSteps}: {getStepDescription(currentStep)}
            </DialogDescription>
          </div>
        </div>
        
        {/* Step Progress Indicator */}
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNumber = i + 1
              const isActive = stepNumber === currentStep
              const isCompleted = stepNumber < currentStep
              const isClickable = stepNumber < currentStep || (stepNumber === currentStep + 1 && canProceedToNextStep())
              
              return (
                <div key={stepNumber} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (stepNumber < currentStep || (stepNumber === currentStep + 1 && canProceedToNextStep())) {
                        setCurrentStep(stepNumber)
                      }
                    }}
                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-all min-h-[44px] sm:min-h-[40px] ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : isCompleted
                          ? 'bg-green-600 text-white'
                          : isClickable
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    disabled={!isClickable}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </button>
                  {stepNumber < totalSteps && (
                    <div className={`flex-1 h-0.5 mx-1 sm:mx-2 min-w-[20px] max-w-[60px] sm:max-w-[80px] ${
                      stepNumber < currentStep ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Step Labels */}
          <div className="grid grid-cols-4 gap-1 mt-2">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNumber = i + 1
              const isActive = stepNumber === currentStep
              const isCompleted = stepNumber < currentStep
              
              return (
                <div key={stepNumber} className="text-center px-0.5">
                  <div className={`text-[10px] sm:text-xs font-medium leading-tight break-words hyphens-auto ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 
                    isCompleted ? 'text-green-600 dark:text-green-400' : 
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {getStepTitle(stepNumber)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogHeader>

      <form 
        onSubmit={(e) => {
          // CRITICAL FIX: Prevent ALL form submission unless explicitly from the submit button
          e.preventDefault()
          // Form submission attempt blocked
          return false
        }}
        onKeyDown={(e) => {
          // Prevent Enter key from submitting the form
          if (e.key === 'Enter' && (e.target as HTMLElement).getAttribute('type') !== 'button') {
            e.preventDefault()
            // Enter key prevented from submitting form
          }
        }}
        className="space-y-6"
      >
        {/* Step 1: Repository and Branch Selection */}
        {currentStep === 1 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center py-2">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Repository & Branch Selection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Choose the repository and branch you want to analyze</p>
            </div>
            
            {/* Repository Selection */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Label htmlFor="repository" className="text-sm font-semibold">Repository *</Label>
                {repositories.length > 0 && (
                  <Badge variant="outline" className="text-xs w-fit">
                    {repositories.length} available
                  </Badge>
                )}
              </div>
          <Select onValueChange={handleRepoChange}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder={
                isLoadingRepos
                  ? "Loading repositories..." 
                  : repositories.length === 0 
                    ? "No repositories found" 
                    : "Choose a repository to analyze"
              } />
            </SelectTrigger>
            <SelectContent>
              {isLoadingRepos ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Loading your connected repositories...
                </div>
              ) : repositories.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No repositories connected</p>
                  <p className="text-xs">Please connect a repository first to start scanning</p>
                </div>
              ) : (
                repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.full_name}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">{repo.full_name.split('/')[1]}</span>
                        <span className="text-xs text-muted-foreground">{repo.full_name.split('/')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {repo.niche}
                        </Badge>
                        {repo.language && (
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">
                            {repo.language}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.repo_full_name && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {errors.repo_full_name.message}
            </p>
          )}
        </div>

            {/* Branch Selection */}
            {selectedRepo && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Label htmlFor="branch" className="text-sm font-semibold">Branch</Label>
                  {branches.length > 1 ? (
                    <Badge variant="outline" className="text-xs w-fit">
                      {branches.length} branches
                    </Badge>
                  ) : null}
                </div>
            <Select 
              onValueChange={(value) => setValue('branch', value)}
              value={watch('branch') || selectedRepo.default_branch}
              disabled={isLoadingBranches}
            >
              <SelectTrigger className="h-12 text-base" disabled={isLoadingBranches}>
                {isLoadingBranches ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading branches...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={
                    branchesError
                      ? "Error loading branches"
                      : `Choose branch to scan (default: ${selectedRepo.default_branch || 'main'})`
                  } />
                )}
              </SelectTrigger>
              <SelectContent>
                {branchesError ? (
                  <div className="p-4 text-sm text-destructive text-center">
                    <AlertTriangle className="h-4 w-4 mx-auto mb-2" />
                    {branchesError}
                  </div>
                ) : branches.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No branches found
                  </div>
                ) : (
                  branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{branch}</span>
                        </div>
                        {branch === selectedRepo.default_branch && (
                          <Badge variant="default" className="text-xs ml-2">
                            Default
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {isLoadingBranches ? (
                    "Loading branch information..."
                  ) : branches.length > 1 ? (
                    `Choose from ${branches.length} available branches`
                  ) : (
                    `Scanning ${selectedRepo.default_branch || 'main'} branch`
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Security Rules Selection */}
        {currentStep === 2 && selectedRepo && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center py-2">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Security Rules Selection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Customize your security analysis with additional rules (optional)</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Label className="text-sm font-semibold">Security Rules</Label>
                  <Badge variant="outline" className="text-xs w-fit">
                    {defaultRulesStats ? `${defaultRulesStats.total_rules} default` : 'Default rules'} 
                    {selectedCustomRuleIds.size + selectedCommunityRuleIds.size > 0 && 
                      ` + ${selectedCustomRuleIds.size + selectedCommunityRuleIds.size} additional`
                    }
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!showRuleSelector) {
                      // Load custom rules when user wants to access advanced selection
                      await loadCustomRulesIfNeeded()
                    }
                    setShowRuleSelector(!showRuleSelector)
                  }}
                  className="gap-2 h-10 sm:h-9 w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">{showRuleSelector ? 'Simple Mode' : 'Advanced Selection'}</span>
                </Button>
              </div>
            
            {!showRuleSelector ? (
              // Simple Mode - Improved UX with Always-On Default Rules
              <div className="space-y-4">
                {/* Always-On Default Rules Section */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Always Included</span>
                  </div>
                  <Card className="border-2 border-green-500 bg-green-50/50 dark:bg-green-950/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/40">
                          <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-base mb-1">
                            ✅ Default {selectedRepo.niche.toUpperCase()} Rules
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {isLoadingCustomRules ? 'Loading...' : 
                             `Professional security foundation - always active for ${selectedRepo.niche} projects`}
                          </div>
                          {defaultRulesStats && (
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="text-xs">
                                {defaultRulesStats.total_rules} rules
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {defaultRulesStats.languages.length} languages
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Curated
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="text-xs bg-green-600 text-white">
                            INCLUDED
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Rules Section */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Additional Rules (Optional)</span>
                  </div>
                  {isLoadingCustomRules ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <span className="text-sm">Loading additional rules...</span>
                    </div>
                  ) : (userCustomRules.length > 0 || communityRules.length > 0) ? (
                    <div className="grid grid-cols-1 gap-3">
                    {/* Add User's Custom Rules */}
                    {userCustomRules.length > 0 && (
                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                          selectedCustomRuleIds.size > 0
                            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                        onClick={async () => {
                          // Load custom rules when user first interacts with custom rules
                          await loadCustomRulesIfNeeded()
                          
                          if (selectedCustomRuleIds.size > 0) {
                            setSelectedCustomRuleIds(new Set())
                            setValue('selected_custom_rule_ids', [])
                          } else {
                            selectAllInCategory(userCustomRules, true)
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                              selectedCustomRuleIds.size > 0
                                ? 'bg-purple-100 dark:bg-purple-900/40' 
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              <Settings className={`h-6 w-6 ${
                                selectedCustomRuleIds.size > 0
                                  ? 'text-purple-600 dark:text-purple-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-base mb-1">
                                {selectedCustomRuleIds.size > 0 ? '✓' : '+'} Add My Custom Rules
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                Include your personally crafted security patterns
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {userCustomRules.length} rules
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Personal
                                </Badge>
                                {userCustomRules.some(r => r.upvotes > 0) && (
                                  <Badge variant="secondary" className="text-xs">
                                    ↑ {userCustomRules.reduce((sum, r) => sum + r.upvotes, 0)} votes
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {selectedCustomRuleIds.size > 0 ? (
                                <Badge variant="default" className="text-xs bg-purple-600 text-white">
                                  ADDED
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Optional
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Add Community Rules */}
                    {communityRules.length > 0 && (
                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                          selectedCommunityRuleIds.size > 0
                            ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                        onClick={async () => {
                          // Load custom rules when user first interacts with community rules
                          await loadCustomRulesIfNeeded()
                          
                          if (selectedCommunityRuleIds.size > 0) {
                            setSelectedCommunityRuleIds(new Set())
                            setValue('selected_community_rule_ids', [])
                          } else {
                            selectAllInCategory(communityRules, false)
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                              selectedCommunityRuleIds.size > 0
                                ? 'bg-orange-100 dark:bg-orange-900/40' 
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              <Users className={`h-6 w-6 ${
                                selectedCommunityRuleIds.size > 0
                                  ? 'text-orange-600 dark:text-orange-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-base mb-1">
                                {selectedCommunityRuleIds.size > 0 ? '✓' : '+'} Add Top Community Rules
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                Include highly-rated rules from the security community
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {communityRules.length} rules
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Community
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  ↑ {communityRules.reduce((sum, r) => sum + r.upvotes, 0)} total votes
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              {selectedCommunityRuleIds.size > 0 ? (
                                <Badge variant="default" className="text-xs bg-orange-600 text-white">
                                  ADDED
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Optional
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick Add Both Option */}
                    {(userCustomRules.length > 0 && communityRules.length > 0) && (
                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                          (selectedCustomRuleIds.size > 0 && selectedCommunityRuleIds.size > 0)
                            ? 'border-green-500 bg-green-50/50 dark:bg-green-950/30 shadow-sm' 
                            : 'border-dashed border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                        onClick={async () => {
                          // Load custom rules when user wants to add all rules
                          await loadCustomRulesIfNeeded()
                          
                          if (selectedCustomRuleIds.size > 0 && selectedCommunityRuleIds.size > 0) {
                            // Clear both
                            setSelectedCustomRuleIds(new Set())
                            setSelectedCommunityRuleIds(new Set())
                            setValue('selected_custom_rule_ids', [])
                            setValue('selected_community_rule_ids', [])
                          } else {
                            // Add both
                            selectAllInCategory(userCustomRules, true)
                            selectAllInCategory(communityRules, false)
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                              (selectedCustomRuleIds.size > 0 && selectedCommunityRuleIds.size > 0)
                                ? 'bg-green-100 dark:bg-green-900/40' 
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              <Sparkles className={`h-6 w-6 ${
                                (selectedCustomRuleIds.size > 0 && selectedCommunityRuleIds.size > 0)
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-base mb-1">
                                {(selectedCustomRuleIds.size > 0 && selectedCommunityRuleIds.size > 0) ? '✓' : '+'} Add All Custom Rules
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                Include both personal and community rules for comprehensive analysis
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {userCustomRules.length + communityRules.length} additional rules
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Complete Analysis
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              {(selectedCustomRuleIds.size > 0 && selectedCommunityRuleIds.size > 0) ? (
                                <Badge variant="default" className="text-xs bg-green-600 text-white">
                                  ADDED
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Quick Add
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    </div>
                  ) : (
                    // Show option to discover custom rules
                    <div className="text-center py-8 space-y-3">
                      <div className="text-muted-foreground text-sm">
                        <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">Discover Additional Security Rules</p>
                        <p className="text-xs">Click "Advanced Selection" to explore custom and community rules</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await loadCustomRulesIfNeeded()
                          setShowRuleSelector(true)
                        }}
                        className="gap-2"
                      >
                        <Search className="h-4 w-4" />
                        Browse Available Rules
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Advanced Mode - Individual Rule Selection with Fixed Layout
              <div className="space-y-4">
                {/* Always-On Default Rules Section - Outside Scroll */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Always Included in All Scans</span>
                  </div>
                  <Card className="border-2 border-green-500 bg-green-50/50 dark:bg-green-950/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/40">
                          <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-base mb-1">
                            ✅ Default {selectedRepo.niche.toUpperCase()} Rules
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Professional security foundation - always active for {selectedRepo.niche} projects
                          </div>
                          {defaultRulesStats && (
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="text-xs">
                                {defaultRulesStats.total_rules} rules
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {defaultRulesStats.languages.length} languages
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Curated
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="text-xs bg-green-600 text-white">
                            ACTIVE
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Advanced Selection Tools */}
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm font-semibold">Additional Rules Selection</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedCustomRuleIds.size + selectedCommunityRuleIds.size} selected
                      </Badge>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search rules by name or description..."
                          value={ruleSearchTerm}
                          onChange={(e) => setRuleSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            // Prevent Enter key from submitting the form
                            if (e.key === 'Enter') {
                              e.preventDefault()
                            }
                          }}
                          className="pl-10"
                        />
                      </div>
                      <Select value={ruleSeverityFilter} onValueChange={setRuleSeverityFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Severities</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyRulePreset('recommended')}
                        className="text-xs"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Recommended
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyRulePreset('maximum')}
                        className="text-xs"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Maximum Security
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    </div>

                    <Separator />

                    {/* Rule Categories - No Scroll for Main Sections */}
                    <div className="space-y-4">
                      {/* Custom Rules Section */}
                      {userCustomRules.length > 0 && (
                        <Collapsible
                          open={expandedCategories.has('custom')}
                          onOpenChange={(open) => {
                            const newSet = new Set(expandedCategories)
                            if (open) newSet.add('custom')
                            else newSet.delete('custom')
                            setExpandedCategories(newSet)
                          }}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors">
                              <div className="flex items-center gap-3">
                                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <div className="text-left">
                                  <div className="font-medium">My Custom Rules</div>
                                  <div className="text-xs text-muted-foreground">
                                    {selectedCustomRuleIds.size} of {filteredUserRules.length} selected
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    selectAllInCategory(filteredUserRules, true)
                                  }}
                                  className="text-xs"
                                >
                                  Select All
                                </Button>
                                {expandedCategories.has('custom') ? 
                                  <ChevronUp className="h-4 w-4" /> : 
                                  <ChevronDown className="h-4 w-4" />
                                }
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <ScrollArea className="h-[200px] pr-4">
                              <div className="space-y-2 pl-4">
                                {filteredUserRules.map((rule) => (
                                  <div
                                    key={rule.id}
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    <Checkbox
                                      checked={selectedCustomRuleIds.has(rule.id)}
                                      onCheckedChange={() => toggleRuleSelection(rule.id, true)}
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{rule.rule_name}</span>
                                        <Badge variant={rule.severity === 'error' ? 'destructive' : rule.severity === 'warning' ? 'secondary' : 'outline'} className="text-xs">
                                          {rule.severity}
                                        </Badge>
                                        {rule.language && (
                                          <Badge variant="outline" className="text-xs">
                                            {rule.language}
                                          </Badge>
                                        )}
                                      </div>
                                      {rule.description && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {rule.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-muted-foreground">↑ {rule.upvotes}</span>
                                        <span className="text-xs text-muted-foreground">• Used {rule.usage_count} times</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* Community Rules Section - Always Visible */}
                      {communityRules.length > 0 && (
                        <Collapsible
                          open={expandedCategories.has('community')}
                          onOpenChange={(open) => {
                            const newSet = new Set(expandedCategories)
                            if (open) newSet.add('community')
                            else newSet.delete('community')
                            setExpandedCategories(newSet)
                          }}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors">
                              <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                <div className="text-left">
                                  <div className="font-medium">Community Rules</div>
                                  <div className="text-xs text-muted-foreground">
                                    {selectedCommunityRuleIds.size} of {filteredCommunityRules.length} selected
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    selectAllInCategory(filteredCommunityRules, false)
                                  }}
                                  className="text-xs"
                                >
                                  Select All
                                </Button>
                                {expandedCategories.has('community') ? 
                                  <ChevronUp className="h-4 w-4" /> : 
                                  <ChevronDown className="h-4 w-4" />
                                }
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <ScrollArea className="h-[200px] pr-4">
                              <div className="space-y-2 pl-4">
                                {filteredCommunityRules.map((rule) => (
                                  <div
                                    key={rule.id}
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    <Checkbox
                                      checked={selectedCommunityRuleIds.has(rule.id)}
                                      onCheckedChange={() => toggleRuleSelection(rule.id, false)}
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{rule.rule_name}</span>
                                        <Badge variant={rule.severity === 'error' ? 'destructive' : rule.severity === 'warning' ? 'secondary' : 'outline'} className="text-xs">
                                          {rule.severity}
                                        </Badge>
                                        {rule.language && (
                                          <Badge variant="outline" className="text-xs">
                                            {rule.language}
                                          </Badge>
                                        )}
                                        {rule.is_verified && (
                                          <Badge variant="default" className="text-xs">
                                            <Check className="h-3 w-3 mr-1" />
                                            Verified
                                          </Badge>
                                        )}
                                      </div>
                                      {rule.description && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {rule.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-muted-foreground">↑ {rule.upvotes}</span>
                                        <span className="text-xs text-muted-foreground">• Used {rule.usage_count} times</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>

                  {/* Selection Summary */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                        {defaultRulesStats?.total_rules || 0} default rules
                        {selectedCustomRuleIds.size + selectedCommunityRuleIds.size > 0 && (
                          <span> + {selectedCustomRuleIds.size + selectedCommunityRuleIds.size} additional rules</span>
                        )}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRuleSelector(false)}
                      className="text-xs"
                    >
                      Back to Simple Mode
                    </Button>
                  </div>
                </div>
                </Card>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Step 3: Launch Security Scan */}
        {currentStep === 3 && watchedRepoName && (
          <div className="space-y-6">
            <div className="text-center py-2">
              <h3 className="text-lg font-semibold mb-2">Launch Complete Security Scan</h3>
              <p className="text-sm text-muted-foreground">Review your settings and launch the comprehensive security scan</p>
            </div>

            {/* Scan Configuration Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Complete A-to-Z Security Analysis</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive vulnerability detection with all security tools</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>SAST Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Secret Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Dependency Scan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Container Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Infrastructure Checks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>12+ Security Tools</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Configuration Summary */}
            <Card className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Scan Configuration Summary
                    </CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-300 text-sm">
                      Review your settings before launching the security scan
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Repository:
                    </span>
                    <span className="font-semibold text-sm">{watchedRepoName.split('/')[1]}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Branch:
                    </span>
                    <code className="font-semibold text-sm bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                      {watch('branch') || selectedRepo?.default_branch || 'main'}
                    </code>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Analysis Type:
                    </span>
                    <Badge variant="default" className="font-semibold">
                      Complete A-to-Z Security Scan
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Rules:
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge variant="default" className="text-xs">
                        {defaultRulesStats?.total_rules || 0} Default
                      </Badge>
                      {(watchedSelectedCustomRules && watchedSelectedCustomRules.length > 0) && (
                        <Badge variant="secondary" className="text-xs">
                          +{watchedSelectedCustomRules.length} Custom
                        </Badge>
                      )}
                      {(watchedSelectedCommunityRules && watchedSelectedCommunityRules.length > 0) && (
                        <Badge variant="secondary" className="text-xs">
                          +{watchedSelectedCommunityRules.length} Community
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 flex items-center justify-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-muted-foreground">Estimated completion time:</span>
                    <Badge variant="secondary" className="font-semibold">
                      8-15 minutes
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 pt-4 sm:pt-6 border-t">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            {currentStep > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                className="gap-2 h-12 sm:h-10 min-w-[44px] px-4"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground order-1 sm:order-2">
            <Shield className="h-4 w-4" />
            <span className="text-center">
              {currentStep === 3 ? 'Ready to launch comprehensive scan' : `Step ${currentStep} of ${totalSteps}`}
            </span>
          </div>
          
          <div className="flex items-center gap-2 order-3 w-full sm:w-auto">
            {currentStep < totalSteps ? (
              <Button 
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
                className="gap-2 h-12 sm:h-10 px-6 w-full sm:w-auto"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="button"
                disabled={isSubmitting || !watchedRepoName} 
                className="gap-2 h-12 sm:h-11 px-6 sm:px-8 font-semibold transition-all duration-200 hover:shadow-md disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
                onClick={async (e) => {
                  e.preventDefault()
                  // Start Security Scan button clicked
                  
                  // Ensure we're on step 3 before allowing submission
                  if (currentStep !== 3) {
                    console.warn('Submit button clicked from wrong step:', currentStep)
                    return
                  }
                  
                  // Manually triggering form submission
                  // Manually trigger form submission via react-hook-form
                  await handleSubmit(onSubmit)(e)
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="hidden sm:inline">Launching Complete Security Scan...</span>
                    <span className="sm:hidden">Launching...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Run Complete Security Scan</span>
                    <span className="sm:hidden">Run Scan</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
    </TooltipProvider>
  )
}