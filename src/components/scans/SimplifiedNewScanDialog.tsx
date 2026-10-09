import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Play, Loader2, Shield, GitBranch, Clock, AlertTriangle, Settings, Users, CheckCircle, Sparkles, Search, Filter, Check, ChevronDown, ChevronUp, Info, X, Zap } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
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

interface SimplifiedNewScanDialogProps {
  repositories: Repository[]
  isLoadingRepos?: boolean
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
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

export function SimplifiedNewScanDialog({ repositories, isLoadingRepos = false, onSuccess, open, onOpenChange }: SimplifiedNewScanDialogProps) {
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
  const [showAdvancedRules, setShowAdvancedRules] = useState(false)
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
  
  const applyRulePreset = (preset: 'recommended' | 'maximum' | 'none') => {
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
      case 'none':
        clearSelection()
        break
    }
  }

  const onSubmit = async (data: NewScanFormData) => {
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

  // Effect to load custom rules when repository changes
  useEffect(() => {
    if (selectedRepo?.niche) {
      loadCustomRules(selectedRepo.niche)
    }
  }, [selectedRepo?.niche])
  
  // Reset function to clear all state
  const resetDialogState = () => {
    setSelectedRepo(null)
    setBranches([])
    setBranchesError(null)
    setUserCustomRules([])
    setCommunityRules([])
    setDefaultRulesStats(null)
    setShowAdvancedRules(false)
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

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      resetDialogState()
    }
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

  const totalCustomRules = selectedCustomRuleIds.size + selectedCommunityRuleIds.size
  const defaultRulesCount = defaultRulesStats?.total_rules || 0
  const totalRules = defaultRulesCount + totalCustomRules

  return (
    <TooltipProvider delayDuration={300}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Start Security Scan</DialogTitle>
              <DialogDescription className="text-sm">
                Complete A-to-Z Security Analysis with all available tools
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Repository Selection */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Label htmlFor="repository" className="text-sm font-semibold">Repository *</Label>
              {repositories.length > 0 && (
                <Badge variant="outline" className="text-xs w-fit">
                  {repositories.length} available
                </Badge>
              )}
            </div>
            <Select onValueChange={handleRepoChange} value={watchedRepoName}>
              <SelectTrigger className="h-auto min-h-12 text-base py-2">
                {selectedRepo ? (
                  // Custom mobile-friendly display for selected repository
                  <div className="flex items-center justify-between w-full gap-2 text-left">
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-sm truncate">{selectedRepo.full_name.split('/')[1]}</span>
                      <span className="text-xs text-muted-foreground truncate">{selectedRepo.full_name.split('/')[0]}</span>
                    </div>
                    {/* Show badges only on desktop */}
                    <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {selectedRepo.niche}
                      </Badge>
                      {selectedRepo.language && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedRepo.language}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <SelectValue placeholder={
                    isLoadingRepos
                      ? "Loading repositories..."
                      : repositories.length === 0
                        ? "No repositories found"
                        : "Choose a repository to analyze"
                  } />
                )}
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
            </div>
          )}

          {/* Scan Configuration Summary */}
          {selectedRepo && (
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

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-muted-foreground">Estimated time:</span>
                    <Badge variant="secondary" className="font-semibold">8-15 minutes</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-muted-foreground">Rules:</span>
                    <Badge variant="default" className="font-semibold">
                      {totalRules} total
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Security Rules (Optional) */}
          {selectedRepo && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Label className="text-sm font-semibold">Additional Security Rules</Label>
                  <Badge variant="outline" className="text-xs w-fit">
                    Optional - {totalCustomRules} selected
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedRules(!showAdvancedRules)}
                  className="gap-2 h-10 sm:h-9 w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">{showAdvancedRules ? 'Hide Options' : 'Add Custom Rules'}</span>
                </Button>
              </div>
            
              {!showAdvancedRules ? (
                // Simple Mode - Quick Actions
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Quick Add Recommended */}
                    <Card 
                      className="cursor-pointer transition-all duration-200 hover:shadow-md border-2 border-dashed hover:border-blue-300 dark:hover:border-blue-600"
                      onClick={() => applyRulePreset('recommended')}
                    >
                      <CardContent className="p-3 text-center">
                        <Sparkles className="h-5 w-5 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                        <div className="text-sm font-medium">Add Recommended</div>
                        <div className="text-xs text-muted-foreground">Top-rated rules</div>
                      </CardContent>
                    </Card>

                    {/* Quick Add All */}
                    <Card 
                      className="cursor-pointer transition-all duration-200 hover:shadow-md border-2 border-dashed hover:border-green-300 dark:hover:border-green-600"
                      onClick={() => applyRulePreset('maximum')}
                    >
                      <CardContent className="p-3 text-center">
                        <Shield className="h-5 w-5 mx-auto mb-2 text-green-600 dark:text-green-400" />
                        <div className="text-sm font-medium">Add All Rules</div>
                        <div className="text-xs text-muted-foreground">Full security audit</div>
                      </CardContent>
                    </Card>

                    {/* Clear Selection */}
                    <Card 
                      className="cursor-pointer transition-all duration-200 hover:shadow-md border-2 border-dashed hover:border-gray-300 dark:hover:border-gray-600"
                      onClick={() => applyRulePreset('none')}
                    >
                      <CardContent className="p-3 text-center">
                        <X className="h-5 w-5 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <div className="text-sm font-medium">Clear All</div>
                        <div className="text-xs text-muted-foreground">No custom rules</div>
                      </CardContent>
                    </Card>
                  </div>

                  {totalCustomRules > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">
                          {totalCustomRules} additional rules selected
                        </span>
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {selectedCustomRuleIds.size > 0 && `${selectedCustomRuleIds.size} custom rules`}
                        {selectedCustomRuleIds.size > 0 && selectedCommunityRuleIds.size > 0 && ', '}
                        {selectedCommunityRuleIds.size > 0 && `${selectedCommunityRuleIds.size} community rules`}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Advanced Mode - Detailed Rule Selection
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm font-semibold">Advanced Rule Selection</span>
                      <Badge variant="outline" className="text-xs">
                        {totalCustomRules} selected
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
                        Maximum
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyRulePreset('none')}
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    </div>

                    <Separator />

                    {/* Rule Categories */}
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

                      {/* Community Rules Section */}
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
                  </div>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 pt-4 sm:pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground order-2 sm:order-1">
              <Info className="h-4 w-4" />
              <span>Comprehensive scan with 12+ security tools automatically applied</span>
            </div>
            
            <Button 
              type="submit"
              disabled={isSubmitting || !watchedRepoName} 
              className="gap-2 h-12 sm:h-11 px-6 sm:px-8 font-semibold transition-all duration-200 hover:shadow-md disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span className="hidden sm:inline">Starting Complete Security Scan...</span>
                  <span className="sm:hidden">Starting...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Run Complete Security Scan</span>
                  <span className="sm:hidden">Run Scan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </TooltipProvider>
  )
}