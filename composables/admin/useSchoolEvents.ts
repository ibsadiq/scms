// composables/admin/useSchoolEvents.ts
import type { SchoolEvent } from '../../types'
import { useApi } from '../../composables/useApi'


export const useSchoolEvents = () => {
  const { apiCall } = useApi()

  const fetchEvents = async () => {
    return await apiCall<SchoolEvent[]>('/administration/school-events/')
  }

  const fetchEvent = async (id: number) => {
    return await apiCall<SchoolEvent>(`/administration/school-events/${id}/`)
  }

  const createEvent = async (data: SchoolEvent) => {
    return await apiCall<SchoolEvent>('/administration/school-events/', {
      method: 'POST',
      body: data,
    })
  }

  const updateEvent = async (id: number, data: Partial<SchoolEvent>) => {
    return await apiCall<SchoolEvent>(`/administration/school-events/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteEvent = async (id: number) => {
    return await apiCall(`/administration/school-events/${id}/`, {
      method: 'DELETE',
    })
  }

  const uploadBulkEvents = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return await apiCall('/administration/school-events/bulk-upload/', {
      method: 'POST',
      body: formData,
    })
  }

  return {
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    uploadBulkEvents,
  }
}