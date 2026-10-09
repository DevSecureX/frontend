import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Lock, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'

const paymentMethodSchema = z.object({
  cardNumber: z
    .string()
    .min(13, 'Card number must be at least 13 digits')
    .max(19, 'Card number must be at most 19 digits')
    .regex(/^\d+$/, 'Card number must contain only digits'),
  expiryMonth: z.string().min(1, 'Expiry month is required'),
  expiryYear: z.string().min(1, 'Expiry year is required'),
  cvv: z
    .string()
    .min(3, 'CVV must be at least 3 digits')
    .max(4, 'CVV must be at most 4 digits')
    .regex(/^\d+$/, 'CVV must contain only digits'),
  holderName: z
    .string()
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(50, 'Cardholder name must be less than 50 characters'),
  billingAddress: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  setAsDefault: z.boolean().default(false),
})

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>

interface AddPaymentMethodDialogProps {
  onSuccess?: () => void
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, '0'),
  label: (i + 1).toString().padStart(2, '0')
}))

const YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() + i
  return {
    value: year.toString(),
    label: year.toString()
  }
})

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IN', label: 'India' },
  { value: 'JP', label: 'Japan' },
]

export function AddPaymentMethodDialog({ onSuccess }: AddPaymentMethodDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      setAsDefault: false,
      billingAddress: {
        country: 'US'
      }
    }
  })

  const watchedCardNumber = watch('cardNumber')
  const watchedSetAsDefault = watch('setAsDefault')

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')
    
    // Add spaces every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
    
    return formatted
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setValue('cardNumber', formatted.replace(/\s/g, ''))
    e.target.value = formatted
  }

  const detectCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '')
    
    if (/^4/.test(number)) return 'Visa'
    if (/^5[1-5]/.test(number)) return 'Mastercard'
    if (/^3[47]/.test(number)) return 'American Express'
    if (/^6(?:011|5)/.test(number)) return 'Discover'
    
    return null
  }

  const onSubmit = async (data: PaymentMethodFormData) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call to add payment method
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Adding payment method
      onSuccess?.()
    } catch (error) {
      console.error('Failed to add payment method:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const cardBrand = watchedCardNumber ? detectCardBrand(watchedCardNumber) : null

  return (
    <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Add Payment Method
        </DialogTitle>
        <DialogDescription>
          Add a new payment method to your account for subscriptions and billing
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={(e) => { void handleSubmit(onSubmit)(e) }} className="space-y-6">
        {/* Card Information */}
        <div className="space-y-4">
          <h3 className="font-medium">Card Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number *</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                onChange={handleCardNumberChange}
                className={errors.cardNumber ? 'border-destructive' : ''}
              />
              {cardBrand && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-muted-foreground">{cardBrand}</span>
                </div>
              )}
            </div>
            {errors.cardNumber && (
              <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Expiry Month *</Label>
              <Select onValueChange={(value) => setValue('expiryMonth', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expiryMonth && (
                <p className="text-sm text-destructive">{errors.expiryMonth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryYear">Expiry Year *</Label>
              <Select onValueChange={(value) => setValue('expiryYear', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="YYYY" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expiryYear && (
                <p className="text-sm text-destructive">{errors.expiryYear.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                placeholder="123"
                maxLength={4}
                {...register('cvv')}
                className={errors.cvv ? 'border-destructive' : ''}
              />
              {errors.cvv && (
                <p className="text-sm text-destructive">{errors.cvv.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="holderName">Cardholder Name *</Label>
            <Input
              id="holderName"
              placeholder="John Doe"
              {...register('holderName')}
              className={errors.holderName ? 'border-destructive' : ''}
            />
            {errors.holderName && (
              <p className="text-sm text-destructive">{errors.holderName.message}</p>
            )}
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h3 className="font-medium">Billing Address</h3>
          
          <div className="space-y-2">
            <Label htmlFor="line1">Address Line 1 *</Label>
            <Input
              id="line1"
              placeholder="123 Main Street"
              {...register('billingAddress.line1')}
              className={errors.billingAddress?.line1 ? 'border-destructive' : ''}
            />
            {errors.billingAddress?.line1 && (
              <p className="text-sm text-destructive">{errors.billingAddress.line1.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="line2">Address Line 2</Label>
            <Input
              id="line2"
              placeholder="Apartment, suite, etc. (optional)"
              {...register('billingAddress.line2')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="New York"
                {...register('billingAddress.city')}
                className={errors.billingAddress?.city ? 'border-destructive' : ''}
              />
              {errors.billingAddress?.city && (
                <p className="text-sm text-destructive">{errors.billingAddress.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                placeholder="NY"
                {...register('billingAddress.state')}
                className={errors.billingAddress?.state ? 'border-destructive' : ''}
              />
              {errors.billingAddress?.state && (
                <p className="text-sm text-destructive">{errors.billingAddress.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                placeholder="10001"
                {...register('billingAddress.postalCode')}
                className={errors.billingAddress?.postalCode ? 'border-destructive' : ''}
              />
              {errors.billingAddress?.postalCode && (
                <p className="text-sm text-destructive">{errors.billingAddress.postalCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select 
                defaultValue="US"
                onValueChange={(value) => setValue('billingAddress.country', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.billingAddress?.country && (
                <p className="text-sm text-destructive">{errors.billingAddress.country.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="setAsDefault"
              checked={watchedSetAsDefault}
              onCheckedChange={(checked) => setValue('setAsDefault', checked as boolean)}
            />
            <Label htmlFor="setAsDefault" className="text-sm">
              Set as default payment method
            </Label>
          </div>
        </div>

        {/* Security Notice */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-950/30">
                <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-1">
                  Secure Payment Processing
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Your payment information is encrypted and processed securely. 
                  We never store your full card details on our servers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding Payment Method...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Payment Method
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}