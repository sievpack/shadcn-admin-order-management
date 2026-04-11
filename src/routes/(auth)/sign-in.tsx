import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { SignIn } from '@/features/auth/sign-in'

const ACCESS_TOKEN = 'thisisjustarandomstring'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: () => {
    const token = getCookie(ACCESS_TOKEN)
    if (token) {
      throw redirect({ to: '/' })
    }
  },
  component: SignIn,
  validateSearch: searchSchema,
})
