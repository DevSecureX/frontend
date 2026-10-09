import { apiClient } from './client'
import type {
  CustomRule,
  RuleRequest,
  RuleTestRequest,
  RuleTestResult,
  VoteRequest,
  VoteResponse,
  SupportedToolInfo,
  RuleStats,
  CommunityMetrics,
  RuleFilters,
  PaginatedRulesResponse,
  RuleValidationResult,
  RuleTemplate,
  RuleCategory,
  BulkRuleOperation,
  BulkOperationResult,
  RuleUsageMetric,
  RuleExportFormat,
  RuleImportResult,
  SupportedTool,
  RuleLanguage,
  AdvancedSearchOptions,
  RuleRecommendation,
  BatchTestRequest,
  BatchTestResult,
  RuleCollaboration,
  RuleFork,
  RulePerformanceAnalytics,
  ToolSpecificConfig,
  RuleGenerationTemplate
} from '@/types/rules'

// Performance tracking utilities
interface PerformanceMetrics {
  loadTime: number
  fromCache: boolean
  rateLimitRemaining?: number
  rateLimitReset?: number
}

// Track performance for API calls
function trackApiCall<T>(apiCall: () => Promise<T>): Promise<{ data: T; metrics: PerformanceMetrics }> {
  const startTime = performance.now()
  
  return apiCall().then(data => {
    const loadTime = Math.round(performance.now() - startTime)
    
    // Check if response has cache indicators (would be set by apiClient interceptor)
    const fromCache = (window as any).__lastResponseFromCache || false
    const rateLimitRemaining = (window as any).__lastRateLimitRemaining
    const rateLimitReset = (window as any).__lastRateLimitReset
    
    // Store rate limit info for RateLimitIndicator
    if (rateLimitRemaining !== undefined) {
      window.localStorage.setItem('rateLimit_custom_rules', JSON.stringify({
        remaining: rateLimitRemaining,
        limit: (window as any).__lastRateLimitTotal || 100,
        reset: rateLimitReset || 0
      }))
    }
    
    return {
      data,
      metrics: {
        loadTime,
        fromCache,
        rateLimitRemaining,
        rateLimitReset
      }
    }
  })
}

// Custom Rules API class
export class RulesAPI {
  // Store last performance metrics
  public lastPerformanceMetrics: PerformanceMetrics | null = null
  // Transform backend rule response to frontend CustomRule format
  private transformRuleData(backendRule: any): CustomRule {
    return {
      id: backendRule.id,
      rule_name: backendRule.rule_name,
      tool: backendRule.tool,
      language: backendRule.language,
      pattern: backendRule.pattern,
      description: backendRule.description,
      severity: backendRule.severity,
      author_id: backendRule.author_id,
      author_username: backendRule.author_username,
      is_public: backendRule.is_public,
      upvotes: backendRule.upvotes || 0,
      downvotes: backendRule.downvotes || 0,
      usage_count: backendRule.usage_count || 0,
      created_at: backendRule.created_at,
      updated_at: backendRule.updated_at,
      
      // Calculate net_votes from upvotes and downvotes
      net_votes: (backendRule.upvotes || 0) - (backendRule.downvotes || 0),
      
      // Add computed fields
      is_voted: backendRule.is_voted || false,
      vote_type: backendRule.vote_type,
      is_own_rule: backendRule.is_own_rule || false,
      can_edit: backendRule.can_edit || backendRule.is_own_rule || false,
      can_delete: backendRule.can_delete || backendRule.is_own_rule || false,
      
      // Enhanced fields (with defaults)
      tags: backendRule.tags || [],
      owasp_categories: backendRule.owasp_categories || [],
      cwe_mappings: backendRule.cwe_mappings || [],
      complexity_score: backendRule.complexity_score,
      effectiveness_score: backendRule.effectiveness_score,
      false_positive_rate: backendRule.false_positive_rate,
      performance_impact: backendRule.performance_impact,
      is_deprecated: backendRule.is_deprecated || false,
      parent_rule_id: backendRule.parent_rule_id,
      version: backendRule.version,
      recommendation_score: backendRule.recommendation_score
    }
  }

  // Transform array of backend rules
  private transformRulesResponse(response: any[]): CustomRule[] {
    if (!Array.isArray(response)) {
      return []
    }
    return response.map(rule => this.transformRuleData(rule))
  }

  // Transform paginated rules response - handles both old and new formats
  private transformPaginatedResponse(response: any): PaginatedRulesResponse {
    return {
      rules: this.transformRulesResponse(response.rules || []),
      total: response.total || 0,
      skip: response.skip || 0,
      limit: response.limit || 20,
      filters_applied: response.filters_applied,
      
      // Include new pagination fields if present
      page: response.page,
      page_size: response.page_size,
      total_pages: response.total_pages,
      has_next: response.has_next,
      has_previous: response.has_previous
    }
  }
  // Rule CRUD operations
  async createRule(ruleData: RuleRequest): Promise<CustomRule> {
    const response = await apiClient.post('/rules/', ruleData)
    return this.transformRuleData(response)
  }

  async getMyRules(
    page: number = 1,
    limit: number = 20,
    filters?: Partial<RuleFilters>
  ): Promise<PaginatedRulesResponse> {
    const skip = (page - 1) * limit
    const params: Record<string, any> = { skip, limit }
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value
        }
      })
    }
    
    const response = await apiClient.get('/rules/my-rules', { params })
    return this.transformPaginatedResponse(response)
  }

  async getCommunityRules(
    page: number = 1,
    limit: number = 20,
    filters?: Partial<RuleFilters>
  ): Promise<PaginatedRulesResponse> {
    const skip = (page - 1) * limit
    const params: Record<string, any> = { skip, limit }
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'tags' && Array.isArray(value)) {
            params[key] = value.join(',')
          } else {
            params[key] = value
          }
        }
      })
    }
    
    const response = await apiClient.get('/rules/community', { params })
    return this.transformPaginatedResponse(response)
  }

  async getRuleDetails(ruleId: string): Promise<CustomRule> {
    const response = await apiClient.get(`/rules/${ruleId}`)
    return this.transformRuleData(response)
  }

  async updateRule(ruleId: string, ruleData: Partial<RuleRequest>): Promise<CustomRule> {
    const response = await apiClient.put(`/rules/${ruleId}`, ruleData)
    return this.transformRuleData(response)
  }

  async deleteRule(ruleId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/rules/${ruleId}`)
  }

  // Rule testing
  async testRule(testData: RuleTestRequest): Promise<RuleTestResult> {
    return apiClient.post('/rules/test', testData)
  }

  async validateRule(
    ruleData: {
      pattern: string
      tool: SupportedTool
      language?: RuleLanguage
      rule_name?: string
      message?: string
      severity?: string
    }
  ): Promise<RuleValidationResult> {
    return apiClient.post('/rules/validate', ruleData)
  }

  // Community features
  async voteOnRule(ruleId: string, voteData: VoteRequest): Promise<VoteResponse> {
    const response = await apiClient.post(`/rules/${ruleId}/vote`, voteData)
    
    // Transform backend vote response to match expected frontend format
    return {
      success: response.success || true,
      new_vote_count: response.new_vote_count || response.net_votes || 0,
      user_vote: response.user_vote || response.vote_type,
      message: response.message || `Successfully ${voteData.vote_type}voted on rule`
    }
  }

  async removeVote(ruleId: string): Promise<VoteResponse> {
    const response = await apiClient.delete(`/rules/${ruleId}/vote`)
    
    // Transform backend vote response to match expected frontend format
    return {
      success: response.success || true,
      new_vote_count: response.new_vote_count || response.net_votes || 0,
      user_vote: null,
      message: response.message || "Successfully removed vote from rule"
    }
  }

  // Tool information
  async getSupportedTools(): Promise<SupportedToolInfo[]> {
    const response = await apiClient.get('/rules/tools/supported')
    return response.tools || []
  }

  async getToolInfo(tool: SupportedTool): Promise<SupportedToolInfo> {
    return apiClient.get(`/rules/tools/${tool}`)
  }

  // Analytics and statistics
  async getRuleStats(): Promise<RuleStats> {
    return apiClient.get('/rules/stats')
  }

  async getCommunityMetrics(): Promise<CommunityMetrics> {
    return apiClient.get('/rules/community/metrics')
  }

  async getRuleUsageMetrics(
    ruleId?: string,
    timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<RuleUsageMetric[]> {
    const params: any = { time_range: timeRange }
    if (ruleId) params.rule_id = ruleId
    
    return apiClient.get('/rules/usage-metrics', { params })
  }

  // Rule templates and examples
  async getRuleTemplates(
    tool?: SupportedTool,
    language?: RuleLanguage,
    category?: string
  ): Promise<RuleTemplate[]> {
    const params: any = {}
    if (tool) params.tool = tool
    if (language) params.language = language
    if (category) params.category = category
    
    return apiClient.get('/rules/templates', { params })
  }

  async getRuleCategories(): Promise<RuleCategory[]> {
    return apiClient.get('/rules/categories')
  }

  // Search and discovery
  async searchRules(
    query: string,
    filters?: Partial<RuleFilters>,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedRulesResponse> {
    const params: Record<string, any> = {
      search_query: query,
      page,
      limit
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'tags' && Array.isArray(value)) {
            params[key] = value.join(',')
          } else {
            params[key] = value
          }
        }
      })
    }
    
    const response = await apiClient.get('/rules/search', { params })
    return this.transformPaginatedResponse(response)
  }

  async getTrendingRules(limit: number = 10): Promise<CustomRule[]> {
    const response = await apiClient.get('/rules/trending', {
      params: { limit }
    })
    
    // Transform backend response to frontend format
    return this.transformRulesResponse(response)
  }

  async getPopularRules(limit: number = 10): Promise<CustomRule[]> {
    const response = await apiClient.get('/rules/popular', {
      params: { limit }
    })
    
    // Transform backend response to frontend format
    return this.transformRulesResponse(response)
  }

  async getNewestRules(limit: number = 10): Promise<CustomRule[]> {
    const response = await apiClient.get('/rules/newest', {
      params: { limit }
    })
    
    // Transform backend response to frontend format
    return this.transformRulesResponse(response)
  }

  // Bulk operations
  async bulkOperations(operation: BulkRuleOperation): Promise<BulkOperationResult> {
    return apiClient.post('/rules/bulk', operation)
  }

  async bulkDeleteRules(ruleIds: string[]): Promise<BulkOperationResult> {
    return this.bulkOperations({
      rule_ids: ruleIds,
      operation: 'delete'
    })
  }

  async bulkMakePublic(ruleIds: string[]): Promise<BulkOperationResult> {
    return this.bulkOperations({
      rule_ids: ruleIds,
      operation: 'make_public'
    })
  }

  async bulkMakePrivate(ruleIds: string[]): Promise<BulkOperationResult> {
    return this.bulkOperations({
      rule_ids: ruleIds,
      operation: 'make_private'
    })
  }

  // Import/Export
  async exportRules(options: RuleExportFormat): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('format', options.format)
    params.append('include_private', String(options.include_private))
    params.append('include_stats', String(options.include_stats))
    
    if (options.rule_ids && options.rule_ids.length > 0) {
      params.append('rule_ids', options.rule_ids.join(','))
    }
    
    return apiClient.getBlob('/rules/export', { params })
  }

  async importRules(file: File, overwrite: boolean = false): Promise<RuleImportResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('overwrite', String(overwrite))
    
    return apiClient.uploadFile('/rules/import', formData)
  }

  // Rule recommendations
  async getRecommendedRules(
    based_on?: 'scan_results' | 'repository' | 'user_activity',
    repository_id?: string,
    scan_id?: string,
    limit: number = 10
  ): Promise<CustomRule[]> {
    const params: any = { limit }
    if (based_on) params.based_on = based_on
    if (repository_id) params.repository_id = repository_id
    if (scan_id) params.scan_id = scan_id
    
    return apiClient.get('/rules/recommendations', { params })
  }

  // Rule sharing and collaboration

  async cloneRule(ruleId: string, newName: string): Promise<CustomRule> {
    const response = await apiClient.post(`/rules/${ruleId}/clone`, {
      rule_name: newName
    })
    return this.transformRuleData(response)
  }


  // Rule integration with scans

  async getScansUsingRule(
    ruleId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    scans: Array<{
      scan_id: string
      repo_full_name: string
      created_at: string
      issues_found: number
      total_score: number
    }>
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }> {
    return apiClient.get(`/rules/${ruleId}/scans`, {
      params: { page, limit }
    })
  }

  // Helper methods for common operations
  async getMyPublicRules(): Promise<CustomRule[]> {
    const response = await this.getMyRules(1, 100, { is_public: true })
    return response.rules
  }

  async getMyPrivateRules(): Promise<CustomRule[]> {
    const response = await this.getMyRules(1, 100, { is_public: false })
    return response.rules
  }

  async searchRulesByTool(tool: SupportedTool, limit: number = 20): Promise<CustomRule[]> {
    const response = await this.getCommunityRules(1, limit, { tool })
    return response.rules
  }

  async searchRulesByLanguage(language: RuleLanguage, limit: number = 20): Promise<CustomRule[]> {
    const response = await this.getCommunityRules(1, limit, { language })
    return response.rules
  }

  async getMostVotedRules(limit: number = 10): Promise<CustomRule[]> {
    const response = await this.getCommunityRules(1, limit, {
      sort_by: 'upvotes',
      sort_order: 'desc'
    })
    return response.rules
  }

  async getMostUsedRules(limit: number = 10): Promise<CustomRule[]> {
    const response = await this.getCommunityRules(1, limit, {
      sort_by: 'usage_count',
      sort_order: 'desc'
    })
    return response.rules
  }

  // Advanced search with multiple filters
  async advancedSearch(
    searchOptions: {
      query?: string
      tools?: SupportedTool[]
      languages?: RuleLanguage[]
      severities?: string[]
      authors?: string[]
      minVotes?: number
      tags?: string[]
      dateRange?: {
        from: string
        to: string
      }
    },
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedRulesResponse> {
    const params: any = { page, limit }
    
    if (searchOptions.query) params.search_query = searchOptions.query
    if (searchOptions.tools?.length) params.tools = searchOptions.tools.join(',')
    if (searchOptions.languages?.length) params.languages = searchOptions.languages.join(',')
    if (searchOptions.severities?.length) params.severities = searchOptions.severities.join(',')
    if (searchOptions.authors?.length) params.authors = searchOptions.authors.join(',')
    if (searchOptions.minVotes) params.min_votes = searchOptions.minVotes
    if (searchOptions.tags?.length) params.tags = searchOptions.tags.join(',')
    if (searchOptions.dateRange) {
      params.date_from = searchOptions.dateRange.from
      params.date_to = searchOptions.dateRange.to
    }
    
    const response = await apiClient.get('/rules/advanced-search', { params })
    return this.transformPaginatedResponse(response)
  }

  // Enhanced batch rule testing
  async batchTestRules(request: BatchTestRequest): Promise<BatchTestResult> {
    return apiClient.post('/rules/batch-test', request)
  }

  // Backwards compatibility - for when called with (rules, code) format
  async batchTestRulesLegacy(rules: any[], code: string): Promise<BatchTestResult> {
    const request: BatchTestRequest = {
      rules: rules.map(rule => ({
        rule_id: rule.rule_id || rule.id,
        pattern: rule.pattern,
        tool: rule.tool || 'semgrep',
        language: rule.language,
        name: rule.rule_name || rule.name
      })),
      test_code: code,
      test_environment: 'standard'
    }
    return this.batchTestRules(request)
  }

  // Advanced search functionality  
  async advancedSearchWithOptions(
    searchOptions: AdvancedSearchOptions,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedRulesResponse> {
    const params: any = { page, limit }
    
    // Add all search parameters
    Object.entries(searchOptions).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params[key] = value.join(',')
        } else if (typeof value === 'object' && value !== null) {
          // Handle range objects
          if ('min' in value && 'max' in value) {
            params[`${key}_min`] = value.min
            params[`${key}_max`] = value.max
          } else if ('from' in value && 'to' in value) {
            params[`${key}_from`] = value.from
            params[`${key}_to`] = value.to
          }
        } else {
          params[key] = value
        }
      }
    })
    
    const response = await apiClient.get('/rules/advanced-search', { params })
    return this.transformPaginatedResponse(response)
  }

  // Rule recommendations
  async getRecommendations(
    basedOn?: 'scan_results' | 'repository' | 'user_activity',
    repositoryId?: string,
    scanId?: string,
    vulnerabilityType?: string,
    language?: RuleLanguage,
    limit: number = 10
  ): Promise<RuleRecommendation[]> {
    const params: any = { limit }
    if (basedOn) params.based_on = basedOn
    if (repositoryId) params.repository_id = repositoryId
    if (scanId) params.scan_id = scanId
    if (vulnerabilityType) params.vulnerability_type = vulnerabilityType
    if (language) params.language = language
    
    const response = await apiClient.get('/rules/recommendations', { params })
    
    // Handle both array response and object with recommendations property
    const recommendations = Array.isArray(response) 
      ? response 
      : response.recommendations || []
    
    // Transform recommendations to include properly formatted rules
    return recommendations.map((rec: any) => ({
      ...rec,
      rule: this.transformRuleData(rec.rule)
    }))
  }

  // Rule performance analytics
  async getRulePerformanceAnalytics(
    ruleId: string,
    timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<RulePerformanceAnalytics> {
    return apiClient.get(`/rules/${ruleId}/performance-analytics`, {
      params: { time_range: timeRange }
    })
  }


  // Rule templates and generation
  async getGenerationTemplates(
    tool?: SupportedTool,
    language?: RuleLanguage,
    category?: string
  ): Promise<RuleGenerationTemplate[]> {
    const params: any = {}
    if (tool) params.tool = tool
    if (language) params.language = language
    if (category) params.category = category
    
    return apiClient.get('/rules/generation-templates', { params })
  }


  // Rule collaboration features
  async getRuleCollaboration(ruleId: string): Promise<RuleCollaboration> {
    return apiClient.get(`/rules/${ruleId}/collaboration`)
  }

  async shareRule(
    ruleId: string,
    shareWith: Array<{ username: string; permission: 'view' | 'edit' }>
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/rules/${ruleId}/share`, {
      share_with: shareWith
    })
  }

  async forkRule(
    ruleId: string,
    forkData: Partial<RuleFork & RuleRequest>
  ): Promise<CustomRule> {
    const response = await apiClient.post(`/rules/${ruleId}/fork`, forkData)
    return this.transformRuleData(response)
  }

  // Sandbox testing
  async testRuleInSandbox(
    ruleData: {
      tool: SupportedTool
      pattern: string
      language?: RuleLanguage
    },
    testCode: string,
    options?: {
      timeout_seconds?: number
      memory_limit_mb?: number
      include_performance_metrics?: boolean
    }
  ): Promise<{
    success: boolean
    result?: RuleTestResult
    performance_metrics?: {
      execution_time_ms: number
      memory_used_mb: number
      cpu_usage_percent: number
    }
    error?: string
  }> {
    return apiClient.post('/rules/sandbox/test', {
      rule_data: ruleData,
      test_code: testCode,
      options
    })
  }

  // Rule optimization suggestions
  async getOptimizationSuggestions(
    ruleId: string
  ): Promise<{
    current_performance: {
      avg_execution_time_ms: number
      false_positive_rate: number
      complexity_score: number
      complexity_level: string
    }
    optimizations: string[]
    recommendations: string[]
  }> {
    return apiClient.get(`/rules/${ruleId}/optimize`)
  }

  // Multi-tool rule creation
  async createMultiToolRule(
    ruleData: RuleRequest,
    targetTools?: SupportedTool[]
  ): Promise<{
    primary_rule: CustomRule
    translated_rules: Array<{
      tool: SupportedTool
      rule?: CustomRule
      error?: string
      translation_confidence: number
    }>
    total_created: number
  }> {
    return apiClient.post('/rules/multi-tool', {
      ...ruleData,
      target_tools: targetTools
    })
  }

  // Rule analytics dashboard data
  async getDashboardAnalytics(
    timeframe: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<{
    overview: {
      total_rules: number
      active_rules: number
      community_rules: number
      trending_tools: Array<{ tool: SupportedTool; growth_rate: number }>
    }
    performance: {
      avg_execution_time: number
      success_rate: number
      total_tests_run: number
    }
    community: {
      active_contributors: number
      new_rules_this_period: number
      top_voted_rules: CustomRule[]
    }
    tool_usage: Array<{
      tool: SupportedTool
      usage_count: number
      effectiveness_score: number
      trend: 'up' | 'down' | 'stable'
    }>
  }> {
    return apiClient.get('/rules/dashboard-analytics', {
      params: { timeframe }
    })
  }

  // Scan integration endpoints
  async getCustomRulesForScan(
    scanOptions: {
      repository_id?: string
      language?: RuleLanguage
      include_community?: boolean
      effectiveness_threshold?: number
      max_rules?: number
    }
  ): Promise<{
    recommended_rules: CustomRule[]
    user_rules: CustomRule[]
    community_rules: CustomRule[]
    total_available: number
  }> {
    return apiClient.post('/rules/for-scan', scanOptions)
  }

  async getRulesUsedInScan(scanId: string): Promise<{
    rules_used: Array<{
      rule: CustomRule
      findings_count: number
      execution_time_ms: number
    }>
    total_rules_executed: number
    total_findings: number
    scan_performance: {
      total_execution_time_ms: number
      avg_rule_execution_time: number
    }
  }> {
    return apiClient.get(`/scans/${scanId}/rules-used`)
  }

  // =====================
  // ANALYTICS SERVICE 
  // =====================
  
  async getRuleAnalytics(
    ruleId: string,
    timeRange: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<{
    usage_metrics: {
      total_scans: number
      unique_repositories: number
      total_findings: number
      avg_findings_per_scan: number
    }
    performance_metrics: {
      avg_execution_time_ms: number
      success_rate: number
      false_positive_rate: number
    }
    effectiveness_score: number
    trend_data: Array<{
      date: string
      usage_count: number
      findings_count: number
      execution_time: number
    }>
  }> {
    return apiClient.get(`/rules/analytics/${ruleId}`, {
      params: { time_range: timeRange }
    })
  }

  async getTopPerformingRules(
    limit: number = 10,
    metric: 'effectiveness' | 'usage' | 'accuracy' = 'effectiveness'
  ): Promise<Array<{
    rule: CustomRule
    effectiveness_score: number
    usage_count: number
    accuracy_score: number
  }>> {
    return apiClient.get('/rules/analytics/top-performing', {
      params: { limit, metric }
    })
  }

  async getRuleComparisonAnalytics(
    ruleIds: string[]
  ): Promise<{
    comparison_metrics: Array<{
      rule_id: string
      rule_name: string
      effectiveness_score: number
      usage_count: number
      performance_metrics: any
    }>
    recommendations: string[]
  }> {
    return apiClient.post('/rules/analytics/compare', {
      rule_ids: ruleIds
    })
  }

  // =====================
  // COLLABORATION SERVICE
  // =====================
  
  async createRuleCollection(
    collectionData: {
      name: string
      description?: string
      is_public?: boolean
    }
  ): Promise<{
    id: string
    name: string
    description: string
    is_public: boolean
    created_at: string
  }> {
    return apiClient.post('/rules/collections', collectionData)
  }

  async getRuleCollections(
    userId?: number
  ): Promise<Array<{
    id: string
    name: string
    description: string
    is_public: boolean
    rule_count: number
    created_at: string
  }>> {
    const params = userId ? { user_id: userId } : {}
    return apiClient.get('/rules/collections', { params })
  }

  async addRuleToCollection(
    collectionId: string,
    ruleId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/rules/collections/${collectionId}/rules`, {
      rule_id: ruleId
    })
  }

  async removeRuleFromCollection(
    collectionId: string,
    ruleId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/rules/collections/${collectionId}/rules/${ruleId}`)
  }

  async addRuleComment(
    ruleId: string,
    commentData: {
      content: string
      parent_comment_id?: string
    }
  ): Promise<{
    id: string
    content: string
    user_id: number
    username: string
    created_at: string
  }> {
    return apiClient.post(`/rules/${ruleId}/comments`, commentData)
  }

  async getRuleComments(
    ruleId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    comments: Array<{
      id: string
      content: string
      user_id: number
      username: string
      created_at: string
      replies?: any[]
    }>
    total: number
    page: number
    limit: number
  }> {
    return apiClient.get(`/rules/${ruleId}/comments`, {
      params: { page, limit }
    })
  }

  async submitRuleFeedback(
    ruleId: string,
    feedbackData: {
      type: 'bug' | 'improvement' | 'feature_request' | 'other'
      content: string
      rating?: number
    }
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/rules/${ruleId}/feedback`, feedbackData)
  }

  // =====================
  // GOVERNANCE SERVICE
  // =====================
  
  async submitRuleForApproval(
    ruleId: string,
    approvalData: {
      justification?: string
      target_visibility?: 'public' | 'featured'
    }
  ): Promise<{ success: boolean; approval_id: string }> {
    return apiClient.post(`/rules/${ruleId}/submit-for-approval`, approvalData)
  }

  async getRuleQualityAssessment(
    ruleId: string
  ): Promise<{
    overall_score: number
    quality_metrics: {
      pattern_complexity: number
      documentation_completeness: number
      test_coverage: number
      performance_score: number
    }
    recommendations: string[]
    issues: Array<{
      severity: 'low' | 'medium' | 'high'
      message: string
      suggestion?: string
    }>
  }> {
    return apiClient.get(`/rules/${ruleId}/quality-assessment`)
  }

  async getPendingApprovals(): Promise<Array<{
    approval_id: string
    rule_id: string
    rule_name: string
    submitted_by: string
    submitted_at: string
    status: 'pending' | 'under_review' | 'approved' | 'rejected'
    justification?: string
  }>> {
    return apiClient.get('/rules/governance/pending-approvals')
  }

  async reviewRuleApproval(
    approvalId: string,
    reviewData: {
      action: 'approve' | 'reject'
      feedback?: string
      conditions?: string[]
    }
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/rules/governance/approvals/${approvalId}/review`, reviewData)
  }

  // =====================
  // IMPORT/EXPORT SERVICE
  // =====================
  
  async exportRulesAdvanced(
    exportOptions: {
      format: 'yaml' | 'json' | 'csv' | 'excel' | 'sarif'
      rule_ids?: string[]
      include_metadata?: boolean
      include_analytics?: boolean
      include_comments?: boolean
      filters?: {
        tools?: string[]
        languages?: string[]
        severities?: string[]
        date_range?: { from: string; to: string }
      }
    }
  ): Promise<{
    download_url: string
    filename: string
    file_size: number
    export_id: string
  }> {
    return apiClient.post('/rules/export/advanced', exportOptions)
  }

  async importRulesFromFile(
    file: File,
    importOptions: {
      format: 'yaml' | 'json' | 'csv' | 'excel'
      overwrite_existing?: boolean
      validate_before_import?: boolean
      make_public?: boolean
    }
  ): Promise<{
    success: boolean
    imported_count: number
    skipped_count: number
    failed_count: number
    validation_errors: string[]
    import_summary: Array<{
      rule_name: string
      status: 'imported' | 'updated' | 'skipped' | 'failed'
      reason?: string
    }>
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(importOptions))
    
    return apiClient.uploadFile('/rules/import/file', formData)
  }

  async importRulesFromRepository(
    repoData: {
      repository_url: string
      branch?: string
      path?: string
      auth_token?: string
    }
  ): Promise<{
    success: boolean
    rules_found: number
    imported_count: number
    import_details: any[]
  }> {
    return apiClient.post('/rules/import/repository', repoData)
  }

  // =====================
  // MANAGEMENT SERVICE
  // =====================
  
  async createRuleCategory(
    categoryData: {
      name: string
      description: string
      parent_id?: string
      icon?: string
      color?: string
    }
  ): Promise<{
    id: string
    name: string
    description: string
    parent_id?: string
    created_at: string
  }> {
    return apiClient.post('/rules/categories', categoryData)
  }

  async updateRuleCategories(
    ruleId: string,
    categoryIds: string[]
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.put(`/rules/${ruleId}/categories`, {
      category_ids: categoryIds
    })
  }

  async updateRuleTags(
    ruleId: string,
    tags: string[]
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.put(`/rules/${ruleId}/tags`, {
      tags
    })
  }

  async getTagSuggestions(
    query: string,
    limit: number = 10
  ): Promise<Array<{
    tag: string
    usage_count: number
    related_tools: string[]
  }>> {
    return apiClient.get('/rules/tags/suggestions', {
      params: { query, limit }
    })
  }

  async archiveRule(
    ruleId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/rules/${ruleId}/archive`, {
      reason
    })
  }

  async unarchiveRule(
    ruleId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/rules/${ruleId}/unarchive`)
  }

  // =====================
  // TEMPLATES SERVICE
  // =====================
  
  async getSecurityTemplates(
    filters?: {
      tool?: string
      language?: string
      category?: string
      complexity?: 'basic' | 'intermediate' | 'advanced'
      source?: 'official' | 'community' | 'all'
    }
  ): Promise<Array<{
    id: string
    name: string
    description: string
    tool: string
    language?: string
    category: string
    complexity: string
    pattern_template: string
    example_usage: string
    source: 'official' | 'community'
    is_curated?: boolean
    upvotes?: number
    usage_count?: number
    author_id?: number
    created_at?: string
    placeholders: Array<{
      key: string
      description: string
      type: string
      required: boolean
    }>
  }>> {
    const response = await apiClient.get('/rules/templates', { params: filters })
    
    // Handle the response format from backend: {templates: [...]}
    return Array.isArray(response) ? response : (response.templates || [])
  }

  async generateRuleFromTemplate(
    templateId: string,
    placeholderValues: Record<string, any>,
    options?: {
      auto_validate?: boolean
      save_rule?: boolean
      make_public?: boolean
    }
  ): Promise<{
    success: boolean
    generated_pattern: string
    validation_result?: any
    created_rule_id?: string
    warnings?: string[]
  }> {
    return apiClient.post(`/rules/templates/${templateId}/generate`, {
      placeholder_values: placeholderValues,
      options: options || {}
    })
  }

  async createCustomTemplate(
    templateData: {
      name: string
      description: string
      tool: string
      language?: string
      category: string
      pattern_template: string
      placeholders: Array<{
        key: string
        description: string
        type: string
        required: boolean
        default_value?: any
      }>
      example_usage: string
    }
  ): Promise<{
    id: string
    name: string
    created_at: string
  }> {
    return apiClient.post('/rules/templates/custom', templateData)
  }

  // =====================
  // VERSIONING SERVICE
  // =====================
  
  async createRuleVersion(
    ruleId: string,
    versionData: {
      changes_description: string
      major_change?: boolean
    }
  ): Promise<{
    version_id: string
    version_number: string
    created_at: string
  }> {
    return apiClient.post(`/rules/${ruleId}/versions`, versionData)
  }

  async getRuleVersionHistory(
    ruleId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    versions: Array<{
      version_id: string
      version_number: string
      changes_description: string
      created_at: string
      created_by: string
      is_current: boolean
    }>
    total: number
    page: number
    limit: number
  }> {
    return apiClient.get(`/rules/${ruleId}/versions`, {
      params: { page, limit }
    })
  }

  async restoreRuleVersion(
    ruleId: string,
    versionId: string
  ): Promise<{
    success: boolean
    message: string
    new_version_id: string
  }> {
    return apiClient.post(`/rules/${ruleId}/versions/${versionId}/restore`)
  }

  async compareRuleVersions(
    ruleId: string,
    versionId1: string,
    versionId2: string
  ): Promise<{
    differences: Array<{
      field: string
      old_value: any
      new_value: any
      change_type: 'added' | 'removed' | 'modified'
    }>
    similarity_score: number
  }> {
    return apiClient.get(`/rules/${ruleId}/versions/compare`, {
      params: {
        version1: versionId1,
        version2: versionId2
      }
    })
  }

  // =====================
  // TEMPLATE SERVICE
  // =====================

  async saveAsTemplate(
    ruleId: string,
    templateData?: {
      category?: string
      complexity?: 'basic' | 'intermediate' | 'advanced'
      example_usage?: string
      make_public?: boolean
    }
  ): Promise<{
    success: boolean
    message: string
    template_id: string
  }> {
    return apiClient.post(`/rules/save-as-template/${ruleId}`, templateData || {})
  }

  async promoteTemplate(
    templateId: string
  ): Promise<{
    success: boolean
    message: string
    template: {
      upvotes: number
      usage_count: number
      is_curated: boolean
    }
  }> {
    return apiClient.post(`/rules/templates/${templateId}/promote`)
  }
}

// Export singleton instance
export const rulesAPI = new RulesAPI()
export default rulesAPI