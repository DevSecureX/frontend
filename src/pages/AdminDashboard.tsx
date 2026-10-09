import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTimezone } from '@/contexts/TimezoneContext'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { 
  Settings,
  Activity,
  Users,
  Database,
  Server,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Download,
  Upload,
  Shield,
  Eye,
  EyeOff,
  Zap,
  HardDrive,
  Cpu,
  Wifi
} from 'lucide-react'

export function AdminDashboard() {
  const queryClient = useQueryClient()
  const { formatDate } = useTimezone()
  
  // State for queue management
  const [queuePaused, setQueuePaused] = useState(false)

  // Fetch admin data
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: () => api.admin.getSystemHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: workersStatus, isLoading: workersLoading } = useQuery({
    queryKey: ['admin-workers-status'],
    queryFn: () => api.admin.getWorkersStatus(),
    refetchInterval: 15000, // Refresh every 15 seconds
  })

  const { data: integrityCheck, isLoading: integrityLoading } = useQuery({
    queryKey: ['admin-database-integrity'],
    queryFn: () => api.admin.getDatabaseIntegrity(),
  })

  const { data: queueStats, isLoading: queueLoading } = useQuery({
    queryKey: ['admin-queue-stats'],
    queryFn: () => api.admin.getQueueStats(),
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  const { data: securityAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['admin-security-alerts'],
    queryFn: () => api.admin.getSecurityAlerts(),
    refetchInterval: 60000, // Refresh every minute
  })

  const { data: systemMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-system-metrics'],
    queryFn: () => api.admin.getSystemMetrics(),
    refetchInterval: 30000,
  })

  // Mutations
  const cleanupMutation = useMutation({
    mutationFn: () => api.admin.performCleanup(),
    onSuccess: (data) => {
      toast.success(`Cleanup completed: ${data.login_attempts_removed} items removed`)
      queryClient.invalidateQueries({ queryKey: ['admin-database-integrity'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Cleanup failed')
    },
  })

  const pauseQueueMutation = useMutation({
    mutationFn: () => api.admin.pauseQueue(),
    onSuccess: () => {
      setQueuePaused(true)
      toast.success('Queue paused successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to pause queue')
    },
  })

  const resumeQueueMutation = useMutation({
    mutationFn: () => api.admin.resumeQueue(),
    onSuccess: () => {
      setQueuePaused(false)
      toast.success('Queue resumed successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resume queue')
    },
  })

  const clearFailedJobsMutation = useMutation({
    mutationFn: () => api.admin.clearFailedJobs(),
    onSuccess: (data) => {
      toast.success(`Cleared ${data.cleared_jobs} failed jobs`)
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clear failed jobs')
    },
  })

  const retryFailedJobsMutation = useMutation({
    mutationFn: () => api.admin.retryFailedJobs(),
    onSuccess: (data) => {
      toast.success(`Retried ${data.retried_jobs} failed jobs`)
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to retry failed jobs')
    },
  })

  const createBackupMutation = useMutation({
    mutationFn: () => api.admin.createBackup(),
    onSuccess: (data) => {
      toast.success(`Backup created: ${data.backup_id}`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Backup creation failed')
    },
  })

  const getHealthColor = (status: boolean) => {
    return status ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
  }

  const getHealthIcon = (status: boolean) => {
    return status ? CheckCircle2 : AlertTriangle
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh All
          </Button>
          <Button 
            onClick={() => createBackupMutation.mutate()}
            disabled={createBackupMutation.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            Create Backup
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Health Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {systemHealth?.status === 'ok' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
                  )}
                  <span className="text-lg font-bold">
                    {systemHealth?.status === 'ok' ? 'Healthy' : 'Issues'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Environment: {systemHealth?.app_env}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workersStatus?.workers?.active_workers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Capacity: {workersStatus?.workers?.total_capacity || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queue Size</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {queueStats?.queued || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Processing: {queueStats?.processing || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500 dark:text-red-400">
                  {securityAlerts?.filter(alert => !alert.resolved).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unresolved alerts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button 
                  onClick={() => cleanupMutation.mutate()}
                  disabled={cleanupMutation.isPending}
                  className="h-20 flex-col"
                >
                  <Trash2 className="h-6 w-6 mb-2" />
                  {cleanupMutation.isPending ? 'Cleaning...' : 'System Cleanup'}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => queuePaused ? resumeQueueMutation.mutate() : pauseQueueMutation.mutate()}
                  disabled={pauseQueueMutation.isPending || resumeQueueMutation.isPending}
                  className="h-20 flex-col"
                >
                  {queuePaused ? <Play className="h-6 w-6 mb-2" /> : <Pause className="h-6 w-6 mb-2" />}
                  {queuePaused ? 'Resume Queue' : 'Pause Queue'}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => clearFailedJobsMutation.mutate()}
                  disabled={clearFailedJobsMutation.isPending}
                  className="h-20 flex-col"
                >
                  <Trash2 className="h-6 w-6 mb-2" />
                  Clear Failed Jobs
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => retryFailedJobsMutation.mutate()}
                  disabled={retryFailedJobsMutation.isPending}
                  className="h-20 flex-col"
                >
                  <RefreshCw className="h-6 w-6 mb-2" />
                  Retry Failed Jobs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Services Status */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>
                Status of critical system services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className={`h-5 w-5 ${getHealthColor(systemHealth?.database || false)}`} />
                    <span className="font-medium">Database</span>
                  </div>
                  <Badge variant={systemHealth?.database ? 'default' : 'destructive'}>
                    {systemHealth?.database ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className={`h-5 w-5 ${getHealthColor(systemHealth?.services?.razorpay || false)}`} />
                    <span className="font-medium">Payments</span>
                  </div>
                  <Badge variant={systemHealth?.services?.razorpay ? 'default' : 'secondary'}>
                    {systemHealth?.services?.razorpay ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-green-500 dark:text-green-400" />
                    <span className="font-medium">API</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          {/* System Metrics */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
                <CardDescription>
                  Real-time system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Memory Usage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-muted-foreground">
                        {systemMetrics?.memory_usage?.percentage || 0}%
                      </span>
                    </div>
                    <Progress value={systemMetrics?.memory_usage?.percentage || 0} />
                    <p className="text-xs text-muted-foreground">
                      {systemMetrics?.memory_usage?.used || 0}GB / {systemMetrics?.memory_usage?.total || 0}GB
                    </p>
                  </div>

                  {/* Disk Usage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-muted-foreground">
                        {systemMetrics?.disk_usage?.percentage || 0}%
                      </span>
                    </div>
                    <Progress value={systemMetrics?.disk_usage?.percentage || 0} />
                    <p className="text-xs text-muted-foreground">
                      {systemMetrics?.disk_usage?.used || 0}GB / {systemMetrics?.disk_usage?.total || 0}GB
                    </p>
                  </div>

                  {/* CPU Usage (placeholder) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-muted-foreground">
                        45%
                      </span>
                    </div>
                    <Progress value={45} />
                    <p className="text-xs text-muted-foreground">
                      4 cores active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {systemMetrics?.api_metrics?.requests_per_minute || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Requests/min</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {systemMetrics?.api_metrics?.average_response_time || 0}ms
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500 dark:text-red-400">
                      {systemMetrics?.api_metrics?.error_rate || 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Worker Status</CardTitle>
              <CardDescription>
                Background worker processes and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workersStatus?.workers?.worker_details ? (
                <div className="space-y-4">
                  {workersStatus.workers.worker_details.map((worker, index) => (
                    <div key={worker.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className={`h-5 w-5 ${
                          worker.status === 'active' ? 'text-green-500 dark:text-green-400' :
                          worker.status === 'idle' ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'
                        }`} />
                        <div>
                          <span className="font-medium">Worker {worker.id}</span>
                          <p className="text-sm text-muted-foreground">
                            Last activity: {formatDate(worker.last_activity, { includeTime: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          worker.status === 'active' ? 'default' :
                          worker.status === 'idle' ? 'secondary' : 'destructive'
                        }>
                          {worker.status}
                        </Badge>
                        {worker.current_job && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Job: {worker.current_job}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No worker details available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Worker Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {workersStatus?.workers?.processed_today || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Processed Today</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500 dark:text-red-400">
                    {workersStatus?.workers?.failed_today || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Failed Today</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {workersStatus?.workers?.average_processing_time || 0}s
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {workersStatus?.workers?.queue_size || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Queue Size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue Tab */}
        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Queue Management</CardTitle>
              <CardDescription>
                Manage the scan job queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
                    {queueStats?.queued || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Queued</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
                    {queueStats?.processing || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-500 dark:text-red-400">
                    {queueStats?.failed || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-500 dark:text-green-400">
                    {queueStats?.completed_today || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={() => queuePaused ? resumeQueueMutation.mutate() : pauseQueueMutation.mutate()}
                  disabled={pauseQueueMutation.isPending || resumeQueueMutation.isPending}
                >
                  {queuePaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                  {queuePaused ? 'Resume Queue' : 'Pause Queue'}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Failed Jobs
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Failed Jobs</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove all failed jobs from the queue. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => clearFailedJobsMutation.mutate()}>
                        Clear Failed Jobs
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button 
                  variant="outline"
                  onClick={() => retryFailedJobsMutation.mutate()}
                  disabled={retryFailedJobsMutation.isPending}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Failed Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Active security alerts and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityAlerts && securityAlerts.length > 0 ? (
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.severity === 'critical' ? 'text-red-500 dark:text-red-400' :
                          alert.severity === 'high' ? 'text-orange-500 dark:text-orange-400' :
                          alert.severity === 'medium' ? 'text-yellow-500 dark:text-yellow-400' : 'text-blue-500 dark:text-blue-400'
                        }`} />
                        <div>
                          <span className="font-medium">{alert.message}</span>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(alert.created_at, { includeTime: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {alert.severity}
                        </Badge>
                        {alert.resolved ? (
                          <Badge variant="default">Resolved</Badge>
                        ) : (
                          <Button size="sm" variant="outline">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No active security alerts
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Integrity</CardTitle>
              <CardDescription>
                Database health and integrity status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrityCheck ? (
                <div className="space-y-6">
                  {/* Database Stats */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{integrityCheck.database_stats.total_users}</div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{integrityCheck.database_stats.total_repos}</div>
                      <p className="text-sm text-muted-foreground">Total Repos</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{integrityCheck.database_stats.total_scans}</div>
                      <p className="text-sm text-muted-foreground">Total Scans</p>
                    </div>
                  </div>

                  {/* Integrity Issues */}
                  {integrityCheck.integrity_issues.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Integrity Issues Found</h3>
                      {integrityCheck.integrity_issues.map((issue, index) => (
                        <div key={index} className="p-4 border rounded-lg border-red-200 bg-red-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-red-800 dark:text-red-300">{issue.type}</span>
                              <p className="text-sm text-red-600 dark:text-red-400">{issue.description}</p>
                            </div>
                            <Badge variant="destructive">{issue.count} issues</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 dark:text-green-400 mb-4" />
                      <p className="text-lg font-medium">Database integrity is healthy</p>
                      <p className="text-sm text-muted-foreground">No issues found</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => cleanupMutation.mutate()}
                      disabled={cleanupMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Run Cleanup
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-database-integrity'] })}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Recheck Integrity
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Loading integrity check...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}