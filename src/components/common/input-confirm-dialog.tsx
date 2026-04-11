import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type InputConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmLabel?: string
  inputPlaceholder?: string
  inputValue: string
  onInputChange: (value: string) => void
  matchValue: string
  onConfirm: () => void
  isLoading?: boolean
}

export function InputConfirmDialog({
  open,
  onOpenChange,
  title = '确认操作',
  description,
  confirmLabel = '确认',
  inputPlaceholder,
  inputValue,
  onInputChange,
  matchValue,
  onConfirm,
  isLoading = false,
}: InputConfirmDialogProps) {
  const isMatch = inputValue.trim() === matchValue

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription asChild>
              <div>{description}</div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <div className='flex flex-col gap-4 py-4'>
          <Label className='flex flex-col items-start gap-1.5'>
            <span>请输入 "{matchValue}" 确认：</span>
            <Input
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inputPlaceholder || `输入 "${matchValue}" 确认`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>此操作无法撤销，请谨慎操作。</AlertDescription>
          </Alert>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!isMatch || isLoading}
            className='bg-destructive hover:bg-destructive/90'
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
