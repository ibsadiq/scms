// composables/admin/useStudents.ts
import type { Student } from '~~/types'
import { useApi } from '../useApi'

export interface StudentFilters {
  search?: string
  status?: string
  grade_level?: number
  class_level?: string
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const useStudents = () => {
  const { apiCall } = useApi()

  const fetchStudents = async (filters?: StudentFilters) => {
    return await apiCall<PaginatedResponse<Student>>('/sis/students/', {
      query: filters
    })
  }

  const fetchStudent = async (id: number) => {
    return await apiCall<Student>(`/sis/students/${id}/`)
  }

  const createStudent = async (data: Student) => {
    return await apiCall<Student>('/sis/students/', {
      method: 'POST',
      body: data,
    })
  }

  const updateStudent = async (id: number, data: Partial<Student>) => {
    return await apiCall<Student>(`/sis/students/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteStudent = async (id: number) => {
    return await apiCall(`/sis/students/${id}/`, {
      method: 'DELETE',
    })
  }

  const uploadBulkStudents = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return await apiCall('/sis/students/bulk-upload/', {
      method: 'POST',
      body: formData,
    })
  }

  const searchStudents = async (searchQuery: string) => {
    return await apiCall<PaginatedResponse<Student>>('/sis/students/', {
      query: { search: searchQuery }
    })
  }

  return {
    fetchStudents,
    fetchStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    uploadBulkStudents,
    searchStudents,
  }
}
