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
  RefreshCw
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useRepositoryStore, useAuthStore } from '@/store'
import type { ConnectRepoRequest } from '@/lib/api/repositories'
import { toast } from 'sonner'

const connectRepoSchema = z.object({
  full_name: z.string().min(1, 'Repository is required'),
  niche: z.string().min(1, 'Niche is required'),
})

type ConnectRepoFormData = z.infer<typeof connectRepoSchema>

interface ConnectRepoDialogProps {
  onSuccess?: () => void
}

// Enhanced security niches with specialized rule sets (137+ rules total)
// Each niche provides tailored security scanning with specific vulnerability patterns
const NICHES = [
  { 
    value: 'all', 
    label: 'All Niches (Comprehensive)', 
    description: 'Scan across ALL security domains - AI/ML, blockchain, IoT, Web3, cloud-native, and API security (137+ rules)',
    highlight: true
  },
  { value: 'ai', label: 'AI/Machine Learning', description: 'ML models, data pipelines, AI applications' },
  { value: 'blockchain', label: 'Blockchain/Crypto', description: 'Smart contracts, DeFi, cryptocurrency projects' },
  { value: 'iot', label: 'IoT/Embedded', description: 'IoT devices, embedded systems, hardware integration' },
  { value: 'web3', label: 'Web3 Frontend', description: 'dApps, Web3 interfaces, wallet integrations' },
  { value: 'cloud', label: 'Cloud Native', description: 'Kubernetes, Docker, infrastructure as code' },
  { value: 'api', label: 'API Security', description: 'REST APIs, GraphQL, microservices' }
]


export function ConnectRepoDialog({ onSuccess }: ConnectRepoDialogProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  
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
    if (!searchQuery.trim()) {
      return availableRepos
    }
    return availableRepos.filter(repo =>
      repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.split('/')[0].toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.split('/')[1].toLowerCase().includes(searchQuery.toLowerCase())
    )
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
    // Clear form state when going back
    setValue('full_name', '')
    setValue('niche', '')
  }

  if (!user?.is_github_connected) {
    return (
      <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Connect GitHub Account</DialogTitle>
          <DialogDescription>
            You need to connect your GitHub account first to access your repositories.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <Github className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground mb-6">
            Connect your GitHub account to see and import your repositories.
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
            className="gap-2"
          >
            <Github className="h-4 w-4" />
            Connect GitHub
          </Button>
        </div>
      </DialogContent>
    )
  }

  if (step === 'select') {
    return (
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Select Repository</DialogTitle>
          <DialogDescription>
            Choose a repository from your GitHub account to connect for security scanning.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Refresh Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Found {filteredRepos.length} repositories
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
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading repositories...</span>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No repositories found matching your search.' : 'No repositories available.'}
                </p>
              </div>
            ) : (
              filteredRepos.map((repo) => {
                const isConnected = isRepositoryConnected(repo)
                return (
                  <Card
                    key={repo}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      isConnected ? 'opacity-50' : ''
                    }`}
                    onClick={() => !isConnected && handleRepoSelect(repo)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <GitBranch className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{repo}</p>
                          <p className="text-sm text-muted-foreground">
                            {repo.split('/')[0]} / {repo.split('/')[1]}
                          </p>
                        </div>
                      </div>
                      
                      {isConnected ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Connected
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline">
                          Select
                        </Button>
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
    <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-4 sm:p-6">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle>Configure Repository</DialogTitle>
        <DialogDescription>
          Set up security scanning configuration for {selectedRepo}
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto px-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-4">
        {/* Selected Repository */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{selectedRepo}</p>
                <p className="text-sm text-muted-foreground">Selected repository</p>
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
              Change Repository
            </Button>
          </CardContent>
        </Card>

        {/* Project Type Selection - Enterprise Grade */}
        <div className="space-y-5">
          {/* Header Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Project Type *
              </Label>
              <span className="text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                {NICHES.length} options available
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Select your project's primary domain to activate specialized security rule sets and vulnerability detection patterns.
            </p>
          </div>
          
          {/* Selection Grid */}
          <div className="space-y-3">
            {NICHES.map((niche, index) => (
              <div
                key={niche.value}
                role="radio"
                aria-checked={watchedNiche === niche.value}
                tabIndex={0}
                className={`group relative rounded-xl border transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
                  watchedNiche === niche.value 
                    ? 'border-primary bg-primary/8 shadow-lg shadow-primary/10 ring-1 ring-primary/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary/40 hover:bg-primary/2 hover:shadow-md'
                } ${niche.highlight ? 'border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950 dark:via-orange-950 dark:to-amber-950 shadow-amber-100/50' : ''}`}
                onClick={() => setValue('niche', niche.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setValue('niche', niche.value)
                  }
                }}
              >
                {/* Selection Indicator - Moved to prevent scrollbar collision */}
                {watchedNiche === niche.value && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-1">
                      {/* Title Row */}
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`text-base font-semibold leading-tight ${
                          niche.highlight ? 'text-amber-800 dark:text-amber-200' : 
                          watchedNiche === niche.value ? 'text-primary' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {niche.label}
                        </h4>
                        {niche.highlight && (
                          <div className="flex items-center gap-1">
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs font-medium px-2 py-1">
                              Most Popular
                            </Badge>
                          </div>
                        )}
                        {index === 0 && (
                          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
                            Comprehensive
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                        {niche.description}
                      </p>

                      {/* Features/Benefits */}
                      <div className="flex items-center gap-4 text-xs">
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {niche.value === 'all' ? '137+' : '20-30'} security rules
                        </span>
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Specialized patterns
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Hidden input for form validation */}
          <input 
            type="hidden" 
            {...register('niche')} 
            value={watchedNiche || ''} 
          />
          
          {/* Validation Error */}
          {errors.niche && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Selection Required</p>
                <p className="text-sm text-red-600 dark:text-red-400">{errors.niche.message}</p>
              </div>
            </div>
          )}
          
          {/* Selection Confirmation */}
          {watchedNiche && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    Security Configuration Activated
                  </p>
                  
                  {watchedNiche === 'all' && (
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p className="font-medium">Complete Coverage: 118+ security rules across all domains</p>
                      <div className="text-xs space-y-0.5 ml-2">
                        <p>• AI/ML Security: PyTorch, TensorFlow, model poisoning (25 rules)</p>
                        <p>• Blockchain: Smart contracts, DeFi, reentrancy attacks (25 rules)</p>
                        <p>• IoT/Embedded: Buffer overflows, firmware security (27 rules)</p>
                        <p>• Web3 Frontend: MetaMask, private keys, transaction security (15 rules)</p>
                        <p>• Cloud Native: Kubernetes, Docker, Terraform (20 rules)</p>
                        <p>• API Security: GraphQL, JWT, CORS vulnerabilities (16 rules)</p>
                        <p className="text-green-600 font-medium mt-1">+ OWASP Top 10 2021 & CWE compliance mapping</p>
                      </div>
                    </div>
                  )}

                  {watchedNiche === 'ai' && (
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p className="font-medium">AI/ML Security: 25 specialized rules activated</p>
                      <div className="text-xs ml-2 space-y-0.5">
                        <p>• Model loading & pickle deserialization attacks</p>
                        <p>• Dataset poisoning & federated learning security</p>
                        <p>• LLM/Shadow AI detection & GPU memory protection</p>
                        <p>• ML supply chain attacks & differential privacy</p>
                      </div>
                    </div>
                  )}

                  {watchedNiche === 'blockchain' && (
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p className="font-medium">Blockchain Security: 25 smart contract rules activated</p>
                      <div className="text-xs ml-2 space-y-0.5">
                        <p>• Reentrancy vulnerabilities & flash loan attacks</p>
                        <p>• Price oracle manipulation & integer overflows</p>
                        <p>• Access control issues & signature vulnerabilities</p>
                        <p>• Cross-chain attacks & DeFi-specific patterns</p>
                      </div>
                    </div>
                  )}

                  {watchedNiche === 'iot' && (
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p className="font-medium">IoT/Embedded Security: 27 hardware-focused rules activated</p>
                      <div className="text-xs ml-2 space-y-0.5">
                        <p>• Buffer overflows & memory corruption detection</p>
                        <p>• Firmware security & secure boot validation</p>
                        <p>• OTA updates & sensor input validation</p>
                        <p>• Hardware attack vectors & physical security</p>
                      </div>
                    </div>
                  )}

                  {watchedNiche === 'web3' && (
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p className="font-medium">Web3 Frontend Security: 15 dApp rules activated</p>
                      <div className="text-xs ml-2 space-y-0.5">
                        <p>• Private key exposure & MetaMask integration</p>
                        <p>• Chain ID validation & BigNumber handling</p>
                        <p>• IPFS security & transaction validation</p>
                        <p>• Event listener management & wallet security</p>
                      </div>
                    </div>
                  )}

                  {watchedNiche === 'cloud' && (
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p className="font-medium">Cloud Native Security: 20 infrastructure rules activated</p>
                      <div className="text-xs ml-2 space-y-0.5">
                        <p>• Container security & Kubernetes misconfigurations</p>
                        <p>• Service mesh security & Terraform/IaC issues</p>
                        <p>• Secrets management & network policies</p>
                        <p>• RBAC issues & cloud provider security</p>
                      </div>
                    </div>
                  )}

                  {watchedNiche === 'api' && (
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p className="font-medium">API Security: 16 endpoint protection rules activated</p>
                      <div className="text-xs ml-2 space-y-0.5">
                        <p>• GraphQL vulnerabilities & JWT security issues</p>
                        <p>• Rate limiting & CORS misconfigurations</p>
                        <p>• Injection attacks & authentication bypass</p>
                        <p>• API versioning & authorization flaws</p>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-green-600 dark:text-green-400 font-medium pt-1 border-t border-green-200 dark:border-green-700">
                    Includes OWASP Top 10 2021, CWE mapping & compliance frameworks (NIST, ISO 27001, PCI DSS)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </form>
      </div>

      <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 flex-shrink-0 border-t pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleBack}
          className="h-12 sm:h-10 order-2 sm:order-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={isSubmitting}
          className="h-12 sm:h-10 order-1 sm:order-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect Repository'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}