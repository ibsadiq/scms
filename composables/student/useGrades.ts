// composables/student/useGrades.ts
import { useStudentAuth } from '~~/composables/useStudentAuth'

export interface SubjectGrade {
  subject_name: string
  ca_score: number
  exam_score: number
  total: number
  grade: string
  position: number
}

export interface StudentResult {
  id: number
  student: number
  student_name: string
  term: number
  term_name: string
  academic_year: string
  annual_average: number
  total_score: number
  position: number
  grade: string
  subjects: SubjectGrade[]
}

export interface ReportCard {
  id: number
  student: number
  term: number
  term_name: string
  academic_year_name: string
  generated_date: string
  download_url: string
}

export const useStudentGrades = () => {
  const { $api } = useNuxtApp()
  const { studentData } = useStudentAuth()

  const results = ref<StudentResult[]>([])
  const reportCards = ref<ReportCard[]>([])
  const selectedResult = ref<StudentResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch student results
   */
  const fetchResults = async (filters?: { term?: number; academic_year?: number }) => {
    if (!studentData.value?.id) return { success: false, error: 'Student not found' }

    loading.value = true
    error.value = null

    try {
      let url = `/examination/term-results/?student=${studentData.value.id}`

      if (filters?.term) {
        url += `&term=${filters.term}`
      }
      if (filters?.academic_year) {
        url += `&academic_year=${filters.academic_year}`
      }

      const response = await $api<StudentResult[]>(url, {
        method: 'GET'
      })

      results.value = response
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load results'
      console.error('Failed to fetch results:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch report cards
   */
  const fetchReportCards = async () => {
    if (!studentData.value?.id) return { success: false, error: 'Student not found' }

    loading.value = true
    error.value = null

    try {
      const response = await $api<ReportCard[]>(
        `/examination/report-cards/?student=${studentData.value.id}`,
        {
          method: 'GET'
        }
      )

      reportCards.value = response
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load report cards'
      console.error('Failed to fetch report cards:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Download report card
   */
  const downloadReportCard = async (reportCardId: number) => {
    try {
      const config = useRuntimeConfig()
      window.open(`${config.public.apiBase}/examination/report-cards/${reportCardId}/download/`, '_blank')
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to download report card'
      return { success: false, error: error.value }
    }
  }

  /**
   * Computed values
   */
  const overallAverage = computed(() => {
    if (results.value.length === 0) return 0
    const total = results.value.reduce((sum, result) => sum + result.annual_average, 0)
    return (total / results.value.length).toFixed(1)
  })

  const bestSubject = computed(() => {
    if (results.value.length === 0 || !selectedResult.value) return null
    const subjects = selectedResult.value.subjects
    if (subjects.length === 0) return null

    return subjects.reduce((best, subject) =>
      subject.total > best.total ? subject : best
    )
  })

  const weakestSubject = computed(() => {
    if (results.value.length === 0 || !selectedResult.value) return null
    const subjects = selectedResult.value.subjects
    if (subjects.length === 0) return null

    return subjects.reduce((weakest, subject) =>
      subject.total < weakest.total ? subject : weakest
    )
  })

  return {
    results,
    reportCards,
    selectedResult,
    loading,
    error,
    overallAverage,
    bestSubject,
    weakestSubject,
    fetchResults,
    fetchReportCards,
    downloadReportCard
  }
}
