import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Sparkles, CheckCircle2 } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'
import { ParticlesBackground } from '@/components/common/ParticlesBackground'
import { useAuthStore } from '@/store'

export function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, handleOAuthCallback } = useAuthStore()

  const [mode, setMode] = useState<'login' | 'signup'>(() => {
    const modeParam = searchParams.get('mode')
    return modeParam === 'signup' ? 'signup' : 'login'
  })

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('access_token') || params.has('error')) {
      handleOAuthCallback(params)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [handleOAuthCallback])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleAuthSuccess = () => {
    navigate('/dashboard', { replace: true })
  }

  const switchToLogin = () => {
    setMode('login')
    navigate('/auth?mode=login', { replace: true })
  }

  const switchToSignup = () => {
    setMode('signup')
    navigate('/auth?mode=signup', { replace: true })
  }

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative">
      {/* Animated Particles Background - Behind everything */}
      <ParticlesBackground />

      {/* Left Side - Branding & Hero (Hidden on mobile) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-8 xl:p-10 text-white"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2.5 mb-8"
            >
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Shield className="h-7 w-7 drop-shadow-lg" />
              </div>
              <span className="text-2xl xl:text-3xl font-bold text-white drop-shadow-lg">DevSecureX</span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {mode === 'login' ? (
                  <>
                    <h1 className="text-3xl xl:text-4xl font-extrabold mb-4 leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                      Secure Your Code,
                      <br />
                      <span className="text-white">Ship with Confidence</span>
                    </h1>
                    <p className="text-base xl:text-lg text-white mb-8 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                      AI-powered security scanning that catches vulnerabilities before they reach
                      production.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl xl:text-4xl font-extrabold mb-4 leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                      Start Your Secure
                      <br />
                      <span className="text-white">Development Journey</span>
                    </h1>
                    <p className="text-base xl:text-lg text-white mb-8 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                      Join thousands of developers who trust DevSecureX to secure their applications.
                    </p>
                  </>
                )}

                {/* Features */}
                <div className="space-y-3">
                  {(mode === 'login'
                    ? [
                        'Real-time vulnerability detection',
                        'Automated security fixes',
                        'Compliance ready reports',
                      ]
                    : [
                        'Vulnerability scanning',
                        'AI-powered security insights',
                        'Instant security reports',
                      ]
                  ).map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white drop-shadow-lg" />
                      </div>
                      <span className="text-base text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex items-center gap-2 text-white"
          >
            <Sparkles className="h-4 w-4 drop-shadow-lg" />
            <span className="text-sm font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
              {mode === 'login'
                ? 'Trusted by 10,000+ developers worldwide'
                : 'Get started in less than 2 minutes'}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Auth Forms */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 relative overflow-hidden"
      >
        {/* Animated Background Pattern - Fixed */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* Decorative Grid - Fixed */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* Scrollable Content Container */}
        <div className="relative h-full overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="w-full max-w-md my-auto relative z-10"
            >
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                  <Shield className="h-6 w-6 drop-shadow-lg" />
                </div>
                <span className="text-2xl font-bold text-white drop-shadow-lg">DevSecureX</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {mode === 'login' ? (
                    <LoginForm onSuccess={handleAuthSuccess} onSignupClick={switchToSignup} />
                  ) : (
                    <SignupForm onSuccess={switchToLogin} onLoginClick={switchToLogin} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}