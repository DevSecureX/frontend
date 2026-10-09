import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Shield, Play, Loader2, GitPullRequest, Code, Package, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
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
import { useScanStore } from '@/store'
import type { PullRequest } from '@/types/global'
import type { PRScanRequest } from '@/lib/api/scans'

const prScanSchema = z.object({
  pr_number: z.number().min(1, 'Pull request is required'),
})

type PRScanFormData = z.infer<typeof prScanSchema>

interface PRScanDialogProps {
  isOpen: boolean
  onClose: () => void
  repositoryFullName: string
  pullRequests: PullRequest[]
  onSuccess?: () => void
}


export function PRScanDialog({
  isOpen,
  onClose,
  repositoryFullName,
  pullRequests,
  onSuccess
}: PRScanDialogProps) {
  const { scanPullRequest } = useScanStore()
  const navigate = useNavigate()

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    register
  } = useForm<PRScanFormData>({
    resolver: zodResolver(prScanSchema)
  })

  const watchedPRNumber = watch('pr_number')

  const selectedPR = pullRequests.find(pr => pr.number === watchedPRNumber)

  const onSubmit = async (data: PRScanFormData) => {
    try {
      // Backend now runs comprehensive scans with ALL security tools automatically
      const scanRequest: PRScanRequest = {
        // Optional custom rules can still be added
        include_custom_rules: false,
        include_community_rules: false,
        selected_custom_rule_ids: [],
        selected_community_rule_ids: []
      }

      // Start the scan
      await scanPullRequest(repositoryFullName, data.pr_number, scanRequest)

      // Call onSuccess first for any cleanup
      onSuccess?.()

      // Redirect to scans page after a brief delay to show success message
      setTimeout(() => {
        // Scroll to top before navigation to ensure user lands at page top
        window.scrollTo(0, 0)
        navigate('/scans')
      }, 1500)
    } catch (error: any) {
      console.error('Failed to start PR scan:', error)
    }
  }

  const handlePRChange = (prNumber: string) => {
    setValue('pr_number', parseInt(prNumber))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete PR Security Scan</DialogTitle>
          <DialogDescription>
            Launch comprehensive security analysis for a specific pull request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* PR Selection */}
          <div className="space-y-2">
            <Label htmlFor="pr_number">Pull Request *</Label>
            <Select onValueChange={handlePRChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pull request to scan" />
              </SelectTrigger>
              <SelectContent>
                {pullRequests.map((pr) => (
                  <SelectItem key={pr.number} value={pr.number.toString()}>
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="h-4 w-4" />
                      <span className="font-medium">#{pr.number}</span>
                      <span className="text-sm text-muted-foreground truncate max-w-xs">
                        {pr.title}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {pr.state}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pr_number && (
              <p className="text-sm text-destructive">{errors.pr_number.message}</p>
            )}
          </div>

          {/* Selected PR Details */}
          {selectedPR && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GitPullRequest className="h-4 w-4" />
                  PR #{selectedPR.number}: {selectedPR.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Author:</span>
                  <span>{selectedPR.author || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">State:</span>
                  <Badge variant="outline" className="text-xs">
                    {selectedPR.state}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Changes:</span>
                  <span className="text-xs">
                    <span className="text-green-600">+{selectedPR.additions}</span>{' '}
                    <span className="text-red-600">-{selectedPR.deletions}</span>{' '}
                    <span className="text-muted-foreground">
                      ({selectedPR.changed_files} files)
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scan Configuration Summary */}
          {selectedPR && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Complete A-to-Z PR Security Analysis</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive vulnerability detection with all security tools</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-green-600" />
                    <span>Code Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <span>Dependency Check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Security Patterns</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-muted-foreground">Estimated time:</span>
                    <Badge variant="secondary" className="font-semibold">5-8 minutes</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <GitPullRequest className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-muted-foreground">Scan type:</span>
                    <Badge variant="default" className="font-semibold">
                      Complete A-to-Z PR Analysis
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !watchedPRNumber} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting Complete Security Scan...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Complete Security Scan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}