import { useState, useEffect } from 'react'
import { 
  TrendingUp,
  TrendingDown,
  GitPullRequest,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  Target,
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { scansAPI } from '@/lib/api/scans'
import type { PullRequest } from '@/types/global'

interface PRImpactAnalysisProps {
  repositoryFullName: string
  pullRequest: PullRequest
}

interface PRImpactData {
  security_impact: {
    risk_change: 'increased' | 'decreased' | 'neutral'
    risk_delta: number
    new_vulnerabilities: number
    fixed_vulnerabilities: number
    net_security_improvement: boolean
  }
  codebase_impact: {
    files_changed: number
    lines_added: number
    lines_removed: number
    security_sensitive_files: string[]
    affected_components: string[]
  }
  compliance_impact: {
    affected_standards: string[]
    compliance_score_change: number
    new_violations: number
    resolved_violations: number
  }
  team_context: {
    author_trust_score: number
    similar_pr_outcomes: {
      total: number
      successful: number
      issues_found: number
    }
    review_recommendations: string[]
  }
  deployment_readiness: {
    security_ready: boolean
    blocking_issues: number
    warnings: number
    recommendations: string[]
  }
}

export function PRImpactAnalysis({ repositoryFullName, pullRequest }: PRImpactAnalysisProps) {
  const [impactData, setImpactData] = useState<PRImpactData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPRImpact()
  }, [repositoryFullName, pullRequest.number])

  const fetchPRImpact = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // For now, we'll use the existing PR insights API and transform the data
      // In production, this would be a dedicated PR impact analysis endpoint
      const insights = await scansAPI.getPRSecurityInsights(repositoryFullName, pullRequest.number)
      
      // Transform the insights data into impact analysis format
      const transformedData: PRImpactData = {
        security_impact: {
          risk_change: insights.incremental_analysis.score_delta > 0 ? 'decreased' : 
                      insights.incremental_analysis.score_delta < 0 ? 'increased' : 'neutral',
          risk_delta: Math.abs(insights.incremental_analysis.score_delta || 0),
          new_vulnerabilities: insights.incremental_analysis.summary?.total_new || 0,
          fixed_vulnerabilities: insights.incremental_analysis.summary?.total_fixed || 0,
          net_security_improvement: insights.incremental_analysis.security_improvement || false
        },
        codebase_impact: {
          files_changed: pullRequest.changed_files || 0,
          lines_added: pullRequest.additions || 0,
          lines_removed: pullRequest.deletions || 0,
          security_sensitive_files: insights.incremental_analysis.new_issues
            ?.map(issue => issue.file_path)
            .filter((file, index, arr) => file && arr.indexOf(file) === index)
            .filter((file): file is string => file !== undefined) || [],
          affected_components: Array.from(new Set(
            insights.incremental_analysis.new_issues
              ?.map(issue => issue.category)
              .filter((category): category is string => category !== undefined) || []
          ))
        },
        compliance_impact: {
          affected_standards: ['OWASP', 'CWE', 'NIST'], // Mock data - would come from API
          compliance_score_change: insights.incremental_analysis.score_delta || 0,
          new_violations: insights.incremental_analysis.summary?.new_critical + insights.incremental_analysis.summary?.new_high || 0,
          resolved_violations: insights.incremental_analysis.summary?.fixed_critical + insights.incremental_analysis.summary?.fixed_high || 0
        },
        team_context: {
          author_trust_score: insights.historical_patterns?.trust_score || 0,
          similar_pr_outcomes: {
            total: insights.historical_patterns?.author_stats?.total_prs || 0,
            successful: Math.floor((insights.historical_patterns?.author_stats?.total_prs || 0) * 0.8), // Mock calculation
            issues_found: insights.historical_patterns?.author_stats?.risky_prs_count || 0
          },
          review_recommendations: insights.recommendations?.map(rec => rec.title) || []
        },
        deployment_readiness: {
          security_ready: insights.incremental_analysis.security_improvement && 
                          (insights.incremental_analysis.summary?.new_critical || 0) === 0,
          blocking_issues: (insights.incremental_analysis.summary?.new_critical || 0) + 
                          (insights.incremental_analysis.summary?.new_high || 0),
          warnings: insights.incremental_analysis.summary?.total_new || 0,
          recommendations: insights.recommendations?.slice(0, 3).map(rec => rec.description) || []
        }
      }
      
      setImpactData(transformedData)
    } catch (err) {
      setError('Failed to load PR impact analysis')
      console.error('Error fetching PR impact:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
        <span className="text-muted-foreground">Analyzing PR impact...</span>
      </div>
    )
  }

  if (error || !impactData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Unable to load PR impact analysis'}
        </AlertDescription>
      </Alert>
    )
  }

  const { security_impact, codebase_impact, compliance_impact, team_context, deployment_readiness } = impactData

  return (
    <div className="space-y-6">
      {/* Overall Impact Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                PR Impact Summary
              </CardTitle>
              <CardDescription>
                Security and codebase impact analysis for PR #{pullRequest.number}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Security Impact</div>
              <div className={`text-2xl font-bold flex items-center gap-1 ${
                security_impact.risk_change === 'decreased' ? 'text-green-600' :
                security_impact.risk_change === 'increased' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {security_impact.risk_change === 'decreased' ? (
                  <TrendingUp className="h-6 w-6" />
                ) : security_impact.risk_change === 'increased' ? (
                  <TrendingDown className="h-6 w-6" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-current opacity-20" />
                )}
                {security_impact.risk_change === 'neutral' ? 'Neutral' : `${security_impact.risk_delta}`}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Security Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Vulnerabilities</span>
                <div className="flex items-center gap-2">
                  {security_impact.new_vulnerabilities > 0 ? (
                    <Badge variant="destructive">
                      +{security_impact.new_vulnerabilities}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">0</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fixed Vulnerabilities</span>
                <div className="flex items-center gap-2">
                  {security_impact.fixed_vulnerabilities > 0 ? (
                    <Badge className="bg-green-600">
                      -{security_impact.fixed_vulnerabilities}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">0</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Net Security Change</span>
                <div className="flex items-center gap-2">
                  {security_impact.net_security_improvement ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Improved</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Degraded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {security_impact.net_security_improvement && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                This PR improves overall security by fixing more issues than it introduces.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Codebase Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Codebase Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{codebase_impact.files_changed}</div>
              <div className="text-sm text-muted-foreground">Files Changed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{codebase_impact.lines_added}</div>
              <div className="text-sm text-muted-foreground">Lines Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">-{codebase_impact.lines_removed}</div>
              <div className="text-sm text-muted-foreground">Lines Removed</div>
            </div>
          </div>

          {codebase_impact.security_sensitive_files.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Security-Sensitive Files ({codebase_impact.security_sensitive_files.length})
              </h4>
              <div className="space-y-1">
                {codebase_impact.security_sensitive_files.slice(0, 5).map((file, index) => (
                  <div key={index} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {file}
                  </div>
                ))}
                {codebase_impact.security_sensitive_files.length > 5 && (
                  <div className="text-sm text-muted-foreground">
                    +{codebase_impact.security_sensitive_files.length - 5} more files
                  </div>
                )}
              </div>
            </div>
          )}

          {codebase_impact.affected_components.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Affected Security Components</h4>
              <div className="flex flex-wrap gap-2">
                {codebase_impact.affected_components.map((component, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {component}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Author Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Author Security Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Trust Score</div>
              <div className="text-2xl font-bold">{team_context.author_trust_score}/100</div>
            </div>
            <div className="text-right">
              <Progress value={team_context.author_trust_score} className="w-24 mb-1" />
              <div className="text-xs text-muted-foreground">
                Based on {team_context.similar_pr_outcomes.total} PRs
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold">{team_context.similar_pr_outcomes.successful}</div>
              <div className="text-muted-foreground">Successful PRs</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{team_context.similar_pr_outcomes.issues_found}</div>
              <div className="text-muted-foreground">Issues Found</div>
            </div>
            <div className="text-center">
              <div className="font-bold">
                {team_context.similar_pr_outcomes.total > 0 ? 
                  Math.round((team_context.similar_pr_outcomes.successful / team_context.similar_pr_outcomes.total) * 100) : 0}%
              </div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Deployment Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Security Status</span>
            <div className="flex items-center gap-2">
              {deployment_readiness.security_ready ? (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ready to Deploy
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Needs Review
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Blocking Issues</div>
              <div className="text-2xl font-bold text-red-600">{deployment_readiness.blocking_issues}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Warnings</div>
              <div className="text-2xl font-bold text-yellow-600">{deployment_readiness.warnings}</div>
            </div>
          </div>

          {deployment_readiness.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Pre-deployment Recommendations</h4>
              <div className="space-y-2">
                {deployment_readiness.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!deployment_readiness.security_ready && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This PR has security issues that should be addressed before deployment. 
                Consider running security fixes or requesting additional review.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}