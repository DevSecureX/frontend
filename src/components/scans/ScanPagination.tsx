import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ScanPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function ScanPagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange, 
  isLoading = false 
}: ScanPaginationProps) {
  
  const handlePageChange = (page: number) => {
    // Scroll to the scan results section when changing pages
    const scanResultsSection = document.getElementById('scan-results-section')
    if (scanResultsSection) {
      scanResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      // Fallback to scrolling to top if element not found
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    onPageChange(page)
  }
  if (totalPages <= 1) {
    return null
  }

  // Calculate which pages to show
  const getPageNumbers = () => {
    const delta = 2 // Number of pages to show around current page
    const range: (number | 'ellipsis')[] = []
    
    // Always show first page
    range.push(1)
    
    if (currentPage - delta > 2) {
      range.push('ellipsis')
    }
    
    // Pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      if (!range.includes(i)) {
        range.push(i)
      }
    }
    
    if (currentPage + delta < totalPages - 1) {
      range.push('ellipsis')
    }
    
    // Always show last page (if different from first)
    if (totalPages > 1) {
      range.push(totalPages)
    }
    
    return range
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} scans
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Mobile-friendly previous/next buttons */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop pagination */}
        <div className="hidden sm:block">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 || isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === 'ellipsis') {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === currentPage}
                      className={isLoading ? 'pointer-events-none' : 'cursor-pointer'}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage >= totalPages || isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}