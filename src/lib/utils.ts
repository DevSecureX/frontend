import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  // DEPRECATED: Use TimezoneContext's formatDate instead
  // This function lacks timezone handling and proper error handling
  console.warn('formatDate is deprecated. Use formatDate from TimezoneContext instead for proper timezone support.')

  try {
    const target = typeof date === 'string' ? new Date(date) : date

    // Check for invalid dates
    if (isNaN(target.getTime())) {
      console.error('Invalid date provided to formatDate:', date)
      return 'Invalid date'
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(target)
  } catch (error) {
    console.error('Error in formatDate:', error)
    return 'Invalid date'
  }
}

export function formatRelativeTime(date: string | Date) {
  // DEPRECATED: Use TimezoneContext's formatRelativeDate instead
  // This function has been replaced to fix timezone handling and NaN issues
  console.warn('formatRelativeTime is deprecated. Use formatRelativeDate from TimezoneContext instead.')

  try {
    const now = new Date()
    const target = typeof date === 'string' ? new Date(date) : date

    // Check for invalid dates to prevent NaN
    if (isNaN(target.getTime())) {
      console.error('Invalid date provided to formatRelativeTime:', date)
      return 'Invalid date'
    }

    const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'just now'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays}d ago`
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}mo ago`
  } catch (error) {
    console.error('Error in formatRelativeTime:', error)
    return 'Invalid date'
  }
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return `${str.slice(0, length)}...`
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatScanDuration(durationInSeconds: number): string {
  const totalSeconds = Math.round(durationInSeconds)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}