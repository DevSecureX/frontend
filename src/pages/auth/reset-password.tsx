import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Shield, Loader2, CheckCircle, CheckCircle2, ArrowRight, PartyPopper } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api/auth'
import { toast } from 'sonner'

export function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link')
      navigate('/auth/login')
    }
  }, [token, navigate])

  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean)
  const requirementsMetCount = Object.values(passwordRequirements).filter(Boolean).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!allRequirementsMet) {
      toast.error('Please meet all password requirements')
      return
    }

    setIsSubmitting(true)

    try {
      await authAPI.resetPassword({
        token: token!,
        new_password: password
      })
      setIsSuccess(true)
      toast.success('Password reset successfully!')

      setTimeout(() => {
        navigate('/auth/login')
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="h-screen w-full flex items-center justify-center overflow-hidden p-4 bg-gradient-to-br from-brand-50 via-background to-brand-50/50 dark:from-background dark:via-brand-950/20 dark:to-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-3 text-center pb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <CheckCircle className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-xl font-bold mb-1.5">Password Reset Successful!</CardTitle>
                <CardDescription className="text-sm">
                  Your password has been reset successfully
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 p-4"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <PartyPopper className="h-10 w-10 text-green-600 dark:text-green-400" />
                  <p className="text-xs font-medium text-green-800 dark:text-green-200">
                    You can now sign in with your new password
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Redirecting to login in 2 seconds...
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  className="w-full h-10 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-600/30"
                  onClick={() => navigate('/auth/login')}
                >
                  Go to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-y-auto p-4 bg-gradient-to-br from-brand-50 via-background to-brand-50/50 dark:from-background dark:via-brand-950/20 dark:to-background">
      <div className="min-h-screen flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-600/30">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">DevSecureX</span>
          </motion.div>

          <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1.5 text-center pb-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 flex items-center justify-center mb-3">
                  <Lock className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                  Reset your password
                </CardTitle>
                <CardDescription className="text-sm">
                  Choose a strong password for your account
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">New Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors z-10" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="pl-10 pr-10 h-9 border-2 focus:border-brand-600 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2.5 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirm Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors z-10" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10 h-9 border-2 focus:border-brand-600 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2.5 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Requirements */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  {/* Strength Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Password strength</span>
                      <span className={`font-semibold ${
                        requirementsMetCount <= 2 ? 'text-red-600' :
                        requirementsMetCount === 3 ? 'text-orange-600' :
                        requirementsMetCount === 4 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {requirementsMetCount}/5
                      </span>
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          requirementsMetCount <= 2 ? 'bg-red-500 w-2/5' :
                          requirementsMetCount === 3 ? 'bg-orange-500 w-3/5' :
                          requirementsMetCount === 4 ? 'bg-yellow-500 w-4/5' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 p-2.5 rounded-lg bg-muted/50 border text-xs">
                    {[
                      { key: 'length', label: '8+ chars', met: passwordRequirements.length },
                      { key: 'uppercase', label: 'Uppercase', met: passwordRequirements.uppercase },
                      { key: 'lowercase', label: 'Lowercase', met: passwordRequirements.lowercase },
                      { key: 'number', label: 'Number', met: passwordRequirements.number },
                      { key: 'special', label: 'Special char', met: passwordRequirements.special },
                    ].map((req) => (
                      <div
                        key={req.key}
                        className={`flex items-center gap-1.5 transition-colors ${
                          req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                        }`}
                      >
                        <CheckCircle2 className={`h-3 w-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                        <span className="font-medium">{req.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Match Indicator */}
                  {confirmPassword && (
                    <div className={`flex items-center gap-1.5 text-xs p-2 rounded-lg ${
                      password === confirmPassword
                        ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="font-medium">
                        {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-9 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-600/30 transition-all duration-200"
                disabled={isSubmitting || !allRequirementsMet || password !== confirmPassword}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Security Note */}
            <div className="pt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span>Your password is encrypted and secure</span>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  )
}