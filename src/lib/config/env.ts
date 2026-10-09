// Environment configuration with type safety and validation

// Timeout configurations for different operation types
export const API_TIMEOUTS = {
  // Quick operations (5-10 seconds)
  QUICK: 10000, // health checks, user data, simple API calls
  
  // Medium operations (30-60 seconds)  
  MEDIUM: 60000, // repository listings, simple scans, metadata fetching
  
  // Long operations (up to 30 minutes)
  LONG: 1800000, // PR scanning, comprehensive scans, bulk operations - matches backend max processing time
  
  // Job polling operations (longer for reliability during long scans)
  POLLING: 30000, // individual job status checks during polling - increased for reliability
  
  // Default fallback
  DEFAULT: 30000
} as const

export type TimeoutType = keyof typeof API_TIMEOUTS

interface AppConfig {
  api: {
    baseUrl: string
    version: string
    timeout: number
    timeouts: typeof API_TIMEOUTS
  }
  app: {
    env: 'development' | 'staging' | 'production'
    name: string
    version: string
  }
  features: {
    analytics: boolean
    feedback: boolean
    realTime: boolean
  }
  external: {
    githubClientId?: string
    googleClientId?: string
    razorpayKeyId?: string
    socketUrl?: string
  }
}

function getEnvVar(key: string, defaultValue: string = ''): string {
  const value = import.meta.env[key] as string | undefined
  return value ?? defaultValue
}

function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env[key] as string | boolean | undefined
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return defaultValue
}

// Validate required environment variables (only in production)
function validateConfig(): void {
  if (getEnvVar('VITE_APP_ENV', 'development') === 'production') {
    const required = ['VITE_API_BASE_URL']
    const missing = required.filter(key => !(import.meta.env[key] as string | undefined))
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }
}

// Initialize and validate configuration
validateConfig()

export const config: AppConfig = {
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8010'),
    version: getEnvVar('VITE_API_VERSION', 'v1'),
    timeout: API_TIMEOUTS.DEFAULT, // Default timeout for backwards compatibility
    timeouts: API_TIMEOUTS,
  },
  app: {
    env: (['development', 'staging', 'production'].includes(getEnvVar('VITE_APP_ENV', 'development')) 
      ? getEnvVar('VITE_APP_ENV', 'development') 
      : 'development') as AppConfig['app']['env'],
    name: 'DevSecureX',
    version: '1.0.0',
  },
  features: {
    analytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', true),
    feedback: getBooleanEnvVar('VITE_ENABLE_FEEDBACK', true),
    realTime: getBooleanEnvVar('VITE_ENABLE_REAL_TIME', true),
  },
  external: {
    githubClientId: getEnvVar('VITE_GITHUB_CLIENT_ID'),
    googleClientId: getEnvVar('VITE_GOOGLE_CLIENT_ID'),
    razorpayKeyId: getEnvVar('VITE_RAZORPAY_KEY_ID'),
    socketUrl: getEnvVar('VITE_SOCKET_URL', (() => {
      const baseUrl = getEnvVar('VITE_API_BASE_URL', 'http://localhost:8010');
      return baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    })()),
  },
}

// Helper functions for environment checks
export const isDevelopment = config.app.env === 'development'
export const isProduction = config.app.env === 'production'
export const isStaging = config.app.env === 'staging'

// API URL builder
export function buildApiUrl(endpoint: string): string {
  const baseUrl = config.api.baseUrl.replace(/\/$/, '') // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, '') // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`
}

// Feature flag helpers
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  return config.features[feature]
}

export default config