<!-- pages/parent/children/[id].vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Card v-else-if="error">
      <CardContent class="p-8 text-center">
        <Icon name="lucide:alert-circle" class="w-12 h-12 mx-auto text-red-500 mb-3" />
        <p class="text-neutral-600 dark:text-neutral-400">{{ error }}</p>
        <Button @click="navigateTo('/parent')" variant="outline" class="mt-4">
          Back to Dashboard
        </Button>
      </CardContent>
    </Card>

    <!-- Child Details -->
    <div v-else-if="childData" class="space-y-4 sm:space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div class="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" @click="navigateTo('/parent')" class="flex-shrink-0">
            <Icon name="lucide:arrow-left" class="w-5 h-5" />
          </Button>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {{ childData.first_name }} {{ childData.last_name }}
            </h1>
            <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
              {{ childData.class_name }}
            </p>
          </div>
        </div>
        <Badge :variant="childData.status === 'active' ? 'default' : 'secondary'" class="w-fit">
          {{ childData.status }}
        </Badge>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent class="p-4 sm:p-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Icon name="lucide:award" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
              </div>
              <div>
                <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Average Grade</p>
                <p class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ performance?.average_grade || 'N/A' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4 sm:p-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Icon name="lucide:trophy" class="w-5 h-5 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Position</p>
                <p class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ performance?.position || 'N/A' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4 sm:p-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon name="lucide:calendar-check" class="w-5 h-5 text-blue-700 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Attendance</p>
                <p class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ attendance?.attendance_rate || 0 }}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4 sm:p-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Icon name="lucide:wallet" class="w-5 h-5 text-orange-700 dark:text-orange-400" />
              </div>
              <div>
                <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Fee Balance</p>
                <p class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  ₦{{ formatCurrency(fees?.balance || 0) }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Tabs Navigation -->
      <div class="border-b border-neutral-200 dark:border-neutral-700">
        <div class="flex overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'text-primary-700 dark:text-primary-400 border-b-2 border-primary-700 dark:border-primary-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            ]"
          >
            <Icon :name="tab.icon" class="w-4 h-4 inline mr-2" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div>
        <!-- Academic Performance Tab -->
        <div v-if="activeTab === 'performance'">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Subject grades and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="loadingPerformance" class="text-center py-8">
                <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
              </div>
              <div v-else-if="performance?.subjects && performance.subjects.length > 0" class="space-y-3">
                <div
                  v-for="subject in performance.subjects"
                  :key="subject.subject_name"
                  class="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-neutral-900 dark:text-neutral-100">{{ subject.subject_name }}</h4>
                    <Badge>{{ subject.grade }}</Badge>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-neutral-600 dark:text-neutral-400">Score: {{ subject.score }}%</span>
                    <span v-if="subject.position" class="text-neutral-600 dark:text-neutral-400">
                      Position: {{ subject.position }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-neutral-500 dark:text-neutral-400">
                No performance data available
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Attendance Tab -->
        <div v-if="activeTab === 'attendance'">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Attendance summary and history</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="loadingAttendance" class="text-center py-8">
                <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
              </div>
              <div v-else-if="attendance">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div class="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <p class="text-2xl font-bold text-green-700 dark:text-green-400">{{ attendance.present }}</p>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400">Present</p>
                  </div>
                  <div class="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p class="text-2xl font-bold text-red-700 dark:text-red-400">{{ attendance.absent }}</p>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400">Absent</p>
                  </div>
                  <div class="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{{ attendance.late }}</p>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400">Late</p>
                  </div>
                  <div class="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p class="text-2xl font-bold text-blue-700 dark:text-blue-400">{{ attendance.total_days }}</p>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400">Total Days</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-neutral-500 dark:text-neutral-400">
                No attendance data available
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Fees Tab -->
        <div v-if="activeTab === 'fees'">
          <div class="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Summary</CardTitle>
                <CardDescription>Current term fee status</CardDescription>
              </CardHeader>
              <CardContent>
                <div v-if="loadingFees" class="text-center py-8">
                  <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
                </div>
                <div v-else-if="fees">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div class="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                      <p class="text-sm text-neutral-600 dark:text-neutral-400">Total Fees</p>
                      <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">₦{{ formatCurrency(fees.total_fees) }}</p>
                    </div>
                    <div class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p class="text-sm text-neutral-600 dark:text-neutral-400">Paid</p>
                      <p class="text-2xl font-bold text-green-700 dark:text-green-400">₦{{ formatCurrency(fees.total_paid) }}</p>
                    </div>
                    <div class="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <p class="text-sm text-neutral-600 dark:text-neutral-400">Balance</p>
                      <p class="text-2xl font-bold text-orange-700 dark:text-orange-400">₦{{ formatCurrency(fees.balance) }}</p>
                    </div>
                  </div>

                  <div v-if="fees.fee_items && fees.fee_items.length > 0" class="space-y-3">
                    <h4 class="font-medium text-neutral-900 dark:text-neutral-100">Fee Breakdown</h4>
                    <div
                      v-for="item in fees.fee_items"
                      :key="item.id"
                      class="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <h5 class="font-medium text-neutral-900 dark:text-neutral-100">{{ item.fee_type }}</h5>
                        <Badge :variant="item.status === 'paid' ? 'default' : 'secondary'">
                          {{ item.status }}
                        </Badge>
                      </div>
                      <div class="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p class="text-neutral-600 dark:text-neutral-400">Amount</p>
                          <p class="font-medium">₦{{ formatCurrency(item.amount) }}</p>
                        </div>
                        <div>
                          <p class="text-neutral-600 dark:text-neutral-400">Paid</p>
                          <p class="font-medium text-green-600 dark:text-green-400">₦{{ formatCurrency(item.paid) }}</p>
                        </div>
                        <div>
                          <p class="text-neutral-600 dark:text-neutral-400">Balance</p>
                          <p class="font-medium text-orange-600 dark:text-orange-400">₦{{ formatCurrency(item.balance) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  No fee data available
                </div>
              </CardContent>
            </Card>

            <Card v-if="fees?.recent_payments && fees.recent_payments.length > 0">
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div
                    v-for="payment in fees.recent_payments"
                    :key="payment.id"
                    class="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
                  >
                    <div>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">₦{{ formatCurrency(payment.amount) }}</p>
                      <p class="text-sm text-neutral-600 dark:text-neutral-400">
                        {{ formatDate(payment.payment_date) }} - {{ payment.payment_method }}
                      </p>
                    </div>
                    <Badge variant="outline">{{ payment.reference }}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useChildren } from '~~/composables/parent/useChildren'

definePageMeta({
  layout: 'parent',
  middleware: 'parent'
})

const route = useRoute()
const childId = computed(() => parseInt(route.params.id as string))

const { fetchChildDetails, fetchChildPerformance, fetchChildAttendance, fetchChildFees } = useChildren()

const loading = ref(true)
const error = ref('')
const childData = ref(null)
const performance = ref(null)
const attendance = ref(null)
const fees = ref(null)

const loadingPerformance = ref(false)
const loadingAttendance = ref(false)
const loadingFees = ref(false)

const activeTab = ref('performance')

const tabs = [
  { id: 'performance', label: 'Performance', icon: 'lucide:award' },
  { id: 'attendance', label: 'Attendance', icon: 'lucide:calendar-check' },
  { id: 'fees', label: 'Fees', icon: 'lucide:wallet' }
]

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadChildData = async () => {
  loading.value = true
  error.value = ''

  try {
    const { data, error: childError } = await fetchChildDetails(childId.value)

    if (childError || !data) {
      error.value = childError || 'Failed to load child details'
      return
    }

    childData.value = {
      ...data,
      class_name: data.classroom?.name || data.class_name || 'Not Assigned'
    }

    // Load all tab data in parallel
    await Promise.all([
      loadPerformance(),
      loadAttendance(),
      loadFees()
    ])
  } catch (err) {
    error.value = 'An unexpected error occurred'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadPerformance = async () => {
  loadingPerformance.value = true
  const { data } = await fetchChildPerformance(childId.value)
  if (data) performance.value = data
  loadingPerformance.value = false
}

const loadAttendance = async () => {
  loadingAttendance.value = true
  const { data } = await fetchChildAttendance(childId.value)
  if (data) attendance.value = data
  loadingAttendance.value = false
}

const loadFees = async () => {
  loadingFees.value = true
  const { data } = await fetchChildFees(childId.value)
  if (data) fees.value = data
  loadingFees.value = false
}

onMounted(() => {
  loadChildData()
})
</script>
