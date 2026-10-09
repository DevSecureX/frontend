import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useRef, useEffect, useCallback } from 'react'
import { 
  LayoutDashboard,
  FolderGit2,
  ScanLine,
  GitPullRequest,
  Settings,
  CreditCard,
  BarChart3,
  Shield,
  Terminal,
  BookOpen,
  HelpCircle,
  Zap,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { TimeRange } from '@/lib/api/analytics'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<any>
  badge?: string
  description: string
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and quick stats'
  },
  {
    title: 'Repositories',
    href: '/repositories',
    icon: FolderGit2,
    description: 'Manage connected repositories'
  },
  {
    title: 'Security Scans',
    href: '/scans',
    icon: ScanLine,
    // badge: '3',
    description: 'View scan results and history'
  },
  {
    title: 'Pull Requests',
    href: '/pull-requests',
    icon: GitPullRequest,
    // badge: '2',
    description: 'PR security reviews'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Security metrics and trends'
  }
]

const toolsNavItems: NavItem[] = [
  {
    title: 'AI Assistant',
    href: '/ai-assistant',
    icon: Zap,
    description: 'Get security recommendations'
  },
  // {
  //   title: 'Terminal',
  //   href: '/terminal',
  //   icon: Terminal,
  //   description: 'Run security tools'
  // },
  {
    title: 'Rules Engine',
    href: '/rules',
    icon: Shield,
    description: 'Custom security rules'
  }
]

const supportNavItems: NavItem[] = [
  {
    title: 'Documentation',
    href: '/docs',
    icon: BookOpen,
    description: 'Integration guides'
  },
  {
    title: 'Help & Support',
    href: '/support',
    icon: HelpCircle,
    description: 'Get help and support'
  }
]

const accountNavItems: NavItem[] = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account and preferences'
  },
  // {
  //   title: 'Billing',
  //   href: '/billing',
  //   icon: CreditCard,
  //   description: 'Subscription and usage'
  // },
  // {
  //   title: 'Admin',
  //   href: '/admin',
  //   icon: ShieldCheck,
  //   description: 'System administration'
  // }
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const sidebarScrollRef = useRef<HTMLDivElement>(null)
  
  // Store and restore sidebar scroll position
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('sidebar-scroll-position')
    if (savedScrollPosition && sidebarScrollRef.current) {
      sidebarScrollRef.current.scrollTop = parseInt(savedScrollPosition, 10)
    }
  }, [])

  // Save scroll position before navigation (throttled for performance)
  const saveScrollPosition = useCallback(() => {
    if (sidebarScrollRef.current) {
      sessionStorage.setItem('sidebar-scroll-position', sidebarScrollRef.current.scrollTop.toString())
    }
  }, [])

  // Throttled scroll save for performance
  const throttledSaveScroll = useCallback(() => {
    clearTimeout(throttledSaveScroll.timeoutId)
    throttledSaveScroll.timeoutId = setTimeout(saveScrollPosition, 100)
  }, [saveScrollPosition]) as any

  // Fetch the same data as dashboard for dynamic security score
  const { data: overviewAnalytics } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.analytics.getOverview(TimeRange.MONTH),
    refetchInterval: 300000, // Refresh every 5 minutes
    retry: 1,
  })

  const { data: realTimeMetrics } = useQuery({
    queryKey: ['analytics-realtime'],
    queryFn: () => api.analytics.getRealTimeMetrics(),
    refetchInterval: 120000, // Refresh every 2 minutes
    retry: 1,
  })

  const { data: repositories } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => api.repositories.list(),
    retry: 1,
  })

  // Calculate security score using same logic as dashboard
  const securityScore = Math.round(overviewAnalytics?.metrics?.average_security_score || realTimeMetrics?.security_score_avg || 0)
  const totalScans = overviewAnalytics?.metrics?.total_scans || 0
  const totalRepositories = repositories?.length || 0

  // Determine security score grade
  const getScoreGrade = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const NavSection = ({ 
    title, 
    items 
  }: { 
    title: string
    items: NavItem[] 
  }) => (
    <div className="space-y-2">
      <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <nav className="space-y-1 sidebar-nav">
        {items.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          
          return (
            <button
              key={item.href}
              onClick={(e) => {
                e.preventDefault()
                
                // Save current scroll position before navigation
                saveScrollPosition()
                
                // Close sidebar on mobile
                onClose?.()
                
                // Simple navigation without scroll interference
                navigate(item.href)
              }}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-700 dark:hover:text-white cursor-pointer w-full text-left',
                isActive && 'bg-accent text-accent-foreground dark:bg-gray-700 dark:text-white'
              )}
            >
              <Icon className={cn(
                'h-4 w-4 shrink-0',
                isActive ? 'text-brand-600 dark:text-blue-400' : 'text-muted-foreground dark:text-gray-400'
              )} />
              <div className="flex flex-1 items-center justify-between">
                <span>{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="h-5 px-1.5 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 bg-background transition-transform duration-200 ease-in-out sm:w-80 md:w-64 md:translate-x-0 md:shadow-none',
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
          'border-r md:border-r'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Content */}
          <div
            ref={sidebarScrollRef}
            className="flex-1 overflow-y-auto py-4 sm:py-6"
            onScroll={throttledSaveScroll}
          >
            <div className="space-y-6 px-3 sm:space-y-8 sm:px-4">
              <NavSection title="Main" items={mainNavItems} />
              <NavSection title="Tools" items={toolsNavItems} />
              <NavSection title="Support" items={supportNavItems} />
              <NavSection title="Account" items={accountNavItems} />
            </div>
          </div>

          {/* Sidebar Footer - Dynamic Security Score */}
          <div className="border-t p-3 sm:p-4">
            <div className="rounded-lg border border-border bg-brand-accent p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 flex-shrink-0 text-brand-primary" />
                <span className="text-sm font-medium text-foreground">
                  Overall Security Score
                </span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-brand-primary sm:text-2xl">
                    {securityScore || '-'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {securityScore
                      ? getScoreGrade(securityScore)
                      : 'No score yet'}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full border border-border bg-progress-bg">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      securityScore >= 80
                        ? 'bg-security-safe-500'
                        : securityScore >= 60
                          ? 'bg-security-low-500'
                          : securityScore >= 40
                            ? 'bg-security-medium-500'
                            : 'bg-security-high-500'
                    }`}
                    style={{ width: `${securityScore || 0}%` }}
                  />
                </div>
                {(totalScans > 0 || totalRepositories > 0) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Based on {totalScans} scans across {totalRepositories}{' '}
                    repositories
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}