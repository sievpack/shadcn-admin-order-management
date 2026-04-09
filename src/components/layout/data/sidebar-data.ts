import {
  Home,
  BarChart3,
  Folder,
  Database,
  FileText,
  User,
  Activity,
  Settings,
  HelpCircle,
  Command,
  Send,
  ListOrdered,
  Warehouse,
  Book,
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
          icon: ListOrdered,
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
          icon: Send,
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
              title: '客户样品',
              url: '/customer-sample',
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
          items: [
            { title: '生产统计', url: '/production/stats' },
            { title: '生产计划', url: '/production/plan' },
            { title: '生产工单', url: '/production/order' },
            { title: '报工记录', url: '/production/report' },
            { title: '质检记录', url: '/production/qc' },
            { title: '成品入库', url: '/production/inbound' },
            { title: '物料消耗', url: '/production/material' },
          ],
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
          icon: Warehouse,
          items: [],
        },
        {
          title: '财务管理',
          icon: FileText,
          items: [
            { title: '财务报表', url: '/finance/stats' },
            { title: '应收账款', url: '/finance/ar' },
            { title: '收款记录', url: '/finance/collection' },
            { title: '应付账款', url: '/finance/ap' },
            { title: '付款记录', url: '/finance/payment' },
            { title: '凭证管理', url: '/finance/voucher' },
          ],
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
          title: '系统管理',
          icon: Book,
          items: [
            {
              title: '用户管理',
              url: '/users',
            },
            {
              title: '字典管理',
              url: '/dict/type',
            },
          ],
        },
        {
          title: '测试页面',
          icon: FileText,
          items: [
            {
              title: 'Tasks',
              url: '/tasks',
            },
            {
              title: '模板页面',
              url: '/template',
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
