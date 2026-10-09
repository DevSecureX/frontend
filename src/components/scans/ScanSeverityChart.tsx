import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ScanSeverityChartProps {
  severityData: Record<string, number>
}

export function ScanSeverityChart({ severityData }: ScanSeverityChartProps) {
  const total = Object.values(severityData).reduce((sum, count) => sum + count, 0)
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      case 'info':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Security Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No security issues found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Security Issues</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simple bar chart representation */}
        <div className="space-y-3">
          {Object.entries(severityData)
            .sort(([, a], [, b]) => b - a)
            .map(([severity, count]) => {
              const percentage = total > 0 ? (count / total) * 100 : 0
              
              return (
                <div key={severity} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity)}`} />
                      <span className="capitalize font-medium">{severity}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 border border-border dark:border-gray-600">
                    <div
                      className={`h-2 rounded-full ${getSeverityColor(severity)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Issues</span>
            <Badge className="font-semibold">{total}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}