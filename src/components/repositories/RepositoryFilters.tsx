import { Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useRepositoryStore } from '@/store'

const NICHE_OPTIONS = [
  { value: 'ai', label: 'AI/Machine Learning' },
  { value: 'blockchain', label: 'Blockchain/Crypto' },
  { value: 'iot', label: 'IoT/Embedded' },
  { value: 'web3', label: 'Web3 Frontend' },
  { value: 'cloud', label: 'Cloud Native' },
  { value: 'api', label: 'API Security' }
]

const LANGUAGE_OPTIONS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'C++',
  'Swift',
  'Kotlin'
]

const STATUS_OPTIONS = [
  'active',
  'inactive',
  'scanning',
  'error'
]

export function RepositoryFilters() {
  const {
    selectedNiche,
    selectedLanguage,
    selectedStatus,
    setNicheFilter,
    setLanguageFilter,
    setStatusFilter,
    clearFilters
  } = useRepositoryStore()

  const hasActiveFilters = selectedNiche || selectedLanguage || selectedStatus

  return (
    <div className="flex items-center gap-3">
      {/* Niche Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors duration-200 text-sm"
          >
            <Filter className="h-4 w-4" />
            {selectedNiche ? NICHE_OPTIONS.find(n => n.value === selectedNiche)?.label : 'Niche'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by Niche</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {NICHE_OPTIONS.map((niche) => (
            <DropdownMenuCheckboxItem
              key={niche.value}
              checked={selectedNiche === niche.value}
              onCheckedChange={(checked) => {
                setNicheFilter(checked ? niche.value : null)
              }}
            >
              {niche.label}
            </DropdownMenuCheckboxItem>
          ))}
          {selectedNiche && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={() => setNicheFilter(null)}
                className="text-muted-foreground"
              >
                Clear filter
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors duration-200 text-sm"
          >
            {selectedLanguage || 'Language'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          <DropdownMenuLabel>Filter by Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {LANGUAGE_OPTIONS.map((language) => (
            <DropdownMenuCheckboxItem
              key={language}
              checked={selectedLanguage === language}
              onCheckedChange={(checked) => {
                setLanguageFilter(checked ? language : null)
              }}
            >
              {language}
            </DropdownMenuCheckboxItem>
          ))}
          {selectedLanguage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={() => setLanguageFilter(null)}
                className="text-muted-foreground"
              >
                Clear filter
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors duration-200 text-sm"
          >
            {selectedStatus ? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1) : 'Status'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {STATUS_OPTIONS.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selectedStatus === status}
              onCheckedChange={(checked) => {
                setStatusFilter(checked ? status : null)
              }}
            >
              <span className="capitalize">{status}</span>
            </DropdownMenuCheckboxItem>
          ))}
          {selectedStatus && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                onCheckedChange={() => setStatusFilter(null)}
                className="text-muted-foreground"
              >
                Clear filter
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-2 h-10 px-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors duration-200"
        >
          <X className="h-4 w-4" />
          Clear All
        </Button>
      )}
    </div>
  )
}