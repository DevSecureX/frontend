import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '@/lib/api/auth'
import type { ApiKey, ApiKeyCreateRequest } from '@/lib/api/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Activity,
  Lock,
  Shield,
  AlertTriangle
} from 'lucide-react'
import { useTimezone } from '@/contexts/TimezoneContext'

interface ApiKeysManagementProps {}

export function ApiKeysManagement() {
  const queryClient = useQueryClient()
  const { formatDate } = useTimezone()
  
  // State
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showFullKey, setShowFullKey] = useState<string | null>(null)
  const [newKeyData, setNewKeyData] = useState<ApiKeyCreateRequest>({
    name: '',
    scopes: ['read'],
    expires_in_days: undefined
  })

  // Queries
  const { data: apiKeys, isLoading, error } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => authAPI.getApiKeys(),
  })

  // Mutations
  const createKeyMutation = useMutation({
    mutationFn: (keyData: ApiKeyCreateRequest) => authAPI.createApiKey(keyData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setShowFullKey(response.key)
      setShowCreateDialog(false)
      setNewKeyData({ name: '', scopes: ['read'], expires_in_days: undefined })
      toast.success(`API key "${response.name}" created successfully`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create API key')
    },
  })

  const deleteKeyMutation = useMutation({
    mutationFn: (keyId: number) => authAPI.deleteApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API key deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete API key')
    },
  })

  const handleScopeChange = (scope: string, checked: boolean) => {
    setNewKeyData(prev => ({
      ...prev,
      scopes: checked 
        ? [...prev.scopes!, scope]
        : prev.scopes!.filter(s => s !== scope)
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'N/A'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage your API keys for secure programmatic access to DevSecureX
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key to access DevSecureX services
                  programmatically
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name *</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production Scanner, CI/CD Pipeline"
                    value={newKeyData.name}
                    onChange={e =>
                      setNewKeyData(prev => ({ ...prev, name: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a descriptive name to identify this key
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Permissions (Scopes)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        value: 'read',
                        label: 'Read',
                        description: 'View scans, repos, and results',
                      },
                      {
                        value: 'write',
                        label: 'Write',
                        description: 'Create and modify resources',
                      },
                      {
                        value: 'scan',
                        label: 'Scan',
                        description: 'Trigger security scans',
                      },
                      {
                        value: 'admin',
                        label: 'Admin',
                        description: 'Full administrative access',
                      },
                    ].map(scope => (
                      <div
                        key={scope.value}
                        className="flex items-center space-x-2 rounded border p-2"
                      >
                        <Checkbox
                          id={scope.value}
                          checked={newKeyData.scopes?.includes(scope.value)}
                          onCheckedChange={checked =>
                            handleScopeChange(scope.value, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={scope.value}
                            className="text-sm font-medium"
                          >
                            {scope.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {scope.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiration (Optional)</Label>
                  <Input
                    id="expiration"
                    type="number"
                    placeholder="Days until expiration (leave empty for no expiration)"
                    value={newKeyData.expires_in_days || ''}
                    onChange={e =>
                      setNewKeyData(prev => ({
                        ...prev,
                        expires_in_days: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createKeyMutation.mutate(newKeyData)}
                  disabled={!newKeyData.name || createKeyMutation.isPending}
                >
                  {createKeyMutation.isPending
                    ? 'Creating...'
                    : 'Create API Key'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Show full key dialog */}
        {showFullKey && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                Save Your API Key
              </span>
            </div>
            <p className="mb-3 text-sm text-yellow-700 dark:text-yellow-300">
              This is the only time you'll see the full API key. Copy it now and
              store it securely.
            </p>
            <div className="flex items-center gap-2 break-all rounded border bg-white p-3 font-mono text-sm dark:bg-gray-800">
              <code className="flex-1">{showFullKey}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(showFullKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="mt-3"
              size="sm"
              onClick={() => setShowFullKey(null)}
            >
              I've saved the key
            </Button>
          </div>
        )}

        {/* API Keys List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 rounded bg-muted"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-6 text-center text-red-600 dark:text-red-400">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
            <p>Failed to load API keys</p>
          </div>
        ) : !apiKeys?.length ? (
          <div className="py-8 text-center text-muted-foreground">
            <Key className="mx-auto mb-2 h-8 w-8" />
            <p>No API keys created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map(key => (
              <div key={key.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{key.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {key.key_prefix}
                      </code>
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(key.key_prefix)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{key.name}"? This
                            action cannot be undone and will immediately revoke
                            access for any applications using this key.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteKeyMutation.mutate(key.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Key
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground md:grid-cols-4">
                  <div>
                    <span className="block font-medium text-foreground">
                      Scopes
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {key.scopes.map(scope => (
                        <Badge
                          key={scope}
                          variant="outline"
                          className="text-xs"
                        >
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">
                      Usage
                    </span>
                    <div className="mt-1 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {key.usage_count.toLocaleString()} calls
                    </div>
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">
                      Last Used
                    </span>
                    <div className="mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {key.last_used_at
                        ? formatDate(key.last_used_at)
                        : 'Never'}
                    </div>
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">
                      Expires
                    </span>
                    <div className="mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {key.expires_at ? formatDate(key.expires_at) : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* API Documentation Link */}
        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="mb-2 font-medium">API Documentation</h4>
          <p className="mb-3 text-sm text-muted-foreground">
            Learn how to use your API keys to integrate with DevSecureX
            services.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                'https://www.npmjs.com/package/@devsecurex/cli?activeTab=readme#authentication-setup',
                '_blank'
              )
            }
          >
            View API Docs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}