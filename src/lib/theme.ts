/**
 * Theme management utilities for DevSecureX
 * Handles theme initialization, persistence, and system preference detection
 */

import * as React from 'react'

export type Theme = 'light' | 'dark' | 'system'

export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: Theme = 'system'
  private listeners: ((theme: Theme) => void)[] = []

  private constructor() {
    this.initialize()
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  /**
   * Initialize theme on app startup
   */
  public initialize() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      this.currentTheme = savedTheme
    }

    // Apply initial theme
    this.applyTheme()

    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentTheme === 'system') {
          this.applyTheme()
        }
      })
    }
  }

  /**
   * Set theme and persist to localStorage
   */
  public setTheme(theme: Theme) {
    this.currentTheme = theme
    localStorage.setItem('theme', theme)
    this.applyTheme()
    this.notifyListeners()
  }

  /**
   * Get current theme
   */
  public getTheme(): Theme {
    return this.currentTheme
  }

  /**
   * Get effective theme (resolves 'system' to actual theme)
   */
  public getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return this.currentTheme
  }

  /**
   * Toggle between light and dark theme
   */
  public toggleTheme() {
    const effectiveTheme = this.getEffectiveTheme()
    this.setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme() {
    const root = document.documentElement
    const effectiveTheme = this.getEffectiveTheme()

    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add current theme class
    root.classList.add(effectiveTheme)
    
    // Update theme-color meta tag for better mobile experience
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', effectiveTheme === 'dark' ? '#0f172a' : '#ffffff')
    }
  }

  /**
   * Subscribe to theme changes
   */
  public subscribe(listener: (theme: Theme) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentTheme))
  }
}

// Export singleton instance
export const themeManager = ThemeManager.getInstance()

// React hook for using theme in components
export function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>(themeManager.getTheme())

  React.useEffect(() => {
    const unsubscribe = themeManager.subscribe(setThemeState)
    return unsubscribe
  }, [])

  return {
    theme,
    effectiveTheme: themeManager.getEffectiveTheme(),
    setTheme: themeManager.setTheme.bind(themeManager),
    toggleTheme: themeManager.toggleTheme.bind(themeManager),
  }
}

// Initialize theme as soon as this module loads
if (typeof window !== 'undefined') {
  themeManager.initialize()
}