import { 
  GitPullRequest, 
  Shield, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Eye, 
  Settings, 
  Zap, 
  Target, 
  Bot, 
  FileText, 
  GitMerge, 
  GitBranch, 
  ArrowRight, 
  Play, 
  BookOpen, 
  Activity, 
  Bell, 
  Lock, 
  Gauge, 
  BarChart3, 
  Code, 
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'

const prFeatures = [
  {
    icon: Bot,
    title: "Automated Security Reviews",
    description: "AI-powered security analysis for every pull request",
    features: [
      "Automatic vulnerability detection",
      "AI-generated security insights",
      "Contextual code analysis",
      "Intelligent false positive filtering"
    ]
  },
  {
    icon: Lock,
    title: "Security Blocking Rules",
    description: "Prevent insecure code from being merged into your main branch",
    features: [
      "Configurable blocking thresholds",
      "Severity-based merge prevention",
      "Custom security policies",
      "Override capabilities for emergencies"
    ]
  },
  {
    icon: MessageSquare,
    title: "Inline Security Comments",
    description: "Detailed security feedback directly in your pull request",
    features: [
      "Line-by-line vulnerability annotations",
      "Remediation suggestions",
      "Educational security content",
      "Collaborative discussion threads"
    ]
  },
  {
    icon: BarChart3,
    title: "Security Impact Analysis",
    description: "Understand the security implications of code changes",
    features: [
      "Risk assessment scoring",
      "Security debt tracking",
      "Trend analysis",
      "Impact visualization"
    ]
  }
]

const automationWorkflow = [
  {
    step: 1,
    title: "PR Creation Detection",
    description: "Automatic detection when a pull request is opened or updated",
    icon: GitPullRequest,
    details: [
      "GitHub webhook integration",
      "Real-time PR monitoring",
      "Change detection algorithms",
      "Queue management system"
    ]
  },
  {
    step: 2,
    title: "Security Analysis",
    description: "Comprehensive security scanning of changed code",
    icon: Shield,
    details: [
      "Delta-based vulnerability scanning",
      "Multi-tool security analysis",
      "Custom rule evaluation",
      "Context-aware detection"
    ]
  },
  {
    step: 3,
    title: "AI Review Generation",
    description: "Intelligent security review with actionable insights",
    icon: Bot,
    details: [
      "AI-powered analysis",
      "Vulnerability explanation",
      "Remediation recommendations",
      "Educational content generation"
    ]
  },
  {
    step: 4,
    title: "Review Publishing",
    description: "Automated posting of security review results",
    icon: MessageSquare,
    details: [
      "GitHub PR comments",
      "Status check updates",
      "Review summary posting",
      "Notification delivery"
    ]
  }
]

const blockingPolicies = [
  {
    policy: "Critical Vulnerabilities",
    description: "Block merges when critical security issues are detected",
    criteria: [
      "CVSS score >= 9.0",
      "SQL injection vulnerabilities",
      "Remote code execution risks",
      "Authentication bypass issues"
    ],
    overrideLevel: "Security Lead Approval",
    icon: XCircle
  },
  {
    policy: "High Severity Issues",
    description: "Require security review for high-impact vulnerabilities",
    criteria: [
      "CVSS score >= 7.0",
      "Cross-site scripting (XSS)",
      "Sensitive data exposure",
      "Insecure cryptography"
    ],
    overrideLevel: "Senior Developer Approval",
    icon: AlertTriangle
  },
  {
    policy: "Secret Exposure",
    description: "Prevent accidental secret commits",
    criteria: [
      "API keys or tokens",
      "Database credentials",
      "Private keys or certificates",
      "Cloud provider secrets"
    ],
    overrideLevel: "DevOps Team Approval",
    icon: Eye
  },
  {
    policy: "Custom Rules",
    description: "Organization-specific security requirements",
    criteria: [
      "Business logic violations",
      "Compliance requirements",
      "Architecture standards",
      "Code quality thresholds"
    ],
    overrideLevel: "Configurable",
    icon: Settings
  }
]

const reviewTypes = [
  {
    type: "Security-Focused Review",
    description: "Comprehensive security analysis with vulnerability detection",
    icon: Shield,
    features: [
      "Multi-tool vulnerability scanning",
      "Secret detection analysis",
      "Dependency security checks",
      "Infrastructure security review"
    ],
    timeline: "2-5 minutes",
    coverage: "All security aspects"
  },
  {
    type: "Fast Track Review",
    description: "Quick security check for low-risk changes",
    icon: Zap,
    features: [
      "Focused vulnerability scanning",
      "High-priority issue detection",
      "Minimal performance impact",
      "Essential security checks"
    ],
    timeline: "30-90 seconds",
    coverage: "High-impact vulnerabilities"
  },
  {
    type: "Compliance Review",
    description: "Ensure changes meet regulatory and compliance requirements",
    icon: FileText,
    features: [
      "Compliance framework validation",
      "Regulatory requirement checks",
      "Audit trail generation",
      "Documentation verification"
    ],
    timeline: "3-7 minutes",
    coverage: "Compliance standards"
  },
  {
    type: "Custom Review",
    description: "Tailored review based on organization-specific rules",
    icon: Settings,
    features: [
      "Custom rule evaluation",
      "Business logic validation",
      "Architecture compliance",
      "Team-specific requirements"
    ],
    timeline: "Variable",
    coverage: "Custom criteria"
  }
]

const commentFeatures = [
  {
    feature: "Inline Annotations",
    description: "Security issues highlighted directly in code",
    capabilities: [
      "Exact line-level precision",
      "Vulnerability context display",
      "Code snippet highlighting",
      "Multi-line issue tracking"
    ]
  },
  {
    feature: "Remediation Guidance",
    description: "Actionable advice for fixing security issues",
    capabilities: [
      "Step-by-step fix instructions",
      "Code examples and patterns",
      "Best practice recommendations",
      "Learning resource links"
    ]
  },
  {
    feature: "Collaborative Discussions",
    description: "Team collaboration on security findings",
    capabilities: [
      "Threaded comment discussions",
      "Developer Q&A support",
      "Resolution tracking",
      "Knowledge sharing"
    ]
  },
  {
    feature: "AI-Powered Insights",
    description: "Intelligent analysis and explanations",
    capabilities: [
      "Vulnerability impact analysis",
      "Attack scenario descriptions",
      "Risk prioritization",
      "Educational content"
    ]
  }
]

const integrationBenefits = [
  {
    benefit: "Developer Workflow Integration",
    description: "Seamlessly fits into existing development processes",
    icon: GitMerge,
    details: [
      "No workflow disruption",
      "Familiar GitHub interface",
      "Real-time feedback",
      "Contextual guidance"
    ]
  },
  {
    benefit: "Continuous Security",
    description: "Security validation at every code change",
    icon: RefreshCw,
    details: [
      "Automatic trigger system",
      "Continuous monitoring",
      "Immediate feedback",
      "Proactive protection"
    ]
  },
  {
    benefit: "Learning & Education",
    description: "Help developers learn security best practices",
    icon: BookOpen,
    details: [
      "Educational explanations",
      "Best practice guidance",
      "Security pattern recognition",
      "Skill development"
    ]
  },
  {
    benefit: "Quality Assurance",
    description: "Ensure high security standards across all code",
    icon: Gauge,
    details: [
      "Consistent security standards",
      "Quality gate enforcement",
      "Risk reduction",
      "Compliance assurance"
    ]
  }
]

export function FeaturePullRequests() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20">
            <GitPullRequest className="h-12 w-12 text-purple-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Pull Request Security Reviews
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Automated security analysis for every pull request. Get AI-powered security insights, 
          prevent vulnerable code merges, and educate developers with contextual security guidance.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="/pull-requests">
              <Eye className="h-4 w-4 mr-2" />
              View PR Reviews
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/integrations/github">
              <BookOpen className="h-4 w-4 mr-2" />
              Setup Guide
            </Link>
          </Button>
        </div>
      </div>

      {/* Core Features */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Pull Request Security Features</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive security analysis integrated into your development workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prFeatures.map((feature, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
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

      {/* Automation Workflow */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Automated Review Workflow</h2>
          <p className="text-muted-foreground text-lg">
            Seamless automation from PR creation to security review completion
          </p>
        </div>

        <div className="space-y-8">
          {automationWorkflow.map((step, index) => (
            <div key={index} className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-xs">STEP</span>
                  <span className="text-white font-bold text-lg">{step.step}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <step.icon className="h-6 w-6 text-purple-500" />
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Blocking Policies */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Security Blocking Policies</h2>
          <p className="text-muted-foreground text-lg">
            Prevent vulnerable code from reaching production with intelligent blocking rules
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blockingPolicies.map((policy, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <policy.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{policy.policy}</CardTitle>
                    <CardDescription>{policy.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Blocking Criteria</h4>
                  <ul className="space-y-1">
                    {policy.criteria.map((criterion, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-sm">{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Override Level</span>
                    <Badge variant="outline" className="text-xs">
                      {policy.overrideLevel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Review Types */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Review Types & Configurations</h2>
          <p className="text-muted-foreground text-lg">
            Flexible review configurations to match your team's needs and risk tolerance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviewTypes.map((review, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <review.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{review.type}</CardTitle>
                    <CardDescription>{review.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {review.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <h5 className="font-medium text-xs text-muted-foreground mb-1">TIMELINE</h5>
                    <p className="text-sm">{review.timeline}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-xs text-muted-foreground mb-1">COVERAGE</h5>
                    <p className="text-sm">{review.coverage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comment Features */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Intelligent Security Comments</h2>
          <p className="text-muted-foreground text-lg">
            Rich, contextual security feedback directly in your pull requests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {commentFeatures.map((feature, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <span>{feature.feature}</span>
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.capabilities.map((capability, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span className="text-sm">{capability}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Integration Benefits */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Integration Benefits</h2>
          <p className="text-muted-foreground text-lg">
            Why PR security reviews transform your development workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrationBenefits.map((benefit, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <benefit.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{benefit.benefit}</CardTitle>
                    <CardDescription>{benefit.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {benefit.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl p-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Ready to Automate PR Security Reviews?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform your development workflow with automated security reviews. Start protecting 
            your codebase and educating your team with every pull request.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/pull-requests">
                <GitPullRequest className="h-4 w-4 mr-2" />
                View PR Reviews
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/docs/features/ai-assistant">
                <ArrowRight className="h-4 w-4 mr-2" />
                Learn About AI Assistant
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}