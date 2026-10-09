import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Github, Chrome, Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/store'
import { toast } from 'sonner'

const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  mobile_no: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s-()]+$/.test(val), 'Please enter a valid phone number'),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignupFormData = z.infer<typeof signupSchema>

interface SignupFormProps {
  onSuccess?: () => void
  onLoginClick?: () => void
}

export function SignupForm({ onSuccess, onLoginClick }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signup, initiateGoogleLogin, initiateGithubLogin, isLoading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      acceptTerms: false
    }
  })

  const password = watch('password')
  const acceptTerms = watch('acceptTerms')

  const passwordStrength = {
    length: password?.length >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    lowercase: /[a-z]/.test(password || ''),
    number: /\d/.test(password || ''),
  }

  const passwordStrengthScore = Object.values(passwordStrength).filter(Boolean).length

  const onSubmit = async (data: SignupFormData) => {
    try {
      clearError()
      const { confirmPassword: _confirmPassword, acceptTerms: _acceptTerms, ...signupData } = data
      await signup(signupData)
      reset()
      toast.success('Account created successfully! Please sign in.')
      onSuccess?.()
    } catch (error: unknown) {
      console.error('Signup failed:', error)
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
        <div className="flex items-center justify-center mb-2">
          <div className="p-2 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-center">
          Join DevSecureX
        </CardTitle>
        <CardDescription className="text-center text-sm">
          Create your security platform account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* OAuth Signup Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full group hover:border-brand-600 hover:bg-brand-50 transition-all duration-200"
            disabled={isLoading}
          >
            <Chrome className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
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

        {/* Signup Form */}
        <form onSubmit={(e) => { void handleSubmit(onSubmit)(e) }} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <Label htmlFor="first_name" className="text-sm">First Name</Label>
              <Input
                id="first_name"
                type="text"
                placeholder="John"
                {...register('first_name')}
                className={`h-9 ${errors.first_name ? 'border-destructive' : ''}`}
              />
              {errors.first_name && (
                <p className="text-xs text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="last_name" className="text-sm">Last Name</Label>
              <Input
                id="last_name"
                type="text"
                placeholder="Doe"
                {...register('last_name')}
                className={`h-9 ${errors.last_name ? 'border-destructive' : ''}`}
              />
              {errors.last_name && (
                <p className="text-xs text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              {...register('username')}
              className={`h-9 ${errors.username ? 'border-destructive' : ''}`}
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              className={`h-9 ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mobile_no" className="text-sm">Phone Number (Optional)</Label>
            <Input
              id="mobile_no"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('mobile_no')}
              className={`h-9 ${errors.mobile_no ? 'border-destructive' : ''}`}
            />
            {errors.mobile_no && (
              <p className="text-xs text-destructive">{errors.mobile_no.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                {...register('password')}
                className={`h-9 pr-10 ${errors.password ? 'border-destructive' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
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
                  <span className="text-xs text-muted-foreground">
                    {passwordStrengthScore}/4
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className={`flex items-center space-x-1 ${passwordStrength.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <CheckCircle className="h-3 w-3" />
                    <span>8+ chars</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${passwordStrength.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <CheckCircle className="h-3 w-3" />
                    <span>Uppercase</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${passwordStrength.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <CheckCircle className="h-3 w-3" />
                    <span>Lowercase</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${passwordStrength.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <CheckCircle className="h-3 w-3" />
                    <span>Number</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                className={`h-9 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
            />
            <Label htmlFor="acceptTerms" className="text-xs leading-relaxed">
              I agree to the{' '}
              <a href="/terms" className="underline hover:text-primary">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-primary">
                Privacy Policy
              </a>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
          )}

          {error && (
            <div className="rounded-md bg-destructive/15 p-2.5">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-9 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-600/30 transition-all duration-200"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
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
              Already have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-brand-600 hover:text-brand-700 text-xs"
                onClick={onLoginClick}
              >
                Sign in
              </Button>
            </p>
          </div>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          By signing up, you agree to our{' '}
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