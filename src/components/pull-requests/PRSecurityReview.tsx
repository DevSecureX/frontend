import { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  MessageSquare, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Send,
  FileText,
  GitPullRequest,
  Search,
  ChevronDown,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useScanStore } from '@/store'
import { scansAPI } from '@/lib/api/scans'
import type { PullRequest } from '@/types/global'

const reviewSchema = z.object({
  pr_number: z.number().min(1, 'Pull request is required'),
  event: z.enum(['REQUEST_CHANGES', 'COMMENT'], {
    required_error: 'Review type is required',
  }),
  body: z.string().min(10, 'Review comment must be at least 10 characters'),
  security_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface PRSecurityReviewProps {
  repositoryFullName: string
  pullRequests: PullRequest[]
  singlePRMode?: boolean // When true, auto-select the PR and hide the dropdown
}

const REVIEW_TYPES = [
  {
    id: 'REQUEST_CHANGES' as const,
    name: 'Request Changes',
    description: 'Critical security issues found - must fix before merge',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400'
  },
  {
    id: 'COMMENT' as const,
    name: 'Security Review',
    description: 'Add security findings and recommendations',
    icon: MessageSquare,
    color: 'text-blue-600 dark:text-blue-400'
  }
]

const SECURITY_LEVELS = [
  { value: 'low', label: 'Low Risk', color: 'text-blue-600 dark:text-blue-400' },
  { value: 'medium', label: 'Medium Risk', color: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'high', label: 'High Risk', color: 'text-orange-600 dark:text-orange-400' },
  { value: 'critical', label: 'Critical Risk', color: 'text-red-600 dark:text-red-400' },
]

const REVIEW_TEMPLATES = {
  REQUEST_CHANGES: `🚨 **Security Review: CHANGES REQUESTED**

This pull request contains security issues that must be addressed before merging.

**Security Issues Found:**
- [ ] **Critical/High**: [Describe specific issues]
- [ ] **Medium**: [Describe specific issues]
- [ ] **Low**: [Describe specific issues]

**Required Actions:**
1. Fix all critical and high-severity vulnerabilities
2. Review and address medium-severity issues
3. Update dependencies with known vulnerabilities
4. Follow secure coding practices

Please address these issues and request another security review.`,

  COMMENT: `🔍 **Security Review Comments**

Security review completed for this pull request.

**Findings:**
- [Add specific security observations]
- [Mention any potential concerns]
- [Provide security recommendations]

**General Security Notes:**
- Ensure proper input validation
- Check for proper error handling
- Verify authentication and authorization
- Review for potential data exposure

Additional security testing may be recommended based on the changes.`
}

// Component for when there are no PRs
function NoPullRequestsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Review
        </CardTitle>
        <CardDescription>
          Post security review comments and approvals for pull requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <GitPullRequest className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-lg font-medium mb-1">No Pull Requests Found</p>
          <p className="text-sm">
            There are no open pull requests in this repository to review.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function PRSecurityReview({ repositoryFullName, pullRequests, singlePRMode = false }: PRSecurityReviewProps) {
  // ALL HOOKS MUST BE DECLARED BEFORE ANY EARLY RETURNS
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [recommendation, setRecommendation] = useState<{
    has_scan: boolean
    recommended_action: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'
    reason: string
    issue_counts?: {
      critical: number
      high: number
      medium: number
    }
  } | null>(null)
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)
  const { postSecurityReview } = useScanStore()

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    register
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      event: 'COMMENT'
    }
  })

  // Filter PRs based on search query
  const filteredPRs = useMemo(() => {
    if (!searchQuery.trim()) return pullRequests || []
    
    const query = searchQuery.toLowerCase()
    return (pullRequests || []).filter(pr => 
      pr.title.toLowerCase().includes(query) ||
      pr.author?.toLowerCase().includes(query) ||
      pr.number.toString().includes(query)
    )
  }, [pullRequests, searchQuery])

  // Auto-select PR when in single PR mode
  useEffect(() => {
    if (singlePRMode && pullRequests && pullRequests.length === 1) {
      setValue('pr_number', pullRequests[0].number)
    }
  }, [singlePRMode, pullRequests, setValue])

  const watchedPRNumber = watch('pr_number')
  const watchedEvent = watch('event')
  const watchedBody = watch('body')

  const selectedPR = pullRequests?.find(pr => pr.number === watchedPRNumber)

  // Fetch recommendation when PR is selected
  const fetchRecommendation = useCallback(async (prNumber: number) => {
    setIsLoadingRecommendation(true)
    try {
      const rec = await scansAPI.getPRReviewRecommendation(repositoryFullName, prNumber)
      setRecommendation(rec)
    } catch (error) {
      console.error('Failed to fetch review recommendation:', error)
      setRecommendation(null)
    } finally {
      setIsLoadingRecommendation(false)
    }
  }, [repositoryFullName])

  // Combined effect for PR selection and recommendation fetching
  useEffect(() => {
    // Auto-select PR in single PR mode
    if (singlePRMode && pullRequests && pullRequests.length > 0 && !watchedPRNumber) {
      const pr = pullRequests[0]
      setValue('pr_number', pr.number)
      return // Let the next effect handle the recommendation
    }

    // Fetch recommendation when PR is selected
    if (watchedPRNumber) {
      fetchRecommendation(watchedPRNumber)
    } else {
      setRecommendation(null)
    }
  }, [watchedPRNumber, fetchRecommendation, singlePRMode, pullRequests, setValue])

  // Early return if no pull requests - AFTER ALL HOOKS
  if (!pullRequests || pullRequests.length === 0) {
    return <NoPullRequestsView />
  }


  const onSubmit = async (data: ReviewFormData) => {
    try {
      const reviewData = {
        event: data.event,
        body: data.body,
        comments: [] // Additional inline comments could be added here
      }
      
      await postSecurityReview(repositoryFullName, data.pr_number, reviewData)
      
      // Reset form
      setValue('body', '')
      setValue('pr_number', 0)
    } catch (error: any) {
      console.error('Failed to post security review:', error)
    }
  }

  const handlePRChange = (prNumber: string) => {
    const num = parseInt(prNumber)
    setValue('pr_number', num)
  }

  const handlePRSelect = (pr: PullRequest) => {
    setValue('pr_number', pr.number)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleTemplateSelect = (template: string) => {
    if (template && REVIEW_TEMPLATES[template as keyof typeof REVIEW_TEMPLATES]) {
      setValue('body', REVIEW_TEMPLATES[template as keyof typeof REVIEW_TEMPLATES])
      setSelectedTemplate(template)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Review
          </CardTitle>
          <CardDescription>
            {singlePRMode 
              ? `Post security review for PR #${pullRequests[0]?.number || ''}`
              : 'Post security review comments and approvals for pull requests'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* PR Selection - Hide in single PR mode */}
            {!singlePRMode && (
              <div className="space-y-2">
                <Label htmlFor="pr_number">Pull Request *</Label>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isOpen}
                      className="w-full justify-between h-auto min-h-[40px] px-3 py-2"
                    >
                      {selectedPR ? (
                        <div className="flex items-center gap-2 w-full min-w-0">
                          <GitPullRequest className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium flex-shrink-0">#{selectedPR.number}</span>
                          <span className="text-sm text-muted-foreground truncate flex-1 min-w-0">
                            {selectedPR.title}
                          </span>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {selectedPR.state}
                          </Badge>
                        </div>
                      ) : (
                        "Select a pull request to review"
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] max-w-none p-0" align="start">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Search pull requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 border-0 p-0 shadow-none focus-visible:ring-0"
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredPRs.length === 0 ? (
                        <div className="py-6 text-center text-sm">
                          {searchQuery ? "No pull requests found." : "No pull requests available."}
                        </div>
                      ) : (
                        filteredPRs.map((pr) => (
                          <div
                            key={pr.number}
                            className="relative flex cursor-default select-none items-center px-2 py-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer"
                            onClick={() => handlePRSelect(pr)}
                          >
                            {selectedPR?.number === pr.number && (
                              <Check className="mr-2 h-4 w-4" />
                            )}
                            <div className={`flex items-center gap-2 w-full ${selectedPR?.number === pr.number ? '' : 'ml-6'}`}>
                              <GitPullRequest className="h-4 w-4 flex-shrink-0" />
                              <span className="font-medium flex-shrink-0">#{pr.number}</span>
                              <span className="text-sm text-muted-foreground truncate flex-1 min-w-0">
                                {pr.title}
                              </span>
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {pr.state}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.pr_number && (
                  <p className="text-sm text-destructive">{errors.pr_number.message}</p>
                )}
              </div>
            )}

            {/* Selected PR Details */}
            {selectedPR && (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GitPullRequest className="h-4 w-4" />
                    <span className="font-medium">#{selectedPR.number}: {selectedPR.title}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    by {selectedPR.author} • {selectedPR.changed_files} files changed
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Recommendation */}
            {selectedPR && recommendation && recommendation.has_scan && (
              <Alert className={`border-2 ${
                recommendation.recommended_action === 'APPROVE' ? 'border-green-200 bg-green-50' :
                recommendation.recommended_action === 'REQUEST_CHANGES' ? 'border-red-200 bg-red-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  System Recommendation: 
                  <Badge variant={
                    recommendation.recommended_action === 'APPROVE' ? 'default' :
                    recommendation.recommended_action === 'REQUEST_CHANGES' ? 'destructive' :
                    'secondary'
                  }>
                    {recommendation.recommended_action === 'APPROVE' ? 'APPROVE' :
                     recommendation.recommended_action === 'REQUEST_CHANGES' ? 'REQUEST CHANGES' :
                     'COMMENT ONLY'}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-1">
                    <p className="text-sm">{recommendation.reason}</p>
                    {recommendation.issue_counts && (
                      <div className="flex gap-4 mt-2 text-xs">
                        {recommendation.issue_counts.critical > 0 && (
                          <span className="text-red-600 dark:text-red-400">Critical: {recommendation.issue_counts.critical}</span>
                        )}
                        {recommendation.issue_counts.high > 0 && (
                          <span className="text-orange-600 dark:text-orange-400">High: {recommendation.issue_counts.high}</span>
                        )}
                        {recommendation.issue_counts.medium > 0 && (
                          <span className="text-yellow-600 dark:text-yellow-400">Medium: {recommendation.issue_counts.medium}</span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      You can still choose your preferred review action below.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {selectedPR && isLoadingRecommendation && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Loading system recommendation...</AlertDescription>
              </Alert>
            )}

            {selectedPR && recommendation && !recommendation.has_scan && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No security scan data available for this PR. The system cannot provide a recommendation.
                </AlertDescription>
              </Alert>
            )}

            {/* Review Type Selection */}
            <div className="space-y-4">
              <Label>Review Type *</Label>
              <RadioGroup 
                value={watchedEvent} 
                onValueChange={(value) => setValue('event', value as 'REQUEST_CHANGES' | 'COMMENT')}
                className="grid grid-cols-1 gap-4"
              >
                {REVIEW_TYPES.map((type) => {
                  const isRecommended = recommendation && recommendation.recommended_action === type.id
                  return (
                    <div key={type.id} className="flex items-center space-x-3">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                        <Card className={`transition-colors ${
                          watchedEvent === type.id ? 'border-primary bg-primary/5' : ''
                        } ${isRecommended ? 'ring-2 ring-blue-500/50' : ''}`}>
                          <CardContent className="flex items-center gap-3 p-4">
                            <div className={`p-2 rounded-lg bg-primary/10`}>
                              <type.icon className={`h-5 w-5 ${type.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2">
                                {type.name}
                                {isRecommended && (
                                  <Badge variant="outline" className="text-xs border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300">
                                    ✓ Recommended
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
              {errors.event && (
                <p className="text-sm text-destructive">{errors.event.message}</p>
              )}
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Use Template (Optional)</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a review template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REQUEST_CHANGES">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      Changes Required Template
                    </div>
                  </SelectItem>
                  <SelectItem value="COMMENT">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      General Review Template
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Review Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Review Comment *</Label>
              <Textarea
                id="body"
                placeholder="Write your security review comments here..."
                className="min-h-32"
                {...register('body')}
              />
              {errors.body && (
                <p className="text-sm text-destructive">{errors.body.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use Markdown formatting. Be specific about security issues and recommendations.
              </p>
            </div>

            {/* Security Level (for REQUEST_CHANGES) */}
            {watchedEvent === 'REQUEST_CHANGES' && (
              <div className="space-y-2">
                <Label>Security Risk Level</Label>
                <Select onValueChange={(value) => setValue('security_level', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECURITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${level.color}`} />
                          {level.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !watchedBody || !watchedPRNumber} 
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Posting Review...' : 'Post Security Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Review Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security Review Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium mb-1">What to Look For:</h4>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>• Input validation and sanitization</li>
              <li>• Authentication and authorization checks</li>
              <li>• Sensitive data exposure</li>
              <li>• SQL injection and XSS vulnerabilities</li>
              <li>• Insecure dependencies</li>
              <li>• Proper error handling</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Review Best Practices:</h4>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>• Be specific about security issues found</li>
              <li>• Provide actionable recommendations</li>
              <li>• Include relevant security standards (OWASP, CWE)</li>
              <li>• Consider the severity of findings</li>
              <li>• Suggest secure alternatives when possible</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}