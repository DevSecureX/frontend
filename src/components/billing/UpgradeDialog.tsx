import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Crown, CreditCard, Calendar, Lock, Check, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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

const upgradeSchema = z.object({
  plan: z.enum(['premium', 'enterprise']),
  billing: z.enum(['monthly', 'annual']),
  paymentMethod: z.string().min(1, 'Please select a payment method'),
})

type UpgradeFormData = z.infer<typeof upgradeSchema>

interface UpgradeDialogProps {
  currentPlan: string
  onSuccess?: () => void
}

const PLAN_DETAILS = {
  premium: {
    name: 'Premium',
    icon: Crown,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    monthly: 29,
    annual: 290, // ~17% discount
    features: [
      'Unlimited repositories',
      'Advanced security scanning',
      'Priority support',
      'Custom security rules',
      'Compliance reporting',
      'Pull request integration',
      'Team collaboration',
      'API access'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    icon: Crown,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    monthly: null,
    annual: null,
    features: [
      'Everything in Premium',
      'On-premise deployment',
      'SSO integration',
      'Advanced RBAC',
      'Custom compliance frameworks',
      'Dedicated support manager',
      'SLA guarantees',
      'Custom integrations'
    ]
  }
}

// Payment methods - in real app this would come from API
interface SavedPaymentMethod {
  id: string
  brand: string
  last4: string
  holderName: string
}

const PAYMENT_METHODS: SavedPaymentMethod[] = []

export function UpgradeDialog({ currentPlan: _currentPlan, onSuccess }: UpgradeDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'enterprise'>('premium')

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UpgradeFormData>({
    resolver: zodResolver(upgradeSchema),
    defaultValues: {
      plan: 'premium',
      billing: 'monthly',
      paymentMethod: PAYMENT_METHODS[0]?.id || ''
    }
  })

  const watchedBilling = watch('billing')
  const watchedPlan = watch('plan')

  const planDetails = PLAN_DETAILS[watchedPlan]
  const isEnterprise = watchedPlan === 'enterprise'

  const calculatePrice = () => {
    if (isEnterprise) return 'Custom'
    
    const price = watchedBilling === 'annual' ? planDetails.annual : planDetails.monthly
    return price ? `$${price}` : 'Custom'
  }

  const calculateSavings = () => {
    if (isEnterprise || !planDetails.annual || !planDetails.monthly) return null
    
    const monthlyCost = planDetails.monthly * 12
    const annualCost = planDetails.annual
    const savings = monthlyCost - annualCost
    const percentage = Math.round((savings / monthlyCost) * 100)
    
    return { amount: savings, percentage }
  }

  const onSubmit = async (data: UpgradeFormData) => {
    setIsProcessing(true)
    
    try {
      if (data.plan === 'enterprise') {
        // For enterprise, redirect to sales contact
        window.open('mailto:sales@devsecurex.com?subject=Enterprise Plan Upgrade', '_blank')
        onSuccess?.()
        return
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Processing upgrade
      onSuccess?.()
    } catch (error) {
      console.error('Upgrade failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const savings = calculateSavings()

  return (
    <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Upgrade Your Plan
        </DialogTitle>
        <DialogDescription>
          Choose your plan and complete the upgrade to unlock advanced features
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={(e) => { void handleSubmit(onSubmit)(e) }} className="space-y-6">
        {/* Plan Selection */}
        <div className="space-y-4">
          <h3 className="font-medium">Select Plan</h3>
          <RadioGroup
            value={selectedPlan}
            onValueChange={(value) => {
              setSelectedPlan(value as 'premium' | 'enterprise')
              setValue('plan', value as 'premium' | 'enterprise')
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {Object.entries(PLAN_DETAILS).map(([planId, plan]) => {
              const Icon = plan.icon
              const isSelected = selectedPlan === planId
              
              return (
                <div key={planId} className="relative">
                  <RadioGroupItem
                    value={planId}
                    id={planId}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={planId}
                    className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected ? `${plan.borderColor} ${plan.bgColor}` : 'border-muted hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-full ${plan.bgColor}`}>
                        <Icon className={`h-5 w-5 ${plan.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {planId === 'premium' ? 'For teams' : 'For enterprise'}
                        </p>
                      </div>
                    </div>
                    
                    <ul className="space-y-1 text-xs">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-muted-foreground">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        {/* Billing Cycle (only for Premium) */}
        {!isEnterprise && (
          <div className="space-y-4">
            <h3 className="font-medium">Billing Cycle</h3>
            <RadioGroup
              value={watchedBilling}
              onValueChange={(value) => setValue('billing', value as 'monthly' | 'annual')}
              className="space-y-2"
            >
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Monthly
                  </Label>
                </div>
                <div className="text-right">
                  <span className="font-medium">${planDetails.monthly}/month</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="annual" id="annual" />
                  <Label htmlFor="annual" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Annual
                    {savings && (
                      <Badge variant="secondary" className="text-xs">
                        Save {savings.percentage}%
                      </Badge>
                    )}
                  </Label>
                </div>
                <div className="text-right">
                  <span className="font-medium">${planDetails.annual}/year</span>
                  {savings && (
                    <p className="text-xs text-muted-foreground">
                      Save ${savings.amount}/year
                    </p>
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Payment Method (only for Premium) */}
        {!isEnterprise && (
          <div className="space-y-4">
            <h3 className="font-medium">Payment Method</h3>
            {PAYMENT_METHODS.length > 0 ? (
              <div className="space-y-2">
                <Select
                  value={watch('paymentMethod')}
                  onValueChange={(value) => setValue('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="capitalize">{method.brand} •••• {method.last4}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
                )}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <CreditCard className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No payment methods found. Add one to continue.
                  </p>
                  <Button variant="outline" size="sm">
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Separator />

        {/* Order Summary */}
        <div className="space-y-4">
          <h3 className="font-medium">Order Summary</h3>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{planDetails.name} Plan</p>
                  {!isEnterprise && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {watchedBilling} billing
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">{calculatePrice()}</p>
                  {!isEnterprise && (
                    <p className="text-sm text-muted-foreground">
                      /{watchedBilling === 'annual' ? 'year' : 'month'}
                    </p>
                  )}
                </div>
              </div>

              {!isEnterprise && savings && watchedBilling === 'annual' && (
                <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Annual discount</span>
                  <span>-${savings.amount}</span>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>{calculatePrice()}{!isEnterprise && `/${watchedBilling === 'annual' ? 'year' : 'month'}`}</span>
              </div>
            </CardContent>
          </Card>
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
                  {isEnterprise 
                    ? 'Our sales team will contact you to discuss custom pricing and deployment options.'
                    : 'Your payment is processed securely. You can cancel or change your plan anytime from your billing settings.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button 
            type="submit" 
            disabled={isProcessing || (!isEnterprise && PAYMENT_METHODS.length === 0)}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isEnterprise ? (
              <>
                Contact Sales
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Upgrade to {planDetails.name}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}