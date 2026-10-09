import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Info, 
  Clock, 
  Shield, 
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export function AccountDeactivationInfo() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-blue-900 dark:text-blue-100">Account Deactivation & Data Retention</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
            30-Day Retention Policy
          </Badge>
        </div>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Enterprise-grade data protection with compliance-focused account deactivation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Overview */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-blue-800 dark:text-blue-200 font-medium">Soft Delete</span>
              <p className="text-xs text-blue-600 dark:text-blue-400">Data preserved safely</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-blue-800 dark:text-blue-200 font-medium">30-Day Window</span>
              <p className="text-xs text-blue-600 dark:text-blue-400">Compliance retention</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-blue-800 dark:text-blue-200 font-medium">Recoverable</span>
              <p className="text-xs text-blue-600 dark:text-blue-400">Contact support</p>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-0 h-auto text-blue-800 dark:text-blue-200 hover:bg-blue-100/50 dark:hover:bg-blue-900/20"
            >
              <span className="text-sm font-medium">Learn more about the deactivation process</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Soft Delete Timeline & Process:</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-blue-900 dark:text-blue-100">Immediate Deactivation</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      • Account access disabled immediately<br/>
                      • All API tokens and integrations revoked<br/>
                      • User data marked as soft-deleted with timestamp<br/>
                      • Cannot log in or access any DevSecureX services
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-blue-900 dark:text-blue-100">Retention Period (30 Days)</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      • All data preserved in secure, isolated storage<br/>
                      • Data remains inaccessible but intact for compliance<br/>
                      • Account restoration possible via support team<br/>
                      • Security monitoring continues for audit purposes
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-blue-900 dark:text-blue-100">Permanent Deletion (After 30 Days)</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      • All user data permanently purged from systems<br/>
                      • Scan results, repositories, and personal data removed<br/>
                      • Account cannot be restored after this point<br/>
                      • Process complies with enterprise data regulations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Contact */}
            <div className="p-4 bg-white/70 dark:bg-gray-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2 mb-2">
                <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Account Restoration Process</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Contact our enterprise support team within the 30-day retention window
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-blue-200 text-blue-800 dark:border-blue-700 dark:text-blue-200">
                    support@devsecurex.com
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-800 dark:border-blue-700 dark:text-blue-200">
                    24/7 Enterprise Support
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-800 dark:border-blue-700 dark:text-blue-200">
                    Priority Ticket System
                  </Badge>
                </div>
                
                <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-blue-700 dark:text-blue-300">
                    <strong>Required for restoration:</strong> Username, email verification, and business justification
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="p-4 bg-green-50/70 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-sm text-green-900 dark:text-green-100 mb-2">Enterprise Compliance Features</h4>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <li>• <strong>Audit Trail:</strong> Complete deletion process logging</li>
                <li>• <strong>GDPR Compliant:</strong> Right to erasure with retention period</li>
                <li>• <strong>SOC 2 Type II:</strong> Secure data handling and retention</li>
                <li>• <strong>Data Security:</strong> Encrypted storage during retention period</li>
                <li>• <strong>Access Control:</strong> No unauthorized access to soft-deleted data</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}