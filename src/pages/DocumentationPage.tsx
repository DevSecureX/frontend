import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Search,
  Book,
  Rocket,
  Shield,
  Zap,
  Github,
  Code,
  Users,
  Settings,
  TrendingUp,
  ChevronRight,
  Star,
  Clock,
  Eye,
  ArrowUpRight,
  Sparkles,
  Target,
  Award,
  Globe,
  HeartHandshake,
  Briefcase,
  Terminal
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DocsContainer } from '@/components/docs/DocsContainer'

interface DocSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  items: DocItem[]
  color: string
}

interface DocItem {
  title: string
  description: string
  href: string
  badge?: string
  isNew?: boolean
  isPremium?: boolean
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Quick start guides for different user types',
    icon: Rocket,
    color: 'bg-blue-500',
    items: [
      {
        title: 'Platform Overview',
        description: 'What is DevSecureX and how it works',
        href: '/docs/platform-overview'
      },
      {
        title: 'Quick Start for Developers',
        description: 'Get up and running in 5 minutes',
        href: '/docs/quick-start-developers',
        isNew: true
      },
      {
        title: 'Quick Start for CTOs',
        description: 'Executive overview and setup',
        href: '/docs/quick-start-ctos'
      },
      {
        title: 'Quick Start for Security Teams',
        description: 'Security-focused onboarding',
        href: '/docs/quick-start-security'
      }
    ]
  },
  {
    id: 'features',
    title: 'Platform Features',
    description: 'Comprehensive feature documentation',
    icon: Sparkles,
    color: 'bg-purple-500',
    items: [
      {
        title: 'Security Dashboard',
        description: 'Monitor your security posture',
        href: '/docs/features/dashboard'
      },
      {
        title: 'Repository Management',
        description: 'Connect and manage repositories',
        href: '/docs/features/repositories'
      },
      {
        title: 'Security Scanning',
        description: '20+ security tools and analysis',
        href: '/docs/features/scanning'
      },
      {
        title: 'Pull Request Reviews',
        description: 'Automated security analysis for PRs',
        href: '/docs/features/pull-requests'
      },
      {
        title: 'AI Security Assistant',
        description: 'Get intelligent security recommendations',
        href: '/docs/features/ai-assistant',
        badge: 'AI-Powered'
      },
      // Additional platform features coming soon
    ]
  },
  {
    id: 'security',
    title: 'Security Tools',
    description: 'Comprehensive security scanning capabilities',
    icon: Shield,
    color: 'bg-red-500',
    items: [
      {
        title: 'Security Tools Overview',
        description: '20+ integrated security scanning tools',
        href: '/docs/security-tools-overview'
      }
      // Detailed security documentation coming soon
    ]
  },
  {
    id: 'cli-tools',
    title: 'CLI Tools',
    description: 'Command-line interface for security scanning',
    icon: Terminal,
    color: 'bg-slate-600',
    items: [
      {
        title: 'CLI Documentation',
        description: 'Complete guide to DevSecureX CLI with installation, authentication, and all commands',
        href: '/docs/cli',
        isNew: true
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with your existing workflow',
    icon: Code,
    color: 'bg-green-500',
    items: [
      {
        title: 'GitHub Integration',
        description: 'Connect repositories via webhooks for automated security scanning',
        href: '/docs/integrations/github'
      },
      {
        title: 'API Documentation',
        description: 'Complete API reference and examples',
        href: '/docs/api'
      }
      // Additional integrations coming soon
    ]
  },
  {
    id: 'use-cases',
    title: 'Use Cases',
    description: 'Real-world scenarios and success stories',
    icon: Target,
    color: 'bg-teal-500',
    items: [
      {
        title: 'Use Cases & Success Stories',
        description: 'Real-world scenarios, customer stories and how teams use DevSecureX',
        href: '/docs/use-cases'
      }
    ]
  }
]

const quickLinks = [
  {
    title: 'CLI Documentation',
    description: 'Complete command-line guide with examples',
    href: '/docs/cli',
    icon: Terminal
  },
  {
    title: 'GitHub Integration Guide',
    description: 'Connect repositories in minutes',
    href: '/docs/integrations/github',
    icon: Github
  },
  {
    title: 'Security Tools Overview',
    description: '20+ integrated security scanning tools',
    href: '/docs/security-tools-overview',
    icon: Shield
  },
  {
    title: 'API Documentation',
    description: 'Complete API reference and examples',
    href: '/docs/api',
    icon: Code
  }
]

const stats = [
  { label: 'Security Tools Integrated', value: '20+', icon: Shield },
  { label: 'Languages Supported', value: '10+', icon: Code },
  { label: 'AI-Powered Analysis', value: 'Yes', icon: Sparkles },
  { label: 'Open Source', value: 'Yes', icon: Github }
]

export function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const filteredSections = docSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0)

  // Handle search - navigate to first result if available
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && filteredSections.length > 0 && filteredSections[0].items.length > 0) {
      // Use React Router navigation for proper scroll-to-top behavior
      const firstResult = filteredSections[0].items[0].href
      navigate(firstResult)
      setSearchQuery('') // Clear search after navigation
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <DocsContainer maxWidth="6xl" className="py-12 lg:py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Book className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              DevSecureX
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                Documentation
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Everything you need to secure your code, from quick starts to advanced enterprise features. 
              Build secure applications with confidence using our AI-powered security platform.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 h-12 text-base bg-background/60 backdrop-blur-sm border-input focus:border-ring"
                />
                {searchQuery && filteredSections.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-background border border-input rounded-md mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                    {filteredSections.slice(0, 3).map((section) => (
                      <div key={section.id} className="p-2">
                        <div className="text-xs text-muted-foreground font-medium mb-1">{section.title}</div>
                        {section.items.slice(0, 3).map((item, index) => (
                          <Link
                            key={index}
                            to={item.href}
                            className="block px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                            onClick={() => setSearchQuery('')}
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border hover:bg-background/80 transition-colors">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </DocsContainer>
      </div>

      <DocsContainer maxWidth="6xl" className="py-8">
        {/* Quick Start Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get Started in Minutes</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose your path based on your role and get up and running quickly
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.href} className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-blue-500/20 bg-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <link.icon className="h-6 w-6 text-blue-500" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-12">
          {filteredSections.map((section) => (
            <div key={section.id}>
              <div className="flex items-center mb-6">
                <div className={`p-2 ${section.color} rounded-lg mr-4`}>
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  <p className="text-muted-foreground">{section.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {section.items.map((item, index) => (
                  <Link key={index} to={item.href} className="group">
                    <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border hover:border-blue-500/30 bg-card">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base">
                            {item.title}
                          </h3>
                          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                            {item.isNew && (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                                New
                              </Badge>
                            )}
                            {item.isPremium && (
                              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                <Star className="h-3 w-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                            {item.badge && (
                              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{item.description}</p>
                        <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          Read more
                          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl p-8 border max-w-4xl mx-auto">
          <div className="text-center">
            <HeartHandshake className="h-12 w-12 text-blue-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you succeed with DevSecureX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/support">
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/docs/api">
                  API Documentation
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/docs/cli">
                  CLI Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DocsContainer>
    </div>
  )
}