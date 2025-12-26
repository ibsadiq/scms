// composables/student/useAssignments.ts

export interface StudentAssignment {
  id: number
  title: string
  description: string
  assignment_type: 'homework' | 'project' | 'quiz' | 'research' | 'essay' | 'lab_report' | 'other'
  subject_name: string
  teacher_name: string
  due_date: string
  max_score: number
  is_overdue: boolean
  has_submitted: boolean
  submission_id?: number
  is_graded: boolean
  grade?: {
    score: number
    final_score: number
    percentage: number
    grade_letter: string
    feedback: string
    late_penalty_applied: number
  }
  attachments: AttachmentFile[]
}

export interface AttachmentFile {
  id: number
  file: string
  file_url: string
  file_name: string
  file_size: number
  uploaded_at: string
}

export interface AssignmentSubmission {
  id: number
  assignment: number
  submission_text: string
  submitted_at: string
  is_late: boolean
  is_graded: boolean
  attachments: AttachmentFile[]
  grade?: any
}

export const useStudentAssignments = () => {
  const { $api } = useNuxtApp()

  const assignments = ref<StudentAssignment[]>([])
  const selectedAssignment = ref<StudentAssignment | null>(null)
  const mySubmission = ref<AssignmentSubmission | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all assignments
   */
  const fetchAssignments = async (filters?: { subject?: number; submitted?: boolean }) => {
    loading.value = true
    error.value = null

    try {
      let url = '/assignments/student/assignments/'
      const params = new URLSearchParams()

      if (filters?.subject) {
        params.append('subject', filters.subject.toString())
      }
      if (filters?.submitted !== undefined) {
        params.append('submitted', filters.submitted.toString())
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await $api<StudentAssignment[]>(url, {
        method: 'GET'
      })

      assignments.value = response
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load assignments'
      console.error('Failed to fetch assignments:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get assignment details
   */
  const fetchAssignment = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<StudentAssignment>(`/assignments/student/assignments/${id}/`, {
        method: 'GET'
      })

      selectedAssignment.value = response
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load assignment'
      console.error('Failed to fetch assignment:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get my submission for an assignment
   */
  const fetchMySubmission = async (assignmentId: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<AssignmentSubmission>(
        `/assignments/student/assignments/${assignmentId}/my_submission/`,
        {
          method: 'GET'
        }
      )

      mySubmission.value = response
      return { success: true, data: response }
    } catch (err: any) {
      // 404 means no submission yet, which is valid
      if (err.statusCode === 404) {
        mySubmission.value = null
        return { success: true, data: null }
      }

      error.value = err.message || 'Failed to load submission'
      console.error('Failed to fetch submission:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Submit an assignment
   */
  const submitAssignment = async (assignmentId: number, formData: FormData) => {
    submitting.value = true
    error.value = null

    try {
      const response = await $api<AssignmentSubmission>(
        `/assignments/student/assignments/${assignmentId}/submit/`,
        {
          method: 'POST',
          body: formData
        }
      )

      mySubmission.value = response

      // Refresh assignments list
      await fetchAssignments()

      return { success: true, data: response, message: 'Assignment submitted successfully' }
    } catch (err: any) {
      error.value = err.message || 'Failed to submit assignment'
      console.error('Failed to submit assignment:', err)
      return { success: false, error: error.value }
    } finally {
      submitting.value = false
    }
  }

  /**
   * Update submission
   */
  const updateSubmission = async (assignmentId: number, formData: FormData) => {
    submitting.value = true
    error.value = null

    try {
      const response = await $api<AssignmentSubmission>(
        `/assignments/student/assignments/${assignmentId}/update_submission/`,
        {
          method: 'PUT',
          body: formData
        }
      )

      mySubmission.value = response

      // Refresh assignments list
      await fetchAssignments()

      return { success: true, data: response, message: 'Submission updated successfully' }
    } catch (err: any) {
      error.value = err.message || 'Failed to update submission'
      console.error('Failed to update submission:', err)
      return { success: false, error: error.value }
    } finally {
      submitting.value = false
    }
  }

  /**
   * Computed values
   */
  const upcomingAssignments = computed(() => {
    return assignments.value.filter(a => !a.has_submitted && !a.is_overdue)
  })

  const overdueAssignments = computed(() => {
    return assignments.value.filter(a => !a.has_submitted && a.is_overdue)
  })

  const submittedAssignments = computed(() => {
    return assignments.value.filter(a => a.has_submitted)
  })

  const gradedAssignments = computed(() => {
    return assignments.value.filter(a => a.is_graded)
  })

  return {
    assignments,
    selectedAssignment,
    mySubmission,
    loading,
    submitting,
    error,
    upcomingAssignments,
    overdueAssignments,
    submittedAssignments,
    gradedAssignments,
    fetchAssignments,
    fetchAssignment,
    fetchMySubmission,
    submitAssignment,
    updateSubmission
  }
}
