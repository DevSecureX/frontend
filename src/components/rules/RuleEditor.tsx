import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface RuleEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  readOnly?: boolean
  placeholder?: string
  showLineNumbers?: boolean
}

export function RuleEditor({
  value,
  onChange,
  language = 'yaml',
  height = '300px',
  readOnly = false,
  placeholder = 'Enter your rule pattern here...'
}: RuleEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(200, textareaRef.current.scrollHeight)}px`
    }
  }, [value])

  // Basic syntax highlighting for YAML/JSON
  const getSyntaxHighlightedHTML = (text: string, lang: string) => {
    if (!text) return ''
    
    let highlighted = text
    
    if (lang === 'yaml') {
      // YAML syntax highlighting
      highlighted = text
        .replace(/^(\s*)([\w-]+)(:)/gm, '$1<span class="text-blue-600 font-medium">$2</span>$3')
        .replace(/^(\s*)(-\s*)/gm, '$1<span class="text-gray-500">$2</span>')
        .replace(/(:\s*)([^#\n]+)/g, '$1<span class="text-green-600">$2</span>')
        .replace(/(#[^\n]*)/g, '<span class="text-gray-400 italic">$1</span>')
    } else if (lang === 'json') {
      // JSON syntax highlighting
      highlighted = text
        .replace(/"([^"]+)":/g, '<span class="text-blue-600 font-medium">"$1"</span>:')
        .replace(/:\s*"([^"]*)"/g, ': <span class="text-green-600">"$1"</span>')
        .replace(/:\s*(\d+)/g, ': <span class="text-orange-600">$1</span>')
        .replace(/:\s*(true|false|null)/g, ': <span class="text-purple-600">$1</span>')
    }
    
    return highlighted
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = `${value.substring(0, start)  }  ${  value.substring(end)}`
      onChange(newValue)
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  const getLanguageBadge = () => {
    const languageColors = {
      yaml: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      json: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      python: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    
    const colorClass = languageColors[language as keyof typeof languageColors] || languageColors.default
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {language.toUpperCase()}
      </span>
    )
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Header with language indicator */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          {getLanguageBadge()}
          <span className="text-xs text-muted-foreground">
            {readOnly ? 'Read-only' : 'Editable'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Lines: {value.split('\n').length} • Characters: {value.length}
        </div>
      </div>

      {/* Editor area */}
      <div className="relative" style={{ minHeight: height }}>
        {/* Background syntax highlighting (disabled for now to keep it simple) */}
        {/* <div 
          className="absolute inset-0 p-4 font-mono text-sm leading-relaxed pointer-events-none text-transparent overflow-auto"
          dangerouslySetInnerHTML={{ 
            __html: getSyntaxHighlightedHTML(value, language) 
          }}
        /> */}
        
        {/* Textarea with unique class for targeted styling */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`
            w-full p-4 font-mono text-sm leading-relaxed code-editor-textarea
            bg-transparent border-none resize-none outline-none
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${readOnly ? 'cursor-default' : 'cursor-text'}
          `}
          style={{
            minHeight: height,
            height: 'auto',
            lineHeight: '1.5',
            paddingLeft: 'calc(2ch + 1rem + 8px)'
          }}
          spellCheck={false}
        />

        {/* Line numbers */}
        <div className="absolute left-0 top-0 p-4 pt-4 text-xs text-gray-400 dark:text-gray-500 font-mono leading-relaxed pointer-events-none select-none">
          {value.split('\n').map((_, index) => (
            <div key={index + 1} className="text-right pr-2" style={{ minWidth: '2ch' }}>
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Footer with helpful shortcuts */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>Tab to indent</span>
            <span>Ctrl+A to select all</span>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Auto-save enabled</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Simple code editor with basic features
export function SimpleCodeEditor({
  value,
  onChange,
  language = 'text',
  placeholder = 'Enter your code here...',
  height = '200px',
  className = ''
}: {
  value: string
  onChange: (value: string) => void
  language?: string
  placeholder?: string
  height?: string
  className?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = `${value.substring(0, start)  }  ${  value.substring(end)}`
      onChange(newValue)
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  return (
    <div className={`relative border rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <span className="text-xs font-medium text-muted-foreground">
          {language === 'text' ? 'code' : language.toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground">
          {value.split('\n').length} lines
        </span>
      </div>
      
      <div className="relative" style={{ minHeight: height }}>
        {/* Textarea with inline padding for line numbers */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-3 font-mono text-sm bg-transparent border-none resize-none outline-none leading-relaxed text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          style={{
            minHeight: height,
            lineHeight: '1.5',
            paddingLeft: 'calc(2ch + 1rem + 8px)'
          }}
          spellCheck={false}
        />

        {/* Line numbers */}
        <div className="absolute left-0 top-0 p-3 pt-3 text-xs text-gray-400 dark:text-gray-500 font-mono leading-relaxed pointer-events-none select-none">
          {value.split('\n').map((_, index) => (
            <div key={index + 1} className="text-right pr-2" style={{ minWidth: '2ch', lineHeight: '1.5' }}>
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}