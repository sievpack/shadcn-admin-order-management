import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DialogBodyProps {
  loading?: boolean
  error?: string | null
  onClose?: () => void
  children: React.ReactNode
}

export function DialogBody({
  loading,
  error,
  onClose,
  children,
}: DialogBodyProps) {
  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='py-4'>
        <div className='rounded-md border border-destructive bg-destructive/10 p-4'>
          <p className='text-destructive'>{error}</p>
        </div>
        {onClose && (
          <div className='mt-4 flex justify-end'>
            <Button onClick={onClose} variant='outline'>
              关闭
            </Button>
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}
