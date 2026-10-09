import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '@/lib/api/auth'
import type { DataExport, DataExportRequest } from '@/lib/api/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Download, 
  FileText, 
  Database, 
  Shield, 
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileArchive,
  Info,
  RefreshCw
} from 'lucide-react'
import { useTimezone } from '@/contexts/TimezoneContext'

interface DataExportProps {}

export function DataExport() {
  const queryClient = useQueryClient()
  const { formatDate } = useTimezone()
  
  // State
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [exportRequest, setExportRequest] = useState<DataExportRequest>({
    export_type: 'full',
    file_format: 'json',
    include_personal_data: true,
    include_scan_data: true,
    include_repository_data: true
  })

  // Queries
  const { data: exports, isLoading, refetch } = useQuery({
    queryKey: ['data-exports'],
    queryFn: () => authAPI.getDataExports(),
    refetchInterval: (data) => {
      // Auto-refresh if there are pending or processing exports
      const hasPending = Array.isArray(data) && data.some(exp => exp.status === 'pending' || exp.status === 'processing')
      return hasPending ? 10000 : false // 10 seconds
    }
  })

  // Mutations
  const requestExportMutation = useMutation({
    mutationFn: (request: DataExportRequest) => authAPI.requestDataExport(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-exports'] })
      setShowRequestDialog(false)
      toast.success('Data export request submitted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to request data export')
    },
  })

  const downloadExportMutation = useMutation({
    mutationFn: (exportId: number) => authAPI.downloadDataExport(exportId),
    onSuccess: (blob, exportId) => {
      // Find the export to get its details
      const exportData = exports?.find(exp => exp.id === exportId)
      const filename = `devsecurex-export-${exportId}.${exportData?.file_format || 'json'}`
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Export downloaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to download export')
    },
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow'
      case 'processing': return 'blue'
      case 'completed': return 'green'
      case 'failed': return 'red'
      default: return 'gray'
    }
  }

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return 'N/A'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  const getProgress = (exportData: DataExport) => {
    if (exportData.status === 'completed') return 100
    if (exportData.status === 'failed') return 0
    if (exportData.status === 'pending') return 0
    
    // For processing status, calculate based on exported vs total records
    if (exportData.total_records && exportData.exported_records) {
      return Math.round((exportData.exported_records / exportData.total_records) * 100)
    }
    
    return exportData.status === 'processing' ? 50 : 0
  }

  const hasPendingExport = Array.isArray(exports) && exports.some(exp => exp.status === 'pending' || exp.status === 'processing')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Export
            </CardTitle>
            <CardDescription>
              Export your DevSecureX data for compliance and backup purposes
            </CardDescription>
          </div>
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button disabled={hasPendingExport}>
                <FileArchive className="mr-2 h-4 w-4" />
                Request Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Data Export</DialogTitle>
                <DialogDescription>
                  Configure what data you'd like to export. The export will be securely generated
                  and made available for download for 7 days.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Export Type</Label>
                  <Select 
                    value={exportRequest.export_type} 
                    onValueChange={(value: any) => setExportRequest(prev => ({ ...prev, export_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Export - All data</SelectItem>
                      <SelectItem value="personal_only">Personal Data Only</SelectItem>
                      <SelectItem value="scans_only">Security Scans Only</SelectItem>
                      <SelectItem value="repositories_only">Repositories Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>File Format</Label>
                  <Select 
                    value={exportRequest.file_format} 
                    onValueChange={(value: any) => setExportRequest(prev => ({ ...prev, file_format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON - Machine readable</SelectItem>
                      <SelectItem value="csv">CSV - Spreadsheet compatible</SelectItem>
                      <SelectItem value="xml">XML - Structured markup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Include Data Types</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="personal-data"
                        checked={exportRequest.include_personal_data}
                        onCheckedChange={(checked) => 
                          setExportRequest(prev => ({ ...prev, include_personal_data: checked as boolean }))
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="personal-data" className="font-normal">
                          Personal Information
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Profile details, preferences, account information
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="scan-data"
                        checked={exportRequest.include_scan_data}
                        onCheckedChange={(checked) => 
                          setExportRequest(prev => ({ ...prev, include_scan_data: checked as boolean }))
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="scan-data" className="font-normal">
                          Security Scan Data
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Scan results, vulnerabilities, analysis reports
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="repo-data"
                        checked={exportRequest.include_repository_data}
                        onCheckedChange={(checked) => 
                          setExportRequest(prev => ({ ...prev, include_repository_data: checked as boolean }))
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="repo-data" className="font-normal">
                          Repository Information
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Connected repositories, settings, metadata
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Export Information</p>
                      <ul className="text-xs space-y-1">
                        <li>• Exports are processed securely and encrypted</li>
                        <li>• Download links expire after 7 days</li>
                        <li>• Large exports may take several minutes to process</li>
                        <li>• You'll receive an email when the export is ready</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => requestExportMutation.mutate(exportRequest)}
                  disabled={requestExportMutation.isPending}
                >
                  {requestExportMutation.isPending ? 'Requesting...' : 'Request Export'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasPendingExport && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                Export in Progress
              </span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              You have a pending export request. Please wait for it to complete before requesting another export.
            </p>
          </div>
        )}

        {/* Export History */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : !exports?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileArchive className="mx-auto h-8 w-8 mb-2" />
            <p>No data exports requested yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Export History</h3>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {exports.map((exportData) => (
              <div key={exportData.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(exportData.status)}
                    <span className="font-medium">
                      {exportData.export_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <Badge variant="outline" style={{ 
                      color: `hsl(var(--${getStatusColor(exportData.status)}-500))`,
                      borderColor: `hsl(var(--${getStatusColor(exportData.status)}-200))`
                    }}>
                      {exportData.status}
                    </Badge>
                  </div>
                  
                  {exportData.status === 'completed' && (
                    <Button 
                      size="sm"
                      onClick={() => downloadExportMutation.mutate(exportData.id)}
                      disabled={downloadExportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>

                {(exportData.status === 'processing' && exportData.total_records) && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Processing...</span>
                      <span>{exportData.exported_records?.toLocaleString()} / {exportData.total_records.toLocaleString()} records</span>
                    </div>
                    <Progress value={getProgress(exportData)} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="block font-medium text-foreground">Format</span>
                    <span className="uppercase">{exportData.file_format}</span>
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">Size</span>
                    {formatFileSize(exportData.file_size_bytes)}
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">Requested</span>
                    {formatDate(exportData.requested_at)}
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">
                      {exportData.status === 'completed' ? 'Expires' : 'Status'}
                    </span>
                    {exportData.status === 'completed' && exportData.download_expires_at ? 
                      formatDate(exportData.download_expires_at) : 
                      exportData.error_message || 'In progress'
                    }
                  </div>
                </div>

                {exportData.error_message && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                    <strong>Error:</strong> {exportData.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Compliance Information */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Compliance & Data Rights</h4>
          <p className="text-sm text-muted-foreground mb-3">
            As part of our commitment to data privacy and compliance with regulations like GDPR,
            you have the right to export and port your data at any time.
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• All exports are encrypted and securely processed</p>
            <p>• Data includes all personal information and activity history</p>
            <p>• Export requests are logged for audit purposes</p>
            <p>• Contact support if you need assistance with data interpretation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}