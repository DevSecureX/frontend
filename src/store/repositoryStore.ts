import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { api } from '@/lib/api'
import type { Repository } from '@/types/global'
import type { ConnectRepoRequest, RepositoryStatsResponse } from '@/lib/api/repositories'
import { toast } from 'sonner'

interface RepositoryState {
  // State
  repositories: Repository[]
  availableRepos: string[]
  currentRepo: Repository | null
  repositoryStats: RepositoryStatsResponse | null
  isLoading: boolean
  isStatsLoading: boolean
  error: string | null
  
  // Filters and search
  searchQuery: string
  selectedNiche: string | null
  selectedLanguage: string | null
  selectedStatus: string | null

  // Actions
  fetchRepositories: () => Promise<void>
  fetchAvailableRepos: () => Promise<void>
  fetchRepositoryStats: () => Promise<void>
  connectRepository: (repoData: ConnectRepoRequest) => Promise<void>
  disconnectRepository: (fullName: string) => Promise<void>
  setCurrentRepo: (repo: Repository | null) => void
  
  // Repository details
  fetchRepoBranches: (fullName: string) => Promise<string[]>
  fetchRepoContents: (fullName: string, branch: string) => Promise<any>
  
  // Filtering and search
  setSearchQuery: (query: string) => void
  setNicheFilter: (niche: string | null) => void
  setLanguageFilter: (language: string | null) => void
  setStatusFilter: (status: string | null) => void
  clearFilters: () => void
  
  // Computed getters
  getFilteredRepositories: () => Repository[]
  getRepositoryStats: () => {
    total: number
    byNiche: Record<string, number>
    byLanguage: Record<string, number>
    byStatus: Record<string, number>
    needsAttention: number
    issues: number
  }
  getDynamicStats: () => RepositoryStatsResponse | null
  
  // Utilities
  findRepository: (fullName: string) => Repository | undefined
  isRepositoryConnected: (fullName: string) => boolean
  clearError: () => void
}

export const useRepositoryStore = create<RepositoryState>()(
  immer((set, get) => ({
    // Initial state
    repositories: [],
    availableRepos: [],
    currentRepo: null,
    repositoryStats: null,
    isLoading: false,
    isStatsLoading: true, // Start with true to show skeleton on initial load
    error: null,
    
    // Filters
    searchQuery: '',
    selectedNiche: null,
    selectedLanguage: null,
    selectedStatus: null,

    // Fetch all connected repositories
    fetchRepositories: async () => {
      set(state => {
        state.isLoading = true
        state.error = null
      })

      try {
        const repositories = await api.repositories.list()
        
        set(state => {
          state.repositories = repositories
          state.isLoading = false
        })
      } catch (error: any) {
        set(state => {
          state.error = error.message || 'Failed to fetch repositories'
          state.isLoading = false
        })
      }
    },

    // Fetch available repositories from GitHub
    fetchAvailableRepos: async () => {
      set(state => {
        state.isLoading = true
        state.error = null
      })

      try {
        const availableRepos = await api.repositories.listAvailable()
        
        set(state => {
          state.availableRepos = availableRepos
          state.isLoading = false
        })
      } catch (error: any) {
        set(state => {
          state.error = error.message || 'Failed to fetch available repositories'
          state.isLoading = false
        })
      }
    },

    // Fetch repository statistics
    fetchRepositoryStats: async () => {
      set(state => {
        state.isStatsLoading = true
      })
      
      try {
        const stats = await api.repositories.getStats()
        
        set(state => {
          state.repositoryStats = stats
          state.isStatsLoading = false
        })
      } catch (error: any) {
        set(state => {
          state.error = error.message || 'Failed to fetch repository statistics'
          state.isStatsLoading = false
        })
      }
    },

    // Connect a new repository
    connectRepository: async (repoData: ConnectRepoRequest) => {
      set(state => {
        state.isLoading = true
        state.error = null
      })

      try {
        const response = await api.repositories.connect(repoData)
        
        // Refresh the repositories list and stats
        await get().fetchRepositories()
        await get().fetchRepositoryStats()
        
        set(state => {
          state.isLoading = false
        })

        toast.success(`Repository ${repoData.full_name} connected successfully!`)
      } catch (error: any) {
        set(state => {
          state.error = error.message || 'Failed to connect repository'
          state.isLoading = false
        })
        toast.error(`Failed to connect repository: ${error.message}`)
        throw error
      }
    },

    // Disconnect a repository
    disconnectRepository: async (fullName: string) => {
      set(state => {
        state.isLoading = true
        state.error = null
      })

      try {
        await api.repositories.disconnect({ full_name: fullName })
        
        set(state => {
          // Remove from repositories list
          state.repositories = state.repositories.filter(
            repo => repo.full_name !== fullName
          )
          
          // Clear current repo if it was the disconnected one
          if (state.currentRepo?.full_name === fullName) {
            state.currentRepo = null
          }
          
          state.isLoading = false
        })
        
        // Also refresh stats after disconnecting
        await get().fetchRepositoryStats()

        toast.success(`Repository ${fullName} disconnected successfully!`)
      } catch (error: any) {
        set(state => {
          state.error = error.message || 'Failed to disconnect repository'
          state.isLoading = false
        })
        toast.error(`Failed to disconnect repository: ${error.message}`)
        throw error
      }
    },

    // Set current repository
    setCurrentRepo: (repo: Repository | null) => {
      set(state => {
        state.currentRepo = repo
      })
    },

    // Fetch repository branches
    fetchRepoBranches: async (fullName: string) => {
      try {
        const response = await api.repositories.getBranches(fullName)
        return response.branches
      } catch (error: any) {
        toast.error(`Failed to fetch branches: ${error.message}`)
        throw error
      }
    },

    // Fetch repository contents
    fetchRepoContents: async (fullName: string, branch: string) => {
      try {
        const response = await api.repositories.getContents(fullName, branch)
        return response
      } catch (error: any) {
        toast.error(`Failed to fetch repository contents: ${error.message}`)
        throw error
      }
    },

    // Set search query
    setSearchQuery: (query: string) => {
      set(state => {
        state.searchQuery = query
      })
    },

    // Set niche filter
    setNicheFilter: (niche: string | null) => {
      set(state => {
        state.selectedNiche = niche
      })
    },

    // Set language filter
    setLanguageFilter: (language: string | null) => {
      set(state => {
        state.selectedLanguage = language
      })
    },

    // Set status filter
    setStatusFilter: (status: string | null) => {
      set(state => {
        state.selectedStatus = status
      })
    },

    // Clear all filters
    clearFilters: () => {
      set(state => {
        state.searchQuery = ''
        state.selectedNiche = null
        state.selectedLanguage = null
        state.selectedStatus = null
      })
    },

    // Get filtered repositories
    getFilteredRepositories: () => {
      const { 
        repositories, 
        searchQuery, 
        selectedNiche, 
        selectedLanguage, 
        selectedStatus 
      } = get()

      return repositories.filter(repo => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (
            !repo.full_name.toLowerCase().includes(query) &&
            !repo.description?.toLowerCase().includes(query) &&
            !repo.language?.toLowerCase().includes(query)
          ) {
            return false
          }
        }

        // Niche filter
        if (selectedNiche && repo.niche !== selectedNiche) {
          return false
        }

        // Language filter
        if (selectedLanguage && repo.language !== selectedLanguage) {
          return false
        }

        // Status filter
        if (selectedStatus && repo.status !== selectedStatus) {
          return false
        }

        return true
      })
    },

    // Get repository statistics
    getRepositoryStats: () => {
      const { repositories, repositoryStats } = get()
      
      const byNiche: Record<string, number> = {}
      const byLanguage: Record<string, number> = {}
      const byStatus: Record<string, number> = {}

      repositories.forEach(repo => {
        // Count by niche
        byNiche[repo.niche] = (byNiche[repo.niche] || 0) + 1

        // Count by language
        if (repo.language) {
          byLanguage[repo.language] = (byLanguage[repo.language] || 0) + 1
        }

        // Count by status
        byStatus[repo.status] = (byStatus[repo.status] || 0) + 1
      })

      return {
        total: repositories.length,
        byNiche,
        byLanguage,
        byStatus,
        needsAttention: repositoryStats?.repositories_needing_attention || 0,
        issues: repositoryStats?.total_issues_found || 0
      }
    },

    // Get dynamic repository statistics
    getDynamicStats: () => {
      const { repositoryStats } = get()
      return repositoryStats
    },

    // Find repository by full name
    findRepository: (fullName: string) => {
      const { repositories } = get()
      return repositories.find(repo => repo.full_name === fullName)
    },

    // Check if repository is connected
    isRepositoryConnected: (fullName: string) => {
      const { repositories } = get()
      return repositories.some(repo => repo.full_name === fullName)
    },

    // Clear error
    clearError: () => {
      set(state => {
        state.error = null
      })
    },
  }))
)