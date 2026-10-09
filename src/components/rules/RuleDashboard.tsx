import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Shield,
  Users,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  PieChart
} from 'lucide-react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

import { rulesAPI } from '@/lib/api/rules'
import type { CustomRule } from '@/types/rules'

interface RuleDashboardProps {
  selectedRuleId?: string
  onRuleSelect?: (ruleId: string) => void
}

export function RuleDashboard({ selectedRuleId, onRuleSelect }: RuleDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Fetch dashboard analytics
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading,
    refetch: refetchDashboard 
  } = useQuery({
    queryKey: ['rules-dashboard-analytics', timeRange],
    queryFn: () => rulesAPI.getDashboardAnalytics(timeRange),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  // Fetch top performing rules
  const { data: topRules } = useQuery({
    queryKey: ['top-performing-rules', timeRange],
    queryFn: () => rulesAPI.getTopPerformingRules(10, 'effectiveness'),
    staleTime: 5 * 60 * 1000
  })


  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)  }M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)  }K`
    return num.toString()
  }

  const COLORS = {
    primary: '#8B5CF6',
    secondary: '#3B82F6', 
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
    gray: '#6B7280'
  }

  const CHART_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316']

  // Transform tool usage data for charts
  const toolUsageChartData = useMemo(() => {
    return dashboardData?.tool_usage?.slice(0, 8).map((tool, index) => ({
      tool: tool.tool,
      usage: tool.usage_count,
      effectiveness: Math.round(tool.effectiveness_score * 100),
      color: CHART_COLORS[index % CHART_COLORS.length]
    })) || []
  }, [dashboardData])


  // Custom tooltip for charts
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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData?.overview.total_rules || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.overview.active_rules || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Rules</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData?.overview.community_rules || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.community.active_contributors || 0} contributors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((dashboardData?.performance.success_rate || 0) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(dashboardData?.performance.total_tests_run || 0)} tests run
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(dashboardData?.performance.avg_execution_time || 0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tool Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Usage Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tool Usage Distribution
            </CardTitle>
            <CardDescription>
              Usage count by security tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={toolUsageChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="tool" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={11}
                  />
                  <YAxis fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="usage" fill={COLORS.primary} radius={[2, 2, 0, 0]}>
                    {toolUsageChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tool Effectiveness Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tool Effectiveness
            </CardTitle>
            <CardDescription>
              Effectiveness distribution by tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={toolUsageChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    dataKey="effectiveness"
                    label={({ tool, effectiveness }) => `${tool}: ${effectiveness}%`}
                    labelLine={false}
                  >
                    {toolUsageChartData.map((entry, index) => (
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

      {/* Tool Usage Trends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tool Usage Trends
          </CardTitle>
          <CardDescription>
            Detailed trends and effectiveness metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.tool_usage?.slice(0, 8).map((tool, index) => (
              <div key={tool.tool} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{tool.tool}</div>
                    <div className="text-sm text-muted-foreground">
                      Effectiveness: {Math.round(tool.effectiveness_score * 100)}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                    <Progress 
                      value={tool.effectiveness_score * 100} 
                      className="w-20 h-2"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(tool.trend)}
                    <div className="text-right">
                      <div className="font-bold">{formatNumber(tool.usage_count)}</div>
                      <div className="text-xs text-muted-foreground">uses</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performing Rules
          </CardTitle>
          <CardDescription>
            Rules with the highest effectiveness scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRules?.slice(0, 5).map((item, index) => (
              <div 
                key={item.rule.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onRuleSelect?.(item.rule.id)}
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={index === 0 ? 'default' : 'secondary'}
                    className="min-w-[24px] justify-center"
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium">{item.rule.rule_name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.rule.tool}
                      </Badge>
                      {item.rule.language && (
                        <Badge variant="outline" className="text-xs">
                          {item.rule.language}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {Math.round(item.effectiveness_score * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatNumber(item.usage_count)} uses
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )


  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Rules Analytics Overview
          </h2>
          <p className="text-muted-foreground">
            Comprehensive insights into rule performance and usage
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchDashboard()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Content */}
      {renderOverviewTab()}
    </div>
  )
}