import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye,
  Settings,
  CheckCircle,
  ArrowRight,
  Users,
  FileText,
  Bell,
  Terminal,
  GitPullRequest,
  BarChart3,
  Zap,
  Search,
  Filter,
  Clock,
  Target,
  BookOpen,
  Play,
  Code,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link } from 'react-router-dom'

const securityWorkflows = [
  {
    title: "Proactive Threat Detection",
    description: "Set up automated scanning for 20+ security vulnerability types",
    icon: Search,
    steps: [
      "Configure SAST, DAST, and SCA scanning",
      "Enable custom security rules",
      "Set up vulnerability severity thresholds",
      "Configure automated remediation suggestions"
    ],
    timeToComplete: "30 minutes",
    priority: "high"
  },
  {
    title: "Pull Request Security Gates",
    description: "Implement security blocking for pull requests with vulnerabilities",
    icon: GitPullRequest,
    steps: [
      "Enable PR security reviews",
      "Configure blocking thresholds",
      "Set up security team notifications",
      "Implement bypass procedures for emergencies"
    ],
    timeToComplete: "20 minutes",
    priority: "high"
  },
  {
    title: "Security Monitoring Dashboard",
    description: "Create comprehensive security visibility across repositories",
    icon: BarChart3,
    steps: [
      "Set up security metrics tracking",
      "Configure vulnerability trend analysis",
      "Enable real-time alerting",
      "Create executive security reports"
    ],
    timeToComplete: "45 minutes",
    priority: "medium"
  },
  {
    title: "Incident Response Automation",
    description: "Streamline security incident handling and communication",
    icon: Bell,
    steps: [
      "Configure critical vulnerability alerts",
      "Set up team notification channels",
      "Enable automated ticket creation",
      "Implement escalation procedures"
    ],
    timeToComplete: "25 minutes",
    priority: "medium"
  }
]

const securityTools = [
  {
    category: "Static Analysis (SAST)",
    tools: [
      { name: "Bandit", description: "Python security linter", severity: "High" },
      { name: "Semgrep", description: "Multi-language static analysis", severity: "Critical" },
      { name: "CodeQL", description: "GitHub's semantic analysis", severity: "Critical" },
      { name: "ESLint Security", description: "JavaScript security rules", severity: "Medium" },
      { name: "Brakeman", description: "Ruby on Rails security scanner", severity: "High" }
    ]
  },
  {
    category: "Dynamic Analysis (DAST)",
    tools: [
      { name: "OWASP ZAP", description: "Web application security testing", severity: "Critical" },
      { name: "Nuclei", description: "Infrastructure vulnerability scanner", severity: "High" },
      { name: "Nikto", description: "Web server vulnerability scanner", severity: "Medium" }
    ]
  },
  {
    category: "Dependency Analysis (SCA)",
    tools: [
      { name: "Safety", description: "Python dependency vulnerability check", severity: "High" },
      { name: "npm audit", description: "Node.js dependency security", severity: "High" },
      { name: "Snyk", description: "Multi-language dependency scanning", severity: "Critical" },
      { name: "OWASP Dependency Check", description: "Known vulnerable components", severity: "High" }
    ]
  },
  {
    category: "Secret Detection",
    tools: [
      { name: "TruffleHog", description: "Git repository secret scanner", severity: "Critical" },
      { name: "GitLeaks", description: "Git secret detection", severity: "Critical" },
      { name: "Detect-secrets", description: "Enterprise secret scanning", severity: "High" }
    ]
  },
  {
    category: "Infrastructure as Code",
    tools: [
      { name: "Checkov", description: "Terraform and Dockerfile security", severity: "High" },
      { name: "Terrascan", description: "IaC security best practices", severity: "Medium" },
      { name: "Trivy", description: "Container image vulnerability scanner", severity: "Critical" }
    ]
  }
]

const securityPolicies = [
  {
    title: "Critical Vulnerability Policy",
    description: "Immediate blocking and escalation for critical security issues",
    rules: [
      "Block PRs with critical vulnerabilities",
      "Notify security team within 5 minutes",
      "Require security team approval for bypass",
      "Generate incident report automatically"
    ]
  },
  {
    title: "High Severity Policy", 
    description: "Review required for high-severity vulnerabilities",
    rules: [
      "Require security review for PR merge",
      "Allow temporary bypass with approval",
      "Track remediation timeline (7 days max)",
      "Send weekly summary reports"
    ]
  },
  {
    title: "Medium/Low Severity Policy",
    description: "Warning and tracking for lower-severity issues",
    rules: [
      "Display warnings in PR comments",
      "Allow merge with acknowledgment",
      "Track in security backlog",
      "Include in monthly security reviews"
    ]
  }
]

const quickWins = [
  {
    title: "Enable Secret Scanning",
    description: "Immediately detect hardcoded credentials and API keys",
    icon: Lock,
    action: "Enable Now",
    impact: "Prevent credential leaks",
    effort: "5 minutes"
  },
  {
    title: "Activate PR Security Blocks",
    description: "Block PRs with critical vulnerabilities from merging",
    icon: GitPullRequest,
    action: "Configure Blocking",
    impact: "Stop vulnerable code deployment",
    effort: "10 minutes"
  },
  {
    title: "Set Up Slack Alerts",
    description: "Get real-time notifications for security incidents",
    icon: Bell,
    action: "Connect Slack",
    impact: "Faster incident response",
    effort: "5 minutes"
  },
  {
    title: "Enable Dependency Scanning",
    description: "Scan for known vulnerabilities in third-party libraries",
    icon: Shield,
    action: "Start Scanning",
    impact: "Identify vulnerable dependencies",
    effort: "15 minutes"
  }
]

const bestPractices = [
  {
    category: "Vulnerability Management",
    practices: [
      "Prioritize vulnerabilities by CVSS score and exploitability",
      "Implement risk-based remediation timelines",
      "Use automated patching where possible",
      "Maintain vulnerability exception processes"
    ]
  },
  {
    category: "Developer Enablement",
    practices: [
      "Provide clear remediation guidance for each vulnerability",
      "Integrate security feedback into developer workflows",
      "Offer security training based on common findings",
      "Create security champions program"
    ]
  },
  {
    category: "Compliance & Reporting",
    practices: [
      "Generate regular security posture reports",
      "Track security metrics and trends",
      "Maintain audit trails for all security actions",
      "Align with industry compliance frameworks"
    ]
  }
]

export function QuickStartSecurity() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          DevSecureX for Security Teams
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive security automation platform designed for security professionals. 
          Scale your security reviews, implement security policies, and gain complete 
          visibility across your organization's code repositories.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="#quick-setup">
              <Play className="h-4 w-4 mr-2" />
              Start 15-Minute Setup
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/security/vulnerability-scanning">
              <BookOpen className="h-4 w-4 mr-2" />
              Security Tools Guide
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Wins Section */}
      <div id="quick-setup">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Quick Security Wins</h2>
          <p className="text-muted-foreground text-lg">
            Get immediate security value with these high-impact, low-effort configurations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickWins.map((win, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                      <win.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{win.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {win.effort}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {win.impact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{win.description}</p>
                <Button size="sm" className="w-full">
                  {win.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Workflows */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Security Workflow Setup</h2>
          <p className="text-muted-foreground text-lg">
            Configure comprehensive security workflows tailored for security team needs
          </p>
        </div>

        <div className="space-y-6">
          {securityWorkflows.map((workflow, index) => (
            <Card key={index} className={`border-l-4 ${workflow.priority === 'high' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <workflow.icon className="h-6 w-6 text-blue-500 mr-4" />
                    <div>
                      <CardTitle className="text-xl">{workflow.title}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={workflow.priority === 'high' ? 'destructive' : 'secondary'}>
                      {workflow.priority} priority
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {workflow.timeToComplete}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {workflow.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button variant="outline" size="sm">
                    Configure Workflow
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Tools Overview */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Integrated Security Tools</h2>
          <p className="text-muted-foreground text-lg">
            20+ security tools organized by analysis type for comprehensive coverage
          </p>
        </div>

        <Tabs defaultValue="static" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="static">SAST</TabsTrigger>
            <TabsTrigger value="dynamic">DAST</TabsTrigger>
            <TabsTrigger value="dependency">SCA</TabsTrigger>
            <TabsTrigger value="secrets">Secrets</TabsTrigger>
            <TabsTrigger value="iac">IaC</TabsTrigger>
          </TabsList>

          {securityTools.map((category, index) => (
            <TabsContent key={index} value={category.category.split(' ')[0].toLowerCase()}>
              <Card>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.tools.map((tool, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-sm text-muted-foreground">{tool.description}</div>
                        </div>
                        <Badge 
                          variant={tool.severity === 'Critical' ? 'destructive' : 
                                   tool.severity === 'High' ? 'destructive' : 'secondary'}
                        >
                          {tool.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Security Policies */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Security Policy Templates</h2>
          <p className="text-muted-foreground text-lg">
            Pre-configured security policies to enforce organizational security standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {securityPolicies.map((policy, index) => (
            <Card key={index} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{policy.title}</CardTitle>
                    <CardDescription>{policy.description}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Apply Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {policy.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Security Best Practices</h2>
          <p className="text-muted-foreground text-lg">
            Industry-proven practices for effective application security management
          </p>
        </div>

        <div className="space-y-6">
          {bestPractices.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-xl">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.practices.map((practice, idx) => (
                    <li key={idx} className="flex items-start">
                      <Target className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{practice}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Advanced Security Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take advantage of advanced security capabilities for enterprise-grade protection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <Code className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Custom Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create organization-specific security rules
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/docs/features/rules">
                  Learn More
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <Activity className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <CardTitle className="text-lg">AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get AI-powered security recommendations
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/docs/features/ai-assistant">
                  Explore AI
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Security metrics and trend analysis
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/docs/features/analytics">
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Role-based access and team workflows
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/docs/enterprise/rbac">
                  Manage Teams
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Help */}
      <div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Need Security Expertise?</AlertTitle>
          <AlertDescription>
            Our security team is available to help you configure optimal security workflows for your organization. 
            <Button variant="link" className="p-0 ml-2 h-auto" asChild>
              <Link to="/support">Contact Security Support</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}