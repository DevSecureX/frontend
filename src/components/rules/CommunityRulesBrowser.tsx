import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  TrendingUp, 
  Star, 
  Calendar,
  Award,
  Eye,
  Filter,
  Search,
  Grid3X3,
  List,
  Clock,
  Activity,
  Heart
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { rulesAPI } from '@/lib/api/rules'
import type { 
  CustomRule, 
  RuleFilters, 
  SupportedToolInfo,
  CommunityMetrics
} from '@/types/rules'

import { RuleCard } from './RuleCard'
import { RuleFilters as RuleFiltersComponent } from './RuleFilters'
import { RuleSearchBar } from './RuleSearchBar'
import { RulesSkeleton } from './RulesSkeleton'
import { CommunityMetricsVisualization } from './CommunityMetricsVisualization'

interface CommunityRulesBrowserProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: Partial<RuleFilters>
  onFiltersChange: (filters: Partial<RuleFilters>) => void
  supportedTools: SupportedToolInfo[]
  onVote: (ruleId: string, voteType: 'up' | 'down') => Promise<void>
  communityMetrics?: CommunityMetrics | null
}

export function CommunityRulesBrowser({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  supportedTools,
  onVote,
  communityMetrics
}: CommunityRulesBrowserProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeSection, setActiveSection] = useState<'browse' | 'trending' | 'popular' | 'newest' | 'metrics'>('browse')

  // Fetch community rules
  const { 
    data: communityRulesData, 
    isLoading: communityRulesLoading,
    error: communityRulesError
  } = useQuery({
    queryKey: ['community-rules', currentPage, filters, searchQuery, activeSection],
    queryFn: () => {
      if (activeSection === 'browse') {
        return rulesAPI.getCommunityRules(currentPage, 20, { 
          ...filters, 
          search_query: searchQuery || undefined 
        })
      } else if (activeSection === 'trending') {
        return rulesAPI.getTrendingRules(20).then(data => ({ rules: data, total: data.length, skip: 0, limit: 20 }))
      } else if (activeSection === 'popular') {
        return rulesAPI.getPopularRules(20).then(data => ({ rules: data, total: data.length, skip: 0, limit: 20 }))
      } else {
        return rulesAPI.getNewestRules(20).then(data => ({ rules: data, total: data.length, skip: 0, limit: 20 }))
      }
    }
  })

  const rules = communityRulesData?.rules || []

  const handleSectionChange = (section: 'browse' | 'trending' | 'popular' | 'newest' | 'metrics') => {
    setActiveSection(section)
    setCurrentPage(1)
  }

  const getEmptyStateMessage = () => {
    switch (activeSection) {
      case 'trending':
        return {
          title: "No Trending Rules",
          description: "No rules are trending this week. Check back later or explore other sections."
        }
      case 'popular':
        return {
          title: "No Popular Rules",
          description: "No highly voted rules found. Be the first to create and share popular rules!"
        }
      case 'newest':
        return {
          title: "No New Rules",
          description: "No new rules have been added recently. Why not create one yourself?"
        }
      default:
        return {
          title: "No Community Rules Found",
          description: searchQuery || Object.keys(filters).length > 0 
            ? "No rules match your current search and filters. Try adjusting your criteria."
            : "The community hasn't shared any rules yet. Be the first to contribute!"
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Community Overview */}
      {communityMetrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-semibold text-lg">{communityMetrics.total_community_rules}</div>
                  <div className="text-xs text-muted-foreground">Total Rules</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <div>
                  <div className="font-semibold text-lg">{communityMetrics.total_contributors || communityMetrics.top_contributors?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Contributors</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-semibold text-lg">{communityMetrics.trending_rules?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Trending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <div>
                  <div className="font-semibold text-lg">
                    {communityMetrics.total_votes_cast || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Votes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeSection} onValueChange={(value: any) => handleSectionChange(value)}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <TabsList className="w-full lg:w-auto grid grid-cols-5">
            <TabsTrigger value="browse" className="gap-2 text-xs">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Browse All</span>
              <span className="sm:hidden">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2 text-xs">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trending</span>
              <span className="sm:hidden">Trend</span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="gap-2 text-xs">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Popular</span>
              <span className="sm:hidden">Pop</span>
            </TabsTrigger>
            <TabsTrigger value="newest" className="gap-2 text-xs">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Newest</span>
              <span className="sm:hidden">New</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2 text-xs">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Grid
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Browse All Tab */}
        <TabsContent value="browse" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <RuleSearchBar
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search community rules by name, author, tool, or pattern..."
              />
            </div>
            <RuleFiltersComponent
              filters={filters}
              onChange={onFiltersChange}
              supportedTools={supportedTools}
              showCommunityFilters={true}
            />
          </div>

          {/* Results */}
          {communityRulesLoading ? (
            <RulesSkeleton />
          ) : rules.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{getEmptyStateMessage().title}</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {getEmptyStateMessage().description}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6'
                : 'space-y-4'
            }`}>
              {rules.map((rule: CustomRule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onVote={onVote}
                  showOwnerActions={false}
                  showVoting={true}
                  compact={viewMode === 'list'}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending This Week
              </CardTitle>
              <CardDescription>
                Rules with the most votes and activity in the past 7 days
              </CardDescription>
            </CardHeader>
          </Card>

          {communityRulesLoading ? (
            <RulesSkeleton />
          ) : rules.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{getEmptyStateMessage().title}</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {getEmptyStateMessage().description}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {rules.map((rule: CustomRule, index: number) => (
                <div key={rule.id} className="relative">
                  {index < 3 && (
                    <Badge 
                      className={`absolute -top-2 -right-2 z-10 ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        'bg-orange-600'
                      } text-white`}
                    >
                      #{index + 1}
                    </Badge>
                  )}
                  <RuleCard
                    rule={rule}
                    onVote={onVote}
                    showOwnerActions={false}
                    showVoting={true}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Popular Tab */}
        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Most Popular Rules
              </CardTitle>
              <CardDescription>
                Rules with the highest community ratings and usage
              </CardDescription>
            </CardHeader>
          </Card>

          {communityRulesLoading ? (
            <RulesSkeleton />
          ) : rules.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{getEmptyStateMessage().title}</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {getEmptyStateMessage().description}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {rules.map((rule: CustomRule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onVote={onVote}
                  showOwnerActions={false}
                  showVoting={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Newest Tab */}
        <TabsContent value="newest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recently Added Rules
              </CardTitle>
              <CardDescription>
                The latest rules shared by the community
              </CardDescription>
            </CardHeader>
          </Card>

          {communityRulesLoading ? (
            <RulesSkeleton />
          ) : rules.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{getEmptyStateMessage().title}</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {getEmptyStateMessage().description}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {rules.map((rule: CustomRule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onVote={onVote}
                  showOwnerActions={false}
                  showVoting={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Community Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <CommunityMetricsVisualization
            communityMetrics={communityMetrics || undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}