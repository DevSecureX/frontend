import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Shield, Loader2, CheckCircle2, MailCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api/auth'
import { toast } from 'sonner'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await authAPI.forgotPassword({ email })
      setIsSuccess(true)
      toast.success('Password reset link sent to your email')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <MailCheck className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-xl font-bold mb-1.5">Check your email</CardTitle>
                <CardDescription className="text-sm">
                  We've sent a password reset link to<br />
                  <span className="font-semibold text-foreground">{email}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 p-3"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-green-800 dark:text-green-200">
                      Email sent successfully
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      If this email is registered, you'll receive a reset link. The link expires in 1 hour.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2.5"
              >
                <p className="text-xs text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or
                </p>
                <Button
                  variant="outline"
                  className="w-full h-9 hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all"
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                >
                  Try again
                </Button>
              </motion.div>

              <Button
                variant="ghost"
                className="w-full h-9 group"
                onClick={() => navigate('/auth/login')}
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden p-4 bg-gradient-to-br from-brand-50 via-background to-brand-50/50 dark:from-background dark:via-brand-950/20 dark:to-background">
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
                <Mail className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                Forgot your password?
              </CardTitle>
              <CardDescription className="text-sm">
                No worries! Enter your email and we'll send you reset instructions.
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="pl-10 h-10 border-2 focus:border-brand-600 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-600/30 transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send reset link
                  </>
                )}
              </Button>
            </form>

            <div className="relative pt-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full h-9 group hover:bg-muted/50 transition-colors"
              onClick={() => navigate('/auth/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to login
            </Button>

            {/* Security Note */}
            <div className="pt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span>Your information is safe and secure</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}