import { Link } from '@tanstack/react-router'
import { useCurrentUser } from '@/queries'
import { cn } from '@/lib/utils'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'

function getAvatarFallback(lastName: string): string {
  if (!lastName) return '??'
  return lastName.slice(0, 2).toUpperCase()
}

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { data, isLoading } = useCurrentUser()

  const userData = data?.data?.data
  const userName = userData ? `${userData.last_name}${userData.first_name}` : ''
  const userEmail = userData?.email || ''

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='size-8'>
              <AvatarFallback
                className={cn(
                  'bg-primary/10 font-medium text-primary',
                  isLoading && 'animate-pulse'
                )}
              >
                {isLoading
                  ? '..'
                  : getAvatarFallback(userData?.last_name || '')}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>
                {isLoading ? '加载中...' : userName}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {isLoading ? '...' : userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                设置
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            退出登录
            <DropdownMenuShortcut className='text-current'>
              ⇧⌘Q
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
