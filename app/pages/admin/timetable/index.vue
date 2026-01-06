<!-- pages/admin/timetable/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Timetable</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Manage class schedules and timetables</p>
      </div>
      <Button @click="showCreateDialog = true" class="w-full sm:w-auto">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Add Schedule
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="p-4 sm:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div class="space-y-2">
            <Label for="classroom_filter" class="text-sm">Classroom</Label>
            <Select v-model="filters.classroom" @update:model-value="applyFilters">
              <SelectTrigger class="h-10 text-sm">
                <SelectValue placeholder="All classrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classrooms</SelectItem>
                <SelectItem v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id.toString()">
                  {{ classroom.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="day_filter" class="text-sm">Day of Week</Label>
            <Select v-model="filters.day" @update:model-value="applyFilters">
              <SelectTrigger class="h-10 text-sm">
                <SelectValue placeholder="All days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All days</SelectItem>
                <SelectItem value="Monday">Monday</SelectItem>
                <SelectItem value="Tuesday">Tuesday</SelectItem>
                <SelectItem value="Wednesday">Wednesday</SelectItem>
                <SelectItem value="Thursday">Thursday</SelectItem>
                <SelectItem value="Friday">Friday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="subject_filter" class="text-sm">Subject</Label>
            <Select v-model="filters.subject" @update:model-value="applyFilters">
              <SelectTrigger class="h-10 text-sm">
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                <SelectItem v-for="subject in subjects" :key="subject.id" :value="subject.id.toString()">
                  {{ subject.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Timetable View -->
    <Card>
      <CardHeader class="p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <CardTitle class="text-lg sm:text-xl">Class Schedules</CardTitle>
            <CardDescription class="text-sm">{{ filteredSchedules.length }} schedule(s) found</CardDescription>
          </div>
          <div class="hidden lg:flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''"
            >
              <Icon name="lucide:grid-3x3" class="w-4 h-4 mr-2" />
              Grid View
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="viewMode = 'list'"
              :class="viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''"
            >
              <Icon name="lucide:list" class="w-4 h-4 mr-2" />
              List View
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent class="p-4 sm:p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400 mb-2" />
          <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">Loading timetable...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredSchedules.length === 0" class="text-center py-12">
          <Icon name="lucide:calendar-clock" class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-neutral-400 mb-4" />
          <h3 class="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No schedules found</h3>
          <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-4">
            {{ Object.values(filters).some(f => f !== 'all')
              ? 'Try adjusting your filters'
              : 'Create your first class schedule' }}
          </p>
          <Button @click="showCreateDialog = true" class="w-full sm:w-auto">
            <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
            Add Schedule
          </Button>
        </div>

        <div v-else>
          <!-- Mobile: Day Tabs + Card List -->
          <div class="block lg:hidden">
            <!-- Day Tabs -->
            <div class="flex overflow-x-auto gap-2 pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-700">
              <Button
                v-for="day in weekDays"
                :key="day"
                :variant="selectedDay === day ? 'default' : 'outline'"
                size="sm"
                @click="selectedDay = day"
                class="flex-shrink-0"
              >
                {{ day.substring(0, 3) }}
              </Button>
            </div>

            <!-- Schedule Cards for Selected Day -->
            <div class="space-y-3">
              <Card
                v-for="schedule in getSchedulesForDay(selectedDay)"
                :key="schedule.id"
                class="border-l-4 hover:shadow-md transition-shadow"
                :class="getScheduleClass(schedule)"
              >
                <CardContent class="p-4">
                  <div class="space-y-3">
                    <!-- Header -->
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-base text-neutral-900 dark:text-neutral-100 truncate">
                          {{ schedule.subject_name }}
                        </h3>
                        <p class="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                          {{ schedule.classroom_name }}
                        </p>
                      </div>
                      <Badge variant="outline" class="flex-shrink-0 text-xs">
                        {{ formatTime(schedule.start_time) }}
                      </Badge>
                    </div>

                    <!-- Details -->
                    <div class="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                      <span class="flex items-center gap-1">
                        <Icon name="lucide:clock" class="w-4 h-4" />
                        {{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}
                      </span>
                      <span class="flex items-center gap-1 truncate">
                        <Icon name="lucide:user" class="w-4 h-4 flex-shrink-0" />
                        <span class="truncate">{{ schedule.teacher_name || 'Not assigned' }}</span>
                      </span>
                    </div>

                    <!-- Actions -->
                    <div class="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        @click="editSchedule(schedule)"
                        class="w-full text-xs"
                      >
                        <Icon name="lucide:pencil" class="w-3 h-3 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        @click="handleDelete(schedule)"
                        class="w-full text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Icon name="lucide:trash-2" class="w-3 h-3 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- No schedules for day -->
              <div
                v-if="getSchedulesForDay(selectedDay).length === 0"
                class="text-center py-8 text-neutral-400 dark:text-neutral-500 text-sm"
              >
                No classes scheduled for {{ selectedDay }}
              </div>
            </div>
          </div>

          <!-- Desktop: Grid or List View -->
          <div class="hidden lg:block">
            <!-- Grid View -->
            <div v-if="viewMode === 'grid'" class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="border-b-2 border-neutral-200 dark:border-neutral-700">
                    <th class="p-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100">Time</th>
                    <th v-for="day in weekDays" :key="day" class="p-3 text-center text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {{ day }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="slot in timeSlots" :key="slot" class="border-b border-neutral-200 dark:border-neutral-700">
                    <td class="p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {{ slot }}
                    </td>
                    <td v-for="day in weekDays" :key="day" class="p-2">
                      <div
                        v-for="schedule in getScheduleForDayTime(day, slot)"
                        :key="schedule.id"
                        class="p-2 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow mb-2 last:mb-0"
                        :class="getScheduleClass(schedule)"
                        @click="editSchedule(schedule)"
                      >
                        <p class="font-semibold text-sm text-neutral-900 dark:text-neutral-100">{{ schedule.subject_name }}</p>
                        <p class="text-xs text-neutral-600 dark:text-neutral-400">{{ schedule.classroom_name }}</p>
                        <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ schedule.teacher_name || 'No teacher' }}</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- List View -->
            <div v-else>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Classroom</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="schedule in filteredSchedules" :key="schedule.id">
                    <TableCell class="font-medium">{{ schedule.day_of_week }}</TableCell>
                    <TableCell>{{ schedule.start_time }} - {{ schedule.end_time }}</TableCell>
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <div :class="getScheduleColorDot(schedule)" class="w-3 h-3 rounded-full"></div>
                        {{ schedule.subject_name }}
                      </div>
                    </TableCell>
                    <TableCell>{{ schedule.classroom_name }}</TableCell>
                    <TableCell>{{ schedule.teacher_name || 'Not assigned' }}</TableCell>
                    <TableCell class="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <Button variant="ghost" size="sm">
                            <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem @click="editSchedule(schedule)">
                            <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem @click="handleDelete(schedule)" class="text-red-600 dark:text-red-400">
                            <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="text-lg sm:text-xl">{{ editingSchedule ? 'Edit Schedule' : 'Add Schedule' }}</DialogTitle>
          <DialogDescription class="text-sm">
            {{ editingSchedule ? 'Update schedule information' : 'Create a new class schedule' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div class="space-y-2">
              <Label for="classroom">Classroom *</Label>
              <select
                id="classroom"
                v-model="formData.classroom"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                required
              >
                <option value="">Select classroom</option>
                <option v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id">
                  {{ classroom.name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="subject">Subject *</Label>
              <select
                id="subject"
                v-model="formData.subject"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                required
              >
                <option value="">Select subject</option>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                  {{ subject.name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="teacher">Teacher (Optional)</Label>
              <select
                id="teacher"
                v-model="formData.teacher"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              >
                <option value="">No teacher assigned</option>
                <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                  {{ teacher.first_name }} {{ teacher.last_name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="day_of_week">Day *</Label>
              <select
                id="day_of_week"
                v-model="formData.day_of_week"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                required
              >
                <option value="">Select day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="start_time">Start Time *</Label>
              <Input
                id="start_time"
                v-model="formData.start_time"
                type="time"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="end_time">End Time *</Label>
              <Input
                id="end_time"
                v-model="formData.end_time"
                type="time"
                required
              />
            </div>
          </div>

          <DialogFooter class="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" @click="closeDialog" class="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" :disabled="saving" class="w-full sm:w-auto">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : (editingSchedule ? 'Update' : 'Create') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useApi } from '~~/composables/useApi'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
})

interface Schedule {
  id?: number
  classroom: number
  classroom_name?: string
  subject: number
  subject_name?: string
  teacher?: number | null
  teacher_name?: string
  day_of_week: string
  start_time: string
  end_time: string
}

const { success, error: showError } = useToast()

const { apiCall } = useApi()

const loading = ref(true)
const saving = ref(false)
const schedules = ref<Schedule[]>([])
const classrooms = ref<any[]>([])
const subjects = ref<any[]>([])
const teachers = ref<any[]>([])
const showCreateDialog = ref(false)
const editingSchedule = ref<Schedule | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const selectedDay = ref('Monday')

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const timeSlots = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
]

const filters = ref({
  classroom: 'all',
  day: 'all',
  subject: 'all',
})

const formData = ref<Partial<Schedule>>({
  classroom: undefined as any,
  subject: undefined as any,
  teacher: null,
  day_of_week: '',
  start_time: '',
  end_time: '',
})

const filteredSchedules = computed(() => {
  let result = [...schedules.value]

  if (filters.value.classroom && filters.value.classroom !== 'all') {
    result = result.filter(s => s.classroom === Number(filters.value.classroom))
  }

  if (filters.value.day && filters.value.day !== 'all') {
    result = result.filter(s => s.day_of_week === filters.value.day)
  }

  if (filters.value.subject && filters.value.subject !== 'all') {
    result = result.filter(s => s.subject === Number(filters.value.subject))
  }

  return result.sort((a, b) => {
    const dayOrder: Record<string, number> = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4 }
    if (dayOrder[a.day_of_week] !== dayOrder[b.day_of_week]) {
      return dayOrder[a.day_of_week] - dayOrder[b.day_of_week]
    }
    return a.start_time.localeCompare(b.start_time)
  })
})

const getSchedulesForDay = (day: string) => {
  return filteredSchedules.value
    .filter(s => s.day_of_week === day)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
}

const getScheduleForDayTime = (day: string, timeSlot: string) => {
  const [startStr] = timeSlot.split(' - ')
  return filteredSchedules.value.filter(s => {
    return s.day_of_week === day && s.start_time === startStr
  })
}

const getScheduleClass = (schedule: Schedule) => {
  const colors = [
    'bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-600',
    'bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-600',
    'bg-purple-50 border-purple-400 dark:bg-purple-900/20 dark:border-purple-600',
    'bg-orange-50 border-orange-400 dark:bg-orange-900/20 dark:border-orange-600',
    'bg-pink-50 border-pink-400 dark:bg-pink-900/20 dark:border-pink-600',
  ]
  return colors[schedule.subject % colors.length]
}

const getScheduleColorDot = (schedule: Schedule) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
  ]
  return colors[schedule.subject % colors.length]
}

const formatTime = (time: string) => {
  if (!time) return ''
  try {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return time
  }
}

const loadData = async () => {
  loading.value = true
  const [schedulesRes, classroomsRes, subjectsRes, teachersRes] = await Promise.all([
    apiCall<Schedule[]>('/timetable/periods/'),
    apiCall<any[]>('/academic/classrooms/'),
    apiCall<any[]>('/academic/subjects/'),
    apiCall<any[]>('/users/teachers/'),
  ])

  if (schedulesRes.data) schedules.value = schedulesRes.data
  if (classroomsRes.data) classrooms.value = classroomsRes.data
  if (subjectsRes.data) subjects.value = subjectsRes.data
  if (teachersRes.data) teachers.value = teachersRes.data

  loading.value = false
}

const applyFilters = () => {
  // Filters are reactive, just trigger re-render
}

const editSchedule = (schedule: Schedule) => {
  editingSchedule.value = schedule
  formData.value = { ...schedule }
  showCreateDialog.value = true
}

const handleSubmit = async () => {
  saving.value = true

  if (editingSchedule.value) {
    const { data, error: apiError } = await apiCall(`/timetable/periods/${editingSchedule.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(formData.value),
    })

    if (data) {
      const index = schedules.value.findIndex(s => s.id === editingSchedule.value!.id)
      if (index !== -1) schedules.value[index] = data
      showSuccessToast('Schedule updated successfully')
      closeDialog()
    } else {
      showErrorToast(apiError || 'An unexpected error occurred. Please try again.' , 'Failed to update schedule')
    }
  } else {
    const { data, error: apiError } = await apiCall('/timetable/periods/', {
      method: 'POST',
      body: JSON.stringify(formData.value),
    })

    if (data) {
      schedules.value.push(data)
      showSuccessToast('Schedule created successfully')
      closeDialog()
    } else {
      showErrorToast(apiError || 'An unexpected error occurred. Please try again.' , 'Failed to create schedule')
    }
  }

  saving.value = false
}

const handleDelete = async (schedule: Schedule) => {
  if (!confirm(`Are you sure you want to delete this schedule?`)) return

  const { error: apiError } = await apiCall(`/timetable/periods/${schedule.id}/`, {
    method: 'DELETE',
  })

  if (!apiError) {
    schedules.value = schedules.value.filter(s => s.id !== schedule.id)
    showSuccessToast('Schedule deleted successfully')
  } else {
    showError('Failed to delete schedule: ' + apiError)
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingSchedule.value = null
  formData.value = {
    classroom: undefined as any,
    subject: undefined as any,
    teacher: null,
    day_of_week: '',
    start_time: '',
    end_time: '',
  }
}

onMounted(() => {
  loadData()
})
</script>
