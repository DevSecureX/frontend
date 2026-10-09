import { useState } from 'react'
import { useTimezone } from '@/contexts/TimezoneContext'
import { 
  Download, 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Invoice {
  id: string
  number: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  description: string
  paymentMethod: string
  downloadUrl?: string
}

export function BillingHistory() {
  const { formatDateOnly } = useTimezone()
  const [invoices] = useState<Invoice[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')

  const filteredInvoices = invoices.filter(invoice => {
    // Search filter
    if (searchQuery && !invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !invoice.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Status filter
    if (statusFilter !== 'all' && invoice.status !== statusFilter) {
      return false
    }

    // Year filter
    if (yearFilter !== 'all') {
      const invoiceYear = new Date(invoice.date).getFullYear().toString()
      if (invoiceYear !== yearFilter) {
        return false
      }
    }

    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'refunded':
        return <XCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
      case 'failed':
        return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
      case 'refunded':
        return 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    }
  }

  const handleDownload = (invoice: Invoice) => {
    if (invoice.downloadUrl) {
      // In real app, this would trigger a download from the server
      // Downloading invoice
      // window.open(invoice.downloadUrl, '_blank')
    }
  }

  const totalAmount = filteredInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  const availableYears = Array.from(new Set(
    invoices.map(invoice => new Date(invoice.date).getFullYear().toString())
  )).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Billing History</h3>
        <p className="text-muted-foreground text-sm">
          View and download your past invoices and billing statements
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredInvoices.filter(i => i.status === 'paid').length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              All time invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredInvoices.filter(i => i.status === 'paid').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Invoice</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.length > 0 ? formatDateOnly(invoices[0].date).split(' ')[0] : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.length > 0 ? new Date(invoices[0].date).getFullYear() : 'No invoices'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search invoices by number or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Invoices Found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery || statusFilter !== 'all' || yearFilter !== 'all'
                  ? 'No invoices match your current filters.'
                  : 'You don\'t have any invoices yet.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.number}
                    </TableCell>
                    <TableCell>
                      {formatDateOnly(invoice.date)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={invoice.description}>
                        {invoice.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invoice.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(invoice.status)}
                          <span className="capitalize">{invoice.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${invoice.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.downloadUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(invoice)}
                          className="gap-2"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium mb-1">Invoice Details</h4>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>• Invoices are generated monthly on your billing date</li>
              <li>• All amounts are shown in USD</li>
              <li>• Tax may be added based on your billing location</li>
              <li>• Invoices are available for download as PDF files</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Payment Terms</h4>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>• Payment is due immediately upon invoice generation</li>
              <li>• Failed payments will be retried for up to 3 days</li>
              <li>• Service may be suspended for overdue payments</li>
              <li>• Refunds are processed within 5-7 business days</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Questions?</h4>
            <p className="text-muted-foreground">
              If you have questions about billing or need help with invoices, 
              contact our support team at{' '}
              <a href="mailto:billing@devsecurex.com" className="text-primary dark:text-primary hover:underline">
                billing@devsecurex.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}