<!-- pages/teacher/attendance/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Mark Attendance</h1>
      <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Record student attendance for your classes</p>
    </div>

    <!-- Class and Date Selection -->
    <Card>
      <CardHeader class="p-4 sm:p-6">
        <CardTitle class="text-lg sm:text-xl">Select Class & Date</CardTitle>
      </CardHeader>
      <CardContent class="p-4 sm:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="class">Class</Label>
            <select
              id="class"
              v-model="selectedClass"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">Select a class</option>
              <option v-for="cls in myClasses" :key="cls.id" :value="cls.id">
                {{ cls.classroom_name }} - {{ cls.subject_name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="date">Date</Label>
            <Input
              id="date"
              v-model="selectedDate"
              type="date"
              :max="today"
            />
          </div>
        </div>

        <Button @click="loadAttendance" :disabled="!selectedClass || !selectedDate" class="mt-4 w-full sm:w-auto">
          <Icon name="lucide:search" class="w-4 h-4 mr-2" />
          Load Attendance
        </Button>
      </CardContent>
    </Card>

    <!-- Attendance List -->
    <Card v-if="students.length > 0">
      <CardHeader class="p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle class="text-lg sm:text-xl">Student Attendance</CardTitle>
            <CardDescription class="text-sm">{{ selectedClassName }} - {{ formatDate(selectedDate) }}</CardDescription>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" @click="markAllPresent" size="sm" class="w-full sm:w-auto">
              <Icon name="lucide:check-circle" class="w-4 h-4 mr-2" />
              All Present
            </Button>
            <Button @click="saveAttendance" :disabled="saving" size="sm" class="w-full sm:w-auto">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              <Icon v-else name="lucide:save" class="w-4 h-4 mr-2" />
              {{ saving ? 'Saving...' : 'Save Attendance' }}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-4 sm:p-6">
        <!-- Mobile: Card List -->
        <div class="block lg:hidden space-y-3">
          <Card v-for="student in students" :key="student.id" class="border-2" :class="getStatusBorderClass(student.attendance_status)">
            <CardContent class="p-4">
              <div class="space-y-3">
                <!-- Student Info -->
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-base truncate">{{ student.first_name }} {{ student.last_name }}</h3>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ student.admission_number }}</p>
                  </div>
                </div>

                <!-- Status Buttons -->
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    :variant="student.attendance_status === 'Present' ? 'default' : 'outline'"
                    @click="student.attendance_status = 'Present'"
                    class="w-full"
                  >
                    <Icon name="lucide:check" class="w-4 h-4 mr-1.5" />
                    Present
                  </Button>
                  <Button
                    size="sm"
                    :variant="student.attendance_status === 'Absent' ? 'destructive' : 'outline'"
                    @click="student.attendance_status = 'Absent'"
                    class="w-full"
                  >
                    <Icon name="lucide:x" class="w-4 h-4 mr-1.5" />
                    Absent
                  </Button>
                  <Button
                    size="sm"
                    :variant="student.attendance_status === 'Late' ? 'secondary' : 'outline'"
                    @click="student.attendance_status = 'Late'"
                    class="w-full"
                  >
                    <Icon name="lucide:clock" class="w-4 h-4 mr-1.5" />
                    Late
                  </Button>
                  <Button
                    size="sm"
                    :variant="student.attendance_status === 'Excused' ? 'secondary' : 'outline'"
                    @click="student.attendance_status = 'Excused'"
                    class="w-full"
                  >
                    <Icon name="lucide:shield-check" class="w-4 h-4 mr-1.5" />
                    Excused
                  </Button>
                </div>

                <!-- Remarks -->
                <Input
                  v-model="student.remarks"
                  placeholder="Remarks (optional)"
                  class="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Desktop: Table -->
        <div class="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admission No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="student in students" :key="student.id">
                <TableCell class="font-medium">{{ student.admission_number }}</TableCell>
                <TableCell>
                  <div>
                    <p class="font-medium">{{ student.first_name }} {{ student.last_name }}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button
                      size="sm"
                      :variant="student.attendance_status === 'Present' ? 'default' : 'outline'"
                      @click="student.attendance_status = 'Present'"
                    >
                      <Icon name="lucide:check" class="w-4 h-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      :variant="student.attendance_status === 'Absent' ? 'destructive' : 'outline'"
                      @click="student.attendance_status = 'Absent'"
                    >
                      <Icon name="lucide:x" class="w-4 h-4 mr-1" />
                      Absent
                    </Button>
                    <Button
                      size="sm"
                      :variant="student.attendance_status === 'Late' ? 'secondary' : 'outline'"
                      @click="student.attendance_status = 'Late'"
                    >
                      <Icon name="lucide:clock" class="w-4 h-4 mr-1" />
                      Late
                    </Button>
                    <Button
                      size="sm"
                      :variant="student.attendance_status === 'Excused' ? 'secondary' : 'outline'"
                      @click="student.attendance_status = 'Excused'"
                    >
                      <Icon name="lucide:shield-check" class="w-4 h-4 mr-1" />
                      Excused
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    v-model="student.remarks"
                    placeholder="Remarks (optional)"
                    class="max-w-xs"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Empty State -->
    <Card v-else-if="selectedClass && selectedDate && !loading">
      <CardContent class="p-12 text-center">
        <Icon name="lucide:users" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
        <p class="text-neutral-500 dark:text-neutral-400">No students found in this class</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useClasses } from '~~/composables/teacher/useClasses'
import { useAttendance } from '~~/composables/teacher/useAttendance'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'teacher',
  middleware: 'teacher'
})

interface ClassForAttendance {
  id: number
  classroom_id: number
  classroom_name: string
  subject_name: string
  grade_level_name: string
  student_count: number
}

interface StudentWithAttendance {
  id: number
  admission_number: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  photo?: string
  status: string
  grade_level_name?: string
  attendance_status: string
  remarks: string
}

const { fetchMyClasses, fetchClassStudents } = useClasses()
const { markBulkAttendance } = useAttendance()
const { success, error: showError } = useToast()

const myClasses = ref<ClassForAttendance[]>([])
const students = ref<StudentWithAttendance[]>([])
const selectedClass = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const loading = ref(false)
const saving = ref(false)

const today = new Date().toISOString().split('T')[0]

const selectedClassName = computed(() => {
  const cls = myClasses.value.find(c => c.id === parseInt(selectedClass.value))
  return cls ? `${cls.classroom_name} - ${cls.subject_name}` : ''
})

const loadAttendance = async () => {
  if (!selectedClass.value || !selectedDate.value) return

  loading.value = true
  const classData = myClasses.value.find(c => c.id === parseInt(selectedClass.value))
  if (!classData) {
    loading.value = false
    return
  }

  // Extract classroom ID from the selected class
  const { data, error } = await fetchClassStudents(classData.classroom_id || classData.id)

  if (data) {
    students.value = data.map(student => ({
      ...student,
      attendance_status: 'Present',
      remarks: ''
    }))
  } else if (error) {
    showError('Failed to load students', error)
  }

  loading.value = false
}

const markAllPresent = () => {
  students.value.forEach(student => {
    student.attendance_status = 'Present'
  })
}

const saveAttendance = async () => {
  if (!selectedClass.value || !selectedDate.value || students.value.length === 0) return

  saving.value = true

  const classData = myClasses.value.find(c => c.id === parseInt(selectedClass.value))

  if (!classData) {
    showError('Class not found', 'Please select a valid class')
    saving.value = false
    return
  }

  const attendanceData = {
    classroom: classData.classroom_id || classData.id,
    date: selectedDate.value,
    records: students.value.map(student => ({
      student: student.id,
      status: student.attendance_status,
      remarks: student.remarks || ''
    }))
  }

  const { error } = await markBulkAttendance(attendanceData)

  if (!error) {
    success('Attendance saved successfully')
  } else {
    showError('Failed to save attendance', error)
  }

  saving.value = false
}

const getStatusBorderClass = (status: string) => {
  switch (status) {
    case 'Present':
      return 'border-green-500'
    case 'Absent':
      return 'border-red-500'
    case 'Late':
      return 'border-yellow-500'
    case 'Excused':
      return 'border-blue-500'
    default:
      return 'border-neutral-200'
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  const { data } = await fetchMyClasses()
  if (data) {
    // Backend now returns separate arrays, combine them for attendance marking
    const homeroom = (data as any).homeroom_classes || []
    const teaching = (data as any).teaching_assignments || []

    // Combine both arrays - homeroom classes and teaching assignments
    myClasses.value = [
      ...homeroom.map((cls: any) => ({
        id: cls.classroom_id,
        classroom_id: cls.classroom_id,
        classroom_name: cls.classroom_name,
        subject_name: 'Homeroom',
        grade_level_name: cls.grade_level_name,
        student_count: cls.student_count
      })),
      ...teaching.map((cls: any) => ({
        id: cls.id,
        classroom_id: cls.classroom_id,
        classroom_name: cls.classroom_name,
        subject_name: cls.subject_name,
        grade_level_name: cls.grade_level_name,
        student_count: cls.student_count
      }))
    ]
  }
})
</script>
