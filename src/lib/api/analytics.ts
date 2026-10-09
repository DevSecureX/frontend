import { apiClient } from './client'

// Enum Types
export enum TimeRange {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

export enum ComplianceFramework {
  OWASP = 'owasp',
  NIST = 'nist',
  PCI_DSS = 'pci-dss',
  HIPAA = 'hipaa',
  GDPR = 'gdpr',
  ISO_27001 = 'iso-27001'
}

export enum SeverityLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

// Overview Analytics Types
export interface OverviewMetrics {
  total_scans: number
  total_repositories: number
  total_vulnerabilities: number
  average_security_score: number
  active_scans: number
  fixed_issues: number
  compliance_score: number
  critical_issues: number
}

export interface TrendPoint {
  date: string
  value: number
  secondary_value?: number
}

export interface TopIssue {
  category: string
  rule_id: string
  count: number
  severity: SeverityLevel
  percentage: number
}

export interface RecentActivity {
  scan_id: string
  repo_name: string
  scan_type: string
  status: string
  created_at: string
  security_score?: number
  issues_found: number
}

export interface OverviewResponse {
  metrics: OverviewMetrics
  score_trend: TrendPoint[]
  vulnerability_trend: TrendPoint[]
  top_issues: TopIssue[]
  recent_activity: RecentActivity[]
  scans_by_severity: Record<string, number>
  scans_by_type: Record<string, number>
}

// Security Analytics Types
export interface SecurityMetrics {
  total_vulnerabilities: number
  critical_issues: number
  high_issues: number
  medium_issues: number
  low_issues: number
  security_score_avg: number
  vulnerabilities_by_category: Record<string, number>
  vulnerabilities_by_tool: Record<string, number>
  false_positive_rate: number
  mean_time_to_fix?: number
}

export interface VulnerabilityTrend {
  date: string
  vulnerabilities: number
  critical_count: number
  high_count: number
  security_score: number
  scans_completed: number
}

export interface RiskAssessment {
  overall_risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: string[]
  recommendations: string[]
}

export interface SecurityResponse {
  metrics: SecurityMetrics
  trend_data: VulnerabilityTrend[]
  risk_assessment: RiskAssessment
  critical_issues_details: TopIssue[]
}

// Compliance Analytics Types
export interface ComplianceRequirement {
  requirement_id: string
  name: string
  description: string
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable'
  score: number
  issues_count: number
  last_assessed: string
}

export interface ComplianceCategory {
  category_id: string
  name: string
  score: number
  status: 'compliant' | 'partial' | 'non-compliant'
  requirements: ComplianceRequirement[]
  issues_count: number
}

export interface ComplianceReport {
  framework: ComplianceFramework
  overall_score: number
  requirements_met: number
  total_requirements: number
  categories: ComplianceCategory[]
  last_updated: string
  trending_up: boolean
}

// Trends Analytics Types
export interface TrendMetric {
  metric_name: string
  current_value: number
  previous_value: number
  change_percentage: number
  trend_direction: 'up' | 'down' | 'stable'
  data_points: TrendPoint[]
}

export interface PerformanceMetrics {
  avg_scan_duration: number
  scan_success_rate: number
  issue_resolution_rate: number
  new_issues_trend: TrendPoint[]
  fixed_issues_trend: TrendPoint[]
}

export interface TrendsResponse {
  security_trends: TrendMetric
  vulnerability_trends: TrendMetric
  compliance_trends: TrendMetric
  scan_volume_trends: TrendMetric
  performance_metrics: PerformanceMetrics
  period_comparison: Record<string, any>
}

// Repository Analytics Types
export interface RepositoryInsight {
  repo_id: number
  full_name: string
  language?: string
  niche: string
  security_score: number
  last_scan?: string
  total_scans: number
  vulnerabilities_count: number
  critical_issues: number
  compliance_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  activity_score: number
}

export interface RepositoryRanking {
  rank: number
  repo_name: string
  security_score: number
  improvement_trend: number
}

export interface LanguageStats {
  language: string
  repository_count: number
  avg_security_score: number
  common_issues: string[]
}

export interface NicheStats {
  niche: string
  repository_count: number
  avg_security_score: number
  top_risks: string[]
}

export interface RepositoriesResponse {
  total_repositories: number
  active_repositories: number
  repositories_by_language: Record<string, number>
  repositories_by_niche: Record<string, number>
  security_score_distribution: Record<string, number>
  repository_insights: RepositoryInsight[]
  top_performers: RepositoryRanking[]
  needs_attention: RepositoryRanking[]
  language_stats: LanguageStats[]
  niche_stats: NicheStats[]
  recent_activity: RecentActivity[]
}

// Real-time Analytics Types
export interface RealTimeMetrics {
  active_scans: number
  queued_scans: number
  recent_issues: number
  security_score_avg: number
  compliance_status: Record<string, number>
  alert_count: number
  system_health: 'healthy' | 'warning' | 'critical'
  last_updated: string
}

// Team Analytics Types
export interface TeamMemberInsight {
  user_id: number
  username: string
  repositories_count: number
  recent_scans: number
  issues_found: number
  issues_fixed: number
  avg_security_score: number
  last_activity: string
}

export interface TeamInsights {
  total_team_members: number
  most_active_contributors: TeamMemberInsight[]
  repository_ownership: Record<string, number>
  scan_frequency: Record<string, number>
  collaboration_score: number
}

// Legacy types for backward compatibility
export interface ScanAnalytics {
  total_scans: number
  scans_by_severity: Record<string, number>
  scans_by_type: Record<string, number>
  average_score: number
  score_trend: Array<{ date: string; score: number }>
  top_issues: Array<{ category: string; count: number }>
}

export interface TrendData {
  date: string
  vulnerabilities: number
  security_score: number
  scans_completed: number
  issues_fixed: number
}

// Analytics API class
export class AnalyticsAPI {
  // New comprehensive analytics endpoints
  
  // Overview Analytics
  async getOverview(
    timeRange: TimeRange = TimeRange.MONTH,
    repoFullName?: string
  ): Promise<OverviewResponse> {
    const params: any = { time_range: timeRange }
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    return apiClient.get('/analytics/overview', { params })
  }

  // Security Analytics
  async getSecurity(
    timeRange: TimeRange = TimeRange.MONTH,
    repoFullName?: string
  ): Promise<SecurityResponse> {
    const params: any = { time_range: timeRange }
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    return apiClient.get('/analytics/security', { params })
  }

  // Compliance Analytics
  async getCompliance(
    framework: ComplianceFramework = ComplianceFramework.OWASP,
    repoFullName?: string
  ): Promise<ComplianceReport> {
    const params: any = { framework }
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    return apiClient.get('/analytics/compliance', { params })
  }

  // Trends Analytics
  async getTrends(
    timeRange: TimeRange = TimeRange.MONTH,
    metric: string = 'vulnerabilities',
    repoFullName?: string
  ): Promise<TrendsResponse> {
    const params: any = { time_range: timeRange, metric }
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    return apiClient.get('/analytics/trends', { params })
  }

  // Repository Analytics
  async getRepositories(
    repoFullName?: string,
    language?: string
  ): Promise<RepositoriesResponse> {
    const params: any = {}
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    if (language && language !== 'all') {
      params.language = language
    }
    return apiClient.get('/analytics/repositories', { params })
  }

  // Real-time Metrics
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    return apiClient.get('/analytics/realtime')
  }

  // Team Insights
  async getTeamInsights(): Promise<TeamInsights> {
    return apiClient.get('/analytics/team')
  }

  // Export Analytics
  async exportAnalytics(
    format: 'csv' | 'json' | 'pdf',
    reportType: 'overview' | 'security' | 'compliance' | 'trends' | 'repositories',
    timeRange: TimeRange = TimeRange.MONTH,
    repoFullName?: string
  ): Promise<Blob> {
    const params: any = {
      format,
      report_type: reportType,
      time_range: timeRange
    }
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    
    const response = await apiClient.get('/analytics/export', {
      params,
      responseType: 'blob'
    })
    return response as Blob
  }

  // Legacy methods for backward compatibility
  
  // Scan analytics (legacy)
  async getScanAnalytics(
    repoFullName?: string,
    timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<ScanAnalytics> {
    const params: any = { time_range: timeRange }
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    return apiClient.get('/analytics/overview', { params }).then(response => ({
      total_scans: response.metrics.total_scans,
      scans_by_severity: response.scans_by_severity,
      scans_by_type: response.scans_by_type,
      average_score: response.metrics.average_security_score,
      score_trend: response.score_trend.map((point: TrendPoint) => ({ 
        date: point.date, 
        score: point.value 
      })),
      top_issues: response.top_issues.map((issue: TopIssue) => ({
        category: issue.category,
        count: issue.count
      }))
    }))
  }

  // Security metrics (legacy)
  async getSecurityMetrics(
    timeRange: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<SecurityMetrics> {
    return apiClient.get('/analytics/security', {
      params: { time_range: timeRange }
    }).then(response => response.metrics)
  }

  // Repository insights (legacy)
  async getRepositoryInsights(repoFullName?: string, language?: string): Promise<{
    total_repositories: number
    active_repositories: number
    repositories_by_language: Record<string, number>
    repositories_by_niche: Record<string, number>
    security_score_distribution: Record<string, number>
    recent_activity: Array<{
      repo_name: string
      last_scan: string
      security_score: number
      critical_issues: number
    }>
  }> {
    const params: any = {}
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    if (language && language !== 'all') {
      params.language = language
    }
    return apiClient.get('/analytics/repositories', { params }).then(response => ({
      total_repositories: response.total_repositories,
      active_repositories: response.active_repositories,
      repositories_by_language: response.repositories_by_language,
      repositories_by_niche: response.repositories_by_niche,
      security_score_distribution: response.security_score_distribution,
      recent_activity: response.recent_activity.map((activity: RecentActivity) => ({
        repo_name: activity.repo_name,
        last_scan: activity.created_at,
        security_score: activity.security_score || 0,
        critical_issues: Math.floor(activity.issues_found / 3) // Estimate
      }))
    }))
  }

  // Compliance reporting (legacy)
  async getComplianceReport(
    framework: 'owasp' | 'nist' | 'pci-dss' | 'hipaa' | 'gdpr' | 'iso-27001',
    repoFullName?: string
  ): Promise<ComplianceReport> {
    const params: any = { framework }
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    return apiClient.get('/analytics/compliance', { params })
  }

  // Trend analysis (legacy)
  async getTrendData(
    metric: 'vulnerabilities' | 'security_score' | 'scans' | 'fixes',
    timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month',
    repoFullName?: string
  ): Promise<TrendData[]> {
    const params: any = { metric, time_range: timeRange }
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    return apiClient.get('/analytics/trends', { params }).then(response => {
      // Convert new format to legacy format
      const trendMetric = response.vulnerability_trends
      return trendMetric.data_points.map((point: TrendPoint) => ({
        date: point.date,
        vulnerabilities: point.value,
        security_score: point.secondary_value || 75,
        scans_completed: 1,
        issues_fixed: 0
      }))
    })
  }

  // Team insights (legacy format)
  async getTeamInsightsLegacy(): Promise<{
    total_team_members: number
    most_active_contributors: Array<{
      username: string
      repositories: number
      recent_scans: number
      issues_found: number
    }>
    repository_ownership: Record<string, number>
    scan_frequency: Record<string, number>
  }> {
    return apiClient.get('/analytics/team').then(response => ({
      total_team_members: response.total_team_members,
      most_active_contributors: response.most_active_contributors.map((member: TeamMemberInsight) => ({
        username: member.username,
        repositories: member.repositories_count,
        recent_scans: member.recent_scans,
        issues_found: member.issues_found
      })),
      repository_ownership: response.repository_ownership,
      scan_frequency: response.scan_frequency
    }))
  }

  // Custom date range analytics
  async getCustomAnalytics(
    startDate: string,
    endDate: string,
    metrics: string[],
    repoFullName?: string
  ): Promise<Record<string, any>> {
    const params: any = {
      start_date: startDate,
      end_date: endDate,
      metrics: metrics.join(',')
    }
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    return apiClient.get('/analytics/custom', { params })
  }

  // Real-time metrics (legacy format)
  async getRealTimeMetricsLegacy(): Promise<{
    active_scans: number
    queued_scans: number
    recent_issues: number
    security_score_avg: number
    compliance_status: Record<string, number>
    alert_count: number
  }> {
    return apiClient.get('/analytics/realtime').then(response => ({
      active_scans: response.active_scans,
      queued_scans: response.queued_scans,
      recent_issues: response.recent_issues,
      security_score_avg: response.security_score_avg,
      compliance_status: response.compliance_status,
      alert_count: response.alert_count
    }))
  }

  // Issue analytics (legacy)
  async getIssueAnalytics(
    timeRange: 'week' | 'month' | 'quarter' = 'month',
    severity?: 'critical' | 'high' | 'medium' | 'low'
  ): Promise<{
    total_issues: number
    issues_by_severity: Record<string, number>
    issues_by_category: Record<string, number>
    issues_by_tool: Record<string, number>
    resolution_time_avg: number
    most_common_issues: Array<{
      rule_id: string
      category: string
      count: number
      severity: string
    }>
    false_positive_rate: number
  }> {
    const params: any = { time_range: timeRange }
    if (severity) {
      params.severity = severity
    }
    return apiClient.get('/analytics/issues', { params })
  }
}

// Export singleton instance
export const analyticsAPI = new AnalyticsAPI()
export default analyticsAPI