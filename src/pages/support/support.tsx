import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildApiUrl } from '@/lib/config/env'
import { useTimezone } from '@/contexts/TimezoneContext'
import { 
  HelpCircle, 
  Send, 
  MessageCircle, 
  Clock, 
  CheckCircle,
  XCircle,
  Mail,
  Book,
  Search,
  Filter,
  History,
  ExternalLink,
  AlertCircle,
  Info,
  X,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Support History Dropdown Component (similar to AI Assistant)
const SupportHistoryDropdown = ({ 
  isOpen, 
  onClose, 
  supportQueries,
  searchQuery,
  statusFilter,
  setSearchQuery,
  setStatusFilter,
  isLoading,
  getStatusColor,
  getStatusIcon,
  getPriorityColor,
  formatDateOnly
}: {
  isOpen: boolean
  onClose: () => void
  supportQueries: any[]
  searchQuery: string
  statusFilter: string
  setSearchQuery: (query: string) => void
  setStatusFilter: (filter: string) => void
  isLoading: boolean
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => JSX.Element
  getPriorityColor: (priority: string) => string
  formatDateOnly: (timestamp: string | Date | null | undefined) => string
}) => {
  if (!isOpen) return null

  // Filter queries
  const filteredQueries = supportQueries.filter(query => {
    const matchesSearch = query.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         query.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || query.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-transparent z-10"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 top-12 w-96 bg-background border rounded-lg shadow-lg z-20 max-h-[500px] overflow-hidden">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Query History</span>
              {supportQueries.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {supportQueries.length}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Search and Filter */}
          {supportQueries.length > 0 && (
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search queries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Query List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
              </div>
            ) : filteredQueries.length === 0 ? (
              <div className="p-4 text-center">
                <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {supportQueries.length === 0 
                    ? "No support queries yet"
                    : "No matching queries found"
                  }
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredQueries.slice(0, 10).map((query, index) => (
                  <div
                    key={query.id}
                    className="p-3 mb-2 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(query.status)} text-xs`}>
                          {getStatusIcon(query.status)}
                          <span className="ml-1 capitalize">
                            {query.status.replace('_', ' ')}
                          </span>
                        </Badge>
                        <Badge className={`${getPriorityColor(query.priority)} text-xs`}>
                          {query.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {query.subject}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {query.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDateOnly(query.created_at)}</span>
                      <span>#{String(index + 1).padStart(3, '0')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export function SupportPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { formatDateOnly } = useTimezone()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  })

  // Support queries state
  const [supportQueries, setSupportQueries] = useState<any[]>([])
  
  // Get JWT token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('auth_token')
  }

  // Fetch support queries
  const fetchSupportQueries = async () => {
    const token = getAuthToken()
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view support queries.',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(buildApiUrl('support/queries'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const queries = await response.json()
        setSupportQueries(queries)
      } else {
        throw new Error('Failed to fetch support queries')
      }
    } catch (error) {
      console.error('Error fetching support queries:', error)
      toast({
        title: 'Error',
        description: 'Failed to load support queries.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load support queries on mount
  useEffect(() => {
    fetchSupportQueries()
  }, [])

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    const token = getAuthToken()
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit support queries.',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch(buildApiUrl('support/queries'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          category: formData.category,
          priority: formData.priority,
          message: formData.message.trim()
        })
      })

      if (response.ok) {
        const newQuery = await response.json()
        toast({
          title: 'Query Submitted Successfully',
          description: 'We\'ll respond to your query within 24 hours. Check your email for updates.',
          variant: 'default'
        })
        
        // Reset form
        setFormData({
          subject: '',
          category: 'general',
          priority: 'medium',
          message: ''
        })
        
        // Refresh the queries list
        await fetchSupportQueries()
      } else {
        throw new Error('Failed to submit support query')
      }
    } catch (error) {
      console.error('Error submitting support query:', error)
      toast({
        title: 'Submission Failed',
        description: 'Unable to submit your support query. Please try again or contact us directly.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      case 'closed':
        return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <MessageCircle className="h-3.5 w-3.5" />
      case 'in_progress':
        return <Clock className="h-3.5 w-3.5" />
      case 'resolved':
        return <CheckCircle className="h-3.5 w-3.5" />
      case 'closed':
        return <XCircle className="h-3.5 w-3.5" />
      default:
        return <MessageCircle className="h-3.5 w-3.5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'low':
        return 'bg-slate-50 text-slate-700 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  // Check if form is valid for submission
  const isFormValid = () => {
    return formData.subject.trim() && formData.message.trim()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - matching platform pattern */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Support</h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Get help with your security questions and technical issues
              </p>
            </div>
          </div>
        </div>
        
        <div className="relative flex items-center gap-2 lg:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSupportQueries}
            disabled={isLoading}
            className="gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 hover:bg-muted/50 transition-colors relative"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            <Badge variant="secondary" className="text-xs">
              {supportQueries.length}
            </Badge>
          </Button>
          
          {/* History Dropdown */}
          <SupportHistoryDropdown
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            supportQueries={supportQueries}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            setSearchQuery={setSearchQuery}
            setStatusFilter={setStatusFilter}
            isLoading={isLoading}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            getPriorityColor={getPriorityColor}
            formatDateOnly={formatDateOnly}
          />
        </div>
      </div>

      {/* Main Support Form - Primary Focus */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Submit Support Request</CardTitle>
                  <CardDescription>
                    Describe your issue and we'll respond within 24 hours
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmitQuery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="h-10"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            General Support
                          </div>
                        </SelectItem>
                        <SelectItem value="technical">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Technical Issue
                          </div>
                        </SelectItem>
                        <SelectItem value="billing">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Billing & Account
                          </div>
                        </SelectItem>
                        <SelectItem value="feature_request">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4" />
                            Feature Request
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priority
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low - General inquiry</SelectItem>
                        <SelectItem value="medium">🟡 Medium - Standard issue</SelectItem>
                        <SelectItem value="high">🟠 High - Important problem</SelectItem>
                        <SelectItem value="urgent">🔴 Urgent - Critical issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide detailed information about your issue, including steps to reproduce, error messages, and any relevant context..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="min-h-[120px] resize-none"
                    required
                  />
                </div>

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Response Time:</strong> We typically respond within 24 hours during business days. 
                    Urgent issues are prioritized and may receive faster responses.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  disabled={!isFormValid() || isSubmitting}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Submitting Query...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Support Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Alternative Support Options */}
        <div className="space-y-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Other Ways to Get Help
              </CardTitle>
              <CardDescription className="text-sm">
                Need immediate assistance or prefer different contact methods?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto p-3"
                asChild
              >
                <a href="mailto:support@devsecurex.com">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Email Support</div>
                      <div className="text-xs text-muted-foreground">
                        support@devsecurex.com
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </div>
                </a>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => window.open('/docs', '_blank')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Book className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Documentation</div>
                    <div className="text-xs text-muted-foreground">
                      Guides & tutorials
                    </div>
                  </div>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}