import { useState } from 'react'
import { Copy, CheckCheck, Terminal, Download, Key, Settings, FileText, Code, BookOpen, Shield, Zap, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: string
  language?: string
  className?: string
  showCopy?: boolean
}

function CodeBlock({ children, language = 'bash', className, showCopy = true }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className={cn("relative group", className)}>
      <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border">
        <code className={`language-${language}`}>{children}</code>
      </pre>
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 bg-slate-800 hover:bg-slate-700 text-slate-300"
          onClick={copyToClipboard}
        >
          {isCopied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )
}

interface CommandCardProps {
  title: string
  description: string
  command: string
  options?: Array<{
    flag: string
    description: string
  }>
  examples?: Array<{
    command: string
    description: string
  }>
}

function CommandCard({ title, description, command, options, examples }: CommandCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Basic Usage:</h4>
          <CodeBlock>{command}</CodeBlock>
        </div>

        {options && (
          <div>
            <h4 className="font-medium mb-2">Options:</h4>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <code className="text-sm bg-background px-2 py-1 rounded border font-mono whitespace-nowrap">
                    {option.flag}
                  </code>
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {examples && (
          <div>
            <h4 className="font-medium mb-2">Examples:</h4>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div key={index}>
                  <p className="text-sm text-muted-foreground mb-2">{example.description}</p>
                  <CodeBlock>{example.command}</CodeBlock>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function CLIDocumentation() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Coming Soon Banner */}
      <Alert className="mb-8 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100">Planned Feature - CLI Coming Soon</AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          The DevSecureX CLI is currently in development and not yet available. This documentation represents
          our planned feature set. We'll update this page when the CLI is released. For now, please use the
          web dashboard for security scanning and webhook integration for automated scanning.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Terminal className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">DevSecureX CLI</h1>
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            Coming Soon
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground mb-4">
          Planned: Advanced security scanning for modern development teams. Analyze your code across 20+ programming languages
          and detect vulnerabilities, security issues, and compliance violations before they reach production.
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Multi-language Support
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            SAST & Dependencies
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Compliance Reporting
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            CI/CD Integration
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="installation" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-6 h-auto p-1">
          <TabsTrigger value="installation" className="flex items-center gap-2 text-xs lg:text-sm">
            <Download className="h-4 w-4" />
            Install
          </TabsTrigger>
          <TabsTrigger value="authentication" className="flex items-center gap-2 text-xs lg:text-sm">
            <Key className="h-4 w-4" />
            Auth
          </TabsTrigger>
          <TabsTrigger value="scanning" className="flex items-center gap-2 text-xs lg:text-sm">
            <Terminal className="h-4 w-4" />
            Scanning
          </TabsTrigger>
          <TabsTrigger value="commands" className="flex items-center gap-2 text-xs lg:text-sm">
            <Code className="h-4 w-4" />
            Commands
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2 text-xs lg:text-sm">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2 text-xs lg:text-sm">
            <BookOpen className="h-4 w-4" />
            Examples
          </TabsTrigger>
        </TabsList>

        {/* Installation */}
        <TabsContent value="installation" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Installation</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-green-500" />
                    Quick Install
                  </CardTitle>
                  <CardDescription>
                    Install DevSecureX CLI globally using npm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CodeBlock>npm install -g @devsecurex/cli</CodeBlock>

                  <div>
                    <h4 className="font-medium mb-2">Verify Installation:</h4>
                    <CodeBlock>devsecurex --version</CodeBlock>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <strong>Node.js 18.0+</strong> - Required for CLI runtime
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <strong>DevSecureX API Key</strong> - Get one free at{' '}
                      <Button variant="link" className="p-0 h-auto text-blue-500" asChild>
                        <a href="https://devsecurex.com" target="_blank" rel="noopener noreferrer">
                          devsecurex.com
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <strong>Supported Languages:</strong>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'PHP', 'Ruby', 'C/C++', 'Rust'].map((lang) => (
                            <Badge key={lang} variant="secondary" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                          <Badge variant="outline" className="text-xs">
                            +10 more
                          </Badge>
                        </div>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Authentication */}
        <TabsContent value="authentication" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Authentication Setup</h2>

            <Alert className="mb-6">
              <Key className="h-4 w-4" />
              <AlertDescription>
                You'll need a DevSecureX API key to use the CLI. Sign up for free at{' '}
                <Button variant="link" className="p-0 h-auto text-blue-500" asChild>
                  <a href="https://devsecurex.com" target="_blank" rel="noopener noreferrer">
                    devsecurex.com
                  </a>
                </Button>
                {' '}and get your API key from Settings → API Keys.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <CommandCard
                title="Interactive Setup (Recommended)"
                description="Set up authentication with guided prompts"
                command="devsecurex auth setup"
                examples={[
                  {
                    command: "devsecurex auth setup",
                    description: "Follow interactive prompts to enter your API key"
                  }
                ]}
              />

              <CommandCard
                title="Environment Variable"
                description="Set API key via environment variable"
                command={'export DEVSECUREX_API_KEY="dsx_your_api_key_here"'}
                examples={[
                  {
                    command: 'export DEVSECUREX_API_KEY="dsx_your_api_key_here"',
                    description: "Set for current session"
                  },
                  {
                    command: 'echo \'export DEVSECUREX_API_KEY="dsx_your_api_key_here"\' >> ~/.bashrc',
                    description: "Add to shell profile for persistence"
                  }
                ]}
              />

              <CommandCard
                title="Verify Authentication"
                description="Check if authentication is working"
                command="devsecurex auth status"
                examples={[
                  {
                    command: "devsecurex auth status",
                    description: "Shows current authentication status and user info"
                  },
                  {
                    command: "devsecurex auth logout",
                    description: "Clear stored credentials"
                  }
                ]}
              />
            </div>
          </div>
        </TabsContent>

        {/* Quick Start */}
        <TabsContent value="scanning" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Quick Start Scanning</h2>

            <div className="space-y-6">
              <CommandCard
                title="Your First Scan"
                description="Run a security scan on your current directory"
                command="devsecurex scan"
                examples={[
                  {
                    command: "devsecurex scan",
                    description: "Scan current directory (typically takes 3-5 minutes)"
                  },
                  {
                    command: "devsecurex scan ./src",
                    description: "Scan specific directory"
                  },
                  {
                    command: "devsecurex scan --save security-report.json",
                    description: "Save results to file for later review"
                  }
                ]}
              />

              <CommandCard
                title="Scan with Options"
                description="Customize your security scan"
                command="devsecurex scan [path]"
                options={[
                  { flag: "-o, --output <format>", description: "Output format: terminal, json, sarif" },
                  { flag: "--save <file>", description: "Save results to file" },
                  { flag: "--export-sarif <path>", description: "Export in SARIF format for CI/CD" },
                  { flag: '--compliance "owasp,pci,sox"', description: "Include compliance mapping" },
                  { flag: "--custom-rules", description: "Include custom rules (premium)" },
                  { flag: "--fail-on <severity>", description: "Fail on: critical, high, medium" },
                  { flag: "--timeout <seconds>", description: "Scan timeout (default: 600)" }
                ]}
                examples={[
                  {
                    command: "devsecurex scan --output json --save report.json",
                    description: "Scan and save as JSON"
                  },
                  {
                    command: 'devsecurex scan --compliance "owasp,pci" --fail-on critical',
                    description: "Compliance scan that fails on critical issues"
                  },
                  {
                    command: "devsecurex scan --export-sarif results.sarif",
                    description: "Export results in SARIF format for CI/CD integration"
                  }
                ]}
              />

              <CommandCard
                title="View Results"
                description="Manage and review your scan results"
                command="devsecurex results list"
                examples={[
                  {
                    command: "devsecurex results list",
                    description: "List recent scan results"
                  },
                  {
                    command: "devsecurex results show <scan-id>",
                    description: "Show detailed results for a specific scan"
                  },
                  {
                    command: "devsecurex results stats",
                    description: "Show scan statistics and trends"
                  }
                ]}
              />
            </div>
          </div>
        </TabsContent>

        {/* All Commands */}
        <TabsContent value="commands" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">All Commands</h2>

            <div className="space-y-8">
              {/* Core Commands */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-blue-500" />
                  Core Commands
                </h3>
                <div className="space-y-4">
                  <CommandCard
                    title="Security Scan"
                    description="Run comprehensive security analysis"
                    command="devsecurex scan [path]"
                    options={[
                      { flag: "-o, --output <format>", description: "Output format: terminal, json, sarif" },
                      { flag: "--save <file>", description: "Save results to file" },
                      { flag: "--fail-on <severity>", description: "Exit with error on severity level" }
                    ]}
                  />

                  <CommandCard
                    title="Authentication"
                    description="Manage API authentication"
                    command="devsecurex auth <command>"
                    examples={[
                      { command: "devsecurex auth setup", description: "Interactive API key setup" },
                      { command: "devsecurex auth status", description: "Check authentication status" },
                      { command: "devsecurex auth logout", description: "Clear stored credentials" }
                    ]}
                  />
                </div>
              </div>

              {/* Results Management */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  Results Management
                </h3>
                <div className="space-y-4">
                  <CommandCard
                    title="Results Commands"
                    description="Manage and export scan results"
                    command="devsecurex results <command>"
                    examples={[
                      { command: "devsecurex results list", description: "List recent scan results" },
                      { command: "devsecurex results show <scan-id>", description: "Show detailed scan results" },
                      { command: "devsecurex results export <scan-id>", description: "Export results (json, sarif, csv, pdf)" },
                      { command: "devsecurex results compare <id1> <id2>", description: "Compare two scan results" },
                      { command: "devsecurex results stats", description: "Show scan statistics" }
                    ]}
                  />
                </div>
              </div>

              {/* Configuration */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-500" />
                  Configuration
                </h3>
                <div className="space-y-4">
                  <CommandCard
                    title="Config Commands"
                    description="Manage CLI configuration"
                    command="devsecurex config <command>"
                    examples={[
                      { command: "devsecurex config init", description: "Create default configuration file" },
                      { command: "devsecurex config show", description: "Display current configuration" },
                      { command: "devsecurex config set <key> <value>", description: "Set configuration value" },
                      { command: "devsecurex config get <key>", description: "Get configuration value" },
                      { command: "devsecurex config list", description: "List all configuration keys" },
                      { command: "devsecurex config reset", description: "Reset to default settings" }
                    ]}
                  />
                </div>
              </div>

              {/* Sessions & Diagnostics */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  Sessions & Diagnostics
                </h3>
                <div className="space-y-4">
                  <CommandCard
                    title="Session Management"
                    description="Manage long-running scan sessions"
                    command="devsecurex sessions <command>"
                    examples={[
                      { command: "devsecurex sessions list", description: "List active scan sessions" },
                      { command: "devsecurex sessions create [name]", description: "Create new scan session" },
                      { command: "devsecurex sessions end <session-id>", description: "End scan session" }
                    ]}
                  />

                  <CommandCard
                    title="Debug & Health"
                    description="Troubleshooting and system information"
                    command="devsecurex debug <command>"
                    examples={[
                      { command: "devsecurex debug info", description: "Show system information" },
                      { command: "devsecurex debug health", description: "Check API connectivity" },
                      { command: "devsecurex debug logs", description: "Show recent log entries" },
                      { command: "devsecurex debug validate-config", description: "Validate CLI configuration" },
                      { command: "devsecurex health", description: "Check CLI and backend health" },
                      { command: "devsecurex stats", description: "Show CLI usage statistics" }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="configuration" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Configuration</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-500" />
                    Configuration File
                  </CardTitle>
                  <CardDescription>
                    Create a <code>.devsecurex.yml</code> file in your project root to customize scan behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Configuration:</h4>
                    <CodeBlock language="yaml">{`scan:
  exclude:
    - "node_modules/**"
    - "vendor/**"
    - ".git/**"
    - "*.test.js"
    - "tests/**"
  compliance: "owasp-top10"
  timeout: 600

output:
  format: "terminal"
  colors: true
  verbose: false

rules:
  severity:
    fail-on: "high"
  custom-rules: true`}</CodeBlock>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Advanced Configuration:</h4>
                    <CodeBlock language="yaml">{`scan:
  include:
    - "src/**/*.js"
    - "src/**/*.ts"
    - "src/**/*.py"
  exclude:
    - "node_modules/**"
    - "dist/**"
    - "build/**"
  compliance: ["owasp-top10", "pci-dss", "sox"]
  timeout: 900
  custom-rules: true

output:
  format: "json"
  save-to: "security-report.json"
  export-sarif: "security-results.sarif"
  colors: true
  verbose: true

rules:
  severity:
    fail-on: "medium"
    include: ["security", "performance", "maintainability"]
  ignored-rules:
    - "javascript-eval-usage"
    - "python-pickle-load"

notifications:
  slack:
    webhook: "https://hooks.slack.com/..."
  email:
    recipients: ["security@company.com"]`}</CodeBlock>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">CI/CD Configuration:</h4>
                    <CodeBlock language="yaml">{`# Optimized for CI/CD pipelines
scan:
  exclude:
    - "node_modules/**"
    - "vendor/**"
    - ".git/**"
  timeout: 300
  fail-fast: true

output:
  format: "sarif"
  export-sarif: "security-results.sarif"
  colors: false
  verbose: false

rules:
  severity:
    fail-on: "high"

ci:
  fail-on-new-issues: true
  baseline: "main"
  compare-with-previous: true`}</CodeBlock>
                  </div>
                </CardContent>
              </Card>

              <CommandCard
                title="Configuration Management"
                description="Manage your CLI configuration"
                command="devsecurex config"
                examples={[
                  {
                    command: "devsecurex config init",
                    description: "Generate a basic .devsecurex.yml configuration file"
                  },
                  {
                    command: "devsecurex config show",
                    description: "Display current configuration (merged from file and environment)"
                  },
                  {
                    command: "devsecurex config set scan.timeout 900",
                    description: "Set a specific configuration value"
                  },
                  {
                    command: "devsecurex config get scan.exclude",
                    description: "Get a specific configuration value"
                  }
                ]}
              />
            </div>
          </div>
        </TabsContent>

        {/* Examples & Use Cases */}
        <TabsContent value="examples" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Common Use Cases</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    Developer Workflow
                  </CardTitle>
                  <CardDescription>
                    Daily security scanning for developers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Quick daily scan:</h4>
                    <CodeBlock>devsecurex scan</CodeBlock>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Before committing code:</h4>
                    <CodeBlock>devsecurex scan --fail-on high</CodeBlock>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Detailed report for review:</h4>
                    <CodeBlock>devsecurex scan --save security-report.json --compliance "owasp"</CodeBlock>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    CI/CD Integration
                  </CardTitle>
                  <CardDescription>
                    Automated security scanning in pipelines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">GitHub Actions example:</h4>
                    <CodeBlock language="yaml">{`name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @devsecurex/cli
      - run: devsecurex scan --fail-on critical --export-sarif security.sarif
        env:
          DEVSECUREX_API_KEY: \${{ secrets.DEVSECUREX_API_KEY }}
      - uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: security.sarif`}</CodeBlock>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Pipeline command:</h4>
                    <CodeBlock>devsecurex scan --output sarif --fail-on critical --timeout 300</CodeBlock>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    Compliance Reporting
                  </CardTitle>
                  <CardDescription>
                    Generate compliance reports for audits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">OWASP Top 10 compliance:</h4>
                    <CodeBlock>devsecurex scan --compliance "owasp" --save owasp-report.json</CodeBlock>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Multi-standard compliance:</h4>
                    <CodeBlock>devsecurex scan --compliance "owasp,pci,sox" --save compliance-report.json</CodeBlock>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Export for audit:</h4>
                    <CodeBlock>{'devsecurex results export <scan-id> --format pdf --output audit-report.pdf'}</CodeBlock>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-orange-500" />
                    Team Collaboration
                  </CardTitle>
                  <CardDescription>
                    Share and compare security results across teams
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">View team scan history:</h4>
                    <CodeBlock>devsecurex results list --team</CodeBlock>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Compare releases:</h4>
                    <CodeBlock>devsecurex results compare scan-123 scan-456</CodeBlock>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Share scan session:</h4>
                    <CodeBlock>devsecurex sessions create "Release v2.1 Security Review"</CodeBlock>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            <div>
              <h3 className="text-xl font-semibold mb-4">Getting Help</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">CLI Help</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CodeBlock>devsecurex --help</CodeBlock>
                    <CodeBlock>{'devsecurex <command> --help'}</CodeBlock>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Support Channels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <a href="mailto:support@devsecurex.com">Email Support</a>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <a href="https://devsecurex.com" target="_blank" rel="noopener noreferrer">
                          Platform Documentation
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}