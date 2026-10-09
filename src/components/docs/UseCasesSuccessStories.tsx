import React, { useState } from 'react'
import { 
  Trophy, 
  TrendingUp, 
  Shield,
  Clock,
  DollarSign,
  Users,
  Building,
  Zap,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Quote,
  ChevronDown,
  ChevronRight,
  Building2,
  Heart,
  ShoppingCart,
  Banknote,
  Globe,
  Code2,
  Database,
  Lock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { DocsContainer } from './DocsContainer'

interface UseCase {
  id: string
  title: string
  industry: string
  icon: React.ComponentType<any>
  description: string
  challenges: string[]
  solution: string
  benefits: { metric: string; value: string; improvement: string }[]
  timeline: string
  teamSize: string
  techStack: string[]
  keyFeatures: string[]
  roi: string
  testimonial?: {
    quote: string
    author: string
    role: string
    company: string
  }
}

interface SuccessStory {
  id: string
  company: string
  industry: string
  logo?: string
  size: string
  challenge: string
  solution: string
  results: { metric: string; before: string; after: string; improvement: string }[]
  timeline: string
  quote: string
  author: string
  role: string
  tags: string[]
}

const useCases: UseCase[] = [
  {
    id: 'learning-secure-coding',
    title: 'Learning Secure Coding',
    industry: 'Individual Developer',
    icon: Code2,
    description: 'Perfect for developers who want to improve their security skills without formal security training.',
    challenges: [
      'No formal security training',
      'Don\'t know where to start with security',
      'Want to write more secure code',
      'Need to understand why code is vulnerable'
    ],
    solution: 'AI explanations teach you why code is vulnerable, specific fix suggestions show exactly how to write secure code, progressive learning helps recognize patterns over time.',
    benefits: [
      { metric: 'Setup Time', value: '5 min', improvement: 'Quick installation' },
      { metric: 'AI Explanations', value: 'Every finding', improvement: 'Learn while coding' },
      { metric: 'Progress Tracking', value: 'Built-in', improvement: 'See improvement over time' },
      { metric: 'Cost', value: 'Free plan', improvement: 'Up to 5 repos' }
    ],
    timeline: 'Immediate start',
    teamSize: 'Individual developer',
    techStack: ['Any language', 'Any framework'],
    keyFeatures: [
      'AI explanations for each finding',
      'Specific fix suggestions',
      'Progressive learning',
      'Track improvement over time',
      'No security expertise required'
    ],
    roi: 'Continuous security skill improvement'
  },
  {
    id: 'startup-security',
    title: 'Startup Security Implementation',
    industry: 'Development Team',
    icon: Zap,
    description: 'Get enterprise-grade security without enterprise costs while building customer trust.',
    challenges: [
      'Need security for customer trust',
      'No dedicated security team',
      'Limited budget for expensive tools',
      'Need compliance reporting for customers',
      'Must scale from 2 to 50+ developers'
    ],
    solution: 'All-in-one platform replaces multiple expensive security tools, team collaboration features help everyone learn together, compliance reporting generates documentation for customers.',
    benefits: [
      { metric: 'Setup Time', value: '1 week', improvement: 'Team onboarding' },
      { metric: 'Tool Consolidation', value: 'All-in-one', improvement: 'vs multiple tools' },
      { metric: 'Compliance Reports', value: 'Automated', improvement: 'For sales team' },
      { metric: 'Team Learning', value: 'Built-in', improvement: 'Security training included' }
    ],
    timeline: '4 weeks to full implementation',
    teamSize: '2-50 developers',
    techStack: ['Any tech stack', 'Any cloud'],
    keyFeatures: [
      'Team collaboration',
      'Compliance reporting',
      'CI/CD integration',
      'Custom rules for your tech stack',
      'Scales with growth'
    ],
    roi: 'Replaces multiple expensive tools'
  },
  {
    id: 'enterprise-compliance',
    title: 'Enterprise Regulatory Compliance',
    industry: 'Enterprise',
    icon: Building,
    description: 'Automate compliance for HIPAA, PCI DSS, SOX, and other regulations across large organizations.',
    challenges: [
      'Manual compliance tracking is time-consuming',
      'Error-prone compliance processes',
      'Need audit-ready documentation',
      'Industry-specific requirements',
      'Must demonstrate continuous compliance'
    ],
    solution: 'Automated compliance mapping to regulatory frameworks, continuous compliance monitoring across all repositories, audit-ready documentation with historical evidence.',
    benefits: [
      { metric: 'Monitoring', value: 'Continuous', improvement: 'All code changes checked' },
      { metric: 'Reports', value: 'Automated', improvement: 'Quarterly compliance reports' },
      { metric: 'Audit Prep', value: 'Ready', improvement: 'Historical evidence available' },
      { metric: 'Exceptions', value: 'Structured', improvement: 'Compliance exception process' }
    ],
    timeline: 'Ongoing compliance monitoring',
    teamSize: '50+ developers',
    techStack: ['Any tech stack'],
    keyFeatures: [
      'Automated compliance mapping',
      'Continuous monitoring',
      'Historical evidence collection',
      'Custom compliance frameworks',
      'Exception management'
    ],
    roi: 'Reduced audit preparation time and costs'
  },
  {
    id: 'security-at-scale',
    title: 'Security Team at Scale',
    industry: 'Security Team',
    icon: Shield,
    description: 'Provide security guidance to 100+ developers without becoming a bottleneck.',
    challenges: [
      'Cannot manually review every code change',
      'Cannot provide individual training to every developer',
      'Need consistent security standards',
      'Must demonstrate security program value'
    ],
    solution: 'Automated security analysis scales to any number of repositories, AI-powered education teaches developers while they work, centralized policy management ensures consistent standards.',
    benefits: [
      { metric: 'Scale', value: 'Unlimited', improvement: 'Any number of repos' },
      { metric: 'Education', value: 'Automated', improvement: 'AI teaches developers' },
      { metric: 'Standards', value: 'Consistent', improvement: 'Centralized policies' },
      { metric: 'Reporting', value: 'Executive', improvement: 'Program metrics' }
    ],
    timeline: 'Continuous security operations',
    teamSize: 'Security team + 100+ developers',
    techStack: ['All languages and frameworks'],
    keyFeatures: [
      'Automated security analysis',
      'AI-powered developer education',
      'Centralized policy management',
      'Executive reporting',
      'Security program metrics'
    ],
    roi: 'Security team can scale with organization'
  },
  {
    id: 'cicd-integration',
    title: 'CI/CD Security Integration',
    industry: 'DevOps Team',
    icon: Zap,
    description: 'Automated security gates that don\'t slow down deployments for DevOps teams.',
    challenges: [
      'Need security checks in CI/CD pipelines',
      'Cannot slow down development velocity',
      'Must create security gates',
      'Integration with existing tool chain required'
    ],
    solution: 'Fast scanning (3-5 minutes) fits into any CI/CD pipeline, configurable failure thresholds balance security and velocity, multiple output formats integrate with any tool chain.',
    benefits: [
      { metric: 'Scan Time', value: '3-5 min', improvement: 'Fits CI/CD pipeline' },
      { metric: 'Thresholds', value: 'Configurable', improvement: 'Balance security & velocity' },
      { metric: 'Formats', value: 'Multiple', improvement: 'JSON, SARIF, CSV, PDF' },
      { metric: 'Integration', value: 'API', improvement: 'Custom workflows' }
    ],
    timeline: 'Continuous integration',
    teamSize: 'DevOps team + developers',
    techStack: ['Any CI/CD system'],
    keyFeatures: [
      'Fast scanning',
      'Configurable failure thresholds',
      'Multiple output formats',
      'API integration',
      'GitHub Actions, Jenkins, GitLab CI support'
    ],
    roi: 'Automated security without slowing deployments'
  }
]

const successStories: SuccessStory[] = []

const industryMetrics = [
  { industry: 'Financial Services', deployments: 'Growing', avgROI: 'Varies by use case', satisfaction: 'Platform in active development' },
  { industry: 'Healthcare', deployments: 'Growing', avgROI: 'Varies by use case', satisfaction: 'Platform in active development' },
  { industry: 'E-commerce', deployments: 'Growing', avgROI: 'Varies by use case', satisfaction: 'Platform in active development' },
  { industry: 'Manufacturing', deployments: 'Growing', avgROI: 'Varies by use case', satisfaction: 'Platform in active development' },
  { industry: 'Technology', deployments: 'Growing', avgROI: 'Varies by use case', satisfaction: 'Platform in active development' }
]

export function UseCasesSuccessStories() {
  const [selectedUseCase, setSelectedUseCase] = useState<string>('fintech-startup')
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set())

  const toggleStoryExpansion = (storyId: string) => {
    const newExpanded = new Set(expandedStories)
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId)
    } else {
      newExpanded.add(storyId)
    }
    setExpandedStories(newExpanded)
  }

  const selectedUseCaseData = useCases.find(uc => uc.id === selectedUseCase)

  return (
    <DocsContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Trophy className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">DevSecureX Use Cases</h1>
            <p className="text-lg text-muted-foreground">
              How DevSecureX fits into real development workflows for developers and teams of all sizes
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> The scenarios below show how DevSecureX can be applied in different contexts.
            From individual developers learning secure coding to enterprise teams managing hundreds of repositories.
          </p>
        </div>
      </div>

      <Tabs defaultValue="use-cases" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
        </TabsList>

        <TabsContent value="use-cases" className="space-y-6">
          {/* Use Case Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Your Use Case</CardTitle>
              <CardDescription>Choose a scenario that matches your industry and company size</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {useCases.map((useCase) => {
                  const UseCaseIcon = useCase.icon
                  const isSelected = useCase.id === selectedUseCase
                  return (
                    <Button
                      key={useCase.id}
                      variant={isSelected ? "default" : "outline"}
                      className="h-auto p-3 sm:p-4 flex flex-col items-start space-y-2 text-left"
                      onClick={() => setSelectedUseCase(useCase.id)}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <UseCaseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="font-medium text-xs sm:text-sm">{useCase.title}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {useCase.industry}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Use Case */}
          {selectedUseCaseData && (
            <div className="space-y-6">
              {/* Use Case Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <selectedUseCaseData.icon className="h-6 w-6 text-blue-500" />
                    <div>
                      <CardTitle>{selectedUseCaseData.title}</CardTitle>
                      <CardDescription>{selectedUseCaseData.industry}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{selectedUseCaseData.description}</p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-xs sm:text-sm">{selectedUseCaseData.timeline}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-xs sm:text-sm">{selectedUseCaseData.teamSize}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs sm:text-sm">{selectedUseCaseData.roi}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Challenges & Solution */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-red-500" />
                      <span>Challenges</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedUseCaseData.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Solution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{selectedUseCaseData.solution}</p>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Features Used:</h4>
                      <div className="space-y-2">
                        {selectedUseCaseData.keyFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results & Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Results & Benefits</CardTitle>
                  <CardDescription>Measurable improvements achieved with DevSecureX</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {selectedUseCaseData.benefits.map((benefit, index) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-500 mb-2">
                          {benefit.value}
                        </div>
                        <div className="text-sm font-medium mb-1">{benefit.metric}</div>
                        <div className="text-xs text-muted-foreground">
                          {benefit.improvement}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tech Stack */}
              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedUseCaseData.techStack.map((tech) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </TabsContent>

        <TabsContent value="getting-started" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <Code2 className="h-6 w-6 text-blue-500" />
                  <CardTitle>Individual Developers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <code className="text-sm">
                    npm install -g @devsecurex/cli<br/>
                    devsecurex auth setup<br/>
                    devsecurex scan
                  </code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Free plan covers up to 5 repositories with complete CLI access and AI explanations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-6 w-6 text-purple-500" />
                  <CardTitle>Small Teams</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Sign up for Team plan</li>
                  <li>Connect GitHub repositories</li>
                  <li>Set up team collaboration</li>
                  <li>Integrate with CI/CD</li>
                </ol>
                <p className="text-sm text-muted-foreground">
                  Perfect for 2-10 developers who need collaboration features.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <Building className="h-6 w-6 text-green-500" />
                  <CardTitle>Enterprise</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Schedule demo</li>
                  <li>Enterprise trial</li>
                  <li>Custom onboarding</li>
                  <li>Rollout with support</li>
                </ol>
                <p className="text-sm text-muted-foreground">
                  For organizations with 50+ developers requiring scale and governance.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Support for Your Use Case</CardTitle>
              <CardDescription>
                Every use case is different. Our team can help you succeed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>Assessment:</strong> Assess your current security practices and identify improvement opportunities
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>Strategy:</strong> Design implementation strategies that fit your organization and workflows
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>Training:</strong> Provide training and support to ensure successful adoption
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>Optimization:</strong> Measure and optimize your security program over time
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DocsContainer>
  )
}