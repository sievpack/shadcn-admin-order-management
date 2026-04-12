import { type ReactNode } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { NotificationPopover } from '@/components/notifications/notification-popover'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Header } from './header'

interface AppHeaderProps {
  showSearch?: boolean
  showNotification?: boolean
  showThemeSwitch?: boolean
  showConfigDrawer?: boolean
  showProfileDropdown?: boolean
  extraRight?: ReactNode
  fixed?: boolean
  className?: string
  children?: ReactNode
}

export function AppHeader({
  showSearch = true,
  showNotification = true,
  showThemeSwitch = true,
  showConfigDrawer = true,
  showProfileDropdown = true,
  extraRight,
  fixed,
  className,
  children,
}: AppHeaderProps) {
  const defaultRightContent = (
    <div className='ms-auto flex items-center gap-4'>
      {showNotification && <NotificationPopover />}
      {showThemeSwitch && <ThemeSwitch />}
      {showConfigDrawer && <ConfigDrawer />}
      {showProfileDropdown && <ProfileDropdown />}
      {extraRight}
    </div>
  )

  return (
    <Header fixed={fixed} className={className}>
      {children || (
        <>
          {showSearch && <SearchComponent />}
          {defaultRightContent}
        </>
      )}
    </Header>
  )
}
