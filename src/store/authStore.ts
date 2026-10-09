import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { api, apiClient } from '@/lib/api'
import type { User, AuthToken } from '@/types/global'
import type { LoginRequest, SignupRequest } from '@/lib/api/auth'
import { toast } from 'sonner'

interface AuthState {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  signup: (userData: SignupRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
  
  // OAuth
  handleOAuthCallback: (params: URLSearchParams) => void
  initiateGoogleLogin: () => void
  initiateGithubLogin: () => void
  connectGithub: () => Promise<string>
  
  // Profile
  updateProfile: (profileData: {
    first_name?: string
    last_name?: string
    mobile_no?: string
  }) => Promise<void>

  // Subscription
  isPremium: () => boolean
  getPremiumExpiry: () => Date | null
  
  // Initialization
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer<AuthState>((set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginRequest) => {
        set(state => {
          state.isLoading = true
          state.error = null
        })

        try {
          // Normalize username to lowercase for consistent authentication
          const normalizedCredentials = {
            ...credentials,
            username: credentials.username.toLowerCase().trim()
          }
          
          const response = await api.auth.login(normalizedCredentials)
          
          // Set auth token in API client
          apiClient.setAuthToken(response.access_token)
          
          set(state => {
            state.user = response.member_details
            state.token = response.access_token
            state.isAuthenticated = true
            state.isLoading = false
          })

          toast.success('Logged in successfully!')
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Login failed'
            state.isLoading = false
          })
          
          // For login 401 errors, show proper error message without redirect
          if (error.status === 401) {
            toast.error('Invalid username or password')
          } else {
            toast.error(error.message || 'Login failed')
          }
          
          throw error
        }
      },

      // Signup action
      signup: async (userData: SignupRequest) => {
        set(state => {
          state.isLoading = true
          state.error = null
        })

        try {
          // Normalize username to lowercase for consistency
          const normalizedUserData = {
            ...userData,
            username: userData.username.toLowerCase().trim()
          }
          
          await api.auth.signup(normalizedUserData)
          
          set(state => {
            state.isLoading = false
          })

          toast.success('Account created successfully! Please log in.')
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Signup failed'
            state.isLoading = false
          })
          throw error
        }
      },

      // Logout action
      logout: async () => {
        try {
          // Call logout endpoint
          await api.auth.logout()
        } catch (error) {
          console.warn('Logout API call failed:', error)
        } finally {
          // Clear auth state regardless of API call result
          apiClient.clearAuth()
          
          set(state => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.error = null
          })

          toast.success('Logged out successfully')
        }
      },

      // Refresh user data
      refreshUser: async () => {
        const { token } = get()
        if (!token) return

        try {
          const userData = await api.auth.getCurrentUser()
          
          set(state => {
            if (state.user) {
              // Update existing user data
              Object.assign(state.user, userData)
            }
          })
        } catch (error) {
          console.error('Failed to refresh user:', error)
          // Don't clear auth on refresh failure - token might still be valid
        }
      },

      // Clear error
      clearError: () => {
        set(state => {
          state.error = null
        })
      },

      // OAuth callback handler
      handleOAuthCallback: (params: URLSearchParams) => {
        // Processing OAuth callback

        const token = params.get('access_token')
        const error = params.get('error')

        if (error) {
          console.error('OAuth error:', error)
          set(state => {
            state.error = decodeURIComponent(error)
            state.isAuthenticated = false
            state.user = null
            state.token = null
          })
          toast.error(`OAuth authentication failed: ${decodeURIComponent(error)}`)
          return
        }

        if (token) {
          // Processing OAuth token and user details
          
          // Extract user details from URL params
          const memberDetails: User = {
            id: parseInt(params.get('id') || '0'),
            username: params.get('username') || '',
            first_name: params.get('first_name') || '',
            last_name: params.get('last_name') || '',
            email: decodeURIComponent(params.get('email') || ''),
            mobile_no: params.get('mobile_no') || undefined,
            is_premium: params.get('is_premium') === 'true',
            premium_expiry: params.get('premium_expiry') || undefined,
            is_github_connected: params.get('is_github_connected') === 'true' || params.get('github_connected') === 'true'
          }

          // Setting user details

          // Set auth token in API client
          apiClient.setAuthToken(token)

          set(state => {
            state.user = memberDetails
            state.token = token
            state.isAuthenticated = true
            state.error = null
          })

          // OAuth callback processing completed successfully
          toast.success('Authentication successful!')
        } else {
          console.error('No token found in OAuth callback')
          set(state => {
            state.error = 'No authentication token received'
            state.isAuthenticated = false
          })
          toast.error('No authentication token received')
        }
      },

      // Initiate Google OAuth
      initiateGoogleLogin: () => {
        api.auth.initiateGoogleLogin()
      },

      // Initiate GitHub OAuth
      initiateGithubLogin: () => {
        api.auth.initiateGithubLogin()
      },

      // Connect GitHub for existing user
      connectGithub: async () => {
        const response = await api.auth.connectGithub()
        return response.auth_url
      },

      // Update profile
      updateProfile: async (profileData) => {
        set(state => {
          state.isLoading = true
          state.error = null
        })

        try {
          const updatedUser = await api.auth.updateProfile(profileData)
          
          set(state => {
            state.user = updatedUser
            state.isLoading = false
          })

          toast.success('Profile updated successfully!')
        } catch (error: any) {
          set(state => {
            state.error = error.message || 'Profile update failed'
            state.isLoading = false
          })
          throw error
        }
      },

      // Check if user is premium
      isPremium: () => {
        const { user } = get()
        if (!user) return false
        
        if (!user.is_premium) return false
        
        if (user.premium_expiry) {
          const expiry = new Date(user.premium_expiry)
          return expiry > new Date()
        }
        
        return user.is_premium
      },

      // Get premium expiry date
      getPremiumExpiry: () => {
        const { user } = get()
        if (!user?.premium_expiry) return null
        return new Date(user.premium_expiry)
      },

      // Initialize auth state
      initialize: async () => {
        const { token } = get()
        
        // Set loading state
        set(state => {
          state.isLoading = true
        })
        
        if (token) {
          try {
            // Set token in API client
            apiClient.setAuthToken(token)
            
            // If user is already authenticated, trust the existing state for better UX
            if (get().isAuthenticated && get().user) {
              set(state => {
                state.isLoading = false
              })
              return
            }
            
            // Create a timeout promise to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('API timeout')), 5000)
            })
            
            // Race between API call and timeout
            const userData = await Promise.race([
              api.auth.getCurrentUser(),
              timeoutPromise
            ])
            
            set(state => {
              if (!state.user) {
                state.user = {
                  id: 0,
                  username: (userData as any).username,
                  first_name: '',
                  last_name: '',
                  email: (userData as any).email,
                  is_premium: (userData as any).is_premium,
                  premium_expiry: (userData as any).premium_expiry,
                  is_github_connected: (userData as any).is_github_connected
                }
              } else {
                // Update existing user data
                Object.assign(state.user, userData)
              }
              state.isAuthenticated = true
              state.isLoading = false
            })
          } catch (error: any) {
            console.error('Token validation failed:', error)
            
            // Only clear auth for actual authentication failures, not network errors
            const isAuthError = error?.response?.status === 401 || 
                               error?.response?.status === 403 ||
                               error?.message?.includes('Unauthorized') ||
                               error?.message?.includes('Invalid token') ||
                               error?.message?.includes('Token expired')
            
            if (isAuthError) {
              // Clearing auth due to authentication error
              apiClient.clearAuth()
              
              // Also clear the persisted store to prevent reload loops
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem('auth-store')
              }
              
              set(state => {
                state.user = null
                state.token = null
                state.isAuthenticated = false
                state.isLoading = false
              })
              
              // Force redirect to auth page if not already there
              if (!window.location.pathname.startsWith('/auth')) {
                toast.error('Session expired. Please log in again.')
                setTimeout(() => {
                  window.location.href = '/auth'
                }, 1000) // Shorter delay for better UX
              }
            } else {
              // For network errors, keep user logged in but stop loading
              // Network error during token validation, keeping user logged in
              set(state => {
                state.isLoading = false
                // Keep existing auth state
              })
            }
          }
        } else {
          // No token found, ensure user is marked as not authenticated
          set(state => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.isLoading = false
          })
        }
      },
    })),
    {
      name: 'auth-store',
      partialize: (state: AuthState) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize auth store only if not on auth pages to prevent conflicts during login
if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
  useAuthStore.getState().initialize()
}