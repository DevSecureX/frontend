import { 
  BarChart3, 
  Code2, 
  Users, 
  TrendingUp, 
  Award,
  Eye,
  Heart,
  Calendar,
  Activity
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

import type { RuleStats, CommunityMetrics } from '@/types/rules'
import { formatDistanceToNow } from 'date-fns'
import { useTimezone } from '@/contexts/TimezoneContext'

interface RuleStatsCardProps {
  title: string
  stats: RuleStats | CommunityMetrics | null | undefined
  type: 'personal' | 'community'
}

export function RuleStatsCard({ title, stats, type }: RuleStatsCardProps) {
  const { formatRelativeDate } = useTimezone()
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>Loading analytics data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'personal') {
    const personalStats = stats as RuleStats
    const mostUsedTool = personalStats.most_used_tools?.[0]

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Your rule creation and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rule Count Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {personalStats.my_rules}
              </div>
              <div className="text-sm text-muted-foreground">Total Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {personalStats.total_usage}
              </div>
              <div className="text-sm text-muted-foreground">Total Uses</div>
            </div>
          </div>

          {/* Rule Types Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Public Rules
              </span>
              <span>{personalStats.public_rules}</span>
            </div>
            <Progress 
              value={(personalStats.public_rules / Math.max(personalStats.my_rules, 1)) * 100} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Private Rules
              </span>
              <span>{personalStats.private_rules}</span>
            </div>
            <Progress 
              value={(personalStats.private_rules / Math.max(personalStats.my_rules, 1)) * 100} 
              className="h-2"
            />
          </div>

          {/* Most Used Tool */}
          {mostUsedTool && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Most Used Tool</span>
                <Badge variant="outline" className="capitalize">
                  {mostUsedTool.tool}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {mostUsedTool.count} rules created
              </div>
            </div>
          )}

          {/* Recent Activity Preview */}
          {personalStats.recent_activity && personalStats.recent_activity.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Recent Activity</div>
              {personalStats.recent_activity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'created' ? 'bg-green-500 dark:bg-green-600' :
                    activity.type === 'updated' ? 'bg-blue-500 dark:bg-blue-600' :
                    activity.type === 'voted' ? 'bg-purple-500 dark:bg-purple-600' :
                    'bg-orange-500 dark:bg-orange-600'
                  }`} />
                  <span className="flex-1 truncate">{activity.rule_name}</span>
                  <span className="text-muted-foreground capitalize">{activity.type}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  } else {
    const communityStats = stats as CommunityMetrics
    const topContributor = communityStats.top_contributors?.[0]

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Community rules and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Community Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {communityStats.total_community_rules}
              </div>
              <div className="text-sm text-muted-foreground">Public Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {communityStats.top_contributors?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Contributors</div>
            </div>
          </div>

          {/* Top Contributor */}
          {topContributor && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Top Contributor</span>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                  <span className="text-sm font-bold">{topContributor.total_upvotes}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>@{topContributor.username}</span>
                <span>{topContributor.rule_count} rules</span>
              </div>
            </div>
          )}

          {/* Trending Rules */}
          {communityStats.trending_rules && communityStats.trending_rules.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending This Week
              </div>
              {communityStats.trending_rules.slice(0, 3).map((rule, index) => (
                <div key={rule.id} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-yellow-500 dark:bg-yellow-600' :
                    index === 1 ? 'bg-gray-400 dark:bg-gray-500' :
                    'bg-orange-600 dark:bg-orange-700'
                  }`} />
                  <span className="flex-1 truncate font-medium">{rule.rule_name}</span>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500 dark:text-red-400" />
                    <span>{rule.net_votes}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Most Used Rules */}
          {communityStats.most_used_rules && communityStats.most_used_rules.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Most Used
              </div>
              {communityStats.most_used_rules.slice(0, 3).map((rule, index) => (
                <div key={rule.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full text-white text-xs flex items-center justify-center ${
                      index === 0 ? 'bg-green-500 dark:bg-green-600' :
                      index === 1 ? 'bg-blue-500 dark:bg-blue-600' :
                      'bg-purple-500 dark:bg-purple-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="truncate font-medium max-w-[120px]">{rule.rule_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{rule.usage_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Newest Rules */}
          {communityStats.newest_rules && communityStats.newest_rules.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recently Added
              </div>
              {communityStats.newest_rules.slice(0, 2).map((rule) => (
                <div key={rule.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                  <span className="truncate font-medium flex-1 mr-2">{rule.rule_name}</span>
                  <span className="text-muted-foreground">
                    {formatRelativeDate(rule.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
}