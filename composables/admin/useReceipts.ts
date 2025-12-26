// composables/admin/useReceipts.ts
import { useApi } from '~~/composables/useApi'

export interface Receipt {
  id?: number
  receipt_number?: number
  date?: string
  payer: string
  student: number | null
  student_name?: string
  amount: number
  paid_through: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Mobile Money' | 'Card'
  term: number | null
  term_name?: string
  payment_date?: string
  reference_number?: string
  status: 'Pending' | 'Completed' | 'Cancelled'
  received_by?: number
  received_by_name?: string
  remarks?: string
  allocated_amount?: number
  unallocated_amount?: number
  fee_allocations?: Array<{
    id: number
    fee_structure_name: string
    fee_type: string
    amount: number
  }>
}

export interface FeeAllocation {
  fee_assignment_id: number
  amount: number
}

export interface ReceiptFilters {
  student?: number
  term?: number
  status?: string
  paid_through?: string
  search?: string
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const useReceipts = () => {
  const { apiCall } = useApi()

  /**
   * Get all receipts with pagination and filters
   */
  const fetchReceipts = async (filters?: ReceiptFilters) => {
    return await apiCall<PaginatedResponse<Receipt>>('/finance/receipts/', {
      query: filters
    })
  }

  /**
   * Get a specific receipt
   */
  const fetchReceipt = async (id: number) => {
    return await apiCall<Receipt>(`/finance/receipts/${id}/`)
  }

  /**
   * Create a new receipt
   */
  const createReceipt = async (data: Partial<Receipt>) => {
    return await apiCall<Receipt>('/finance/receipts/', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Update a receipt
   */
  const updateReceipt = async (id: number, data: Partial<Receipt>) => {
    return await apiCall<Receipt>(`/finance/receipts/${id}/`, {
      method: 'PATCH',
      body: data,
    })
  }

  /**
   * Delete a receipt
   */
  const deleteReceipt = async (id: number) => {
    return await apiCall(`/finance/receipts/${id}/`, {
      method: 'DELETE',
    })
  }

  /**
   * Allocate receipt to fees
   */
  const allocateReceiptToFees = async (receiptId: number, allocations: FeeAllocation[]) => {
    return await apiCall<any>(`/finance/receipts/${receiptId}/allocate_to_fees/`, {
      method: 'POST',
      body: { allocations },
    })
  }

  /**
   * Get receipts for a specific student
   */
  const fetchStudentReceipts = async (studentId: number) => {
    return await apiCall<PaginatedResponse<Receipt>>(`/finance/receipts/by_student/`, {
      query: { student_id: studentId }
    })
  }

  return {
    fetchReceipts,
    fetchReceipt,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    allocateReceiptToFees,
    fetchStudentReceipts,
  }
}
