import { useState, useEffect, useMemo } from 'react'
import { 
  Code2, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  Sparkles, 
  BookOpen,
  Settings,
  Zap,
  FileCode,
  Terminal
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

import { RuleEditor } from './RuleEditor'
import { rulesAPI } from '@/lib/api/rules'
import type { 
  SupportedTool, 
  SupportedToolInfo, 
  RuleLanguage, 
  RuleValidationResult
} from '@/types/rules'

interface ToolSpecificPatternInputProps {
  tool: SupportedTool
  toolInfo?: SupportedToolInfo
  value: string
  onChange: (value: string) => void
  language?: RuleLanguage
  onLanguageChange?: (language: RuleLanguage | undefined) => void
  onValidationChange?: (result: RuleValidationResult) => void
  className?: string
  // Additional rule data for validation
  ruleName?: string
  ruleMessage?: string
  severity?: string
}

export function ToolSpecificPatternInput({
  tool,
  toolInfo,
  value,
  onChange,
  language,
  onLanguageChange,
  onValidationChange,
  className = "",
  // Additional rule data for validation
  ruleName = "",
  ruleMessage = "",
  severity = "WARNING"
}: ToolSpecificPatternInputProps) {
  const { toast } = useToast()
  
  const [validationResult, setValidationResult] = useState<RuleValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'examples' | 'docs'>('editor')
  const [lastValidatedContent, setLastValidatedContent] = useState<string>('')
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string | null>('all')

  // Check if tool supports custom rules
  const isToolSupported = useMemo(() => {
    // Tools that actually support custom rules (verified against scanner engine)
    const supportedTools = [
      'semgrep', 'bandit', 'eslint-security',
      'gosec', 'checkov', 'cppcheck', 'psalm', 'roslynator', 
      'spotbugs', 'brakeman', 'gitleaks', 'safety'
    ];
    return supportedTools.includes(tool);
  }, [tool]);

  // Tool-specific configuration and formatting
  const toolSpecs = useMemo(() => {
    const specs: Record<SupportedTool, {
      editorLanguage: string
      placeholder: string
      heightPx: number
      showLineNumbers: boolean
      features: string[]
      complexity: 'basic' | 'intermediate' | 'advanced'
    }> = {
      semgrep: {
        editorLanguage: 'yaml',
        placeholder: `rules:
  - id: my-rule
    message: "Description of the vulnerability"
    languages: [python]
    severity: ERROR
    patterns:
      - pattern: dangerous_function($VAR)`,
        heightPx: 300,
        showLineNumbers: true,
        features: ['Pattern matching', 'Metavariables', 'Multiple languages', 'Complex logic'],
        complexity: 'intermediate'
      },
      bandit: {
        editorLanguage: 'python',
        placeholder: `# Bandit rule configuration (Python AST-based)
def check_hardcoded_password(context):
    for node in ast.walk(context.node):
        if isinstance(node, ast.Assign):
            # Check for hardcoded passwords
            pass`,
        heightPx: 250,
        showLineNumbers: true,
        features: ['Python AST', 'Security-focused', 'Built-in checks'],
        complexity: 'advanced'
      },
      'eslint-security': {
        editorLanguage: 'javascript',
        placeholder: `{
  "meta": {
    "type": "problem",
    "docs": {
      "description": "Detect security vulnerabilities",
      "category": "Security"
    }
  },
  "create": function(context) {
    return {
      "CallExpression": function(node) {
        // Check for vulnerable function calls
      }
    };
  }
}`,
        heightPx: 350,
        showLineNumbers: true,
        features: ['ESLint plugin', 'JavaScript/TypeScript', 'Custom rules'],
        complexity: 'advanced'
      },
      gosec: {
        editorLanguage: 'go',
        placeholder: `// Gosec rule for Go security scanning
package main

import (
    "go/ast"
    "github.com/securecodewarrior/gosec/v2"
)

// Rule checks for unsafe operations`,
        heightPx: 250,
        showLineNumbers: true,
        features: ['Go AST analysis', 'Security patterns', 'Built-in rules'],
        complexity: 'advanced'
      },
      checkov: {
        editorLanguage: 'python',
        placeholder: `from checkov.common.models.enums import CheckResult
from checkov.terraform.checks.resource.base_resource_check import BaseResourceCheck

class CustomCheck(BaseResourceCheck):
    def __init__(self):
        name = "Custom security check"
        id = "CKV_CUSTOM_1"
        supported_resources = ['aws_instance']
        categories = [CheckCategories.ENCRYPTION]
        super().__init__(name=name, id=id, categories=categories, supported_resources=supported_resources)
    
    def scan_resource_conf(self, conf):
        # Implementation here
        return CheckResult.PASSED`,
        heightPx: 400,
        showLineNumbers: true,
        features: ['Infrastructure as Code', 'Multi-cloud', 'Policy as Code'],
        complexity: 'intermediate'
      },
      safety: {
        editorLanguage: 'json',
        placeholder: `{
  "package_name": "vulnerable-package",
  "vulnerable_versions": ["<1.2.3", ">=2.0.0,<2.1.0"],
  "cve_id": "CVE-2023-XXXX",
  "severity": "HIGH",
  "description": "Description of the vulnerability",
  "recommendation": "Update to version 1.2.3 or higher"
}`,
        heightPx: 200,
        showLineNumbers: true,
        features: ['Dependency scanning', 'Python packages', 'CVE database'],
        complexity: 'basic'
      },
      psalm: {
        editorLanguage: 'php',
        placeholder: `<?php
namespace MyPlugin;

use Psalm\\CodeLocation;
use Psalm\\FileManipulation;
use Psalm\\Plugin\\EventHandler\\AfterMethodCallAnalysisInterface;
use Psalm\\Plugin\\EventHandler\\Event\\AfterMethodCallAnalysisEvent;

class CustomSecurityCheck implements AfterMethodCallAnalysisInterface
{
    public static function afterMethodCallAnalysis(AfterMethodCallAnalysisEvent $event): ?bool
    {
        // Check for security issues in method calls
        return null;
    }
}`,
        heightPx: 350,
        showLineNumbers: true,
        features: ['PHP static analysis', 'Type checking', 'Custom plugins'],
        complexity: 'advanced'
      },
      cppcheck: {
        editorLanguage: 'xml',
        placeholder: `<?xml version="1.0"?>
<rules>
    <rule>
        <id>customCheck</id>
        <severity>error</severity>
        <msg>Custom security check for C/C++</msg>
        <rule_text>Check for buffer overflow patterns</rule_text>
        <pattern>strcpy\\s*\\(.*\\)</pattern>
        <description>Unsafe strcpy usage detected</description>
    </rule>
</rules>`,
        heightPx: 250,
        showLineNumbers: true,
        features: ['C/C++ analysis', 'Memory safety', 'Undefined behavior'],
        complexity: 'intermediate'
      },
      roslynator: {
        editorLanguage: 'csharp',
        placeholder: `using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

[DiagnosticAnalyzer(LanguageNames.CSharp)]
public class CustomSecurityAnalyzer : DiagnosticAnalyzer
{
    public static readonly DiagnosticDescriptor Rule = new DiagnosticDescriptor(
        "CSA0001",
        "Custom Security Rule",
        "Security issue detected: {0}",
        "Security",
        DiagnosticSeverity.Warning,
        isEnabledByDefault: true);

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics => ImmutableArray.Create(Rule);

    public override void Initialize(AnalysisContext context)
    {
        context.RegisterSyntaxNodeAction(AnalyzeNode, SyntaxKind.InvocationExpression);
    }

    private static void AnalyzeNode(SyntaxNodeAnalysisContext context)
    {
        // Analysis logic here
    }
}`,
        heightPx: 500,
        showLineNumbers: true,
        features: ['C# Roslyn analyzers', 'Syntax analysis', 'IDE integration'],
        complexity: 'advanced'
      },
      spotbugs: {
        editorLanguage: 'xml',
        placeholder: `<?xml version="1.0" encoding="UTF-8"?>
<BugPattern type="CUSTOM_SECURITY_ISSUE" abbrev="CSI" category="SECURITY">
    <ShortDescription>Custom security issue detected</ShortDescription>
    <LongDescription>
        This pattern detects potential security vulnerabilities in Java code.
    </LongDescription>
    <Details>
        <![CDATA[
        <p>This detector identifies security issues such as:</p>
        <ul>
            <li>SQL injection vulnerabilities</li>
            <li>XSS vulnerabilities</li>
            <li>Insecure cryptographic usage</li>
        </ul>
        ]]>
    </Details>
</BugPattern>`,
        heightPx: 300,
        showLineNumbers: true,
        features: ['Java bytecode analysis', 'Security patterns', 'IDE plugins'],
        complexity: 'intermediate'
      },
      brakeman: {
        editorLanguage: 'ruby',
        placeholder: `# Brakeman custom check for Ruby on Rails
class CustomSecurityCheck < Brakeman::BaseCheck
  Brakeman::Checks.add self

  @message = "Custom security vulnerability detected"

  def run_check
    tracker.find_call(:methods => [:dangerous_method]).each do |result|
      warn :result => result,
           :message => @message,
           :confidence => CONFIDENCE[:high]
    end
  end
end`,
        heightPx: 300,
        showLineNumbers: true,
        features: ['Rails security', 'Ruby AST', 'Web application focus'],
        complexity: 'intermediate'
      },
      trivy: {
        editorLanguage: 'rego',
        placeholder: `package trivy.custom

import rego.v1

# Custom security policy for container/IaC scanning
deny[msg] {
    input.kind == "Deployment"
    container := input.spec.template.spec.containers[_]
    
    # Check for security issues
    not starts_with(container.image, "secure-registry/")
    
    msg := sprintf("Container image '%s' is not from trusted registry", [container.image])
}

# Check for privileged containers
deny[msg] {
    input.spec.template.spec.containers[_].securityContext.privileged == true
    msg := "Privileged containers are not allowed"
}`,
        heightPx: 350,
        showLineNumbers: true,
        features: ['OPA Rego', 'Container security', 'IaC scanning'],
        complexity: 'intermediate'
      },
      gitleaks: {
        editorLanguage: 'yaml',
        placeholder: `rules:
  - id: custom-api-key
    description: "Custom API key pattern"
    regex: '(?i)(api[_-]?key[_-]?[=:\\s]*["\\']?[a-zA-Z0-9]{20,}["\\']?)'
    keywords:
      - api
      - key
    secretGroup: 1
    entropy:
      min: 3.5
      max: 8.0
    tags:
      - key
      - api
    allowlist:
      description: "Ignore test keys"
      regexes:
        - "test[_-]?api[_-]?key"
        - "fake[_-]?api[_-]?key"`,
        heightPx: 350,
        showLineNumbers: true,
        features: ['Secret detection', 'Git repository scanning', 'Entropy analysis'],
        complexity: 'basic'
      },
    }
    
    return specs[tool] || specs.semgrep
  }, [tool])

  // Comprehensive rule examples for different languages and security vulnerabilities
  const getComprehensiveExamples = () => {
    return [
      // Python Examples
      {
        name: "SQL Injection Detection",
        language: "python",
        severity: "ERROR",
        description: "Detects potential SQL injection vulnerabilities in Python code",
        pattern: `rules:
  - id: python-sql-injection
    message: "Potential SQL injection vulnerability detected"
    languages: [python]
    severity: ERROR
    patterns:
      - pattern-either:
          - pattern: $CURSOR.execute($QUERY + $VAR)
          - pattern: $CURSOR.execute(f"...{$VAR}...")
          - pattern: $CURSOR.execute("..." + $VAR + "...")
          - pattern: $CURSOR.execute($QUERY % $VAR)
      - pattern-not: $CURSOR.execute("...", (...))`,
        useCase: "Prevent SQL injection attacks by detecting unsafe query construction"
      },
      {
        name: "Command Injection",
        language: "python",
        severity: "ERROR",
        description: "Detects command injection vulnerabilities using os.system and subprocess",
        pattern: `rules:
  - id: python-command-injection
    message: "Command injection vulnerability detected"
    languages: [python]
    severity: ERROR
    pattern-either:
      - pattern: os.system($CMD + $VAR)
      - pattern: subprocess.call($CMD + $VAR, ...)
      - pattern: subprocess.run($CMD + $VAR, ...)
      - pattern: os.popen($CMD + $VAR)`,
        useCase: "Prevent command injection by detecting unsafe command execution"
      },
      {
        name: "Hardcoded Secrets",
        language: "python",
        severity: "WARNING",
        description: "Detects hardcoded API keys and passwords in Python code",
        pattern: `rules:
  - id: python-hardcoded-secrets
    message: "Hardcoded secret detected"
    languages: [python]
    severity: WARNING
    pattern-either:
      - pattern: api_key = "..."
      - pattern: password = "..."
      - pattern: secret = "..."
      - pattern: token = "..."
    metavariable-regex:
      metavariable: $SECRET
      regex: "[a-zA-Z0-9]{20,}"`,
        useCase: "Prevent secrets leakage by detecting hardcoded credentials"
      },
      {
        name: "Unsafe Deserialization",
        language: "python",
        severity: "ERROR",
        description: "Detects unsafe pickle.loads() usage that can lead to RCE",
        pattern: `rules:
  - id: python-unsafe-pickle
    message: "Unsafe pickle deserialization detected"
    languages: [python]
    severity: ERROR
    pattern-either:
      - pattern: pickle.loads($DATA)
      - pattern: pickle.load($FILE)
      - pattern: cPickle.loads($DATA)
    pattern-not:
      - pattern: pickle.loads(base64.b64decode($SAFE_DATA))`,
        useCase: "Prevent RCE through unsafe pickle deserialization"
      },

      // JavaScript Examples
      {
        name: "XSS Prevention",
        language: "javascript",
        severity: "WARNING",
        description: "Detects potential XSS vulnerabilities in JavaScript",
        pattern: `rules:
  - id: javascript-xss
    message: "Potential XSS vulnerability detected"
    languages: [javascript, typescript]
    severity: WARNING
    pattern-either:
      - pattern: document.write($VAR)
      - pattern: $ELEM.innerHTML = $VAR
      - pattern: $ELEM.outerHTML = $VAR
      - pattern: eval($VAR)
    pattern-not:
      - pattern: $ELEM.innerHTML = DOMPurify.sanitize($VAR)`,
        useCase: "Prevent XSS attacks by detecting unsafe DOM manipulation"
      },
      {
        name: "Prototype Pollution",
        language: "javascript",
        severity: "ERROR",
        description: "Detects prototype pollution vulnerabilities in JavaScript",
        pattern: `rules:
  - id: javascript-prototype-pollution
    message: "Prototype pollution vulnerability detected"
    languages: [javascript, typescript]
    severity: ERROR
    pattern-either:
      - pattern: $OBJ["__proto__"] = $VAL
      - pattern: $OBJ.__proto__ = $VAL
      - pattern: $OBJ["constructor"]["prototype"] = $VAL
      - pattern: Object.setPrototypeOf($OBJ, $VAL)`,
        useCase: "Prevent prototype pollution attacks"
      },
      {
        name: "Insecure Random",
        language: "javascript",
        severity: "WARNING",
        description: "Detects usage of Math.random() for security purposes",
        pattern: `rules:
  - id: javascript-weak-random
    message: "Weak random number generation for security purposes"
    languages: [javascript, typescript]
    severity: WARNING
    patterns:
      - pattern: Math.random()
      - pattern-inside: |
          function $FUNC(...) {
            ...
            $TOKEN = ...
            ...
          }
    metavariable-regex:
      metavariable: $FUNC
      regex: "(token|key|password|secret|nonce)"`,
        useCase: "Ensure cryptographically secure random number generation"
      },
      {
        name: "Path Traversal",
        language: "javascript",
        severity: "ERROR",
        description: "Detects path traversal vulnerabilities in Node.js",
        pattern: `rules:
  - id: javascript-path-traversal
    message: "Path traversal vulnerability detected"
    languages: [javascript, typescript]
    severity: ERROR
    pattern-either:
      - pattern: fs.readFile($PATH + $USER_INPUT, ...)
      - pattern: fs.writeFile($PATH + $USER_INPUT, ...)
      - pattern: require($USER_INPUT)
      - pattern: import($USER_INPUT)
    pattern-not:
      - pattern: fs.readFile(path.join($SAFE_PATH, path.basename($USER_INPUT)), ...)`,
        useCase: "Prevent directory traversal attacks"
      },

      // Java Examples
      {
        name: "SQL Injection Java",
        language: "java",
        severity: "ERROR",
        description: "Detects SQL injection in Java JDBC code",
        pattern: `rules:
  - id: java-sql-injection
    message: "SQL injection vulnerability in Java"
    languages: [java]
    severity: ERROR
    pattern-either:
      - pattern: $STMT.executeQuery($QUERY + $VAR)
      - pattern: $STMT.execute($QUERY + $VAR)
      - pattern: $STMT.executeUpdate($QUERY + $VAR)
      - pattern: new Statement($QUERY + $VAR)
    pattern-not:
      - pattern: $STMT.executeQuery("SELECT * FROM users WHERE id = ?")`,
        useCase: "Prevent SQL injection in Java applications"
      },
      {
        name: "XXE Prevention",
        language: "java",
        severity: "ERROR",
        description: "Detects XML External Entity (XXE) vulnerabilities",
        pattern: `rules:
  - id: java-xxe-vulnerability
    message: "XXE vulnerability detected"
    languages: [java]
    severity: ERROR
    patterns:
      - pattern: $FACTORY.newDocumentBuilder()
      - pattern-not: |
          $FACTORY.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
          ...
          $FACTORY.newDocumentBuilder()`,
        useCase: "Prevent XXE attacks in XML parsing"
      },
      {
        name: "Insecure Deserialization Java",
        language: "java",
        severity: "ERROR",
        description: "Detects unsafe object deserialization in Java",
        pattern: `rules:
  - id: java-unsafe-deserialization
    message: "Unsafe deserialization detected"
    languages: [java]
    severity: ERROR
    pattern-either:
      - pattern: $OIS.readObject()
      - pattern: $OIS.readUnshared()
      - pattern: new ObjectInputStream($STREAM).readObject()
    pattern-not-inside: |
      class $CLASS extends ObjectInputStream {
        ...
        protected Class<?> resolveClass(...) { ... }
        ...
      }`,
        useCase: "Prevent RCE through unsafe deserialization"
      },

      // Go Examples
      {
        name: "Go SQL Injection",
        language: "go",
        severity: "ERROR",
        description: "Detects SQL injection vulnerabilities in Go",
        pattern: `rules:
  - id: go-sql-injection
    message: "SQL injection vulnerability in Go"
    languages: [go]
    severity: ERROR
    pattern-either:
      - pattern: $DB.Query($QUERY + $VAR)
      - pattern: $DB.Exec($QUERY + $VAR)
      - pattern: fmt.Sprintf($QUERY, $VAR)
    pattern-not:
      - pattern: $DB.Query("SELECT * FROM users WHERE id = $1", $ID)`,
        useCase: "Prevent SQL injection in Go applications"
      },
      {
        name: "Command Injection Go",
        language: "go",
        severity: "ERROR",
        description: "Detects command injection in Go exec calls",
        pattern: `rules:
  - id: go-command-injection
    message: "Command injection vulnerability in Go"
    languages: [go]
    severity: ERROR
    pattern-either:
      - pattern: exec.Command($CMD, $ARGS + $USER_INPUT)
      - pattern: exec.Command($CMD + $USER_INPUT)
      - pattern: os.system($CMD + $USER_INPUT)
    pattern-not:
      - pattern: exec.Command("ls", "-la", $SAFE_PATH)`,
        useCase: "Prevent command injection in Go"
      },

      // PHP Examples
      {
        name: "PHP SQL Injection",
        language: "php",
        severity: "ERROR",
        description: "Detects SQL injection vulnerabilities in PHP",
        pattern: `rules:
  - id: php-sql-injection
    message: "SQL injection vulnerability in PHP"
    languages: [php]
    severity: ERROR
    pattern-either:
      - pattern: mysql_query($QUERY . $VAR)
      - pattern: mysqli_query($CONN, $QUERY . $VAR)
      - pattern: $PDO->query($QUERY . $VAR)
      - pattern: $PDO->exec($QUERY . $VAR)
    pattern-not:
      - pattern: $PDO->prepare($QUERY)`,
        useCase: "Prevent SQL injection in PHP applications"
      },
      {
        name: "PHP Code Injection",
        language: "php",
        severity: "ERROR",
        description: "Detects code injection vulnerabilities in PHP",
        pattern: `rules:
  - id: php-code-injection
    message: "Code injection vulnerability detected"
    languages: [php]
    severity: ERROR
    pattern-either:
      - pattern: eval($USER_INPUT)
      - pattern: create_function($PARAMS, $USER_INPUT)
      - pattern: preg_replace($PATTERN, $USER_INPUT, $SUBJECT, -1, PREG_REPLACE_EVAL)
      - pattern: assert($USER_INPUT)`,
        useCase: "Prevent code injection attacks in PHP"
      },

      // C/C++ Examples
      {
        name: "Buffer Overflow C",
        language: "c",
        severity: "ERROR",
        description: "Detects potential buffer overflow vulnerabilities in C",
        pattern: `rules:
  - id: c-buffer-overflow
    message: "Potential buffer overflow detected"
    languages: [c, cpp]
    severity: ERROR
    pattern-either:
      - pattern: strcpy($DEST, $SRC)
      - pattern: strcat($DEST, $SRC)
      - pattern: sprintf($DEST, $FORMAT, ...)
      - pattern: gets($BUFFER)
    pattern-not:
      - pattern: strncpy($DEST, $SRC, sizeof($DEST) - 1)`,
        useCase: "Prevent buffer overflow vulnerabilities"
      },
      {
        name: "Format String C",
        language: "c",
        severity: "ERROR",
        description: "Detects format string vulnerabilities in C",
        pattern: `rules:
  - id: c-format-string
    message: "Format string vulnerability detected"
    languages: [c, cpp]
    severity: ERROR
    pattern-either:
      - pattern: printf($USER_INPUT)
      - pattern: fprintf($FILE, $USER_INPUT)
      - pattern: sprintf($BUFFER, $USER_INPUT)
      - pattern: snprintf($BUFFER, $SIZE, $USER_INPUT)
    pattern-not:
      - pattern: printf("%s", $USER_INPUT)`,
        useCase: "Prevent format string attacks"
      },

      // Rust Examples
      {
        name: "Unsafe Rust Code",
        language: "rust",
        severity: "WARNING",
        description: "Detects unsafe Rust code blocks that need review",
        pattern: `rules:
  - id: rust-unsafe-block
    message: "Unsafe Rust code detected - review required"
    languages: [rust]
    severity: WARNING
    pattern: |
      unsafe {
        ...
      }`,
        useCase: "Review unsafe Rust code for potential memory safety issues"
      },
      {
        name: "Rust Panic Handling",
        language: "rust",
        severity: "INFO",
        description: "Detects unwrap() calls that can cause panics",
        pattern: `rules:
  - id: rust-unwrap-usage
    message: "Consider using expect() or proper error handling instead of unwrap()"
    languages: [rust]
    severity: INFO
    pattern-either:
      - pattern: $EXPR.unwrap()
      - pattern: $EXPR.expect($MSG)
    pattern-not:
      - pattern-inside: |
          #[cfg(test)]
          mod tests {
            ...
          }`,
        useCase: "Improve error handling and prevent panics"
      },

      // Generic/Multi-language Examples
      {
        name: "Weak Cryptography",
        language: "any",
        severity: "WARNING",
        description: "Detects usage of weak cryptographic algorithms",
        pattern: `rules:
  - id: weak-crypto-algorithms
    message: "Weak cryptographic algorithm detected"
    languages: [python, javascript, java, go, php]
    severity: WARNING
    pattern-either:
      - pattern: MD5(...)
      - pattern: SHA1(...)
      - pattern: DES(...)
      - pattern: RC4(...)
    metavariable-regex:
      metavariable: $ALGO
      regex: "(md5|sha1|des|rc4)"`,
        useCase: "Ensure strong cryptographic algorithms are used"
      },
      {
        name: "Debug Code Detection",
        language: "any",
        severity: "INFO",
        description: "Detects debug code that shouldn't be in production",
        pattern: `rules:
  - id: debug-code-detection
    message: "Debug code detected - remove before production"
    languages: [python, javascript, java, go, php, c, cpp, rust]
    severity: INFO
    pattern-either:
      - pattern: console.log(...)
      - pattern: print(...)
      - pattern: System.out.println(...)
      - pattern: fmt.Println(...)
      - pattern: echo ...
      - pattern: printf(...)
      - pattern: println!(...)`,
        useCase: "Remove debug statements before production deployment"
      }
    ];
  };

  // Filter examples based on selected language
  const getFilteredExamples = () => {
    const allExamples = getComprehensiveExamples();
    
    if (!selectedLanguageFilter || selectedLanguageFilter === 'all') {
      return allExamples;
    }
    
    return allExamples.filter(example => 
      example.language === selectedLanguageFilter || example.language === 'any'
    );
  };

  // Get rule writing guide for specific tool
  const getRuleWritingGuide = (tool: SupportedTool) => {
    const guides = {
      semgrep: (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">Basic Rule Structure</h5>
            <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
{`rules:
  - id: my-rule-id
    message: "Description of the issue"
    languages: [python, javascript]
    severity: ERROR
    pattern: dangerous_function(...)`}
            </pre>
          </div>
          <div>
            <h5 className="font-medium mb-2">Pattern Types</h5>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><code>pattern</code> - Simple pattern matching</li>
              <li><code>patterns</code> - Combine multiple patterns with AND logic</li>
              <li><code>pattern-either</code> - Match any of multiple patterns (OR logic)</li>
              <li><code>pattern-not</code> - Exclude matches</li>
              <li><code>pattern-regex</code> - Use regular expressions</li>
              <li><code>pattern-inside</code> - Pattern must be inside another pattern</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Metavariables</h5>
            <p className="text-sm text-muted-foreground mb-2">Use <code>$VAR</code> to match any expression:</p>
            <pre className="bg-muted p-2 rounded text-xs font-mono">
{`pattern: eval($USER_INPUT)
pattern: $OBJ.innerHTML = $DATA`}
            </pre>
          </div>
        </div>
      ),
      bandit: (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">Python AST Analysis</h5>
            <p className="text-sm text-muted-foreground mb-2">Bandit analyzes Python Abstract Syntax Tree (AST) to find security issues.</p>
            <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
{`# Custom Bandit test
import ast
from bandit.core import test

@test.checks('Call')
def check_dangerous_call(context):
    if context.call_function_name == 'eval':
        return bandit.Issue(
            severity=bandit.HIGH,
            confidence=bandit.HIGH,
            text="Use of eval() detected."
        )`}
            </pre>
          </div>
          <div>
            <h5 className="font-medium mb-2">Node Types</h5>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><code>Call</code> - Function calls</li>
              <li><code>Import</code> - Import statements</li>
              <li><code>Assign</code> - Variable assignments</li>
              <li><code>Str</code> - String literals</li>
            </ul>
          </div>
        </div>
      ),
      'eslint-security': (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">ESLint Rule Structure</h5>
            <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
{`module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Detect XSS vulnerabilities",
      category: "Security"
    },
    schema: []
  },
  create: function(context) {
    return {
      "CallExpression": function(node) {
        if (node.callee.name === 'eval') {
          context.report({
            node: node,
            message: "eval() is dangerous"
          });
        }
      }
    };
  }
};`}
            </pre>
          </div>
        </div>
      ),
      gitleaks: (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">Secret Detection Rules</h5>
            <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
{`rules:
  - id: api-key-detection
    description: "API Key Detection"
    regex: 'api[_-]?key[_-]?[=:\\s]*["\\']?[a-zA-Z0-9]{20,}'
    keywords:
      - "api"
      - "key"
    secretGroup: 1
    entropy:
      min: 3.5
      max: 8.0
    allowlist:
      description: "Ignore test keys"
      regexes:
        - "test[_-]?api[_-]?key"`}
            </pre>
          </div>
          <div>
            <h5 className="font-medium mb-2">Key Components</h5>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><code>regex</code> - Regular expression pattern</li>
              <li><code>keywords</code> - Keywords to look for</li>
              <li><code>entropy</code> - Entropy analysis for randomness</li>
              <li><code>allowlist</code> - Patterns to ignore</li>
            </ul>
          </div>
        </div>
      ),
      trivy: (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">OPA Rego Policy</h5>
            <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
{`package trivy.kubernetes

import rego.v1

# Deny privileged containers
deny[msg] {
    input.kind == "Pod"
    container := input.spec.containers[_]
    container.securityContext.privileged == true
    msg := "Privileged containers are not allowed"
}

# Check for latest tag
warn[msg] {
    input.kind == "Deployment"
    container := input.spec.template.spec.containers[_]
    endswith(container.image, ":latest")
    msg := "Avoid using :latest tag"
}`}
            </pre>
          </div>
        </div>
      ),
      checkov: (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">Infrastructure as Code Checks</h5>
            <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
{`from checkov.common.models.enums import CheckResult
from checkov.terraform.checks.resource.base_resource_check import BaseResourceCheck

class CustomS3Check(BaseResourceCheck):
    def __init__(self):
        name = "S3 bucket should have encryption"
        id = "CKV_CUSTOM_1"
        supported_resources = ['aws_s3_bucket']
        categories = [CheckCategories.ENCRYPTION]
        super().__init__(name=name, id=id, 
                        categories=categories, 
                        supported_resources=supported_resources)
    
    def scan_resource_conf(self, conf):
        if 'server_side_encryption_configuration' in conf:
            return CheckResult.PASSED
        return CheckResult.FAILED`}
            </pre>
          </div>
        </div>
      )
    };
    
    return (tool in guides ? guides[tool as keyof typeof guides] : null) || (
      <div className="text-sm text-muted-foreground">
        <p>Documentation for {tool} is coming soon. Please refer to the official documentation in the External Resources section.</p>
      </div>
    );
  };

  // Get best practices for specific tool
  const getBestPractices = (tool: SupportedTool) => {
    const practices = {
      semgrep: (
        <div className="space-y-3">
          <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded">
            <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">✅ Do's</h5>
            <ul className="text-sm space-y-1 list-disc list-inside text-green-700 dark:text-green-400">
              <li>Use specific patterns rather than overly broad ones</li>
              <li>Include pattern-not to reduce false positives</li>
              <li>Test patterns with sample code before deploying</li>
              <li>Use metavariable-regex for complex string matching</li>
              <li>Specify languages explicitly for better performance</li>
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded">
            <h5 className="font-medium text-red-800 dark:text-red-300 mb-2">❌ Don'ts</h5>
            <ul className="text-sm space-y-1 list-disc list-inside text-red-700 dark:text-red-400">
              <li>Don't create patterns that match too broadly</li>
              <li>Avoid complex nested patterns that are hard to understand</li>
              <li>Don't forget to handle edge cases with pattern-not</li>
              <li>Avoid patterns that cause performance issues</li>
            </ul>
          </div>
        </div>
      ),
      bandit: (
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded">
            <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">🔍 Focus Areas</h5>
            <ul className="text-sm space-y-1 list-disc list-inside text-blue-700 dark:text-blue-400">
              <li>Identify high-severity security issues</li>
              <li>Focus on common Python security anti-patterns</li>
              <li>Check for hardcoded secrets and passwords</li>
              <li>Validate input sanitization patterns</li>
              <li>Review cryptographic implementations</li>
            </ul>
          </div>
        </div>
      ),
      gitleaks: (
        <div className="space-y-3">
          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded">
            <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">🔐 Secret Detection Tips</h5>
            <ul className="text-sm space-y-1 list-disc list-inside text-yellow-700 dark:text-yellow-400">
              <li>Use entropy analysis to catch randomly generated secrets</li>
              <li>Include keywords to improve detection accuracy</li>
              <li>Set appropriate allowlist patterns for test data</li>
              <li>Balance sensitivity vs false positive rate</li>
              <li>Regularly update patterns for new secret formats</li>
            </ul>
          </div>
        </div>
      )
    };
    
    return (tool in practices ? practices[tool as keyof typeof practices] : null) || (
      <div className="bg-gray-50 dark:bg-gray-950/30 p-3 rounded">
        <h5 className="font-medium mb-2">General Security Rule Best Practices</h5>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Write clear, descriptive rule messages</li>
          <li>Test rules thoroughly before deployment</li>
          <li>Document the security impact and remediation</li>
          <li>Consider performance impact of complex patterns</li>
          <li>Keep rules updated with latest security trends</li>
        </ul>
      </div>
    );
  };

  // Get common patterns for specific tool
  const getCommonPatterns = (tool: SupportedTool) => {
    const patterns = {
      semgrep: (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">Function Call Detection</h5>
            <pre className="bg-muted p-2 rounded text-xs font-mono">
{`pattern: dangerous_function($ARG)
pattern: $OBJ.method($ARG1, $ARG2)`}
            </pre>
          </div>
          <div>
            <h5 className="font-medium mb-2">String Concatenation</h5>
            <pre className="bg-muted p-2 rounded text-xs font-mono">
{`pattern: $QUERY + $USER_INPUT
pattern: f"SELECT * FROM {$TABLE}"`}
            </pre>
          </div>
          <div>
            <h5 className="font-medium mb-2">Assignment Patterns</h5>
            <pre className="bg-muted p-2 rounded text-xs font-mono">
{`pattern: $VAR = "hardcoded_secret"
pattern: password = $VALUE`}
            </pre>
          </div>
        </div>
      ),
      gitleaks: (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">API Key Patterns</h5>
            <pre className="bg-muted p-2 rounded text-xs font-mono">
{`regex: 'api[_-]?key[_-]?[=:\\s]*["\\']?[a-zA-Z0-9]{20,}'
regex: 'AKIA[0-9A-Z]{16}'  # AWS Access Key`}
            </pre>
          </div>
          <div>
            <h5 className="font-medium mb-2">Token Patterns</h5>
            <pre className="bg-muted p-2 rounded text-xs font-mono">
{`regex: 'github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}'
regex: 'xox[baprs]-[0-9a-zA-Z]{10,48}'  # Slack Token`}
            </pre>
          </div>
        </div>
      ),
      trivy: (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">Container Security</h5>
            <pre className="bg-muted p-2 rounded text-xs font-mono">
{`deny[msg] {
    input.spec.containers[_].securityContext.runAsRoot == true
    msg := "Container should not run as root"
}`}
            </pre>
          </div>
          <div>
            <h5 className="font-medium mb-2">Resource Limits</h5>
            <pre className="bg-muted p-2 rounded text-xs font-mono">
{`deny[msg] {
    container := input.spec.containers[_]
    not container.resources.limits
    msg := "Container must have resource limits"
}`}
            </pre>
          </div>
        </div>
      )
    };
    
    return (tool in patterns ? patterns[tool as keyof typeof patterns] : null) || (
      <div className="text-sm text-muted-foreground">
        <p>Common patterns for {tool} will be added soon. Check the Examples tab for practical patterns.</p>
      </div>
    );
  };

  // Get troubleshooting guide
  const getTroubleshootingGuide = (tool: SupportedTool) => {
    const guides = {
      semgrep: (
        <div className="space-y-3">
          <div>
            <h5 className="font-medium mb-2">Common Issues</h5>
            <div className="space-y-2">
              <div className="border-l-4 border-l-red-500 pl-3">
                <p className="text-sm font-medium">Pattern not matching expected code</p>
                <p className="text-xs text-muted-foreground">Solution: Check whitespace, syntax, and metavariable usage</p>
              </div>
              <div className="border-l-4 border-l-yellow-500 pl-3">
                <p className="text-sm font-medium">Too many false positives</p>
                <p className="text-xs text-muted-foreground">Solution: Add pattern-not conditions or make patterns more specific</p>
              </div>
              <div className="border-l-4 border-l-blue-500 pl-3">
                <p className="text-sm font-medium">YAML syntax errors</p>
                <p className="text-xs text-muted-foreground">Solution: Validate YAML syntax and check indentation</p>
              </div>
            </div>
          </div>
        </div>
      ),
      gitleaks: (
        <div className="space-y-3">
          <div>
            <h5 className="font-medium mb-2">Common Issues</h5>
            <div className="space-y-2">
              <div className="border-l-4 border-l-red-500 pl-3">
                <p className="text-sm font-medium">Regex not matching secrets</p>
                <p className="text-xs text-muted-foreground">Solution: Test regex patterns with online tools, escape special characters</p>
              </div>
              <div className="border-l-4 border-l-yellow-500 pl-3">
                <p className="text-sm font-medium">High false positive rate</p>
                <p className="text-xs text-muted-foreground">Solution: Adjust entropy thresholds and improve allowlist patterns</p>
              </div>
            </div>
          </div>
        </div>
      )
    };
    
    return (tool in guides ? guides[tool as keyof typeof guides] : null) || (
      <div className="space-y-2">
        <div className="border-l-4 border-l-gray-500 pl-3">
          <p className="text-sm font-medium">Rule validation failed</p>
          <p className="text-xs text-muted-foreground">Solution: Check syntax, required fields, and pattern format</p>
        </div>
        <div className="border-l-4 border-l-gray-500 pl-3">
          <p className="text-sm font-medium">Performance issues</p>
          <p className="text-xs text-muted-foreground">Solution: Optimize patterns, avoid overly complex regex</p>
        </div>
      </div>
    );
  };

  // Get additional resources
  const getAdditionalResources = (tool: SupportedTool) => {
    const resources = {
      semgrep: [
        { title: "Semgrep Rule Writing Guide", url: "https://semgrep.dev/docs/writing-rules/overview/" },
        { title: "Semgrep Pattern Examples", url: "https://semgrep.dev/docs/writing-rules/pattern-examples/" },
        { title: "Semgrep Community Rules", url: "https://semgrep.dev/explore" },
        { title: "Metavariable Documentation", url: "https://semgrep.dev/docs/writing-rules/pattern-syntax/" }
      ],
      bandit: [
        { title: "Bandit Documentation", url: "https://bandit.readthedocs.io/" },
        { title: "Writing Custom Bandit Tests", url: "https://bandit.readthedocs.io/en/latest/plugins/" },
        { title: "Python Security Best Practices", url: "https://python.org/dev/security/" }
      ],
      'eslint-security': [
        { title: "ESLint Rule Development", url: "https://eslint.org/docs/developer-guide/working-with-rules" },
        { title: "JavaScript Security Patterns", url: "https://github.com/nodesecurity/eslint-plugin-security" }
      ],
      gitleaks: [
        { title: "GitLeaks Configuration", url: "https://github.com/gitleaks/gitleaks" },
        { title: "Secret Detection Patterns", url: "https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml" }
      ],
      trivy: [
        { title: "Trivy Custom Policies", url: "https://aquasecurity.github.io/trivy/latest/docs/scanner/misconfiguration/custom/" },
        { title: "OPA Rego Language", url: "https://www.openpolicyagent.org/docs/latest/policy-language/" }
      ],
      checkov: [
        { title: "Checkov Custom Checks", url: "https://www.checkov.io/3.Custom%20Policies/Custom%20Policies%20Overview.html" },
        { title: "Infrastructure Security Patterns", url: "https://www.checkov.io/1.Introduction/Getting%20Started.html" }
      ]
    };
    
    return (tool in resources ? resources[tool as keyof typeof resources] : null) || [
      { title: "OWASP Secure Coding Practices", url: "https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/" },
      { title: "CWE Security Weaknesses", url: "https://cwe.mitre.org/" }
    ];
  };

  // Validate pattern with smart debouncing and conditions
  useEffect(() => {
    // Clear validation if empty
    if (!value.trim()) {
      setValidationResult(null)
      onValidationChange?.(null as any)
      return
    }

    // Only validate if pattern is substantial enough (at least 50 characters for meaningful validation)
    if (value.trim().length < 50) {
      return
    }

    // Don't validate incomplete YAML/code blocks
    if (tool === 'semgrep' && value.includes('rules:') && !value.includes('pattern')) {
      return
    }

    // Skip validation if content hasn't changed significantly
    if (lastValidatedContent === value.trim()) {
      return
    }

    const validatePattern = async () => {
      setIsValidating(true)
      try {
        const result = await rulesAPI.validateRule({
          pattern: value,
          tool,
          language,
          rule_name: ruleName || "Validation Rule",
          message: ruleMessage || "Validation message",
          severity
        })
        setValidationResult(result)
        onValidationChange?.(result)
        setLastValidatedContent(value.trim()) // Cache the validated content
      } catch (error: any) {
        const errorResult: RuleValidationResult = {
          is_valid: false,
          errors: [error.message || 'Validation failed'],
          warnings: [],
          suggestions: [],
          validation_timestamp: new Date().toISOString()
        }
        setValidationResult(errorResult)
        onValidationChange?.(errorResult)
      } finally {
        setIsValidating(false)
      }
    }

    // Increased debounce delay for better UX
    const timer = setTimeout(validatePattern, 2000)
    return () => clearTimeout(timer)
  }, [value, tool, language, onValidationChange])


  const handleInsertExample = (examplePattern: string) => {
    onChange(examplePattern)
    setActiveTab('editor')
    toast({
      title: "Example inserted",
      description: "The example pattern has been added to your rule.",
    })
  }

  // Manual validation function
  const handleManualValidation = async () => {
    if (!value.trim()) {
      toast({
        title: "No pattern to validate",
        description: "Please enter a pattern first.",
        variant: "destructive"
      })
      return
    }

    setIsValidating(true)
    try {
      const result = await rulesAPI.validateRule({
        pattern: value,
        tool,
        language,
        rule_name: ruleName || "Validation Rule",
        message: ruleMessage || "Validation message",
        severity
      })
      setValidationResult(result)
      onValidationChange?.(result)
      setLastValidatedContent(value.trim())
      
      toast({
        title: result.is_valid ? "Validation passed!" : "Validation failed",
        description: result.is_valid 
          ? "Your rule pattern is valid."
          : `Found ${result.errors.length} error(s) and ${result.warnings.length} warning(s).`,
        variant: result.is_valid ? "default" : "destructive"
      })
    } catch (error: any) {
      const errorResult: RuleValidationResult = {
        is_valid: false,
        errors: [error.message || 'Validation failed'],
        warnings: [],
        suggestions: [],
        validation_timestamp: new Date().toISOString()
      }
      setValidationResult(errorResult)
      onValidationChange?.(errorResult)
      
      toast({
        title: "Validation error",
        description: error.message || 'Failed to validate pattern',
        variant: "destructive"
      })
    } finally {
      setIsValidating(false)
    }
  }

  const getValidationIcon = () => {
    if (isValidating) {
      return <Sparkles className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (!validationResult) {
      return <Code2 className="h-4 w-4 text-gray-400" />
    }
    if (validationResult.is_valid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <AlertCircle className="h-4 w-4 text-red-500" />
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // Note: All helper functions for the docs tab are defined after the component render
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tool Support Warning */}
      {!isToolSupported && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-300">
            <strong>Limited Support:</strong> {tool} has experimental custom rule support. 
            Some features may not work as expected. Consider using <strong>semgrep</strong> or <strong>bandit</strong> for full functionality.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tool Information Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getValidationIcon()}
              <div>
                <CardTitle className="text-lg">{toolInfo?.name || tool}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {toolInfo?.description}
                  <Badge variant="outline" className={getComplexityColor(toolSpecs.complexity)}>
                    {toolSpecs.complexity}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {toolInfo?.sandbox_supported && (
                <Badge variant="outline" className="gap-1">
                  <Terminal className="h-3 w-3" />
                  Sandbox
                </Badge>
              )}
              <Badge variant="outline">
                {toolSpecs.editorLanguage.toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualValidation}
                disabled={isValidating || !value.trim()}
                className="gap-1"
              >
                {isValidating ? (
                  <Sparkles className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle className="h-3 w-3" />
                )}
                Validate
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Language Selection */}
      {toolInfo?.supported_languages && toolInfo.supported_languages.length > 0 && onLanguageChange && (
        <div className="space-y-2">
          <Label>Target Language</Label>
          <Select 
            value={language || 'any'} 
            onValueChange={(value) => onLanguageChange(value === 'any' ? undefined : value as RuleLanguage)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Language</SelectItem>
              {toolInfo.supported_languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor" className="gap-2">
            <FileCode className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="examples" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Examples
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        {/* Pattern Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          <RuleEditor
            value={value}
            onChange={onChange}
            language={toolSpecs.editorLanguage}
            height={`${toolSpecs.heightPx}px`}
            placeholder={toolSpecs.placeholder}
            showLineNumbers={toolSpecs.showLineNumbers}
          />

          {/* Tool Features */}
          <div className="flex flex-wrap gap-2">
            {toolSpecs.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-2">
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.warnings.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <strong>Warnings:</strong>
                      {validationResult.warnings.map((warning, index) => (
                        <div key={index}>• {warning}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <strong>Suggestions:</strong>
                      {validationResult.suggestions.map((suggestion, index) => (
                        <div key={index}>• {suggestion}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.is_valid && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Pattern validation passed</span>
                  {validationResult.complexity_score && (
                    <Badge variant="outline">
                      Complexity: {validationResult.complexity_score}/10
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-4">
          {getComprehensiveExamples().length > 0 ? (
            <div className="space-y-4">
              {/* Language Filter */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={!selectedLanguageFilter || selectedLanguageFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedLanguageFilter('all')}
                >
                  All Languages
                </Badge>
                {['python', 'javascript', 'java', 'go', 'php', 'c', 'rust'].map(lang => (
                  <Badge 
                    key={lang}
                    variant={selectedLanguageFilter === lang ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedLanguageFilter(lang)}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </Badge>
                ))}
              </div>

              {/* Examples Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-96 overflow-y-auto overflow-x-hidden">
                {getFilteredExamples().map((example, index) => (
                  <Card key={index} className="p-3 border hover:border-blue-300 transition-colors cursor-pointer min-w-0">
                    <div className="space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate flex-1 mr-2">{example.name}</h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {example.language}
                          </Badge>
                          <Badge variant={
                            example.severity === 'ERROR' ? 'destructive' : 
                            example.severity === 'WARNING' ? 'default' : 'secondary'
                          } className="text-xs whitespace-nowrap">
                            {example.severity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{example.description}</p>
                      <div className="relative">
                        <pre className="text-xs bg-muted p-2 rounded break-all whitespace-pre-wrap font-mono leading-tight overflow-hidden max-h-32 overflow-y-auto">
                          {example.pattern}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-1 right-1 h-6 px-2 text-xs"
                          onClick={() => handleInsertExample(example.pattern)}
                        >
                          Use This
                        </Button>
                      </div>
                      {example.useCase && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-1 rounded break-words">
                          <strong>Use Case:</strong> {example.useCase}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Tool-specific examples if available */}
              {toolInfo?.examples && toolInfo.examples.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {toolInfo.name} Specific Examples
                  </h3>
                  <div className="grid gap-3">
                    {toolInfo.examples.map((example, index) => (
                      <Card key={`tool-${index}`} className="p-3 border hover:border-blue-300 transition-colors cursor-pointer min-w-0">
                        <div className="space-y-2 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate flex-1 mr-2">{example.name}</h4>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {example.language && (
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                  {example.language}
                                </Badge>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleInsertExample(example.pattern)}
                              >
                                Use This
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{example.description}</p>
                          <pre className="text-xs bg-muted p-2 rounded break-all whitespace-pre-wrap font-mono leading-tight overflow-hidden max-h-32 overflow-y-auto">
                            {example.pattern.substring(0, 300)}
                            {example.pattern.length > 300 && <span className="text-muted-foreground">...</span>}
                          </pre>
                          {example.use_case && (
                            <div className="text-xs text-green-600 bg-green-50 p-1 rounded break-words">
                              <strong>Use Case:</strong> {example.use_case}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Code2 className="h-8 w-8 mx-auto mb-4" />
              <p>No examples available for this tool</p>
            </div>
          )}
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          {/* Tool Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {toolInfo?.name || tool} Documentation
              </CardTitle>
              <CardDescription>
                Comprehensive guide for creating security rules with {toolInfo?.name || tool}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Reference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Quick Reference
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rule Format:</span>
                      <Badge variant="outline">{toolInfo?.rule_format || toolSpecs.editorLanguage.toUpperCase()}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Complexity:</span>
                      <Badge variant="outline" className={getComplexityColor(toolSpecs.complexity)}>
                        {toolSpecs.complexity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Pattern Size:</span>
                      <span className="text-sm">{toolInfo?.max_pattern_length || '10KB'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sandbox Support:</span>
                      <span className="text-sm">{toolInfo?.sandbox_supported ? '✅ Yes' : '❌ No'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Supported Languages
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {toolInfo?.supported_languages?.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </Badge>
                    )) || <span className="text-muted-foreground text-sm">All languages</span>}
                  </div>
                </div>
              </div>

              {/* Tool Features */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Key Features & Capabilities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {toolSpecs.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Writing Rules Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Writing {toolInfo?.name || tool} Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typeof getRuleWritingGuide === 'function' ? getRuleWritingGuide(tool) : (
                <div className="text-sm text-muted-foreground">
                  Documentation for {tool} is being loaded...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Best Practices & Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeof getBestPractices === 'function' ? getBestPractices(tool) : (
                <div className="text-sm text-muted-foreground">
                  Best practices for {tool} are being loaded...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Common Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Common Patterns & Syntax
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeof getCommonPatterns === 'function' ? getCommonPatterns(tool) : (
                <div className="text-sm text-muted-foreground">
                  Common patterns for {tool} are being loaded...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Troubleshooting & Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeof getTroubleshootingGuide === 'function' ? getTroubleshootingGuide(tool) : (
                <div className="text-sm text-muted-foreground">
                  Troubleshooting guide for {tool} is being loaded...
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                External Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {toolInfo?.documentation_url && (
                <div>
                  <h4 className="font-semibold mb-2">Official Documentation</h4>
                  <a 
                    href={toolInfo.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                  >
                    <BookOpen className="h-3 w-3" />
                    {toolInfo.documentation_url}
                  </a>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold mb-2">Additional Resources</h4>
                <div className="space-y-1 text-sm">
                  {(typeof getAdditionalResources === 'function' ? getAdditionalResources(tool) : []).map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline block"
                    >
                      • {resource.title}
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}