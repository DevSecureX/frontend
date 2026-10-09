import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import '@/lib/theme' // Initialize theme manager

import { Layout } from '@/components/layout/layout'
import { Dashboard } from '@/pages/dashboard/dashboard'
import { AuthPage } from '@/pages/AuthPage'
import { RepositoriesPage } from '@/pages/RepositoriesPage'
import { ScansPage } from '@/pages/ScansPage'
import { ScanDetailsPage } from '@/pages/scans/scan-details'
import { PullRequestsPage } from '@/pages/PullRequestsPage'
import { BillingPage } from '@/pages/BillingPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { AIAssistantPage } from '@/pages/AIAssistantPage'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { RulesPage } from '@/pages/RulesPage'
import { SupportPage } from '@/pages/support/support'
import { DocumentationPage } from '@/pages/DocumentationPage'
import { DocsLayout } from '@/components/docs/DocsLayout'
import { PlatformOverview } from '@/components/docs/PlatformOverview'
import { QuickStartDevelopers } from '@/components/docs/QuickStartDevelopers'
import { QuickStartCTOs } from '@/components/docs/QuickStartCTOs'
import { QuickStartSecurity } from '@/components/docs/QuickStartSecurity'
import { ApiReference } from '@/components/docs/ApiReference'
import { FeatureDashboard } from '@/components/docs/FeatureDashboard'
import { FeatureRepositories } from '@/components/docs/FeatureRepositories'
import { FeatureScanning } from '@/components/docs/FeatureScanning'
import { FeaturePullRequests } from '@/components/docs/FeaturePullRequests'
import { FeatureAIAssistant } from '@/components/docs/FeatureAIAssistant'
import { GitHubIntegration } from '@/components/docs/GitHubIntegration'
import { SecurityToolsOverview } from '@/components/docs/SecurityToolsOverview'
// CI/CD Integration removed - not actually implemented
import { UseCasesSuccessStories } from '@/components/docs/UseCasesSuccessStories'
import { CLIDocumentation } from '@/components/docs/CLIDocumentation'
import { ProtectedRoute, PublicRoute } from '@/components/auth/ProtectedRoute'
import { NotificationProvider } from '@/components/notifications/NotificationProvider'
import { TimezoneProvider } from '@/contexts/TimezoneContext'
// PWA functionality integrated via Vite PWA plugin
import { ForgotPassword } from '@/pages/auth/forgot-password'
import { ResetPassword } from '@/pages/auth/reset-password'
import { OAuthCallback } from '@/pages/auth/oauth-callback'
import { TermsOfService } from '@/pages/TermsOfService'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: (failureCount, error: unknown) => {
        if ((error as { response?: { status?: number } })?.response?.status === 404) return false
        return failureCount < 2
      },
    },
  },
})

// Custom scroll management component - disabled automatic scrolling to preserve sidebar scroll position
function ScrollManagement() {
  const location = useLocation()

  useEffect(() => {
    // DISABLED: Automatic scroll-to-top was causing sidebar scroll position to be lost
    // The sidebar component now handles its own scroll preservation via sessionStorage
    // Main content scrolling should be handled naturally by React Router
    // No automatic scrolling needed - let content maintain natural scroll position
  }, [location.pathname])

  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TimezoneProvider>
        <NotificationProvider>
          <div className="pwa-ready">
          <BrowserRouter>
          <div className="bg-background font-sans antialiased">
          <ScrollManagement />
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/forgot-password"
              element={
                <PublicRoute>
                  <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
                    <ForgotPassword />
                  </div>
                </PublicRoute>
              }
            />
            <Route
              path="/auth/reset-password"
              element={
                <PublicRoute>
                  <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
                    <ResetPassword />
                  </div>
                </PublicRoute>
              }
            />
            <Route
              path="/auth/callback"
              element={<OAuthCallback />}
            />
            <Route
              path="/github-callback"
              element={<OAuthCallback />}
            />

            {/* Legal Pages */}
            <Route
              path="/terms"
              element={
                <div className="min-h-screen">
                  <TermsOfService />
                </div>
              }
            />
            <Route
              path="/privacy"
              element={
                <div className="min-h-screen">
                  <PrivacyPolicy />
                </div>
              }
            />
            <Route
              path="/google-callback"
              element={<OAuthCallback />}
            />
            <Route
              path="/auth/github/callback"
              element={<OAuthCallback />}
            />
            <Route
              path="/auth/google/callback"
              element={<OAuthCallback />}
            />

            {/* Protected Main App Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route 
                path="repositories" 
                element={<RepositoriesPage />} 
              />
              <Route 
                path="scans" 
                element={<ScansPage />} 
              />
              <Route 
                path="scans/:scanId" 
                element={<ScanDetailsPage />} 
              />
              <Route 
                path="pull-requests" 
                element={<PullRequestsPage />} 
              />
              <Route 
                path="analytics" 
                element={<AnalyticsPage />} 
              />
              <Route 
                path="ai-assistant" 
                element={<AIAssistantPage />} 
              />
              <Route 
                path="admin" 
                element={<AdminDashboard />} 
              />
              <Route
                path="rules"
                element={<RulesPage />} 
              />
              <Route path="docs" element={<DocsLayout />}>
                <Route index element={<DocumentationPage />} />
                <Route path="platform-overview" element={<PlatformOverview />} />
                <Route path="quick-start-developers" element={<QuickStartDevelopers />} />
                <Route path="quick-start-ctos" element={<QuickStartCTOs />} />
                <Route path="quick-start-security" element={<QuickStartSecurity />} />

                {/* Feature Documentation Routes */}
                <Route path="features/dashboard" element={<FeatureDashboard />} />
                <Route path="features/repositories" element={<FeatureRepositories />} />
                <Route path="features/scanning" element={<FeatureScanning />} />
                <Route path="features/pull-requests" element={<FeaturePullRequests />} />
                <Route path="features/ai-assistant" element={<FeatureAIAssistant />} />

                {/* Security Tools Documentation Routes */}
                <Route path="security-tools-overview" element={<SecurityToolsOverview />} />

                {/* CLI Tools Documentation Routes */}
                <Route path="cli" element={<CLIDocumentation />} />

                {/* API Documentation Routes */}
                <Route path="api" element={<ApiReference />} />

                {/* Integration Documentation Routes */}
                <Route path="integrations/github" element={<GitHubIntegration />} />
                {/* CI/CD Integration route removed - feature not implemented */}

                {/* Use Cases & Success Stories Routes */}
                <Route path="use-cases" element={<UseCasesSuccessStories />} />
              </Route>
              <Route 
                path="support" 
                element={<SupportPage />} 
              />
              <Route 
                path="settings" 
                element={<SettingsPage />} 
              />
              <Route 
                path="billing" 
                element={<BillingPage />} 
              />
            </Route>

            {/* Catch all route - redirect based on auth status */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          

            {/* Global Toast Notifications */}
            <Toaster position="top-right" richColors />
          </div>
        </BrowserRouter>
        
        {/* React Query DevTools */}
        <ReactQueryDevtools initialIsOpen={false} />
        </div>
        </NotificationProvider>
      </TimezoneProvider>
    </QueryClientProvider>
  )
}

export default App
