import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTimezone } from '@/contexts/TimezoneContext'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  User, 
  Shield, 
  Trash2, 
  Save, 
  Mail,
  Github,
  AlertTriangle,
  CheckCircle2,
  Settings as SettingsIcon,
  CreditCard,
  X,
} from 'lucide-react'
import { GitHubConnectionCard } from '@/components/auth/GitHubConnectionCard'
import { TimezoneSettings } from '@/components/settings/TimezoneSettings'
import { NotificationPreferences } from '@/components/settings/NotificationPreferences'
import { ApiKeysManagement } from '@/components/settings/ApiKeysManagement'
import { DataExport } from '@/components/settings/DataExport'
import { DeletionFeedback } from '@/components/settings/DeletionFeedback'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface ProfileData {
  first_name: string
  last_name: string
  mobile_no: string
}

interface FeedbackData {
  feedback: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export function SettingsPage() {
  const { user, updateProfile, logout } = useAuthStore()
  const queryClient = useQueryClient()
  const { formatDateOnly } = useTimezone()
  
  // State for forms
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    mobile_no: user?.mobile_no || '',
  })
  
  
  const [feedback, setFeedback] = useState<FeedbackData>({
    feedback: '',
    priority: 'medium',
  })
  
  const [isProfileDirty, setIsProfileDirty] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletionReason, setDeletionReason] = useState('')

  // Health check query
  const { data: healthData } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.auth.healthCheck(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileData) => api.auth.updateProfile(data),
    onSuccess: (data) => {
      updateProfile(data)
      setIsProfileDirty(false)
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  // Feedback submission mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: (data: FeedbackData) => api.auth.submitFeedback(data),
    onSuccess: () => {
      setFeedback({ feedback: '', priority: 'medium' })
      toast.success('Feedback submitted successfully')
    },
    onError: (error: any) => {
      // Handle validation errors specifically
      if (error.response?.data?.detail) {
        const details = error.response.data.detail
        if (Array.isArray(details)) {
          // Handle Pydantic validation errors
          const validationErrors = details
            .filter((err: any) => err.loc?.includes('feedback'))
            .map((err: any) => err.msg)
          
          if (validationErrors.length > 0) {
            toast.error(validationErrors[0])
            return
          }
        }
        
        // Handle single error message
        if (typeof details === 'string') {
          toast.error(details)
          return
        }
      }
      
      // Fallback error message
      toast.error(error.message || 'Failed to submit feedback')
    },
  })

  // Account deletion mutation (soft delete with retention period)
  const deleteAccountMutation = useMutation({
    mutationFn: () => api.auth.deleteAccount(deletionReason || undefined),
    onSuccess: (data) => {
      const { deleted_data } = data
      const deletionDate = formatDateOnly(deleted_data.deletion_timestamp)
      const retentionDays = deleted_data.retention_period_days
      
      toast.success(
        `Account deactivated successfully on ${deletionDate}. Your data is preserved for ${retentionDays} days for compliance purposes. ${deleted_data.repositories} repositories and ${deleted_data.scans} scans were processed. Contact support within ${retentionDays} days to restore your account.`,
        {
          duration: 8000, // Show longer for important information
        }
      )
      logout()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to deactivate account')
    },
  })

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    setIsProfileDirty(true)
  }


  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData)
  }

  const handleFeedbackSubmit = () => {
    const trimmedFeedback = feedback.feedback.trim()
    
    // Client-side validation to match backend requirements
    if (!trimmedFeedback) {
      toast.error('Please enter your feedback')
      return
    }
    
    if (trimmedFeedback.length < 10) {
      toast.error('Feedback must be at least 10 characters long')
      return
    }
    
    if (trimmedFeedback.length > 5000) {
      toast.error('Feedback must be less than 5000 characters')
      return
    }
    
    submitFeedbackMutation.mutate(feedback)
  }

  const handleAccountDelete = () => {
    if (deleteConfirmation.trim() !== user?.username) {
      toast.error('Username confirmation required: Please type your exact username to proceed with deactivation')
      return
    }
    
    // Clear form state immediately to prevent double-click
    setDeleteConfirmation('')
    setShowDeleteDialog(false)
    
    deleteAccountMutation.mutate()
  }

  const handleDeleteDialogClose = () => {
    setShowDeleteDialog(false)
    setDeleteConfirmation('')
    setDeletionReason('')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current system health and service status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              {healthData?.database ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Database</span>
            </div>
            <div className="flex items-center gap-2">
              {healthData?.services?.razorpay ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">API</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {(healthData as any)?.app_env || 'Production'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData.first_name}
                onChange={e =>
                  handleProfileChange('first_name', e.target.value)
                }
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.last_name}
                onChange={e => handleProfileChange('last_name', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={profileData.mobile_no}
              onChange={e => handleProfileChange('mobile_no', e.target.value)}
              placeholder="Enter your mobile number"
            />
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user?.email || ''} disabled className="bg-muted" />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={user?.username || ''} disabled className="bg-muted" />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleProfileSave}
              disabled={!isProfileDirty || updateProfileMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </CardTitle>
          <CardDescription>
            Manage your GitHub account connection for repository access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GitHubConnectionCard />
        </CardContent>
      </Card>

      {/* Subscription Info */}
      {user?.is_premium && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Your premium subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="default" className="mb-2">
                  Premium Active
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Expires:{' '}
                  {user.premium_expiry
                    ? formatDateOnly(user.premium_expiry)
                    : 'N/A'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open('/billing', '_blank')}
              >
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys Management - Enterprise */}
      <ApiKeysManagement />

      {/* Notification Preferences - Enterprise */}
      {/* <NotificationPreferences /> */}

      {/* Timezone Settings */}
      <TimezoneSettings />

      {/* Push Notification Settings */}
      {/* Push notification settings can be added later */}

      {/* Data Export - Enterprise Compliance */}
      <DataExport />

      {/* Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Feedback
          </CardTitle>
          <CardDescription>
            Help us improve DevSecureX with your feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="feedback">Your Feedback</Label>
              {feedback.feedback.length > 0 && (
                <span
                  className={`text-xs ${
                    feedback.feedback.trim().length < 10
                      ? 'text-amber-600 dark:text-amber-400'
                      : feedback.feedback.length > 5000
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-muted-foreground'
                  }`}
                >
                  {feedback.feedback.length}/5000
                </span>
              )}
            </div>
            <Textarea
              id="feedback"
              placeholder="Tell us what you think, report issues, or request features..."
              value={feedback.feedback}
              onChange={e =>
                setFeedback(prev => ({ ...prev, feedback: e.target.value }))
              }
              rows={4}
              className={
                feedback.feedback.length > 5000
                  ? 'border-red-300 focus:border-red-500 dark:border-red-600 dark:focus:border-red-400'
                  : ''
              }
            />
            {feedback.feedback.trim().length > 0 &&
              feedback.feedback.trim().length < 10 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Please add a few more characters (minimum 10 total)
                </p>
              )}
            {feedback.feedback.length > 5000 && (
              <p className="text-xs text-red-500 dark:text-red-400">
                Feedback is too long (maximum 5000 characters)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={feedback.priority}
              onValueChange={value =>
                setFeedback(prev => ({ ...prev, priority: value as any }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority level">
                  {feedback.priority && (
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          feedback.priority === 'low'
                            ? 'bg-green-500'
                            : feedback.priority === 'medium'
                              ? 'bg-yellow-500'
                              : feedback.priority === 'high'
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                        }`}
                      ></div>
                      <span className="capitalize">{feedback.priority}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Low</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span>High</span>
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Critical</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleFeedbackSubmit}
            disabled={
              submitFeedbackMutation.isPending ||
              feedback.feedback.trim().length < 10 ||
              feedback.feedback.length > 5000
            }
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            {submitFeedbackMutation.isPending
              ? 'Sending...'
              : feedback.feedback.trim().length < 10 &&
                  feedback.feedback.length > 0
                ? `Send Feedback (${10 - feedback.feedback.trim().length} more characters needed)`
                : 'Send Feedback'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Account deactivation with enterprise-grade soft delete and 30-day
            retention policy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Deactivate Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <AlertDialogHeader>
                <div className="flex items-center justify-between">
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Deactivate Account
                  </AlertDialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={handleDeleteDialogClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <AlertDialogDescription className="space-y-4">
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                    <p className="mb-2 font-semibold text-destructive">
                      ⚠️ Account Deactivation - Immediate Effects:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • <strong>Account Access:</strong> Immediate
                        deactivation - cannot login or access services
                      </li>
                      <li>
                        • <strong>API Integration:</strong> All tokens,
                        webhooks, and integrations revoked instantly
                      </li>
                      <li>
                        • <strong>Repository Access:</strong> All connected
                        repositories disconnected from DevSecureX
                      </li>
                      <li>
                        • <strong>Subscription:</strong> Active subscriptions
                        cancelled (contact support for refunds)
                      </li>
                      <li>
                        • <strong>Data Access:</strong> All scans, reports, and
                        dashboard data inaccessible
                      </li>
                      <li>
                        • <strong>Team Access:</strong> Removed from all shared
                        repositories and organizations
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                    <p className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                      🔒 Enterprise Data Retention Policy:
                    </p>
                    <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                      <li>
                        • <strong>Soft Delete:</strong> Data preserved in
                        secure, isolated storage for 30 days
                      </li>
                      <li>
                        • <strong>Compliance:</strong> Retention period meets
                        enterprise security and audit requirements
                      </li>
                      <li>
                        • <strong>Data Security:</strong> All data encrypted and
                        inaccessible during retention period
                      </li>
                      <li>
                        • <strong>Restoration Window:</strong> Full account
                        recovery possible via support within 30 days
                      </li>
                      <li>
                        • <strong>Permanent Deletion:</strong> After 30 days,
                        all data permanently purged per policy
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <p className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
                      📋 Pre-Deactivation Checklist:
                    </p>
                    <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                      <li>
                        • <strong>Data Export:</strong> Use Data Export feature
                        to download your information
                      </li>
                      <li>
                        • <strong>Reports:</strong> Download critical scan
                        reports and security findings
                      </li>
                      <li>
                        • <strong>Team Notification:</strong> Inform team
                        members about shared repository access loss
                      </li>
                      <li>
                        • <strong>API Integration:</strong> Update applications
                        using DevSecureX API keys
                      </li>
                      <li>
                        • <strong>Recovery Window:</strong> Remember the 30-day
                        restoration period
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                    <p className="mb-2 font-semibold text-green-800 dark:text-green-200">
                      💡 Consider These Alternatives:
                    </p>
                    <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                      <li>
                        • <strong>Repository Management:</strong> Disconnect
                        specific repositories instead of full deactivation
                      </li>
                      <li>
                        • <strong>Plan Downgrade:</strong> Switch to free tier
                        to retain account without premium features
                      </li>
                      <li>
                        • <strong>Temporary Suspension:</strong> Contact support
                        for account pause without data loss
                      </li>
                      <li>
                        • <strong>Access Review:</strong> Modify team
                        permissions and integrations instead
                      </li>
                    </ul>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              {/* Optional Deletion Feedback */}
              <div className="my-4">
                <DeletionFeedback onReasonChange={setDeletionReason} />
              </div>

              <div className="my-4">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <Label
                    htmlFor="delete-confirmation"
                    className="text-sm font-medium"
                  >
                    <strong>Confirmation Required:</strong> Type your username{' '}
                    <span className="rounded border bg-background px-2 py-1 font-mono">
                      {user?.username}
                    </span>{' '}
                    to proceed:
                  </Label>
                  <Input
                    id="delete-confirmation"
                    type="text"
                    value={deleteConfirmation}
                    onChange={e => setDeleteConfirmation(e.target.value)}
                    placeholder="Enter your exact username"
                    className="mt-2"
                    autoComplete="off"
                  />
                  {deleteConfirmation &&
                    deleteConfirmation.trim() !== user?.username && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Username must match exactly (case-sensitive)
                      </p>
                    )}
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleDeleteDialogClose}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAccountDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={
                    deleteAccountMutation.isPending ||
                    deleteConfirmation.trim() !== user?.username
                  }
                >
                  {deleteAccountMutation.isPending
                    ? 'Deactivating...'
                    : 'Deactivate Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}