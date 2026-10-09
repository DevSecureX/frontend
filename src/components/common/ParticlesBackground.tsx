import { motion } from 'framer-motion'
import { useMemo, memo } from 'react'

/**
 * Particle configuration interface
 */
interface Particle {
  id: number
  x: number // X position in percentage (0-100)
  y: number // Y position in percentage (0-100)
  size: number // Size in pixels
  duration: number // Animation duration in seconds
  delay: number // Animation delay in seconds
  opacity: number // Base opacity (0-1)
  blur: number // Blur radius in pixels
}

/**
 * ParticlesBackground Component
 *
 * A futuristic animated background with multiple particle effects:
 * - Floating particles with glow effects
 * - Connection lines between nearby particles (constellation effect)
 * - Large glowing orbs
 * - Rotating geometric shapes (hexagons and diamonds)
 * - Shooting stars/streaks
 * - Pulsing rings
 *
 * Performance optimized with React.memo and useMemo.
 * All animations use GPU-accelerated transforms via Framer Motion.
 *
 * @usage
 * ```tsx
 * <div className="relative">
 *   <ParticlesBackground />
 *   <div className="relative z-10">Your content here</div>
 * </div>
 * ```
 *
 * @component
 * @example
 * <ParticlesBackground />
 */
export const ParticlesBackground = memo(function ParticlesBackground() {
  // Generate particles with random properties
  const particles = useMemo<Particle[]>(() => {
    const particleCount = 50
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random x position (0-100%)
      y: Math.random() * 100, // Random y position (0-100%)
      size: Math.random() * 4 + 2, // Random size (2-6px)
      duration: Math.random() * 10 + 15, // Animation duration (15-25s)
      delay: Math.random() * 5, // Random delay (0-5s)
      opacity: Math.random() * 0.2 + 0.15, // Random opacity (0.15-0.35)
      blur: Math.random() * 1 + 0.5, // Random blur (0.5-1.5px)
    }))
  }, [])

  // Connection lines between nearby particles
  const connections = useMemo(() => {
    const maxDistance = 15 // Maximum distance to draw connection (in %)
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> = []

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.15
          lines.push({
            x1: particles[i].x,
            y1: particles[i].y,
            x2: particles[j].x,
            y2: particles[j].y,
            opacity,
          })
        }
      }
    }

    return lines
  }, [particles])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((line, index) => (
          <motion.line
            key={`line-${index}`}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, line.opacity, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: index * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            filter: `blur(${particle.blur}px)`,
            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.5)`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(particle.id) * 20, 0],
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Larger glowing orbs */}
      {Array.from({ length: 5 }, (_, i) => {
        const x = Math.random() * 100
        const y = Math.random() * 100
        const size = Math.random() * 150 + 100
        const duration = Math.random() * 8 + 12

        return (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{
              x: [0, Math.random() * 50 - 25, 0],
              y: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        )
      })}

      {/* Floating geometric shapes */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = Math.random() * 100
        const y = Math.random() * 100
        const size = Math.random() * 6 + 4
        const duration = Math.random() * 15 + 20
        const isHexagon = i % 2 === 0

        return (
          <motion.div
            key={`shape-${i}`}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.sin(i) * 30, 0],
              rotate: [0, 360],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'linear',
            }}
          >
            {isHexagon ? (
              // Hexagon
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{ filter: 'blur(0.5px)' }}
              >
                <polygon
                  points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              // Diamond/Square
              <div
                className="w-full h-full border border-white/40 rotate-45"
                style={{ filter: 'blur(0.5px)' }}
              />
            )}
          </motion.div>
        )
      })}

      {/* Shooting stars / streaks */}
      {Array.from({ length: 3 }, (_, i) => {
        const startY = Math.random() * 50
        const duration = Math.random() * 3 + 2

        return (
          <motion.div
            key={`streak-${i}`}
            className="absolute w-1 h-16 rounded-full"
            style={{
              left: '-5%',
              top: `${startY}%`,
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0) 100%)',
              filter: 'blur(1px)',
              transformOrigin: 'top',
              rotate: '45deg',
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
            }}
            animate={{
              x: ['0%', '120vw'],
              y: ['0%', '60vh'],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: i * 8 + 5,
              ease: 'easeOut',
              repeatDelay: 15,
            }}
          />
        )
      })}

      {/* Pulsing rings */}
      {Array.from({ length: 3 }, (_, i) => {
        const x = Math.random() * 80 + 10
        const y = Math.random() * 80 + 10
        const maxSize = Math.random() * 200 + 150

        return (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border border-white/10"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            animate={{
              width: [0, maxSize],
              height: [0, maxSize],
              opacity: [0.4, 0],
              x: [-maxSize / 2, -maxSize / 2],
              y: [-maxSize / 2, -maxSize / 2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 2,
              ease: 'easeOut',
            }}
          />
        )
      })}
    </div>
  )
})
