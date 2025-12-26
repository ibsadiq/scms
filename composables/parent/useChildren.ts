import { useApi } from '~~/composables/useApi'

export interface Child {
  id: number
  first_name: string
  last_name: string
  admission_number: string
  date_of_birth: string
  gender: string
  status: string
  classroom?: {
    id: number
    name: string
    grade_level?: {
      id: number
      name: string
    }
  }
  class_name?: string
  profile_picture?: string
  current_term?: any
}

export interface ChildPerformance {
  child_id: number
  average_grade: string
  average_score: number
  position: string | number
  total_students: number
  subjects: Array<{
    subject_name: string
    score: number
    grade: string
    position?: number
  }>
}

export interface ChildAttendanceSummary {
  child_id: number
  total_days: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_rate: number
}

export interface ChildFees {
  child_id: number
  total_fees: number
  total_paid: number
  balance: number
  status: string
  fee_items: Array<{
    id: number
    fee_type: string
    amount: number
    paid: number
    balance: number
    due_date?: string
  }>
  payments: Array<{
    id: number
    amount: number
    payment_date: string
    payment_method: string
    reference: string
  }>
}

export const useChildren = () => {
  const { apiCall } = useApi()

  const fetchMyChildren = async () => {
    return await apiCall<Child[]>('/examination/parent/children/')
  }

  const fetchChildDetails = async (childId: number) => {
    return await apiCall<Child>(`/examination/parent/${childId}/child_detail/`)
  }

  const fetchChildPerformance = async (childId: number, termId?: number) => {
    const url = termId
      ? `/examination/parent/results/child/${childId}/?term=${termId}`
      : `/examination/parent/results/child/${childId}/`
    return await apiCall<ChildPerformance>(url)
  }

  const fetchChildAttendance = async (childId: number, termId?: number) => {
    const url = termId
      ? `/examination/parent/attendance/summary/${childId}/?term_id=${termId}`
      : `/examination/parent/attendance/summary/${childId}/`
    return await apiCall<ChildAttendanceSummary>(url)
  }

  const fetchChildFees = async (childId: number) => {
    return await apiCall<ChildFees>(`/examination/parent/fees/child/${childId}/`)
  }

  return {
    fetchMyChildren,
    fetchChildDetails,
    fetchChildPerformance,
    fetchChildAttendance,
    fetchChildFees
  }
}
