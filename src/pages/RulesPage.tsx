import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTimezone } from '@/contexts/TimezoneContext'
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Code2,
  Users,
  Sparkles,
  TrendingUp,
  BookOpen,
  Settings,
  RefreshCw,
  BarChart3,
  Heart,
  Eye,
  Play,
  AlertCircle,
  Database,
  MessageSquare,
  Tags,
  History,
  Activity
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

import { rulesAPI } from '@/lib/api/rules'
import type { CustomRule, RuleFilters } from '@/types/rules'

// Existing components
import { CreateRuleDialog } from '@/components/rules/CreateRuleDialog'
import { RuleCard } from '@/components/rules/RuleCard'
import { RuleFilters as RuleFiltersComponent } from '@/components/rules/RuleFilters'
import { RuleSearchBar } from '@/components/rules/RuleSearchBar'
import { CommunityRulesBrowser } from '@/components/rules/CommunityRulesBrowser'
import { RuleTestingInterface } from '@/components/rules/RuleTestingInterface'
import { RuleStatsCard } from '@/components/rules/RuleStatsCard'
import { RulesSkeleton } from '@/components/rules/RulesSkeleton'

// New enhanced components
import { RuleDashboard } from '@/components/rules/RuleDashboard'
import { RuleCollaborationPanel } from '@/components/rules/RuleCollaborationPanel'
import { PerformanceIndicator } from '@/components/rules/PerformanceIndicator'
import { RateLimitIndicator } from '@/components/rules/RateLimitIndicator'
import { RuleManagementInterface } from '@/components/rules/RuleManagementInterface'
import { EnhancedTemplatesInterface } from '@/components/rules/EnhancedTemplatesInterface'
import { EnhancedRecommendationsInterface } from '@/components/rules/EnhancedRecommendationsInterface'

export function RulesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { formatDateOnly, formatTimeOnly } = useTimezone()
  
  // State management
  const [activeTab, setActiveTab] = useState<'my-rules' | 'community' | 'testing' | 'analytics' | 'templates' | 'recommendations'>('my-rules')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Partial<RuleFilters>>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRules, setSelectedRules] = useState<string[]>([])
  const [selectedRuleForDetails, setSelectedRuleForDetails] = useState<CustomRule | null>(null)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string | undefined>()

  // Fetch user's rules
  const { 
    data: myRulesData, 
    isLoading: myRulesLoading, 
    error: myRulesError 
  } = useQuery({
    queryKey: ['my-rules', currentPage, filters, searchQuery],
    queryFn: () => rulesAPI.getMyRules(currentPage, 20, { 
      ...filters, 
      search_query: searchQuery || undefined 
    }),
    enabled: activeTab === 'my-rules'
  })

  // Fetch community rules
  const { 
    data: communityRulesData, 
    isLoading: communityRulesLoading 
  } = useQuery({
    queryKey: ['community-rules', currentPage, filters, searchQuery],
    queryFn: () => rulesAPI.getCommunityRules(currentPage, 20, { 
      ...filters, 
      search_query: searchQuery || undefined 
    }),
    enabled: activeTab === 'community'
  })

  // Fetch rule statistics
  const { data: ruleStats } = useQuery({
    queryKey: ['rule-stats'],
    queryFn: () => rulesAPI.getRuleStats(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Fetch community metrics
  const { data: communityMetrics } = useQuery({
    queryKey: ['community-metrics'],
    queryFn: () => rulesAPI.getCommunityMetrics(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Fetch supported tools
  const { data: supportedTools } = useQuery({
    queryKey: ['supported-tools'],
    queryFn: () => rulesAPI.getSupportedTools(),
    staleTime: 60 * 60 * 1000 // 1 hour
  })

  // Fetch dashboard analytics
  const { data: dashboardAnalytics } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => rulesAPI.getDashboardAnalytics('30d'),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Fetch rule recommendations
  const { data: recommendations } = useQuery({
    queryKey: ['rule-recommendations'],
    queryFn: () => rulesAPI.getRecommendations('user_activity', undefined, undefined, undefined, undefined, 5),
    enabled: activeTab === 'analytics',
    staleTime: 10 * 60 * 1000 // 10 minutes
  })

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) => rulesAPI.deleteRule(ruleId),
    onSuccess: () => {
      toast({
        title: "Rule deleted",
        description: "The rule has been successfully deleted.",
      })
      queryClient.invalidateQueries({ queryKey: ['my-rules'] })
      queryClient.invalidateQueries({ queryKey: ['rule-stats'] })
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting rule",
        description: error.message || "Failed to delete the rule.",
        variant: "destructive",
      })
    }
  })

  // Vote mutation with optimistic updates
  const voteMutation = useMutation({
    mutationFn: ({ ruleId, voteType }: { ruleId: string; voteType: 'up' | 'down' }) =>
      rulesAPI.voteOnRule(ruleId, { vote_type: voteType }),
    onMutate: async ({ ruleId, voteType }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['community-rules'] })
      
      // Snapshot previous value
      const previousCommunityRules = queryClient.getQueryData(['community-rules', currentPage, filters, searchQuery])
      
      // Optimistically update to new value
      if (previousCommunityRules) {
        queryClient.setQueryData(['community-rules', currentPage, filters, searchQuery], (old: any) => {
          if (!old?.rules) return old
          
          return {
            ...old,
            rules: old.rules.map((rule: any) => {
              if (rule.id === ruleId) {
                const currentVote = rule.vote_type
                let newUpvotes = rule.upvotes
                let newDownvotes = rule.downvotes
                let newVoteType: "up" | "down" | undefined = voteType
                
                // Handle vote changes
                if (currentVote === voteType) {
                  // Removing vote
                  if (voteType === 'up') newUpvotes--
                  else newDownvotes--
                  newVoteType = undefined
                } else if (currentVote === null) {
                  // Adding new vote
                  if (voteType === 'up') newUpvotes++
                  else newDownvotes++
                } else {
                  // Changing vote
                  if (currentVote === 'up') newUpvotes--
                  else newDownvotes--
                  
                  if (voteType === 'up') newUpvotes++
                  else newDownvotes++
                }
                
                return {
                  ...rule,
                  upvotes: newUpvotes,
                  downvotes: newDownvotes,
                  net_votes: newUpvotes - newDownvotes,
                  vote_type: newVoteType,
                  is_voted: newVoteType !== null
                }
              }
              return rule
            })
          }
        })
      }
      
      return { previousCommunityRules }
    },
    onError: (err, newTodo, context) => {
      // Rollback optimistic update
      if (context?.previousCommunityRules) {
        queryClient.setQueryData(['community-rules', currentPage, filters, searchQuery], context.previousCommunityRules)
      }
      
      toast({
        title: "Error voting",
        description: err.message || "Failed to vote on the rule. Your vote has been reverted.",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      // Refresh data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['community-rules'] })
      queryClient.invalidateQueries({ queryKey: ['community-metrics'] })
    }
  })

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: (operation: any) => rulesAPI.bulkOperations(operation),
    onSuccess: (result) => {
      toast({
        title: "Bulk operation completed",
        description: `Successfully processed ${result.processed} out of ${result.total_requested} rules.`,
      })
      setSelectedRules([])
      queryClient.invalidateQueries({ queryKey: ['my-rules'] })
      queryClient.invalidateQueries({ queryKey: ['rule-stats'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] })
    },
    onError: (error: any) => {
      toast({
        title: "Bulk operation failed",
        description: error.message || "Failed to complete bulk operation.",
        variant: "destructive",
      })
    }
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: Partial<RuleFilters>) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleCreateRule = () => {
    queryClient.invalidateQueries({ queryKey: ['my-rules'] })
    queryClient.invalidateQueries({ queryKey: ['rule-stats'] })
    setShowCreateDialog(false)
    toast({
      title: "Rule created",
      description: "Your custom rule has been created successfully!",
    })
  }

  const handleDeleteRule = (ruleId: string) => {
    deleteRuleMutation.mutate(ruleId)
  }

  const handleVote = async (ruleId: string, voteType: 'up' | 'down') => {
    return new Promise<void>((resolve, reject) => {
      voteMutation.mutate({ ruleId, voteType }, {
        onSuccess: () => {
          resolve()
        },
        onError: (error) => {
          reject(error)
        }
      })
    })
  }

  const handleSaveAsTemplate = async (rule: CustomRule) => {
    try {
      const result = await rulesAPI.saveAsTemplate(rule.id)
      toast({
        title: "Template saved",
        description: `"${rule.rule_name}" has been saved as a template and is now available in the Templates tab.`,
      })
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save rule as template.",
        variant: "destructive",
      })
    }
  }

  // Bulk operation handlers
  const handleBulkDelete = () => {
    if (selectedRules.length === 0) return
    
    bulkOperationMutation.mutate({
      rule_ids: selectedRules,
      operation: 'delete',
      confirm_destructive: true
    })
  }

  const handleBulkMakePublic = () => {
    if (selectedRules.length === 0) return
    
    bulkOperationMutation.mutate({
      rule_ids: selectedRules,
      operation: 'make_public'
    })
  }

  const handleBulkMakePrivate = () => {
    if (selectedRules.length === 0) return
    
    bulkOperationMutation.mutate({
      rule_ids: selectedRules,
      operation: 'make_private'
    })
  }

  const handleSelectRule = (ruleId: string, selected: boolean) => {
    if (selected) {
      setSelectedRules(prev => [...prev, ruleId])
    } else {
      setSelectedRules(prev => prev.filter(id => id !== ruleId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const currentRules = getCurrentRules()
      setSelectedRules(currentRules.map(rule => rule.id))
    } else {
      setSelectedRules([])
    }
  }

  const getCurrentRules = () => {
    if (activeTab === 'my-rules') return myRulesData?.rules || []
    if (activeTab === 'community') return communityRulesData?.rules || []
    return []
  }

  const getCurrentLoading = () => {
    if (activeTab === 'my-rules') return myRulesLoading
    if (activeTab === 'community') return communityRulesLoading
    return false
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Custom Rules</h1>
              <p className="text-sm text-muted-foreground">
                Create, test, and share custom security detection rules
              </p>
            </div>
          </div>
          {/* Performance and Rate Limit Indicators */}
          <div className="flex items-center gap-4 mt-2">
            {(myRulesData || communityRulesData) && (
              <PerformanceIndicator
                loadTime={rulesAPI.lastPerformanceMetrics?.loadTime}
                fromCache={rulesAPI.lastPerformanceMetrics?.fromCache}
                optimizationLevel="high"
                className="text-xs"
              />
            )}
            <RateLimitIndicator endpoint="custom_rules" className="text-xs" />
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['my-rules'] })
              queryClient.invalidateQueries({ queryKey: ['community-rules'] })
              queryClient.invalidateQueries({ queryKey: ['rule-stats'] })
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="default" className="gap-2 bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Rule</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </DialogTrigger>
            <CreateRuleDialog 
              supportedTools={supportedTools || []}
              onSuccess={() => {
                handleCreateRule()
                // Dialog will be closed by the component itself
              }}
              onCancel={() => {
                // Dialog will be closed by the component itself
              }}
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
            />
          </Dialog>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Rules</CardTitle>
            <Code2 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardAnalytics?.overview.total_rules || ruleStats?.my_rules || 0}</div>
            <p className="text-xs text-purple-100">
              {dashboardAnalytics?.overview.active_rules ? 
                `${dashboardAnalytics.overview.active_rules} active` : 
                'Custom rules created'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardAnalytics?.overview.community_rules || communityMetrics?.total_community_rules || 0}
            </div>
            <p className="text-xs text-blue-100">
              {dashboardAnalytics?.community.active_contributors ? 
                `${dashboardAnalytics.community.active_contributors} contributors` : 
                'Public rules available'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardAnalytics?.performance.success_rate ? 
                `${Math.round(dashboardAnalytics.performance.success_rate * 100)}%` : 
                ruleStats?.total_usage || 0
              }
            </div>
            <p className="text-xs text-green-100">
              {dashboardAnalytics?.performance.total_tests_run ? 
                `${dashboardAnalytics.performance.total_tests_run} tests run` : 
                'Times rules were used'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Sparkles className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardAnalytics?.performance.avg_execution_time ? 
                `${Math.round(dashboardAnalytics.performance.avg_execution_time)}ms` : 
                communityMetrics?.trending_rules?.length || 0
              }
            </div>
            <p className="text-xs text-yellow-100">
              {dashboardAnalytics?.performance.avg_execution_time ? 
                'Average execution time' : 
                'Trending this week'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <div className="w-full overflow-x-auto">
          <TabsList className="grid w-full min-w-0 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="my-rules" className="gap-2 text-sm">
              <Code2 className="h-4 w-4" />
              <span className="hidden md:inline">My Rules</span>
              <span className="md:hidden">Rules</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Community</span>
              <span className="md:hidden">Public</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="gap-2 text-sm">
              <Play className="h-4 w-4" />
              <span className="hidden md:inline">Testing</span>
              <span className="md:hidden">Test</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Analytics</span>
              <span className="md:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2 text-sm">
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:inline">Templates</span>
              <span className="md:hidden">Tmpl</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2 text-sm">
              <Sparkles className="h-4 w-4" />
              <span className="hidden md:inline">AI Recommendations</span>
              <span className="md:hidden">AI</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* My Rules Tab */}
        <TabsContent value="my-rules" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <RuleSearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search your rules by name, tool, or pattern..."
              />
            </div>
            <RuleFiltersComponent
              filters={filters}
              onChange={handleFiltersChange}
              supportedTools={supportedTools || []}
            />
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedRules.length > 0 && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-500">
                      {selectedRules.length} selected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(false)}
                      disabled={bulkActionLoading}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkMakePublic}
                      disabled={bulkActionLoading}
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Make Public
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkMakePrivate}
                      disabled={bulkActionLoading}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Make Private
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      className="gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {getCurrentLoading() ? (
            <RulesSkeleton />
          ) : (
            <div className="space-y-4">
              {getCurrentRules().length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                      <Code2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Custom Rules Yet</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                      Create your first custom security detection rule to get started. 
                      Share your expertise with the community!
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Rule
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                  {getCurrentRules().map((rule: CustomRule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onDelete={handleDeleteRule}
                      onVote={handleVote}
                      onSaveAsTemplate={handleSaveAsTemplate}
                      showOwnerActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Community Rules Tab */}
        <TabsContent value="community" className="space-y-4 sm:space-y-6">
          <CommunityRulesBrowser
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            supportedTools={supportedTools || []}
            onVote={handleVote}
            communityMetrics={communityMetrics}
          />
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4 sm:space-y-6">
          <RuleTestingInterface
            supportedTools={supportedTools || []}
            myRules={myRulesData?.rules || []}
          />
        </TabsContent>


        {/* Enhanced Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          <RuleDashboard
            selectedRuleId={selectedRuleForDetails?.id}
            onRuleSelect={(ruleId) => {
              const rule = getCurrentRules().find(r => r.id === ruleId)
              if (rule) {
                setSelectedRuleForDetails(rule)
              }
            }}
          />
        </TabsContent>


        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4 sm:space-y-6">
          <EnhancedTemplatesInterface
            supportedTools={supportedTools || []}
            onTemplateUse={(templateId, generatedRule) => {
              toast({
                title: "Template used",
                description: "Rule pattern has been generated from template.",
              })
              // Optionally redirect to rule creation with pre-filled data
              queryClient.invalidateQueries({ queryKey: ['my-rules'] })
            }}
          />
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4 sm:space-y-6">
          <EnhancedRecommendationsInterface
            onRecommendationAccept={(recommendation) => {
              toast({
                title: "Recommendation accepted",
                description: `"${recommendation.rule.rule_name}" has been added to your collection.`,
              })
              queryClient.invalidateQueries({ queryKey: ['my-rules'] })
              queryClient.invalidateQueries({ queryKey: ['rule-stats'] })
            }}
            onRecommendationDismiss={(recommendationId) => {
              // Handle dismissal if needed
            }}
          />
        </TabsContent>


        {/* Legacy Analytics Content - Hidden */}
        <TabsContent value="original-analytics" className="space-y-4 sm:space-y-6 hidden">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <RuleStatsCard
              title="My Rules Performance"
              stats={ruleStats}
              type="personal"
            />
            <RuleStatsCard
              title="Community Insights"
              stats={communityMetrics}
              type="community"
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tool Usage
                </CardTitle>
                <CardDescription>
                  Most popular security tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardAnalytics?.tool_usage ? (
                  <div className="space-y-3">
                    {dashboardAnalytics.tool_usage.slice(0, 5).map((tool, index) => (
                      <div key={tool.tool} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {tool.tool}
                          </Badge>
                          <span className={`text-xs ${
                            tool.trend === 'up' ? 'text-green-500' : 
                            tool.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {tool.trend === 'up' ? '↗' : tool.trend === 'down' ? '↘' : '→'}
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          {tool.usage_count}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p>Tool usage data not available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Section */}
          {recommendations && recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Recommended Rules
                </CardTitle>
                <CardDescription>
                  Rules suggested based on your activity and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.slice(0, 6).map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm truncate pr-2">
                          {rec.rule.rule_name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(rec.recommendation_score * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {rec.reason}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {rec.rule.tool}
                        </Badge>
                        {rec.rule.language && (
                          <Badge variant="outline" className="text-xs">
                            {rec.rule.language}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity - Enhanced with better visualization */}
          {ruleStats?.recent_activity && ruleStats.recent_activity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your recent rule interactions and usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ruleStats.recent_activity.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 py-3 px-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        {activity.type === 'created' ? <Plus className="h-4 w-4 text-purple-600" /> :
                         activity.type === 'updated' ? <RefreshCw className="h-4 w-4 text-blue-600" /> :
                         activity.type === 'used' ? <Play className="h-4 w-4 text-green-600" /> :
                         <Activity className="h-4 w-4 text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.rule_name}</p>
                        <p className="text-xs text-muted-foreground capitalize flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {activity.type?.replace('_', ' ') || 'activity'}
                          </Badge>
                          <span>•</span>
                          <span>{formatDateOnly(activity.timestamp)}</span>
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeOnly(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          {dashboardAnalytics?.performance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
                <CardDescription>
                  System-wide rule execution performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(dashboardAnalytics.performance.success_rate * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(dashboardAnalytics.performance.avg_execution_time)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Execution</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {dashboardAnalytics.performance.total_tests_run.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Tests Run</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}