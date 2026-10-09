import { z } from 'zod'

// Common validation patterns
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

export const strongPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
  .regex(/^(?!.*([a-zA-Z0-9])\1{2,})/, 'Password must not contain repeated characters')

export const phoneSchema = z
  .string()
  .regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
  .optional()

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .optional()
  .or(z.literal(''))

export const requiredUrlSchema = z
  .string()
  .min(1, 'URL is required')
  .url('Invalid URL format')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens separating words')

// File validation
export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 2 * 1024 * 1024, 'Image size must be less than 2MB')
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
    'Only JPEG, PNG, WebP, and GIF images are allowed'
  )

export const csvFileSchema = z
  .instanceof(File)
  .refine((file) => file.type === 'text/csv' || file.name.endsWith('.csv'), 'File must be a CSV')

// Date validation
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')

export const futureDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
  .refine((date) => new Date(date) > new Date(), 'Date must be in the future')

export const pastDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
  .refine((date) => new Date(date) < new Date(), 'Date must be in the past')

// Credit card validation
export const creditCardSchema = z
  .string()
  .min(13, 'Credit card number must be at least 13 digits')
  .max(19, 'Credit card number must be at most 19 digits')
  .regex(/^\d+$/, 'Credit card number must contain only digits')
  .refine((card) => {
    // Luhn algorithm validation
    let sum = 0
    let alternate = false
    for (let i = card.length - 1; i >= 0; i--) {
      let n = parseInt(card.charAt(i), 10)
      if (alternate) {
        n *= 2
        if (n > 9) n = (n % 10) + 1
      }
      sum += n
      alternate = !alternate
    }
    return sum % 10 === 0
  }, 'Invalid credit card number')

export const cvvSchema = z
  .string()
  .min(3, 'CVV must be at least 3 digits')
  .max(4, 'CVV must be at most 4 digits')
  .regex(/^\d+$/, 'CVV must contain only digits')

export const expiryMonthSchema = z
  .string()
  .regex(/^(0[1-9]|1[0-2])$/, 'Invalid expiry month (01-12)')

export const expiryYearSchema = z
  .string()
  .regex(/^\d{4}$/, 'Invalid expiry year (YYYY)')
  .refine((year) => {
    const currentYear = new Date().getFullYear()
    const yearNum = parseInt(year, 10)
    return yearNum >= currentYear && yearNum <= currentYear + 20
  }, 'Expiry year must be current year or up to 20 years in the future')

// Custom validation helpers
export const createPasswordConfirmSchema = (passwordField: string) =>
  z.object({
    [passwordField]: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required')
  }).refine((data) => data[passwordField as keyof typeof data] === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export const createMinMaxSchema = (min: number, max: number, fieldName: string) =>
  z.number()
    .min(min, `${fieldName} must be at least ${min}`)
    .max(max, `${fieldName} must be at most ${max}`)

export const createArrayLengthSchema = <T>(
  itemSchema: z.ZodSchema<T>,
  min: number,
  max: number,
  fieldName: string
) =>
  z.array(itemSchema)
    .min(min, `${fieldName} must have at least ${min} item${min === 1 ? '' : 's'}`)
    .max(max, `${fieldName} must have at most ${max} item${max === 1 ? '' : 's'}`)

// Environment-specific validation
export const apiKeySchema = z
  .string()
  .min(32, 'API key must be at least 32 characters')
  .max(128, 'API key must be at most 128 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'API key contains invalid characters')

export const githubUrlSchema = z
  .string()
  .url('Invalid URL format')
  .refine(
    (url) => url.includes('github.com'),
    'URL must be from GitHub'
  )

export const repositoryNameSchema = z
  .string()
  .min(1, 'Repository name is required')
  .max(100, 'Repository name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Repository name contains invalid characters')

// IP address validation
export const ipv4Schema = z
  .string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    'Invalid IPv4 address'
  )

export const ipv6Schema = z
  .string()
  .regex(
    /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/,
    'Invalid IPv6 address'
  )

export const ipAddressSchema = z.union([ipv4Schema, ipv6Schema])

// JSON validation
export const jsonStringSchema = z
  .string()
  .refine((str) => {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }, 'Invalid JSON format')

// Color validation
export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format')

// Version validation
export const semverSchema = z
  .string()
  .regex(
    /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?:[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
    'Invalid semantic version format'
  )

// Security-specific validation
export const cveIdSchema = z
  .string()
  .regex(/^CVE-\d{4}-\d{4,7}$/, 'Invalid CVE ID format (e.g., CVE-2021-1234)')

export const severitySchema = z.enum(['low', 'medium', 'high', 'critical'], {
  errorMap: () => ({ message: 'Severity must be low, medium, high, or critical' })
})

export const vulnerabilityTypeSchema = z.enum([
  'sql_injection',
  'xss',
  'csrf',
  'command_injection',
  'path_traversal',
  'insecure_deserialization',
  'xml_external_entity',
  'broken_authentication',
  'sensitive_data_exposure',
  'security_misconfiguration',
  'broken_access_control',
  'insufficient_logging'
], {
  errorMap: () => ({ message: 'Invalid vulnerability type' })
})