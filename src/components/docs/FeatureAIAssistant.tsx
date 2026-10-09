import { 
  Bot, 
  MessageSquare, 
  Zap, 
  Brain, 
  Shield, 
  Code, 
  Lightbulb, 
  Search, 
  BookOpen, 
  Target, 
  CheckCircle, 
  ArrowRight, 
  Play, 
  Eye, 
  Settings, 
  Clock, 
  Users, 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  Sparkles, 
  GraduationCap, 
  RefreshCw, 
  Globe, 
  Lock, 
  TrendingUp,
  Cpu,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'

const aiCapabilities = [
  {
    icon: Brain,
    title: "Intelligent Vulnerability Analysis",
    description: "Advanced AI-powered analysis of security vulnerabilities and their context",
    features: [
      "Contextual vulnerability explanations",
      "Risk impact assessment",
      "Attack vector analysis",
      "Business logic understanding"
    ]
  },
  {
    icon: Code,
    title: "Automated Code Analysis",
    description: "Deep code understanding with intelligent security pattern recognition",
    features: [
      "Code flow analysis",
      "Pattern recognition",
      "Framework-specific insights",
      "Multi-language support"
    ]
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description: "Personalized security recommendations based on your codebase and patterns",
    features: [
      "Tailored security guidance",
      "Best practice suggestions",
      "Architecture improvements",
      "Performance optimizations"
    ]
  },
  {
    icon: GraduationCap,
    title: "Educational Insights",
    description: "Learn security concepts and best practices through interactive guidance",
    features: [
      "Security concept explanations",
      "Interactive learning modules",
      "Skill development tracking",
      "Knowledge base integration"
    ]
  }
]

const assistantFeatures = [
  {
    feature: "Real-time Security Consultation",
    description: "Get instant answers to security questions and concerns",
    icon: MessageSquare,
    capabilities: [
      "Interactive chat interface",
      "Context-aware responses",
      "Security expertise on-demand",
      "Multi-language communication"
    ],
    useCases: [
      "Quick security questions",
      "Vulnerability clarification",
      "Best practice guidance",
      "Implementation advice"
    ]
  },
  {
    feature: "Automated Fix Suggestions",
    description: "AI-generated code fixes for detected vulnerabilities",
    icon: Zap,
    capabilities: [
      "Intelligent code generation",
      "Context-aware fixes",
      "Multiple solution options",
      "Framework-specific patches"
    ],
    useCases: [
      "Vulnerability remediation",
      "Code improvement",
      "Security enhancement",
      "Quick fixes"
    ]
  },
  {
    feature: "Security Code Reviews",
    description: "Comprehensive AI-powered code review with security focus",
    icon: Eye,
    capabilities: [
      "Line-by-line analysis",
      "Security pattern detection",
      "Risk assessment",
      "Improvement suggestions"
    ],
    useCases: [
      "Pull request reviews",
      "Code quality assurance",
      "Security validation",
      "Team education"
    ]
  },
  {
    feature: "Learning & Development",
    description: "Personalized security education and skill development",
    icon: BookOpen,
    capabilities: [
      "Adaptive learning paths",
      "Skill gap analysis",
      "Progress tracking",
      "Certification guidance"
    ],
    useCases: [
      "Team training",
      "Skill development",
      "Security awareness",
      "Knowledge sharing"
    ]
  }
]

const gettingStarted = [
  {
    step: 1,
    title: "Access AI Assistant",
    description: "Navigate to the AI Assistant page or use the chat widget",
    icon: Bot,
    actions: [
      "Click 'AI Assistant' in navigation",
      "Use the floating chat button",
      "Access via keyboard shortcut",
      "Integrate with your IDE"
    ]
  },
  {
    step: 2,
    title: "Start a Conversation",
    description: "Ask security questions or request code analysis",
    icon: MessageSquare,
    actions: [
      "Type your security question",
      "Upload code for analysis",
      "Request vulnerability explanation",
      "Ask for best practices"
    ]
  },
  {
    step: 3,
    title: "Review AI Insights",
    description: "Get detailed analysis and actionable recommendations",
    icon: Brain,
    actions: [
      "Read vulnerability explanations",
      "Review fix suggestions",
      "Understand security concepts",
      "Apply recommendations"
    ]
  },
  {
    step: 4,
    title: "Implement Solutions",
    description: "Apply AI-suggested fixes and improvements",
    icon: CheckCircle,
    actions: [
      "Apply suggested code changes",
      "Implement security improvements",
      "Test and validate fixes",
      "Share learnings with team"
    ]
  }
]

const analysisTypes = [
  {
    type: "Vulnerability Deep Dive",
    description: "Comprehensive analysis of specific security vulnerabilities",
    icon: Shield,
    coverage: [
      "Root cause analysis",
      "Exploitation scenarios",
      "Impact assessment",
      "Remediation strategies"
    ],
    example: "SQL Injection vulnerability in user authentication"
  },
  {
    type: "Code Security Review",
    description: "Holistic security assessment of code snippets or functions",
    icon: Code,
    coverage: [
      "Security pattern analysis",
      "Logic flaw detection",
      "Best practice validation",
      "Performance implications"
    ],
    example: "Authentication function security review"
  },
  {
    type: "Architecture Assessment",
    description: "High-level security analysis of system architecture",
    icon: Globe,
    coverage: [
      "Security design patterns",
      "Attack surface analysis",
      "Threat modeling insights",
      "Scalability considerations"
    ],
    example: "Microservices security architecture review"
  },
  {
    type: "Compliance Guidance",
    description: "Framework-specific compliance and regulatory guidance",
    icon: FileText,
    coverage: [
      "Regulatory requirements",
      "Compliance mapping",
      "Audit preparation",
      "Documentation guidance"
    ],
    example: "GDPR compliance for data processing"
  }
]

const intelligentFeatures = [
  {
    title: "Context Awareness",
    description: "AI understands your specific codebase, technologies, and patterns",
    benefits: [
      "Technology stack recognition",
      "Framework-specific guidance",
      "Project context understanding",
      "Historical pattern analysis"
    ]
  },
  {
    title: "Learning Adaptation",
    description: "AI learns from your preferences and improves recommendations over time",
    benefits: [
      "Personalized recommendations",
      "Team preference learning",
      "Custom pattern recognition",
      "Adaptive communication style"
    ]
  },
  {
    title: "Multi-Modal Analysis",
    description: "Comprehensive analysis across code, documentation, and configuration",
    benefits: [
      "Code and docs correlation",
      "Configuration analysis",
      "Infrastructure review",
      "Holistic security view"
    ]
  },
  {
    title: "Continuous Improvement",
    description: "AI capabilities continuously updated with latest security knowledge",
    benefits: [
      "Latest vulnerability data",
      "Emerging threat patterns",
      "Industry best practices",
      "Research integration"
    ]
  }
]

const useCaseScenarios = [
  {
    scenario: "Developer Learning",
    description: "Help developers understand and learn security concepts",
    persona: "Junior/Mid-level Developers",
    workflow: [
      "Encounter unfamiliar vulnerability",
      "Ask AI for explanation",
      "Receive educational content",
      "Apply learned concepts"
    ],
    outcomes: ["Improved security knowledge", "Better code quality", "Reduced vulnerabilities"]
  },
  {
    scenario: "Code Review Assistance",
    description: "Enhance code reviews with AI-powered security insights",
    persona: "Senior Developers & Tech Leads",
    workflow: [
      "Review pull request",
      "Request AI security analysis",
      "Get detailed security feedback",
      "Provide comprehensive review"
    ],
    outcomes: ["Thorough security reviews", "Consistent quality", "Knowledge transfer"]
  },
  {
    scenario: "Incident Investigation",
    description: "Rapidly understand and respond to security incidents",
    persona: "Security Teams & DevOps",
    workflow: [
      "Detect security issue",
      "Analyze with AI assistance",
      "Understand root cause",
      "Implement comprehensive fix"
    ],
    outcomes: ["Faster incident response", "Better understanding", "Effective remediation"]
  },
  {
    scenario: "Architecture Planning",
    description: "Make informed security decisions during system design",
    persona: "Architects & Engineering Managers",
    workflow: [
      "Design system architecture",
      "Request security assessment",
      "Review AI recommendations",
      "Implement secure design"
    ],
    outcomes: ["Secure by design", "Risk mitigation", "Informed decisions"]
  }
]

export function FeatureAIAssistant() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
            <Bot className="h-12 w-12 text-purple-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          AI Security Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your intelligent security companion powered by advanced AI. Get instant security insights, 
          automated code analysis, and personalized recommendations to build more secure applications.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="/ai-assistant">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with AI Assistant
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/quick-start-developers">
              <BookOpen className="h-4 w-4 mr-2" />
              Getting Started Guide
            </Link>
          </Button>
        </div>
      </div>

      {/* Core Capabilities */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">AI Capabilities</h2>
          <p className="text-muted-foreground text-lg">
            Advanced artificial intelligence tailored for security analysis and education
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiCapabilities.map((capability, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <capability.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{capability.title}</CardTitle>
                    <CardDescription>{capability.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {capability.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Getting Started with AI Assistant</h2>
          <p className="text-muted-foreground text-lg">
            Simple steps to start leveraging AI for security analysis and learning
          </p>
        </div>

        <div className="space-y-8">
          {gettingStarted.map((step, index) => (
            <div key={index} className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex flex-col items-center justify-center">
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
                  {step.actions.map((action, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assistant Features */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive AI-powered tools for security analysis and education
          </p>
        </div>

        <div className="space-y-8">
          {assistantFeatures.map((feature, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
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
                        <h4 className="font-medium text-sm mb-2">Use Cases</h4>
                        <ul className="space-y-1">
                          {feature.useCases.map((useCase, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <Target className="h-3 w-3 text-blue-500" />
                              <span className="text-sm">{useCase}</span>
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

      {/* Analysis Types */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">AI Analysis Types</h2>
          <p className="text-muted-foreground text-lg">
            Specialized analysis modes for different security scenarios
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysisTypes.map((analysis, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <analysis.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{analysis.type}</CardTitle>
                    <CardDescription>{analysis.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Coverage Areas</h4>
                  <ul className="space-y-1">
                    {analysis.coverage.map((area, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <Sparkles className="h-3 w-3 text-orange-500" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <h5 className="font-medium text-xs text-muted-foreground mb-1">EXAMPLE</h5>
                  <p className="text-sm italic">{analysis.example}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Intelligent Features */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Intelligent Features</h2>
          <p className="text-muted-foreground text-lg">
            Advanced AI capabilities that make security analysis smarter and more effective
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {intelligentFeatures.map((feature, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <span>{feature.title}</span>
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Use Case Scenarios */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Real-World Use Cases</h2>
          <p className="text-muted-foreground text-lg">
            How different teams leverage AI Assistant for security success
          </p>
        </div>

        <div className="space-y-6">
          {useCaseScenarios.map((scenario, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{scenario.scenario}</h3>
                    <p className="text-muted-foreground mb-2">{scenario.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {scenario.persona}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Workflow</h4>
                    <ol className="space-y-1">
                      {scenario.workflow.map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-xs font-medium text-blue-500 mt-0.5">{idx + 1}.</span>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Outcomes</h4>
                    <ul className="space-y-1">
                      {scenario.outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-sm">{outcome}</span>
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

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl p-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Ready to Experience AI-Powered Security?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start your journey with our AI Security Assistant. Get instant security insights, 
            learn best practices, and build more secure applications with intelligent guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/ai-assistant">
                <Bot className="h-4 w-4 mr-2" />
                Start AI Chat
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/docs/features/rules">
                <ArrowRight className="h-4 w-4 mr-2" />
                Learn About Custom Rules
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}