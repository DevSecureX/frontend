import type { SecuritySeverity } from './global'

// Core rule types - All actually supported tools (verified against scanner engine)
export type SupportedTool = 
  | 'semgrep' 
  | 'bandit' 
  | 'eslint-security' 
  | 'safety' 
  | 'checkov' 
  | 'gosec' 
  | 'psalm'
  | 'cppcheck'
  | 'roslynator'
  | 'spotbugs'
  | 'brakeman'
  | 'trivy'
  | 'gitleaks'

export type RuleLanguage = 
  | 'python' 
  | 'javascript' 
  | 'typescript' 
  | 'java' 
  | 'go' 
  | 'php' 
  | 'yaml' 
  | 'dockerfile' 
  | 'terraform'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'ruby'
  | 'scala'
  | 'kotlin'
  | 'rust'
  | 'swift'
  | 'rego'
  | 'any'

// Custom rule interface matching enhanced backend
export interface CustomRule {
  id: string
  rule_name: string
  tool: SupportedTool
  language?: RuleLanguage
  pattern: string
  description?: string
  severity: SecuritySeverity
  author_id: number
  author_username?: string
  is_public: boolean
  upvotes: number
  downvotes: number
  usage_count: number
  created_at: string
  updated_at: string
  is_verified?: boolean
  
  // Enhanced fields from backend
  tags?: string[]
  owasp_categories?: string[]
  cwe_mappings?: string[]
  complexity_score?: number
  effectiveness_score?: number
  false_positive_rate?: number
  performance_impact?: 'low' | 'medium' | 'high'
  is_deprecated?: boolean
  parent_rule_id?: string
  version?: string
  
  // Template system fields
  is_template?: boolean
  template_category?: string
  complexity?: 'basic' | 'intermediate' | 'advanced'
  example_usage?: string
  pattern_template?: string
  template_source?: 'official' | 'community'
  is_curated?: boolean
  use_case?: string
  placeholders?: Array<{
    key: string
    description: string
    type: string
    required: boolean
    default_value?: unknown
  }>
  
  // Derived/computed fields (calculated from upvotes/downvotes)
  net_votes: number
  is_voted?: boolean
  vote_type?: 'up' | 'down' | null
  is_own_rule?: boolean
  can_edit?: boolean
  can_delete?: boolean
  recommendation_score?: number
}

// Rule creation/update request
// Request interface matching backend CustomRuleCreateRequest exactly
export interface RuleRequest {
  rule_name: string
  tool: SupportedTool
  language?: RuleLanguage
  pattern: string
  message?: string // Backend expects 'message' field, not 'description'
  severity: SecuritySeverity
  is_public: boolean
  // Note: tags are handled separately if needed
}

// Rule validation interface
export interface RuleValidationResult {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  suggestions?: string[]
  complexity_score?: number
  validation_timestamp?: string
}

// Enhanced rule testing interface
export interface RuleTestRequest {
  rule_pattern: string
  tool: SupportedTool
  language?: RuleLanguage
  test_code: string
  // Additional testing options
  timeout_seconds?: number
  include_performance_metrics?: boolean
  test_environment?: 'sandbox' | 'isolated' | 'standard'
  custom_config?: Record<string, unknown>
}

export interface RuleTestResult {
  success: boolean
  matches: Array<{
    message: string
    line_start?: number
    line_end?: number
    severity: SecuritySeverity
    file_path?: string
    rule_id?: string
  }>
  errors?: string[]
  warnings?: string[]
  execution_time_ms: number
}

// Voting interface
export interface VoteRequest {
  vote_type: 'up' | 'down'
}

export interface VoteResponse {
  success: boolean
  new_vote_count: number
  user_vote: 'up' | 'down' | null
  message: string
  upvotes?: number
  downvotes?: number
  net_votes?: number
  rule_id?: string
  vote_type?: 'up' | 'down'
}

// Enhanced supported tools information
export interface SupportedToolInfo {
  tool: SupportedTool
  name: string
  supported_languages: RuleLanguage[]
  rule_format: string
  
  // Enhanced tool capabilities
  supports_custom: boolean
  severity_levels: string[]
  max_pattern_length: number
  sandbox_supported: boolean
  note?: string
  
  // Optional fields
  description?: string
  documentation_url?: string
  
  examples: Array<{
    name: string
    description: string
    pattern: string
    language?: RuleLanguage
    use_case?: string
    vulnerable_code?: string
    fixed_code?: string
  }>
  
  // Tool-specific metadata
  version?: string
  install_command?: string
  config_file?: string
  default_extensions?: string[]
}

// Enhanced rule statistics and analytics
export interface RuleStats {
  total_rules: number
  my_rules: number
  public_rules: number
  private_rules: number
  total_usage: number
  total_upvotes: number
  total_effectiveness_score: number
  avg_complexity_score: number
  
  most_used_tools: Array<{
    tool: SupportedTool
    count: number
    avg_effectiveness?: number
    total_usage?: number
  }>
  
  language_breakdown: Array<{
    language: RuleLanguage
    count: number
    avg_effectiveness?: number
  }>
  
  severity_distribution: Array<{
    severity: SecuritySeverity
    count: number
    percentage: number
  }>
  
  recent_activity: Array<{
    type: 'created' | 'updated' | 'voted' | 'used' | 'tested' | 'shared'
    rule_id: string
    rule_name: string
    timestamp: string
    details?: unknown
  }>
  
  performance_metrics: {
    avg_execution_time_ms: number
    total_tests_run: number
    success_rate: number
  }
}

// Enhanced community features
export interface CommunityMetrics {
  total_community_rules: number
  total_contributors: number
  total_votes_cast: number
  avg_rules_per_contributor: number
  average_rule_rating: number
  
  top_contributors: Array<{
    user_id: number
    username: string
    rule_count: number
    total_upvotes: number
    total_downvotes: number
    avg_rating: number
    effectiveness_rating: number
    contribution_score: number
    joined_date?: string
    rules_created: number
    votes_received: number
  }>
  
  trending_rules: CustomRule[]
  most_used_rules: CustomRule[]
  newest_rules: CustomRule[]
  top_rated_rules: CustomRule[]
  most_effective_rules: CustomRule[]
  
  tool_popularity: Array<{
    tool: SupportedTool
    rule_count: number
    usage_count: number
    avg_effectiveness: number
    trend: 'up' | 'down' | 'stable'
  }>
  
  language_popularity: Array<{
    language: RuleLanguage
    rule_count: number
    usage_count: number
    trend: 'up' | 'down' | 'stable'
  }>
  
  category_breakdown: Array<{
    category: string
    count: number
    percentage: number
  }>
  
  // Additional properties for visualization
  activity_trends?: Array<{
    date: string
    rules_created: number
    votes_cast: number
    comments_made: number
    active_users: number
  }>
  
  category_distribution?: Record<string, number>
  
  growth_metrics?: {
    weekly_growth: number
    monthly_growth: number
    active_contributors: number
  }
}

// Search and filtering
export interface RuleFilters {
  tool?: SupportedTool
  language?: RuleLanguage
  severity?: SecuritySeverity
  author?: string
  is_public?: boolean
  min_votes?: number
  search_query?: string
  sort_by?: 'created_at' | 'updated_at' | 'upvotes' | 'usage_count' | 'name'
  sort_order?: 'asc' | 'desc'
  tags?: string[]
}

// Paginated responses - matches backend API structure with enhanced pagination
export interface PaginatedRulesResponse {
  rules: CustomRule[]
  total: number
  skip: number
  limit: number
  filters_applied?: RuleFilters
  
  // New optional pagination fields from backend enhancements
  page?: number           // Current page number
  page_size?: number      // Items per page
  total_pages?: number    // Total number of pages
  has_next?: boolean      // Whether there are more pages
  has_previous?: boolean  // Whether there are previous pages
}

// Enhanced rule validation
export interface EnhancedRuleValidationResult {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  
  // Enhanced validation metrics
  complexity_score?: number
  estimated_performance_impact?: 'low' | 'medium' | 'high'
  pattern_quality_score?: number
  false_positive_likelihood?: 'low' | 'medium' | 'high'
  security_coverage?: string[]
  
  // Tool-specific validation
  tool_specific_info?: {
    syntax_valid: boolean
    semantic_valid: boolean
    best_practices: string[]
    optimization_suggestions: string[]
  }
  
  // Compatibility checks
  language_compatibility?: Array<{
    language: RuleLanguage
    compatible: boolean
    confidence: number
  }>
  
  validation_timestamp: string
}

// Rule templates
export interface RuleTemplate {
  id: string
  name: string
  description: string
  tool: SupportedTool
  language?: RuleLanguage
  category: string
  pattern: string
  severity: SecuritySeverity
  use_case: string
  examples: Array<{
    name: string
    vulnerable_code: string
    fixed_code?: string
  }>
  
  // Enhanced template fields to match backend
  complexity: 'basic' | 'intermediate' | 'advanced'
  example_usage: string
  pattern_template: string
  template_source: 'official' | 'community'
  is_curated: boolean
  placeholders?: Array<{
    key: string
    description: string
    type: string
    required: boolean
    default_value?: unknown
  }>
  upvotes?: number
  usage_count?: number
  created_at?: string
  author_id?: number
  author_username?: string
}

// Enhanced rule categories for organization
export interface RuleCategory {
  id: string
  name: string
  description: string
  icon?: string
  color?: string
  
  // Enhanced category info
  rule_count?: number
  popularity_score?: number
  avg_effectiveness?: number
  parent_category_id?: string
  subcategories?: RuleCategory[]
  
  // OWASP/Security framework mappings
  owasp_mappings?: string[]
  cwe_mappings?: string[]
  nist_mappings?: string[]
  
  // Category metadata
  created_at?: string
  updated_at?: string
  created_by?: string
  is_system_category?: boolean
}

// Enhanced bulk operations
export interface BulkRuleOperation {
  rule_ids: string[]
  operation: 'delete' | 'make_public' | 'make_private' | 'update_tags' | 'update_category' | 'deprecate' | 'archive' | 'clone' | 'export'
  data?: {
    tags?: string[]
    category_id?: string
    new_severity?: SecuritySeverity
    deprecation_reason?: string
    target_tool?: SupportedTool
    export_format?: string
    [key: string]: unknown
  }
  
  // Operation options
  confirm_destructive?: boolean
  skip_validation?: boolean
  backup_before_operation?: boolean
}

export interface BulkOperationResult {
  success: boolean
  total_requested: number
  processed: number
  skipped: number
  failed: number
  
  results: Array<{
    rule_id: string
    rule_name: string
    status: 'success' | 'failed' | 'skipped'
    error?: string
    warning?: string
  }>
  
  summary: {
    operation_type: string
    execution_time_ms: number
    rollback_available: boolean
    rollback_id?: string
  }
  
  // Export-specific results
  download_url?: string
  file_size?: number
  export_filename?: string
}

// Rule usage in scans
export interface RuleUsageMetric {
  rule_id: string
  rule_name: string
  scan_count: number
  issue_count: number
  last_used: string
  avg_issues_per_scan: number
  effectiveness_rating: number
}

// Enhanced Import/Export
export interface RuleExportFormat {
  format: 'yaml' | 'json' | 'csv' | 'zip' | 'excel'
  include_private: boolean
  include_stats: boolean
  include_metadata: boolean
  include_test_cases: boolean
  rule_ids?: string[]
  
  // Export filters
  tools?: SupportedTool[]
  languages?: RuleLanguage[]
  severities?: SecuritySeverity[]
  date_range?: {
    from: string
    to: string
  }
  min_effectiveness?: number
  only_public?: boolean
}

export interface RuleImportResult {
  success: boolean
  imported: number
  updated: number
  skipped: number
  failed: number
  
  errors: Array<{
    rule_name?: string
    error: string
    line?: number
    severity: 'error' | 'warning'
  }>
  
  imported_rules: Array<{
    id: string
    name: string
    tool: SupportedTool
    status: 'created' | 'updated' | 'skipped'
  }>
  
  validation_report: {
    total_validated: number
    passed_validation: number
    failed_validation: number
    warnings_count: number
  }
}

// Advanced search interface
export interface AdvancedSearchOptions {
  query?: string
  tools?: SupportedTool[]
  languages?: RuleLanguage[]
  severities?: SecuritySeverity[]
  authors?: string[]
  minVotes?: number
  maxVotes?: number
  tags?: string[]
  categories?: string[]
  owasp_categories?: string[]
  cwe_mappings?: string[]
  effectiveness_range?: {
    min: number
    max: number
  }
  complexity_range?: {
    min: number
    max: number
  }
  date_range?: {
    from: string
    to: string
  }
  only_public?: boolean
  include_deprecated?: boolean
  sort_by?: 'relevance' | 'created_at' | 'updated_at' | 'upvotes' | 'usage_count' | 'effectiveness' | 'name'
  sort_order?: 'asc' | 'desc'
}

// Rule recommendation interface
export interface RuleRecommendation {
  rule: CustomRule
  recommendation_score: number
  reason: string
  similarity_score?: number
  effectiveness_match?: number
  language_compatibility?: number
  use_case_relevance?: number
  community_endorsement?: number
}

// Batch testing interface
export interface BatchTestRequest {
  rules: Array<{
    rule_id?: string
    pattern: string
    tool: SupportedTool
    language?: RuleLanguage
    name?: string
  }>
  test_code: string
  test_environment?: 'sandbox' | 'isolated' | 'standard'
  timeout_seconds?: number
}

export interface BatchTestResult {
  success: boolean
  total_rules: number
  completed_tests: number
  failed_tests: number
  execution_time_ms: number
  
  results: Array<{
    rule_id?: string
    rule_name?: string
    index: number
    result: RuleTestResult
    status: 'success' | 'failed' | 'timeout'
  }>
  
  summary: {
    total_matches: number
    avg_execution_time: number
    most_effective_rule?: {
      rule_id?: string
      rule_name?: string
      match_count: number
    }
  }
}

// Rule collaboration interfaces
export interface RuleCollaboration {
  rule_id: string
  shared_with: Array<{
    user_id: number
    username: string
    permission: 'view' | 'edit' | 'admin'
    shared_at: string
  }>
  public_forks: number
  clone_count: number
  contribution_history: Array<{
    user_id: number
    username: string
    action: 'created' | 'updated' | 'forked' | 'shared'
    timestamp: string
    details?: unknown
  }>
}

export interface RuleFork {
  original_rule_id: string
  original_rule_name: string
  original_author: string
  fork_reason?: string
  changes_description?: string
  improvement_areas?: string[]
}

// Rule performance analytics
export interface RulePerformanceAnalytics {
  rule_id: string
  rule_name: string
  
  // Performance metrics
  avg_execution_time_ms: number
  memory_usage_mb: number
  cpu_usage_percent: number
  
  // Accuracy metrics
  true_positives: number
  false_positives: number
  false_negatives: number
  precision: number
  recall: number
  f1_score: number
  
  // Usage analytics
  total_scans: number
  unique_repositories: number
  total_findings: number
  critical_findings: number
  
  // Temporal data
  performance_history: Array<{
    date: string
    execution_time_ms: number
    findings_count: number
    scan_count: number
  }>
  
  // Comparative analysis
  tool_comparison: Array<{
    tool: SupportedTool
    avg_execution_time: number
    findings_quality_score: number
    user_satisfaction: number
  }>
}

// Tool-specific configuration interface
export interface ToolSpecificConfig {
  tool: SupportedTool
  config: {
    // Common configurations
    timeout_seconds?: number
    max_memory_mb?: number
    parallel_jobs?: number
    
    // Tool-specific settings
    [key: string]: unknown
  }
  
  // Tool capabilities
  capabilities: {
    supports_incremental_scan: boolean
    supports_custom_rules: boolean
    supports_sarif_output: boolean
    supports_json_output: boolean
    supports_xml_output: boolean
    max_file_size_mb: number
    supported_file_extensions: string[]
  }
}

// Rule generation template
export interface RuleGenerationTemplate {
  id: string
  name: string
  description: string
  tool: SupportedTool
  language?: RuleLanguage
  
  // Template structure
  template_pattern: string
  placeholders: Array<{
    key: string
    description: string
    type: 'string' | 'number' | 'boolean' | 'array'
    required: boolean
    default_value?: unknown
    validation_regex?: string
  }>
  
  // Generation options
  complexity_level: 'basic' | 'intermediate' | 'advanced'
  use_cases: string[]
  security_categories: string[]
  
  // Examples and documentation
  example_usage: string
  documentation_url?: string
  created_by: string
  created_at: string
}