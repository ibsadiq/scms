<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Header -->
    <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 py-6">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img v-if="schoolLogo()" :src="schoolLogo()" :alt="schoolName" class="h-16 w-16 object-contain" />
            <div>
              <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ schoolName }}</h1>
              <p class="text-neutral-600 dark:text-neutral-400">Admission Application Form</p>
            </div>
          </div>
          <Button variant="ghost" @click="navigateTo('/apply')">
            <Icon name="lucide:x" class="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
          <div class="flex items-center justify-center">
            <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
            <span class="ml-2 text-neutral-600 dark:text-neutral-400">Loading form...</span>
          </div>
        </div>

        <!-- Form -->
        <div v-else class="space-y-6">
          <!-- Progress Steps -->
          <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-2">
              <div
                v-for="(step, index) in steps"
                :key="step.id"
                class="flex items-center"
                :class="{ 'flex-1': index < steps.length - 1 }"
              >
                <div class="flex flex-col items-center">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors"
                    :class="
                      currentStep === step.id
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : currentStep > step.id
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-neutral-300 bg-white dark:bg-neutral-800 text-neutral-400'
                    "
                  >
                    <Icon v-if="currentStep > step.id" name="lucide:check" class="w-5 h-5" />
                    <span v-else class="text-sm font-semibold">{{ step.id }}</span>
                  </div>
                  <span class="text-xs mt-2 text-center hidden sm:block" :class="currentStep === step.id ? 'text-primary-600 font-semibold' : 'text-neutral-500'">
                    {{ step.name }}
                  </span>
                </div>
                <div v-if="index < steps.length - 1" class="flex-1 h-0.5 mx-4" :class="currentStep > step.id ? 'bg-green-600' : 'bg-neutral-200 dark:bg-neutral-700'"></div>
              </div>
            </div>
          </div>

          <!-- Form Content -->
          <form @submit.prevent="handleSubmit" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <!-- Step 1: Class Selection -->
            <div v-if="currentStep === 1" class="space-y-6">
              <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Select Class</h2>

              <div class="space-y-2">
                <Label for="applying_for_class">Applying for Class *</Label>
                <select
                  id="applying_for_class"
                  v-model="form.applying_for_class"
                  class="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a class</option>
                  <option v-for="fee in feeStructures" :key="fee.id" :value="fee.class_room" :disabled="!fee.has_capacity">
                    {{ fee.class_room_name }} {{ !fee.has_capacity ? '(Full)' : '' }}
                  </option>
                </select>
              </div>

              <!-- Fee Information -->
              <div v-if="selectedFeeStructure" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Fee Information</h3>
                <div class="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <p><strong>Application Fee:</strong> {{ formatCurrency(selectedFeeStructure.application_fee) }}</p>
                  <p v-if="selectedFeeStructure.entrance_exam_required">
                    <strong>Entrance Exam Fee:</strong> {{ formatCurrency(selectedFeeStructure.entrance_exam_fee || 0) }}
                  </p>
                  <p v-if="selectedFeeStructure.acceptance_fee_required && activeSession?.require_acceptance_fee">
                    <strong>Acceptance Fee:</strong> {{ formatCurrency(selectedFeeStructure.acceptance_fee) }}
                    <span v-if="activeSession?.acceptance_fee_deadline_days" class="ml-2 text-xs text-neutral-600 dark:text-neutral-400">
                      (Deadline: pay within {{ activeSession.acceptance_fee_deadline_days }} days after offer)
                    </span>
                  </p>
                  <p v-if="selectedFeeStructure.minimum_age || selectedFeeStructure.maximum_age" class="mt-2">
                    <strong>Age Requirement:</strong> {{ selectedFeeStructure.minimum_age }}-{{ selectedFeeStructure.maximum_age }} years
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 2: Student Information -->
            <div v-if="currentStep === 2" class="space-y-6">
              <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Student Information</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="first_name">First Name *</Label>
                  <Input id="first_name" v-model="form.first_name" required />
                </div>

                <div class="space-y-2">
                  <Label for="middle_name">Middle Name</Label>
                  <Input id="middle_name" v-model="form.middle_name" />
                </div>

                <div class="space-y-2">
                  <Label for="last_name">Last Name *</Label>
                  <Input id="last_name" v-model="form.last_name" required />
                </div>

                <div class="space-y-2">
                  <Label for="gender">Gender *</Label>
                  <select id="gender" v-model="form.gender" class="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm" required>
                    <option value="">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <Label for="date_of_birth">Date of Birth *</Label>
                  <Input id="date_of_birth" v-model="form.date_of_birth" type="date" required />
                </div>

                <div class="space-y-2">
                  <Label for="blood_group">Blood Group</Label>
                  <Input id="blood_group" v-model="form.blood_group" placeholder="e.g., O+" />
                </div>

                <div class="space-y-2">
                  <Label for="state_of_origin">State of Origin</Label>
                  <Input id="state_of_origin" v-model="form.state_of_origin" />
                </div>

                <div class="space-y-2">
                  <Label for="lga">LGA</Label>
                  <Input id="lga" v-model="form.lga" placeholder="Local Government Area" />
                </div>

                <div class="space-y-2">
                  <Label for="religion">Religion</Label>
                  <Input id="religion" v-model="form.religion" />
                </div>

                <div class="space-y-2 md:col-span-2">
                  <Label for="address">Address</Label>
                  <Input id="address" v-model="form.address" />
                </div>

                <div class="space-y-2">
                  <Label for="city">City</Label>
                  <Input id="city" v-model="form.city" />
                </div>
              </div>
            </div>

            <!-- Step 3: Parent/Guardian Information -->
            <div v-if="currentStep === 3" class="space-y-6">
              <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Parent/Guardian Information</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="parent_first_name">Parent First Name *</Label>
                  <Input id="parent_first_name" v-model="form.parent_first_name" required />
                </div>

                <div class="space-y-2">
                  <Label for="parent_last_name">Parent Last Name *</Label>
                  <Input id="parent_last_name" v-model="form.parent_last_name" required />
                </div>

                <div class="space-y-2">
                  <Label for="parent_email">Parent Email *</Label>
                  <Input id="parent_email" v-model="form.parent_email" type="email" required />
                </div>

                <div class="space-y-2">
                  <Label for="parent_phone">Parent Phone *</Label>
                  <Input id="parent_phone" v-model="form.parent_phone" type="tel" placeholder="08012345678" required />
                </div>

                <div class="space-y-2">
                  <Label for="parent_occupation">Occupation</Label>
                  <Input id="parent_occupation" v-model="form.parent_occupation" />
                </div>

                <div class="space-y-2">
                  <Label for="parent_relationship">Relationship</Label>
                  <Input id="parent_relationship" v-model="form.parent_relationship" placeholder="e.g., Mother, Father" />
                </div>
              </div>

              <div class="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Alternative Contact (Optional)</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label for="alt_contact_name">Name</Label>
                    <Input id="alt_contact_name" v-model="form.alt_contact_name" />
                  </div>

                  <div class="space-y-2">
                    <Label for="alt_contact_phone">Phone</Label>
                    <Input id="alt_contact_phone" v-model="form.alt_contact_phone" type="tel" />
                  </div>

                  <div class="space-y-2">
                    <Label for="alt_contact_relationship">Relationship</Label>
                    <Input id="alt_contact_relationship" v-model="form.alt_contact_relationship" placeholder="e.g., Uncle, Aunt" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Additional Information -->
            <div v-if="currentStep === 4" class="space-y-6">
              <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Additional Information</h2>

              <div class="space-y-4">
                <div class="space-y-2">
                  <Label for="previous_school">Previous School</Label>
                  <Input id="previous_school" v-model="form.previous_school" />
                </div>

                <div class="space-y-2">
                  <Label for="previous_class">Previous Class/Grade</Label>
                  <Input id="previous_class" v-model="form.previous_class" />
                </div>

                <div class="space-y-2">
                  <Label for="medical_conditions">Medical Conditions</Label>
                  <textarea
                    id="medical_conditions"
                    v-model="form.medical_conditions"
                    class="flex min-h-[80px] w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                    placeholder="Please list any medical conditions we should be aware of"
                  ></textarea>
                </div>

                <div class="space-y-2">
                  <Label for="special_needs">Special Needs</Label>
                  <textarea
                    id="special_needs"
                    v-model="form.special_needs"
                    class="flex min-h-[80px] w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                    placeholder="Please describe any special needs or accommodations required"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p class="text-sm text-red-700 dark:text-red-300">{{ errorMessage }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button type="button" variant="outline" @click="previousStep" :disabled="currentStep === 1 || isSubmitting">
                <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button v-if="currentStep < steps.length" type="button" @click="nextStep">
                Next
                <Icon name="lucide:arrow-right" class="w-4 h-4 ml-2" />
              </Button>

              <Button v-else type="submit" :disabled="isSubmitting">
                <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                <Icon v-else name="lucide:check" class="w-4 h-4 mr-2" />
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBrand } from '~~/composables/useBrand'
import { useAdmission } from '~~/composables/useAdmission'
import { toast } from 'vue-sonner'
import type { AdmissionSession, AdmissionFeeStructure, CreateApplicationRequest, Gender } from '~~/types/admission'

definePageMeta({
  layout: false,
})

const { schoolLogo, school, product } = useBrand()
const { publicAPI } = useAdmission()

const schoolName = computed(() => school() || product())

const steps = [
  { id: 1, name: 'Class' },
  { id: 2, name: 'Student' },
  { id: 3, name: 'Parent' },
  { id: 4, name: 'Additional' },
]

const currentStep = ref(1)
const loading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const activeSession = ref<AdmissionSession | null>(null)
const feeStructures = ref<AdmissionFeeStructure[]>([])

const form = ref<CreateApplicationRequest>({
  admission_session: 0,
  applying_for_class: 0,
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: '' as Gender,
  date_of_birth: '',
  state_of_origin: '',
  lga: '',
  religion: '',
  blood_group: '',
  address: '',
  city: '',
  parent_first_name: '',
  parent_last_name: '',
  parent_email: '',
  parent_phone: '',
  parent_occupation: '',
  parent_relationship: '',
  alt_contact_name: '',
  alt_contact_phone: '',
  alt_contact_relationship: '',
  previous_school: '',
  previous_class: '',
  medical_conditions: '',
  special_needs: '',
})

const selectedFeeStructure = computed(() => {
  return feeStructures.value.find(f => f.class_room === form.value.applying_for_class)
})

const loadData = async () => {
  loading.value = true
  errorMessage.value = null

  try {
    activeSession.value = await publicAPI.getActiveSession()

    if (activeSession.value) {
      form.value.admission_session = activeSession.value.id
      feeStructures.value = await publicAPI.getFeeStructures(activeSession.value.id)
    }
  } catch (err: any) {
    console.error('Error loading form data:', err)
    errorMessage.value = err.data?.detail || 'Failed to load form data'
  } finally {
    loading.value = false
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null

  try {
    const result = await publicAPI.createApplication(form.value)

    // Save tracking token
    localStorage.setItem('admission_tracking_token', result.tracking_token || '')

    toast.success('Application submitted successfully!')

    // Redirect to view application
    navigateTo(`/apply/view/${result.tracking_token}`)
  } catch (err: any) {
    console.error('Error submitting application:', err)
    errorMessage.value = err.data?.detail || err.data?.error || 'Failed to submit application'

    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

onMounted(() => {
  loadData()
})
</script>
