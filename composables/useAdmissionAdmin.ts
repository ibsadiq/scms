// composables/useAdmissionAdmin.ts
import { useAuth } from '~~/composables/useAuth'
import type {
  AdmissionSession,
  AdmissionFeeStructure,
  AdmissionApplication,
  AdmissionDocument,
  SessionStatistics,
  EnrollmentResponse,
} from '~~/types/admission'

export const useAdmissionAdmin = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase
  const { token } = useAuth()

  const headers = computed(() => ({
    Authorization: `Bearer ${token.value}`,
  }))

  // Admin API endpoints (auth required)
  const adminAPI = {
    // Session Management
    async listSessions() {
      return await $fetch<AdmissionSession[]>(`${baseURL}/admissions/sessions/`, {
        headers: headers.value,
      })
    },

    async createSession(data: Partial<AdmissionSession>) {
      return await $fetch<AdmissionSession>(`${baseURL}/admissions/sessions/`, {
        method: 'POST',
        headers: headers.value,
        body: data,
      })
    },

    async updateSession(id: number, data: Partial<AdmissionSession>) {
      return await $fetch<AdmissionSession>(`${baseURL}/admissions/sessions/${id}/`, {
        method: 'PATCH',
        headers: headers.value,
        body: data,
      })
    },

    async activateSession(id: number) {
      return await $fetch<{ message: string }>(`${baseURL}/admissions/sessions/${id}/activate/`, {
        method: 'POST',
        headers: headers.value,
      })
    },

    async getSessionStatistics(id: number) {
      return await $fetch<SessionStatistics>(`${baseURL}/admissions/sessions/${id}/statistics/`, {
        headers: headers.value,
      })
    },

    // Fee Structure Management
    async listFeeStructures(sessionId?: number) {
      const params = sessionId ? `?session=${sessionId}` : ''
      return await $fetch<AdmissionFeeStructure[]>(`${baseURL}/admissions/fee-structures/${params}`, {
        headers: headers.value,
      })
    },

    async createFeeStructure(data: Partial<AdmissionFeeStructure>) {
      return await $fetch<AdmissionFeeStructure>(`${baseURL}/admissions/fee-structures/`, {
        method: 'POST',
        headers: headers.value,
        body: data,
      })
    },

    async updateFeeStructure(id: number, data: Partial<AdmissionFeeStructure>) {
      return await $fetch<AdmissionFeeStructure>(`${baseURL}/admissions/fee-structures/${id}/`, {
        method: 'PATCH',
        headers: headers.value,
        body: data,
      })
    },

    // Application Management
    async listApplications(params?: Record<string, any>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      return await $fetch<{ count: number; next: string | null; previous: string | null; results: AdmissionApplication[] }>(
        `${baseURL}/admissions/applications/${queryString}`,
        {
          headers: headers.value,
        }
      )
    },

    async getApplication(id: number) {
      return await $fetch<AdmissionApplication>(`${baseURL}/admissions/applications/${id}/`, {
        headers: headers.value,
      })
    },

    async updateApplication(id: number, data: Partial<AdmissionApplication>) {
      return await $fetch<AdmissionApplication>(`${baseURL}/admissions/applications/${id}/`, {
        method: 'PATCH',
        headers: headers.value,
        body: data,
      })
    },

    // Workflow Actions
    async startReview(id: number) {
      return await $fetch<{ message: string; application: AdmissionApplication }>(
        `${baseURL}/admissions/applications/${id}/start_review/`,
        {
          method: 'POST',
          headers: headers.value,
        }
      )
    },

    async requestDocuments(id: number, notes: string) {
      return await $fetch<{ message: string; application: AdmissionApplication }>(
        `${baseURL}/admissions/applications/${id}/request_documents/`,
        {
          method: 'POST',
          headers: headers.value,
          body: { notes },
        }
      )
    },

    async scheduleExam(id: number, data: { exam_date: string; exam_time: string; exam_venue: string }) {
      return await $fetch<{ message: string; application: AdmissionApplication }>(
        `${baseURL}/admissions/applications/${id}/schedule_exam/`,
        {
          method: 'POST',
          headers: headers.value,
          body: data,
        }
      )
    },

    async markExamCompleted(id: number) {
      return await $fetch<{ message: string; application: AdmissionApplication }>(
        `${baseURL}/admissions/applications/${id}/mark_exam_completed/`,
        {
          method: 'POST',
          headers: headers.value,
        }
      )
    },

    async scheduleInterview(id: number, data: { interview_date: string; interview_time: string; interview_venue: string }) {
      return await $fetch<{ message: string; application: AdmissionApplication }>(
        `${baseURL}/admissions/applications/${id}/schedule_interview/`,
        {
          method: 'POST',
          headers: headers.value,
          body: data,
        }
      )
    },

    async approveApplication(id: number, approval_notes?: string) {
      return await $fetch<{ message: string; application: AdmissionApplication }>(
        `${baseURL}/admissions/applications/${id}/approve/`,
        {
          method: 'POST',
          headers: headers.value,
          body: { approval_notes },
        }
      )
    },

    async rejectApplication(id: number, rejection_reason: string) {
      return await $fetch<{ message: string; application: AdmissionApplication }>(
        `${baseURL}/admissions/applications/${id}/reject/`,
        {
          method: 'POST',
          headers: headers.value,
          body: { rejection_reason },
        }
      )
    },

    async enrollStudent(id: number) {
      return await $fetch<EnrollmentResponse>(`${baseURL}/admissions/applications/${id}/enroll/`, {
        method: 'POST',
        headers: headers.value,
      })
    },

    async withdrawApplication(id: number, withdrawal_reason: string) {
      return await $fetch<{ message: string; application: AdmissionApplication }>(
        `${baseURL}/admissions/applications/${id}/withdraw/`,
        {
          method: 'POST',
          headers: headers.value,
          body: { withdrawal_reason },
        }
      )
    },

    async exportApplications(params?: Record<string, any>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      return await $fetch<Blob>(`${baseURL}/admissions/applications/export/${queryString}`, {
        headers: headers.value,
      })
    },

    // Document Management
    async listDocuments(applicationId: number) {
      return await $fetch<AdmissionDocument[]>(`${baseURL}/admissions/documents/?application=${applicationId}`, {
        headers: headers.value,
      })
    },

    async verifyDocument(documentId: number, verification_notes?: string) {
      return await $fetch<AdmissionDocument>(`${baseURL}/admissions/documents/${documentId}/verify/`, {
        method: 'POST',
        headers: headers.value,
        body: { verification_notes },
      })
    },

    async rejectDocument(documentId: number, rejection_reason: string) {
      return await $fetch<AdmissionDocument>(`${baseURL}/admissions/documents/${documentId}/reject/`, {
        method: 'POST',
        headers: headers.value,
        body: { rejection_reason },
      })
    },
  }

  return {
    adminAPI,
  }
}
