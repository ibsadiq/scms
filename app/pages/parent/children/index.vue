<!-- pages/parent/children/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">My Children</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          Overview of all your children's information
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Children Grid -->
    <div v-else-if="children && children.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card
        v-for="child in children"
        :key="child.id"
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo(`/parent/children/${child.id}`)"
      >
        <CardContent class="p-4 sm:p-6">
          <!-- Child Header -->
          <div class="flex items-start gap-4 mb-4">
            <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="lucide:user" class="w-8 h-8 text-primary-700 dark:text-primary-400" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {{ child.first_name }} {{ child.last_name }}
              </h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 truncate">{{ child.class_name }}</p>
              <div class="flex items-center gap-2 mt-2">
                <Badge :variant="child.status === 'active' ? 'default' : 'secondary'">
                  {{ child.status }}
                </Badge>
                <Badge variant="outline" class="text-xs">
                  {{ child.admission_number }}
                </Badge>
              </div>
            </div>
          </div>

          <!-- Quick Stats Grid -->
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <!-- Performance -->
            <div class="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
              <div class="flex items-center gap-2 mb-1">
                <Icon name="lucide:award" class="w-4 h-4 text-primary-700 dark:text-primary-400" />
                <p class="text-xs text-neutral-600 dark:text-neutral-400">Performance</p>
              </div>
              <p class="text-lg font-bold text-primary-700 dark:text-primary-400">
                {{ child.performance?.average_grade || 'N/A' }}
              </p>
              <p class="text-xs text-neutral-600 dark:text-neutral-400">
                Position: {{ child.performance?.position || 'N/A' }}
              </p>
            </div>

            <!-- Attendance -->
            <div class="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div class="flex items-center gap-2 mb-1">
                <Icon name="lucide:calendar-check" class="w-4 h-4 text-green-700 dark:text-green-400" />
                <p class="text-xs text-neutral-600 dark:text-neutral-400">Attendance</p>
              </div>
              <p class="text-lg font-bold text-green-700 dark:text-green-400">
                {{ child.attendance?.rate || 0 }}%
              </p>
              <p class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ child.attendance?.present || 0 }} / {{ child.attendance?.total_days || 0 }} days
              </p>
            </div>

            <!-- Fees Status -->
            <div class="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 col-span-2">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:wallet" class="w-4 h-4 text-orange-700 dark:text-orange-400" />
                  <p class="text-xs text-neutral-600 dark:text-neutral-400">Fee Status</p>
                </div>
                <Badge :variant="child.fees?.status === 'paid' ? 'default' : 'secondary'">
                  {{ child.fees?.status || 'unpaid' }}
                </Badge>
              </div>
              <div class="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p class="text-xs text-neutral-600 dark:text-neutral-400">Total</p>
                  <p class="font-medium">₦{{ formatCurrency(child.fees?.total || 0) }}</p>
                </div>
                <div>
                  <p class="text-xs text-neutral-600 dark:text-neutral-400">Paid</p>
                  <p class="font-medium text-green-600 dark:text-green-400">₦{{ formatCurrency(child.fees?.paid || 0) }}</p>
                </div>
                <div>
                  <p class="text-xs text-neutral-600 dark:text-neutral-400">Balance</p>
                  <p class="font-medium text-orange-600 dark:text-orange-400">₦{{ formatCurrency(child.fees?.balance || 0) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- View Details Button -->
          <Button variant="outline" class="w-full mt-4" @click.stop="navigateTo(`/parent/children/${child.id}`)">
            <Icon name="lucide:eye" class="w-4 h-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else>
      <CardContent class="p-8 text-center">
        <Icon name="lucide:users" class="w-12 h-12 mx-auto text-neutral-400 mb-3" />
        <p class="text-neutral-600 dark:text-neutral-400">No children found</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useChildren } from '~~/composables/parent/useChildren'

definePageMeta({
  layout: 'parent',
  middleware: 'parent'
})

const { fetchMyChildren, fetchChildPerformance, fetchChildAttendance, fetchChildFees } = useChildren()

const loading = ref(true)
const children = ref([])

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const loadChildren = async () => {
  loading.value = true

  try {
    const { data: childrenData, error } = await fetchMyChildren()

    if (error || !childrenData) {
      console.error('Error fetching children:', error)
      return
    }

    // Fetch additional data for each child
    const childrenWithDetails = await Promise.all(
      childrenData.map(async (child) => {
        const [performanceRes, attendanceRes, feesRes] = await Promise.all([
          fetchChildPerformance(child.id),
          fetchChildAttendance(child.id),
          fetchChildFees(child.id)
        ])

        return {
          ...child,
          class_name: child.classroom?.name || child.class_name || 'Not Assigned',
          performance: performanceRes.data ? {
            average_grade: performanceRes.data.average_grade,
            position: performanceRes.data.position
          } : null,
          attendance: attendanceRes.data ? {
            rate: attendanceRes.data.attendance_rate,
            present: attendanceRes.data.present,
            total_days: attendanceRes.data.total_days
          } : null,
          fees: feesRes.data ? {
            total: feesRes.data.total_fees,
            paid: feesRes.data.total_paid,
            balance: feesRes.data.balance,
            status: feesRes.data.status
          } : null
        }
      })
    )

    children.value = childrenWithDetails
  } catch (err) {
    console.error('Error loading children:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadChildren()
})
</script>
