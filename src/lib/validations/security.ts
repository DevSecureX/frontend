import { z } from 'zod'
import { 
  repositoryNameSchema, 
  githubUrlSchema, 
  severitySchema, 
  vulnerabilityTypeSchema,
  cveIdSchema,
  urlSchema
} from './common'

// Repository connection validation
export const connectRepositorySchema = z.object({
  provider: z.enum(['github', 'gitlab', 'bitbucket'], {
    errorMap: () => ({ message: 'Please select a valid provider' })
  }),
  repositoryUrl: githubUrlSchema,
  fullName: z.string().min(1, 'Repository full name is required'),
  name: repositoryNameSchema,
  isPrivate: z.boolean().default(false),
  defaultBranch: z.string().min(1, 'Default branch is required').default('main'),
  webhookEvents: z.array(z.enum([
    'push',
    'pull_request',
    'release',
    'issues'
  ])).default(['push', 'pull_request']),
  autoScan: z.boolean().default(true),
  scanOnPush: z.boolean().default(true),
  scanOnPR: z.boolean().default(true),
  niche: z.enum([
    'web_application',
    'mobile_app', 
    'api_service',
    'library',
    'cli_tool',
    'infrastructure',
    'other'
  ]).optional()
})

export type ConnectRepositoryFormData = z.infer<typeof connectRepositorySchema>

// Security scan configuration validation
export const scanConfigSchema = z.object({
  repositoryId: z.string().min(1, 'Repository is required'),
  type: z.enum(['full', 'incremental', 'targeted'], {
    errorMap: () => ({ message: 'Please select a scan type' })
  }),
  branch: z.string().min(1, 'Branch is required').default('main'),
  includePaths: z.array(z.string()).optional(),
  excludePaths: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  severity: z.array(severitySchema).optional(),
  timeout: z.number()
    .min(60, 'Timeout must be at least 60 seconds')
    .max(3600, 'Timeout must be at most 3600 seconds')
    .default(1800),
  scheduledAt: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Invalid datetime format')
    .optional(),
  recurringSchedule: z.enum(['daily', 'weekly', 'monthly']).optional(),
  notifyOnComplete: z.boolean().default(true),
  notifyOnError: z.boolean().default(true)
})

export type ScanConfigFormData = z.infer<typeof scanConfigSchema>

// Bulk scan configuration
export const bulkScanSchema = z.object({
  repositoryIds: z.array(z.string()).min(1, 'At least one repository is required'),
  type: z.enum(['full', 'incremental'], {
    errorMap: () => ({ message: 'Please select a scan type' })
  }),
  branch: z.string().min(1, 'Branch is required').default('main'),
  maxConcurrent: z.number()
    .min(1, 'Must allow at least 1 concurrent scan')
    .max(10, 'Cannot exceed 10 concurrent scans')
    .default(3),
  delayBetweenScans: z.number()
    .min(0, 'Delay cannot be negative')
    .max(300, 'Delay cannot exceed 5 minutes')
    .default(30),
  stopOnError: z.boolean().default(false)
})

export type BulkScanFormData = z.infer<typeof bulkScanSchema>

// Pull request scan validation
export const prScanSchema = z.object({
  repositoryId: z.string().min(1, 'Repository is required'),
  prNumber: z.number().min(1, 'Pull request number is required'),
  mode: z.enum(['diff_only', 'full_branch'], {
    errorMap: () => ({ message: 'Please select a scan mode' })
  }).default('diff_only'),
  scope: z.enum(['changed_files', 'all_files'], {
    errorMap: () => ({ message: 'Please select scan scope' })
  }).default('changed_files'),
  autoApprove: z.boolean().default(false),
  blockMerge: z.boolean().default(false),
  requiredChecks: z.array(z.string()).optional()
})

export type PRScanFormData = z.infer<typeof prScanSchema>

// Security rule creation validation
export const securityRuleSchema = z.object({
  name: z.string()
    .min(1, 'Rule name is required')
    .max(100, 'Rule name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  type: vulnerabilityTypeSchema,
  severity: severitySchema,
  category: z.enum([
    'authentication',
    'authorization', 
    'input_validation',
    'output_encoding',
    'cryptography',
    'session_management',
    'error_handling',
    'logging',
    'configuration'
  ]),
  language: z.array(z.enum([
    'javascript',
    'typescript',
    'python',
    'java',
    'csharp',
    'php',
    'ruby',
    'go',
    'rust',
    'cpp',
    'c'
  ])).min(1, 'At least one language is required'),
  pattern: z.string().min(1, 'Pattern is required'),
  patternType: z.enum(['regex', 'ast', 'semantic']).default('regex'),
  testCases: z.array(z.object({
    code: z.string().min(1, 'Test code is required'),
    shouldMatch: z.boolean(),
    description: z.string().optional()
  })).min(1, 'At least one test case is required'),
  enabled: z.boolean().default(true),
  tags: z.array(z.string()).optional()
})

export type SecurityRuleFormData = z.infer<typeof securityRuleSchema>

// Vulnerability report validation
export const vulnerabilityReportSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  type: vulnerabilityTypeSchema,
  severity: severitySchema,
  cveId: cveIdSchema.optional(),
  affectedVersions: z.string().optional(),
  fixedVersions: z.string().optional(),
  workaround: z.string().max(1000, 'Workaround must be less than 1000 characters').optional(),
  references: z.array(z.object({
    url: z.string().url('Invalid reference URL'),
    description: z.string().optional()
  })).optional(),
  cvssScore: z.number()
    .min(0, 'CVSS score must be between 0 and 10')
    .max(10, 'CVSS score must be between 0 and 10')
    .optional(),
  exploitability: z.enum(['none', 'difficult', 'moderate', 'easy']).optional(),
  impact: z.enum(['none', 'low', 'moderate', 'high']).optional(),
  reproductionSteps: z.string().max(2000, 'Reproduction steps must be less than 2000 characters').optional(),
  proofOfConcept: z.string().max(5000, 'Proof of concept must be less than 5000 characters').optional()
})

export type VulnerabilityReportFormData = z.infer<typeof vulnerabilityReportSchema>

// Security policy validation
export const securityPolicySchema = z.object({
  name: z.string()
    .min(1, 'Policy name is required')
    .max(100, 'Policy name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  rules: z.array(z.string()).min(1, 'At least one rule is required'),
  enforcement: z.enum(['advisory', 'blocking']).default('advisory'),
  scope: z.object({
    repositories: z.array(z.string()).optional(),
    branches: z.array(z.string()).optional(),
    filePatterns: z.array(z.string()).optional()
  }),
  exceptions: z.array(z.object({
    path: z.string(),
    reason: z.string(),
    expiresAt: z.string().optional()
  })).optional(),
  notifications: z.object({
    onViolation: z.boolean().default(true),
    onException: z.boolean().default(false),
    recipients: z.array(z.string().email()).optional()
  }),
  enabled: z.boolean().default(true)
})

export type SecurityPolicyFormData = z.infer<typeof securityPolicySchema>

// Compliance framework validation
export const complianceFrameworkSchema = z.object({
  framework: z.enum([
    'pci_dss',
    'sox',
    'gdpr',
    'hipaa',
    'iso27001',
    'nist_cybersecurity',
    'owasp_top10',
    'cis_controls',
    'custom'
  ]),
  version: z.string().optional(),
  requirements: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    mandatory: z.boolean().default(true),
    evidence: z.array(z.string()).optional()
  })).min(1, 'At least one requirement is required'),
  assessmentDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  nextAssessment: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
    .refine((date) => new Date(date) > new Date(), 'Next assessment must be in the future'),
  auditor: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'failed']).default('not_started')
})

export type ComplianceFrameworkFormData = z.infer<typeof complianceFrameworkSchema>

// Integration configuration validation
export const integrationConfigSchema = z.object({
  type: z.enum([
    'slack',
    'teams',
    'discord',
    'email',
    'webhook',
    'jira',
    'github',
    'gitlab'
  ]),
  name: z.string()
    .min(1, 'Integration name is required')
    .max(50, 'Integration name must be less than 50 characters'),
  config: z.record(z.any()), // Dynamic configuration based on integration type
  events: z.array(z.enum([
    'scan_completed',
    'vulnerability_found',
    'high_severity_alert',
    'policy_violation',
    'compliance_check'
  ])).min(1, 'At least one event is required'),
  filters: z.object({
    severity: z.array(severitySchema).optional(),
    repositories: z.array(z.string()).optional(),
    branches: z.array(z.string()).optional()
  }).optional(),
  enabled: z.boolean().default(true)
})

export type IntegrationConfigFormData = z.infer<typeof integrationConfigSchema>