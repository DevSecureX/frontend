import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Github, Shield, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store'
import { toast } from 'sonner'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: () => void
  onSignupClick?: () => void
}

export function LoginForm({ onSuccess, onSignupClick }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { login, initiateGoogleLogin, initiateGithubLogin, isLoading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError()
      await login(data)
      reset()
      onSuccess?.()
    } catch (error: unknown) {
      console.error('Login failed:', error)
    }
  }

  const handleGoogleLogin = () => {
    initiateGoogleLogin()
  }

  const handleGithubLogin = () => {
    initiateGithubLogin()
  }

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-2xl backdrop-blur-sm bg-white">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm">
          Sign in to your account to continue securing your code
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* OAuth Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full group hover:border-brand-600 hover:bg-brand-50 transition-all duration-200"
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.99 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleGithubLogin}
            className="w-full group hover:border-brand-600 hover:bg-brand-50 transition-all duration-200"
            disabled={isLoading}
          >
            <Github className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            GitHub
          </Button>
        </div>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground font-medium">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={(e) => { void handleSubmit(onSubmit)(e) }} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium">Username or Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors" />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                {...register('username')}
                className={`pl-10 h-9 border-2 focus:border-brand-600 transition-all ${errors.username ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-600 transition-colors z-10" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                className={`pl-10 pr-10 h-9 border-2 focus:border-brand-600 transition-all ${errors.password ? 'border-destructive' : ''}`}
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
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-2.5 border border-destructive/30">
              <p className="text-xs text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <a
              href="/auth/forgot-password"
              className="text-xs text-brand-600 hover:text-brand-700 hover:underline font-medium transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full h-9 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 group shadow-lg shadow-brand-600/30 transition-all duration-200"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 pt-3">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <p className="bg-card px-3 text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-brand-600 hover:text-brand-700 text-xs"
                onClick={onSignupClick}
              >
                Sign up
              </Button>
            </p>
          </div>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          By signing in, you agree to our{' '}
          <a href="/terms" className="underline hover:text-brand-600 font-medium">
            Terms
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-brand-600 font-medium">
            Privacy Policy
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="pt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Secure encrypted connection</span>
        </div>
      </CardFooter>
    </Card>
  )
}