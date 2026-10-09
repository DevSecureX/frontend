import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Code2,
  Search,
  Filter,
  Star,
  Copy,
  Play,
  Download,
  Wand2,
  Settings,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Zap,
  Shield,
  Users,
  Crown,
  ThumbsUp,
  ThumbsDown,
  Heart
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import { rulesAPI } from '@/lib/api/rules'
import type { SupportedTool, SupportedToolInfo, RuleLanguage } from '@/types/rules'

interface EnhancedTemplatesInterfaceProps {
  supportedTools: SupportedToolInfo[]
  onTemplateUse?: (templateId: string, generatedRule: any) => void
}

interface TemplateFilters {
  tool?: SupportedTool
  language?: RuleLanguage
  category?: string
  complexity?: 'basic' | 'intermediate' | 'advanced'
  source?: 'official' | 'community' | 'all'
}

export function EnhancedTemplatesInterface({ 
  supportedTools, 
  onTemplateUse 
}: EnhancedTemplatesInterfaceProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<TemplateFilters>({})
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, any>>({})
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  const [generateOptions, setGenerateOptions] = useState({
    auto_validate: true,
    save_rule: false,
    make_public: false
  })
  const [votingTemplates, setVotingTemplates] = useState<Set<string>>(new Set())

  // Fetch security templates
  const { 
    data: templates, 
    isLoading: templatesLoading,
    refetch: refetchTemplates
  } = useQuery({
    queryKey: ['security-templates', filters],
    queryFn: () => rulesAPI.getSecurityTemplates(filters),
    staleTime: 10 * 60 * 1000
  })

  // Generate rule from template mutation
  const generateRuleMutation = useMutation({
    mutationFn: ({ templateId, placeholders, options }: any) =>
      rulesAPI.generateRuleFromTemplate(templateId, placeholders, options),
    onSuccess: (result, variables) => {
      toast({
        title: "Rule generated successfully",
        description: result.created_rule_id ? "Rule saved to your collection" : "Pattern generated and ready to use",
      })
      
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          toast({
            title: "Generation warning",
            description: warning,
            variant: "default",
          })
        })
      }
      
      onTemplateUse?.(variables.templateId, result)
      setShowTemplateDialog(false)
      setPlaceholderValues({})
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate rule from template.",
        variant: "destructive",
      })
    }
  })

  // Template promotion mutation
  const promoteTemplateMutation = useMutation({
    mutationFn: (templateId: string) => rulesAPI.promoteTemplate(templateId),
    onSuccess: (result) => {
      toast({
        title: "Template promoted",
        description: result.message,
      })
      refetchTemplates()
    },
    onError: (error: any) => {
      toast({
        title: "Promotion failed", 
        description: error.message || "Failed to promote template.",
        variant: "destructive",
      })
    }
  })

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    if (!Array.isArray(templates)) return []
    
    return templates.filter(template => {
      const matchesSearch = !searchQuery || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesSearch
    })
  }, [templates, searchQuery])

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    filteredTemplates.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = []
      }
      grouped[template.category].push(template)
    })
    return grouped
  }, [filteredTemplates])

  const handleFilterChange = (key: keyof TemplateFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    // Initialize placeholder values
    const initialValues: Record<string, any> = {}
    template.placeholders?.forEach((placeholder: any) => {
      if (placeholder.default_value !== undefined) {
        initialValues[placeholder.key] = placeholder.default_value
      }
    })
    setPlaceholderValues(initialValues)
    setShowTemplateDialog(true)
  }

  const handlePlaceholderChange = (key: string, value: any) => {
    setPlaceholderValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleGenerateRule = () => {
    if (!selectedTemplate) return
    
    generateRuleMutation.mutate({
      templateId: selectedTemplate.id,
      placeholders: placeholderValues,
      options: generateOptions
    })
  }

  const toggleTemplateExpansion = (templateId: string) => {
    setExpandedTemplates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(templateId)) {
        newSet.delete(templateId)
      } else {
        newSet.add(templateId)
      }
      return newSet
    })
  }

  const copyTemplatePattern = async (pattern: string) => {
    try {
      await navigator.clipboard.writeText(pattern)
      toast({
        title: "Pattern copied",
        description: "Template pattern copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy pattern to clipboard.",
        variant: "destructive",
      })
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const renderTemplateCard = (template: any) => {
    const isExpanded = expandedTemplates.has(template.id)
    
    return (
      <Card key={template.id} className="hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>
                {template.complexity}
              </Badge>
              {template.source === 'official' ? (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Official
                </Badge>
              ) : (
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Community
                  </Badge>
                  {template.is_curated && (
                    <Badge variant="default" className="text-xs flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Curated
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyTemplatePattern(template.pattern_template)}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTemplateExpansion(template.id)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm">
            {template.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Code2 className="h-3 w-3 mr-1" />
              {template.tool}
            </Badge>
            {template.language && (
              <Badge variant="outline" className="text-xs">
                {template.language}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {template.category}
            </Badge>
          </div>

          <Collapsible open={isExpanded} onOpenChange={() => toggleTemplateExpansion(template.id)}>
            <CollapsibleContent className="space-y-4">
              {/* Placeholders */}
              {template.placeholders && template.placeholders.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Required Parameters:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {template.placeholders.map((placeholder: any) => (
                      <div key={placeholder.key} className="flex items-center gap-2 text-xs">
                        <Badge 
                          variant={placeholder.required ? "default" : "outline"} 
                          className="text-xs"
                        >
                          {placeholder.key}
                        </Badge>
                        <span className="text-muted-foreground truncate">
                          {placeholder.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example Usage */}
              <div>
                <h4 className="text-sm font-medium mb-2">Example Usage:</h4>
                <ScrollArea className="h-24 w-full">
                  <pre className="text-xs bg-muted p-3 rounded font-mono">
                    {template.example_usage}
                  </pre>
                </ScrollArea>
              </div>

              {/* Template Pattern Preview */}
              <div>
                <h4 className="text-sm font-medium mb-2">Pattern Template:</h4>
                <ScrollArea className="h-20 w-full">
                  <pre className="text-xs bg-muted p-3 rounded font-mono">
                    {template.pattern_template}
                  </pre>
                </ScrollArea>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Ready to customize</span>
              </div>
              {template.source === 'community' && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{template.upvotes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{template.usage_count || 0} uses</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => promoteTemplateMutation.mutate(template.id)}
                    disabled={promoteTemplateMutation.isPending || template.is_curated}
                    className="h-6 px-2 gap-1 text-xs"
                  >
                    <Heart className={`h-3 w-3 ${template.is_curated ? 'fill-red-500 text-red-500' : ''}`} />
                    {template.is_curated ? 'Promoted' : 'Promote'}
                  </Button>
                </div>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => handleTemplateSelect(template)}
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Use Template
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTemplateDialog = () => {
    if (!selectedTemplate) return null

    const requiredFields = selectedTemplate.placeholders?.filter((p: any) => p.required) || []
    const canGenerate = requiredFields.every((field: any) => 
      placeholderValues[field.key]?.trim()
    )

    return (
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Generate Rule: {selectedTemplate.name}
            </DialogTitle>
            <DialogDescription>
              Fill in the parameters below to generate a custom rule from this template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Template Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Template Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tool:</span>
                    <div className="font-medium">{selectedTemplate.tool}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Language:</span>
                    <div className="font-medium">{selectedTemplate.language || 'Any'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Complexity:</span>
                    <Badge className={`text-xs ${getComplexityColor(selectedTemplate.complexity)}`}>
                      {selectedTemplate.complexity}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder Inputs */}
            {selectedTemplate.placeholders && selectedTemplate.placeholders.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Template Parameters</CardTitle>
                  <CardDescription>
                    Customize the template by providing values for the following parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTemplate.placeholders.map((placeholder: any) => (
                      <div key={placeholder.key} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">
                            {placeholder.key}
                          </Label>
                          {placeholder.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {placeholder.description}
                        </p>
                        {placeholder.type === 'textarea' ? (
                          <Textarea
                            value={placeholderValues[placeholder.key] || ''}
                            onChange={(e) => handlePlaceholderChange(placeholder.key, e.target.value)}
                            placeholder={`Enter ${placeholder.key}`}
                            rows={3}
                          />
                        ) : (
                          <Input
                            type={placeholder.type === 'number' ? 'number' : 'text'}
                            value={placeholderValues[placeholder.key] || ''}
                            onChange={(e) => handlePlaceholderChange(placeholder.key, e.target.value)}
                            placeholder={`Enter ${placeholder.key}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generation Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Generation Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto-validate pattern</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically validate the generated pattern
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={generateOptions.auto_validate}
                      onChange={(e) => setGenerateOptions(prev => ({
                        ...prev,
                        auto_validate: e.target.checked
                      }))}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Save as rule</Label>
                      <p className="text-xs text-muted-foreground">
                        Save the generated pattern as a new rule
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={generateOptions.save_rule}
                      onChange={(e) => setGenerateOptions(prev => ({
                        ...prev,
                        save_rule: e.target.checked
                      }))}
                      className="rounded"
                    />
                  </div>
                  {generateOptions.save_rule && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Make public</Label>
                        <p className="text-xs text-muted-foreground">
                          Share the rule with the community
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={generateOptions.make_public}
                        onChange={(e) => setGenerateOptions(prev => ({
                          ...prev,
                          make_public: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTemplateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateRule}
                disabled={!canGenerate || generateRuleMutation.isPending}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                {generateRuleMutation.isPending ? 'Generating...' : 'Generate Rule'}
              </Button>
            </div>

            {!canGenerate && requiredFields.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Please fill in all required fields to generate the rule.
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (templatesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-10 bg-muted rounded w-1/3" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={filters.tool || 'all'} 
            onValueChange={(value) => handleFilterChange('tool', value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tools</SelectItem>
              {supportedTools.map(tool => (
                <SelectItem key={tool.tool} value={tool.tool}>
                  {tool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.complexity || 'all'} 
            onValueChange={(value) => handleFilterChange('complexity', value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.source || 'all'} 
            onValueChange={(value) => handleFilterChange('source', value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="official">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Official
                </div>
              </SelectItem>
              <SelectItem value="community">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Community
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates by Category */}
      {Object.keys(templatesByCategory).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold capitalize">{category}</h3>
                <Badge variant="outline" className="text-xs">
                  {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {categoryTemplates.map(renderTemplateCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || Object.keys(filters).some(key => filters[key as keyof TemplateFilters]) ? 
                'Try adjusting your search or filters to find more templates.' :
                'No security templates are available at the moment.'
              }
            </p>
            {(searchQuery || Object.keys(filters).some(key => filters[key as keyof TemplateFilters])) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setFilters({})
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Generation Dialog */}
      {renderTemplateDialog()}
    </div>
  )
}