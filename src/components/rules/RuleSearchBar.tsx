import { useState, useEffect } from 'react'
import { Search, X, Command } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RuleSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suggestions?: string[]
  className?: string
}

export function RuleSearchBar({
  value,
  onChange,
  placeholder = "Search rules by name, tool, pattern, or description...",
  suggestions = [],
  className = ""
}: RuleSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Common search terms for rules
  const defaultSuggestions = [
    'SQL injection',
    'XSS',
    'authentication',
    'authorization',
    'password',
    'crypto',
    'buffer overflow',
    'path traversal',
    'CORS',
    'CSRF',
    'regex',
    'input validation',
    'sensitive data',
    'hardcoded secrets'
  ]

  const allSuggestions = [...suggestions, ...defaultSuggestions].filter(
    (suggestion, index, arr) => arr.indexOf(suggestion) === index
  )

  const filteredSuggestions = allSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase()) && suggestion.toLowerCase() !== value.toLowerCase()
  ).slice(0, 8)

  const handleClear = () => {
    onChange('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setIsFocused(false)
      ;(e.target as HTMLInputElement).blur()
    }
  }

  // Show suggestions when focused and have input
  useEffect(() => {
    setShowSuggestions(isFocused && value.length > 0 && filteredSuggestions.length > 0)
  }, [isFocused, value, filteredSuggestions.length])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow click events
            setTimeout(() => setIsFocused(false), 200)
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-12"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Command className="h-3 w-3" />
              Suggestions
            </div>
            <div className="space-y-1">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded-sm transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Tips */}
      {isFocused && !value && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="p-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Search Tips</div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>• Search by rule name, tool, or pattern content</div>
              <div>• Use quotes for exact matches: "SQL injection"</div>
              <div>• Filter by tool: semgrep, bandit, eslint</div>
              <div>• Common terms:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {defaultSuggestions.slice(0, 6).map((term, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-muted"
                    onClick={() => handleSuggestionClick(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}