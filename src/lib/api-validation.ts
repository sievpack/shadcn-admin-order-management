import type { ZodSchema } from 'zod'

function validateData<T>(schema: ZodSchema<T>, data: unknown, name: string): T {
  if (import.meta.env.DEV) {
    const result = schema.safeParse(data)
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error(`[API Validation Error] ${name}:`, result.error.format())
      throw new Error(`Invalid ${name}: ${result.error.message}`)
    }
    return result.data
  }
  return data as T
}

function validateParams<T>(
  schema: ZodSchema<T>,
  params: unknown,
  name: string
): T | undefined {
  if (params === undefined) {
    return undefined
  }
  if (import.meta.env.DEV) {
    const result = schema.safeParse(params)
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.warn(`[API Validation Warning] ${name}:`, result.error.format())
      return params as T
    }
    return result.data as T
  }
  return params as T
}

function validateResponse<T>(
  schema: ZodSchema<T>,
  response: unknown,
  name: string
): T {
  if (import.meta.env.DEV) {
    const result = schema.safeParse(response)
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error(`[API Validation Error] ${name}:`, result.error.format())
    }
    return result.success ? result.data : (response as T)
  }
  return response as T
}

export { validateData, validateParams, validateResponse }
