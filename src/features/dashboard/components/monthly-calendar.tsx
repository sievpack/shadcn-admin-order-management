import React, { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

interface MonthlyCalendarProps {
  size?: string
  mdSize?: string
}

export function MonthlyCalendar({
  size = '600px',
  mdSize = '600px',
}: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const today = new Date()

  const calendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = calendarStart
    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }

  const days = calendarDays()

  return (
    <div className='rounded-lg border border-border bg-card p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <h2 className='text-lg font-semibold'>
          {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
        </h2>
        <Button
          variant='outline'
          size='icon'
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>

      <div
        className='grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border'
        style={{ height: size }}
      >
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className='flex items-center justify-center bg-muted p-2 text-sm font-medium'
          >
            {weekday}
          </div>
        ))}
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, today)
          const isFuture = day > today
          return (
            <div
              key={index}
              className={`flex flex-col items-center justify-center overflow-hidden bg-background p-2 ${
                !isCurrentMonth ? 'text-muted-foreground/40' : ''
              } ${isToday ? 'bg-primary text-primary-foreground' : ''} ${
                isFuture && isCurrentMonth ? 'text-muted-foreground/30' : ''
              }`}
            >
              <span className='text-xl font-medium'>{format(day, 'd')}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
