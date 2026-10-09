import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Search, Code, Lock, AlertTriangle, Eye, Cpu } from 'lucide-react'

export interface SecurityLoaderProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  progress?: number
}

// Radar Scanning Animation - for active security scanning
export function RadarScanner({ className = '', size = 'md', progress = 0 }: SecurityLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner pulsing ring */}
      <motion.div
        className="absolute inset-1 border border-blue-400/50 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Scanning sweep */}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 50%)' }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Center shield icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Shield className="text-blue-600" size={iconSizes[size] * 0.6} />
      </div>

      {/* Scanning dots that appear around the perimeter */}
      {[0, 72, 144, 216, 288].map((angle, index) => (
        <motion.div
          key={angle}
          className="absolute w-1 h-1 bg-blue-500 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transformOrigin: `0 0`,
          }}
          animate={{
            rotate: angle,
            x: sizeClasses[size] === 'w-6 h-6' ? 12 : sizeClasses[size] === 'w-8 h-8' ? 16 : 24,
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Code Analysis Animation - for analyzing code patterns
export function CodeAnalyzer({ className = '', size = 'md', progress = 0 }: SecurityLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer circuit pattern */}
      <motion.div
        className="absolute inset-0 border border-green-500/40 rounded-lg"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(34, 197, 94, 0.4)',
            '0 0 0 4px rgba(34, 197, 94, 0.1)',
            '0 0 0 0 rgba(34, 197, 94, 0.4)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Animated code lines */}
      <div className="absolute inset-1 overflow-hidden rounded">
        {[0, 1, 2].map((line) => (
          <motion.div
            key={line}
            className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent absolute w-full"
            style={{ top: `${25 + line * 25}%` }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: line * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Center code icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            color: ['#22c55e', '#16a34a', '#22c55e']
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Code size={iconSizes[size]} />
        </motion.div>
      </div>

      {/* Binary digits floating around */}
      {['1', '0', '1', '0'].map((digit, index) => (
        <motion.span
          key={index}
          className="absolute text-xs font-mono text-green-500/60"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-10, -30, -10],
            opacity: [0, 0.6, 0],
            scale: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.5,
            ease: "easeInOut"
          }}
        >
          {digit}
        </motion.span>
      ))}
    </div>
  )
}

// Queue Animation - for waiting scans
export function QueueLoader({ className = '', size = 'md', progress = 0 }: SecurityLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Queue dots */}
      <div className="absolute inset-0 flex items-center justify-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-1.5 h-1.5 bg-amber-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Outer pulsing ring */}
      <motion.div
        className="absolute inset-0 border border-amber-400/40 rounded-full"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Clock hands animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-3 h-3 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-1 left-1/2 w-px h-1 bg-amber-600 origin-bottom transform -translate-x-0.5" />
        </motion.div>
      </div>
    </div>
  )
}

// Security Shield Scanner - for comprehensive security analysis (Static version)
export function SecurityShieldScanner({ className = '', size = 'md', progress = 0 }: SecurityLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Static multi-layer rings - no animation */}
      {[0, 1, 2].map((ring) => (
        <div
          key={ring}
          className="absolute border-2 border-purple-500/40 rounded-full"
          style={{
            inset: `${ring * 4}px`,
          }}
        />
      ))}

      {/* Static center shield - no animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="drop-shadow-md">
          <Shield className="text-purple-600" size={iconSizes[size]} />
        </div>
      </div>

      {/* Static decorative rays - no animation */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <div
          key={angle}
          className="absolute w-px h-2 bg-purple-500/30"
          style={{
            top: '20%',
            left: '50%',
            transformOrigin: '0 200%',
            transform: `rotate(${angle}deg)`,
          }}
        />
      ))}
    </div>
  )
}

// Tool-specific loaders
export function SASTLoader({ className = '', size = 'md' }: Omit<SecurityLoaderProps, 'progress'>) {
  return <CodeAnalyzer className={className} size={size} />
}

export function SecretsLoader({ className = '', size = 'md' }: Omit<SecurityLoaderProps, 'progress'>) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer scanning ring */}
      <motion.div
        className="absolute inset-0 border-2 border-red-500/40 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner pulsing */}
      <motion.div
        className="absolute inset-1 border border-red-400/60 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Center lock icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            filter: [
              'drop-shadow(0 0 0 rgba(239, 68, 68, 0.5))',
              'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))',
              'drop-shadow(0 0 0 rgba(239, 68, 68, 0.5))'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Lock className="text-red-600" size={iconSizes[size]} />
        </motion.div>
      </div>

      {/* Warning indicators */}
      {[0, 120, 240].map((angle) => (
        <motion.div
          key={angle}
          className="absolute w-1 h-1 bg-red-500 rounded-full"
          style={{
            top: '10%',
            left: '50%',
            transformOrigin: '0 250%',
            transform: `rotate(${angle}deg)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: angle / 120 * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export function DependencyLoader({ className = '', size = 'md' }: Omit<SecurityLoaderProps, 'progress'>) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Network nodes */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        {[0, 72, 144, 216, 288].map((angle, index) => (
          <motion.div
            key={angle}
            className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
              transform: `rotate(${angle}deg) translateX(${size === 'sm' ? 10 : size === 'md' ? 14 : 20}px) translateY(-50%)`,
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Center processor icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            color: ['#f97316', '#ea580c', '#f97316']
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cpu className="text-orange-600" size={iconSizes[size]} />
        </motion.div>
      </div>

      {/* Connection lines */}
      <motion.div
        className="absolute inset-2 border border-orange-400/40 rounded-full"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

// Advanced scanner with particle effects
export function AdvancedSecurityScanner({ className = '', size = 'md', progress = 0 }: SecurityLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer hexagonal scanning pattern */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full border-2 border-cyan-500/40" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
      </motion.div>

      {/* Inner rotating elements */}
      <motion.div
        className="absolute inset-1"
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full border border-cyan-400/60" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
      </motion.div>

      {/* Center scanning eye */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            filter: [
              'drop-shadow(0 0 0 rgba(6, 182, 212, 0.5))',
              'drop-shadow(0 0 10px rgba(6, 182, 212, 0.8))',
              'drop-shadow(0 0 0 rgba(6, 182, 212, 0.5))'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Eye className="text-cyan-600" size={16} />
        </motion.div>
      </div>

      {/* Scanning particles */}
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-0.5 h-0.5 bg-cyan-400 rounded-full"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, (Math.random() - 0.5) * 20],
            y: [0, (Math.random() - 0.5) * 20]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Export a mapping for easy use based on scan type or tool
export const SecurityLoaders = {
  radar: RadarScanner,
  code: CodeAnalyzer,
  queue: QueueLoader,
  shield: SecurityShieldScanner,
  sast: SASTLoader,
  secrets: SecretsLoader,
  dependency: DependencyLoader,
  advanced: AdvancedSecurityScanner,
} as const

export type SecurityLoaderType = keyof typeof SecurityLoaders