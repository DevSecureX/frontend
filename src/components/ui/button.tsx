import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 dark:text-white',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:text-white',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:text-white dark:hover:bg-gray-600',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-700 dark:hover:text-white dark:text-gray-200',
        link: 'text-primary underline-offset-4 hover:underline dark:text-blue-400 dark:hover:text-blue-300',
        // Security-specific variants with improved dark theme contrast
        'security-critical': 'bg-security-critical-500 text-white hover:bg-security-critical-600 dark:bg-security-critical-600 dark:hover:bg-security-critical-700 dark:text-white',
        'security-high': 'bg-security-high-500 text-white hover:bg-security-high-600 dark:bg-security-high-600 dark:hover:bg-security-high-700 dark:text-white',
        'security-medium': 'bg-security-medium-500 text-white hover:bg-security-medium-600 dark:bg-security-medium-600 dark:hover:bg-security-medium-700 dark:text-black',
        'security-low': 'bg-security-low-500 text-white hover:bg-security-low-600 dark:bg-security-low-600 dark:hover:bg-security-low-700 dark:text-white',
        'security-safe': 'bg-security-safe-500 text-white hover:bg-security-safe-600 dark:bg-security-safe-600 dark:hover:bg-security-safe-700 dark:text-white',
      },
      size: {
        default: 'h-10 px-4 py-2 min-h-[44px] sm:min-h-[40px]',
        sm: 'h-9 rounded-md px-3 min-h-[40px] sm:min-h-[36px]',
        lg: 'h-11 rounded-md px-8 min-h-[48px]',
        icon: 'h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }