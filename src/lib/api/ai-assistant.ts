import { apiClient } from './client'

export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: number
  type: string
  message_count?: number
  metadata?: Record<string, any>
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface CreateSessionRequest {
  title?: string
  type?: string
  metadata?: Record<string, any>
}

class AIAssistantAPI {
  // Chat Sessions
  async createSession(data: CreateSessionRequest): Promise<ChatSession> {
    const response = await apiClient.post('/ai-assistant/sessions', {
      session_type: data.type || 'general',
      title: data.title
    })

    // Since apiClient.post() returns response.data directly, response is the actual data
    const sessionData = response.data || response

    const mappedSession = {
      id: sessionData.session_id,
      title: sessionData.title,
      created_at: sessionData.created_at,
      updated_at: sessionData.created_at,
      user_id: 0, // Will be filled by backend
      type: sessionData.session_type,
      message_count: sessionData.message_count || 0,
      metadata: {}
    }
    return mappedSession
  }

  async getSessions(): Promise<ChatSession[]> {
    // Call the API and get the response
    const response = await apiClient.get('/ai-assistant/sessions')

    // Since apiClient.get() already returns response.data,
    // the response here should be the actual data, not wrapped in { data: ... }
    const sessions = Array.isArray(response) ? response : (response?.data || response || [])

    if (!Array.isArray(sessions)) {
      return []
    }

    const mappedSessions = sessions.map((session: any) => ({
      id: session.session_id,
      title: session.title,
      created_at: session.created_at,
      updated_at: session.updated_at,
      user_id: 0,
      type: session.session_type,
      message_count: session.message_count || 0,
      metadata: {}
    }))

    return mappedSessions
  }

  async getSession(sessionId: string): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
    const response = await apiClient.get(`/ai-assistant/sessions/${sessionId}`)

    // Since apiClient.get() returns response.data directly, response is the actual data
    const sessionData = response.data || response
    
    return {
      session: {
        id: sessionData.session.session_id,
        title: sessionData.session.title,
        created_at: sessionData.session.created_at,
        updated_at: sessionData.session.updated_at,
        user_id: 0,
        type: sessionData.session.session_type,
        metadata: sessionData.session.session_meta || {}
      },
      messages: sessionData.messages.map((msg: any) => ({
        id: msg.message_id,
        session_id: sessionId,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.msg_meta || {}
      }))
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/ai-assistant/sessions/${sessionId}`)
  }

  // Chat Messages
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get(`/ai-assistant/sessions/${sessionId}/messages`)

    // Since apiClient.get() returns response.data directly, response is the actual data
    const messagesData = Array.isArray(response) ? response : (response?.data || response || [])
    
    return messagesData.map((msg: any) => ({
      id: msg.message_id,
      session_id: sessionId,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      metadata: msg.msg_meta || {}
    }))
  }

  // Clean up empty sessions
  async cleanupEmptySessions(): Promise<{message: string, cleaned_sessions: number}> {
    const response = await apiClient.post('/ai-assistant/sessions/cleanup')
    return response.data || response
  }

  // AI Health Check
  async getHealth(): Promise<any> {
    const response = await apiClient.get('/ai-assistant/health')

    // Since apiClient.get() returns response.data directly, response is the actual data
    return response.data || response
  }
}

export const aiAssistantAPI = new AIAssistantAPI()