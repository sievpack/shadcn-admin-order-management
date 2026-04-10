import { toast } from 'sonner'

export function showSubmittedData(
  data: unknown,
  title: string = 'You submitted the following values:'
) {
  toast.message(title, {
    description: (
      <pre className='mt-2 max-h-48 w-full overflow-auto rounded-md bg-slate-950 p-4'>
        <code className='break-all whitespace-pre-wrap text-white'>
          {JSON.stringify(data, null, 2)}
        </code>
      </pre>
    ),
  })
}

interface ToastWithDataOptions {
  type: 'success' | 'error'
  title: string
  data?: unknown
}

export function showToastWithData({ type, title, data }: ToastWithDataOptions) {
  const jsonContent = data ? (
    <pre className='mt-2 max-h-48 w-full overflow-auto rounded-md bg-slate-950 p-4'>
      <code className='break-all whitespace-pre-wrap text-white'>
        {JSON.stringify(data, null, 2)}
      </code>
    </pre>
  ) : null

  if (type === 'success') {
    if (jsonContent) {
      toast.success(title, { description: jsonContent })
    } else {
      toast.success(title)
    }
  } else {
    if (jsonContent) {
      toast.error(title, { description: jsonContent })
    } else {
      toast.error(title)
    }
  }
}
