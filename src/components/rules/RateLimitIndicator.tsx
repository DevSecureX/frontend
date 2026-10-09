import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

interface RateLimitIndicatorProps {
  endpoint?: string
  className?: string
}

interface RateLimitInfo {
  remaining: number
  limit: number
  reset: number // Unix timestamp
}

export function RateLimitIndicator({ endpoint = 'custom_rules', className = '' }: RateLimitIndicatorProps) {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null)
  const [timeUntilReset, setTimeUntilReset] = useState<string>('')

  // Get rate limit info from response headers
  useEffect(() => {
    const checkRateLimit = () => {
      // This would be populated from actual API response headers
      const headers = window.localStorage.getItem(`rateLimit_${endpoint}`)
      if (headers) {
        const info = JSON.parse(headers)
        setRateLimitInfo(info)
      }
    }

    checkRateLimit()
    const interval = setInterval(checkRateLimit, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [endpoint])

  // Calculate time until reset
  useEffect(() => {
    if (!rateLimitInfo?.reset) return

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const secondsUntilReset = Math.max(0, rateLimitInfo.reset - now)
      
      if (secondsUntilReset === 0) {
        setTimeUntilReset('Resetting...')
        return
      }

      const minutes = Math.floor(secondsUntilReset / 60)
      const seconds = secondsUntilReset % 60
      
      if (minutes > 0) {
        setTimeUntilReset(`${minutes}m ${seconds}s`)
      } else {
        setTimeUntilReset(`${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [rateLimitInfo?.reset])

  if (!rateLimitInfo) return null

  const percentageUsed = ((rateLimitInfo.limit - rateLimitInfo.remaining) / rateLimitInfo.limit) * 100
  const isWarning = rateLimitInfo.remaining < 5
  const isError = rateLimitInfo.remaining === 0

  if (isError) {
    return (
      <Alert variant="destructive" className={className}>
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Rate limit exceeded. Please wait {timeUntilReset} before making more requests.
        </AlertDescription>
      </Alert>
    )
  }

  if (isWarning) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Only {rateLimitInfo.remaining} requests remaining. Resets in {timeUntilReset}</span>
          <Badge variant="outline" className="ml-2">
            {rateLimitInfo.remaining}/{rateLimitInfo.limit}
          </Badge>
        </AlertDescription>
      </Alert>
    )
  }

  // Normal state - show as a subtle indicator
  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <CheckCircle className="h-3 w-3 text-green-500" />
      <span>API Limits OK</span>
      <Progress value={percentageUsed} className="w-20 h-1" />
      <span>{rateLimitInfo.remaining}/{rateLimitInfo.limit}</span>
    </div>
  )
}

// Hook to update rate limit info from API responses
export function useRateLimitTracking() {
  const updateRateLimitInfo = (endpoint: string, headers: Headers) => {
    const remaining = headers.get('x-ratelimit-remaining')
    const limit = headers.get('x-ratelimit-limit')
    const reset = headers.get('x-ratelimit-reset')

    if (remaining && limit && reset) {
      const info: RateLimitInfo = {
        remaining: parseInt(remaining),
        limit: parseInt(limit),
        reset: parseInt(reset)
      }
      
      window.localStorage.setItem(`rateLimit_${endpoint}`, JSON.stringify(info))
    }
  }

  return { updateRateLimitInfo }
}