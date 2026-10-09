import { memo, useEffect, useState } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTheme } from '@/lib/theme'

interface MarkdownRendererProps {
  content: string
  className?: string
  isDarkMode?: boolean
}

// Language mappings for better syntax highlighting
const languageMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  json: 'json',
  xml: 'xml',
  html: 'markup',
  css: 'css',
  scss: 'scss',
  sql: 'sql',
  java: 'java',
  kt: 'kotlin',
  go: 'go',
  rs: 'rust',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  php: 'php',
  swift: 'swift',
  dart: 'dart',
  scala: 'scala',
  r: 'r',
  matlab: 'matlab',
  docker: 'dockerfile',
  dockerfile: 'dockerfile',
  nginx: 'nginx',
  apache: 'apacheconf',
  terraform: 'hcl',
  tf: 'hcl',
  hcl: 'hcl',
  yaml: 'yaml',
  toml: 'toml',
  ini: 'ini',
  conf: 'ini',
  md: 'markdown',
  markdown: 'markdown',
  diff: 'diff',
  patch: 'diff',
  powershell: 'powershell',
  ps1: 'powershell',
  vim: 'vim',
  makefile: 'makefile',
  cmake: 'cmake',
  gradle: 'gradle',
  maven: 'xml',
  pom: 'xml'
}

// Code block component with enhanced features
const CodeBlock = memo(({ 
  children, 
  className, 
  isDarkMode = false 
}: { 
  children: string
  className?: string
  isDarkMode?: boolean
}) => {
  const [copied, setCopied] = useState(false)
  
  // Extract language from className (format: "language-javascript")
  const match = /language-(\w+)/.exec(className ?? '')
  const rawLanguage = match ? match[1] : ''
  const language = languageMap[rawLanguage.toLowerCase()] || rawLanguage
  
  // Clean up the code content
  const code = String(children).replace(/\n$/, '')
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy code')
    }
  }

  const displayLanguage = language || 'text'
  
  return (
    <div className={`relative group my-3 rounded-lg border overflow-hidden max-w-full code-block-container ${
      isDarkMode 
        ? 'border-gray-700/60 bg-gray-900/70 shadow-lg' 
        : 'border-border/50 bg-muted/30 shadow-sm'
    }`}>
      {/* Header with language label and copy button */}
      <div className={`flex items-center justify-between px-3 py-2 border-b min-w-0 ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700/60 text-gray-200'
          : 'bg-muted/60 border-border/40 text-muted-foreground'
      }`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0"></div>
          <span className="ml-2 text-xs font-mono text-muted-foreground uppercase tracking-wide truncate">
            {displayLanguage}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-70 group-hover:opacity-100 transition-opacity hover:bg-primary/10 flex-shrink-0 ml-2"
          onClick={() => void copyToClipboard()}
          title="Copy code"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      {/* Code content with proper overflow handling */}
      <div className="relative overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <SyntaxHighlighter
            style={isDarkMode ? vscDarkPlus : vs}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '0.75rem',
              background: isDarkMode ? '#1a1a1a' : '#f8f9fa',
              fontSize: '0.8125rem',
              lineHeight: '1.5',
              whiteSpace: 'pre',
              wordBreak: 'break-all',
              overflowWrap: 'break-word',
              color: isDarkMode ? '#e1e7ef' : '#24292e',
              borderRadius: '0 0 0.5rem 0.5rem'
            }}
            codeTagProps={{
              style: {
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                display: 'block',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                overflowWrap: 'break-word'
              }
            }}
            wrapLines={true}
            wrapLongLines={true}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
})

CodeBlock.displayName = 'CodeBlock'

// Inline code component with word wrapping
const InlineCode = memo(({ children, isDarkMode = false }: { children: React.ReactNode; isDarkMode?: boolean }) => (
  <code className={`relative rounded px-1.5 py-0.5 font-mono text-xs font-medium border break-all ${
    isDarkMode 
      ? 'bg-gray-800/60 border-gray-700/50 text-gray-200' 
      : 'bg-muted/60 border-border/30 text-foreground'
  }`}>
    {children}
  </code>
))

InlineCode.displayName = 'InlineCode'

// Enhanced table component with better responsive handling
const Table = memo(({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="my-3 overflow-x-auto max-w-full">
    <table className="w-full min-w-full border-collapse border border-border/30 rounded-lg overflow-hidden text-xs" {...props}>
      {children}
    </table>
  </div>
))

Table.displayName = 'Table'

// Table header component
const TableHeader = memo(({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="bg-muted/50" {...props}>
    {children}
  </thead>
))

TableHeader.displayName = 'TableHeader'

// Table row component
const TableRow = memo(({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors" {...props}>
    {children}
  </tr>
))

TableRow.displayName = 'TableRow'

// Table cell components with better spacing
const TableCell = memo(({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className="px-3 py-2 text-xs break-words" {...props}>
    {children}
  </td>
))

TableCell.displayName = 'TableCell'

const TableHeaderCell = memo(({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className="px-3 py-2 text-left text-xs font-semibold text-foreground break-words" {...props}>
    {children}
  </th>
))

TableHeaderCell.displayName = 'TableHeaderCell'

// Blockquote component with proper text wrapping
const Blockquote = memo(({ children, ...props }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
  <blockquote className="my-3 border-l-4 border-primary/40 pl-3 italic text-muted-foreground bg-muted/20 py-2 rounded-r break-words" {...props}>
    {children}
  </blockquote>
))

Blockquote.displayName = 'Blockquote'

// List components with responsive spacing
const OrderedList = memo(({ children, ...props }: React.OlHTMLAttributes<HTMLOListElement>) => (
  <ol className="my-2 ml-4 sm:ml-6 list-decimal space-y-1" {...props}>
    {children}
  </ol>
))

OrderedList.displayName = 'OrderedList'

const UnorderedList = memo(({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className="my-2 ml-4 sm:ml-6 list-disc space-y-1" {...props}>
    {children}
  </ul>
))

UnorderedList.displayName = 'UnorderedList'

const ListItem = memo(({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className="text-xs sm:text-sm leading-relaxed break-words" {...props}>
    {children}
  </li>
))

ListItem.displayName = 'ListItem'

// Heading components with responsive sizing
const Heading1 = memo(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className="mt-4 mb-3 text-lg sm:text-xl font-bold text-foreground border-b border-border/30 pb-2 break-words" {...props}>
    {children}
  </h1>
))

Heading1.displayName = 'Heading1'

const Heading2 = memo(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="mt-4 mb-2 text-base sm:text-lg font-semibold text-foreground break-words" {...props}>
    {children}
  </h2>
))

Heading2.displayName = 'Heading2'

const Heading3 = memo(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className="mt-3 mb-2 text-sm sm:text-base font-medium text-foreground break-words" {...props}>
    {children}
  </h3>
))

Heading3.displayName = 'Heading3'

const Heading4 = memo(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4 className="mt-2 mb-1 text-sm font-medium text-foreground break-words" {...props}>
    {children}
  </h4>
))

Heading4.displayName = 'Heading4'

// Paragraph component with word wrapping
const Paragraph = memo(({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="my-2 text-xs sm:text-sm leading-relaxed break-words" {...props}>
    {children}
  </p>
))

Paragraph.displayName = 'Paragraph'

// Link component
const Link = memo((props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a 
    {...props}
    target="_blank" 
    rel="noopener noreferrer"
    className="text-primary hover:text-primary/80 underline transition-colors"
  >
    {props.children}
  </a>
))

Link.displayName = 'Link'

// Strong and emphasis components
const Strong = memo(({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <strong className="font-semibold text-foreground" {...props}>
    {children}
  </strong>
))

Strong.displayName = 'Strong'

const Emphasis = memo(({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <em className="italic" {...props}>
    {children}
  </em>
))

Emphasis.displayName = 'Emphasis'

// Horizontal rule
const HorizontalRule = memo((props: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className="my-6 border-0 border-t border-border/30" {...props} />
))

HorizontalRule.displayName = 'HorizontalRule'

// Main MarkdownRenderer component
export const MarkdownRenderer = memo<MarkdownRendererProps>(({ 
  content, 
  className = '', 
  isDarkMode 
}) => {
  const { effectiveTheme } = useTheme()
  const [themeDarkMode, setThemeDarkMode] = useState(false)
  
  // Update theme state when effectiveTheme changes
  useEffect(() => {
    setThemeDarkMode(effectiveTheme === 'dark')
  }, [effectiveTheme])
  
  // Fallback dark mode detection for cases where theme hook might not be available
  const detectDarkMode = () => {
    if (typeof window === 'undefined') return false
    
    // Check if document has dark class (most common pattern)
    const hasDarkClass = document.documentElement.classList.contains('dark') || 
                        document.body.classList.contains('dark')
    
    // Check for dark theme attribute
    const hasDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark' ||
                        document.body.getAttribute('data-theme') === 'dark'
    
    // Check system preference as fallback
    const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    
    return hasDarkClass || hasDarkTheme || systemDark
  }
  
  // Use provided isDarkMode prop first, then theme hook, then fallback detection
  const prefersDarkMode = isDarkMode ?? themeDarkMode ?? detectDarkMode()
  const components = {
    // Code blocks and inline code
    code: ({ inline, className, children, ...props }: any) => {
      if (inline) {
        return <InlineCode isDarkMode={prefersDarkMode}>{children}</InlineCode>
      }
      return (
        <CodeBlock 
          className={className}
          isDarkMode={prefersDarkMode}
        >
          {String(children)}
        </CodeBlock>
      )
    },
    
    // Tables
    table: Table,
    thead: TableHeader,
    tr: TableRow,
    td: TableCell,
    th: TableHeaderCell,
    
    // Block elements
    blockquote: Blockquote,
    
    // Lists
    ol: OrderedList,
    ul: UnorderedList,
    li: ListItem,
    
    // Headings
    h1: Heading1,
    h2: Heading2,
    h3: Heading3,
    h4: Heading4,
    
    // Text elements
    p: Paragraph,
    a: Link,
    strong: Strong,
    em: Emphasis,
    
    // Horizontal rule
    hr: HorizontalRule,
  }

  return (
    <div className={`prose prose-sm max-w-none w-full overflow-hidden ${className}`}>
      <div className="break-words overflow-hidden">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components as any}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
})

MarkdownRenderer.displayName = 'MarkdownRenderer'