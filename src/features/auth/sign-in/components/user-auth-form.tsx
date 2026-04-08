import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Shield, User, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { authAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface UserAuthFormProps {
  redirectTo?: string
}

export function UserAuthForm({ redirectTo }: UserAuthFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.login({ username, password })
      if (response.data.code === 0) {
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem(
          'userInfo',
          JSON.stringify(response.data.data.user)
        )
        toast.success('登录成功')
        navigate({ to: '/' })
      } else {
        toast.error('登录失败，请检查用户名和密码')
      }
    } catch (error) {
      console.error('登录错误:', error)
      toast.error('登录失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground'>
          <Shield size={32} />
        </div>
        <h2 className='text-3xl font-bold tracking-tight text-foreground'>
          嘉尼索管理系统
        </h2>
        <p className='mt-2 text-sm text-muted-foreground'>请登录以访问系统</p>
      </div>

      <form className='flex flex-col gap-6' onSubmit={handleLogin}>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='username'
              className='text-sm font-medium text-foreground'
            >
              用户名
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <User
                  className='text-muted-foreground'
                  data-icon='inline-start'
                />
              </div>
              <Input
                id='username'
                name='username'
                type='text'
                autoComplete='username'
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='pl-10'
                placeholder='请输入用户名'
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label
              htmlFor='password'
              className='text-sm font-medium text-foreground'
            >
              密码
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <Lock
                  className='text-muted-foreground'
                  data-icon='inline-start'
                />
              </div>
              <Input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                autoComplete='current-password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='pr-10 pl-10'
                placeholder='请输入密码'
              />
              <button
                type='button'
                className='absolute inset-y-0 right-0 flex items-center pr-3'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff
                    className='text-muted-foreground hover:text-foreground'
                    data-icon='inline-end'
                  />
                ) : (
                  <Eye
                    className='text-muted-foreground hover:text-foreground'
                    data-icon='inline-end'
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <input
              id='remember-me'
              name='remember-me'
              type='checkbox'
              className='h-4 w-4 rounded border-input text-primary focus:ring-ring'
            />
            <label
              htmlFor='remember-me'
              className='ml-2 block text-sm text-foreground'
            >
              记住我
            </label>
          </div>

          <div className='text-sm'>
            <a
              href='#'
              className='font-medium text-primary hover:text-primary/80'
            >
              忘记密码?
            </a>
          </div>
        </div>

        <div>
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </div>

        <div className='text-center text-sm text-muted-foreground'>
          <span>© 2026 嘉尼索管理系统. All rights reserved.</span>
        </div>
      </form>
    </div>
  )
}
