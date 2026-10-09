import { useState } from 'react'
import { 
  Crown, 
  Shield, 
  Check, 
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { useAuthStore } from '@/store'
import { PricingPlans } from '@/components/billing/PricingPlans'
import { PaymentMethods } from '@/components/billing/PaymentMethods'
import { BillingHistory } from '@/components/billing/BillingHistory'
import { UsageMetrics } from '@/components/billing/UsageMetrics'
import { UpgradeDialog } from '@/components/billing/UpgradeDialog'
import { format } from 'date-fns'
import { useTimezone } from '@/contexts/TimezoneContext'

export function BillingPage() {
  const { formatDateOnly } = useTimezone()
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  
  const { user, isPremium, getPremiumExpiry } = useAuthStore()
  
  const currentPlan = isPremium() ? 'premium' : 'free'
  const premiumExpiry = getPremiumExpiry()

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId)
    setShowUpgradeDialog(true)
  }

  const getPlanDetails = () => {
    if (isPremium()) {
      return {
        name: 'Premium',
        icon: Crown,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        features: [
          'Unlimited repositories',
          'Advanced security scanning',
          'Priority support',
          'Custom security rules',
          'Compliance reporting',
          'Team collaboration'
        ]
      }
    }
    
    return {
      name: 'Free',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'Up to 3 repositories',
        'Basic security scanning',
        'Community support',
        'Standard security rules'
      ]
    }
  }

  const plan = getPlanDetails()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
        
        {!isPremium() && (
          <Button onClick={() => handleUpgrade('premium')} className="gap-2">
            <Crown className="h-4 w-4" />
            Upgrade to Premium
          </Button>
        )}
      </div>

      {/* Current Plan Card */}
      <Card className={`${plan.bgColor} ${plan.borderColor} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full bg-white shadow-sm`}>
                <plan.icon className={`h-6 w-6 ${plan.color}`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {plan.name} Plan
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {isPremium() && premiumExpiry
                    ? `Expires on ${formatDateOnly(premiumExpiry)}`
                    : isPremium()
                    ? 'Active subscription'
                    : 'Free tier with basic features'
                  }
                </CardDescription>
              </div>
            </div>
            
            {isPremium() && (
              <div className="text-right">
                <div className="text-2xl font-bold">$29</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-3">Plan Features</h4>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            {isPremium() && (
              <div>
                <h4 className="font-medium mb-3">Subscription Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billing Cycle:</span>
                    <span>Monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Billing:</span>
                    <span>
                      {premiumExpiry ? formatDateOnly(premiumExpiry) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Warning for Free Users */}
      {!isPremium() && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">
                  Limited Usage Available
                </h4>
                <p className="text-sm text-amber-700 mb-3">
                  You're currently on the free plan with limited repositories and scanning capabilities. 
                  Upgrade to Premium for unlimited access to all security features.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => handleUpgrade('premium')}
                  className="gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <UsageMetrics />
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <PricingPlans 
            currentPlan={currentPlan}
            onUpgrade={handleUpgrade}
          />
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <PaymentMethods />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <BillingHistory />
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <UpgradeDialog
          currentPlan={currentPlan}
          onSuccess={() => {
            setShowUpgradeDialog(false)
            // Refresh user data
            window.location.reload()
          }}
        />
      </Dialog>
    </div>
  )
}