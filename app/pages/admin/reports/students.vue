<!-- pages/admin/reports/students.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Student Reports</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Comprehensive student data including demographics, attendance, performance, and fees
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="exportReport('pdf')" :disabled="loading || exporting">
          <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" @click="exportReport('excel')" :disabled="loading || exporting">
          <Icon name="lucide:file-spreadsheet" class="w-4 h-4 mr-2" />
          Export Excel
        </Button>
      </div>
    </div>

    <!-- Filters Card -->
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label for="class_level">Class</Label>
            <select
              id="class_level"
              v-model="filters.class_level"
              class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
            >
              <option :value="undefined">All Classes</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="status">Status</Label>
            <select
              id="status"
              v-model="filters.status"
              class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
            >
              <option :value="undefined">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="date_from">Date From</Label>
            <Input
              id="date_from"
              v-model="filters.date_from"
              type="date"
            />
          </div>

          <div class="space-y-2">
            <Label for="date_to">Date To</Label>
            <Input
              id="date_to"
              v-model="filters.date_to"
              type="date"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <Button variant="outline" @click="clearFilters">
            <Icon name="lucide:x" class="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button @click="generateReport">
            <Icon name="lucide:search" class="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Summary Cards -->
    <div v-if="reportData" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Total Students</p>
              <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ reportData.summary.total_students }}
              </p>
            </div>
            <Icon name="lucide:users" class="w-8 h-8 text-primary-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Active Students</p>
              <p class="text-2xl font-bold text-green-700 dark:text-green-400">
                {{ reportData.summary.active_students }}
              </p>
            </div>
            <Icon name="lucide:user-check" class="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Avg Attendance</p>
              <p class="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {{ reportData.summary.average_attendance?.toFixed(1) || 0 }}%
              </p>
            </div>
            <Icon name="lucide:calendar-check" class="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Avg Balance</p>
              <p class="text-2xl font-bold text-orange-700 dark:text-orange-400">
                ₦{{ formatCurrency(reportData.summary.average_balance || 0) }}
              </p>
            </div>
            <Icon name="lucide:wallet" class="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Report Data Table -->
    <Card v-else-if="reportData && reportData.students.length > 0">
      <CardHeader>
        <CardTitle>Student Details ({{ reportData.students.length }} records)</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-neutral-200 dark:border-neutral-700">
              <tr class="text-left">
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400">Admission #</th>
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400">Name</th>
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400">Class</th>
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400">Status</th>
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400 text-center">Attendance</th>
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400 text-center">Avg Grade</th>
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400 text-right">Fees Paid</th>
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="student in reportData.students"
                :key="student.student_id"
                class="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <td class="py-3 text-sm">{{ student.admission_number }}</td>
                <td class="py-3 text-sm font-medium">{{ student.full_name }}</td>
                <td class="py-3 text-sm">{{ student.class_name }}</td>
                <td class="py-3 text-sm">
                  <Badge :variant="getStatusVariant(student.status)">
                    {{ student.status }}
                  </Badge>
                </td>
                <td class="py-3 text-sm text-center">
                  <span :class="getAttendanceColor(student.attendance_rate)">
                    {{ student.attendance_rate?.toFixed(1) || 'N/A' }}%
                  </span>
                </td>
                <td class="py-3 text-sm text-center font-medium">
                  {{ student.average_grade || 'N/A' }}
                </td>
                <td class="py-3 text-sm text-right text-green-700 dark:text-green-400">
                  ₦{{ formatCurrency(student.fees_paid || 0) }}
                </td>
                <td class="py-3 text-sm text-right" :class="student.balance && student.balance > 0 ? 'text-red-700 dark:text-red-400' : 'text-neutral-600'">
                  ₦{{ formatCurrency(student.balance || 0) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- Empty State -->
    <Card v-else-if="reportData && reportData.students.length === 0">
      <CardContent class="py-12">
        <div class="text-center text-neutral-500 dark:text-neutral-400">
          <Icon name="lucide:inbox" class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p class="text-lg font-medium">No students found</p>
          <p class="text-sm mt-2">Try adjusting your filters</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useReports, type StudentReportFilters } from '~~/composables/admin/useReports'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin'
})

const { success: showSuccess, error: showError } = useToast()
const { fetchStudentReport, exportToPDF, exportToExcel } = useReports()

const loading = ref(false)
const exporting = ref(false)
const error = ref<string | null>(null)
const reportData = ref<any>(null)

const classes = ref([
  { id: 1, name: 'Primary 1' },
  { id: 2, name: 'Primary 2' },
  { id: 3, name: 'JSS 1' },
  { id: 4, name: 'JSS 2' },
  { id: 5, name: 'SSS 1' },
  { id: 6, name: 'SSS 2' }
])

const filters = ref<StudentReportFilters>({
  class_level: undefined,
  status: undefined,
  date_from: undefined,
  date_to: undefined
})

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const getStatusVariant = (status: string) => {
  const variants: Record<string, any> = {
    Active: 'default',
    Inactive: 'secondary',
    Graduated: 'outline',
    Withdrawn: 'destructive'
  }
  return variants[status] || 'secondary'
}

const getAttendanceColor = (rate?: number) => {
  if (!rate) return 'text-neutral-500'
  if (rate >= 90) return 'text-green-700 dark:text-green-400 font-medium'
  if (rate >= 75) return 'text-blue-700 dark:text-blue-400 font-medium'
  if (rate >= 60) return 'text-yellow-700 dark:text-yellow-400 font-medium'
  return 'text-red-700 dark:text-red-400 font-medium'
}

const generateReport = async () => {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await fetchStudentReport(filters.value)

  loading.value = false

  if (fetchError) {
    error.value = 'Failed to generate report. Please try again.'
    showError(error.value)
    return
  }

  reportData.value = data
  showSuccess('Report generated successfully')
}

const clearFilters = () => {
  filters.value = {
    class_level: undefined,
    status: undefined,
    date_from: undefined,
    date_to: undefined
  }
  reportData.value = null
}

const exportReport = async (format: 'pdf' | 'excel') => {
  if (!reportData.value) {
    showError('Please generate a report first')
    return
  }

  exporting.value = true

  const result = format === 'pdf'
    ? await exportToPDF('student', filters.value)
    : await exportToExcel('student', filters.value)

  exporting.value = false

  if (result.success) {
    showSuccess(`Report exported to ${format.toUpperCase()} successfully`)
  } else {
    showError(result.error || 'Failed to export report')
  }
}

useHead({
  title: 'Student Reports'
})
</script>
