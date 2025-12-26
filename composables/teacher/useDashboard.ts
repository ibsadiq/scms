// composables/teacher/useDashboard.ts
import { useApi } from '~~/composables/useApi'

export interface DashboardStats {
  totalClasses: number
  totalStudents: number
  todaysClasses: number
  pendingGrades: number
}

export interface TodaysSchedule {
  id: number
  subject_name: string
  classroom_name: string
  start_time: string
  end_time: string
  status: 'upcoming' | 'ongoing' | 'completed'
}

export interface MyClass {
  id: number
  name: string
  subject: string
  student_count: number
}

export interface RecentActivity {
  id: string
  type: 'grade' | 'attendance' | 'assignment'
  icon: string
  title: string
  description: string
  time: string
}

export interface UpcomingAssessment {
  id: number
  name: string
  type: string
  subject: string
  classroom: string
  date: string
}

export interface TeacherDashboardData {
  stats: DashboardStats
  todaysSchedule: TodaysSchedule[]
  myClasses: MyClass[]
  recentActivities: RecentActivity[]
  upcomingAssessments: UpcomingAssessment[]
}

export const useDashboard = () => {
  const { apiCall } = useApi()

  const fetchDashboard = async () => {
    return await apiCall<TeacherDashboardData>('/users/teacher/dashboard/')
  }

  return {
    fetchDashboard
  }
}
