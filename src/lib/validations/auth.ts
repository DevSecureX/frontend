import { z } from 'zod'
import { emailSchema, passwordSchema, strongPasswordSchema, nameSchema } from './common'

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
})

export type LoginFormData = z.infer<typeof loginSchema>

// Registration form validation
export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
  organization: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy'
  }),
  marketingEmails: z.boolean().optional().default(false)
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Forgot password form validation
export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Reset password form validation
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Change password form validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// Two-factor authentication setup
export const twoFactorSetupSchema = z.object({
  secret: z.string().min(1, 'Secret is required'),
  token: z.string()
    .min(6, 'Authentication code must be 6 digits')
    .max(6, 'Authentication code must be 6 digits')
    .regex(/^\d{6}$/, 'Authentication code must be numeric')
})

export type TwoFactorSetupFormData = z.infer<typeof twoFactorSetupSchema>

// Two-factor authentication verification
export const twoFactorVerifySchema = z.object({
  token: z.string()
    .min(6, 'Authentication code must be 6 digits')
    .max(6, 'Authentication code must be 6 digits')
    .regex(/^\d{6}$/, 'Authentication code must be numeric')
})

export type TwoFactorVerifyFormData = z.infer<typeof twoFactorVerifySchema>

// Profile update validation
export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  organization: z.string().max(100, 'Organization name must be less than 100 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  timezone: z.string().optional(),
  avatar: z.instanceof(File).optional()
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

// Account settings validation
export const accountSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  weeklyReports: z.boolean().default(true),
  vulnerabilityAlerts: z.boolean().default(true),
  scanCompletionNotifications: z.boolean().default(true),
  language: z.enum(['en', 'es', 'fr', 'de', 'ja', 'zh']).default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  timezone: z.string().optional()
})

export type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>

// API key generation validation
export const apiKeyGenerationSchema = z.object({
  name: z.string()
    .min(1, 'API key name is required')
    .max(50, 'API key name must be less than 50 characters'),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  permissions: z.array(z.enum([
    'read:repositories',
    'write:repositories',
    'read:scans',
    'write:scans',
    'read:issues',
    'write:issues',
    'admin'
  ])).min(1, 'At least one permission is required'),
  expiresAt: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
    .refine((date) => new Date(date) > new Date(), 'Expiration date must be in the future')
    .optional()
})

export type ApiKeyGenerationFormData = z.infer<typeof apiKeyGenerationSchema>

// OAuth application registration
export const oauthAppSchema = z.object({
  name: z.string()
    .min(1, 'Application name is required')
    .max(50, 'Application name must be less than 50 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  redirectUri: z.string()
    .url('Invalid redirect URI')
    .refine((uri) => uri.startsWith('https://') || uri.startsWith('http://localhost'), {
      message: 'Redirect URI must use HTTPS or localhost HTTP'
    }),
  scopes: z.array(z.enum([
    'read:profile',
    'read:repositories',
    'write:repositories',
    'read:scans',
    'write:scans'
  ])).min(1, 'At least one scope is required'),
  isConfidential: z.boolean().default(true)
})

export type OAuthAppFormData = z.infer<typeof oauthAppSchema>