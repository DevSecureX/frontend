import { useState, useEffect } from 'react'
import { 
  Activity, 
  Shield, 
  GitBranch, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Zap,
  Settings,
  CreditCard
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTimezone } from '@/contexts/TimezoneContext'

interface ActivityItem {
  id: string
  type: 'scan' | 'repository' | 'pr' | 'vulnerability' | 'user' | 'billing' | 'system'
  action: string
  description: string
  timestamp: string
  user?: {
    id: string
    name: string
    avatar?: string
  }
  metadata?: {
    severity?: 'low' | 'medium' | 'high' | 'critical'
    status?: string
    resource?: string
    [key: string]: any
  }
}

interface ActivityFeedProps {
  maxItems?: number
  showUserActions?: boolean
  filterTypes?: ActivityItem['type'][]
  className?: string
}

export function ActivityFeed({ 
  maxItems = 50, 
  showUserActions = true,
  filterTypes,
  className = '' 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const { formatRelativeDate } = useTimezone()
  
  // Mock some initial activities for demonstration
  useEffect(() => {
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'scan',
        action: 'completed',
        description: 'Security scan completed with 3 findings',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        metadata: { 
          status: 'success',
          vulnerabilities: 3
        }
      },
      {
        id: '2',
        type: 'repository',
        action: 'connected',
        description: 'Repository "example-app" connected successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        metadata: {
          repositoryId: 'repo-1',
          status: 'connected'
        }
      },
      {
        id: '3',
        type: 'vulnerability',
        action: 'found',
        description: 'HIGH SQL Injection vulnerability detected',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),  
        metadata: {
          severity: 'high',
          file: 'src/api/users.js',
          line: 42
        }
      }
    ]
    
    setActivities(prev => {
      if (prev.length === 0) {
        return mockActivities
      }
      return prev
    })
  }, [])

  // Add new activity
  const addActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    }

    setActivities(prev => {
      // Filter by types if specified
      if (filterTypes && !filterTypes.includes(newActivity.type)) {
        return prev
      }

      const updated = [newActivity, ...prev].slice(0, maxItems)
      return updated
    })
  }


  const getActivityIcon = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'scan':
        return activity.action === 'completed' 
          ? <CheckCircle className="h-4 w-4 text-green-600" />
          : activity.action === 'failed'
          ? <AlertTriangle className="h-4 w-4 text-red-600" />
          : <Shield className="h-4 w-4 text-blue-600" />
      
      case 'vulnerability':
        const severity = activity.metadata?.severity
        return severity === 'critical' || severity === 'high'
          ? <AlertTriangle className="h-4 w-4 text-red-600" />
          : <AlertTriangle className="h-4 w-4 text-yellow-600" />
      
      case 'repository':
        return <GitBranch className="h-4 w-4 text-green-600" />
      
      case 'pr':
        return activity.metadata?.status === 'success'
          ? <CheckCircle className="h-4 w-4 text-green-600" />
          : <AlertTriangle className="h-4 w-4 text-red-600" />
      
      case 'user':
        return <Users className="h-4 w-4 text-purple-600" />
      
      case 'billing':
        return <CreditCard className="h-4 w-4 text-blue-600" />
      
      case 'system':
      default:
        return <Settings className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'scan':
        return activity.action === 'completed' 
          ? 'border-l-green-500' 
          : activity.action === 'failed'
          ? 'border-l-red-500'
          : 'border-l-blue-500'
      
      case 'vulnerability':
        const severity = activity.metadata?.severity
        return severity === 'critical' || severity === 'high'
          ? 'border-l-red-500'
          : 'border-l-yellow-500'
      
      case 'repository':
        return 'border-l-green-500'
      
      case 'pr':
        return activity.metadata?.status === 'success'
          ? 'border-l-green-500'
          : 'border-l-red-500'
      
      case 'user':
        return 'border-l-purple-500'
      
      case 'billing':
        return 'border-l-blue-500'
      
      case 'system':
      default:
        return 'border-l-gray-500'
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    
    return (
      <Badge className={colors[severity as keyof typeof colors] || colors.low}>
        {severity.toUpperCase()}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    return formatRelativeDate(timestamp)
  }


  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <CardTitle>Activity Feed</CardTitle>
        </div>
        <CardDescription>
          Real-time updates from your security operations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-0">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`p-4 border-l-4 ${getActivityColor(activity)} ${
                    index !== activities.length - 1 ? 'border-b' : ''
                  } hover:bg-muted/30 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-background border">
                      {getActivityIcon(activity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">
                          {activity.description}
                        </p>
                        
                        {activity.metadata?.severity && (
                          getSeverityBadge(activity.metadata.severity)
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(activity.timestamp)}</span>
                        
                        {activity.user && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={activity.user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {activity.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{activity.user.name}</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Additional metadata */}
                      {activity.type === 'vulnerability' && activity.metadata && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.metadata.file}:{activity.metadata.line}
                        </p>
                      )}
                      
                      {activity.type === 'scan' && activity.metadata?.vulnerabilities !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.metadata.vulnerabilities} vulnerabilities found
                        </p>
                      )}
                    </div>
                    
                    {/* Action buttons for certain activity types */}
                    {(activity.type === 'scan' || activity.type === 'vulnerability') && (
                      <button
                        onClick={() => {
                          // Navigate to scan details
                          if (activity.metadata?.scanId) {
                            window.location.href = `/scans/${activity.metadata.scanId}`
                          }
                        }}
                        className="p-1 rounded hover:bg-muted transition-colors"
                      >
                        <Eye className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Compact version for dashboard
export function CompactActivityFeed({ maxItems = 5 }: { maxItems?: number }) {
  return (
    <ActivityFeed
      maxItems={maxItems}
      showUserActions={false}
      filterTypes={['scan', 'vulnerability', 'repository']}
      className="h-64"
    />
  )
}