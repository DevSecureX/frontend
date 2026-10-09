// TEMPORARILY DISABLED: WebSocket functionality disabled until notification engine is implemented
// This prevents WebSocket connection errors in the browser console

import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client'

interface ServerToClientEvents {
  // Scan events
  scan_started: (data: { scanId: string; repositoryId: string; type: string }) => void
  scan_progress: (data: { scanId: string; progress: number; stage: string; message?: string }) => void
  scan_completed: (data: { scanId: string; status: 'success' | 'failed'; results?: any; error?: string }) => void
  scan_failed: (data: { scanId: string; error: string; stage?: string }) => void

  // Repository events
  repository_connected: (data: { repositoryId: string; name: string; status: string }) => void
  repository_sync_started: (data: { repositoryId: string; type: 'full' | 'incremental' }) => void
  repository_sync_completed: (data: { repositoryId: string; changes: number; commits: number }) => void

  // Pull request events
  pr_scan_started: (data: { prId: string; repositoryId: string; prNumber: number }) => void
  pr_scan_completed: (data: { prId: string; status: 'success' | 'failed'; findings?: any[] }) => void
  pr_status_changed: (data: { prId: string; status: string; checks: any[] }) => void

  // Security events
  vulnerability_found: (data: { 
    scanId: string; 
    vulnerability: { 
      id: string; 
      severity: 'low' | 'medium' | 'high' | 'critical'; 
      type: string; 
      file: string; 
      line: number; 
      description: string 
    } 
  }) => void
  
  // System events
  notification: (data: { 
    id: string; 
    type: 'info' | 'warning' | 'error' | 'success'; 
    title: string; 
    message: string; 
    timestamp: string;
    actions?: Array<{ label: string; action: string }> 
  }) => void
  
  // User events
  user_activity: (data: { userId: string; action: string; resource: string; timestamp: string }) => void
  
  // Billing events
  subscription_updated: (data: { userId: string; plan: string; status: string; expiresAt?: string }) => void
  usage_limit_warning: (data: { userId: string; resource: string; current: number; limit: number; percentage: number }) => void
}

interface ClientToServerEvents {
  // Authentication
  authenticate: (token: string) => void
  
  // Subscriptions
  subscribe_to_scan: (scanId: string) => void
  unsubscribe_from_scan: (scanId: string) => void
  subscribe_to_repository: (repositoryId: string) => void
  unsubscribe_from_repository: (repositoryId: string) => void
  subscribe_to_pr: (prId: string) => void
  unsubscribe_from_pr: (prId: string) => void
  
  // User presence
  join_room: (room: string) => void
  leave_room: (room: string) => void
  
  // Heartbeat
  ping: () => void
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000
  private isAuthenticated = false
  private subscriptions = new Set<string>()

  connect(token?: string): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.socket?.connected) {
      return this.socket
    }

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8010'
    const socketUrl = apiUrl.replace('/api', '')

    console.log('Connecting to Socket.IO server at:', socketUrl)

    this.socket = io(socketUrl, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      reconnectionDelayMax: 5000,
      autoConnect: true
    })

    this.setupEventListeners()

    if (token) {
      this.authenticate(token)
    }

    return this.socket
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
      
      // Re-authenticate if we have a token
      const token = localStorage.getItem('token')
      if (token && !this.isAuthenticated) {
        this.authenticate(token)
      }
      
      // Re-subscribe to previous subscriptions
      this.subscriptions.forEach(subscription => {
        const [type, id] = subscription.split(':')
        switch (type) {
          case 'scan':
            this.socket?.emit('subscribe_to_scan', id)
            break
          case 'repository':
            this.socket?.emit('subscribe_to_repository', id)
            break
          case 'pr':
            this.socket?.emit('subscribe_to_pr', id)
            break
        }
      })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.isAuthenticated = false
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.socket?.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.disconnect()
      }
    })

    // Handle authentication response
    this.socket.on('authenticated' as any, () => {
      console.log('Socket authenticated successfully')
      this.isAuthenticated = true
    })

    this.socket.on('authentication_error' as any, (error: any) => {
      console.error('Socket authentication error:', error)
      this.isAuthenticated = false
      // Clear invalid token
      localStorage.removeItem('token')
    })
  }

  authenticate(token: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot authenticate')
      return
    }
    
    this.socket.emit('authenticate', token)
  }

  disconnect() {
    if (this.socket) {
      this.subscriptions.clear()
      this.socket.disconnect()
      this.socket = null
      this.isAuthenticated = false
    }
  }

  // Subscription management
  subscribeToScan(scanId: string) {
    if (!this.socket?.connected) return
    
    this.socket.emit('subscribe_to_scan', scanId)
    this.subscriptions.add(`scan:${scanId}`)
  }

  unsubscribeFromScan(scanId: string) {
    if (!this.socket?.connected) return
    
    this.socket.emit('unsubscribe_from_scan', scanId)
    this.subscriptions.delete(`scan:${scanId}`)
  }

  subscribeToRepository(repositoryId: string) {
    if (!this.socket?.connected) return
    
    this.socket.emit('subscribe_to_repository', repositoryId)
    this.subscriptions.add(`repository:${repositoryId}`)
  }

  unsubscribeFromRepository(repositoryId: string) {
    if (!this.socket?.connected) return
    
    this.socket.emit('unsubscribe_from_repository', repositoryId)
    this.subscriptions.delete(`repository:${repositoryId}`)
  }

  subscribeToPR(prId: string) {
    if (!this.socket?.connected) return
    
    this.socket.emit('subscribe_to_pr', prId)
    this.subscriptions.add(`pr:${prId}`)
  }

  unsubscribeFromPR(prId: string) {
    if (!this.socket?.connected) return
    
    this.socket.emit('unsubscribe_from_pr', prId)
    this.subscriptions.delete(`pr:${prId}`)
  }

  // Event listeners
  onScanStarted(callback: (data: { scanId: string; repositoryId: string; type: string }) => void) {
    this.socket?.on('scan_started', callback)
  }

  onScanProgress(callback: (data: { scanId: string; progress: number; stage: string; message?: string }) => void) {
    this.socket?.on('scan_progress', callback)
  }

  onScanCompleted(callback: (data: { scanId: string; status: 'success' | 'failed'; results?: any; error?: string }) => void) {
    this.socket?.on('scan_completed', callback)
  }

  onScanFailed(callback: (data: { scanId: string; error: string; stage?: string }) => void) {
    this.socket?.on('scan_failed', callback)
  }

  onRepositoryConnected(callback: (data: { repositoryId: string; name: string; status: string }) => void) {
    this.socket?.on('repository_connected', callback)
  }

  onRepositorySyncStarted(callback: (data: { repositoryId: string; type: 'full' | 'incremental' }) => void) {
    this.socket?.on('repository_sync_started', callback)
  }

  onRepositorySyncCompleted(callback: (data: { repositoryId: string; changes: number; commits: number }) => void) {
    this.socket?.on('repository_sync_completed', callback)
  }

  onPRScanStarted(callback: (data: { prId: string; repositoryId: string; prNumber: number }) => void) {
    this.socket?.on('pr_scan_started', callback)
  }

  onPRScanCompleted(callback: (data: { prId: string; status: 'success' | 'failed'; findings?: any[] }) => void) {
    this.socket?.on('pr_scan_completed', callback)
  }

  onPRStatusChanged(callback: (data: { prId: string; status: string; checks: any[] }) => void) {
    this.socket?.on('pr_status_changed', callback)
  }

  onVulnerabilityFound(callback: (data: { scanId: string; vulnerability: any }) => void) {
    this.socket?.on('vulnerability_found', callback)
  }

  onNotification(callback: (data: { id: string; type: string; title: string; message: string; timestamp: string; actions?: any[] }) => void) {
    this.socket?.on('notification', callback)
  }

  onUserActivity(callback: (data: { userId: string; action: string; resource: string; timestamp: string }) => void) {
    this.socket?.on('user_activity', callback)
  }

  onSubscriptionUpdated(callback: (data: { userId: string; plan: string; status: string; expiresAt?: string }) => void) {
    this.socket?.on('subscription_updated', callback)
  }

  onUsageLimitWarning(callback: (data: { userId: string; resource: string; current: number; limit: number; percentage: number }) => void) {
    this.socket?.on('usage_limit_warning', callback)
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocketId(): string | undefined {
    return this.socket?.id
  }

  ping() {
    this.socket?.emit('ping')
  }

  // Event listener cleanup
  offAll() {
    this.socket?.offAny()
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event as any, callback)
  }
}

// Export singleton instance
export const socketService = new SocketService()
export default socketService