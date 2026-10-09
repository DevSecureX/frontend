import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  ArrowRight, 
  Clock,
  Shield,
  Zap,
  DollarSign,
  Users,
  Settings,
  ExternalLink
} from 'lucide-react'

interface DeletionFeedbackProps {
  onReasonChange: (reason: string) => void
  selectedReason?: string // Optional, not used internally but kept for API compatibility
}

const deletionReasons = [
  {
    id: 'no_longer_needed',
    label: 'No longer needed',
    description: 'Project completed or security needs changed',
    icon: <Clock className="h-4 w-4" />,
    category: 'usage'
  },
  {
    id: 'switching_tools',
    label: 'Switching to different tool',
    description: 'Found a better fit for our workflow',
    icon: <ArrowRight className="h-4 w-4" />,
    category: 'competition'
  },
  {
    id: 'cost_concerns',
    label: 'Cost considerations',
    description: 'Budget constraints or pricing concerns',
    icon: <DollarSign className="h-4 w-4" />,
    category: 'pricing'
  },
  {
    id: 'complexity',
    label: 'Too complex for our needs',
    description: 'Looking for simpler solution',
    icon: <Settings className="h-4 w-4" />,
    category: 'ux'
  },
  {
    id: 'performance',
    label: 'Performance issues',
    description: 'Speed or reliability concerns',
    icon: <Zap className="h-4 w-4" />,
    category: 'technical'
  },
  {
    id: 'security_policy',
    label: 'Company security policy',
    description: 'Internal compliance requirements',
    icon: <Shield className="h-4 w-4" />,
    category: 'compliance'
  },
  {
    id: 'team_decision',
    label: 'Team/Organization decision',
    description: 'Collective choice to discontinue',
    icon: <Users className="h-4 w-4" />,
    category: 'organizational'
  },
  {
    id: 'migration',
    label: 'Data migration completed',
    description: 'Successfully moved to new system',
    icon: <ExternalLink className="h-4 w-4" />,
    category: 'migration'
  }
]

export function DeletionFeedback({ onReasonChange }: DeletionFeedbackProps) {
  const [customReason, setCustomReason] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleReasonSelect = (value: string) => {
    setSelectedId(value)
    if (value === 'custom') {
      setShowCustom(true)
      onReasonChange(customReason || 'User provided custom reason')
    } else {
      setShowCustom(false)
      const reason = deletionReasons.find(r => r.id === value)
      onReasonChange(reason?.label ?? value)
    }
  }

  const handleCustomReasonChange = (value: string) => {
    setCustomReason(value)
    if (showCustom) {
      onReasonChange(value || 'User provided custom reason')
    }
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-blue-900 dark:text-blue-100">
            Help us improve (Optional)
          </h3>
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            30 seconds
          </Badge>
        </div>
        
        <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
          Your feedback helps us understand user needs and improve DevSecureX. 
          This is completely optional and you can proceed without providing a reason.
        </p>

        <RadioGroup value={selectedId} onValueChange={handleReasonSelect} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            {deletionReasons.map((reason) => (
              <div key={reason.id} className="flex items-start space-x-2 group">
                <RadioGroupItem 
                  value={reason.id} 
                  id={reason.id}
                  className="mt-1 border-blue-300 text-blue-600 focus:ring-blue-500 dark:border-blue-700 dark:text-blue-400"
                />
                <Label 
                  htmlFor={reason.id} 
                  className="flex-1 cursor-pointer group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-600 dark:text-blue-400">{reason.icon}</span>
                    <span className="font-medium text-sm">{reason.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {reason.description}
                  </p>
                </Label>
              </div>
            ))}
          </div>
          
          {/* Custom reason option */}
          <div className="pt-3 border-t border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-start space-x-2 group">
              <RadioGroupItem 
                value="custom" 
                id="custom"
                className="mt-1 border-blue-300 text-blue-600 focus:ring-blue-500 dark:border-blue-700 dark:text-blue-400"
              />
              <div className="flex-1">
                <Label 
                  htmlFor="custom" 
                  className="cursor-pointer font-medium text-sm group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors"
                >
                  Other reason
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Share specific feedback (optional)
                </p>
                
                {showCustom && (
                  <Textarea
                    value={customReason}
                    onChange={(e) => handleCustomReasonChange(e.target.value)}
                    placeholder="Tell us more about your reason for leaving (optional)..."
                    rows={3}
                    className="text-sm resize-none"
                    maxLength={200}
                  />
                )}
              </div>
            </div>
          </div>
        </RadioGroup>
        
        <div className="pt-3 border-t border-blue-200/50 dark:border-blue-800/50">
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70 leading-relaxed">
            💡 <strong>Your privacy matters:</strong> This feedback is used only for product improvement and is not linked to your personal data after account deletion.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}