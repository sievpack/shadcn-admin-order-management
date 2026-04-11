'use client'

import { useState } from 'react'
import { userAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { InputConfirmDialog } from '@/components/common'
import { type User } from './users-columns'

type UsersDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User | null
  onSuccess?: () => void
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: UsersDeleteDialogProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!currentRow || value.trim() !== currentRow.username) return

    setLoading(true)
    try {
      const response = await userAPI.deleteUser(currentRow.id)
      showToastWithData({
        type: 'success',
        title: '用户删除成功',
        data: response.data,
      })
      onOpenChange(false)
      setValue('')
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
    <InputConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='删除用户'
      description={
        currentRow ? (
          <div className='flex flex-col gap-2'>
            <p>
              确定要删除用户{' '}
              <span className='font-bold'>{currentRow.username}</span> 吗？
            </p>
            <p>
              此操作将永久删除角色为{' '}
              <span className='font-bold'>{currentRow.role}</span> 的用户。
            </p>
          </div>
        ) : undefined
      }
      confirmLabel='删除'
      inputValue={value}
      onInputChange={setValue}
      matchValue={currentRow?.username || ''}
      onConfirm={handleDelete}
      isLoading={loading}
    />
  )
}
