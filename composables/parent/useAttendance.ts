import { useApi } from '../useApi'

export interface AttendanceRecord {
  id: number
  student_id: number
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  remarks?: string
  marked_by?: string
  time_in?: string
}

export interface AttendanceSummary {
  total_days: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_rate: number
  recent_records: AttendanceRecord[]
}

export interface MonthlyAttendance {
  month: string
  year: number
  total_days: number
  present: number
  absent: number
  late: number
  attendance_rate: number
}

export const useAttendance = () => {
  const { apiCall } = useApi()

  const fetchChildAttendance = async (childId: number, params?: {
    start_date?: string
    end_date?: string
    term?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.term) queryParams.append('term_id', params.term.toString())

    // Uses /api/examination/parent/attendance/summary/{child_id}/
    const url = `/examination/parent/attendance/summary/${childId}/${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return await apiCall<AttendanceSummary>(url)
  }

  const fetchAttendanceRecords = async (childId: number, params?: {
    start_date?: string
    end_date?: string
    status?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.status) queryParams.append('status', params.status)

    // Uses /api/examination/parent/attendance/child/{child_id}/
    const url = `/examination/parent/attendance/child/${childId}/${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return await apiCall<AttendanceRecord[]>(url)
  }

  const fetchMonthlyAttendance = async (childId: number, year?: number) => {
    // Uses /api/examination/parent/attendance/summary/{child_id}/
    const url = year
      ? `/examination/parent/attendance/summary/${childId}/?year=${year}`
      : `/examination/parent/attendance/summary/${childId}/`
    return await apiCall<MonthlyAttendance[]>(url)
  }

  return {
    fetchChildAttendance,
    fetchAttendanceRecords,
    fetchMonthlyAttendance
  }
}
