import { apiClient } from './client'
import { config } from '@/lib/config/env'


// Request/Response types
export interface ScanRequest {
  repo_full_name: string
  branch?: string
  niche?: string // Project type for rule selection
  // Backend now ignores mode/scope - all scans are comprehensive with ALL tools
  // Optional custom rules can still be added on top of the comprehensive scan
  include_custom_rules?: boolean
  include_community_rules?: boolean
  selected_custom_rule_ids?: string[]
  selected_community_rule_ids?: string[]
}

export interface Issue {
  id?: string
  message: string
  line_start?: number
  line_end?: number
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  file_path?: string
  category?: string
  tool?: string
  rule_id?: string
  confidence?: string
  owasp_category?: string
  cwe_id?: string
  code_context?: Record<string, string>
  nist_id?: string
  pci_dss_id?: string
  hipaa_id?: string
  gdpr_article?: string
  iso_27001_id?: string
}

export interface Scan {
  scan_id: string
  repo_full_name?: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  total_score: number
  scores: {
    code_score?: number
    deps_score?: number
    secrets_score?: number
    configs_score?: number
  }
  business_impact?: {
    data_breach_risk?: string
    compliance_risk?: string
    reputation_risk?: string
    financial_risk?: string
    operational_risk?: string
  }
  recommendations?: string[]
  trend_score?: string
  issues: Issue[]
  branch: string
  mode: string
  scope: string
  scan_type: string
  metadata: {
    scan_duration?: number
    tools_used?: string[]
    commit_sha?: string
    pr_number?: number
    sbom?: any
  }
  created_at: string
}

export interface ScanSummary {
  scan_id: string
  repo_full_name: string
  branch: string
  total_score: number
  status: string
  scan_type: string
  issue_summary: Record<string, number>
  created_at: string
  scan_duration?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface PaginatedScanSummaryResponse {
  data: ScanSummary[]
  pagination: PaginationMeta
}

export interface ScanStats {
  total_scans: number
  active_scans: number
  critical_issues: number
  completed_scans: number
  failed_scans: number
  by_status: Record<string, number>
  by_repository: Record<string, number>
}

export interface JobStatus {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  repo_full_name: string
  scan_type: string
  created_at: string
  progress: string
  scan_id?: string
  error_message?: string
  stage?: string
  current_tool?: string
  tools_completed?: number
  total_tools?: number
}

// Autofix Queue Interfaces
export interface AutofixJobStatus {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  scan_id?: string
  repo_full_name?: string
  branch?: string
  user_id?: number
  created_at: string
  started_at?: string
  completed_at?: string
  failed_at?: string
  cancelled_at?: string
  updated_at?: string
  worker_id?: string
  queue_position?: number
  // Progress can be either a number or an object depending on API version
  progress: number | {
    percentage: number
    current_step: string
    total_steps: number
    current_step_number: number
  }
  message?: string
  result?: {
    status?: string
    scan_id?: string
    fixed_count: number
    fixed_files: string[]
    pr_url?: string
    message: string
    issues_found?: number
    metrics?: {
      fetch_time: number
      fix_time: number
      pr_time: number
      total_time: number
    }
    job_id?: string
    worker_id?: string
    processed_at?: string
  }
  error_message?: string
  estimated_duration?: number
  priority?: 'low' | 'normal' | 'high'
  severity_filter?: string[]
  create_pr?: boolean
}

export interface AutofixQueueStats {
  queue_stats: {
    queued: number
    processing: number
    failed: number
    completed_today: number
  }
  timestamp: string
}


export interface AutofixWorkerStatus {
  worker_id: string
  status: 'idle' | 'busy' | 'offline'
  current_job_id?: string
  jobs_completed: number
  started_at: string
  last_heartbeat: string
  performance_metrics: {
    avg_job_duration: number
    success_rate: number
    errors_today: number
  }
}

export interface AIExplanationResponse {
  explanation: string
  fix_suggestion?: string
  testing_approach?: string
  business_impact?: string
  owasp_mapping?: Record<string, any>
  cached: boolean
}

export interface QueueStats {
  queued: number
  processing: number
  failed: number
  total_scans_today: number
  average_scan_time: number
}

export interface PRListItem {
  number: number
  title: string
  state: string
  created_at: string
  updated_at: string
  author?: string
  head_sha: string
  additions: number
  deletions: number
  changed_files: number
  draft: boolean
  labels: string[]
  url: string
}

export interface PRScanRequest {
  mode?: 'fast' | 'comprehensive'
  scope?: string
  include_custom_rules?: boolean
  include_community_rules?: boolean
  selected_custom_rule_ids?: string[]
  selected_community_rule_ids?: string[]
}

export interface BulkPRScanRequest {
  pr_numbers?: number[]
  max_concurrent: number
  mode?: 'fast' | 'comprehensive'
  scope?: string
  enable_ai_fixes?: boolean
  auto_comment?: boolean
  create_reviews?: boolean
  include_custom_rules?: boolean
  include_community_rules?: boolean
  selected_custom_rule_ids?: string[]
  selected_community_rule_ids?: string[]
}

export interface IssueFeedbackRequest {
  is_false_positive: boolean
  feedback_reason?: string
}

// Scans API class
export class ScansAPI {
  // Manual scans - Backend always runs comprehensive scans with ALL security tools
  async triggerScan(scanData: ScanRequest): Promise<{
    job_id: string
    status: string
    message: string
    estimated_completion: string
  }> {
    // Use LONG timeout for comprehensive scans (8-15 minutes with all tools)
    return apiClient.post('/scans/', scanData, undefined, 'LONG')
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    // Use POLLING timeout for frequent status checks
    return apiClient.get(`/scans/job/${jobId}/status`, undefined, 'POLLING')
  }

  async getScanDetails(scanId: string, includeIssues: boolean = true): Promise<Scan> {
    // Use MEDIUM timeout for fetching scan details which can be large
    return apiClient.get(`/scans/${scanId}`, {
      params: { include_issues: includeIssues }
    }, 'MEDIUM')
  }

  async deleteScan(scanId: string): Promise<{ message: string }> {
    return apiClient.delete(`/scans/${scanId}`)
  }

  // Repository scans
  async listRepoScans(
    repoFullName: string,
    page: number = 1,
    limit: number = 20,
    scanType?: string
  ): Promise<ScanSummary[]> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    // Use MEDIUM timeout for listing operations
    return apiClient.get(`/scans/repos/${encodedName}/scans`, {
      params: { page, limit, scan_type: scanType }
    }, 'MEDIUM')
  }

  // User scans
  async listUserScans(
    page: number = 1,
    limit: number = 20,
    scanType?: string,
    status?: string,
    repository?: string
  ): Promise<PaginatedScanSummaryResponse> {
    // Use MEDIUM timeout for listing operations
    const params: Record<string, any> = { page, limit }
    if (scanType) params.scan_type = scanType
    if (status) params.status = status
    if (repository) params.repository = repository
    
    console.log('API listUserScans called with params:', params)
    console.log('Repository parameter details:', {
      repository,
      repositoryType: typeof repository,
      repositoryLength: repository?.length,
      repositoryEncoded: repository ? encodeURIComponent(repository) : null
    })
    
    return apiClient.get('/scans/', {
      params
    }, 'MEDIUM')
  }

  // AI explanations
  async getIssueExplanation(
    tool: string,
    ruleId: string,
    category: string,
    severity: string = 'medium'
  ): Promise<AIExplanationResponse> {
    return apiClient.get('/scans/issues/explain', {
      params: { 
        tool,
        rule_id: ruleId,
        category,
        severity
      }
    })
  }

  async submitIssueFeedback(
    issueId: string,
    feedback: IssueFeedbackRequest
  ): Promise<{ message: string }> {
    return apiClient.post(`/scans/issues/${issueId}/feedback`, feedback)
  }

  // Queue management
  async getQueueStats(): Promise<QueueStats> {
    return apiClient.get('/scans/queue/stats')
  }

  // Pull Request scanning
  async listPRs(repoFullName: string): Promise<PRListItem[]> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    return apiClient.get(`/scans/repos/${encodedName}/prs`)
  }

  async scanPR(
    repoFullName: string,
    prNumber: number,
    scanData: PRScanRequest
  ): Promise<{
    job_id: string
    status: string
    message: string
  }> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    return apiClient.post(`/scans/repos/${encodedName}/prs/${prNumber}/scan`, scanData)
  }

  async bulkScanPRs(
    repoFullName: string,
    scanData: BulkPRScanRequest
  ): Promise<{
    job_ids: string[]
    status: string
    message: string
  }> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    return apiClient.post(`/scans/repos/${encodedName}/prs/scan-all`, scanData)
  }

  async postPRComment(
    scanId: string,
    comment: string
  ): Promise<{
    comment_id: number
    message: string
  }> {
    return apiClient.post(`/scans/${scanId}/post-pr-comment`, { comment })
  }

  async postSecurityReview(
    repoFullName: string,
    prNumber: number,
    reviewAction: 'REQUEST_CHANGES' | 'COMMENT' = 'COMMENT',
    forceNewScan: boolean = false
  ): Promise<{
    review_id: number
    message: string
  }> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    return apiClient.post(`/scans/repos/${encodedName}/prs/${prNumber}/security-review`, null, {
      params: {
        review_action: reviewAction,
        force_new_scan: forceNewScan
      }
    })
  }

  // Analytics and insights
  async getScanAnalytics(
    repoFullName?: string,
    timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<{
    total_scans: number
    scans_by_severity: Record<string, number>
    scans_by_type: Record<string, number>
    average_score: number
    score_trend: Array<{ date: string; score: number }>
    top_issues: Array<{ category: string; count: number }>
  }> {
    const params: any = { time_range: timeRange }
    if (repoFullName) {
      params.repo_full_name = repoFullName
    }
    return apiClient.get('/scans/analytics', { params })
  }

  async getSecurityMetrics(): Promise<{
    total_vulnerabilities: number
    critical_issues: number
    fixed_issues: number
    security_score_avg: number
    compliance_score: Record<string, number>
    trend_data: Array<{
      date: string
      vulnerabilities: number
      score: number
    }>
  }> {
    return apiClient.get('/scans/security-metrics')
  }

  // Enhanced polling helper for job completion with better error handling
  async pollJobStatus(
    jobId: string,
    onUpdate?: (status: JobStatus) => void,
    maxAttempts: number = 360, // 30 minutes max (5s intervals) to match backend processing time
    intervalMs: number = 5000
  ): Promise<JobStatus> {
    let consecutiveFailures = 0
    const maxConsecutiveFailures = 10 // Increased tolerance for long-running scans
    
    console.log(`Starting job polling for ${jobId} with maxAttempts: ${maxAttempts}, interval: ${intervalMs}ms`)
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await this.getJobStatus(jobId)
        consecutiveFailures = 0 // Reset failure counter on success
        
        if (onUpdate) {
          onUpdate(status)
        }

        // Log progress every 10 attempts to track long-running jobs
        if (attempt % 10 === 0 && attempt > 0) {
          console.log(`Job ${jobId} polling progress: attempt ${attempt + 1}/${maxAttempts}, status: ${status.status}`)
        }

        if (status.status === 'completed' || status.status === 'failed') {
          console.log(`Job ${jobId} polling completed after ${attempt + 1} attempts with status: ${status.status}`)
          return status
        }

        // Adaptive polling: slow down for long-running jobs
        const adaptiveInterval = attempt > 20 ? Math.min(intervalMs * 2, 10000) : intervalMs
        await new Promise(resolve => setTimeout(resolve, adaptiveInterval))
        
      } catch (error: any) {
        consecutiveFailures++
        console.warn(`Job polling attempt ${attempt + 1} failed (${consecutiveFailures}/${maxConsecutiveFailures} consecutive failures):`, error.message)
        
        // If we have too many consecutive failures, give up
        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.error(`Job ${jobId} polling failed after ${maxConsecutiveFailures} consecutive failures at attempt ${attempt + 1}/${maxAttempts}`)
          throw new Error(`Job polling failed after ${maxConsecutiveFailures} consecutive failures: ${error.message}`)
        }
        
        // Wait longer after failures
        const failureDelay = Math.min(intervalMs * consecutiveFailures, 15000)
        await new Promise(resolve => setTimeout(resolve, failureDelay))
      }
    }

    const timeoutError = new Error(`Scan monitoring stopped after ${maxAttempts} status checks. The scan may still be processing in the background and will appear in your scans list when complete.`)
    timeoutError.name = 'TimeoutError'
    throw timeoutError
  }

  // Enhanced polling for autofix jobs with progress tracking
  async pollAutofixJobStatus(
    jobId: string,
    onUpdate?: (status: AutofixJobStatus) => void,
    maxAttempts: number = 600, // 30 minutes max (with 3s intervals) to match backend processing time
    intervalMs: number = 3000 // Check every 3 seconds for more responsive UI
  ): Promise<AutofixJobStatus> {
    let consecutiveFailures = 0
    const maxConsecutiveFailures = 10 // Increased tolerance for long-running operations
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await this.getAutofixJobStatus(jobId)
        consecutiveFailures = 0 // Reset failure counter on success
        
        if (onUpdate) {
          onUpdate(status)
        }

        // Terminal states
        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          return status
        }

        // Adaptive polling based on progress
        let adaptiveInterval = intervalMs
        const progressPercentage = typeof status.progress === 'number' ? status.progress : status.progress?.percentage || 0
        
        if (progressPercentage > 80) {
          // Speed up polling near completion
          adaptiveInterval = Math.max(intervalMs * 0.5, 2000)
        } else if (attempt > 30) {
          // Slow down for long-running jobs
          adaptiveInterval = Math.min(intervalMs * 1.5, 8000)
        }
        
        await new Promise(resolve => setTimeout(resolve, adaptiveInterval))
        
      } catch (error: any) {
        consecutiveFailures++
        console.warn(`Autofix job polling attempt ${attempt + 1} failed:`, error.message)
        
        // If we have too many consecutive failures, give up
        if (consecutiveFailures >= maxConsecutiveFailures) {
          throw new Error(`Autofix job polling failed after ${maxConsecutiveFailures} consecutive failures: ${error.message}`)
        }
        
        // Wait longer after failures
        const failureDelay = Math.min(intervalMs * consecutiveFailures, 15000)
        await new Promise(resolve => setTimeout(resolve, failureDelay))
      }
    }

    throw new Error(`Autofix job polling timeout after ${maxAttempts} attempts. Auto-fix operations can take 20-30 minutes and the job may still be processing in the background. Check the scans page for results.`)
  }

  // Bulk operations
  async bulkDeleteUserScans(
    olderThanDays: number = 30,
    maxScans: number = 1000
  ): Promise<{
    message: string
    deleted_scans: number
    deleted_summaries: number
    deleted_dependencies: number
    cutoff_date: string
  }> {
    return apiClient.delete('/scans/bulk/user-scans', {
      params: {
        older_than_days: olderThanDays,
        max_scans: maxScans
      }
    })
  }

  // Workers status
  async getWorkersStatus(): Promise<{
    environment: Record<string, string>
    workers: any
    timestamp: string
  }> {
    return apiClient.get('/scans/workers/status')
  }

  // List PR scans
  async listPRScans(
    owner: string,
    repoName: string,
    prNumber: number,
    page: number = 1,
    limit: number = 20
  ): Promise<ScanSummary[]> {
    return apiClient.get(`/scans/repos/${owner}/${repoName}/prs/${prNumber}/scans`, {
      params: { page, limit }
    })
  }

  // Post PR security comment
  async postPRSecurityComment(scanId: string): Promise<{
    status: string
    comment_url: string
    message: string
  }> {
    return apiClient.post(`/scans/${scanId}/post-pr-comment`)
  }

  // Create PR security review
  async createPRSecurityReview(
    repoFullName: string,
    prNumber: number,
    reviewAction: 'COMMENT' | 'REQUEST_CHANGES' = 'COMMENT',
    forceNewScan: boolean = false
  ): Promise<{
    status: string
    review_url: string
    review_action: string
    inline_comments: number
    message: string
  }> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    return apiClient.post(`/scans/repos/${encodedName}/prs/${prNumber}/security-review`, null, {
      params: {
        review_action: reviewAction,
        force_new_scan: forceNewScan
      }
    })
  }

  async getPRReviewRecommendation(
    repoFullName: string,
    prNumber: number
  ): Promise<{
    has_scan: boolean
    recommended_action: 'REQUEST_CHANGES' | 'COMMENT'
    reason: string
    issue_counts?: {
      critical: number
      high: number
      medium: number
    }
    scan_date?: string
  }> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    return apiClient.get(`/scans/repos/${encodedName}/prs/${prNumber}/review-recommendation`)
  }

  // List PR security reviews
  async listPRSecurityReviews(
    repoFullName: string,
    prNumber: number
  ): Promise<Array<{
    id: number
    scan_id: string
    review_action: string
    security_score: number
    critical_count: number
    high_count: number
    inline_comments_count: number
    review_url: string
    created_at: string
  }>> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    return apiClient.get(`/scans/repos/${encodedName}/prs/${prNumber}/security-reviews`)
  }

  // Scan statistics
  async getScanStats(): Promise<ScanStats> {
    return apiClient.get('/scans/stats')
  }

  // Export scan report as PDF
  async exportScanReport(
    scanId: string,
    format: 'pdf' = 'pdf'
  ): Promise<Blob> {
    const response = await fetch(`${config.api.baseUrl}/scans/${scanId}/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Accept': 'application/pdf'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Export failed: ${errorText}`)
    }

    return response.blob()
  }

  // Legacy auto-fix (direct synchronous)
  async autoFixScan(
    scanId: string,
    createPR: boolean = true,
    severityFilter: string[] = ['critical', 'high', 'medium']
  ): Promise<{
    status: string
    scan_id: string
    fixed_count?: number
    issues_found?: number
    fixed_files?: string[]
    pr_url?: string
    message: string
  }> {
    // Use LONG timeout for auto-fix operations as they can take several minutes
    return apiClient.post(`/scans/${scanId}/auto-fix`, null, {
      params: {
        create_pr: createPR,
        severity_filter: severityFilter
      }
    }, 'LONG')
  }

  // Autofix Queue System - Start async autofix job
  async startAutofixJob(
    scanId: string,
    createPR: boolean = true,
    severityFilter: string[] = ['critical', 'high', 'medium'],
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<{
    job_id: string
    status: string
    message: string
    estimated_duration?: number
    queue_position?: number
  }> {
    return apiClient.post(`/scans/${scanId}/auto-fix-async`, null, {
      params: {
        create_pr: createPR,
        severity_filter: severityFilter,
        priority
      }
    })
  }

  // Get autofix job status with progress
  async getAutofixJobStatus(jobId: string): Promise<AutofixJobStatus> {
    return apiClient.get(`/scans/autofix-jobs/${jobId}/status`, undefined, 'POLLING')
  }

  // Cancel autofix job
  async cancelAutofixJob(jobId: string): Promise<{ message: string }> {
    return apiClient.delete(`/scans/autofix-jobs/${jobId}`)
  }

  // Get user's autofix jobs
  async listUserAutofixJobs(
    limit: number = 20,
    status?: string
  ): Promise<AutofixJobStatus[]> {
    const params: Record<string, any> = { limit }
    if (status) params.status = status
    return apiClient.get('/scans/autofix-jobs', { params })
  }

  // Get autofix queue statistics
  async getAutofixQueueStats(): Promise<AutofixQueueStats> {
    return apiClient.get('/scans/autofix-queue/stats')
  }

  // Get autofix workers status
  async getAutofixWorkersStatus(): Promise<{
    total_workers: number
    active_workers: number
    workers: AutofixWorkerStatus[]
    system_health: string
    performance_metrics: {
      jobs_per_hour: number
      avg_job_duration: number
      error_rate: number
    }
  }> {
    return apiClient.get('/scans/autofix-workers/status')
  }

  // Enhanced PR scanning endpoints
  async getPRSecurityInsights(
    repoFullName: string,
    prNumber: number
  ): Promise<{
    pr_number: number
    title: string
    author: string
    security_risk_score: number
    incremental_analysis: {
      status: string
      base_score?: number
      pr_score: number
      score_delta: number
      new_issues: Issue[]
      fixed_issues: Issue[]
      persistent_issues: Issue[]
      summary: {
        new_critical: number
        new_high: number
        fixed_critical: number
        fixed_high: number
        total_new: number
        total_fixed: number
        total_persistent: number
      }
      security_improvement: boolean
    }
    historical_patterns: {
      author_stats: {
        total_prs: number
        avg_security_score: number
        risky_prs_count: number
        unique_issue_categories: number
      }
      common_issues: Array<{
        category: string
        severity: string
        count: number
      }>
      trust_score: number
      improvement_trend: string
    }
    security_trends: {
      trend_data: Array<{
        date: string
        avg_score: number
        scan_count: number
        total_issues: number
      }>
      trend_direction: string
      trend_percentage: number
      avg_score_30d: number
      total_scans_30d: number
      issue_velocity: string
    }
    ai_insights: {
      security_assessment: string
      risk_areas: string[]
      improvement_suggestions: string[]
      confidence_score: number
    }
    recommendations: Array<{
      priority: string
      title: string
      description: string
      action: string
    }>
    auto_fix_available: {
      total_fixable: number
      fixable_issues: Array<{
        issue_id: string
        severity: string
        can_auto_fix: boolean
        fix_confidence: number
      }>
      auto_fix_available: boolean
    }
    compliance_impact: {
      compliance_violations: Record<string, string[]>
      impact_score: number
      affected_frameworks: string[]
      requires_compliance_review: boolean
    }
  }> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    // Use MEDIUM timeout for fetching PR insights which can be data-heavy
    return apiClient.get(`/scans/repos/${encodedName}/prs/${prNumber}/insights`, undefined, 'MEDIUM')
  }

  async createPRAutoFix(
    repoFullName: string,
    prNumber: number,
    issueIds: string[],
    createPR: boolean = true,
    useQueue: boolean = true  // Default to async queue to avoid timeouts
  ): Promise<{
    status: string
    fixed_count?: number
    fix_branch?: string
    fix_pr_url?: string
    message: string
    job_id?: string  // For async queue response
    estimated_time?: string
    check_status_url?: string
  }> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    // Use LONG timeout for auto-fix operations (30 minutes) as they involve:
    // - Comprehensive security scanning
    // - Code analysis and fix generation  
    // - PR creation and verification
    // Note: With use_queue=true (default), the endpoint returns immediately with a job_id
    return apiClient.post(`/scans/repos/${encodedName}/prs/${prNumber}/auto-fix`, null, {
      params: {
        issue_ids: issueIds,
        create_pr: createPR,
        use_queue: useQueue  // Add queue parameter
      }
    }, 'LONG')
  }

  async getRepositorySecurityTrends(
    repoFullName: string,
    days: number = 30,
    branch: string = 'main'
  ): Promise<{
    repository: string
    branch: string
    period_days: number
    trend_data: Array<{
      date: string
      avg_score: number
      scan_count: number
      pr_count: number
      pr_scans: number
      pr_avg_score: number
      avg_scan_duration: number
    }>
    trend_summary: {
      direction: string
      improvement_rate: number
      total_scans: number
      total_pr_scans: number
      unique_prs_scanned: number
      current_avg_score: number
    }
    top_issues: Array<{
      category: string
      severity: string
      count: number
    }>
  }> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    return apiClient.get(`/scans/repos/${encodedName}/security-trends`, {
      params: { days, branch }
    })
  }

  async createPRGitHubCheck(
    repoFullName: string,
    prNumber: number
  ): Promise<{
    status: string
    type?: string
    check_id?: number
    check_url?: string
    comment_url?: string
    annotations_count?: number
    message: string
  }> {
    const encodedName = encodeURIComponent(repoFullName).replace(/%2F/g, '/')
    return apiClient.post(`/scans/repos/${encodedName}/prs/${prNumber}/github-check`)
  }

  // Helper methods for autofix job management
  async getActiveAutofixJobs(): Promise<AutofixJobStatus[]> {
    const jobs = await this.listUserAutofixJobs(50)
    return jobs.filter(job => ['queued', 'processing'].includes(job.status))
  }

  async getCompletedAutofixJobs(limit: number = 10): Promise<AutofixJobStatus[]> {
    const jobs = await this.listUserAutofixJobs(limit * 2)
    return jobs.filter(job => job.status === 'completed').slice(0, limit)
  }

  // Helper methods for filtering and sorting
  async getRecentScans(limit: number = 10): Promise<ScanSummary[]> {
    const response = await this.listUserScans(1, limit)
    return response.data
  }

  async getFailedScans(): Promise<ScanSummary[]> {
    const response = await this.listUserScans(1, 100)
    return response.data.filter(scan => scan.status === 'failed')
  }

  async getCriticalIssues(limit: number = 20): Promise<Issue[]> {
    const response = await this.listUserScans(1, 10)
    const criticalIssues: Issue[] = []
    
    for (const scanSummary of response.data) {
      try {
        const scan = await this.getScanDetails(scanSummary.scan_id)
        const critical = scan.issues.filter(issue => issue.severity === 'critical')
        criticalIssues.push(...critical)
        
        if (criticalIssues.length >= limit) {
          break
        }
      } catch (error) {
        console.warn(`Failed to fetch details for scan ${scanSummary.scan_id}:`, error)
      }
    }
    
    return criticalIssues.slice(0, limit)
  }
}

// Helper function to format autofix job duration
export function formatAutofixDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

// Helper function to get autofix status color
export function getAutofixStatusColor(status: AutofixJobStatus['status'], theme: 'light' | 'dark'): string {
  const colors = {
    queued: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    processing: theme === 'dark' ? 'text-amber-400' : 'text-amber-600', 
    completed: theme === 'dark' ? 'text-green-400' : 'text-green-600',
    failed: theme === 'dark' ? 'text-red-400' : 'text-red-600',
    cancelled: theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  }
  return colors[status] || colors.queued
}

// Export singleton instance
export const scansAPI = new ScansAPI()
export default scansAPI