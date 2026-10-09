import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  ChevronRight,
  Search,
  Menu,
  X,
  Book,
  Rocket,
  Sparkles,
  Shield,
  Code,
  Briefcase,
  Target,
  ArrowLeft,
  ExternalLink,
  PanelLeft,
  PanelRight,
  Terminal
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface DocNavItem {
  title: string
  href: string
  isNew?: boolean
  isPremium?: boolean
  children?: DocNavItem[]
}

interface DocSection {
  title: string
  icon: React.ComponentType<any>
  items: DocNavItem[]
}

const docNavigation: DocSection[] = [
  {
    title: 'Getting Started',
    icon: Rocket,
    items: [
      { title: 'Platform Overview', href: '/docs/platform-overview' },
      { title: 'Quick Start for Developers', href: '/docs/quick-start-developers', isNew: true },
      { title: 'Quick Start for CTOs', href: '/docs/quick-start-ctos' },
      { title: 'Quick Start for Security Teams', href: '/docs/quick-start-security' }
    ]
  },
  {
    title: 'Platform Features',
    icon: Sparkles,
    items: [
      { title: 'Security Dashboard', href: '/docs/features/dashboard' },
      { title: 'Repository Management', href: '/docs/features/repositories' },
      { title: 'Security Scanning', href: '/docs/features/scanning' },
      { title: 'Pull Request Reviews', href: '/docs/features/pull-requests' },
      { title: 'AI Security Assistant', href: '/docs/features/ai-assistant' }
      // Additional feature documentation coming soon
    ]
  },
  {
    title: 'Security Tools',
    icon: Shield,
    items: [
      { title: 'Security Tools Overview', href: '/docs/security-tools-overview' }
      // Additional security documentation coming soon
    ]
  },
  {
    title: 'CLI Tools',
    icon: Terminal,
    items: [
      { title: 'CLI Documentation', href: '/docs/cli', isNew: true }
    ]
  },
  {
    title: 'Integrations',
    icon: Code,
    items: [
      { title: 'GitHub Integration', href: '/docs/integrations/github' },
      { title: 'API Documentation', href: '/docs/api' }
    ]
  },
  {
    title: 'Use Cases & Success Stories',
    icon: Target,
    items: [
      { title: 'Use Cases & Success Stories', href: '/docs/use-cases' }
    ]
  }
]

interface SidebarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

interface DocsSidebarProps extends SidebarProps {
  isMobile?: boolean
  onMobileLinkClick?: () => void
}

function DocsSidebar({ searchQuery, setSearchQuery, isMobile = false, onMobileLinkClick }: DocsSidebarProps) {
  const location = useLocation()
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    )
  }

  // Scroll to top handler for sidebar links
  const handleLinkClick = () => {
    // Close mobile sidebar when link is clicked
    if (isMobile && onMobileLinkClick) {
      onMobileLinkClick()
    }
    // Scroll to top when a sidebar link is clicked
    // Use requestAnimationFrame to ensure immediate execution
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })
  }

  const filteredNavigation = docNavigation.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.children?.some(child =>
        child.title.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    )
  })).filter(section => section.items.length > 0)

  const renderNavItem = (item: DocNavItem, depth = 0) => {
    const isActive = location.pathname === item.href
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.includes(item.title)
    const isChildActive = item.children?.some(child => location.pathname === child.href)

    return (
      <div key={item.href}>
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleSection(item.title)}
              className={cn(
                'flex-1 flex items-center justify-between text-left px-3 py-3 text-sm rounded-lg transition-colors',
                isMobile ? 'min-h-[48px]' : 'min-h-[44px]',
                depth > 0 && 'ml-4',
                (isActive || isChildActive)
                  ? 'bg-blue-500/10 text-blue-600 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <div className="flex items-center">
                <span>{item.title}</span>
                {item.isNew && (
                  <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                    New
                  </Badge>
                )}
                {item.isPremium && (
                  <Badge variant="secondary" className="ml-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
                    Pro
                  </Badge>
                )}
              </div>
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'transform rotate-90'
                )}
              />
            </button>
          ) : (
            <Link
              to={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex-1 flex items-center px-3 py-3 text-sm rounded-lg transition-colors',
                isMobile ? 'min-h-[48px]' : 'min-h-[44px]',
                depth > 0 && 'ml-4',
                isActive
                  ? 'bg-blue-500/10 text-blue-600 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span>{item.title}</span>
              {item.isNew && (
                <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                  New
                </Badge>
              )}
              {item.isPremium && (
                <Badge variant="secondary" className="ml-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
                  Pro
                </Badge>
              )}
            </Link>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2 space-y-1">
            {item.children!.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Header with Close Button */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center">
            <Book className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-semibold text-foreground">Documentation</span>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </SheetClose>
        </div>
      )}

      {/* Search */}
      <div className={cn("border-b", isMobile ? "p-3" : "p-4")}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
          <Input
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("pl-9", isMobile && "h-10")}
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className={cn("space-y-4 sm:space-y-6", isMobile ? "p-3" : "p-3 sm:p-4")}>
          {filteredNavigation.map((section) => (
            <div key={section.title}>
              <div className={cn("flex items-center mb-3", isMobile && "mb-2")}>
                <section.icon className="h-4 w-4 text-blue-500 mr-2" />
                <h3 className="font-semibold text-sm text-foreground">{section.title}</h3>
              </div>
              <div className="space-y-1">
                {section.items.map(item => renderNavItem(item))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className={cn("border-t", isMobile ? "p-3" : "p-4")}>
        <div className={cn("flex items-center justify-between text-sm text-muted-foreground", isMobile && "flex-col space-y-2")}>
          <span>DevSecureX Docs</span>
          <Button variant="ghost" size="sm" asChild className={cn(isMobile && "w-full justify-center")}>
            <Link to="/support" className="flex items-center" onClick={handleLinkClick}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function DocsLayout() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Check localStorage for saved sidebar state
    const saved = localStorage.getItem('docs-sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })
  const location = useLocation()
  const mainContentRef = useRef<HTMLDivElement>(null)

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('docs-sidebar-collapsed', JSON.stringify(newState))
  }

  // Scroll to top when docs route changes
  useEffect(() => {
    if (!location.pathname.startsWith('/docs')) return

    // Scroll to top with multiple fallback strategies
    const scrollToTop = () => {
      try {
        // Primary method: window scroll (works in most cases)
        window.scrollTo(0, 0)

        // Fallback: try scrolling the main content container if it exists and is scrollable
        if (mainContentRef.current) {
          const element = mainContentRef.current
          if (element.scrollHeight > element.clientHeight) {
            element.scrollTop = 0
          }
        }

        // Additional fallback: scroll document element (for older browsers)
        if (document.documentElement.scrollTop > 0) {
          document.documentElement.scrollTop = 0
        }
      } catch (error) {
        // Fallback for browsers that don't support instant scrolling
        try {
          window.scrollTo(0, 0)
          if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0
          }
          document.documentElement.scrollTop = 0
        } catch (e) {
          console.warn('Could not scroll to top:', e)
        }
      }
    }

    // Use requestAnimationFrame to ensure the route change and DOM updates have been processed
    requestAnimationFrame(() => {
      // Small additional delay to ensure content has loaded
      setTimeout(scrollToTop, 50)
    })
  }, [location.pathname])

  // Check if we're on the main docs page
  const isMainDocsPage = location.pathname === '/docs' || location.pathname === '/docs/'

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center">
            {!isMainDocsPage && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="mr-2"
              >
                <Link to="/docs">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <div className="flex items-center">
              <Book className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-semibold">Documentation</span>
            </div>
          </div>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90vw] max-w-[400px] p-0 border-0 [&>button]:hidden">
              <div className="h-full overflow-hidden">
                <DocsSidebar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isMobile={true}
                  onMobileLinkClick={() => setSidebarOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background transition-all duration-300 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-80'}`}>
          <div className="flex items-center p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mr-2"
            >
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <Book className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-semibold">Documentation</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="ml-auto"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>
          </div>
          {!sidebarCollapsed && (
            <DocsSidebar searchQuery={searchQuery} setSearchQuery={setSearchQuery} isMobile={false} />
          )}
        </div>

        {/* Main Content */}
        <div
          ref={mainContentRef}
          className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'} overflow-y-auto`}
        >
          <main className="min-h-screen bg-background">
            <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}