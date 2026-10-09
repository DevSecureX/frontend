// Core user interface matching backend response
export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  mobile_no?: string
  is_premium: boolean
  premium_expiry?: string
  is_github_connected?: boolean
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Security and scan types
export type SecuritySeverity = 
  // Generic severities
  | 'critical' | 'high' | 'medium' | 'low' | 'info'
  // Semgrep severities
  | 'ERROR' | 'WARNING' | 'INFO'
  // Bandit severities  
  | 'HIGH' | 'MEDIUM' | 'LOW'
  // ESLint severities
  | 'error' | 'warn' | 'off'
  // Other tool severities
  | 'High' | 'Medium' | 'Weak' | 'style' | 'performance' | 'portability' | 'Hidden' | 'CRITICAL' | 'UNKNOWN'
export type ScanStatus = 'queued' | 'processing' | 'completed' | 'failed'
export type ScanMode = 'fast' | 'comprehensive'
export type ScanScope = 'code-only' | 'code+deps' | 'full'

// Repository interface matching backend
export interface Repository {
  id: number
  full_name: string
  niche: string
  settings: Record<string, unknown>
  webhook_id?: string
  default_branch?: string
  is_private?: string
  language?: string
  description?: string
  status: string
  created_at: string
  updated_at: string
  last_synced?: string
}

// Security issue interface
export interface SecurityIssue {
  id?: string
  message: string
  line_start?: number
  line_end?: number
  severity: SecuritySeverity
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

// Comprehensive scan interface
export interface Scan {
  scan_id: string
  repo_full_name?: string
  status: ScanStatus
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
  issues: SecurityIssue[]
  branch: string
  mode: ScanMode
  scope: ScanScope
  scan_type: string
  metadata: {
    scan_duration?: number
    tools_used?: string[]
    commit_sha?: string
    pr_number?: number
    sbom?: unknown
  }
  created_at: string
}

// Scan summary for list views
export interface ScanSummary {
  scan_id: string
  repo_full_name: string
  branch: string
  total_score: number
  status: ScanStatus
  scan_type: string
  issue_summary: Record<string, number>
  created_at: string
  scan_duration?: number
}

// Pull request interface
export interface PullRequest {
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

// Job status for tracking scans
export interface JobStatus {
  job_id: string
  status: ScanStatus
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

// Auth token and session data
export interface AuthToken {
  access_token: string
  token_type: string
  member_details: User
}

// Notification interface
export interface Notification {
  id: string
  type: 'scan_complete' | 'security_alert' | 'system' | 'billing'
  title: string
  message: string
  severity: SecuritySeverity
  read: boolean
  data?: Record<string, unknown>
  created_at: string
}

// Dashboard stats
export interface DashboardStats {
  total_repositories: number
  active_scans: number
  security_score: number
  issues_found: number
  issues_fixed: number
  critical_issues: number
  recent_scans: ScanSummary[]
  top_vulnerabilities: Array<{
    category: string
    count: number
    severity: SecuritySeverity
  }>
}