import type { Parent } from '~~/types'
import { useApi } from '../useApi'

export const useParents = () => {
  const { apiCall } = useApi()

  const fetchParents = async () => {
    return await apiCall<Parent[]>('/users/parents/')
  }

  const fetchParent = async (id: number) => {
    return await apiCall<Parent>(`/users/parents/${id}/`)
  }

  const createParent = async (data: Parent) => {
    return await apiCall<Parent>('/users/parents/', {
      method: 'POST',
      body: data,
    })
  }

  const updateParent = async (id: number, data: Partial<Parent>) => {
    return await apiCall<Parent>(`/users/parents/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteParent = async (id: number) => {
    return await apiCall(`/users/parents/${id}/`, {
      method: 'DELETE',
    })
  }

  const uploadBulkParents = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return await apiCall('/users/parents/bulk-upload/', {
      method: 'POST',
      body: formData,
    })
  }

  return {
    fetchParents,
    fetchParent,
    createParent,
    updateParent,
    deleteParent,
    uploadBulkParents,
  }
}
