import { useApi } from '../useApi'
import { useAuth } from '../useAuth'

export interface FeeItem {
  id: number
  fee_type: string
  description?: string
  amount: number
  paid: number
  balance: number
  due_date?: string
  status: 'paid' | 'partial' | 'unpaid' | 'overdue'
  is_mandatory: boolean
}

export interface Payment {
  id: number
  amount: number
  payment_date: string
  payment_method: string
  reference: string
  status: 'completed' | 'pending' | 'failed'
  receipt_number?: string
  processed_by?: string
  remarks?: string
}

export interface FeesSummary {
  student_id: number
  student_name: string
  total_fees: number
  total_paid: number
  total_balance: number
  status: 'paid' | 'partial' | 'unpaid'
  fee_items: FeeItem[]
  recent_payments: Payment[]
  next_due_date?: string
}

export interface PaymentHistory {
  student_id: number
  payments: Payment[]
  total_paid: number
  payment_count: number
}

export interface PaymentInitiation {
  student_id: number
  amount: number
  payment_method: string
  fee_items?: number[]
  redirect_url?: string
}

export interface PaymentResponse {
  success: boolean
  payment_id: number
  reference: string
  authorization_url?: string
  message?: string
}

export const useFees = () => {
  const { apiCall } = useApi()

  const fetchChildFees = async (childId: number, termId?: number) => {
    // Uses /api/examination/parent/fees/child/{child_id}/
    const url = termId
      ? `/examination/parent/fees/child/${childId}/?term=${termId}`
      : `/examination/parent/fees/child/${childId}/`
    return await apiCall<FeesSummary>(url)
  }

  const fetchPaymentHistory = async (childId: number, params?: {
    start_date?: string
    end_date?: string
    year?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.year) queryParams.append('year', params.year.toString())

    // Uses /api/examination/parent/fees/payments/{child_id}/
    const url = `/examination/parent/fees/payments/${childId}/${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return await apiCall<PaymentHistory>(url)
  }

  const fetchFeeBreakdown = async (childId: number, termId?: number) => {
    // Uses /api/examination/parent/fees/child/{child_id}/
    const url = termId
      ? `/examination/parent/fees/child/${childId}/?term=${termId}`
      : `/examination/parent/fees/child/${childId}/`
    return await apiCall<FeeItem[]>(url)
  }

  const initiatePayment = async (paymentData: PaymentInitiation) => {
    // Note: Payment initiation may not be implemented in Phase 1.4
    return await apiCall<PaymentResponse>('/examination/parent/fees/initiate-payment/', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
  }

  const verifyPayment = async (reference: string) => {
    // Note: Payment verification may not be implemented in Phase 1.4
    return await apiCall<PaymentResponse>(`/examination/parent/fees/verify-payment/${reference}/`)
  }

  const downloadReceipt = async (paymentId: number) => {
    // Note: Receipt download may not be implemented in Phase 1.4
    // Direct download using window.open
    try {
      const config = useRuntimeConfig()
      const auth = useAuth()

      const url = `${config.public.apiBase}/examination/parent/fees/payments/${paymentId}/receipt/`

      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.download = `receipt-${paymentId}.pdf`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${auth.token.value}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download receipt')
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      link.href = blobUrl
      link.click()

      window.URL.revokeObjectURL(blobUrl)

      return { data: true, error: null }
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to download receipt' }
    }
  }

  const downloadFeeStatement = async (childId: number, termId?: number) => {
    // Note: Fee statement download may not be implemented in Phase 1.4
    // Direct download using window.open
    try {
      const config = useRuntimeConfig()
      const auth = useAuth()

      const urlPath = termId
        ? `/examination/parent/fees/child/${childId}/statement/?term=${termId}`
        : `/examination/parent/fees/child/${childId}/statement/`

      const url = `${config.public.apiBase}${urlPath}`

      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.download = `fee-statement-${childId}.pdf`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${auth.token.value}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download fee statement')
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      link.href = blobUrl
      link.click()

      window.URL.revokeObjectURL(blobUrl)

      return { data: true, error: null }
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to download fee statement' }
    }
  }

  return {
    fetchChildFees,
    fetchPaymentHistory,
    fetchFeeBreakdown,
    initiatePayment,
    verifyPayment,
    downloadReceipt,
    downloadFeeStatement
  }
}
