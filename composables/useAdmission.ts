// composables/useAdmission.ts
import type {
  AdmissionSession,
  AdmissionFeeStructure,
  AdmissionApplication,
  AdmissionDocument,
  PaymentInfo,
  NextStepsInfo,
  TrackApplicationRequest,
  TrackApplicationResponse,
  CreateApplicationRequest,
  DocumentType,
} from '~~/types/admission'

export const useAdmission = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  // Public API endpoints (no auth required)
  const publicAPI = {
    /**
     * Get all admission sessions
     */
    async getSessions() {
      return await $fetch<AdmissionSession[]>(`${baseURL}/public/admissions/sessions/`)
    },

    /**
     * Get the active admission session
     */
    async getActiveSession() {
      const response = await $fetch<{
        active: boolean
        message: string
        session: AdmissionSession | null
      }>(`${baseURL}/public/admissions/sessions/active/`)

      return response.session
    },

    /**
     * Get fee structures for a session
     */
    async getFeeStructures(sessionId?: number) {
      const params = sessionId ? `?session=${sessionId}` : ''
      return await $fetch<AdmissionFeeStructure[]>(`${baseURL}/public/admissions/fee-structures/${params}`)
    },

    /**
     * Get available classes accepting applications
     */
    async getAvailableClasses() {
      return await $fetch<any[]>(`${baseURL}/public/admissions/classes/`)
    },

    /**
     * Create a new application (draft)
     */
    async createApplication(data: CreateApplicationRequest) {
      return await $fetch<AdmissionApplication>(`${baseURL}/public/admissions/applications/`, {
        method: 'POST',
        body: data,
      })
    },

    /**
     * Track application by email or phone
     */
    async trackApplication(data: TrackApplicationRequest) {
      return await $fetch<TrackApplicationResponse>(`${baseURL}/public/admissions/applications/track/`, {
        method: 'POST',
        body: data,
      })
    },

    /**
     * Get application details by tracking token
     */
    async getApplication(trackingToken: string) {
      return await $fetch<AdmissionApplication>(`${baseURL}/public/admissions/applications/${trackingToken}/`)
    },

    /**
     * Update draft application
     */
    async updateApplication(trackingToken: string, data: Partial<CreateApplicationRequest>) {
      return await $fetch<AdmissionApplication>(`${baseURL}/public/admissions/applications/${trackingToken}/`, {
        method: 'PATCH',
        body: data,
      })
    },

    /**
     * Submit application (move from DRAFT to SUBMITTED)
     */
    async submitApplication(trackingToken: string) {
      return await $fetch<{ message: string; application: AdmissionApplication }>(
        `${baseURL}/public/admissions/applications/${trackingToken}/submit/`,
        {
          method: 'POST',
        }
      )
    },

    /**
     * Accept admission offer
     */
    async acceptOffer(trackingToken: string) {
      return await $fetch<{ message: string; application: AdmissionApplication }>(
        `${baseURL}/public/admissions/applications/${trackingToken}/accept_offer/`,
        {
          method: 'POST',
        }
      )
    },

    /**
     * Get payment information
     */
    async getPaymentInfo(trackingToken: string) {
      return await $fetch<PaymentInfo>(`${baseURL}/public/admissions/applications/${trackingToken}/payment_info/`)
    },

    /**
     * Get next steps
     */
    async getNextSteps(trackingToken: string) {
      return await $fetch<NextStepsInfo>(`${baseURL}/public/admissions/applications/${trackingToken}/next_steps/`)
    },

    /**
     * List documents for an application
     */
    async listDocuments(trackingToken: string) {
      return await $fetch<AdmissionDocument[]>(`${baseURL}/public/admissions/applications/${trackingToken}/documents/`)
    },

    /**
     * Upload a document
     */
    async uploadDocument(trackingToken: string, formData: FormData) {
      return await $fetch<AdmissionDocument>(
        `${baseURL}/public/admissions/applications/${trackingToken}/documents/`,
        {
          method: 'POST',
          body: formData,
        }
      )
    },

    /**
     * Delete a document
     */
    async deleteDocument(documentId: number) {
      return await $fetch(`${baseURL}/public/admissions/documents/${documentId}/`, {
        method: 'DELETE',
      })
    },
  }

  return {
    publicAPI,
  }
}
