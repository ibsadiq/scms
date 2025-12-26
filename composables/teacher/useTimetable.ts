// composables/teacher/useTimetable.ts
import { useApi } from '~~/composables/useApi'

export interface TimetablePeriod {
  id: number
  day_of_week: string
  start_time: string
  end_time: string
  subject_name: string
  classroom_name: string
  grade_level_name: string
  room_number?: string
  is_active: boolean
}

export const useTimetable = () => {
  const { apiCall } = useApi()

  // Fetch teacher's timetable
  const fetchMyTimetable = async () => {
    return await apiCall<TimetablePeriod[]>('/academic/timetable/my-schedule/')
  }

  // Fetch timetable for a specific day
  const fetchDaySchedule = async (dayOfWeek: string) => {
    return await apiCall<TimetablePeriod[]>(
      `/academic/timetable/my-schedule/?day=${dayOfWeek}`
    )
  }

  // Fetch today's schedule
  const fetchTodaySchedule = async () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return await fetchDaySchedule(today)
  }

  return {
    fetchMyTimetable,
    fetchDaySchedule,
    fetchTodaySchedule
  }
}
