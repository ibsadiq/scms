// composables/useToast.ts
import { toast } from 'vue-sonner'

const DEFAULT_DURATION = 4000
const ERROR_DURATION = 5000

export const useToast = () => {
  const isClient = import.meta.client

  const safe = (fn: () => void) => {
    if (!isClient) return
    fn()
  }

  const success = (message: string, description?: string) =>
    safe(() =>
      toast.success(message, {
        description,
        duration: DEFAULT_DURATION,
      }),
    )

  const error = (message: string, description?: string) =>
    safe(() =>
      toast.error(message, {
        description,
        duration: ERROR_DURATION,
      }),
    )

  const info = (message: string, description?: string) =>
    safe(() =>
      toast.info(message, {
        description,
        duration: DEFAULT_DURATION,
      }),
    )

  const warning = (message: string, description?: string) =>
    safe(() =>
      toast.warning(message, {
        description,
        duration: DEFAULT_DURATION,
      }),
    )

  const loading = (message: string) => {
    if (!isClient) return
    return toast.loading(message)
  }

  const promise = <T>(
    promiseOrFactory: Promise<T> | (() => Promise<T>),
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: unknown) => string)
    },
  ) => {
    if (!isClient) return

    const promise =
      typeof promiseOrFactory === 'function'
        ? promiseOrFactory()
        : promiseOrFactory

    return toast.promise(promise, messages)
  }

  const dismiss = (id?: string | number) =>
    safe(() => toast.dismiss(id))

  /**
   * Normalize API errors (Fetch, Axios, DRF)
   */
  const apiError = (err: any, fallback = 'An error occurred') => {
    let message =
      err?.data?.message ||
      err?.data?.detail ||
      err?.error ||
      err?.message ||
      fallback

    // Handle array errors (DRF)
    if (Array.isArray(message)) {
      message = message.join(', ')
    }

    error(String(message))

    return message
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    dismiss,

    // Advanced escape hatches
    custom: toast.custom,
    message: toast.message,

    apiError,
  }
}
