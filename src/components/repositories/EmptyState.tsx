import { GitBranch, Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  hasRepositories: boolean
  hasFilters: boolean
  onConnectRepo: () => void
  onClearFilters: () => void
}

export function EmptyState({ 
  hasRepositories, 
  hasFilters, 
  onConnectRepo, 
  onClearFilters 
}: EmptyStateProps) {
  if (!hasRepositories) {
    // No repositories connected at all
    return (
      <Card className="border-dashed border-2 border-blue-200 dark:border-blue-700/50 bg-white dark:bg-gray-900 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <div className="mb-8">
            <div className="rounded-full bg-blue-600 p-6 shadow-lg">
              <GitBranch className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">No Repositories Connected</h3>
          <p className="text-lg text-muted-foreground text-center max-w-xl mb-10 leading-relaxed">
            Connect your first repository to start securing your code with automated vulnerability scanning, AI-powered security insights, and comprehensive threat detection.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Button onClick={onConnectRepo} size="lg" className="gap-3 h-14 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg hover:scale-105 hover:-translate-y-1 active:scale-100 active:translate-y-0">
              <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
              Connect Your First Repository
            </Button>
            
            <div className="text-base text-muted-foreground text-center">
              or{' '}
              <a 
                href="/docs/getting-started" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200"
              >
                learn more about repository scanning
              </a>
            </div>
          </div>

          {/* Enhanced Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl">
            <div className="text-center group">
              <div className="mb-4">
                <div className="rounded-2xl bg-green-500 p-4 w-fit mx-auto shadow-lg">
                  <Search className="h-8 w-8 text-white" />
                </div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">AI-Powered Scanning</h4>
              <p className="text-base text-muted-foreground leading-relaxed">
                Advanced security monitoring with machine learning-driven vulnerability detection on every commit
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mb-4">
                <div className="rounded-2xl bg-purple-500 p-4 w-fit mx-auto shadow-lg">
                  <GitBranch className="h-8 w-8 text-white" />
                </div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Multi-Branch Support</h4>
              <p className="text-base text-muted-foreground leading-relaxed">
                Comprehensive scanning across multiple branches, pull requests, and deployment environments
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mb-4">
                <div className="rounded-2xl bg-orange-500 p-4 w-fit mx-auto shadow-lg">
                  <Filter className="h-8 w-8 text-white" />
                </div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Smart Filtering</h4>
              <p className="text-base text-muted-foreground leading-relaxed">
                Intelligent organization by language, framework, risk level, and custom security profiles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasFilters) {
    // Has repositories but filters are hiding them
    return (
      <Card className="border-dashed border-2 border-amber-200 dark:border-amber-700/50 bg-white dark:bg-gray-900 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-8">
            <div className="rounded-full bg-amber-500 p-5 shadow-lg">
              <Search className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">No Matching Repositories</h3>
          <p className="text-lg text-muted-foreground text-center max-w-lg mb-8 leading-relaxed">
            Your search filters didn't match any repositories. Try adjusting your criteria or clearing filters to see more results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={onClearFilters} variant="outline" size="lg" className="gap-2 h-12 px-6">
              Clear Filters
            </Button>
            <Button onClick={onConnectRepo} size="lg" className="gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-5 w-5" />
              Connect New Repository
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // This shouldn't happen, but just in case
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4 mb-6">
          <GitBranch className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          We couldn't load your repositories. Please try refreshing the page.
        </p>
        
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </CardContent>
    </Card>
  )
}