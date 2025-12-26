import type { Teacher } from '~~/types'
import { useApi } from '../useApi'

export const useTeachers = () => {
  const { apiCall } = useApi()

  const fetchTeachers = async () => {
    return await apiCall<Teacher[]>('/users/teachers/')
  }

  const fetchTeacher = async (id: number) => {
    return await apiCall<Teacher>(`/users/teachers/${id}/`)
  }

  const createTeacher = async (data: Teacher) => {
    return await apiCall<Teacher>('/users/teachers/', {
      method: 'POST',
      body: data,
    })
  }

  const updateTeacher = async (id: number, data: Partial<Teacher>) => {
    return await apiCall<Teacher>(`/users/teachers/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteTeacher = async (id: number) => {
    return await apiCall(`/users/teachers/${id}/`, {
      method: 'DELETE',
    })
  }

  const uploadBulkTeachers = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return await apiCall('/users/teachers/bulk-upload/', {
      method: 'POST',
      body: formData,
    })
  }

  return {
    fetchTeachers,
    fetchTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    uploadBulkTeachers,
  }
}
