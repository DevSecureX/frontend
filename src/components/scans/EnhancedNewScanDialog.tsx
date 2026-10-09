import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Play, Loader2, Shield, Code, Package, Zap, GitBranch, Clock, AlertTriangle, Target, Settings, Info, ChevronRight, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useScanStore } from '@/store'
import { repositoryAPI } from '@/lib/api/repositories'
import type { Repository } from '@/types/global'
import type { ScanRequest } from '@/lib/api/scans'
import { ImprovedRuleSelection, type RuleSummary } from './ImprovedRuleSelection'

const newScanSchema = z.object({
  repo_full_name: z.string().min(1, 'Repository is required'),
  branch: z.string().optional(),
  mode: z.enum(['fast', 'comprehensive']).optional(),
  scope: z.string().optional(),
  selected_custom_rule_ids: z.array(z.string()).optional(),
  selected_community_rule_ids: z.array(z.string()).optional(),
})

type NewScanFormData = z.infer<typeof newScanSchema>

interface EnhancedNewScanDialogProps {
  repositories: Repository[]
  isLoadingRepos?: boolean
  onSuccess?: () => void
}

const SCAN_MODES = [
  {
    id: 'fast' as const,
    name: 'Fast Scan',
    description: 'Quick security check',
    icon: Zap,
    features: ['Essential checks', 'Common vulnerabilities', 'Secret detection'],
    estimatedTime: '1-3 min',
    color: 'yellow'
  },
  {
    id: 'comprehensive' as const,
    name: 'Comprehensive',
    description: 'Deep security analysis',
    icon: Shield,
    features: ['Full analysis', 'All vulnerabilities', 'Dependency scan', 'SBOM generation'],
    estimatedTime: '3-8 min',
    color: 'blue'
  }
]

const SCAN_SCOPES = [
  {
    id: 'code-only' as const,
    name: 'Code Only',
    icon: Code,
    description: 'Source code analysis',
    color: 'purple'
  },
  {
    id: 'deps' as const,
    name: 'Dependencies',
    icon: Package,
    description: 'Third-party packages',
    color: 'orange'
  },
  {
    id: 'code+deps' as const,
    name: 'Code + Deps',
    icon: Shield,
    description: 'Complete analysis',
    color: 'green',
    recommended: true
  },
  {
    id: 'full' as const,
    name: 'Full Scan',
    icon: Shield,
    description: 'Everything including infrastructure',
    color: 'blue'
  }
]

export function EnhancedNewScanDialog({ repositories, isLoadingRepos = false, onSuccess }: EnhancedNewScanDialogProps) {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [branches, setBranches] = useState<string[]>([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [ruleSummary, setRuleSummary] = useState<RuleSummary | null>(null)
  const [estimatedScanTime, setEstimatedScanTime] = useState<string>('2-5 minutes')
  const [repositorySearchQuery, setRepositorySearchQuery] = useState('')
  const [showRepositoryDropdown, setShowRepositoryDropdown] = useState(false)
  
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
  const watchedBranch = watch('branch')
  const watchedMode = watch('mode')
  const watchedScope = watch('scope')

  // Filter repositories based on search query
  const filteredRepositories = useMemo(() => {
    if (!repositorySearchQuery.trim()) {
      return repositories
    }
    return repositories.filter(repo =>
      repo.full_name.toLowerCase().includes(repositorySearchQuery.toLowerCase()) ||
      repo.full_name.split('/')[0].toLowerCase().includes(repositorySearchQuery.toLowerCase()) ||
      repo.full_name.split('/')[1].toLowerCase().includes(repositorySearchQuery.toLowerCase()) ||
      repo.full_name.split('/')[1]?.toLowerCase().includes(repositorySearchQuery.toLowerCase()) ||
      repo.language?.toLowerCase().includes(repositorySearchQuery.toLowerCase()) ||
      repo.niche?.toLowerCase().includes(repositorySearchQuery.toLowerCase())
    )
  }, [repositories, repositorySearchQuery])

  // Calculate estimated scan time based on selections
  useEffect(() => {
    const baseTime = 3 // comprehensive scan
    const rulesMultiplier = ruleSummary ? (1 + (ruleSummary.totalRules / 100) * 0.2) : 1
    
    const minTime = Math.round(baseTime * rulesMultiplier)
    const maxTime = Math.round(minTime * 2.5)
    
    setEstimatedScanTime(`${minTime}-${maxTime} minutes`)
  }, [ruleSummary])

  // Reset search state when component unmounts or repositories change
  useEffect(() => {
    setRepositorySearchQuery('')
    setShowRepositoryDropdown(false)
  }, [repositories])

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showRepositoryDropdown) {
        setShowRepositoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showRepositoryDropdown])

  const onSubmit = async (data: NewScanFormData) => {
    try {
      // Separate custom and community rule IDs
      const customIds: string[] = []
      const communityIds: string[] = []
      
      if (ruleSummary?.selectedRuleDetails) {
        ruleSummary.selectedRuleDetails.custom.forEach(r => customIds.push(r.id))
        ruleSummary.selectedRuleDetails.community.forEach(r => communityIds.push(r.id))
      }

      const scanRequest: ScanRequest = {
        repo_full_name: data.repo_full_name,
        branch: data.branch || selectedRepo?.default_branch,
        include_custom_rules: customIds.length > 0,
        niche: selectedRepo?.niche || 'all',
        include_community_rules: communityIds.length > 0,
        selected_custom_rule_ids: customIds,
        selected_community_rule_ids: communityIds
      }
      
      await triggerScan(scanRequest)
      onSuccess?.()
    } catch (error: any) {
      console.error('Failed to start scan:', error)
    }
  }

  const loadBranches = async (repoFullName: string) => {
    setIsLoadingBranches(true)
    try {
      const branchesResponse = await repositoryAPI.getBranches(repoFullName)
      setBranches(branchesResponse.branches)
      setValue('branch', branchesResponse.default_branch)
    } catch (error: any) {
      console.error('Failed to load branches:', error)
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
    
    if (repo) {
      loadBranches(repoFullName)
    }
  }

  const handleRuleSelectionChange = (ruleIds: string[], summary: RuleSummary) => {
    setRuleSummary(summary)
    // The summary already separates custom and community rules
    // We'll handle the separation in onSubmit
  }

  const steps = [
    { number: 1, title: 'Repository', completed: !!watchedRepoName },
    { number: 2, title: 'Configuration', completed: true },
    { number: 3, title: 'Rules', completed: !!ruleSummary && ruleSummary.totalRules > 0 },
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Configure Security Scan</DialogTitle>
              <DialogDescription>
                Set up a comprehensive security analysis for your repository
              </DialogDescription>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6 px-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${step.completed 
                      ? 'bg-green-500 text-white' 
                      : currentStep === step.number
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }
                  `}>
                    {step.completed ? '✓' : step.number}
                  </div>
                  <span className="text-xs mt-1">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-20 h-0.5 mx-2 -mt-5
                    ${step.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          {/* Step 1: Repository Selection */}
          <Card className={currentStep !== 1 && watchedRepoName ? 'opacity-60' : ''}>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setCurrentStep(1)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Repository & Branch</CardTitle>
                </div>
                {watchedRepoName && (
                  <Badge variant="outline" className="text-xs">
                    {watchedRepoName.split('/')[1]}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            {currentStep === 1 && (
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="repository" className="text-sm font-medium mb-2">
                    Select Repository
                  </Label>
                  
                  {/* Search-enabled Repository Selection */}
                  <div className="space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search repositories by name, language, or type..."
                        value={repositorySearchQuery}
                        onChange={(e) => setRepositorySearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                        onFocus={() => setShowRepositoryDropdown(true)}
                      />
                      {repositorySearchQuery && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => {
                            setRepositorySearchQuery('')
                            setShowRepositoryDropdown(false)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Repository Count and Results */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {isLoadingRepos ? (
                          'Loading repositories...'
                        ) : filteredRepositories.length === 0 ? (
                          repositorySearchQuery ? 
                            `No repositories found matching "${repositorySearchQuery}"` :
                            'No repositories available'
                        ) : (
                          `${filteredRepositories.length} repositor${filteredRepositories.length === 1 ? 'y' : 'ies'} found`
                        )}
                      </span>
                      {watchedRepoName && (
                        <Badge variant="outline" className="text-xs">
                          Selected: {watchedRepoName.split('/')[1]}
                        </Badge>
                      )}
                    </div>

                    {/* Repository List */}
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      {isLoadingRepos ? (
                        <div className="p-4 text-center">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                          <span className="text-sm text-muted-foreground">Loading repositories...</span>
                        </div>
                      ) : filteredRepositories.length === 0 ? (
                        <div className="p-6 text-center">
                          <GitBranch className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                          <div className="text-sm text-muted-foreground">
                            {repositorySearchQuery ? (
                              <>
                                <p className="font-medium">No repositories match your search</p>
                                <p className="text-xs mt-1">Try adjusting your search terms or browse all repositories</p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium">No repositories available</p>
                                <p className="text-xs mt-1">Connect a repository first to start scanning</p>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredRepositories.map((repo) => (
                            <div
                              key={repo.id}
                              className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                                watchedRepoName === repo.full_name ? 'bg-accent border-l-4 border-l-primary' : ''
                              }`}
                              onClick={() => {
                                handleRepoChange(repo.full_name)
                                setShowRepositoryDropdown(false)
                                setRepositorySearchQuery('')
                              }}
                            >
                              {/* Mobile-first responsive layout */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="font-medium truncate">{repo.full_name.split('/')[1]}</div>
                                    {watchedRepoName === repo.full_name && (
                                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1 truncate pl-6">
                                    {repo.full_name.split('/')[0]} • {repo.niche}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 pl-6 sm:pl-0">
                                  {repo.language && (
                                    <Badge variant="secondary" className="text-xs">
                                      {repo.language}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedRepo && (
                  <div>
                    <Label htmlFor="branch" className="text-sm font-medium mb-2">
                      Branch to Scan
                    </Label>
                    <Select 
                      onValueChange={(value) => setValue('branch', value)}
                      value={watchedBranch || selectedRepo.default_branch}
                      disabled={isLoadingBranches}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-3 w-3" />
                              {branch}
                              {branch === selectedRepo.default_branch && (
                                <Badge variant="default" className="text-xs ml-2">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {watchedRepoName && (
                  <Button 
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full"
                  >
                    Continue to Configuration
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            )}
          </Card>

          {/* Step 2: Scan Configuration */}
          {watchedRepoName && (
            <Card className={currentStep !== 2 && watchedMode && watchedScope ? 'opacity-60' : ''}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setCurrentStep(2)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-base">Scan Configuration</CardTitle>
                  </div>
                  {watchedMode && watchedScope && (
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {SCAN_MODES.find(m => m.id === watchedMode)?.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {SCAN_SCOPES.find(s => s.id === watchedScope)?.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>

              {currentStep === 2 && (
                <CardContent className="space-y-6">
                  {/* Scan Mode */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Scan Mode</Label>
                    <RadioGroup 
                      value={watchedMode} 
                      onValueChange={(value) => setValue('mode', value as 'fast' | 'comprehensive')}
                      className="grid grid-cols-2 gap-3"
                    >
                      {SCAN_MODES.map((mode) => (
                        <Label
                          key={mode.id}
                          htmlFor={mode.id}
                          className="cursor-pointer"
                        >
                          <RadioGroupItem value={mode.id} id={mode.id} className="sr-only" />
                          <Card className={`
                            transition-all hover:shadow-md
                            ${watchedMode === mode.id 
                              ? 'border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/30' 
                              : 'border hover:border-gray-400'
                            }
                          `}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <mode.icon className={`h-5 w-5 mt-0.5 text-${mode.color}-600`} />
                                <div className="flex-1">
                                  <div className="font-medium">{mode.name}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {mode.description}
                                  </div>
                                  <div className="flex items-center gap-1 mt-2">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-xs">{mode.estimatedTime}</span>
                                  </div>
                                </div>
                                {watchedMode === mode.id && (
                                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                                    ✓
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Scan Scope */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Scan Scope</Label>
                    <RadioGroup 
                      value={watchedScope} 
                      onValueChange={(value) => setValue('scope', value as any)}
                      className="grid grid-cols-2 gap-3"
                    >
                      {SCAN_SCOPES.map((scope) => (
                        <Label
                          key={scope.id}
                          htmlFor={`scope-${scope.id}`}
                          className="cursor-pointer"
                        >
                          <RadioGroupItem value={scope.id} id={`scope-${scope.id}`} className="sr-only" />
                          <Card className={`
                            transition-all hover:shadow-md relative
                            ${watchedScope === scope.id 
                              ? 'border-2 border-green-500 bg-green-50/50 dark:bg-green-950/30' 
                              : 'border hover:border-gray-400'
                            }
                          `}>
                            {scope.recommended && (
                              <Badge className="absolute -top-2 -right-2 text-xs" variant="default">
                                Recommended
                              </Badge>
                            )}
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <scope.icon className={`h-5 w-5 mt-0.5 text-${scope.color}-600`} />
                                <div className="flex-1">
                                  <div className="font-medium">{scope.name}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {scope.description}
                                  </div>
                                </div>
                                {watchedScope === scope.id && (
                                  <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                                    ✓
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  {watchedMode && watchedScope && (
                    <Button 
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-full"
                    >
                      Continue to Rule Selection
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* Step 3: Rule Selection */}
          {watchedRepoName && watchedMode && watchedScope && (
            <Card className={currentStep !== 3 ? 'opacity-60' : ''}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setCurrentStep(3)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-base">Security Rules</CardTitle>
                  </div>
                  {ruleSummary && (
                    <Badge variant="outline" className="text-xs">
                      {ruleSummary.totalRules} rules selected
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {currentStep === 3 && selectedRepo && (
                <CardContent>
                  <ImprovedRuleSelection
                    niche={selectedRepo.niche}
                    selectedRuleIds={[]}
                    onRuleSelectionChange={handleRuleSelectionChange}
                  />
                </CardContent>
              )}
            </Card>
          )}

          {/* Final Summary */}
          {watchedRepoName && watchedMode && watchedScope && ruleSummary && ruleSummary.totalRules > 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Ready to Scan</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Repository:</span>
                      <span className="font-medium">{watchedRepoName?.split('/')[1]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Branch:</span>
                      <code className="font-medium">{watchedBranch || selectedRepo?.default_branch}</code>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mode:</span>
                      <span className="font-medium">{SCAN_MODES.find(m => m.id === watchedMode)?.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scope:</span>
                      <span className="font-medium">{SCAN_SCOPES.find(s => s.id === watchedScope)?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rules:</span>
                      <span className="font-medium">{ruleSummary.totalRules} total</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Time:</span>
                      <span className="font-medium">{estimatedScanTime}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Your scan will analyze {ruleSummary.totalRules} security rules across your {watchedScope} with {watchedMode} analysis depth.
                    The scan will begin immediately after clicking start.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          <DialogFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </div>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                !watchedRepoName || 
                !watchedMode || 
                !watchedScope ||
                !ruleSummary ||
                ruleSummary.totalRules === 0
              }
              className="gap-2 px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting Scan...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Security Scan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </TooltipProvider>
  )
}