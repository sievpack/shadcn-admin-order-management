import { Loader2 } from 'lucide-react'

interface SheetLoadingProps {
  className?: string
}

export function SheetLoading({ className = '' }: SheetLoadingProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
  )
}
