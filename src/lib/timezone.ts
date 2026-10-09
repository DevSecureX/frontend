import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

// Common timezone mappings for easy access
export const COMMON_TIMEZONES = {
  // USA
  'America/New_York': 'Eastern Time (EST/EDT)',
  'America/Chicago': 'Central Time (CST/CDT)', 
  'America/Denver': 'Mountain Time (MST/MDT)',
  'America/Los_Angeles': 'Pacific Time (PST/PDT)',
  'America/Anchorage': 'Alaska Time (AKST/AKDT)',
  'Pacific/Honolulu': 'Hawaii Time (HST)',
  
  // India
  'Asia/Kolkata': 'India Standard Time (IST)',
  
  // Europe
  'Europe/London': 'Greenwich Mean Time (GMT/BST)',
  'Europe/Paris': 'Central European Time (CET/CEST)',
  'Europe/Berlin': 'Central European Time (CET/CEST)',
  'Europe/Moscow': 'Moscow Time (MSK)',
  
  // Asia-Pacific
  'Asia/Tokyo': 'Japan Standard Time (JST)',
  'Asia/Shanghai': 'China Standard Time (CST)',
  'Asia/Hong_Kong': 'Hong Kong Time (HKT)',
  'Asia/Singapore': 'Singapore Standard Time (SGT)',
  'Australia/Sydney': 'Australian Eastern Time (AEST/AEDT)',
  'Australia/Melbourne': 'Australian Eastern Time (AEST/AEDT)',
}

// Date format options
export const DATE_FORMATS = {
  US: 'MMM dd, yyyy',
  EU: 'dd MMM yyyy', 
  ISO: 'yyyy-MM-dd',
  FULL_US: 'EEEE, MMMM dd, yyyy',
  FULL_EU: 'EEEE, dd MMMM yyyy',
}

export const TIME_FORMATS = {
  '12h': 'h:mm a',
  '24h': 'HH:mm',
  '12h_seconds': 'h:mm:ss a',
  '24h_seconds': 'HH:mm:ss',
}

// Auto-detect user's timezone
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    console.warn('Failed to detect timezone, defaulting to UTC:', error)
    return 'UTC'
  }
}

// Get timezone abbreviation (EST, PST, IST, etc.)
export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    })
    
    const parts = formatter.formatToParts(date)
    const timeZonePart = parts.find(part => part.type === 'timeZoneName')
    return timeZonePart?.value || timezone.split('/')[1] || 'UTC'
  } catch (error) {
    console.warn('Failed to get timezone abbreviation:', error)
    return 'UTC'
  }
}

// Parse server timestamp (handles various formats)
export function parseServerTimestamp(timestamp: string | null | undefined): Date | null {
  if (!timestamp) return null

  try {
    // Handle ISO strings
    if (timestamp.includes('T')) {
      // CRITICAL FIX: If timestamp doesn't end with 'Z' but contains 'T',
      // assume it's UTC from server and add 'Z' suffix
      // This handles backends that send ISO timestamps without timezone indicators
      let normalizedTimestamp = timestamp
      if (!timestamp.endsWith('Z') && !timestamp.includes('+') && !timestamp.includes('-', 10)) {
        normalizedTimestamp = `${timestamp  }Z`
      }

      return parseISO(normalizedTimestamp)
    }

    // Handle other formats
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp format:', timestamp)
      return null
    }

    return date
  } catch (error) {
    console.warn('Failed to parse timestamp:', timestamp, error)
    return null
  }
}

// Format date for user's timezone
export function formatDateForUser(
  timestamp: string | Date | null | undefined,
  userTimezone: string,
  options: {
    dateFormat?: string
    timeFormat?: string
    includeTime?: boolean
    includeTimezone?: boolean
    relative?: boolean
  } = {}
): string {
  if (!timestamp) return 'N/A'

  try {
    const date = timestamp instanceof Date ? timestamp : parseServerTimestamp(timestamp)
    if (!date) return 'Invalid date'

    const {
      dateFormat = DATE_FORMATS.US,
      timeFormat = TIME_FORMATS['12h'],
      includeTime = true,
      includeTimezone = false,
      relative = false
    } = options

    // Return relative time if requested
    if (relative) {
      return formatDistanceToNow(date, { addSuffix: true })
    }

    // Format in user's timezone
    let formatString = dateFormat
    if (includeTime) {
      formatString += `, ${timeFormat}`
    }

    let formattedDate = formatInTimeZone(date, userTimezone, formatString)

    // Add timezone abbreviation if requested
    if (includeTimezone && includeTime) {
      const tzAbbr = getTimezoneAbbreviation(userTimezone, date)
      formattedDate += ` ${tzAbbr}`
    }

    return formattedDate
  } catch (error) {
    console.warn('Failed to format date:', error)
    return 'Invalid date'
  }
}

// Format date range
export function formatDateRange(
  startDate: string | Date | null,
  endDate: string | Date | null,
  userTimezone: string,
  options: { dateFormat?: string; timeFormat?: string } = {}
): string {
  const start = formatDateForUser(startDate, userTimezone, {
    ...options,
    includeTimezone: false
  })
  const end = formatDateForUser(endDate, userTimezone, {
    ...options,
    includeTimezone: true
  })
  
  if (start === 'N/A' || end === 'N/A') return 'N/A'
  return `${start} - ${end}`
}

// Get timezone offset for display
export function getTimezoneOffset(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    })
    
    const parts = formatter.formatToParts(date)
    const offsetPart = parts.find(part => part.type === 'timeZoneName')
    return offsetPart?.value || '+00:00'
  } catch (error) {
    console.warn('Failed to get timezone offset:', error)
    return '+00:00'
  }
}

// Validate timezone
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch (error) {
    return false
  }
}

// Get current time in specific timezone
export function getCurrentTimeInTimezone(timezone: string): Date {
  try {
    return toZonedTime(new Date(), timezone)
  } catch (error) {
    console.warn('Failed to get current time in timezone:', error)
    return new Date()
  }
}

// Enterprise-grade error handling wrapper
export function safeFormatDate(
  timestamp: string | Date | null | undefined,
  userTimezone: string,
  fallback: string = 'N/A'
): string {
  try {
    return formatDateForUser(timestamp, userTimezone)
  } catch (error) {
    console.error('Date formatting error:', error)
    return fallback
  }
}

export default {
  detectUserTimezone,
  formatDateForUser,
  formatDateRange,
  parseServerTimestamp,
  getTimezoneAbbreviation,
  getTimezoneOffset,
  isValidTimezone,
  getCurrentTimeInTimezone,
  safeFormatDate,
  COMMON_TIMEZONES,
  DATE_FORMATS,
  TIME_FORMATS
}