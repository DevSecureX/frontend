import React, { useState, useCallback } from 'react'
import type { UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepConfig<TFormData extends FieldValues = FieldValues> {
  id: string
  title: string
  description?: string
  schema: z.ZodSchema<any>
  component: React.ComponentType<StepComponentProps<TFormData>>
  optional?: boolean
  condition?: (data: Partial<TFormData>) => boolean
}

interface StepComponentProps<TFormData extends FieldValues = FieldValues> {
  form: UseFormReturn<TFormData>
  onNext?: () => void
  onPrevious?: () => void
  isFirst: boolean
  isLast: boolean
  canGoNext: boolean
  canGoPrevious: boolean
}

interface MultiStepFormProps<TFormData extends FieldValues = FieldValues> {
  steps: StepConfig<TFormData>[]
  defaultValues?: DefaultValues<TFormData>
  onSubmit: (data: TFormData) => void | Promise<void>
  onCancel?: () => void
  title?: string
  description?: string
  showProgress?: boolean
  showStepNumbers?: boolean
  submitButtonText?: string
  cancelButtonText?: string
  nextButtonText?: string
  previousButtonText?: string
  className?: string
}

export function MultiStepForm<TFormData extends FieldValues = FieldValues>({
  steps,
  defaultValues,
  onSubmit,
  onCancel,
  title,
  description,
  showProgress = true,
  showStepNumbers = true,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  nextButtonText = 'Next',
  previousButtonText = 'Previous',
  className
}: MultiStepFormProps<TFormData>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get visible steps based on conditions
  const getVisibleSteps = useCallback((formData: Partial<TFormData>) => {
    return steps.filter(step => !step.condition || step.condition(formData))
  }, [steps])

  // Combined schema for all steps
  const combinedSchema = React.useMemo(() => {
    return z.object(
      steps.reduce((acc, step) => {
        // If step is optional, make the schema optional
        if (step.optional && 'partial' in step.schema && 'shape' in step.schema) {
          return { ...acc, ...(step.schema as any).partial().shape }
        }
        if ('shape' in step.schema) {
          return { ...acc, ...(step.schema as any).shape }
        }
        return acc
      }, {} as Record<string, z.ZodTypeAny>)
    )
  }, [steps])

  const form = useForm<TFormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues,
    mode: 'onChange'
  })

  const watchedData = form.watch()
  const visibleSteps = getVisibleSteps(watchedData)
  const currentStep = visibleSteps[currentStepIndex]

  // Check if current step is valid
  const validateCurrentStep = useCallback(async () => {
    if (!currentStep) return false

    try {
      const stepData = form.getValues()
      await currentStep.schema.parseAsync(stepData)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          form.setError(err.path.join('.') as any, {
            type: 'manual',
            message: err.message
          })
        })
      }
      return false
    }
  }, [currentStep, form])

  const goToNext = useCallback(async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStepIndex < visibleSteps.length - 1) {
      setCompletedSteps(prev => new Set(prev.add(currentStepIndex)))
      setCurrentStepIndex(prev => prev + 1)
    }
  }, [currentStepIndex, visibleSteps.length, validateCurrentStep])

  const goToPrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex])

  const goToStep = useCallback(async (stepIndex: number) => {
    if (stepIndex < currentStepIndex || completedSteps.has(stepIndex)) {
      setCurrentStepIndex(stepIndex)
    } else if (stepIndex === currentStepIndex + 1) {
      await goToNext()
    }
  }, [currentStepIndex, completedSteps, goToNext])

  const handleSubmit = useCallback(async (data: TFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit])

  const canGoNext = React.useMemo(() => {
    if (!currentStep) return false
    return !form.formState.errors || Object.keys(form.formState.errors).length === 0
  }, [currentStep, form.formState.errors])

  const canGoPrevious = currentStepIndex > 0
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === visibleSteps.length - 1

  const progressPercentage = React.useMemo(() => {
    return ((currentStepIndex + 1) / visibleSteps.length) * 100
  }, [currentStepIndex, visibleSteps.length])

  if (visibleSteps.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No steps available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const StepComponent = currentStep.component

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        {/* Progress indicator */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStepIndex + 1} of {visibleSteps.length}</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Step navigation */}
        {showStepNumbers && visibleSteps.length > 1 && (
          <div className="flex items-center justify-center space-x-2">
            {visibleSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-medium transition-colors',
                  index === currentStepIndex && 'border-primary bg-primary text-primary-foreground',
                  index < currentStepIndex && 'border-green-500 bg-green-500 text-white',
                  index > currentStepIndex && 'border-muted-foreground/30 text-muted-foreground',
                  (index < currentStepIndex || completedSteps.has(index)) && 'cursor-pointer hover:scale-105'
                )}
                disabled={index > currentStepIndex && !completedSteps.has(index)}
              >
                {completedSteps.has(index) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </button>
            ))}
          </div>
        )}

        {/* Current step header */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold">{currentStep.title}</h3>
          {currentStep.description && (
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          )}
          {currentStep.optional && (
            <Badge variant="secondary" className="text-xs">
              Optional
            </Badge>
          )}
        </div>

        {/* Form content */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <StepComponent
              form={form}
              onNext={goToNext}
              onPrevious={goToPrevious}
              isFirst={isFirst}
              isLast={isLast}
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
            />

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    {cancelButtonText}
                  </Button>
                )}
                
                {canGoPrevious && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPrevious}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {previousButtonText}
                  </Button>
                )}
              </div>

              <div>
                {isLast ? (
                  <Button
                    type="submit"
                    disabled={!canGoNext || isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? 'Submitting...' : submitButtonText}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={goToNext}
                    disabled={!canGoNext || isSubmitting}
                    className="gap-2"
                  >
                    {nextButtonText}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}

// Hook for managing multi-step form state
export function useMultiStepForm<TFormData extends FieldValues = FieldValues>(
  steps: StepConfig<TFormData>[],
  defaultValues?: DefaultValues<TFormData>
) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const form = useForm<TFormData>({
    defaultValues,
    mode: 'onChange'
  })

  const watchedData = form.watch()
  const visibleSteps = React.useMemo(() => {
    return steps.filter(step => !step.condition || step.condition(watchedData))
  }, [steps, watchedData])

  const currentStep = visibleSteps[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === visibleSteps.length - 1

  const goToNext = useCallback(() => {
    if (currentStepIndex < visibleSteps.length - 1) {
      setCompletedSteps(prev => new Set(prev.add(currentStepIndex)))
      setCurrentStepIndex(prev => prev + 1)
    }
  }, [currentStepIndex, visibleSteps.length])

  const goToPrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex])

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < visibleSteps.length) {
      setCurrentStepIndex(stepIndex)
    }
  }, [visibleSteps.length])

  const reset = useCallback(() => {
    setCurrentStepIndex(0)
    setCompletedSteps(new Set())
    form.reset()
  }, [form])

  return {
    form,
    currentStep,
    currentStepIndex,
    visibleSteps,
    completedSteps,
    isFirst,
    isLast,
    goToNext,
    goToPrevious,
    goToStep,
    reset,
    progress: ((currentStepIndex + 1) / visibleSteps.length) * 100
  }
}