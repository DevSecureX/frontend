import { useEffect, useRef, useState, useCallback } from 'react'
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

interface SocketMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

interface UseSocketReturn {
  socket: Socket | null
  connected: boolean
  sendMessage: (content: string, sessionId: string, context?: Record<string, any>) => void
  createSession: (type?: string, title?: string, metadata?: Record<string, any>) => void
  joinSession: (sessionId: string) => void
  leaveSession: () => void
  getSessions: () => void
  messages: SocketMessage[]
  sessions: any[]
  isStreaming: boolean
  currentSessionId: string | null
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<SocketMessage[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  
  const { token } = useAuthStore()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!token) return

    const socketInstance = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8010', {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })

    // Connection events
    socketInstance.on('connect', () => {
      setConnected(true)
      reconnectAttempts.current = 0
    })

    socketInstance.on('disconnect', () => {
      setConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      reconnectAttempts.current++

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        socketInstance.disconnect()
        setConnected(false)
      }
    })

    // AI Assistant events
    socketInstance.on('connected', () => {
      // Connection acknowledgement
    })

    socketInstance.on('session_created', (data) => {
      setCurrentSessionId(data.session_id)
    })

    socketInstance.on('session_joined', (data) => {
      setCurrentSessionId(data.session.session_id)
      
      // Load chat history if available
      if (data.history && Array.isArray(data.history)) {
        const historyMessages = data.history.map((msg: any) => ({
          id: msg.message_id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.msg_meta || {}
        }))
        setMessages(historyMessages)
      }
    })

    socketInstance.on('message_received', (data) => {
      // User message confirmation - add to messages if not already there
      const userMessage: SocketMessage = {
        id: data.message_id,
        role: data.role,
        content: data.content,
        timestamp: data.timestamp,
        metadata: data.msg_meta || {}
      }
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.id === data.message_id)
        return exists ? prev : [...prev, userMessage]
      })
    })

    socketInstance.on('ai_typing', (data) => {
      setIsStreaming(data.typing)

      if (data.typing) {
        // Add placeholder for streaming content accumulation
        // CRITICAL FIX: Ensure UTC timestamp for consistent timezone handling
        const utcTimestamp = new Date().toISOString()
        const placeholderMessage: SocketMessage = {
          id: `streaming-${Date.now()}`,
          role: 'assistant',
          content: '',
          timestamp: utcTimestamp,
          metadata: { streaming: true }
        }
        setMessages(prev => [...prev, placeholderMessage])
      }
    })

    socketInstance.on('ai_chunk', (data) => {
      // Update the streaming message with new content
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage?.metadata?.streaming) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: lastMessage.content + data.content
            }
          ]
        }
        return prev
      })
    })

    socketInstance.on('ai_complete', (data) => {
      setIsStreaming(false)
      
      // Replace streaming message with final message
      setMessages(prev => {
        const withoutStreaming = prev.filter(msg => !msg.metadata?.streaming)
        const finalMessage: SocketMessage = {
          id: data.message.message_id,
          role: 'assistant',
          content: data.message.content,
          timestamp: data.message.timestamp,
          metadata: data.message.msg_meta || {}
        }
        return [...withoutStreaming, finalMessage]
      })
      
      // Notify parent component that AI response completed (for title refresh)
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('aiResponseComplete', {
          detail: { sessionId: data.message.session_id }
        }))
      }
    })

    socketInstance.on('ai_error', (data) => {
      console.error('AI response error:', data)
      setIsStreaming(false)

      // Remove streaming message and add error message
      setMessages(prev => {
        const withoutStreaming = prev.filter(msg => !msg.metadata?.streaming)
        // CRITICAL FIX: Ensure UTC timestamp for consistent timezone handling
        const utcTimestamp = new Date().toISOString()
        const errorMessage: SocketMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `I apologize, but I encountered an error: ${data.error}. Please try again.`,
          timestamp: utcTimestamp,
          metadata: { error: true }
        }
        return [...withoutStreaming, errorMessage]
      })
    })

    socketInstance.on('sessions_list', (data) => {
      setSessions(data.sessions || [])
    })

    socketInstance.on('error', (data) => {
      console.error('Socket error:', data)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
      setSocket(null)
      setConnected(false)
      setMessages([])
      setSessions([])
      setCurrentSessionId(null)
      initializedRef.current = false
    }
  }, [token])

  const sendMessage = useCallback((content: string, sessionId: string, context?: Record<string, any>) => {
    if (!socket || !connected) {
      console.error('Socket not connected')
      return
    }

    socket.emit('send_message', {
      message: content,
      context,
      type: 'text'
    })
  }, [socket, connected])

  const createSession = useCallback((type = 'general', title?: string, metadata?: Record<string, any>) => {
    if (!socket || !connected) {
      console.error('Socket not connected')
      return
    }

    socket.emit('create_session', {
      session_type: type,
      title,
      metadata
    })
  }, [socket, connected])

  const joinSession = useCallback((sessionId: string) => {
    if (!socket || !connected) {
      console.error('Socket not connected')
      return
    }

    socket.emit('join_session', {
      session_id: sessionId
    })
  }, [socket, connected])

  const leaveSession = useCallback(() => {
    if (!socket || !connected) {
      return
    }

    setCurrentSessionId(null)
    setMessages([])
  }, [socket, connected])

  const getSessions = useCallback(() => {
    if (!socket || !connected) {
      console.error('Socket not connected')
      return
    }

    socket.emit('get_sessions', { limit: 20 })
  }, [socket, connected])

  // Handle initial session setup - separate from socket connection
  useEffect(() => {
    if (connected && !initializedRef.current) {
      initializedRef.current = true
      getSessions()
    }
  }, [connected, getSessions])

  return {
    socket,
    connected,
    sendMessage,
    createSession,
    joinSession,
    leaveSession,
    getSessions,
    messages,
    sessions,
    isStreaming,
    currentSessionId
  }
}