// composables/teacher/useAttendance.ts
import { useApi } from '~~/composables/useApi'

export interface AttendanceRecord {
  id?: number
  student: number
  student_name?: string
  date: string
  status: 'Present' | 'Absent' | 'Late' | 'Excused'
  remarks?: string
  marked_by?: number
}

export interface BulkAttendanceData {
  classroom: number
  date: string
  records: {
    student: number
    status: string
    remarks?: string
  }[]
}

export const useAttendance = () => {
  const { apiCall } = useApi()

  // Set to true to use mock data (for frontend testing without backend)
  const USE_MOCK_DATA = false

  // Fetch attendance records for a specific class and date
  const fetchAttendance = async (classroomId: number, date: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400))
      // Return empty array (no existing attendance)
      return { data: [], error: null }
    }
    return await apiCall<AttendanceRecord[]>(
      `/attendance/student-attendance/?classroom=${classroomId}&date=${date}`
    )
  }

  // Mark attendance for multiple students (bulk)
  const markBulkAttendance = async (data: BulkAttendanceData) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 600))
      return { data: { success: true, message: 'Attendance marked successfully' }, error: null }
    }
    return await apiCall('/attendance/student-attendance/bulk-mark/', {
      method: 'POST',
      body: data
    })
  }

  // Update single attendance record
  const updateAttendance = async (id: number, data: Partial<AttendanceRecord>) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400))
      return { data: { success: true }, error: null }
    }
    return await apiCall(`/attendance/student-attendance/${id}/`, {
      method: 'PATCH',
      body: data
    })
  }

  // Get attendance statistics for a classroom
  const getAttendanceStats = async (classroomId: number, startDate?: string, endDate?: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400))
      return {
        data: {
          total_students: 35,
          present: 32,
          absent: 2,
          late: 1,
          excused: 0,
          attendance_rate: 91.4
        },
        error: null
      }
    }
    let url = `/attendance/student-attendance/stats/?classroom=${classroomId}`
    if (startDate) url += `&start_date=${startDate}`
    if (endDate) url += `&end_date=${endDate}`

    return await apiCall(url)
  }

  return {
    fetchAttendance,
    markBulkAttendance,
    updateAttendance,
    getAttendanceStats
  }
}
