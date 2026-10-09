import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useTimezone } from '@/contexts/TimezoneContext'
import { toast } from 'sonner'
import { Bell, Shield, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read?: boolean
  actions?: Array<{ label: string; action: string }>
  metadata?: {
    scanId?: string
    repositoryId?: string
    prId?: string
    [key: string]: any
  }
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  getNotificationsByType: (type: string) => Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
  maxNotifications?: number
  autoRemoveDelay?: number
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 100,
  autoRemoveDelay = 5000 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications)
      return updated
    })

    // Show toast notification
    showToast(newNotification)

    // Auto-remove after delay for success and info notifications
    if ((notification.type === 'success' || notification.type === 'info') && autoRemoveDelay > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, autoRemoveDelay)
    }

    return newNotification.id
  }

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  // Clear all notifications
  const clearAll = () => {
    setNotifications([])
  }

  // Get notifications by type
  const getNotificationsByType = (type: string) => {
    return notifications.filter(notification => notification.type === type)
  }

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Show toast notification
  const showToast = (notification: Notification) => {
    const icon = getNotificationIcon(notification.type)
    
    toast(notification.title, {
      description: notification.message,
      duration: notification.type === 'error' ? 0 : 4000, // Keep error notifications until dismissed
      icon,
      action: notification.actions?.[0] ? {
        label: notification.actions[0].label,
        onClick: () => handleNotificationAction(notification.actions![0].action, notification)
      } : undefined
    })
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <X className="h-4 w-4 text-red-600" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  // Handle notification actions
  const handleNotificationAction = (action: string, notification: Notification) => {
    switch (action) {
      case 'view_scan':
        window.location.href = `/scans/${notification.metadata?.scanId}`
        break
      case 'view_repository':
        window.location.href = `/repositories/${notification.metadata?.repositoryId}`
        break
      case 'view_pr':
        window.location.href = `/pull-requests/${notification.metadata?.prId}`
        break
      case 'upgrade_plan':
        window.location.href = '/billing'
        break
    }
  }

  // Socket event handlers - temporarily disabled until full socket integration
  useEffect(() => {
    // TODO: Implement socket event handlers for:
    // - onNotification: General notifications from server
    // - onScanCompleted: Scan completion notifications
    // - onScanFailed: Scan failure notifications  
    // - onVulnerabilityFound: Vulnerability found notifications
    // - onUsageLimitWarning: Usage limit warnings
    
    // For now, we'll handle notifications through direct API calls and manual triggers

    return () => {
      // Cleanup when implemented
    }
  }, [])

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notifications')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setNotifications(parsed.slice(0, maxNotifications))
      } catch (error) {
        console.error('Failed to load stored notifications:', error)
      }
    }
  }, [maxNotifications])

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Notification Bell Component
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Handle default action if available
    if (notification.actions?.[0]) {
      handleNotificationAction(notification.actions[0].action, notification)
    }
  }

  const handleNotificationAction = (action: string, notification: Notification) => {
    switch (action) {
      case 'view_scan':
        window.location.href = `/scans/${notification.metadata?.scanId}`
        break
      case 'view_repository':
        window.location.href = `/repositories/${notification.metadata?.repositoryId}`
        break
      case 'view_pr':
        window.location.href = `/pull-requests/${notification.metadata?.prId}`
        break
      case 'upgrade_plan':
        window.location.href = '/billing'
        break
    }
    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'error':
        return <X className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    }
  }

  // Use timezone-aware formatting instead of manual calculations
  const { formatRelativeDate } = useTimezone()

  const formatTimestamp = (timestamp: string) => {
    return formatRelativeDate(timestamp)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-950/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}