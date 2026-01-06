// types/index.ts
export interface User {
  id: number
  email: string
  username: string
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  isAdmin: boolean
  isAccountant: boolean
  isTeacher: boolean
  isParent: boolean
  isStudent: boolean
  student_id?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface StudentLoginCredentials {
  phone_number: string
  password: string
}

export interface StudentRegistrationData {
  phone_number: string
  password: string
  password_confirm: string
  admission_number: string
}

export interface StudentChangePasswordData {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export interface StudentAuthResponse {
  access: string
  refresh: string
  student: {
    id: number
    admission_number: string
    first_name: string
    middle_name?: string | null
    last_name: string
    phone_number: string
    email?: string | null
    classroom?: string
    classroom_name?: string
  }
}

export interface AcademicYear {
  id?: number
  name: string
  start_date: string
  end_date: string | null
  active_year: boolean
}

export interface Term {
  id?: number
  name: string
  academic_year: number
  academic_year_name?: string
  start_date: string
  end_date: string
}

export interface SchoolEvent {
  id?: number
  name: string
  event_type: 'exam' | 'graduation' | 'holiday' | 'leave' | 'other'
  term: number
  term_name?: string
  academic_year?: string
  start_date: string
  end_date: string | null
  description?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  activeSubjects: number
  attendanceRate: number
  newStudentsThisMonth: number
}

export interface StudentsByLevel {
  name: string
  count: number
  percentage: number
  icon: string
}

export interface FinancialSummary {
  collected: number
  outstanding: number
  collectionRate: number
}

export interface AttendanceRecord {
  dayName: string
  date: string
  rate: number
  present: number
  total: number
}

export interface RecentAdmission {
  id: number
  first_name: string
  last_name: string
  grade_level: string
  admission_date: string
}

export interface PerformanceSummary {
  averageGrade: string
  passRate: number
  grades: {
    a: number
    b: number
    c: number
    df: number
  }
}

export interface RecentPayment {
  id: number
  receipt_number: number
  student_name: string
  amount: number
  method: string
  paid_on: string
  term_name: string
}

export interface AdmissionStats {
  totalApplications: number
  pendingReview: number
  approved: number
  enrolled: number
  applicationRevenue: number
  examRevenue: number
  acceptanceRevenue: number
}

export interface DashboardData {
  stats: DashboardStats
  studentsByLevel: StudentsByLevel[]
  financial: FinancialSummary
  attendance: AttendanceRecord[]
  recentAdmissions: RecentAdmission[]
  recentPayments?: RecentPayment[]
  performance: PerformanceSummary
  admissionStats?: AdmissionStats
}

// Academic Structure Types
export interface GradeLevel {
  id: number
  name: string
}

export interface ClassLevel {
  id: number
  name: string
  grade_level: number | null
  grade_level_name?: string
}

export interface Department {
  id: number
  name: string
  order_rank: number | null
}

export interface Subject {
  id?: number
  name: string
  subject_code: string | null
  department: number
  department_name?: string
  is_selectable: boolean
  graded: boolean
  description?: string
}

export interface Classroom {
  id?: number
  name: number | string  // ID for write operations, can be string in legacy responses
  name_display?: string  // Human-readable class name from backend
  stream?: number | null
  stream_name?: string
  stream_id?: number | null
  class_teacher: number | string | null
  class_teacher_name?: string
  capacity: number
  occupied_sits: number
  available_sits: number
  class_status: string
  grade_level?: number
  class_level?: number
}

// People Types
export interface Student {
  id?: number
  admission_number: string
  first_name: string
  middle_name?: string | null
  last_name: string
  date_of_birth: string
  gender: 'Male' | 'Female' | 'Other'
  parent_contact: string
  region?: string | null
  city?: string | null
  street?: string | null
  classroom: number | null
  classroom_name?: string
  classroom_display?: string
  class_level?: number | null
  class_level_display?: string
  current_class?: string
  grade_level: number | null
  grade_level_name?: string
  guardian: number | null
  guardian_name?: string
  guardian_relationship?: string | null
  guardian_phone?: string | null
  guardian_email?: string | null
  admission_date: string
  status: 'Active' | 'Inactive' | 'Graduated' | 'Withdrawn'
  photo?: string | null
  medical_info?: string | null
  medical_conditions?: string | null
  allergies?: string | null
  blood_group?: string | null
  religion?: string | null
  emergency_contact?: string | null
  emergency_phone?: string | null
  previous_school?: string | null
  academic_year_name?: string | null
}

export interface Teacher {
  id?: number
  username?: string
  first_name: string
  middle_name?: string | null
  last_name: string
  email: string
  phone_number: string
  empId: string
  short_name?: string | null
  subject_specialization?: string[]
  subject_specialization_display?: string[]
  address?: string | null
  gender?: string | null
  national_id?: string | null
  nssf_number?: string | null
  tin_number?: string | null
  date_of_birth?: string | null
  salary?: number | null
  unpaid_salary?: number
  designation?: string | null
  alt_email?: string | null
  image?: string | null
  inactive?: boolean
  payments?: any[]
}

export interface Parent {
  id?: number
  first_name: string
  middle_name?: string | null
  last_name: string
  email?: string | null
  phone_number: string
  alt_email?: string | null
  address?: string | null
  gender?: 'Male' | 'Female' | null
  date_of_birth?: string | null
  parent_type: 'Father' | 'Mother' | 'Guardian' | 'Other'
  national_id?: string | null
  occupation?: string | null
  monthly_income?: number | null
  single_parent?: boolean
  image?: string | null
  inactive?: boolean
  children_details?: any[]
  send_invitation?: boolean
}

// Attendance Types
export interface Attendance {
  id?: number
  student: number
  student_name?: string
  classroom: number
  classroom_name?: string
  date: string
  status: 'Present' | 'Absent' | 'Late' | 'Excused'
  remarks?: string | null
  marked_by?: number
  marked_by_name?: string
}

export interface AttendanceSummary {
  date: string
  classroom: number
  classroom_name?: string
  total_students: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_rate: number
}

// Fees & Financial Types
export interface FeeStructure {
  id?: number
  name: string
  amount: number
  grade_level: number | null
  grade_level_name?: string
  class_level: number | null
  class_level_name?: string
  academic_year: number
  academic_year_name?: string
  term: number | null
  term_name?: string
  fee_type: 'Tuition' | 'Transport' | 'Meals' | 'Books' | 'Uniform' | 'Other'
  is_mandatory: boolean
  due_date?: string | null
}

export interface FeePayment {
  id?: number
  student: number
  student_name?: string
  fee_structure: number
  fee_structure_name?: string
  amount_paid: number
  payment_date: string
  payment_method: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Mobile Money' | 'Card'
  reference_number?: string | null
  received_by?: number
  received_by_name?: string
  remarks?: string | null
}

export interface StudentFeeBalance {
  student: number
  student_name?: string
  total_fees: number
  total_paid: number
  balance: number
  status: 'Paid' | 'Partial' | 'Unpaid'
  fee_breakdown?: Array<{
    id: number
    fee_name: string
    amount_owed: number
    amount_paid: number
    balance: number
    status: string
  }>
}

// Grades & Assessment Types
export interface GradeScale {
  id?: number
  name: string
  min_score: number
  max_score: number
  grade: string
  points: number
  remarks: string
}

// Examination/Assessment (from examination app)
export interface Examination {
  id?: number
  name: string
  start_date: string
  ends_date: string
  out_of: number
  classrooms: number[]
  classroom_names?: string[]
  comments?: string | null
  created_by?: number
  created_by_name?: string
  created_on?: string
  status?: string
}

export interface Assessment {
  id?: number
  name: string
  subject: number
  subject_name?: string
  classroom: number
  classroom_name?: string
  term: number
  term_name?: string
  assessment_type: 'Quiz' | 'Test' | 'Midterm' | 'Final' | 'Assignment' | 'Project'
  total_marks: number
  weight: number
  date: string
  created_by?: number
  created_by_name?: string
}

export interface Grade {
  id?: number
  student: number
  student_name?: string
  assessment: number
  assessment_name?: string
  score: number
  grade?: string
  remarks?: string | null
  entered_by?: number
  entered_by_name?: string
}

export interface ReportCard {
  student: number
  student_name?: string
  term: number
  term_name?: string
  academic_year_name?: string
  subjects: {
    subject_name: string
    assessments: {
      name: string
      score: number
      total: number
    }[]
    average: number
    grade: string
  }[]
  overall_average: number
  overall_grade: string
  position?: number
  total_students?: number
  teacher_comments?: string
  principal_comments?: string
}

export interface MarkedScript {
  id?: number
  examination: number
  examination_name?: string
  classroom: number
  classroom_name?: string
  subject: number
  subject_name?: string
  teacher: number
  teacher_name?: string
  file: string
  uploaded_on?: string
}

// Timetable Types
export interface TimetableSlot {
  id?: number
  classroom: number
  classroom_name?: string
  subject: number
  subject_name?: string
  teacher: number
  teacher_name?: string
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  start_time: string
  end_time: string
  term: number
  term_name?: string
  room_number?: string | null
}

// User Management Types
export interface UserAccount extends User {
  role: 'Admin' | 'Teacher' | 'Accountant' | 'Parent' | 'Student'
  is_active: boolean
  date_joined: string
  last_login?: string | null
  permissions?: string[]
}