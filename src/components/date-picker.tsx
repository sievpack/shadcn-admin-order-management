import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  selected: Date | undefined | Date[]
  onSelect: (date: Date | undefined | Date[]) => void
  placeholder?: string
  mode?: 'single' | 'range'
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Pick a date',
  mode = 'single',
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!selected}
          className='w-[240px] justify-start text-start font-normal data-[empty=true]:text-muted-foreground'
        >
          {selected ? (
            Array.isArray(selected) ? (
              selected.length === 2 && selected[0] instanceof Date && selected[1] instanceof Date ? (
                `${format(selected[0], 'yyyy年MM月dd日', { locale: zhCN })} 至 ${format(selected[1], 'yyyy年MM月dd日', { locale: zhCN })}`
              ) : selected.length === 1 && selected[0] instanceof Date ? (
                format(selected[0], 'yyyy年MM月dd日', { locale: zhCN })
              ) : (
                <span>{placeholder}</span>
              )
            ) : selected instanceof Date ? (
              format(selected, 'yyyy年MM月dd日', { locale: zhCN })
            ) : (
              <span>{placeholder}</span>
            )
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode={mode}
          captionLayout='dropdown'
          selected={selected}
          onSelect={onSelect}
          disabled={(date: Date) => {
            // 允许选择所有日期，只禁用1900年之前的日期
            return date < new Date('1900-01-01')
          }}
          numberOfMonths={mode === 'range' ? 2 : 1}
          locale={zhCN}
        />
      </PopoverContent>
    </Popover>
  )
}
