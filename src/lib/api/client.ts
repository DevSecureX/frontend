import type { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig 
} from 'axios';
import axios from 'axios'
import { config, buildApiUrl, API_TIMEOUTS, type TimeoutType } from '@/lib/config/env'
import { toast } from 'sonner'

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string = 'Operation timed out',
    public timeoutMs: number = 0,
    public operationType: string = 'unknown'
  ) {
    super(message)
    this.name = 'TimeoutError'
  }
}

export class RetryableError extends Error {
  constructor(
    message: string,
    public status?: number,
    public canRetry: boolean = true,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'RetryableError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

class ApiClient {
  private client: AxiosInstance
  private authToken: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
    this.initializeAuth()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`
        }

        // Add request timestamp for debugging

        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(new Error(String(error)))
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Response logged in dev mode
        
        // Ensure we return the response properly
        return response
      },
      (error: AxiosError) => {
        return this.handleResponseError(error)
      }
    )
  }

  private initializeAuth() {
    // Try to get token from localStorage
    const token = localStorage.getItem('auth_token')
    if (token) {
      this.setAuthToken(token)
    }
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    const status = error.response?.status
    const data = error.response?.data as any
    const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout')

    // Network error or timeout
    if (!error.response) {
      if (isTimeout) {
        const timeoutError = new TimeoutError(
          'Request timeout - operation may still be processing',
          error.config?.timeout || 0,
          'api-request'
        )
        // Don't show toast here - let the calling code handle timeout notifications
        // This prevents duplicate notifications from both the API client and polling logic
        throw timeoutError
      } else {
        const networkError = new NetworkError('Failed to connect to server')
        this.showErrorToast('Connection failed. Please check your internet connection.')
        throw networkError
      }
    }

    // Handle specific status codes
    switch (status) {
      case 401:
        // Only handle as auth failure if it's actually a token validation issue
        const shouldLogout = this.shouldLogoutOn401(error, data)
        if (shouldLogout) {
          this.handleUnauthorized()
        } else {
          // Just show error without logging out
          this.showErrorToast('Authentication required for this action')
        }
        throw new ApiError('Unauthorized access', 401, 'UNAUTHORIZED', data)

      case 403:
        this.showErrorToast('Access forbidden. You don\'t have permission for this action.')
        throw new ApiError('Forbidden access', 403, 'FORBIDDEN', data)

      case 400:
        // Handle validation and business logic errors (like duplicate rules)
        let badRequestMessage = 'Bad request'
        
        if (data?.detail && typeof data.detail === 'object') {
          if (data.detail.error) {
            badRequestMessage = data.detail.error
            if (data.detail.duplicate_rule_name) {
              badRequestMessage += ` (Similar rule: "${data.detail.duplicate_rule_name}")`
            }
          } else {
            badRequestMessage = JSON.stringify(data.detail)
          }
        } else if (data?.detail && typeof data.detail === 'string') {
          badRequestMessage = data.detail
        } else if (data?.message) {
          badRequestMessage = data.message
        }
        
        this.showErrorToast(badRequestMessage)
        throw new ApiError(badRequestMessage, 400, 'BAD_REQUEST', data)

      case 404:
        this.showErrorToast('Resource not found')
        throw new ApiError('Resource not found', 404, 'NOT_FOUND', data)

      case 422:
        // Validation errors
        const validationErrors = data?.errors || {}
        const validationMessage = data?.message || 'Validation failed'
        throw new ValidationError(validationMessage, validationErrors)

      case 429:
        const rateLimitMessage = data?.detail || data?.message || 'Too many requests. Please try again later.'
        this.showErrorToast(rateLimitMessage)
        throw new ApiError(rateLimitMessage, 429, 'RATE_LIMIT', data)

      case 500:
        this.showErrorToast('Server error. Please try again later.')
        throw new ApiError('Internal server error', 500, 'SERVER_ERROR', data)

      case 503:
        // Service unavailable - typically for long-running operations like auto-fix
        // Don't show toast here - let calling code handle this gracefully
        const serviceMessage = data?.detail || data?.message || 'Service temporarily unavailable'
        throw new RetryableError(serviceMessage, 503, true, data?.retry_after)

      default:
        // Handle complex error objects (like duplicate rule detection)
        let errorMessage = 'An unexpected error occurred'
        
        if (data?.detail && typeof data.detail === 'object') {
          // Handle structured error objects
          if (data.detail.error) {
            errorMessage = data.detail.error
            if (data.detail.duplicate_rule_name) {
              errorMessage += ` (Similar rule: "${data.detail.duplicate_rule_name}")`
            }
          } else {
            errorMessage = JSON.stringify(data.detail)
          }
        } else if (data?.detail && typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (data?.message) {
          errorMessage = data.message
        }
        
        this.showErrorToast(errorMessage)
        throw new ApiError(errorMessage, status, 'UNKNOWN_ERROR', data)
    }
  }

  private shouldLogoutOn401(error: AxiosError, data: any): boolean {
    // Check if this is a genuine token validation failure
    const message = data?.detail || error.message || ''
    const isTokenError = message.includes('token') || 
                        message.includes('credentials') || 
                        message.includes('expired') ||
                        message.includes('invalid') ||
                        message.includes('malformed')
    
    // Check if we have a token to validate - if no token, this might just be a permission issue
    const hasToken = this.authToken && this.authToken.trim().length > 0
    
    // Only logout if:
    // 1. We have a token AND it's being rejected (token validation failure)
    // 2. OR if the error explicitly mentions authentication/credentials
    return hasToken && isTokenError
  }

  private handleUnauthorized() {
    // Legitimate token validation failure detected - logging out user
    
    // Clear stored auth data
    this.clearAuth()
    
    // Clear auth store state
    if (typeof window !== 'undefined' && window.localStorage) {
      // Clear auth store persistence
      localStorage.removeItem('auth-store')
    }
    
    // Show login toast and redirect if not on auth pages
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
      this.showErrorToast('Session expired. Please log in again.')
      
      // Force immediate redirect to /auth
      setTimeout(() => {
        window.location.href = '/auth'
      }, 1000) // Short delay to show the toast
    }
  }

  private showErrorToast(message: string | object, type: 'error' | 'warning' = 'error') {
    if (typeof window !== 'undefined') {
      // Ensure message is a string for safe display
      const safeMessage = typeof message === 'string' ? message : 
                         typeof message === 'object' ? JSON.stringify(message) :
                         String(message)
      
      if (type === 'warning') {
        toast.warning(safeMessage, { duration: 8000 }) // Longer duration for timeout warnings
      } else {
        toast.error(safeMessage)
      }
    }
  }

  // Auth methods
  setAuthToken(token: string) {
    this.authToken = token
    localStorage.setItem('auth_token', token)
  }

  clearAuth() {
    this.authToken = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  isAuthenticated(): boolean {
    return !!this.authToken
  }

  // Helper to get timeout value
  private getTimeout(timeoutType?: TimeoutType, customTimeout?: number): number {
    if (customTimeout) return customTimeout
    if (timeoutType) return API_TIMEOUTS[timeoutType]
    return config.api.timeout
  }

  // Helper to merge config with timeout
  private buildRequestConfig(
    userConfig?: AxiosRequestConfig, 
    timeoutType?: TimeoutType,
    customTimeout?: number
  ): AxiosRequestConfig {
    const timeout = this.getTimeout(timeoutType, customTimeout)
    return {
      ...userConfig,
      timeout
    }
  }

  // Generic request methods with timeout support
  async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig, 
    timeoutType?: TimeoutType
  ): Promise<T> {
    const requestConfig = this.buildRequestConfig(config, timeoutType)
    
    // Making GET request in dev mode
    
    const response = await this.client.get<T>(url, requestConfig)
    
    // Response logged in dev mode
    
    return response.data
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig,
    timeoutType?: TimeoutType
  ): Promise<T> {
    const requestConfig = this.buildRequestConfig(config, timeoutType)
    const response = await this.client.post<T>(url, data, requestConfig)
    return response.data
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig,
    timeoutType?: TimeoutType
  ): Promise<T> {
    const requestConfig = this.buildRequestConfig(config, timeoutType)
    const response = await this.client.put<T>(url, data, requestConfig)
    return response.data
  }

  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig,
    timeoutType?: TimeoutType
  ): Promise<T> {
    const requestConfig = this.buildRequestConfig(config, timeoutType)
    const response = await this.client.patch<T>(url, data, requestConfig)
    return response.data
  }

  async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig,
    timeoutType?: TimeoutType
  ): Promise<T> {
    const requestConfig = this.buildRequestConfig(config, timeoutType)
    const response = await this.client.delete<T>(url, requestConfig)
    return response.data
  }

  // Form data upload
  async uploadFile<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Download file
  async downloadFile(url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> {
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob',
    })

    // Create download link
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Get blob data for download (returns blob instead of auto-downloading)
  async getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob',
    })
    return response.data
  }

  // Retry logic with exponential backoff
  async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelayMs: number = 1000,
    maxDelayMs: number = 10000
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error
        
        // Don't retry on certain errors
        if (error instanceof ValidationError || error.status === 401 || error.status === 403) {
          throw error
        }
        
        // Don't retry on last attempt
        if (attempt === maxAttempts) {
          throw error
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs)
        // Retry attempt with delay
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }

  // Health check with quick timeout
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/auth/health', undefined, 'QUICK')
      return true
    } catch {
      return false
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient()
export default apiClient