import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface EnhancedDataTableProps {
  title: string
  description?: string
  data: any[]
  columns: DataTableColumn[]
  searchPlaceholder?: string
  defaultSortKey?: string
  defaultSortOrder?: 'asc' | 'desc'
  pageSize?: number
  onExport?: () => void
  emptyMessage?: string
  isLoading?: boolean
  icon?: React.ReactNode
}

export function EnhancedDataTable({
  title,
  description,
  data,
  columns,
  searchPlaceholder = "Search...",
  defaultSortKey,
  defaultSortOrder = 'asc',
  pageSize = 10,
  onExport,
  emptyMessage = "No data available",
  isLoading = false,
  icon
}: EnhancedDataTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState(defaultSortKey || columns[0]?.key)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchQuery) {
      filtered = data.filter(row =>
        columns.some(col => {
          const value = row[col.key]
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        })
      )
    }

    // Apply sorting
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        
        if (aVal === bVal) return 0
        
        let comparison = 0
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal
        } else {
          comparison = String(aVal).localeCompare(String(bVal))
        }
        
        return sortOrder === 'desc' ? -comparison : comparison
      })
    }

    return filtered
  }, [data, searchQuery, sortKey, sortOrder, columns])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
    return sortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-600 dark:text-blue-400" /> : 
      <ArrowDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
  }

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon && <div className="p-1 bg-gray-50 dark:bg-gray-900/30 rounded-lg">{icon}</div>}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <div className="animate-pulse w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse w-full h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse w-full h-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {icon && <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">{icon}</div>}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>
        
        {/* Search and Results Info */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          
          {filteredAndSortedData.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length}
              </span>
              {filteredAndSortedData.length !== data.length && (
                <Badge variant="secondary" className="text-xs">
                  Filtered
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredAndSortedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No Results Found' : 'No Data Available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
              {searchQuery 
                ? `No items match your search for "${searchQuery}". Try adjusting your search terms.`
                : emptyMessage
              }
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    {columns.map((column) => (
                      <TableHead 
                        key={column.key}
                        className={column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                        onClick={() => column.sortable !== false && handleSort(column.key)}
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          {column.sortable !== false && getSortIcon(column.key)}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {columns.map((column) => (
                        <TableCell key={column.key} className="py-3">
                          {column.render 
                            ? column.render(row[column.key], row)
                            : row[column.key]
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    // Handle page size change if needed
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-muted-foreground px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}