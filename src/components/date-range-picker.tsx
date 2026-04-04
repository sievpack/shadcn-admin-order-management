import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DateRangePickerProps = {
  value: DateRange | undefined
  onValueChange: (value: DateRange | undefined) => void
  placeholder?: string
}

export function DateRangePicker({
  value,
  onValueChange,
  placeholder = '选择日期范围',
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!value?.from}
          className='h-8 w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground'
        >
          <CalendarIcon data-icon="inline-start" />
          {value?.from ? (
            value.to ? (
              `${format(value.from, 'yyyy-MM-dd')} 至 ${format(value.to, 'yyyy-MM-dd')}`
            ) : (
              format(value.from, 'yyyy-MM-dd')
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='range'
          defaultMonth={value?.from || new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)}
          selected={value}
          onSelect={onValueChange}
          numberOfMonths={2}
          disabled={(date: Date) => {
            // 允许选择所有日期，只禁用1900年之前的日期
            return date < new Date('1900-01-01')
          }}
          locale={zhCN}
        />
      </PopoverContent>
    </Popover>
  )
}
