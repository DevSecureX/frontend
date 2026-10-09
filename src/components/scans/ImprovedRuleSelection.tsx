import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, ChevronDown, ChevronRight, Shield, Users, Settings, Check, X, Info, TrendingUp, Clock, AlertTriangle, Sparkles, Eye, EyeOff, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useTimezone } from '@/contexts/TimezoneContext'
import { apiClient } from '@/lib/api/client'
import type { CustomRule } from '@/types/rules'

interface RuleStats {
  total_rules: number
  rule_files: string[]
  languages: string[]
  supported_niches?: string[]
}

interface ImprovedRuleSelectionProps {
  niche: string
  selectedRuleIds: string[]
  onRuleSelectionChange: (ruleIds: string[], ruleSummary: RuleSummary) => void
  className?: string
}

export interface RuleSummary {
  defaultRules: number
  customRules: number
  communityRules: number
  totalRules: number
  selectedRuleDetails: {
    default: RuleStats | null
    custom: CustomRule[]
    community: CustomRule[]
  }
}

// Rule Category Component
const RuleCategory = ({ 
  title, 
  icon: Icon, 
  rules, 
  selectedIds, 
  onToggle, 
  color,
  isDefault = false,
  defaultStats = null
}: {
  title: string
  icon: any
  rules: CustomRule[]
  selectedIds: Set<string>
  onToggle: (ruleId: string) => void
  color: string
  isDefault?: boolean
  defaultStats?: RuleStats | null
}) => {
  const { formatDateOnly } = useTimezone()
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [showDetails, setShowDetails] = useState<string | null>(null)
  
  const filteredRules = useMemo(() => {
    if (isDefault) return []
    
    return rules.filter(rule => {
      const matchesSearch = searchTerm === '' || 
        rule.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSeverity = severityFilter === 'all' || rule.severity === severityFilter
      
      return matchesSearch && matchesSeverity
    })
  }, [rules, searchTerm, severityFilter, isDefault])

  const selectedCount = isDefault 
    ? (defaultStats && selectedIds.has('default-rules') ? defaultStats.total_rules : 0)
    : rules.filter(r => selectedIds.has(r.id)).length

  const handleSelectAll = () => {
    if (isDefault) {
      onToggle('default-rules')
    } else {
      const allSelected = rules.every(r => selectedIds.has(r.id))
      rules.forEach(r => {
        if (allSelected && selectedIds.has(r.id)) {
          onToggle(r.id)
        } else if (!allSelected && !selectedIds.has(r.id)) {
          onToggle(r.id)
        }
      })
    }
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
              <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <CardDescription className="text-sm">
                {isDefault 
                  ? `${defaultStats?.total_rules || 0} professional security rules`
                  : `${rules.length} available rules`
                }
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <Badge variant="default" className="text-xs">
                {selectedCount} selected
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs"
          >
            {isDefault 
              ? (selectedIds.has('default-rules') ? 'Deselect' : 'Select All')
              : (rules.every(r => selectedIds.has(r.id)) ? 'Deselect All' : 'Select All')
            }
          </Button>
          {!isDefault && rules.length > 0 && (
            <>
              <Badge variant="secondary" className="text-xs">
                {rules.filter(r => r.is_verified).length} verified
              </Badge>
              <Badge variant="outline" className="text-xs">
                ↑ {rules.reduce((sum, r) => sum + r.upvotes, 0)} votes
              </Badge>
            </>
          )}
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {isDefault ? (
              // Default Rules Display
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Included Tools & Languages</span>
                    <Checkbox
                      checked={selectedIds.has('default-rules')}
                      onCheckedChange={() => onToggle('default-rules')}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {defaultStats?.languages.map(lang => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Professional rules curated by security experts for comprehensive coverage
                  </div>
                </div>
              </div>
            ) : (
              // Custom/Community Rules Display
              <div className="space-y-3">
                {/* Search and Filter */}
                {rules.length > 3 && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search rules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-9"
                      />
                    </div>
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-32 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="WARNING">Warning</SelectItem>
                        <SelectItem value="INFO">Info</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Rules List */}
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {filteredRules.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchTerm || severityFilter !== 'all' 
                          ? 'No rules match your filters'
                          : 'No rules available'
                        }
                      </div>
                    ) : (
                      filteredRules.map(rule => (
                        <div
                          key={rule.id}
                          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                          <Checkbox
                            checked={selectedIds.has(rule.id)}
                            onCheckedChange={() => onToggle(rule.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm truncate">
                                  {rule.rule_name}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {rule.description || 'No description available'}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {rule.tool}
                                  </Badge>
                                  {rule.language && (
                                    <Badge variant="secondary" className="text-xs">
                                      {rule.language}
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant={
                                      rule.severity === 'ERROR' ? 'destructive' :
                                      rule.severity === 'WARNING' ? 'default' : 'secondary'
                                    } 
                                    className="text-xs"
                                  >
                                    {rule.severity}
                                  </Badge>
                                  {rule.is_verified && (
                                    <Badge variant="default" className="text-xs">
                                      ✓ Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span>↑ {rule.upvotes} ↓ {rule.downvotes}</span>
                                  <span>• Used {rule.usage_count} times</span>
                                  {rule.effectiveness_score && (
                                    <span>• {rule.effectiveness_score}% effective</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDetails(showDetails === rule.id ? null : rule.id)}
                                className="h-8 w-8 p-0"
                              >
                                {showDetails === rule.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            
                            {/* Expanded Details */}
                            {showDetails === rule.id && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-xs">
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium">Pattern Preview:</span>
                                    <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                      {rule.pattern ? `${rule.pattern.substring(0, 200)  }...` : 'Pattern not available'}
                                    </code>
                                  </div>
                                  {rule.created_at && (
                                    <div>
                                      <span className="font-medium">Created:</span> {formatDateOnly(rule.created_at)}
                                    </div>
                                  )}
                                  {rule.false_positive_rate !== undefined && (
                                    <div>
                                      <span className="font-medium">False Positive Rate:</span> {rule.false_positive_rate}%
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export function ImprovedRuleSelection({ 
  niche, 
  selectedRuleIds, 
  onRuleSelectionChange,
  className 
}: ImprovedRuleSelectionProps) {
  const [userCustomRules, setUserCustomRules] = useState<CustomRule[]>([])
  const [communityRules, setCommunityRules] = useState<CustomRule[]>([])
  const [defaultRulesStats, setDefaultRulesStats] = useState<RuleStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedRuleIds))
  const [activeTab, setActiveTab] = useState('smart')

  // Load rules when niche changes
  useEffect(() => {
    loadRules()
  }, [niche])

  const loadRules = async () => {
    setIsLoading(true)
    try {
      const [userData, communityData, statsData] = await Promise.all([
        apiClient.get(`/rules/user?niche=${niche}`),
        apiClient.get(`/rules/community/popular?niche=${niche}&limit=50&min_upvotes=0&include_own=false`),
        apiClient.get(`/rules/default/stats?niche=${niche}`)
      ])
      
      setUserCustomRules(userData.rules || [])
      setCommunityRules(communityData.rules || [])
      setDefaultRulesStats(statsData)
    } catch (error) {
      console.error('Failed to load rules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRuleToggle = (ruleId: string) => {
    const newSelectedIds = new Set(selectedIds)
    if (newSelectedIds.has(ruleId)) {
      newSelectedIds.delete(ruleId)
    } else {
      newSelectedIds.add(ruleId)
    }
    setSelectedIds(newSelectedIds)
    updateParent(newSelectedIds)
  }

  const updateParent = (ids: Set<string>) => {
    const customSelected = userCustomRules.filter(r => ids.has(r.id))
    const communitySelected = communityRules.filter(r => ids.has(r.id))
    
    const summary: RuleSummary = {
      defaultRules: ids.has('default-rules') ? (defaultRulesStats?.total_rules || 0) : 0,
      customRules: customSelected.length,
      communityRules: communitySelected.length,
      totalRules: 
        (ids.has('default-rules') ? (defaultRulesStats?.total_rules || 0) : 0) +
        customSelected.length +
        communitySelected.length,
      selectedRuleDetails: {
        default: ids.has('default-rules') ? defaultRulesStats : null,
        custom: customSelected,
        community: communitySelected
      }
    }
    
    // Convert Set to array for parent component
    const ruleIdsArray = Array.from(ids).filter(id => id !== 'default-rules')
    onRuleSelectionChange(ruleIdsArray, summary)
  }

  // Smart Selection Presets
  const applySmartPreset = (preset: string) => {
    const newSelectedIds = new Set<string>()
    
    switch (preset) {
      case 'recommended':
        // Default rules + top verified community rules
        newSelectedIds.add('default-rules')
        communityRules
          .filter(r => r.is_verified && r.upvotes > 5)
          .slice(0, 10)
          .forEach(r => newSelectedIds.add(r.id))
        break
        
      case 'maximum':
        // Everything
        newSelectedIds.add('default-rules')
        userCustomRules.forEach(r => newSelectedIds.add(r.id))
        communityRules.forEach(r => newSelectedIds.add(r.id))
        break
        
      case 'minimal':
        // Only default rules
        newSelectedIds.add('default-rules')
        break
        
      case 'custom-only':
        // Only user's custom rules
        userCustomRules.forEach(r => newSelectedIds.add(r.id))
        break
        
      case 'community-best':
        // Top community rules by effectiveness
        communityRules
          .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
          .slice(0, 20)
          .forEach(r => newSelectedIds.add(r.id))
        break
    }
    
    setSelectedIds(newSelectedIds)
    updateParent(newSelectedIds)
  }

  const totalSelected = 
    (selectedIds.has('default-rules') ? (defaultRulesStats?.total_rules || 0) : 0) +
    userCustomRules.filter(r => selectedIds.has(r.id)).length +
    communityRules.filter(r => selectedIds.has(r.id)).length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Summary */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Security Rule Configuration</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select security rules to apply during the scan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {totalSelected} rules selected
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About Security Rules</DialogTitle>
                <DialogDescription>
                  Rules determine what security patterns are checked during your scan.
                  More rules provide better coverage but may increase scan time.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                <div>
                  <h4 className="font-medium mb-1">Default Rules</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional rules curated by security experts, optimized for your repository type.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Custom Rules</h4>
                  <p className="text-sm text-muted-foreground">
                    Rules you've created specifically for your security needs.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Community Rules</h4>
                  <p className="text-sm text-muted-foreground">
                    Rules created and vetted by the security community.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="smart">Smart Selection</TabsTrigger>
          <TabsTrigger value="manual">Manual Selection</TabsTrigger>
        </TabsList>

        <TabsContent value="smart" className="space-y-4">
          {/* Smart Presets */}
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => applySmartPreset('recommended')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Recommended</div>
                    <div className="text-xs text-muted-foreground">
                      Balanced security coverage
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-green-500 transition-colors"
              onClick={() => applySmartPreset('maximum')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Maximum Security</div>
                    <div className="text-xs text-muted-foreground">
                      All available rules
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-yellow-500 transition-colors"
              onClick={() => applySmartPreset('minimal')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-medium">Fast Scan</div>
                    <div className="text-xs text-muted-foreground">
                      Essential rules only
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-purple-500 transition-colors"
              onClick={() => applySmartPreset('community-best')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Community Best</div>
                    <div className="text-xs text-muted-foreground">
                      Top-rated community rules
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Selection Summary */}
          <Card className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Current Selection</div>
                  <div className="flex items-center gap-3 text-xs">
                    {selectedIds.has('default-rules') && (
                      <Badge variant="secondary">
                        {defaultRulesStats?.total_rules} default
                      </Badge>
                    )}
                    {userCustomRules.filter(r => selectedIds.has(r.id)).length > 0 && (
                      <Badge variant="secondary">
                        {userCustomRules.filter(r => selectedIds.has(r.id)).length} custom
                      </Badge>
                    )}
                    {communityRules.filter(r => selectedIds.has(r.id)).length > 0 && (
                      <Badge variant="secondary">
                        {communityRules.filter(r => selectedIds.has(r.id)).length} community
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('manual')}
                >
                  Customize →
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          {/* Manual Rule Selection */}
          <div className="space-y-3">
            <RuleCategory
              title="Default Security Rules"
              icon={Shield}
              rules={[]}
              selectedIds={selectedIds}
              onToggle={handleRuleToggle}
              color="blue"
              isDefault={true}
              defaultStats={defaultRulesStats}
            />

            {userCustomRules.length > 0 && (
              <RuleCategory
                title="My Custom Rules"
                icon={Settings}
                rules={userCustomRules}
                selectedIds={selectedIds}
                onToggle={handleRuleToggle}
                color="purple"
              />
            )}

            <RuleCategory
              title="Community Rules"
              icon={Users}
              rules={communityRules}
              selectedIds={selectedIds}
              onToggle={handleRuleToggle}
              color="orange"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedIds(new Set())
                updateParent(new Set())
              }}
            >
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newIds = new Set<string>(['default-rules'])
                  setSelectedIds(newIds)
                  updateParent(newIds)
                }}
              >
                Reset to Default
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}