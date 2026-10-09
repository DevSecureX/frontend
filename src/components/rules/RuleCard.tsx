import { useState } from 'react'
import { 
  Heart,
  HeartOff,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Copy,
  Share2,
  Code2,
  TrendingUp,
  Calendar,
  User,
  ChevronUp,
  ChevronDown,
  Play,
  Lock,
  Globe,
  AlertTriangle,
  Info,
  CheckCircle2,
  BookOpen
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'

import type { CustomRule } from '@/types/rules'
import { formatDistanceToNow } from 'date-fns'
import { useTimezone } from '@/contexts/TimezoneContext'

interface RuleCardProps {
  rule: CustomRule
  onDelete?: (ruleId: string) => void
  onEdit?: (rule: CustomRule) => void
  onVote?: (ruleId: string, voteType: 'up' | 'down') => Promise<void>
  onTest?: (rule: CustomRule) => void
  onClone?: (rule: CustomRule) => void
  onShare?: (rule: CustomRule) => void
  onSaveAsTemplate?: (rule: CustomRule) => void
  showOwnerActions?: boolean
  showVoting?: boolean
  compact?: boolean
}

export function RuleCard({
  rule,
  onDelete,
  onEdit,
  onVote,
  onTest,
  onClone,
  onShare,
  onSaveAsTemplate,
  showOwnerActions = false,
  showVoting = true,
  compact = false
}: RuleCardProps) {
  const { toast } = useToast()
  const { formatRelativeDate } = useTimezone()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  const handleCopyRule = async () => {
    try {
      await navigator.clipboard.writeText(rule.pattern)
      toast({
        title: "Rule copied",
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

  const handleVote = async (voteType: 'up' | 'down') => {
    if (onVote && !isVoting && !rule.is_own_rule) {
      setIsVoting(true)
      try {
        await onVote(rule.id, voteType)
        
        // Show feedback toast
        const action = rule.vote_type === voteType ? 'removed your vote from' : `${voteType}voted`
        toast({
          title: "Vote recorded",
          description: `Successfully ${action} "${rule.rule_name}".`,
        })
      } catch (error) {
        toast({
          title: "Vote failed",
          description: "Failed to record your vote. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsVoting(false)
      }
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
      case 'high': return 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700'
      case 'low': return 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
      case 'info': return 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700'
      default: return 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-3 w-3" />
      case 'medium':
        return <Info className="h-3 w-3" />
      case 'low':
      case 'info':
        return <CheckCircle2 className="h-3 w-3" />
      default:
        return <Info className="h-3 w-3" />
    }
  }

  const getToolIcon = (tool: string) => {
    // You can add more specific tool icons here
    return <Code2 className="h-4 w-4" />
  }

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-sm truncate">{rule.rule_name}</h3>
                <Badge 
                  className={`text-white ${getSeverityColor(rule.severity)} text-xs`}
                >
                  {getSeverityIcon(rule.severity)}
                  {rule.severity}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{rule.tool}</span>
                {rule.language && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <span className="capitalize">{rule.language}</span>
                  </>
                )}
                <Separator orientation="vertical" className="h-3" />
                <span>{formatRelativeDate(rule.created_at)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {showVoting && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 transition-all duration-200 ${
                      rule.vote_type === 'up' 
                        ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30 hover:bg-green-200 dark:hover:bg-green-900/40 scale-110' 
                        : 'hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/30 hover:scale-105'
                    } ${rule.is_own_rule ? 'cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => handleVote('up')}
                    disabled={rule.is_own_rule || isVoting}
                    title={rule.is_own_rule ? "You can't vote on your own rules" : "Upvote this rule"}
                  >
                    <ChevronUp className={`h-3 w-3 transition-transform ${isVoting ? 'animate-pulse' : ''}`} />
                  </Button>
                  <span className={`text-xs font-bold w-6 text-center transition-colors ${
                    rule.net_votes > 0 ? 'text-green-600 dark:text-green-400' : 
                    rule.net_votes < 0 ? 'text-red-600 dark:text-red-400' : 
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {rule.net_votes}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 transition-all duration-200 ${
                      rule.vote_type === 'down' 
                        ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30 hover:bg-red-200 dark:hover:bg-red-900/40 scale-110' 
                        : 'hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:scale-105'
                    } ${rule.is_own_rule ? 'cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => handleVote('down')}
                    disabled={rule.is_own_rule || isVoting}
                    title={rule.is_own_rule ? "You can't vote on your own rules" : "Downvote this rule"}
                  >
                    <ChevronDown className={`h-3 w-3 transition-transform ${isVoting ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              )}
              
              {rule.is_public ? (
                <Globe className="h-3 w-3 text-green-500 dark:text-green-400" />
              ) : (
                <Lock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getToolIcon(rule.tool)}
              <span className="truncate">{rule.rule_name}</span>
              {rule.is_public ? (
                <Globe className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              )}
            </CardTitle>
            
            <div className="flex items-center gap-3 mt-2">
              <Badge 
                className={`text-white ${getSeverityColor(rule.severity)}`}
              >
                {getSeverityIcon(rule.severity)}
                {rule.severity.toUpperCase()}
              </Badge>
              
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

          <div className="flex items-center gap-2">
            {showVoting && (
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 transition-all duration-200 ${
                    rule.vote_type === 'up' 
                      ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 scale-110 shadow-lg' 
                      : 'hover:bg-green-100 dark:hover:bg-green-950/30 hover:text-green-600 dark:hover:text-green-400 hover:scale-105'
                  } ${rule.is_own_rule ? 'cursor-not-allowed opacity-50' : ''}`}
                  onClick={() => handleVote('up')}
                  disabled={rule.is_own_rule || isVoting}
                  title={rule.is_own_rule ? "You can't vote on your own rules" : "Upvote this rule"}
                >
                  <ChevronUp className={`h-4 w-4 transition-transform ${isVoting ? 'animate-pulse' : ''}`} />
                </Button>
                <span className={`text-sm font-bold transition-all duration-300 ${
                  rule.net_votes > 0 ? 'text-green-600 dark:text-green-400 scale-105' : 
                  rule.net_votes < 0 ? 'text-red-600 dark:text-red-400 scale-105' : 
                  'text-gray-500 dark:text-gray-400'
                } ${isVoting ? 'animate-pulse' : ''}`}>
                  {rule.net_votes}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 transition-all duration-200 ${
                    rule.vote_type === 'down' 
                      ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 scale-110 shadow-lg' 
                      : 'hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 hover:scale-105'
                  } ${rule.is_own_rule ? 'cursor-not-allowed opacity-50' : ''}`}
                  onClick={() => handleVote('down')}
                  disabled={rule.is_own_rule || isVoting}
                  title={rule.is_own_rule ? "You can't vote on your own rules" : "Downvote this rule"}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${isVoting ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <div className="flex flex-col gap-0.5">
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <div className="w-1 h-1 bg-current rounded-full" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onTest && (
                  <DropdownMenuItem onClick={() => onTest(rule)}>
                    <Play className="h-4 w-4 mr-2" />
                    Test Rule
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={handleCopyRule}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Pattern
                </DropdownMenuItem>
                
                {onClone && (
                  <DropdownMenuItem onClick={() => onClone(rule)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Clone Rule
                  </DropdownMenuItem>
                )}
                
                {onShare && (
                  <DropdownMenuItem onClick={() => onShare(rule)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Rule
                  </DropdownMenuItem>
                )}
                
                {onSaveAsTemplate && showOwnerActions && (
                  <DropdownMenuItem onClick={() => onSaveAsTemplate(rule)}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Save as Template
                  </DropdownMenuItem>
                )}

                {showOwnerActions && (
                  <>
                    <DropdownMenuSeparator />
                    
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(rule)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Rule
                      </DropdownMenuItem>
                    )}
                    
                    {onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Rule
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the rule
                              "{rule.rule_name}" and remove it from all your scans.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(rule.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Rule
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {rule.description && (
          <CardDescription className="text-sm leading-relaxed">
            {rule.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Rule pattern preview */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Rule Pattern</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show
                </>
              )}
            </Button>
          </div>
          
          {isExpanded ? (
            <div className="bg-muted/50 p-3 rounded-lg font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap break-all">{rule.pattern}</pre>
            </div>
          ) : (
            <div className="bg-muted/50 p-3 rounded-lg font-mono text-sm overflow-hidden">
              <div className="truncate text-muted-foreground">
                {rule.pattern.split('\n')[0]}
                {rule.pattern.includes('\n') && '...'}
              </div>
            </div>
          )}
        </div>

        {/* Rule metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {rule.author_username && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>by {rule.author_username}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatRelativeDate(rule.created_at)}</span>
            </div>
            
            {rule.usage_count > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{rule.usage_count} uses</span>
              </div>
            )}
          </div>

          {rule.tags && rule.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {rule.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {rule.tags.length > 2 && (
                <span className="text-xs">+{rule.tags.length - 2} more</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}