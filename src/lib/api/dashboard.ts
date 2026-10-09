import { apiClient } from './client'

export interface DashboardCounts {
  security_scans: number
  repositories: number
  pull_requests: number
  ai_sessions: number
  total_issues: number
  resolved_issues: number
}

class DashboardAPI {
  async getCounts(): Promise<DashboardCounts> {
    const response = await apiClient.get<DashboardCounts>('/api/dashboard/counts')
    return response
  }
}

export const dashboardAPI = new DashboardAPI()