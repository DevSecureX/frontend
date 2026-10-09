import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Tags, 
  FolderTree, 
  Archive, 
  ArchiveRestore,
  Plus,
  X,
  Edit,
  Save,
  RefreshCw,
  Hash,
  Folder,
  Search
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

import { rulesAPI } from '@/lib/api/rules'
import type { CustomRule } from '@/types/rules'

interface RuleManagementInterfaceProps {
  rule: CustomRule
  onRuleUpdate?: () => void
}

interface Category {
  id: string
  name: string
  description: string
  parent_id?: string
  icon?: string
  color?: string
}

interface TagSuggestion {
  tag: string
  usage_count: number
  related_tools: string[]
}

export function RuleManagementInterface({ rule, onRuleUpdate }: RuleManagementInterfaceProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // State management
  const [activeTab, setActiveTab] = useState<'tags' | 'categories' | 'archive'>('tags')
  const [newTag, setNewTag] = useState('')
  const [tagSearch, setTagSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(rule.tags || [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parent_id: '',
    icon: '',
    color: '#6366f1'
  })
  const [showCreateCategory, setShowCreateCategory] = useState(false)

  // Fetch rule categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['rule-categories'],
    queryFn: () => rulesAPI.getRuleCategories(),
    staleTime: 5 * 60 * 1000
  })

  // Fetch tag suggestions
  const { data: tagSuggestions } = useQuery({
    queryKey: ['tag-suggestions', tagSearch],
    queryFn: () => tagSearch.length >= 2 ? rulesAPI.getTagSuggestions(tagSearch, 10) : [],
    enabled: tagSearch.length >= 2,
    staleTime: 30 * 1000
  })

  // Update rule tags mutation
  const updateTagsMutation = useMutation({
    mutationFn: (tags: string[]) => rulesAPI.updateRuleTags(rule.id, tags),
    onSuccess: () => {
      toast({
        title: "Tags updated",
        description: "Rule tags have been updated successfully."
      })
      queryClient.invalidateQueries({ queryKey: ['my-rules'] })
      onRuleUpdate?.()
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update tags",
        description: error.message || "An error occurred while updating tags.",
        variant: "destructive"
      })
    }
  })

  // Update rule categories mutation
  const updateCategoriesMutation = useMutation({
    mutationFn: (categoryIds: string[]) => rulesAPI.updateRuleCategories(rule.id, categoryIds),
    onSuccess: () => {
      toast({
        title: "Categories updated",
        description: "Rule categories have been updated successfully."
      })
      queryClient.invalidateQueries({ queryKey: ['my-rules'] })
      onRuleUpdate?.()
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update categories",
        description: error.message || "An error occurred while updating categories.",
        variant: "destructive"
      })
    }
  })

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: typeof newCategory) => rulesAPI.createRuleCategory(data),
    onSuccess: (category) => {
      setNewCategory({ name: '', description: '', parent_id: '', icon: '', color: '#6366f1' })
      setShowCreateCategory(false)
      queryClient.invalidateQueries({ queryKey: ['rule-categories'] })
      toast({
        title: "Category created",
        description: `"${category.name}" has been created successfully.`
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create category",
        description: error.message || "An error occurred while creating the category.",
        variant: "destructive"
      })
    }
  })

  // Archive rule mutation
  const archiveRuleMutation = useMutation({
    mutationFn: (reason?: string) => rulesAPI.archiveRule(rule.id, reason),
    onSuccess: () => {
      toast({
        title: "Rule archived",
        description: "The rule has been archived successfully."
      })
      queryClient.invalidateQueries({ queryKey: ['my-rules'] })
      onRuleUpdate?.()
    },
    onError: (error: any) => {
      toast({
        title: "Failed to archive rule",
        description: error.message || "An error occurred while archiving the rule.",
        variant: "destructive"
      })
    }
  })

  // Unarchive rule mutation
  const unarchiveRuleMutation = useMutation({
    mutationFn: () => rulesAPI.unarchiveRule(rule.id),
    onSuccess: () => {
      toast({
        title: "Rule restored",
        description: "The rule has been restored from archive."
      })
      queryClient.invalidateQueries({ queryKey: ['my-rules'] })
      onRuleUpdate?.()
    },
    onError: (error: any) => {
      toast({
        title: "Failed to restore rule",
        description: error.message || "An error occurred while restoring the rule.",
        variant: "destructive"
      })
    }
  })

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
      setNewTag('')
      setTagSearch('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const handleSaveTags = () => {
    updateTagsMutation.mutate(selectedTags)
  }

  const handleSaveCategories = () => {
    updateCategoriesMutation.mutate(selectedCategories)
  }

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Category name required",
        description: "Please enter a name for the category.",
        variant: "destructive"
      })
      return
    }
    createCategoryMutation.mutate(newCategory)
  }

  const renderTagsTab = () => (
    <div className="space-y-4">
      {/* Current Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Current Tags
          </CardTitle>
          <CardDescription>
            Organize and categorize this rule with relevant tags
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {selectedTags.length > 0 ? (
              selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags assigned yet</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveTags}
              disabled={updateTagsMutation.isPending || JSON.stringify(selectedTags) === JSON.stringify(rule.tags || [])}
              className="flex items-center gap-2"
            >
              {updateTagsMutation.isPending ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Tags
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Add Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-tag">Search or add new tag</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-tag"
                  placeholder="Search tags or type new tag..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && tagSearch.trim()) {
                      handleAddTag(tagSearch.trim())
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => handleAddTag(tagSearch.trim())}
                disabled={!tagSearch.trim() || selectedTags.includes(tagSearch.trim())}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tag Suggestions */}
          {tagSuggestions && tagSuggestions.length > 0 && (
            <div className="space-y-2">
              <Label>Suggested Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tagSuggestions.map((suggestion: TagSuggestion) => (
                  <Button
                    key={suggestion.tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag(suggestion.tag)}
                    disabled={selectedTags.includes(suggestion.tag)}
                    className="text-xs"
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {suggestion.tag}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {suggestion.usage_count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          <div className="space-y-2">
            <Label>Quick Add</Label>
            <div className="flex flex-wrap gap-2">
              {['security', 'vulnerability', 'best-practice', 'performance', 'compliance'].map(tag => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTag(tag)}
                  disabled={selectedTags.includes(tag)}
                  className="text-xs"
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCategoriesTab = () => (
    <div className="space-y-4">
      {/* Current Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Categories
            </span>
            <Dialog open={showCreateCategory} onOpenChange={setShowCreateCategory}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                  <DialogDescription>
                    Create a new category to organize your rules
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      placeholder="Enter category name..."
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category-description">Description</Label>
                    <Textarea
                      id="category-description"
                      placeholder="Describe the category..."
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent-category">Parent Category (Optional)</Label>
                    <Select
                      value={newCategory.parent_id}
                      onValueChange={(value) => setNewCategory(prev => ({ ...prev, parent_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No parent category</SelectItem>
                        {categories?.map((category: Category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <Button
                      onClick={handleCreateCategory}
                      disabled={createCategoryMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {createCategoryMutation.isPending ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Create Category
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateCategory(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Assign this rule to relevant categories for better organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {categories?.map((category: Category) => (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (selectedCategories.includes(category.id)) {
                        setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                      } else {
                        setSelectedCategories([...selectedCategories, category.id])
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category.id])
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          {category.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="mt-4">
            <Button
              onClick={handleSaveCategories}
              disabled={updateCategoriesMutation.isPending}
              className="flex items-center gap-2"
            >
              {updateCategoriesMutation.isPending ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Categories
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderArchiveTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Archive Management
          </CardTitle>
          <CardDescription>
            Archive or restore this rule to manage its visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rule.is_deprecated ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <Archive className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    This rule is archived
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Archived rules are not used in active scans but remain accessible.
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => unarchiveRuleMutation.mutate()}
                disabled={unarchiveRuleMutation.isPending}
                className="flex items-center gap-2"
              >
                {unarchiveRuleMutation.isPending ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <ArchiveRestore className="h-4 w-4" />
                )}
                Restore from Archive
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Archive Rule
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Archiving this rule will remove it from active use but keep it accessible for reference.
                  This action can be reversed at any time.
                </p>
                
                <Button
                  variant="destructive"
                  onClick={() => archiveRuleMutation.mutate(undefined)}
                  disabled={archiveRuleMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {archiveRuleMutation.isPending ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                  Archive Rule
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Rule Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Organize and manage "{rule.rule_name}"
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Tags
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {selectedTags.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tags">
          {renderTagsTab()}
        </TabsContent>

        <TabsContent value="categories">
          {renderCategoriesTab()}
        </TabsContent>

        <TabsContent value="archive">
          {renderArchiveTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}