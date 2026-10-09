import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { toast } from 'sonner'

export function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { handleOAuthCallback } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Pass the search params to the auth store
        handleOAuthCallback(searchParams)
        
        // Check if this is a GitHub connection (not initial login)
        const isGithubConnect = searchParams.get('github_connected') === 'true' || 
                               searchParams.get('is_github_connected') === 'true'
        
        // Check which OAuth provider was used
        const isGitHubCallback = window.location.pathname === '/github-callback' || 
                                 window.location.pathname === '/auth/github/callback'
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          // If GitHub was just connected or this is a GitHub callback, go to repositories page
          // Otherwise go to dashboard
          if (isGithubConnect || isGitHubCallback) {
            navigate('/repositories', { replace: true })
            toast.success('GitHub connected successfully! You can now import repositories.')
          } else {
            navigate('/dashboard', { replace: true })
          }
        }, 100)
      } catch (error) {
        console.error('OAuth callback error:', error)
        toast.error('Authentication failed. Please try again.')
        navigate('/auth', { replace: true })
      }
    }

    handleCallback()
  }, [searchParams, handleOAuthCallback, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-lg font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground text-sm">Please wait while we set up your account.</p>
      </div>
    </div>
  )
}