import { useApi } from '../useApi'
import { useAuth } from '../useAuth'

export interface SubjectGrade {
  id: number
  subject_id: number
  subject_name: string
  subject_code?: string
  test_score: number
  exam_score: number
  total_score: number
  grade: string
  remark: string
  position?: number
  class_average?: number
  highest_score?: number
  lowest_score?: number
}

export interface TermGrades {
  term_id: number
  term_name: string
  academic_year: string
  student_id: number
  student_name: string
  class_name: string
  subjects: SubjectGrade[]
  total_score: number
  average_score: number
  overall_grade: string
  position: number
  total_students: number
  attendance: {
    present: number
    absent: number
    total_days: number
  }
  remarks?: {
    class_teacher?: string
    principal?: string
  }
}

export interface AcademicProgress {
  student_id: number
  terms: Array<{
    term_id: number
    term_name: string
    year: string
    average_score: number
    position: number
    total_students: number
  }>
  subject_trends: Array<{
    subject_name: string
    scores: Array<{
      term: string
      score: number
      grade: string
    }>
  }>
}

export interface ExamSchedule {
  id: number
  exam_name: string
  subject_name: string
  date: string
  start_time: string
  end_time: string
  venue?: string
  duration?: number
  instructions?: string
}

export const useGrades = () => {
  const { apiCall } = useApi()

  const fetchChildGrades = async (childId: number, termId?: number) => {
    // Uses /api/examination/parent/results/child/{child_id}/
    const url = termId
      ? `/examination/parent/results/child/${childId}/?term=${termId}`
      : `/examination/parent/results/child/${childId}/`
    return await apiCall<TermGrades>(url)
  }

  const fetchAcademicProgress = async (childId: number) => {
    // Uses /api/examination/parent/results/child/{child_id}/
    return await apiCall<AcademicProgress>(`/examination/parent/results/child/${childId}/`)
  }

  const fetchSubjectGrade = async (childId: number, subjectId: number, termId?: number) => {
    // Uses /api/examination/parent/results/{term_result_id}/term/ for detailed term results
    const url = termId
      ? `/examination/parent/results/${termId}/term/`
      : `/examination/parent/results/child/${childId}/`
    return await apiCall<SubjectGrade>(url)
  }

  const fetchExamSchedule = async (childId: number, params?: {
    start_date?: string
    end_date?: string
    term?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.term) queryParams.append('term', params.term.toString())

    // Note: Exam schedule endpoint may not be implemented in Phase 1.4
    const url = `/examination/parent/results/child/${childId}/${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return await apiCall<ExamSchedule[]>(url)
  }

  const downloadReportCard = async (_childId: number, termId: number) => {
    // Note: Report card download endpoint may need verification
    // Direct download using window.open since PDF downloads work differently
    try {
      const config = useRuntimeConfig()
      const auth = useAuth()

      const url = `${config.public.apiBase}/examination/parent/results/${termId}/download/`

      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.download = `report-card-${termId}.pdf`

      // Add authorization via fetch for download
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${auth.token.value}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download report card')
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      link.href = blobUrl
      link.click()

      window.URL.revokeObjectURL(blobUrl)

      return { data: true, error: null }
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to download report card' }
    }
  }

  return {
    fetchChildGrades,
    fetchAcademicProgress,
    fetchSubjectGrade,
    fetchExamSchedule,
    downloadReportCard
  }
}
