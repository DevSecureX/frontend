import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, Clock, Zap, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTimezone } from '@/contexts/TimezoneContext'
import { SecurityLoaders, type SecurityLoaderType } from '@/components/ui/security-loaders'

interface ScanProgressData {
  scanId: string
  repositoryName: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  stage: string
  message?: string
  startedAt: string
  completedAt?: string
  vulnerabilities?: number
  error?: string
}

interface ScanProgressCardProps {
  scan: ScanProgressData
  onRemove?: (scanId: string) => void
  onViewResults?: (scanId: string) => void
}

export function ScanProgressCard({ scan: initialScan, onRemove, onViewResults }: ScanProgressCardProps) {
  const [scan] = useState<ScanProgressData>(initialScan)
  const { formatRelativeDate } = useTimezone()

  const getSecurityLoader = (): SecurityLoaderType => {
    const { status, type, stage } = scan

    // Map scan status to appropriate loader
    switch (status) {
      case 'pending':
        return 'queue'
      case 'running':
        // Use specific loader based on scan type or stage
        if (type.toLowerCase().includes('sast') || stage?.toLowerCase().includes('code')) {
          return 'sast'
        }
        if (type.toLowerCase().includes('secret') || stage?.toLowerCase().includes('secret')) {
          return 'secrets'
        }
        if (type.toLowerCase().includes('dependency') || stage?.toLowerCase().includes('dependency')) {
          return 'dependency'
        }
        // Default to comprehensive scanner for running scans
        return 'shield'
      case 'completed':
      case 'failed':
      default:
        // Use radar for completed/failed as it's more subtle
        return 'radar'
    }
  }

  const getStatusIcon = () => {
    switch (scan.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />
      case 'running':
        return <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = () => {
    switch (scan.status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getProgressColor = () => {
    switch (scan.status) {
      case 'completed':
        return '[&>div]:bg-green-500'
      case 'failed':
        return '[&>div]:bg-red-500'
      case 'running':
        return '[&>div]:bg-blue-500'
      default:
        return '[&>div]:bg-yellow-500'
    }
  }

  const formatDuration = () => {
    // For duration, we calculate relative time from start
    return formatRelativeDate(scan.startedAt)
  }

  const handleRemove = () => {
    onRemove?.(scan.scanId)
  }

  const handleViewResults = () => {
    onViewResults?.(scan.scanId)
  }

  const LoaderComponent = SecurityLoaders[getSecurityLoader()]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LoaderComponent size="sm" progress={scan.progress} />
            <CardTitle className="text-sm font-medium">
              {scan.repositoryName}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {scan.type}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor()}>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className="capitalize">{scan.status}</span>
              </div>
            </Badge>
            
            {(scan.status === 'completed' || scan.status === 'failed') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {scan.message && (
          <CardDescription className="text-xs">
            {scan.message}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {scan.status !== 'pending' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {scan.stage || 'Processing...'}
              </span>
              <span className="font-medium">
                {Math.round(scan.progress)}%
              </span>
            </div>
            <Progress 
              value={scan.progress} 
              className={`h-2 ${getProgressColor()}`}
            />
          </div>
        )}

        {/* Scan Details */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium">{formatDuration()}</p>
          </div>
          
          {scan.status === 'completed' && scan.vulnerabilities !== undefined && (
            <div>
              <p className="text-muted-foreground">Vulnerabilities</p>
              <div className="flex items-center gap-1">
                <p className="font-medium">{scan.vulnerabilities}</p>
                {scan.vulnerabilities > 0 && (
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                )}
              </div>
            </div>
          )}
          
          {scan.status === 'failed' && scan.error && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Error</p>
              <p className="font-medium text-red-600 text-xs truncate" title={scan.error}>
                {scan.error}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {scan.status === 'completed' && (
          <Button
            size="sm"
            onClick={handleViewResults}
            className="w-full"
          >
            View Results
          </Button>
        )}
        
        {scan.status === 'failed' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewResults}
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              size="sm"
              onClick={() => {
                // Trigger retry - in real app this would call the scan API
                console.log('Retrying scan:', scan.scanId)
              }}
              className="flex-1"
            >
              Retry Scan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Container component for multiple scan progress cards
interface ScanProgressListProps {
  scans: ScanProgressData[]
  onRemove?: (scanId: string) => void
  onViewResults?: (scanId: string) => void
}

export function ScanProgressList({ scans, onRemove, onViewResults }: ScanProgressListProps) {

  const handleRemove = (scanId: string) => {
    onRemove?.(scanId)
  }

  const handleViewResults = (scanId: string) => {
    onViewResults?.(scanId)
  }

  if (scans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Shield className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No active scans</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {scans.map((scan) => (
        <ScanProgressCard
          key={scan.scanId}
          scan={scan}
          onRemove={handleRemove}
          onViewResults={handleViewResults}
        />
      ))}
    </div>
  )
}