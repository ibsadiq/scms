// composables/useNotifications.ts
import { useApi } from './useApi'

export interface Notification {
  id: number
  recipient: number
  related_student?: number
  notification_type: 'general' | 'attendance' | 'fee' | 'result' | 'exam' | 'event' | 'assignment' | 'promotion' | 'report_card'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  title: string
  message: string
  is_read: boolean
  read_at?: string
  sent_via_email: boolean
  sent_via_sms: boolean
  created_at: string
  expires_at?: string
}

export interface NotificationPreference {
  id: number
  user: number
  email_enabled: boolean
  email_general: boolean
  email_attendance: boolean
  email_fees: boolean
  email_results: boolean
  email_exams: boolean
  email_events: boolean
  email_assignments: boolean
  sms_enabled: boolean
  sms_urgent_only: boolean
  daily_digest: boolean
  digest_time: string
}

export const useNotifications = () => {
  const { apiCall } = useApi()

  // Fetch all notifications
  const fetchNotifications = async (params?: { is_read?: boolean; notification_type?: string; priority?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.is_read !== undefined) queryParams.append('is_read', String(params.is_read))
    if (params?.notification_type) queryParams.append('notification_type', params.notification_type)
    if (params?.priority) queryParams.append('priority', params.priority)

    const queryString = queryParams.toString()
    const url = `/notifications/notifications/${queryString ? `?${queryString}` : ''}`

    return await apiCall<Notification[]>(url)
  }

  // Get unread count
  const fetchUnreadCount = async () => {
    return await apiCall<{ unread_count: number }>('/notifications/notifications/unread/')
  }

  // Mark single notification as read
  const markAsRead = async (id: number) => {
    return await apiCall(`/notifications/notifications/${id}/mark-read/`, {
      method: 'POST'
    })
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    return await apiCall('/notifications/notifications/mark-all-read/', {
      method: 'POST'
    })
  }

  // Send notification (admin only)
  const sendNotification = async (data: {
    recipient_id: number
    notification_type: string
    title: string
    message: string
    priority?: string
    related_student_id?: number
    send_email?: boolean
    send_sms?: boolean
    expires_at?: string
  }) => {
    return await apiCall<Notification>('/notifications/notifications/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Send bulk notifications (admin only)
  const sendBulkNotifications = async (data: {
    recipient_ids: number[]
    notification_type: string
    title: string
    message: string
    priority?: string
    send_email?: boolean
    send_sms?: boolean
  }) => {
    return await apiCall('/notifications/notifications/bulk/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Fetch notification preferences
  const fetchPreferences = async () => {
    return await apiCall<NotificationPreference>('/notifications/notification-preferences/')
  }

  // Update notification preferences
  const updatePreferences = async (id: number, data: Partial<NotificationPreference>) => {
    return await apiCall<NotificationPreference>(`/notifications/notification-preferences/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  return {
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    sendBulkNotifications,
    fetchPreferences,
    updatePreferences
  }
}
