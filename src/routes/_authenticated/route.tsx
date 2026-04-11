import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

const ACCESS_TOKEN = 'thisisjustarandomstring'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const token = getCookie(ACCESS_TOKEN)
    if (!token) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: AuthenticatedLayout,
})
