// composables/teacher/useGrading.ts
import { useApi } from '~~/composables/useApi'

export interface GradeEntry {
  id?: number
  student: number
  student_name?: string
  subject: number
  assessment_type: string
  score: number
  max_score: number
  grade?: string
  remarks?: string
  term?: number
}

export interface BulkGradeData {
  classroom: number
  subject: number
  assessment_type: string
  term: number
  grades: {
    student: number
    score: number
    remarks?: string
  }[]
}

export const useGrading = () => {
  const { apiCall } = useApi()

  // Fetch grades for a specific class, subject, and assessment
  const fetchGrades = async (params: {
    classroom?: number
    subject?: number
    assessment_type?: string
    term?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params.classroom) queryParams.append('classroom', params.classroom.toString())
    if (params.subject) queryParams.append('subject', params.subject.toString())
    if (params.assessment_type) queryParams.append('assessment_type', params.assessment_type)
    if (params.term) queryParams.append('term', params.term.toString())

    return await apiCall<GradeEntry[]>(`/assessments/results/?${queryParams.toString()}`)
  }

  // Submit bulk grades
  const submitBulkGrades = async (data: BulkGradeData) => {
    return await apiCall('/assessments/results/bulk-create/', {
      method: 'POST',
      body: data
    })
  }

  // Update single grade entry
  const updateGrade = async (id: number, data: Partial<GradeEntry>) => {
    return await apiCall(`/assessments/results/${id}/`, {
      method: 'PATCH',
      body: data
    })
  }

  // Get grading statistics
  const getGradingStats = async (classroomId: number, subjectId: number, termId: number) => {
    return await apiCall(
      `/assessments/results/stats/?classroom=${classroomId}&subject=${subjectId}&term=${termId}`
    )
  }

  return {
    fetchGrades,
    submitBulkGrades,
    updateGrade,
    getGradingStats
  }
}
