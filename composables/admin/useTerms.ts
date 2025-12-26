// composables/admin/useTerms.ts
import type { Term } from '~~/types'
import { useApi } from '~~/composables/useApi'

export const useTerms = () => {
  const { apiCall } = useApi()

  const fetchTerms = async () => {
    return await apiCall<Term[]>('/administration/terms/')
  }

  const fetchTerm = async (id: number) => {
    return await apiCall<Term>(`/administration/terms/${id}/`)
  }

  const createTerm = async (data: Term) => {
    return await apiCall<Term>('/administration/terms/', {
      method: 'POST',
      body: data,
    })
  }

  const updateTerm = async (id: number, data: Partial<Term>) => {
    return await apiCall<Term>(`/administration/terms/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteTerm = async (id: number) => {
    return await apiCall(`/administration/terms/${id}/`, {
      method: 'DELETE',
    })
  }

  return {
    fetchTerms,
    fetchTerm,
    createTerm,
    updateTerm,
    deleteTerm,
  }
}