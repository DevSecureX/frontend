import { useState, useRef, useEffect } from 'react'
import { 
  Search, 
  Clock, 
  GitBranch, 
  Shield, 
  Code, 
  FileText,
  X,
  Trash2,
  Keyboard,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useScanStore } from '@/store'

interface ScanSmartSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

interface SearchSuggestion {
  id: string
  type: 'repository' | 'branch' | 'scan_type' | 'status' | 'recent'
  text: string
  category: string
  scan?: any
}

export function ScanSmartSearch({ 
  value, 
  onChange, 
  placeholder = "Search scans by repository, branch, scan type, or commit...",
  className 
}: ScanSmartSearchProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([])
  
  const { scans } = useScanStore()

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('scan-recent-searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse recent searches:', e)
      }
    }
  }, [])

  // Generate suggestions based on current input and available scans
  const generateSuggestions = (query: string): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = []
    const lowerQuery = query.toLowerCase()

    // Only generate suggestions if there's actual input
    if (query.trim() === '') {
      return suggestions
    }

    // Repository suggestions
    const repositories = [...new Set(scans.map(scan => scan.repo_full_name))]
    repositories
      .filter(repo => repo.toLowerCase().includes(lowerQuery))
      .slice(0, 5)
      .forEach(repo => {
        suggestions.push({
          id: `repo-${repo}`,
          type: 'repository',
          text: repo,
          category: 'Repositories'
        })
      })

    // Branch suggestions
    const branches = [...new Set(scans.map(scan => scan.branch))]
    branches
      .filter(branch => branch.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(branch => {
        suggestions.push({
          id: `branch-${branch}`,
          type: 'branch',
          text: branch,
          category: 'Branches'
        })
      })

    // Scan type suggestions
    const scanTypes = [...new Set(scans.map(scan => scan.scan_type))]
    scanTypes
      .filter(type => type.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(type => {
        suggestions.push({
          id: `type-${type}`,
          type: 'scan_type',
          text: type,
          category: 'Scan Types'
        })
      })

    // Status suggestions
    const statuses = ['completed', 'processing', 'queued', 'failed']
    statuses
      .filter(status => status.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(status => {
        suggestions.push({
          id: `status-${status}`,
          type: 'status',
          text: status,
          category: 'Status'
        })
      })

    // Recent searches that match current input
    const matchingRecentSearches = recentSearches
      .filter(search => search.toLowerCase().includes(lowerQuery))
      .slice(0, 3)

    matchingRecentSearches.forEach((search, index) => {
      suggestions.push({
        id: `recent-${index}`,
        type: 'recent',
        text: search,
        category: 'Recent Searches'
      })
    })

    return suggestions.slice(0, 12) // Limit total suggestions
  }

  const suggestions = generateSuggestions(value)
  const showSuggestions = isFocused && suggestions.length > 0

  const addRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return
    
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('scan-recent-searches', JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('scan-recent-searches')
  }

  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    setSelectedIndex(-1)
  }

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    const searchText = suggestion.text
    onChange(searchText)
    addRecentSearch(searchText)
    setIsFocused(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      addRecentSearch(value.trim())
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex])
        } else if (value.trim()) {
          addRecentSearch(value.trim())
          setIsFocused(false)
        }
        break
      case 'Escape':
        setIsFocused(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
      case 'Tab':
        if (selectedIndex >= 0) {
          e.preventDefault()
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
    }
  }

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [selectedIndex])

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'repository':
        return <GitBranch className="h-4 w-4 text-blue-500" />
      case 'branch':
        return <Code className="h-4 w-4 text-green-500" />
      case 'scan_type':
        return <Shield className="h-4 w-4 text-purple-500" />
      case 'status':
        return <CheckCircle className="h-4 w-4 text-orange-500" />
      case 'recent':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <Search className="h-4 w-4 text-gray-500" />
    }
  }

  // Group suggestions by category
  const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
    const category = suggestion.category || 'Other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(suggestion)
    return groups
  }, {} as Record<string, typeof suggestions>)

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-[1] pointer-events-none" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              // Delay blur to allow clicks on suggestions
              setTimeout(() => {
                if (!e.currentTarget || !document.activeElement || !e.currentTarget.contains(document.activeElement)) {
                  setIsFocused(false)
                  setSelectedIndex(-1)
                }
              }, 150)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck="false"
            className={cn(
              "pl-10 pr-10 w-full relative z-0 focus-visible:ring-0 focus-visible:ring-offset-0 dark:focus-visible:ring-0",
              className
            )}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange('')
                inputRef.current?.focus()
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-[1] h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full mt-1 w-full z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden max-h-80 overflow-y-auto">
          <div className="p-2">
            {Object.keys(groupedSuggestions).length === 0 && value.trim() !== '' && (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No suggestions found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}

            {Object.entries(groupedSuggestions).map(([category, items], categoryIndex) => (
              <div key={category} className={categoryIndex > 0 ? 'mt-4' : ''}>
                {/* Category Header */}
                <div className="flex items-center justify-between px-3 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {category}
                  </h4>
                  {category === 'Recent Searches' && items.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Suggestions */}
                {items.map((suggestion, index) => {
                  const globalIndex = suggestions.indexOf(suggestion)
                  return (
                    <div
                      key={suggestion.id}
                      ref={(el) => { suggestionRefs.current[globalIndex] = el }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 mx-1 rounded-xl cursor-pointer transition-all duration-150",
                        selectedIndex === globalIndex
                          ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      )}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {getSuggestionIcon(suggestion.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {suggestion.text}
                          </span>
                          {suggestion.type === 'repository' && (
                            <Badge variant="secondary" className="text-xs">
                              Repository
                            </Badge>
                          )}
                          {suggestion.type === 'branch' && (
                            <Badge variant="outline" className="text-xs">
                              Branch
                            </Badge>
                          )}
                        </div>
                      </div>
                      {selectedIndex === globalIndex && (
                        <Badge variant="outline" className="text-xs">
                          ⏎
                        </Badge>
                      )}
                    </div>
                  )
                })}
                
                {categoryIndex < Object.keys(groupedSuggestions).length - 1 && (
                  <Separator className="mt-2" />
                )}
              </div>
            ))}

            {/* Keyboard Shortcuts Help */}
            {suggestions.length > 0 && (
              <>
                <Separator className="mt-4" />
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Keyboard className="h-3 w-3" />
                    <span>Use ↑↓ arrows to navigate, ⏎ to select, ESC to close</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}