import { useState, useRef, useEffect } from 'react'
import { 
  Search, 
  Clock, 
  GitBranch, 
  User, 
  Code, 
  FileText,
  X,
  Trash2,
  Keyboard
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useSearchAutocomplete } from '@/hooks/useSearchAutocomplete'
import { cn } from '@/lib/utils'

interface SmartSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SmartSearch({ 
  value, 
  onChange, 
  placeholder = "Search repositories...",
  className 
}: SmartSearchProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([])
  
  const {
    suggestions,
    isOpen,
    setIsOpen,
    addRecentSearch,
    clearRecentSearches
  } = useSearchAutocomplete(value)

  // Show suggestions when focused and have suggestions
  const showSuggestions = isFocused && (suggestions.length > 0 || value.trim() === '')

  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    setSelectedIndex(-1)
    setIsOpen(true)
  }

  const handleSuggestionSelect = (suggestion: any) => {
    const searchText = suggestion.text
    onChange(searchText)
    addRecentSearch(searchText)
    setIsOpen(false)
    setIsFocused(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      addRecentSearch(value.trim())
      setIsOpen(false)
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
          setIsOpen(false)
          setIsFocused(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
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
      case 'owner':
        return <User className="h-4 w-4 text-purple-500" />
      case 'language':
        return <Code className="h-4 w-4 text-green-500" />
      case 'description':
        return <FileText className="h-4 w-4 text-orange-500" />
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true)
              setIsOpen(true)
            }}
            onBlur={(e) => {
              // Delay blur to allow clicks on suggestions
              setTimeout(() => {
                if (!e.currentTarget || !document.activeElement || !e.currentTarget.contains(document.activeElement)) {
                  setIsFocused(false)
                  setIsOpen(false)
                  setSelectedIndex(-1)
                }
              }, 150)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck="false"
            className={cn(
              "pl-10 h-10 text-sm rounded-lg transition-all duration-200",
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
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
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
                          {suggestion.type === 'repository' && suggestion.repository && (
                            <>
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.repository.language}
                              </Badge>
                              {suggestion.repository.is_private === 'true' && (
                                <Badge variant="outline" className="text-xs">
                                  Private
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        {suggestion.repository?.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {suggestion.repository.description}
                          </p>
                        )}
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