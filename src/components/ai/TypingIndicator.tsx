import { memo, useEffect } from 'react'
import { Bot } from 'lucide-react'

interface TypingIndicatorProps {
  className?: string
  showAvatar?: boolean
  onMount?: () => void
}

export const TypingIndicator = memo<TypingIndicatorProps>(({ 
  className = '',
  showAvatar = true,
  onMount
}) => {
  // Trigger scroll when typing indicator mounts
  useEffect(() => {
    if (onMount) {
      onMount()
    }
  }, [onMount])
  return (
    <div className={`group mb-6 ${className}`}>
      <div className="flex justify-start gap-3 max-w-none">
        {/* Avatar */}
        {showAvatar && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <Bot className="h-4 w-4 text-white" />
          </div>
        )}
        
        {/* Typing Bubble */}
        <div className="flex-1 max-w-[85%] items-start flex flex-col">
          <div className="
            relative rounded-2xl px-4 py-3 shadow-sm border
            bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 self-start
            hover:shadow-md transition-all duration-200
          ">
            <div className="flex items-center space-x-2">
              {/* Animated Dots */}
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
              </div>
              
              {/* Typing Text */}
              <span className="text-xs text-muted-foreground animate-pulse">
                AI is thinking...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

TypingIndicator.displayName = 'TypingIndicator'