import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { 
  Play,
  TestTube2,
  Code2,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Save,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'

import { rulesAPI } from '@/lib/api/rules'
import type { 
  SupportedToolInfo,
  SupportedTool,
  RuleLanguage,
  CustomRule,
  RuleTestRequest,
  RuleTestResult
} from '@/types/rules'

import { RuleEditor, SimpleCodeEditor } from './RuleEditor'

interface RuleTestingInterfaceProps {
  supportedTools: SupportedToolInfo[]
  myRules: CustomRule[]
}

export function RuleTestingInterface({ supportedTools, myRules }: RuleTestingInterfaceProps) {
  const { toast } = useToast()
  
  // State for rule testing
  const [selectedTool, setSelectedTool] = useState<SupportedTool>('semgrep')
  const [selectedLanguage, setSelectedLanguage] = useState<RuleLanguage | undefined>(undefined)
  const [rulePattern, setRulePattern] = useState('')
  const [testCode, setTestCode] = useState('')
  const [testResult, setTestResult] = useState<RuleTestResult | null>(null)
  
  // State for batch testing
  const [batchTestRules, setBatchTestRules] = useState<CustomRule[]>([])
  const [batchTestResult, setBatchTestResult] = useState<any>(null)
  
  // Get current tool info
  const currentTool = Array.isArray(supportedTools) ? 
    supportedTools.find(tool => tool.tool === selectedTool) : 
    undefined
  
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
      toast({
        title: "Error testing rule",
        description: error.message || "Failed to test the rule.",
        variant: "destructive",
      })
    }
  })

  // Batch test mutation
  const batchTestMutation = useMutation({
    mutationFn: ({ rules, code }: { rules: any[], code: string }) => 
      rulesAPI.batchTestRulesLegacy(rules, code),
    onSuccess: (result) => {
      setBatchTestResult(result)
      toast({
        title: "Batch test completed",
        description: `Tested ${result.total_rules || result.results?.length || 0} rules against your code`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error batch testing",
        description: error.message || "Failed to test rules.",
        variant: "destructive",
      })
    }
  })

  const handleTestRule = () => {
    if (!rulePattern.trim() || !testCode.trim()) {
      toast({
        title: "Missing data",
        description: "Both rule pattern and test code are required.",
        variant: "destructive",
      })
      return
    }

    testRuleMutation.mutate({
      rule_pattern: rulePattern,
      tool: selectedTool,
      language: selectedLanguage,
      test_code: testCode
    })
  }

  const handleBatchTest = () => {
    if (batchTestRules.length === 0 || !testCode.trim()) {
      toast({
        title: "Missing data",
        description: "Select rules and provide test code for batch testing.",
        variant: "destructive",
      })
      return
    }

    const testRules = batchTestRules.map(rule => ({
      rule_id: rule.id,
      pattern: rule.pattern,
      tool: rule.tool,
      language: rule.language
    }))

    batchTestMutation.mutate({ rules: testRules, code: testCode })
  }


  const handleClearTest = () => {
    setRulePattern('')
    setTestCode('')
    setTestResult(null)
    setSelectedTool('semgrep')
    setSelectedLanguage(undefined)
  }

  const getExampleCode = (language: string) => {
    const examples = {
      python: `# Vulnerable Python Application - E-commerce Backend
import os
import sqlite3
import subprocess
from flask import Flask, request, jsonify

app = Flask(__name__)

# ❌ VULNERABILITY 1: Hardcoded API Keys and Secrets
API_KEY = "sk-1234567890abcdefghijklmnopqrstuvwxyz"
SECRET_KEY = "super-secret-password-123"
DATABASE_PASSWORD = "admin123"

# ❌ VULNERABILITY 2: SQL Injection via String Formatting
def get_user_by_id(user_id):
    """Fetch user by ID - VULNERABLE to SQL injection"""
    conn = sqlite3.connect('ecommerce.db')
    cursor = conn.cursor()
    
    # String formatting SQL injection
    query = f"SELECT * FROM users WHERE id = {user_id}"
    result = cursor.execute(query).fetchone()
    
    conn.close()
    return result

def search_products(search_term, category):
    """Search products - VULNERABLE to SQL injection"""
    conn = sqlite3.connect('ecommerce.db')
    cursor = conn.cursor()
    
    # String concatenation SQL injection
    query = "SELECT * FROM products WHERE name LIKE '%" + search_term + "%'"
    query += " AND category = '" + category + "'"
    
    results = cursor.execute(query).fetchall()
    conn.close()
    return results

# ❌ VULNERABILITY 3: Command Injection
def backup_user_data(username):
    """Backup user data - VULNERABLE to command injection"""
    backup_path = f"/backups/{username}"
    
    # Command injection via os.system
    os.system(f"mkdir -p {backup_path}")
    os.system(f"cp /data/{username}/* {backup_path}/")
    
    return f"Backup completed for {username}"

def convert_file(filename, output_format):
    """File conversion - VULNERABLE to command injection"""
    # Command injection via subprocess
    cmd = f"convert {filename} output.{output_format}"
    subprocess.call(cmd, shell=True)

# ❌ VULNERABILITY 4: Path Traversal
def read_user_file(user_id, filename):
    """Read user file - VULNERABLE to path traversal"""
    file_path = f"/uploads/{user_id}/{filename}"
    
    with open(file_path, 'r') as f:
        return f.read()

# ❌ VULNERABILITY 5: Insecure Deserialization
import pickle

def load_user_session(session_data):
    """Load user session - VULNERABLE to insecure deserialization"""
    return pickle.loads(session_data)

# Flask Routes with vulnerabilities
@app.route('/api/users/<user_id>')
def api_get_user(user_id):
    """API endpoint - VULNERABLE"""
    user = get_user_by_id(user_id)
    return jsonify(user)

@app.route('/api/search')
def api_search():
    """Search API - VULNERABLE"""
    term = request.args.get('q')
    cat = request.args.get('category', 'all')
    
    products = search_products(term, cat)
    return jsonify(products)

if __name__ == '__main__':
    app.run(debug=True)  # ❌ Debug mode in production`,
      
      javascript: `// Vulnerable Node.js E-commerce API
const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ❌ VULNERABILITY 1: Hardcoded Secrets and API Keys
const JWT_SECRET = "super-secret-jwt-key-123";
const API_KEY = "ak_1234567890abcdefghijklmnopqrstuvwxyz";
const DATABASE_PASSWORD = "root123";
const STRIPE_SECRET = "sk_test_1234567890abcdefghijklmnopqrstuvwxyz";

// Database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: DATABASE_PASSWORD,  // ❌ Hardcoded password
    database: 'ecommerce'
});

// ❌ VULNERABILITY 2: SQL Injection via Template Literals
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    
    // Template literal SQL injection
    const query = \`SELECT * FROM users WHERE id = \${userId}\`;
    
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/api/products/search', (req, res) => {
    const searchTerm = req.query.q;
    const category = req.query.category;
    
    // String concatenation SQL injection
    const query = "SELECT * FROM products WHERE name LIKE '%" + searchTerm + "%'" +
                  " AND category = '" + category + "'";
    
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// ❌ VULNERABILITY 3: Cross-Site Scripting (XSS)
app.get('/search', (req, res) => {
    const searchQuery = req.query.q;
    
    // Reflected XSS vulnerability
    const html = \`
        <html>
            <head><title>Search Results</title></head>
            <body>
                <h1>Search Results for: \${searchQuery}</h1>
                <p>You searched for: \${searchQuery}</p>
            </body>
        </html>
    \`;
    
    res.send(html);  // Directly inserting user input
});

// ❌ VULNERABILITY 4: Command Injection
app.post('/api/backup', (req, res) => {
    const filename = req.body.filename;
    const userId = req.body.userId;
    
    // Command injection via exec
    const command = \`tar -czf /backups/\${userId}_\${filename}.tar.gz /data/\${userId}/\`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.json({ message: 'Backup created successfully' });
    });
});

app.post('/api/convert', (req, res) => {
    const inputFile = req.body.input;
    const outputFormat = req.body.format;
    
    // Command injection via template literal
    exec(\`convert \${inputFile} output.\${outputFormat}\`, (err, stdout) => {
        res.json({ status: 'converted' });
    });
});

// ❌ VULNERABILITY 5: Path Traversal
app.get('/api/files/:userId/:filename', (req, res) => {
    const userId = req.params.userId;
    const filename = req.params.filename;
    
    // Path traversal vulnerability
    const filePath = \`./uploads/\${userId}/\${filename}\`;
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
            return;
        }
        res.send(data);
    });
});

// ❌ VULNERABILITY 6: Insecure Direct Object Reference
app.get('/api/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    
    // No authorization check - any user can access any order
    const query = \`SELECT * FROM orders WHERE id = \${orderId}\`;
    
    connection.query(query, (err, results) => {
        res.json(results[0]);
    });
});

// ❌ VULNERABILITY 7: Weak Cryptography
function hashPassword(password) {
    // Using weak MD5 hashing
    return crypto.createHash('md5').update(password).digest('hex');
}

// ❌ VULNERABILITY 8: Information Disclosure
app.get('/api/debug', (req, res) => {
    res.json({
        environment: process.env,  // Exposing environment variables
        config: {
            jwt_secret: JWT_SECRET,
            api_key: API_KEY,
            db_password: DATABASE_PASSWORD
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
    console.log(\`API Key: \${API_KEY}\`);  // ❌ Logging sensitive data
});`,

      java: `// Vulnerable Java Spring Boot E-commerce Application
package com.example.ecommerce;

import java.sql.*;
import java.io.*;
import java.security.MessageDigest;
import javax.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
public class VulnerableEcommerceController {
    
    // ❌ VULNERABILITY 1: Hardcoded Credentials and API Keys
    private static final String DB_PASSWORD = "admin123";
    private static final String JWT_SECRET = "super-secret-jwt-key-123";
    private static final String API_KEY = "ak_1234567890abcdefghijklmnopqrstuvwxyz";
    private static final String STRIPE_SECRET = "sk_live_1234567890abcdefghijklmnopqr";
    
    private JdbcTemplate jdbcTemplate;
    
    // ❌ VULNERABILITY 2: SQL Injection via String Concatenation
    @GetMapping("/api/users/{userId}")
    public ResponseEntity<User> getUser(@PathVariable String userId) {
        try {
            Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/ecommerce", 
                "root", 
                DB_PASSWORD  // ❌ Hardcoded password
            );
            
            // String concatenation SQL injection
            String query = "SELECT * FROM users WHERE id = " + userId;
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(query);
            
            // Process results...
            return ResponseEntity.ok(user);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
    
    @GetMapping("/api/products/search")
    public List<Product> searchProducts(@RequestParam String searchTerm, 
                                       @RequestParam String category) {
        // SQL injection via string formatting
        String query = String.format(
            "SELECT * FROM products WHERE name LIKE '%%%s%%' AND category = '%s'",
            searchTerm, category
        );
        
        return jdbcTemplate.query(query, new ProductRowMapper());
    }
    
    // ❌ VULNERABILITY 3: Command Injection
    @PostMapping("/api/backup")
    public ResponseEntity<String> createBackup(@RequestParam String filename, 
                                              @RequestParam String userId) {
        try {
            // Command injection via Runtime.exec
            String command = String.format("tar -czf /backups/%s_%s.tar.gz /data/%s/", 
                                         userId, filename, userId);
            
            Process process = Runtime.getRuntime().exec(command);
            process.waitFor();
            
            return ResponseEntity.ok("Backup created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Backup failed");
        }
    }
    
    @PostMapping("/api/convert")
    public ResponseEntity<String> convertFile(@RequestParam String inputFile, 
                                             @RequestParam String outputFormat) {
        try {
            // Command injection via ProcessBuilder
            ProcessBuilder pb = new ProcessBuilder(
                "convert", inputFile, "output." + outputFormat
            );
            Process process = pb.start();
            
            return ResponseEntity.ok("File converted");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Conversion failed");
        }
    }
    
    // ❌ VULNERABILITY 4: Path Traversal
    @GetMapping("/api/files/{userId}/{filename}")
    public ResponseEntity<String> getUserFile(@PathVariable String userId, 
                                             @PathVariable String filename) {
        try {
            // Path traversal vulnerability
            String filePath = String.format("./uploads/%s/%s", userId, filename);
            
            BufferedReader reader = new BufferedReader(new FileReader(filePath));
            StringBuilder content = new StringBuilder();
            String line;
            
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\\n");
            }
            reader.close();
            
            return ResponseEntity.ok(content.toString());
        } catch (IOException e) {
            return ResponseEntity.status(404).body("File not found");
        }
    }
    
    // ❌ VULNERABILITY 5: Insecure Deserialization
    @PostMapping("/api/session")
    public ResponseEntity<String> loadSession(@RequestBody byte[] sessionData) {
        try {
            // Insecure deserialization
            ByteArrayInputStream bis = new ByteArrayInputStream(sessionData);
            ObjectInputStream ois = new ObjectInputStream(bis);
            Object session = ois.readObject();  // ❌ Dangerous deserialization
            
            return ResponseEntity.ok("Session loaded");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Invalid session data");
        }
    }
    
    // ❌ VULNERABILITY 6: Weak Cryptography
    public String hashPassword(String password) {
        try {
            // Using weak MD5 hashing
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(password.getBytes());
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    // ❌ VULNERABILITY 7: Information Disclosure
    @GetMapping("/api/debug")
    public ResponseEntity<Map<String, Object>> getDebugInfo() {
        Map<String, Object> debugInfo = new HashMap<>();
        
        // Exposing sensitive configuration
        debugInfo.put("db_password", DB_PASSWORD);
        debugInfo.put("jwt_secret", JWT_SECRET);
        debugInfo.put("api_key", API_KEY);
        debugInfo.put("stripe_secret", STRIPE_SECRET);
        debugInfo.put("system_properties", System.getProperties());
        debugInfo.put("environment", System.getenv());
        
        return ResponseEntity.ok(debugInfo);
    }
    
    // ❌ VULNERABILITY 8: Insecure Direct Object Reference
    @GetMapping("/api/orders/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable String orderId) {
        // No authorization check - any user can access any order
        String query = "SELECT * FROM orders WHERE id = " + orderId;
        
        Order order = jdbcTemplate.queryForObject(query, new OrderRowMapper());
        return ResponseEntity.ok(order);
    }
}`,

      go: `// Vulnerable Go E-commerce Microservice
package main

import (
    "database/sql"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
    "os"
    "os/exec"
    "path/filepath"
    "crypto/md5"
    "encoding/hex"
    "encoding/json"

    "github.com/gorilla/mux"
    _ "github.com/go-sql-driver/mysql"
)

// ❌ VULNERABILITY 1: Hardcoded Credentials and API Keys
const (
    DBPassword    = "admin123"
    JWTSecret     = "super-secret-jwt-key-123"
    APIKey        = "ak_1234567890abcdefghijklmnopqrstuvwxyz"
    StripeSecret  = "sk_live_1234567890abcdefghijklmnopqr"
)

var db *sql.DB

// ❌ VULNERABILITY 2: SQL Injection via String Formatting
func getUserHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    userID := vars["id"]
    
    // SQL injection via fmt.Sprintf
    query := fmt.Sprintf("SELECT * FROM users WHERE id = %s", userID)
    
    rows, err := db.Query(query)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()
    
    // Process results...
    w.WriteHeader(http.StatusOK)
}

func searchProductsHandler(w http.ResponseWriter, r *http.Request) {
    searchTerm := r.URL.Query().Get("q")
    category := r.URL.Query().Get("category")
    
    // SQL injection via string concatenation
    query := "SELECT * FROM products WHERE name LIKE '%" + searchTerm + "%'"
    query += " AND category = '" + category + "'"
    
    rows, err := db.Query(query)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()
    
    w.WriteHeader(http.StatusOK)
}

// ❌ VULNERABILITY 3: Command Injection
func backupHandler(w http.ResponseWriter, r *http.Request) {
    filename := r.FormValue("filename")
    userID := r.FormValue("userId")
    
    // Command injection via exec.Command with user input
    cmdStr := fmt.Sprintf("tar -czf /backups/%s_%s.tar.gz /data/%s/", 
                         userID, filename, userID)
    
    cmd := exec.Command("sh", "-c", cmdStr)
    err := cmd.Run()
    
    if err != nil {
        http.Error(w, "Backup failed", http.StatusInternalServerError)
        return
    }
    
    w.WriteHeader(http.StatusOK)
    fmt.Fprintln(w, "Backup created successfully")
}

func convertFileHandler(w http.ResponseWriter, r *http.Request) {
    inputFile := r.FormValue("input")
    outputFormat := r.FormValue("format")
    
    // Command injection via exec.Command
    outputFile := fmt.Sprintf("output.%s", outputFormat)
    cmd := exec.Command("convert", inputFile, outputFile)
    
    err := cmd.Run()
    if err != nil {
        http.Error(w, "Conversion failed", http.StatusInternalServerError)
        return
    }
    
    w.WriteHeader(http.StatusOK)
}

// ❌ VULNERABILITY 4: Path Traversal
func getUserFileHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    userID := vars["userId"]
    filename := vars["filename"]
    
    // Path traversal vulnerability
    filePath := fmt.Sprintf("./uploads/%s/%s", userID, filename)
    
    content, err := ioutil.ReadFile(filePath)
    if err != nil {
        http.Error(w, "File not found", http.StatusNotFound)
        return
    }
    
    w.WriteHeader(http.StatusOK)
    w.Write(content)
}

// ❌ VULNERABILITY 5: Directory Traversal with filepath.Join
func getFileHandler(w http.ResponseWriter, r *http.Request) {
    userDir := r.URL.Query().Get("dir")
    filename := r.URL.Query().Get("file")
    
    // Still vulnerable even with filepath.Join if not validated
    fullPath := filepath.Join("/app/data", userDir, filename)
    
    data, err := ioutil.ReadFile(fullPath)
    if err != nil {
        http.Error(w, "File not found", http.StatusNotFound)
        return
    }
    
    w.Write(data)
}

// ❌ VULNERABILITY 6: Weak Cryptography
func hashPassword(password string) string {
    // Using weak MD5 hashing
    hash := md5.Sum([]byte(password))
    return hex.EncodeToString(hash[:])
}

// ❌ VULNERABILITY 7: Information Disclosure
func debugHandler(w http.ResponseWriter, r *http.Request) {
    debugInfo := map[string]interface{}{
        "db_password":   DBPassword,
        "jwt_secret":    JWTSecret,
        "api_key":       APIKey,
        "stripe_secret": StripeSecret,
        "environment":   os.Environ(),
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(debugInfo)
}

// ❌ VULNERABILITY 8: Insecure Direct Object Reference
func getOrderHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    orderID := vars["orderId"]
    
    // No authorization check - any user can access any order
    query := fmt.Sprintf("SELECT * FROM orders WHERE id = %s", orderID)
    
    rows, err := db.Query(query)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()
    
    w.WriteHeader(http.StatusOK)
}

// ❌ VULNERABILITY 9: Logging Sensitive Data
func loginHandler(w http.ResponseWriter, r *http.Request) {
    username := r.FormValue("username")
    password := r.FormValue("password")
    
    // Logging sensitive information
    log.Printf("Login attempt: username=%s, password=%s", username, password)
    log.Printf("API Key being used: %s", APIKey)
    
    // Authentication logic...
    w.WriteHeader(http.StatusOK)
}

func main() {
    var err error
    
    // Database connection with hardcoded password
    dsn := fmt.Sprintf("root:%s@tcp(localhost:3306)/ecommerce", DBPassword)
    db, err = sql.Open("mysql", dsn)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    r := mux.NewRouter()
    
    // API routes
    r.HandleFunc("/api/users/{id}", getUserHandler).Methods("GET")
    r.HandleFunc("/api/products/search", searchProductsHandler).Methods("GET")
    r.HandleFunc("/api/backup", backupHandler).Methods("POST")
    r.HandleFunc("/api/convert", convertFileHandler).Methods("POST")
    r.HandleFunc("/api/files/{userId}/{filename}", getUserFileHandler).Methods("GET")
    r.HandleFunc("/api/file", getFileHandler).Methods("GET")
    r.HandleFunc("/api/debug", debugHandler).Methods("GET")
    r.HandleFunc("/api/orders/{orderId}", getOrderHandler).Methods("GET")
    r.HandleFunc("/api/login", loginHandler).Methods("POST")
    
    // Log sensitive startup information
    log.Printf("Server starting with API Key: %s", APIKey)
    log.Printf("Database password: %s", DBPassword)
    
    log.Println("Server running on :8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}`
    }
    
    return examples[language as keyof typeof examples] || examples.python
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950/30'
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
      case 'info': return 'border-gray-500 bg-gray-50 dark:bg-gray-950/30'
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-950/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Testing Interface Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube2 className="h-5 w-5" />
            Rule Testing Laboratory
          </CardTitle>
          <CardDescription>
            Test your custom rules against sample code to validate their effectiveness and tune their patterns.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="single" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Rule Test</TabsTrigger>
          <TabsTrigger value="batch">Batch Testing</TabsTrigger>
        </TabsList>

        {/* Single Rule Testing */}
        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rule Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Rule Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tool Selection */}
                <div className="space-y-2">
                  <Label>Security Tool</Label>
                  <Select 
                    value={selectedTool} 
                    onValueChange={(value: SupportedTool) => {
                      setSelectedTool(value)
                      setSelectedLanguage(undefined)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(supportedTools) && supportedTools.map((tool) => (
                        <SelectItem key={tool.tool} value={tool.tool}>
                          {tool.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <Label>Target Language (Optional)</Label>
                  <Select 
                    value={selectedLanguage || 'any'} 
                    onValueChange={(value: RuleLanguage | 'any') => 
                      setSelectedLanguage(value === 'any' ? undefined : value as RuleLanguage)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any language</SelectItem>
                      {currentTool?.supported_languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                {/* Rule Pattern Examples */}
                <div className="space-y-2">
                  <Label>Common Rule Patterns</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRulePattern(`rules:
  - id: sql-injection-format
    message: "SQL injection via string formatting"
    severity: HIGH
    languages: [python]
    patterns:
      - pattern: |
          $QUERY = f"... {$VAR} ..."
          $DB.$METHOD($QUERY)`)}
                      className="text-xs"
                    >
                      SQL Injection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRulePattern(`rules:
  - id: hardcoded-secret
    message: "Hardcoded secret detected"
    severity: HIGH
    languages: [python]
    patterns:
      - pattern-either:
          - pattern: API_KEY = "..."
          - pattern: SECRET_KEY = "..."`)}
                      className="text-xs"
                    >
                      Hardcoded Secrets
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRulePattern(`rules:
  - id: command-injection
    message: "Command injection vulnerability"
    severity: HIGH
    languages: [python]
    patterns:
      - pattern: os.system($VAR)`)}
                      className="text-xs"
                    >
                      Command Injection
                    </Button>
                  </div>
                </div>

                {/* Rule Pattern Editor */}
                <div className="space-y-2">
                  <Label>Rule Pattern</Label>
                  <RuleEditor
                    value={rulePattern}
                    onChange={setRulePattern}
                    language={currentTool?.rule_format || 'yaml'}
                    height="200px"
                    placeholder="Enter your security rule pattern here or use examples above..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleTestRule}
                    disabled={testRuleMutation.isPending || !rulePattern || !testCode}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {testRuleMutation.isPending ? 'Testing...' : 'Test Rule'}
                  </Button>
                  <Button variant="outline" onClick={handleClearTest} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Code Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  Test Code
                </CardTitle>
                <CardDescription>
                  Provide code that should trigger your security rule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language Examples */}
                <div className="flex flex-wrap gap-2">
                  {['python', 'javascript', 'java', 'go'].map(lang => (
                    <Button
                      key={lang}
                      variant="outline"
                      size="sm"
                      onClick={() => setTestCode(getExampleCode(lang))}
                      className="capitalize"
                    >
                      {lang} Example
                    </Button>
                  ))}
                </div>

                {/* Code Editor */}
                <SimpleCodeEditor
                  value={testCode}
                  onChange={setTestCode}
                  language={selectedLanguage || 'text'}
                  placeholder="Paste vulnerable code here to test your rule against..."
                  height="300px"
                />

                <div className="text-xs text-muted-foreground">
                  💡 Tip: Use the example buttons above to populate with common vulnerable code patterns
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          {testResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TestTube2 className="h-4 w-4" />
                  Test Results
                  <Badge variant="outline" className="ml-auto">
                    <Clock className="h-3 w-3 mr-1" />
                    {testResult.execution_time_ms}ms
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {testResult.success 
                    ? `Found ${testResult.matches.length} potential security issues`
                    : 'Test execution failed'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResult.success ? (
                  <div className="space-y-4">
                    {testResult.matches.length > 0 ? (
                      <div className="space-y-3">
                        {testResult.matches.map((match, index) => (
                          <div key={index} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(match.severity)}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-medium">{match.message}</div>
                                
                                {/* Enhanced line number display */}
                                {match.line_start && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs font-mono">
                                      📍 Line {match.line_start}
                                      {match.line_end && match.line_end !== match.line_start && ` - ${match.line_end}`}
                                    </Badge>
                                    {match.file_path && (
                                      <Badge variant="secondary" className="text-xs">
                                        {match.file_path}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                
                                {/* Code context display */}
                                {(match as any).code_context && (
                                  <div className="mt-3 p-3 bg-muted/50 rounded-md border">
                                    <div className="text-xs font-medium text-muted-foreground mb-2">
                                      Code Context:
                                    </div>
                                    <div className="font-mono text-sm space-y-1">
                                      {(match as any).code_context.context_lines?.map((line: any, lineIndex: number) => (
                                        <div key={lineIndex} className={`flex gap-2 ${line.is_vulnerable ? 'bg-red-100 dark:bg-red-950/30 px-2 rounded' : ''}`}>
                                          <span className={`text-xs text-muted-foreground w-8 text-right ${line.is_vulnerable ? 'text-red-600 font-bold' : ''}`}>
                                            {line.line_number}
                                          </span>
                                          <span className={`flex-1 ${line.is_vulnerable ? 'text-red-800 dark:text-red-200 font-medium' : ''}`}>
                                            {line.content}
                                          </span>
                                          {line.is_vulnerable && (
                                            <span className="text-red-500 text-xs">← 🚨</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Badge 
                                className={`${
                                  match.severity === 'critical' ? 'bg-red-500' :
                                  match.severity === 'high' ? 'bg-orange-500' :
                                  match.severity === 'medium' ? 'bg-yellow-500' :
                                  match.severity === 'low' ? 'bg-blue-500' :
                                  'bg-gray-500'
                                } text-white`}
                              >
                                {match.severity.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-lg">No Issues Found</h3>
                        <p className="text-muted-foreground">
                          Your rule didn't detect any issues in the test code. 
                          This could mean the code is secure or your rule needs refinement.
                        </p>
                      </div>
                    )}
                    
                    {testResult.warnings && testResult.warnings.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <div className="font-medium">Warnings:</div>
                            {testResult.warnings.map((warning, index) => (
                              <div key={index}>• {warning}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Test execution failed</div>
                        {testResult.errors?.map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Batch Testing */}
        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Batch Rule Testing
              </CardTitle>
              <CardDescription>
                Test multiple rules simultaneously against the same codebase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rule Selection */}
              <div className="space-y-2">
                <Label>Select Rules to Test</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                  {myRules.length > 0 ? (
                    <div className="space-y-2">
                      {myRules.map((rule) => (
                        <label key={rule.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                          <Checkbox
                            checked={batchTestRules.some(r => r.id === rule.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBatchTestRules([...batchTestRules, rule])
                              } else {
                                setBatchTestRules(batchTestRules.filter(r => r.id !== rule.id))
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{rule.rule_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {rule.tool} • {rule.severity} • {rule.language || 'any'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2" />
                      <p>No rules available for batch testing</p>
                      <p className="text-sm">Create some rules first to use batch testing</p>
                    </div>
                  )}
                </div>
                {batchTestRules.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {batchTestRules.length} rules selected
                  </div>
                )}
              </div>

              {/* Test Code */}
              <div className="space-y-2">
                <Label>Test Code</Label>
                <SimpleCodeEditor
                  value={testCode}
                  onChange={setTestCode}
                  language="text"
                  placeholder="Enter code to test all selected rules against..."
                  height="200px"
                />
              </div>

              {/* Batch Test Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleBatchTest}
                  disabled={batchTestMutation.isPending || batchTestRules.length === 0 || !testCode}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {batchTestMutation.isPending ? 'Testing...' : `Test ${batchTestRules.length} Rules`}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setBatchTestRules([])}
                  disabled={batchTestRules.length === 0}
                >
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Batch Test Results */}
          {batchTestResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Batch Test Results</CardTitle>
                <CardDescription>
                  Results from testing {batchTestResult.total_rules || batchTestResult.results?.length || 0} rules
                  {batchTestResult.summary && (
                    <span className="ml-2">
                      ({batchTestResult.completed_tests} passed, {batchTestResult.failed_tests} failed)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary Statistics */}
                {batchTestResult.summary && (
                  <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{batchTestResult.summary.total_matches}</div>
                      <div className="text-xs text-muted-foreground">Total Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(batchTestResult.summary.avg_execution_time_ms)}ms</div>
                      <div className="text-xs text-muted-foreground">Avg Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(batchTestResult.summary.success_rate * 100)}%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{batchTestResult.execution_time_ms}ms</div>
                      <div className="text-xs text-muted-foreground">Total Time</div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {(batchTestResult.results || batchTestResult).map((result: any, index: number) => {
                    // Handle both old and new result formats
                    const matches = result.matches || result.result?.matches || []
                    const executionTime = result.execution_time_ms || result.result?.execution_time_ms || 0
                    const success = result.success !== undefined ? result.success : result.result?.success
                    const errors = result.errors || result.result?.errors || []
                    const ruleName = result.rule_name || batchTestRules.find(r => r.id === result.rule_id)?.rule_name || `Rule ${index + 1}`
                    
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{ruleName}</h4>
                            {success === false && (
                              <Badge variant="destructive" className="text-xs">Failed</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {matches.length} matches
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {executionTime}ms
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Show errors if any */}
                        {errors.length > 0 && (
                          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                            <strong>Errors:</strong> {errors.join(', ')}
                          </div>
                        )}
                        
                        {matches.length > 0 ? (
                          <div className="space-y-2">
                            {matches.slice(0, 3).map((match: any, matchIndex: number) => (
                              <div key={matchIndex} className={`p-3 rounded border-l-4 ${getSeverityColor(match.severity)}`}>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="text-sm font-medium">{match.message}</div>
                                  <Badge variant="outline" className="text-xs">
                                    📍 Line {match.line_start}
                                    {match.line_end && match.line_end !== match.line_start && ` - ${match.line_end}`}
                                  </Badge>
                                </div>
                                
                                {/* Show code context if available */}
                                {(match).code_context && (
                                  <div className="mt-2 font-mono text-sm bg-gray-50 rounded p-2 space-y-1">
                                    {(match).code_context.context_lines?.slice(0, 3).map((line: any, lineIndex: number) => (
                                      <div key={lineIndex} className={`flex gap-2 ${line.is_vulnerable ? 'bg-red-100 px-2 rounded' : ''}`}>
                                        <span className={`text-xs text-muted-foreground w-8 text-right ${line.is_vulnerable ? 'text-red-600 font-bold' : ''}`}>
                                          {line.line_number}
                                        </span>
                                        <span className="flex-1">{line.content}</span>
                                        {line.is_vulnerable && <span className="text-red-500 text-xs">← 🚨</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            {matches.length > 3 && (
                              <div className="text-sm text-muted-foreground text-center py-2">
                                And {matches.length - 3} more matches...
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-4 bg-gray-50 rounded">
                            {success === false ? '❌ Rule execution failed' : '✅ No security issues found'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}