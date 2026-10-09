import { 
  Shield, 
  Search, 
  Code, 
  Database, 
  Cloud, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  Target, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw, 
  BarChart3, 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Users, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Globe, 
  Lock, 
  Bug, 
  Activity, 
  Eye,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'

const scanTypes = [
  {
    icon: Code,
    title: "SAST (Static Analysis)",
    description: "Analyze source code for security vulnerabilities without executing it",
    tools: ["Semgrep", "Bandit", "ESLint Security", "Brakeman", "Gosec", "SpotBugs"],
    capabilities: [
      "SQL injection detection",
      "Cross-site scripting (XSS) prevention",
      "Buffer overflow identification",
      "Authentication bypass patterns",
      "Insecure cryptography usage",
      "Code quality issues"
    ],
    languages: "20+ Programming Languages",
    coverage: "Source Code Analysis"
  },
  {
    icon: Database,
    title: "SCA (Composition Analysis)",
    description: "Scan dependencies and third-party libraries for known vulnerabilities",
    tools: ["Safety", "Trivy", "Snyk", "OWASP Dependency Check"],
    capabilities: [
      "CVE vulnerability detection",
      "License compliance checking",
      "Outdated dependency identification",
      "Transitive dependency analysis",
      "Risk assessment scoring",
      "Upgrade path recommendations"
    ],
    languages: "All Package Managers",
    coverage: "Dependencies & Libraries"
  },
  {
    icon: Key,
    title: "Secrets Detection",
    description: "Identify exposed secrets, API keys, and sensitive information",
    tools: ["GitLeaks", "TruffleHog", "detect-secrets"],
    capabilities: [
      "API key detection",
      "Password exposure identification",
      "Certificate and private key scanning",
      "Database connection strings",
      "Cloud provider credentials",
      "Git history analysis"
    ],
    languages: "All File Types",
    coverage: "Secrets & Credentials"
  },
  {
    icon: Cloud,
    title: "IaC (Infrastructure as Code)",
    description: "Security analysis for infrastructure and deployment configurations",
    tools: ["Checkov", "Terrascan", "Trivy", "Kubesec"],
    capabilities: [
      "Terraform misconfiguration detection",
      "Kubernetes security issues",
      "Docker container vulnerabilities",
      "Cloud resource configuration",
      "Compliance framework validation",
      "Best practice enforcement"
    ],
    languages: "IaC & Container Files",
    coverage: "Infrastructure Security"
  }
]

const securityTools = [
  {
    name: "Semgrep",
    category: "SAST",
    languages: ["Python", "JavaScript", "Java", "Go", "Ruby", "C/C++", "PHP", "C#", "TypeScript"],
    specialties: ["Custom rule creation", "Multi-language support", "High precision"],
    performance: "Fast (< 5 min typical)",
    description: "Advanced static analysis with custom rule capabilities"
  },
  {
    name: "Bandit",
    category: "SAST",
    languages: ["Python"],
    specialties: ["Python security issues", "Common vulnerability patterns", "Django/Flask"],
    performance: "Very Fast (< 2 min)",
    description: "Python-specific security vulnerability scanner"
  },
  {
    name: "GitLeaks",
    category: "Secrets",
    languages: ["All"],
    specialties: ["Git history scanning", "Secret patterns", "Entropy analysis"],
    performance: "Medium (5-15 min)",
    description: "Comprehensive secrets detection in git repositories"
  },
  {
    name: "TruffleHog",
    category: "Secrets",
    languages: ["All"],
    specialties: ["High-entropy strings", "Verified credentials", "Custom regexes"],
    performance: "Fast (< 5 min)",
    description: "High-precision secrets scanner with verification"
  },
  {
    name: "Trivy",
    category: "SCA/IaC",
    languages: ["All"],
    specialties: ["Container scanning", "IaC analysis", "Multi-format support"],
    performance: "Fast (< 15 min)",
    description: "Comprehensive vulnerability scanner for containers and IaC"
  },
  {
    name: "Safety",
    category: "SCA",
    languages: ["Python"],
    specialties: ["Python packages", "PyPI vulnerability database", "CVE mapping"],
    performance: "Very Fast (< 2 min)",
    description: "Python dependency vulnerability scanner"
  },
  {
    name: "ESLint Security",
    category: "SAST",
    languages: ["JavaScript", "TypeScript", "JSX", "TSX"],
    specialties: ["Web security", "XSS prevention", "Node.js security"],
    performance: "Fast (< 5 min)",
    description: "JavaScript/TypeScript security linting and analysis"
  },
  {
    name: "Brakeman",
    category: "SAST",
    languages: ["Ruby"],
    specialties: ["Ruby on Rails", "Web application security", "Framework-specific"],
    performance: "Medium (10-20 min)",
    description: "Ruby on Rails security vulnerability scanner"
  },
  {
    name: "Gosec",
    category: "SAST",
    languages: ["Go"],
    specialties: ["Go security", "Concurrency issues", "Standard library misuse"],
    performance: "Fast (< 5 min)",
    description: "Go language security analyzer"
  },
  {
    name: "Checkov",
    category: "IaC",
    languages: ["Terraform", "CloudFormation", "Kubernetes", "Docker"],
    specialties: ["Cloud security", "Infrastructure misconfigurations", "Compliance"],
    performance: "Fast (< 5 min)",
    description: "Infrastructure as Code security scanner"
  }
]

const scanModes = [
  {
    mode: "Full Repository Scan",
    description: "Comprehensive analysis of entire repository codebase",
    icon: Globe,
    features: [
      "Complete codebase analysis",
      "All security tools execution",
      "Historical vulnerability tracking",
      "Comprehensive reporting"
    ],
    useCase: "Initial assessment, scheduled audits, compliance reviews",
    duration: "10-30 minutes",
    coverage: "100% of repository"
  },
  {
    mode: "Incremental Scan",
    description: "Scan only changed files since last scan for faster results",
    icon: Zap,
    features: [
      "Delta-based analysis",
      "Faster scan times",
      "Change impact assessment",
      "Continuous monitoring"
    ],
    useCase: "Regular commits, webhook triggers, development workflow",
    duration: "5-30 minutes",
    coverage: "Changed files only"
  },
  {
    mode: "Pull Request Scan",
    description: "Focused analysis on PR changes for review workflow",
    icon: Users,
    features: [
      "PR-specific vulnerability detection",
      "Blocking rule enforcement",
      "Inline code comments",
      "Review automation"
    ],
    useCase: "Code reviews, merge protection, development gates",
    duration: "1-5 minutes",
    coverage: "PR diff only"
  },
  {
    mode: "Custom Scan",
    description: "Tailored scanning with specific tools and configurations",
    icon: Settings,
    features: [
      "Tool selection control",
      "Custom rule sets",
      "Targeted analysis",
      "Performance optimization"
    ],
    useCase: "Specific investigations, performance testing, specialized analysis",
    duration: "Variable",
    coverage: "Configurable"
  }
]

const schedulingOptions = [
  {
    type: "Continuous Integration",
    description: "Automatic scans triggered by code changes",
    triggers: ["Push to repository", "Pull request creation", "Branch updates", "Tag creation"],
    frequency: "Event-driven",
    benefits: ["Real-time protection", "Zero configuration", "Immediate feedback"]
  },
  {
    type: "Scheduled Scans",
    description: "Regular automated scans at defined intervals",
    triggers: ["Daily security audits", "Weekly comprehensive scans", "Monthly compliance checks"],
    frequency: "Time-based",
    benefits: ["Consistent monitoring", "Resource planning", "Audit trails"]
  },
  {
    type: "Manual Scans",
    description: "On-demand scanning for investigations and testing",
    triggers: ["Manual initiation", "API-triggered scans", "Emergency assessments"],
    frequency: "As needed",
    benefits: ["Flexible timing", "Targeted analysis", "Investigation support"]
  }
]

const resultFeatures = [
  {
    title: "Vulnerability Prioritization",
    description: "Intelligent ranking based on severity, exploitability, and context",
    icon: Target,
    features: [
      "CVSS scoring integration",
      "Business impact assessment",
      "Exploit availability analysis",
      "Custom priority rules"
    ]
  },
  {
    title: "Detailed Code Context",
    description: "Precise vulnerability location with surrounding code context",
    icon: Code,
    features: [
      "Exact line number identification",
      "Code snippet extraction",
      "Function and class context",
      "Data flow visualization"
    ]
  },
  {
    title: "Remediation Guidance",
    description: "Actionable recommendations for fixing vulnerabilities",
    icon: CheckCircle,
    features: [
      "Step-by-step fix instructions",
      "Code examples and patches",
      "Best practice recommendations",
      "Learning resources"
    ]
  },
  {
    title: "Export and Integration",
    description: "Multiple formats for reporting and tool integration",
    icon: Download,
    features: [
      "JSON, XML, CSV, PDF exports",
      "SARIF format support",
      "Issue tracker integration",
      "Webhook integration"
    ]
  }
]

export function FeatureScanning() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20">
            <Shield className="h-12 w-12 text-red-500 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Security Scanning
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive security analysis with 20+ industry-leading tools. Detect vulnerabilities, 
          secrets, and security issues across your entire codebase with advanced scanning capabilities.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="/scans">
              <Play className="h-4 w-4 mr-2" />
              Start Security Scan
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

      {/* Scan Types */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Security Scan Types</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive coverage across all aspects of application security
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scanTypes.map((type, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                    <type.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Primary Tools</h4>
                  <div className="flex flex-wrap gap-1">
                    {type.tools.map((tool, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Capabilities</h4>
                  <ul className="space-y-1">
                    {type.capabilities.slice(0, 3).map((capability, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <span className="text-sm text-muted-foreground">{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <h5 className="font-medium text-xs text-muted-foreground mb-1">LANGUAGES</h5>
                    <p className="text-sm">{type.languages}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-xs text-muted-foreground mb-1">COVERAGE</h5>
                    <p className="text-sm">{type.coverage}</p>
                  </div>
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
            20+ industry-leading security tools integrated into a unified platform
          </p>
        </div>

        <div className="space-y-4">
          {securityTools.map((tool, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {tool.category}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Languages Supported</h4>
                    <div className="flex flex-wrap gap-1">
                      {tool.languages.slice(0, 3).map((lang, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                      {tool.languages.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tool.languages.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Specialties</h4>
                    <ul className="space-y-1">
                      {tool.specialties.slice(0, 2).map((specialty, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground">
                          • {specialty}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Performance</h4>
                    <p className="text-xs text-muted-foreground">{tool.performance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link to="/docs/security/vulnerability-scanning">
              View Complete Tool Documentation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Scan Modes */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Flexible Scanning Modes</h2>
          <p className="text-muted-foreground text-lg">
            Choose the right scanning approach for your workflow and requirements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scanModes.map((mode, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <mode.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{mode.mode}</CardTitle>
                    <CardDescription>{mode.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <h5 className="font-medium text-xs text-muted-foreground mb-1">DURATION</h5>
                    <p className="text-sm">{mode.duration}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-xs text-muted-foreground mb-1">COVERAGE</h5>
                    <p className="text-sm">{mode.coverage}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-xs text-muted-foreground mb-1">BEST FOR</h5>
                  <p className="text-sm text-muted-foreground">{mode.useCase}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Scheduling & Automation */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Scheduling & Automation</h2>
          <p className="text-muted-foreground text-lg">
            Automate security scanning to fit your development workflow
          </p>
        </div>

        <div className="space-y-6">
          {schedulingOptions.map((option, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{option.type}</h3>
                    <p className="text-muted-foreground mb-4">{option.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Triggers</h4>
                        <ul className="space-y-1">
                          {option.triggers.map((trigger, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                              • {trigger}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Frequency</h4>
                        <p className="text-sm">{option.frequency}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Benefits</h4>
                        <ul className="space-y-1">
                          {option.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                              • {benefit}
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

      {/* Results & Reporting */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Advanced Results & Reporting</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive vulnerability analysis with actionable insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resultFeatures.map((feature, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
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

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-2xl p-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <Target className="h-8 w-8 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Ready to Scan Your Code?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start securing your codebase with comprehensive security scanning. Run your first scan 
            in minutes and discover vulnerabilities before they reach production.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/scans">
                <Shield className="h-4 w-4 mr-2" />
                Start Security Scan
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/docs/features/pull-requests">
                <ArrowRight className="h-4 w-4 mr-2" />
                Learn About PR Reviews
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}