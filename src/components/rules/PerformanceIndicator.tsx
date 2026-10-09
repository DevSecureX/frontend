import { Zap, TrendingUp, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface PerformanceIndicatorProps {
  loadTime?: number
  fromCache?: boolean
  optimizationLevel?: 'high' | 'medium' | 'low'
  className?: string
}

export function PerformanceIndicator({ 
  loadTime, 
  fromCache, 
  optimizationLevel = 'high',
  className = ''
}: PerformanceIndicatorProps) {
  if (!loadTime && !fromCache) return null

  const getOptimizationColor = () => {
    switch (optimizationLevel) {
      case 'high': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  const getLoadTimeColor = (time: number) => {
    if (time < 100) return 'text-green-500'
    if (time < 500) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        {fromCache && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 px-2 py-0.5">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span>Cached</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Data loaded from cache for instant response</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {loadTime !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 px-2 py-0.5">
                <Clock className={`h-3 w-3 ${getLoadTimeColor(loadTime)}`} />
                <span>{loadTime}ms</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Response time: {loadTime}ms</p>
              <p className="text-xs text-muted-foreground mt-1">
                {loadTime < 100 ? 'Excellent performance' :
                 loadTime < 500 ? 'Good performance' :
                 'Consider optimization'}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {optimizationLevel === 'high' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <TrendingUp className={`h-3 w-3 ${getOptimizationColor()}`} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Performance optimized with parallel processing</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

// Hook to track performance metrics
export function usePerformanceTracking() {
  const startTime = performance.now()
  
  const calculateLoadTime = () => {
    return Math.round(performance.now() - startTime)
  }
  
  const checkCacheHeaders = (response: any) => {
    // Check if response has cache indicators
    return response?.headers?.['x-cache-hit'] === 'true' || 
           response?.meta?.fromCache === true
  }
  
  return {
    calculateLoadTime,
    checkCacheHeaders
  }
}