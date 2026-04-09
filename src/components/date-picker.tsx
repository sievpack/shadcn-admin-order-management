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

function parseLocalDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDateForStorage(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type DatePickerProps = {
  value?: string
  onChange?: (date: string) => void
  selected?: Date | undefined
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  selected: selectedProp,
  onSelect: onSelectProp,
  placeholder = '选择日期',
  className,
}: DatePickerProps) {
  const isStringMode = value !== undefined || onChange !== undefined
  const selected = isStringMode
    ? value
      ? parseLocalDate(value)
      : undefined
    : selectedProp

  const handleSelect = (date: Date | undefined) => {
    if (isStringMode && onChange) {
      onChange(date ? formatDateForStorage(date) : '')
    } else if (onSelectProp) {
      onSelectProp(date)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!selected}
          className={
            className
              ? `${className} justify-start text-start font-normal data-[empty=true]:text-muted-foreground`
              : 'w-full justify-start text-start font-normal data-[empty=true]:text-muted-foreground'
          }
        >
          {selected ? (
            format(selected, 'yyyy年MM月dd日', { locale: zhCN })
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          selected={selected}
          onSelect={handleSelect}
          disabled={(date: Date) => {
            return date < new Date('1900-01-01')
          }}
          locale={zhCN}
        />
      </PopoverContent>
    </Popover>
  )
}
