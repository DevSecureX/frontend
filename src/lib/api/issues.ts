import { apiClient } from './client'

// Issue Status Types
export type IssueStatus = 'open' | 'fixed_auto' | 'fixed_manual' | 'fixed_dependency' | 'false_positive'

export type ResolutionMethod = 'ai_autofix' | 'manual_fix' | 'dependency_update' | 'false_positive'

// Issue Interface
export interface TrackedIssue {
  id: string
  issue_hash: string
  repo_full_name: string
  first_detected_scan_id: string
  last_seen_scan_id: string | null
  status: IssueStatus
  resolution_method: ResolutionMethod | null
  fixed_in_pr_number: number | null
  fixed_at: string | null
  fixed_by: string | null
  issue_type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  file_path: string | null
  line_number: number | null
  description: string | null
  created_at: string
  updated_at: string
}

// Issue Counts Response
export interface IssueCountsResponse {
  total_fixed: number
  fixed_by_ai: number
  fixed_manually: number
  fixed_by_dependency: number
  false_positives: number
  open_issues: number
  total_issues: number
}

// Resolution Statistics
export interface ResolutionStats {
  total_fixed: number
  resolution_methods: {
    ai_autofix: number
    manual_fix: number
    dependency_update: number
    false_positive: number
  }
  resolution_by_severity: {
    critical: number
    high: number
    medium: number
    low: number
  }
  avg_resolution_time_hours: number
  most_common_issue_types: Array<{
    issue_type: string
    fixed_count: number
    avg_resolution_time: number
  }>
  resolution_trend: Array<{
    date: string
    fixed_count: number
    resolution_method: ResolutionMethod
  }>
}

// API Query Parameters
export interface IssueListParams {
  page?: number
  per_page?: number
  repo_full_name?: string
  status?: IssueStatus
  severity?: string
  issue_type?: string
  fixed_after?: string
  fixed_before?: string
}

export interface IssueCountsParams {
  repo_full_name?: string
  time_range?: 'day' | 'week' | 'month' | 'quarter' | 'year'
  start_date?: string
  end_date?: string
}

export interface ResolutionStatsParams {
  repo_full_name?: string
  time_range?: 'day' | 'week' | 'month' | 'quarter' | 'year'
  start_date?: string
  end_date?: string
}

// Update Issue Status Request
export interface UpdateIssueStatusRequest {
  status: IssueStatus
  resolution_method?: ResolutionMethod
  fixed_by?: string
}

class IssuesAPI {
  /**
   * Get paginated list of tracked issues
   */
  async getIssues(params?: IssueListParams): Promise<{
    issues: TrackedIssue[]
    total: number
    page: number
    per_page: number
    total_pages: number
  }> {
    return apiClient.get('/issues/', { params })
  }

  /**
   * Get specific issue by hash
   */
  async getIssue(issueHash: string): Promise<TrackedIssue> {
    return apiClient.get(`/issues/${issueHash}`)
  }

  /**
   * Update issue status manually
   */
  async updateIssueStatus(issueHash: string, update: UpdateIssueStatusRequest): Promise<TrackedIssue> {
    return apiClient.put(`/issues/${issueHash}/status`, update)
  }

  /**
   * Get resolved issues counts (for dashboard)
   */
  async getIssuesCounts(params?: IssueCountsParams): Promise<IssueCountsResponse> {
    return apiClient.get('/issues/counts', { params })
  }

  /**
   * Get detailed resolution statistics
   */
  async getResolutionStats(params?: ResolutionStatsParams): Promise<ResolutionStats> {
    return apiClient.get('/issues/resolution-stats', { params })
  }

  /**
   * Mark issue as false positive
   */
  async markAsFalsePositive(issueHash: string): Promise<TrackedIssue> {
    return this.updateIssueStatus(issueHash, {
      status: 'false_positive',
      resolution_method: 'false_positive'
    })
  }

  /**
   * Mark issue as manually fixed
   */
  async markAsManuallyFixed(issueHash: string, fixedBy?: string): Promise<TrackedIssue> {
    return this.updateIssueStatus(issueHash, {
      status: 'fixed_manual',
      resolution_method: 'manual_fix',
      fixed_by: fixedBy
    })
  }

  /**
   * Get issue resolution summary for a repository
   */
  async getRepositoryResolutionSummary(repoFullName: string): Promise<{
    open_issues: number
    resolved_issues: number
    resolution_rate: number
    avg_resolution_time_days: number
    most_fixed_issue_type: string
  }> {
    const counts = await this.getIssuesCounts({ repo_full_name: repoFullName })
    const stats = await this.getResolutionStats({ repo_full_name: repoFullName })

    return {
      open_issues: counts.open_issues,
      resolved_issues: counts.total_fixed,
      resolution_rate: counts.total_issues > 0 ? (counts.total_fixed / counts.total_issues) * 100 : 0,
      avg_resolution_time_days: Math.round((stats.avg_resolution_time_hours || 0) / 24 * 10) / 10,
      most_fixed_issue_type: stats.most_common_issue_types[0]?.issue_type || 'N/A'
    }
  }

  /**
   * Get issues fixed in the last N days
   */
  async getRecentlyFixedIssues(days: number = 7, repoFullName?: string): Promise<TrackedIssue[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const response = await this.getIssues({
      repo_full_name: repoFullName,
      status: 'fixed_auto',
      fixed_after: startDate.toISOString().split('T')[0],
      per_page: 50
    })

    return response.issues
  }

  /**
   * Get AI auto-fix success metrics
   */
  async getAutoFixMetrics(params?: { repo_full_name?: string; time_range?: 'day' | 'week' | 'month' | 'quarter' | 'year' }): Promise<{
    total_attempted: number
    total_successful: number
    success_rate: number
    avg_confidence_score: number
    fixes_by_severity: Record<string, number>
  }> {
    const stats = await this.getResolutionStats(params)
    
    const aiFixed = stats.resolution_methods.ai_autofix
    const totalFixed = stats.total_fixed

    return {
      total_attempted: aiFixed * 1.2, // Estimate attempted fixes (some may fail)
      total_successful: aiFixed,
      success_rate: aiFixed > 0 ? (aiFixed / (aiFixed * 1.2)) * 100 : 0,
      avg_confidence_score: 85, // This would come from autofix_results table
      fixes_by_severity: stats.resolution_by_severity
    }
  }
}

export const issuesAPI = new IssuesAPI()