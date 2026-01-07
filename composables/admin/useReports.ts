// composables/admin/useReports.ts
import { useApi } from '~~/composables/useApi'

export interface StudentReportFilters {
  academic_year?: number
  term?: number
  grade_level?: number
  class_level?: number
  status?: string
  date_from?: string
  date_to?: string
}

export interface FinancialReportFilters {
  academic_year?: number
  term?: number
  date_from?: string
  date_to?: string
  payment_method?: string
  class_level?: number
}

export interface StudentReportData {
  student_id: number
  admission_number: string
  full_name: string
  class_name: string
  grade_level: string
  status: string
  attendance_rate?: number
  total_present?: number
  total_absent?: number
  average_grade?: string
  total_fees?: number
  fees_paid?: number
  balance?: number
}

export interface FinancialReportData {
  total_collected: number
  total_outstanding: number
  collection_rate: number
  payment_by_method: {
    method: string
    amount: number
    count: number
  }[]
  revenue_by_type: {
    fee_type: string
    amount: number
  }[]
  defaulters: {
    student_id: number
    student_name: string
    admission_number: string
    class_name: string
    balance: number
  }[]
  payments: any[]
}

export interface AttendanceReportData {
  date: string
  class_name: string
  total_students: number
  present: number
  absent: number
  attendance_rate: number
}

export const useReports = () => {
  const { apiCall } = useApi()

  /**
   * Fetch comprehensive student report
   */
  const fetchStudentReport = async (filters: StudentReportFilters = {}) => {
    const { data, error } = await apiCall<{
      students: StudentReportData[]
      summary: {
        total_students: number
        active_students: number
        average_attendance: number
        average_balance: number
      }
    }>('/reports/students/', {
      method: 'GET',
      query: filters
    })

    if (error) {
      console.error('Failed to fetch student report:', error)
      return { data: null, error }
    }

    return { data, error: null }
  }

  /**
   * Fetch financial report
   */
  const fetchFinancialReport = async (filters: FinancialReportFilters = {}) => {
    const { data, error } = await apiCall<FinancialReportData>('/reports/financial/', {
      method: 'GET',
      query: filters
    })

    if (error) {
      console.error('Failed to fetch financial report:', error)
      return { data: null, error }
    }

    return { data, error: null }
  }

  /**
   * Fetch attendance report
   */
  const fetchAttendanceReport = async (filters: { date_from?: string; date_to?: string; class_level?: number } = {}) => {
    const { data, error } = await apiCall<{
      records: AttendanceReportData[]
      summary: {
        total_days: number
        average_attendance: number
        total_absences: number
      }
    }>('/reports/attendance/', {
      method: 'GET',
      query: filters
    })

    if (error) {
      console.error('Failed to fetch attendance report:', error)
      return { data: null, error }
    }

    return { data, error: null }
  }

  /**
   * Export report to PDF
   */
  const exportToPDF = async (reportType: 'student' | 'financial' | 'attendance', filters: any = {}) => {
    try {
      const { data, error } = await apiCall<Blob>(`/reports/${reportType}/export/pdf/`, {
        method: 'POST',
        body: filters
      })

      if (error || !data) {
        console.error('Failed to export PDF:', error)
        return { success: false, error: 'Failed to export PDF' }
      }

      // Create download link
      const url = window.URL.createObjectURL(data as any)
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true, error: null }
    } catch (err: any) {
      console.error('Failed to export PDF:', err)
      return { success: false, error: err.message || 'Failed to export PDF' }
    }
  }

  /**
   * Export report to Excel/CSV
   */
  const exportToExcel = async (reportType: 'student' | 'financial' | 'attendance', filters: any = {}) => {
    try {
      const { data, error } = await apiCall<Blob>(`/reports/${reportType}/export/excel/`, {
        method: 'POST',
        body: filters
      })

      if (error || !data) {
        console.error('Failed to export Excel:', error)
        return { success: false, error: 'Failed to export Excel' }
      }

      // Create download link
      const url = window.URL.createObjectURL(data as any)
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true, error: null }
    } catch (err: any) {
      console.error('Failed to export Excel:', err)
      return { success: false, error: err.message || 'Failed to export Excel' }
    }
  }

  return {
    fetchStudentReport,
    fetchFinancialReport,
    fetchAttendanceReport,
    exportToPDF,
    exportToExcel
  }
}
