'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { userAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from './users-columns'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
  onSuccess?: () => void
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (value.trim() !== currentRow.username) return

    setLoading(true)
    try {
      const response = await userAPI.deleteUser(currentRow.id)
      showToastWithData({
        type: 'success',
        title: '用户删除成功',
        data: response.data,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '删除失败',
        data: error.response?.data?.detail || '删除失败',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username || loading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除用户
        </span>
      }
      desc={
        <div className='flex flex-col gap-4'>
          <p className='mb-2'>
            确定要删除用户{' '}
            <span className='font-bold'>{currentRow.username}</span> 吗？
            <br />
            此操作将永久删除角色为{' '}
            <span className='font-bold'>{currentRow.role}</span>{' '}
            的用户。此操作无法撤销。
          </p>

          <Label className='my-2'>
            请输入用户名确认删除：
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`请输入 ${currentRow.username} 确认`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>请注意，此操作无法撤销。</AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
