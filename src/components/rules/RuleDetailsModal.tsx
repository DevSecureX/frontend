import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

import {
  Save,
  Edit3,
  Eye,
  EyeOff,
  Share2,
  Copy,
  Play,
  User,
  Calendar,
  TrendingUp,
  Heart,
  Code2,
  Globe,
  Lock,
  AlertCircle,
  Info,
  Clock,
  Target,
  Activity,
  BookOpen
} from 'lucide-react'

import { rulesAPI } from '@/lib/api/rules'
import type { CustomRule, RuleRequest } from '@/types/rules'
import type { SecuritySeverity } from '@/types/global'
import { formatDistanceToNow } from 'date-fns'
import { useTimezone } from '@/contexts/TimezoneContext'

import { RuleEditor } from './RuleEditor'

interface RuleDetailsModalProps {
  rule: CustomRule | null
  isOpen: boolean
  onClose: () => void
  onUpdated?: (updatedRule: CustomRule) => void
  onDeleted?: (ruleId: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function RuleDetailsModal({
  rule,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
  canEdit = false,
  canDelete = false
}: RuleDetailsModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { formatRelativeDate } = useTimezone()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showPattern, setShowPattern] = useState(true)
  const [formData, setFormData] = useState<RuleRequest>({
    rule_name: '',
    tool: 'semgrep',
    language: undefined,
    pattern: '',
    message: '',
    severity: 'medium' as SecuritySeverity,
    is_public: false
  })

  // Update form data when rule changes
  useEffect(() => {
    if (rule) {
      setFormData({
        rule_name: rule.rule_name,
        tool: rule.tool,
        language: rule.language,
        pattern: rule.pattern,
        message: rule.description || '',
        severity: rule.severity,
        is_public: rule.is_public,
      })
      setIsEditing(false)
    }
  }, [rule])

  // Update rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: (data: Partial<RuleRequest>) => 
      rulesAPI.updateRule(rule!.id, data),
    onSuccess: (updatedRule) => {
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['my-rules'] })
      queryClient.invalidateQueries({ queryKey: ['community-rules'] })
      if (onUpdated) onUpdated(updatedRule)
      toast({
        title: "Rule updated",
        description: "Your rule has been successfully updated.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error updating rule",
        description: error.message || "Failed to update the rule.",
        variant: "destructive",
      })
    }
  })

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: () => rulesAPI.deleteRule(rule!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rules'] })
      queryClient.invalidateQueries({ queryKey: ['rule-stats'] })
      if (onDeleted) onDeleted(rule!.id)
      onClose()
      toast({
        title: "Rule deleted",
        description: "The rule has been successfully deleted.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting rule",
        description: error.message || "Failed to delete the rule.",
        variant: "destructive",
      })
    }
  })

  const handleSave = () => {
    if (!formData.rule_name.trim()) {
      toast({
        title: "Missing rule name",
        description: "Please provide a name for your rule.",
        variant: "destructive",
      })
      return
    }

    if (!formData.pattern.trim()) {
      toast({
        title: "Missing rule pattern",
        description: "Please provide a pattern for your rule.",
        variant: "destructive",
      })
      return
    }

    updateRuleMutation.mutate(formData)
  }

  const handleCancel = () => {
    if (rule) {
      setFormData({
        rule_name: rule.rule_name,
        tool: rule.tool,
        language: rule.language,
        pattern: rule.pattern,
        message: rule.description || '',
        severity: rule.severity,
        is_public: rule.is_public,
      })
    }
    setIsEditing(false)
  }

  const handleCopyPattern = async () => {
    if (rule) {
      try {
        await navigator.clipboard.writeText(rule.pattern)
        toast({
          title: "Pattern copied",
          description: "Rule pattern has been copied to clipboard.",
        })
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Failed to copy rule pattern to clipboard.",
          variant: "destructive",
        })
      }
    }
  }

  const handleShare = () => {
    // Implement sharing logic
    toast({
      title: "Share rule",
      description: "Share functionality will be implemented soon.",
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600 text-white'
      case 'high': return 'bg-orange-500 hover:bg-orange-600 text-white'
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600 text-white'
      case 'low': return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'info': return 'bg-gray-500 hover:bg-gray-600 text-white'
      default: return 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  }

  if (!rule) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      if (!isEditing || !updateRuleMutation.isPending) {
        onClose()
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Code2 className="h-5 w-5" />
                {rule.rule_name}
                {rule.is_public ? (
                  <Globe className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {rule.description || 'No description provided'}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={updateRuleMutation.isPending}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  {isEditing ? 'Editing' : 'Edit'}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPattern(!showPattern)}
                className="gap-2"
              >
                {showPattern ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPattern ? 'Hide' : 'Show'} Pattern
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rule Metadata */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(rule.severity)}>
                    {rule.severity.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Severity</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {rule.tool}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Tool</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-semibold">{rule.net_votes}</span>
                  <span className="text-sm text-muted-foreground">Votes</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">{rule.usage_count}</span>
                  <span className="text-sm text-muted-foreground">Uses</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="pattern">Pattern</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-name">Rule Name *</Label>
                      <Input
                        id="rule-name"
                        value={formData.rule_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity</Label>
                      <Select 
                        value={formData.severity} 
                        onValueChange={(value: SecuritySeverity) => 
                          setFormData(prev => ({ ...prev, severity: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={formData.is_public}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, is_public: checked }))
                      }
                    />
                    <Label htmlFor="public">Make this rule public</Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">RULE NAME</h4>
                        <p className="text-lg font-semibold">{rule.rule_name}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">DESCRIPTION</h4>
                        <p className="text-sm leading-relaxed">
                          {rule.description || 'No description provided'}
                        </p>
                      </div>

                      {rule.tags && rule.tags.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">TAGS</h4>
                          <div className="flex flex-wrap gap-1">
                            {rule.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">TOOL & LANGUAGE</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {rule.tool}
                          </Badge>
                          {rule.language && (
                            <Badge variant="outline" className="capitalize">
                              {rule.language}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">VISIBILITY</h4>
                        <div className="flex items-center gap-2">
                          {rule.is_public ? (
                            <>
                              <Globe className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Public - visible to community</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Private - only visible to you</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">COMMUNITY ENGAGEMENT</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span>{rule.upvotes} upvotes, {rule.downvotes} downvotes</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span>{rule.usage_count} times used in scans</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Pattern Tab */}
            <TabsContent value="pattern" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Rule Pattern</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPattern}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Label>Rule Pattern</Label>
                  <RuleEditor
                    value={formData.pattern}
                    onChange={(value) => setFormData(prev => ({ ...prev, pattern: value }))}
                    language="yaml"
                    height="400px"
                  />
                </div>
              ) : (
                showPattern && (
                  <RuleEditor
                    value={rule.pattern}
                    onChange={() => {}} // Read-only
                    language="yaml"
                    height="400px"
                    readOnly={true}
                  />
                )
              )}
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Author Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Created by:</span>
                      <span className="text-sm font-medium">
                        {rule.author_username || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Created {formatRelativeDate(rule.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Updated {formatRelativeDate(rule.updated_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Usage & Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Usage:</span>
                      <span className="text-sm font-bold">{rule.usage_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Community Score:</span>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className="text-sm font-bold">{rule.net_votes}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Visibility:</span>
                      <Badge variant={rule.is_public ? "default" : "secondary"} className="text-xs">
                        {rule.is_public ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {rule.is_public && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This rule is public and can be discovered and used by other users in the community.
                    It contributes to the collective security knowledge base.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => deleteRuleMutation.mutate()}
                disabled={deleteRuleMutation.isPending}
                className="gap-2"
              >
                {deleteRuleMutation.isPending ? 'Deleting...' : 'Delete Rule'}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateRuleMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateRuleMutation.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateRuleMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}