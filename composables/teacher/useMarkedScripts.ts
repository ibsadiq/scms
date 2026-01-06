// composables/teacher/useMarkedScripts.ts
import type { MarkedScript } from '~~/types'
import { useApi } from '../useApi'

export const useMarkedScripts = () => {
  const { apiCall } = useApi()

  const fetchMarkedScripts = async () => {
    return await apiCall<MarkedScript[]>('/academic/marked-scripts/')
  }

  const fetchMarkedScript = async (id: number) => {
    return await apiCall<MarkedScript>(`/academic/marked-scripts/${id}/`)
  }

  const uploadMarkedScript = async (data: FormData) => {
    return await apiCall<MarkedScript>('/academic/marked-scripts/', {
      method: 'POST',
      body: data,
    })
  }

  const bulkUploadMarkedScripts = async (data: FormData) => {
    return await apiCall<{ uploaded: number; failed: number; errors?: any[] }>(
      '/academic/marked-scripts/bulk-upload/',
      {
        method: 'POST',
        body: data,
      }
    )
  }

  const deleteMarkedScript = async (id: number) => {
    return await apiCall(`/academic/marked-scripts/${id}/`, {
      method: 'DELETE',
    })
  }

  return {
    fetchMarkedScripts,
    fetchMarkedScript,
    uploadMarkedScript,
    bulkUploadMarkedScripts,
    deleteMarkedScript,
  }
}
