import React, { useState, useMemo } from 'react'
import { useTimezone } from '@/contexts/TimezoneContext'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Shield,
  Users,
  Settings,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Info
} from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { rulesAPI } from '@/lib/api/rules'
import type { CustomRule, RuleFilters, SupportedTool, RuleLanguage } from '@/types/rules'
import type { Repository } from '@/types/global'

interface RuleSelectionDialogProps {
  open: boolean
  onClose: () => void
  repository?: Repository
  onRulesSelected: (selectedRules: {
    defaultRules: string[]
    customRules: string[]
    communityRules: string[]
  }) => void
  initialSelection?: {
    defaultRules?: string[]
    customRules?: string[]
    communityRules?: string[]
  }
}

interface RuleStats {
  total_rules: number
  rule_files: string[]
  languages: string[]
}

export function RuleSelectionDialog({ 
  open, 
  onClose, 
  repository, 
  onRulesSelected,
  initialSelection 
}: RuleSelectionDialogProps) {
  const { formatDateOnly } = useTimezone()

  // Selection state
  const [selectedDefaultRules, setSelectedDefaultRules] = useState<string[]>(
    initialSelection?.defaultRules || []
  )
  const [selectedCustomRules, setSelectedCustomRules] = useState<string[]>(
    initialSelection?.customRules || []
  )
  const [selectedCommunityRules, setSelectedCommunityRules] = useState<string[]>(
    initialSelection?.communityRules || []
  )

  // UI state
  const [activeTab, setActiveTab] = useState<'default' | 'custom' | 'community' | 'recommended'>('default')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRule, setSelectedRule] = useState<CustomRule | null>(null)
  const [filters, setFilters] = useState<Partial<RuleFilters>>({
    sort_by: 'effectiveness',
    sort_order: 'desc'
  })

  // Data fetching
  const { data: defaultRulesStats } = useQuery({
    queryKey: ['default-rules-stats', repository?.niche],
    queryFn: () => repository?.niche ? 
      rulesAPI.getDefaultRulesStats(repository.niche) : null,
    enabled: !!repository?.niche && activeTab === 'default'
  })

  const { data: myRulesData } = useQuery({
    queryKey: ['my-rules', filters],
    queryFn: () => rulesAPI.getMyRules(1, 50, filters),
    enabled: activeTab === 'custom'
  })

  const { data: communityRulesData } = useQuery({
    queryKey: ['community-rules', filters],
    queryFn: () => rulesAPI.getCommunityRules(1, 50, {
      ...filters,
      search_query: searchQuery
    }),
    enabled: activeTab === 'community'
  })

  const { data: recommendedRules } = useQuery({
    queryKey: ['recommended-rules', repository?.id],
    queryFn: () => repository ? 
      rulesAPI.getRecommendations('repository', repository.id, undefined, undefined, repository.language) : [],
    enabled: activeTab === 'recommended' && !!repository
  })

  // Compute total selections
  const totalSelected = selectedDefaultRules.length + selectedCustomRules.length + selectedCommunityRules.length

  // Handle rule selection
  const toggleRuleSelection = (ruleId: string, category: 'default' | 'custom' | 'community') => {
    switch (category) {
      case 'default':
        setSelectedDefaultRules(prev => 
          prev.includes(ruleId) 
            ? prev.filter(id => id !== ruleId)
            : [...prev, ruleId]
        )
        break
      case 'custom':
        setSelectedCustomRules(prev => 
          prev.includes(ruleId) 
            ? prev.filter(id => id !== ruleId)
            : [...prev, ruleId]
        )
        break
      case 'community':
        setSelectedCommunityRules(prev => 
          prev.includes(ruleId) 
            ? prev.filter(id => id !== ruleId)
            : [...prev, ruleId]
        )
        break
    }
  }

  // Apply selection
  const handleApplySelection = () => {
    onRulesSelected({
      defaultRules: selectedDefaultRules,
      customRules: selectedCustomRules,
      communityRules: selectedCommunityRules
    })
    onClose()
  }

  // Render rule card
  const renderRuleCard = (rule: CustomRule, category: 'custom' | 'community') => {
    const isSelected = category === 'custom' 
      ? selectedCustomRules.includes(rule.id)
      : selectedCommunityRules.includes(rule.id)

    return (
      <Card 
        key={rule.id} 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/30' : ''
        }`}
        onClick={() => toggleRuleSelection(rule.id, category)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onChange={() => {}} // Handled by card click
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-sm line-clamp-2">{rule.rule_name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {rule.description || 'No description provided'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRule(rule)
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  {rule.tool}
                </Badge>
                {rule.language && (
                  <Badge variant="secondary" className="text-xs">
                    {rule.language}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {rule.severity}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {rule.upvotes} votes
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {rule.usage_count} uses
                  </span>
                </div>
                {rule.effectiveness_score && (
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {Math.round(rule.effectiveness_score * 100)}% effective
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Select Security Rules
            </DialogTitle>
            <DialogDescription>
              Choose which security rules to apply to your scan. You can combine default curated rules with custom and community rules.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 h-full">
              {/* Left Panel - Rule Selection */}
              <div className="col-span-3 flex flex-col">
                {/* Search and Filters */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select 
                    value={filters.sort_by || 'effectiveness'} 
                    onValueChange={(value: any) => setFilters(prev => ({ ...prev, sort_by: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="effectiveness">Most Effective</SelectItem>
                      <SelectItem value="usage_count">Most Used</SelectItem>
                      <SelectItem value="upvotes">Most Voted</SelectItem>
                      <SelectItem value="created_at">Newest</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="default" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Default Rules
                      {repository?.niche && defaultRulesStats && (
                        <Badge variant="secondary" className="text-xs">
                          {defaultRulesStats.total_rules}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      My Rules
                      {myRulesData && (
                        <Badge variant="secondary" className="text-xs">
                          {myRulesData.total}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="community" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Community
                      {communityRulesData && (
                        <Badge variant="secondary" className="text-xs">
                          {communityRulesData.total}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="recommended" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Recommended
                      {recommendedRules && (
                        <Badge variant="secondary" className="text-xs">
                          {recommendedRules.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-hidden">
                    {/* Default Rules Tab */}
                    <TabsContent value="default" className="h-full">
                      <ScrollArea className="h-full">
                        {repository?.niche ? (
                          <Card 
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md mb-4 ${
                              selectedDefaultRules.length > 0 ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/30' : ''
                            }`}
                            onClick={() => {
                              if (selectedDefaultRules.length > 0) {
                                setSelectedDefaultRules([])
                              } else {
                                // Select all default rules (we'd need rule IDs from backend)
                                setSelectedDefaultRules(['default-all'])
                              }
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={selectedDefaultRules.length > 0}
                                  onChange={() => {}}
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold">
                                    Default {repository.niche.toUpperCase()} Rules
                                  </h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Curated security rules optimized for {repository.niche} projects
                                  </p>
                                  {defaultRulesStats && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {defaultRulesStats.total_rules} rules
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {defaultRulesStats.languages.length} languages
                                      </Badge>
                                      <Badge variant="default" className="text-xs">
                                        Curated
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <Badge variant="default" className="text-xs">
                                  Recommended
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="flex items-center justify-center h-32 text-muted-foreground">
                            <div className="text-center">
                              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Select a repository to see default rules</p>
                            </div>
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    {/* My Rules Tab */}
                    <TabsContent value="custom" className="h-full">
                      <ScrollArea className="h-full">
                        <div className="space-y-3">
                          {myRulesData?.rules.map(rule => renderRuleCard(rule, 'custom'))}
                          {!myRulesData?.rules.length && (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                              <div className="text-center">
                                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No custom rules found</p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  Create Your First Rule
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Community Rules Tab */}
                    <TabsContent value="community" className="h-full">
                      <ScrollArea className="h-full">
                        <div className="space-y-3">
                          {communityRulesData?.rules.map(rule => renderRuleCard(rule, 'community'))}
                          {!communityRulesData?.rules.length && (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                              <div className="text-center">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No community rules found</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Recommended Rules Tab */}
                    <TabsContent value="recommended" className="h-full">
                      <ScrollArea className="h-full">
                        <div className="space-y-3">
                          {recommendedRules?.map(recommendation => 
                            renderRuleCard(recommendation.rule, 'community')
                          )}
                          {!recommendedRules?.length && (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                              <div className="text-center">
                                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No recommendations available</p>
                                <p className="text-sm">Try scanning your repository first</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Right Panel - Selection Summary & Rule Preview */}
              <div className="border-l pl-4">
                <div className="space-y-4">
                  {/* Selection Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Selection Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Total Rules:</span>
                        <Badge variant="default">{totalSelected}</Badge>
                      </div>
                      {selectedDefaultRules.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Default:</span>
                          <Badge variant="secondary">{selectedDefaultRules.length}</Badge>
                        </div>
                      )}
                      {selectedCustomRules.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Custom:</span>
                          <Badge variant="secondary">{selectedCustomRules.length}</Badge>
                        </div>
                      )}
                      {selectedCommunityRules.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Community:</span>
                          <Badge variant="secondary">{selectedCommunityRules.length}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Rule Preview */}
                  {selectedRule && (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm line-clamp-2">{selectedRule.rule_name}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRule(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">{selectedRule.tool}</Badge>
                          {selectedRule.language && (
                            <Badge variant="secondary" className="text-xs">{selectedRule.language}</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">{selectedRule.severity}</Badge>
                        </div>
                        
                        {selectedRule.description && (
                          <p className="text-xs text-muted-foreground line-clamp-4">
                            {selectedRule.description}
                          </p>
                        )}

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Votes:</span>
                            <span>{selectedRule.upvotes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Usage:</span>
                            <span>{selectedRule.usage_count}</span>
                          </div>
                          {selectedRule.effectiveness_score && (
                            <div className="flex justify-between">
                              <span>Effectiveness:</span>
                              <span>{Math.round(selectedRule.effectiveness_score * 100)}%</span>
                            </div>
                          )}
                        </div>

                        <Separator />
                        
                        <div className="text-xs text-muted-foreground">
                          <p>Created: {formatDateOnly(selectedRule.created_at)}</p>
                          {selectedRule.author_username && (
                            <p>By: {selectedRule.author_username}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {totalSelected > 0 ? `${totalSelected} rules selected` : 'No rules selected'}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleApplySelection} disabled={totalSelected === 0}>
                  Apply Selection
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

// Helper function to get default rules stats (would need to be implemented in API)
declare module '@/lib/api/rules' {
  interface RulesAPI {
    getDefaultRulesStats(niche: string): Promise<{
      total_rules: number
      rule_files: string[]
      languages: string[]
    }>
  }
}