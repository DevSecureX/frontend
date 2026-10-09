import { useState } from 'react'
import { 
  Filter,
  X,
  ChevronDown,
  Code2,
  Globe,
  Lock,
  TrendingUp,
  Calendar,
  User,
  Award
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

import type { RuleFilters as RuleFiltersType, SupportedToolInfo } from '@/types/rules'
import type { SecuritySeverity } from '@/types/global'

interface RuleFiltersProps {
  filters: Partial<RuleFiltersType>
  onChange: (filters: Partial<RuleFiltersType>) => void
  supportedTools: SupportedToolInfo[]
  showCommunityFilters?: boolean
}

export function RuleFilters({ 
  filters, 
  onChange, 
  supportedTools,
  showCommunityFilters = false 
}: RuleFiltersProps) {
  // Ensure supportedTools is always an array
  const safeToolsList = Array.isArray(supportedTools) ? supportedTools : []
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof RuleFiltersType, value: any) => {
    const newFilters = { ...filters }
    if (value === undefined || value === null || value === '') {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    onChange(newFilters)
  }

  const clearAllFilters = () => {
    onChange({})
  }

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => 
      filters[key as keyof RuleFiltersType] !== undefined &&
      filters[key as keyof RuleFiltersType] !== null &&
      filters[key as keyof RuleFiltersType] !== ''
    ).length
  }

  const severities: SecuritySeverity[] = ['critical', 'high', 'medium', 'low', 'info']
  const languages = Array.from(
    new Set(safeToolsList.flatMap(tool => tool.supported_languages || []))
  ).sort()

  const sortOptions = [
    { value: 'created_at', label: 'Created Date', icon: Calendar },
    { value: 'updated_at', label: 'Updated Date', icon: Calendar },
    { value: 'upvotes', label: 'Most Voted', icon: Award },
    { value: 'usage_count', label: 'Most Used', icon: TrendingUp },
    { value: 'name', label: 'Name', icon: Code2 },
  ]

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 relative">
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-4 w-4 p-0 rounded-full text-xs flex items-center justify-center"
              >
                {getActiveFilterCount()}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            Filter Rules
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-auto p-1 text-xs"
              >
                Clear All
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Tool Filter */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
              Security Tool
            </DropdownMenuLabel>
            {safeToolsList.map((tool) => (
              <DropdownMenuCheckboxItem
                key={tool.tool}
                checked={filters.tool === tool.tool}
                onCheckedChange={(checked) => 
                  updateFilter('tool', checked ? tool.tool : undefined)
                }
              >
                <Code2 className="h-4 w-4 mr-2" />
                {tool.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />

          {/* Severity Filter */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
              Severity Level
            </DropdownMenuLabel>
            {severities.map((severity) => (
              <DropdownMenuCheckboxItem
                key={severity}
                checked={filters.severity === severity}
                onCheckedChange={(checked) => 
                  updateFilter('severity', checked ? severity : undefined)
                }
              >
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  severity === 'critical' ? 'bg-red-500' :
                  severity === 'high' ? 'bg-orange-500' :
                  severity === 'medium' ? 'bg-yellow-500' :
                  severity === 'low' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`} />
                <span className="capitalize">{severity}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Language Filter */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
              Programming Language
            </DropdownMenuLabel>
            <div className="max-h-32 overflow-y-auto">
              {languages.map((language) => (
                <DropdownMenuCheckboxItem
                  key={language}
                  checked={filters.language === language}
                  onCheckedChange={(checked) => 
                    updateFilter('language', checked ? language : undefined)
                  }
                >
                  <span className="capitalize">{language}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Visibility Filter */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
              Visibility
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.is_public === true}
              onCheckedChange={(checked) => 
                updateFilter('is_public', checked ? true : undefined)
              }
            >
              <Globe className="h-4 w-4 mr-2" />
              Public Rules
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.is_public === false}
              onCheckedChange={(checked) => 
                updateFilter('is_public', checked ? false : undefined)
              }
            >
              <Lock className="h-4 w-4 mr-2" />
              Private Rules
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>

          {showCommunityFilters && (
            <>
              <DropdownMenuSeparator />

              {/* Community Filters */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Community
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.min_votes === 5}
                  onCheckedChange={(checked) => 
                    updateFilter('min_votes', checked ? 5 : undefined)
                  }
                >
                  <Award className="h-4 w-4 mr-2" />
                  Highly Rated (5+ votes)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.min_votes === 10}
                  onCheckedChange={(checked) => 
                    updateFilter('min_votes', checked ? 10 : undefined)
                  }
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Popular (10+ votes)
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </>
          )}

          <DropdownMenuSeparator />

          {/* Sort Options */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
              Sort By
            </DropdownMenuLabel>
            {sortOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.sort_by === option.value}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter('sort_by', option.value)
                    // Default to descending for numeric sorts, ascending for text
                    updateFilter('sort_order', 
                      ['upvotes', 'usage_count'].includes(option.value) ? 'desc' : 'asc'
                    )
                  } else {
                    updateFilter('sort_by', undefined)
                    updateFilter('sort_order', undefined)
                  }
                }}
              >
                <option.icon className="h-4 w-4 mr-2" />
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>

          {filters.sort_by && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Sort Order
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.sort_order === 'asc'}
                  onCheckedChange={(checked) => 
                    updateFilter('sort_order', checked ? 'asc' : 'desc')
                  }
                >
                  Ascending (A-Z, 0-9, Oldest)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.sort_order === 'desc'}
                  onCheckedChange={(checked) => 
                    updateFilter('sort_order', checked ? 'desc' : 'asc')
                  }
                >
                  Descending (Z-A, 9-0, Newest)
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.tool && (
            <Badge variant="secondary" className="gap-1">
              Tool: {safeToolsList.find(t => t.tool === filters.tool)?.name || filters.tool}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
                onClick={() => updateFilter('tool', undefined)}
              />
            </Badge>
          )}
          
          {filters.severity && (
            <Badge variant="secondary" className="gap-1">
              <div className={`h-2 w-2 rounded-full ${
                filters.severity === 'critical' ? 'bg-red-500' :
                filters.severity === 'high' ? 'bg-orange-500' :
                filters.severity === 'medium' ? 'bg-yellow-500' :
                filters.severity === 'low' ? 'bg-blue-500' :
                'bg-gray-500'
              }`} />
              {filters.severity}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
                onClick={() => updateFilter('severity', undefined)}
              />
            </Badge>
          )}
          
          {filters.language && (
            <Badge variant="secondary" className="gap-1">
              Language: {filters.language}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
                onClick={() => updateFilter('language', undefined)}
              />
            </Badge>
          )}
          
          {filters.is_public !== undefined && (
            <Badge variant="secondary" className="gap-1">
              {filters.is_public ? (
                <>
                  <Globe className="h-3 w-3" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  Private
                </>
              )}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
                onClick={() => updateFilter('is_public', undefined)}
              />
            </Badge>
          )}
          
          {filters.min_votes && (
            <Badge variant="secondary" className="gap-1">
              <Award className="h-3 w-3" />
              {filters.min_votes}+ votes
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
                onClick={() => updateFilter('min_votes', undefined)}
              />
            </Badge>
          )}
          
          {filters.sort_by && (
            <Badge variant="secondary" className="gap-1">
              Sort: {sortOptions.find(s => s.value === filters.sort_by)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
                onClick={() => {
                  updateFilter('sort_by', undefined)
                  updateFilter('sort_order', undefined)
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}