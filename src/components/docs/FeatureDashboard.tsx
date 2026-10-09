import { 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  Eye, 
  Settings, 
  RefreshCw,
  Clock,
  Target,
  Zap,
  GitPullRequest,
  Users,
  Calendar,
  Download,
  Filter,
  Search,
  Play,
  ArrowRight,
  Monitor,
  Gauge,
  LineChart,
  PieChart,
  Bell
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'

const dashboardFeatures = [
  {
    icon: Monitor,
    title: "Security Overview",
    description: "Get a comprehensive view of your security posture across all repositories",
    features: [
      "Real-time security metrics",
      "Vulnerability trend analysis",
      "Risk score calculation",
      "Compliance status overview"
    ]
  },
  {
    icon: Gauge,
    title: "Performance Metrics",
    description: "Track security performance and improvement over time",
    features: [
      "Scan completion rates",
      "Issue resolution times",
      "Security debt tracking",
      "Team productivity metrics"
    ]
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Intelligent notifications for critical security events",
    features: [
      "Critical vulnerability alerts",
      "Scan failure notifications",
      "Custom alert rules",
      "Multi-channel delivery"
    ]
  },
  {
    icon: LineChart,
    title: "Trend Analysis",
    description: "Understand security trends and patterns across your codebase",
    features: [
      "Historical vulnerability data",
      "Security improvement tracking",
      "Comparative analysis",
      "Predictive insights"
    ]
  }
]

const widgets = [
  {
    name: "Security Score",
    description: "Overall security rating for your organization",
    icon: Shield,
    color: "bg-green-500",
    features: [
      "Weighted vulnerability scoring",
      "Repository-level breakdowns",
      "Historical trends",
      "Benchmark comparisons"
    ]
  },
  {
    name: "Active Vulnerabilities",
    description: "Current open security issues requiring attention",
    icon: AlertTriangle,
    color: "bg-red-500",
    features: [
      "Severity categorization",
      "Age tracking",
      "Assignment status",
      "Remediation estimates"
    ]
  },
  {
    name: "Scan Activity",
    description: "Recent security scanning activity and results",
    icon: Activity,
    color: "bg-blue-500",
    features: [
      "Scan queue status",
      "Completion rates",
      "Tool performance",
      "Error reporting"
    ]
  },
  {
    name: "Repository Health",
    description: "Security health status across all connected repositories",
    icon: CheckCircle,
    color: "bg-emerald-500",
    features: [
      "Repository rankings",
      "Coverage analysis",
      "Health scores",
      "Improvement recommendations"
    ]
  },
  {
    name: "Pull Request Reviews",
    description: "Automated security review status for PRs",
    icon: GitPullRequest,
    color: "bg-purple-500",
    features: [
      "Review completion rates",
      "Blocking status",
      "Review quality metrics",
      "Developer adoption"
    ]
  },
  {
    name: "Team Performance",
    description: "Security-focused team productivity metrics",
    icon: Users,
    color: "bg-orange-500",
    features: [
      "Issue resolution rates",
      "Response times",
      "Knowledge sharing",
      "Training progress"
    ]
  }
]

const realTimeFeatures = [
  {
    title: "Live Scan Updates",
    description: "Watch security scans progress in real-time with detailed status updates",
    icon: RefreshCw,
    capabilities: [
      "Real-time scan progress tracking",
      "Live tool execution status",
      "Immediate result notifications",
      "Queue position updates"
    ]
  },
  {
    title: "Instant Notifications",
    description: "Get notified immediately when security events occur",
    icon: Bell,
    capabilities: [
      "Critical vulnerability alerts",
      "Scan completion notifications",
      "PR review status updates",
      "System health alerts"
    ]
  },
  {
    title: "Dynamic Metrics",
    description: "All dashboard metrics update automatically as new data arrives",
    icon: TrendingUp,
    capabilities: [
      "Auto-refreshing charts",
      "Real-time counter updates",
      "Live trend calculations",
      "Instant data synchronization"
    ]
  },
  {
    title: "Collaborative Updates",
    description: "See team activity and collaboration in real-time",
    icon: Users,
    capabilities: [
      "Live user activity feeds",
      "Real-time comment updates",
      "Instant assignment notifications",
      "Collaborative workspaces"
    ]
  }
]

const customizationOptions = [
  {
    category: "Widget Layout",
    options: [
      "Drag-and-drop widget arrangement",
      "Resizable widget panels",
      "Show/hide widget controls",
      "Custom widget sizing"
    ]
  },
  {
    category: "Data Filters",
    options: [
      "Repository-specific views",
      "Time range selection",
      "Severity level filtering",
      "Team/user filtering"
    ]
  },
  {
    category: "Visual Preferences",
    options: [
      "Dark/light theme toggle",
      "Chart type selection",
      "Color scheme customization",
      "Density controls"
    ]
  },
  {
    category: "Notifications",
    options: [
      "Alert threshold configuration",
      "Notification frequency settings",
      "Channel preferences",
      "Smart grouping rules"
    ]
  }
]

export function FeatureDashboard() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
            <BarChart3 className="h-12 w-12 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Security Dashboard
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your security command center. Monitor vulnerabilities, track security metrics, and get real-time insights 
          into your organization's security posture with our comprehensive dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="/dashboard">
              <Monitor className="h-4 w-4 mr-2" />
              View Live Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/quick-start-developers">
              <Play className="h-4 w-4 mr-2" />
              Quick Start Guide
            </Link>
          </Button>
        </div>
      </div>

      {/* Core Features */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Dashboard Features</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to monitor and improve your security posture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardFeatures.map((feature, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Dashboard Widgets</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive widgets providing detailed insights into your security landscape
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${widget.color} rounded-lg flex items-center justify-center`}>
                    <widget.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{widget.name}</CardTitle>
                    <CardDescription className="text-sm">{widget.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1">
                  {widget.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Real-time Features */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Real-time Updates</h2>
          <p className="text-muted-foreground text-lg">
            Stay informed with live updates and real-time security monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {realTimeFeatures.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.capabilities.map((capability, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                      <span className="text-sm">{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customization Options */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Customization & Personalization</h2>
          <p className="text-muted-foreground text-lg">
            Tailor your dashboard to match your team's workflow and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customizationOptions.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  <span>{section.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.options.map((option, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">{option}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl p-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Target className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Ready to Explore Your Dashboard?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start monitoring your security posture today. Connect your repositories and get instant insights 
            into your code security with our comprehensive dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/dashboard">
                <Eye className="h-4 w-4 mr-2" />
                View Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/docs/features/repositories">
                <ArrowRight className="h-4 w-4 mr-2" />
                Connect Repositories
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}