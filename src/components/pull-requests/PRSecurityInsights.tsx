import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  GitPullRequest,
  Sparkles,
  AlertOctagon,
  Info,
  Zap,
  FileCheck,
  Brain,
  ChevronRight,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { scansAPI } from '@/lib/api/scans'
import { useToast } from '@/components/ui/use-toast'
import { useTheme } from '@/lib/theme'

interface PRSecurityInsightsProps {
  repositoryFullName: string
  prNumber: number
  prTitle?: string
  onAutoFix?: (issueIds: string[]) => void
}

export function PRSecurityInsights({ 
  repositoryFullName, 
  prNumber, 
  prTitle,
  onAutoFix 
}: PRSecurityInsightsProps) {
  const { toast } = useToast()
  const { effectiveTheme: theme } = useTheme()
  const [insights, setInsights] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    incremental: true,
    ai: true,
    compliance: false
  })

  useEffect(() => {
    fetchInsights()
  }, [repositoryFullName, prNumber])

  const fetchInsights = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await scansAPI.getPRSecurityInsights(repositoryFullName, prNumber)
      setInsights(data)
    } catch (err) {
      setError('Failed to load security insights')
      console.error('Error fetching PR insights:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getRiskColor = (score: number) => {
    if (score <= 20) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
    if (score <= 40) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30'
    if (score <= 60) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30'
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
  }

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Analyzing security insights...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !insights) {
    return (
      <Alert variant="destructive">
        <AlertOctagon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || 'Unable to load security insights'}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4"
            onClick={fetchInsights}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const { 
    incremental_analysis = {}, 
    historical_patterns = {}, 
    security_trends = {}, 
    ai_insights = {}, 
    recommendations = [], 
    auto_fix_available = {}, 
    compliance_impact = {} 
  } = insights || {}

  return (
    <div className="space-y-6">
      {/* Header with Risk Score */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <GitPullRequest className="h-5 w-5" />
                PR Security Analysis
              </CardTitle>
              <CardDescription>
                {prTitle || `Pull Request #${prNumber}`}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
              <div className={`text-3xl font-bold rounded-lg px-3 py-1 ${getRiskColor(insights?.security_risk_score || 0)}`}>
                {insights?.security_risk_score || 0}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations
            .filter((rec: any) => rec.priority === 'critical' || rec.priority === 'high')
            .map((rec: any, index: number) => (
              <Alert key={index} variant={rec.priority === 'critical' ? 'destructive' : 'default'}>
                <AlertOctagon className="h-4 w-4" />
                <AlertTitle>{rec.title}</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>{rec.description}</span>
                  {rec.action === 'fix_required' && auto_fix_available?.auto_fix_available && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        const fixableIds = auto_fix_available.fixable_issues.map((i: any) => i.issue_id)
                        onAutoFix?.(fixableIds)
                      }}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Auto-Fix Available
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Incremental Analysis */}
      <Collapsible 
        open={expandedSections.incremental}
        onOpenChange={() => toggleSection('incremental')}
      >
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>Incremental Analysis</CardTitle>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.incremental ? 'rotate-90' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Score Comparison */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Base Score</div>
                  <div className="text-2xl font-bold">{incremental_analysis.base_score || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">PR Score</div>
                  <div className="text-2xl font-bold">{incremental_analysis.pr_score}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Change</div>
                  <div className={`text-2xl font-bold flex items-center gap-1 ${
                    incremental_analysis.score_delta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {incremental_analysis.score_delta > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    {Math.abs(incremental_analysis.score_delta)}
                  </div>
                </div>
              </div>

              {/* Issue Summary */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      New Issues ({incremental_analysis?.summary?.total_new || 0})
                    </h4>
                    <div className="space-y-1">
                      {(incremental_analysis?.summary?.new_critical || 0) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Critical</span>
                          <Badge variant="destructive">{incremental_analysis?.summary?.new_critical || 0}</Badge>
                        </div>
                      )}
                      {(incremental_analysis?.summary?.new_high || 0) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>High</span>
                          <Badge variant="destructive" className="bg-orange-600">{incremental_analysis?.summary?.new_high || 0}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Fixed Issues ({incremental_analysis?.summary?.total_fixed || 0})
                    </h4>
                    <div className="space-y-1">
                      {(incremental_analysis?.summary?.fixed_critical || 0) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Critical</span>
                          <Badge className="bg-green-600">{incremental_analysis?.summary?.fixed_critical || 0}</Badge>
                        </div>
                      )}
                      {(incremental_analysis?.summary?.fixed_high || 0) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>High</span>
                          <Badge className="bg-green-600">{incremental_analysis?.summary?.fixed_high || 0}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {incremental_analysis?.security_improvement && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-300">
                      This PR improves security by fixing more issues than it introduces!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* PR-Specific Issue Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Issues in This PR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Issues */}
          {(incremental_analysis?.new_issues?.length || 0) > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                New Security Issues ({incremental_analysis.new_issues.length})
              </h4>
              <div className="space-y-3">
                {incremental_analysis.new_issues.slice(0, 5).map((issue: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3 bg-red-50 dark:bg-red-950/20 border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {issue.severity}
                        </Badge>
                        <span className="text-sm font-medium capitalize">{issue.category}</span>
                      </div>
                      {issue.line_start && (
                        <span className="text-xs text-muted-foreground">
                          Line {issue.line_start}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{issue.message}</p>
                    {issue.file_path && (
                      <code className="text-xs bg-muted px-2 py-1 rounded block">
                        {issue.file_path}
                      </code>
                    )}
                  </div>
                ))}
                {incremental_analysis.new_issues.length > 5 && (
                  <div className="text-sm text-muted-foreground">
                    +{incremental_analysis.new_issues.length - 5} more issues...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fixed Issues */}
          {(incremental_analysis?.fixed_issues?.length || 0) > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                Fixed Security Issues ({incremental_analysis.fixed_issues.length})
              </h4>
              <div className="space-y-3">
                {incremental_analysis.fixed_issues.slice(0, 3).map((issue: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3 bg-green-50 dark:bg-green-950/20 border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600 text-xs">
                          {issue.severity}
                        </Badge>
                        <span className="text-sm font-medium capitalize">{issue.category}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{issue.message}</p>
                  </div>
                ))}
                {incremental_analysis.fixed_issues.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    +{incremental_analysis.fixed_issues.length - 3} more fixes...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No issues case */}
          {(!incremental_analysis?.new_issues || incremental_analysis.new_issues.length === 0) &&
           (!incremental_analysis?.fixed_issues || incremental_analysis.fixed_issues.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600 dark:text-green-400" />
              <p className="text-lg font-medium mb-1">No Security Issues Detected</p>
              <p className="text-sm">This PR doesn't introduce or fix any security vulnerabilities.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Collapsible 
        open={expandedSections.ai}
        onOpenChange={() => toggleSection('ai')}
      >
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  <CardTitle>AI Security Analysis</CardTitle>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.ai ? 'rotate-90' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className={`prose prose-sm max-w-none ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      const isInline = !match
                      return !isInline && match ? (
                        <SyntaxHighlighter
                          style={theme === 'dark' ? vscDarkPlus as any : vs as any}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={`px-1 py-0.5 rounded text-sm font-mono ${
                          theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                        }`}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {ai_insights?.security_assessment || 'No AI security assessment available.'}
                </ReactMarkdown>
              </div>

              {(ai_insights?.risk_areas?.length || 0) > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Key Risk Areas
                  </h4>
                  <ul className="space-y-1">
                    {(ai_insights?.risk_areas || []).map((risk: any, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(ai_insights?.improvement_suggestions?.length || 0) > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Improvement Suggestions
                  </h4>
                  <ul className="space-y-1">
                    {(ai_insights?.improvement_suggestions || []).map((suggestion: any, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">AI Confidence</span>
                <div className="flex items-center gap-2">
                  <Progress value={(ai_insights?.confidence_score || 0) * 100} className="w-24" />
                  <span className="text-sm font-medium">{((ai_insights?.confidence_score || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Compliance Impact */}
      {compliance_impact && (compliance_impact?.affected_frameworks?.length || 0) > 0 && (
        <Collapsible 
          open={expandedSections.compliance}
          onOpenChange={() => toggleSection('compliance')}
        >
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    <CardTitle>Compliance Impact</CardTitle>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.compliance ? 'rotate-90' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Impact Score</div>
                    <div className="text-2xl font-bold">{compliance_impact?.impact_score || 0}/100</div>
                  </div>
                  {compliance_impact?.requires_compliance_review && (
                    <Badge variant="destructive">Review Required</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {Object.entries(compliance_impact?.compliance_violations || {}).map(([framework, violations]: [string, any]) => {
                    if (!violations || !Array.isArray(violations) || violations.length === 0) return null
                    return (
                      <div key={framework}>
                        <h4 className="font-semibold text-sm uppercase mb-1">{framework}</h4>
                        <div className="flex flex-wrap gap-1">
                          {violations.map((violation: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {violation}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
}