// composables/student/useTimetable.ts
import type { TimetableSlot } from '~~/types'
import { useStudentAuth } from '~~/composables/useStudentAuth'

export interface DaySchedule {
  day: string
  periods: TimetableSlot[]
}

export interface WeeklyTimetable {
  [key: string]: TimetableSlot[]
}

export const useStudentTimetable = () => {
  const { $api } = useNuxtApp()
  const { studentData } = useStudentAuth()

  const timetable = ref<TimetableSlot[]>([])
  const weeklyTimetable = ref<WeeklyTimetable>({})
  const todaySchedule = ref<TimetableSlot[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch student timetable
   */
  const fetchTimetable = async () => {
    loading.value = true
    error.value = null

    try {
      // Get classroom ID from student data
      const classroomId = studentData.value?.classroom

      if (!classroomId) {
        throw new Error('No classroom assigned to student')
      }

      const response = await $api<any[]>(`/timetable/periods/by_classroom/?classroom=${classroomId}`, {
        method: 'GET'
      })

      // Transform API response to match TimetableSlot type
      const transformedData: TimetableSlot[] = response.map((period: any) => ({
        id: period.id,
        classroom: period.classroom?.id || period.classroom,
        classroom_name: period.classroom?.name || '',
        subject: period.subject?.id || period.subject,
        subject_name: period.subject?.name || '',
        teacher: period.teacher?.id || period.teacher,
        teacher_name: period.teacher?.name || '',
        day_of_week: period.day_of_week,
        start_time: period.start_time,
        end_time: period.end_time,
        term: period.term?.id || period.term || 1,
        term_name: period.term?.name || '',
        room_number: period.room_number || null
      }))

      timetable.value = transformedData

      // Organize by day
      const organized: WeeklyTimetable = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      }

      transformedData.forEach(slot => {
        const day = slot.day_of_week
        if (organized[day]) {
          organized[day].push(slot)
        }
      })

      // Sort periods by start time for each day
      Object.keys(organized).forEach(day => {
        if (organized[day]) {
          organized[day].sort((a, b) => {
            return a.start_time.localeCompare(b.start_time)
          })
        }
      })

      weeklyTimetable.value = organized

      // Get today's schedule
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
      todaySchedule.value = organized[today] || []

      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load timetable'
      console.error('Failed to fetch timetable:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get schedule for specific day
   */
  const getScheduleForDay = (day: string): TimetableSlot[] => {
    return weeklyTimetable.value[day] || []
  }

  return {
    timetable,
    weeklyTimetable,
    todaySchedule,
    loading,
    error,
    fetchTimetable,
    getScheduleForDay
  }
}
