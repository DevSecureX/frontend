import { 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Building,
  Target,
  Zap,
  Lock,
  Globe,
  Settings,
  FileText,
  Video,
  Calendar,
  Award,
  Calculator
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Link } from 'react-router-dom'

const executiveMetrics = [
  {
    metric: "85%",
    label: "Reduction in Security Incidents",
    description: "Teams using DevSecureX see significant decrease in production vulnerabilities",
    icon: Shield,
    color: "text-green-600"
  },
  {
    metric: "60%",
    label: "Faster Security Reviews",
    description: "Automated security reviews accelerate development without compromising safety",
    icon: Clock,
    color: "text-blue-600"
  },
  {
    metric: "40%",
    label: "Development Cost Savings",
    description: "Early vulnerability detection reduces expensive late-stage fixes",
    icon: DollarSign,
    color: "text-emerald-600"
  },
  {
    metric: "3x",
    label: "Security Team Productivity",
    description: "AI assistance helps security teams scale across more repositories",
    icon: Users,
    color: "text-purple-600"
  }
]

const businessBenefits = [
  {
    title: "Risk Reduction",
    description: "Proactively identify and fix security vulnerabilities before they reach production",
    icon: Shield,
    benefits: [
      "OWASP Top 10 coverage",
      "Zero-day vulnerability detection",
      "Compliance framework alignment",
      "Automated security policies"
    ]
  },
  {
    title: "Cost Optimization",
    description: "Reduce security-related costs through early detection and automation",
    icon: DollarSign,
    benefits: [
      "Lower incident response costs",
      "Reduced security consultant fees",
      "Faster time-to-market",
      "Insurance premium reductions"
    ]
  },
  {
    title: "Operational Efficiency",
    description: "Streamline security processes without slowing down development",
    icon: Zap,
    benefits: [
      "Automated security reviews",
      "Integrated CI/CD workflows",
      "Real-time vulnerability alerts",
      "Centralized security management"
    ]
  },
  {
    title: "Compliance & Governance",
    description: "Meet regulatory requirements with automated audit trails and reporting",
    icon: FileText,
    benefits: [
      "SOC 2 Type II compliance",
      "PCI DSS requirements",
      "GDPR data protection",
      "Industry-specific standards"
    ]
  }
]

const implementationPhases = [
  {
    phase: "Phase 1: Assessment (Week 1)",
    duration: "1 week",
    description: "Evaluate current security posture and integration requirements",
    tasks: [
      "Security audit of existing repositories",
      "Team workflow analysis",
      "Compliance requirements review",
      "ROI baseline establishment"
    ],
    deliverables: [
      "Security assessment report",
      "Implementation roadmap",
      "Risk prioritization matrix"
    ]
  },
  {
    phase: "Phase 2: Pilot Implementation (Weeks 2-4)",
    duration: "3 weeks",
    description: "Deploy DevSecureX for a subset of critical repositories",
    tasks: [
      "GitHub integration setup",
      "Security team onboarding",
      "Developer workflow integration",
      "Initial security scans"
    ],
    deliverables: [
      "Pilot environment setup",
      "Team training completion",
      "Initial security metrics"
    ]
  },
  {
    phase: "Phase 3: Full Rollout (Weeks 5-8)",
    duration: "4 weeks",
    description: "Scale across all repositories and teams",
    tasks: [
      "Organization-wide deployment",
      "Custom rule implementation",
      "Advanced feature configuration",
      "Performance optimization"
    ],
    deliverables: [
      "Complete platform deployment",
      "Security policy enforcement",
      "Performance benchmarks"
    ]
  },
  {
    phase: "Phase 4: Optimization (Weeks 9-12)",
    duration: "4 weeks",
    description: "Fine-tune processes and maximize ROI",
    tasks: [
      "Workflow optimization",
      "Custom reporting setup",
      "Advanced analytics configuration",
      "Team productivity analysis"
    ],
    deliverables: [
      "Optimized security workflows",
      "Executive dashboards",
      "ROI measurement report"
    ]
  }
]

const executiveChecklist = [
  {
    category: "Strategic Planning",
    items: [
      "Define security objectives and KPIs",
      "Align with business goals and compliance requirements",
      "Establish budget and resource allocation",
      "Create executive sponsorship structure"
    ]
  },
  {
    category: "Team Preparation",
    items: [
      "Identify security champions in each team",
      "Plan training and onboarding schedule",
      "Define roles and responsibilities",
      "Establish communication channels"
    ]
  },
  {
    category: "Technical Foundation",
    items: [
      "Review existing security tools and processes",
      "Assess GitHub integration requirements",
      "Plan CI/CD pipeline modifications",
      "Prepare infrastructure and access controls"
    ]
  },
  {
    category: "Success Metrics",
    items: [
      "Baseline current security metrics",
      "Define success criteria and targets",
      "Establish reporting cadence",
      "Plan ROI measurement methodology"
    ]
  }
]

export function QuickStartCTOs() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl border border-green-500/20">
            <TrendingUp className="h-12 w-12 text-green-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          DevSecureX for CTOs
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Transform your organization's security posture with AI-powered security scanning. 
          Reduce risk, accelerate development, and achieve compliance with enterprise-grade 
          security automation that scales with your business.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="/docs/enterprise/sso">
              <Building className="h-4 w-4 mr-2" />
              Enterprise Setup
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/success-stories">
              <Award className="h-4 w-4 mr-2" />
              Customer Success Stories
            </Link>
          </Button>
        </div>
      </div>

      {/* Executive Metrics */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Proven Business Impact</h2>
          <p className="text-muted-foreground text-lg">
            Real results from organizations using DevSecureX across their development lifecycle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {executiveMetrics.map((metric, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <metric.icon className={`h-8 w-8 ${metric.color}`} />
                  <span className={`text-3xl font-bold ${metric.color}`}>{metric.metric}</span>
                </div>
                <CardTitle className="text-lg">{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Business Benefits */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Strategic Business Value</h2>
          <p className="text-muted-foreground text-lg">
            DevSecureX delivers measurable value across all aspects of your security strategy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businessBenefits.map((benefit, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </div>
                </div>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {benefit.benefits.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">90-Day Implementation Roadmap</h2>
          <p className="text-muted-foreground text-lg">
            Structured approach to deploying DevSecureX across your organization
          </p>
        </div>

        <div className="space-y-8">
          {implementationPhases.map((phase, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{phase.phase}</CardTitle>
                    <CardDescription className="text-lg">{phase.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {phase.duration}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-blue-500" />
                      Key Tasks
                    </h4>
                    <ul className="space-y-2">
                      {phase.tasks.map((task, idx) => (
                        <li key={idx} className="flex items-start">
                          <ArrowRight className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-green-500" />
                      Deliverables
                    </h4>
                    <ul className="space-y-2">
                      {phase.deliverables.map((deliverable, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Executive Checklist */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Executive Preparation Checklist</h2>
          <p className="text-muted-foreground text-lg">
            Ensure organizational readiness for successful DevSecureX deployment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {executiveChecklist.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-xl">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <input 
                        type="checkbox" 
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ROI Calculator Preview */}
      <div className="bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Calculate Your ROI</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how DevSecureX can impact your organization's security posture and development efficiency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">$2.4M</div>
            <div className="text-sm text-muted-foreground">Average annual security cost savings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">300%</div>
            <div className="text-sm text-muted-foreground">Average ROI within 12 months</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">6 months</div>
            <div className="text-sm text-muted-foreground">Typical payback period</div>
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/docs/use-cases/enterprise">
              <Calculator className="h-4 w-4 mr-2" />
              View Detailed ROI Analysis
            </Link>
          </Button>
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-lg">
            Take the next step towards comprehensive security automation for your organization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <Video className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Schedule Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                See DevSecureX in action with your use case
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Book Demo
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Business Case</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Download executive business case template
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/docs/enterprise/business-case">
                  Download
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Talk to Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Discuss enterprise pricing and features
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Contact Sales
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Pilot Program</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Start with a limited pilot deployment
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Start Pilot
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}