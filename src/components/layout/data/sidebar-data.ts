import {
  Home,
  BarChart3,
  Folder,
  Database,
  FileText,
  ChevronRight,
  User,
  Activity,
  Settings,
  HelpCircle,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '管理员',
    email: 'admin@example.com',
    avatar: '',
  },
  teams: [
    {
      name: 'JNS订单管理系统',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
  ],
  navGroups: [
    {
      title: '主导航',
      items: [
        {
          title: '首页',
          url: '/',
          icon: Home,
        },
        {
          title: '订单管理',
          icon: BarChart3,
          items: [
            {
              title: '订单列表',
              url: '/orderlist',
            },
            {
              title: '订单分项',
              url: '/allorders',
            },
          ],
        },
        {
          title: '发货管理',
          icon: Folder,
          items: [
            {
              title: '已发货列表',
              url: '/shippinglist',
            },
            {
              title: '未发货列表',
              url: '/unshippedlist',
            },
          ],
        },
        {
          title: '客户管理',
          icon: User,
          items: [
            {
              title: '客户资料',
              url: '/customerlist',
            },
            {
              title: '客户报价单',
              url: '/quotelist',
            },
          ],
        },
        {
          title: '生产管理',
          icon: Activity,
          items: [],
        },
        {
          title: '外协管理',
          icon: Folder,
          items: [],
        },
        {
          title: '加工管理',
          url: '/',
          icon: FileText,
        },
        {
          title: '采购管理',
          icon: Database,
          items: [],
        },
        {
          title: '仓库管理',
          icon: Database,
          items: [],
        },
        {
          title: '财务管理',
          icon: FileText,
          items: [],
        },
        {
          title: '统计报表',
          icon: BarChart3,
          items: [
            {
              title: '月度统计',
              url: '/monthlyreport',
            },
            {
              title: '客户统计分析',
              url: '/customeryearlyreport',
            },
            {
              title: '行业统计分析',
              url: '/industryreport',
            },
            {
              title: '产品统计分析',
              url: '/productreport',
            },
          ],
        },
        {
          title: '用户管理',
          icon: User,
          url: '/users',
        },
        {
          title: '测试页面',
          icon: FileText,
          items: [
            {
              title: 'Tasks',
              url: '/tasks',
            },
          ],
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          title: '设置',
          url: '/settings',
          icon: Settings,
        },
        {
          title: '帮助中心',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
