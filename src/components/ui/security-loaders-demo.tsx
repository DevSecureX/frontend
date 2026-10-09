import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SecurityLoaders, type SecurityLoaderType } from './security-loaders'

interface LoaderDemoProps {
  name: string
  description: string
  component: React.ComponentType<any>
  usage: string
}

const loaderDemos: LoaderDemoProps[] = [
  {
    name: 'Radar Scanner',
    description: 'Sweeping radar animation for comprehensive security scanning',
    component: SecurityLoaders.radar,
    usage: 'Active security analysis, comprehensive scans'
  },
  {
    name: 'Code Analyzer',
    description: 'Binary code scanning with matrix-style effects',
    component: SecurityLoaders.code,
    usage: 'SAST tools, code analysis, static analysis'
  },
  {
    name: 'Queue Loader',
    description: 'Pulsing dots animation for scans waiting in queue',
    component: SecurityLoaders.queue,
    usage: 'Queued scans, waiting states'
  },
  {
    name: 'Security Shield',
    description: 'Static multi-layered shield with decorative rays',
    component: SecurityLoaders.shield,
    usage: 'General security scanning, protection analysis'
  },
  {
    name: 'SAST Loader',
    description: 'Specialized animation for static code analysis',
    component: SecurityLoaders.sast,
    usage: 'Static Application Security Testing'
  },
  {
    name: 'Secrets Scanner',
    description: 'Lock-based animation for secret detection',
    component: SecurityLoaders.secrets,
    usage: 'Secret scanning, credential detection'
  },
  {
    name: 'Dependency Scanner',
    description: 'Network nodes animation for dependency analysis',
    component: SecurityLoaders.dependency,
    usage: 'Dependency scanning, vulnerability analysis'
  },
  {
    name: 'Advanced Scanner',
    description: 'Hexagonal scanner with particle effects',
    component: SecurityLoaders.advanced,
    usage: 'Complex analysis, multi-tool scanning'
  }
]

export function SecurityLoadersDemo() {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">DevSecureX Security Loaders</h1>
        <p className="text-muted-foreground">
          Futuristic, interactive loaders that convey the sense of active security analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loaderDemos.map((loader) => {
          const LoaderComponent = loader.component
          return (
            <Card key={loader.name} className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{loader.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center py-4">
                  <LoaderComponent size="lg" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {loader.description}
                  </p>
                  <div className="text-xs">
                    <span className="font-medium">Usage:</span>
                    <br />
                    <span className="text-muted-foreground">{loader.usage}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Size Variations</h2>
        <div className="grid grid-cols-3 gap-8">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Card key={size} className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium capitalize">{size} Size</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <SecurityLoaders.radar size={size} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Integration Examples</h2>
        <div className="grid gap-4">
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <SecurityLoaders.shield size="sm" />
                Active Security Scan - Repository Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <SecurityLoaders.sast size="md" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Running SAST Analysis</p>
                  <p className="text-xs text-muted-foreground">Static Application Security Testing (1/3)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <SecurityLoaders.queue size="sm" />
                Queued Scans - Waiting for Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <SecurityLoaders.queue size="md" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Repository: my-app/frontend</p>
                  <p className="text-xs text-muted-foreground">Position 2 in queue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SecurityLoadersDemo