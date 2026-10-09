import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  className?: string
  classNames?: {
    months?: string
    month?: string
    caption?: string
    caption_label?: string
    nav?: string
    nav_button?: string
    nav_button_previous?: string
    nav_button_next?: string
    table?: string
    head_row?: string
    head_cell?: string
    row?: string
    cell?: string
    day?: string
    day_selected?: string
    day_today?: string
    day_outside?: string
    day_disabled?: string
    day_range_middle?: string
    day_hidden?: string
  }
  showOutsideDays?: boolean
  selected?: Date | Date[] | { from: Date; to?: Date }
  onSelect?: (date: Date | Date[] | { from: Date; to?: Date } | undefined) => void
  mode?: "single" | "multiple" | "range"
  disabled?: (date: Date) => boolean
  defaultMonth?: Date
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  mode = "single",
  disabled,
  defaultMonth,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(defaultMonth || new Date())
  
  const today = new Date()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
  
  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    if (showOutsideDays) {
      const prevMonth = new Date(month.getFullYear(), month.getMonth() - 1, 0)
      const day = prevMonth.getDate() - firstDayOfMonth + i + 1
      days.push({
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day),
        isCurrentMonth: false,
        day
      })
    } else {
      days.push(null)
    }
  }
  
  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(month.getFullYear(), month.getMonth(), day),
      isCurrentMonth: true,
      day
    })
  }
  
  // Add days from next month to fill the grid
  const remainingCells = 42 - days.length // 6 rows * 7 days
  for (let day = 1; day <= remainingCells && showOutsideDays; day++) {
    days.push({
      date: new Date(month.getFullYear(), month.getMonth() + 1, day),
      isCurrentMonth: false,
      day
    })
  }
  
  const isSelected = (date: Date) => {
    if (!selected) return false
    
    if (mode === "single" && selected instanceof Date) {
      return date.toDateString() === selected.toDateString()
    }
    
    if (mode === "multiple" && Array.isArray(selected)) {
      return selected.some(d => d.toDateString() === date.toDateString())
    }
    
    if (mode === "range" && selected && typeof selected === "object" && "from" in selected) {
      const { from, to } = selected
      if (!to) return date.toDateString() === from.toDateString()
      return date >= from && date <= to
    }
    
    return false
  }
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }
  
  const handleDayClick = (date: Date) => {
    if (disabled?.(date)) return
    
    if (mode === "single") {
      onSelect?.(date)
    } else if (mode === "multiple") {
      const currentSelected = Array.isArray(selected) ? selected : []
      const isAlreadySelected = currentSelected.some(d => d.toDateString() === date.toDateString())
      
      if (isAlreadySelected) {
        onSelect?.(currentSelected.filter(d => d.toDateString() !== date.toDateString()))
      } else {
        onSelect?.([...currentSelected, date])
      }
    } else if (mode === "range") {
      const currentRange = selected && typeof selected === "object" && "from" in selected ? selected : null
      
      if (!currentRange || (currentRange.from && currentRange.to)) {
        onSelect?.({ from: date })
      } else if (currentRange.from && !currentRange.to) {
        if (date < currentRange.from) {
          onSelect?.({ from: date })
        } else {
          onSelect?.({ from: currentRange.from, to: date })
        }
      }
    }
  }
  
  const goToPreviousMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1))
  }
  
  const goToNextMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1))
  }
  
  return (
    <div className={cn("p-3", className)} {...props}>
      <div className={cn("flex justify-between items-center mb-4", classNames?.nav)}>
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
          className={cn("h-7 w-7", classNames?.nav_button, classNames?.nav_button_previous)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className={cn("font-semibold", classNames?.caption_label)}>
          {monthNames[month.getMonth()]} {month.getFullYear()}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          className={cn("h-7 w-7", classNames?.nav_button, classNames?.nav_button_next)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className={cn("grid grid-cols-7 gap-1", classNames?.table)}>
        {dayNames.map(dayName => (
          <div
            key={dayName}
            className={cn("p-2 text-center text-sm font-medium text-muted-foreground", classNames?.head_cell)}
          >
            {dayName}
          </div>
        ))}
        
        {days.map((dayInfo, index) => {
          if (!dayInfo) {
            return <div key={index} className="p-2" />
          }
          
          const { date, isCurrentMonth, day } = dayInfo
          const selected = isSelected(date)
          const today = isToday(date)
          const isDisabled = disabled?.(date)
          
          return (
            <button
              key={index}
              onClick={() => handleDayClick(date)}
              disabled={isDisabled}
              className={cn(
                "p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                !isCurrentMonth && "text-muted-foreground/50",
                selected && "bg-primary text-primary-foreground hover:bg-primary/90",
                today && !selected && "bg-accent text-accent-foreground font-semibold",
                classNames?.day,
                selected && classNames?.day_selected,
                today && classNames?.day_today,
                !isCurrentMonth && classNames?.day_outside,
                isDisabled && classNames?.day_disabled
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"