import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:text-white',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:text-white dark:bg-gray-600',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 dark:text-white',
        outline: 'text-foreground dark:border-gray-600 dark:text-gray-200',
        // Security severity badges - improved dark theme contrast
        critical: 'border-transparent bg-red-600 text-white dark:bg-red-500 dark:text-white font-bold',
        high: 'border-transparent bg-orange-600 text-white dark:bg-orange-500 dark:text-white font-bold',
        medium: 'border-transparent bg-yellow-600 text-white dark:bg-yellow-600 dark:text-white font-bold',
        low: 'border-transparent bg-blue-600 text-white dark:bg-blue-500 dark:text-white font-semibold',
        safe: 'border-transparent bg-green-600 text-white dark:bg-green-500 dark:text-white font-semibold',
        // Status badges - improved dark theme contrast
        success: 'border-transparent bg-green-500 text-white dark:bg-green-600 dark:text-white font-semibold',
        warning: 'border-transparent bg-yellow-500 text-black dark:bg-yellow-400 dark:text-black font-bold',
        info: 'border-transparent bg-blue-500 text-white dark:bg-blue-600 dark:text-white font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }