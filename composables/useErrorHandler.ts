// composables/useErrorHandler.ts
import { toast } from 'vue-sonner'

export const useErrorHandler = () => {
  /**
   * Extracts and formats error messages from API responses
   * Handles different error structures including field-specific validation errors
   */
  const extractErrorMessage = (error: any): string => {
    if (!error) return 'An unexpected error occurred. Please try again.'

    // Check for detail field (most common in Django REST Framework)
    if (error?.data?.detail) {
      const detail = error.data.detail

      // Handle object with field-specific errors
      // Example: { "email": ["A user with this email already exists."], "phone": ["Invalid format"] }
      if (typeof detail === 'object' && !Array.isArray(detail)) {
        const errors = Object.entries(detail)
          .map(([_, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages]
            return messageArray.join(', ')
          })
          .filter(Boolean)

        if (errors.length > 1) {
          return errors.map(msg => `• ${msg}`).join('\n\n')
        }
        return errors[0] || 'An unexpected error occurred.'
      }

      // Handle string detail
      if (typeof detail === 'string') {
        return detail
      }

      // Handle array detail
      if (Array.isArray(detail)) {
        if (detail.length > 1) {
          return detail.map(msg => `• ${msg}`).join('\n\n')
        }
        return detail[0] || 'An unexpected error occurred.'
      }
    }

    // Fallback to other error message fields
    if (error?.data?.message) {
      return String(error.data.message)
    }

    if (error?.message) {
      return String(error.message)
    }

    return 'An unexpected error occurred. Please try again.'
  }

  /**
   * Shows an error toast with properly formatted error message
   */
  const showErrorToast = (error: any, title: string = 'Error') => {
    const errorMessage = extractErrorMessage(error)
    toast.error(title, {
      description: errorMessage
    })
  }

  /**
   * Shows a success toast
   */
  const showSuccessToast = (message: string, description?: string) => {
    toast.success(message, {
      description
    })
  }

  return {
    extractErrorMessage,
    showErrorToast,
    showSuccessToast
  }
}
