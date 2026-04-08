import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  return (
    <div className='flex gap-2'>
      <Button onClick={() => setOpen('add')}>
        <span>新增用户</span> <UserPlus data-icon='inline-end' />
      </Button>
    </div>
  )
}
