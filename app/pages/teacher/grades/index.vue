<!-- pages/teacher/grades/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Enter Grades</h1>
      <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Record student assessment scores and grades</p>
    </div>

    <!-- Selection Card -->
    <Card>
      <CardHeader class="p-4 sm:p-6">
        <CardTitle class="text-lg sm:text-xl">Select Class & Assessment</CardTitle>
      </CardHeader>
      <CardContent class="p-4 sm:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label for="class">Class</Label>
            <select
              id="class"
              v-model="selectedClass"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">Select class</option>
              <option v-for="cls in myClasses" :key="cls.id" :value="cls.id">
                {{ cls.classroom_name }} - {{ cls.subject_name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="assessment">Assessment Type</Label>
            <select
              id="assessment"
              v-model="selectedAssessment"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">Select type</option>
              <option value="Quiz">Quiz</option>
              <option value="Midterm">Midterm Exam</option>
              <option value="Final">Final Exam</option>
              <option value="Assignment">Assignment</option>
              <option value="Project">Project</option>
              <option value="Practical">Practical</option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="maxScore">Max Score</Label>
            <Input
              id="maxScore"
              v-model.number="maxScore"
              type="number"
              min="1"
              placeholder="100"
            />
          </div>

          <div class="space-y-2">
            <Label for="term">Term</Label>
            <select
              id="term"
              v-model="selectedTerm"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">Select term</option>
              <option v-for="term in terms" :key="term.id" :value="term.id">
                {{ term.name }}
              </option>
            </select>
          </div>
        </div>

        <Button
          @click="loadStudents"
          :disabled="!selectedClass || !selectedAssessment || !maxScore || !selectedTerm"
          class="mt-4 w-full sm:w-auto"
        >
          <Icon name="lucide:users" class="w-4 h-4 mr-2" />
          Load Students
        </Button>
      </CardContent>
    </Card>

    <!-- Grades Entry Card -->
    <Card v-if="students.length > 0">
      <CardHeader class="p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle class="text-lg sm:text-xl">Student Grades</CardTitle>
            <CardDescription class="text-sm">
              {{ selectedClassName }} - {{ selectedAssessment }} (Max: {{ maxScore }})
            </CardDescription>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <Button @click="saveGrades" :disabled="saving || !isValid" class="w-full sm:w-auto">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              <Icon v-else name="lucide:save" class="w-4 h-4 mr-2" />
              {{ saving ? 'Saving...' : 'Save Grades' }}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-4 sm:p-6">
        <!-- Statistics -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
          <div>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Students</p>
            <p class="text-lg font-bold text-neutral-900 dark:text-neutral-100">{{ students.length }}</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Entered</p>
            <p class="text-lg font-bold text-green-600 dark:text-green-400">{{ enteredCount }}</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Average</p>
            <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ averageScore.toFixed(1) }}%</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Highest</p>
            <p class="text-lg font-bold text-purple-600 dark:text-purple-400">{{ highestScore }}</p>
          </div>
        </div>

        <!-- Mobile: Card List -->
        <div class="block lg:hidden space-y-3">
          <Card v-for="student in students" :key="student.id">
            <CardContent class="p-4">
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-base truncate">{{ student.first_name }} {{ student.last_name }}</h3>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ student.admission_number }}</p>
                  </div>
                  <Badge v-if="student.score !== null" :variant="getGradeVariant(student.grade)">
                    {{ student.grade }}
                  </Badge>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <Label class="text-xs">Score</Label>
                    <Input
                      v-model.number="student.score"
                      type="number"
                      :min="0"
                      :max="maxScore"
                      placeholder="0"
                      @input="calculateGrade(student)"
                    />
                  </div>
                  <div class="space-y-1">
                    <Label class="text-xs">Percentage</Label>
                    <Input
                      :value="student.score !== null ? ((student.score / maxScore) * 100).toFixed(1) + '%' : '-'"
                      disabled
                      class="bg-neutral-50 dark:bg-neutral-800"
                    />
                  </div>
                </div>

                <div class="space-y-1">
                  <Label class="text-xs">Remarks</Label>
                  <Input
                    v-model="student.remarks"
                    placeholder="Optional remarks"
                    class="text-sm"
                  />
                </div>
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
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="student in students" :key="student.id">
                <TableCell class="font-medium">{{ student.admission_number }}</TableCell>
                <TableCell>
                  <p class="font-medium">{{ student.first_name }} {{ student.last_name }}</p>
                </TableCell>
                <TableCell>
                  <Input
                    v-model.number="student.score"
                    type="number"
                    :min="0"
                    :max="maxScore"
                    placeholder="0"
                    class="w-24"
                    @input="calculateGrade(student)"
                  />
                </TableCell>
                <TableCell>
                  <span class="font-medium">
                    {{ student.score !== null ? ((student.score / maxScore) * 100).toFixed(1) + '%' : '-' }}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge v-if="student.grade" :variant="getGradeVariant(student.grade)">
                    {{ student.grade }}
                  </Badge>
                  <span v-else class="text-neutral-400">-</span>
                </TableCell>
                <TableCell>
                  <Input
                    v-model="student.remarks"
                    placeholder="Optional remarks"
                    class="max-w-xs"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useClasses } from '~~/composables/teacher/useClasses'
import { useGrading } from '~~/composables/teacher/useGrading'
import { useToast } from '~~/composables/useToast'
import { useApi } from '~~/composables/useApi'
import { useAuth } from '~~/composables/useAuth'

definePageMeta({
  layout: 'teacher',
  middleware: 'teacher'
})

const { fetchMyClasses, fetchClassStudents } = useClasses()
const { submitBulkGrades } = useGrading()
const { success, error: showError } = useToast()
const { apiCall } = useApi()

interface StudentWithGrade {
  id: number
  admission_number: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  photo?: string
  status: string
  grade_level_name?: string
  score: number | null
  grade: string | null
  remarks: string
}

interface ClassData {
  id: number
  classroom_id: number
  classroom_name: string
  subject_name: string
  grade_level_name: string
  student_count: number
  subject_id: number
}

interface Term {
  id: number
  name: string
}

const myClasses = ref<ClassData[]>([])
const terms = ref<Term[]>([])
const students = ref<StudentWithGrade[]>([])
const selectedClass = ref('')
const selectedAssessment = ref('')
const selectedTerm = ref('')
const maxScore = ref(100)
const saving = ref(false)

const selectedClassName = computed(() => {
  const cls = myClasses.value.find(c => c.id === parseInt(selectedClass.value))
  return cls ? `${cls.classroom_name} - ${cls.subject_name}` : ''
})

const enteredCount = computed(() => {
  return students.value.filter(s => s.score !== null && s.score !== '').length
})

const averageScore = computed(() => {
  const validScores = students.value.filter(s => s.score !== null && s.score !== '').map(s => parseFloat(s.score))
  if (validScores.length === 0) return 0
  const sum = validScores.reduce((acc, score) => acc + score, 0)
  return (sum / validScores.length / maxScore.value) * 100
})

const highestScore = computed(() => {
  const validScores = students.value.filter(s => s.score !== null && s.score !== '').map(s => parseFloat(s.score))
  return validScores.length > 0 ? Math.max(...validScores) : 0
})

const isValid = computed(() => {
  return students.value.some(s => s.score !== null && s.score !== '')
})

const loadStudents = async () => {
  if (!selectedClass.value) return

  const classData = myClasses.value.find(c => c.id === parseInt(selectedClass.value))
  if (!classData) return

  const { data, error } = await fetchClassStudents(classData.classroom_id || classData.id)

  if (data) {
    students.value = data.map(student => ({
      ...student,
      score: null,
      grade: null,
      remarks: ''
    })) as StudentWithGrade[]
  } else if (error) {
    showError('Failed to load students', String(error))
  }
}

const calculateGrade = (student: StudentWithGrade) => {
  if (student.score === null || student.score === '') {
    student.grade = null
    return
  }

  const percentage = (parseFloat(String(student.score)) / maxScore.value) * 100

  if (percentage >= 90) student.grade = 'A'
  else if (percentage >= 80) student.grade = 'B'
  else if (percentage >= 70) student.grade = 'C'
  else if (percentage >= 60) student.grade = 'D'
  else if (percentage >= 50) student.grade = 'E'
  else student.grade = 'F'
}

const getGradeVariant = (grade: string) => {
  switch (grade) {
    case 'A': return 'default'
    case 'B': return 'secondary'
    case 'C': return 'outline'
    case 'D': return 'secondary'
    case 'E': return 'secondary'
    case 'F': return 'destructive'
    default: return 'outline'
  }
}

const saveGrades = async () => {
  if (!isValid.value) return

  saving.value = true

  const classData = myClasses.value.find(c => c.id === parseInt(selectedClass.value))
  if (!classData) {
    showError('Please select a valid class')
    saving.value = false
    return
  }

  const gradesData = {
    classroom: classData.classroom_id || classData.id,
    subject: classData.subject_id || classData.id,
    assessment_type: selectedAssessment.value,
    term: parseInt(selectedTerm.value),
    grades: students.value
      .filter(s => s.score !== null && s.score !== '')
      .map(student => ({
        student: student.id,
        score: parseFloat(String(student.score)),
        remarks: student.remarks || ''
      }))
  }

  const { error } = await submitBulkGrades(gradesData)

  if (!error) {
    success('Grades saved successfully')

    // Note: Script upload is not available in quick grade entry
    // Teachers should use the dedicated Marked Scripts page to upload scripts
    const studentsWithScripts = students.value.filter(s => s.scriptFile)
    if (studentsWithScripts.length > 0) {
      showError(
        'Script upload not available in quick grading',
        'Please use the Marked Scripts page to upload examination scripts'
      )
    }

    // Reset scores
    students.value.forEach(s => {
      s.score = null
      s.grade = null
      s.remarks = ''
      s.scriptFile = null
      s.hasScript = false
    })
  } else {
    showError('Failed to save grades', String(error))
  }

  saving.value = false
}

const uploadMarkedScripts = async (studentsWithScripts: StudentWithGrade[], classData: ClassData) => {
  let uploadedCount = 0
  let failedCount = 0

  for (const student of studentsWithScripts) {
    if (!student.scriptFile) continue

    const formData = new FormData()
    formData.append('examination', selectedTerm.value) // Using term as examination for now
    formData.append('classroom', String(classData.classroom_id || classData.id))
    formData.append('subject', String(classData.subject_id || classData.id))
    formData.append('student', String(student.id))
    formData.append('file', student.scriptFile)

    try {
      const config = useRuntimeConfig()
      const { token } = useAuth()

      await $fetch(`${config.public.apiBase}/academic/marked-scripts/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: formData
      })

      uploadedCount++
    } catch (err) {
      console.error(`Failed to upload script for ${student.first_name} ${student.last_name}:`, err)
      failedCount++
    }
  }

  if (uploadedCount > 0) {
    success(`${uploadedCount} marked script(s) uploaded successfully`)
  }

  if (failedCount > 0) {
    showError(`${failedCount} script upload(s) failed`, 'Some scripts could not be uploaded')
  }
}

onMounted(async () => {
  const [classesRes, termsRes] = await Promise.all([
    fetchMyClasses(),
    apiCall('/administration/terms/')
  ])

  if (classesRes.data) {
    // For grading, only show teaching assignments (allocated subjects)
    const teaching = (classesRes.data as any).teaching_assignments || []

    myClasses.value = teaching.map((cls: any) => ({
      id: cls.id,
      classroom_id: cls.classroom_id,
      classroom_name: cls.classroom_name,
      subject_name: cls.subject_name,
      grade_level_name: cls.grade_level_name,
      student_count: cls.student_count,
      subject_id: cls.id // Allocated subject ID for grades
    }))
  }
  if (termsRes.data) terms.value = termsRes.data
})
</script>
