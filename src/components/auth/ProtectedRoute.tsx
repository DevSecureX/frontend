import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { isAuthenticated, initialize, isLoading, token } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Initialize auth state on mount
    void initialize()
  }, [initialize])

  // If user has a token but initialization is still loading, show loading state
  if (isLoading && token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Prevent redirect loop - if we're already on the auth page, don't redirect
    if (location.pathname === redirectTo) {
      return <>{children}</>
    }
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Redirect if authentication is not required but user is authenticated
  if (!requireAuth && isAuthenticated) {
    return (
      <Navigate 
        to="/dashboard" 
        replace 
      />
    )
  }

  return <>{children}</>
}

// Convenience component for public routes (redirects authenticated users)
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  )
}

// Convenience component for premium-only routes
export function PremiumRoute({ children }: { children: React.ReactNode }) {
  const { isPremium } = useAuthStore()
  
  return (
    <ProtectedRoute>
      {isPremium() ? (
        children
      ) : (
        <Navigate to="/upgrade" replace />
      )}
    </ProtectedRoute>
  )
}