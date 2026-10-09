import React, { useState } from 'react'
import { useTimezone } from '@/contexts/TimezoneContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  MessageSquare, 
  Plus, 
  Users, 
  BookmarkPlus, 
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Heart,
  Flag,
  Share2,
  FolderPlus,
  FolderOpen,
  UserPlus
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'

import { rulesAPI } from '@/lib/api/rules'
import type { CustomRule } from '@/types/rules'

interface RuleCollaborationPanelProps {
  rule: CustomRule
  currentUserId?: number
  onRuleUpdate?: () => void
}

interface Comment {
  id: string
  content: string
  user_id: number
  username: string
  created_at: string
  replies?: Comment[]
}

interface Collection {
  id: string
  name: string
  description: string
  is_public: boolean
  rule_count: number
  created_at: string
}

export function RuleCollaborationPanel({ rule, currentUserId, onRuleUpdate }: RuleCollaborationPanelProps) {
  const { formatDateOnly } = useTimezone()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // State management
  const [activeTab, setActiveTab] = useState<'comments' | 'collections' | 'feedback'>('comments')
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    is_public: false
  })
  const [feedback, setFeedback] = useState({
    type: 'improvement' as 'bug' | 'improvement' | 'feature_request' | 'other',
    content: '',
    rating: 5
  })
  const [showCreateCollection, setShowCreateCollection] = useState(false)

  // Fetch rule comments
  const { 
    data: commentsData, 
    isLoading: commentsLoading,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['rule-comments', rule.id],
    queryFn: () => rulesAPI.getRuleComments(rule.id),
    staleTime: 30 * 1000 // 30 seconds
  })

  // Fetch user collections
  const { 
    data: collections,
    isLoading: collectionsLoading,
    refetch: refetchCollections
  } = useQuery({
    queryKey: ['rule-collections'],
    queryFn: () => rulesAPI.getRuleCollections(),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string; parent_comment_id?: string }) =>
      rulesAPI.addRuleComment(rule.id, data),
    onSuccess: () => {
      setNewComment('')
      setReplyingTo(null)
      refetchComments()
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully."
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add comment",
        description: error.message || "An error occurred while posting your comment.",
        variant: "destructive"
      })
    }
  })

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: (data: typeof newCollection) => rulesAPI.createRuleCollection(data),
    onSuccess: (collection) => {
      setNewCollection({ name: '', description: '', is_public: false })
      setShowCreateCollection(false)
      refetchCollections()
      toast({
        title: "Collection created",
        description: `"${collection.name}" has been created successfully.`
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create collection",
        description: error.message || "An error occurred while creating the collection.",
        variant: "destructive"
      })
    }
  })

  // Add to collection mutation
  const addToCollectionMutation = useMutation({
    mutationFn: (collectionId: string) => 
      rulesAPI.addRuleToCollection(collectionId, rule.id),
    onSuccess: () => {
      toast({
        title: "Rule added to collection",
        description: "The rule has been added to your collection."
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add rule to collection",
        description: error.message || "An error occurred while adding the rule.",
        variant: "destructive"
      })
    }
  })

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: (data: typeof feedback) => rulesAPI.submitRuleFeedback(rule.id, data),
    onSuccess: () => {
      setFeedback({ type: 'improvement', content: '', rating: 5 })
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! It helps improve the rule."
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message || "An error occurred while submitting feedback.",
        variant: "destructive"
      })
    }
  })

  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    addCommentMutation.mutate({
      content: newComment,
      parent_comment_id: replyingTo || undefined
    })
  }

  const handleAddToCollection = (collectionId: string) => {
    addToCollectionMutation.mutate(collectionId)
  }

  const handleCreateCollection = () => {
    if (!newCollection.name.trim()) {
      toast({
        title: "Collection name required",
        description: "Please enter a name for your collection.",
        variant: "destructive"
      })
      return
    }

    createCollectionMutation.mutate(newCollection)
  }

  const handleSubmitFeedback = () => {
    if (!feedback.content.trim()) {
      toast({
        title: "Feedback content required",
        description: "Please enter your feedback.",
        variant: "destructive"
      })
      return
    }

    submitFeedbackMutation.mutate(feedback)
  }

  const renderCommentsTab = () => (
    <div className="space-y-4">
      {/* Add new comment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {replyingTo ? 'Reply to Comment' : 'Add Comment'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={replyingTo ? 'Write your reply...' : 'Share your thoughts about this rule...'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            {replyingTo && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setReplyingTo(null)}
              >
                Cancel Reply
              </Button>
            )}
            <Button
              onClick={handleAddComment}
              disabled={addCommentMutation.isPending || !newComment.trim()}
              className="ml-auto flex items-center gap-2"
            >
              {addCommentMutation.isPending ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {replyingTo ? 'Reply' : 'Comment'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Comments ({commentsData?.total || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commentsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : commentsData?.comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4">
                {commentsData?.comments.map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {comment.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{comment.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateOnly(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(comment.id)}
                            className="text-xs h-7"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Replies */}
                    {comment.replies?.map((reply) => (
                      <div key={reply.id} className="ml-8 pl-4 border-l-2 border-muted">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {reply.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-xs">{reply.username}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateOnly(reply.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderCollectionsTab = () => (
    <div className="space-y-4">
      {/* Create new collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              My Collections
            </span>
            <Dialog open={showCreateCollection} onOpenChange={setShowCreateCollection}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                  <DialogDescription>
                    Organize your favorite rules into collections
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="collection-name">Collection Name</Label>
                    <Input
                      id="collection-name"
                      placeholder="Enter collection name..."
                      value={newCollection.name}
                      onChange={(e) => setNewCollection(prev => ({ 
                        ...prev, 
                        name: e.target.value 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="collection-description">Description</Label>
                    <Textarea
                      id="collection-description"
                      placeholder="Describe your collection..."
                      value={newCollection.description}
                      onChange={(e) => setNewCollection(prev => ({ 
                        ...prev, 
                        description: e.target.value 
                      }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="collection-public"
                      checked={newCollection.is_public}
                      onCheckedChange={(checked) => setNewCollection(prev => ({ 
                        ...prev, 
                        is_public: checked 
                      }))}
                    />
                    <Label htmlFor="collection-public">Make collection public</Label>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <Button
                      onClick={handleCreateCollection}
                      disabled={createCollectionMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {createCollectionMutation.isPending ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Create Collection
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateCollection(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collectionsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : collections?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookmarkPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No collections yet. Create your first collection to organize rules!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {collections?.map((collection) => (
                <div 
                  key={collection.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{collection.name}</h4>
                      {collection.is_public && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {collection.description || 'No description'}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {collection.rule_count} rules
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddToCollection(collection.id)}
                    disabled={addToCollectionMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    Add Rule
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderFeedbackTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Submit Feedback
          </CardTitle>
          <CardDescription>
            Help improve this rule by sharing your feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Feedback Type</Label>
            <Select 
              value={feedback.type} 
              onValueChange={(value: any) => setFeedback(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="improvement">Improvement Suggestion</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-content">Feedback</Label>
            <Textarea
              id="feedback-content"
              placeholder="Share your detailed feedback..."
              value={feedback.content}
              onChange={(e) => setFeedback(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-rating">Overall Rating (1-5)</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={feedback.rating >= rating ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeedback(prev => ({ ...prev, rating }))}
                  className="w-8 h-8 p-0"
                >
                  <Star className={`h-4 w-4 ${
                    feedback.rating >= rating ? 'fill-current' : ''
                  }`} />
                </Button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {feedback.rating}/5
              </span>
            </div>
          </div>

          <Button
            onClick={handleSubmitFeedback}
            disabled={submitFeedbackMutation.isPending || !feedback.content.trim()}
            className="w-full flex items-center gap-2"
          >
            {submitFeedbackMutation.isPending ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Collaboration
          </h3>
          <p className="text-sm text-muted-foreground">
            Engage with the community around "{rule.rule_name}"
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
            {commentsData?.total ? (
              <Badge variant="secondary" className="ml-1 text-xs">
                {commentsData.total}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments">
          {renderCommentsTab()}
        </TabsContent>

        <TabsContent value="collections">
          {renderCollectionsTab()}
        </TabsContent>

        <TabsContent value="feedback">
          {renderFeedbackTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}