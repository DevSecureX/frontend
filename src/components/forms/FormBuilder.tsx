import React from 'react'
import type { FieldValues, DefaultValues } from 'react-hook-form';
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  TextField, 
  TextAreaField, 
  SelectField, 
  CheckboxField, 
  RadioField, 
  FileField 
} from './FormField'
import { ConditionalField, ConditionalSection } from './ConditionalField'

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url'
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file'
  | 'custom'

export interface BaseFieldConfig<TFormData extends FieldValues = FieldValues> {
  name: keyof TFormData
  type: FieldType
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  condition?: (data: Partial<TFormData>) => boolean
}

export interface TextFieldConfig<TFormData extends FieldValues = FieldValues> 
  extends BaseFieldConfig<TFormData> {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  maxLength?: number
  minLength?: number
}

export interface TextAreaFieldConfig<TFormData extends FieldValues = FieldValues> 
  extends BaseFieldConfig<TFormData> {
  type: 'textarea'
  rows?: number
  maxLength?: number
}

export interface SelectFieldConfig<TFormData extends FieldValues = FieldValues> 
  extends BaseFieldConfig<TFormData> {
  type: 'select'
  options: Array<{ value: string; label: string; disabled?: boolean }>
  multiple?: boolean
}

export interface CheckboxFieldConfig<TFormData extends FieldValues = FieldValues> 
  extends BaseFieldConfig<TFormData> {
  type: 'checkbox'
}

export interface RadioFieldConfig<TFormData extends FieldValues = FieldValues> 
  extends BaseFieldConfig<TFormData> {
  type: 'radio'
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>
  orientation?: 'horizontal' | 'vertical'
}

export interface FileFieldConfig<TFormData extends FieldValues = FieldValues> 
  extends BaseFieldConfig<TFormData> {
  type: 'file'
  accept?: string
  multiple?: boolean
  maxSize?: number
}

export interface CustomFieldConfig<TFormData extends FieldValues = FieldValues> 
  extends BaseFieldConfig<TFormData> {
  type: 'custom'
  component: React.ComponentType<any>
  props?: Record<string, any>
}

export type FieldConfig<TFormData extends FieldValues = FieldValues> = 
  | TextFieldConfig<TFormData>
  | TextAreaFieldConfig<TFormData>
  | SelectFieldConfig<TFormData>
  | CheckboxFieldConfig<TFormData>
  | RadioFieldConfig<TFormData>
  | FileFieldConfig<TFormData>
  | CustomFieldConfig<TFormData>

export interface SectionConfig<TFormData extends FieldValues = FieldValues> {
  id: string
  title?: string
  description?: string
  fields: FieldConfig<TFormData>[]
  condition?: (data: Partial<TFormData>) => boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  className?: string
}

export interface FormBuilderProps<TFormData extends FieldValues = FieldValues> {
  schema: z.ZodSchema<TFormData>
  sections: SectionConfig<TFormData>[]
  defaultValues?: DefaultValues<TFormData>
  onSubmit: (data: TFormData) => void | Promise<void>
  onCancel?: () => void
  title?: string
  description?: string
  submitButtonText?: string
  cancelButtonText?: string
  showSubmitButton?: boolean
  showCancelButton?: boolean
  submitButtonProps?: React.ComponentProps<typeof Button>
  cancelButtonProps?: React.ComponentProps<typeof Button>
  className?: string
  cardProps?: React.ComponentProps<typeof Card>
  autoSave?: boolean
  autoSaveDelay?: number
  onAutoSave?: (data: Partial<TFormData>) => void
  showProgress?: boolean
  showErrorSummary?: boolean
}

export function FormBuilder<TFormData extends FieldValues = FieldValues>({
  schema,
  sections,
  defaultValues,
  onSubmit,
  onCancel,
  title,
  description,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  showSubmitButton = true,
  showCancelButton = false,
  submitButtonProps,
  cancelButtonProps,
  className,
  cardProps,
  autoSave = false,
  autoSaveDelay = 2000,
  onAutoSave,
  showProgress = false,
  showErrorSummary = false
}: FormBuilderProps<TFormData>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set())
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>()

  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  })

  const watchedData = form.watch()

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave || !onAutoSave) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      const formData = form.getValues()
      if (Object.keys(formData).length > 0) {
        onAutoSave(formData)
      }
    }, autoSaveDelay)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [watchedData, autoSave, onAutoSave, autoSaveDelay, form])

  const handleSubmit = React.useCallback(async (data: TFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit])

  const toggleSection = React.useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }, [])

  const renderField = React.useCallback((fieldConfig: FieldConfig<TFormData>) => {
    const baseProps = {
      name: fieldConfig.name as any,
      control: form.control,
      label: fieldConfig.label,
      description: fieldConfig.description,
      placeholder: fieldConfig.placeholder,
      required: fieldConfig.required,
      disabled: fieldConfig.disabled,
      className: fieldConfig.className
    }

    switch (fieldConfig.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url': {
        const textConfig = fieldConfig
        return (
          <TextField
            {...baseProps}
            type={textConfig.type}
            maxLength={textConfig.maxLength}
            minLength={textConfig.minLength}
          />
        )
      }

      case 'textarea': {
        const textareaConfig = fieldConfig
        return (
          <TextAreaField
            {...baseProps}
            rows={textareaConfig.rows}
            maxLength={textareaConfig.maxLength}
          />
        )
      }

      case 'select': {
        const selectConfig = fieldConfig
        return (
          <SelectField
            {...baseProps}
            options={selectConfig.options}
            multiple={selectConfig.multiple}
          />
        )
      }

      case 'checkbox':
        return <CheckboxField {...baseProps} />

      case 'radio': {
        const radioConfig = fieldConfig
        return (
          <RadioField
            {...baseProps}
            options={radioConfig.options}
            orientation={radioConfig.orientation}
          />
        )
      }

      case 'file': {
        const fileConfig = fieldConfig
        return (
          <FileField
            {...baseProps}
            accept={fileConfig.accept}
            multiple={fileConfig.multiple}
            maxSize={fileConfig.maxSize}
          />
        )
      }

      case 'custom': {
        const customConfig = fieldConfig
        const CustomComponent = customConfig.component
        return (
          <CustomComponent
            {...baseProps}
            {...customConfig.props}
          />
        )
      }

      default:
        return null
    }
  }, [form.control])

  // Get visible sections based on conditions
  const visibleSections = React.useMemo(() => {
    return sections.filter(section => !section.condition || section.condition(watchedData))
  }, [sections, watchedData])

  // Calculate progress
  const progress = React.useMemo(() => {
    if (!showProgress) return 0

    const totalFields = visibleSections.reduce((total, section) => {
      return total + section.fields.filter(field => !field.condition || field.condition(watchedData)).length
    }, 0)

    const filledFields = visibleSections.reduce((filled, section) => {
      return filled + section.fields.filter(field => {
        if (field.condition && !field.condition(watchedData)) return false
        const value = form.getValues(field.name as any)
        return value !== undefined && value !== '' && value !== null
      }).length
    }, 0)

    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0
  }, [visibleSections, watchedData, form, showProgress])

  // Get form errors summary
  const errorSummary = React.useMemo(() => {
    if (!showErrorSummary) return []
    
    return Object.entries(form.formState.errors).map(([field, error]) => ({
      field,
      message: error?.message ?? 'Invalid value'
    }))
  }, [form.formState.errors, showErrorSummary])

  return (
    <FormProvider {...form}>
      <Card className={cn('w-full', className)} {...cardProps}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
            {showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </CardHeader>
        )}

        <CardContent className="space-y-6">
          {/* Error Summary */}
          {errorSummary.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Please fix the following errors:</p>
                  <ul className="text-sm space-y-1">
                    {errorSummary.map((error, index) => (
                      <li key={index}>• {String(error.message)}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {visibleSections.map((section, sectionIndex) => {
              const isCollapsed = collapsedSections.has(section.id)
              const visibleFields = section.fields.filter(field => 
                !field.condition || field.condition(watchedData)
              )

              if (visibleFields.length === 0) return null

              return (
                <ConditionalSection
                  key={section.id}
                  control={form.control}
                  condition={() => !section.condition || section.condition(watchedData)}
                  className={cn('space-y-4', section.className)}
                >
                  {section.title && (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{section.title}</h3>
                        {section.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {section.description}
                          </p>
                        )}
                      </div>
                      {section.collapsible && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection(section.id)}
                        >
                          {isCollapsed ? 'Expand' : 'Collapse'}
                        </Button>
                      )}
                    </div>
                  )}

                  {(!section.collapsible || !isCollapsed) && (
                    <div className="grid gap-4">
                      {visibleFields.map((field, fieldIndex) => (
                        <ConditionalField
                          key={`${field.name as string}-${fieldIndex}`}
                          control={form.control}
                          condition={(data) => !field.condition || field.condition(data)}
                        >
                          {renderField(field)}
                        </ConditionalField>
                      ))}
                    </div>
                  )}

                  {sectionIndex < visibleSections.length - 1 && <Separator />}
                </ConditionalSection>
              )
            })}

            {/* Form Actions */}
            {(showSubmitButton || showCancelButton) && (
              <div className="flex items-center justify-end space-x-2 pt-6 border-t">
                {showCancelButton && onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    {...cancelButtonProps}
                  >
                    {cancelButtonText}
                  </Button>
                )}
                
                {showSubmitButton && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    {...submitButtonProps}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Submitting...' : submitButtonText}
                  </Button>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  )
}

// Hook for managing form builder state
export function useFormBuilder<TFormData extends FieldValues = FieldValues>(
  schema: z.ZodSchema<TFormData>,
  defaultValues?: DefaultValues<TFormData>
) {
  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  })

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = React.useCallback(async (
    onSubmit: (data: TFormData) => void | Promise<void>
  ) => {
    return form.handleSubmit(async (data) => {
      setIsSubmitting(true)
      try {
        await onSubmit(data)
      } finally {
        setIsSubmitting(false)
      }
    })
  }, [form])

  const reset = React.useCallback((values?: DefaultValues<TFormData>) => {
    form.reset(values)
    setIsSubmitting(false)
  }, [form])

  return {
    form,
    handleSubmit,
    reset,
    isSubmitting,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors
  }
}