// composables/student/useFees.ts
import { useStudentAuth } from '~~/composables/useStudentAuth'

export interface FeeBalance {
  id: number
  student: number
  student_name: string
  term: number
  term_name: string
  academic_year: string
  total_fee: number
  amount_paid: number
  balance: number
  discount?: number
  last_payment_date?: string
  status: 'paid' | 'partial' | 'unpaid'
}

export interface Payment {
  id: number
  receipt_number: string
  student: number
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'pos' | 'online'
  term: number
  term_name: string
  reference_number?: string
  notes?: string
  received_by?: string
}

export interface Receipt {
  id: number
  receipt_number: string
  student: number
  student_name: string
  amount: number
  payment_date: string
  term_name: string
  academic_year: string
  payment_method: string
  items: ReceiptItem[]
  can_download: boolean
}

export interface ReceiptItem {
  description: string
  amount: number
}

export interface FeeStructure {
  id: number
  name: string
  amount: number
  category: string
  is_mandatory: boolean
}

export const useStudentFees = () => {
  const { $api } = useNuxtApp()
  const { studentData } = useStudentAuth()

  const feeBalances = ref<FeeBalance[]>([])
  const payments = ref<Payment[]>([])
  const receipts = ref<Receipt[]>([])
  const currentBalance = ref<FeeBalance | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch fee balance
   */
  const fetchFeeBalance = async (termId?: number) => {
    if (!studentData.value?.id) {
      error.value = 'Student data not available'
      return { success: false, error: error.value }
    }

    loading.value = true
    error.value = null

    try {
      let url = `/finance/fee-balance/?student=${studentData.value.id}`

      if (termId) {
        url += `&term=${termId}`
      }

      const response = await $api<FeeBalance[]>(url, {
        method: 'GET'
      })

      feeBalances.value = response

      // Set current balance (most recent term)
      if (response.length > 0) {
        currentBalance.value = response[0] || null
      } else {
        currentBalance.value = null
      }

      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load fee balance'
      console.error('Failed to fetch fee balance:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch payment history (uses receipts endpoint)
   */
  const fetchPayments = async (filters?: {
    start_date?: string
    end_date?: string
    term?: number
  }) => {
    if (!studentData.value?.id) {
      error.value = 'Student data not available'
      return { success: false, error: error.value }
    }

    loading.value = true
    error.value = null

    try {
      let url = `/finance/receipts/?student=${studentData.value.id}`

      if (filters?.term) {
        url += `&term=${filters.term}`
      }
      // Note: start_date and end_date filters not supported by backend receipts endpoint

      const response = await $api<any[]>(url, {
        method: 'GET'
      })

      // Transform receipts to payment format
      payments.value = response.map((receipt: any) => ({
        id: receipt.id,
        receipt_number: receipt.receipt_number,
        student: receipt.student,
        amount: receipt.amount,
        payment_date: receipt.payment_date,
        payment_method: receipt.payment_method,
        term: receipt.term,
        term_name: receipt.term_name,
        reference_number: receipt.reference_number,
        notes: receipt.notes,
        received_by: receipt.received_by
      }))

      return { success: true, data: payments.value }
    } catch (err: any) {
      error.value = err.message || 'Failed to load payment history'
      console.error('Failed to fetch payments:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch receipts (payment history)
   */
  const fetchReceipts = async () => {
    if (!studentData.value?.id) {
      error.value = 'Student data not available'
      return { success: false, error: error.value }
    }

    loading.value = true
    error.value = null

    try {
      const response = await $api<Receipt[]>(
        `/finance/receipts/?student=${studentData.value.id}`,
        {
          method: 'GET'
        }
      )

      receipts.value = response

      // Also populate payments from receipts since they're the same data
      payments.value = response.map((receipt: any) => ({
        id: receipt.id,
        receipt_number: receipt.receipt_number,
        student: receipt.student,
        amount: receipt.amount,
        payment_date: receipt.payment_date,
        payment_method: receipt.payment_method,
        term: receipt.term,
        term_name: receipt.term_name,
        reference_number: receipt.reference_number,
        notes: receipt.notes,
        received_by: receipt.received_by
      }))

      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load receipts'
      console.error('Failed to fetch receipts:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Download receipt
   */
  const downloadReceipt = async (receiptId: number) => {
    try {
      const config = useRuntimeConfig()
      const { token } = useStudentAuth()

      const url = `${config.public.apiBase}/finance/receipts/${receiptId}/download/`

      // Open in new tab for download
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.download = `receipt-${receiptId}.pdf`

      // Add authorization header via fetch
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token.value}`
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

      return { success: true, message: 'Receipt downloaded successfully' }
    } catch (err: any) {
      console.error('Failed to download receipt:', err)
      return { success: false, error: 'Failed to download receipt' }
    }
  }

  /**
   * Computed values
   */
  const totalBalance = computed(() => {
    return feeBalances.value.reduce((sum, balance) => sum + balance.balance, 0)
  })

  const totalPaid = computed(() => {
    return feeBalances.value.reduce((sum, balance) => sum + balance.amount_paid, 0)
  })

  const totalFees = computed(() => {
    return feeBalances.value.reduce((sum, balance) => sum + balance.total_fee, 0)
  })

  const paymentPercentage = computed(() => {
    if (totalFees.value === 0) return 0
    return (totalPaid.value / totalFees.value) * 100
  })

  const recentPayments = computed(() => {
    return payments.value
      .slice()
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
      .slice(0, 5)
  })

  return {
    feeBalances,
    payments,
    receipts,
    currentBalance,
    loading,
    error,
    totalBalance,
    totalPaid,
    totalFees,
    paymentPercentage,
    recentPayments,
    fetchFeeBalance,
    fetchPayments,
    fetchReceipts,
    downloadReceipt
  }
}
