import { useApi } from '~~/composables/useApi'

export interface Event {
  id: number
  title: string
  description: string
  event_type: 'academic' | 'sports' | 'cultural' | 'meeting' | 'holiday' | 'other'
  start_date: string
  end_date?: string
  start_time?: string
  end_time?: string
  location?: string
  target_audience: 'all' | 'parents' | 'students' | 'staff' | 'specific_classes'
  is_mandatory: boolean
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_by?: string
  attachments?: Array<{
    id: number
    file_name: string
    file_url: string
    file_type: string
  }>
}

export interface Announcement {
  id: number
  title: string
  content: string
  category: 'general' | 'urgent' | 'academic' | 'administrative' | 'health' | 'security'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  published_date: string
  expiry_date?: string
  target_audience: 'all' | 'parents' | 'students' | 'staff'
  author?: string
  is_read: boolean
  attachments?: Array<{
    id: number
    file_name: string
    file_url: string
  }>
}

export interface Activity {
  id: number
  type: 'grade_posted' | 'attendance_marked' | 'fee_paid' | 'event_created' | 'announcement' | 'remark_added'
  title: string
  description: string
  student_id?: number
  student_name?: string
  timestamp: string
  metadata?: any
  icon?: string
  is_read: boolean
}

export const useEvents = () => {
  const { apiCall } = useApi()

  const fetchUpcomingEvents = async (params?: {
    start_date?: string
    end_date?: string
    event_type?: string
    limit?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.event_type) queryParams.append('event_type', params.event_type)
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const url = `/parents/events/${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return await apiCall<Event[]>(url)
  }

  const fetchEventDetails = async (eventId: number) => {
    return await apiCall<Event>(`/parents/events/${eventId}/`)
  }

  const fetchAnnouncements = async (params?: {
    category?: string
    priority?: string
    unread_only?: boolean
    limit?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.priority) queryParams.append('priority', params.priority)
    if (params?.unread_only) queryParams.append('unread_only', 'true')
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const url = `/parents/announcements/${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return await apiCall<Announcement[]>(url)
  }

  const fetchAnnouncementDetails = async (announcementId: number) => {
    return await apiCall<Announcement>(`/parents/announcements/${announcementId}/`)
  }

  const markAnnouncementAsRead = async (announcementId: number) => {
    return await apiCall(`/parents/announcements/${announcementId}/mark-read/`, {
      method: 'POST'
    })
  }

  const fetchRecentActivities = async (limit?: number) => {
    const url = limit
      ? `/parents/activities/?limit=${limit}`
      : '/parents/activities/'
    return await apiCall<Activity[]>(url)
  }

  const markActivityAsRead = async (activityId: number) => {
    return await apiCall(`/parents/activities/${activityId}/mark-read/`, {
      method: 'POST'
    })
  }

  const fetchCalendar = async (year: number, month: number) => {
    return await apiCall<Event[]>(`/parents/calendar/?year=${year}&month=${month}`)
  }

  return {
    fetchUpcomingEvents,
    fetchEventDetails,
    fetchAnnouncements,
    fetchAnnouncementDetails,
    markAnnouncementAsRead,
    fetchRecentActivities,
    markActivityAsRead,
    fetchCalendar
  }
}
