import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { 
  Code2, 
  Save, 
  TestTube, 
  AlertCircle, 
  Info,
  BookOpen,
  Sparkles,
  Play
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'

import { rulesAPI } from '@/lib/api/rules'
import type { 
  RuleRequest, 
  SupportedToolInfo, 
  SupportedTool, 
  RuleLanguage,
  RuleTestRequest,
  RuleTestResult,
  RuleValidationResult
} from '@/types/rules'
import type { SecuritySeverity } from '@/types/global'

import { RuleEditor } from './RuleEditor'
import { ToolSpecificPatternInput } from './ToolSpecificPatternInput'

interface CreateRuleDialogProps {
  supportedTools: SupportedToolInfo[]
  onSuccess: () => void
  onCancel: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateRuleDialog({ supportedTools, onSuccess, onCancel, open = true, onOpenChange }: CreateRuleDialogProps) {
  // Ensure supportedTools is always an array and filter to only show tools that support custom rules
  const allToolsList = Array.isArray(supportedTools) ? supportedTools : []
  const safeToolsList = allToolsList.filter(tool => tool.supports_custom !== false)
  const { toast } = useToast()
  
  // Form state
  const [formData, setFormData] = useState<RuleRequest>({
    rule_name: '',
    tool: 'semgrep' as SupportedTool,
    language: undefined,
    pattern: '',
    message: '',
    severity: 'WARNING' as SecuritySeverity, // Default to Semgrep's WARNING
    is_public: false
  })
  
  const [currentTab, setCurrentTab] = useState<'basic' | 'editor' | 'test'>('basic')
  const [testCode, setTestCode] = useState('')
  const [testResult, setTestResult] = useState<RuleTestResult | null>(null)
  const [validationResult, setValidationResult] = useState<RuleValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [testCodeLanguage, setTestCodeLanguage] = useState<string>('auto')
  // Get current tool info
  const currentTool = safeToolsList?.find?.(tool => tool.tool === formData.tool)

  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: (data: RuleRequest) => rulesAPI.createRule(data),
    onSuccess: () => {
      toast({
        title: "Rule created successfully!",
        description: "Your custom security rule has been created and is ready to use.",
      })
      // Reset form and close dialog
      resetForm()
      onSuccess()
      onOpenChange?.(false)
    },
    onError: (error: any) => {
      // Handle duplicate rule error specifically
      if (error.data?.detail && typeof error.data.detail === 'object') {
        const detail = error.data.detail
        if (detail.error && detail.duplicate_rule_name) {
          const duplicateMessage = `${detail.error}: "${detail.duplicate_rule_name}" (ID: ${detail.duplicate_rule_id})`
          toast({
            title: "Duplicate Rule Detected",
            description: duplicateMessage,
            variant: "destructive",
          })
          return
        }
      }
      
      // Handle other error formats
      const errorMessage = error.data?.detail?.error || 
                           error.data?.detail || 
                           error.data?.message || 
                           error.message || 
                           error.detail || 
                           "Failed to create the rule. Please try again."
      
      toast({
        title: "Error creating rule",
        description: typeof errorMessage === 'string' ? errorMessage : "Failed to create the rule. Please try again.",
        variant: "destructive",
      })
    }
  })

  // Test rule mutation
  const testRuleMutation = useMutation({
    mutationFn: (testData: RuleTestRequest) => rulesAPI.testRule(testData),
    onSuccess: (result) => {
      setTestResult(result)
      toast({
        title: "Rule test completed",
        description: `Found ${result.matches.length} matches in ${result.execution_time_ms}ms`,
      })
    },
    onError: (error: any) => {
      const errorMessage = error.message || error.detail || "Failed to test the rule."
      toast({
        title: "Error testing rule",
        description: errorMessage,
        variant: "destructive",
      })
    }
  })

  // Test code language helpers
  const getTestCodeLanguage = () => testCodeLanguage
  
  const getActualTestLanguage = () => {
    if (testCodeLanguage === 'auto') {
      // Auto-detect based on rule language or tool
      return formData.language || detectLanguageFromTool(formData.tool) || 'text'
    }
    return testCodeLanguage
  }
  
  const detectLanguageFromTool = (tool: SupportedTool): string => {
    const toolLanguageMap: Record<SupportedTool, string> = {
      'semgrep': 'yaml',
      'bandit': 'python',
      'eslint-security': 'javascript', 
      'gosec': 'go',
      'checkov': 'terraform',
      'safety': 'python',
      'psalm': 'php',
      'cppcheck': 'c',
      'roslynator': 'csharp',
      'spotbugs': 'java',
      'brakeman': 'ruby',
      'trivy': 'dockerfile',
      'gitleaks': 'text'
    }
    return toolLanguageMap[tool] || 'text'
  }
  
  const getTestCodePlaceholder = () => {
    const language = getActualTestLanguage()
    const placeholders: Record<string, string> = {
      python: `# Paste Python code to test your rule\n# Example:\nimport os\npassword = "hardcoded123"\nos.system("ls " + user_input)`,
      javascript: `// Paste JavaScript code to test your rule\n// Example:\ndocument.getElementById('output').innerHTML = userInput;\neval(userCode);`,
      java: `// Paste Java code to test your rule\n// Example:\nString query = "SELECT * FROM users WHERE id = " + userId;\nstatement.executeQuery(query);`,
      go: `// Paste Go code to test your rule\n// Example:\nquery := "SELECT * FROM users WHERE name = " + userName\ndb.Query(query)`,
      php: `<?php\n// Paste PHP code to test your rule\n// Example:\n$query = "SELECT * FROM users WHERE id = " . $_GET['id'];\nmysql_query($query);`,
      c: `// Paste C/C++ code to test your rule\n// Example:\nchar buffer[100];\nstrcpy(buffer, user_input);\nprintf(user_input);`,
      rust: `// Paste Rust code to test your rule\n// Example:\nunsafe {\n    *ptr = value;\n}`,
      yaml: `# Paste YAML/config to test your rule\n# Example:\ncontainers:\n  - image: nginx:latest\n    securityContext:\n      privileged: true`,
      dockerfile: `# Paste Dockerfile to test your rule\n# Example:\nFROM ubuntu:latest\nRUN chmod 777 /tmp\nUSER root`,
      terraform: `# Paste Terraform code to test your rule\n# Example:\nresource "aws_s3_bucket" "example" {\n  bucket = "my-bucket"\n  # Missing encryption\n}`,
      json: `{\n  "api_key": "sk-1234567890abcdef",\n  "debug": true,\n  "password": "admin123"\n}`,
      text: `Paste your code here to test the security rule...\n\nThe editor will automatically detect syntax and provide line numbers.`
    }
    return placeholders[language] || placeholders.text
  }
  
  const getQuickTestExamples = () => {
    const tool = formData.tool
    const language = getActualTestLanguage()
    
    const examples = {
      python: [
        {
          name: 'SQL Injection',
          code: `import sqlite3\nconn = sqlite3.connect('db.sqlite')\nuser_input = request.form['username']\nquery = "SELECT * FROM users WHERE name = '" + user_input + "'"\nconn.execute(query)  # Vulnerable`
        },
        {
          name: 'Command Injection', 
          code: `import os\nimport subprocess\nfilename = request.args.get('file')\nos.system('cat ' + filename)  # Vulnerable\nsubprocess.call('ls ' + filename, shell=True)  # Vulnerable`
        },
        {
          name: 'Hardcoded Secret',
          code: `# Configuration\nAPI_KEY = "sk-1234567890abcdef1234567890abcdef"\npassword = "admin123"\nsecret_token = "secret_abc123xyz789"`
        }
      ],
      javascript: [
        {
          name: 'XSS Vulnerability',
          code: `const userInput = document.getElementById('input').value;\ndocument.getElementById('output').innerHTML = userInput;  // Vulnerable\neval(userInput);  // Very dangerous`
        },
        {
          name: 'Prototype Pollution',
          code: `const obj = {};\nobj["__proto__"]["polluted"] = true;  // Vulnerable\nObject.prototype.polluted = true;  // Vulnerable`
        },
        {
          name: 'Path Traversal',
          code: `const fs = require('fs');\nconst filename = req.query.file;\nfs.readFile('/uploads/' + filename, 'utf8');  // Vulnerable`
        }
      ],
      java: [
        {
          name: 'SQL Injection',
          code: `String userId = request.getParameter("id");\nString query = "SELECT * FROM users WHERE id = " + userId;\nStatement stmt = connection.createStatement();\nstmt.executeQuery(query);  // Vulnerable`
        },
        {
          name: 'XXE Attack',
          code: `DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();\nDocumentBuilder builder = factory.newDocumentBuilder();  // Vulnerable - XXE enabled\nDocument doc = builder.parse(userXmlInput);`
        }
      ],
      go: [
        {
          name: 'SQL Injection',
          code: `userID := r.URL.Query().Get("id")\nquery := "SELECT * FROM users WHERE id = " + userID\nrows, err := db.Query(query)  // Vulnerable`
        },
        {
          name: 'Command Injection',
          code: `filename := r.FormValue("file")\ncmd := exec.Command("cat", "/var/logs/"+filename)  // Vulnerable\ncmd.Run()`
        }
      ]
    }
    
    return examples[language as keyof typeof examples] || [
      {
        name: 'Generic Test',
        code: `// Add your test code here\n// This should contain patterns that your rule should detect`
      }
    ]
  }
  
  const getCodeContext = (code: string, startLine?: number, endLine?: number) => {
    if (!startLine) return []
    
    const lines = code.split('\n')
    const contextStart = Math.max(0, startLine - 3)
    const contextEnd = Math.min(lines.length, (endLine || startLine) + 3)
    
    return lines.slice(contextStart, contextEnd).map((content, index) => {
      const lineNumber = contextStart + index + 1
      const isMatch = lineNumber >= startLine && lineNumber <= (endLine || startLine)
      return { lineNumber, content, isMatch }
    })
  }

  // Reset form to initial state
  const resetForm = () => {
    const defaultSeverity = safeToolsList.find(tool => tool.tool === 'semgrep')?.severity_levels?.[0] || 'WARNING'
    
    setFormData({
      rule_name: '',
      tool: 'semgrep' as SupportedTool,
      language: undefined,
      pattern: '',
      message: '',
      severity: defaultSeverity as SecuritySeverity,
      is_public: false
    })
    
    setTestCode('')
    setTestResult(null)
    setValidationResult(null)
    setCurrentTab('basic')
    setTestCodeLanguage('auto')
    setIsValidating(false)
    
    // Reset any pending mutations
    try {
      createRuleMutation.reset()
      testRuleMutation.reset()
    } catch (error) {
      // Ignore reset errors if mutations aren't initialized yet
      console.debug('Mutation reset skipped - not initialized yet')
    }
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open])

  // Enhanced cancel handler that resets everything
  const handleCancel = () => {
    resetForm()
    onCancel()
    onOpenChange?.(false)
  }

  // Enhanced success handler that resets everything
  const handleSuccess = () => {
    resetForm()
    onSuccess()
    onOpenChange?.(false)
  }

  // Handle dialog close from outside (e.g., ESC key, overlay click)
  useEffect(() => {
    if (!open) {
      // Small delay to allow any pending operations to complete
      const timeoutId = setTimeout(() => {
        resetForm()
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
    return undefined
  }, [open])

  // Prevent dialog from closing while mutations are pending
  const canCloseDialog = !createRuleMutation.isPending && !testRuleMutation.isPending

  // Enhanced close handler that prevents closing during pending operations
  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen && !canCloseDialog) {
      // Prevent closing if operations are pending
      toast({
        title: "Please wait",
        description: "A rule operation is in progress. Please wait for it to complete.",
        variant: "default"
      })
      return
    }
    
    if (!newOpen) {
      resetForm()
    }
    
    onOpenChange?.(newOpen)
  }

  // Mutations are now defined above

  // Handle validation result from ToolSpecificPatternInput
  const handleValidationChange = (result: RuleValidationResult) => {
    setValidationResult(result)
    
    if (result?.warnings.length > 0) {
      toast({
        title: "Validation warnings",
        description: result.warnings.join(', '),
        variant: "default",
      })
    }
  }

  // Test the rule using the regular test endpoint
  const handleTestRule = async () => {
    if (!formData.pattern.trim() || !testCode.trim()) {
      toast({
        title: "Missing data",
        description: "Both rule pattern and test code are required.",
        variant: "destructive",
      })
      return
    }

    // Use regular testing endpoint (sandbox endpoint doesn't exist yet)
    testRuleMutation.mutate({
      rule_pattern: formData.pattern,
      tool: formData.tool,
      language: formData.language,
      test_code: testCode
    })
  }

  // Handle form submission
  const handleSubmit = () => {
    // Validate rule_name (backend: min_length=3, max_length=255)
    if (!formData.rule_name.trim()) {
      toast({
        title: "Missing rule name",
        description: "Please provide a name for your rule.",
        variant: "destructive",
      })
      return
    }

    if (formData.rule_name.trim().length < 3) {
      toast({
        title: "Rule name too short",
        description: "Rule name must be at least 3 characters long.",
        variant: "destructive",
      })
      return
    }

    if (formData.rule_name.trim().length > 255) {
      toast({
        title: "Rule name too long",
        description: "Rule name must be less than 255 characters.",
        variant: "destructive",
      })
      return
    }

    // Validate pattern (backend: min_length=10, max_length=10000)
    if (!formData.pattern.trim()) {
      toast({
        title: "Missing rule pattern",
        description: "Please provide a pattern for your rule.",
        variant: "destructive",
      })
      return
    }

    if (formData.pattern.trim().length < 10) {
      toast({
        title: "Rule pattern too short",
        description: "Rule pattern must be at least 10 characters long.",
        variant: "destructive",
      })
      return
    }

    if (formData.pattern.trim().length > 10000) {
      toast({
        title: "Rule pattern too long",
        description: "Rule pattern must be less than 10,000 characters.",
        variant: "destructive",
      })
      return
    }

    // Validate message (backend: max_length=1000)
    if (formData.message && formData.message.length > 1000) {
      toast({
        title: "Message too long",
        description: "Message must be less than 1,000 characters.",
        variant: "destructive",
      })
      return
    }

    if (validationResult && !validationResult.is_valid) {
      toast({
        title: "Validation errors",
        description: "Please fix validation errors before creating the rule.",
        variant: "destructive",
      })
      return
    }

    // Ensure data exactly matches backend CustomRuleCreateRequest structure
    const cleanedData: RuleRequest = {
      rule_name: formData.rule_name.trim(),
      tool: formData.tool,
      language: formData.language || undefined,
      pattern: formData.pattern.trim(),
      message: formData.message?.trim() || undefined,
      severity: formData.severity,
      is_public: formData.is_public
    }
    
    createRuleMutation.mutate(cleanedData)
  }

  // Handle language change when tool changes
  const handleToolChange = (newTool: SupportedTool) => {
    // Get the new tool's default severity
    const newToolInfo = safeToolsList.find(tool => tool.tool === newTool)
    const defaultSeverity = newToolInfo?.severity_levels?.[0] || 'WARNING'
    
    setFormData(prev => ({ 
      ...prev, 
      tool: newTool, 
      language: undefined, // Reset language when tool changes
      pattern: '', // Reset pattern when tool changes
      severity: defaultSeverity as SecuritySeverity // Reset to tool's default severity
    }))
    setValidationResult(null) // Reset validation
  }

  return (
    <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Code2 className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="break-words">Create Custom Security Rule</span>
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed">
          Create a custom security detection rule to identify specific vulnerabilities or patterns in your code.
          All fields are validated against backend requirements for optimal compatibility.
        </DialogDescription>
      </DialogHeader>

      <Tabs value={currentTab} onValueChange={(value: any) => setCurrentTab(value)}>
        <TabsList className="grid w-full grid-cols-3 h-12 text-sm">
          <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Info</TabsTrigger>
          <TabsTrigger value="editor" className="text-xs sm:text-sm">Rule Editor</TabsTrigger>
          <TabsTrigger value="test" className="text-xs sm:text-sm">Test Rule</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="rule-name" className="text-sm font-medium">Rule Name *</Label>
              <Input
                id="rule-name"
                placeholder="e.g., SQL Injection Check"
                value={formData.rule_name}
                onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                className={`h-12 text-base ${formData.rule_name.length > 255 ? 'border-red-500' : ''}`}
              />
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>3-255 characters required</span>
                <span className={formData.rule_name.length > 255 ? 'text-red-500' : ''}>
                  {formData.rule_name.length}/255
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="severity" className="text-sm font-medium">Severity</Label>
              <Select 
                value={formData.severity} 
                onValueChange={(value: SecuritySeverity) => 
                  setFormData(prev => ({ ...prev, severity: value }))
                }
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentTool?.severity_levels?.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tool" className="text-sm font-medium">Security Tool</Label>
              <Select 
                value={formData.tool} 
                onValueChange={handleToolChange}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {safeToolsList.map((tool) => (
                    <SelectItem key={tool.tool} value={tool.tool}>
                      <div className="flex flex-col">
                        <span className="font-medium">{tool.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {tool.supported_languages.slice(0, 3).join(', ')}
                          {tool.supported_languages.length > 3 && ` +${tool.supported_languages.length - 3} more`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                {safeToolsList.length} tools available • {currentTool?.max_pattern_length ? `Max pattern: ${currentTool.max_pattern_length} chars` : ''}
                {currentTool?.sandbox_supported && ' • Sandbox testing'}
                {allToolsList.length > safeToolsList.length && (
                  <div className="text-orange-600 mt-1">
                    ⚠️ {allToolsList.length - safeToolsList.length} tools don't support custom rules
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium">Language (Optional)</Label>
              <Select 
                value={formData.language || 'any'} 
                onValueChange={(value: RuleLanguage | 'any') => 
                  setFormData(prev => ({ ...prev, language: value === 'any' ? undefined : value as RuleLanguage }))
                }
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Any language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any language</SelectItem>
                  {currentTool?.supported_languages?.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                {currentTool ? `${currentTool.supported_languages.length} languages supported by ${currentTool.name}` : 'Select a tool to see available languages'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Description</Label>
            <Textarea
              id="message"
              placeholder="Describe what this rule detects and why it's important..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              className={`min-h-[80px] text-base ${formData.message && formData.message.length > 1000 ? 'border-red-500' : ''}`}
            />
            <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:justify-between gap-1">
              <span>Optional, up to 1000 characters</span>
              <span className={formData.message && formData.message.length > 1000 ? 'text-red-500' : ''}>
                {formData.message?.length || 0}/1000
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Switch
              id="public"
              checked={formData.is_public}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_public: checked }))
              }
            />
            <div className="flex flex-col">
              <Label htmlFor="public" className="text-sm font-medium cursor-pointer">Make this rule public</Label>
              <span className="text-xs text-muted-foreground">Allow others to use this rule in their scans</span>
            </div>
          </div>

          {currentTool && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {currentTool.name} Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">{currentTool.description}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Format: {currentTool.rule_format}</Badge>
                  {currentTool.supported_languages.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Languages: {currentTool.supported_languages.slice(0, 3).join(', ')}
                      {currentTool.supported_languages.length > 3 && '...'}
                    </Badge>
                  )}
                </div>
                {currentTool.documentation_url && (
                  <a 
                    href={currentTool.documentation_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 p-2 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                  >
                    <BookOpen className="h-3 w-3" />
                    View Documentation
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Rule Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          <ToolSpecificPatternInput
            tool={formData.tool}
            toolInfo={currentTool}
            value={formData.pattern}
            onChange={(value) => setFormData(prev => ({ ...prev, pattern: value }))}
            language={formData.language}
            onLanguageChange={(language) => setFormData(prev => ({ ...prev, language }))}
            onValidationChange={handleValidationChange}
            ruleName={formData.rule_name}
            ruleMessage={formData.message}
            severity={formData.severity}
          />
          
          {/* Pattern Length Feedback */}
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Pattern must be 10-10,000 characters</span>
            <span className={
              formData.pattern.length < 10 || formData.pattern.length > 10000 ? 'text-red-500' : 
              formData.pattern.length < 50 ? 'text-yellow-500' : 'text-green-600'
            }>
              {formData.pattern.length}/10,000
            </span>
          </div>
          
          {/* Validation Result Display */}
          {validationResult && (
            <Alert variant={validationResult.is_valid ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validationResult.is_valid ? (
                  <span className="text-green-600">✓ Pattern validation passed</span>
                ) : (
                  <div>
                    <div className="font-medium mb-1">Validation Issues:</div>
                    {validationResult.errors.map((error: string, i: number) => (
                      <div key={i}>• {error}</div>
                    ))}
                    {validationResult.warnings.map((warning: string, i: number) => (
                      <div key={i} className="text-yellow-600">⚠ {warning}</div>
                    ))}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

        </TabsContent>

        {/* Test Rule Tab */}
        <TabsContent value="test" className="space-y-4">
          {/* Test Code Input Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Test Code Input
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Paste or write code to test your security rule against. The editor supports syntax highlighting and line numbers.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Language Selection for Test Code */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Label className="text-sm font-medium">Test Code Language:</Label>
                  <Select 
                    value={testCodeLanguage || 'auto'} 
                    onValueChange={(value) => setTestCodeLanguage(value)}
                  >
                    <SelectTrigger className="w-full sm:w-40 h-10">
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="c">C/C++</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                      <SelectItem value="yaml">YAML</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="dockerfile">Dockerfile</SelectItem>
                      <SelectItem value="terraform">Terraform</SelectItem>
                    </SelectContent>
                  </Select>
                  {testCode.trim() && (
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Info className="h-3 w-3" />
                      {testCode.split('\n').length} lines, {testCode.length} characters
                    </div>
                  )}
                </div>

                {/* Enhanced Code Editor */}
                <RuleEditor
                  value={testCode}
                  onChange={setTestCode}
                  language={getActualTestLanguage?.() || 'text'}
                  height="300px"
                  placeholder={getTestCodePlaceholder?.() || 'Paste your test code here...'}
                />

                {/* Quick Test Examples */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quick Test Examples:</Label>
                  <div className="flex flex-wrap gap-2">
                    {(getQuickTestExamples?.() || []).map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 sm:h-7 px-3"
                        onClick={() => setTestCode(example.code)}
                      >
                        {example.name}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 sm:h-7 text-muted-foreground px-3"
                      onClick={() => setTestCode('')}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleTestRule} 
                disabled={testRuleMutation.isPending || !formData.pattern || !testCode}
                className="gap-2 h-12 sm:h-10 px-6 w-full sm:w-auto"
              >
                <Play className="h-4 w-4" />
                {testRuleMutation.isPending ? 'Testing...' : 'Test Rule'}
              </Button>
              
              {validationResult && !validationResult.is_valid && (
                <Alert className="p-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    Fix validation errors before testing
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {formData.pattern ? 'Rule ready' : 'No rule pattern'} • 
              {testCode ? `${testCode.split('\n').length} lines of test code` : 'No test code'}
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Test Results
                  <Badge variant={testResult.matches.length > 0 ? 'destructive' : 'secondary'} className="ml-2">
                    {testResult.matches.length} {testResult.matches.length === 1 ? 'match' : 'matches'}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span>Execution time: {testResult.execution_time_ms}ms</span>
                  <span>•</span>
                  <span>Tool: {formData.tool}</span>
                  {formData.language && (
                    <>
                      <span>•</span>
                      <span>Language: {formData.language}</span>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResult.matches.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-3">
                      ⚠️ Security issues detected in test code:
                    </div>
                    {testResult.matches.map((match, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-orange-800 dark:text-orange-200">
                              {match.message}
                            </div>
                            {match.line_start && (
                              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Code2 className="h-3 w-3" />
                                Line {match.line_start}
                                {match.line_end && match.line_end !== match.line_start && ` - ${match.line_end}`}
                                {match.file_path && (
                                  <>
                                    <span>•</span>
                                    <span>{match.file_path}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant={
                              match.severity === 'ERROR' ? 'destructive' : 
                              match.severity === 'WARNING' ? 'default' : 'secondary'
                            } 
                            className="text-xs"
                          >
                            {match.severity}
                          </Badge>
                        </div>
                        
                        {/* Show code context if line numbers are available */}
                        {match.line_start && testCode && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                            <div className="text-muted-foreground mb-1">Code context:</div>
                            {(getCodeContext?.(testCode, match.line_start, match.line_end) || []).map((line, lineIndex) => (
                              <div 
                                key={lineIndex} 
                                className={`flex items-center gap-2 ${
                                  line.isMatch ? 'bg-orange-100 dark:bg-orange-900/30' : ''
                                }`}
                              >
                                <span className="text-muted-foreground w-8 text-right">
                                  {line.lineNumber}
                                </span>
                                <span className={line.isMatch ? 'text-orange-700 dark:text-orange-300' : ''}>
                                  {line.content || ' '}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <div className="text-2xl">✅</div>
                    <div className="text-sm font-medium">No security issues found</div>
                    <div className="text-xs text-muted-foreground">
                      The test code doesn't trigger this security rule. This could mean:
                    </div>
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                      <li>The code is secure (good!)</li>
                      <li>The rule pattern needs adjustment</li>
                      <li>The test code doesn't contain the target pattern</li>
                    </ul>
                  </div>
                )}

                {testResult.errors && testResult.errors.length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Test execution errors:</div>
                        {testResult.errors.map((error, index) => (
                          <div key={index} className="text-sm">• {error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {testResult.warnings && testResult.warnings.length > 0 && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Warnings:</div>
                        {testResult.warnings.map((warning, index) => (
                          <div key={index} className="text-sm">• {warning}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="h-12 sm:h-10 order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={createRuleMutation.isPending || (validationResult !== null && !validationResult.is_valid)}
          className="gap-2 h-12 sm:h-10 order-1 sm:order-2"
        >
          <Save className="h-4 w-4" />
          {createRuleMutation.isPending ? 'Creating...' : 'Create Rule'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}