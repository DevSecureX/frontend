import { Check, Crown, Shield, Users, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PricingPlansProps {
  currentPlan: string
  onUpgrade: (planId: string) => void
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started with security scanning',
    price: 0,
    period: 'month',
    icon: Shield,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    popular: false,
    features: [
      'Up to 3 repositories',
      'Basic security scanning',
      'Community support',
      'Standard security rules',
      'Email notifications',
      'Basic vulnerability reports'
    ],
    limits: [
      '50 scans per month',
      'Public repositories only',
      'Basic integrations'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced security for professional development teams',
    price: 29,
    period: 'month',
    icon: Crown,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    popular: true,
    features: [
      'Unlimited repositories',
      'Advanced security scanning',
      'Priority support',
      'Custom security rules',
      'Compliance reporting (SOC 2, GDPR, HIPAA)',
      'Advanced vulnerability management',
      'Pull request integration',
      'Slack/Teams notifications',
      'API access',
      'Custom webhooks',
      'Team collaboration',
      'Audit logs'
    ],
    limits: [
      'Unlimited scans',
      'Private repositories',
      'All integrations',
      'Advanced analytics'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: null,
    period: 'custom',
    icon: Users,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    popular: false,
    features: [
      'Everything in Premium',
      'On-premise deployment',
      'SSO integration',
      'Advanced RBAC',
      'Custom compliance frameworks',
      'Dedicated support manager',
      'SLA guarantees',
      'Custom integrations',
      'White-label branding',
      'Advanced analytics & reporting',
      'Multi-tenant architecture',
      'Enterprise-grade security'
    ],
    limits: [
      'Custom limits',
      'Dedicated infrastructure',
      'Premium support'
    ]
  }
]

export function PricingPlans({ currentPlan, onUpgrade }: PricingPlansProps) {
  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlan) return
    
    if (planId === 'enterprise') {
      // Open contact form or redirect to sales
      window.open('mailto:sales@devsecurex.com?subject=Enterprise Plan Inquiry', '_blank')
      return
    }
    
    onUpgrade(planId)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the perfect plan for your security needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan
          const Icon = plan.icon

          return (
            <Card 
              key={plan.id}
              className={`relative transition-all hover:shadow-lg ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              } ${isCurrentPlan ? `${plan.bgColor} ${plan.borderColor} border-2` : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-3 rounded-full ${plan.bgColor} w-fit mb-4`}>
                  <Icon className={`h-8 w-8 ${plan.color}`} />
                </div>
                
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-4">
                  {plan.price !== null ? (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">Custom Pricing</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="font-medium mb-3">Features</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits/Usage */}
                <div>
                  <h4 className="font-medium mb-3">Usage & Limits</h4>
                  <ul className="space-y-1">
                    {plan.limits.map((limit, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {limit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : plan.id === 'enterprise' ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      Contact Sales
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {plan.id === 'free' ? 'Downgrade' : 'Upgrade'} to {plan.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>
            Detailed comparison of features across all plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Feature</th>
                  <th className="text-center py-3 px-2">Free</th>
                  <th className="text-center py-3 px-2">Premium</th>
                  <th className="text-center py-3 px-2">Enterprise</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b border-muted">
                  <td className="py-3 px-2 font-medium">Repositories</td>
                  <td className="text-center py-3 px-2">Up to 3</td>
                  <td className="text-center py-3 px-2">Unlimited</td>
                  <td className="text-center py-3 px-2">Unlimited</td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-3 px-2 font-medium">Monthly Scans</td>
                  <td className="text-center py-3 px-2">50</td>
                  <td className="text-center py-3 px-2">Unlimited</td>
                  <td className="text-center py-3 px-2">Unlimited</td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-3 px-2 font-medium">Private Repositories</td>
                  <td className="text-center py-3 px-2"><X className="h-4 w-4 text-red-500 dark:text-red-400 mx-auto" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-3 px-2 font-medium">Custom Rules</td>
                  <td className="text-center py-3 px-2"><X className="h-4 w-4 text-red-500 dark:text-red-400 mx-auto" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-3 px-2 font-medium">Priority Support</td>
                  <td className="text-center py-3 px-2"><X className="h-4 w-4 text-red-500 dark:text-red-400 mx-auto" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-3 px-2 font-medium">SSO Integration</td>
                  <td className="text-center py-3 px-2"><X className="h-4 w-4 text-red-500 dark:text-red-400 mx-auto" /></td>
                  <td className="text-center py-3 px-2"><X className="h-4 w-4 text-red-500 dark:text-red-400 mx-auto" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Can I change my plan anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
              and you'll be prorated for any billing differences.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">What happens to my data if I downgrade?</h4>
            <p className="text-sm text-muted-foreground">
              Your data remains safe. However, you may lose access to premium features and 
              need to reduce the number of repositories if exceeding the plan limits.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Is there a free trial for Premium?</h4>
            <p className="text-sm text-muted-foreground">
              We offer a 14-day free trial for Premium plans. No credit card required to start.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Do you offer discounts for nonprofits or education?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, we offer special pricing for nonprofits and educational institutions. 
              Contact our sales team for more information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}