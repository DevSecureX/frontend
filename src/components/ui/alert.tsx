import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        // Security severity variants
        critical:
          'border-security-critical-200 bg-security-critical-50 text-security-critical-800 dark:border-security-critical-800 dark:bg-security-critical-900/20 dark:text-security-critical-300 [&>svg]:text-security-critical-600 dark:[&>svg]:text-security-critical-400',
        high:
          'border-security-high-200 bg-security-high-50 text-security-high-800 dark:border-security-high-800 dark:bg-security-high-900/20 dark:text-security-high-300 [&>svg]:text-security-high-600 dark:[&>svg]:text-security-high-400',
        medium:
          'border-security-medium-200 bg-security-medium-50 text-security-medium-800 dark:border-security-medium-800 dark:bg-security-medium-900/20 dark:text-security-medium-300 [&>svg]:text-security-medium-600 dark:[&>svg]:text-security-medium-400',
        low:
          'border-security-low-200 bg-security-low-50 text-security-low-800 dark:border-security-low-800 dark:bg-security-low-900/20 dark:text-security-low-300 [&>svg]:text-security-low-600 dark:[&>svg]:text-security-low-400',
        safe:
          'border-security-safe-200 bg-security-safe-50 text-security-safe-800 dark:border-security-safe-800 dark:bg-security-safe-900/20 dark:text-security-safe-300 [&>svg]:text-security-safe-600 dark:[&>svg]:text-security-safe-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }