import { 
  Code, 
  Copy, 
  CheckCircle, 
  Play, 
  Book, 
  Shield, 
  Key, 
  Globe, 
  Terminal,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { config } from '@/lib/config/env'

const apiEndpoints = [
  {
    method: 'POST',
    endpoint: '/api/v1/repositories',
    title: 'Connect Repository',
    description: 'Connect a new repository to DevSecureX for scanning',
    authRequired: true,
    category: 'repositories'
  },
  {
    method: 'GET',
    endpoint: '/api/v1/repositories',
    title: 'List Repositories',
    description: 'Get all connected repositories with their status',
    authRequired: true,
    category: 'repositories'
  },
  {
    method: 'POST',
    endpoint: '/api/v1/scans',
    title: 'Create Scan',
    description: 'Start a new security scan on a repository',
    authRequired: true,
    category: 'scans'
  },
  {
    method: 'GET',
    endpoint: '/api/v1/scans/{scan_id}',
    title: 'Get Scan Results',
    description: 'Retrieve detailed results from a completed scan',
    authRequired: true,
    category: 'scans'
  },
  {
    method: 'POST',
    endpoint: '/api/v1/ai/analyze',
    title: 'AI Security Analysis',
    description: 'Get AI-powered security recommendations for code',
    authRequired: true,
    category: 'ai'
  },
  {
    method: 'GET',
    endpoint: '/api/v1/vulnerabilities',
    title: 'List Vulnerabilities',
    description: 'Get all vulnerabilities across repositories',
    authRequired: true,
    category: 'vulnerabilities'
  }
]

const codeExamples = {
  curl: {
    name: 'cURL',
    auth: `curl -X POST "${config.api.baseUrl}/api/v1/auth/token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "your-username",
    "password": "your-password"
  }'`,
    createScan: `curl -X POST "${config.api.baseUrl}/api/v1/scans" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "repository_id": "repo-123",
    "scan_type": "comprehensive",
    "tools": ["bandit", "semgrep", "safety"],
    "branch": "main"
  }'`,
    getResults: `curl -X GET "${config.api.baseUrl}/api/v1/scans/scan-456" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
  },
  javascript: {
    name: 'JavaScript',
    auth: `const response = await fetch('${config.api.baseUrl}/api/v1/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'your-username',
    password: 'your-password'
  })
});

const { access_token } = await response.json();`,
    createScan: `const scanResponse = await fetch('${config.api.baseUrl}/api/v1/scans', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    repository_id: 'repo-123',
    scan_type: 'comprehensive',
    tools: ['bandit', 'semgrep', 'safety'],
    branch: 'main'
  })
});

const scanData = await scanResponse.json();`,
    getResults: `const resultsResponse = await fetch(\`${config.api.baseUrl}/api/v1/scans/\${scanId}\`, {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
});

const scanResults = await resultsResponse.json();`
  },
  python: {
    name: 'Python',
    auth: `import requests

response = requests.post(
    '${config.api.baseUrl}/api/v1/auth/token',
    json={
        'username': 'your-username',
        'password': 'your-password'
    }
)

access_token = response.json()['access_token']`,
    createScan: `headers = {'Authorization': f'Bearer {access_token}'}

scan_response = requests.post(
    '${config.api.baseUrl}/api/v1/scans',
    headers=headers,
    json={
        'repository_id': 'repo-123',
        'scan_type': 'comprehensive',
        'tools': ['bandit', 'semgrep', 'safety'],
        'branch': 'main'
    }
)

scan_data = scan_response.json()`,
    getResults: `results_response = requests.get(
    f'${config.api.baseUrl}/api/v1/scans/{scan_id}',
    headers=headers
)

scan_results = results_response.json()`
  }
}

const responseExamples = {
  scanResults: {
    title: 'Scan Results Response',
    description: 'Example response from GET /api/v1/scans/{scan_id}',
    data: `{
  "scan_id": "scan-456",
  "repository_id": "repo-123",
  "status": "completed",
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:35:23Z",
  "summary": {
    "total_vulnerabilities": 12,
    "critical": 2,
    "high": 4,
    "medium": 5,
    "low": 1,
    "tools_used": ["bandit", "semgrep", "safety"]
  },
  "vulnerabilities": [
    {
      "id": "vuln-789",
      "severity": "critical",
      "tool": "bandit",
      "title": "SQL Injection vulnerability",
      "description": "Potential SQL injection in user input handling",
      "file": "src/database.py",
      "line": 45,
      "confidence": "high",
      "cwe_id": "CWE-89",
      "fix_suggestion": "Use parameterized queries to prevent SQL injection"
    }
  ],
  "ai_recommendations": {
    "priority_fixes": [
      "Fix SQL injection in src/database.py line 45",
      "Address XSS vulnerability in src/web.py line 23"
    ],
    "security_score": 67,
    "improvement_suggestions": "Focus on input validation and output encoding"
  }
}`
  },
  error: {
    title: 'Error Response',
    description: 'Standard error response format',
    data: `{
  "error": {
    "code": "INVALID_REPOSITORY",
    "message": "Repository not found or access denied",
    "details": "The repository 'repo-123' either doesn't exist or you don't have permission to access it",
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req-abc123"
  }
}`
  }
}

const rateLimits = [
  { plan: 'Free', requests: '100/hour', scans: '10/day' },
  { plan: 'Pro', requests: '1,000/hour', scans: '100/day' },
  { plan: 'Enterprise', requests: 'Unlimited', scans: 'Unlimited' }
]

export function ApiReference() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500'
      case 'POST': return 'bg-blue-500'
      case 'PUT': return 'bg-yellow-500'
      case 'DELETE': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
            <Code className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          API Reference
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete API documentation for DevSecureX. Integrate security scanning into your applications, 
          CI/CD pipelines, and custom tools with our comprehensive REST API.
        </p>
        
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Globe className="h-4 w-4 mr-1" />
            REST API
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1" />
            OAuth 2.0 / JWT
          </div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-1" />
            Rate Limited
          </div>
        </div>
      </div>

      {/* Base URL & Authentication */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Base URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-3">
              <code className="text-sm">{config.api.baseUrl}</code>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All API endpoints are relative to this base URL
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-3">
              <code className="text-sm">Authorization: Bearer YOUR_JWT_TOKEN</code>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Use JWT tokens for API authentication
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
        
        <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="curl">cURL</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Authentication</CardTitle>
                <CardDescription>Get your access token</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{codeExamples[selectedLanguage as keyof typeof codeExamples].name}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].auth, 'auth')}
                    >
                      {copiedCode === 'auth' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].auth}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Create a Scan</CardTitle>
                <CardDescription>Start a security scan on your repository</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{codeExamples[selectedLanguage as keyof typeof codeExamples].name}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].createScan, 'create')}
                    >
                      {copiedCode === 'create' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].createScan}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Get Results</CardTitle>
                <CardDescription>Retrieve scan results and vulnerabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{codeExamples[selectedLanguage as keyof typeof codeExamples].name}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].getResults, 'results')}
                    >
                      {copiedCode === 'results' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].getResults}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>

      {/* API Endpoints */}
      <div>
        <h2 className="text-2xl font-bold mb-6">API Endpoints</h2>
        <div className="space-y-4">
          {apiEndpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getMethodColor(endpoint.method)} text-white`}>
                      {endpoint.method}
                    </Badge>
                    <div>
                      <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                      <code className="text-sm text-muted-foreground">{endpoint.endpoint}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {endpoint.authRequired && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        Auth
                      </Badge>
                    )}
                    <Badge variant="secondary">{endpoint.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{endpoint.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Response Examples */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Response Examples</h2>
        <div className="space-y-6">
          {Object.entries(responseExamples).map(([key, example]) => (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{example.title}</CardTitle>
                    <CardDescription>{example.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(example.data, key)}
                  >
                    {copiedCode === key ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
                    <code>{example.data}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rate Limits */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Rate Limits</h2>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Rate Limiting</AlertTitle>
          <AlertDescription>
            API requests are rate-limited based on your subscription plan. Rate limit headers are included in all responses.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rateLimits.map((limit, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-center">{limit.plan}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{limit.requests}</div>
                  <div className="text-sm text-muted-foreground">API Requests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{limit.scans}</div>
                  <div className="text-sm text-muted-foreground">Security Scans</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* SDKs and Libraries */}
      <div>
        <h2 className="text-2xl font-bold mb-6">SDKs & Libraries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                <Terminal className="h-6 w-6 text-white" />
              </div>
              <CardTitle>JavaScript SDK</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Official JavaScript/TypeScript SDK for Node.js and browsers
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                npm install
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Python SDK</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Python library with async support and comprehensive error handling
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                pip install
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <Terminal className="h-6 w-6 text-white" />
              </div>
              <CardTitle>CLI Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Command-line interface for CI/CD integration and automation
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support */}
      <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Need Help with the API?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Our API documentation is comprehensive, but if you need assistance integrating DevSecureX 
          into your workflow, our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/support">
              Get Support
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/docs/integrations/github">
              <Book className="h-4 w-4 mr-2" />
              Integration Guides
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}