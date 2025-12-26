<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Header -->
    <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 py-6">
      <div class="container mx-auto px-4">
        <div class="flex items-center gap-4">
          <img v-if="schoolLogo()" :src="schoolLogo()" :alt="schoolName" class="h-16 w-16 object-contain" />
          <div>
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ schoolName }}</h1>
            <p class="text-neutral-600 dark:text-neutral-400">Admission Application Portal</p>
          </div>
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
            <span class="ml-2 text-neutral-600 dark:text-neutral-400">Loading admission information...</span>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div class="flex items-start gap-3">
            <Icon name="lucide:alert-circle" class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-semibold text-red-900 dark:text-red-100">Unable to Load Admission Information</h3>
              <p class="text-red-700 dark:text-red-300 mt-1">{{ error }}</p>
              <Button @click="loadData" variant="outline" class="mt-4">
                <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>

        <!-- No Active Session -->
        <div v-else-if="!activeSession" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8 text-center">
          <Icon name="lucide:info" class="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Admissions Not Currently Open</h2>
          <p class="text-neutral-600 dark:text-neutral-400 mb-6">
            We are not accepting new applications at this time. Please check back later or contact the school for more information.
          </p>
          <NuxtLink to="/" class="inline-flex items-center text-primary-600 hover:text-primary-700">
            <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
            Return to Home
          </NuxtLink>
        </div>

        <!-- Session Information & Application Form -->
        <div v-else class="space-y-6">
          <!-- Session Info Card -->
          <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">{{ activeSession.name }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-neutral-600 dark:text-neutral-400">Application Period:</span>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">
                  {{ formatDate(activeSession.start_date) }} - {{ formatDate(activeSession.end_date) }}
                </p>
              </div>
              <div>
                <span class="text-neutral-600 dark:text-neutral-400">Academic Year:</span>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ activeSession.academic_year_display }}</p>
              </div>
            </div>
            <div v-if="activeSession.application_instructions" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p class="text-sm text-blue-900 dark:text-blue-100">{{ activeSession.application_instructions }}</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Get Started</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button @click="startNewApplication" size="lg" class="w-full">
                <Icon name="lucide:file-plus" class="w-5 h-5 mr-2" />
                Start New Application
              </Button>
              <Button @click="navigateTo('/apply/track')" variant="outline" size="lg" class="w-full">
                <Icon name="lucide:search" class="w-5 h-5 mr-2" />
                Track Existing Application
              </Button>
            </div>
          </div>

          <!-- Available Classes -->
          <div v-if="feeStructures.length > 0" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Available Classes</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="fee in feeStructures"
                :key="fee.id"
                class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:border-primary-500 transition-colors"
              >
                <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{{ fee.class_room_name }}</h4>
                <div class="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                  <p>
                    <span class="font-medium">Application Fee:</span>
                    {{ formatCurrency(fee.application_fee) }}
                  </p>
                  <p v-if="fee.entrance_exam_required">
                    <span class="font-medium">Exam Fee:</span>
                    {{ formatCurrency(fee.entrance_exam_fee || 0) }}
                  </p>
                  <p v-if="fee.acceptance_fee_required">
                    <span class="font-medium">Acceptance Fee:</span>
                    {{ formatCurrency(fee.acceptance_fee) }}
                  </p>
                  <p v-if="fee.minimum_age || fee.maximum_age" class="text-xs">
                    Age: {{ fee.minimum_age }}-{{ fee.maximum_age }} years
                  </p>
                  <div v-if="!fee.has_capacity" class="mt-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Capacity Full
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useBrand } from '~~/composables/useBrand'
import { useAdmission } from '~~/composables/useAdmission'
import type { AdmissionSession, AdmissionFeeStructure } from '~~/types/admission'

definePageMeta({
  layout: false,
})

const { schoolLogo, school, product } = useBrand()
const { publicAPI } = useAdmission()

const schoolName = computed(() => school() || product())
const loading = ref(true)
const error = ref<string | null>(null)
const activeSession = ref<AdmissionSession | null>(null)
const feeStructures = ref<AdmissionFeeStructure[]>([])

const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    // Get active session
    activeSession.value = await publicAPI.getActiveSession()

    // Get fee structures for the active session
    if (activeSession.value) {
      feeStructures.value = await publicAPI.getFeeStructures(activeSession.value.id)
    }
  } catch (err: any) {
    console.error('Error loading admission data:', err)
    error.value = err.data?.detail || err.message || 'Failed to load admission information'
  } finally {
    loading.value = false
  }
}

const startNewApplication = () => {
  navigateTo('/apply/form')
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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
