<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
      <div class="flex items-center justify-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
        <span class="ml-2 text-neutral-600 dark:text-neutral-400">Loading application...</span>
      </div>
    </div>

    <!-- Application Content -->
    <div v-else-if="application" class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <Button @click="navigateTo('/admin/admissions/applications')" variant="ghost" size="icon">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </Button>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ application.full_name }}</h1>
          <p class="text-neutral-600 dark:text-neutral-400 mt-1">Application #{{ application.application_number }}</p>
        </div>
        <span
          class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
          :class="getStatusColor(application.status)"
        >
          {{ application.status_display }}
        </span>
      </div>

      <!-- Workflow Actions -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Workflow Actions</h3>
        <div class="flex flex-wrap gap-2">
          <Button v-if="application.status === 'SUBMITTED'" @click="showStartReviewDialog = true" size="sm">
            <Icon name="lucide:play" class="w-4 h-4 mr-2" />
            Start Review
          </Button>
          <Button v-if="canRequestDocuments" @click="showRequestDocsDialog = true" size="sm" variant="outline">
            <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
            Request Documents
          </Button>
          <Button v-if="canScheduleExam" @click="showScheduleExamDialog = true" size="sm" variant="outline">
            <Icon name="lucide:clipboard-check" class="w-4 h-4 mr-2" />
            Schedule Exam
          </Button>
          <Button v-if="application.status === 'EXAM_SCHEDULED'" @click="markExamCompleted" size="sm" variant="outline">
            <Icon name="lucide:check" class="w-4 h-4 mr-2" />
            Mark Exam Completed
          </Button>
          <Button v-if="canScheduleInterview" @click="showScheduleInterviewDialog = true" size="sm" variant="outline">
            <Icon name="lucide:users" class="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
          <Button v-if="canApprove" @click="showApproveDialog = true" size="sm" class="bg-green-600 hover:bg-green-700">
            <Icon name="lucide:check-circle" class="w-4 h-4 mr-2" />
            Approve Application
          </Button>
          <Button v-if="canReject" @click="showRejectDialog = true" size="sm" variant="destructive">
            <Icon name="lucide:x-circle" class="w-4 h-4 mr-2" />
            Reject Application
          </Button>
          <Button v-if="application.status === 'ACCEPTED'" @click="enrollStudent" size="sm" class="bg-purple-600 hover:bg-purple-700">
            <Icon name="lucide:user-plus" class="w-4 h-4 mr-2" />
            Enroll Student
          </Button>
          <Button @click="showWithdrawDialog = true" size="sm" variant="outline">
            <Icon name="lucide:ban" class="w-4 h-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </div>

      <!-- Student Information -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Student Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Full Name</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.full_name }}</p>
          </div>
          <div>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Gender</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.gender === 'M' ? 'Male' : 'Female' }}</p>
          </div>
          <div>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Date of Birth</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ formatDate(application.date_of_birth) }} ({{ application.age }} years)</p>
          </div>
          <div>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Applying for Class</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.applying_for_class_name }}</p>
          </div>
          <div v-if="application.state_of_origin">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">State of Origin</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.state_of_origin }}</p>
          </div>
          <div v-if="application.lga">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">LGA</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.lga }}</p>
          </div>
          <div v-if="application.religion">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Religion</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.religion }}</p>
          </div>
          <div v-if="application.blood_group">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Blood Group</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.blood_group }}</p>
          </div>
          <div v-if="application.address" class="md:col-span-2">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Address</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.address }}, {{ application.city }}</p>
          </div>
        </div>
      </div>

      <!-- Parent/Guardian Information -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Parent/Guardian Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Name</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.parent_first_name }} {{ application.parent_last_name }}</p>
          </div>
          <div>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Email</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.parent_email }}</p>
          </div>
          <div>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Phone</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.parent_phone }}</p>
          </div>
          <div v-if="application.parent_occupation">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Occupation</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.parent_occupation }}</p>
          </div>
          <div v-if="application.parent_relationship">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">Relationship</p>
            <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.parent_relationship }}</p>
          </div>
        </div>

        <!-- Alternative Contact -->
        <div v-if="application.alt_contact_name" class="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Alternative Contact</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Name</p>
              <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.alt_contact_name }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Phone</p>
              <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.alt_contact_phone }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Relationship</p>
              <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.alt_contact_relationship }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Status -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Payment Status</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <span class="font-medium text-neutral-900 dark:text-neutral-100">Application Fee</span>
            <span v-if="application.application_fee_paid" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Icon name="lucide:check" class="w-3 h-3 mr-1" />
              Paid {{ application.application_fee_payment_date ? `on ${formatDate(application.application_fee_payment_date)}` : '' }}
            </span>
            <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Not Paid
            </span>
          </div>
          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <span class="font-medium text-neutral-900 dark:text-neutral-100">Exam Fee</span>
            <span v-if="application.exam_fee_paid" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Icon name="lucide:check" class="w-3 h-3 mr-1" />
              Paid {{ application.exam_fee_payment_date ? `on ${formatDate(application.exam_fee_payment_date)}` : '' }}
            </span>
            <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
              Not Paid
            </span>
          </div>
          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <span class="font-medium text-neutral-900 dark:text-neutral-100">Acceptance Fee</span>
            <span v-if="application.acceptance_fee_paid" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Icon name="lucide:check" class="w-3 h-3 mr-1" />
              Paid {{ application.acceptance_fee_payment_date ? `on ${formatDate(application.acceptance_fee_payment_date)}` : '' }}
            </span>
            <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
              Not Paid
            </span>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Documents</h3>
        <div v-if="documents.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <Icon name="lucide:file-text" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No documents uploaded yet</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="doc in documents"
            :key="doc.id"
            class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg"
          >
            <div class="flex items-center gap-3 flex-1">
              <Icon name="lucide:file-text" class="w-5 h-5 text-neutral-400" />
              <div>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ doc.document_type_display }}</p>
                <p v-if="doc.description" class="text-sm text-neutral-600 dark:text-neutral-400">{{ doc.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="doc.verified" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Icon name="lucide:check" class="w-3 h-3 mr-1" />
                Verified
              </span>
              <Button size="sm" variant="ghost" @click="window.open(doc.file_url, '_blank')">
                <Icon name="lucide:eye" class="w-4 h-4" />
              </Button>
              <Button v-if="!doc.verified" size="sm" variant="ghost" @click="verifyDocument(doc.id)">
                <Icon name="lucide:check-circle" class="w-4 h-4 text-green-600" />
              </Button>
              <Button v-if="!doc.verified" size="sm" variant="ghost" @click="showRejectDocDialog(doc)">
                <Icon name="lucide:x-circle" class="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Previous School & Medical Info -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Previous School -->
        <div v-if="application.previous_school" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Previous School</h3>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">School Name</p>
              <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.previous_school }}</p>
            </div>
            <div v-if="application.previous_class">
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Previous Class</p>
              <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.previous_class }}</p>
            </div>
          </div>
        </div>

        <!-- Medical Information -->
        <div v-if="application.medical_conditions || application.special_needs" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Medical Information</h3>
          <div class="space-y-3">
            <div v-if="application.medical_conditions">
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Medical Conditions</p>
              <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.medical_conditions }}</p>
            </div>
            <div v-if="application.special_needs">
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Special Needs</p>
              <p class="font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ application.special_needs }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Notes -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Admin Notes</h3>
        <textarea
          v-model="adminNotes"
          class="flex min-h-[100px] w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          placeholder="Add internal notes about this application..."
        ></textarea>
        <Button @click="saveAdminNotes" class="mt-3" :disabled="isSavingNotes">
          <Icon v-if="isSavingNotes" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
          Save Notes
        </Button>
      </div>
    </div>

    <!-- Dialogs -->
    <!-- Start Review Dialog -->
    <Dialog v-model:open="showStartReviewDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Review</DialogTitle>
        </DialogHeader>
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          This will move the application to "Under Review" status. Continue?
        </p>
        <DialogFooter>
          <Button variant="outline" @click="showStartReviewDialog = false">Cancel</Button>
          <Button @click="startReview">Start Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Request Documents Dialog -->
    <Dialog v-model:open="showRequestDocsDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Documents</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="doc_notes">Notes for Parent</Label>
            <textarea
              id="doc_notes"
              v-model="requestDocsNotes"
              class="flex min-h-[100px] w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
              placeholder="Specify which documents are needed..."
              required
            ></textarea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showRequestDocsDialog = false">Cancel</Button>
          <Button @click="requestDocuments" :disabled="!requestDocsNotes">Request Documents</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Schedule Exam Dialog -->
    <Dialog v-model:open="showScheduleExamDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Exam</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="scheduleExam" class="space-y-4">
          <div>
            <Label for="exam_date">Exam Date *</Label>
            <Input id="exam_date" v-model="examForm.exam_date" type="date" required />
          </div>
          <div>
            <Label for="exam_time">Exam Time *</Label>
            <Input id="exam_time" v-model="examForm.exam_time" type="time" required />
          </div>
          <div>
            <Label for="exam_venue">Venue *</Label>
            <Input id="exam_venue" v-model="examForm.exam_venue" placeholder="e.g., School Main Hall" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showScheduleExamDialog = false">Cancel</Button>
            <Button type="submit">Schedule Exam</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Schedule Interview Dialog -->
    <Dialog v-model:open="showScheduleInterviewDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="scheduleInterview" class="space-y-4">
          <div>
            <Label for="interview_date">Interview Date *</Label>
            <Input id="interview_date" v-model="interviewForm.interview_date" type="date" required />
          </div>
          <div>
            <Label for="interview_time">Interview Time *</Label>
            <Input id="interview_time" v-model="interviewForm.interview_time" type="time" required />
          </div>
          <div>
            <Label for="interview_venue">Venue *</Label>
            <Input id="interview_venue" v-model="interviewForm.interview_venue" placeholder="e.g., Principal's Office" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showScheduleInterviewDialog = false">Cancel</Button>
            <Button type="submit">Schedule Interview</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Approve Dialog -->
    <Dialog v-model:open="showApproveDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Application</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="approval_notes">Approval Notes (Optional)</Label>
            <textarea
              id="approval_notes"
              v-model="approvalNotes"
              class="flex min-h-[100px] w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
              placeholder="e.g., Excellent performance. We're pleased to offer admission."
            ></textarea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showApproveDialog = false">Cancel</Button>
          <Button @click="approveApplication" class="bg-green-600 hover:bg-green-700">Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reject Dialog -->
    <Dialog v-model:open="showRejectDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="rejection_reason">Rejection Reason *</Label>
            <textarea
              id="rejection_reason"
              v-model="rejectionReason"
              class="flex min-h-[100px] w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
              placeholder="Please provide a reason for rejection..."
              required
            ></textarea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showRejectDialog = false">Cancel</Button>
          <Button @click="rejectApplication" variant="destructive" :disabled="!rejectionReason">Reject</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Withdraw Dialog -->
    <Dialog v-model:open="showWithdrawDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Application</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="withdrawal_reason">Withdrawal Reason *</Label>
            <textarea
              id="withdrawal_reason"
              v-model="withdrawalReason"
              class="flex min-h-[100px] w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
              placeholder="Please provide a reason for withdrawal..."
              required
            ></textarea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showWithdrawDialog = false">Cancel</Button>
          <Button @click="withdrawApplication" variant="destructive" :disabled="!withdrawalReason">Withdraw</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reject Document Dialog -->
    <Dialog v-model:open="showRejectDocumentDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Document</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="doc_rejection_reason">Rejection Reason *</Label>
            <textarea
              id="doc_rejection_reason"
              v-model="docRejectionReason"
              class="flex min-h-[100px] w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
              placeholder="e.g., Image is too blurry, please upload a clearer copy"
              required
            ></textarea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showRejectDocumentDialog = false">Cancel</Button>
          <Button @click="rejectDocumentConfirm" variant="destructive" :disabled="!docRejectionReason">Reject Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAdmissionAdmin } from '~~/composables/useAdmissionAdmin'
import type { AdmissionApplication, AdmissionDocument, ApplicationStatus } from '~~/types/admission'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
})

const { success, error: showError } = useToast()

const route = useRoute()
const { adminAPI } = useAdmissionAdmin()

const id = computed(() => parseInt(route.params.id as string))

const loading = ref(true)
const application = ref<AdmissionApplication | null>(null)
const documents = ref<AdmissionDocument[]>([])
const adminNotes = ref('')
const isSavingNotes = ref(false)

// Dialog states
const showStartReviewDialog = ref(false)
const showRequestDocsDialog = ref(false)
const showScheduleExamDialog = ref(false)
const showScheduleInterviewDialog = ref(false)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const showWithdrawDialog = ref(false)
const showRejectDocumentDialog = ref(false)

// Form data
const requestDocsNotes = ref('')
const examForm = ref({ exam_date: '', exam_time: '', exam_venue: '' })
const interviewForm = ref({ interview_date: '', interview_time: '', interview_venue: '' })
const approvalNotes = ref('')
const rejectionReason = ref('')
const withdrawalReason = ref('')
const docRejectionReason = ref('')
const selectedDocId = ref<number | null>(null)

// Computed properties for workflow actions
const canRequestDocuments = computed(() => {
  return ['SUBMITTED', 'UNDER_REVIEW'].includes(application.value?.status || '')
})

const canScheduleExam = computed(() => {
  return ['UNDER_REVIEW', 'EXAM_COMPLETED'].includes(application.value?.status || '')
})

const canScheduleInterview = computed(() => {
  return ['EXAM_COMPLETED', 'UNDER_REVIEW'].includes(application.value?.status || '')
})

const canApprove = computed(() => {
  return ['UNDER_REVIEW', 'EXAM_COMPLETED', 'INTERVIEW_SCHEDULED'].includes(application.value?.status || '')
})

const canReject = computed(() => {
  return !['ENROLLED', 'REJECTED', 'WITHDRAWN'].includes(application.value?.status || '')
})

const loadApplication = async () => {
  loading.value = true
  try {
    application.value = await adminAPI.getApplication(id.value)
    documents.value = await adminAPI.listDocuments(id.value)
    adminNotes.value = application.value.admin_notes || ''
  } catch (error) {
    console.error('Error loading application:', error)
    showError('Failed to load application')
  } finally {
    loading.value = false
  }
}

const saveAdminNotes = async () => {
  isSavingNotes.value = true
  try {
    await adminAPI.updateApplication(id.value, { admin_notes: adminNotes.value })
    success('Notes saved successfully')
  } catch (error) {
    showError('Failed to save notes')
  } finally {
    isSavingNotes.value = false
  }
}

const startReview = async () => {
  try {
    await adminAPI.startReview(id.value)
    success('Review started')
    showStartReviewDialog.value = false
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to start review')
  }
}

const requestDocuments = async () => {
  try {
    await adminAPI.requestDocuments(id.value, requestDocsNotes.value)
    success('Document request sent')
    showRequestDocsDialog.value = false
    requestDocsNotes.value = ''
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to request documents')
  }
}

const scheduleExam = async () => {
  try {
    await adminAPI.scheduleExam(id.value, examForm.value)
    success('Exam scheduled successfully')
    showScheduleExamDialog.value = false
    examForm.value = { exam_date: '', exam_time: '', exam_venue: '' }
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to schedule exam')
  }
}

const markExamCompleted = async () => {
  try {
    await adminAPI.markExamCompleted(id.value)
    success('Exam marked as completed')
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to mark exam as completed')
  }
}

const scheduleInterview = async () => {
  try {
    await adminAPI.scheduleInterview(id.value, interviewForm.value)
    success('Interview scheduled successfully')
    showScheduleInterviewDialog.value = false
    interviewForm.value = { interview_date: '', interview_time: '', interview_venue: '' }
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to schedule interview')
  }
}

const approveApplication = async () => {
  try {
    await adminAPI.approveApplication(id.value, approvalNotes.value)
    success('Application approved')
    showApproveDialog.value = false
    approvalNotes.value = ''
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to approve application')
  }
}

const rejectApplication = async () => {
  try {
    await adminAPI.rejectApplication(id.value, rejectionReason.value)
    success('Application rejected')
    showRejectDialog.value = false
    rejectionReason.value = ''
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to reject application')
  }
}

const withdrawApplication = async () => {
  try {
    await adminAPI.withdrawApplication(id.value, withdrawalReason.value)
    success('Application withdrawn')
    showWithdrawDialog.value = false
    withdrawalReason.value = ''
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to withdraw application')
  }
}

const enrollStudent = async () => {
  if (!confirm('Are you sure you want to enroll this student? This will create a student account.')) return

  try {
    const result = await adminAPI.enrollStudent(id.value)
    success(`Student enrolled successfully! Username: ${result.username}`)
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to enroll student')
  }
}

const verifyDocument = async (documentId: number) => {
  try {
    await adminAPI.verifyDocument(documentId, 'Document verified')
    success('Document verified')
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to verify document')
  }
}

const showRejectDocDialog = (doc: AdmissionDocument) => {
  selectedDocId.value = doc.id
  showRejectDocumentDialog.value = true
}

const rejectDocumentConfirm = async () => {
  if (!selectedDocId.value) return

  try {
    await adminAPI.rejectDocument(selectedDocId.value, docRejectionReason.value)
    success('Document rejected')
    showRejectDocumentDialog.value = false
    docRejectionReason.value = ''
    selectedDocId.value = null
    await loadApplication()
  } catch (error: any) {
    showError(error.data?.detail || 'Failed to reject document')
  }
}

const getStatusColor = (status: ApplicationStatus) => {
  const colors: Record<ApplicationStatus, string> = {
    DRAFT: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
    SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    UNDER_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    DOCUMENTS_PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    EXAM_SCHEDULED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    EXAM_COMPLETED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    INTERVIEW_SCHEDULED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    ACCEPTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    ENROLLED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    WITHDRAWN: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
  }
  return colors[status] || 'bg-neutral-100 text-neutral-700'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  loadApplication()
})
</script>
