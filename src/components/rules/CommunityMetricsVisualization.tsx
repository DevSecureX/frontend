import React, { useState, useMemo } from 'react'
import { useTimezone } from '@/contexts/TimezoneContext'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  TrendingUp,
  Star,
  Heart,
  MessageSquare,
  Activity,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Globe,
  Crown,
  Trophy,
  Target,
  Zap
} from 'lucide-react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area,
  ComposedChart,
  Legend
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

import { rulesAPI } from '@/lib/api/rules'
import type { CommunityMetrics, CustomRule } from '@/types/rules'

interface CommunityMetricsVisualizationProps {
  communityMetrics?: CommunityMetrics
  className?: string
}

export function CommunityMetricsVisualization({ 
  communityMetrics, 
  className = "" 
}: CommunityMetricsVisualizationProps) {
  const { formatDate } = useTimezone()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'activity' | 'engagement' | 'growth'>('activity')

  // Fetch additional community data
  const { data: trendingRules } = useQuery({
    queryKey: ['trending-rules', 10],
    queryFn: () => rulesAPI.getTrendingRules(10),
    staleTime: 10 * 60 * 1000
  })

  const { data: popularRules } = useQuery({
    queryKey: ['popular-rules', 10],
    queryFn: () => rulesAPI.getPopularRules(10),
    staleTime: 10 * 60 * 1000
  })

  const { data: topPerformingRules } = useQuery({
    queryKey: ['top-performing-rules', 10],
    queryFn: () => rulesAPI.getTopPerformingRules(10, 'effectiveness'),
    staleTime: 10 * 60 * 1000
  })

  // Chart colors
  const COLORS = {
    primary: '#8B5CF6',
    secondary: '#3B82F6', 
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  }

  const CHART_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316']

  // Transform data for visualizations
  const activityData = useMemo(() => {
    if (!communityMetrics?.activity_trends) return []
    
    return communityMetrics.activity_trends.slice(-30).map((trend, index) => ({
      date: formatDate(trend.date, { includeTime: false, includeTimezone: false, dateFormat: 'MMM dd' }),
      rules_created: trend.rules_created || 0,
      votes_cast: trend.votes_cast || 0,
      comments_made: trend.comments_made || 0,
      users_active: trend.active_users || 0
    }))
  }, [communityMetrics])

  const contributorDistributionData = useMemo(() => {
    if (!communityMetrics?.top_contributors) return []
    
    return communityMetrics.top_contributors.slice(0, 8).map((contributor, index) => ({
      name: contributor.username || `User ${index + 1}`,
      rules: contributor.rules_created || 0,
      votes: contributor.votes_received || 0,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }))
  }, [communityMetrics])

  const categoryDistributionData = useMemo(() => {
    if (!communityMetrics?.category_distribution) return []
    
    return Object.entries(communityMetrics.category_distribution).map(([category, count], index) => ({
      name: category,
      value: count,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }))
  }, [communityMetrics])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderMetricCard = (title: string, value: number | string, icon: React.ReactNode, change?: number, changeLabel?: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% {changeLabel || 'from last period'}
          </p>
        )}
      </CardContent>
    </Card>
  )

  const renderTopContributors = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Top Contributors
        </CardTitle>
        <CardDescription>
          Most active community members this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communityMetrics?.top_contributors?.slice(0, 5).map((contributor, index) => (
            <div key={contributor.username} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30">
                {index < 3 ? (
                  <Trophy className={`h-4 w-4 ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-400' : 'text-amber-600'
                  }`} />
                ) : (
                  <span className="text-xs font-bold text-purple-600">#{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="font-medium">{contributor.username}</div>
                <div className="text-sm text-muted-foreground">
                  {contributor.rules_created} rules • {contributor.votes_received} votes
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-bold text-purple-600">
                  {Math.round((contributor.rules_created * 2 + contributor.votes_received) / 3)}
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderTrendingRules = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trending Rules
        </CardTitle>
        <CardDescription>
          Most popular rules gaining traction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trendingRules?.slice(0, 5).map((rule, index) => (
            <div key={rule.id} className="flex items-center gap-3 p-2 border rounded hover:bg-muted/30 transition-colors">
              <Badge variant={index < 3 ? "default" : "outline"} className="min-w-[24px] justify-center">
                {index + 1}
              </Badge>
              
              <div className="flex-1">
                <div className="font-medium text-sm">{rule.rule_name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {rule.tool}
                  </Badge>
                  {rule.language && (
                    <Badge variant="outline" className="text-xs">
                      {rule.language}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right text-xs">
                <div className="flex items-center gap-1 text-green-600">
                  <Heart className="h-3 w-3" />
                  <span>{rule.upvotes}</span>
                </div>
                <div className="text-muted-foreground">{rule.usage_count} uses</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Community Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          "Total Rules",
          communityMetrics?.total_community_rules || 0,
          <Globe className="h-4 w-4 text-muted-foreground" />,
          communityMetrics?.growth_metrics?.monthly_growth,
          "this month"
        )}
        
        {renderMetricCard(
          "Active Contributors", 
          communityMetrics?.growth_metrics?.active_contributors || communityMetrics?.total_contributors || 0,
          <Users className="h-4 w-4 text-muted-foreground" />,
          communityMetrics?.growth_metrics?.weekly_growth,
          "this month"
        )}
        
        {renderMetricCard(
          "Total Votes",
          communityMetrics?.total_votes_cast || 0,
          <Heart className="h-4 w-4 text-muted-foreground" />,
          undefined, // voting activity increase not available in current interface
          "this week"
        )}
        
        {renderMetricCard(
          "Avg Rating",
          communityMetrics?.average_rule_rating ? 
            `${communityMetrics.average_rule_rating.toFixed(1)}/5` : "N/A",
          <Star className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Activity Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Community Activity Trends
              </CardTitle>
              <CardDescription>
                Daily community engagement over the last 30 days
              </CardDescription>
            </div>
            <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis yAxisId="left" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {selectedMetric === 'activity' && (
                  <>
                    <Bar yAxisId="left" dataKey="rules_created" fill={COLORS.primary} name="Rules Created" />
                    <Line yAxisId="right" type="monotone" dataKey="users_active" stroke={COLORS.success} strokeWidth={2} name="Active Users" />
                  </>
                )}
                
                {selectedMetric === 'engagement' && (
                  <>
                    <Bar yAxisId="left" dataKey="votes_cast" fill={COLORS.secondary} name="Votes Cast" />
                    <Line yAxisId="right" type="monotone" dataKey="comments_made" stroke={COLORS.warning} strokeWidth={2} name="Comments" />
                  </>
                )}
                
                {selectedMetric === 'growth' && (
                  <>
                    <Area yAxisId="left" type="monotone" dataKey="rules_created" stackId="1" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} name="New Rules" />
                    <Area yAxisId="left" type="monotone" dataKey="users_active" stackId="1" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} name="Active Users" />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contributor Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Contributors Distribution
            </CardTitle>
            <CardDescription>
              Rules created by top community members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={contributorDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rules" fill={COLORS.primary} radius={[2, 2, 0, 0]}>
                    {contributorDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Rule Categories
            </CardTitle>
            <CardDescription>
              Distribution of rules by security category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {categoryDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTopContributors()}
        {renderTrendingRules()}
      </div>

      {/* Performance Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Rule Performance Leaderboard
          </CardTitle>
          <CardDescription>
            Top performing rules by effectiveness and community adoption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformingRules?.slice(0, 8).map((item, index) => (
              <div key={item.rule.id} className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <span className="text-xs font-bold">#{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="font-medium">{item.rule.rule_name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {item.rule.tool}
                    </Badge>
                    {item.rule.language && (
                      <Badge variant="outline" className="text-xs">
                        {item.rule.language}
                      </Badge>
                    )}
                    <span>by {item.rule.author_username || 'Unknown'}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-green-600">
                      {Math.round(item.effectiveness_score * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Effectiveness</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">
                      {item.usage_count}
                    </div>
                    <div className="text-xs text-muted-foreground">Uses</div>
                  </div>
                  <div>
                    <div className="font-bold text-purple-600">
                      {item.rule.upvotes}
                    </div>
                    <div className="text-xs text-muted-foreground">Votes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Community Health Score
          </CardTitle>
          <CardDescription>
            Overall health and engagement metrics for the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Activity Level</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">
                High daily activity with consistent rule creation
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement Quality</span>
                <span className="text-sm text-muted-foreground">72%</span>
              </div>
              <Progress value={72} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Good voting participation and constructive feedback
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Growth Trend</span>
                <span className="text-sm text-muted-foreground">93%</span>
              </div>
              <Progress value={93} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Strong growth in both users and content quality
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}