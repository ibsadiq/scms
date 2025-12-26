// composables/student/useAttendance.ts
import { useStudentAuth } from '~~/composables/useStudentAuth'

export interface AttendanceRecord {
  id: number
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  period?: string
  subject_name?: string
  remarks?: string
}

export interface AttendanceSummary {
  total_days: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_rate: number
  current_month: string
  current_year: number
}

export interface MonthlyAttendance {
  month: string
  year: number
  total_days: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_rate: number
  records: AttendanceRecord[]
}

export const useStudentAttendance = () => {
  const { $api } = useNuxtApp()
  const { studentData } = useStudentAuth()

  const attendanceRecords = ref<AttendanceRecord[]>([])
  const summary = ref<AttendanceSummary | null>(null)
  const monthlyData = ref<MonthlyAttendance[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch attendance records
   */
  const fetchAttendance = async (filters?: {
    start_date?: string
    end_date?: string
    month?: number
    year?: number
  }) => {
    if (!studentData.value?.id) {
      error.value = 'Student data not available'
      return { success: false, error: error.value }
    }

    loading.value = true
    error.value = null

    try {
      let url = `/attendance/student-attendance/?student=${studentData.value.id}`

      if (filters?.start_date) {
        url += `&start_date=${filters.start_date}`
      }
      if (filters?.end_date) {
        url += `&end_date=${filters.end_date}`
      }
      if (filters?.month) {
        url += `&month=${filters.month}`
      }
      if (filters?.year) {
        url += `&year=${filters.year}`
      }

      const response = await $api<AttendanceRecord[]>(url, {
        method: 'GET'
      })

      attendanceRecords.value = response
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load attendance records'
      console.error('Failed to fetch attendance:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch attendance summary
   */
  const fetchSummary = async (month?: number, year?: number) => {
    if (!studentData.value?.id) {
      error.value = 'Student data not available'
      return { success: false, error: error.value }
    }

    loading.value = true
    error.value = null

    try {
      let url = `/attendance/student-attendance/summary/?student=${studentData.value.id}`

      if (month) {
        url += `&month=${month}`
      }
      if (year) {
        url += `&year=${year}`
      }

      const response = await $api<AttendanceSummary>(url, {
        method: 'GET'
      })

      summary.value = response
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load attendance summary'
      console.error('Failed to fetch summary:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get attendance for a specific month
   */
  const getMonthlyAttendance = (month: number, year: number) => {
    return computed(() => {
      return monthlyData.value.find(
        m => m.month === `${year}-${String(month).padStart(2, '0')}`
      )
    })
  }

  /**
   * Get attendance status for a specific date
   */
  const getDateStatus = (date: string) => {
    return computed(() => {
      return attendanceRecords.value.find(r => r.date === date)
    })
  }

  /**
   * Computed values
   */
  const presentDays = computed(() => summary.value?.present || 0)
  const absentDays = computed(() => summary.value?.absent || 0)
  const lateDays = computed(() => summary.value?.late || 0)
  const excusedDays = computed(() => summary.value?.excused || 0)
  const totalDays = computed(() => summary.value?.total_days || 0)
  const attendanceRate = computed(() => summary.value?.attendance_rate || 0)

  /**
   * Get attendance by month
   */
  const recordsByMonth = computed(() => {
    const grouped: Record<string, AttendanceRecord[]> = {}

    attendanceRecords.value.forEach(record => {
      const date = new Date(record.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(record)
    })

    return grouped
  })

  return {
    attendanceRecords,
    summary,
    monthlyData,
    loading,
    error,
    presentDays,
    absentDays,
    lateDays,
    excusedDays,
    totalDays,
    attendanceRate,
    recordsByMonth,
    fetchAttendance,
    fetchSummary,
    getMonthlyAttendance,
    getDateStatus
  }
}
