import { 
  CheckCircle, 
  Clock, 
  Github, 
  Shield, 
  Play,
  Code,
  Settings,
  ArrowRight,
  Copy,
  Eye,
  BookOpen,
  AlertCircle,
  Terminal
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { config } from '@/lib/config/env'

const quickSteps = [
  {
    step: 1,
    title: "Create Your Account",
    description: "Sign up with GitHub or create a new account",
    timeEstimate: "1 minute",
    action: "Sign Up",
    status: "completed" // This will be dynamic in real implementation
  },
  {
    step: 2,
    title: "Connect Your Repository",
    description: "Add repositories via GitHub webhooks for automated scanning",
    timeEstimate: "2 minutes",
    action: "Connect Repos",
    status: "current"
  },
  {
    step: 3,
    title: "Configure Security Scanning",
    description: "Set up webhook triggers and choose security tools",
    timeEstimate: "2 minutes",
    action: "Configure Scanning",
    status: "pending"
  },
  {
    step: 4,
    title: "Review Security Results",
    description: "Monitor your dashboard and analyze security findings",
    timeEstimate: "5 minutes",
    action: "View Dashboard",
    status: "pending"
  }
]

const codeExamples = [
  {
    title: "GitHub Webhook Integration",
    description: "Set up webhook URL for automated repository scanning",
    language: "json",
    filename: "Webhook Configuration",
    code: `{
  "webhook_url": "${config.api.baseUrl}/webhooks/github",
  "events": [
    "push",
    "pull_request"
  ],
  "content_type": "application/json",
  "secret": "your-webhook-secret"
}`
  }
  
  // Future features - not yet implemented:
  
  // GitHub Actions Integration - Coming Soon
  // {
  //   title: "GitHub Actions Integration",
  //   description: "Add this workflow to automatically scan pull requests",
  //   language: "yaml",
  //   filename: ".github/workflows/devsecurex.yml",
  //   code: `name: DevSecureX Security Scan
  //   ...`
  // },
  
  // CLI Installation - Coming Soon  
  // {
  //   title: "CLI Installation",
  //   description: "Install the DevSecureX CLI for local development",
  //   language: "bash",
  //   filename: "Terminal",
  //   code: `# Install DevSecureX CLI
  //   npm install -g @devsecurex/cli
  //   ...`
  // }
]

const preRequisites = [
  {
    title: "GitHub Account",
    description: "You'll need a GitHub account to connect repositories",
    required: true,
    hasAccess: true
  },
  {
    title: "Repository Access",
    description: "Admin or write access to repositories you want to scan",
    required: true,
    hasAccess: false
  },
  {
    title: "Modern Browser",
    description: "Chrome, Firefox, Safari, or Edge (latest versions)",
    required: true,
    hasAccess: true
  }
]

const nextSteps = [
  {
    icon: Settings,
    title: "Configure Scan Settings",
    description: "Customize which security tools to run and set up notifications",
    href: "/docs/features/scanning" // Updated to working route
  },
  {
    icon: Github,
    title: "Connect More Repositories",
    description: "Add additional repositories to expand your security coverage",
    href: "/dashboard/repositories" // Updated to working route
  },
  {
    icon: Eye,
    title: "Explore Security Dashboard",
    description: "Monitor your security posture and track improvements",
    href: "/docs/features/dashboard" // Updated to working route
  },
  {
    icon: BookOpen,
    title: "Learn Security Best Practices",
    description: "Discover industry-standard security guidelines and tips",
    href: "/docs/security-tools-overview" // Updated to working route
  }
  
  // Future features - coming soon:
  // {
  //   icon: GitPullRequest,
  //   title: "Enable PR Reviews",
  //   description: "Automatically scan every pull request for security issues",
  //   href: "/docs/features/pull-requests"
  // },
  // {
  //   icon: Bell,
  //   title: "Set Up Notifications", 
  //   description: "Get alerts when critical vulnerabilities are found",
  //   href: "/docs/integrations/notifications"
  // },
  // {
  //   icon: Zap,
  //   title: "Try AI Assistant",
  //   description: "Get intelligent security recommendations and guidance", 
  //   href: "/docs/features/ai-assistant"
  // }
]

export function QuickStartDevelopers() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-2xl border border-blue-500/20">
            <Code className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Quick Start for Developers
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Get up and running with DevSecureX in under 5 minutes. This guide will walk you through 
          connecting your first repository and running your initial security scan.
        </p>
        
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            5 minutes setup
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1" />
            20+ security tools
          </div>
          <div className="flex items-center">
            <Github className="h-4 w-4 mr-1" />
            GitHub webhooks
          </div>
        </div>
        
        <Alert className="mt-6 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Current Features Available</AlertTitle>
          <AlertDescription>
            This guide focuses on features that are currently working: manual repository connection, 
            security scanning via webhooks, and dashboard access. GitHub Actions and CLI integrations 
            are planned for future releases.
          </AlertDescription>
        </Alert>
      </div>

      {/* Prerequisites */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Before You Begin</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preRequisites.map((prereq, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
              <div className={`mt-1 ${prereq.hasAccess ? 'text-green-500' : 'text-muted-foreground'}`}>
                {prereq.hasAccess ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{prereq.title}</h3>
                  {prereq.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{prereq.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Setup Steps */}
      <div>
        <h2 className="text-2xl font-bold mb-6">4-Step Quick Setup</h2>
        <div className="space-y-6">
          {quickSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step.status === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : step.status === 'current'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.step
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {step.timeEstimate}
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                {step.status === 'current' && (
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    {step.action}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Examples */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Integration Examples</h2>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Available Integration</AlertTitle>
          <AlertDescription>
            Currently, we support GitHub webhook integration for automated scanning. 
            GitHub Actions and CLI integrations are coming soon!
          </AlertDescription>
        </Alert>
        <div className="space-y-6">
          {codeExamples.map((example, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{example.title}</CardTitle>
                    <CardDescription>{example.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {example.language}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{example.filename}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(example.code, `code-${index}`)}
                    >
                      {copiedCode === `code-${index}` ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Common Issues */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Common Issues & Solutions</h2>
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Repository Connection Failed</AlertTitle>
            <AlertDescription>
              Make sure you have admin or write access to the repository. Check your GitHub permissions 
              and try reconnecting your account.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Scan Taking Too Long</AlertTitle>
            <AlertDescription>
              Large repositories may take 10-30 minutes to scan completely. You can start with a "Quick Scan" 
              to get results faster, then run comprehensive scans during off-hours.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Webhook Setup Issues</AlertTitle>
            <AlertDescription>
              If webhooks aren't triggering scans, verify the webhook URL is correct and that your 
              repository has push/PR events configured. Check your webhook secret matches as well.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nextSteps.map((nextStep, index) => (
            <Link key={index} to={nextStep.href} className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-blue-500/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <nextStep.icon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                        {nextStep.title}
                      </CardTitle>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{nextStep.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Secure Your Code?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Start your security journey today. Connect your first repository and get instant 
          vulnerability insights with our comprehensive scanning platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/dashboard">
              <Github className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/features/dashboard">
              <Eye className="h-4 w-4 mr-2" />
              View Dashboard Guide
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}