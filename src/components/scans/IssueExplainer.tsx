import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'
import { 
  Bot, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Code, 
  TestTube, 
  AlertTriangle,
  Copy,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react'
import type { Issue } from '@/lib/api/scans'

interface IssueExplainerProps {
  issue: Issue
  onFeedback?: (issueId: string, feedback: { is_false_positive: boolean; feedback_reason?: string }) => void
}

interface AIExplanation {
  explanation: string
  fix_suggestion?: string
  testing_approach?: string
  business_impact?: string
  owasp_mapping?: Record<string, any>
  cached: boolean
}

export function IssueExplainer({ issue, onFeedback }: IssueExplainerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [explanation, setExplanation] = useState<AIExplanation | null>(null)

  const explainMutation = useMutation({
    mutationFn: () => {
      if (!issue.tool || !issue.rule_id || !issue.category) {
        throw new Error('Missing required issue information for AI explanation')
      }
      return api.scans.getIssueExplanation(
        issue.tool,
        issue.rule_id,
        issue.category,
        issue.severity
      )
    },
    onSuccess: (data) => {
      setExplanation(data)
      setIsOpen(true)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to get AI explanation')
    },
  })

  const handleGetExplanation = () => {
    if (explanation) {
      setIsOpen(!isOpen)
    } else {
      explainMutation.mutate()
    }
  }

  const handleFeedback = (isFalsePositive: boolean, reason?: string) => {
    if (onFeedback && issue.id) {
      onFeedback(issue.id, {
        is_false_positive: isFalsePositive,
        feedback_reason: reason
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const formatCodeContext = () => {
    if (!issue.code_context) return null

    return Object.entries(issue.code_context).map(([lineNumber, content]) => (
      <div key={lineNumber} className="flex gap-3 text-sm font-mono">
        <span className="text-muted-foreground w-8 text-right">{lineNumber}</span>
        <code className="flex-1">{content}</code>
      </div>
    ))
  }

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{issue.message}</CardTitle>
              <Badge variant={getSeverityColor(issue.severity) as any}>
                {issue.severity}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-4 text-sm">
              {issue.tool && (
                <span className="flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  {issue.tool}
                </span>
              )}
              {issue.rule_id && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {issue.rule_id}
                </span>
              )}
              {issue.file_path && (
                <span className="font-mono text-xs">
                  {issue.file_path}
                  {issue.line_start && `:${issue.line_start}`}
                  {issue.line_end && issue.line_end !== issue.line_start && `-${issue.line_end}`}
                </span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetExplanation}
              disabled={explainMutation.isPending}
              className="gap-2"
            >
              {explainMutation.isPending ? (
                <>
                  <Bot className="h-4 w-4 animate-pulse" />
                  Explaining...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  {explanation ? `${isOpen ? 'Hide' : 'Show'  } AI Analysis` : 'Get AI Analysis'}
                </>
              )}
            </Button>
            
            {explanation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Issue Details */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {issue.category && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <p className="text-sm">{issue.category}</p>
            </div>
          )}
          {issue.confidence && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Confidence</label>
              <p className="text-sm">{issue.confidence}</p>
            </div>
          )}
          {issue.owasp_category && (
            <div>
              <label className="text-xs font-medium text-muted-foregroup">OWASP</label>
              <p className="text-sm">{issue.owasp_category}</p>
            </div>
          )}
          {issue.cwe_id && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">CWE</label>
              <p className="text-sm">{issue.cwe_id}</p>
            </div>
          )}
        </div>

        {/* Code Context */}
        {issue.code_context && Object.keys(issue.code_context).length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Code Context</label>
            <div className="bg-muted/50 rounded-md p-3 space-y-1 max-h-32 overflow-y-auto">
              {formatCodeContext()}
            </div>
          </div>
        )}

        {/* AI Explanation */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            {explanation && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium">AI Security Analysis</h4>
                  {explanation.cached && (
                    <Badge variant="outline" className="text-xs">
                      Cached
                    </Badge>
                  )}
                </div>

                {/* Explanation */}
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Explanation
                    </h5>
                    <div className="bg-muted/30 rounded-md p-3 text-sm whitespace-pre-wrap">
                      {explanation.explanation}
                    </div>
                  </div>

                  {explanation.fix_suggestion && (
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Fix Suggestion
                      </h5>
                      <div className="bg-green-50 dark:bg-green-950/30 rounded-md p-3 text-sm whitespace-pre-wrap border border-green-200 dark:border-green-800">
                        {explanation.fix_suggestion}
                      </div>
                    </div>
                  )}

                  {explanation.testing_approach && (
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        Testing Approach
                      </h5>
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3 text-sm whitespace-pre-wrap border border-blue-200 dark:border-blue-800">
                        {explanation.testing_approach}
                      </div>
                    </div>
                  )}

                  {explanation.business_impact && (
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Business Impact
                      </h5>
                      <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-md p-3 text-sm whitespace-pre-wrap border border-yellow-200 dark:border-yellow-800">
                        {explanation.business_impact}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(explanation.explanation)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    {explanation.owasp_mapping && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open('https://owasp.org/www-project-top-ten/', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        OWASP
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(true, 'False positive - AI explanation was helpful')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      False Positive
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(false, 'Valid issue - AI explanation was helpful')}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Compliance Information */}
        {(issue.nist_id || issue.pci_dss_id || issue.hipaa_id || issue.gdpr_article || issue.iso_27001_id) && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Compliance Frameworks</label>
            <div className="flex flex-wrap gap-2">
              {issue.nist_id && (
                <Badge variant="outline" className="text-xs">
                  NIST: {issue.nist_id}
                </Badge>
              )}
              {issue.pci_dss_id && (
                <Badge variant="outline" className="text-xs">
                  PCI DSS: {issue.pci_dss_id}
                </Badge>
              )}
              {issue.hipaa_id && (
                <Badge variant="outline" className="text-xs">
                  HIPAA: {issue.hipaa_id}
                </Badge>
              )}
              {issue.gdpr_article && (
                <Badge variant="outline" className="text-xs">
                  GDPR: {issue.gdpr_article}
                </Badge>
              )}
              {issue.iso_27001_id && (
                <Badge variant="outline" className="text-xs">
                  ISO 27001: {issue.iso_27001_id}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}