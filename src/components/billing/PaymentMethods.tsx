import { useState } from 'react'
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit, 
  AlertCircle,
  Calendar,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AddPaymentMethodDialog } from './AddPaymentMethodDialog'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank'
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  holderName: string
}

export function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [_deletingId, _setDeletingId] = useState<string | null>(null)

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    )
  }

  const handleDelete = (id: string) => {
    setPaymentMethods(methods => 
      methods.filter(method => method.id !== id)
    )
    _setDeletingId(null)
  }

  const getCardIcon = (brand: string) => {
    // In a real app, you'd have proper card brand icons
    const brandColors = {
      visa: 'text-blue-600 dark:text-blue-400',
      mastercard: 'text-red-600 dark:text-red-400',
      amex: 'text-green-600 dark:text-green-400',
      discover: 'text-orange-600 dark:text-orange-400'
    }
    
    return brandColors[brand as keyof typeof brandColors] || 'text-gray-600 dark:text-gray-400'
  }

  const isExpiringSoon = (month: number, year: number) => {
    const now = new Date()
    const expiry = new Date(year, month - 1)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(now.getMonth() + 3)
    
    return expiry <= threeMonthsFromNow
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Payment Methods</h3>
          <p className="text-muted-foreground text-sm">
            Manage your payment methods and billing preferences
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <AddPaymentMethodDialog 
            onSuccess={() => {
              setShowAddDialog(false)
              // In real app, refresh payment methods from API
            }}
          />
        </Dialog>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
            <p className="text-muted-foreground text-center mb-6">
              Add a payment method to subscribe to premium plans and manage your billing.
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.isDefault ? 'border-primary' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <CreditCard className={`h-6 w-6 ${getCardIcon(method.brand)}`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">
                          {method.brand} •••• {method.last4}
                        </span>
                        {method.isDefault && (
                          <Badge variant="default" className="text-xs">
                            Default
                          </Badge>
                        )}
                        {isExpiringSoon(method.expiryMonth, method.expiryYear) && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>{method.holderName}</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-destructive hover:text-destructive"
                          disabled={method.isDefault}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this payment method? 
                            This action cannot be undone. Any active subscriptions using 
                            this payment method will need to be updated.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(method.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Payment Method
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-950/30">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-1">
                Your Payment Information is Secure
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                We use industry-standard encryption and work with trusted payment processors 
                to keep your financial information safe. We never store your full card details 
                on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium mb-1">Accepted Payment Methods</h4>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>• Major credit cards (Visa, Mastercard, American Express, Discover)</li>
              <li>• Debit cards with Visa or Mastercard logo</li>
              <li>• Bank transfers (ACH) for annual subscriptions</li>
              <li>• PayPal for consumer accounts</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Billing Information</h4>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>• Charges appear as "DevSecureX" on your statement</li>
              <li>• Subscriptions are billed monthly or annually</li>
              <li>• Failed payments will retry automatically for 3 days</li>
              <li>• Update payment methods before expiration to avoid service interruption</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}