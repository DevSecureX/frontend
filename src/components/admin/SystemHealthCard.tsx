import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap,
  Database,
  Server,
  Activity,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface SystemHealthCardProps {
  className?: string
}

export function SystemHealthCard({ className }: SystemHealthCardProps) {
  const { data: systemHealth, isLoading, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.admin.getSystemHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: workersStatus } = useQuery({
    queryKey: ['workers-status'],
    queryFn: () => api.admin.getWorkersStatus(),
    refetchInterval: 15000, // Refresh every 15 seconds
  })

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-500' : 'text-red-500'
    }
    switch (status) {
      case 'ok':
      case 'healthy':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'error':
      case 'critical':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const _getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? CheckCircle2 : XCircle
    }
    switch (status) {
      case 'ok':
      case 'healthy':
        return CheckCircle2
      case 'warning':
        return AlertTriangle
      case 'error':
      case 'critical':
        return XCircle
      default:
        return AlertTriangle
    }
  }

  const calculateOverallHealth = () => {
    if (!systemHealth) return 'unknown'
    
    const checks = [
      systemHealth.database,
      systemHealth.services?.razorpay !== false, // Optional service
    ]
    
    const healthyCount = checks.filter(Boolean).length
    const totalChecks = checks.length
    
    if (healthyCount === totalChecks) return 'healthy'
    if (healthyCount > totalChecks / 2) return 'warning'
    return 'critical'
  }

  const overallHealth = calculateOverallHealth()

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Health
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={
                overallHealth === 'healthy' ? 'default' :
                overallHealth === 'warning' ? 'secondary' : 'destructive'
              }
            >
              {overallHealth}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { void refetch() }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Real-time system status and service monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Services */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Core Services</h4>
          <div className="grid gap-3">
            {/* Database */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className={`h-5 w-5 ${getStatusColor(systemHealth?.database ?? false)}`} />
                <div>
                  <span className="font-medium">Database</span>
                  <p className="text-sm text-muted-foreground">PostgreSQL Connection</p>
                </div>
              </div>
              <Badge variant={systemHealth?.database ? 'default' : 'destructive'}>
                {systemHealth?.database ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>

            {/* API Service */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-green-500" />
                <div>
                  <span className="font-medium">API Service</span>
                  <p className="text-sm text-muted-foreground">FastAPI Backend</p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            {/* Payment Service */}
            {systemHealth?.services && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className={`h-5 w-5 ${getStatusColor(systemHealth.services.razorpay || false)}`} />
                  <div>
                    <span className="font-medium">Payment Service</span>
                    <p className="text-sm text-muted-foreground">Razorpay Integration</p>
                  </div>
                </div>
                <Badge variant={systemHealth.services.razorpay ? 'default' : 'secondary'}>
                  {systemHealth.services.razorpay ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Workers Status */}
        {workersStatus && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Background Workers</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Workers</span>
                <span className="font-medium">
                  {workersStatus.workers?.active_workers || 0} / {workersStatus.workers?.total_capacity || 0}
                </span>
              </div>
              <Progress 
                value={
                  workersStatus.workers?.total_capacity 
                    ? (workersStatus.workers.active_workers / workersStatus.workers.total_capacity) * 100 
                    : 0
                } 
              />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Queue Size</span>
                  <p className="font-medium">{workersStatus.workers?.queue_size || 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Processed Today</span>
                  <p className="font-medium">{workersStatus.workers?.processed_today || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Environment Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Environment</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Environment</span>
              <p className="font-medium">
                {systemHealth?.app_env ?? 'Unknown'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">JWT Expiry</span>
              <p className="font-medium">
                {systemHealth?.jwt_expire_minutes ? `${systemHealth.jwt_expire_minutes}min` : 'Default'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={() => { void refetch() }}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/admin', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Admin Panel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}