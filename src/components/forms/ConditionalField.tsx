import React from 'react'
import { useWatch, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

interface ConditionalFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  condition: (watchedValues: TFieldValues) => boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Basic conditional field that shows/hides based on form values
export function ConditionalField<TFieldValues extends FieldValues = FieldValues>({
  control,
  condition,
  children,
  fallback = null
}: ConditionalFieldProps<TFieldValues>) {
  const watchedValues = useWatch({ control })
  const shouldShow = condition(watchedValues as TFieldValues)

  return shouldShow ? <>{children}</> : <>{fallback}</>
}

// More specific conditional field that watches specific fields
interface WatchedConditionalFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  watch: FieldPath<TFieldValues> | FieldPath<TFieldValues>[]
  condition: (watchedValues: any) => boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function WatchedConditionalField<TFieldValues extends FieldValues = FieldValues>({
  control,
  watch: watchFields,
  condition,
  children,
  fallback = null
}: WatchedConditionalFieldProps<TFieldValues>) {
  const watchedValues = useWatch({
    control,
    name: Array.isArray(watchFields) ? watchFields : [watchFields]
  })
  
  const shouldShow = condition(watchedValues)

  return shouldShow ? <>{children}</> : <>{fallback}</>
}

// Conditional field with animation
interface AnimatedConditionalFieldProps<TFieldValues extends FieldValues = FieldValues> 
  extends ConditionalFieldProps<TFieldValues> {
  animationType?: 'fade' | 'slide' | 'scale'
  duration?: number
}

export function AnimatedConditionalField<TFieldValues extends FieldValues = FieldValues>({
  control,
  condition,
  children,
  fallback = null,
  animationType = 'fade',
  duration = 200
}: AnimatedConditionalFieldProps<TFieldValues>) {
  const watchedValues = useWatch({ control })
  const shouldShow = condition(watchedValues as TFieldValues)
  const [isVisible, setIsVisible] = React.useState(shouldShow)
  const [shouldRender, setShouldRender] = React.useState(shouldShow)

  React.useEffect(() => {
    if (shouldShow) {
      setShouldRender(true)
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
      setTimeout(() => setShouldRender(false), duration)
    }
  }, [shouldShow, duration])

  if (!shouldRender) {
    return <>{fallback}</>
  }

  const getAnimationClass = () => {
    const baseClass = 'transition-all duration-200 ease-in-out'
    
    switch (animationType) {
      case 'fade':
        return `${baseClass} ${isVisible ? 'opacity-100' : 'opacity-0'}`
      case 'slide':
        return `${baseClass} transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`
      case 'scale':
        return `${baseClass} transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`
      default:
        return baseClass
    }
  }

  return (
    <div className={getAnimationClass()}>
      {children}
    </div>
  )
}

// Multi-condition field with different content for each condition
interface MultiConditionalFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  conditions: Array<{
    condition: (watchedValues: TFieldValues) => boolean
    content: React.ReactNode
    priority?: number
  }>
  fallback?: React.ReactNode
}

export function MultiConditionalField<TFieldValues extends FieldValues = FieldValues>({
  control,
  conditions,
  fallback = null
}: MultiConditionalFieldProps<TFieldValues>) {
  const watchedValues = useWatch({ control })
  
  // Sort conditions by priority (higher priority first)
  const sortedConditions = React.useMemo(() => {
    return [...conditions].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  }, [conditions])

  // Find the first matching condition
  const matchingCondition = sortedConditions.find(item => item.condition(watchedValues as TFieldValues))

  return matchingCondition ? <>{matchingCondition.content}</> : <>{fallback}</>
}

// Dynamic field list based on conditions
interface DynamicFieldListProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  fields: Array<{
    id: string
    condition?: (watchedValues: TFieldValues) => boolean
    component: React.ReactNode
    dependencies?: FieldPath<TFieldValues>[]
  }>
  className?: string
}

export function DynamicFieldList<TFieldValues extends FieldValues = FieldValues>({
  control,
  fields,
  className = 'space-y-4'
}: DynamicFieldListProps<TFieldValues>) {
  const watchedValues = useWatch({ control })

  const visibleFields = React.useMemo(() => {
    return fields.filter(field => !field.condition || field.condition(watchedValues as TFieldValues))
  }, [fields, watchedValues])

  return (
    <div className={className}>
      {visibleFields.map(field => (
        <div key={field.id}>
          {field.component}
        </div>
      ))}
    </div>
  )
}

// Conditional section with header
interface ConditionalSectionProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  condition: (watchedValues: TFieldValues) => boolean
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ConditionalSection<TFieldValues extends FieldValues = FieldValues>({
  control,
  condition,
  title,
  description,
  children,
  className = 'space-y-4'
}: ConditionalSectionProps<TFieldValues>) {
  const watchedValues = useWatch({ control })
  const shouldShow = condition(watchedValues as TFieldValues)

  if (!shouldShow) return null

  return (
    <div className={className}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

// Field with progressive disclosure
interface ProgressiveFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  triggerField: FieldPath<TFieldValues>
  triggerValue: any
  children: React.ReactNode
  showLabel?: string
  hideLabel?: string
  startExpanded?: boolean
}

export function ProgressiveField<TFieldValues extends FieldValues = FieldValues>({
  control,
  triggerField,
  triggerValue,
  children,
  showLabel = 'Show advanced options',
  hideLabel = 'Hide advanced options',
  startExpanded = false
}: ProgressiveFieldProps<TFieldValues>) {
  const [isExpanded, setIsExpanded] = React.useState(startExpanded)
  const watchedValue = useWatch({
    control,
    name: triggerField
  })

  const shouldShowTrigger = React.useMemo(() => {
    if (Array.isArray(triggerValue)) {
      return triggerValue.includes(watchedValue)
    }
    return watchedValue === triggerValue
  }, [watchedValue, triggerValue])

  if (!shouldShowTrigger) {
    return null
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-primary hover:text-primary/80 underline"
      >
        {isExpanded ? hideLabel : showLabel}
      </button>
      
      <AnimatedConditionalField
        control={control}
        condition={() => isExpanded}
        animationType="slide"
      >
        {children}
      </AnimatedConditionalField>
    </div>
  )
}

// Utility hook for complex conditional logic
export function useConditionalFields<TFieldValues extends FieldValues = FieldValues>(
  control: Control<TFieldValues>
) {
  const watchedValues = useWatch({ control })

  const when = React.useCallback(<K extends FieldPath<TFieldValues>>(
    field: K,
    condition: (value: any) => boolean
  ) => {
    const fieldValue = watchedValues?.[field]
    return condition(fieldValue)
  }, [watchedValues])

  const equals = React.useCallback(<K extends FieldPath<TFieldValues>>(
    field: K,
    value: any
  ) => {
    return watchedValues?.[field] === value
  }, [watchedValues])

  const includes = React.useCallback(<K extends FieldPath<TFieldValues>>(
    field: K,
    value: any
  ) => {
    const fieldValue = watchedValues?.[field]
    return Array.isArray(fieldValue) && fieldValue.includes(value)
  }, [watchedValues])

  const isEmpty = React.useCallback(<K extends FieldPath<TFieldValues>>(
    field: K
  ) => {
    const fieldValue = watchedValues?.[field]
    return !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)
  }, [watchedValues])

  const isNotEmpty = React.useCallback(<K extends FieldPath<TFieldValues>>(
    field: K
  ) => {
    const fieldValue = watchedValues?.[field]
    return fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0)
  }, [watchedValues])

  const and = React.useCallback((...conditions: boolean[]) => {
    return conditions.every(condition => condition)
  }, [])

  const or = React.useCallback((...conditions: boolean[]) => {
    return conditions.some(condition => condition)
  }, [])

  return {
    watchedValues,
    when,
    equals,
    includes,
    isEmpty,
    isNotEmpty,
    and,
    or
  }
}