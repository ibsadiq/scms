<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Fee Structures</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-1">Configure admission fees for each class</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Add Fee Structure
      </Button>
    </div>

    <!-- Session Filter -->
    <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
      <div class="max-w-sm">
        <Label for="session">Filter by Session</Label>
        <select
          id="session"
          v-model="selectedSession"
          @change="loadFeeStructures"
          class="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        >
          <option value="">All Sessions</option>
          <option v-for="session in sessions" :key="session.id" :value="session.id">{{ session.name }}</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
      <div class="flex items-center justify-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
        <span class="ml-2 text-neutral-600 dark:text-neutral-400">Loading fee structures...</span>
      </div>
    </div>

    <!-- Fee Structures List -->
    <div v-else-if="feeStructures.length > 0" class="space-y-4">
      <div
        v-for="fee in feeStructures"
        :key="fee.id"
        class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6"
      >
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ fee.class_room_name }}</h3>

            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Application Fee -->
              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p class="text-xs text-blue-800 dark:text-blue-200 mb-1">Application Fee</p>
                <p class="text-lg font-bold text-blue-900 dark:text-blue-100">{{ formatCurrency(fee.application_fee) }}</p>
                <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {{ fee.application_fee_required ? 'Required' : 'Optional' }}
                </p>
              </div>

              <!-- Exam Fee -->
              <div v-if="fee.entrance_exam_required" class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p class="text-xs text-purple-800 dark:text-purple-200 mb-1">Entrance Exam Fee</p>
                <p class="text-lg font-bold text-purple-900 dark:text-purple-100">{{ formatCurrency(fee.entrance_exam_fee || 0) }}</p>
                <p class="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  Pass Score: {{ fee.entrance_exam_pass_score }}%
                </p>
              </div>

              <!-- Acceptance Fee -->
              <div v-if="fee.acceptance_fee_required" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p class="text-xs text-green-800 dark:text-green-200 mb-1">Acceptance Fee</p>
                <p class="text-lg font-bold text-green-900 dark:text-green-100">{{ formatCurrency(fee.acceptance_fee) }}</p>
                <p class="text-xs text-green-700 dark:text-green-300 mt-1">
                  {{ fee.acceptance_fee_is_part_of_tuition ? 'Part of tuition' : 'Separate fee' }}
                </p>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="mt-4 flex flex-wrap gap-4 text-sm">
              <div v-if="fee.minimum_age || fee.maximum_age">
                <span class="text-neutral-600 dark:text-neutral-400">Age Requirement:</span>
                <span class="ml-1 font-medium text-neutral-900 dark:text-neutral-100">
                  {{ fee.minimum_age }}-{{ fee.maximum_age }} years
                </span>
              </div>
              <div v-if="fee.max_applications">
                <span class="text-neutral-600 dark:text-neutral-400">Max Applications:</span>
                <span class="ml-1 font-medium text-neutral-900 dark:text-neutral-100">{{ fee.max_applications }}</span>
              </div>
              <div>
                <span class="text-neutral-600 dark:text-neutral-400">Interview:</span>
                <span class="ml-1 font-medium text-neutral-900 dark:text-neutral-100">
                  {{ fee.interview_required ? 'Required' : 'Not Required' }}
                </span>
              </div>
              <div>
                <span class="text-neutral-600 dark:text-neutral-400">Capacity:</span>
                <span
                  class="ml-1 font-medium"
                  :class="fee.has_capacity ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ fee.has_capacity ? 'Available' : 'Full' }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <Button @click="editFeeStructure(fee)" size="sm" variant="outline">
              <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-12 text-center">
      <Icon name="lucide:banknote" class="w-16 h-16 text-neutral-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Fee Structures</h3>
      <p class="text-neutral-600 dark:text-neutral-400 mb-4">
        Create fee structures to define admission costs for each class
      </p>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Add Fee Structure
      </Button>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editingFee ? 'Edit Fee Structure' : 'Add Fee Structure' }}</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="saveFeeStructure" class="space-y-6">
          <!-- Basic Info -->
          <div class="space-y-4">
            <h4 class="font-semibold text-neutral-900 dark:text-neutral-100">Basic Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="admission_session">Admission Session *</Label>
                <select
                  id="admission_session"
                  v-model="feeForm.admission_session"
                  class="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select session</option>
                  <option v-for="session in sessions" :key="session.id" :value="session.id">{{ session.name }}</option>
                </select>
              </div>

              <div>
                <Label for="class_room">Class *</Label>
                <Input
                  id="class_room"
                  v-model.number="feeForm.class_room"
                  type="number"
                  placeholder="Class ID"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Fees -->
          <div class="space-y-4">
            <h4 class="font-semibold text-neutral-900 dark:text-neutral-100">Fees</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="application_fee">Application Fee *</Label>
                <Input
                  id="application_fee"
                  v-model.number="feeForm.application_fee"
                  type="number"
                  placeholder="5000"
                  required
                />
              </div>

              <div class="flex items-center gap-2 pt-8">
                <input
                  id="app_fee_required"
                  v-model="feeForm.application_fee_required"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300"
                />
                <Label for="app_fee_required" class="!mb-0">Required</Label>
              </div>

              <div>
                <Label for="entrance_exam_fee">Entrance Exam Fee</Label>
                <Input
                  id="entrance_exam_fee"
                  v-model.number="feeForm.entrance_exam_fee"
                  type="number"
                  placeholder="2000"
                />
              </div>

              <div>
                <Label for="entrance_exam_pass_score">Pass Score (%)</Label>
                <Input
                  id="entrance_exam_pass_score"
                  v-model.number="feeForm.entrance_exam_pass_score"
                  type="number"
                  placeholder="60"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <Label for="acceptance_fee">Acceptance Fee</Label>
                <Input
                  id="acceptance_fee"
                  v-model.number="feeForm.acceptance_fee"
                  type="number"
                  placeholder="10000"
                />
              </div>

              <div class="space-y-2 pt-6">
                <div class="flex items-center gap-2">
                  <input
                    id="acceptance_fee_required"
                    v-model="feeForm.acceptance_fee_required"
                    type="checkbox"
                    class="w-4 h-4 rounded border-neutral-300"
                  />
                  <Label for="acceptance_fee_required" class="!mb-0">Required</Label>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    id="part_of_tuition"
                    v-model="feeForm.acceptance_fee_is_part_of_tuition"
                    type="checkbox"
                    class="w-4 h-4 rounded border-neutral-300"
                  />
                  <Label for="part_of_tuition" class="!mb-0">Part of Tuition</Label>
                </div>
              </div>
            </div>
          </div>

          <!-- Requirements -->
          <div class="space-y-4">
            <h4 class="font-semibold text-neutral-900 dark:text-neutral-100">Requirements</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <input
                  id="entrance_exam_required"
                  v-model="feeForm.entrance_exam_required"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300"
                />
                <Label for="entrance_exam_required" class="!mb-0">Entrance Exam Required</Label>
              </div>

              <div class="flex items-center gap-2">
                <input
                  id="interview_required"
                  v-model="feeForm.interview_required"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300"
                />
                <Label for="interview_required" class="!mb-0">Interview Required</Label>
              </div>

              <div>
                <Label for="minimum_age">Minimum Age</Label>
                <Input
                  id="minimum_age"
                  v-model.number="feeForm.minimum_age"
                  type="number"
                  placeholder="5"
                  min="0"
                />
              </div>

              <div>
                <Label for="maximum_age">Maximum Age</Label>
                <Input
                  id="maximum_age"
                  v-model.number="feeForm.maximum_age"
                  type="number"
                  placeholder="7"
                  min="0"
                />
              </div>

              <div>
                <Label for="max_applications">Max Applications</Label>
                <Input
                  id="max_applications"
                  v-model.number="feeForm.max_applications"
                  type="number"
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
            <Button type="submit" :disabled="isSaving">
              <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ editingFee ? 'Update' : 'Create' }}
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
import { useAdmissionAdmin } from '~~/composables/useAdmissionAdmin'
import { toast } from 'vue-sonner'
import type { AdmissionFeeStructure, AdmissionSession } from '~~/types/admission'

definePageMeta({
  layout: 'admin',
})

const { adminAPI } = useAdmissionAdmin()

const loading = ref(true)
const isSaving = ref(false)
const feeStructures = ref<AdmissionFeeStructure[]>([])
const sessions = ref<AdmissionSession[]>([])
const selectedSession = ref<number | string>('')
const showCreateDialog = ref(false)
const editingFee = ref<AdmissionFeeStructure | null>(null)

const feeForm = ref({
  admission_session: 0,
  class_room: 0,
  application_fee: 0,
  application_fee_required: true,
  entrance_exam_required: false,
  entrance_exam_fee: 0,
  entrance_exam_pass_score: 60,
  interview_required: false,
  acceptance_fee: 0,
  acceptance_fee_required: false,
  acceptance_fee_is_part_of_tuition: false,
  minimum_age: 0,
  maximum_age: 0,
  max_applications: 0,
})

const loadFeeStructures = async () => {
  loading.value = true
  try {
    const sessionId = selectedSession.value ? Number(selectedSession.value) : undefined
    feeStructures.value = await adminAPI.listFeeStructures(sessionId)
  } catch (error) {
    console.error('Error loading fee structures:', error)
    toast.error('Failed to load fee structures')
  } finally {
    loading.value = false
  }
}

const loadSessions = async () => {
  try {
    sessions.value = await adminAPI.listSessions()
  } catch (error) {
    console.error('Error loading sessions:', error)
  }
}

const editFeeStructure = (fee: AdmissionFeeStructure) => {
  editingFee.value = fee
  feeForm.value = {
    admission_session: fee.admission_session,
    class_room: fee.class_room,
    application_fee: fee.application_fee,
    application_fee_required: fee.application_fee_required,
    entrance_exam_required: fee.entrance_exam_required,
    entrance_exam_fee: fee.entrance_exam_fee || 0,
    entrance_exam_pass_score: fee.entrance_exam_pass_score || 60,
    interview_required: fee.interview_required,
    acceptance_fee: fee.acceptance_fee,
    acceptance_fee_required: fee.acceptance_fee_required,
    acceptance_fee_is_part_of_tuition: fee.acceptance_fee_is_part_of_tuition,
    minimum_age: fee.minimum_age || 0,
    maximum_age: fee.maximum_age || 0,
    max_applications: fee.max_applications || 0,
  }
  showCreateDialog.value = true
}

const saveFeeStructure = async () => {
  isSaving.value = true
  try {
    if (editingFee.value) {
      await adminAPI.updateFeeStructure(editingFee.value.id, feeForm.value)
      toast.success('Fee structure updated successfully')
    } else {
      await adminAPI.createFeeStructure(feeForm.value)
      toast.success('Fee structure created successfully')
    }
    closeDialog()
    await loadFeeStructures()
  } catch (error: any) {
    console.error('Error saving fee structure:', error)
    toast.error(error.data?.detail || 'Failed to save fee structure')
  } finally {
    isSaving.value = false
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingFee.value = null
  feeForm.value = {
    admission_session: 0,
    class_room: 0,
    application_fee: 0,
    application_fee_required: true,
    entrance_exam_required: false,
    entrance_exam_fee: 0,
    entrance_exam_pass_score: 60,
    interview_required: false,
    acceptance_fee: 0,
    acceptance_fee_required: false,
    acceptance_fee_is_part_of_tuition: false,
    minimum_age: 0,
    maximum_age: 0,
    max_applications: 0,
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

onMounted(async () => {
  await loadSessions()
  await loadFeeStructures()
})
</script>
