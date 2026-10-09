/**
 * ScanDialogComparison.tsx
 * 
 * This file demonstrates the different scan dialog approaches available:
 * 1. Original NewScanDialog - Complex with meaningless mode/scope distinctions
 * 2. EnhancedNewScanDialog - Improved UX but still has the same underlying issues
 * 3. SimplifiedNewScanDialog - Clean UX that removes meaningless choices
 * 
 * After backend restrictions were removed, all modes and scopes run identical scans.
 * The SimplifiedNewScanDialog addresses this by providing a streamlined "just scan my code" experience.
 */

import { useState } from 'react'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Zap, AlertTriangle, CheckCircle } from 'lucide-react'
import { NewScanDialog } from './NewScanDialog'
import { EnhancedNewScanDialog } from './EnhancedNewScanDialog'
import { SimplifiedNewScanDialog } from './SimplifiedNewScanDialog'
import type { Repository } from '@/types/global'

interface ScanDialogComparisonProps {
  repositories: Repository[]
  isLoadingRepos?: boolean
}

export function ScanDialogComparison({ repositories, isLoadingRepos }: ScanDialogComparisonProps) {
  const [originalOpen, setOriginalOpen] = useState(false)
  const [enhancedOpen, setEnhancedOpen] = useState(false)
  const [simplifiedOpen, setSimplifiedOpen] = useState(false)

  const handleSuccess = () => {
    setOriginalOpen(false)
    setEnhancedOpen(false)
    setSimplifiedOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Scan Dialog Comparison</h2>
        <p className="text-muted-foreground">
          Compare different approaches to the scan configuration UI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Original Dialog */}
        <Card className="relative">
          <div className="absolute -top-2 -right-2">
            <Badge variant="destructive" className="text-xs">
              Issues
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Original Dialog</CardTitle>
            </div>
            <CardDescription>
              Complex multi-step flow with meaningless mode/scope distinctions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-red-600">Problems:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Fast vs Comprehensive: Both run ALL tools</li>
                <li>• Scope options: All run ALL tools anyway</li>
                <li>• 4-step wizard for identical outcomes</li>
                <li>• Cognitive overload with no real choice</li>
                <li>• Misleading labels and descriptions</li>
              </ul>
            </div>
            
            <Dialog open={originalOpen} onOpenChange={setOriginalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Try Original Dialog
                </Button>
              </DialogTrigger>
              <NewScanDialog
                repositories={repositories}
                isLoadingRepos={isLoadingRepos}
                onSuccess={handleSuccess}
                open={originalOpen}
                onOpenChange={setOriginalOpen}
              />
            </Dialog>
          </CardContent>
        </Card>

        {/* Enhanced Dialog */}
        <Card className="relative">
          <div className="absolute -top-2 -right-2">
            <Badge variant="secondary" className="text-xs">
              Better UX
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Enhanced Dialog</CardTitle>
            </div>
            <CardDescription>
              Improved UX with collapsible steps, but same underlying issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-blue-600">Improvements:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Better visual design and progress</li>
                <li>• Collapsible step navigation</li>
                <li>• More intuitive rule selection</li>
              </ul>
              <h4 className="font-semibold text-sm text-orange-600">Still has:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Meaningless mode/scope choices</li>
                <li>• Complex flow for simple task</li>
              </ul>
            </div>
            
            <Dialog open={enhancedOpen} onOpenChange={setEnhancedOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Try Enhanced Dialog
                </Button>
              </DialogTrigger>
              <EnhancedNewScanDialog
                repositories={repositories}
                isLoadingRepos={isLoadingRepos}
                onSuccess={handleSuccess}
              />
            </Dialog>
          </CardContent>
        </Card>

        {/* Simplified Dialog */}
        <Card className="relative border-green-200 dark:border-green-800">
          <div className="absolute -top-2 -right-2">
            <Badge variant="default" className="text-xs bg-green-600">
              Recommended
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Simplified Dialog</CardTitle>
            </div>
            <CardDescription>
              Clean "just scan my code" experience without meaningless choices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-green-600">Solutions:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Removes Fast vs Comprehensive distinction</li>
                <li>• No confusing scope options</li>
                <li>• Clear "all tools included" messaging</li>
                <li>• Simple repository + rules selection</li>
                <li>• Focuses on what users actually control</li>
                <li>• Optional advanced rule customization</li>
              </ul>
            </div>
            
            <Dialog open={simplifiedOpen} onOpenChange={setSimplifiedOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Try Simplified Dialog
                </Button>
              </DialogTrigger>
              <SimplifiedNewScanDialog
                repositories={repositories}
                isLoadingRepos={isLoadingRepos}
                onSuccess={handleSuccess}
                open={simplifiedOpen}
                onOpenChange={setSimplifiedOpen}
              />
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Notes */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Implementation Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-2">Backend Reality:</h4>
            <p className="text-sm text-muted-foreground">
              After removing backend restrictions, all modes and scopes now run identical comprehensive security scans. 
              The only differences were caching (fast) vs fresh analysis (comprehensive), which users don't care about.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-2">Simplified Dialog Approach:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Always sends <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">mode: 'comprehensive'</code> and <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">scope: 'full'</code></li>
              <li>• Clearly communicates that all security tools are included</li>
              <li>• Focuses UX on repository selection and optional rule customization</li>
              <li>• Provides quick presets (Recommended, Maximum, None) for rule selection</li>
              <li>• Advanced mode available for detailed rule browsing</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Migration Strategy:</h4>
            <p className="text-sm text-muted-foreground">
              Replace <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">NewScanDialog</code> usage with <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">SimplifiedNewScanDialog</code> 
              for a cleaner user experience that matches the backend reality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}