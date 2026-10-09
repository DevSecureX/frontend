import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  
  // Close sidebar when navigating to new routes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onMenuClick={handleMenuClick} 
        isMenuOpen={sidebarOpen}
      />
      
      <div className="flex flex-1 pt-16">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={handleSidebarClose}
        />
        
        <main className="flex-1 md:ml-64 min-w-0">
          {/* Responsive container with mobile-first padding */}
          <div className="mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-7xl min-w-0 w-full overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-brand-accent to-background">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}