// composables/student/useDashboard.ts
import type { StudentAuthResponse } from '~~/types'

export interface StudentDashboardData {
  student: StudentAuthResponse['student']
  attendance_summary: {
    total_days: number
    present: number
    absent: number
    attendance_rate: number
  }
  fee_balance: {
    total_balance: number
    amount_paid: number
    remaining: number
    term: string
  }
  recent_results: any[]
  upcoming_assignments: any[]
  unread_notifications: number
}

export const useStudentDashboard = () => {
  const { $api } = useNuxtApp()

  const dashboardData = ref<StudentDashboardData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch student dashboard data
   */
  const fetchDashboard = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<StudentDashboardData>('/academic/students/portal/dashboard/', {
        method: 'GET'
      })

      dashboardData.value = response
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load dashboard data'
      console.error('Failed to fetch student dashboard:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    dashboardData,
    loading,
    error,
    fetchDashboard
  }
}
