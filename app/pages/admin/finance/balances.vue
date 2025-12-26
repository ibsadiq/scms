<!-- pages/admin/finance/student-balance.vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Student Balance Lookup</h1>
      <p class="text-neutral-600 dark:text-neutral-400 mt-1">Check individual student fee balances</p>
    </div>

    <!-- Search Card -->
    <Card>
      <CardHeader>
        <CardTitle>Search Student</CardTitle>
        <CardDescription>Enter student name or admission number</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex gap-4">
          <div class="flex-1">
            <Input
              v-model="searchQuery"
              placeholder="Search by name or admission number..."
              @keyup.enter="searchStudents"
            />
          </div>
          <Button @click="searchStudents" :disabled="searching">
            <Icon v-if="searching" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            <Icon v-else name="lucide:search" class="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Search Results -->
    <Card v-if="searchResults.length > 0 && !selectedStudent">
      <CardHeader>
        <CardTitle>Search Results</CardTitle>
        <CardDescription>Select a student to view balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div
            v-for="student in searchResults"
            :key="student.id"
            class="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            @click="selectStudent(student)"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Icon name="lucide:user" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
              </div>
              <div>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.first_name }} {{ student.last_name }}</p>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ student.admission_number }}</p>
              </div>
            </div>
            <Icon name="lucide:chevron-right" class="w-5 h-5 text-neutral-400" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Student Balance Details -->
    <div v-if="selectedStudent && balanceData" class="space-y-6">
      <!-- Student Info Header -->
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Icon name="lucide:user" class="w-8 h-8 text-primary-700 dark:text-primary-400" />
              </div>
              <div>
                <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ selectedStudent.first_name }} {{ selectedStudent.last_name }}
                </h2>
                <p class="text-neutral-600 dark:text-neutral-400">{{ selectedStudent.admission_number }}</p>
              </div>
            </div>
            <Button variant="outline" @click="clearSelection">
              <Icon name="lucide:x" class="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Balance Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Total Fees</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  ₦{{ formatCurrency(balanceData.total_fees) }}
                </p>
              </div>
              <div class="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon name="lucide:file-text" class="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Paid</p>
                <p class="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
                  ₦{{ formatCurrency(balanceData.total_paid) }}
                </p>
              </div>
              <div class="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Icon name="lucide:check-circle" class="w-6 h-6 text-green-700 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Balance</p>
                <p class="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">
                  ₦{{ formatCurrency(balanceData.balance) }}
                </p>
              </div>
              <div class="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Icon name="lucide:alert-circle" class="w-6 h-6 text-red-700 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Fee Breakdown -->
      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
          <CardDescription>Itemized fee details for {{ balanceData.term_name }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-neutral-200 dark:border-neutral-700">
                  <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Fee Type</th>
                  <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Amount Owed</th>
                  <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Amount Paid</th>
                  <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Balance</th>
                  <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="fee in balanceData.fee_breakdown"
                  :key="fee.id"
                  class="border-b border-neutral-100 dark:border-neutral-800"
                >
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <div
                        class="w-2 h-2 rounded-full"
                        :class="getFeeTypeColor(fee.fee_type)"
                      ></div>
                      <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ fee.fee_name }}</span>
                    </div>
                  </td>
                  <td class="text-right py-3 px-4 text-neutral-600 dark:text-neutral-400">
                    ₦{{ formatCurrency(fee.amount_owed) }}
                  </td>
                  <td class="text-right py-3 px-4 text-green-700 dark:text-green-400 font-medium">
                    ₦{{ formatCurrency(fee.amount_paid) }}
                  </td>
                  <td class="text-right py-3 px-4 font-medium" :class="fee.balance > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'">
                    ₦{{ formatCurrency(fee.balance) }}
                  </td>
                  <td class="text-right py-3 px-4">
                    <span
                      class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                      :class="getStatusClass(fee.status)"
                    >
                      {{ fee.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <Button @click="navigateTo(`/admin/finance/payments?student=${selectedStudent.id}`)">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          Record Payment
        </Button>
        <Button variant="outline" @click="printStatement">
          <Icon name="lucide:printer" class="w-4 h-4 mr-2" />
          Print Statement
        </Button>
      </div>
    </div>

    <!-- Empty State -->
    <Card v-if="!searching && searchResults.length === 0 && !selectedStudent && searchQuery">
      <CardContent class="p-12 text-center">
        <Icon name="lucide:search-x" class="w-16 h-16 mx-auto text-neutral-400 mb-4" />
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No students found</h3>
        <p class="text-neutral-600 dark:text-neutral-400">Try a different search term</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

definePageMeta({
  layout: 'admin',
})

const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref<any[]>([])
const selectedStudent = ref<any>(null)
const balanceData = ref<any>(null)

// Mock search function
const searchStudents = async () => {
  if (!searchQuery.value) return

  searching.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock results
  searchResults.value = [
    { id: 1, first_name: 'John', last_name: 'Doe', admission_number: '2025001', class_level: 'JSS 1' },
    { id: 2, first_name: 'Mary', last_name: 'Smith', admission_number: '2025002', class_level: 'JSS 2' },
  ].filter(s =>
    s.first_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.admission_number.includes(searchQuery.value)
  )

  searching.value = false
}

// Select student and load balance
const selectStudent = async (student: any) => {
  selectedStudent.value = student

  // Mock balance data
  balanceData.value = {
    student: student.id,
    student_name: `${student.first_name} ${student.last_name}`,
    student_admission_number: student.admission_number,
    term: 1,
    term_name: 'Term 1 2025',
    total_fees: 55000,
    total_paid: 30000,
    balance: 25000,
    status: 'Partial',
    fee_breakdown: [
      {
        id: 1,
        fee_name: 'Tuition Fee',
        fee_type: 'Tuition',
        amount_owed: 50000,
        amount_paid: 25000,
        balance: 25000,
        status: 'Partial',
        is_waived: false,
      },
      {
        id: 2,
        fee_name: 'Transport Fee',
        fee_type: 'Transport',
        amount_owed: 5000,
        amount_paid: 5000,
        balance: 0,
        status: 'Paid',
        is_waived: false,
      },
    ],
  }
}

const clearSelection = () => {
  selectedStudent.value = null
  balanceData.value = null
}

const printStatement = () => {
  // TODO: Implement print functionality
  alert('Print statement functionality coming soon!')
}

// Format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// Get fee type color
const getFeeTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'Tuition': 'bg-blue-500',
    'Transport': 'bg-green-500',
    'Meals': 'bg-orange-500',
    'Books': 'bg-purple-500',
    'Uniform': 'bg-pink-500',
    'Other': 'bg-gray-500',
  }
  return colors[type] || 'bg-gray-500'
}

// Get status class
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Paid': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Partial': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Unpaid': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Waived': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  }
  return classes[status] || classes['Unpaid']
}
</script>
