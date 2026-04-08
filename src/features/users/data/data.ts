import { Shield, UserCheck, Users, CreditCard } from 'lucide-react'
import { type UserStatus } from './schema'

export const userStatuses = new Map<UserStatus, string>([
  [
    'active',
    'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400',
  ],
  [
    'inactive',
    'border-slate-500/50 bg-slate-500/10 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-400',
  ],
  [
    'invited',
    'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400',
  ],
  [
    'suspended',
    'border-red-500/50 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-400',
  ],
])

export const roles = [
  {
    label: '超级管理员',
    value: 'superadmin',
    icon: Shield,
  },
  {
    label: '管理员',
    value: 'admin',
    icon: UserCheck,
  },
  {
    label: '经理',
    value: 'manager',
    icon: Users,
  },
  {
    label: '收银员',
    value: 'cashier',
    icon: CreditCard,
  },
] as const

export const roleOptions = roles.map((r) => ({
  label: r.label,
  value: r.value,
}))
