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
      console.warn('Admission stats not available:', error)
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
      console.warn('Admin dashboard endpoint not available, fetching from individual endpoints')
      
      // Fallback: Fetch from individual endpoints
      try {
        const [students, teachers, subjects, events, payments] = await Promise.all([
          $fetch<any[]>(`${config.public.apiBase}/sis/students/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => []),
          $fetch<any[]>(`${config.public.apiBase}/users/teachers/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => []),
          $fetch<any[]>(`${config.public.apiBase}/academic/subjects/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => []),
          $fetch<any[]>(`${config.public.apiBase}/administration/school-events/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => []),
          $fetch<any[]>(`${config.public.apiBase}/finance/payments/`, {
            headers: { Authorization: `Bearer ${token.value}` }
          }).catch(() => [])
        ])

        // Calculate stats from fetched data
        const today = new Date()
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        // Filter active students (those without date_dismissed)
        const activeStudents = students.filter((s: any) => !s.date_dismissed).length
        const totalStudents = students.length
        const totalTeachers = teachers.length
        const activeSubjects = subjects.length
        const newStudentsThisMonth = students.filter((s: any) => {
          if (!s.admission_date) return false
          const admissionDate = new Date(s.admission_date)
          return admissionDate >= firstDayOfMonth
        }).length

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

        return {
          stats: {
            totalStudents: activeStudents,
            totalTeachers: totalTeachers,
            activeSubjects: activeSubjects,
            attendanceRate: 94, // Default - need actual attendance data
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
            collected: 45780000,
            outstanding: 8920000,
            collectionRate: 84
          },
          attendance: [
            { dayName: 'Monday', date: '2024-01-15', rate: 96, present: 1197, total: activeStudents },
            { dayName: 'Tuesday', date: '2024-01-16', rate: 94, present: 1172, total: activeStudents },
            { dayName: 'Wednesday', date: '2024-01-17', rate: 95, present: 1185, total: activeStudents },
            { dayName: 'Thursday', date: '2024-01-18', rate: 93, present: 1160, total: activeStudents },
            { dayName: 'Friday', date: '2024-01-19', rate: 91, present: 1135, total: activeStudents }
          ],
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
            averageGrade: 'B+',
            passRate: 87,
            grades: {
              a: 28,
              b: 35,
              c: 24,
              df: 13
            }
          }
        }
      } catch (fallbackError) {
        console.error('Error fetching from individual endpoints:', fallbackError)
        
        // Return mock data as last resort
        return {
          stats: {
            totalStudents: 1247,
            totalTeachers: 87,
            activeSubjects: 42,
            attendanceRate: 94,
            newStudentsThisMonth: 15
          },
          studentsByLevel: [
            { name: 'Primary', count: 456, percentage: 37, icon: 'lucide:baby' },
            { name: 'JSS', count: 342, percentage: 27, icon: 'lucide:book' },
            { name: 'SSS', count: 389, percentage: 31, icon: 'lucide:graduation-cap' },
            { name: 'University', count: 60, percentage: 5, icon: 'lucide:school' }
          ],
          financial: {
            collected: 45780000,
            outstanding: 8920000,
            collectionRate: 84
          },
          attendance: [
            { dayName: 'Monday', date: '2024-01-15', rate: 96, present: 1197, total: 1247 },
            { dayName: 'Tuesday', date: '2024-01-16', rate: 94, present: 1172, total: 1247 },
            { dayName: 'Wednesday', date: '2024-01-17', rate: 95, present: 1185, total: 1247 },
            { dayName: 'Thursday', date: '2024-01-18', rate: 93, present: 1160, total: 1247 },
            { dayName: 'Friday', date: '2024-01-19', rate: 91, present: 1135, total: 1247 }
          ],
          recentAdmissions: [
            {
              id: 1,
              first_name: 'Chioma',
              last_name: 'Okafor',
              grade_level: 'JSS 1',
              admission_date: '2024-01-10'
            },
            {
              id: 2,
              first_name: 'Tunde',
              last_name: 'Adeyemi',
              grade_level: 'Primary 5',
              admission_date: '2024-01-12'
            },
            {
              id: 3,
              first_name: 'Blessing',
              last_name: 'Nwosu',
              grade_level: 'SSS 2',
              admission_date: '2024-01-14'
            },
            {
              id: 4,
              first_name: 'Ibrahim',
              last_name: 'Mohammed',
              grade_level: 'JSS 3',
              admission_date: '2024-01-15'
            },
            {
              id: 5,
              first_name: 'Grace',
              last_name: 'Eze',
              grade_level: 'Primary 3',
              admission_date: '2024-01-16'
            }
          ],
          recentPayments: [],
          performance: {
            averageGrade: 'B+',
            passRate: 87,
            grades: {
              a: 28,
              b: 35,
              c: 24,
              df: 13
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