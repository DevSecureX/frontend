import React, { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { 
  Download, 
  Upload, 
  FileText, 
  Database,
  Github,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'

import { rulesAPI } from '@/lib/api/rules'

interface ImportExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRuleIds?: string[]
  onImportComplete?: () => void
}

export function ImportExportDialog({ 
  open, 
  onOpenChange, 
  selectedRuleIds = [],
  onImportComplete 
}: ImportExportDialogProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for export
  const [exportOptions, setExportOptions] = useState({
    format: 'json' as 'yaml' | 'json' | 'csv' | 'excel' | 'sarif',
    include_metadata: true,
    include_analytics: false,
    include_comments: false,
    rule_ids: selectedRuleIds
  })

  // State for file import
  const [importOptions, setImportOptions] = useState({
    format: 'json' as 'yaml' | 'json' | 'csv' | 'excel',
    overwrite_existing: false,
    validate_before_import: true,
    make_public: false
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  // State for repository import
  const [repoImport, setRepoImport] = useState({
    repository_url: '',
    branch: 'main',
    path: '',
    auth_token: ''
  })

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => rulesAPI.exportRulesAdvanced(exportOptions),
    onSuccess: (result) => {
      // Trigger download
      const link = document.createElement('a')
      link.href = result.download_url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Export successful",
        description: `Downloaded ${result.filename} (${(result.file_size / 1024).toFixed(1)} KB)`
      })
    },
    onError: (error: any) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export rules",
        variant: "destructive"
      })
    }
  })

  // File import mutation
  const fileImportMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error('No file selected')
      return rulesAPI.importRulesFromFile(selectedFile, importOptions)
    },
    onSuccess: (result) => {
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      toast({
        title: "Import completed",
        description: `Imported ${result.imported_count} rules, skipped ${result.skipped_count}, failed ${result.failed_count}`
      })
      
      onImportComplete?.()
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import rules",
        variant: "destructive"
      })
    }
  })

  // Repository import mutation
  const repoImportMutation = useMutation({
    mutationFn: () => rulesAPI.importRulesFromRepository(repoImport),
    onSuccess: (result) => {
      setRepoImport({ repository_url: '', branch: 'main', path: '', auth_token: '' })
      
      toast({
        title: "Repository import completed",
        description: `Found ${result.rules_found} rules, imported ${result.imported_count}`
      })
      
      onImportComplete?.()
    },
    onError: (error: any) => {
      toast({
        title: "Repository import failed",
        description: error.message || "Failed to import from repository",
        variant: "destructive"
      })
    }
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // Auto-detect format from file extension
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (['json', 'yaml', 'yml', 'csv'].includes(extension || '')) {
        setImportOptions(prev => ({ 
          ...prev, 
          format: extension === 'yml' ? 'yaml' : extension as any
        }))
      }
    }
  }

  const renderExportTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Rules
          </CardTitle>
          <CardDescription>
            Export your rules in various formats for backup or sharing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="sarif">SARIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Rules to Export</Label>
              <div className="text-sm text-muted-foreground">
                {selectedRuleIds.length > 0 ? 
                  `${selectedRuleIds.length} selected rules` : 
                  'All your rules'
                }
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={exportOptions.include_metadata}
                onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, include_metadata: checked }))}
              />
              <Label>Include metadata (tags, categories, timestamps)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={exportOptions.include_analytics}
                onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, include_analytics: checked }))}
              />
              <Label>Include analytics data (usage stats, performance metrics)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={exportOptions.include_comments}
                onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, include_comments: checked }))}
              />
              <Label>Include community comments</Label>
            </div>
          </div>

          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="w-full flex items-center gap-2"
          >
            {exportMutation.isPending ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Rules
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderFileImportTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import from File
          </CardTitle>
          <CardDescription>
            Import rules from JSON, YAML, CSV, or Excel files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select File</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-6">
              <div className="text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drop your file here or click to browse
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml,.csv,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>File Format</Label>
              <Select
                value={importOptions.format}
                onValueChange={(value: any) => setImportOptions(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={importOptions.validate_before_import}
                onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, validate_before_import: checked }))}
              />
              <Label>Validate rules before importing</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={importOptions.overwrite_existing}
                onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, overwrite_existing: checked }))}
              />
              <Label>Overwrite existing rules</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={importOptions.make_public}
                onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, make_public: checked }))}
              />
              <Label>Make imported rules public</Label>
            </div>
          </div>

          <Button
            onClick={() => fileImportMutation.mutate()}
            disabled={!selectedFile || fileImportMutation.isPending}
            className="w-full flex items-center gap-2"
          >
            {fileImportMutation.isPending ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Rules
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderRepoImportTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Import from Repository
          </CardTitle>
          <CardDescription>
            Import rules directly from a Git repository
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Repository URL</Label>
            <Input
              placeholder="https://github.com/owner/repo"
              value={repoImport.repository_url}
              onChange={(e) => setRepoImport(prev => ({ ...prev, repository_url: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input
                placeholder="main"
                value={repoImport.branch}
                onChange={(e) => setRepoImport(prev => ({ ...prev, branch: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Path (Optional)</Label>
              <Input
                placeholder="rules/"
                value={repoImport.path}
                onChange={(e) => setRepoImport(prev => ({ ...prev, path: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Authentication Token (Optional)</Label>
            <Input
              type="password"
              placeholder="GitHub token for private repositories"
              value={repoImport.auth_token}
              onChange={(e) => setRepoImport(prev => ({ ...prev, auth_token: e.target.value }))}
            />
          </div>

          <Button
            onClick={() => repoImportMutation.mutate()}
            disabled={!repoImport.repository_url || repoImportMutation.isPending}
            className="w-full flex items-center gap-2"
          >
            {repoImportMutation.isPending ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Importing...
              </>
            ) : (
              <>
                <Github className="h-4 w-4" />
                Import from Repository
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Import & Export Rules
          </DialogTitle>
          <DialogDescription>
            Transfer rules between environments or share with the community
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="file-import">File Import</TabsTrigger>
            <TabsTrigger value="repo-import">Repository</TabsTrigger>
          </TabsList>

          <TabsContent value="export">
            {renderExportTab()}
          </TabsContent>

          <TabsContent value="file-import">
            {renderFileImportTab()}
          </TabsContent>

          <TabsContent value="repo-import">
            {renderRepoImportTab()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}