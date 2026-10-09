import { apiClient } from './client'

// Request/Response types
export interface ConnectRepoRequest {
  full_name: string
  niche: 'all' | 'ai' | 'blockchain' | 'iot' | 'web3' | 'cloud' | 'api'
}

export interface DisconnectRepoRequest {
  full_name: string
}

export interface Repository {
  id: number
  full_name: string
  niche: string
  settings: Record<string, any>
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

export interface CodeAccessResponse {
  full_name: string
  branch: string
  sample_content: Record<string, string>
  latest_commit: {
    sha: string
    message: string
    author: string
    date?: string
  }
  message: string
  accessed_at: string
}

export interface BranchesResponse {
  full_name: string
  branches: string[]
  default_branch: string
  total_count: number
}

export interface RepositoryAttentionItem {
  repo_name: string
  critical_issues: number
  high_issues: number
  reason: string
}

export interface RepositoryStatsResponse {
  total_repositories: number
  active_repositories: number
  repositories_needing_attention: number
  repositories_needing_attention_details: RepositoryAttentionItem[]
  total_issues_found: number
  repositories_by_status: Record<string, number>
  repositories_by_language: Record<string, number>
  repositories_by_niche: Record<string, number>
  active_scans: number
  completed_scans: number
  critical_issues: number
}

// Repository API class
export class RepositoryAPI {
  // Repository management
  async connect(repoData: ConnectRepoRequest): Promise<{
    status: string
    full_name: string
    webhook_id: string
    message: string
  }> {
    return apiClient.post('/repos/connect', repoData)
  }

  async disconnect(repoData: DisconnectRepoRequest): Promise<{
    status: string
    full_name: string
    message: string
  }> {
    return apiClient.post('/repos/disconnect', repoData)
  }

  async list(): Promise<Repository[]> {
    return apiClient.get('/repos/')
  }

  async listAvailable(): Promise<string[]> {
    return apiClient.get('/repos/available')
  }

  async getStats(): Promise<RepositoryStatsResponse> {
    return apiClient.get('/repos/stats')
  }

  // Repository details
  async getBranches(fullName: string): Promise<BranchesResponse> {
    // Encode the repo name to handle forward slashes
    const encodedName = encodeURIComponent(fullName).replace(/%2F/g, '/')
    return apiClient.get(`/repos/${encodedName}/branches`)
  }

  async getContents(fullName: string, branch: string): Promise<CodeAccessResponse> {
    // Encode the repo name to handle forward slashes
    const encodedName = encodeURIComponent(fullName).replace(/%2F/g, '/')
    return apiClient.get(`/repos/${encodedName}/contents`, {
      params: { branch }
    })
  }

  // Helper methods
  async validateRepoAccess(fullName: string, branch?: string): Promise<boolean> {
    try {
      const defaultBranch = branch || 'main'
      await this.getContents(fullName, defaultBranch)
      return true
    } catch {
      return false
    }
  }

  async getRepoStats(fullName: string): Promise<{
    branches: number
    hasContent: boolean
    lastUpdated?: string
  }> {
    try {
      const branches = await this.getBranches(fullName)
      const defaultBranch = branches.default_branch || 'main'
      const contents = await this.getContents(fullName, defaultBranch)
      
      return {
        branches: branches.total_count,
        hasContent: Object.keys(contents.sample_content).length > 0,
        lastUpdated: contents.latest_commit.date
      }
    } catch {
      return {
        branches: 0,
        hasContent: false
      }
    }
  }

  // Repository search and filtering
  async searchRepositories(query: string): Promise<Repository[]> {
    const repos = await this.list()
    return repos.filter(repo => 
      repo.full_name.toLowerCase().includes(query.toLowerCase()) ||
      repo.description?.toLowerCase().includes(query.toLowerCase()) ||
      repo.language?.toLowerCase().includes(query.toLowerCase())
    )
  }

  async filterByNiche(niche: string): Promise<Repository[]> {
    const repos = await this.list()
    return repos.filter(repo => repo.niche === niche)
  }

  async filterByLanguage(language: string): Promise<Repository[]> {
    const repos = await this.list()
    return repos.filter(repo => 
      repo.language?.toLowerCase() === language.toLowerCase()
    )
  }

  async filterByStatus(status: string): Promise<Repository[]> {
    const repos = await this.list()
    return repos.filter(repo => repo.status === status)
  }

  // Repository insights
  async getRepositoryInsights(): Promise<{
    total: number
    byNiche: Record<string, number>
    byLanguage: Record<string, number>
    byStatus: Record<string, number>
    recentlyAdded: Repository[]
  }> {
    const repos = await this.list()
    
    const byNiche: Record<string, number> = {}
    const byLanguage: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    
    repos.forEach(repo => {
      // Count by niche
      byNiche[repo.niche] = (byNiche[repo.niche] || 0) + 1
      
      // Count by language
      if (repo.language) {
        byLanguage[repo.language] = (byLanguage[repo.language] || 0) + 1
      }
      
      // Count by status
      byStatus[repo.status] = (byStatus[repo.status] || 0) + 1
    })
    
    // Get recently added (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentlyAdded = repos
      .filter(repo => new Date(repo.created_at) > sevenDaysAgo)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
    
    return {
      total: repos.length,
      byNiche,
      byLanguage,
      byStatus,
      recentlyAdded
    }
  }
}

// Export singleton instance
export const repositoryAPI = new RepositoryAPI()
export default repositoryAPI