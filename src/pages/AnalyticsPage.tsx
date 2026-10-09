import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { TimeRange, ComplianceFramework } from '@/lib/api/analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { DateRangePicker } from '@/components/ui/date-picker'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { format } from '@/lib/date-utils'
import { useTimezone } from '@/contexts/TimezoneContext'
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Download,
  Calendar,
  Users,
  GitBranch,
  Target,
  Activity,
  PieChart,
  LineChart,
  Eye,
  Settings,
  RefreshCw,
  Filter,
  FileText,
  Zap,
  Clock,
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import { 
  AnalyticsPageSkeleton,
  AnalyticsOverviewSkeleton,
  AnalyticsSecuritySkeleton,
  AnalyticsComplianceSkeleton,
  AnalyticsTrendsSkeleton,
  AnalyticsRepositoriesSkeleton,
  AnalyticsTeamSkeleton,
  AnalyticsCustomSkeleton
} from '@/components/analytics/analytics-skeleton'
import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics'
import { EnhancedDataTable } from '@/components/analytics/EnhancedDataTable'
import { AnalyticsGettingStarted } from '@/components/analytics/AnalyticsGettingStarted'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Area,
  AreaChart
} from 'recharts'

interface AnalyticsPageProps {}

const timeRangeOptions = [
  { value: TimeRange.DAY, label: 'Last 24 Hours' },
  { value: TimeRange.WEEK, label: 'Last Week' },
  { value: TimeRange.MONTH, label: 'Last Month' },
  { value: TimeRange.QUARTER, label: 'Last Quarter' },
  { value: TimeRange.YEAR, label: 'Last Year' }
]

const complianceFrameworks = [
  { value: ComplianceFramework.OWASP, label: 'OWASP Top 10' },
  { value: ComplianceFramework.NIST, label: 'NIST Framework' },
  { value: ComplianceFramework.PCI_DSS, label: 'PCI DSS' },
  { value: ComplianceFramework.HIPAA, label: 'HIPAA' },
  { value: ComplianceFramework.GDPR, label: 'GDPR' },
  { value: ComplianceFramework.ISO_27001, label: 'ISO 27001' }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const severityColors = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#65A30D',
  info: '#0891B2'
}

export function AnalyticsPage() {
  // Enhanced Filter State
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.MONTH)
  const { formatDateOnly } = useTimezone()
  const [selectedRepo, setSelectedRepo] = useState<string>('all')
  const [complianceFramework, setComplianceFramework] = useState<ComplianceFramework>(ComplianceFramework.OWASP)
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to?: Date }>()
  const [useCustomDateRange, setUseCustomDateRange] = useState(false)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [languageFilter, setLanguageFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')
  
  // Custom analytics state
  const [customAnalyticsDateRange, setCustomAnalyticsDateRange] = useState<{ from: Date; to?: Date }>()
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['total_scans', 'total_vulnerabilities'])
  const [customData, setCustomData] = useState<any>(null)
  const [customLoading, setCustomLoading] = useState(false)

  // Compute effective date parameters for API calls
  const apiTimeRange = useCustomDateRange ? undefined : timeRange
  const customApiStartDate = useCustomDateRange && customDateRange?.from ? customDateRange.from.toISOString() : undefined
  const customApiEndDate = useCustomDateRange && customDateRange?.to ? customDateRange.to.toISOString() : undefined

  // Fetch analytics data using enhanced filtering
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['analytics-overview', apiTimeRange, selectedRepo, customApiStartDate, customApiEndDate],
    queryFn: () => {
      if (useCustomDateRange && customApiStartDate && customApiEndDate) {
        return api.analytics.getCustomAnalytics(
          customApiStartDate,
          customApiEndDate, 
          ['total_scans', 'total_vulnerabilities', 'average_security_score', 'fixed_issues'],
          selectedRepo === 'all' ? undefined : selectedRepo
        ).then(data => ({
          metrics: {
            total_scans: data.data?.total_scans || 0,
            total_repositories: data.data?.repositories_scanned || 0,
            total_vulnerabilities: data.data?.total_vulnerabilities || 0,
            average_security_score: data.data?.average_security_score || 0,
            active_scans: 0,
            fixed_issues: data.data?.fixed_issues || 0,
            compliance_score: data.data?.average_security_score || 0,
            critical_issues: data.data?.critical_issues || 0,
          },
          score_trend: [],
          vulnerability_trend: [],
          top_issues: [],
          recent_activity: [],
          scans_by_severity: {},
          scans_by_type: {}
        }))
      }
      return api.analytics.getOverview(apiTimeRange || TimeRange.MONTH, selectedRepo === 'all' ? undefined : selectedRepo)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: securityData, isLoading: securityLoading, error: securityError } = useQuery({
    queryKey: ['analytics-security', apiTimeRange, selectedRepo, customApiStartDate, customApiEndDate],
    queryFn: () => api.analytics.getSecurity(apiTimeRange || TimeRange.MONTH, selectedRepo === 'all' ? undefined : selectedRepo),
    staleTime: 5 * 60 * 1000,
  })

  const { data: complianceData, isLoading: complianceLoading, error: complianceError } = useQuery({
    queryKey: ['analytics-compliance', complianceFramework, selectedRepo],
    queryFn: () => api.analytics.getCompliance(complianceFramework, selectedRepo === 'all' ? undefined : selectedRepo),
    staleTime: 15 * 60 * 1000, // 15 minutes for compliance data
  })

  const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useQuery({
    queryKey: ['analytics-trends', apiTimeRange, selectedRepo, customApiStartDate, customApiEndDate],
    queryFn: () => api.analytics.getTrends(apiTimeRange || TimeRange.MONTH, 'vulnerabilities', selectedRepo === 'all' ? undefined : selectedRepo),
    staleTime: 5 * 60 * 1000,
  })

  const { data: repositoriesData, isLoading: repositoriesLoading, error: repositoriesError } = useQuery({
    queryKey: ['analytics-repositories', selectedRepo, languageFilter],
    queryFn: () => {
      console.log('🔍 LANGUAGE FILTER CHANGED - API CALL:', {
        languageFilter,
        willSendToAPI: languageFilter === 'all' ? 'NO FILTER' : languageFilter,
        selectedRepo
      });
      return api.analytics.getRepositories(
        selectedRepo === 'all' ? undefined : selectedRepo,
        languageFilter === 'all' ? undefined : languageFilter
      );
    },
    staleTime: 0, // Force fresh API calls when filters change
  })

  const { data: realTimeData, isLoading: realTimeLoading } = useQuery({
    queryKey: ['analytics-realtime'],
    queryFn: () => api.analytics.getRealTimeMetrics(),
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    staleTime: 30 * 1000,
  })

  const { data: teamData, isLoading: teamLoading, error: teamError } = useQuery({
    queryKey: ['analytics-team'],
    queryFn: () => api.analytics.getTeamInsights(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const { data: issueData, isLoading: issueLoading, error: issueError } = useQuery({
    queryKey: ['analytics-issues', apiTimeRange, severityFilter],
    queryFn: () => api.analytics.getIssueAnalytics(
      (apiTimeRange || TimeRange.MONTH) as 'week' | 'month' | 'quarter',
      severityFilter === 'all' ? undefined : severityFilter as any
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: repositories } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => api.repositories.list(),
  })

  // Compute filtered data based on active filters
  const filteredSeverityData = useMemo(() => {
    if (!overviewData?.scans_by_severity) return []
    
    const severityData = Object.entries(overviewData.scans_by_severity).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: severityColors[name as keyof typeof severityColors] || '#6B7280'
    }))
    
    return severityFilter === 'all' 
      ? severityData 
      : severityData.filter(item => item.name.toLowerCase() === severityFilter.toLowerCase())
  }, [overviewData?.scans_by_severity, severityFilter])

  const filteredRepositoryData = useMemo(() => {
    // Since filtering is now done at the API level, just return the data as-is
    return repositoriesData?.repository_insights || []
  }, [repositoriesData?.repository_insights])

  // Get all available languages from unfiltered repository data for the dropdown
  const { data: allRepositoriesData } = useQuery({
    queryKey: ['analytics-repositories-all-languages'],
    queryFn: () => api.analytics.getRepositories(
      selectedRepo === 'all' ? undefined : selectedRepo,
      undefined // No language filter to get all languages
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes - can cache longer since this is just for dropdown options
  })

  const availableLanguages = useMemo(() => {
    if (!allRepositoriesData?.repositories_by_language) return []
    return Object.keys(allRepositoriesData.repositories_by_language)
  }, [allRepositoriesData?.repositories_by_language])

  // Legacy data mappings for backward compatibility
  const scanAnalytics = overviewData ? {
    total_scans: overviewData.metrics.total_scans,
    scans_by_severity: overviewData.scans_by_severity,
    scans_by_type: overviewData.scans_by_type,
    average_score: overviewData.metrics.average_security_score,
    score_trend: overviewData.score_trend.map((point: any) => ({ date: point.date, score: point.value })),
    top_issues: overviewData.top_issues.map((issue: any) => ({ category: issue.category, count: issue.count }))
  } : null

  const securityMetrics = securityData ? securityData.metrics : null
  const repositoryInsights = repositoriesData
  const complianceReport = complianceData
  const trendData = trendsData ? trendsData.vulnerability_trends.data_points.map((point: any) => ({
    date: point.date,
    vulnerabilities: point.value,
    security_score: point.secondary_value || 75,
    scans_completed: 1,
    issues_fixed: 0
  })) : []
  const issueAnalytics = securityData ? {
    false_positive_rate: securityData.metrics.false_positive_rate / 100,
    issues_by_category: securityData.metrics.vulnerabilities_by_category
  } : null

  // Loading states
  const scanAnalyticsLoading = overviewLoading
  const securityMetricsLoading = securityLoading
  const repositoryInsightsLoading = repositoriesLoading
  const trendLoading = trendsLoading
  const issueAnalyticsLoading = securityLoading

  // Prepare chart data (now using filtered data)
  const scoreData = overviewData ? overviewData.score_trend.map(point => ({
    date: point.date,
    score: point.value
  })) : []

  const handleExport = async (format: 'csv' | 'json' | 'pdf', reportType: 'overview' | 'security' | 'compliance' | 'trends' | 'repositories' = 'overview') => {
    try {
      const blob = await api.analytics.exportAnalytics(format, reportType, timeRange, selectedRepo === 'all' ? undefined : selectedRepo)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${reportType}-${timeRange}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      // TODO: Add proper error notification
    }
  }

  const handleCustomDateRangeChange = (range: { from: Date; to?: Date } | undefined) => {
    setCustomAnalyticsDateRange(range)
    if (range?.from) {
      setCustomStartDate(range.from.toISOString().split('T')[0])
    } else {
      setCustomStartDate('')
    }
    if (range?.to) {
      setCustomEndDate(range.to.toISOString().split('T')[0])
    } else {
      setCustomEndDate('')
    }
  }

  const handleCustomAnalytics = async () => {
    if (!customStartDate || !customEndDate || selectedMetrics.length === 0) {
      return
    }
    
    setCustomLoading(true)
    try {
      const data = await api.analytics.getCustomAnalytics(
        customStartDate,
        customEndDate,
        selectedMetrics,
        selectedRepo === 'all' ? undefined : selectedRepo
      )
      setCustomData(data)
    } catch (error) {
      console.error('Custom analytics failed:', error)
    } finally {
      setCustomLoading(false)
    }
  }

  const availableMetrics = [
    { key: 'total_scans', label: 'Total Scans' },
    { key: 'total_vulnerabilities', label: 'Total Vulnerabilities' },
    { key: 'average_security_score', label: 'Average Security Score' },
    { key: 'critical_issues', label: 'Critical Issues' },
    { key: 'repositories_scanned', label: 'Repositories Scanned' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Header - Mobile-Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight break-words">Security Analytics</h1>
              <p className="text-sm sm:text-base text-muted-foreground break-words">
                Comprehensive insights into your security posture and trends
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Refresh all data
              window.location.reload()
            }}
            className="gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('csv', 'overview')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

        {/* Enhanced Filter Bar - Mobile-Responsive */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-full overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium flex-shrink-0">Time Period:</label>
            <Select
              value={useCustomDateRange ? 'custom' : timeRange}
              onValueChange={(value) => {
                if (value === 'custom') {
                  setUseCustomDateRange(true)
                } else {
                  setUseCustomDateRange(false)
                  setTimeRange(value as TimeRange)
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {useCustomDateRange && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium flex-shrink-0">Date Range:</label>
              <DateRangePicker
                dateRange={customDateRange}
                onDateRangeChange={setCustomDateRange}
                placeholder="Select date range"
                className="w-full sm:w-auto"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium flex-shrink-0">Repository:</label>
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Repositories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Repositories</SelectItem>
                {repositories?.map(repo => (
                  <SelectItem key={repo.id} value={repo.full_name}>
                    <span className="break-words">{repo.full_name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTab === 'repositories' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium flex-shrink-0">Language:</label>
              <Select value={languageFilter} onValueChange={(value) => {
                console.log('🎯 Language filter changed from', languageFilter, 'to', value);
                setLanguageFilter(value);
              }}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {availableLanguages.map(language => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
            </div>
          </CardContent>
        </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <TabsList className="bg-gray-50 dark:bg-gray-900/50 grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="repositories" className="gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm text-xs sm:text-sm">
              <GitBranch className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Repos</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Trends</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {overviewLoading ? (
            <AnalyticsOverviewSkeleton />
          ) : (
            <>
              {/* Getting Started for New Users */}
              <AnalyticsGettingStarted 
                hasData={!!((scanAnalytics?.total_scans && scanAnalytics.total_scans > 0) || (securityMetrics?.total_vulnerabilities && securityMetrics.total_vulnerabilities > 0))}
                onStartScan={() => window.location.href = '/scans'}
                onConnectRepo={() => window.location.href = '/repositories'}
              />
              {/* Enhanced Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Scans</CardTitle>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors duration-200">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-200 tracking-tight">{scanAnalytics?.total_scans || 0}</div>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1 font-medium">
                  {timeRange === TimeRange.DAY ? 'Today' : `This ${timeRange}`}
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md hover:border-green-300 dark:hover:border-green-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Security Score</CardTitle>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg transition-colors duration-200">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 dark:text-green-200 tracking-tight">{Math.round(scanAnalytics?.average_score || 0)}</div>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 font-medium">
                  {(scanAnalytics?.average_score && scanAnalytics.average_score >= 80) ? 'Excellent' : (scanAnalytics?.average_score && scanAnalytics.average_score >= 60) ? 'Good' : 'Needs improvement'}
                </p>
              </CardContent>
            </Card>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="transition-all duration-200 hover:shadow-md hover:border-red-300 dark:hover:border-red-600 cursor-help">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Vulnerabilities</CardTitle>
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors duration-200">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-900 dark:text-red-200 tracking-tight">{securityMetrics?.total_vulnerabilities || 0}</div>
                      <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1 font-medium">
                        {securityMetrics?.critical_issues || 0} critical issues
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total vulnerabilities found across all scans</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Card className="transition-all duration-200 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Fixed Issues</CardTitle>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg transition-colors duration-200">
                  <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-900 dark:text-amber-200 tracking-tight">{overviewData?.metrics?.fixed_issues || 0}</div>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1 font-medium">
                  {(overviewData?.metrics?.fixed_issues && overviewData.metrics.fixed_issues > 0) ? 'Issues resolved' : 'No issues fixed yet'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real-Time Metrics */}
          <RealTimeMetrics data={realTimeData} isLoading={realTimeLoading} />

          {/* Enhanced Charts Row */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Issues by Severity */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Issues by Severity
                </CardTitle>
                <CardDescription>
                  Distribution of security issues by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredSeverityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={filteredSeverityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {filteredSeverityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    {severityFilter !== 'all' ? `No ${severityFilter} severity data available` : 'No data available'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Score Trend */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <LineChart className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Security Score Trend
                </CardTitle>
                <CardDescription>
                  Security score changes over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scoreData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={scoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => formatDateOnly(value)}
                      />
                      <YAxis domain={[0, 100]} />
                      <RechartsTooltip
                        labelFormatter={(value) => formatDateOnly(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        dot={{ fill: '#0088FE' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No trend data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Top Issues */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                Most Common Issues
              </CardTitle>
              <CardDescription>
                Top security issues found across all scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scanAnalytics?.top_issues?.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">{index + 1}</Badge>
                      <div>
                        <span className="font-medium">{issue.category}</span>
                        <p className="text-xs text-muted-foreground">Security vulnerability</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-medium">{issue.count}</span>
                        <p className="text-xs text-muted-foreground">occurrences</p>
                      </div>
                      <Progress value={(issue.count / Math.max(scanAnalytics?.top_issues?.[0]?.count ?? 1, 1)) * 100} className="w-20" />
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Common Issues</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Great! No recurring security issues detected in your scans.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 sm:space-y-6">
          {securityLoading ? (
            <AnalyticsSecuritySkeleton />
          ) : (
            <div className="grid gap-4 sm:gap-6">
            {/* Security Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-security-critical-500">
                    {securityMetrics?.critical_issues || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Require immediate attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-brand-600">
                    {Math.round(securityMetrics?.security_score_avg || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Average across all repos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">False Positive Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round((issueAnalytics?.false_positive_rate || 0) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">User reported false positives</p>
                </CardContent>
              </Card>
            </div>

            {/* Vulnerability Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Trends</CardTitle>
                <CardDescription>
                  Track vulnerability discovery and resolution over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {securityData?.trend_data && securityData.trend_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={securityData.trend_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => formatDateOnly(value)}
                      />
                      <YAxis />
                      <RechartsTooltip
                        labelFormatter={(value) => formatDateOnly(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="vulnerabilities"
                        stackId="1"
                        stroke="#EF4444"
                        fill="#EF4444"
                        fillOpacity={0.6}
                        name="Vulnerabilities"
                      />
                      <Area
                        type="monotone"
                        dataKey="security_score"
                        stackId="2"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.6}
                        name="Security Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No vulnerability trend data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Issue Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>
                  Security issue breakdown by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {issueAnalytics?.issues_by_category ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(issueAnalytics.issues_by_category).map(([name, value]) => ({ name, value }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Bar dataKey="value" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No category data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Issue Analytics Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Advanced Issue Analytics
                </CardTitle>
                <CardDescription>
                  Detailed analysis of security issues and resolution patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Issue Metrics */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-security-critical-500">
                        {issueData?.total_issues || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Issues</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {Math.round((issueData?.resolution_time_avg || 0) * 24)}h
                      </div>
                      <p className="text-sm text-muted-foreground">Avg Resolution</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round((issueData?.false_positive_rate || 0) * 100)}%
                      </div>
                      <p className="text-sm text-muted-foreground">False Positives</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-brand-600">
                        {issueData?.most_common_issues?.length || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Issue Types</p>
                    </div>
                  </div>

                  {/* Issue Severity Distribution */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-3">Issues by Severity</h4>
                      {issueData?.issues_by_severity ? (
                        <div className="space-y-3">
                          {Object.entries(issueData.issues_by_severity).map(([severity, count]) => (
                            <div key={severity} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={severity === 'critical' ? 'destructive' : severity === 'high' ? 'destructive' : 'secondary'}
                                >
                                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{count}</span>
                                <Progress 
                                  value={(count / (issueData?.total_issues || 1)) * 100} 
                                  className="w-20" 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No severity data available
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Issues by Tool</h4>
                      {issueData?.issues_by_tool ? (
                        <div className="space-y-3">
                          {Object.entries(issueData.issues_by_tool).slice(0, 5).map(([tool, count]) => (
                            <div key={tool} className="flex items-center justify-between">
                              <span className="font-medium">{tool}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{count}</span>
                                <Progress 
                                  value={(count / Math.max(...Object.values(issueData.issues_by_tool))) * 100} 
                                  className="w-20" 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No tool data available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Most Common Issues */}
                  <div>
                    <h4 className="font-medium mb-3">Most Common Issues</h4>
                    <div className="space-y-2">
                      {issueData?.most_common_issues?.slice(0, 8).map((issue, index) => (
                        <div key={issue.rule_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <div>
                              <div className="font-medium">{issue.category}</div>
                              <div className="text-sm text-muted-foreground">{issue.rule_id}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}
                            >
                              {issue.severity}
                            </Badge>
                            <span className="text-sm font-medium">{issue.count} occurrences</span>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4 text-muted-foreground">
                          No common issues data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          {complianceLoading ? (
            <AnalyticsComplianceSkeleton />
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Select value={complianceFramework} onValueChange={(value: ComplianceFramework) => setComplianceFramework(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {complianceFrameworks.map(framework => (
                      <SelectItem key={framework.value} value={framework.value}>
                        {framework.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

          {complianceReport && (
            <div className="grid gap-4 sm:gap-6">
              {/* Compliance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {complianceFrameworks.find(f => f.value === complianceFramework)?.label} Compliance
                  </CardTitle>
                  <CardDescription>
                    Overall compliance status and score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-brand-600 mb-2">
                        {complianceReport.overall_score}%
                      </div>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {complianceReport.requirements_met}
                      </div>
                      <p className="text-sm text-muted-foreground">Requirements Met</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {complianceReport.total_requirements}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Requirements</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Progress value={complianceReport.overall_score} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Categories</CardTitle>
                  <CardDescription>
                    Detailed breakdown by compliance categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceReport.categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={
                              category.status === 'compliant' ? 'default' :
                              category.status === 'partial' ? 'secondary' : 'destructive'
                            }
                          >
                            {category.status}
                          </Badge>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {category.issues_count} issues
                          </span>
                          <div className="text-right">
                            <div className="font-bold">{category.score}%</div>
                            <Progress value={category.score} className="w-20 h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
            </>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4 sm:space-y-6">
          {trendsLoading ? (
            <AnalyticsTrendsSkeleton />
          ) : (
            <>
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Security Trends Analysis
              </CardTitle>
              <CardDescription>
                Long-term trends in security posture
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendData && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(value) => formatDateOnly(value)}
                    />
                    <YAxis yAxisId="vulnerabilities" orientation="left" />
                    <YAxis yAxisId="score" orientation="right" domain={[0, 100]} />
                    <RechartsTooltip
                      labelFormatter={(value) => formatDateOnly(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="vulnerabilities"
                      type="monotone" 
                      dataKey="vulnerabilities" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Vulnerabilities"
                    />
                    <Line 
                      yAxisId="score"
                      type="monotone" 
                      dataKey="security_score" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Security Score"
                    />
                    <Line 
                      yAxisId="vulnerabilities"
                      type="monotone" 
                      dataKey="scans_completed" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Scans Completed"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
            </>
          )}
        </TabsContent>

        {/* Repositories Tab */}
        <TabsContent value="repositories" className="space-y-4 sm:space-y-6">
          {repositoriesLoading ? (
            <AnalyticsRepositoriesSkeleton />
          ) : (
            <div className="grid gap-4 sm:gap-6">
            {/* Repository Overview - Mobile-First Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="max-w-full overflow-hidden">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-sm font-medium break-words">Total Repositories</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="text-2xl font-bold">{repositoryInsights?.total_repositories || 0}</div>
                </CardContent>
              </Card>

              <Card className="max-w-full overflow-hidden">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-sm font-medium break-words">Active Repos</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="text-2xl font-bold">{repositoryInsights?.active_repositories || 0}</div>
                </CardContent>
              </Card>

              <Card className="max-w-full overflow-hidden">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-sm font-medium break-words">Languages</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="text-2xl font-bold">
                    {Object.keys(repositoryInsights?.repositories_by_language || {}).length}
                  </div>
                </CardContent>
              </Card>

              <Card className="max-w-full overflow-hidden">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-sm font-medium break-words">Niches</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="text-2xl font-bold">
                    {Object.keys(repositoryInsights?.repositories_by_niche || {}).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Repository Details - Mobile-Responsive Layout */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Languages Distribution */}
              <Card className="max-w-full overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="break-words">
                    {languageFilter !== 'all' ? `${languageFilter} Repositories` : 'Languages Distribution'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {repositoryInsights?.repositories_by_language && Object.keys(repositoryInsights.repositories_by_language).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(repositoryInsights.repositories_by_language).map(([language, count]) => (
                        <div key={language} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="font-medium break-words">{language}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{count}</span>
                            <Progress 
                              value={(count / (repositoryInsights.total_repositories || 1)) * 100} 
                              className="w-20 flex-shrink-0" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      {languageFilter !== 'all' 
                        ? `No ${languageFilter} repositories found`
                        : 'No language data available'
                      }
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="max-w-full overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="break-words">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="space-y-4">
                    {repositoryInsights?.recent_activity?.map((activity, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium break-words">{activity.repo_name}</div>
                          <div className="text-sm text-muted-foreground break-words">
                            Last scan: {formatDateOnly(activity.created_at)}
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="font-bold">{activity.security_score || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.issues_found} issues
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-muted-foreground">
                        No recent activity
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Repository Insights Table */}
            {filteredRepositoryData && filteredRepositoryData.length > 0 ? (
              <EnhancedDataTable
                title="Repository Insights"
                description="Detailed security analysis for each repository"
                icon={<GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                data={filteredRepositoryData}
                columns={[
                  {
                    key: 'full_name',
                    label: 'Repository',
                    render: (value) => (
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded">
                          <GitBranch className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  },
                  {
                    key: 'language',
                    label: 'Language',
                    render: (value) => (
                      <Badge variant="outline" className="text-xs">
                        {value || 'Unknown'}
                      </Badge>
                    )
                  },
                  {
                    key: 'security_score',
                    label: 'Security Score',
                    render: (value) => (
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          value >= 80 ? 'text-green-600' :
                          value >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {Math.round(value)}
                        </span>
                        <Progress 
                          value={value} 
                          className={`w-16 h-2 ${
                            value >= 80 ? '[&>div]:bg-green-500' :
                            value >= 60 ? '[&>div]:bg-yellow-500' :
                            '[&>div]:bg-red-500'
                          }`}
                        />
                      </div>
                    )
                  },
                  {
                    key: 'vulnerabilities_count',
                    label: 'Issues',
                    render: (value, row) => (
                      <div className="text-center">
                        <div className="font-medium">{value}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.critical_issues} critical
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'risk_level',
                    label: 'Risk Level',
                    render: (value) => (
                      <Badge 
                        variant={
                          value === 'low' ? 'safe' :
                          value === 'medium' ? 'medium' :
                          value === 'high' ? 'high' :
                          'critical'
                        }
                        className="capitalize"
                      >
                        {value}
                      </Badge>
                    )
                  },
                  {
                    key: 'total_scans',
                    label: 'Scans',
                    render: (value) => (
                      <div className="text-center font-medium">{value}</div>
                    )
                  },
                  {
                    key: 'last_scan',
                    label: 'Last Scan',
                    render: (value) => value ? (
                      <div className="text-xs">
                        {formatDateOnly(value)}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Never</span>
                    )
                  }
                ]}
                searchPlaceholder="Search repositories..."
                defaultSortKey="security_score"
                defaultSortOrder="desc"
                pageSize={10}
                onExport={() => handleExport('csv', 'repositories')}
                emptyMessage="No repository data available"
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GitBranch className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {languageFilter !== 'all' ? `No ${languageFilter} repositories found` : 'No repositories found'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {languageFilter !== 'all' 
                        ? `Try selecting a different language filter or check if you have any ${languageFilter} repositories.`
                        : 'Get started by connecting your first repository.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4 sm:space-y-6">
          {teamLoading ? (
            <AnalyticsTeamSkeleton />
          ) : (
            <div className="grid gap-4 sm:gap-6">
            {/* Team Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamData?.total_team_members || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamData?.most_active_contributors?.length || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Repositories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.values(teamData?.repository_ownership || {}).reduce((sum, count) => sum + count, 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Collaboration Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(teamData?.collaboration_score || 0)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Team Details */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Active Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Most Active Contributors
                  </CardTitle>
                  <CardDescription>
                    Team members with highest activity levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamData?.most_active_contributors?.map((contributor, index) => (
                      <div key={contributor.user_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <div>
                            <div className="font-medium">{contributor.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {contributor.repositories_count} repos • {contributor.recent_scans} scans
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{Math.round(contributor.avg_security_score)}</div>
                          <div className="text-xs text-muted-foreground">avg score</div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-muted-foreground">
                        No contributor data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Repository Ownership */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Repository Ownership
                  </CardTitle>
                  <CardDescription>
                    Distribution by programming language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {teamData?.repository_ownership ? (
                    <div className="space-y-3">
                      {Object.entries(teamData.repository_ownership).map(([language, count]) => (
                        <div key={language} className="flex items-center justify-between">
                          <span className="font-medium">{language}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{count} repos</span>
                            <Progress 
                              value={(count / Object.values(teamData.repository_ownership).reduce((sum, c) => sum + c, 0)) * 100} 
                              className="w-20" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No ownership data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Scan Frequency Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Scan Activity by Team Member
                </CardTitle>
                <CardDescription>
                  Scanning frequency across team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamData?.scan_frequency ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(teamData.scan_frequency).map(([username, scans]) => ({ username, scans }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="username" />
                      <YAxis />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Bar dataKey="scans" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No scan frequency data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Summary</CardTitle>
                <CardDescription>
                  Overall team collaboration and productivity metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Collaboration Score</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={teamData?.collaboration_score || 0} className="flex-1" />
                      <span className="text-sm font-medium">{Math.round(teamData?.collaboration_score || 0)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on scan frequency and repository activity
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Team Health</h4>
                    <Badge 
                      variant={
                        (teamData?.collaboration_score || 0) > 80 ? 'default' :
                        (teamData?.collaboration_score || 0) > 60 ? 'secondary' : 'destructive'
                      }
                    >
                      {(teamData?.collaboration_score || 0) > 80 ? 'Excellent' :
                       (teamData?.collaboration_score || 0) > 60 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Overall team performance assessment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}
        </TabsContent>

        {/* Custom Analytics Tab */}
        <TabsContent value="custom" className="space-y-4 sm:space-y-6">
          {customLoading ? (
            <AnalyticsCustomSkeleton />
          ) : (
            <div className="grid gap-4 sm:gap-6">
            {/* Custom Analytics Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Custom Analytics Query
                </CardTitle>
                <CardDescription>
                  Create custom analytics reports with flexible parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <DateRangePicker
                      dateRange={customAnalyticsDateRange}
                      onDateRangeChange={handleCustomDateRangeChange}
                      placeholder="Select date range for custom analytics"
                      className="w-full max-w-[300px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Select Metrics</label>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    {availableMetrics.map((metric) => (
                      <div key={metric.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={metric.key}
                          checked={selectedMetrics.includes(metric.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMetrics([...selectedMetrics, metric.key])
                            } else {
                              setSelectedMetrics(selectedMetrics.filter(m => m !== metric.key))
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={metric.key} className="text-sm">
                          {metric.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCustomAnalytics} 
                    disabled={customLoading || !customAnalyticsDateRange?.from || !customAnalyticsDateRange?.to || selectedMetrics.length === 0}
                  >
                    {customLoading ? 'Loading...' : 'Generate Report'}
                  </Button>
                  {customData && (
                    <Button variant="outline" onClick={() => setCustomData(null)}>
                      Clear Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Analytics Results */}
            {customData && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Analytics Results</CardTitle>
                  <CardDescription>
                    Results for {customAnalyticsDateRange?.from && customAnalyticsDateRange?.to 
                      ? `${format(customAnalyticsDateRange.from, 'PPP')} to ${format(customAnalyticsDateRange.to, 'PPP')}`
                      : 'Select date range to view results'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    {selectedMetrics.map((metric) => {
                      const metricInfo = availableMetrics.find(m => m.key === metric)
                      const value = customData.data?.[metric] || 0
                      
                      return (
                        <div key={metric} className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                          <p className="text-sm text-muted-foreground">{metricInfo?.label}</p>
                        </div>
                      )
                    })}
                  </div>

                  {customData.data?.grouped_data && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Grouped Data</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-auto">
                          {JSON.stringify(customData.data.grouped_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Raw Data</h4>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-auto">
                      <pre className="text-sm">
                        {JSON.stringify(customData.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Analytics Help */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Analytics Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium">Available Metrics:</h4>
                    <ul className="mt-1 ml-4 space-y-1 list-disc">
                      <li><strong>Total Scans:</strong> Number of security scans performed</li>
                      <li><strong>Total Vulnerabilities:</strong> Number of vulnerabilities found</li>
                      <li><strong>Average Security Score:</strong> Mean security score across scans</li>
                      <li><strong>Critical Issues:</strong> Number of critical severity issues</li>
                      <li><strong>Repositories Scanned:</strong> Number of unique repositories scanned</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Tips:</h4>
                    <ul className="mt-1 ml-4 space-y-1 list-disc">
                      <li>Select a date range that covers meaningful activity</li>
                      <li>Choose multiple metrics to compare trends</li>
                      <li>Use repository filtering to focus on specific projects</li>
                      <li>Export results using the main export button for further analysis</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}