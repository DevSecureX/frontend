import { apiClient } from './client'

export interface SupportQuery {
  id: number
  subject: string
  category: string
  priority: string
  message: string
  status: string
  created_at: string
  updated_at?: string
  resolved_at?: string
  responses?: SupportResponse[]
}

export interface SupportResponse {
  id: number
  message: string
  is_admin_response: boolean
  created_at: string
  responder_id?: number
}

export interface SupportQueryCreate {
  subject: string
  category: string
  priority: string
  message: string
}

export interface SupportResponseCreate {
  message: string
}

export interface SupportQueryUpdate {
  status?: string
}

export interface GetQueriesParams {
  status?: string
  category?: string
  limit?: number
  offset?: number
}

class SupportAPI {
  /**
   * Create a new support query
   */
  async createQuery(data: SupportQueryCreate): Promise<SupportQuery> {
    const response = await apiClient.post('/support/queries', data)
    return response.data
  }

  /**
   * Get user's support queries with optional filtering
   */
  async getUserQueries(params: GetQueriesParams = {}): Promise<SupportQuery[]> {
    const searchParams = new URLSearchParams()
    
    if (params.status) searchParams.append('status', params.status)
    if (params.category) searchParams.append('category', params.category)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())
    
    const response = await apiClient.get(`/support/queries?${searchParams.toString()}`)
    return response.data
  }

  /**
   * Get a specific support query with all responses
   */
  async getQuery(queryId: number): Promise<SupportQuery> {
    const response = await apiClient.get(`/support/queries/${queryId}`)
    return response.data
  }

  /**
   * Add a response/follow-up to an existing support query
   */
  async addResponse(queryId: number, data: SupportResponseCreate): Promise<SupportResponse> {
    const response = await apiClient.post(`/support/queries/${queryId}/responses`, data)
    return response.data
  }

  /**
   * Update a support query (mainly for changing status)
   */
  async updateQuery(queryId: number, data: SupportQueryUpdate): Promise<SupportQuery> {
    const response = await apiClient.put(`/support/queries/${queryId}`, data)
    return response.data
  }

  /**
   * Admin: Get all support queries (when admin role is implemented)
   */
  async getAllQueries(params: GetQueriesParams & { 
    priority?: string 
  } = {}): Promise<SupportQuery[]> {
    const searchParams = new URLSearchParams()
    
    if (params.status) searchParams.append('status', params.status)
    if (params.priority) searchParams.append('priority', params.priority)
    if (params.category) searchParams.append('category', params.category)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())
    
    const response = await apiClient.get(`/support/admin/queries?${searchParams.toString()}`)
    return response.data
  }
}

export const supportAPI = new SupportAPI()