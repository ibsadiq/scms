// composables/admin/useFees.ts
import type { FeeStructure } from '../../types'
import { useApi } from '~~/composables/useApi'

export const useFees = () => {
  const { apiCall } = useApi()

  const fetchFees = async () => {
    return await apiCall<FeeStructure[]>('/finance/fee-structures/')
  }

  const fetchFee = async (id: number) => {
    return await apiCall<FeeStructure>(`/finance/fee-structures/${id}/`)
  }

  const createFee = async (data: FeeStructure) => {
    return await apiCall<FeeStructure>('/finance/fee-structures/', {
      method: 'POST',
      body: data,
    })
  }

  const updateFee = async (id: number, data: Partial<FeeStructure>) => {
    return await apiCall<FeeStructure>(`/finance/fee-structures/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deleteFee = async (id: number) => {
    return await apiCall(`/finance/fee-structures/${id}/`, {
      method: 'DELETE',
    })
  }

  return {
    fetchFees,
    fetchFee,
    createFee,
    updateFee,
    deleteFee,
  }
}
