import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '@/lib/api/auth'
import type { NotificationPreferences, NotificationPreferencesUpdate } from '@/lib/api/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Bell, 
  Mail, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  Megaphone,
  Clock,
  Loader2
} from 'lucide-react'
import { useTimezone } from '@/contexts/TimezoneContext'

export function NotificationPreferences() {
  const queryClient = useQueryClient()
  const { formatDate } = useTimezone()

  // Query for current preferences
  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => authAPI.getNotificationPreferences(),
  })

  // Mutation for updating preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: (updates: NotificationPreferencesUpdate) => 
      authAPI.updateNotificationPreferences(updates),
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(['notification-preferences'], updatedPreferences)
      toast.success('Notification preferences updated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update notification preferences')
    },
  })

  const handlePreferenceChange = (key: keyof NotificationPreferencesUpdate, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email_notifications':
        return <Mail className="h-4 w-4" />
      case 'security_alerts':
        return <Shield className="h-4 w-4" />
      case 'scan_completion_notifications':
        return <CheckCircle2 className="h-4 w-4" />
      case 'weekly_reports':
        return <BarChart3 className="h-4 w-4" />
      case 'marketing_emails':
        return <Megaphone className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Loading notification preferences...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between py-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                  <div className="h-6 w-10 bg-muted rounded-full"></div>
                </div>
                {i < 5 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Configure when and how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-red-600">
            <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
            <p>Failed to load notification preferences</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please refresh the page or try again later
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure when and how you receive notifications
            </CardDescription>
          </div>
          {preferences?.notification_preferences_updated_at && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Updated {formatDate(preferences.notification_preferences_updated_at)}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-0">
        {/* Email Notifications */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {getNotificationIcon('email_notifications')}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email-notifications" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive general notifications via email about account activities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {updatePreferencesMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="email-notifications"
              checked={preferences?.email_notifications ?? true}
              onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
              disabled={updatePreferencesMutation.isPending}
            />
          </div>
        </div>

        <Separator />

        {/* Security Alerts */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {getNotificationIcon('security_alerts')}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="security-alerts" className="text-base font-medium">
                  Security Alerts
                </Label>
                <Badge variant="destructive" className="text-xs">Critical</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Immediate alerts for critical security issues and suspicious activities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {updatePreferencesMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="security-alerts"
              checked={preferences?.security_alerts ?? true}
              onCheckedChange={(checked) => handlePreferenceChange('security_alerts', checked)}
              disabled={updatePreferencesMutation.isPending}
            />
          </div>
        </div>

        <Separator />

        {/* Scan Completion */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {getNotificationIcon('scan_completion_notifications')}
            </div>
            <div className="space-y-1">
              <Label htmlFor="scan-completion" className="text-base font-medium">
                Scan Completion
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when security scans complete, with summary of findings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {updatePreferencesMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="scan-completion"
              checked={preferences?.scan_completion_notifications ?? true}
              onCheckedChange={(checked) => handlePreferenceChange('scan_completion_notifications', checked)}
              disabled={updatePreferencesMutation.isPending}
            />
          </div>
        </div>

        <Separator />

        {/* Weekly Reports */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {getNotificationIcon('weekly_reports')}
            </div>
            <div className="space-y-1">
              <Label htmlFor="weekly-reports" className="text-base font-medium">
                Weekly Reports
              </Label>
              <p className="text-sm text-muted-foreground">
                Weekly summary of security findings, trends, and recommendations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {updatePreferencesMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="weekly-reports"
              checked={preferences?.weekly_reports ?? false}
              onCheckedChange={(checked) => handlePreferenceChange('weekly_reports', checked)}
              disabled={updatePreferencesMutation.isPending}
            />
          </div>
        </div>

        <Separator />

        {/* Marketing Emails */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {getNotificationIcon('marketing_emails')}
            </div>
            <div className="space-y-1">
              <Label htmlFor="marketing-emails" className="text-base font-medium">
                Product Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Product updates, feature announcements, and educational content
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {updatePreferencesMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="marketing-emails"
              checked={preferences?.marketing_emails ?? false}
              onCheckedChange={(checked) => handlePreferenceChange('marketing_emails', checked)}
              disabled={updatePreferencesMutation.isPending}
            />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Notification Methods Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Notification Delivery
          </h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              All notifications are delivered to your registered email address: 
              <span className="font-medium text-foreground ml-1">{preferences?.email_notifications}</span>
            </p>
            <div className="space-y-1 text-xs">
              <p>• Security alerts are sent immediately regardless of other settings</p>
              <p>• Weekly reports are sent every Monday at 9:00 AM in your timezone</p>
              <p>• You can unsubscribe from any notification type at any time</p>
              <p>• Critical account notifications cannot be disabled for security reasons</p>
            </div>
          </div>
        </div>

        {/* Push Notifications Note */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium mb-1 flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Bell className="h-4 w-4" />
            Push Notifications
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Browser push notifications are coming soon! You'll be able to receive instant alerts 
            for security issues even when DevSecureX is not open in your browser.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}