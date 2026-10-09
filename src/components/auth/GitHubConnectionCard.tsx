import { useState } from 'react'
import { Github, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store'
import { toast } from 'sonner'

export function GitHubConnectionCard() {
  const { user, connectGithub } = useAuthStore()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnectGitHub = async () => {
    try {
      setIsConnecting(true)
      const authUrl = await connectGithub()
      // Redirect to GitHub OAuth
      window.location.href = authUrl
    } catch (error: any) {
      console.error('Failed to connect GitHub:', error)
      toast.error('Failed to initiate GitHub connection')
      setIsConnecting(false)
    }
  }

  if (!user) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              user.is_github_connected 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-orange-100 dark:bg-orange-900/20'
            }`}>
              <Github className={`h-5 w-5 ${
                user.is_github_connected 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`} />
            </div>
            <div>
              <CardTitle className="text-base">GitHub Integration</CardTitle>
              <CardDescription className="text-sm">
                {user.is_github_connected 
                  ? 'Your GitHub account is connected' 
                  : 'Connect GitHub to enable repository scanning'
                }
              </CardDescription>
            </div>
          </div>
          
          <Badge 
            variant={user.is_github_connected ? 'default' : 'secondary'}
            className="gap-1"
          >
            {user.is_github_connected ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Not Connected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {user.is_github_connected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600 dark:text-green-400">Active</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Connected as</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="pt-2 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                onClick={() => window.location.href = '/repositories'}
              >
                <Github className="h-4 w-4" />
                View Repositories
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-2"
                asChild
              >
                <a 
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Profile
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Import and scan repositories
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Automate PR security reviews
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Set up webhook integrations
              </li>
            </ul>
            <Button 
              onClick={() => { void handleConnectGitHub() }}
              disabled={isConnecting}
              className="w-full gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="h-4 w-4" />
                  Connect GitHub Account
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}