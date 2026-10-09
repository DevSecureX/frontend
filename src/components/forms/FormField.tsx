import React from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface BaseFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

interface TextFieldProps<TFieldValues extends FieldValues = FieldValues> 
  extends BaseFieldProps<TFieldValues> {
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'number'
  maxLength?: number
  minLength?: number
}

interface TextAreaFieldProps<TFieldValues extends FieldValues = FieldValues> 
  extends BaseFieldProps<TFieldValues> {
  rows?: number
  maxLength?: number
}

interface SelectFieldProps<TFieldValues extends FieldValues = FieldValues> 
  extends BaseFieldProps<TFieldValues> {
  options: Array<{ value: string; label: string; disabled?: boolean }>
  multiple?: boolean
}

interface CheckboxFieldProps<TFieldValues extends FieldValues = FieldValues> 
  extends BaseFieldProps<TFieldValues> {
  // Checkbox-specific props can be added here
}

interface RadioFieldProps<TFieldValues extends FieldValues = FieldValues> 
  extends BaseFieldProps<TFieldValues> {
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>
  orientation?: 'horizontal' | 'vertical'
}

// Base form field wrapper
function FormFieldWrapper({ 
  label, 
  description, 
  required, 
  error, 
  children,
  className 
}: {
  label?: string
  description?: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

// Text Input Field
export function TextField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  placeholder,
  required,
  disabled,
  type = 'text',
  maxLength,
  minLength,
  className
}: TextFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required ? `${label ?? name} is required` : false }
  })

  return (
    <FormFieldWrapper
      label={label}
      description={description}
      required={required}
      error={error?.message}
      className={className}
    >
      <Input
        {...field}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        className={error ? 'border-destructive' : ''}
      />
    </FormFieldWrapper>
  )
}

// Textarea Field
export function TextAreaField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  placeholder,
  required,
  disabled,
  rows = 3,
  maxLength,
  className
}: TextAreaFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required ? `${label ?? name} is required` : false }
  })

  return (
    <FormFieldWrapper
      label={label}
      description={description}
      required={required}
      error={error?.message}
      className={className}
    >
      <Textarea
        {...field}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={error ? 'border-destructive' : ''}
      />
      {maxLength && (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {field.value?.length || 0}/{maxLength}
          </span>
        </div>
      )}
    </FormFieldWrapper>
  )
}

// Select Field
export function SelectField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  placeholder,
  required,
  disabled,
  options,
  className
}: SelectFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required ? `${label ?? name} is required` : false }
  })

  return (
    <FormFieldWrapper
      label={label}
      description={description}
      required={required}
      error={error?.message}
      className={className}
    >
      <Select
        value={field.value}
        onValueChange={field.onChange}
        disabled={disabled}
      >
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  )
}

// Checkbox Field
export function CheckboxField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  required,
  disabled,
  className
}: CheckboxFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required ? `${label ?? name} is required` : false }
  })

  return (
    <FormFieldWrapper
      description={description}
      error={error?.message}
      className={className}
    >
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={disabled}
        />
        {label && (
          <Label
            htmlFor={name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
      </div>
    </FormFieldWrapper>
  )
}

// Radio Group Field
export function RadioField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  required,
  disabled,
  options,
  orientation = 'vertical',
  className
}: RadioFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required ? `${label ?? name} is required` : false }
  })

  return (
    <FormFieldWrapper
      label={label}
      description={description}
      required={required}
      error={error?.message}
      className={className}
    >
      <RadioGroup
        value={field.value}
        onValueChange={field.onChange}
        disabled={disabled}
        className={orientation === 'horizontal' ? 'flex flex-wrap gap-6' : 'space-y-2'}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option.value} 
              id={`${name}-${option.value}`}
              disabled={option.disabled}
            />
            <div className="space-y-1">
              <Label
                htmlFor={`${name}-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    </FormFieldWrapper>
  )
}

// File Upload Field (basic implementation)
interface FileFieldProps<TFieldValues extends FieldValues = FieldValues> 
  extends BaseFieldProps<TFieldValues> {
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
}

export function FileField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  required,
  disabled,
  accept,
  multiple,
  maxSize,
  className
}: FileFieldProps<TFieldValues>) {
  const {
    field: { onChange, value, ...field },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required ? `${label ?? name} is required` : false }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Validate file size if maxSize is specified
    if (maxSize) {
      const oversizedFiles = Array.from(files).filter(file => file.size > maxSize)
      if (oversizedFiles.length > 0) {
        // You could set a custom error here
        return
      }
    }

    onChange(multiple ? files : files[0])
  }

  return (
    <FormFieldWrapper
      label={label}
      description={description}
      required={required}
      error={error?.message}
      className={className}
    >
      <Input
        {...field}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleFileChange}
        className={error ? 'border-destructive' : ''}
      />
      {maxSize && (
        <p className="text-xs text-muted-foreground">
          Max file size: {(maxSize / 1024 / 1024).toFixed(1)}MB
        </p>
      )}
    </FormFieldWrapper>
  )
}