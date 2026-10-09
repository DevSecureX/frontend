import { apiClient } from './client'

// Admin types
export interface SystemHealth {
  status: string
  database: boolean
  services: Record<string, boolean>
  jwt_expire_minutes: number
  app_env: string
}

export interface WorkerStatus {
  environment: Record<string, string>
  workers: {
    active_workers: number
    total_capacity: number
    queue_size: number
    processed_today: number
    failed_today: number
    average_processing_time: number
    worker_details: Array<{
      id: string
      status: 'active' | 'idle' | 'error'
      current_job?: string
      last_activity: string
    }>
  }
  timestamp: string
}

export interface IntegrityCheck {
  status: string
  integrity_issues: Array<{
    type: string
    count: number
    description: string
    sample_ids: any[]
  }>
  total_issues: number
  database_stats: {
    total_users: number
    total_repos: number
    total_scans: number
    total_summaries: number
    total_blacklisted_tokens: number
    total_scan_jobs: number
  }
  checked_at: string
  message: string
}

export interface CleanupResult {
  message: string
  login_attempts_removed: number
  blacklisted_tokens_removed?: number
  orphaned_records_removed?: number
}

export interface UserManagement {
  user_id: number
  username: string
  email: string
  is_premium: boolean
  repositories_count: number
  scans_count: number
  last_activity: string
  account_status: 'active' | 'suspended' | 'pending'
}

export interface SystemMetrics {
  uptime: number
  memory_usage: {
    used: number
    total: number
    percentage: number
  }
  disk_usage: {
    used: number
    total: number
    percentage: number
  }
  api_metrics: {
    requests_per_minute: number
    average_response_time: number
    error_rate: number
  }
  database_metrics: {
    active_connections: number
    total_queries_today: number
    slow_queries: number
  }
  scan_metrics: {
    scans_today: number
    average_scan_time: number
    queue_length: number
    worker_utilization: number
  }
}

// Admin API class
export class AdminAPI {
  // System health and monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    return apiClient.get('/auth/health')
  }

  async getWorkersStatus(): Promise<WorkerStatus> {
    return apiClient.get('/scans/workers/status')
  }

  async getDatabaseIntegrity(): Promise<IntegrityCheck> {
    return apiClient.get('/auth/admin/integrity-check')
  }

  async performCleanup(): Promise<CleanupResult> {
    return apiClient.post('/auth/admin/cleanup')
  }

  // System metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    return apiClient.get('/admin/system/metrics')
  }

  async getApiMetrics(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<{
    total_requests: number
    successful_requests: number
    failed_requests: number
    average_response_time: number
    endpoints_usage: Record<string, number>
    error_breakdown: Record<string, number>
    request_timeline: Array<{
      timestamp: string
      requests: number
      errors: number
      avg_response_time: number
    }>
  }> {
    return apiClient.get('/admin/api/metrics', {
      params: { time_range: timeRange }
    })
  }

  // User management
  async listUsers(
    page: number = 1,
    limit: number = 50,
    search?: string,
    status?: 'active' | 'suspended' | 'pending'
  ): Promise<{
    users: UserManagement[]
    total: number
    page: number
    limit: number
    total_pages: number
  }> {
    const params: any = { page, limit }
    if (search) params.search = search
    if (status) params.status = status
    
    return apiClient.get('/admin/users', { params })
  }

  async getUserDetails(userId: number): Promise<{
    user: UserManagement
    repositories: Array<{
      full_name: string
      created_at: string
      last_scan: string
      status: string
    }>
    recent_scans: Array<{
      scan_id: string
      repo_name: string
      status: string
      created_at: string
      issues_count: number
    }>
    activity_log: Array<{
      action: string
      timestamp: string
      details: string
    }>
  }> {
    return apiClient.get(`/admin/users/${userId}`)
  }

  async suspendUser(userId: number, reason: string): Promise<{
    message: string
    user_id: number
    status: string
  }> {
    return apiClient.post(`/admin/users/${userId}/suspend`, { reason })
  }

  async activateUser(userId: number): Promise<{
    message: string
    user_id: number
    status: string
  }> {
    return apiClient.post(`/admin/users/${userId}/activate`)
  }

  // Queue management
  async getQueueStats(): Promise<{
    queued: number
    processing: number
    failed: number
    completed_today: number
    average_processing_time: number
    queue_health: 'healthy' | 'warning' | 'critical'
  }> {
    return apiClient.get('/admin/queue/stats')
  }

  async pauseQueue(): Promise<{ message: string; status: string }> {
    return apiClient.post('/admin/queue/pause')
  }

  async resumeQueue(): Promise<{ message: string; status: string }> {
    return apiClient.post('/admin/queue/resume')
  }

  async clearFailedJobs(): Promise<{ message: string; cleared_jobs: number }> {
    return apiClient.post('/admin/queue/clear-failed')
  }

  async retryFailedJobs(maxRetries: number = 10): Promise<{
    message: string
    retried_jobs: number
  }> {
    return apiClient.post('/admin/queue/retry-failed', {
      max_retries: maxRetries
    })
  }

  // Security monitoring
  async getSecurityAlerts(): Promise<Array<{
    id: string
    type: 'rate_limit' | 'suspicious_activity' | 'failed_auth' | 'system_error'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    details: Record<string, any>
    created_at: string
    resolved: boolean
  }>> {
    return apiClient.get('/admin/security/alerts')
  }

  async resolveSecurityAlert(alertId: string): Promise<{
    message: string
    alert_id: string
  }> {
    return apiClient.post(`/admin/security/alerts/${alertId}/resolve`)
  }

  async getFailedLoginAttempts(
    timeRange: 'hour' | 'day' | 'week' = 'day'
  ): Promise<Array<{
    ip_address: string
    username: string
    attempts: number
    last_attempt: string
    blocked: boolean
  }>> {
    return apiClient.get('/admin/security/failed-logins', {
      params: { time_range: timeRange }
    })
  }

  // System configuration
  async getSystemConfig(): Promise<{
    app_env: string
    rate_limits: Record<string, number>
    feature_flags: Record<string, boolean>
    maintenance_mode: boolean
    version: string
  }> {
    return apiClient.get('/admin/system/config')
  }

  async updateSystemConfig(config: {
    rate_limits?: Record<string, number>
    feature_flags?: Record<string, boolean>
    maintenance_mode?: boolean
  }): Promise<{ message: string; updated_config: any }> {
    return apiClient.put('/admin/system/config', config)
  }

  async enableMaintenanceMode(): Promise<{ message: string }> {
    return apiClient.post('/admin/system/maintenance/enable')
  }

  async disableMaintenanceMode(): Promise<{ message: string }> {
    return apiClient.post('/admin/system/maintenance/disable')
  }

  // Backup and restore
  async createBackup(): Promise<{
    backup_id: string
    message: string
    file_path: string
    size: number
  }> {
    return apiClient.post('/admin/backup/create')
  }

  async listBackups(): Promise<Array<{
    backup_id: string
    created_at: string
    size: number
    status: 'completed' | 'failed' | 'in_progress'
    file_path: string
  }>> {
    return apiClient.get('/admin/backup/list')
  }

  async downloadBackup(backupId: string): Promise<Blob> {
    const response = await apiClient.get(`/admin/backup/${backupId}/download`, {
      responseType: 'blob'
    })
    return response as Blob
  }

  async deleteBackup(backupId: string): Promise<{ message: string }> {
    return apiClient.delete(`/admin/backup/${backupId}`)
  }
}

// Export singleton instance
export const adminAPI = new AdminAPI()
export default adminAPI