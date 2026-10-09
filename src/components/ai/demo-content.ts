// Demo content to showcase the enhanced AI Assistant chat features

export const demoMessages = [
  {
    id: '1',
    role: 'user' as const,
    content: 'Can you show me how to implement secure authentication in a Node.js application?',
    timestamp: new Date()
  },
  {
    id: '2',
    role: 'assistant' as const,
    content: `# Secure Authentication in Node.js

I'll show you how to implement secure authentication using **JWT tokens** and **bcrypt** for password hashing.

## 1. Setup Dependencies

First, install the necessary packages:

\`\`\`bash
npm install express bcryptjs jsonwebtoken helmet express-rate-limit
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
\`\`\`

## 2. User Model with Secure Password Hashing

\`\`\`javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  // Hash password before saving
  async hashPassword() {
    const saltRounds = 12; // Higher salt rounds for better security
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  // Verify password
  async verifyPassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Generate JWT token
  generateAuthToken() {
    const payload = {
      userId: this.id,
      email: this.email
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h',
      issuer: 'your-app-name',
      audience: 'your-app-users'
    });
  }
}

module.exports = User;
\`\`\`

## 3. Secure Middleware Implementation

\`\`\`typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// Rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// JWT Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  });
};
\`\`\`

## 4. Security Best Practices

| Practice | Implementation | Why Important |
|----------|----------------|---------------|
| **Password Hashing** | bcrypt with salt rounds ≥ 12 | Prevents rainbow table attacks |
| **JWT Secrets** | Strong, random secrets | Prevents token forgery |
| **Rate Limiting** | Limit login attempts | Prevents brute force attacks |
| **HTTPS Only** | Force SSL/TLS | Prevents token interception |
| **Token Expiration** | Short-lived tokens | Limits exposure window |

## 5. Environment Configuration

\`\`\`env
# .env file
JWT_SECRET=your-super-strong-secret-key-at-least-32-characters
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
\`\`\`

## 6. Login Route Example

\`\`\`python
# Python Flask equivalent for comparison
from flask import request, jsonify
from werkzeug.security import check_password_hash
import jwt
import datetime

@app.route('/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    
    # Validate input
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    # Find user
    user = User.find_by_email(email)
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate token
    payload = {
        'user_id': user.id,
        'email': user.email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email
        }
    })
\`\`\`

> **Security Note**: Always validate and sanitize user inputs, use HTTPS in production, and regularly rotate your JWT secrets.

Would you like me to explain any specific part in more detail or show you how to implement additional security features like **2FA** or **refresh tokens**?`,
    timestamp: new Date()
  },
  {
    id: '3',
    role: 'user' as const,
    content: 'This is great! Can you also show me how to prevent SQL injection attacks?',
    timestamp: new Date()
  },
  {
    id: '4',
    role: 'assistant' as const,
    content: `# Preventing SQL Injection Attacks

SQL injection is one of the **OWASP Top 10** vulnerabilities. Here's how to prevent it effectively:

## 1. Use Parameterized Queries (Prepared Statements)

### ❌ Vulnerable Code:
\`\`\`sql
-- NEVER DO THIS!
SELECT * FROM users WHERE email = ? AND password = ?;
\`\`\`

### ✅ Secure Code:
\`\`\`javascript
// Node.js with mysql2
const mysql = require('mysql2');

const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  const [rows] = await connection.execute(query, [email]);
  return rows[0];
};

// Login function with parameterized query
const authenticateUser = async (email, password) => {
  const query = \`
    SELECT id, email, password_hash 
    FROM users 
    WHERE email = ? AND active = 1
  \`;
  
  const [users] = await connection.execute(query, [email]);
  
  if (users.length === 0) {
    return null;
  }
  
  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  return isValid ? user : null;
};
\`\`\`

## 2. Object-Relational Mapping (ORM) Examples

### Sequelize (Node.js):
\`\`\`javascript
const { User } = require('./models');

// Safe query using Sequelize ORM
const findUserByEmail = async (email) => {
  return await User.findOne({
    where: {
      email: email // Automatically parameterized
    },
    attributes: ['id', 'email', 'password_hash']
  });
};

// Complex query with multiple conditions
const searchUsers = async (searchTerm, role, isActive) => {
  return await User.findAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.iLike]: \`%\${searchTerm}%\` } },
        { lastName: { [Op.iLike]: \`%\${searchTerm}%\` } }
      ],
      role: role,
      isActive: isActive
    },
    limit: 50
  });
};
\`\`\`

### Django ORM (Python):
\`\`\`python
from django.contrib.auth.models import User
from django.db.models import Q

# Safe queries using Django ORM
def find_user_by_email(email):
    try:
        return User.objects.get(email=email, is_active=True)
    except User.DoesNotExist:
        return None

# Complex search with Q objects
def search_users(search_term, role):
    return User.objects.filter(
        Q(first_name__icontains=search_term) | 
        Q(last_name__icontains=search_term),
        profile__role=role,
        is_active=True
    )[:50]  # Limit results
\`\`\`

## 3. Input Validation & Sanitization

\`\`\`typescript
import validator from 'validator';

interface UserInput {
  email: string;
  name: string;
  age: number;
}

const validateAndSanitizeInput = (input: any): UserInput | null => {
  // Email validation
  if (!input.email || !validator.isEmail(input.email)) {
    throw new Error('Invalid email format');
  }

  // Name sanitization
  const sanitizedName = validator.escape(
    validator.trim(input.name || '')
  );
  
  if (sanitizedName.length < 2 || sanitizedName.length > 50) {
    throw new Error('Name must be 2-50 characters');
  }

  // Age validation
  const age = parseInt(input.age);
  if (!Number.isInteger(age) || age < 13 || age > 120) {
    throw new Error('Invalid age');
  }

  return {
    email: validator.normalizeEmail(input.email) || '',
    name: sanitizedName,
    age: age
  };
};
\`\`\`

## 4. Database Configuration Security

\`\`\`yaml
# docker-compose.yml - Secure MySQL setup
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/mysql_root_password
      MYSQL_DATABASE: app_db
      MYSQL_USER: app_user
      MYSQL_PASSWORD_FILE: /run/secrets/mysql_password
    secrets:
      - mysql_root_password
      - mysql_password
    # Disable networking for root
    command: --skip-networking=false --bind-address=127.0.0.1

secrets:
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
  mysql_password:
    file: ./secrets/mysql_password.txt
\`\`\`

## 5. Security Testing

\`\`\`bash
# Use sqlmap to test for SQL injection vulnerabilities
sqlmap -u "http://localhost:3000/api/users?search=test" --risk=3 --level=5

# Test with common injection payloads
curl -X POST "http://localhost:3000/api/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@test.com\\'OR 1=1--", "password": "test"}'
\`\`\`

## 6. Additional Security Measures

### Query Logging & Monitoring:
\`\`\`javascript
// Log all database queries in development
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'app_user',
  password: process.env.DB_PASSWORD,
  database: 'app_db',
  // Enable query logging
  debug: process.env.NODE_ENV === 'development',
  trace: true
});

// Monitor suspicious query patterns
const suspiciousPatterns = [
  /UNION\\s+SELECT/i,
  /OR\\s+1\\s*=\\s*1/i,
  /DROP\\s+TABLE/i,
  /--\\s*$/i
];

const checkSuspiciousQuery = (query) => {
  return suspiciousPatterns.some(pattern => pattern.test(query));
};
\`\`\`

## Key Takeaways:

1. **Always use parameterized queries** - Never concatenate user input into SQL
2. **Validate and sanitize all inputs** - Don't trust any external data
3. **Use ORMs when possible** - They provide built-in protection
4. **Apply principle of least privilege** - Database users should have minimal permissions
5. **Log and monitor** - Detect attack attempts early
6. **Regular security testing** - Use tools like sqlmap to test your applications

Would you like me to show you specific examples for any particular database system or programming language?`,
    timestamp: new Date()
  }
]

export const demoCodeExamples = {
  javascript: `// Advanced React Hook for API calls with error handling
import { useState, useEffect, useCallback } from 'react';

const useApiCall = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};`,

  python: `# Secure file upload handler with validation
import os
import hashlib
from werkzeug.utils import secure_filename
from PIL import Image

class SecureFileUploader:
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    
    def __init__(self, upload_folder):
        self.upload_folder = upload_folder
        os.makedirs(upload_folder, exist_ok=True)
    
    def allowed_file(self, filename):
        return '.' in filename and \\
               filename.rsplit('.', 1)[1].lower() in self.ALLOWED_EXTENSIONS
    
    def validate_image(self, file_path):
        try:
            with Image.open(file_path) as img:
                img.verify()
            return True
        except Exception:
            return False
    
    def upload_file(self, file):
        if not file or file.filename == '':
            raise ValueError("No file selected")
        
        if not self.allowed_file(file.filename):
            raise ValueError("File type not allowed")
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        if file_length > self.MAX_FILE_SIZE:
            raise ValueError("File too large")
        file.seek(0)
        
        # Generate secure filename
        filename = secure_filename(file.filename)
        file_hash = hashlib.md5(file.read()).hexdigest()
        file.seek(0)
        
        # Save file
        file_path = os.path.join(self.upload_folder, f"{file_hash}_{filename}")
        file.save(file_path)
        
        # Validate if it's an image
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            if not self.validate_image(file_path):
                os.remove(file_path)
                raise ValueError("Invalid image file")
        
        return file_path`,

  go: `// Concurrent web scraper with rate limiting
package main

import (
    "context"
    "fmt"
    "io/ioutil"
    "net/http"
    "sync"
    "time"
    
    "golang.org/x/time/rate"
)

type Scraper struct {
    client      *http.Client
    rateLimiter *rate.Limiter
    maxWorkers  int
}

func NewScraper(requestsPerSecond int, maxWorkers int) *Scraper {
    return &Scraper{
        client: &http.Client{
            Timeout: 30 * time.Second,
        },
        rateLimiter: rate.NewLimiter(rate.Limit(requestsPerSecond), 1),
        maxWorkers:  maxWorkers,
    }
}

func (s *Scraper) ScrapeURLs(ctx context.Context, urls []string) map[string]string {
    urlChan := make(chan string, len(urls))
    resultChan := make(chan map[string]string, len(urls))
    
    // Start workers
    var wg sync.WaitGroup
    for i := 0; i < s.maxWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            s.worker(ctx, urlChan, resultChan)
        }()
    }
    
    // Send URLs to workers
    go func() {
        defer close(urlChan)
        for _, url := range urls {
            select {
            case urlChan <- url:
            case <-ctx.Done():
                return
            }
        }
    }()
    
    // Collect results
    results := make(map[string]string)
    go func() {
        wg.Wait()
        close(resultChan)
    }()
    
    for result := range resultChan {
        for k, v := range result {
            results[k] = v
        }
    }
    
    return results
}

func (s *Scraper) worker(ctx context.Context, urls <-chan string, results chan<- map[string]string) {
    for url := range urls {
        // Rate limiting
        if err := s.rateLimiter.Wait(ctx); err != nil {
            return
        }
        
        content, err := s.fetchURL(ctx, url)
        if err != nil {
            fmt.Printf("Error fetching %s: %v\\n", url, err)
            continue
        }
        
        results <- map[string]string{url: content}
    }
}`
}

export const markdownFeatureDemo = `# DevSecureX AI Assistant - Enhanced Features Demo

Welcome to the **enhanced AI Assistant** with full markdown support and syntax highlighting!

## 🎯 Key Features

- **Syntax Highlighting** for 15+ programming languages
- **Copy-to-clipboard** functionality for all code blocks
- **Responsive design** with mobile-friendly interface
- **Real-time typing indicators** with smooth animations
- **Professional styling** similar to modern AI chat interfaces

## 📝 Markdown Support

### Text Formatting
- **Bold text** and *italic text*
- \`inline code\` with syntax highlighting
- > Blockquotes for important information

### Lists
1. Ordered lists with numbers
2. Support for nested items
   - Unordered lists with bullets
   - Multiple levels of nesting

### Tables
| Feature | Status | Notes |
|---------|--------|-------|
| Syntax Highlighting | ✅ Complete | 15+ languages supported |
| Copy Functionality | ✅ Complete | One-click code copying |
| Dark Mode | ✅ Complete | Auto-detection supported |
| Mobile Responsive | ✅ Complete | Works on all devices |

### Code Blocks

#### JavaScript Example:
\`\`\`javascript
// React component with hooks
import { useState, useEffect } from 'react';

const SecurityDashboard = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const fetchVulnerabilities = async () => {
    try {
      const response = await fetch('/api/vulnerabilities');
      const data = await response.json();
      setVulnerabilities(data);
    } catch (error) {
      console.error('Failed to fetch vulnerabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-dashboard">
      <h1>Security Vulnerabilities</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {vulnerabilities.map(vuln => (
            <li key={vuln.id} className={\`severity-\${vuln.severity}\`}>
              {vuln.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
\`\`\`

#### Python Security Script:
\`\`\`python
#!/usr/bin/env python3
"""
Security vulnerability scanner
Scans for common security issues in web applications
"""

import requests
import re
from urllib.parse import urljoin
from typing import List, Dict

class SecurityScanner:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.vulnerabilities = []
    
    def scan_sql_injection(self, endpoint: str) -> None:
        """Test for SQL injection vulnerabilities"""
        payloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "1' UNION SELECT * FROM users --"
        ]
        
        for payload in payloads:
            url = urljoin(self.base_url, endpoint)
            params = {'search': payload}
            
            try:
                response = self.session.get(url, params=params, timeout=10)
                
                # Check for SQL error patterns
                error_patterns = [
                    r"mysql_fetch",
                    r"ORA-\\d{4,5}",
                    r"Microsoft.*ODBC.*SQL"
                ]
                
                for pattern in error_patterns:
                    if re.search(pattern, response.text, re.IGNORECASE):
                        self.vulnerabilities.append({
                            'type': 'SQL Injection',
                            'endpoint': endpoint,
                            'payload': payload,
                            'severity': 'HIGH'
                        })
                        break
                        
            except requests.RequestException as e:
                print(f"Error testing {endpoint}: {e}")
    
    def generate_report(self) -> Dict:
        """Generate vulnerability report"""
        return {
            'target': self.base_url,
            'vulnerabilities_found': len(self.vulnerabilities),
            'details': self.vulnerabilities,
            'scan_time': datetime.now().isoformat()
        }

# Usage example
if __name__ == "__main__":
    scanner = SecurityScanner("https://example.com")
    scanner.scan_sql_injection("/search")
    report = scanner.generate_report()
    print(json.dumps(report, indent=2))
\`\`\`

#### SQL Security Query:
\`\`\`sql
-- Secure user authentication query with proper parameterization
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    r.role_name,
    u.last_login_at
FROM users u
INNER JOIN user_roles ur ON u.id = ur.user_id
INNER JOIN roles r ON ur.role_id = r.id
WHERE 
    u.email = ? 
    AND u.is_active = 1 
    AND u.email_verified = 1
    AND u.failed_login_attempts < 5
    AND u.account_locked_until IS NULL
LIMIT 1;

-- Index for optimal performance
CREATE INDEX idx_users_email_active ON users(email, is_active, email_verified);
\`\`\`

## 🚀 Try It Out!

Ask me about:
- **Security vulnerabilities** and how to fix them
- **Code review** and best practices
- **OWASP compliance** guidelines
- **Secure coding patterns** in any language
- **DevSecOps** implementation strategies

The AI will respond with properly formatted code, explanations, and actionable recommendations!
`;