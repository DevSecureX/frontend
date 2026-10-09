import { 
  Shield, 
  Zap, 
  Eye, 
  GitPullRequest, 
  Bot, 
  BarChart3,
  Code,
  Users,
  Cloud,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Globe,
  Lock,
  Sparkles,
  Target,
  TrendingUp,
  Github,
  Smartphone,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Code,
    title: "Complete Code Security Analysis",
    description: "Advanced static analysis for 20+ programming languages with semantic code understanding",
    color: "bg-blue-500"
  },
  {
    icon: Shield,
    title: "Dependency Security Management",
    description: "Comprehensive vulnerability scanning for third-party components with license compliance",
    color: "bg-red-500"
  },
  {
    icon: Lock,
    title: "Secrets Detection",
    description: "Advanced detection of exposed credentials, API keys, and git history analysis",
    color: "bg-orange-500"
  },
  {
    icon: Cloud,
    title: "Infrastructure Security Validation",
    description: "Cloud configuration, container, and Kubernetes security scanning",
    color: "bg-green-500"
  },
  {
    icon: Bot,
    title: "AI That Actually Helps",
    description: "AI explanations that teach you why code is vulnerable and exactly how to fix it",
    color: "bg-purple-500"
  },
  {
    icon: Zap,
    title: "5-Minute Setup",
    description: "No complex configuration or security expertise required to get started",
    color: "bg-indigo-500"
  }
]

const benefits = [
  {
    title: "Unified Platform",
    description: "One platform instead of managing multiple separate security tools",
    stat: "3-5 min",
    statLabel: "complete scan time"
  },
  {
    title: "Developer-First Design",
    description: "Built by developers for developers with AI that teaches instead of just reporting",
    stat: "5 min",
    statLabel: "setup time"
  },
  {
    title: "Consistent Quality",
    description: "Every scan follows the same comprehensive checklist with objective metrics",
    stat: "<500ms",
    statLabel: "API response time"
  },
  {
    title: "Built for Scale",
    description: "Handles 1,000+ concurrent scans with 99.9% uptime SLA",
    stat: "99.9%",
    statLabel: "uptime SLA"
  }
]

const securityTools = [
  { name: 'Bandit', category: 'SAST', language: 'Python' },
  { name: 'Semgrep', category: 'SAST', language: 'Multi-language' },
  // { name: "CodeQL", category: "SAST", language: "Multi-language" },
  { name: 'ESLint Security', category: 'SAST', language: 'JavaScript' },
  { name: 'Brakeman', category: 'SAST', language: 'Ruby' },
  { name: 'SpotBugs', category: 'SAST', language: 'Java' },
  // { name: "OWASP ZAP", category: "DAST", language: "Web Apps" },
  // { name: "Nuclei", category: "DAST", language: "Infrastructure" },
  { name: 'Safety', category: 'SCA', language: 'Python' },
  { name: 'CPP Check', category: 'SAST', language: 'C, C++' },
  // { name: "npm audit", category: "SCA", language: "JavaScript" },
  // { name: "Snyk", category: "SCA", language: "Multi-language" },
  // { name: "OWASP Dependency Check", category: "SCA", language: "Multi-language" },
  { name: 'TruffleHog', category: 'Secrets', language: 'Git repos' },
  { name: 'GitLeaks', category: 'Secrets', language: 'Git repos' },
  { name: 'Checkov', category: 'IaC', language: 'Terraform/Docker' },
  // { name: "Terrascan", category: "IaC", language: "IaC files" },
  // { name: "Hadolint", category: "Container", language: "Docker" },
  { name: 'Trivy', category: 'Container', language: 'Container images' },
  // { name: "Kubesec", category: "Kubernetes", language: "K8s manifests" },
  { name: 'Custom Rules', category: 'Custom', language: 'User-defined' },
];

const workflows = [
  {
    step: 1,
    title: "Install CLI or Sign Up",
    description: "Install the npm CLI package or sign up for the web platform at app.devsecurex.com",
    action: "Get Started"
  },
  {
    step: 2,
    title: "Authenticate",
    description: "Authenticate with GitHub or create an account to get started",
    action: "Setup Auth"
  },
  {
    step: 3,
    title: "Connect & Scan",
    description: "Connect repositories or run scan locally for comprehensive security analysis",
    action: "Run Scan"
  },
  {
    step: 4,
    title: "Get Results",
    description: "Get comprehensive security analysis with AI-powered explanations immediately",
    action: "View Results"
  }
]

export function PlatformOverview() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
            <Shield className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Ship code that's safe by default.
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          DevSecureX is a comprehensive security platform that provides complete security analysis and uses AI to
          explain what actually matters. Built for developers who want security that works, not security that gets in the way.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="/docs/quick-start-developers">
              <Play className="h-4 w-4 mr-2" />
              Quick Start Guide
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/features/dashboard">
              <Eye className="h-4 w-4 mr-2" />
              View Demo
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Features */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">Complete Security Coverage</h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Instead of managing multiple separate security tools, DevSecureX handles everything
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
          <p className="text-muted-foreground text-lg">
            5-minute setup with no complex configuration required
          </p>
        </div>

        <div className="space-y-8">
          {workflows.map((workflow, index) => (
            <div key={index} className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{workflow.step}</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{workflow.title}</h3>
                <p className="text-muted-foreground mb-4">{workflow.description}</p>
                <Button variant="outline" size="sm">
                  {workflow.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Tools Overview */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Language and Technology Support</h2>
          <p className="text-muted-foreground text-lg">
            Support for 20+ programming languages and frameworks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityTools.map((tool, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
              <div>
                <div className="font-medium">{tool.name}</div>
                <div className="text-sm text-muted-foreground">{tool.language}</div>
              </div>
              <Badge variant="secondary">{tool.category}</Badge>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link to="/docs/security/vulnerability-scanning">
              View All Security Tools
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Benefits & ROI */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Makes DevSecureX Different</h2>
          <p className="text-muted-foreground text-lg">
            Built for scale, security, and developer experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-blue-600">{benefit.stat}</span>
                  <span className="text-sm text-muted-foreground pb-1">{benefit.statLabel}</span>
                </div>
                <Progress value={85} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Architecture Overview */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Platform Architecture</h2>
          <p className="text-muted-foreground text-lg">
            Built for scale, security, and reliability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Frontend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">React 18.3.1 with TypeScript and Progressive Web App</p>
              <div className="mt-4 space-y-2">
                <Badge variant="outline">React 18.3.1</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">PWA</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Backend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">FastAPI with Python 3.12+, PostgreSQL, Redis</p>
              <div className="mt-4 space-y-2">
                <Badge variant="outline">FastAPI</Badge>
                <Badge variant="outline">Python 3.12+</Badge>
                <Badge variant="outline">PostgreSQL</Badge>
                <Badge variant="outline">Redis</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Zero source code storage, end-to-end encryption, SOC 2 Type II</p>
              <div className="mt-4 space-y-2">
                <Badge variant="outline">SOC 2 Type II</Badge>
                <Badge variant="outline">GDPR</Badge>
                <Badge variant="outline">E2E Encryption</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Access Options */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Three Ways to Use DevSecureX</h2>
          <p className="text-muted-foreground text-lg">
            Choose the approach that fits your workflow best
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-white" />
              </div>
              <CardTitle>CLI Tool</CardTitle>
              <CardDescription>For developers who live in the terminal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Complete offline scanning capabilities</p>
              <div className="pt-2">
                <Badge>@devsecurex/cli</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Web Platform</CardTitle>
              <CardDescription>For teams who want dashboards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Visual security management and collaboration</p>
              <div className="pt-2">
                <Badge>app.devsecurex.com</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>REST API</CardTitle>
              <CardDescription>For custom integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">277+ endpoints with OpenAPI documentation</p>
              <div className="pt-2">
                <Badge>API Access</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to experience security that actually works for developers?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          DevSecureX transforms security from a development bottleneck into a competitive advantage.
          Get comprehensive security analysis in minutes, not hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/docs/quick-start-developers">
              <Play className="h-4 w-4 mr-2" />
              Get Started Free
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/cli">
              <Code className="h-4 w-4 mr-2" />
              Install CLI from npm
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          No credit card required. 5-minute setup. Real results immediately.
        </p>
      </div>
    </div>
  )
}