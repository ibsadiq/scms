// composables/admin/useClassrooms.ts
import type { Classroom } from '~~/types'
import { useApi } from '../useApi'

export const useClassrooms = () => {
  const { apiCall } = useApi()

  const fetchClassrooms = async () => {
    return await apiCall<Classroom[]>('/academic/classrooms/')
  }

  const fetchClassroom = async (id: number) => {
    return await apiCall<Classroom>(`/academic/classrooms/${id}/`)
  }

  const createClassroom = async (data: Partial<Classroom>) => {
    return await apiCall<Classroom>('/academic/classrooms/', {
      method: 'POST',
      body: data,
    })
  }

  const updateClassroom = async (id: number, data: Partial<Classroom>) => {
    return await apiCall<Classroom>(`/academic/classrooms/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteClassroom = async (id: number) => {
    return await apiCall(`/academic/classrooms/${id}/`, {
      method: 'DELETE',
    })
  }

  return {
    fetchClassrooms,
    fetchClassroom,
    createClassroom,
    updateClassroom,
    deleteClassroom,
  }
}
