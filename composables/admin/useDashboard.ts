// composables/admin/useDashboard.ts
import type { DashboardData, AdmissionStats } from '~~/types'
import { useAuth } from '~~/composables/useAuth'

/**
 * Admin Dashboard Composable
 * Fetches data from /api/administration/dashboard/
 */
export const useDashboard = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  /**
   * Fetch admission statistics for dashboard
   */
  const fetchAdmissionStats = async (): Promise<AdmissionStats | null> => {
    try {
      const response = await $fetch<any>(
        `${config.public.apiBase}/admissions/dashboard-stats/`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }
      )
      return {
        totalApplications: response.total_applications || 0,
        pendingReview: response.pending_review || 0,
        approved: response.approved || 0,
        enrolled: response.enrolled || 0,
        applicationRevenue: response.application_revenue || 0,
        examRevenue: response.exam_revenue || 0,
        acceptanceRevenue: response.acceptance_revenue || 0,
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Fetch comprehensive dashboard statistics
   * Tries /api/administration/dashboard/ first, then falls back to individual endpoints
   */
  const fetchDashboardStats = async (): Promise<DashboardData> => {
    try {
      // Try the admin dashboard endpoint
      const response = await $fetch<DashboardData>(
        `${config.public.apiBase}/administration/dashboard/`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }
      )
      return response
    } catch (error: any) {
      // Fallback: Fetch from individual endpoints
      try {
        const [students, teachers, subjects, payments, attendanceData, performanceData, financialData] = await Promise.all([
          $fetch<any[]>(`${config.public.apiBase}/sis/students/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => []),
          $fetch<any[]>(`${config.public.apiBase}/users/teachers/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => []),
          $fetch<any[]>(`${config.public.apiBase}/academic/subjects/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => []),
          $fetch<any[]>(`${config.public.apiBase}/finance/payments/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => []),
          $fetch<any>(`${config.public.apiBase}/attendance/weekly-summary/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => null),
          $fetch<any>(`${config.public.apiBase}/grades/performance-summary/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => null),
          $fetch<any>(`${config.public.apiBase}/finance/dashboard-summary/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => null)
        ])

        // Calculate stats from fetched data
        const today = new Date()
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        // Filter active students (those without date_dismissed)
        const activeStudents = students.filter((s: any) => !s.date_dismissed).length
        const totalTeachers = teachers.length
        const activeSubjects = subjects.length
        const newStudentsThisMonth = students.filter((s: any) => {
          if (!s.admission_date) return false
          const admissionDate = new Date(s.admission_date)
          return admissionDate >= firstDayOfMonth
        }).length

        // Calculate attendance rate from backend data or default
        const attendanceRate = attendanceData?.attendance_rate || attendanceData?.average_rate || 0

        // Group active students by class level
        const activeStudentsList = students.filter((s: any) => !s.date_dismissed)
        const studentsByClass: Record<string, number> = {}
        activeStudentsList.forEach((student: any) => {
          const className = student.class_level?.name || student.student_class_name || student.student_class || 'Unknown'
          studentsByClass[className] = (studentsByClass[className] || 0) + 1
        })

        // Categorize by level
        const primaryCount = Object.entries(studentsByClass)
          .filter(([key]) => key.toLowerCase().includes('primary'))
          .reduce((sum, [_, count]) => sum + count, 0)

        const jssCount = Object.entries(studentsByClass)
          .filter(([key]) => key.toLowerCase().includes('jss'))
          .reduce((sum, [_, count]) => sum + count, 0)

        const sssCount = Object.entries(studentsByClass)
          .filter(([key]) => key.toLowerCase().includes('sss'))
          .reduce((sum, [_, count]) => sum + count, 0)

        const universityCount = Object.entries(studentsByClass)
          .filter(([key]) => key.toLowerCase().includes('year'))
          .reduce((sum, [_, count]) => sum + count, 0)

        // Recent admissions (only active students with admission dates)
        const recentAdmissions = activeStudentsList
          .filter((s: any) => s.admission_date)
          .sort((a: any, b: any) =>
            new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime()
          )
          .slice(0, 5)
          .map((s: any) => ({
            id: s.id,
            first_name: s.first_name,
            last_name: s.last_name,
            grade_level: s.class_level?.name || s.student_class_name || s.student_class || 'N/A',
            admission_date: s.admission_date
          }))

        // Fetch admission stats
        const admissionStatsData = await fetchAdmissionStats()

        // Parse weekly attendance data from backend
        const weeklyAttendance = attendanceData?.weekly_data || attendanceData?.attendance || []
        const formattedAttendance = weeklyAttendance.length > 0
          ? weeklyAttendance.map((record: any) => ({
              dayName: record.day_name || record.dayName || new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' }),
              date: record.date,
              rate: Math.round(record.attendance_rate || record.rate || 0),
              present: record.present_count || record.present || 0,
              total: record.total_count || record.total || activeStudents
            }))
          : []

        // Parse financial data from backend
        const financialSummary = financialData || {}
        const collected = financialSummary.total_collected || financialSummary.collected || 0
        const outstanding = financialSummary.total_outstanding || financialSummary.outstanding || 0
        const totalExpected = collected + outstanding
        const collectionRate = totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 0

        // Parse performance data from backend
        const performanceSummary = performanceData || {}
        const averageGrade = performanceSummary.average_grade || performanceSummary.averageGrade || 'N/A'
        const passRate = Math.round(performanceSummary.pass_rate || performanceSummary.passRate || 0)
        const gradeDistribution = performanceSummary.grade_distribution || performanceSummary.grades || {}

        return {
          stats: {
            totalStudents: activeStudents,
            totalTeachers: totalTeachers,
            activeSubjects: activeSubjects,
            attendanceRate: attendanceRate,
            newStudentsThisMonth: newStudentsThisMonth
          },
          admissionStats: admissionStatsData || undefined,
          studentsByLevel: [
            {
              name: 'Primary',
              count: primaryCount,
              percentage: Math.round((primaryCount / activeStudents) * 100) || 0,
              icon: 'lucide:baby'
            },
            {
              name: 'JSS',
              count: jssCount,
              percentage: Math.round((jssCount / activeStudents) * 100) || 0,
              icon: 'lucide:book'
            },
            {
              name: 'SSS',
              count: sssCount,
              percentage: Math.round((sssCount / activeStudents) * 100) || 0,
              icon: 'lucide:graduation-cap'
            },
            {
              name: 'University',
              count: universityCount,
              percentage: Math.round((universityCount / activeStudents) * 100) || 0,
              icon: 'lucide:school'
            }
          ],
          financial: {
            collected: collected,
            outstanding: outstanding,
            collectionRate: collectionRate
          },
          attendance: formattedAttendance,
          recentAdmissions: recentAdmissions,
          recentPayments: payments
            .sort((a: any, b: any) =>
              new Date(b.paid_on || b.created_at).getTime() - new Date(a.paid_on || a.created_at).getTime()
            )
            .slice(0, 5)
            .map((p: any) => ({
              id: p.id,
              student_name: p.student_name || `${p.student?.first_name || ''} ${p.student?.last_name || ''}`.trim() || 'N/A',
              receipt_number: p.receipt_number || p.id,
              term_name: p.term?.name || p.term_name || 'N/A',
              method: p.payment_method || p.method || 'Cash',
              amount: p.amount_paid || p.amount || 0,
              paid_on: p.paid_on || p.created_at || new Date().toISOString()
            })),
          performance: {
            averageGrade: averageGrade,
            passRate: passRate,
            grades: {
              a: Math.round(gradeDistribution.A || gradeDistribution.a || 0),
              b: Math.round(gradeDistribution.B || gradeDistribution.b || 0),
              c: Math.round(gradeDistribution.C || gradeDistribution.c || 0),
              df: Math.round((gradeDistribution.D || gradeDistribution.d || 0) + (gradeDistribution.F || gradeDistribution.f || 0))
            }
          }
        }
      } catch (fallbackError) {
        // Return empty data structure if all endpoints fail
        return {
          stats: {
            totalStudents: 0,
            totalTeachers: 0,
            activeSubjects: 0,
            attendanceRate: 0,
            newStudentsThisMonth: 0
          },
          studentsByLevel: [
            { name: 'Primary', count: 0, percentage: 0, icon: 'lucide:baby' },
            { name: 'JSS', count: 0, percentage: 0, icon: 'lucide:book' },
            { name: 'SSS', count: 0, percentage: 0, icon: 'lucide:graduation-cap' },
            { name: 'University', count: 0, percentage: 0, icon: 'lucide:school' }
          ],
          financial: {
            collected: 0,
            outstanding: 0,
            collectionRate: 0
          },
          attendance: [],
          recentAdmissions: [],
          recentPayments: [],
          performance: {
            averageGrade: 'N/A',
            passRate: 0,
            grades: {
              a: 0,
              b: 0,
              c: 0,
              df: 0
            }
          }
        }
      }
    }
  }

  return {
    fetchDashboardStats
  }
}