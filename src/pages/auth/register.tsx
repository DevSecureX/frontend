import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Github, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store'
import { toast } from 'sonner'

export function Register() {
  const navigate = useNavigate()
  const { signup, initiateGoogleLogin, initiateGithubLogin, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile_no: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const passwordStrength = {
    length: formData.password?.length >= 8,
    uppercase: /[A-Z]/.test(formData.password || ''),
    lowercase: /[a-z]/.test(formData.password || ''),
    number: /\d/.test(formData.password || ''),
  }

  const passwordStrengthScore = Object.values(passwordStrength).filter(Boolean).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      const { confirmPassword, ...signupData } = formData
      await signup(signupData)
      toast.success('Account created successfully!')
      navigate('/auth/login')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Side - Branding & Hero (Sticky) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-8 xl:p-12 text-white"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
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
              className="flex items-center gap-3 mb-8"
            >
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Shield className="h-7 w-7" />
              </div>
              <span className="text-2xl font-bold">DevSecureX</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h1 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
                Start Your Secure
                <br />
                <span className="text-brand-200">Development Journey</span>
              </h1>
              <p className="text-base xl:text-lg text-brand-100 mb-8 leading-relaxed">
                Join thousands of developers who trust DevSecureX to secure their applications.
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-3"
            >
              {[
                'Vulnerability scanning',
                'AI-powered security insights',
                'Instant security reports',
              ].map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-200" />
                  </div>
                  <span className="text-sm xl:text-base text-brand-50">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom Decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex items-center gap-2 text-brand-200"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-xs xl:text-sm">Get started in less than 2 minutes</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Register Form (Scrollable) */}
      <div className="w-full lg:w-1/2 h-screen overflow-y-auto bg-background">
        <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-brand-600 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-foreground">DevSecureX</span>
            </div>

            <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                  Create account
                </CardTitle>
                <CardDescription className="text-sm">
                  Join thousands of developers securing their code with AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full group hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all duration-200"
                  onClick={() => initiateGithubLogin()}
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  className="w-full group hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all duration-200"
                  onClick={() => initiateGoogleLogin()}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
                  Google
                </Button>
              </div>

              {/* Divider */}
              <div className="relative py-1.5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors" />
                    <Input
                      type="text"
                      name="first_name"
                      placeholder="First name"
                      className="pl-10 h-10 border-2 focus:border-brand-600 transition-all"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors" />
                    <Input
                      type="text"
                      name="last_name"
                      placeholder="Last name"
                      className="pl-10 h-10 border-2 focus:border-brand-600 transition-all"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors" />
                  <Input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="pl-10 h-10 border-2 focus:border-brand-600 transition-all"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="pl-10 h-10 border-2 focus:border-brand-600 transition-all"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors z-10" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password"
                      className="pl-10 pr-10 h-10 border-2 focus:border-brand-600 transition-all"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              passwordStrengthScore === 1 ? 'bg-red-500 w-1/4' :
                              passwordStrengthScore === 2 ? 'bg-orange-500 w-2/4' :
                              passwordStrengthScore === 3 ? 'bg-yellow-500 w-3/4' :
                              passwordStrengthScore === 4 ? 'bg-green-500 w-full' : 'w-0'
                            }`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {passwordStrengthScore}/4
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.uppercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Uppercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.lowercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Lowercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.number ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Number</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors z-10" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    className="pl-10 pr-10 h-10 border-2 focus:border-brand-600 transition-all"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 group shadow-lg shadow-brand-600/30 transition-all duration-200"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Terms */}
              <p className="text-center text-xs text-muted-foreground">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="underline hover:text-brand-600 font-medium">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline hover:text-brand-600 font-medium">
                  Privacy Policy
                </Link>
              </p>

              {/* Sign In Link */}
              <div className="relative pt-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <p className="bg-card px-4 text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                      to="/auth/login"
                      className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>Secure encrypted connection</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
    </div>
  )
}