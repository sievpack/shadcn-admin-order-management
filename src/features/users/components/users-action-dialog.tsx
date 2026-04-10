'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PasswordInput } from '@/components/password-input'
import { roleOptions } from '../data/data'
import { type User } from './users-columns'

const formSchema = z
  .object({
    username: z.string().min(1, '用户名不能为空'),
    password: z.string().optional(),
    first_name: z.string().min(1, '名不能为空'),
    last_name: z.string().min(1, '姓不能为空'),
    email: z
      .string()
      .email('请输入有效的邮箱地址')
      .optional()
      .or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    role: z.string().min(1, '请选择角色'),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.isEdit) return data.password && data.password.length >= 6
      return true
    },
    {
      message: '密码至少6位字符',
      path: ['password'],
    }
  )

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: UserActionDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!currentRow

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          username: currentRow.username || '',
          password: '',
          first_name: currentRow.first_name || '',
          last_name: currentRow.last_name || '',
          email: currentRow.email || '',
          phone: currentRow.phone || '',
          role: currentRow.role || '',
          isEdit: true,
        }
      : {
          username: '',
          password: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          role: '',
          isEdit: false,
        },
  })

  const onSubmit = async (values: UserForm) => {
    setLoading(true)
    try {
      if (isEdit && currentRow) {
        const response = await userAPI.updateUser({
          id: currentRow.id,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email || undefined,
          phone: values.phone || undefined,
          role: values.role,
        })
        showToastWithData({
          type: 'success',
          title: '用户更新成功',
          data: response.data,
        })
      } else {
        if (!values.password || values.password.length < 6) {
          showToastWithData({ type: 'error', title: '密码至少6位字符' })
          setLoading(false)
          return
        }
        const response = await userAPI.createUser({
          username: values.username,
          password: values.password,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email || undefined,
          phone: values.phone || undefined,
          role: values.role,
        })
        showToastWithData({
          type: 'success',
          title: '用户创建成功',
          data: response.data,
        })
      }
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '操作失败',
        data: error.response?.data?.detail || '操作失败',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新用户信息' : '创建新用户'}，完成后请点击保存。
          </DialogDescription>
        </DialogHeader>
        <div className='h-[450px] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col gap-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      用户名
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入用户名'
                        className='col-span-4'
                        disabled={isEdit}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='last_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>姓</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入姓'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='first_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>名</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入名'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入邮箱（可选）'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>手机</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入手机（可选）'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>角色</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='col-span-4'>
                          <SelectValue placeholder='选择角色' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              {isEdit ? (
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        新密码
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder='留空表示不修改'
                          className='col-span-4'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        密码
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder='请输入密码'
                          className='col-span-4'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
