import { useState, useEffect, useRef, memo } from 'react'
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkdownRenderer } from './MarkdownRenderer'
import { useTimezone } from '@/contexts/TimezoneContext'
import { toast } from 'sonner'

interface ChatMessageProps {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date | string
  isStreaming?: boolean
  onCopy?: (content: string) => void
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void
  onContentChange?: () => void
  formatTimeOnly?: (date: Date) => string
  className?: string
}

export const ChatMessage = memo<ChatMessageProps>(({
  id,
  role,
  content,
  timestamp,
  isStreaming = false,
  onCopy,
  onFeedback,
  onContentChange,
  formatTimeOnly,
  className = ''
}) => {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const { formatTimeOnly: formatTimeWithTimezone } = useTimezone()
  const isUser = role === 'user'
  
  // Animation on mount
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.style.animation = 'messageSlideIn 0.4s ease-out forwards'
    }
  }, [])

  // Trigger content change callback when streaming content updates
  useEffect(() => {
    if (isStreaming && content && onContentChange) {
      onContentChange()
    }
  }, [content, isStreaming, onContentChange])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      onCopy?.(content)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy message')
    }
  }

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type)
    onFeedback?.(id, type)
    toast.success(`Thank you for your feedback!`)
  }

  const formatTime = () => {
    try {
      let messageTime: Date

      if (typeof timestamp === 'string') {
        // CRITICAL FIX: Enhanced timestamp parsing logic
        // Handle various timestamp formats from different sources
        let normalizedTimestamp = timestamp.trim()

        // If the timestamp contains 'T' (ISO format) but doesn't have timezone info,
        // assume it's UTC from the server
        if (normalizedTimestamp.includes('T') &&
            !normalizedTimestamp.endsWith('Z') &&
            !normalizedTimestamp.includes('+') &&
            !normalizedTimestamp.includes('-', 10)) {
          normalizedTimestamp = `${normalizedTimestamp  }Z`
        }

        messageTime = new Date(normalizedTimestamp)
      } else {
        messageTime = timestamp
      }

      // Validate the parsed date
      if (isNaN(messageTime.getTime())) {
        throw new Error('Invalid timestamp')
      }

      // Use timezone context formatter for consistent formatting
      if (formatTimeOnly) {
        return formatTimeOnly(messageTime)
      }

      // Use timezone-aware formatting
      return formatTimeWithTimezone(messageTime)
    } catch (error) {
      console.warn('Failed to format timestamp:', error, {
        originalTimestamp: timestamp,
        timestampType: typeof timestamp
      })

      // Fallback to current time formatted properly
      const now = new Date()
      return formatTimeWithTimezone ? formatTimeWithTimezone(now) :
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
    }
  }

  return (
    <div 
      ref={messageRef}
      className={`group mb-4 sm:mb-6 ${className}`}
      style={{ 
        opacity: 0,
        transform: 'translateY(10px)'
      }}
    >
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isUser ? 'gap-2 sm:gap-3' : 'gap-0 sm:gap-3'} w-full max-w-full`}>
        {/* Avatar - Only show for assistant, hidden on mobile for space optimization */}
        {!isUser && (
          <div className="hidden sm:flex flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 items-center justify-center shadow-sm">
            <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
        )}
        
        {/* Message Content - Mobile-Optimized with improved spacing */}
        <div className={`flex-1 min-w-0 max-w-full ${isUser ? 'items-end max-w-[85%] sm:max-w-[75%]' : 'items-start max-w-[95%] sm:max-w-[80%]'} flex flex-col overflow-hidden`}>
          
          {/* Message Bubble - only render if there's content */}
          {content.trim() && (
            <div className={`
              relative rounded-2xl sm:rounded-2xl px-3 py-3 sm:px-4 sm:py-3 shadow-sm border w-full min-w-0 max-w-full overflow-hidden
              ${isUser 
                ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-primary/20 self-end' 
                : 'bg-gradient-to-r from-muted/60 to-muted/40 border-border/60 self-start'
              }
              hover:shadow-md transition-all duration-200
            `}>
              {/* Message Content - Enhanced for Mobile */}
              <div className={`text-sm sm:text-sm leading-relaxed sm:leading-relaxed w-full min-w-0 overflow-hidden ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                {isUser ? (
                  // Simple text rendering for user messages with better mobile formatting
                  <div className="whitespace-pre-wrap break-words hyphens-auto max-w-full overflow-hidden">
                    {content}
                  </div>
                ) : (
                  // Enhanced markdown rendering for assistant messages with mobile optimization
                  <div className="max-w-full overflow-hidden">
                    <div className={`${isStreaming ? 'streaming-content' : ''} prose prose-sm max-w-none 
                      prose-p:leading-relaxed prose-p:mb-3 prose-p:mt-0 
                      prose-li:leading-relaxed prose-li:mb-1
                      prose-code:text-xs prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:bg-muted/80
                      prose-pre:text-xs prose-pre:leading-relaxed prose-pre:overflow-x-auto prose-pre:max-w-full
                      prose-a:break-words prose-a:hyphens-auto
                      prose-headings:leading-tight prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0
                    `}>
                      <MarkdownRenderer 
                        content={content}
                        className={isUser ? 'prose-invert' : ''}
                      />
                    </div>
                    {isStreaming && content.trim() && (
                      <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Message Actions - Mobile-Optimized */}
          {content.trim() && (
            <div className={`
              flex items-center gap-1 sm:gap-2 mt-2 transition-opacity duration-200 opacity-70 group-hover:opacity-100 min-w-0
              ${isUser ? 'justify-end' : 'justify-start'}
            `}>
            {/* Timestamp - More prominent on mobile */}
            <span className="text-xs text-muted-foreground px-1 sm:px-2 truncate font-medium">
              {formatTime()}
            </span>
            
            {/* Copy Button - Larger touch target on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-7 sm:w-7 p-0 hover:bg-muted/60 transition-colors flex-shrink-0 rounded-full"
              onClick={() => void handleCopy()}
              title="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3 sm:h-3 sm:w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 sm:h-3 sm:w-3 text-muted-foreground" />
              )}
            </Button>
            
            {/* Feedback Buttons - Only for assistant messages, larger touch targets */}
            {!isUser && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 sm:h-7 sm:w-7 p-0 transition-colors flex-shrink-0 rounded-full ${
                    feedback === 'positive' 
                      ? 'text-green-500 hover:text-green-600 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/40' 
                      : 'text-muted-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30'
                  }`}
                  onClick={() => handleFeedback('positive')}
                  title="Good response"
                >
                  <ThumbsUp className="h-3 w-3 sm:h-3 sm:w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 sm:h-7 sm:w-7 p-0 transition-colors flex-shrink-0 rounded-full ${
                    feedback === 'negative' 
                      ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40' 
                      : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                  onClick={() => handleFeedback('negative')}
                  title="Poor response"
                >
                  <ThumbsDown className="h-3 w-3 sm:h-3 sm:w-3" />
                </Button>
              </>
            )}
            </div>
          )}
        </div>
        
        {/* User Avatar - Only show for user messages */}
        {isUser && (
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-sm">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary-foreground" />
          </div>
        )}
      </div>
    </div>
  )
})

ChatMessage.displayName = 'ChatMessage'