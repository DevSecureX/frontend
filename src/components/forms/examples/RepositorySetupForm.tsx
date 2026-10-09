import React from 'react'
import { z } from 'zod'
import type { StepConfig } from '../MultiStepForm';
import { MultiStepForm } from '../MultiStepForm'
import { TextField, SelectField, CheckboxField, RadioField } from '../FormField'
import { ConditionalField } from '../ConditionalField'
import { connectRepositorySchema } from '@/lib/validations/security'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, GitBranch, Webhook, Settings } from 'lucide-react'

type RepositorySetupData = z.infer<typeof connectRepositorySchema>

// Step 1: Repository Selection
function RepositorySelectionStep({ form }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Repository Details
          </CardTitle>
          <CardDescription>
            Connect your repository to start security scanning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SelectField
            name="provider"
            control={form.control}
            label="Provider"
            required
            options={[
              { value: 'github', label: 'GitHub' },
              { value: 'gitlab', label: 'GitLab' },
              { value: 'bitbucket', label: 'Bitbucket' }
            ]}
          />

          <TextField
            name="repositoryUrl"
            control={form.control}
            label="Repository URL"
            type="url"
            required
            placeholder="https://github.com/username/repository"
          />

          <TextField
            name="fullName"
            control={form.control}
            label="Full Name"
            required
            placeholder="username/repository"
            description="Format: owner/repository-name"
          />

          <TextField
            name="name"
            control={form.control}
            label="Display Name"
            required
            placeholder="My Repository"
          />

          <CheckboxField
            name="isPrivate"
            control={form.control}
            label="This is a private repository"
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Step 2: Configuration
function ConfigurationStep({ form }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Branch Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextField
            name="defaultBranch"
            control={form.control}
            label="Default Branch"
            required
            placeholder="main"
          />

          <SelectField
            name="niche"
            control={form.control}
            label="Project Type"
            placeholder="Select project type"
            options={[
              { value: 'web_application', label: 'Web Application' },
              { value: 'mobile_app', label: 'Mobile App' },
              { value: 'api_service', label: 'API Service' },
              { value: 'library', label: 'Library' },
              { value: 'cli_tool', label: 'CLI Tool' },
              { value: 'infrastructure', label: 'Infrastructure' },
              { value: 'other', label: 'Other' }
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Scan Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CheckboxField
            name="autoScan"
            control={form.control}
            label="Enable automatic scanning"
          />

          <ConditionalField
            control={form.control}
            condition={(data) => data.autoScan === true}
          >
            <div className="ml-6 space-y-4 border-l-2 border-muted pl-4">
              <CheckboxField
                name="scanOnPush"
                control={form.control}
                label="Scan on push to default branch"
              />

              <CheckboxField
                name="scanOnPR"
                control={form.control}
                label="Scan on pull requests"
              />
            </div>
          </ConditionalField>
        </CardContent>
      </Card>
    </div>
  )
}

// Step 3: Webhooks
function WebhooksStep({ form }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure which events should trigger security scans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Webhook Events</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'push', label: 'Push Events', description: 'Triggered when code is pushed' },
                { value: 'pull_request', label: 'Pull Requests', description: 'Triggered on PR events' },
                { value: 'release', label: 'Releases', description: 'Triggered when releases are created' },
                { value: 'issues', label: 'Issues', description: 'Triggered on issue events' }
              ].map((event) => (
                <Card key={event.value} className="p-4">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      {...form.register('webhookEvents')}
                      value={event.value}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-sm">{event.label}</div>
                      <div className="text-xs text-muted-foreground">{event.description}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Step 4: Review
function ReviewStep({ form }: any) {
  const formData = form.watch()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Configuration</CardTitle>
          <CardDescription>
            Please review your repository configuration before connecting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Repository Details</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Provider:</dt>
                  <dd className="capitalize">{formData.provider}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name:</dt>
                  <dd>{formData.fullName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type:</dt>
                  <dd>{formData.isPrivate ? 'Private' : 'Public'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Default Branch:</dt>
                  <dd>{formData.defaultBranch}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-medium mb-2">Scan Configuration</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Auto Scan:</dt>
                  <dd>
                    <Badge variant={formData.autoScan ? 'default' : 'secondary'}>
                      {formData.autoScan ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </dd>
                </div>
                {formData.autoScan && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Scan on Push:</dt>
                      <dd>
                        <Badge variant={formData.scanOnPush ? 'default' : 'secondary'}>
                          {formData.scanOnPush ? 'Yes' : 'No'}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Scan on PR:</dt>
                      <dd>
                        <Badge variant={formData.scanOnPR ? 'default' : 'secondary'}>
                          {formData.scanOnPR ? 'Yes' : 'No'}
                        </Badge>
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>

          {formData.webhookEvents && formData.webhookEvents.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Webhook Events</h4>
              <div className="flex flex-wrap gap-2">
                {formData.webhookEvents.map((event: string) => (
                  <Badge key={event} variant="outline">
                    {event.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Main form configuration
const repositorySetupSteps: StepConfig<RepositorySetupData>[] = [
  {
    id: 'repository',
    title: 'Repository Selection',
    description: 'Choose your repository and basic settings',
    schema: connectRepositorySchema.pick({
      provider: true,
      repositoryUrl: true,
      fullName: true,
      name: true,
      isPrivate: true
    }),
    component: RepositorySelectionStep
  },
  {
    id: 'configuration',
    title: 'Configuration',
    description: 'Configure branches and scan settings',
    schema: connectRepositorySchema.pick({
      defaultBranch: true,
      niche: true,
      autoScan: true,
      scanOnPush: true,
      scanOnPR: true
    }),
    component: ConfigurationStep
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    description: 'Set up webhook events',
    schema: connectRepositorySchema.pick({
      webhookEvents: true
    }),
    component: WebhooksStep,
    optional: true
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review and confirm your settings',
    schema: z.object({}), // No validation needed for review step
    component: ReviewStep
  }
]

interface RepositorySetupFormProps {
  onSubmit: (data: RepositorySetupData) => void | Promise<void>
  onCancel?: () => void
  initialData?: Partial<RepositorySetupData>
}

export function RepositorySetupForm({
  onSubmit,
  onCancel,
  initialData
}: RepositorySetupFormProps) {
  const defaultValues: Partial<RepositorySetupData> = {
    provider: 'github',
    defaultBranch: 'main',
    isPrivate: false,
    autoScan: true,
    scanOnPush: true,
    scanOnPR: true,
    webhookEvents: ['push', 'pull_request'],
    ...initialData
  }

  return (
    <MultiStepForm
      steps={repositorySetupSteps}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      title="Connect Repository"
      description="Set up security scanning for your repository"
      showProgress
      showStepNumbers
      submitButtonText="Connect Repository"
      className="max-w-4xl mx-auto"
    />
  )
}