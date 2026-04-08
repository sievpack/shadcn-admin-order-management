import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from './tasks-provider'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className='flex gap-2'>
      <Button variant='outline' onClick={() => setOpen('import')}>
        <span>Import</span> <Download data-icon='inline-end' />
      </Button>
      <Button onClick={() => setOpen('create')}>
        <span>Create</span> <Plus data-icon='inline-end' />
      </Button>
    </div>
  )
}
