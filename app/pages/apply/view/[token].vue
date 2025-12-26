<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Header -->
    <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 py-6">
      <div class="container mx-auto px-4">
        <div class="flex items-center gap-4">
          <img v-if="schoolLogo()" :src="schoolLogo()" :alt="schoolName" class="h-16 w-16 object-contain" />
          <div>
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ schoolName }}</h1>
            <p class="text-neutral-600 dark:text-neutral-400">Application Status</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-5xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
          <div class="flex items-center justify-center">
            <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
            <span class="ml-2 text-neutral-600 dark:text-neutral-400">Loading application...</span>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div class="flex items-start gap-3">
            <Icon name="lucide:alert-circle" class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-semibold text-red-900 dark:text-red-100">Unable to Load Application</h3>
              <p class="text-red-700 dark:text-red-300 mt-1">{{ error }}</p>
              <Button @click="navigateTo('/apply/track')" variant="outline" class="mt-4">
                Track Application
              </Button>
            </div>
          </div>
        </div>

        <!-- Application Details -->
        <div v-else-if="application" class="space-y-6">
          <!-- Status Card -->
          <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ application.full_name }}</h2>
                <p class="text-neutral-600 dark:text-neutral-400 mt-1">Application #{{ application.application_number }}</p>
              </div>
              <div>
                <span
                  class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                  :class="getStatusColor(application.status)"
                >
                  {{ application.status_display }}
                </span>
              </div>
            </div>

            <!-- Next Steps -->
            <div v-if="nextSteps" class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div class="flex items-start gap-3">
                <Icon name="lucide:info" class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-1">Next Steps</h3>
                  <p class="text-sm text-blue-800 dark:text-blue-200">{{ nextSteps.next_steps }}</p>
                  <ul v-if="nextSteps.actions_required.length > 0" class="mt-2 space-y-1">
                    <li v-for="action in nextSteps.actions_required" :key="action" class="text-sm text-blue-800 dark:text-blue-200">
                      • {{ action }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Quick Actions</h3>
            <div class="flex flex-wrap gap-3">
              <Button v-if="application.status === 'DRAFT'" @click="navigateTo(`/apply/edit/${token}`)" variant="default">
                <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
                Edit Application
              </Button>
              <Button v-if="nextSteps?.can_submit" @click="submitApplication" :disabled="isSubmitting">
                <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                <Icon v-else name="lucide:send" class="w-4 h-4 mr-2" />
                Submit Application
              </Button>
              <Button v-if="nextSteps?.can_accept_offer" @click="acceptOffer" :disabled="isAccepting">
                <Icon v-if="isAccepting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                <Icon v-else name="lucide:check-circle" class="w-4 h-4 mr-2" />
                Accept Offer
              </Button>
              <Button @click="showUploadDialog = true" variant="outline">
                <Icon name="lucide:upload" class="w-4 h-4 mr-2" />
                Upload Document
              </Button>
              <Button @click="loadApplication" variant="outline">
                <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <!-- Payment Information -->
          <div v-if="paymentInfo" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Payment Information</h3>
            <div class="space-y-3">
              <div v-if="paymentInfo.application_fee.required" class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                <div>
                  <p class="font-medium text-neutral-900 dark:text-neutral-100">Application Fee</p>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ formatCurrency(paymentInfo.application_fee.amount) }}</p>
                </div>
                <span v-if="paymentInfo.application_fee.paid" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Icon name="lucide:check" class="w-3 h-3 mr-1" />
                  Paid
                </span>
                <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Pending
                </span>
              </div>

              <div v-if="paymentInfo.exam_fee.required" class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                <div>
                  <p class="font-medium text-neutral-900 dark:text-neutral-100">Entrance Exam Fee</p>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ formatCurrency(paymentInfo.exam_fee.amount) }}</p>
                </div>
                <span v-if="paymentInfo.exam_fee.paid" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Icon name="lucide:check" class="w-3 h-3 mr-1" />
                  Paid
                </span>
                <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Pending
                </span>
              </div>

              <div v-if="paymentInfo.acceptance_fee.required" class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                <div>
                  <p class="font-medium text-neutral-900 dark:text-neutral-100">Acceptance Fee</p>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">
                    {{ formatCurrency(paymentInfo.acceptance_fee.amount) }}
                    <span v-if="paymentInfo.acceptance_fee.is_part_of_tuition" class="text-xs">(Part of tuition)</span>
                  </p>
                </div>
                <span v-if="paymentInfo.acceptance_fee.paid" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Icon name="lucide:check" class="w-3 h-3 mr-1" />
                  Paid
                </span>
                <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Pending
                </span>
              </div>

              <div v-if="paymentInfo.total_unpaid > 0" class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p class="font-semibold text-red-900 dark:text-red-100">Total Outstanding</p>
                <p class="text-lg font-bold text-red-900 dark:text-red-100">{{ formatCurrency(paymentInfo.total_unpaid) }}</p>
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
                <div class="flex items-center gap-3">
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
                  <Button v-if="!doc.verified" size="sm" variant="ghost" @click="deleteDocument(doc.id)">
                    <Icon name="lucide:trash" class="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Application Details -->
          <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Application Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Applying for Class</p>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ application.applying_for_class_name }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Date of Birth</p>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ formatDate(application.date_of_birth) }} ({{ application.age }} years)</p>
              </div>
              <div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Gender</p>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ application.gender === 'M' ? 'Male' : 'Female' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Parent Contact</p>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ application.parent_email }}</p>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ application.parent_phone }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Submitted</p>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ application.submitted_at ? formatDateTime(application.submitted_at) : 'Not yet submitted' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Document Dialog -->
    <Dialog v-model:open="showUploadDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="uploadDocument" class="space-y-4">
          <div class="space-y-2">
            <Label for="document_type">Document Type *</Label>
            <select
              id="document_type"
              v-model="uploadForm.document_type"
              class="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
              required
            >
              <option value="">Select document type</option>
              <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
              <option value="PASSPORT_PHOTO">Passport Photo</option>
              <option value="PREVIOUS_REPORT">Previous Report Card</option>
              <option value="IMMUNIZATION_RECORD">Immunization Record</option>
              <option value="PARENT_ID">Parent ID</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="file">File *</Label>
            <Input id="file" type="file" @change="handleFileChange" required accept=".pdf,.jpg,.jpeg,.png" />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Max file size: 5MB. Supported formats: PDF, JPG, PNG</p>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Input id="description" v-model="uploadForm.description" placeholder="Optional description" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showUploadDialog = false">Cancel</Button>
            <Button type="submit" :disabled="isUploading">
              <Icon v-if="isUploading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBrand } from '~~/composables/useBrand'
import { useAdmission } from '~~/composables/useAdmission'
import { toast } from 'vue-sonner'
import type { AdmissionApplication, AdmissionDocument, PaymentInfo, NextStepsInfo, DocumentType, ApplicationStatus } from '~~/types/admission'

definePageMeta({
  layout: false,
})

const route = useRoute()
const { schoolLogo, school, product } = useBrand()
const { publicAPI } = useAdmission()

const schoolName = computed(() => school() || product())
const token = computed(() => route.params.token as string)

const loading = ref(true)
const error = ref<string | null>(null)
const application = ref<AdmissionApplication | null>(null)
const paymentInfo = ref<PaymentInfo | null>(null)
const nextSteps = ref<NextStepsInfo | null>(null)
const documents = ref<AdmissionDocument[]>([])

const isSubmitting = ref(false)
const isAccepting = ref(false)
const showUploadDialog = ref(false)
const isUploading = ref(false)

const uploadForm = ref({
  document_type: '' as DocumentType | '',
  file: null as File | null,
  description: '',
})

const loadApplication = async () => {
  loading.value = true
  error.value = null

  try {
    application.value = await publicAPI.getApplication(token.value)
    paymentInfo.value = await publicAPI.getPaymentInfo(token.value)
    nextSteps.value = await publicAPI.getNextSteps(token.value)
    documents.value = await publicAPI.listDocuments(token.value)
  } catch (err: any) {
    console.error('Error loading application:', err)
    error.value = err.data?.detail || 'Failed to load application'
  } finally {
    loading.value = false
  }
}

const submitApplication = async () => {
  isSubmitting.value = true
  try {
    await publicAPI.submitApplication(token.value)
    toast.success('Application submitted successfully!')
    await loadApplication()
  } catch (err: any) {
    toast.error(err.data?.detail || 'Failed to submit application')
  } finally {
    isSubmitting.value = false
  }
}

const acceptOffer = async () => {
  isAccepting.value = true
  try {
    await publicAPI.acceptOffer(token.value)
    toast.success('Offer accepted successfully!')
    await loadApplication()
  } catch (err: any) {
    toast.error(err.data?.detail || 'Failed to accept offer')
  } finally {
    isAccepting.value = false
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadForm.value.file = target.files[0]
  }
}

const uploadDocument = async () => {
  if (!uploadForm.value.file || !uploadForm.value.document_type) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('document_type', uploadForm.value.document_type)
    formData.append('file', uploadForm.value.file)
    if (uploadForm.value.description) {
      formData.append('description', uploadForm.value.description)
    }

    await publicAPI.uploadDocument(token.value, formData)
    toast.success('Document uploaded successfully!')
    showUploadDialog.value = false
    uploadForm.value = { document_type: '', file: null, description: '' }
    await loadApplication()
  } catch (err: any) {
    toast.error(err.data?.detail || 'Failed to upload document')
  } finally {
    isUploading.value = false
  }
}

const deleteDocument = async (documentId: number) => {
  if (!confirm('Are you sure you want to delete this document?')) return

  try {
    await publicAPI.deleteDocument(documentId)
    toast.success('Document deleted successfully!')
    await loadApplication()
  } catch (err: any) {
    toast.error(err.data?.detail || 'Failed to delete document')
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

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

onMounted(() => {
  loadApplication()
})
</script>
