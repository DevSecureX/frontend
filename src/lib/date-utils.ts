// Simple date formatting utilities to replace date-fns
export function format(date: Date, formatStr: string): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const dayOfWeek = date.getDay()
  
  // Handle common format patterns
  switch (formatStr) {
    case 'PPP':
      return `${months[month]} ${day}, ${year}`
    case 'LLL dd, y':
      return `${shortMonths[month]} ${String(day).padStart(2, '0')}, ${year}`
    case 'yyyy-MM-dd':
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    case 'MM/dd/yyyy':
      return `${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`
    case 'dd/MM/yyyy':
      return `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`
    default:
      // Basic fallback
      return `${months[month]} ${day}, ${year}`
  }
}

export function isAfter(date1: Date, date2: Date): boolean {
  return date1.getTime() > date2.getTime()
}

export function isBefore(date1: Date, date2: Date): boolean {
  return date1.getTime() < date2.getTime()
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function subDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}