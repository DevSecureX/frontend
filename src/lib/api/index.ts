// Centralized API exports
export { apiClient, type ApiResponse, type PaginatedResponse, ApiError, NetworkError, ValidationError } from './client'
export { authAPI, type LoginRequest, type LoginResponse, type SignupRequest } from './auth'
export { repositoryAPI, type Repository, type ConnectRepoRequest } from './repositories'
export { scansAPI, type Scan, type ScanRequest, type Issue, type ScanSummary } from './scans'
export { analyticsAPI, type ScanAnalytics, type SecurityMetrics } from './analytics'
export { adminAPI, type SystemHealth, type WorkerStatus, type IntegrityCheck } from './admin'
export { dashboardAPI, type DashboardCounts } from './dashboard'
export { issuesAPI, type TrackedIssue, type IssueCountsResponse, type ResolutionStats, type IssueStatus } from './issues'
export { aiAssistantAPI, type ChatSession, type ChatMessage, type CreateSessionRequest } from './ai-assistant'
export { rulesAPI } from './rules'
export { supportAPI, type SupportQuery, type SupportResponse, type SupportQueryCreate } from './support'

// Re-export all API instances for convenience
import { authAPI } from './auth'
import { repositoryAPI } from './repositories'
import { scansAPI } from './scans'
import { analyticsAPI } from './analytics'
import { adminAPI } from './admin'
import { dashboardAPI } from './dashboard'
import { issuesAPI } from './issues'
import { aiAssistantAPI } from './ai-assistant'
import { rulesAPI } from './rules'
import { supportAPI } from './support'

export const api = {
  auth: authAPI,
  repositories: repositoryAPI,
  scans: scansAPI,
  analytics: analyticsAPI,
  admin: adminAPI,
  dashboard: dashboardAPI,
  issues: issuesAPI,
  aiAssistant: aiAssistantAPI,
  rules: rulesAPI,
  support: supportAPI,
}

export default api