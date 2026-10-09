import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Shield, 
  Search, 
  Settings, 
  User, 
  Moon, 
  Sun, 
  Menu,
  X,
  LogOut 
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { NotificationBell } from '@/components/notifications/NotificationProvider'
import { useTheme } from '@/lib/theme'

interface NavbarProps {
  onMenuClick?: () => void
  isMenuOpen?: boolean
}

export function Navbar({ onMenuClick, isMenuOpen = false }: NavbarProps) {
  const { effectiveTheme, toggleTheme } = useTheme()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }


  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={onMenuClick}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-brand-600 flex-shrink-0" />
            <span className="hidden text-lg sm:text-xl font-bold sm:inline-block">
              DevSecureX
            </span>
          </Link>

          {/* Navigation Links - Hidden on mobile */}
          <nav className="hidden items-center gap-4 lg:gap-6 md:flex">
            <Link
              to="/dashboard"
              className="text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-blue-400 whitespace-nowrap dark:text-gray-200"
            >
              Dashboard
            </Link>
            <Link
              to="/repositories"
              className="text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-blue-400 whitespace-nowrap dark:text-gray-200"
            >
              Repositories
            </Link>
            <Link
              to="/scans"
              className="text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-blue-400 whitespace-nowrap dark:text-gray-200"
            >
              Scans
            </Link>
            <Link
              to="/pull-requests"
              className="text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-blue-400 whitespace-nowrap dark:text-gray-200"
            >
              Pull Requests
            </Link>
          </nav>
        </div>

        {/* Center - Search */}
        <div className="hidden flex-1 items-center justify-center px-4 lg:px-6 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search repositories, scans, issues..."
              className="pl-10 pr-4 h-9"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Icon - Mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-9 w-9"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Real-time Notifications */}
          <NotificationBell />

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="h-9 w-9"
            aria-label={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {effectiveTheme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                aria-label="User menu"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="truncate">{user?.first_name} {user?.last_name}</span>
                <span className="text-xs font-normal text-muted-foreground truncate">
                  {user?.email}
                </span>
                <Badge variant="outline" className="mt-1 w-fit text-xs">
                  {user?.is_premium ? 'Premium' : 'Free Plan'}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem asChild>
                <Link to="/billing">
                  <User className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span className="w-full text-left">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}