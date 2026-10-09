import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Shield, Play, Loader2, GitPullRequest, Zap, Users } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { useScanStore } from '@/store'
import type { BulkPRScanRequest } from '@/lib/api/scans'

const bulkScanSchema = z.object({
  max_concurrent: z.number().min(1).max(5).default(2),
})

type BulkScanFormData = z.infer<typeof bulkScanSchema>

interface BulkScanDialogProps {
  isOpen: boolean
  onClose: () => void
  repositoryFullName: string
  selectedPRNumbers: number[]
  onSuccess?: () => void
}


export function BulkScanDialog({
  isOpen,
  onClose,
  repositoryFullName,
  selectedPRNumbers,
  onSuccess
}: BulkScanDialogProps) {
  const { bulkScanPRs } = useScanStore()
  const navigate = useNavigate()

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<BulkScanFormData>({
    resolver: zodResolver(bulkScanSchema),
    defaultValues: {
      max_concurrent: 2
    }
  })

  const watchedMaxConcurrent = watch('max_concurrent')

  const onSubmit = async (data: BulkScanFormData) => {
    try {
      const scanRequest: BulkPRScanRequest = {
        pr_numbers: selectedPRNumbers,
        max_concurrent: data.max_concurrent,
        include_custom_rules: false,
        include_community_rules: false,
        selected_custom_rule_ids: [],
        selected_community_rule_ids: []
      }

      await bulkScanPRs(repositoryFullName, scanRequest)

      // Call onSuccess first for any cleanup
      onSuccess?.()

      // Redirect to scans page after a brief delay to show success message
      setTimeout(() => {
        // Scroll to top before navigation to ensure user lands at page top
        window.scrollTo(0, 0)
        navigate('/scans')
      }, 1500)
    } catch (error: any) {
      console.error('Failed to start bulk PR scan:', error)
    }
  }

  const getEstimatedTime = () => {
    const baseTime = 3 // minutes per PR (comprehensive scan)
    const totalTime = Math.ceil((selectedPRNumbers.length * baseTime) / watchedMaxConcurrent)
    return `${totalTime}-${Math.ceil(totalTime * 1.5)} min`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Scan Pull Requests
          </DialogTitle>
          <DialogDescription>
            Configure and launch security scans for {selectedPRNumbers.length} selected pull requests
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Selection Summary */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Scan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Repository:</span>
                <span className="font-medium">{repositoryFullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Selected PRs:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedPRNumbers.length}</span>
                  <div className="flex gap-1">
                    {selectedPRNumbers.slice(0, 5).map(num => (
                      <Badge key={num} variant="outline" className="text-xs">
                        #{num}
                      </Badge>
                    ))}
                    {selectedPRNumbers.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedPRNumbers.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Time:</span>
                <span className="font-medium">{getEstimatedTime()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Scan Configuration */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Bulk PR Security Analysis</h3>
                  <p className="text-sm text-muted-foreground">Complete security scanning for all selected pull requests</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Security Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitPullRequest className="h-4 w-4 text-green-600" />
                  <span>PR Changes Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span>Parallel Processing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Concurrency Control */}
          <div className="space-y-4">
            <Label>Concurrent Scans</Label>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Maximum concurrent scans: {watchedMaxConcurrent}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getEstimatedTime()}
                    </Badge>
                  </div>
                  
                  <Slider
                    value={[watchedMaxConcurrent]}
                    onValueChange={(value) => setValue('max_concurrent', value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 (Slower, less resource usage)</span>
                    <span>5 (Faster, more resource usage)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground">
              Higher concurrency means faster completion but uses more system resources. 
              Recommended: 2-3 for optimal balance.
            </p>
          </div>

          {/* Performance Warning */}
          {selectedPRNumbers.length > 10 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-amber-100">
                    <Shield className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800 text-sm mb-1">
                      Large Bulk Scan
                    </h4>
                    <p className="text-xs text-amber-700">
                      You're scanning {selectedPRNumbers.length} PRs. This may take considerable time 
                      and resources. Consider breaking this into smaller batches for better performance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting Scans...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Bulk Scan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}