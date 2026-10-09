import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  GitBranch, 
  Github, 
  Search, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useRepositoryStore, useAuthStore } from '@/store'
import type { ConnectRepoRequest } from '@/lib/api/repositories'
import { toast } from 'sonner'

const connectRepoSchema = z.object({
  full_name: z.string().min(1, 'Repository is required'),
  niche: z.string().min(1, 'Project type is required'),
})

type ConnectRepoFormData = z.infer<typeof connectRepoSchema>

interface SimplifiedConnectDialogProps {
  onSuccess?: () => void
}

// Simplified niche options with progressive disclosure
const BASIC_NICHES = [
  { 
    value: 'all', 
    label: 'Complete Security Suite', 
    description: 'Comprehensive scanning across all security domains',
    icon: '🌟',
    recommended: true
  },
  { 
    value: 'web', 
    label: 'Web Application', 
    description: 'Standard web security for most applications',
    icon: '🌐'
  },
  { 
    value: 'api', 
    label: 'API & Backend', 
    description: 'REST APIs, GraphQL, and server-side security',
    icon: '🔌'
  },
]

const ADVANCED_NICHES = [
  { value: 'ai', label: 'AI/Machine Learning', description: 'ML models, data pipelines, AI applications', icon: '🤖' },
  { value: 'blockchain', label: 'Blockchain/Crypto', description: 'Smart contracts, DeFi, cryptocurrency projects', icon: '⛓️' },
  { value: 'iot', label: 'IoT/Embedded', description: 'IoT devices, embedded systems, hardware integration', icon: '🔧' },
  { value: 'web3', label: 'Web3 Frontend', description: 'dApps, Web3 interfaces, wallet integrations', icon: '🚀' },
  { value: 'cloud', label: 'Cloud Native', description: 'Kubernetes, Docker, infrastructure as code', icon: '☁️' },
]

// Helper function for intelligent repository filtering
const filterRepositories = (repos: string[], query: string): string[] => {
  if (!query.trim()) {
    return repos
  }
  
  const queryLower = query.toLowerCase().trim()
  
  return repos.filter(repo => {
    const repoLower = repo.toLowerCase()
    const [owner, repoName] = repo.split('/')
    const ownerLower = owner?.toLowerCase() || ''
    const repoNameLower = repoName?.toLowerCase() || ''
    
    // Direct match on full name
    if (repoLower.includes(queryLower)) {
      return true
    }
    
    // Match on owner or repository name separately
    if (ownerLower.includes(queryLower) || repoNameLower.includes(queryLower)) {
      return true
    }
    
    // Enhanced matching for variations with hyphens, underscores, and spaces
    const normalizedQuery = queryLower.replace(/[-_\s]/g, '')
    const normalizedRepo = repoLower.replace(/[-_\s]/g, '')
    const normalizedOwner = ownerLower.replace(/[-_\s]/g, '')
    const normalizedRepoName = repoNameLower.replace(/[-_\s]/g, '')
    
    // Match normalized versions (handles cases like "myapp" matching "my-app")
    if (normalizedRepo.includes(normalizedQuery) || 
        normalizedOwner.includes(normalizedQuery) || 
        normalizedRepoName.includes(normalizedQuery)) {
      return true
    }
    
    // Word boundary matching for partial words
    const queryWords = queryLower.split(/[-_\s]+/).filter(word => word.length > 0)
    const repoWords = repoLower.split(/[-_\s/]+/).filter(word => word.length > 0)
    
    // Check if all query words are found in repository words
    if (queryWords.length > 0 && queryWords.every(queryWord => 
      repoWords.some(repoWord => repoWord.includes(queryWord))
    )) {
      return true
    }
    
    return false
  })
}

export function SimplifiedConnectDialog({ onSuccess }: SimplifiedConnectDialogProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showDetails, setShowDetails] = useState('')
  
  const { user } = useAuthStore()
  const {
    availableRepos,
    connectRepository,
    fetchAvailableRepos,
    isRepositoryConnected,
    isLoading,
    error
  } = useRepositoryStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<ConnectRepoFormData>({
    resolver: zodResolver(connectRepoSchema)
  })

  const watchedNiche = watch('niche')

  useEffect(() => {
    if (user?.is_github_connected) {
      fetchAvailableRepos()
    }
  }, [user?.is_github_connected, fetchAvailableRepos])

  const filteredRepos = useMemo(() => {
    // First, deduplicate the available repositories to fix React key warnings
    const uniqueRepos = Array.from(new Set(availableRepos))
    return filterRepositories(uniqueRepos, searchQuery)
  }, [availableRepos, searchQuery])

  const handleRepoSelect = (fullName: string) => {
    setSelectedRepo(fullName)
    setValue('full_name', fullName)
    setStep('configure')
  }

  const onSubmit = async (data: ConnectRepoFormData) => {
    try {
      const connectData: ConnectRepoRequest = {
        full_name: data.full_name,
        niche: data.niche as any
      }
      
      await connectRepository(connectData)
      onSuccess?.()
    } catch (error: any) {
      console.error('Failed to connect repository:', error)
    }
  }

  const handleBack = () => {
    setStep('select')
    setSelectedRepo(null)
    setValue('full_name', '')
    setValue('niche', '')
  }

  const selectedNicheInfo = [...BASIC_NICHES, ...ADVANCED_NICHES].find(n => n.value === watchedNiche)

  if (!user?.is_github_connected) {
    return (
      <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Connect GitHub Account
          </DialogTitle>
          <DialogDescription>
            Connect your GitHub account to access your repositories and start securing your code.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Github className="h-8 w-8 text-white" />
          </div>
          <p className="text-center text-muted-foreground mb-8 leading-relaxed max-w-sm">
            We'll securely connect to your GitHub account to access your repositories for security scanning.
          </p>
          <Button 
            onClick={async () => {
              try {
                const authUrl = await useAuthStore.getState().connectGithub()
                window.location.href = authUrl
              } catch (error) {
                console.error('Failed to connect GitHub:', error)
              }
            }}
            size="lg"
            className="gap-2 h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Github className="h-5 w-5" />
            Connect GitHub Account
          </Button>
        </div>
      </DialogContent>
    )
  }

  if (step === 'select') {
    return (
      <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Select Repository
          </DialogTitle>
          <DialogDescription>
            Choose a repository from your GitHub account to start security scanning.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search repositories (e.g., api-server, my-app, web-service)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Badge variant="secondary" className="text-xs">
                  {filteredRepos.length} found
                </Badge>
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredRepos.length} repositories found
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAvailableRepos()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Repository List */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading repositories...</span>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
                {searchQuery ? (
                  <div className="space-y-3">
                    <p className="text-muted-foreground font-medium">
                      No repositories found matching "{searchQuery}"
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Try searching for:</p>
                      <ul className="list-disc list-inside space-y-1 text-left">
                        <li>Repository name (e.g., "my-app" or "web-service")</li>
                        <li>Owner username</li>
                        <li>Part of the repository name</li>
                      </ul>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchQuery('')}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No repositories available.
                  </p>
                )}
              </div>
            ) : (
              // Render the filtered and deduplicated repositories
              filteredRepos.map((repo) => {
                const isConnected = isRepositoryConnected(repo)
                return (
                  <Card
                    key={repo}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      isConnected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => !isConnected && handleRepoSelect(repo)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">{repo.split('/')[1]}</p>
                          <p className="text-sm text-muted-foreground">
                            {repo.split('/')[0]}
                          </p>
                        </div>
                      </div>
                      
                      {isConnected ? (
                        <Badge className="gap-1 bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3" />
                          Connected
                        </Badge>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-hidden flex flex-col p-4 sm:p-6">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Configure Security Scanning
        </DialogTitle>
        <DialogDescription>
          Set up automated security scanning for {selectedRepo}
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto px-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-4">
          {/* Selected Repository */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">{selectedRepo}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Ready for security scanning</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Change
              </Button>
            </CardContent>
          </Card>

          {/* Simplified Project Type Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Choose Project Type *</Label>
              <p className="text-sm text-muted-foreground mt-1">
                This helps us apply the right security rules for your project.
              </p>
            </div>
            
            {/* Basic Options */}
            <div className="space-y-3">
              {BASIC_NICHES.map((niche) => (
                <div
                  key={niche.value}
                  role="radio"
                  aria-checked={watchedNiche === niche.value}
                  tabIndex={0}
                  className={`group relative rounded-xl border-2 transition-all duration-200 cursor-pointer p-4 ${
                    watchedNiche === niche.value 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  } ${niche.recommended ? 'ring-2 ring-yellow-400/30' : ''}`}
                  onClick={() => setValue('niche', niche.value)}
                >
                  {niche.recommended && (
                    <Badge className="absolute -top-2 left-4 bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                      ⭐ Recommended
                    </Badge>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{niche.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {niche.label}
                        </h4>
                        {watchedNiche === niche.value && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {niche.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Advanced Options */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full gap-2 mt-4">
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  {showAdvanced ? 'Hide' : 'Show'} Specialized Options
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-4">
                {ADVANCED_NICHES.map((niche) => (
                  <div
                    key={niche.value}
                    role="radio"
                    aria-checked={watchedNiche === niche.value}
                    tabIndex={0}
                    className={`group relative rounded-xl border-2 transition-all duration-200 cursor-pointer p-4 ${
                      watchedNiche === niche.value 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20 shadow-md' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => setValue('niche', niche.value)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-xl">{niche.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {niche.label}
                          </h4>
                          {watchedNiche === niche.value && (
                            <CheckCircle className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {niche.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          {/* Hidden input for form validation */}
          <input type="hidden" {...register('niche')} value={watchedNiche || ''} />
          
          {/* Validation Error */}
          {errors.niche && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.niche.message}</p>
            </div>
          )}
          
          {/* Selection Preview */}
          {selectedNicheInfo && (
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                      {selectedNicheInfo.icon} {selectedNicheInfo.label} Selected
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Security scanning will be optimized for {selectedNicheInfo.description.toLowerCase()}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </form>
      </div>

      <DialogFooter className="gap-2 flex-shrink-0 border-t pt-4">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={isSubmitting || !watchedNiche}
          size="lg"
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Connect Repository
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}