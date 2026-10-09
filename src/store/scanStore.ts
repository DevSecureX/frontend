import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { api } from '@/lib/api'
import type { 
  Scan, 
  ScanSummary, 
  JobStatus, 
  PullRequest,
  ScanStatus,
  SecuritySeverity
} from '@/types/global'
import type { 
  ScanRequest, 
  PRScanRequest, 
  BulkPRScanRequest,
  AIExplanationResponse,
  QueueStats,
  IssueFeedbackRequest,
  ScanStats
} from '@/lib/api/scans'
import { toast } from 'sonner'

interface ScanState {
  // Core scan data
  scans: ScanSummary[]
  currentScan: Scan | null
  activeScanJobs: Record<string, JobStatus>
  
  // Pull request data
  pullRequests: Record<string, PullRequest[]>
  
  // UI state
  isLoading: boolean
  isPRsLoading: boolean
  scanningPRs: Record<string, boolean> // Track individual PR scan loading states
  error: string | null
  
  // Filters and pagination
  currentPage: number
  itemsPerPage: number
  totalScans: number
  totalPages: number
  selectedSeverity: SecuritySeverity | null
  selectedStatus: ScanStatus | null
  selectedRepository: string | null
  searchQuery: string
  
  // Queue and analytics
  queueStats: QueueStats | null
  scanStats: ScanStats | null
  
  // AI explanations cache
  issueExplanations: Record<string, AIExplanationResponse>

  // Actions - Core scanning
  triggerScan: (scanData: ScanRequest) => Promise<string>
  fetchScans: (repoFullName?: string) => Promise<void>
  fetchScansWithFilters: (repositoryFilter?: string | null) => Promise<void>
  fetchScanDetails: (scanId: string) => Promise<void>
  deleteScan: (scanId: string) => Promise<void>
  
  // Actions - Job management
  pollJobStatus: (jobId: string) => Promise<void>
  cancelScanJob: (jobId: string) => void
  
  // Actions - Pull requests
  fetchPullRequests: (repoFullName: string) => Promise<void>
  scanPullRequest: (repoFullName: string, prNumber: number, scanData: PRScanRequest) => Promise<string>
  bulkScanPRs: (repoFullName: string, scanData: BulkPRScanRequest) => Promise<string[]>
  postPRComment: (scanId: string, comment: string) => Promise<void>
  postSecurityReview: (repoFullName: string, prNumber: number, reviewData: { event?: string; forceNewScan?: boolean }) => Promise<void>
  
  // Actions - Issue management
  getAIExplanation: (tool: string, ruleId: string, category: string, severity: string) => Promise<AIExplanationResponse>
  submitIssueFeedback: (issueId: string, feedback: IssueFeedbackRequest) => Promise<void>
  
  // Actions - Analytics
  fetchQueueStats: () => Promise<void>
  fetchScanStats: () => Promise<void>
  fetchScanAnalytics: (repoFullName?: string, timeRange?: string) => Promise<unknown>
  fetchSecurityMetrics: () => Promise<unknown>
  
  // Actions - Filtering and search
  setCurrentPage: (page: number) => void
  setSeverityFilter: (severity: SecuritySeverity | null) => void
  setStatusFilter: (status: ScanStatus | null) => Promise<void>
  setRepositoryFilter: (repo: string | null) => Promise<void>
  setSearchQuery: (query: string) => void
  clearFilters: () => Promise<void>
  
  // Actions - UI helpers
  setCurrentScan: (scan: Scan | null) => void
  clearError: () => void
  
  // Computed getters
  getFilteredScans: () => ScanSummary[]
  getScanStats: () => {
    total: number
    byStatus: Record<string, number>
    bySeverity: Record<string, number>
    byRepository: Record<string, number>
  }
  getActiveScanCount: () => number
  getCriticalIssuesCount: () => number
}

export const useScanStore = create<ScanState>()(
  immer((set, get) => ({
    // Initial state
    scans: [],
    currentScan: null,
    activeScanJobs: {},
    pullRequests: {},
    isLoading: false,
    isPRsLoading: false,
    scanningPRs: {},
    error: null,
    
    // Filters and pagination
    currentPage: 1,
    itemsPerPage: 20,
    totalScans: 0,
    totalPages: 0,
    selectedSeverity: null,
    selectedStatus: null,
    selectedRepository: null,
    searchQuery: '',
    
    // Analytics
    queueStats: null,
    scanStats: null,
    issueExplanations: {},

    // Trigger a new scan
    triggerScan: async (scanData: ScanRequest) => {
      set(state => {
        state.isLoading = true
        state.error = null
      })

      try {
        const response = await api.scans.triggerScan(scanData)
        
        // Add job to active jobs tracking temporarily (will be updated with correct data from backend)
        set(state => {
          state.activeScanJobs[response.job_id] = {
            job_id: response.job_id,
            status: 'queued',
            repo_full_name: scanData.repo_full_name,
            scan_type: 'comprehensive',
            created_at: new Date().toISOString(), // Temporary - will be updated with backend timestamp
            progress: 'Scan queued'
          }
          state.isLoading = false
        })

        // Immediately fetch job status to get correct backend timestamp and then start polling
        try {
          const jobStatus = await api.scans.getJobStatus(response.job_id)
          set(state => {
            state.activeScanJobs[response.job_id] = jobStatus
          })
        } catch (error) {
          console.warn('Failed to fetch initial job status, will rely on polling:', error)
        }

        // Start polling for job status with extended timeout (30 minutes)
        void get().pollJobStatus(response.job_id)
        
        toast.success(
          `Scan started for ${scanData.repo_full_name}`,
          { 
            id: `started-${response.job_id}` // Prevent duplicate start toasts
          }
        )
        return response.job_id
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to trigger scan'
        set(state => {
          state.error = errorMessage
          state.isLoading = false
        })
        toast.error(`Failed to start scan: ${errorMessage}`)
        throw error
      }
    },

    // Fetch scans list
    fetchScans: async (repoFullName?: string) => {
      set(state => {
        state.isLoading = true
        state.error = null
      })

      try {
        const { currentPage, itemsPerPage, selectedStatus, selectedRepository } = get()
        
        // fetchScans called with parameters
        
        const response = repoFullName 
          ? await api.scans.listRepoScans(repoFullName, currentPage, itemsPerPage)
          : await api.scans.listUserScans(
              currentPage, 
              itemsPerPage, 
              undefined, // scan_type - we can add this filter later if needed
              selectedStatus ?? undefined,
              selectedRepository ?? undefined
            )
        
        set(state => {
          // Handle both paginated and non-paginated responses for backwards compatibility
          if (Array.isArray(response)) {
            // Legacy response format
            state.scans = response as ScanSummary[]
            state.totalScans = response.length
            state.totalPages = 1
          } else {
            // New paginated response format
            state.scans = response.data as ScanSummary[]
            state.totalScans = response.pagination.total
            state.totalPages = response.pagination.total_pages
          }
          state.isLoading = false
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scans'
        set(state => {
          state.error = errorMessage
          state.isLoading = false
        })
      }
    },

    // Fetch scans with explicit filters to avoid state timing issues
    fetchScansWithFilters: async (repositoryFilter?: string | null) => {
      set(state => {
        state.isLoading = true
        state.error = null
      })

      try {
        const { currentPage, itemsPerPage, selectedStatus } = get()
        
        // fetchScansWithFilters called with parameters
        
        const response = await api.scans.listUserScans(
          currentPage, 
          itemsPerPage, 
          undefined, // scan_type 
          selectedStatus ?? undefined,
          repositoryFilter ?? undefined
        )
        
        set(state => {
          // Handle both paginated and non-paginated responses for backwards compatibility
          if (Array.isArray(response)) {
            // Legacy response format
            state.scans = response as ScanSummary[]
            state.totalScans = response.length
            state.totalPages = 1
          } else {
            // New paginated response format
            state.scans = response.data as ScanSummary[]
            state.totalScans = response.pagination.total
            state.totalPages = response.pagination.total_pages
          }
          state.isLoading = false
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scans'
        set(state => {
          state.error = errorMessage
          state.isLoading = false
        })
      }
    },

    // Fetch detailed scan data
    fetchScanDetails: async (scanId: string) => {
      set(state => {
        state.isLoading = true
        state.error = null
      })

      try {
        const scan = await api.scans.getScanDetails(scanId, true)
        
        set(state => {
          state.currentScan = scan as Scan
          state.isLoading = false
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scan details'
        set(state => {
          state.error = errorMessage
          state.isLoading = false
        })
      }
    },

    // Delete a scan
    deleteScan: async (scanId: string) => {
      set(state => {
        state.isLoading = true
        state.error = null
      })

      try {
        await api.scans.deleteScan(scanId)
        
        set(state => {
          // Remove from scans list
          state.scans = state.scans.filter(scan => scan.scan_id !== scanId)
          
          // Clear current scan if it was the deleted one
          if (state.currentScan?.scan_id === scanId) {
            state.currentScan = null
          }
          
          state.isLoading = false
        })

        toast.success('Scan deleted successfully')
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete scan'
        set(state => {
          state.error = errorMessage
          state.isLoading = false
        })
        toast.error(`Failed to delete scan: ${errorMessage}`)
        throw error
      }
    },

    // Poll job status with automatic updates
    pollJobStatus: async (jobId: string) => {
      try {
        await api.scans.pollJobStatus(
          jobId,
          (status: JobStatus) => {
            set(state => {
              state.activeScanJobs[jobId] = status
            })
          },
          360, // max attempts (30 minutes with 5s intervals)
          5000 // 5 second intervals
        )

        // Job completed, refresh scans list
        const finalStatus = get().activeScanJobs[jobId]
        if (finalStatus?.status === 'completed') {
          void get().fetchScans()
          if (finalStatus.scan_id) {
            toast.success(
              `Scan completed successfully for ${finalStatus.repo_full_name}!`, 
              { 
                duration: 5000,
                id: `completed-${jobId}` // Prevent duplicate completion toasts
              }
            )
          }
        } else if (finalStatus?.status === 'failed') {
          toast.error(
            `Scan failed for ${finalStatus.repo_full_name}: ${finalStatus.error_message ?? 'Unknown error'}`,
            { 
              id: `failed-${jobId}` // Prevent duplicate failure toasts
            }
          )
        }

        // Remove from active jobs after completion
        set(state => {
          delete state.activeScanJobs[jobId]
        })
      } catch (error: unknown) {
        console.error('Job polling failed:', error)
        
        const isError = error instanceof Error
        const errorName = isError ? error.name : 'Unknown'
        const errorMessage = isError ? error.message : 'Unknown error'
        
        // Handle different error types with appropriate user messaging
        if (errorName === 'TimeoutError') {
          // Don't show timeout notifications for jobs that might still be processing
          // Only show a single informative message about long-running scans
          const repoName = get().activeScanJobs[jobId]?.repo_full_name ?? 'repository'
          toast.info(
            `Scan is taking longer than expected for ${repoName}. Comprehensive scans can take 20-30 minutes. Check the scans page for results.`,
            { 
              duration: 8000,
              id: `timeout-${jobId}` // Prevent duplicate toasts for the same job
            }
          );
        } else if (errorMessage.includes('still be processing')) {
          // Convert this to a neutral info message instead of error
          const repoName = get().activeScanJobs[jobId]?.repo_full_name ?? 'repository'
          toast.info(
            `Long-running scan detected for ${repoName}. Still processing in background...`,
            { 
              duration: 6000,
              id: `processing-${jobId}` // Prevent duplicate toasts
            }
          )
        } else {
          toast.error(`Scan monitoring failed: ${errorMessage}`)
        }
        
        set(state => {
          if (state.activeScanJobs[jobId]) {
            // Don't mark as failed for timeout errors - the job might still complete
            if (errorName !== 'TimeoutError') {
              state.activeScanJobs[jobId].status = 'failed'
              state.activeScanJobs[jobId].error_message = errorMessage
            }
          }
        })
      }
    },

    // Cancel active scan job
    cancelScanJob: (jobId: string) => {
      set(state => {
        delete state.activeScanJobs[jobId]
      })
    },

    // Fetch pull requests for repository
    fetchPullRequests: async (repoFullName: string) => {
      set(state => {
        state.isPRsLoading = true
        state.error = null
      })

      try {
        const prs = await api.scans.listPRs(repoFullName)
        
        set(state => {
          state.pullRequests[repoFullName] = prs
          state.isPRsLoading = false
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pull requests'
        set(state => {
          state.isPRsLoading = false
          state.error = errorMessage
        })
        toast.error(`Failed to fetch pull requests: ${errorMessage}`)
        throw error
      }
    },

    // Scan individual pull request
    scanPullRequest: async (repoFullName: string, prNumber: number, scanData: PRScanRequest) => {
      const prKey = `${repoFullName}#${prNumber}`
      
      // Set loading state for this specific PR
      set(state => {
        state.scanningPRs[prKey] = true
        state.error = null
      })

      try {
        const response = await api.scans.scanPR(repoFullName, prNumber, scanData)
        
        // Track the job temporarily (will be updated with correct backend timestamp)
        set(state => {
          state.activeScanJobs[response.job_id] = {
            job_id: response.job_id,
            status: 'queued',
            repo_full_name: repoFullName,
            scan_type: 'pr-comprehensive',
            created_at: new Date().toISOString(), // Temporary - will be updated with backend timestamp
            progress: `Scanning PR #${prNumber}`
          }
          // Remove loading state once API responds
          delete state.scanningPRs[prKey]
        })

        // Immediately fetch job status to get correct backend timestamp
        try {
          const jobStatus = await api.scans.getJobStatus(response.job_id)
          set(state => {
            state.activeScanJobs[response.job_id] = jobStatus
          })
        } catch (error) {
          console.warn('Failed to fetch initial PR job status, will rely on polling:', error)
        }

        void get().pollJobStatus(response.job_id)
        toast.success(
          `PR scan started for #${prNumber}`,
          { 
            id: `pr-started-${response.job_id}` // Prevent duplicate PR start toasts
          }
        )
        return response.job_id
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to scan PR'
        // Remove loading state on error
        set(state => {
          delete state.scanningPRs[prKey]
          state.error = errorMessage
        })
        toast.error(`Failed to scan PR: ${errorMessage}`)
        throw error
      }
    },

    // Bulk scan pull requests
    bulkScanPRs: async (repoFullName: string, scanData: BulkPRScanRequest) => {
      try {
        const response = await api.scans.bulkScanPRs(repoFullName, scanData)
        
        // Track all jobs temporarily (will be updated with correct backend timestamps)
        response.job_ids.forEach(async (jobId) => {
          set(state => {
            state.activeScanJobs[jobId] = {
              job_id: jobId,
              status: 'queued',
              repo_full_name: repoFullName,
              scan_type: 'bulk-pr-comprehensive',
              created_at: new Date().toISOString(), // Temporary - will be updated with backend timestamp
              progress: 'Bulk PR scan queued'
            }
          })

          // Immediately fetch job status to get correct backend timestamp for each job
          try {
            const jobStatus = await api.scans.getJobStatus(jobId)
            set(state => {
              state.activeScanJobs[jobId] = jobStatus
            })
          } catch (error) {
            console.warn(`Failed to fetch initial bulk job status for ${jobId}, will rely on polling:`, error)
          }

          void get().pollJobStatus(jobId)
        })

        toast.success(
          `Bulk PR scan started: ${response.job_ids.length} jobs queued`,
          { 
            id: `bulk-started-${repoFullName}-${Date.now()}` // Prevent duplicate bulk start toasts
          }
        )
        return response.job_ids
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start bulk PR scan'
        toast.error(`Failed to start bulk PR scan: ${errorMessage}`)
        throw error
      }
    },

    // Post comment on PR
    postPRComment: async (scanId: string, comment: string) => {
      try {
        await api.scans.postPRComment(scanId, comment)
        toast.success('Comment posted successfully')
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to post comment'
        toast.error(`Failed to post comment: ${errorMessage}`)
        throw error
      }
    },

    // Post security review
    postSecurityReview: async (repoFullName: string, prNumber: number, reviewData: { event?: string; forceNewScan?: boolean }) => {
      try {
        // Extract reviewAction from the reviewData
        const reviewAction = reviewData.event ?? 'COMMENT'
        const forceNewScan = reviewData.forceNewScan ?? false
        
        await api.scans.postSecurityReview(repoFullName, prNumber, reviewAction as "COMMENT" | "REQUEST_CHANGES", forceNewScan)
        toast.success('Security review posted successfully')
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to post security review'
        toast.error(`Failed to post security review: ${errorMessage}`)
        throw error
      }
    },

    // Get AI explanation for issue
    getAIExplanation: async (tool: string, ruleId: string, category: string, severity: string) => {
      // Create cache key
      const cacheKey = `${tool}_${ruleId}_${category}`
      
      // Check cache first
      const cached = get().issueExplanations[cacheKey]
      if (cached) {
        return cached
      }

      try {
        const explanation = await api.scans.getIssueExplanation(tool, ruleId, category, severity)
        
        set(state => {
          state.issueExplanations[cacheKey] = explanation
        })

        return explanation
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get explanation'
        toast.error(`Failed to get explanation: ${errorMessage}`)
        throw error
      }
    },

    // Submit feedback for issue
    submitIssueFeedback: async (issueId: string, feedback: IssueFeedbackRequest) => {
      try {
        await api.scans.submitIssueFeedback(issueId, feedback)
        toast.success('Feedback submitted successfully')
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback'
        toast.error(`Failed to submit feedback: ${errorMessage}`)
        throw error
      }
    },

    // Fetch queue statistics
    fetchQueueStats: async () => {
      try {
        const stats = await api.scans.getQueueStats()
        
        set(state => {
          state.queueStats = stats
        })
      } catch (error: unknown) {
        console.error('Failed to fetch queue stats:', error)
      }
    },

    fetchScanStats: async () => {
      try {
        const stats = await api.scans.getScanStats()
        
        set(state => {
          state.scanStats = stats
        })
      } catch (error: unknown) {
        console.error('Failed to fetch scan stats:', error)
        set(state => {
          state.scanStats = null
        })
      }
    },

    // Fetch scan analytics
    fetchScanAnalytics: async (repoFullName?: string, timeRange: string = 'week') => {
      try {
        return await api.scans.getScanAnalytics(repoFullName, timeRange as "day" | "week" | "month" | "year")
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics'
        toast.error(`Failed to fetch analytics: ${errorMessage}`)
        throw error
      }
    },

    // Fetch security metrics
    fetchSecurityMetrics: async () => {
      try {
        return await api.scans.getSecurityMetrics()
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch security metrics'
        toast.error(`Failed to fetch security metrics: ${errorMessage}`)
        throw error
      }
    },

    // Pagination and filtering
    setCurrentPage: (page: number) => {
      const { selectedRepository } = get()
      set(state => {
        state.currentPage = page
      })
      // Use explicit filters to avoid state timing issues
      void get().fetchScansWithFilters(selectedRepository)
    },

    setSeverityFilter: (severity: SecuritySeverity | null) => {
      set(state => {
        state.selectedSeverity = severity
        state.currentPage = 1 // Reset to first page
      })
    },

    setStatusFilter: async (status: ScanStatus | null) => {
      set(state => {
        state.selectedStatus = status
        state.currentPage = 1
        state.scans = [] // Clear existing scans to prevent showing stale data
        state.isLoading = true
        state.error = null
        state.totalScans = 0
        state.totalPages = 0
      })
      
      // Fetch scans with the new status filter
      const { selectedRepository } = get()
      await get().fetchScansWithFilters(selectedRepository)
    },

    setRepositoryFilter: async (repo: string | null) => {
      // setRepositoryFilter called
      
      // Clear current scans and show loading immediately to avoid stale data
      set(state => {
        state.selectedRepository = repo
        state.currentPage = 1
        state.scans = [] // Clear existing scans to prevent showing stale data
        state.isLoading = true
        state.error = null
        state.totalScans = 0
        state.totalPages = 0
      })
      
      // Fetch scans with the new repository filter
      await get().fetchScansWithFilters(repo)
    },

    setSearchQuery: (query: string) => {
      set(state => {
        state.searchQuery = query
        state.currentPage = 1
      })
    },

    clearFilters: async () => {
      set(state => {
        state.selectedSeverity = null
        state.selectedStatus = null
        state.selectedRepository = null
        state.searchQuery = ''
        state.currentPage = 1
        state.scans = [] // Clear existing scans
        state.isLoading = true
        state.totalScans = 0
        state.totalPages = 0
      })
      // Refetch all scans without filters
      await get().fetchScansWithFilters(null)
    },

    // UI helpers
    setCurrentScan: (scan: Scan | null) => {
      set(state => {
        state.currentScan = scan
      })
    },

    clearError: () => {
      set(state => {
        state.error = null
      })
    },

    // Computed getters
    getFilteredScans: () => {
      const { scans, searchQuery, selectedSeverity } = get()

      // Server-side filtering for repository and status is now handled
      // Only apply client-side filtering for search and severity (which aren't supported server-side yet)
      return scans.filter(scan => {
        // Search query (client-side only)
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (
            !scan.repo_full_name.toLowerCase().includes(query) &&
            !scan.branch.toLowerCase().includes(query) &&
            !scan.scan_type.toLowerCase().includes(query)
          ) {
            return false
          }
        }

        // Severity filter (client-side only - can be moved to server later)
        if (selectedSeverity) {
          const hasSeverity = Object.keys(scan.issue_summary).some(key => 
            key.toLowerCase().includes(selectedSeverity.toLowerCase())
          )
          if (!hasSeverity) {
            return false
          }
        }

        return true
      })
    },

    getScanStats: () => {
      const { scans, totalScans } = get()
      
      const byStatus: Record<string, number> = {}
      const bySeverity: Record<string, number> = {}
      const byRepository: Record<string, number> = {}

      scans.forEach(scan => {
        // Count by status
        byStatus[scan.status] = (byStatus[scan.status] || 0) + 1

        // Count by repository
        byRepository[scan.repo_full_name] = (byRepository[scan.repo_full_name] || 0) + 1

        // Count by severity (from issue summary)
        Object.entries(scan.issue_summary).forEach(([severity, count]) => {
          bySeverity[severity] = (bySeverity[severity] || 0) + count
        })
      })

      return {
        total: totalScans, // Use total from pagination metadata instead of current page count
        byStatus,
        bySeverity,
        byRepository
      }
    },

    getActiveScanCount: () => {
      const { activeScanJobs } = get()
      return Object.keys(activeScanJobs).length
    },

    getCriticalIssuesCount: () => {
      const { currentScan } = get()
      if (!currentScan) return 0
      return currentScan.issues.filter(issue => issue.severity === 'critical').length
    },
  }))
)