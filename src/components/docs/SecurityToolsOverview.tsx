import React, { useState } from 'react'
import { 
  Shield, 
  Code, 
  Search,
  Filter,
  Clock,
  Cpu,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Zap,
  Database,
  Cloud,
  Lock,
  FileText,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DocsContainer } from './DocsContainer'

// Tool data structure
interface SecurityTool {
  name: string
  category: 'sast' | 'secrets' | 'dependencies' | 'infrastructure' | 'multipurpose'
  description: string
  primaryPurpose: string
  languages: string[]
  vulnerabilityTypes: string[]
  timeout: number
  confidence: 'very_high' | 'high' | 'medium' | 'low'
  supported: boolean
  configurationOptions: string[]
  cliExample: string
  strengths: string[]
  limitations: string[]
  owaspMappings: string[]
  cweMappings: string[]
  enterpriseFeatures: string[]
  installCommand: string
  documentationUrl: string
  performanceLevel: 'fast' | 'medium' | 'slow'
  resourceUsage: 'low' | 'medium' | 'high'
  projectSizeSupport: 'small' | 'medium' | 'large' | 'enterprise'
}

const securityTools: SecurityTool[] = [
  {
    name: 'Semgrep',
    category: 'sast',
    description: 'Multi-language static analysis security testing (SAST) engine with pattern-based vulnerability detection',
    primaryPurpose: 'Comprehensive source code security analysis across 20+ programming languages',
    languages: ['Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'C', 'C++', 'Ruby', 'PHP', 'C#', 'Kotlin', 'Swift', 'Rust', 'Scala', 'Solidity', 'YAML', 'JSON', 'HTML', 'XML', 'Dockerfile'],
    vulnerabilityTypes: ['Code vulnerabilities', 'Custom security patterns', 'Business logic flaws', 'API security issues', 'Framework-specific vulnerabilities'],
    timeout: 600,
    confidence: 'very_high',
    supported: true,
    configurationOptions: ['Custom rule files', 'Language-specific configs', 'Severity levels', 'Pattern matching rules', 'Niche-specific rule sets (AI/ML, Blockchain, IoT)'],
    cliExample: 'semgrep --json --config auto --config /path/to/custom/rules /target/directory',
    strengths: ['Semantic analysis', 'Custom rule support', 'High accuracy', 'Extensive language support', 'Niche technology coverage'],
    limitations: ['Slower than simple pattern matching', 'Memory intensive for large codebases', 'Requires rule tuning for optimal results'],
    owaspMappings: ['A01:2021 – Broken Access Control', 'A02:2021 – Cryptographic Failures', 'A03:2021 – Injection', 'A06:2021 – Vulnerable Components'],
    cweMappings: ['CWE-79 (XSS)', 'CWE-89 (SQL Injection)', 'CWE-502 (Deserialization)', 'CWE-327 (Weak Crypto)'],
    enterpriseFeatures: ['Custom rule validation', 'Concurrent rule processing', 'Advanced pattern matching', 'Multi-language support'],
    installCommand: 'pip install semgrep',
    documentationUrl: 'https://semgrep.dev/docs',
    performanceLevel: 'medium',
    resourceUsage: 'high',
    projectSizeSupport: 'enterprise'
  },
  {
    name: 'Bandit',
    category: 'sast',
    description: 'Python-specific security analyzer using AST-based analysis for accurate vulnerability detection',
    primaryPurpose: 'Python security vulnerabilities and best practices enforcement',
    languages: ['Python'],
    vulnerabilityTypes: ['Hardcoded passwords', 'SQL injection', 'Shell injection', 'Unsafe deserialization', 'Weak cryptography', 'Path traversal'],
    timeout: 300,
    confidence: 'high',
    supported: true,
    configurationOptions: ['Skip specific tests', 'Confidence levels', 'Custom config files', 'Exclude directories', 'Report formats'],
    cliExample: 'python3 -m bandit -f json --skip B101 -l -r /target/directory',
    strengths: ['Python-specific expertise', 'AST-based accuracy', 'Comprehensive OWASP mapping', 'Fast execution', 'Low false positives'],
    limitations: ['Python-only support', 'Limited to static analysis', 'May miss complex business logic issues'],
    owaspMappings: ['A02:2021 – Cryptographic Failures', 'A03:2021 – Injection', 'A07:2021 – Authentication Failures', 'A09:2021 – Security Logging'],
    cweMappings: ['CWE-89 (SQL Injection)', 'CWE-78 (OS Command Injection)', 'CWE-327 (Weak Crypto)', 'CWE-798 (Hardcoded Credentials)'],
    enterpriseFeatures: ['50+ security test mappings', 'Confidence scoring', 'OWASP compliance checking', 'Custom rule integration'],
    installCommand: 'pip install bandit',
    documentationUrl: 'https://bandit.readthedocs.io',
    performanceLevel: 'fast',
    resourceUsage: 'low',
    projectSizeSupport: 'large'
  },
  {
    name: 'GitLeaks',
    category: 'secrets',
    description: 'Git history secrets detection using statistical analysis and pattern recognition',
    primaryPurpose: 'Historical commit analysis for leaked credentials and sensitive information',
    languages: ['All (language-agnostic)'],
    vulnerabilityTypes: ['API keys', 'Passwords', 'Private keys', 'Certificates', 'Database credentials', 'OAuth tokens'],
    timeout: 900,
    confidence: 'medium',
    supported: true,
    configurationOptions: ['Custom secret patterns', 'Entropy thresholds', 'File exclusions', 'Commit range scanning', 'Output redaction'],
    cliExample: 'gitleaks detect --source /repo --report-format json --report-path report.json --no-banner --redact',
    strengths: ['Historical analysis', 'High entropy detection', 'Comprehensive patterns', 'Git metadata extraction', 'Redacted output'],
    limitations: ['High false positive rate', 'No verification of active secrets', 'Limited to git repositories'],
    owaspMappings: ['A02:2021 – Cryptographic Failures', 'A07:2021 – Authentication Failures'],
    cweMappings: ['CWE-798 (Hardcoded Credentials)', 'CWE-200 (Information Exposure)', 'CWE-522 (Insufficiently Protected Credentials)'],
    enterpriseFeatures: ['100+ detection patterns', 'Entropy analysis', 'Git history traversal', 'Automatic redaction'],
    installCommand: 'curl -sSfL https://github.com/zricethezav/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz | tar -xz',
    documentationUrl: 'https://github.com/zricethezav/gitleaks',
    performanceLevel: 'slow',
    resourceUsage: 'medium',
    projectSizeSupport: 'large'
  },
  {
    name: 'TruffleHog',
    category: 'secrets',
    description: 'Filesystem-based secret detection with real-time scanning capabilities',
    primaryPurpose: 'Current filesystem secret scanning complementary to historical analysis',
    languages: ['All (language-agnostic)'],
    vulnerabilityTypes: ['Active secrets', 'API credentials', 'Database connections', 'Service tokens', 'Private certificates'],
    timeout: 300,
    confidence: 'medium',
    supported: true,
    configurationOptions: ['Verification settings', 'Detector selection', 'Output formats', 'Exclusion patterns', 'Confidence levels'],
    cliExample: 'trufflehog filesystem /target --json --no-verification',
    strengths: ['Real-time detection', 'Verification capabilities', 'Detector-specific analysis', 'Active development scanning'],
    limitations: ['No historical analysis', 'Verification can be slow', 'May miss encoded secrets'],
    owaspMappings: ['A02:2021 – Cryptographic Failures', 'A07:2021 – Authentication Failures'],
    cweMappings: ['CWE-798 (Hardcoded Credentials)', 'CWE-200 (Information Exposure)'],
    enterpriseFeatures: ['Secret verification', 'Streaming JSON output', 'Detector metadata', 'Confidence scoring'],
    installCommand: 'curl -sSfL https://github.com/trufflesecurity/trufflehog/releases/latest/download/trufflehog_linux_amd64.tar.gz | tar -xz',
    documentationUrl: 'https://github.com/trufflesecurity/trufflehog',
    performanceLevel: 'fast',
    resourceUsage: 'low',
    projectSizeSupport: 'large'
  },
  {
    name: 'Trivy',
    category: 'multipurpose',
    description: 'Comprehensive vulnerability scanner for dependencies, containers, and infrastructure',
    primaryPurpose: 'Multi-modal security analysis including CVE scanning and misconfiguration detection',
    languages: ['All (package managers)', 'Docker', 'Kubernetes', 'Terraform'],
    vulnerabilityTypes: ['CVE vulnerabilities', 'License issues', 'Misconfigurations', 'Container security', 'IaC security'],
    timeout: 600,
    confidence: 'high',
    supported: true,
    configurationOptions: ['Scan types', 'Severity filters', 'Output formats', 'Database updates', 'Policy customization'],
    cliExample: 'trivy fs --format json --severity CRITICAL,HIGH,MEDIUM --quiet /target',
    strengths: ['Multi-modal scanning', 'Comprehensive CVE database', 'Container expertise', 'IaC analysis', 'Active maintenance'],
    limitations: ['Can be slow for large scans', 'Requires internet for updates', 'Complex configuration options'],
    owaspMappings: ['A06:2021 – Vulnerable Components', 'A05:2021 – Security Misconfiguration', 'A08:2021 – Integrity Failures'],
    cweMappings: ['CWE-1104 (Vulnerable Dependencies)', 'CWE-16 (Configuration)', 'CWE-937 (OWASP Top 10)'],
    enterpriseFeatures: ['Multiple scan modes', 'License compliance', 'Container registry integration', 'Policy as code'],
    installCommand: 'curl -sSfL https://github.com/aquasecurity/trivy/releases/latest/download/trivy_Linux-64bit.tar.gz | tar -xz',
    documentationUrl: 'https://aquasecurity.github.io/trivy/',
    performanceLevel: 'medium',
    resourceUsage: 'medium',
    projectSizeSupport: 'enterprise'
  },
  {
    name: 'Safety',
    category: 'dependencies',
    description: 'Python dependency security scanner using PyUp.io safety database',
    primaryPurpose: 'Python package vulnerability analysis and CVE mapping',
    languages: ['Python'],
    vulnerabilityTypes: ['Known CVEs in Python packages', 'Vulnerable dependencies', 'Outdated packages'],
    timeout: 300,
    confidence: 'high',
    supported: true,
    configurationOptions: ['Requirements files', 'Database updates', 'Ignore policies', 'Output formats', 'Severity filtering'],
    cliExample: 'safety check --json --full-report',
    strengths: ['Python expertise', 'Comprehensive CVE database', 'Fast execution', 'Requirements.txt analysis'],
    limitations: ['Python-only', 'Requires internet connectivity', 'Limited to known vulnerabilities'],
    owaspMappings: ['A06:2021 – Vulnerable Components'],
    cweMappings: ['CWE-1104 (Vulnerable Dependencies)', 'CWE-937 (OWASP Top 10)'],
    enterpriseFeatures: ['Trivy fallback mechanism', 'Multiple format support', 'Dependency conflict handling'],
    installCommand: 'pip install safety',
    documentationUrl: 'https://pyup.io/safety/',
    performanceLevel: 'fast',
    resourceUsage: 'low',
    projectSizeSupport: 'large'
  },
  {
    name: 'ESLint Security',
    category: 'sast',
    description: 'JavaScript/TypeScript security analysis with modern ESLint v9+ support',
    primaryPurpose: 'Web application security for JavaScript and TypeScript projects',
    languages: ['JavaScript', 'TypeScript', 'JSX', 'TSX'],
    vulnerabilityTypes: ['XSS vulnerabilities', 'Unsafe eval usage', 'Prototype pollution', 'DOM-based XSS', 'Insecure randomness'],
    timeout: 600,
    confidence: 'high',
    supported: true,
    configurationOptions: ['ESLint v9+ flat config', 'Security-focused rules', 'TypeScript support', 'Framework plugins', 'Custom rules'],
    cliExample: 'eslint --format json --config eslint.config.js src/',
    strengths: ['Modern ESLint support', 'Framework integration', 'Active ecosystem', 'TypeScript expertise'],
    limitations: ['Requires Node.js ecosystem', 'Configuration complexity', 'Limited to JavaScript family'],
    owaspMappings: ['A03:2021 – Injection', 'A01:2021 – Broken Access Control'],
    cweMappings: ['CWE-79 (XSS)', 'CWE-95 (Code Injection)', 'CWE-1321 (Prototype Pollution)'],
    enterpriseFeatures: ['Multiple execution modes', 'Dynamic configuration', 'Tool discovery chain', 'Framework detection'],
    installCommand: 'npm install -g eslint eslint-plugin-security',
    documentationUrl: 'https://eslint.org/docs',
    performanceLevel: 'medium',
    resourceUsage: 'medium',
    projectSizeSupport: 'large'
  },
  {
    name: 'Brakeman',
    category: 'sast',
    description: 'Ruby on Rails security scanner with MVC pattern analysis',
    primaryPurpose: 'Rails-specific vulnerability detection and framework security',
    languages: ['Ruby', 'Ruby on Rails'],
    vulnerabilityTypes: ['SQL injection in ActiveRecord', 'XSS in ERB templates', 'Mass assignment', 'Authentication bypass', 'File access vulnerabilities'],
    timeout: 600,
    confidence: 'high',
    supported: true,
    configurationOptions: ['Rails detection', 'Confidence levels', 'Report formats', 'Ignore files', 'Plugin support'],
    cliExample: 'brakeman --format json --output report.json /rails/app',
    strengths: ['Rails expertise', 'MVC pattern understanding', 'Framework-specific rules', 'Active maintenance'],
    limitations: ['Rails-specific only', 'May have false positives', 'Limited to static analysis'],
    owaspMappings: ['A03:2021 – Injection', 'A01:2021 – Broken Access Control', 'A07:2021 – Authentication Failures'],
    cweMappings: ['CWE-89 (SQL Injection)', 'CWE-79 (XSS)', 'CWE-285 (Authorization)', 'CWE-22 (Path Traversal)'],
    enterpriseFeatures: ['Rails detection logic', 'MVC security analysis', 'Framework validation', 'Template security'],
    installCommand: 'gem install brakeman',
    documentationUrl: 'https://brakemanscanner.org/docs/',
    performanceLevel: 'medium',
    resourceUsage: 'medium',
    projectSizeSupport: 'large'
  },
  {
    name: 'Gosec',
    category: 'sast',
    description: 'Go programming language security analyzer with comprehensive rule coverage',
    primaryPurpose: 'Go-specific security vulnerability detection using AST analysis',
    languages: ['Go'],
    vulnerabilityTypes: ['Hardcoded credentials', 'Unsafe operations', 'Injection vulnerabilities', 'File system security', 'Cryptographic issues', 'Memory aliasing'],
    timeout: 600,
    confidence: 'high',
    supported: true,
    configurationOptions: ['Rule selection', 'Confidence levels', 'Output formats', 'Exclude rules', 'Custom configs'],
    cliExample: 'gosec -fmt json ./...',
    strengths: ['Go expertise', 'AST-based accuracy', 'Comprehensive rule set (G101-G601)', 'Built-in CWE mapping'],
    limitations: ['Go-only support', 'Static analysis limitations', 'May miss runtime issues'],
    owaspMappings: ['A02:2021 – Cryptographic Failures', 'A03:2021 – Injection', 'A07:2021 – Authentication Failures'],
    cweMappings: ['CWE-798 (Hardcoded Credentials)', 'CWE-89 (SQL Injection)', 'CWE-78 (Command Injection)', 'CWE-327 (Weak Crypto)'],
    enterpriseFeatures: ['G101-G601 rule coverage', 'AST-based analysis', 'CWE mapping', 'Memory safety checks'],
    installCommand: 'go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest',
    documentationUrl: 'https://securecodewarrior.github.io/gosec/',
    performanceLevel: 'medium',
    resourceUsage: 'medium',
    projectSizeSupport: 'large'
  },
  {
    name: 'Checkov',
    category: 'infrastructure',
    description: 'Infrastructure as Code security scanner with multi-cloud support',
    primaryPurpose: 'IaC security analysis for Terraform, Kubernetes, and Docker configurations',
    languages: ['Terraform', 'Kubernetes', 'Docker', 'CloudFormation', 'Azure ARM', 'Ansible'],
    vulnerabilityTypes: ['IaC misconfigurations', 'Security best practices', 'Compliance violations', 'Resource exposures', 'Access control issues'],
    timeout: 300,
    confidence: 'high',
    supported: true,
    configurationOptions: ['Policy selection', 'Framework filters', 'Skip checks', 'Custom policies', 'Compliance frameworks'],
    cliExample: 'checkov -d /target --output json --quiet --compact --skip-download',
    strengths: ['1000+ security checks', 'Multi-format support', 'Compliance mapping', 'Active development'],
    limitations: ['Can be noisy', 'Configuration-heavy', 'May miss runtime issues'],
    owaspMappings: ['A05:2021 – Security Misconfiguration', 'A01:2021 – Broken Access Control'],
    cweMappings: ['CWE-16 (Configuration)', 'CWE-269 (Privilege Management)', 'CWE-200 (Information Exposure)'],
    enterpriseFeatures: ['Multi-cloud support', 'Compliance frameworks (CIS, PCI DSS, HIPAA)', 'Custom policies', 'Resource analysis'],
    installCommand: 'pip install checkov',
    documentationUrl: 'https://www.checkov.io/1.Welcome/Quick%20Start.html',
    performanceLevel: 'fast',
    resourceUsage: 'low',
    projectSizeSupport: 'large'
  },
  {
    name: 'Cppcheck',
    category: 'sast',
    description: 'C/C++ static analysis focusing on memory safety and undefined behavior',
    primaryPurpose: 'Memory safety analysis and undefined behavior detection for C/C++',
    languages: ['C', 'C++'],
    vulnerabilityTypes: ['Buffer overflows', 'Memory leaks', 'Use-after-free', 'Null pointer dereference', 'Uninitialized variables'],
    timeout: 600,
    confidence: 'high',
    supported: true,
    configurationOptions: ['Analysis types', 'Suppression files', 'Include paths', 'Standard selection', 'Platform settings'],
    cliExample: 'cppcheck --enable=warning,style,performance,portability --xml --output-file=report.xml /target',
    strengths: ['Memory safety expertise', 'C/C++ specialization', 'Performance analysis', 'Portability checks'],
    limitations: ['C/C++ only', 'Can be slow on large codebases', 'May require tuning'],
    owaspMappings: ['A06:2021 – Vulnerable Components', 'A04:2021 – Insecure Design'],
    cweMappings: ['CWE-119 (Buffer Overflow)', 'CWE-401 (Memory Leak)', 'CWE-416 (Use After Free)', 'CWE-476 (Null Pointer)'],
    enterpriseFeatures: ['Memory safety analysis', 'Performance optimization', 'Portability analysis', 'XML reporting'],
    installCommand: 'apt-get install cppcheck',
    documentationUrl: 'https://cppcheck.sourceforge.io/',
    performanceLevel: 'slow',
    resourceUsage: 'high',
    projectSizeSupport: 'large'
  },
  {
    name: 'SpotBugs',
    category: 'sast',
    description: 'Java bytecode analysis for JVM security vulnerabilities',
    primaryPurpose: 'Bytecode-level security analysis for Java applications',
    languages: ['Java', 'Scala', 'Kotlin', 'JVM languages'],
    vulnerabilityTypes: ['SQL injection patterns', 'XSS vulnerabilities', 'Cryptographic issues', 'Authentication flaws', 'Concurrency bugs'],
    timeout: 600,
    confidence: 'high',
    supported: true,
    configurationOptions: ['Bug categories', 'Effort levels', 'Output formats', 'Filter files', 'Plugin support'],
    cliExample: 'spotbugs -textui -xml:withMessages -output report.xml -effort:max /target',
    strengths: ['Bytecode analysis', 'JVM expertise', 'Enterprise Java patterns', 'Comprehensive bug detection'],
    limitations: ['Java ecosystem only', 'Requires compiled code', 'Can produce false positives'],
    owaspMappings: ['A03:2021 – Injection', 'A02:2021 – Cryptographic Failures', 'A07:2021 – Authentication Failures'],
    cweMappings: ['CWE-89 (SQL Injection)', 'CWE-79 (XSS)', 'CWE-327 (Weak Crypto)', 'CWE-287 (Authentication)'],
    enterpriseFeatures: ['Bytecode-level analysis', 'Multiple bug categories', 'Enterprise patterns', 'Plugin ecosystem'],
    installCommand: 'wget https://github.com/spotbugs/spotbugs/releases/latest/download/spotbugs-4.7.3.tgz && tar -xzf spotbugs-4.7.3.tgz',
    documentationUrl: 'https://spotbugs.github.io/',
    performanceLevel: 'medium',
    resourceUsage: 'medium',
    projectSizeSupport: 'large'
  },
  {
    name: 'Psalm',
    category: 'sast',
    description: 'PHP static analysis with type safety and security focus',
    primaryPurpose: 'PHP security analysis with taint tracking and type safety',
    languages: ['PHP'],
    vulnerabilityTypes: ['Tainted input', 'SQL injection', 'XSS prevention', 'Type safety', 'Authentication issues'],
    timeout: 600,
    confidence: 'high',
    supported: true,
    configurationOptions: ['Error levels', 'Taint analysis', 'Plugin support', 'Baseline files', 'Custom rules'],
    cliExample: 'psalm --output-format=json --config=psalm.xml',
    strengths: ['PHP expertise', 'Taint tracking', 'Type safety analysis', 'Framework-agnostic'],
    limitations: ['PHP only', 'Configuration complexity', 'Learning curve'],
    owaspMappings: ['A03:2021 – Injection', 'A07:2021 – Authentication Failures'],
    cweMappings: ['CWE-89 (SQL Injection)', 'CWE-79 (XSS)', 'CWE-287 (Authentication)', 'CWE-20 (Input Validation)'],
    enterpriseFeatures: ['Taint tracking', 'Security analysis', 'Type safety', 'Dynamic configuration'],
    installCommand: 'composer global require vimeo/psalm',
    documentationUrl: 'https://psalm.dev/docs/',
    performanceLevel: 'medium',
    resourceUsage: 'medium',
    projectSizeSupport: 'large'
  },
  {
    name: 'Graudit',
    category: 'multipurpose',
    description: 'Grep-based vulnerability detection for fast pattern-based security analysis',
    primaryPurpose: 'Quick initial assessment using pattern-based vulnerability detection',
    languages: ['All (regex patterns)'],
    vulnerabilityTypes: ['SQL injection patterns', 'Command injection', 'XSS patterns', 'Hardcoded secrets', 'Common vulnerabilities'],
    timeout: 300,
    confidence: 'medium',
    supported: true,
    configurationOptions: ['Pattern databases', 'Output formats', 'Exclusion rules', 'Severity levels', 'Custom patterns'],
    cliExample: 'graudit -d /signatures /target',
    strengths: ['Very fast execution', 'Multi-language support', 'Simple operation', 'Good for initial assessment'],
    limitations: ['High false positive rate', 'Regex-based limitations', 'No semantic analysis'],
    owaspMappings: ['A03:2021 – Injection', 'A02:2021 – Cryptographic Failures'],
    cweMappings: ['CWE-89 (SQL Injection)', 'CWE-78 (Command Injection)', 'CWE-79 (XSS)'],
    enterpriseFeatures: ['Pattern-based detection', 'Deduplication logic', 'Multi-language patterns', 'Fast scanning'],
    installCommand: 'git clone https://github.com/wireghoul/graudit.git && ln -s graudit/graudit /usr/local/bin/',
    documentationUrl: 'https://github.com/wireghoul/graudit',
    performanceLevel: 'fast',
    resourceUsage: 'low',
    projectSizeSupport: 'enterprise'
  },
  {
    name: 'Roslynator',
    category: 'sast',
    description: 'C# and .NET security analysis using Roslyn compiler platform',
    primaryPurpose: 'C# and .NET security analysis with performance and maintainability focus',
    languages: ['C#', '.NET', 'VB.NET'],
    vulnerabilityTypes: ['Unsafe string formatting', 'Weak cryptography', 'Access control issues', 'Authentication failures', 'Resource management'],
    timeout: 600,
    confidence: 'high',
    supported: true,
    configurationOptions: ['Rule selection', 'Severity levels', 'Output formats', 'MSBuild integration', 'EditorConfig'],
    cliExample: 'roslynator analyze --output report.xml /project',
    strengths: ['Roslyn-based accuracy', '.NET expertise', 'Modern C# support', 'MSBuild integration'],
    limitations: ['C#/.NET only', 'Requires .NET SDK', 'Limited to amd64 architecture'],
    owaspMappings: ['A02:2021 – Cryptographic Failures', 'A01:2021 – Broken Access Control', 'A07:2021 – Authentication Failures'],
    cweMappings: ['CWE-89 (SQL Injection)', 'CWE-327 (Weak Crypto)', 'CWE-284 (Access Control)', 'CWE-287 (Authentication)'],
    enterpriseFeatures: ['Roslyn-based analysis', '.NET Framework support', 'Security diagnostics', 'Performance analysis'],
    installCommand: 'dotnet tool install -g roslynator.dotnet.cli',
    documentationUrl: 'https://github.com/JosefPihrt/Roslynator',
    performanceLevel: 'medium',
    resourceUsage: 'medium',
    projectSizeSupport: 'large'
  }
]

const toolCategories = {
  sast: {
    name: 'Static Application Security Testing (SAST)',
    icon: Code,
    description: 'Source code analysis for security vulnerabilities',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  },
  secrets: {
    name: 'Secrets Detection',
    icon: Lock,
    description: 'API keys, passwords, and credential scanning',
    color: 'bg-red-500/10 text-red-600 border-red-500/20'
  },
  dependencies: {
    name: 'Dependency Security',
    icon: Database,
    description: 'Known CVEs and vulnerable package detection',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
  },
  infrastructure: {
    name: 'Infrastructure Security',
    icon: Cloud,
    description: 'IaC, containers, and configuration analysis',
    color: 'bg-green-500/10 text-green-600 border-green-500/20'
  },
  multipurpose: {
    name: 'Multi-Purpose',
    icon: Zap,
    description: 'Comprehensive security analysis tools',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  }
}

const confidenceColors = {
  very_high: 'bg-green-500/10 text-green-700 border-green-500/20',
  high: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  low: 'bg-red-500/10 text-red-700 border-red-500/20'
}

const performanceColors = {
  fast: 'bg-green-500/10 text-green-700 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  slow: 'bg-red-500/10 text-red-700 border-red-500/20'
}

export function SecurityToolsOverview() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'confidence' | 'performance'>('category')

  const filteredTools = securityTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.languages.some(lang => lang.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         tool.vulnerabilityTypes.some(type => type.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'confidence':
        const confidenceOrder = { very_high: 4, high: 3, medium: 2, low: 1 }
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
      case 'performance':
        const performanceOrder = { fast: 3, medium: 2, slow: 1 }
        return performanceOrder[b.performanceLevel] - performanceOrder[a.performanceLevel]
      default:
        return 0
    }
  })

  const toggleToolExpansion = (toolName: string) => {
    const newExpanded = new Set(expandedTools)
    if (newExpanded.has(toolName)) {
      newExpanded.delete(toolName)
    } else {
      newExpanded.add(toolName)
    }
    setExpandedTools(newExpanded)
  }

  const categoryStats = Object.entries(toolCategories).map(([key, category]) => ({
    key,
    ...category,
    count: securityTools.filter(tool => tool.category === key).length
  }))

  return (
    <DocsContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Security Tools Overview</h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive documentation of integrated security scanning tools
            </p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center justify-between p-3 sm:p-4">
              <div>
                <div className="text-lg sm:text-2xl font-bold">{securityTools.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Security Tools</div>
              </div>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-3 sm:p-4">
              <div>
                <div className="text-lg sm:text-2xl font-bold">20+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Languages</div>
              </div>
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-3 sm:p-4">
              <div>
                <div className="text-lg sm:text-2xl font-bold">8</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Categories</div>
              </div>
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-3 sm:p-4">
              <div>
                <div className="text-lg sm:text-2xl font-bold">100%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Coverage</div>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tools Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="comparison">Comparison Matrix</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools, languages, or vulnerability types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(toolCategories).map(([key, category]) => (
                    <SelectItem key={key} value={key}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'name' | 'category' | 'confidence' | 'performance') => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Sort by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Sort by Category</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="confidence">Sort by Confidence</SelectItem>
                  <SelectItem value="performance">Sort by Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tools List */}
          <div className="space-y-4">
            {sortedTools.map((tool) => {
              const category = toolCategories[tool.category]
              const CategoryIcon = category.icon
              const isExpanded = expandedTools.has(tool.name)
              
              return (
                <Card key={tool.name} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CategoryIcon className="h-5 w-5 text-blue-500" />
                          <h3 className="text-lg sm:text-xl font-semibold">{tool.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={`${category.color} text-xs`}>
                            {category.name.split(' ')[0]}
                          </Badge>
                          <Badge className={`${confidenceColors[tool.confidence]} text-xs`}>
                            {tool.confidence.replace('_', ' ')}
                          </Badge>
                          <Badge className={`${performanceColors[tool.performanceLevel]} text-xs`}>
                            {tool.performanceLevel}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{tool.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3 text-xs sm:text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {tool.timeout}s timeout
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Cpu className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {tool.resourceUsage} resource
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {tool.projectSizeSupport} projects
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleToolExpansion(tool.name)}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="space-y-6">
                      {/* Languages */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">SUPPORTED LANGUAGES</h4>
                        <div className="flex flex-wrap gap-2">
                          {tool.languages.map((lang) => (
                            <Badge key={lang} variant="outline">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Vulnerability Types */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">VULNERABILITY TYPES</h4>
                        <div className="flex flex-wrap gap-2">
                          {tool.vulnerabilityTypes.map((type) => (
                            <Badge key={type} variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* CLI Example */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">COMMAND LINE EXAMPLE</h4>
                        <div className="bg-muted/50 p-3 rounded-md font-mono text-sm overflow-x-auto border">
                          <code className="text-foreground">{tool.cliExample}</code>
                        </div>
                      </div>

                      {/* Strengths & Limitations */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">STRENGTHS</h4>
                          <ul className="space-y-1">
                            {tool.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">LIMITATIONS</h4>
                          <ul className="space-y-1">
                            {tool.limitations.map((limitation, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                {limitation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* OWASP & CWE Mappings */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">OWASP TOP 10 COVERAGE</h4>
                          <div className="space-y-1">
                            {tool.owaspMappings.map((mapping) => (
                              <Badge key={mapping} variant="outline" className="mr-2 mb-1">
                                {mapping}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">CWE MAPPINGS</h4>
                          <div className="space-y-1">
                            {tool.cweMappings.map((mapping) => (
                              <Badge key={mapping} variant="outline" className="mr-2 mb-1">
                                {mapping}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Installation & Documentation */}
                      <div className="flex flex-col md:flex-row gap-4 pt-4 border-t">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">INSTALLATION</h4>
                          <div className="bg-muted/50 p-2 rounded text-sm font-mono border">
                            <code className="text-foreground">{tool.installCommand}</code>
                          </div>
                        </div>
                        <div className="flex items-end">
                          <Button variant="outline" size="sm" asChild>
                            <a href={tool.documentationUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Documentation
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6">
            {categoryStats.map((category) => {
              const CategoryIcon = category.icon
              const categoryTools = securityTools.filter(tool => tool.category === category.key)
              
              return (
                <Card key={category.key}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <CategoryIcon className="h-6 w-6 text-blue-500" />
                      <div>
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                      <Badge>{category.count} tools</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryTools.map((tool) => (
                        <div key={tool.name} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{tool.name}</h4>
                            <Badge className={confidenceColors[tool.confidence]} variant="outline">
                              {tool.confidence.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {tool.primaryPurpose}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{tool.languages.length} languages</span>
                            <span>{tool.performanceLevel} speed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Tools Comparison Matrix</CardTitle>
              <CardDescription>
                Compare tools across key dimensions: languages, confidence, performance, and project support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Tool</th>
                        <th className="text-left p-2 font-medium">Category</th>
                        <th className="text-left p-2 font-medium">Languages</th>
                        <th className="text-left p-2 font-medium">Confidence</th>
                        <th className="text-left p-2 font-medium">Performance</th>
                        <th className="text-left p-2 font-medium">Resource Usage</th>
                        <th className="text-left p-2 font-medium">Project Size</th>
                        <th className="text-left p-2 font-medium">Timeout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTools.map((tool) => {
                        const category = toolCategories[tool.category]
                        return (
                          <tr key={tool.name} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{tool.name}</td>
                            <td className="p-2">
                              <Badge className={category.color} variant="outline">
                                {category.name.split(' ')[0]}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center">
                                <span className="text-muted-foreground mr-2">{tool.languages.length}</span>
                                <div className="text-xs">
                                  {tool.languages.slice(0, 3).join(', ')}
                                  {tool.languages.length > 3 && '...'}
                                </div>
                              </div>
                            </td>
                            <td className="p-2">
                              <Badge className={confidenceColors[tool.confidence]} variant="outline">
                                {tool.confidence.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge className={performanceColors[tool.performanceLevel]} variant="outline">
                                {tool.performanceLevel}
                              </Badge>
                            </td>
                            <td className="p-2 text-muted-foreground">{tool.resourceUsage}</td>
                            <td className="p-2 text-muted-foreground">{tool.projectSizeSupport}</td>
                            <td className="p-2 text-muted-foreground">{tool.timeout}s</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tool Integration Architecture</CardTitle>
                <CardDescription>
                  Understanding how security tools integrate with DevSecureX platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Plugin-Based Architecture</h4>
                    <p className="text-sm text-muted-foreground">
                      All tools extend BaseToolRunner abstract class for consistent integration
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Concurrent Execution</h4>
                    <p className="text-sm text-muted-foreground">
                      Tools run asynchronously using asyncio for optimal performance
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Result Normalization</h4>
                    <p className="text-sm text-muted-foreground">
                      Standardized output format across all tools with OWASP/CWE mapping
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Common Integration Patterns</h4>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                    <div>1. Tool availability validation</div>
                    <div>2. Command construction with parameters</div>
                    <div>3. Async execution with timeout handling</div>
                    <div>4. Output parsing and normalization</div>
                    <div>5. Code context extraction</div>
                    <div>6. OWASP/CWE mapping application</div>
                    <div>7. Standardized result formatting</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Configuration Management</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Many tools require dynamic configuration generation:
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ESLint - Generate eslint.config.js or .eslintrc.json
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Psalm - Generate psalm.xml with security settings
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Checkov - Configure skip checks and output format
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Bandit - Custom rule configuration when needed
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Practices & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Tool Selection Guidelines</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                        <span><strong>Python projects:</strong> Use Bandit + Safety + Semgrep for comprehensive coverage</span>
                      </li>
                      <li className="flex items-start">
                        <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                        <span><strong>JavaScript/TypeScript:</strong> ESLint Security + Semgrep combination</span>
                      </li>
                      <li className="flex items-start">
                        <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                        <span><strong>Infrastructure:</strong> Checkov + Trivy for IaC and container security</span>
                      </li>
                      <li className="flex items-start">
                        <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                        <span><strong>Secrets detection:</strong> GitLeaks + TruffleHog for complete coverage</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Performance Optimization</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                        <span>Enable concurrent execution for independent tools</span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                        <span>Use file filtering for PR-focused scans</span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                        <span>Configure appropriate timeouts based on project size</span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                        <span>Leverage caching for rule validation and context extraction</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DocsContainer>
  )
}