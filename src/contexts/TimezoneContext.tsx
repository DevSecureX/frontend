/**
 * DevSecureX Timezone Context
 * 
 * Optimized timezone handling system that:
 * 1. Auto-detects user's local timezone on first visit (no more UTC defaults)
 * 2. Uses localStorage cache with user-specific keys to prevent repeated API calls
 * 3. Implements cache versioning for future-proof updates
 * 4. Only calls timezone API when settings are actually changed in the settings page
 * 5. Prevents API calls on every page navigation/refresh
 * 
 * Key improvements over previous implementation:
 * - Eliminates repeated calls to /auth/profile/timezone-preferences
 * - Provides instant timezone preferences loading from cache
 * - Maintains sync with backend only when necessary
 * - Handles authentication state changes gracefully
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { 
  detectUserTimezone, 
  formatDateForUser, 
  DATE_FORMATS, 
  TIME_FORMATS,
  COMMON_TIMEZONES,
  isValidTimezone 
} from '@/lib/timezone'
import { authAPI, type TimezonePreferences as APITimezonePreferences, type TimezonePreferencesUpdate } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'
import { debounce } from '@/lib/utils'

// Types
export interface TimezonePreferences {
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  showRelativeDates: boolean
  showTimezone: boolean
  _cacheVersion?: number // For cache invalidation
  _timezoneSource?: 'auto-detected' | 'manually-set' | 'backend-synced' // Track how timezone was set
  _lastManualUpdate?: number // Timestamp when user last manually changed timezone
}

interface TimezoneContextType {
  preferences: TimezonePreferences
  updatePreferences: (updates: Partial<TimezonePreferences>) => void
  resetToDefaults: () => void
  refreshFromBackend: () => Promise<void>
  formatDate: (
    timestamp: string | Date | null | undefined,
    options?: {
      dateFormat?: string
      timeFormat?: string
      includeTime?: boolean
      includeTimezone?: boolean
      relative?: boolean
    }
  ) => string
  formatRelativeDate: (timestamp: string | Date | null | undefined) => string
  formatDateOnly: (timestamp: string | Date | null | undefined) => string
  formatTimeOnly: (timestamp: string | Date | null | undefined) => string
  isLoading: boolean
  syncStatus: 'loading' | 'synced' | 'error'
  lastSyncError: string | null
  // Helper functions for timezone source tracking
  isTimezoneManuallySet: () => boolean
  getTimezoneSource: () => 'auto-detected' | 'manually-set' | 'backend-synced'
  forceAutoDetectTimezone: () => void
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined)

// Default preferences (timezone will be auto-detected)
const DEFAULT_PREFERENCES: TimezonePreferences = {
  timezone: detectUserTimezone(), // Auto-detect immediately
  dateFormat: DATE_FORMATS.US,
  timeFormat: '12h',
  showRelativeDates: false,
  showTimezone: false,
  _timezoneSource: 'auto-detected',
  _lastManualUpdate: undefined,
}

// Storage key base - will be user-specific
const STORAGE_KEY_BASE = 'devsecurex_timezone_preferences'

// Cache version for invalidating old cached preferences
const CACHE_VERSION = 1

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<TimezonePreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'loading' | 'synced' | 'error'>('loading')
  const [lastSyncError, setLastSyncError] = useState<string | null>(null)
  const [hasLoadedFromAPI, setHasLoadedFromAPI] = useState(false)
  const { isAuthenticated, user } = useAuthStore()

  // Get user-specific storage key
  const getStorageKey = useCallback(() => {
    return user ? `${STORAGE_KEY_BASE}_${user.id}` : STORAGE_KEY_BASE
  }, [user])

  // Clean up old cache entries (can be called manually if needed)
  const cleanOldCache = useCallback(() => {
    try {
      // Clean up any timezone preference keys that don't match current version
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(STORAGE_KEY_BASE)) {
          try {
            const value = localStorage.getItem(key)
            if (value) {
              const parsed = JSON.parse(value) as TimezonePreferences
              if (!parsed._cacheVersion || parsed._cacheVersion !== CACHE_VERSION) {
                localStorage.removeItem(key)
              }
            }
          } catch {
            // Invalid JSON, remove it
            localStorage.removeItem(key)
          }
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }, [])

  // Convert API preferences to local format (memoized to prevent useEffect loops)
  const convertAPIToLocal = useCallback((apiPrefs: APITimezonePreferences): TimezonePreferences => ({
    timezone: apiPrefs.timezone,
    dateFormat: apiPrefs.date_format,
    timeFormat: apiPrefs.time_format as '12h' | '24h',
    showRelativeDates: apiPrefs.show_relative_dates,
    showTimezone: apiPrefs.show_timezone_abbreviations,
  }), [])

  // Convert local preferences to API format (memoized to prevent useEffect loops)
  const convertLocalToAPI = useCallback((localPrefs: Partial<TimezonePreferences>): TimezonePreferencesUpdate => ({
    timezone: localPrefs.timezone,
    date_format: localPrefs.dateFormat,
    time_format: localPrefs.timeFormat,
    show_relative_dates: localPrefs.showRelativeDates,
    show_timezone_abbreviations: localPrefs.showTimezone,
    // Note: _cacheVersion is not sent to API
  }), [])

  // Initialize preferences on first load only
  useEffect(() => {
    const initializePreferences = async () => {
      if (hasLoadedFromAPI) return // Don't initialize if already loaded from API

      try {
        setIsLoading(true)

        // Clean up old cache entries first
        cleanOldCache()

        // Try to load from localStorage cache first
        const storageKey = user ? `${STORAGE_KEY_BASE}_${user.id}` : STORAGE_KEY_BASE
        const cachedPrefs = localStorage.getItem(storageKey)

        // TEMPORARY: Clear cache if it contains UTC to force re-initialization
        if (cachedPrefs && cachedPrefs.includes('"Etc/UTC"')) {
          localStorage.removeItem(storageKey)
        }

        
        if (cachedPrefs) {
          try {
            const parsed = JSON.parse(cachedPrefs) as TimezonePreferences
            // Validate cached preferences including cache version
            if (
              parsed.timezone &&
              isValidTimezone(parsed.timezone) &&
              parsed._cacheVersion === CACHE_VERSION
            ) {
              setPreferences(parsed)
              setSyncStatus('synced')
              setIsLoading(false)
              setHasLoadedFromAPI(true) // Mark as loaded to prevent API calls
              return // Use cached data, don't hit API
            } else {
              localStorage.removeItem(storageKey) // Clean up outdated/invalid cache
            }
          } catch {
            localStorage.removeItem(storageKey) // Clean up invalid cache
          }
        }

        // No cache or invalid cache - use defaults with auto-detected timezone
        // IMPORTANT: For authenticated users, we'll load from backend first
        // For unauthenticated users, auto-detect timezone

        const detectedTimezone = detectUserTimezone()

        if (user && isAuthenticated) {
          // For authenticated users, let the backend loading effect handle initialization
          // to avoid overriding potential manual settings from backend
          const tempPrefs = {
            ...DEFAULT_PREFERENCES,
            timezone: detectedTimezone, // Use detected timezone
            _cacheVersion: CACHE_VERSION,
            _timezoneSource: 'auto-detected' as const,
            _lastManualUpdate: undefined
          }
          setPreferences(tempPrefs)
        } else {
          // For unauthenticated users, auto-detect and cache
          const defaultPrefs = {
            ...DEFAULT_PREFERENCES,
            timezone: detectedTimezone,
            _cacheVersion: CACHE_VERSION,
            _timezoneSource: 'auto-detected' as const,
            _lastManualUpdate: undefined
          }

          setPreferences(defaultPrefs)
          localStorage.setItem(storageKey, JSON.stringify(defaultPrefs))
        }
        
        setIsLoading(false)
        setSyncStatus('synced')
      } catch (error) {
        console.error('Failed to initialize timezone preferences:', error)
        setPreferences({
          ...DEFAULT_PREFERENCES,
          timezone: detectUserTimezone()
        })
        setIsLoading(false)
        setSyncStatus('error')
      }
    }

    initializePreferences()
  }, [user, hasLoadedFromAPI, cleanOldCache]) // Add dependencies

  // Reset hasLoadedFromAPI when user logs out
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setHasLoadedFromAPI(false) // Reset flag when user logs out
    }
  }, [isAuthenticated, user])

  // Load from API only when user logs in and we have no cached data
  useEffect(() => {
    const loadFromAPI = async () => {
      if (!isAuthenticated || !user || hasLoadedFromAPI) {
        return // Don't fetch if not authenticated or already loaded
      }

      // Check if we already have valid cached data for this user
      const storageKey = `${STORAGE_KEY_BASE}_${user.id}`
      const cachedPrefs = localStorage.getItem(storageKey)
      
      if (cachedPrefs) {
        try {
          const parsed = JSON.parse(cachedPrefs) as TimezonePreferences
          if (
            parsed.timezone && 
            isValidTimezone(parsed.timezone) &&
            parsed._cacheVersion === CACHE_VERSION
          ) {
            // We have valid cached data, don't call API
            setHasLoadedFromAPI(true)
            return
          }
        } catch (error) {
          // Invalid cache, we'll fetch from API
          localStorage.removeItem(storageKey)
        }
      }

      try {
        setSyncStatus('loading')
        setLastSyncError(null)

        // Load from backend with timeout
        const backendPrefs = await Promise.race([
          authAPI.getTimezonePreferences(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timezone API timeout')), 5000)
          )
        ])
        
        const convertedBackendPrefs = convertAPIToLocal(backendPrefs)

        // CRITICAL: If backend returns UTC/Etc/UTC as default, use auto-detected timezone instead
        const shouldUseAutoDetected = (
          convertedBackendPrefs.timezone === 'UTC' ||
          convertedBackendPrefs.timezone === 'Etc/UTC' ||
          convertedBackendPrefs.timezone === 'UTC+0'
        )

        const finalPreferences = {
          ...convertedBackendPrefs,
          // Use auto-detected timezone if backend returns default UTC
          timezone: shouldUseAutoDetected ? detectUserTimezone() : convertedBackendPrefs.timezone,
          _cacheVersion: CACHE_VERSION,
          _timezoneSource: shouldUseAutoDetected ? 'auto-detected' as const : 'backend-synced' as const
        }

        // Only update if we don't already have preferences or if they're different
        // CRITICAL: Respect manual user selections - don't override with backend data
        setPreferences(prevPrefs => {
          // If user has manually set timezone, preserve it unless backend has newer manual setting
          if (prevPrefs._timezoneSource === 'manually-set' && prevPrefs._lastManualUpdate) {
            // Keep manual settings unless backend has a more recent manual update
            const backendManualUpdate = (backendPrefs as any)._lastManualUpdate
            if (!backendManualUpdate || prevPrefs._lastManualUpdate > backendManualUpdate) {
              return prevPrefs
            }
          }
          
          const shouldUpdate = (
            !prevPrefs.timezone ||
            prevPrefs.timezone !== finalPreferences.timezone ||
            JSON.stringify(prevPrefs) !== JSON.stringify(finalPreferences)
          )

          if (shouldUpdate) {
            // Update localStorage as cache
            localStorage.setItem(storageKey, JSON.stringify(finalPreferences))
            return finalPreferences
          }

          return prevPrefs
        })
        
        setSyncStatus('synced')
        setHasLoadedFromAPI(true) // Mark as loaded to prevent future calls
      } catch (error) {
        setLastSyncError(error instanceof Error ? error.message : 'Unknown error')
        setSyncStatus('error')
        setHasLoadedFromAPI(true) // Still mark as loaded to prevent retry loops
        // Keep existing preferences instead of resetting
      }
    }

    // Only load when user becomes authenticated for the first time
    loadFromAPI()
  }, [isAuthenticated, user, hasLoadedFromAPI, convertAPIToLocal])

  // Save preferences to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(preferences))
      } catch {
        // Ignore localStorage write errors
      }
    }
  }, [preferences, isLoading, getStorageKey])

  // Debounced backend sync function
  const syncToBackend = useCallback(
    debounce(async (prefs: TimezonePreferences) => {
      if (!isAuthenticated || !user) return

      try {
        const apiUpdate = convertLocalToAPI(prefs)
        await authAPI.updateTimezonePreferences(apiUpdate)
        setSyncStatus('synced')
        setLastSyncError(null)
      } catch (error) {
        setLastSyncError(error instanceof Error ? error.message : 'Unknown error')
        setSyncStatus('error')
        // Keep preferences locally even if backend sync fails
      }
    }, 1000),
    [isAuthenticated, user, convertLocalToAPI]
  )

  // Update preferences with backend sync (authenticated users only)
  const updatePreferences = useCallback((updates: Partial<TimezonePreferences>) => {
    if (!isAuthenticated || !user) {
      return
    }

    // Mark timezone as manually set if timezone is being updated
    const isTimezoneUpdate = 'timezone' in updates
    const newPreferences = { 
      ...preferences, 
      ...updates, 
      _cacheVersion: CACHE_VERSION,
      // Mark as manually set if timezone is being changed
      ...(isTimezoneUpdate && {
        _timezoneSource: 'manually-set' as const,
        _lastManualUpdate: Date.now()
      })
    }
    setPreferences(newPreferences)
    
    // Update localStorage as cache
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newPreferences))
    } catch {
      // Ignore localStorage write errors
    }

    // Debounced backend sync
    syncToBackend(newPreferences)
  }, [preferences, isAuthenticated, user, syncToBackend, getStorageKey])

  // Reset to defaults with backend sync (authenticated users only)
  const resetToDefaults = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return
    }

    const detectedTimezone = detectUserTimezone()
    const newPreferences = {
      ...DEFAULT_PREFERENCES,
      timezone: detectedTimezone,
      _cacheVersion: CACHE_VERSION,
      _timezoneSource: 'auto-detected' as const,
      _lastManualUpdate: undefined
    }
    
    setPreferences(newPreferences)
    
    // Update localStorage cache
    localStorage.setItem(getStorageKey(), JSON.stringify(newPreferences))
    
    // Sync to backend
    try {
      const apiUpdate = convertLocalToAPI(newPreferences)
      await authAPI.updateTimezonePreferences(apiUpdate)
      setSyncStatus('synced')
      setLastSyncError(null)
    } catch (error) {
      setLastSyncError(error instanceof Error ? error.message : 'Unknown error')
      setSyncStatus('error')
    }
  }, [isAuthenticated, user, convertLocalToAPI, getStorageKey])

  // Manual refresh function for settings updates
  const refreshFromBackend = useCallback(async () => {
    if (!isAuthenticated || !user) {
      throw new Error('Cannot refresh preferences - user not authenticated')
    }

    try {
      setSyncStatus('loading')
      setLastSyncError(null)

      const backendPrefs = await authAPI.getTimezonePreferences()
      const finalPreferences = {
        ...convertAPIToLocal(backendPrefs),
        _cacheVersion: CACHE_VERSION,
        _timezoneSource: 'backend-synced' as const
      }
      
      setPreferences(finalPreferences)
      setSyncStatus('synced')
      
      // Update localStorage cache
      localStorage.setItem(getStorageKey(), JSON.stringify(finalPreferences))
    } catch (error) {
      console.error('Failed to refresh preferences from backend:', error)
      setLastSyncError(error instanceof Error ? error.message : 'Unknown error')
      setSyncStatus('error')
      throw error
    }
  }, [isAuthenticated, user, convertAPIToLocal, getStorageKey])

  // Memoized formatting functions for performance
  const formatDate = useCallback((
    timestamp: string | Date | null | undefined,
    options: {
      dateFormat?: string
      timeFormat?: string
      includeTime?: boolean
      includeTimezone?: boolean
      relative?: boolean
    } = {}
  ): string => {
    // Use relative dates if preferred and not explicitly overridden
    const shouldUseRelative = preferences.showRelativeDates && options.relative !== false
    
    return formatDateForUser(timestamp, preferences.timezone, {
      dateFormat: options.dateFormat || preferences.dateFormat,
      timeFormat: options.timeFormat || TIME_FORMATS[preferences.timeFormat],
      includeTime: options.includeTime,
      includeTimezone: options.includeTimezone ?? false, // Default to false unless explicitly requested
      relative: shouldUseRelative || options.relative
    })
  }, [preferences])

  const formatRelativeDate = useCallback((
    timestamp: string | Date | null | undefined
  ): string => {
    return formatDateForUser(timestamp, preferences.timezone, {
      relative: true
    })
  }, [preferences.timezone])

  const formatDateOnly = useCallback((
    timestamp: string | Date | null | undefined
  ): string => {
    return formatDateForUser(timestamp, preferences.timezone, {
      dateFormat: preferences.dateFormat,
      includeTime: false,
      includeTimezone: false
    })
  }, [preferences])

  const formatTimeOnly = useCallback((
    timestamp: string | Date | null | undefined
  ): string => {
    try {
      // CRITICAL FIX: Additional validation for time-only formatting
      if (!timestamp) return 'N/A'

      const formatted = formatDateForUser(timestamp, preferences.timezone, {
        dateFormat: '',
        timeFormat: TIME_FORMATS[preferences.timeFormat],
        includeTime: true,
        includeTimezone: false
      }).replace(/^,\s*/, '') // Remove leading comma from empty date format

      return formatted
    } catch (error) {
      console.error('formatTimeOnly error:', error, { timestamp, preferences })
      // Fallback formatting
      try {
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp || '')
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: preferences.timeFormat === '12h'
        })
      } catch (fallbackError) {
        console.error('formatTimeOnly fallback error:', fallbackError)
        return 'Invalid time'
      }
    }
  }, [preferences])

  // Helper functions for timezone source tracking
  const isTimezoneManuallySet = useCallback(() => {
    return preferences._timezoneSource === 'manually-set'
  }, [preferences._timezoneSource])

  const getTimezoneSource = useCallback(() => {
    return preferences._timezoneSource || 'auto-detected'
  }, [preferences._timezoneSource])

  const forceAutoDetectTimezone = useCallback(() => {
    if (!isAuthenticated || !user) {
      return
    }

    const detectedTimezone = detectUserTimezone()
    updatePreferences({
      timezone: detectedTimezone,
      // Reset to auto-detected source (this will be overridden by updatePreferences to 'manually-set')
      // So we need to set it explicitly after
    })

    // Manually set the source back to auto-detected since updatePreferences marks as manual
    setPreferences(prev => ({
      ...prev,
      timezone: detectedTimezone,
      _timezoneSource: 'auto-detected',
      _lastManualUpdate: undefined
    }))
  }, [isAuthenticated, user, updatePreferences])

  // Memoized context value
  const contextValue = useMemo(() => ({
    preferences,
    updatePreferences,
    resetToDefaults,
    refreshFromBackend,
    formatDate,
    formatRelativeDate,
    formatDateOnly,
    formatTimeOnly,
    isLoading,
    syncStatus,
    lastSyncError,
    isTimezoneManuallySet,
    getTimezoneSource,
    forceAutoDetectTimezone
  }), [
    preferences,
    updatePreferences,
    resetToDefaults,
    refreshFromBackend,
    formatDate,
    formatRelativeDate,
    formatDateOnly,
    formatTimeOnly,
    isLoading,
    syncStatus,
    lastSyncError,
    isTimezoneManuallySet,
    getTimezoneSource,
    forceAutoDetectTimezone
  ])

  return (
    <TimezoneContext.Provider value={contextValue}>
      {children}
    </TimezoneContext.Provider>
  )
}

// Hook to use timezone context
export const useTimezone = (): TimezoneContextType => {
  const context = useContext(TimezoneContext)
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider')
  }
  return context
}

// Convenience hooks for common use cases
export const useFormattedDate = (timestamp: string | Date | null | undefined) => {
  const { formatDate } = useTimezone()
  return useMemo(() => formatDate(timestamp), [formatDate, timestamp])
}

export const useRelativeDate = (timestamp: string | Date | null | undefined) => {
  const { formatRelativeDate } = useTimezone()
  return useMemo(() => formatRelativeDate(timestamp), [formatRelativeDate, timestamp])
}

// Component for easy date formatting
export const FormattedDate: React.FC<{
  date: string | Date | null | undefined
  relative?: boolean
  includeTime?: boolean
  includeTimezone?: boolean
  className?: string
}> = ({ 
  date, 
  relative = false, 
  includeTime = true, 
  includeTimezone = true, 
  className 
}) => {
  const { formatDate } = useTimezone()
  
  const formattedDate = useMemo(() => 
    formatDate(date, { 
      relative, 
      includeTime, 
      includeTimezone 
    }), 
    [formatDate, date, relative, includeTime, includeTimezone]
  )
  
  return <span className={className}>{formattedDate}</span>
}

// Export common timezone lists for settings UI
export { COMMON_TIMEZONES, DATE_FORMATS, TIME_FORMATS }

export default TimezoneContext