import { 
  Shield, Code, AlertTriangle, CheckCircle2, Brain,
  Lock, Key, Database, Server, Globe, Settings, FileText,
  Bug, Eye, Users, Smartphone, Cloud, Terminal,
  Search, BookOpen, Wrench, Activity
} from 'lucide-react'

export interface QuickTopic {
  id: string
  icon: React.ComponentType<{ className?: string }>
  text: string
  message: string
  category: string
}

export const TOPIC_CATEGORIES = {
  CODE_SECURITY: 'code_security',
  WEB_SECURITY: 'web_security', 
  API_SECURITY: 'api_security',
  INFRASTRUCTURE: 'infrastructure',
  AUTH_SECURITY: 'auth_security',
  COMPLIANCE: 'compliance',
  SECURITY_TOOLS: 'security_tools',
  INCIDENT_RESPONSE: 'incident_response',
  CRYPTOGRAPHY: 'cryptography',
  MOBILE_SECURITY: 'mobile_security',
  CLOUD_SECURITY: 'cloud_security',
  DATABASE_SECURITY: 'database_security'
} as const

// Category weights for random selection (higher = more likely to appear)
export const CATEGORY_WEIGHTS = {
  [TOPIC_CATEGORIES.CODE_SECURITY]: 40,     // Most important - secure coding
  [TOPIC_CATEGORIES.WEB_SECURITY]: 20,      // Common web vulnerabilities  
  [TOPIC_CATEGORIES.API_SECURITY]: 15,      // API security best practices
  [TOPIC_CATEGORIES.AUTH_SECURITY]: 10,     // Authentication & Authorization
  [TOPIC_CATEGORIES.INFRASTRUCTURE]: 8,     // Server & network security
  [TOPIC_CATEGORIES.DATABASE_SECURITY]: 7,  // Database security
  [TOPIC_CATEGORIES.COMPLIANCE]: 5,         // Standards & compliance
  [TOPIC_CATEGORIES.CLOUD_SECURITY]: 5,     // Cloud security
  [TOPIC_CATEGORIES.SECURITY_TOOLS]: 4,     // Security tools & scanners
  [TOPIC_CATEGORIES.CRYPTOGRAPHY]: 3,       // Encryption & crypto
  [TOPIC_CATEGORIES.MOBILE_SECURITY]: 2,    // Mobile app security
  [TOPIC_CATEGORIES.INCIDENT_RESPONSE]: 1   // Incident handling
}

export const ALL_QUICK_TOPICS: QuickTopic[] = [
  // CODE SECURITY (40% weight - 120 topics)
  {
    id: 'cs_001',
    icon: Code,
    text: 'Secure Code Review',
    message: 'Review my code for security vulnerabilities and suggest improvements',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_002', 
    icon: Bug,
    text: 'Input Validation',
    message: 'How do I properly validate and sanitize user input in my application?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_003',
    icon: Code,
    text: 'SQL Injection Prevention',
    message: 'Show me how to prevent SQL injection attacks with parameterized queries',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_004',
    icon: AlertTriangle,
    text: 'XSS Prevention',
    message: 'How do I prevent Cross-Site Scripting (XSS) attacks in my web app?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_005',
    icon: Shield,
    text: 'CSRF Protection',
    message: 'How can I implement CSRF protection and anti-forgery tokens?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_006',
    icon: Code,
    text: 'Secure Error Handling',
    message: 'How should I handle errors securely without exposing sensitive information?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_007',
    icon: FileText,
    text: 'File Upload Security',
    message: 'What are secure practices for handling file uploads in web applications?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_008',
    icon: Search,
    text: 'Command Injection Prevention',
    message: 'How do I prevent command injection when executing system commands?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_009',
    icon: Bug,
    text: 'Path Traversal Prevention',
    message: 'How can I prevent path traversal attacks in file operations?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_010',
    icon: Code,
    text: 'Secure Random Generation',
    message: 'How do I generate cryptographically secure random numbers and tokens?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_011',
    icon: Shield,
    text: 'Buffer Overflow Prevention',
    message: 'What are best practices to prevent buffer overflow vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_012',
    icon: Code,
    text: 'Secure String Handling',
    message: 'How should I handle sensitive strings and clear them from memory?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_013',
    icon: Bug,
    text: 'Race Condition Prevention',
    message: 'How do I prevent race conditions in multi-threaded applications?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_014',
    icon: Code,
    text: 'Secure Logging Practices',
    message: 'What should I log for security and what should I avoid logging?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_015',
    icon: Shield,
    text: 'Memory Management Security',
    message: 'How do I handle memory securely to prevent information leaks?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_016',
    icon: Bug,
    text: 'Code Injection Prevention',
    message: 'How do I prevent code injection attacks in dynamic languages like Python and JavaScript?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_017',
    icon: Code,
    text: 'Secure Configuration Management',
    message: 'How should I manage application configuration securely without hardcoding secrets?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_018',
    icon: Shield,
    text: 'Deserialization Security',
    message: 'How do I prevent deserialization attacks when handling serialized data?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_019',
    icon: Bug,
    text: 'Template Injection Prevention',
    message: 'How do I prevent server-side template injection vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_020',
    icon: Code,
    text: 'Secure API Design',
    message: 'What are secure design principles when building RESTful APIs?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_021',
    icon: Shield,
    text: 'XML Security',
    message: 'How do I prevent XXE (XML External Entity) attacks when parsing XML?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_022',
    icon: Bug,
    text: 'LDAP Injection Prevention',
    message: 'How can I prevent LDAP injection attacks in directory services?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_023',
    icon: Code,
    text: 'Regular Expression Security',
    message: 'How do I prevent ReDoS (Regular Expression Denial of Service) attacks?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_024',
    icon: Shield,
    text: 'Secure Third-party Dependencies',
    message: 'How should I manage and secure third-party libraries and dependencies?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_025',
    icon: Bug,
    text: 'Business Logic Flaws',
    message: 'How do I identify and prevent business logic vulnerabilities in my application?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_026',
    icon: Code,
    text: 'Secure Data Handling',
    message: 'How should I handle sensitive data throughout its lifecycle in my application?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_027',
    icon: Shield,
    text: 'Function-Level Access Control',
    message: 'How do I implement proper function-level authorization checks?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_028',
    icon: Bug,
    text: 'Integer Overflow Prevention',
    message: 'How can I prevent integer overflow and underflow vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_029',
    icon: Code,
    text: 'Secure Communication Protocols',
    message: 'How do I implement secure communication between microservices?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_030',
    icon: Shield,
    text: 'Time-based Security',
    message: 'How do I prevent timing attacks and implement secure time-based operations?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },

  // WEB SECURITY (20% weight - 60 topics)
  {
    id: 'ws_001',
    icon: Globe,
    text: 'Security Headers',
    message: 'What security headers should I implement in my web application?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_002',
    icon: Shield,
    text: 'Content Security Policy',
    message: 'How do I implement a strong Content Security Policy (CSP)?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_003',
    icon: Lock,
    text: 'HTTPS Implementation',
    message: 'How do I properly implement HTTPS and handle SSL/TLS certificates?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_004',
    icon: Globe,
    text: 'CORS Security',
    message: 'How should I configure CORS securely for my web application?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_005',
    icon: Eye,
    text: 'Clickjacking Prevention',
    message: 'How can I prevent clickjacking attacks with X-Frame-Options?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_006',
    icon: Shield,
    text: 'MIME Type Security',
    message: 'How do I prevent MIME type confusion attacks?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_007',
    icon: Globe,
    text: 'Subdomain Takeover',
    message: 'How can I prevent subdomain takeover vulnerabilities?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_008',
    icon: Code,
    text: 'DOM-based XSS',
    message: 'How do I prevent DOM-based Cross-Site Scripting attacks?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_009',
    icon: Shield,
    text: 'Session Fixation',
    message: 'How can I prevent session fixation attacks?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_010',
    icon: Globe,
    text: 'Open Redirect Prevention',
    message: 'How do I prevent open redirect vulnerabilities?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_011',
    icon: Shield,
    text: 'HTTP Strict Transport Security',
    message: 'How do I implement HSTS (HTTP Strict Transport Security) properly?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_012',
    icon: Globe,
    text: 'Cookie Security',
    message: 'What are the security attributes I should set on cookies (HttpOnly, Secure, SameSite)?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_013',
    icon: Eye,
    text: 'Browser Security Features',
    message: 'How do I leverage browser security features like SRI and Feature Policy?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_014',
    icon: Shield,
    text: 'WebSocket Security',
    message: 'How do I secure WebSocket connections and prevent WebSocket hijacking?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_015',
    icon: Globe,
    text: 'DNS Security',
    message: 'How can I prevent DNS spoofing and implement DNS over HTTPS?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_016',
    icon: Code,
    text: 'Iframe Security',
    message: 'How do I secure iframes and prevent iframe injection attacks?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_017',
    icon: Shield,
    text: 'Referrer Policy',
    message: 'How should I configure Referrer-Policy headers to prevent information leakage?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_018',
    icon: Globe,
    text: 'Mixed Content Prevention',
    message: 'How do I prevent mixed content warnings and ensure all resources are served over HTTPS?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_019',
    icon: Eye,
    text: 'Tabnabbing Prevention',
    message: 'How can I prevent tabnabbing attacks with target="_blank" links?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_020',
    icon: Shield,
    text: 'Content Disposition Security',
    message: 'How do I use Content-Disposition headers securely for file downloads?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },

  // API SECURITY (15% weight - 45 topics)
  {
    id: 'as_001',
    icon: Brain,
    text: 'API Rate Limiting',
    message: 'How do I implement rate limiting and throttling for my REST API?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_002',
    icon: Key,
    text: 'API Authentication',
    message: 'What are the best practices for API authentication and authorization?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_003',
    icon: Code,
    text: 'GraphQL Security',
    message: 'How do I secure GraphQL APIs against common vulnerabilities?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_004',
    icon: Shield,
    text: 'API Input Validation',
    message: 'How should I validate and sanitize input data in REST APIs?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_005',
    icon: Brain,
    text: 'API Versioning Security',
    message: 'How do I handle API versioning securely without exposing old vulnerabilities?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_006',
    icon: FileText,
    text: 'API Documentation Security',
    message: 'What should I include or exclude in public API documentation?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_007',
    icon: Shield,
    text: 'REST API Security',
    message: 'What are comprehensive security best practices for REST APIs?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_008',
    icon: Activity,
    text: 'API Monitoring',
    message: 'How do I monitor APIs for security threats and anomalous behavior?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_009',
    icon: Code,
    text: 'API Error Handling',
    message: 'How should I handle errors in APIs without leaking sensitive information?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_010',
    icon: Brain,
    text: 'API Gateway Security',
    message: 'How do I secure API gateways and implement proper access controls?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },

  // AUTHENTICATION & AUTHORIZATION (10% weight - 30 topics)
  {
    id: 'au_001',
    icon: CheckCircle2,
    text: 'JWT Implementation',
    message: 'Show me secure JWT token implementation with proper validation',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_002',
    icon: Key,
    text: 'OAuth 2.0 Security',
    message: 'How do I implement OAuth 2.0 securely with proper flow validation?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_003',
    icon: Shield,
    text: 'Multi-Factor Authentication',
    message: 'How should I implement MFA (TOTP, SMS, biometric) in my application?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_004',
    icon: Lock,
    text: 'Password Security',
    message: 'What are the best practices for password hashing and storage?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_005',
    icon: Users,
    text: 'Session Management',
    message: 'How do I implement secure session management and lifecycle?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_006',
    icon: Key,
    text: 'SSO Implementation',
    message: 'How do I implement Single Sign-On (SSO) securely with SAML/OIDC?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_007',
    icon: Shield,
    text: 'Role-Based Access Control',
    message: 'How do I implement RBAC (Role-Based Access Control) effectively?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_008',
    icon: CheckCircle2,
    text: 'Passwordless Authentication',
    message: 'How can I implement passwordless authentication with WebAuthn?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_009',
    icon: Lock,
    text: 'Account Lockout Policy',
    message: 'How should I implement account lockout and brute force protection?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_010',
    icon: Key,
    text: 'Token Refresh Security',
    message: 'How do I implement secure token refresh and rotation strategies?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },

  // INFRASTRUCTURE (8% weight - 24 topics)
  {
    id: 'in_001',
    icon: Server,
    text: 'Server Hardening',
    message: 'What are the essential steps for server security hardening?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },
  {
    id: 'in_002',
    icon: Shield,
    text: 'Network Security',
    message: 'How do I secure network communication and implement proper firewalls?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },
  {
    id: 'in_003',
    icon: Terminal,
    text: 'Container Security',
    message: 'What are Docker and Kubernetes security best practices?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },
  {
    id: 'in_004',
    icon: Server,
    text: 'Load Balancer Security',
    message: 'How do I secure load balancers and implement proper SSL termination?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },
  {
    id: 'in_005',
    icon: Settings,
    text: 'Environment Variables',
    message: 'How should I securely manage environment variables and secrets?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },
  {
    id: 'in_006',
    icon: Shield,
    text: 'Reverse Proxy Security',
    message: 'How do I configure reverse proxies (Nginx, Apache) securely?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },
  {
    id: 'in_007',
    icon: Server,
    text: 'SSH Security',
    message: 'What are the best practices for securing SSH access to servers?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },
  {
    id: 'in_008',
    icon: Terminal,
    text: 'CI/CD Pipeline Security',
    message: 'How do I secure CI/CD pipelines and prevent supply chain attacks?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },

  // DATABASE SECURITY (7% weight - 21 topics)
  {
    id: 'db_001',
    icon: Database,
    text: 'Database Encryption',
    message: 'How do I implement database encryption at rest and in transit?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },
  {
    id: 'db_002',
    icon: Key,
    text: 'Database Access Control',
    message: 'What are best practices for database user access control and permissions?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },
  {
    id: 'db_003',
    icon: Shield,
    text: 'SQL Injection Deep Dive',
    message: 'Show me advanced SQL injection prevention techniques and examples',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },
  {
    id: 'db_004',
    icon: Database,
    text: 'Database Backup Security',
    message: 'How should I secure database backups and implement proper recovery?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },
  {
    id: 'db_005',
    icon: Activity,
    text: 'Database Auditing',
    message: 'How do I implement database auditing and monitor for suspicious activity?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },
  {
    id: 'db_006',
    icon: Shield,
    text: 'NoSQL Security',
    message: 'What are security considerations for MongoDB, Redis, and other NoSQL databases?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },
  {
    id: 'db_007',
    icon: Database,
    text: 'Database Connection Security',
    message: 'How do I secure database connections and implement connection pooling safely?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },

  // COMPLIANCE (5% weight - 15 topics)
  {
    id: 'co_001',
    icon: BookOpen,
    text: 'OWASP Top 10',
    message: 'Explain the OWASP Top 10 vulnerabilities and how to prevent them',
    category: TOPIC_CATEGORIES.COMPLIANCE
  },
  {
    id: 'co_002',
    icon: FileText,
    text: 'GDPR Compliance',
    message: 'How do I ensure my application is GDPR compliant for data protection?',
    category: TOPIC_CATEGORIES.COMPLIANCE
  },
  {
    id: 'co_003',
    icon: Shield,
    text: 'SOC 2 Compliance',
    message: 'What are SOC 2 requirements and how do I implement the necessary controls?',
    category: TOPIC_CATEGORIES.COMPLIANCE
  },
  {
    id: 'co_004',
    icon: BookOpen,
    text: 'PCI DSS Compliance',
    message: 'How do I achieve PCI DSS compliance for handling credit card data?',
    category: TOPIC_CATEGORIES.COMPLIANCE
  },
  {
    id: 'co_005',
    icon: FileText,
    text: 'HIPAA Compliance',
    message: 'What are HIPAA requirements for healthcare data security?',
    category: TOPIC_CATEGORIES.COMPLIANCE
  },

  // CLOUD SECURITY (5% weight - 15 topics)
  {
    id: 'cl_001',
    icon: Cloud,
    text: 'AWS Security Best Practices',
    message: 'What are essential AWS security configurations and best practices?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cl_002',
    icon: Key,
    text: 'Cloud IAM Security',
    message: 'How do I implement secure Identity and Access Management in the cloud?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cl_003',
    icon: Cloud,
    text: 'Azure Security',
    message: 'What are Microsoft Azure security best practices and configurations?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cl_004',
    icon: Shield,
    text: 'GCP Security',
    message: 'How do I secure applications on Google Cloud Platform?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cl_005',
    icon: Cloud,
    text: 'Serverless Security',
    message: 'What are security considerations for serverless functions and architecture?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },

  // SECURITY TOOLS (4% weight - 12 topics)
  {
    id: 'st_001',
    icon: Wrench,
    text: 'SAST Implementation',
    message: 'How do I integrate Static Application Security Testing (SAST) tools?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_002',
    icon: Search,
    text: 'DAST Implementation',
    message: 'How do I implement Dynamic Application Security Testing (DAST)?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_003',
    icon: Wrench,
    text: 'Vulnerability Scanning',
    message: 'What are the best vulnerability scanners and how do I use them effectively?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_004',
    icon: Activity,
    text: 'Security Monitoring',
    message: 'How do I implement comprehensive security monitoring and alerting?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },

  // CRYPTOGRAPHY (3% weight - 9 topics)
  {
    id: 'cr_001',
    icon: Lock,
    text: 'Encryption Best Practices',
    message: 'What are current encryption algorithms and implementation best practices?',
    category: TOPIC_CATEGORIES.CRYPTOGRAPHY
  },
  {
    id: 'cr_002',
    icon: Key,
    text: 'Key Management',
    message: 'How do I implement secure cryptographic key management and rotation?',
    category: TOPIC_CATEGORIES.CRYPTOGRAPHY
  },
  {
    id: 'cr_003',
    icon: Shield,
    text: 'Digital Signatures',
    message: 'How do I implement digital signatures for data integrity and authentication?',
    category: TOPIC_CATEGORIES.CRYPTOGRAPHY
  },

  // MOBILE SECURITY (2% weight - 6 topics)
  {
    id: 'mo_001',
    icon: Smartphone,
    text: 'Mobile App Security',
    message: 'What are security best practices for iOS and Android app development?',
    category: TOPIC_CATEGORIES.MOBILE_SECURITY
  },
  {
    id: 'mo_002',
    icon: Key,
    text: 'Mobile Authentication',
    message: 'How do I implement secure authentication in mobile applications?',
    category: TOPIC_CATEGORIES.MOBILE_SECURITY
  },
  {
    id: 'mo_003',
    icon: Shield,
    text: 'Mobile Data Protection',
    message: 'How do I protect sensitive data in mobile apps (encryption, secure storage)?',
    category: TOPIC_CATEGORIES.MOBILE_SECURITY
  },

  // More CODE SECURITY topics (expanding to reach 80+ topics for 40% weight)
  {
    id: 'cs_031',
    icon: Code,
    text: 'Python Security Scanning',
    message: 'How do I use Bandit to scan Python code for security vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_032',
    icon: Bug,
    text: 'JavaScript Security Analysis',
    message: 'What security vulnerabilities should I look for in my JavaScript/Node.js code?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_033',
    icon: Shield,
    text: 'Go Security Best Practices',
    message: 'What are the essential security practices for Go programming language?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_034',
    icon: Code,
    text: 'Java Security Vulnerabilities',
    message: 'How can I use SpotBugs to identify security issues in Java applications?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_035',
    icon: Bug,
    text: 'C/C++ Memory Safety',
    message: 'How do I prevent memory corruption vulnerabilities in C/C++ code?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_036',
    icon: Shield,
    text: 'PHP Security Hardening',
    message: 'What are the critical security configurations for PHP applications?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_037',
    icon: Code,
    text: 'Ruby Security Scanning',
    message: 'How do I use Brakeman to scan Ruby on Rails applications for vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_038',
    icon: Bug,
    text: 'Rust Security Features',
    message: 'How does Rust prevent common security vulnerabilities at compile time?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_039',
    icon: Shield,
    text: 'TypeScript Security Patterns',
    message: 'What TypeScript patterns help prevent runtime security vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_040',
    icon: Code,
    text: 'Semgrep Rule Creation',
    message: 'How do I create custom Semgrep rules to detect specific security patterns?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_041',
    icon: Bug,
    text: 'SAST Tool Comparison',
    message: 'What are the differences between Semgrep, SonarQube, and CodeQL for security scanning?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_042',
    icon: Shield,
    text: 'False Positive Management',
    message: 'How do I handle and reduce false positives in security scanning tools?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_043',
    icon: Code,
    text: 'Dependency Vulnerability Scanning',
    message: 'How do I scan third-party dependencies for known vulnerabilities using Safety?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_044',
    icon: Bug,
    text: 'Supply Chain Security',
    message: 'How can I secure my software supply chain and prevent malicious dependencies?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_045',
    icon: Shield,
    text: 'Secret Detection in Code',
    message: 'How do I use TruffleHog and GitLeaks to find exposed secrets in my repositories?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_046',
    icon: Code,
    text: 'Infrastructure as Code Security',
    message: 'How do I use Checkov to scan Terraform and CloudFormation for security issues?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_047',
    icon: Bug,
    text: 'Docker Security Scanning',
    message: 'How can I use Trivy to scan Docker images for vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_048',
    icon: Shield,
    text: 'Kubernetes Security Analysis',
    message: 'What security configurations should I check in Kubernetes manifests?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_049',
    icon: Code,
    text: 'CI/CD Security Integration',
    message: 'How do I integrate security scanning tools into my CI/CD pipeline effectively?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_050',
    icon: Bug,
    text: 'Security Metrics and KPIs',
    message: 'What security metrics should I track to measure my applications security posture?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },

  // More API SECURITY topics (expanding to 30+ topics)
  {
    id: 'as_011',
    icon: Brain,
    text: 'REST API Vulnerability Testing',
    message: 'How do I test my REST APIs for common security vulnerabilities?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_012',
    icon: Key,
    text: 'API Key Management',
    message: 'What are secure practices for generating, storing, and rotating API keys?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_013',
    icon: Shield,
    text: 'GraphQL Query Depth Limiting',
    message: 'How do I prevent GraphQL query depth attacks and implement proper limits?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_014',
    icon: Activity,
    text: 'API Response Security',
    message: 'How should I structure API responses to avoid information disclosure?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_015',
    icon: Brain,
    text: 'OAuth 2.0 Implementation',
    message: 'How do I implement OAuth 2.0 securely for API authentication?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_016',
    icon: Code,
    text: 'API Security Headers',
    message: 'What security headers should I include in all API responses?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_017',
    icon: Shield,
    text: 'API Pagination Security',
    message: 'How do I implement secure pagination to prevent data enumeration?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_018',
    icon: Activity,
    text: 'API Logging and Monitoring',
    message: 'What should I log in APIs for security monitoring without exposing sensitive data?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_019',
    icon: Brain,
    text: 'Webhook Security',
    message: 'How do I securely implement and validate webhooks in my application?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_020',
    icon: Key,
    text: 'API Schema Validation',
    message: 'How do I use OpenAPI/Swagger schemas to validate API requests securely?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },

  // More WEB SECURITY topics (expanding to 40+ topics)
  {
    id: 'ws_021',
    icon: Globe,
    text: 'Progressive Web App Security',
    message: 'What are security considerations specific to Progressive Web Applications?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_022',
    icon: Shield,
    text: 'Single Page App Security',
    message: 'How do I secure Single Page Applications (React, Vue, Angular) properly?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_023',
    icon: Eye,
    text: 'Client-side Storage Security',
    message: 'What are secure practices for localStorage, sessionStorage, and IndexedDB?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_024',
    icon: Globe,
    text: 'Web Worker Security',
    message: 'How do I securely implement Web Workers without introducing vulnerabilities?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_025',
    icon: Shield,
    text: 'Service Worker Security',
    message: 'What security considerations apply to Service Workers and offline functionality?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_026',
    icon: Code,
    text: 'PostMessage Security',
    message: 'How do I use postMessage API securely for cross-frame communication?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_027',
    icon: Globe,
    text: 'WebRTC Security',
    message: 'What are the security implications of WebRTC and how do I mitigate risks?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_028',
    icon: Shield,
    text: 'Web Assembly Security',
    message: 'How do I securely implement WebAssembly modules in web applications?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_029',
    icon: Eye,
    text: 'Browser Extension Security',
    message: 'What are security best practices for developing browser extensions?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_030',
    icon: Globe,
    text: 'Frontend Framework Security',
    message: 'How do different frontend frameworks (React, Vue, Angular) handle security?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },

  // More AUTHENTICATION topics (expanding to 25+ topics)
  {
    id: 'au_011',
    icon: Key,
    text: 'SAML Security Implementation',
    message: 'How do I implement SAML 2.0 authentication securely in my application?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_012',
    icon: Shield,
    text: 'OpenID Connect Security',
    message: 'What are the security considerations when implementing OpenID Connect?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_013',
    icon: Users,
    text: 'Biometric Authentication',
    message: 'How do I implement secure biometric authentication (fingerprint, face ID)?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_014',
    icon: CheckCircle2,
    text: 'Risk-Based Authentication',
    message: 'How do I implement adaptive authentication based on user behavior?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_015',
    icon: Lock,
    text: 'Certificate-Based Authentication',
    message: 'How do I implement mutual TLS and certificate-based authentication?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_016',
    icon: Key,
    text: 'Social Login Security',
    message: 'What are security considerations for Google, Facebook, GitHub OAuth integration?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_017',
    icon: Shield,
    text: 'Password Reset Security',
    message: 'How do I implement secure password reset functionality?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_018',
    icon: Users,
    text: 'Account Enumeration Prevention',
    message: 'How do I prevent attackers from enumerating valid user accounts?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_019',
    icon: CheckCircle2,
    text: 'Session Security',
    message: 'What are best practices for secure session token generation and validation?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'au_020',
    icon: Lock,
    text: 'Zero Trust Authentication',
    message: 'How do I implement Zero Trust security principles in authentication?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },

  // SECURITY TOOLS (expanding significantly - DevSecureX focus)
  {
    id: 'st_005',
    icon: Wrench,
    text: 'DevSecureX Platform Overview',
    message: 'What security scanning capabilities does DevSecureX offer for my repositories?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_006',
    icon: Search,
    text: 'Multi-Language Security Scanning',
    message: 'How does DevSecureX scan Python, JavaScript, Java, Go, and other languages?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_007',
    icon: Activity,
    text: 'GitHub Integration Security',
    message: 'How do I integrate DevSecureX with my GitHub repositories for automated scanning?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_008',
    icon: Wrench,
    text: 'Pull Request Security Scanning',
    message: 'How does DevSecureX automatically scan pull requests for vulnerabilities?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_009',
    icon: Search,
    text: 'Vulnerability Report Analysis',
    message: 'How do I interpret and prioritize security findings in DevSecureX reports?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_010',
    icon: Activity,
    text: 'Security Scanning Automation',
    message: 'How can I automate security scans across multiple repositories with DevSecureX?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_011',
    icon: Wrench,
    text: 'Custom Security Rules',
    message: 'Can I create custom security scanning rules in DevSecureX for my specific needs?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_012',
    icon: Search,
    text: 'Security Dashboard Analytics',
    message: 'How do I use DevSecureX dashboard to track security metrics across projects?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_013',
    icon: Activity,
    text: 'Compliance Reporting',
    message: 'How does DevSecureX help with security compliance reporting and audits?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_014',
    icon: Wrench,
    text: 'Team Security Collaboration',
    message: 'How can my development team collaborate on security issues using DevSecureX?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_015',
    icon: Search,
    text: 'Security Scanning Performance',
    message: 'How do I optimize DevSecureX scanning performance for large repositories?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_016',
    icon: Activity,
    text: 'Integration with CI/CD',
    message: 'How do I integrate DevSecureX security scanning into my existing CI/CD pipeline?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },

  // More DATABASE SECURITY topics
  {
    id: 'db_008',
    icon: Database,
    text: 'Database Security Hardening',
    message: 'What are essential database hardening steps for PostgreSQL, MySQL, and MongoDB?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },
  {
    id: 'db_009',
    icon: Key,
    text: 'Database Privilege Management',
    message: 'How do I implement least-privilege access control for database users?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },
  {
    id: 'db_010',
    icon: Shield,
    text: 'Database Query Security',
    message: 'How do I write secure database queries to prevent injection attacks?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },
  {
    id: 'db_011',
    icon: Activity,
    text: 'Database Security Monitoring',
    message: 'What database activities should I monitor for security threats?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },
  {
    id: 'db_012',
    icon: Database,
    text: 'Data Masking and Anonymization',
    message: 'How do I implement data masking for non-production database environments?',
    category: TOPIC_CATEGORIES.DATABASE_SECURITY
  },

  // More CLOUD SECURITY topics
  {
    id: 'cl_006',
    icon: Cloud,
    text: 'Multi-Cloud Security Strategy',
    message: 'How do I implement consistent security across AWS, Azure, and GCP?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cl_007',
    icon: Key,
    text: 'Cloud Secret Management',
    message: 'How do I securely manage secrets using AWS Secrets Manager, Azure Key Vault?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cl_008',
    icon: Shield,
    text: 'Cloud Network Security',
    message: 'How do I configure VPCs, Security Groups, and NACLs securely?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cl_009',
    icon: Activity,
    text: 'Cloud Security Monitoring',
    message: 'How do I implement comprehensive logging and monitoring in cloud environments?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cl_010',
    icon: Cloud,
    text: 'Container Orchestration Security',
    message: 'How do I secure Kubernetes clusters and container deployments in the cloud?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },

  // More COMPLIANCE topics
  {
    id: 'co_006',
    icon: FileText,
    text: 'ISO 27001 Implementation',
    message: 'How do I implement ISO 27001 information security management controls?',
    category: TOPIC_CATEGORIES.COMPLIANCE
  },
  {
    id: 'co_007',
    icon: Shield,
    text: 'NIST Framework Compliance',
    message: 'How do I align my security program with the NIST Cybersecurity Framework?',
    category: TOPIC_CATEGORIES.COMPLIANCE
  },
  {
    id: 'co_008',
    icon: BookOpen,
    text: 'CIS Controls Implementation',
    message: 'What are the CIS Critical Security Controls and how do I implement them?',
    category: TOPIC_CATEGORIES.COMPLIANCE
  },
  {
    id: 'co_009',
    icon: FileText,
    text: 'Security Audit Preparation',
    message: 'How do I prepare for security audits and compliance assessments?',
    category: TOPIC_CATEGORIES.COMPLIANCE
  },
  {
    id: 'co_010',
    icon: Shield,
    text: 'Privacy by Design',
    message: 'How do I implement Privacy by Design principles in my applications?',
    category: TOPIC_CATEGORIES.COMPLIANCE
  },

  // More INFRASTRUCTURE topics
  {
    id: 'in_009',
    icon: Terminal,
    text: 'Infrastructure Security Scanning',
    message: 'How do I scan my infrastructure configuration for security vulnerabilities?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },
  {
    id: 'in_010',
    icon: Server,
    text: 'Microservices Security',
    message: 'What are security best practices for microservices architecture?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },
  {
    id: 'in_011',
    icon: Shield,
    text: 'Zero Trust Network Security',
    message: 'How do I implement Zero Trust networking principles in my infrastructure?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },
  {
    id: 'in_012',
    icon: Settings,
    text: 'Configuration Management Security',
    message: 'How do I securely manage infrastructure configuration with tools like Ansible?',
    category: TOPIC_CATEGORIES.INFRASTRUCTURE
  },

  // More CRYPTOGRAPHY topics
  {
    id: 'cr_004',
    icon: Key,
    text: 'Post-Quantum Cryptography',
    message: 'How do I prepare my applications for post-quantum cryptography standards?',
    category: TOPIC_CATEGORIES.CRYPTOGRAPHY
  },
  {
    id: 'cr_005',
    icon: Shield,
    text: 'Homomorphic Encryption',
    message: 'What are the practical applications of homomorphic encryption in security?',
    category: TOPIC_CATEGORIES.CRYPTOGRAPHY
  },
  {
    id: 'cr_006',
    icon: Lock,
    text: 'Hardware Security Modules',
    message: 'How do I integrate Hardware Security Modules (HSMs) for key management?',
    category: TOPIC_CATEGORIES.CRYPTOGRAPHY
  },

  // More MOBILE SECURITY topics
  {
    id: 'mo_004',
    icon: Smartphone,
    text: 'React Native Security',
    message: 'What are security considerations specific to React Native mobile apps?',
    category: TOPIC_CATEGORIES.MOBILE_SECURITY
  },
  {
    id: 'mo_005',
    icon: Shield,
    text: 'Flutter Security Best Practices',
    message: 'How do I implement security best practices in Flutter applications?',
    category: TOPIC_CATEGORIES.MOBILE_SECURITY
  },
  {
    id: 'mo_006',
    icon: Key,
    text: 'Mobile App Penetration Testing',
    message: 'How do I perform security testing on iOS and Android applications?',
    category: TOPIC_CATEGORIES.MOBILE_SECURITY
  },

  // INCIDENT RESPONSE (expanding)
  {
    id: 'ir_001',
    icon: AlertTriangle,
    text: 'Incident Response Plan',
    message: 'How do I create an effective security incident response plan?',
    category: TOPIC_CATEGORIES.INCIDENT_RESPONSE
  },
  {
    id: 'ir_002',
    icon: Activity,
    text: 'Security Incident Analysis',
    message: 'How do I analyze and investigate security incidents effectively?',
    category: TOPIC_CATEGORIES.INCIDENT_RESPONSE
  },
  {
    id: 'ir_003',
    icon: Shield,
    text: 'Breach Response',
    message: 'What are the immediate steps to take when a security breach is detected?',
    category: TOPIC_CATEGORIES.INCIDENT_RESPONSE
  },
  {
    id: 'ir_004',
    icon: Search,
    text: 'Digital Forensics',
    message: 'How do I collect and preserve digital evidence after a security incident?',
    category: TOPIC_CATEGORIES.INCIDENT_RESPONSE
  },
  {
    id: 'ir_005',
    icon: Activity,
    text: 'Threat Intelligence',
    message: 'How do I leverage threat intelligence to improve security posture?',
    category: TOPIC_CATEGORIES.INCIDENT_RESPONSE
  },
  {
    id: 'ir_006',
    icon: AlertTriangle,
    text: 'Security Operations Center',
    message: 'How do I set up and operate an effective Security Operations Center (SOC)?',
    category: TOPIC_CATEGORIES.INCIDENT_RESPONSE
  },
  {
    id: 'st_006',
    icon: Wrench,
    text: 'DevSecureX Integration',
    message: 'How do I integrate DevSecureX security scanning into my CI/CD pipeline?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },

  // ADDITIONAL CODE SECURITY TOPICS (40 topics)
  {
    id: 'cs_121',
    icon: Code,
    text: 'Secure TypeScript Patterns',
    message: 'What are the best TypeScript security patterns to prevent common vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_122',
    icon: Shield,
    text: 'React Security Best Practices',
    message: 'How do I secure React applications against XSS and injection attacks?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_123',
    icon: Bug,
    text: 'Python Security Hardening',
    message: 'What Python security practices should I follow to prevent vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_124',
    icon: Code,
    text: 'Java Secure Coding',
    message: 'What are the OWASP secure coding guidelines for Java applications?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_125',
    icon: Shield,
    text: 'Node.js Security Checklist',
    message: 'What security checklist should I follow for Node.js applications?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_126',
    icon: AlertTriangle,
    text: 'C# Memory Safety',
    message: 'How do I prevent buffer overflow and memory corruption in C# applications?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_127',
    icon: Code,
    text: 'Go Security Patterns',
    message: 'What are the secure coding patterns for Go applications?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_128',
    icon: Bug,
    text: 'Rust Memory Safety',
    message: 'How does Rust prevent memory safety vulnerabilities by design?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_129',
    icon: Shield,
    text: 'PHP Security Hardening',
    message: 'What PHP security configurations and practices prevent common attacks?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_130',
    icon: Code,
    text: 'Ruby Security Guidelines',
    message: 'What are the Rails security best practices to prevent vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_131',
    icon: AlertTriangle,
    text: 'Swift iOS Security',
    message: 'How do I implement secure coding practices in Swift for iOS apps?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_132',
    icon: Shield,
    text: 'Kotlin Security Patterns',
    message: 'What security patterns should I use when developing Android apps with Kotlin?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_133',
    icon: Code,
    text: 'Flutter Security Best Practices',
    message: 'How do I secure Flutter applications against common mobile vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_134',
    icon: Bug,
    text: 'Dart Security Guidelines',
    message: 'What Dart security practices prevent injection and data leakage?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_135',
    icon: Shield,
    text: 'Scala Security Patterns',
    message: 'How do I implement secure functional programming patterns in Scala?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_136',
    icon: Code,
    text: 'Elixir Security Best Practices',
    message: 'What security considerations are important for Elixir/Phoenix applications?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_137',
    icon: AlertTriangle,
    text: 'Assembly Security Considerations',
    message: 'How do I prevent security vulnerabilities in low-level assembly code?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_138',
    icon: Shield,
    text: 'WebAssembly Security',
    message: 'What security implications should I consider when using WebAssembly?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_139',
    icon: Code,
    text: 'Shell Script Security',
    message: 'How do I write secure bash and shell scripts to prevent injection attacks?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_140',
    icon: Bug,
    text: 'SQL Query Security',
    message: 'What are the best practices for writing secure SQL queries and preventing injection?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_141',
    icon: Shield,
    text: 'GraphQL Security Patterns',
    message: 'How do I secure GraphQL APIs against query complexity and injection attacks?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_142',
    icon: Code,
    text: 'Microservices Security',
    message: 'What security patterns should I implement for microservices architecture?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_143',
    icon: AlertTriangle,
    text: 'Container Security Best Practices',
    message: 'How do I secure Docker containers and prevent privilege escalation?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_144',
    icon: Shield,
    text: 'Serverless Security Guidelines',
    message: 'What security considerations are important for AWS Lambda and serverless functions?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_145',
    icon: Code,
    text: 'API Gateway Security',
    message: 'How do I implement security controls at the API gateway level?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_146',
    icon: Bug,
    text: 'Event-Driven Security',
    message: 'What security patterns apply to event-driven and message queue architectures?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_147',
    icon: Shield,
    text: 'DevSecureX Code Analysis',
    message: 'How does DevSecureX analyze my code for security vulnerabilities across different languages?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_148',
    icon: Code,
    text: 'Static Analysis Integration',
    message: 'How do I integrate DevSecureX static analysis into my development workflow?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_149',
    icon: AlertTriangle,
    text: 'Code Review Security Checklist',
    message: 'What security items should be included in every code review checklist?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_150',
    icon: Shield,
    text: 'Secure Development Lifecycle',
    message: 'How do I implement security throughout the entire software development lifecycle?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_151',
    icon: Code,
    text: 'Threat Modeling for Developers',
    message: 'How do I perform threat modeling during the development process?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_152',
    icon: Bug,
    text: 'Security Unit Testing',
    message: 'How do I write unit tests that validate security controls and prevent regressions?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_153',
    icon: Shield,
    text: 'Secure Configuration Management',
    message: 'What are the best practices for managing secure configurations in code?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_154',
    icon: Code,
    text: 'Supply Chain Security',
    message: 'How do I secure my application dependencies and prevent supply chain attacks?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_155',
    icon: AlertTriangle,
    text: 'License Compliance Security',
    message: 'How do security vulnerabilities in open-source licenses affect my applications?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_156',
    icon: Shield,
    text: 'DevSecureX Dependency Scanning',
    message: 'How does DevSecureX scan and monitor my project dependencies for vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_157',
    icon: Code,
    text: 'Security Linting Rules',
    message: 'What security linting rules should I configure for different programming languages?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_158',
    icon: Bug,
    text: 'Automated Security Testing',
    message: 'How do I implement automated security testing in my CI/CD pipeline?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_159',
    icon: Shield,
    text: 'Security Regression Testing',
    message: 'How do I ensure security fixes dont introduce new vulnerabilities?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },
  {
    id: 'cs_160',
    icon: Code,
    text: 'Secure Coding Standards',
    message: 'What coding standards and guidelines help maintain consistent security practices?',
    category: TOPIC_CATEGORIES.CODE_SECURITY
  },

  // ADDITIONAL WEB SECURITY TOPICS (20 topics)
  {
    id: 'ws_016',
    icon: Globe,
    text: 'Progressive Web App Security',
    message: 'What security considerations are important for Progressive Web Applications?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_017',
    icon: Shield,
    text: 'Single Page Application Security',
    message: 'How do I secure SPAs against client-side vulnerabilities and attacks?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_018',
    icon: Lock,
    text: 'Web Components Security',
    message: 'What security patterns should I follow when developing custom web components?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_019',
    icon: Globe,
    text: 'WebSocket Security',
    message: 'How do I implement secure WebSocket connections and prevent hijacking?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_020',
    icon: Shield,
    text: 'Browser Extension Security',
    message: 'What security risks are associated with browser extensions and how to mitigate them?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_021',
    icon: Eye,
    text: 'Web Analytics Privacy',
    message: 'How do I implement web analytics while protecting user privacy and data?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_022',
    icon: Globe,
    text: 'Third-Party Integration Security',
    message: 'How do I securely integrate third-party services and widgets into my website?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_023',
    icon: Shield,
    text: 'Web Performance vs Security',
    message: 'How do I balance web performance optimization with security requirements?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_024',
    icon: Lock,
    text: 'Web Accessibility Security',
    message: 'What security considerations are important when implementing web accessibility?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_025',
    icon: Globe,
    text: 'Internationalization Security',
    message: 'How do I handle internationalization and localization securely?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_026',
    icon: Shield,
    text: 'Web Push Notification Security',
    message: 'What security measures should I implement for web push notifications?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_027',
    icon: Eye,
    text: 'Web Workers Security',
    message: 'How do I securely implement and manage web workers in my applications?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_028',
    icon: Globe,
    text: 'Service Worker Security',
    message: 'What security best practices apply to service workers and offline functionality?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_029',
    icon: Shield,
    text: 'Web Sharing API Security',
    message: 'How do I implement the Web Share API securely without exposing sensitive data?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_030',
    icon: Lock,
    text: 'Web Bluetooth Security',
    message: 'What security risks are associated with Web Bluetooth API and how to mitigate them?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_031',
    icon: Globe,
    text: 'WebXR Security Considerations',
    message: 'What security and privacy concerns exist with WebXR and virtual reality applications?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_032',
    icon: Shield,
    text: 'Web Assembly Security',
    message: 'How do I secure WebAssembly modules and prevent malicious code execution?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_033',
    icon: Eye,
    text: 'Browser Fingerprinting Defense',
    message: 'How do I protect users from browser fingerprinting and tracking techniques?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_034',
    icon: Globe,
    text: 'Web Standards Security',
    message: 'How do emerging web standards impact security and what should I monitor?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },
  {
    id: 'ws_035',
    icon: Shield,
    text: 'DevSecureX Web Scanning',
    message: 'How does DevSecureX scan web applications for client-side vulnerabilities?',
    category: TOPIC_CATEGORIES.WEB_SECURITY
  },

  // ADDITIONAL API SECURITY TOPICS (15 topics) 
  {
    id: 'as_011',
    icon: Server,
    text: 'gRPC Security Best Practices',
    message: 'How do I secure gRPC services and implement proper authentication?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_012',
    icon: Shield,
    text: 'API Versioning Security',
    message: 'What security considerations are important when versioning APIs?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_013',
    icon: Lock,
    text: 'API Contract Security',
    message: 'How do I ensure API contracts maintain security requirements across versions?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_014',
    icon: Server,
    text: 'Microservices API Security',
    message: 'What security patterns apply to API communication between microservices?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_015',
    icon: Shield,
    text: 'API Mesh Security',
    message: 'How do I secure API mesh architectures and service-to-service communication?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_016',
    icon: Globe,
    text: 'Public API Security',
    message: 'What additional security measures are needed for publicly exposed APIs?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_017',
    icon: Lock,
    text: 'API Key Rotation',
    message: 'How do I implement secure API key rotation and lifecycle management?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_018',
    icon: Server,
    text: 'API Load Balancing Security',
    message: 'What security considerations apply to API load balancing and distribution?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_019',
    icon: Shield,
    text: 'API Caching Security',
    message: 'How do I implement API caching without exposing sensitive data?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_020',
    icon: Eye,
    text: 'API Monitoring and Alerting',
    message: 'What security metrics should I monitor for API endpoints?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_021',
    icon: Globe,
    text: 'Cross-Origin API Security',
    message: 'How do I handle CORS and cross-origin requests securely?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_022',
    icon: Lock,
    text: 'API Response Security',
    message: 'What security headers and response patterns should APIs implement?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_023',
    icon: Server,
    text: 'API Error Handling Security',
    message: 'How do I handle API errors without exposing sensitive system information?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_024',
    icon: Shield,
    text: 'API Development Security',
    message: 'What security practices should be followed during API development?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },
  {
    id: 'as_025',
    icon: Wrench,
    text: 'DevSecureX API Security Testing',
    message: 'How does DevSecureX test my APIs for security vulnerabilities and misconfigurations?',
    category: TOPIC_CATEGORIES.API_SECURITY
  },

  // ADDITIONAL SECURITY TOOLS TOPICS (10 topics)
  {
    id: 'st_007',
    icon: Wrench,
    text: 'DevSecureX Custom Rules',
    message: 'How do I create custom security scanning rules in DevSecureX for my specific needs?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_008',
    icon: Search,
    text: 'DevSecureX Reporting Dashboard',
    message: 'How do I interpret and act on security reports from DevSecureX scanning?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_009',
    icon: Settings,
    text: 'DevSecureX Configuration Management',
    message: 'How do I configure DevSecureX scanning policies for different projects?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_010',
    icon: Activity,
    text: 'DevSecureX Performance Tuning',
    message: 'How do I optimize DevSecureX scanning performance for large codebases?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_011',
    icon: Wrench,
    text: 'Security Tool Integration',
    message: 'How do I integrate multiple security tools into a cohesive security pipeline?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_012',
    icon: Brain,
    text: 'AI-Powered Security Analysis',
    message: 'How does DevSecureX use AI to improve vulnerability detection accuracy?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_013',
    icon: Search,
    text: 'Security Metrics and KPIs',
    message: 'What security metrics should I track to measure my security program effectiveness?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_014',
    icon: Settings,
    text: 'Security Automation Workflows',
    message: 'How do I automate security responses and remediation workflows?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_015',
    icon: Activity,
    text: 'Security Tool ROI Analysis',
    message: 'How do I measure the return on investment for security tools and processes?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },
  {
    id: 'st_016',
    icon: Wrench,
    text: 'DevSecureX Enterprise Features',
    message: 'What enterprise-level features does DevSecureX provide for large organizations?',
    category: TOPIC_CATEGORIES.SECURITY_TOOLS
  },

  // ADDITIONAL AUTHENTICATION SECURITY TOPICS (5 topics)
  {
    id: 'auth_011',
    icon: Key,
    text: 'Passwordless Authentication',
    message: 'How do I implement secure passwordless authentication using WebAuthn and FIDO2?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'auth_012',
    icon: Lock,
    text: 'Biometric Authentication Security',
    message: 'What security considerations are important for biometric authentication systems?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'auth_013',
    icon: Users,
    text: 'Social Login Security',
    message: 'How do I securely implement social media login while protecting user privacy?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'auth_014',
    icon: Key,
    text: 'Authentication Token Security',
    message: 'What are the best practices for secure authentication token generation and validation?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },
  {
    id: 'auth_015',
    icon: Shield,
    text: 'Adaptive Authentication',
    message: 'How do I implement risk-based and adaptive authentication mechanisms?',
    category: TOPIC_CATEGORIES.AUTH_SECURITY
  },

  // ADDITIONAL CLOUD SECURITY TOPICS (5 topics)
  {
    id: 'cloud_006',
    icon: Cloud,
    text: 'Multi-Cloud Security Strategy',
    message: 'How do I maintain consistent security across multiple cloud providers?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cloud_007',
    icon: Server,
    text: 'Cloud Native Security',
    message: 'What security patterns are specific to cloud-native applications and architectures?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cloud_008',
    icon: Lock,
    text: 'Cloud Data Residency',
    message: 'How do I ensure data residency requirements are met in cloud deployments?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cloud_009',
    icon: Shield,
    text: 'Cloud Security Posture Management',
    message: 'How do I continuously monitor and improve my cloud security posture?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },
  {
    id: 'cloud_010',
    icon: Eye,
    text: 'Cloud Cost vs Security',
    message: 'How do I balance cloud security requirements with cost optimization?',
    category: TOPIC_CATEGORIES.CLOUD_SECURITY
  },

  // ADDITIONAL MOBILE SECURITY TOPICS (3 topics)
  {
    id: 'mobile_003',
    icon: Smartphone,
    text: 'Mobile App Security Testing',
    message: 'What automated testing approaches work best for mobile app security validation?',
    category: TOPIC_CATEGORIES.MOBILE_SECURITY
  },
  {
    id: 'mobile_004',
    icon: Lock,
    text: 'Mobile Device Management Security',
    message: 'How do I implement secure mobile device management for enterprise applications?',
    category: TOPIC_CATEGORIES.MOBILE_SECURITY
  },
  {
    id: 'mobile_005',
    icon: Shield,
    text: 'Cross-Platform Mobile Security',
    message: 'What security considerations are important for cross-platform mobile development?',
    category: TOPIC_CATEGORIES.MOBILE_SECURITY
  },

  // ADDITIONAL CRYPTOGRAPHY TOPICS (2 topics)
  {
    id: 'crypto_004',
    icon: Lock,
    text: 'Post-Quantum Cryptography',
    message: 'How do I prepare my applications for post-quantum cryptographic standards?',
    category: TOPIC_CATEGORIES.CRYPTOGRAPHY
  },
  {
    id: 'crypto_005',
    icon: Key,
    text: 'Cryptographic Agility',
    message: 'How do I design systems that can adapt to changing cryptographic requirements?',
    category: TOPIC_CATEGORIES.CRYPTOGRAPHY
  }
]