// composables/admin/useFinance.ts
import type { StudentFeeBalance } from '~~/types'
import { useApi } from '~~/composables/useApi'

export const useFinance = () => {
  const { apiCall } = useApi()

  /**
   * Get student balance with fee breakdown
   */
  const fetchStudentBalance = async (studentId: number, termId?: number) => {
    const url = termId
      ? `/financial/student-balance/${studentId}/?term_id=${termId}`
      : `/financial/student-balance/${studentId}/`

    return await apiCall<StudentFeeBalance>(url)
  }

  /**
   * Get balance summary for all students
   */
  const fetchStudentBalanceSummary = async (termId?: number) => {
    const url = termId
      ? `/financial/student-balance/summary/?term_id=${termId}`
      : `/financial/student-balance/summary/`

    return await apiCall<StudentFeeBalance[]>(url)
  }

  /**
   * Get financial dashboard stats
   */
  const fetchFinancialDashboard = async () => {
    // This will be the compiled stats from student fee assignments
    const balanceSummary = await fetchStudentBalanceSummary()

    if (balanceSummary.error) {
      return {
        data: null,
        error: balanceSummary.error
      }
    }

    // Calculate aggregate stats
    const stats = balanceSummary.data?.reduce(
      (acc, student) => {
        acc.totalExpected += student.total_fees
        acc.totalCollected += student.total_paid
        acc.outstanding += student.balance
        if (student.balance > 0) acc.studentsWithDebt++
        acc.totalStudents++
        return acc
      },
      {
        totalExpected: 0,
        totalCollected: 0,
        outstanding: 0,
        collectionRate: 0,
        studentsWithDebt: 0,
        totalStudents: 0,
      }
    )

    if (stats) {
      stats.collectionRate = stats.totalExpected > 0
        ? Math.round((stats.totalCollected / stats.totalExpected) * 100 * 10) / 10
        : 0
    }

    return {
      data: stats,
      error: null
    }
  }

  /**
   * Get fee breakdown by type
   */
  const fetchFeeBreakdown = async (termId?: number) => {
    // This would aggregate fees by type from student fee assignments
    // For now, returning mock structure
    return await apiCall<any[]>('/financial/fee-breakdown/', {
      params: { term_id: termId }
    })
  }

  /**
   * Get payment status by class
   */
  const fetchClassPaymentStatus = async (termId?: number) => {
    // This would aggregate payment stats by class
    // For now, returning mock structure
    return await apiCall<any[]>('/financial/class-payment-status/', {
      params: { term_id: termId }
    })
  }

  return {
    fetchStudentBalance,
    fetchStudentBalanceSummary,
    fetchFinancialDashboard,
    fetchFeeBreakdown,
    fetchClassPaymentStatus,
  }
}
