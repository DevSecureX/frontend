import React, { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  Shield, 
  Bug,
  Zap,
  Info,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from '@/components/ui/use-toast'

interface SecurityIssue {
  id: string
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  line_start?: number
  line_end?: number
  tool: string
  rule_id?: string
  confidence?: string
  owasp_category?: string
  cwe_id?: string
  fix_suggestion?: {
    fixed_code: string
    explanation: string
    confidence: string
    security_impact?: string
    testing_notes?: string
  }
}

interface FileChange {
  file_path: string
  status: 'added' | 'modified' | 'removed'
  additions: number
  deletions: number
  issues: SecurityIssue[]
  content?: string
  language?: string
}

interface PRCodeViewerProps {
  fileChanges: FileChange[]
  totalIssues: number
  onIssueSelect?: (issue: SecurityIssue) => void
}

const SEVERITY_CONFIG = {
  critical: { 
    icon: AlertTriangle, 
    color: 'text-red-600 bg-red-50 border-red-200', 
    badge: 'destructive',
    emoji: '🚨'
  },
  high: { 
    icon: Shield, 
    color: 'text-orange-600 bg-orange-50 border-orange-200', 
    badge: 'destructive',
    emoji: '⚠️'
  },
  medium: { 
    icon: Zap, 
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
    badge: 'secondary',
    emoji: '⚡'
  },
  low: { 
    icon: Info, 
    color: 'text-blue-600 bg-blue-50 border-blue-200', 
    badge: 'outline',
    emoji: 'ℹ️'
  }
}

export function PRCodeViewer({ fileChanges, totalIssues, onIssueSelect }: PRCodeViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [showFixSuggestions, setShowFixSuggestions] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')

  // Auto-expand files with critical/high issues
  useEffect(() => {
    const criticalHighFiles = fileChanges
      .filter(file => file.issues.some(issue => ['critical', 'high'].includes(issue.severity)))
      .map(file => file.file_path)
    
    setExpandedFiles(new Set(criticalHighFiles.slice(0, 3))) // Limit to first 3
  }, [fileChanges])

  const filteredFiles = fileChanges.filter(file => {
    if (filter === 'all') return file.issues.length > 0
    return file.issues.some(issue => issue.severity === filter)
  })

  const toggleFile = (filePath: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath)
    } else {
      newExpanded.add(filePath)
    }
    setExpandedFiles(newExpanded)
  }

  const toggleFixSuggestion = (issueId: string) => {
    const newSuggestions = new Set(showFixSuggestions)
    if (newSuggestions.has(issueId)) {
      newSuggestions.delete(issueId)
    } else {
      newSuggestions.add(issueId)
    }
    setShowFixSuggestions(newSuggestions)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard",
    })
  }

  const getFileIcon = (status: string) => {
    switch (status) {
      case 'added': return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'modified': return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      case 'removed': return <div className="w-2 h-2 bg-red-500 rounded-full" />
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    }
  }

  const getLineNumbers = (content: string, startLine: number = 1) => {
    return content.split('\n').map((_, index) => startLine + index)
  }

  const highlightSecurityLines = (content: string, issues: SecurityIssue[]) => {
    const lines = content.split('\n')
    const issueLines = new Set(issues.flatMap(issue => 
      issue.line_start ? [issue.line_start] : []
    ))

    return lines.map((line, index) => {
      const lineNumber = index + 1
      const hasIssue = issueLines.has(lineNumber)
      const lineIssues = issues.filter(issue => issue.line_start === lineNumber)
      
      return {
        content: line,
        lineNumber,
        hasIssue,
        issues: lineIssues
      }
    })
  }

  if (filteredFiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Security Issues Found</h3>
          <p className="text-muted-foreground">
            {filter === 'all' 
              ? "All files in this PR are secure! 🎉"
              : `No ${filter} severity issues found in this PR.`
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Security Issues in Code Changes</h3>
          <Badge variant="outline">{totalIssues} issues</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-3">
        {filteredFiles.map((file) => {
          const isExpanded = expandedFiles.has(file.file_path)
          const criticalCount = file.issues.filter(i => i.severity === 'critical').length
          const highCount = file.issues.filter(i => i.severity === 'high').length
          const mediumCount = file.issues.filter(i => i.severity === 'medium').length
          const lowCount = file.issues.filter(i => i.severity === 'low').length

          return (
            <Card key={file.file_path} className="overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => toggleFile(file.file_path)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 pb-4">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        {getFileIcon(file.status)}
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {file.file_path}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          +{file.additions} -{file.deletions}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {criticalCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            🚨 {criticalCount}
                          </Badge>
                        )}
                        {highCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            ⚠️ {highCount}
                          </Badge>
                        )}
                        {mediumCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ⚡ {mediumCount}
                          </Badge>
                        )}
                        {lowCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            ℹ️ {lowCount}
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Issues List */}
                    <div className="space-y-4">
                      {file.issues.map((issue) => {
                        const config = SEVERITY_CONFIG[issue.severity]
                        const Icon = config.icon
                        const showFix = showFixSuggestions.has(issue.id)

                        return (
                          <div key={issue.id} className={`border rounded-lg p-4 ${config.color}`}>
                            {/* Issue Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={config.badge as any} className="text-xs">
                                      {issue.severity.toUpperCase()}
                                    </Badge>
                                    {issue.line_start && (
                                      <Badge variant="outline" className="text-xs">
                                        Line {issue.line_start}
                                      </Badge>
                                    )}
                                    {issue.confidence && (
                                      <Badge variant="outline" className="text-xs">
                                        {issue.confidence} confidence
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-medium text-foreground">
                                    {config.emoji} {issue.message}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Detected by {issue.tool} {issue.rule_id && `(${issue.rule_id})`}
                                  </p>
                                  
                                  {/* Compliance Info */}
                                  {(issue.owasp_category || issue.cwe_id) && (
                                    <div className="flex items-center gap-2 mt-2">
                                      {issue.owasp_category && (
                                        <Badge variant="outline" className="text-xs">
                                          OWASP: {issue.owasp_category}
                                        </Badge>
                                      )}
                                      {issue.cwe_id && (
                                        <Badge variant="outline" className="text-xs">
                                          CWE-{issue.cwe_id}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {issue.fix_suggestion && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleFixSuggestion(issue.id)}
                                    className="text-xs"
                                  >
                                    {showFix ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    {showFix ? 'Hide Fix' : 'Show Fix'}
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onIssueSelect?.(issue)}
                                  className="text-xs"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Details
                                </Button>
                              </div>
                            </div>

                            {/* AI Fix Suggestion */}
                            {issue.fix_suggestion && showFix && (
                              <div className="mt-4 border-t pt-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <h4 className="font-medium text-sm">🤖 AI-Powered Fix Suggestion</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {issue.fix_suggestion.confidence} confidence
                                  </Badge>
                                </div>

                                <div className="relative">
                                  <SyntaxHighlighter
                                    language={file.language || 'text'}
                                    style={vscDarkPlus}
                                    customStyle={{
                                      margin: 0,
                                      borderRadius: '6px',
                                      fontSize: '12px'
                                    }}
                                    showLineNumbers
                                  >
                                    {issue.fix_suggestion.fixed_code}
                                  </SyntaxHighlighter>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 h-8 w-8 p-0"
                                    onClick={() => copyToClipboard(issue.fix_suggestion!.fixed_code)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="mt-3 space-y-2 text-sm">
                                  <p><strong>Explanation:</strong> {issue.fix_suggestion.explanation}</p>
                                  
                                  {issue.fix_suggestion.security_impact && (
                                    <p><strong>🛡️ Security Impact:</strong> {issue.fix_suggestion.security_impact}</p>
                                  )}
                                  
                                  {issue.fix_suggestion.testing_notes && (
                                    <p><strong>🧪 Testing Notes:</strong> {issue.fix_suggestion.testing_notes}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Code Preview with Issues Highlighted */}
                    {file.content && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">Code Preview</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(file.content!)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        
                        <div className="relative">
                          <SyntaxHighlighter
                            language={file.language || 'text'}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}
                            showLineNumbers
                            wrapLines
                            lineProps={(lineNumber) => {
                              const hasIssue = file.issues.some(issue => issue.line_start === lineNumber)
                              return {
                                style: {
                                  backgroundColor: hasIssue ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                  borderLeft: hasIssue ? '3px solid #ef4444' : 'none',
                                  paddingLeft: hasIssue ? '8px' : '0px'
                                }
                              }
                            }}
                          >
                            {file.content}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>
    </div>
  )
}