import { useState, useEffect } from 'react'
import { 
  GitPullRequest, 
  Search, 
  Shield, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Clock,
  GitBranch,
  FileCode,
  Plus,
  Minus
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
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useScanStore } from '@/store'
import { useTimezone } from '@/contexts/TimezoneContext'
import type { PRListItem, PRScanRequest } from '@/lib/api/scans'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface PRScanDialogProps {
  repositoryFullName: string
  onSuccess?: () => void
}

export function PRScanDialog({ repositoryFullName, onSuccess }: PRScanDialogProps) {
  const { formatDateOnly } = useTimezone()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPRs, setSelectedPRs] = useState<Set<number>>(new Set())
  const [scanMode, setScanMode] = useState<'fast' | 'comprehensive'>('fast')
  const [scanScope, setScanScope] = useState<'code-only' | 'deps' | 'code+deps' | 'full'>('code-only')
  const [isLoadingPRs, setIsLoadingPRs] = useState(false)
  const [prList, setPRList] = useState<PRListItem[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [prStateFilter, setPRStateFilter] = useState<'open' | 'closed' | 'all'>('open')

  const { fetchPullRequests, scanPullRequest, bulkScanPRs } = useScanStore()

  useEffect(() => {
    loadPullRequests()
  }, [repositoryFullName, prStateFilter])

  const loadPullRequests = async () => {
    setIsLoadingPRs(true)
    try {
      const prs = await api.scans.listPRs(repositoryFullName)
      setPRList(prs.filter(pr => {
        if (prStateFilter === 'all') return true
        return pr.state === prStateFilter
      }))
    } catch (error) {
      console.error('Failed to load PRs:', error)
      toast.error('Failed to load pull requests')
    } finally {
      setIsLoadingPRs(false)
    }
  }

  const filteredPRs = prList.filter(pr =>
    searchQuery === '' ||
    pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.number.toString().includes(searchQuery) ||
    (pr.author?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handlePRToggle = (prNumber: number) => {
    setSelectedPRs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(prNumber)) {
        newSet.delete(prNumber)
      } else {
        newSet.add(prNumber)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedPRs.size === filteredPRs.length) {
      setSelectedPRs(new Set())
    } else {
      setSelectedPRs(new Set(filteredPRs.map(pr => pr.number)))
    }
  }

  const handleScan = async () => {
    if (selectedPRs.size === 0) {
      toast.error('Please select at least one pull request to scan')
      return
    }

    setIsScanning(true)
    
    try {
      const scanRequest: PRScanRequest = {
        mode: scanMode,
        scope: scanScope
      }

      if (selectedPRs.size === 1) {
        // Single PR scan
        const prNumber = Array.from(selectedPRs)[0]
        await scanPullRequest(repositoryFullName, prNumber, scanRequest)
        toast.success(`Started security scan for PR #${prNumber}`)
      } else {
        // Bulk scan
        await bulkScanPRs(repositoryFullName, {
          pr_numbers: Array.from(selectedPRs),
          mode: scanMode,
          scope: scanScope,
          max_concurrent: 5
        })
        toast.success(`Started security scans for ${selectedPRs.size} pull requests`)
      }

      onSuccess?.()
    } catch (error) {
      console.error('Failed to start PR scan:', error)
      toast.error('Failed to start pull request scan')
    } finally {
      setIsScanning(false)
    }
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'merged':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <DialogContent className="max-w-3xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Scan Pull Requests</DialogTitle>
        <DialogDescription>
          Select pull requests from {repositoryFullName} to run security scans
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title, number, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={prStateFilter} onValueChange={(value: any) => setPRStateFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={loadPullRequests}
            disabled={isLoadingPRs}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingPRs ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* PR List */}
        <div className="border rounded-lg">
          <div className="p-3 border-b flex items-center justify-between bg-muted/50">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedPRs.size === filteredPRs.length && filteredPRs.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedPRs.size} of {filteredPRs.length} selected
              </span>
            </div>
            <Badge variant="secondary">
              {prList.length} total PRs
            </Badge>
          </div>
          
          <ScrollArea className="h-64">
            {isLoadingPRs ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filteredPRs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <GitPullRequest className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pull requests found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredPRs.map((pr) => (
                  <label
                    key={pr.number}
                    className="flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedPRs.has(pr.number)}
                      onCheckedChange={() => handlePRToggle(pr.number)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">
                            #{pr.number} {pr.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>by {pr.author || 'unknown'}</span>
                            <span>•</span>
                            <span>{formatDateOnly(pr.created_at)}</span>
                            {pr.draft && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">Draft</Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge className={getStateColor(pr.state)}>
                          {pr.state}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Plus className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">{pr.additions}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Minus className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">{pr.deletions}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileCode className="h-3 w-3" />
                          <span>{pr.changed_files} files</span>
                        </div>
                      </div>
                      
                      {pr.labels.length > 0 && (
                        <div className="flex gap-1 flex-wrap pt-1">
                          {pr.labels.map((label) => (
                            <Badge key={label} variant="secondary" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Scan Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Scan Mode</Label>
            <RadioGroup value={scanMode} onValueChange={(value: any) => setScanMode(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fast" id="fast" />
                <Label htmlFor="fast" className="flex-1 cursor-pointer">
                  <div>Fast Scan</div>
                  <div className="text-xs text-muted-foreground">Quick security checks (2-3 min)</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comprehensive" id="comprehensive" />
                <Label htmlFor="comprehensive" className="flex-1 cursor-pointer">
                  <div>Comprehensive Scan</div>
                  <div className="text-xs text-muted-foreground">Deep analysis (10-30 min)</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Scan Scope</Label>
            <RadioGroup value={scanScope} onValueChange={(value: any) => setScanScope(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="code" id="code" />
                <Label htmlFor="code" className="flex-1 cursor-pointer">
                  <div>Code Only</div>
                  <div className="text-xs text-muted-foreground">Source code analysis</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deps" id="deps" />
                <Label htmlFor="deps" className="flex-1 cursor-pointer">
                  <div>Dependencies Only</div>
                  <div className="text-xs text-muted-foreground">Package vulnerabilities</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="code+deps" id="both" />
                <Label htmlFor="both" className="flex-1 cursor-pointer">
                  <div>Full Scan</div>
                  <div className="text-xs text-muted-foreground">Code + dependencies</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {selectedPRs.size > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    {selectedPRs.size === 1 
                      ? 'Ready to scan 1 pull request' 
                      : `Ready to scan ${selectedPRs.size} pull requests`}
                  </p>
                  <p className="text-blue-700">
                    Estimated time: {selectedPRs.size * (scanMode === 'fast' ? 3 : 7)} minutes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <DialogFooter>
        <Button
          onClick={handleScan}
          disabled={selectedPRs.size === 0 || isScanning}
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Scans...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Start Security Scan
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}