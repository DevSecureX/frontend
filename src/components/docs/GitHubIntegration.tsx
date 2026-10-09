import { 
  Github, 
  Key, 
  Webhook, 
  Shield, 
  Settings, 
  GitPullRequest, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Clock, 
  Users, 
  Code, 
  Zap, 
  Target, 
  ArrowRight, 
  BookOpen, 
  Link as LinkIcon, 
  Eye, 
  Bell, 
  Lock, 
  GitBranch, 
  FileText, 
  Activity, 
  RefreshCw,
  Download,
  Upload,
  Globe,
  Smartphone
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link } from 'react-router-dom'

const integrationSteps = [
  {
    step: 1,
    title: "OAuth Authentication",
    description: "Securely connect your GitHub account with DevSecureX",
    icon: Key,
    details: [
      "Navigate to Repository Management",
      "Click 'Connect GitHub Account'",
      "Authorize DevSecureX application",
      "Grant necessary repository permissions"
    ],
    permissions: [
      "Read repository metadata",
      "Read repository contents",
      "Write pull request comments",
      "Create and manage webhooks"
    ],
    timeRequired: "2 minutes"
  },
  {
    step: 2,
    title: "Repository Selection",
    description: "Choose repositories for security monitoring",
    icon: Github,
    details: [
      "Browse available repositories",
      "Use search and filters to find repos",
      "Select repositories to monitor",
      "Configure repository-specific settings"
    ],
    permissions: [
      "Repository access validation",
      "Branch discovery",
      "File system scanning",
      "Collaboration features"
    ],
    timeRequired: "3-5 minutes"
  },
  {
    step: 3,
    title: "Webhook Configuration",
    description: "Automatic webhook setup for real-time monitoring",
    icon: Webhook,
    details: [
      "Automatic webhook installation",
      "Event subscription configuration",
      "Webhook security validation",
      "Real-time connection testing"
    ],
    permissions: [
      "Webhook creation and management",
      "Event payload delivery",
      "Status update posting",
      "Real-time notifications"
    ],
    timeRequired: "1 minute (automatic)"
  },
  {
    step: 4,
    title: "Security Configuration",
    description: "Setup security scanning and review preferences",
    icon: Shield,
    details: [
      "Select security tools and rules",
      "Configure scan triggers",
      "Set blocking policies",
      "Enable PR security reviews"
    ],
    permissions: [
      "Security policy enforcement",
      "Pull request status checks",
      "Branch protection integration",
      "Security comment posting"
    ],
    timeRequired: "5-10 minutes"
  }
]

const webhookEvents = [
  {
    event: "Push Events",
    description: "Triggered when code is pushed to any branch",
    triggers: ["Security scans", "Vulnerability analysis", "Real-time monitoring"],
    payload: "Repository, commits, changed files, author information"
  },
  {
    event: "Pull Request Events",
    description: "Triggered on PR creation, updates, and merges",
    triggers: ["PR security reviews", "Automated analysis", "Status checks"],
    payload: "PR details, diff information, branch data, reviewer info"
  },
  {
    event: "Release Events",
    description: "Triggered when releases are created or published",
    triggers: ["Release security validation", "Compliance checks", "Audit logging"],
    payload: "Release details, tag information, assets, change logs"
  },
  {
    event: "Branch Events",
    description: "Triggered on branch creation, deletion, and protection changes",
    triggers: ["Branch policy updates", "Security configuration", "Access control"],
    payload: "Branch details, protection rules, policy changes"
  }
]

const securityFeatures = [
  {
    feature: "Branch Protection Integration",
    description: "Integrate security checks into GitHub's branch protection rules",
    icon: Lock,
    capabilities: [
      "Required security status checks",
      "Merge blocking on vulnerabilities",
      "Review requirement enforcement",
      "Administrative override controls"
    ],
    setup: [
      "Enable branch protection in GitHub",
      "Add 'DevSecureX Security' as required check",
      "Configure vulnerability thresholds",
      "Set override permissions"
    ]
  },
  {
    feature: "Status Check Integration",
    description: "Real-time security status updates on commits and PRs",
    icon: CheckCircle,
    capabilities: [
      "Commit-level security status",
      "PR security validation",
      "Real-time update delivery",
      "Detailed status descriptions"
    ],
    setup: [
      "Automatic status check registration",
      "Configure check parameters",
      "Set status update preferences",
      "Test status delivery"
    ]
  },
  {
    feature: "Security Comment Automation",
    description: "Automated security comments on pull requests",
    icon: FileText,
    capabilities: [
      "Inline vulnerability annotations",
      "Remediation suggestions",
      "Educational security content",
      "Collaborative discussion threads"
    ],
    setup: [
      "Enable PR comment automation",
      "Configure comment templates",
      "Set comment triggers",
      "Customize content preferences"
    ]
  },
  {
    feature: "Webhook Integration",
    description: "Real-time security monitoring via GitHub webhooks",
    icon: Zap,
    capabilities: [
      "Real-time push event handling",
      "Pull request monitoring",
      "Automatic scan triggering",
      "Status update delivery"
    ],
    setup: [
      "Automatic webhook installation",
      "Configure event subscriptions",
      "Set up security preferences",
      "Test webhook delivery"
    ]
  }
]

// GitHub Actions integration removed - not currently implemented
// DevSecureX uses webhooks for real-time monitoring instead

const troubleshooting = [
  {
    issue: "OAuth Connection Failed",
    symptoms: ["Authorization redirects fail", "Permission errors", "Connection timeouts"],
    solutions: [
      "Clear browser cache and cookies",
      "Disable browser extensions temporarily",
      "Check organization OAuth policies",
      "Verify GitHub API status",
      "Contact support with error logs"
    ]
  },
  {
    issue: "Webhook Delivery Issues",
    symptoms: ["Missing scan triggers", "Delayed notifications", "Webhook timeouts"],
    solutions: [
      "Check webhook configuration in GitHub",
      "Verify webhook URL accessibility",
      "Review webhook payload logs",
      "Test webhook delivery manually",
      "Recreate webhooks if necessary"
    ]
  },
  {
    issue: "Permission Denied Errors",
    symptoms: ["Repository access denied", "Cannot create PRs", "Status check failures"],
    solutions: [
      "Verify repository permissions",
      "Check organization restrictions",
      "Re-authorize GitHub application",
      "Review admin settings",
      "Contact repository administrators"
    ]
  },
  {
    issue: "Status Check Not Required",
    symptoms: ["PRs merge without security checks", "Branch protection not enforced"],
    solutions: [
      "Add DevSecureX check to branch protection",
      "Verify check name configuration",
      "Update branch protection rules",
      "Test with new pull request",
      "Contact GitHub support if needed"
    ]
  }
]

const bestPractices = [
  {
    category: "Security Configuration",
    practices: [
      "Enable branch protection on main/master branches",
      "Require security status checks before merging",
      "Set appropriate vulnerability thresholds",
      "Configure emergency override procedures",
      "Regularly review and update policies"
    ]
  },
  {
    category: "Team Collaboration",
    practices: [
      "Train team members on security review process",
      "Establish clear escalation procedures",
      "Document organization-specific security policies",
      "Encourage security-focused code reviews",
      "Share security learnings across teams"
    ]
  },
  {
    category: "Workflow Optimization",
    practices: [
      "Use incremental scans for faster feedback",
      "Configure appropriate scan triggers",
      "Optimize repository file filtering",
      "Leverage GitHub Actions for automation",
      "Monitor scan performance and adjust settings"
    ]
  },
  {
    category: "Compliance & Governance",
    practices: [
      "Maintain audit logs of security decisions",
      "Document security policy exceptions",
      "Regular compliance reviews and updates",
      "Track security metrics and improvements",
      "Ensure proper access control management"
    ]
  }
]

export function GitHubIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-gray-800/10 to-gray-900/10 rounded-2xl border border-gray-700/20">
            <Github className="h-12 w-12 text-gray-800 dark:text-gray-200" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          GitHub Integration Guide
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete guide to integrating DevSecureX with GitHub. Set up automated security scanning, 
          pull request reviews, and seamless workflow integration in minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="/repositories">
              <Github className="h-4 w-4 mr-2" />
              Connect GitHub
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/features/repositories">
              <BookOpen className="h-4 w-4 mr-2" />
              Repository Management
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Start Alert */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>Quick Setup Time</AlertTitle>
        <AlertDescription>
          Complete GitHub integration typically takes 5-10 minutes. Most of the process is automated, 
          requiring minimal manual configuration.
        </AlertDescription>
      </Alert>

      {/* Integration Steps */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Step-by-Step Integration</h2>
          <p className="text-muted-foreground text-lg">
            Follow these steps to connect your GitHub repositories with DevSecureX
          </p>
        </div>

        <div className="space-y-8">
          {integrationSteps.map((step, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">STEP</span>
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <step.icon className="h-6 w-6 text-blue-500" />
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {step.timeRequired}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Setup Steps</h4>
                        <ol className="space-y-1">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-xs font-medium text-blue-500 mt-0.5">{idx + 1}.</span>
                              <span className="text-sm">{detail}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Required Permissions</h4>
                        <ul className="space-y-1">
                          {step.permissions.map((permission, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-sm">{permission}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Webhook Configuration */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Webhook Integration</h2>
          <p className="text-muted-foreground text-lg">
            Automated webhook setup enables real-time security monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {webhookEvents.map((webhook, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Webhook className="h-5 w-5 text-orange-500" />
                  <span>{webhook.event}</span>
                </CardTitle>
                <CardDescription>{webhook.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Triggers</h4>
                  <ul className="space-y-1">
                    {webhook.triggers.map((trigger, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm">{trigger}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <h5 className="font-medium text-xs text-muted-foreground mb-1">PAYLOAD DATA</h5>
                  <p className="text-sm text-muted-foreground">{webhook.payload}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Features */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Advanced Security Features</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive security integration with GitHub's native features
          </p>
        </div>

        <div className="space-y-6">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{feature.feature}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Capabilities</h4>
                        <ul className="space-y-1">
                          {feature.capabilities.map((capability, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-sm">{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Setup Instructions</h4>
                        <ol className="space-y-1">
                          {feature.setup.map((step, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-xs font-medium text-blue-500 mt-0.5">{idx + 1}.</span>
                              <span className="text-sm">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Webhook Real-time Monitoring */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Real-time Security Monitoring</h2>
          <p className="text-muted-foreground text-lg">
            DevSecureX monitors your repositories in real-time through GitHub webhooks
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Webhook className="h-5 w-5 text-orange-500" />
              <span>Automatic Webhook Configuration</span>
            </CardTitle>
            <CardDescription>
              DevSecureX automatically configures webhooks when you connect a repository
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Automated Setup</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Webhook automatically installed</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Event subscriptions configured</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Security validation enabled</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Real-time monitoring active</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Monitored Events</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <GitBranch className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Push events</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <GitPullRequest className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Pull request events</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Security scanning triggered</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Status updates posted</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Troubleshooting */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Troubleshooting Guide</h2>
          <p className="text-muted-foreground text-lg">
            Common issues and solutions for GitHub integration
          </p>
        </div>

        <div className="space-y-6">
          {troubleshooting.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>{item.issue}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Common Symptoms</h4>
                  <ul className="space-y-1">
                    {item.symptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                        <span className="text-sm">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Solutions</h4>
                  <ol className="space-y-1">
                    {item.solutions.map((solution, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-xs font-medium text-green-500 mt-0.5">{idx + 1}.</span>
                        <span className="text-sm">{solution}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Best Practices</h2>
          <p className="text-muted-foreground text-lg">
            Optimize your GitHub integration for maximum security and efficiency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bestPractices.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span>{category.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.practices.map((practice, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{practice}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-gray-500/5 to-gray-600/5 rounded-2xl p-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-gray-500/10 rounded-xl">
              <Target className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Ready to Connect GitHub?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start securing your GitHub repositories today. Complete the integration in minutes 
            and begin automated security monitoring for all your projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/repositories">
                <Github className="h-4 w-4 mr-2" />
                Start Integration
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/docs/security-tools-overview">
                <ArrowRight className="h-4 w-4 mr-2" />
                Security Tools
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}