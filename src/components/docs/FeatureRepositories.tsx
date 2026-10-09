import { 
  Github, 
  GitBranch, 
  Settings, 
  Link as LinkIcon, 
  Shield, 
  Eye, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Zap, 
  RefreshCw, 
  Key, 
  Webhook, 
  PlayCircle, 
  Target, 
  ArrowRight,
  BookOpen,
  Globe,
  Lock,
  Smartphone,
  Monitor
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'

const repositoryFeatures = [
  {
    icon: Github,
    title: "GitHub Integration",
    description: "Seamless integration with GitHub repositories and organizations",
    features: [
      "OAuth-based secure authentication",
      "Organization and team access",
      "Repository discovery and selection",
      "Automatic webhook configuration"
    ]
  },
  {
    icon: GitBranch,
    title: "Branch Management",
    description: "Advanced branch protection and monitoring capabilities",
    features: [
      "Branch-specific security policies",
      "Protected branch enforcement",
      "Multi-branch scanning",
      "Branch comparison and analysis"
    ]
  },
  {
    icon: Settings,
    title: "Configuration Management",
    description: "Flexible repository-level configuration and customization",
    features: [
      "Custom scan configurations",
      "Tool selection and settings",
      "Notification preferences",
      "Access control and permissions"
    ]
  },
  {
    icon: Monitor,
    title: "Repository Health",
    description: "Comprehensive health monitoring and analytics",
    features: [
      "Security health scores",
      "Coverage analysis",
      "Performance metrics",
      "Historical trends"
    ]
  }
]

const connectionSteps = [
  {
    step: 1,
    title: "Authenticate with GitHub",
    description: "Connect your GitHub account using secure OAuth authentication",
    icon: Key,
    details: [
      "Click 'Connect Repository' from your dashboard",
      "Authorize DevSecureX to access your GitHub account",
      "Grant necessary permissions for repository access",
      "Choose organization or personal repositories"
    ]
  },
  {
    step: 2,
    title: "Select Repositories",
    description: "Choose which repositories you want to secure and monitor",
    icon: Eye,
    details: [
      "Browse available repositories and organizations",
      "Use search and filter options to find specific repos",
      "Select multiple repositories for bulk operations",
      "Preview repository details before connecting"
    ]
  },
  {
    step: 3,
    title: "Configure Security Settings",
    description: "Set up security scanning preferences for each repository",
    icon: Shield,
    details: [
      "Choose security tools and scan configurations",
      "Set up branch protection rules",
      "Configure notification preferences",
      "Enable automated PR security reviews"
    ]
  },
  {
    step: 4,
    title: "Start Monitoring",
    description: "Begin continuous security monitoring and scanning",
    icon: PlayCircle,
    details: [
      "Automatic webhook installation",
      "Initial baseline security scan",
      "Real-time monitoring activation",
      "Dashboard and analytics setup"
    ]
  }
]

const configurationOptions = [
  {
    category: "Scan Configuration",
    icon: Settings,
    options: [
      {
        name: "Tool Selection",
        description: "Choose from 20+ security tools based on your technology stack"
      },
      {
        name: "Scan Triggers",
        description: "Configure when scans run (push, PR, scheduled, manual)"
      },
      {
        name: "Scan Scope",
        description: "Define which files and directories to include or exclude"
      },
      {
        name: "Performance Settings",
        description: "Optimize scan performance with timeout and resource limits"
      }
    ]
  },
  {
    category: "Security Policies",
    icon: Shield,
    options: [
      {
        name: "Vulnerability Thresholds",
        description: "Set severity thresholds for blocking PRs and deployments"
      },
      {
        name: "Branch Protection",
        description: "Enforce security checks before merging code"
      },
      {
        name: "Compliance Requirements",
        description: "Map to compliance frameworks (OWASP, PCI DSS, SOC 2)"
      },
      {
        name: "Custom Rules",
        description: "Apply organization-specific security rules and patterns"
      }
    ]
  },
  {
    category: "Notifications",
    icon: Webhook,
    options: [
      {
        name: "Alert Channels",
        description: "Configure Slack, Teams, email, and webhook notifications"
      },
      {
        name: "Escalation Rules",
        description: "Set up automatic escalation for critical vulnerabilities"
      },
      {
        name: "Digest Reports",
        description: "Receive daily, weekly, or monthly security summaries"
      },
      {
        name: "Team Assignments",
        description: "Automatically assign security issues to team members"
      }
    ]
  }
]

const branchManagement = [
  {
    title: "Protected Branches",
    description: "Enforce security checks before code merges",
    icon: Lock,
    capabilities: [
      "Require security scans to pass before merging",
      "Block PRs with high-severity vulnerabilities",
      "Enforce code review requirements",
      "Prevent direct pushes to protected branches"
    ]
  },
  {
    title: "Multi-Branch Scanning",
    description: "Scan multiple branches simultaneously for comprehensive coverage",
    icon: GitBranch,
    capabilities: [
      "Scan all active development branches",
      "Compare security posture across branches",
      "Track security improvements over time",
      "Identify branch-specific vulnerabilities"
    ]
  },
  {
    title: "Branch Analytics",
    description: "Understand security trends and patterns across branches",
    icon: BarChart3,
    capabilities: [
      "Branch-level security metrics",
      "Vulnerability introduction tracking",
      "Developer impact analysis",
      "Branch merge risk assessment"
    ]
  },
  {
    title: "Automated Workflows",
    description: "Streamline security processes with automated branch workflows",
    icon: Zap,
    capabilities: [
      "Automatic security scans on branch creation",
      "Scheduled security audits",
      "Automated vulnerability reporting",
      "Real-time webhook monitoring"
    ]
  }
]

const healthMetrics = [
  {
    metric: "Security Score",
    description: "Overall security rating based on vulnerability analysis",
    calculation: "Weighted score considering severity, age, and coverage",
    benchmark: "Industry and peer comparisons available"
  },
  {
    metric: "Coverage Rate",
    description: "Percentage of code covered by security scanning tools",
    calculation: "Lines scanned / Total lines of code",
    benchmark: "Target: 95%+ coverage for production repositories"
  },
  {
    metric: "Vulnerability Density",
    description: "Number of vulnerabilities per thousand lines of code",
    calculation: "Total vulnerabilities / (LOC / 1000)",
    benchmark: "Industry average: 5-10 vulnerabilities per KLOC"
  },
  {
    metric: "Resolution Time",
    description: "Average time to resolve security vulnerabilities",
    calculation: "Sum of resolution times / Number of resolved issues",
    benchmark: "Target: <7 days for critical, <30 days for high"
  }
]

export function FeatureRepositories() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
            <Github className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Repository Management
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect, configure, and manage your GitHub repositories with advanced security monitoring. 
          Set up comprehensive security scanning and monitoring for your entire codebase.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="/repositories">
              <Plus className="h-4 w-4 mr-2" />
              Connect Repository
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/integrations/github">
              <BookOpen className="h-4 w-4 mr-2" />
              Integration Guide
            </Link>
          </Button>
        </div>
      </div>

      {/* Core Features */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Repository Features</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive repository management with enterprise-grade security controls
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {repositoryFeatures.map((feature, index) => (
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
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Connection Process */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Connect Your Repositories</h2>
          <p className="text-muted-foreground text-lg">
            Get started in minutes with our streamlined repository connection process
          </p>
        </div>

        <div className="space-y-8">
          {connectionSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-sm">STEP</span>
                  <span className="text-white font-bold text-lg">{step.step}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <step.icon className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Options */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Repository Configuration</h2>
          <p className="text-muted-foreground text-lg">
            Customize security settings and policies for each repository
          </p>
        </div>

        <div className="space-y-8">
          {configurationOptions.map((section, index) => (
            <div key={index}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">{section.category}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.options.map((option, idx) => (
                  <Card key={idx} className="border hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-2">{option.name}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Management */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Advanced Branch Management</h2>
          <p className="text-muted-foreground text-lg">
            Protect your codebase with intelligent branch-level security controls
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branchManagement.map((feature, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.capabilities.map((capability, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{capability}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Health Metrics */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Repository Health Metrics</h2>
          <p className="text-muted-foreground text-lg">
            Track and measure security health across all your repositories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span>{metric.metric}</span>
                </CardTitle>
                <CardDescription>{metric.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">Calculation Method</h4>
                  <p className="text-sm text-muted-foreground">{metric.calculation}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Benchmark</h4>
                  <p className="text-sm text-muted-foreground">{metric.benchmark}</p>
                </div>
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
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Ready to Connect Your Repositories?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start securing your codebase today. Connect your GitHub repositories and begin 
            continuous security monitoring with just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/repositories">
                <Github className="h-4 w-4 mr-2" />
                Connect Repositories
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/docs/features/scanning">
                <ArrowRight className="h-4 w-4 mr-2" />
                Learn About Scanning
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}