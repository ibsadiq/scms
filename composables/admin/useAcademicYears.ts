// composables/admin/useAcademicYears.ts
import type { AcademicYear } from '../../types'
import { useApi } from '../../composables/useApi'

export const useAcademicYears = () => {
  const { apiCall } = useApi()

  const fetchAcademicYears = async () => {
    return await apiCall<AcademicYear[]>('/administration/academic-years/')
  }

  const fetchAcademicYear = async (id: number) => {
    return await apiCall<AcademicYear>(`/administration/academic-years/${id}/`)
  }

  const createAcademicYear = async (data: AcademicYear) => {
    return await apiCall<AcademicYear>('/administration/academic-years/', {
      method: 'POST',
      body: data,
    })
  }

  const updateAcademicYear = async (id: number, data: Partial<AcademicYear>) => {
    return await apiCall<AcademicYear>(`/administration/academic-years/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteAcademicYear = async (id: number) => {
    return await apiCall(`/administration/academic-years/${id}/`, {
      method: 'DELETE',
    })
  }

  return {
    fetchAcademicYears,
    fetchAcademicYear,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
  }
}