import { apiClient } from './client'
import type { User } from '@/types/global'

// Request/Response types
export interface LoginRequest {
  username: string
  password: string
}

export interface SignupRequest {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  mobile_no?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  member_details: {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    mobile_no?: string
    is_premium: boolean
    premium_expiry?: string
  }
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface ProfileUpdateRequest {
  first_name?: string
  last_name?: string
  mobile_no?: string
}

export interface CreateOrderRequest {
  plan: 'monthly' | 'premium' | 'annual'
  amount: number
}

export interface CreateOrderResponse {
  order_id: string
  amount: number
  currency: string
  key: string
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface FeedbackRequest {
  feedback: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

export interface MailListRequest {
  email: string
}

export interface TimezonePreferences {
  timezone: string
  date_format: string
  time_format: string
  show_relative_dates: boolean
  show_timezone_abbreviations: boolean
  preferences_updated_at?: string | null
}

export interface TimezonePreferencesUpdate {
  timezone?: string
  date_format?: string
  time_format?: string
  show_relative_dates?: boolean
  show_timezone_abbreviations?: boolean
}

// Notification Preferences
export interface NotificationPreferences {
  email_notifications: boolean
  security_alerts: boolean
  scan_completion_notifications: boolean
  weekly_reports: boolean
  marketing_emails: boolean
  notification_preferences_updated_at?: string | null
}

export interface NotificationPreferencesUpdate {
  email_notifications?: boolean
  security_alerts?: boolean
  scan_completion_notifications?: boolean
  weekly_reports?: boolean
  marketing_emails?: boolean
}

// API Keys
export interface ApiKey {
  id: number
  name: string
  key_prefix: string
  scopes: string[]
  is_active: boolean
  last_used_at?: string | null
  usage_count: number
  created_at: string
  expires_at?: string | null
}

export interface ApiKeyCreateRequest {
  name: string
  scopes?: string[]
  expires_in_days?: number
}

export interface ApiKeyCreateResponse {
  id: number
  name: string
  key: string  // Full key shown only once
  key_prefix: string
  scopes: string[]
  created_at: string
  expires_at?: string | null
}

// Data Export
export interface DataExportRequest {
  export_type?: 'full' | 'personal_only' | 'scans_only' | 'repositories_only'
  file_format?: 'json' | 'csv' | 'xml'
  include_personal_data?: boolean
  include_scan_data?: boolean
  include_repository_data?: boolean
}

export interface DataExport {
  id: number
  export_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  file_format: string
  include_personal_data: boolean
  include_scan_data: boolean
  include_repository_data: boolean
  total_records?: number | null
  exported_records?: number | null
  file_size_bytes?: number | null
  requested_at: string
  processing_started_at?: string | null
  completed_at?: string | null
  download_expires_at?: string | null
  error_message?: string | null
}

// Auth API class
export class AuthAPI {
  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Convert to form data for OAuth2PasswordRequestForm
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    return apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  }

  async signup(userData: SignupRequest): Promise<{ message: string }> {
    return apiClient.post('/auth/signup', userData)
  }

  async logout(): Promise<{ message: string }> {
    return apiClient.post('/auth/logout')
  }

  async validateToken(): Promise<User> {
    return apiClient.get('/auth/validate-token')
  }

  async getCurrentUser(): Promise<{
    username: string
    email: string
    is_premium: boolean
    premium_expiry?: string
    is_github_connected: boolean
  }> {
    return apiClient.get('/auth/me')
  }

  // OAuth
  async initiateGoogleLogin(): Promise<void> {
    window.location.href = `${apiClient['client'].defaults.baseURL}/auth/google/login`
  }

  async initiateGithubLogin(): Promise<void> {
    window.location.href = `${apiClient['client'].defaults.baseURL}/auth/github/login`
  }

  async connectGithub(): Promise<{ auth_url: string }> {
    return apiClient.get('/auth/github/connect')
  }

  // Password reset
  async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', request)
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', request)
  }

  // Profile management
  async updateProfile(profileData: ProfileUpdateRequest): Promise<User> {
    return apiClient.post('/auth/update-profile', profileData)
  }

  // Timezone preferences
  async getTimezonePreferences(): Promise<TimezonePreferences> {
    return apiClient.get('/auth/profile/timezone-preferences')
  }

  async updateTimezonePreferences(preferences: TimezonePreferencesUpdate): Promise<TimezonePreferences> {
    return apiClient.put('/auth/profile/timezone-preferences', preferences)
  }

  // Payments
  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    return apiClient.post('/auth/create-order', orderData)
  }

  async verifyPayment(paymentData: VerifyPaymentRequest): Promise<{
    message: string
    is_premium: boolean
    premium_expiry: string
  }> {
    return apiClient.post('/auth/verify-payment', paymentData)
  }

  // Feedback
  async submitFeedback(feedback: FeedbackRequest): Promise<{
    message: string
    feedback_id: number
  }> {
    return apiClient.post('/auth/feedback', feedback)
  }

  // Mailing list
  async subscribeToMailingList(request: MailListRequest): Promise<{ message: string }> {
    return apiClient.post('/auth/mail-list', request)
  }

  // Health check
  async healthCheck(): Promise<{
    status: string
    database: boolean
    services: Record<string, boolean>
  }> {
    return apiClient.get('/auth/health')
  }

  // Account deletion (soft delete with 30-day retention)
  async deleteAccount(deletionReason?: string): Promise<{
    message: string
    deleted_data: {
      repositories: number
      scans: number
      user_id: number
      deletion_timestamp: string
      retention_period_days: number
    }
  }> {
    const data = deletionReason ? { deletion_reason: deletionReason } : undefined
    return apiClient.delete('/auth/account', { data })
  }

  // Admin cleanup (for authenticated users)
  async adminCleanup(): Promise<{
    message: string
    login_attempts_removed: number
  }> {
    return apiClient.post('/auth/admin/cleanup')
  }

  // Database integrity check
  async integrityCheck(): Promise<{
    status: string
    integrity_issues: any[]
    total_issues: number
    database_stats: Record<string, number>
    checked_at: string
    message: string
  }> {
    return apiClient.get('/auth/admin/integrity-check')
  }

  // Notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    return apiClient.get('/auth/profile/notification-preferences')
  }

  async updateNotificationPreferences(preferences: NotificationPreferencesUpdate): Promise<NotificationPreferences> {
    return apiClient.put('/auth/profile/notification-preferences', preferences)
  }

  // API Keys (Premium only)
  async getApiKeys(): Promise<ApiKey[]> {
    return apiClient.get('/auth/api-keys')
  }

  async createApiKey(keyData: ApiKeyCreateRequest): Promise<ApiKeyCreateResponse> {
    return apiClient.post('/auth/api-keys', keyData)
  }

  async deleteApiKey(keyId: number): Promise<{ message: string }> {
    return apiClient.delete(`/auth/api-keys/${keyId}`)
  }

  // Data Export (Premium only)
  async requestDataExport(exportRequest: DataExportRequest): Promise<DataExport> {
    return apiClient.post('/auth/data-export', exportRequest)
  }

  async getDataExports(): Promise<DataExport[]> {
    return apiClient.get('/auth/data-export')
  }

  async downloadDataExport(exportId: number): Promise<Blob> {
    // Use the new getBlob method which properly handles blob responses
    return apiClient.getBlob(`/auth/data-export/${exportId}/download`)
  }
}

// Export singleton instance
export const authAPI = new AuthAPI()
export default authAPI