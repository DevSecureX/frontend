import { motion } from 'framer-motion'
import { Clock, Zap, CheckCircle, AlertTriangle } from 'lucide-react'
import type { ScanStatus } from '@/types/global'

interface ScanStatusBadgeProps {
  status: ScanStatus
  className?: string
}

export function ScanStatusBadge({ status, className }: ScanStatusBadgeProps) {
  const getStatusConfig = (status: ScanStatus) => {
    switch (status) {
      case 'queued':
        return {
          label: 'Queued',
          className: 'text-amber-700 dark:text-amber-400 font-medium',
          icon: Clock,
          bgClassName: 'bg-amber-100/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          animation: {}
        }
      case 'processing':
        return {
          label: 'Processing',
          className: 'text-blue-700 dark:text-blue-400 font-medium',
          icon: Zap,
          bgClassName: 'bg-blue-100/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          animation: {}
        }
      case 'completed':
        return {
          label: 'Completed',
          className: 'text-green-700 dark:text-green-400 font-medium',
          icon: CheckCircle,
          bgClassName: 'bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          animation: {
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          }
        }
      case 'failed':
        return {
          label: 'Failed',
          className: 'text-red-700 dark:text-red-400 font-medium',
          icon: AlertTriangle,
          bgClassName: 'bg-red-100/50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          animation: {
            x: [0, -2, 2, 0],
            scale: [1, 1.05, 1]
          }
        }
      default:
        return {
          label: 'Unknown',
          className: 'text-gray-600 dark:text-gray-400 font-medium',
          icon: Clock,
          bgClassName: 'bg-gray-100/50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
          animation: {}
        }
    }
  }

  const config = getStatusConfig(status)
  const IconComponent = config.icon

  return (
    <motion.div
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-xs font-medium ${config.bgClassName} ${config.className} ${className || ''}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        ...config.animation
      }}
      transition={{
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        ...Object.keys(config.animation).reduce((acc, key) => {
          acc[key] = {
            duration: status === 'processing' ? 1.5 : status === 'queued' ? 2 : 1,
            repeat: status === 'completed' || status === 'failed' ? 1 : Infinity,
            ease: 'easeInOut'
          }
          return acc
        }, {} as any)
      }}
    >
      <motion.div
        animate={config.animation}
        transition={{
          duration: status === 'processing' ? 1.5 : status === 'queued' ? 2 : 1,
          repeat: status === 'completed' || status === 'failed' ? 1 : Infinity,
          ease: 'easeInOut'
        }}
      >
        <IconComponent className="w-3 h-3" />
      </motion.div>
      <span>{config.label}</span>
    </motion.div>
  )
}