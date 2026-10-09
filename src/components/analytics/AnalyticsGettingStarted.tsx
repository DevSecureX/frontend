import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  GitBranch, 
  Zap, 
  TrendingUp, 
  BookOpen, 
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Play
} from 'lucide-react'

interface AnalyticsGettingStartedProps {
  hasData?: boolean
  onStartScan?: () => void
  onConnectRepo?: () => void
}

export function AnalyticsGettingStarted({ 
  hasData = false, 
  onStartScan, 
  onConnectRepo 
}: AnalyticsGettingStartedProps) {
  if (hasData) return null

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
                Welcome to Security Analytics
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300 text-base">
                Get comprehensive insights into your code security posture
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">Real-time Monitoring</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Live security alerts and updates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Trend Analysis</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">Track security improvements</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">Actionable Insights</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">Prioritized recommendations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Steps */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Getting Started
          </CardTitle>
          <CardDescription>
            Follow these steps to start monitoring your security analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Connect Your Repositories
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Start by connecting your GitHub repositories to enable security scanning and analytics.
                </p>
                <Button 
                  onClick={onConnectRepo}
                  size="sm" 
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <GitBranch className="h-4 w-4" />
                  Connect Repository
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Run Your First Security Scan
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Execute a comprehensive security scan to identify vulnerabilities and generate your first analytics data.
                </p>
                <Button 
                  onClick={onStartScan}
                  size="sm" 
                  variant="outline"
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Security Scan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Explore Analytics Dashboard
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Once you have scan data, explore the comprehensive analytics to understand your security posture.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Real-time metrics</Badge>
                  <Badge variant="outline" className="text-xs">Trend analysis</Badge>
                  <Badge variant="outline" className="text-xs">Repository insights</Badge>
                  <Badge variant="outline" className="text-xs">Security scoring</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Documentation
            </CardTitle>
            <CardDescription>
              Learn more about security analytics and best practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a 
                href="#" 
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <span className="text-sm font-medium">Security Metrics Guide</span>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <span className="text-sm font-medium">Analytics API Reference</span>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks to get you started quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={onConnectRepo}
              >
                <GitBranch className="h-4 w-4" />
                Connect GitHub Repository
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={onStartScan}
              >
                <Shield className="h-4 w-4" />
                Run Security Scan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}