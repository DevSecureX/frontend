import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTimezone } from '@/contexts/TimezoneContext'
import { useSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import type { ChatSession } from '@/lib/api/ai-assistant';
import { aiAssistantAPI } from '@/lib/api/ai-assistant'
import { getRandomQuickTopics, getWelcomeTopics } from '@/utils/quickTopicSelector'
import type { QuickTopic } from '@/data/quickTopics'
import { ChatMessage, TypingIndicator } from '@/components/ai'
import '@/components/ui/animations.css'
import { 
  Bot, 
  MessageSquare,
  Send,
  History,
  X,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

interface ConversationMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    tool?: string
    category?: string
    severity?: string
    type?: string
  }
}

// This function is no longer needed - we'll use the timezone-aware formatting


// Simple loader for other uses
const SimpleLoader = () => (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
  </div>
)


// Small Chat History Dropdown Component
const ChatHistorySidebar = ({
  isOpen,
  onClose,
  connected,
  socketSessions,
  currentSessionId,
  joinSession,
  createSession,
  clearConversation,
  chatHistory,
  loadConversation,
  loadingHistory,
  formatRelativeDate
}: {
  isOpen: boolean
  onClose: () => void
  connected: boolean
  socketSessions: any[]
  currentSessionId: string | null
  joinSession: (id: string) => void
  createSession: (type: string, title: string) => void
  clearConversation: () => void
  chatHistory: ChatSession[]
  loadConversation: (sessionId: string) => void
  loadingHistory: boolean
  formatRelativeDate: (timestamp: string | Date | null | undefined) => string
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-transparent z-10"
        onClick={onClose}
      />
      
      {/* Small Dropdown */}
      <div className="absolute right-0 top-16 w-72 bg-background border rounded-lg shadow-lg z-20 max-h-80 overflow-hidden">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <span className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4" />
              Chat History
            </span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {/* New Chat Button */}
          <div className="p-2 border-b">
            <Button 
              size="sm"
              className="w-full h-8" 
              onClick={() => {
                // New Chat from dropdown clicked
                clearConversation()
                onClose()
              }}
            >
              <MessageSquare className="mr-2 h-3 w-3" />
              New Chat
            </Button>
          </div>
          
          {/* Chat List */}
          <div className="max-h-48 overflow-y-auto">
            <div className="p-1">
              {loadingHistory ? (
                <div className="flex items-center justify-center p-4">
                  <SimpleLoader />
                  <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  {/* Real chat history from API */}
                  {chatHistory.length > 0 ? (
                    chatHistory.slice(0, 8).map((session) => (
                      <Button
                        key={session.id}
                        variant={currentSessionId === session.id ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start text-left h-8 mb-1"
                        onClick={() => {
                          loadConversation(session.id)
                          onClose()
                        }}
                      >
                        <MessageSquare className="w-3 h-3 mr-2 flex-shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs truncate">{session.title || 'Untitled Chat'}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">
                              {formatRelativeDate(session.created_at)}
                            </span>
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">No chat history yet</p>
                      <p className="text-xs text-muted-foreground">Start a conversation!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}



export function AIAssistantPage() {
  const { formatTimeOnly, formatRelativeDate } = useTimezone()
  const { user, isAuthenticated } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [userMessage, setUserMessage] = useState('')
  const [allMessages, setAllMessages] = useState<ConversationMessage[]>([]) // Consolidated message array
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [quickTopics, setQuickTopics] = useState<QuickTopic[]>([])
  const [welcomeTopics, setWelcomeTopics] = useState<QuickTopic[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  // Socket.IO integration for real-time chat
  const {
    connected,
    sendMessage,
    createSession,
    joinSession,
    leaveSession,
    messages: socketMessages,
    sessions: socketSessions,
    isStreaming,
    currentSessionId: socketSessionId
  } = useSocket()

  // Handle URL parameters and session loading
  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('session')
    if (sessionIdFromUrl && sessionIdFromUrl !== currentSessionId) {
      // Loading session from URL
      setCurrentSessionId(sessionIdFromUrl)
      loadConversation(sessionIdFromUrl)
    }
  }, [searchParams])

  // Load chat history when component mounts and user is authenticated
  useEffect(() => {
    const loadHistoryIfAuthenticated = () => {
      const token = localStorage.getItem('auth_token')
      
      // Mount effect - checking auth status
      
      if (isAuthenticated && token && token.trim().length > 10 && user?.id) {
        // User fully authenticated, loading chat history
        loadChatHistory()
      } else {
        // Authentication incomplete, skipping chat history load
      }
    }
    
    // Increased delay to ensure auth store is fully initialized
    const timer = setTimeout(loadHistoryIfAuthenticated, 1500)
    return () => clearTimeout(timer)
  }, [isAuthenticated, user?.id])

  // Note: Session creation is now lazy - only created when user sends first message

  // Refresh chat history when socket sessions change (new session created)
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (connected && socketSessions.length > 0 && token && isAuthenticated) {
      // Socket sessions changed, refreshing history
      setTimeout(() => loadChatHistory(), 800)
    }
  }, [socketSessions.length, connected, isAuthenticated])

  // Load chat history from API with improved error handling
  const loadChatHistory = async (forceReload = false) => {
    try {
      setLoadingHistory(true)
      // Loading chat history
      
      // Check authentication more thoroughly
      const token = localStorage.getItem('auth_token')
      // Checking auth status
      
      if (!token || !isAuthenticated || !user) {
        // Not properly authenticated, skipping chat history load
        setChatHistory([])
        return
      }
      
      // Clean up empty sessions first
      try {
        // Cleaning up empty sessions
        const cleanupResult = await aiAssistantAPI.cleanupEmptySessions()
        if (cleanupResult.cleaned_sessions > 0) {
          // Cleaned up empty sessions
        }
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup empty sessions:', cleanupError)
        // Don't fail the entire operation if cleanup fails
      }

      // Call API with retry mechanism
      let sessions: any[] = []
      try {
        // Calling getSessions API
        sessions = await aiAssistantAPI.getSessions()
        // Chat history API success
        
        // Validate that sessions is actually an array
        if (!Array.isArray(sessions)) {
          // API returned non-array sessions, converting to array
          sessions = []
        }
        
      } catch (apiError: any) {
        console.error('❌ API Error:', {
          status: apiError.status,
          message: apiError.message,
          response: apiError.response?.data,
          fullError: apiError
        })
        
        // If it's a 401, try to refresh authentication
        if (apiError.status === 401) {
          // Authentication expired, attempting refresh
          toast.error('Session expired. Please refresh the page.')
        }
        throw apiError
      }
      
      setChatHistory(sessions)
      // Setting chat history with sessions
      
      if (sessions.length === 0) {
        // No chat sessions found - user has no chat history yet
        // Create a welcome session automatically
        if (forceReload) {
          // Creating initial welcome session
          try {
            const welcomeSession = await aiAssistantAPI.createSession({
              title: 'Welcome to DevSecureX AI',
              type: 'general'
            })
            // Welcome session created
            setChatHistory([welcomeSession])
            toast.success('Welcome! Your first AI chat session is ready.')
          } catch (createError) {
            console.error('❌ Failed to create welcome session:', createError)
          }
        }
      }
      
    } catch (error: any) {
      console.error('❌ Failed to load chat history:', error)
      
      if (error.status === 401) {
        console.log('🔐 Authentication error - user needs to login')
        toast.error('Authentication expired. Please log in again.')
      } else if (error.status === 403) {
        // Permission error - user not allowed to access chat history
        toast.error('Access denied to chat history.')
      } else if (error.status >= 500) {
        // Server error loading chat history
        toast.error('Server error. Please try again later.')
      } else {
        // Unknown error loading chat history
        toast.error('Failed to load chat history. Please try refreshing.')
      }
      
      setChatHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // Load a specific conversation
  const loadConversation = async (sessionId: string) => {
    try {
      setLoadingConversation(true)
      // Loading conversation for session
      
      const { session, messages } = await aiAssistantAPI.getSession(sessionId)
      // Session loaded
      
      // Convert API messages to local format
      const conversationMessages = messages.map(msg => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        metadata: msg.metadata
      })) as ConversationMessage[]
      
      // Converted messages
      
      // Clear socket messages and set all messages to the loaded conversation
      if (connected && leaveSession) {
        leaveSession() // Clear socket state
      }
      
      // Update consolidated message array and current session
      setAllMessages(conversationMessages)
      setCurrentSessionId(sessionId)
      
      // Update URL with session ID
      setSearchParams({ session: sessionId })
      
      // If connected to socket, try to join this session
      if (connected && joinSession) {
        // Joining socket session
        joinSession(sessionId)
      }
      
      toast.success(`📋 Loaded: ${session.title || 'Untitled Chat'}`)
      
    } catch (error) {
      console.error('❌ Failed to load conversation:', error)
      toast.error('Failed to load conversation')
    } finally {
      setLoadingConversation(false)
    }
  }

  // Fallback response when socket is not connected
  const sendFallbackMessage = () => {
    setIsTyping(true)
    
    setTimeout(() => {
      const fallbackResponse: ConversationMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `**DevSecureX AI Security Assistant**

I'm currently operating in offline mode. For the full experience with real-time analysis, please ensure your connection is stable.

**Available capabilities:**
- Security vulnerability analysis
- Code review and recommendations  
- OWASP compliance guidance
- Best practices consultation

*Connecting to our AI security platform...*`,
        timestamp: new Date(),
        metadata: { type: 'fallback_response' }
      }
      setAllMessages(prev => [...prev, fallbackResponse])
      setIsTyping(false)
    }, 1500)
  }

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'nearest' })
  }

  // Enhanced auto-scroll for streaming content with throttling
  const scrollToBottomForStreaming = useCallback(() => {
    // Use a small delay to ensure DOM has updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 50)
  }, [])

  // Throttled scroll function for streaming updates
  const throttledStreamingScroll = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout | null = null
      return () => {
        if (timeoutId) return
        timeoutId = setTimeout(() => {
          scrollToBottomForStreaming()
          timeoutId = null
        }, 100) // Throttle to max 10 scrolls per second
      }
    })(),
    [scrollToBottomForStreaming]
  )

  // Scroll to bottom when messages change and auto-focus input after AI response
  useEffect(() => {
    scrollToBottom()
    
    // Auto-focus input after AI response is complete
    if (!isTyping && !isStreaming && allMessages.length > 0) {
      const lastMessage = allMessages.slice(-1)[0]
      if (lastMessage && lastMessage.type === 'assistant') {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 500)
      }
    }
  }, [allMessages, isTyping, isStreaming])

  // Enhanced scrolling for streaming content
  useEffect(() => {
    if (isStreaming || isTyping) {
      scrollToBottomForStreaming()
    }
  }, [isStreaming, isTyping])

  // Scroll during socket message streaming with throttling
  useEffect(() => {
    if (socketMessages.length > 0) {
      const lastMessage = socketMessages[socketMessages.length - 1]
      if (lastMessage?.metadata?.streaming && lastMessage.content.length > 0) {
        throttledStreamingScroll()
      }
    }
  }, [socketMessages, throttledStreamingScroll])

  // Listen for AI response completion to refresh chat history (for title updates)
  useEffect(() => {
    const handleAIResponseComplete = () => {
      // AI response completed, refreshing chat history for title update
      setTimeout(() => {
        void loadChatHistory()
      }, 1000) // Give backend time to update the title
    }

    window.addEventListener('aiResponseComplete', handleAIResponseComplete as EventListener)
    
    return () => {
      window.removeEventListener('aiResponseComplete', handleAIResponseComplete as EventListener)
    }
  }, [loadChatHistory])

  const handleSendMessage = () => {
    if (!userMessage.trim()) return

    if (connected) {
      // Always send via Socket.IO when connected
      // The backend will auto-create session if none exists (lazy session creation)
      // Sending message via Socket.IO
      sendMessage(userMessage, currentSessionId || socketSessionId || '', {
        type: 'security_consultation',
        context: 'general_chat'
      })
    } else {
      // Offline fallback only when not connected
      // Using offline fallback - not connected
      const userMsg: ConversationMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      }
      setAllMessages(prev => [...prev, userMsg])
      sendFallbackMessage()
    }
    
    setUserMessage('')
    
    // Immediately scroll after sending message
    setTimeout(() => {
      scrollToBottom('smooth')
    }, 100)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleQuickTopicClick = (message: string) => {
    setUserMessage(message)
    
    if (connected) {
      // Always send via Socket.IO when connected
      // The backend will auto-create session if none exists (lazy session creation)
      // Sending quick topic via Socket.IO
      sendMessage(message, currentSessionId || socketSessionId || '', {
        type: 'security_consultation',
        context: 'quick_action'
      })
    } else {
      // Offline fallback only when not connected
      // Using offline fallback for quick topic - not connected
      const userMsg: ConversationMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
        timestamp: new Date()
      }
      setAllMessages(prev => [...prev, userMsg])
      sendFallbackMessage()
    }
    
    setUserMessage('')
    
    // Immediately scroll after sending quick topic message
    setTimeout(() => {
      scrollToBottom('smooth')
    }, 100)
  }

  const clearConversation = () => {
    // Starting new conversation
    
    // Clear ALL chat state immediately for instant feedback
    setAllMessages([])
    setCurrentSessionId(null)
    setIsTyping(false)
    setLoadingConversation(false)
    
    // Clear URL parameters
    setSearchParams({})
    
    // Leave current socket session to clear socket messages
    if (connected && leaveSession && (currentSessionId || socketSessionId)) {
      // Leaving current socket session
      leaveSession()
    }
    
    // Local state cleared
    
    // Don't create a session immediately - wait for user's first message
    // Ready for new conversation - session will be created when first message is sent
    toast.success('New conversation ready! 🎆')
  }

  // Sync socket messages with consolidated message array
  useEffect(() => {
    if (socketMessages.length > 0) {
      // Syncing socket messages with consolidated array
      
      // Filter out streaming placeholder messages to avoid duplicate display
      const filteredSocketMessages = socketMessages.filter(msg => !msg.metadata?.streaming)
      
      // Convert socket messages to our format and merge with existing messages
      const socketConverted = filteredSocketMessages.map(msg => {
        // CRITICAL FIX: Ensure proper timestamp parsing for socket messages
        let parsedTimestamp: Date
        try {
          // Handle both string and already-parsed timestamps
          if (typeof msg.timestamp === 'string') {
            let normalizedTimestamp = msg.timestamp.trim()

            // If the timestamp contains 'T' but no timezone info, assume UTC
            if (normalizedTimestamp.includes('T') &&
                !normalizedTimestamp.endsWith('Z') &&
                !normalizedTimestamp.includes('+') &&
                !normalizedTimestamp.includes('-', 10)) {
              normalizedTimestamp = `${normalizedTimestamp  }Z`
            }

            parsedTimestamp = new Date(normalizedTimestamp)
          } else {
            parsedTimestamp = new Date(msg.timestamp)
          }

          // Validate parsed date
          if (isNaN(parsedTimestamp.getTime())) {
            throw new Error('Invalid timestamp')
          }
        } catch (error) {
          console.warn('Failed to parse socket message timestamp:', error, msg.timestamp)
          parsedTimestamp = new Date() // Fallback to current time
        }

        return {
          id: msg.id,
          type: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: parsedTimestamp,
          metadata: msg.metadata
        }
      }) as ConversationMessage[]
      
      // If we have a current session loaded, append new socket messages
      // Otherwise, replace all messages with socket messages (new conversation)
      if (currentSessionId && allMessages.length > 0) {
        // Append only new messages that aren't already in allMessages
        const existingIds = new Set(allMessages.map(m => m.id))
        const newSocketMessages = socketConverted.filter(m => !existingIds.has(m.id))
        if (newSocketMessages.length > 0) {
          setAllMessages(prev => [...prev, ...newSocketMessages])
        }
      } else {
        // New conversation - use socket messages
        setAllMessages(socketConverted)
        
        // Update session ID if socket has created a new session
        if (socketSessionId && socketSessionId !== currentSessionId) {
          setCurrentSessionId(socketSessionId)
          setSearchParams({ session: socketSessionId })
        }
      }
    }
  }, [socketMessages, socketSessionId])

  // Initialize with new chat by default and load random topics
  useEffect(() => {
    // Don't clear if we have a session in URL
    const sessionIdFromUrl = searchParams.get('session')
    if (!sessionIdFromUrl) {
      setAllMessages([])
    }
    
    // Load random quick topics for sidebar
    const sidebarTopics = getRandomQuickTopics(6)
    setQuickTopics(sidebarTopics)
    
    // Load different welcome topics (excluding sidebar topics)
    setWelcomeTopics(getWelcomeTopics(sidebarTopics))
  }, [])

  // Function to refresh quick topics with new random selection
  const refreshQuickTopics = () => {
    const newSidebarTopics = getRandomQuickTopics(6)
    setQuickTopics(newSidebarTopics)
    
    // Also refresh welcome topics to avoid overlap
    setWelcomeTopics(getWelcomeTopics(newSidebarTopics))
    
    toast.success('🎲 New quick topics loaded!')
  }

  return (
    <div className="space-y-4 sm:space-y-6 flex flex-col relative w-full max-w-full">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-sm">
              <Bot className="h-5 w-5 text-white" />
            </div>
            {connected && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full border-2 border-background animate-pulse" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Security Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Comprehensive security consultation & analysis
            </p>
          </div>
        </div>
        
        {/* Enhanced Action Bar */}
        <div className="relative flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Connection Status - Minimal */}
          <div className={`hidden sm:flex items-center gap-2 px-2 py-1 rounded-md text-xs ${
            connected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-500' : 'bg-gray-400 animate-pulse'
            }`} />
            <span>{connected ? 'Online' : 'Connecting...'}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Refresh button clicked
              loadChatHistory(true)
            }}
            className="hidden sm:flex items-center gap-2 hover:bg-muted/50 transition-colors"
            title="Refresh chat history"
            disabled={loadingHistory}
          >
            <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // New chat clicked - clearConversation called
              clearConversation()
            }}
            className="flex items-center gap-2 hover:bg-muted/50 transition-colors"
            title="Start new chat"
            disabled={loadingHistory}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">New Chat</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              // Chat History button clicked
              setShowChatHistory(true)
            }}
            className="flex items-center gap-2 hover:bg-muted/50 transition-colors"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {Array.isArray(chatHistory) ? chatHistory.length : 0}
            </Badge>
          </Button>
          
          {/* Chat History Dropdown */}
          <ChatHistorySidebar
            isOpen={showChatHistory}
            onClose={() => setShowChatHistory(false)}
            connected={connected}
            socketSessions={socketSessions}
            currentSessionId={currentSessionId || socketSessionId}
            joinSession={joinSession}
            createSession={createSession}
            clearConversation={clearConversation}
            chatHistory={chatHistory}
            loadConversation={loadConversation}
            loadingHistory={loadingHistory}
            formatRelativeDate={formatRelativeDate}
          />
        </div>
      </div>

      {/* Main Content - Mobile-Optimized Layout */}
      <div className="flex flex-col lg:grid lg:gap-4 sm:gap-6 lg:grid-cols-4 flex-1 min-h-0 w-full max-w-full overflow-hidden space-y-4 sm:space-y-6 lg:space-y-0">
        {/* Enhanced Chat Interface */}
        <div className="lg:col-span-3 flex flex-col min-h-0 min-w-0 w-full overflow-hidden order-1 lg:order-none">
          <Card className="flex-1 flex flex-col min-h-0 border shadow-sm hover:shadow-md transition-shadow duration-200 w-full min-w-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 sm:py-3 px-3 sm:px-6 flex-shrink-0 bg-muted/10 border-b min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm sm:text-base font-semibold truncate">Security Consultation</CardTitle>
                  <p className="text-xs text-muted-foreground hidden sm:block">Real-time analysis & guidance</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {isStreaming && (
                  <div className="flex items-center gap-1 sm:gap-2 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" />
                    <span className="hidden sm:inline">Processing...</span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 min-h-0 w-full min-w-0 overflow-hidden">
              {/* Messages Area - Enhanced Mobile Scrolling */}
              <div className={`flex-1 px-3 sm:px-6 py-4 space-y-2 sm:space-y-3 min-h-0 w-full min-w-0 ${
                (allMessages.length > 0 || isTyping) 
                  ? 'overflow-y-auto overflow-x-hidden smooth-scroll' 
                  : 'flex items-center justify-center'
              }`}>
                {/* Loading Conversation */}
                {loadingConversation && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <SimpleLoader />
                    <p className="text-sm text-muted-foreground mt-3">Loading conversation...</p>
                  </div>
                )}
                
                {/* Clean Welcome Message - Mobile Optimized */}
                {!loadingConversation && allMessages.length === 0 && !isTyping && (
                  <div className="text-center space-y-4 sm:space-y-6 max-w-full overflow-hidden">
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                        Security Analysis
                      </h3>
                      <p className="text-sm sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Advanced vulnerability analysis, compliance guidance, and secure development practices
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto w-full overflow-hidden">
                      {welcomeTopics.map((topic) => {
                        const IconComponent = topic.icon
                        return (
                          <TooltipProvider key={topic.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="group p-3 sm:p-3 text-left bg-muted/20 hover:bg-muted/40 rounded-lg border border-border/20 hover:border-primary/30 transition-all duration-200 hover:shadow-sm w-full max-w-full overflow-hidden"
                                  onClick={() => handleQuickTopicClick(topic.message)}
                                >
                                  <div className="flex items-center gap-3 w-full max-w-full overflow-hidden min-w-0">
                                    <div className="p-1.5 rounded bg-background/50 group-hover:bg-primary/10 transition-colors flex-shrink-0">
                                      <IconComponent className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors flex-1 min-w-0 leading-relaxed overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', wordBreak: 'break-word'}}>
                                      {topic.text}
                                    </span>
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs z-50">
                                <p className="text-xs font-medium leading-relaxed">{topic.text}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      })}
                    </div>
                    
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <span className="hidden sm:inline">Try Quick Topics →</span>
                      <span className="sm:hidden">↑ Quick Topics</span>
                    </div>
                  </div>
                )}
                
                {/* Show all messages from consolidated array */}
                {allMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    role={message.type}
                    content={message.content}
                    timestamp={message.timestamp}
                    formatTimeOnly={formatTimeOnly}
                    onCopy={() => copyToClipboard(message.content)}
                    onContentChange={throttledStreamingScroll}
                    isStreaming={isStreaming && index === allMessages.length - 1 && message.type === 'assistant'}
                  />
                ))}
                
                {/* AI Thinking Indicator - show for fallback typing or initial streaming phase */}
                {isStreaming && socketMessages.some(msg => msg.metadata?.streaming && msg.content.length > 0) ? (
                  // Show streaming message as ChatMessage when content starts flowing
                  (() => {
                    const streamingMsg = socketMessages.find(msg => msg.metadata?.streaming)
                    return streamingMsg ? (
                      <ChatMessage
                        key="streaming"
                        id="streaming"
                        role="assistant"
                        content={streamingMsg.content}
                        timestamp={new Date(streamingMsg.timestamp)}
                        formatTimeOnly={formatTimeOnly}
                        onCopy={() => copyToClipboard(streamingMsg.content)}
                        onContentChange={throttledStreamingScroll}
                        isStreaming={true}
                      />
                    ) : null
                  })()
                ) : (
                  // Show thinking indicator when typing or when streaming just started
                  (isTyping || isStreaming) && <TypingIndicator onMount={scrollToBottomForStreaming} />
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Mobile-Optimized Chat Input Area */}
              <div className="border-t bg-background p-3 sm:p-4 flex-shrink-0 w-full min-w-0">
                <div className="relative max-w-4xl mx-auto w-full min-w-0">
                  <div className="relative flex items-end gap-2 sm:gap-3 bg-background rounded-2xl border-2 border-border shadow-sm focus-within:border-primary/60 focus-within:shadow transition-all duration-200 p-3 sm:p-3 w-full min-w-0">
                    <div className="flex-1 min-w-0">
                      <Textarea
                        ref={inputRef}
                        placeholder="Ask about security vulnerabilities, OWASP guidelines..."
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="min-h-[24px] sm:min-h-[24px] max-h-32 resize-none w-full text-base sm:text-sm bg-transparent border-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 p-0 leading-relaxed"
                        style={{ fontSize: '16px' }} // Prevent iOS zoom
                        disabled={isStreaming || isTyping}
                      />
                    </div>
                    
                    <button
                      onClick={handleSendMessage} 
                      disabled={!userMessage.trim() || isStreaming || isTyping}
                      className={`flex-shrink-0 w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        userMessage.trim() && !isStreaming && !isTyping
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md' 
                          : 'bg-muted-foreground/20 text-muted-foreground/50 cursor-not-allowed'
                      }`}
                    >
                      {isStreaming || isTyping ? (
                        <div className="w-3 h-3 sm:w-3 sm:h-3 rounded-full border border-current border-t-transparent animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 sm:h-4 sm:w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Topics Sidebar - Mobile-First */}
        <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden order-2 lg:order-none lg:block">
          <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200 w-full max-w-full overflow-hidden">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 w-full max-w-full overflow-hidden">
              <CardTitle className="text-sm sm:text-base flex items-center justify-between w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
                  <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <span className="font-semibold truncate block">Quick Topics</span>
                    <p className="text-xs text-muted-foreground font-normal mt-0.5 hidden sm:block leading-tight" style={{display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word'}}>
                      Security insights & actionable tips
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0 rounded-full"
                  onClick={refreshQuickTopics}
                  title="Get new random topics"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 pt-0 px-3 sm:px-6 w-full max-w-full overflow-hidden">
              <div className="w-full max-w-full overflow-hidden">
                {quickTopics.map((topic, index) => {
                  const IconComponent = topic.icon
                  
                  return (
                    <TooltipProvider key={topic.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full max-w-full justify-start text-left h-auto py-3 px-3 overflow-hidden hover:bg-muted/70 hover:border-primary/20 border border-transparent transition-all duration-200 group rounded-xl min-w-0"
                            onClick={() => handleQuickTopicClick(topic.message)}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-center gap-3 w-full max-w-full overflow-hidden min-w-0">
                              <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/10 transition-colors flex-shrink-0">
                                <IconComponent className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-sm font-medium group-hover:text-foreground transition-colors leading-relaxed overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', wordBreak: 'break-word'}}>
                                  {topic.text}
                                </p>
                                <div className="w-0 group-hover:w-6 h-0.5 bg-primary/20 rounded transition-all duration-300 mt-1" />
                              </div>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs z-50">
                          <p className="text-xs font-medium leading-relaxed">{topic.text}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}