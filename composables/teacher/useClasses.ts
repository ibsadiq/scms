// composables/teacher/useClasses.ts
import { useApi } from '~~/composables/useApi'

export interface TeacherClass {
  id: number
  classroom_id?: number
  classroom_name: string
  subject_name: string
  grade_level_name: string
  student_count: number
  is_class_teacher?: boolean  // True if teacher is homeroom/classroom teacher
  schedule?: {
    day: string
    start_time: string
    end_time: string
  }[]
}

export interface ClassStudent {
  id: number
  admission_number: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  photo?: string
  status: string
  grade_level_name?: string
}

// Mock data for development (remove when backend is ready)
const MOCK_DATA: TeacherClass[] = [
  {
    id: 1,
    classroom_id: 101,
    classroom_name: 'JSS 2A',
    subject_name: 'Mathematics',
    grade_level_name: 'JSS 2',
    student_count: 35,
    is_class_teacher: true,
    schedule: [
      { day: 'Monday', start_time: '08:00:00', end_time: '09:00:00' },
      { day: 'Wednesday', start_time: '10:00:00', end_time: '11:00:00' },
      { day: 'Friday', start_time: '13:00:00', end_time: '14:00:00' }
    ]
  },
  {
    id: 2,
    classroom_id: 102,
    classroom_name: 'JSS 2B',
    subject_name: 'Mathematics',
    grade_level_name: 'JSS 2',
    student_count: 32,
    is_class_teacher: false,
    schedule: [
      { day: 'Tuesday', start_time: '09:00:00', end_time: '10:00:00' },
      { day: 'Thursday', start_time: '11:00:00', end_time: '12:00:00' }
    ]
  },
  {
    id: 3,
    classroom_id: 103,
    classroom_name: 'JSS 3A',
    subject_name: 'Mathematics',
    grade_level_name: 'JSS 3',
    student_count: 30,
    is_class_teacher: false,
    schedule: [
      { day: 'Monday', start_time: '11:00:00', end_time: '12:00:00' },
      { day: 'Friday', start_time: '09:00:00', end_time: '10:00:00' }
    ]
  },
  {
    id: 4,
    classroom_id: 201,
    classroom_name: 'SSS 1B',
    subject_name: 'Physics',
    grade_level_name: 'SSS 1',
    student_count: 28,
    is_class_teacher: false,
    schedule: [
      { day: 'Tuesday', start_time: '13:00:00', end_time: '14:00:00' },
      { day: 'Thursday', start_time: '14:00:00', end_time: '15:00:00' }
    ]
  },
  {
    id: 5,
    classroom_id: 202,
    classroom_name: 'SSS 2A',
    subject_name: 'Further Mathematics',
    grade_level_name: 'SSS 2',
    student_count: 25,
    is_class_teacher: false,
    schedule: [
      { day: 'Wednesday', start_time: '14:00:00', end_time: '15:00:00' }
    ]
  }
]

const MOCK_STUDENTS: ClassStudent[] = [
  {
    id: 1,
    admission_number: 'ADM001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@school.com',
    status: 'active',
    grade_level_name: 'JSS 2'
  },
  {
    id: 2,
    admission_number: 'ADM002',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@school.com',
    status: 'active',
    grade_level_name: 'JSS 2'
  },
  {
    id: 3,
    admission_number: 'ADM003',
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.j@school.com',
    status: 'active',
    grade_level_name: 'JSS 2'
  }
]

export const useClasses = () => {
  const { apiCall } = useApi()

  // Set to true to use mock data (for frontend testing without backend)
  const USE_MOCK_DATA = false

  // Fetch all classes assigned to the teacher (including homeroom)
  const fetchMyClasses = async () => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return { data: MOCK_DATA, error: null }
    }
    return await apiCall<TeacherClass[]>('/academic/allocated-subjects/my-classes/')
  }

  // Fetch homeroom class (if teacher is a classroom teacher)
  const fetchHomeroomClass = async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const homeroom = MOCK_DATA.find(c => c.is_class_teacher === true)
      return { data: homeroom || null, error: null }
    }
    return await apiCall('/academic/teachers/homeroom-class/')
  }

  // Fetch students in a specific class
  const fetchClassStudents = async (classroomId: number) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400))
      // Return mock students for any classroom
      return { data: MOCK_STUDENTS, error: null }
    }
    return await apiCall<ClassStudent[]>(`/academic/classrooms/${classroomId}/students/`)
  }

  // Get class details
  const getClassDetails = async (allocationId: number) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const classItem = MOCK_DATA.find(c => c.id === allocationId)
      return { data: classItem || null, error: null }
    }
    return await apiCall(`/academic/allocated-subjects/${allocationId}/`)
  }

  return {
    fetchMyClasses,
    fetchHomeroomClass,
    fetchClassStudents,
    getClassDetails
  }
}
