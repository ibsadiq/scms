// types/admission.ts

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_PENDING'
  | 'EXAM_SCHEDULED'
  | 'EXAM_COMPLETED'
  | 'INTERVIEW_SCHEDULED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'ENROLLED'
  | 'WITHDRAWN'

export type DocumentType =
  | 'BIRTH_CERTIFICATE'
  | 'PASSPORT_PHOTO'
  | 'PREVIOUS_REPORT'
  | 'IMMUNIZATION_RECORD'
  | 'PARENT_ID'
  | 'OTHER'

export type Gender = 'M' | 'F'

export interface AdmissionSession {
  id: number
  name: string
  academic_year: number
  academic_year_display?: string
  start_date: string
  end_date: string
  is_active: boolean
  is_open?: boolean
  allow_public_applications: boolean
  application_instructions?: string
  require_acceptance_fee: boolean
  acceptance_fee_deadline_days?: number
  offer_expiry_days?: number
  created_at?: string
  updated_at?: string
}

export interface AdmissionFeeStructure {
  id: number
  admission_session: number
  grade_levels: number[]
  grade_level_names: string[]
  application_fee: number
  application_fee_required: boolean
  entrance_exam_required: boolean
  entrance_exam_fee?: number
  entrance_exam_pass_score?: number
  interview_required: boolean
  acceptance_fee: number
  acceptance_fee_required: boolean
  acceptance_fee_is_part_of_tuition: boolean
  minimum_age?: number
  maximum_age?: number
  max_applications?: number
  has_capacity: boolean
}

export interface AdmissionApplication {
  id: number
  application_number: string
  tracking_token?: string
  status: ApplicationStatus
  status_display?: string
  admission_session: number
  admission_session_name?: string
  applying_for_class: number
  applying_for_class_name?: string

  // Student Information
  first_name: string
  middle_name?: string
  last_name: string
  full_name?: string
  gender: Gender
  date_of_birth: string
  age?: number

  // Nigerian-specific
  state_of_origin?: string
  lga?: string
  religion?: string
  blood_group?: string

  // Contact
  address?: string
  city?: string

  // Parent/Guardian
  parent_first_name: string
  parent_last_name: string
  parent_email: string
  parent_phone: string
  parent_occupation?: string
  parent_relationship?: string

  // Alternative Contact
  alt_contact_name?: string
  alt_contact_phone?: string
  alt_contact_relationship?: string

  // Previous School
  previous_school?: string
  previous_class?: string

  // Medical
  medical_conditions?: string
  special_needs?: string

  // Payment Status
  application_fee_paid: boolean
  application_fee_payment_date?: string
  exam_fee_paid: boolean
  exam_fee_payment_date?: string
  acceptance_fee_paid: boolean
  acceptance_fee_payment_date?: string

  // Exam/Interview
  exam_date?: string
  exam_time?: string
  exam_venue?: string
  interview_date?: string
  interview_time?: string
  interview_venue?: string

  // Admin Fields
  admin_notes?: string
  rejection_reason?: string
  reviewed_by?: number
  reviewed_by_name?: string
  approval_notes?: string
  acceptance_deadline?: string
  offer_expiry_date?: string
  withdrawal_reason?: string

  // Timestamps
  submitted_at?: string
  approved_at?: string
  accepted_at?: string
  enrolled_at?: string
  created_at?: string
  updated_at?: string

  // Computed
  can_submit?: boolean
  can_accept_offer?: boolean
  all_fees_paid?: boolean
  next_steps?: string
}

export interface AdmissionDocument {
  id: number
  application: number
  document_type: DocumentType
  document_type_display: string
  file: string
  file_url: string
  description?: string
  verified: boolean
  verification_notes?: string
  rejection_reason?: string
  verified_by?: number
  verified_by_name?: string
  uploaded_at: string
}

export interface PaymentInfo {
  application_fee: {
    required: boolean
    amount: number
    paid: boolean
    payment_date?: string
  }
  exam_fee: {
    required: boolean
    amount: number
    paid: boolean
    payment_date?: string
  }
  acceptance_fee: {
    required: boolean
    amount: number
    paid: boolean
    payment_date?: string
    is_part_of_tuition: boolean
  }
  total_unpaid: number
}

export interface NextStepsInfo {
  current_status: ApplicationStatus
  next_steps: string
  actions_required: string[]
  can_submit: boolean
  can_accept_offer: boolean
}

export interface SessionStatistics {
  total_applications: number
  by_status: Record<string, number>
  by_class: Record<string, number>
  pending_actions: {
    new_submissions: number
    pending_documents: number
    pending_exams: number
    pending_interviews: number
    awaiting_acceptance: number
  }
  revenue: {
    application_fees: number
    exam_fees: number
    acceptance_fees: number
  }
}

export interface TrackApplicationRequest {
  application_number: string
  parent_email?: string
  parent_phone?: string
}

export interface TrackApplicationResponse {
  tracking_token: string
  message: string
}

export interface CreateApplicationRequest {
  admission_session: number
  applying_for_class: number
  first_name: string
  middle_name?: string
  last_name: string
  gender: Gender
  date_of_birth: string
  state_of_origin?: string
  lga?: string
  religion?: string
  blood_group?: string
  address?: string
  city?: string
  parent_first_name: string
  parent_last_name: string
  parent_email: string
  parent_phone: string
  parent_occupation?: string
  parent_relationship?: string
  alt_contact_name?: string
  alt_contact_phone?: string
  alt_contact_relationship?: string
  previous_school?: string
  previous_class?: string
  medical_conditions?: string
  special_needs?: string
}

export interface EnrollmentResponse {
  message: string
  application: AdmissionApplication
  student_id: number
  username: string
}
