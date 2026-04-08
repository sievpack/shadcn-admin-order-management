import React, { useState } from 'react'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { type DateRange } from 'react-day-picker'

interface MonthlyCalendarProps {
  size?: string
  mdSize?: string
}

export function MonthlyCalendar({ size = '0.5rem', mdSize = '0.5rem' }: MonthlyCalendarProps) {
  // 自动选择从当月1号到今天的日期范围
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  })

  // 禁用除了当前月份1号到今天之外的所有日期
  const isDateDisabled = (date: Date) => {
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    return date < firstDayOfMonth || date > currentDate
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Calendar
          mode="range"
          defaultMonth={calendarRange?.from}
          selected={calendarRange}
          onSelect={() => {}}
          disabled={isDateDisabled}
          showCaption={true}
          captionLayout="label"
          className={`w-full [--cell-size:${size}] md:[--cell-size:${mdSize}]`}
          components={{
            DayButton: ({ children, modifiers, day, ...props }) => {
              const isWeekend =
                day.date.getDay() === 0 || day.date.getDay() === 6
              return (
                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                  {children}
                </CalendarDayButton>
              )
            },
          }}
        />
      </CardContent>
    </Card>
  )
}