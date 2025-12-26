// composables/admin/usePayments.ts
import type { FeePayment, StudentFeeBalance } from '../../types'
import { useApi } from '~~/composables/useApi'

export const usePayments = () => {
  const { apiCall } = useApi()

  const fetchPayments = async () => {
    return await apiCall<FeePayment[]>('/financial/payments/')
  }

  const fetchPayment = async (id: number) => {
    return await apiCall<FeePayment>(`/financial/payments/${id}/`)
  }

  const createPayment = async (data: FeePayment) => {
    return await apiCall<FeePayment>('/financial/payments/', {
      method: 'POST',
      body: data,
    })
  }

  const updatePayment = async (id: number, data: Partial<FeePayment>) => {
    return await apiCall<FeePayment>(`/financial/payments/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  const deletePayment = async (id: number) => {
    return await apiCall(`/financial/payments/${id}/`, {
      method: 'DELETE',
    })
  }

  const fetchStudentBalance = async (studentId: number) => {
    return await apiCall<StudentFeeBalance>(`/financial/student-balance/${studentId}/`)
  }

  return {
    fetchPayments,
    fetchPayment,
    createPayment,
    updatePayment,
    deletePayment,
    fetchStudentBalance,
  }
}
