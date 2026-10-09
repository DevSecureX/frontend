import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Sparkles,
  Brain,
  TrendingUp,
  Target,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Code2,
  Shield,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  Filter,
  BarChart3,
  Lightbulb,
  Zap,
  Award
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { rulesAPI } from '@/lib/api/rules'
import type { RuleRecommendation, SupportedTool, RuleLanguage, CustomRule } from '@/types/rules'

interface EnhancedRecommendationsInterfaceProps {
  repositoryId?: string
  scanId?: string
  onRecommendationAccept?: (recommendation: RuleRecommendation) => void
  onRecommendationDismiss?: (recommendationId: string) => void
}

interface RecommendationFilters {
  basedOn: 'scan_results' | 'repository' | 'user_activity'
  vulnerabilityType?: string
  language?: RuleLanguage
  minScore?: number
}

export function EnhancedRecommendationsInterface({
  repositoryId,
  scanId,
  onRecommendationAccept,
  onRecommendationDismiss
}: EnhancedRecommendationsInterfaceProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [filters, setFilters] = useState<RecommendationFilters>({
    basedOn: 'user_activity',
    minScore: 0.0
  })
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'effective'>('personalized')

  // Fetch personalized recommendations
  const { 
    data: personalizedRecommendations, 
    isLoading: personalizedLoading,
    refetch: refetchPersonalized
  } = useQuery({
    queryKey: ['personalized-recommendations', filters, repositoryId, scanId],
    queryFn: () => rulesAPI.getRecommendations(
      filters.basedOn,
      repositoryId,
      scanId,
      filters.vulnerabilityType,
      filters.language,
      20
    ),
    staleTime: 5 * 60 * 1000
  })

  // Fetch top performing rules as recommendations
  const { data: topPerformingRules } = useQuery({
    queryKey: ['top-performing-recommendations'],
    queryFn: () => rulesAPI.getTopPerformingRules(15, 'effectiveness'),
    staleTime: 10 * 60 * 1000
  })

  // Fetch trending rules
  const { data: trendingRules } = useQuery({
    queryKey: ['trending-recommendations'],
    queryFn: () => rulesAPI.getTrendingRules(15),
    staleTime: 10 * 60 * 1000
  })

  // Clone rule mutation
  const cloneRuleMutation = useMutation({
    mutationFn: ({ ruleId, newName }: { ruleId: string; newName: string }) =>
      rulesAPI.cloneRule(ruleId, newName),
    onSuccess: (clonedRule) => {
      toast({
        title: "Rule cloned successfully",
        description: `Created "${clonedRule.rule_name}" in your collection.`,
      })
      queryClient.invalidateQueries({ queryKey: ['my-rules'] })
    },
    onError: (error: any) => {
      const errorMessage = error.message || error.detail || "Failed to clone the rule."
      toast({
        title: "Clone failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  })

  const filteredPersonalizedRecommendations = useMemo(() => {
    if (!Array.isArray(personalizedRecommendations)) {
      return []
    }
    return personalizedRecommendations.filter(rec => 
      !dismissedRecommendations.has(rec.rule.id) &&
      rec.recommendation_score >= (filters.minScore || 0)
    )
  }, [personalizedRecommendations, dismissedRecommendations, filters.minScore])

  const handleAcceptRecommendation = (recommendation: RuleRecommendation) => {
    const suggestedName = `${recommendation.rule.rule_name} (Recommended)`
    cloneRuleMutation.mutate({
      ruleId: recommendation.rule.id,
      newName: suggestedName
    })
    onRecommendationAccept?.(recommendation)
  }

  const handleDismissRecommendation = (recommendationId: string) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]))
    onRecommendationDismiss?.(recommendationId)
    toast({
      title: "Recommendation dismissed",
      description: "This recommendation won't be shown again in this session.",
    })
  }

  const handleFilterChange = (key: keyof RecommendationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-blue-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 0.8) return 'default'
    if (score >= 0.6) return 'secondary'
    if (score >= 0.4) return 'outline'
    return 'destructive'
  }

  const renderRecommendationCard = (
    recommendation: RuleRecommendation, 
    showReasoning: boolean = true,
    actionType: 'accept' | 'clone' | 'view' = 'accept'
  ) => {
    const rule = recommendation.rule
    const score = recommendation.recommendation_score || 0.5

    return (
      <Card key={rule.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {rule.rule_name}
                <Badge variant={getScoreBadgeVariant(score)} className="text-xs">
                  {Math.round(score * 100)}% match
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {rule.description || 'No description available'}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismissRecommendation(rule.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Rule Details */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Code2 className="h-3 w-3 mr-1" />
              {rule.tool}
            </Badge>
            {rule.language && (
              <Badge variant="outline" className="text-xs">
                {rule.language}
              </Badge>
            )}
            <Badge variant="outline" className={`text-xs ${
              rule.severity === 'high' ? 'border-red-500 text-red-600' :
              rule.severity === 'medium' ? 'border-yellow-500 text-yellow-600' :
              'border-green-500 text-green-600'
            }`}>
              {rule.severity}
            </Badge>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className={`text-lg font-bold ${getScoreColor(rule.effectiveness_score || 0)}`}>
                {Math.round((rule.effectiveness_score || 0) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Effectiveness</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {rule.usage_count || 0}
              </div>
              <div className="text-xs text-muted-foreground">Uses</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {rule.upvotes || 0}
              </div>
              <div className="text-xs text-muted-foreground">Votes</div>
            </div>
          </div>

          {/* Reasoning */}
          {showReasoning && recommendation.reason && (
            <>
              <Separator />
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Why this is recommended:</h4>
                    <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Recommendation Score Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Recommendation Strength</span>
              <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                {Math.round(score * 100)}%
              </span>
            </div>
            <Progress value={score * 100} className="h-2" />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="h-3 w-3" />
              <span>AI Recommended</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Open rule details - would be implemented based on your routing
                }}
                className="gap-1"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
              
              {actionType === 'accept' && (
                <Button
                  size="sm"
                  onClick={() => handleAcceptRecommendation(recommendation)}
                  disabled={cloneRuleMutation.isPending}
                  className="gap-1 bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  {cloneRuleMutation.isPending ? 'Adding...' : 'Accept'}
                </Button>
              )}
              
              {actionType === 'clone' && (
                <Button
                  size="sm"
                  onClick={() => handleAcceptRecommendation(recommendation)}
                  disabled={cloneRuleMutation.isPending}
                  className="gap-1"
                >
                  <Star className="h-4 w-4" />
                  Clone
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderPersonalizedTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Recommendation Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Based On</label>
              <Select
                value={filters.basedOn}
                onValueChange={(value: any) => handleFilterChange('basedOn', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_activity">Your Activity</SelectItem>
                  <SelectItem value="repository">Repository</SelectItem>
                  <SelectItem value="scan_results">Scan Results</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-medium mb-1 block">Min Score</label>
              <Select
                value={filters.minScore?.toString() || '0'}
                onValueChange={(value) => handleFilterChange('minScore', parseFloat(value))}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All (0%)</SelectItem>
                  <SelectItem value="0.3">Low (30%)</SelectItem>
                  <SelectItem value="0.5">Medium (50%)</SelectItem>
                  <SelectItem value="0.7">High (70%)</SelectItem>
                  <SelectItem value="0.9">Excellent (90%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Language</label>
              <Select
                value={filters.language || 'all'}
                onValueChange={(value) => handleFilterChange('language', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchPersonalized()}
                className="h-8 gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {personalizedLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPersonalizedRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPersonalizedRecommendations.map(rec => 
            renderRecommendationCard(rec, true, 'accept')
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              {filters.minScore && filters.minScore > 0.5 ? 
                'Try lowering the minimum score filter to see more recommendations.' :
                'Create more rules or perform scans to get personalized recommendations.'
              }
            </p>
            <Button onClick={() => refetchPersonalized()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderTrendingTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Rules This Week
          </CardTitle>
          <CardDescription>
            Popular rules that are gaining traction in the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trendingRules && trendingRules.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trendingRules.map(rule => renderRecommendationCard(
                { rule, recommendation_score: 0.8, reason: 'Trending in the community' },
                false,
                'clone'
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No trending rules available at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderEffectiveTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Most Effective Rules
          </CardTitle>
          <CardDescription>
            Rules with the highest effectiveness scores and proven results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topPerformingRules && topPerformingRules.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topPerformingRules.map((item, index) => renderRecommendationCard(
                { 
                  rule: item.rule, 
                  recommendation_score: item.effectiveness_score, 
                  reason: `Ranked #${index + 1} for effectiveness with ${item.usage_count} successful uses`
                },
                true,
                'clone'
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No performance data available at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI-Powered Recommendations
          </h2>
          <p className="text-muted-foreground">
            Discover rules tailored to your needs and security goals
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3" />
          Powered by AI
        </Badge>
      </div>

      {/* Recommendation Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid grid-cols-3 w-full max-w-[600px]">
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="effective" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Most Effective
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personalized">
          {renderPersonalizedTab()}
        </TabsContent>

        <TabsContent value="trending">
          {renderTrendingTab()}
        </TabsContent>

        <TabsContent value="effective">
          {renderEffectiveTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}