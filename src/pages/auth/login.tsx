import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Github, Mail, Lock, Loader2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store'
import { toast } from 'sonner'

export function Login() {
  const navigate = useNavigate()
  const { login, initiateGoogleLogin, initiateGithubLogin, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await login({ username: email, password })
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGithubLogin = () => {
    initiateGithubLogin()
  }

  const handleGoogleLogin = () => {
    initiateGoogleLogin()
  }

  return (
    <>
      {/* Hide non-critical elements on small height viewports */}
      <style>{`
        @media (max-height: 900px) {
          .auth-footer { display: none !important; }
        }
      `}</style>

      <div className="flex h-screen overflow-hidden" style={{ height: '100vh', maxHeight: '100vh' }}>
        {/* Left Side - Branding & Hero */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center py-2 px-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-base font-bold">DevSecureX</span>
              </div>

              <h1 className="text-xl font-bold mb-1.5 leading-tight">
                Secure Your Code,
                <br />
                <span className="text-brand-200">Ship with Confidence</span>
              </h1>
              <p className="text-xs text-brand-100 mb-2 leading-relaxed">
                AI-powered security scanning that catches vulnerabilities before they reach production.
              </p>

              {/* Features */}
              <div className="space-y-1">
                {[
                  'Real-time vulnerability detection',
                  'Automated security fixes',
                  'Compliance ready reports',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-1.5">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <CheckCircle2 className="h-2 w-2 text-brand-200" />
                    </div>
                    <span className="text-xs text-brand-50">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 h-screen flex items-center justify-center bg-background px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-1 mb-1.5">
              <div className="p-0.5 rounded-lg bg-brand-600 text-white">
                <Shield className="h-3 w-3" />
              </div>
              <span className="text-sm font-bold text-foreground">DevSecureX</span>
            </div>

            <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95 w-full p-1.5">
            <CardHeader className="space-y-0 pb-0.5 px-0 pt-0">
              <CardTitle className="text-sm font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                Welcome back
              </CardTitle>
              <CardDescription className="text-[11px]">
                Sign in to your account to continue securing your code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0.5 px-0 pb-0">
              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-0.5">
                <Button
                  variant="outline"
                  className="w-full h-5 group hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all duration-200"
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                >
                  <Github className="mr-0.5 h-2.5 w-2.5 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px]">GitHub</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-5 group hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all duration-200"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="mr-0.5 h-2.5 w-2.5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.99 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-[11px]">Google</span>
                </Button>
              </div>

              {/* Divider */}
              <div className="relative py-0 my-0.5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-card px-1.5 text-muted-foreground font-medium">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-0">
                <div className="relative group mb-0.5">
                  <Mail className="absolute left-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-7 h-5 text-[11px] border-2 focus:border-brand-600 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                <div className="relative group mb-0.5">
                  <Lock className="absolute left-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="pl-7 h-5 text-[11px] border-2 focus:border-brand-600 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                <div className="flex items-center justify-end mb-0.5">
                  <Link
                    to="/auth/forgot-password"
                    className="text-[10px] text-brand-600 hover:text-brand-700 hover:underline font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full h-5 text-[11px] bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 group shadow-lg shadow-brand-600/30 transition-all duration-200"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-0.5 h-2.5 w-2.5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-0.5 h-2.5 w-2.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="relative pt-0.5 mt-0.5 auth-footer">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <p className="bg-card px-2 text-[10px] text-muted-foreground">
                    Don't have an account?{' '}
                    <Link
                      to="/auth/register"
                      className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </>
  )
}