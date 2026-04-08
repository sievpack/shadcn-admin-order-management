import * as React from 'react'
import { ChevronsUpDown, User, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const [userInfo, setUserInfo] = React.useState<{
    username: string
    first_name: string
    last_name: string
    role: string
    email?: string
  } | null>(null)

  React.useEffect(() => {
    const stored = localStorage.getItem('userInfo')
    if (stored) {
      setUserInfo(JSON.parse(stored))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    window.location.href = '/sign-in'
  }

  const displayName = userInfo
    ? `${userInfo.last_name}${userInfo.first_name}`
    : '未登录'

  const roleNames: Record<string, string> = {
    superadmin: '超级管理员',
    admin: '管理员',
    manager: '经理',
    cashier: '收银员',
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <User className='size-4' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{displayName}</span>
                <span className='truncate text-xs'>
                  {userInfo
                    ? roleNames[userInfo.role] || userInfo.role
                    : '用户'}
                </span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              当前用户
            </DropdownMenuLabel>
            {userInfo && (
              <>
                <DropdownMenuItem className='gap-2 p-2'>
                  <div className='flex size-6 items-center justify-center rounded-sm border'>
                    <User className='size-4' />
                  </div>
                  <div className='flex flex-col'>
                    <span>{displayName}</span>
                    <span className='text-xs text-muted-foreground'>
                      {userInfo.username}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='gap-2 p-2 text-red-500'
                  onClick={handleLogout}
                >
                  <div className='flex size-6 items-center justify-center rounded-sm border'>
                    <LogOut className='size-4' />
                  </div>
                  <span>退出登录</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
