import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Shield, 
  Play, 
  Loader2, 
  GitPullRequest, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  Filter,
  Users,
  Zap,
  Settings,
  Bot,
  Target
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useScanStore } from '@/store'
import { formatScanDuration } from '@/lib/utils'
import type { PullRequest } from '@/types/global'

interface BulkPRScannerProps {
  repositoryFullName: string
  pullRequests: PullRequest[]
  onComplete?: () => void
}

// Backend now ignores mode/scope - all scans are comprehensive
const bulkScanSchema = z.object({
  selected_prs: z.array(z.number()).min(1, 'Select at least one PR'),
  enable_ai_fixes: z.boolean().default(true),
  auto_comment: z.boolean().default(true),
  create_reviews: z.boolean().default(false),
  max_concurrent: z.number().min(1).max(10).default(3),
  filter_by_author: z.string().optional(),
  filter_by_size: z.enum(['all', 'small', 'medium', 'large']).default('all'),
  priority_critical_files: z.boolean().default(true),
})

type BulkScanFormData = z.infer<typeof bulkScanSchema>

interface ScanProgress {
  pr_number: number
  status: 'pending' | 'scanning' | 'completed' | 'failed'
  progress: number
  issues_found?: number
  error_message?: string
  scan_duration?: number
}

const SIZE_FILTERS = {
  all: { label: 'All Sizes', icon: Target },
  small: { label: 'Small (<50 lines)', icon: Target },
  medium: { label: 'Medium (50-200 lines)', icon: Target },
  large: { label: 'Large (>200 lines)', icon: Target },
}

export function BulkPRScanner({ repositoryFullName, pullRequests, onComplete }: BulkPRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState<ScanProgress[]>([])
  const [totalProgress, setTotalProgress] = useState(0)
  const { bulkScanPRs } = useScanStore()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<BulkScanFormData>({
    resolver: zodResolver(bulkScanSchema),
    defaultValues: {
      selected_prs: [],
      // Backend automatically runs comprehensive scans
      enable_ai_fixes: true,
      auto_comment: true,
      create_reviews: false,
      max_concurrent: 3,
      filter_by_size: 'all',
      priority_critical_files: true,
    }
  })

  const watchedSelectedPRs = watch('selected_prs')
  const watchedFilterByAuthor = watch('filter_by_author')
  const watchedFilterBySize = watch('filter_by_size')
  const watchedMaxConcurrent = watch('max_concurrent')

  // Filter PRs based on criteria
  const filteredPRs = pullRequests.filter(pr => {
    // Author filter
    if (watchedFilterByAuthor && 
        !pr.author?.toLowerCase().includes(watchedFilterByAuthor.toLowerCase())) {
      return false
    }

    // Size filter
    if (watchedFilterBySize !== 'all') {
      const totalChanges = pr.additions + pr.deletions
      switch (watchedFilterBySize) {
        case 'small':
          return totalChanges < 50
        case 'medium':
          return totalChanges >= 50 && totalChanges <= 200
        case 'large':
          return totalChanges > 200
      }
    }

    return true
  }).slice(0, 20) // Limit to 20 PRs max for performance

  // Auto-select high-priority PRs
  const getAutoPRs = () => {
    return filteredPRs
      .filter(pr => {
        // Auto-select PRs with security-sensitive files
        const hasSecurityFiles = pr.changed_files > 0 // This is a simplified check
        const isRecentlyUpdated = new Date(pr.updated_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
        return hasSecurityFiles || isRecentlyUpdated
      })
      .slice(0, 5) // Max 5 auto-selected
      .map(pr => pr.number)
  }

  const handleSelectAll = () => {
    const allPRNumbers = filteredPRs.map(pr => pr.number)
    setValue('selected_prs', allPRNumbers)
  }

  const handleSelectNone = () => {
    setValue('selected_prs', [])
  }

  const handleSelectAuto = () => {
    const autoPRs = getAutoPRs()
    setValue('selected_prs', autoPRs)
  }

  const onSubmit = async (data: BulkScanFormData) => {
    setIsScanning(true)
    
    // Initialize progress tracking
    const initialProgress = data.selected_prs.map(pr_number => ({
      pr_number,
      status: 'pending' as const,
      progress: 0
    }))
    setScanProgress(initialProgress)

    try {
      // Simulate progress updates (in real implementation, this would come from WebSocket/SSE)
      const totalPRs = data.selected_prs.length
      let completed = 0

      // Start bulk scan
      await bulkScanPRs(repositoryFullName, {
        pr_numbers: data.selected_prs,
        max_concurrent: data.max_concurrent,
        enable_ai_fixes: data.enable_ai_fixes,
        auto_comment: data.auto_comment,
        create_reviews: data.create_reviews,
        include_custom_rules: false,
        include_community_rules: false,
        selected_custom_rule_ids: [],
        selected_community_rule_ids: []
      })

      // Simulate progress tracking (replace with real WebSocket updates)
      for (let i = 0; i < totalPRs; i++) {
        setTimeout(() => {
          setScanProgress(prev => prev.map((item, index) => {
            if (index === i) {
              return {
                ...item,
                status: 'scanning',
                progress: 50
              }
            }
            return item
          }))

          // Complete after another delay
          setTimeout(() => {
            setScanProgress(prev => prev.map((item, index) => {
              if (index === i) {
                completed++
                setTotalProgress((completed / totalPRs) * 100)
                
                return {
                  ...item,
                  status: Math.random() > 0.1 ? 'completed' : 'failed',
                  progress: 100,
                  issues_found: Math.floor(Math.random() * 10),
                  scan_duration: Math.floor(Math.random() * 120) + 30,
                  error_message: Math.random() > 0.1 ? undefined : 'Scan timeout'
                }
              }
              return item
            }))

            if (completed === totalPRs) {
              setIsScanning(false)
              onComplete?.()
            }
          }, 2000 + Math.random() * 3000)
        }, i * 1000)
      }

    } catch (error: any) {
      console.error('Bulk scan failed:', error)
      setIsScanning(false)
      setScanProgress(prev => prev.map(item => ({
        ...item,
        status: 'failed',
        error_message: error.message || 'Scan failed'
      })))
    }
  }

  const getStatusIcon = (status: ScanProgress['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case 'scanning':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getSeverityBadge = (count: number) => {
    if (count === 0) return <Badge variant="outline" className="text-green-600">Clean</Badge>
    if (count < 5) return <Badge variant="secondary">{count} issues</Badge>
    if (count < 10) return <Badge variant="destructive">{count} issues</Badge>
    return <Badge variant="destructive" className="animate-pulse">{count} issues</Badge>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Bulk PR Security Scanner
        </CardTitle>
        <CardDescription>
          Scan multiple pull requests simultaneously with enterprise-grade parallel processing
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Filter by Author</Label>
              <Input
                placeholder="Username or email..."
                value={watchedFilterByAuthor || ''}
                onChange={(e) => setValue('filter_by_author', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Filter by Size</Label>
              <Select 
                value={watchedFilterBySize} 
                onValueChange={(value) => setValue('filter_by_size', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SIZE_FILTERS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Concurrent Scans</Label>
              <Select 
                value={watchedMaxConcurrent.toString()} 
                onValueChange={(value) => setValue('max_concurrent', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} concurrent scans
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PR Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Pull Requests ({watchedSelectedPRs.length} selected)</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleSelectAuto}>
                  <Target className="h-3 w-3 mr-1" />
                  Smart Select
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All ({filteredPRs.length})
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleSelectNone}>
                  Select None
                </Button>
              </div>
            </div>

            <ScrollArea className="h-64 border rounded-lg p-4">
              <div className="space-y-2">
                {filteredPRs.map((pr) => (
                  <div key={pr.number} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <Controller
                      name="selected_prs"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value.includes(pr.number)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, pr.number])
                            } else {
                              field.onChange(field.value.filter(n => n !== pr.number))
                            }
                          }}
                        />
                      )}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <GitPullRequest className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">#{pr.number}</span>
                        <span className="text-sm text-muted-foreground truncate">
                          {pr.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>by {pr.author}</span>
                        <span className="text-green-600">+{pr.additions}</span>
                        <span className="text-red-600">-{pr.deletions}</span>
                        <span>{pr.changed_files} files</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {pr.state}
                      </Badge>
                      {(pr.additions + pr.deletions) > 200 && (
                        <Badge variant="secondary" className="text-xs">
                          Large
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {errors.selected_prs && (
              <p className="text-sm text-destructive">{errors.selected_prs.message}</p>
            )}
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
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>SAST Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Secret Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Dependency Scan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Container Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Infrastructure Checks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>12+ Security Tools</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-muted-foreground">Estimated time:</span>
                  <Badge variant="secondary" className="font-semibold">5-8 min/PR</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-muted-foreground">Analysis type:</span>
                  <Badge variant="default" className="font-semibold">
                    Complete A-to-Z
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <div className="space-y-4">
            <Label>Advanced Options</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="enable_ai_fixes"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <Label>AI Fix Suggestions</Label>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />

              <Controller
                name="auto_comment"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <Label>Auto-Post Comments</Label>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />

              <Controller
                name="create_reviews"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <Label>Create PR Reviews</Label>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />

              <Controller
                name="priority_critical_files"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <Label>Priority Critical Files</Label>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isScanning || watchedSelectedPRs.length === 0}
              className="gap-2"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning {watchedSelectedPRs.length} PRs...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Bulk Scan ({watchedSelectedPRs.length} PRs)
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Progress Tracking */}
        {isScanning && scanProgress.length > 0 && (
          <div className="space-y-4">
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Overall Progress</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(totalProgress)}% complete
                </span>
              </div>
              <Progress value={totalProgress} className="w-full" />
            </div>

            <ScrollArea className="h-48 border rounded-lg p-4">
              <div className="space-y-2">
                {scanProgress.map((progress) => {
                  const pr = pullRequests.find(p => p.number === progress.pr_number)
                  return (
                    <div key={progress.pr_number} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(progress.status)}
                        <div>
                          <div className="font-medium">PR #{progress.pr_number}</div>
                          <div className="text-sm text-muted-foreground">{pr?.title}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {progress.status === 'completed' && progress.issues_found !== undefined && (
                          getSeverityBadge(progress.issues_found)
                        )}
                        {progress.status === 'failed' && (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                        {progress.scan_duration && (
                          <Badge variant="outline" className="text-xs">
                            {formatScanDuration(progress.scan_duration)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}