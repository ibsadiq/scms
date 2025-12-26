// composables/admin/useAssessments.ts
import type { Examination } from '~~/types'
import { useApi } from '../useApi'

export const useAssessments = () => {
  const { apiCall } = useApi()

  const fetchAssessments = async () => {
    return await apiCall<Examination[]>('/academic/assessments/')
  }

  const fetchAssessment = async (id: number) => {
    return await apiCall<Examination>(`/academic/assessments/${id}/`)
  }

  const createAssessment = async (data: Partial<Examination>) => {
    return await apiCall<Examination>('/academic/assessments/', {
      method: 'POST',
      body: data,
    })
  }

  const updateAssessment = async (id: number, data: Partial<Examination>) => {
    return await apiCall<Examination>(`/academic/assessments/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteAssessment = async (id: number) => {
    return await apiCall(`/academic/assessments/${id}/`, {
      method: 'DELETE',
    })
  }

  return {
    fetchAssessments,
    fetchAssessment,
    createAssessment,
    updateAssessment,
    deleteAssessment,
  }
}
